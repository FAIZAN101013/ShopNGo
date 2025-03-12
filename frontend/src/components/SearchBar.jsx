import React from 'react'
import { assets } from '../assets/assets';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';

const SearchBar = () => {
    const {search, setSearch , showSearch , setShowSearch} = useContext(ShopContext);
    const location = useLocation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if(location.pathname.includes('collection') ){
            setVisible(true);
        }else{
            setVisible(false);
        }
    }, [location])

  return showSearch && visible ? (
    <div className='border-b border-gray-50 text-center'>
          <div className='inline-flex items-center justify-center border border-gray-400 !px-5 !my-5 !py-2 !mx-3 rounded-full w-3/4 sm:w-1/2'>
              <input value={search} onChange={(e) => setSearch(e.target.value)} className='flex-1 outline-none bg-inherit text-sm' type="text" placeholder='search' />
              <img className='w-4' src={assets.search_icon} alt="" />
          </div>
          <img onClick={()=>setShowSearch(false)} className='inline w-3 cursor-pointer' src={assets.cross_icon} alt="" />
    </div>
  ) : null
}

export default SearchBar
