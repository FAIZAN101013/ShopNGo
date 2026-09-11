import { createContext } from "react";
import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchProducts, fetchCart, saveCart } from "../services/api";
import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";

export const ShopContext = createContext();

/*
  Two carts meet when somebody signs in: whatever they put in the basket as a
  guest, and whatever is already on the account from another day or another
  device. Neither one deserves to be thrown away.

  For a size held in both, take the LARGER quantity rather than the sum.
  Adding them looks generous until the same cart syncs twice and somebody
  ends up buying four of something they picked once.
*/
const mergeCarts = (serverCart, localCart) => {
  const merged = structuredClone(serverCart || {});

  for (const productId in localCart || {}) {
    merged[productId] = merged[productId] || {};
    for (const size in localCart[productId]) {
      merged[productId][size] = Math.max(
        merged[productId][size] || 0,
        localCart[productId][size]
      );
    }
  }

  return merged;
};

const sameCart = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/*
  The last catalogue this browser saw.

  Kept deliberately simple: no timestamp, no expiry. It is replaced by the
  real one within a second of the request returning, and it is only ever used
  to put something on screen while that happens.
*/
const PRODUCTS_CACHE_KEY = 'shopngo_products';

const readCachedProducts = () => {
    try {
        const cached = JSON.parse(localStorage.getItem(PRODUCTS_CACHE_KEY) || '[]');
        return Array.isArray(cached) ? cached : [];
    } catch {
        return [];
    }
};

const writeCachedProducts = (list) => {
    try {
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(list));
    } catch {
        // Storage full or blocked. The shop works; it just will not start
        // instantly next time.
    }
};

const ShopContextProvider = (props) => {
    const currency = '$';
    const delivery_fee = 10;

    const { user, booting } = useContext(AuthContext);

    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    // Seeded from storage so a refresh, a shared link or a hard navigation
    // does not silently empty it. For a guest this IS the cart; for someone
    // signed in it is a local copy of the one on their account.
    const [cartItems, setCartItems] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('cart') || '{}');
            return stored && typeof stored === 'object' ? stored : {};
        } catch {
            return {};
        }
    });
    const [cartItemsCount, setCartItemsCount] = useState(0);

    /*
      The catalogue is fetched once when the app mounts. Everything that
      needs products reads them from here, so there is one request rather
      than one per page.

      It starts from whatever was seen last time, if anything. The API sleeps
      on a free host and takes twenty seconds to wake, and a returning
      visitor staring at grey boxes for that long has already left. Showing
      the old catalogue immediately and quietly replacing it when the real
      one arrives costs nothing: prices are recalculated by the server at
      checkout anyway, so a stale price can only ever be a display bug.
    */
    const cachedProducts = readCachedProducts();

    const [products, setProducts] = useState(cachedProducts);
    const [productsLoading, setProductsLoading] = useState(cachedProducts.length === 0);
    const [productsError, setProductsError] = useState('');

    // The wait has gone on long enough to need explaining. A blank shop with
    // no message reads as broken; "waking the server" reads as slow, which
    // is the truth.
    const [productsSlow, setProductsSlow] = useState(false);

    // True once the account's cart has been fetched and merged in. Until
    // then nothing is pushed back, or the empty first render would overwrite
    // a real cart on the server with {}.
    const [accountCartReady, setAccountCartReady] = useState(false);

    // Read inside an effect that must not re-run when the cart changes.
    const cartRef = useRef(cartItems);
    useEffect(() => { cartRef.current = cartItems; }, [cartItems]);

    useEffect(() => {
        let cancelled = false;

        // Four seconds is about where a wait stops reading as "loading" and
        // starts reading as "broken".
        const slowTimer = setTimeout(() => {
            if (!cancelled) setProductsSlow(true);
        }, 4000);

        const load = async () => {
            try {
                const list = await fetchProducts();
                if (cancelled) return;

                setProducts(list);
                setProductsError('');
                writeCachedProducts(list);
            } catch (error) {
                // Surfaced in the UI rather than only logged, so a stopped
                // backend reads as an explainable error and not an empty
                // shop. With a cached catalogue on screen there is nothing to
                // explain, so it stays quiet.
                if (!cancelled && cachedProducts.length === 0) setProductsError(error.message);
            } finally {
                if (!cancelled) {
                    setProductsLoading(false);
                    setProductsSlow(false);
                }
            }
        };

        load();
        // A component can unmount before the request finishes; without this
        // React warns about setting state on something that is gone.
        return () => { cancelled = true; clearTimeout(slowTimer); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The catalogue is fetched once, which is right for shopping and wrong
    // for the admin page - adding a product there has to show up in the shop
    // without a reload.
    const refreshProducts = async () => {
        try {
            const list = await fetchProducts();
            setProducts(list);
            writeCachedProducts(list);
        } catch (error) {
            setProductsError(error.message);
        }
    };

    /*
      Signing in: pull the account's cart, fold the guest cart into it, and
      push the result back. Signing out: forget it, because it belongs to the
      account and the next person at this browser should not inherit it.
    */
    const previousUserId = useRef(null);

    useEffect(() => {
        // Still checking the stored token. Acting now would look like a
        // signed-out user and wipe the cart on every refresh.
        if (booting) return;

        const userId = user?.id || null;
        const wasSignedIn = previousUserId.current;
        previousUserId.current = userId;

        if (!userId) {
            if (wasSignedIn) {
                setCartItems({});
                setCartItemsCount(0);
            }
            setAccountCartReady(false);
            return;
        }

        // Already loaded for this same account - a profile save re-creates
        // the user object and would otherwise re-run the whole merge.
        if (wasSignedIn === userId && accountCartReady) return;

        let cancelled = false;

        (async () => {
            try {
                const serverCart = await fetchCart();
                if (cancelled) return;

                const merged = mergeCarts(serverCart, cartRef.current);
                setCartItems(merged);

                // Only write when the guest cart actually added something.
                if (!sameCart(merged, serverCart)) await saveCart(merged);
            } catch {
                // Offline or the API is down. The local cart still works;
                // it just will not follow them to another device today.
            } finally {
                if (!cancelled) setAccountCartReady(true);
            }
        })();

        return () => { cancelled = true; };
    }, [user, booting, accountCartReady]);

    /*
      Push changes up. Debounced, because holding the + button on a quantity
      box would otherwise be one request per click.
    */
    useEffect(() => {
        if (!user || !accountCartReady) return;

        const timer = setTimeout(() => {
            saveCart(cartItems).catch(() => {
                // Nothing to tell the customer here. The cart on screen is
                // right; the copy on the server catches up on the next change.
            });
        }, 700);

        return () => clearTimeout(timer);
    }, [cartItems, user, accountCartReady]);

    // Helper function to calculate total items in cart
    const calculateCartCount = (cartData) => {
        let count = 0;
        for (const itemId in cartData) {
            for (const size in cartData[itemId]) {
                count += cartData[itemId][size];
            }
        }
        return count;
    };
    const updateQuantity = (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);

        if (quantity <= 0) {
            // Remove the size
            delete cartData[itemId][size];

            // If no sizes left for the item, remove the item entirely
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }

            toast.info("Item removed from cart");
        } else {
            // Normal quantity update
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = quantity;
        }

        setCartItems(cartData);
        setCartItemsCount(calculateCartCount(cartData));
    };

    const addToCart = (itemId, size) => {
        if (!size) {
            toast.error("Please select a size");
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size]++;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        setCartItems(cartData);
        setCartItemsCount(calculateCartCount(cartData));
        toast.success("Item added to cart!");
    };

    const getCartItemsCount = () => {
        return cartItemsCount;
    };

    // Emptying the cart used to happen by accident: placing an order did a
    // full page reload, which wiped the in-memory state. Now that the cart
    // survives navigation it has to be cleared deliberately.
    const clearCart = () => {
        setCartItems({});
        setCartItemsCount(0);
    };

    const getCartAmount = () => {
        let total = 0;
        for (const items in cartItems) {
            const product = products.find((product) => product._id === items);
            // A cart restored from storage can name a product that no longer
            // exists in the catalogue; skip it rather than crash on .price.
            if (!product) continue;
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    const itemPrice = product.price * cartItems[items][item];
                    total += itemPrice;
                }
            }
        }
        // Don't charge delivery on an empty cart - it showed a $10 total for
        // nothing at all.
        return total === 0 ? 0 : total + delivery_fee;
    };

    // Update cart count whenever cartItems changes, and mirror the cart into
    // storage so it survives a reload.
    useEffect(() => {
        setCartItemsCount(calculateCartCount(cartItems));
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch { /* storage full or blocked - the in-memory cart still works */ }
    }, [cartItems]);

    const value = {
        products,
        productsLoading,
        productsError,
        productsSlow,
        refreshProducts,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        getCartItemsCount,
        clearCart,
        updateQuantity,
        getCartAmount

    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
