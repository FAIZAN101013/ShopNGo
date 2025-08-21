import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import Pagination from '../components/Pagination';

const PRODUCTS_PER_PAGE = 12;

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);

  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [priceRange, setPriceRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const gridTopRef = useRef(null);

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

  // Filtering and sorting are derived from the inputs rather than stored in
  // their own state. Keeping a second copy in state meant a filter change
  // rebuilt the list and silently threw away the chosen sort order.
  const filteredProducts = useMemo(() => {
    let list = products.slice();

    if (showSearch && search) {
      list = list.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      list = list.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      list = list.filter((item) => subCategory.includes(item.subCategory));
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      list = list.filter((item) =>
        max ? item.price >= min && item.price <= max : item.price >= min
      );
    }

    if (sortType === 'low-high') list.sort((a, b) => a.price - b.price);
    if (sortType === 'high-low') list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, search, showSearch, category, subCategory, priceRange, sortType]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  // Narrowing the filters can leave you stranded on a page that no longer
  // exists (page 4 of a result set that is now one page long), so go back to
  // the first page whenever the result set changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, showSearch, category, subCategory, priceRange, sortType]);

  const safePage = Math.min(currentPage, totalPages);
  const firstIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(firstIndex, firstIndex + PRODUCTS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Without this you land halfway down the next page of results.
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className='flex flex-col sm:flex-row gap-6 sm:gap-10 pt-10 px-4'>
      {/* Filter Section */}
      <div className='min-w-[240px] bg-white p-4 rounded-lg shadow-sm'>
        <p onClick={() => setShowFilter(!showFilter)}
          className='my-4 text-xl flex items-center cursor-pointer gap-2 hover:text-gray-700 transition-colors'>
          <span className="font-medium">FILTERS</span>
          <img className={`h-3 sm:hidden transform transition-transform ${showFilter ? 'rotate-180' : ''}`}
            src={assets.dropdown_icon} alt='Toggle' />
        </p>

        {/* Price Range Filter */}
        <div className={`border border-gray-200 rounded-lg p-4 mb-4 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-4 text-sm font-medium text-gray-800 uppercase'>Price Range</p>
          <div className='flex flex-col gap-3 text-sm text-gray-600'>
            {priceRanges.map((range) => (
              <label key={range.value} className='flex items-center gap-2 cursor-pointer hover:text-gray-800'>
                <input
                  className='w-4 h-4 accent-black'
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
        <div className={`border border-gray-200 rounded-lg p-4 mb-4 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-4 text-sm font-medium text-gray-800 uppercase'>Categories</p>
          <div className='flex flex-col gap-3 text-sm text-gray-600'>
            {categories.map((cat) => (
              <label key={cat.value} className='flex items-center gap-2 cursor-pointer hover:text-gray-800'>
                <input
                  className='w-4 h-4 accent-black'
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
        <div className={`border border-gray-200 rounded-lg p-4 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-4 text-sm font-medium text-gray-800 uppercase'>Type</p>
          <div className='flex flex-col gap-3 text-sm text-gray-600'>
            {subCategories.map(({ value, label }) => (
              <label key={value} className='flex items-center gap-2 cursor-pointer hover:text-gray-800'>
                <input
                  className='w-4 h-4 accent-black'
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
      <div className='flex-1' ref={gridTopRef}>
        <div className='flex flex-wrap gap-4 justify-between items-center mb-6'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className='border-2 border-gray-200 rounded-lg text-sm px-4 py-2 outline-none cursor-pointer hover:border-gray-300 transition-colors'
          >
            <option value='relevant'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
          </select>
        </div>

        {filteredProducts.length > 0 && (
          <p className='mb-6 text-sm text-gray-500'>
            Showing {firstIndex + 1}&ndash;{firstIndex + visibleProducts.length} of{' '}
            {filteredProducts.length} products
          </p>
        )}

        {/* Products Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {visibleProducts.length > 0 ? (
            visibleProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))
          ) : (
            <div className='col-span-full text-center py-20 text-gray-500'>
              No products found matching your criteria
            </div>
          )}
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Collection;
