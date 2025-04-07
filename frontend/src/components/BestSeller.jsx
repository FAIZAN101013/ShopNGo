import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './productItem';

const BestSeller = () => {
    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);

    useEffect(() => {
        if (products.length > 0) {
            const bestProduct = products.filter((item) => item.bestseller);
            setBestSeller(bestProduct.slice(0, 5));
        }
    }, [products]);

    return (
        <div className="!my-20">
            {/* Title Section */}
            <div className="flex flex-col items-center text-center !mb-12">
                <Title text1={'BEST'} text2={'SELLER'} />
                <p className="!max-w-2xl text-sm sm:text-base text-gray-600 !mt-4">
                    Discover our most popular products that customers can't get enough of. 
                    Hand-picked selections that define style and quality.
                </p>
            </div>

            {/* Products Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 !gap-6 !px-4">
                {bestSeller.length > 0 ? (
                    bestSeller.map((item) => (
                        <div key={item._id} className="group">
                            <ProductItem 
                                id={item._id}
                                name={item.name}
                                image={item.image}
                                price={item.price}
                            />
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity !mt-2">
                                <span className="bg-red-100 text-red-600 text-xs font-semibold !px-2 !py-1 rounded-full">
                                    Best Seller
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 !py-10">
                        Loading best sellers...
                    </p>
                )}
            </div>
        </div>
    );
};

export default BestSeller;
