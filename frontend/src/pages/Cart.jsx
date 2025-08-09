import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { products } from '../assets/assets';
import { assets } from '../assets/assets';
import Title from '../components/Title';

const Cart = () => {
  const { cartItems, updateQuantity, currency, getCartAmount } = useContext(ShopContext);

  // Helper function to get cart items with full product details
  const getCartItemsWithDetails = () => {
    const items = [];
    for (const itemId in cartItems) {
      const product = products.find(p => p._id === itemId);
      if (product) {
        for (const size in cartItems[itemId]) {
          const quantity = cartItems[itemId][size];
          if (quantity > 0) {
            items.push({
              ...product,
              size,
              quantity
            });
          }
        }
      }
    }
    return items;
  };

  const cartItemsWithDetails = getCartItemsWithDetails();

  const handleStripePay = () => {
    const stripeLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (stripeLink) {
      window.location.href = stripeLink;
    } else {
      // Fallback to place order page if no payment link configured
      window.location.href = '/placeorder?method=stripe';
    }
  };

  return (
    <div className="container mx-auto !px-4 !py-8">
      <Title text1={"YOUR"} text2={"CART"} />

      {cartItemsWithDetails.length === 0 ? (
        <div className="text-center !py-12">
          <div className="!w-20 !h-20 sm:!w-24 sm:!h-24 mx-auto !mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <img src={assets.cart_icon} alt="Empty Cart" className="!w-10 !h-10 sm:!w-12 sm:!h-12 opacity-50" />
          </div>
          <p className="text-gray-500 !text-base sm:!text-lg !mb-4">Your cart is empty</p>
          <a
            href="/collection"
            className="inline-block !px-4 !py-2 sm:!px-6 sm:!py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors !text-sm sm:!text-base"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row !gap-4 sm:!gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              {cartItemsWithDetails.map((item) => (
                <div
                  key={`${item._id}-${item.size}`}
                  className="flex flex-col sm:flex-row items-center !gap-4 sm:!gap-6 !p-4 sm:!p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="!w-20 !h-20 sm:!w-24 sm:!h-24 flex-shrink-0">
                    <img
                      src={item.image[0]}
                      alt={item.name}
                      className="!w-full !h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 !min-w-[150px] sm:!min-w-[200px] text-center sm:text-left">
                    <h3 className="font-medium !text-base sm:!text-lg !mb-1">{item.name}</h3>
                    <p className="text-gray-500 !text-xs sm:!text-sm !mb-1">Size: {item.size}</p>
                    <p className="text-gray-900 font-medium !text-sm sm:!text-base">{currency}{item.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center !gap-1 !min-w-[100px] sm:!min-w-[120px]">
                    <button
                      onClick={() => {
                        const newQuantity = Math.max(1, item.quantity - 1);
                        updateQuantity(item._id, item.size, newQuantity);
                      }}
                      className="!w-7 !h-7 sm:!w-8 sm:!h-8 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      <span className="!text-base sm:!text-lg font-medium">-</span>
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                        updateQuantity(item._id, item.size, newQuantity);
                      }}
                      className="!w-10 !h-7 sm:!w-12 sm:!h-8 !px-1 sm:!px-2 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-black !text-sm sm:!text-base"
                    />
                    <button
                      onClick={() => {
                        const newQuantity = item.quantity + 1;
                        updateQuantity(item._id, item.size, newQuantity);
                      }}
                      className="!w-7 !h-7 sm:!w-8 sm:!h-8 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <span className="!text-base sm:!text-lg font-medium">+</span>
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="!min-w-[80px] sm:!min-w-[100px] text-right">
                    <p className="font-medium !text-sm sm:!text-lg">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => updateQuantity(item._id, item.size, 0)}
                    className="!w-8 !h-8 sm:!w-10 sm:!h-10 flex items-center justify-center hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <img
                      src={assets.bin_icon}
                      alt="Remove"
                      className="!w-4 !h-4 sm:!w-5 sm:!h-5 opacity-50 hover:opacity-100 transition-opacity"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:!w-80 xl:!w-96">
            <div className="bg-white rounded-xl shadow-sm !p-4 sm:!p-6 sticky top-4">
              <h2 className="!text-lg sm:!text-xl font-medium !mb-4 sm:!mb-6">Order Summary</h2>

              <div className="!space-y-3 sm:!space-y-4 !mb-4 sm:!mb-6">
                <div className="flex justify-between !text-sm sm:!text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{currency}{(getCartAmount() - 10).toFixed(2)}</span>
                </div>

                <div className="flex justify-between !text-sm sm:!text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{currency}10.00</span>
                </div>

                <div className="border-t !pt-3 sm:!pt-4">
                  <div className="flex justify-between !text-base sm:!text-lg font-medium">
                    <span>Total</span>
                    <span>{currency}{getCartAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/placeorder'}
                className="!w-full bg-black text-white !py-2 sm:!py-3 rounded-lg hover:bg-gray-800 transition-colors !text-sm sm:!text-base"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={handleStripePay}
                className="!w-full !mt-3 flex items-center justify-center !gap-2 bg-[#635BFF] text-white !py-2 sm:!py-3 rounded-lg hover:bg-[#5561F5] transition-colors !text-sm sm:!text-base"
                title="Pay securely with Stripe"
              >
                <img src={assets.stripe_logo} alt="Stripe" className="!w-12 !h-auto" />
                Pay with Stripe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
