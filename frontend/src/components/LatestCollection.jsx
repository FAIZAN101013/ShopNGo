import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

function LatestCollection() {
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
        </div>
    );
}

export default LatestCollection;
