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
    console.log('applyFilter called');
    console.log('showSearch:', showSearch, 'search:', search);
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }
    setFilteredProducts(productsCopy);
  }, [products, category, subCategory, search, showSearch]);

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
    <div className='flex flex-col sm:flex-row !gap-1 sm:gap-10 !pt-10'>
      {/** filter option */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='!my-4 text-xl flex items-center cursor-pointer gap-2'>
          FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt='Dropdown Icon' />
        </p>

        {/** category filter */}
        <div className={`border border-gray-300 !pl-5 !py-3 !my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='!mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex !gap-2'>
              <input className='w-3' type='checkbox' value={'Men'} onChange={toggleCategory} /> Men
            </p>
            <p className='flex !gap-2'>
              <input className='w-3' type='checkbox' value={'Women'} onChange={toggleCategory} /> Women
            </p>
            <p className='flex !gap-2'>
              <input className='w-3' type='checkbox' value={'Kids'} onChange={toggleCategory} /> Kids
            </p>
          </div>
        </div>

        {/** subcategory filter */}
        <div className={`border border-gray-300 !pl-5 !py-5 !mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='!mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col !gap-2 text-sm font-light text-gray-700'>
            <p className='flex !gap-2'>
              <input className='w-3' type='checkbox' value={'Topwear'} onChange={toggleSubCategory} /> Top-wear
            </p>
            <p className='flex !gap-2'>
              <input className='w-3' type='checkbox' value={'Bottomwear'} onChange={toggleSubCategory} /> Bottom-wear
            </p>
            <p className='flex !gap-2'>
              <input className='w-3' type='checkbox' value={'Winterwear'} onChange={toggleSubCategory} /> Winter-wear
            </p>
          </div>
        </div>
      </div>

      {/** right side */}
      <div className='flex-1 !ml-10'>
        <div className='flex justify-between text-base !mb-4 !pt-6'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/** sort by */}
          <select onChange={(e) => setSortType(e.target.value)} className='border-2 border-gray-300 text-sm !px-2'>
            <option value='relevant'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
          </select>
        </div>
        {/** product */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 !gap-6'>
          {filteredProducts.map((item, index) => (
            <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
