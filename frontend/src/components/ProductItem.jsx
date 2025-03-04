import React from 'react'
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useContext } from 'react';

const ProductItem = ({ id, image, name, price }) => {
    const {currency} = useContext(ShopContext);
  return (
      <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
          <div className='overflow-hidden'>
              <img  className='hover:scale-110 transition  ease-in-out' src={image[0]} alt="" />
          </div>
          <p className=' text-gray-900 font-medium text-lg truncate'>{name}</p>
          <p className='text-gray-600 text-md mt-1'>{currency}{ price}</p>
      </Link>
     
  )
}

export default ProductItem
