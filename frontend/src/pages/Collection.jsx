import React, { useContext, useEffect, useCallback } from 'react';
import { useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);

  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const categories = [
    { value: 'Men', label: 'Men' },
    { value: 'Women', label: 'Women' },
    { value: 'Kids', label: 'Kids' },
    { value: 'Accessories', label: 'Accessories' }
  ];

  const subCategories = [
    { value: 'Topwear', label: 'Top-wear' },
    { value: 'Bottomwear', label: 'Bottom-wear' },
    { value: 'Dresses', label: 'Dresses' },
    { value: 'Formal', label: 'Formal Wear' },
    { value: 'Ethnic', label: 'Ethnic Wear' },
    { value: 'Activewear', label: 'Active-wear' },
    { value: 'Winterwear', label: 'Winter-wear' },
    { value: 'Footwear', label: 'Footwear' },
    { value: 'Bags', label: 'Bags & Purses' },
    { value: 'Jewelry', label: 'Jewelry' },
    { value: 'Watches', label: 'Watches' },
    { value: 'Belts', label: 'Belts' },
    { value: 'Scarves', label: 'Scarves & Wraps' },
    { value: 'Hats', label: 'Hats & Caps' }
  ];

  const [priceRange, setPriceRange] = useState('all');
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50', label: 'Under $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200+', label: 'Over $200' }
  ];

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = useCallback(() => {
    let productsCopy = products.slice();
    
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) => 
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => 
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => 
        subCategory.includes(item.subCategory)
      );
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      productsCopy = productsCopy.filter((item) => {
        if (max) {
          return item.price >= min && item.price <= max;
        } else {
          return item.price >= min;
        }
      });
    }

    setFilteredProducts(productsCopy);
  }, [products, category, subCategory, search, showSearch, priceRange]);

  const sortProducts = () => {
    let fpCopy = filteredProducts.slice();
    switch (sortType) {
      case 'low-high':
        setFilteredProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilteredProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, applyFilter, search, showSearch]);

  useEffect(() => {
    sortProducts();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row !gap-6 sm:!gap-10 !pt-10 !px-4'>
      {/* Filter Section */}
      <div className='!min-w-[240px] bg-white !p-4 rounded-lg shadow-sm'>
        <p onClick={() => setShowFilter(!showFilter)}
          className='!my-4 text-xl flex items-center cursor-pointer !gap-2 hover:text-gray-700 transition-colors'>
          <span className="font-medium">FILTERS</span>
          <img className={`!h-3 sm:hidden transform transition-transform ${showFilter ? 'rotate-180' : ''}`}
            src={assets.dropdown_icon} alt='Toggle' />
        </p>

        {/* Price Range Filter */}
        <div className={`border border-gray-200 rounded-lg !p-4 !mb-4 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='!mb-4 text-sm font-medium text-gray-800 uppercase'>Price Range</p>
          <div className='flex flex-col !gap-3 text-sm text-gray-600'>
            {priceRanges.map((range) => (
              <label key={range.value} className='flex items-center !gap-2 cursor-pointer hover:text-gray-800'>
                <input
                  className='!w-4 !h-4 accent-black'
                  type='radio'
                  name='priceRange'
                  value={range.value}
                  onChange={(e) => setPriceRange(e.target.value)}
                  checked={priceRange === range.value}
                />
                {range.label}
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className={`border border-gray-200 rounded-lg !p-4 !mb-4 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='!mb-4 text-sm font-medium text-gray-800 uppercase'>Categories</p>
          <div className='flex flex-col !gap-3 text-sm text-gray-600'>
            {categories.map((cat) => (
              <label key={cat.value} className='flex items-center !gap-2 cursor-pointer hover:text-gray-800'>
                <input
                  className='!w-4 !h-4 accent-black'
                  type='checkbox'
                  value={cat.value}
                  onChange={toggleCategory}
                  checked={category.includes(cat.value)}
                />
                {cat.label}
              </label>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className={`border border-gray-200 rounded-lg !p-4 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='!mb-4 text-sm font-medium text-gray-800 uppercase'>Type</p>
          <div className='flex flex-col !gap-3 text-sm text-gray-600'>
            {subCategories.map(({ value, label }) => (
              <label key={value} className='flex items-center !gap-2 cursor-pointer hover:text-gray-800'>
                <input
                  className='!w-4 !h-4 accent-black'
                  type='checkbox'
                  value={value}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className='flex-1'>
        <div className='flex justify-between items-center !mb-6'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className='border-2 border-gray-200 rounded-lg text-sm !px-4 !py-2 outline-none cursor-pointer hover:border-gray-300 transition-colors'
          >
            <option value='relevant'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-high'>Sort by: High to Low</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 !gap-6'>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))
          ) : (
            <div className='col-span-full text-center !py-20 text-gray-500'>
              No products found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
