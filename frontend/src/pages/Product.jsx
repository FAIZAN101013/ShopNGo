import React, { useContext, useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [activeTab, setActiveTab] = useState("description");

  useLayoutEffect(() => {
    if (products.length > 0) { 
      const product = products.find((item) => item._id === productId);
      if (product) {
        setProductData(product);
        setImage(product.image[0]); // Set the first image as default
      }
    }
  }, [productId, products]);

  return productData ? (
    <div key={productId} className="!border-t-2 border-gray-300 !pt-10 !transition-opacity !ease-in duration-500 opacity-100">
      <div className="!flex flex-col sm:flex-row gap-12">
        
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          <div className="!flex sm:flex-col overflow-x-auto sm:w-[20%] w-full !gap-3">
            {productData.image.map((item, index) => (
              <img 
                key={index} 
                src={item} 
                onClick={() => setImage(item)}
                className="w-[22%] sm:w-full h-auto cursor-pointer border-2 border-gray-300 rounded-md p-1 hover:border-gray-600"
                alt={`Product Thumbnail ${index}`} 
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%] flex justify-center">
            <img className="w-full h-auto object-contain" src={image} alt="Selected Product" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 !p-4">
          <h1 className="text-2xl font-medium !mt-2 sm:mt-0">{productData.name}</h1>
          <div className='flex items-center !gap-1 mt-2'>
            {[...Array(4)].map((_, i) => <img key={i} src={assets.star_icon} alt="star" className="w-3 5" />)}
            <img src={assets.star_dull_icon} alt="dull star" className="w-3 5" />
            <p className='!pt-2'>(102)</p>
          </div>
          <p className='!mt-1 text-2xl font-medium'>{currency}{productData.price}</p>
          <p className='!mt-1 text-gray-500 md:w-4/5'>{productData.description}</p>

          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size:</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button 
                  key={index} 
                  onClick={() => setSize(item)} 
                  className={`border border-gray-300 !py-2 !px-2 bg-gray-100 ${ item === size ? 'border-orange-500' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="w-4/5 sm:w-4/5">
              <button  
                onClick={() => addToCart(productData._id, size)} 
                className="!w-full bg-black text-white !px-8 !py-3 text-sm active:bg-gray-700 hover:bg-gray-800 transition"
              >
                ADD TO CART
              </button>
              <hr className="!mt-8 border-t border-gray-300 w-full" />
            </div>
            <div className='text-sm text-gray-500 !mt-5 flex flex-col !gap-1'>
              <p>100% original.</p>
              <p>Cash on delivery is available for this product.</p>
              <p>Easy return policy within seven days.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Description & Reviews */}
      <div className='!mt-20'>
        <div className='flex'>
          <p 
            className={`border !px-5 !py-3 text-sm cursor-pointer ${activeTab === "description" ? "bg-gray-200 font-bold" : ""}`} 
            onClick={() => setActiveTab("description")}
          >
            Description
          </p>
          <p 
            className={`border !px-5 !py-3 text-sm cursor-pointer ${activeTab === "reviews" ? "bg-gray-200 font-bold" : ""}`} 
            onClick={() => setActiveTab("reviews")}
          >
            Reviews (102)
          </p>
        </div>

        <div className='flex flex-col gap-4 border !px-6 !py-6 text-sm text-gray-500'>
          {activeTab === "description" ? (
            <div className="!px-6 !py-6 text-sm text-gray-600">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
              <p className="leading-relaxed">{productData.description}</p>
              <p className="!mt-3 text-gray-500 pt-3">
                This product is crafted with high-quality materials, ensuring durability and comfort. 
                Perfect for daily use, it provides both style and functionality.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 border !px-6 !py-6 text-sm text-gray-600">
              {[
                { name: "John Doe", rating: "★★★★★", review: "Great product! Very comfortable and stylish." },
                { name: "Jane Smith", rating: "★★★★☆", review: "Good quality but shipping was a bit slow." },
                { name: "Alex Brown", rating: "★★★★★", review: "Would highly recommend to others!" },
              ].map((review, index) => (
                <div key={index} className="border-b pb-3">
                  <p className="font-medium">{review.name}</p>
                  <p className="text-yellow-500 text-lg">{review.rating}</p>
                  <p className="text-gray-500">{review.review}</p>
                </div>
              ))}
              <button className="mt-3 text-blue-500 hover:text-blue-700 text-sm font-medium self-center">
                View More Reviews
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory}/>
    </div>
  ) : <div className="opacity-0"></div>;
};

export default Product;
