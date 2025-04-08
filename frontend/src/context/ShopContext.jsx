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
    const [cartItems, setCartItems] = useState({});
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

    const getCartAmount = () => {
        let total = 0;
        for (const items in cartItems) {
            const product = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    const itemPrice = product.price * cartItems[items][item];
                    total += itemPrice;
                }
            }
        }
        return total + delivery_fee;
    };

    // Update cart count whenever cartItems changes
    useEffect(() => {
        setCartItemsCount(calculateCartCount(cartItems));
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
