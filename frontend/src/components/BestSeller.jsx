import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './productItem';

const BestSeller = () => {
    const { products } = useContext(ShopContext); // Access products from context
    const [bestSeller, setBestSeller] = useState([]);

    // Fetch best sellers when products are available
    useEffect(() => { 
        console.log("Products:", products); // Debugging: Check if products are available
        if (products.length > 0) { 
            const bestProduct = products.filter((item) => item.bestseller);
            console.log("Best Sellers:", bestProduct); // Debugging: Check filtered best sellers
            setBestSeller(bestProduct.slice(0, 5));
        }
    }, [products]); // Runs when products update

    return (
        <div className="my-10">
            
            {/* Title Section */}
<div className="flex flex-col items-center text-center text-3xl py-8">
    <Title text1={'BEST'} text2={'SELLER'} />
    <p className="max-w-lg text-xs sm:text-sm md:text-base text-gray-600 mt-2">
        Discover our top-selling products that customers love the most!
    </p>
</div>

            <div className='space'></div>
            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {bestSeller.length > 0 ? (
                    bestSeller.map((item, index) => (
                        <ProductItem 
                            key={index} 
                            id={item._id} 
                            name={item.name} 
                            image={item.image} 
                            price={item.price} 
                        />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">No Bestsellers Available</p>
                )}
            </div>
        </div>
    );
};

export default BestSeller;
