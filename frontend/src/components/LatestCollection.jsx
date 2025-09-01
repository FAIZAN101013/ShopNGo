import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import ProductGridSkeleton from './ProductGridSkeleton';

function LatestCollection() {
    const { products, productsLoading } = useContext(ShopContext);

    // Derived from products rather than copied into state by an effect: the
    // old version rendered an empty grid on the first paint, then filled it.
    const latestProduct = useMemo(() => products.slice(0, 10), [products]);

    return (
        <section className="my-16">
            {/* Title & Description Section */}
            <div className="pb-10 flex flex-col items-center text-center text-3xl">
                <Title text1={'LATEST'} text2={'COLLECTION'} />
                <p className="max-w-lg text-xs sm:text-sm md:text-base text-gray-600 mt-4">
                    Step into the future with ShopNGo&rsquo;s latest collection.
                </p>
            </div>

            {/* Product Grid */}
            {productsLoading ? (
                <ProductGridSkeleton count={10} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" />
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {latestProduct.map((item) => (
                    <ProductItem
                        key={item._id}
                        id={item._id}
                        image={item.image}
                        name={item.name}
                        price={item.price}
                    />
                ))}
            </div>
            )}

            <div className="flex justify-center mt-10">
                <Link
                    to="/collection"
                    className="rounded-md border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
                >
                    View all products
                </Link>
            </div>
        </section>
    );
}

export default LatestCollection;
