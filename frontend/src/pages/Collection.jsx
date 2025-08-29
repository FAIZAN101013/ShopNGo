import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import Pagination from '../components/Pagination';
import FilterGroup from '../components/FilterGroup';

const PRODUCTS_PER_PAGE = 12;

const CATEGORIES = [
  { value: 'Men', label: 'Men' },
  { value: 'Women', label: 'Women' },
  { value: 'Kids', label: 'Kids' },
  { value: 'Accessories', label: 'Accessories' }
];

const SUB_CATEGORIES = [
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

const PRICE_RANGES = [
  { value: 'all', label: 'All Prices' },
  { value: '0-50', label: 'Under $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: '200+', label: 'Over $200' }
];

const labelFor = (list, value) => list.find((i) => i.value === value)?.label || value;

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [priceRange, setPriceRange] = useState('all');
  const [sortType, setSortType] = useState('relevant');
  const [currentPage, setCurrentPage] = useState(1);

  const gridTopRef = useRef(null);

  useEffect(() => {
    document.title = 'Collection | ShopNGo';
  }, []);

  const toggleIn = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const toggleCategory = toggleIn(setCategory);
  const toggleSubCategory = toggleIn(setSubCategory);

  const clearAll = () => {
    setCategory([]);
    setSubCategory([]);
    setPriceRange('all');
  };

  const activeCount = category.length + subCategory.length + (priceRange === 'all' ? 0 : 1);

  // Filtering and sorting are derived from the inputs rather than stored in
  // their own state. Keeping a second copy in state meant a filter change
  // rebuilt the list and silently threw away the chosen sort order.
  const filteredProducts = useMemo(() => {
    let list = products.slice();

    if (showSearch && search) {
      list = list.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, showSearch, category, subCategory, priceRange, sortType]);

  const safePage = Math.min(currentPage, totalPages);
  const firstIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(firstIndex, firstIndex + PRODUCTS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const optionRow =
    'flex cursor-pointer items-center gap-2.5 text-sm text-gray-600 transition-colors hover:text-gray-900';

  // Every applied filter, flattened so it can be shown as a removable chip.
  const activeChips = [
    ...category.map((v) => ({
      key: `cat-${v}`,
      label: labelFor(CATEGORIES, v),
      remove: () => toggleCategory(v)
    })),
    ...subCategory.map((v) => ({
      key: `sub-${v}`,
      label: labelFor(SUB_CATEGORIES, v),
      remove: () => toggleSubCategory(v)
    })),
    ...(priceRange !== 'all'
      ? [
          {
            key: 'price',
            label: labelFor(PRICE_RANGES, priceRange),
            remove: () => setPriceRange('all')
          }
        ]
      : [])
  ];

  return (
    <div className="pt-10 pb-16">
      {/* Mobile toggle. It reports how many filters are on, so the panel
          being closed does not hide the fact that results are narrowed. */}
      <button
        type="button"
        onClick={() => setShowFilter((v) => !v)}
        aria-expanded={showFilter}
        className="mb-6 flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 sm:hidden"
      >
        <span>
          Filters
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${showFilter ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="flex flex-col gap-8 sm:flex-row sm:gap-10">
        {/* Filters */}
        <aside className={`w-full shrink-0 sm:block sm:w-60 ${showFilter ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-900">Filters</h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded text-xs font-medium text-gray-500 underline underline-offset-4 hover:text-gray-900"
              >
                Clear all
              </button>
            )}
          </div>

          <FilterGroup title="Price" count={priceRange === 'all' ? 0 : 1}>
            {PRICE_RANGES.map((range) => (
              <label key={range.value} className={optionRow}>
                <input
                  className="h-4 w-4 accent-black"
                  type="radio"
                  name="priceRange"
                  value={range.value}
                  onChange={(e) => setPriceRange(e.target.value)}
                  checked={priceRange === range.value}
                />
                {range.label}
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Category" count={category.length}>
            {CATEGORIES.map((cat) => (
              <label key={cat.value} className={optionRow}>
                <input
                  className="h-4 w-4 accent-black"
                  type="checkbox"
                  value={cat.value}
                  onChange={() => toggleCategory(cat.value)}
                  checked={category.includes(cat.value)}
                />
                {cat.label}
              </label>
            ))}
          </FilterGroup>

          {/* Fourteen options, so this one starts closed. */}
          <FilterGroup title="Type" count={subCategory.length} defaultOpen={false}>
            {SUB_CATEGORIES.map(({ value, label }) => (
              <label key={value} className={optionRow}>
                <input
                  className="h-4 w-4 accent-black"
                  type="checkbox"
                  value={value}
                  onChange={() => toggleSubCategory(value)}
                  checked={subCategory.includes(value)}
                />
                {label}
              </label>
            ))}
          </FilterGroup>
        </aside>

        {/* Products */}
        <div className="min-w-0 flex-1" ref={gridTopRef}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Title text1={'ALL'} text2={'COLLECTIONS'} />
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              aria-label="Sort products"
              className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none transition-colors hover:border-gray-900"
            >
              <option value="relevant">Sort by: Relevant</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
          </div>

          {/* Applied filters, each removable on its own. Previously the only
              way to see what was on was to read down the whole sidebar, and
              the only way to undo one was to find its checkbox again. */}
          {activeChips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.remove}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-gray-300 py-1 pl-3 pr-2 text-xs text-gray-700 transition-colors hover:border-gray-900"
                >
                  {chip.label}
                  <span className="text-gray-400 transition-colors group-hover:text-gray-900" aria-hidden="true">
                    &times;
                  </span>
                  <span className="sr-only">Remove filter</span>
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="rounded text-xs font-medium text-gray-500 underline underline-offset-4 hover:text-gray-900"
              >
                Clear all
              </button>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <p className="mb-6 text-sm text-gray-500">
              Showing {firstIndex + 1}&ndash;{firstIndex + visibleProducts.length} of{' '}
              {filteredProducts.length} products
            </p>
          )}

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
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
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-500">No products match these filters.</p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-4 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
                  >
                    Clear all filters
                  </button>
                )}
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
    </div>
  );
};

export default Collection;
