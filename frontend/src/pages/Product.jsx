import React, { useContext, useLayoutEffect, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [activeTab, setActiveTab] = useState("description");

  // Reset state when productId changes
  useEffect(() => {
    setSize('');
    setActiveTab('description');
    window.scrollTo(0, 0);  // Scroll to top when product changes
  }, [productId]);

  // Load product data
  useLayoutEffect(() => {
    if (products.length > 0) {
      const product = products.find((item) => item._id === productId);
      if (product) {
        setProductData(product);
        setImage(product.image[0]);
      } else {
        // Handle case when product is not found
        navigate('/collection');  // Redirect to collection page if product not found
      }
    }
  }, [productId, products, navigate]);

  const renderReviews = () => {
    const reviews = [
      {
        name: "John Doe",
        rating: 5,
        date: "2 days ago",
        review: "Great product! Very comfortable and stylish. The material quality is excellent and it fits perfectly. Would definitely recommend to others.",
        verified: true
      },
      {
        name: "Jane Smith",
        rating: 4,
        date: "1 week ago",
        review: "Good quality but shipping was a bit slow. The size runs slightly large but overall I'm satisfied with the purchase.",
        verified: true
      },
      {
        name: "Alex Brown",
        rating: 5,
        date: "2 weeks ago",
        review: "Would highly recommend to others! The color is exactly as shown in the pictures and the quality is outstanding.",
        verified: true
      }
    ];

    return reviews.map((review, index) => (
      <div key={index} className="!mb-6 last:!mb-0">
        <div className="flex items-start justify-between !mb-2">
          <div>
            <div className="flex items-center !gap-2">
              <h3 className="font-medium text-gray-800">{review.name}</h3>
              {review.verified && (
                <span className="bg-green-50 text-green-600 text-xs !px-2 !py-1 rounded-full font-medium">
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center !gap-2 !mt-1">
              <div className="flex !gap-1">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < review.rating ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                    className="!w-4 !h-4"
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">• {review.date}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm !leading-relaxed">{review.review}</p>
      </div>
    ));
  };

  return productData ? (
    <div className="!min-h-screen">
      {/* Product Details Section */}
      <div className="!border-t-2 border-gray-300 !pt-10 !mb-16">
        <div className="!flex flex-col sm:flex-row !gap-12 !mb-16">
          {/* Product Images */}
          <div className="flex-1 flex flex-col-reverse sm:flex-row !gap-6">
            <div className="!flex sm:flex-col overflow-x-auto sm:!w-[20%] !w-full !gap-4">
              {productData.image.map((item, index) => (
                <img
                  key={index}
                  src={item}
                  onClick={() => setImage(item)}
                  className={`!w-[22%] sm:!w-full !h-auto cursor-pointer rounded-lg border-2 
                    ${image === item ? 'border-black' : 'border-gray-200'} 
                    !p-2 hover:border-gray-400 transition-colors`}
                  alt={`Product view ${index + 1}`}
                />
              ))}
            </div>
            <div className="!w-full sm:!w-[80%] !p-4">
              <img
                className="!w-full !h-auto object-contain rounded-lg"
                src={image}
                alt={productData.name}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 !p-4">
            <h1 className="text-2xl font-medium !mb-4">{productData.name}</h1>
            <div className='flex items-center !gap-2 !mb-4'>
              <div className="flex !gap-1">
                {[...Array(4)].map((_, i) => (
                  <img key={i} src={assets.star_icon} alt="star" className="!w-4 !h-4" />
                ))}
                <img src={assets.star_dull_icon} alt="dull star" className="w-3 5" />
              </div>
              <p className='!pt-2'>(102)</p>
            </div>
            <p className='!mt-1 text-2xl font-medium'>{currency}{productData.price}</p>
            <p className='!mt-1 text-gray-500 md:w-4/5'>{productData.description}</p>

            <div className='flex flex-col !gap-4 !my-8'>
              <p>Select Size:</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSize(item)}
                    className={`border border-gray-300 !py-2 !px-2 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`}
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

        {/* Enhanced Description and Reviews Section */}
        <div className="!mt-20">
          {/* Tabs */}
          <div className="flex border-b">
            {['Description', 'Reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`
                  !px-8 !py-4 text-sm font-medium transition-colors relative
                  ${activeTab === tab.toLowerCase()
                    ? 'text-black'
                    : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                {tab}
                {tab === 'Reviews' && <span className="!ml-1 text-gray-400">(3)</span>}
                {/* Active Tab Indicator */}
                {activeTab === tab.toLowerCase() && (
                  <div className="absolute bottom-0 left-0 !w-full !h-0.5 bg-black"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="!mt-8">
            {activeTab === 'description' ? (
              <div className="!space-y-6">
                {/* Product Description */}
                <div className="!max-w-3xl">
                  <h2 className="text-xl font-medium text-gray-900 !mb-4">Product Description</h2>
                  <div className="!space-y-4">
                    <p className="text-gray-600 !leading-relaxed">
                      {productData.description}
                    </p>
                    <div className="!mt-6 grid grid-cols-1 md:grid-cols-2 !gap-6">
                      {/* Key Features */}
                      <div className="bg-gray-50 !p-6 rounded-lg">
                        <h3 className="font-medium text-gray-900 !mb-3">Key Features</h3>
                        <ul className="!space-y-2">
                          <li className="flex items-center !gap-2 text-gray-600">
                            <span className="!w-1.5 !h-1.5 bg-gray-400 rounded-full"></span>
                            Premium quality material
                          </li>
                          <li className="flex items-center !gap-2 text-gray-600">
                            <span className="!w-1.5 !h-1.5 bg-gray-400 rounded-full"></span>
                            Comfortable fit
                          </li>
                          <li className="flex items-center !gap-2 text-gray-600">
                            <span className="!w-1.5 !h-1.5 bg-gray-400 rounded-full"></span>
                            Easy maintenance
                          </li>
                          <li className="flex items-center !gap-2 text-gray-600">
                            <span className="!w-1.5 !h-1.5 bg-gray-400 rounded-full"></span>
                            Durable construction
                          </li>
                        </ul>
                      </div>
                      {/* Care Instructions */}
                      <div className="bg-gray-50 !p-6 rounded-lg">
                        <h3 className="font-medium text-gray-900 !mb-3">Care Instructions</h3>
                        <ul className="!space-y-2">
                          <li className="flex items-center !gap-2 text-gray-600">
                            <span className="!w-1.5 !h-1.5 bg-gray-400 rounded-full"></span>
                            Machine wash cold
                          </li>
                          <li className="flex items-center !gap-2 text-gray-600">
                            <span className="!w-1.5 !h-1.5 bg-gray-400 rounded-full"></span>
                            Do not bleach
                          </li>
                          <li className="flex items-center !gap-2 text-gray-600">
                            <span className="!w-1.5 !h-1.5 bg-gray-400 rounded-full"></span>
                            Tumble dry low
                          </li>
                          <li className="flex items-center !gap-2 text-gray-600">
                            <span className="!w-1.5 !h-1.5 bg-gray-400 rounded-full"></span>
                            Iron on low heat
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="!max-w-3xl">
                {/* Reviews Header */}
                <div className="flex items-center justify-between !mb-8">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">Customer Reviews</h2>
                    <p className="text-gray-500 text-sm !mt-1">What our customers are saying</p>
                  </div>
                  <button className="bg-black text-white text-sm font-medium !px-6 !py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    Write a Review
                  </button>
                </div>

                {/* Overall Rating */}
                <div className="flex items-center !gap-8 !mb-8 !p-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">4.8</div>
                    <div className="flex !gap-1 !my-2">
                      {[...Array(5)].map((_, i) => (
                        <img
                          key={i}
                          src={assets.star_icon}
                          alt="star"
                          className="!w-4 !h-4"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">Based on 102 reviews</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center !gap-2 !mb-2">
                        <div className="text-sm text-gray-600 !w-6">{rating}</div>
                        <div className="flex-1 !h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="!h-full bg-yellow-400 rounded-full"
                            style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 10}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500 !w-10">
                          {rating === 5 ? '70%' : rating === 4 ? '20%' : '10%'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="border-t !pt-8">
                  {renderReviews()}
                  <button className="!w-full text-center text-sm text-blue-600 hover:text-blue-700 !mt-6 !py-2">
                    Load More Reviews
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : <div className="opacity-0"></div>;
};

export default Product;
