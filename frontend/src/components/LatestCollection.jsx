import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './productItem';

function LatestCollection() {
    const [latestProduct, setLatestProduct] = useState([]);
    const { products } = useContext(ShopContext);

    useEffect(() => {
        setLatestProduct(products.slice(0, 10));
    }, [products]);

    return (
        <>
        <div className='space'></div>
         <div className="my-80 ">
            {/* Padding above the title section */}
            <div className='pt-16'></div>

            {/* Title & Description Section */}
            <div className="pb-12 flex flex-col items-center text-center px-10 text-3xl">
                <Title text1={'LATEST'} text2={'COLLECTION'} />
                <p className="max-w-lg text-xs sm:text-sm md:text-base text-gray-600 mt-4">
                    Step into the future with ShopNGo’s latest collection.  
                </p>
            </div>
            <div className='space'></div>
            {/* More Padding Between Title & Products */}
            <div className="pt-8 pb-10">
                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {latestProduct.map((item, index) => (
                        <ProductItem 
                            key={index} 
                            id={item._id} 
                            image={item.image} 
                            name={item.name} 
                            price={item.price} 
                        />
                    ))}
                </div>
            </div>
        </div>
        </>
       
    );
}

export default LatestCollection;
