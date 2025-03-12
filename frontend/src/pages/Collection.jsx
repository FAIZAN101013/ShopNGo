import React, { useContext, useEffect, useCallback } from 'react';
import { useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);

  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);

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
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }
    setFilteredProducts(productsCopy);
  }, [products, category]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, applyFilter]);

  return (
    <div className='flex flex-col sm:flex-row !gap-1 sm:gap-10 !pt-10'>
      {/** filter option */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='!my-4 text-xl flex items-center cursor-pointer !gap-2'>
          FILTERS
          <img className={`!h-3 !sm-hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt='Dropdown Icon' />
        </p>

        {/** category filter */}
        <div className={`border border-gray-300 !pl-5 !py-3 !my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='!mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Men'} onChange={toggleCategory} /> Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Women'} onChange={toggleCategory} /> Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Kids'} onChange={toggleCategory} /> Kids
            </p>
          </div>
        </div>

        {/** subcategory filter */}
        <div className={`border border-gray-300 !pl-5 !py-5 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='!mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Top-wear'} onChange={toggleSubCategory} /> Top-wear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Bottom-wear'} onChange={toggleSubCategory} /> Bottom-wear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Winter-wear'} onChange={toggleSubCategory} /> Winter-wear
            </p>
          </div>
        </div>
      </div>

      {/** right side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base !mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/** sort by */}
          <select className='border-2 border-gray-300 text-sm !px-2'>
            <option value='relevant'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
          </select>
        </div>
        {/** product */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 ml-2 gap-6'>
          {filteredProducts.map((item, index) => (
            <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
