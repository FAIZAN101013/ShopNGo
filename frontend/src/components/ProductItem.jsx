import React from 'react'
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useContext } from 'react';

const ProductItem = ({ id, image, name, price }) => {
    const { currency } = useContext(ShopContext);
    return (
        <Link className='text-gray-700 cursor-pointer hover:shadow-lg !p-2 rounded-lg transition-all duration-300' to={`/product/${id}`}>
            <div className='overflow-hidden rounded-lg'>
                <img className='hover:scale-110 transition !ease-in-out !duration-500 !w-full !h-auto object-cover' src={image[0]} alt="" />
            </div>
            <p className='text-gray-900 font-medium !text-lg !truncate !mt-2'>{name}</p>
            <p className='text-gray-600 !text-md !mt-1'>{currency}{price}</p>
        </Link>
    );
};

export default ProductItem
