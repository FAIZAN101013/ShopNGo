import React, { useContext, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
    const { products } = useContext(ShopContext);

    const bestSeller = useMemo(
        () => products.filter((item) => item.bestseller).slice(0, 5),
        [products]
    );

    // Nothing to show and nothing to wait for - the section would otherwise
    // sit there claiming to be loading forever.
    if (bestSeller.length === 0) return null;

    return (
        <section className="my-20">
            {/* Title Section */}
            <div className="flex flex-col items-center text-center mb-12">
                <Title text1={'BEST'} text2={'SELLER'} />
                <p className="max-w-2xl text-sm sm:text-base text-gray-600 mt-4">
                    Discover our most popular products that customers can&rsquo;t get enough of.
                    Hand-picked selections that define style and quality.
                </p>
            </div>

            {/* Products Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {bestSeller.map((item) => (
                    <div key={item._id} className="relative">
                        {/* The badge used to be invisible until hover, which
                            defeated the point of labelling a best seller. */}
                        <span className="absolute top-3 left-3 z-10 bg-black text-white text-[10px] font-semibold tracking-wide uppercase px-2 py-1 rounded-full">
                            Best Seller
                        </span>
                        <ProductItem
                            id={item._id}
                            name={item.name}
                            image={item.image}
                            price={item.price}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BestSeller;
