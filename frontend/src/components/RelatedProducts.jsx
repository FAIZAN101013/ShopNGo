import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { Link } from 'react-router-dom';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) { 
      let filteredProducts = products
        .filter(item => item.category === category && item.subCategory === subCategory)
        .slice(0, 5); // Limit to 5 related products
      setRelated(filteredProducts);
    }
  }, [products, category, subCategory]);

  return related.length > 0 ? (
    <div className="!my-24">
      {/* Section Title */}
      <div className="text-center text-3xl !py-2">
        <Title text1="Related" text2="Products" />
      </div>

      {/* Related Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 !px-4 !ml-5">
        {related.map((item) => (
          <Link key={item._id} to={`/product/${item._id}`} className="block">
            <ProductItem id={item._id} name={item.name} price={item.price} image={item.image} />
          </Link>
        ))}
      </div>
    </div>
  ) : null; // If no related products, don't render the section
};

export default RelatedProducts;
