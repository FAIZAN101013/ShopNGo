import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { Link, useNavigate } from 'react-router-dom';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (products.length > 0) {
      let filteredProducts = products
        .filter(item =>
          item.category === category &&
          item.subCategory === subCategory
        )
        .slice(0, 5); // Limit to 5 related products
      setRelated(filteredProducts);
    }
  }, [products, category, subCategory]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return related.length > 0 ? (
    <div className="!my-24 !px-4">
      {/* Section Title */}
      <div className="text-center !mb-12">
        <Title text1="Related" text2="Products" />
        <p className="text-gray-600 text-sm !mt-4">You might also like these products</p>
      </div>

      {/* Related Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 !gap-8 !px-4 !mx-auto !max-w-7xl">
        {related.map((item) => (
          <div
            key={item._id}
            onClick={() => handleProductClick(item._id)}
            className="cursor-pointer group !p-3 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <div className="overflow-hidden rounded-lg !mb-4">
              <img
                src={item.image[0]}
                alt={item.name}
                className="!w-full !h-auto object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h3 className="text-gray-800 font-medium !text-sm !mb-2 truncate">
              {item.name}
            </h3>
            <p className="text-gray-600 !text-sm">
              ${item.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default RelatedProducts;
