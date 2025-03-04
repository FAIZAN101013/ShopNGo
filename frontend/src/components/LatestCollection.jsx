import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './productItem';

function LatestCollection() {

    const [latestProduct, setLatestProduct] = useState([])
    
    useEffect(() => {
        setLatestProduct(products.slice(0,10 ))
    },[])
    const { products } = useContext(ShopContext);

    return (
        <div className='my-10'>
            <div className='flex flex-col items-center text-center py-8 text-3xl'>
                <Title text1={'LATEST'} text2={'COLLECTION'} />
                <p className="max-w-lg text-xs sm:text-sm md:text-base text-gray-600 mt-2">
                    Step into the future with ShopNGo’s latest collection,  
                    Where every ride is a seamless blend of style and perfection.     
                </p>
            </div>
            {/**Rendering products */}
            <div className='grid gird-col-2 sm:grid-cols-3 mg:grid-col-4 lg-grid-col-5 gap-y-6 pt-8 pb-10'>
                {latestProduct.map((item, index) => (
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price}/>
                ))}
            </div>
        </div>
    );
}

export default LatestCollection;
