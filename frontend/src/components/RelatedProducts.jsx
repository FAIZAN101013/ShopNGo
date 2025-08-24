import React, { useContext, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);

  const related = useMemo(
    () =>
      products
        .filter(
          (item) => item.category === category && item.subCategory === subCategory
        )
        .slice(0, 5),
    [products, category, subCategory]
  );

  if (related.length === 0) return null;

  return (
    <section className="my-24">
      {/* Section Title */}
      <div className="text-center mb-12">
        <Title text1="Related" text2="Products" />
        <p className="text-gray-600 text-sm mt-4">You might also like these products</p>
      </div>

      {/* This used to be a hand-rolled copy of ProductItem built on a div with
          an onClick, so the cards could not be focused with a keyboard or
          opened in a new tab, and they drifted out of sync with the real
          product card. */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {related.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
