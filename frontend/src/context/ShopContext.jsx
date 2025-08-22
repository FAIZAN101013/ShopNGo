import { createContext } from "react";
import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { products } from "../assets/assets";
import { useState, useEffect } from "react";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '$';
    const delivery_fee = 10;

    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    // Seed the cart from storage so a refresh, a shared link or a hard
    // navigation does not silently empty it.
    const [cartItems, setCartItems] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('cart') || '{}');
            return stored && typeof stored === 'object' ? stored : {};
        } catch {
            return {};
        }
    });
    const [cartItemsCount, setCartItemsCount] = useState(0);

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
