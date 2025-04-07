import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const Cart = () => {
  const { cartItems, calculateTotalPrice } = useContext(ShopContext);

  // Calculate total price
  const totalPrice = calculateTotalPrice();

  return (
    <div>
      <h1>Your Cart</h1>
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>
            {item.name} - ${item.price} x {item.quantity}
          </li>
        ))}
      </ul>
      <h2>Total: ${totalPrice}</h2>
    </div>
  );
};

export default Cart;
