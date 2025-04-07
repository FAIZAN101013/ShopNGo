import React from 'react'
import { assets } from '../assets/assets';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
    const location = useLocation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(location.pathname.includes('collection'));
    }, [location]);

    if (!showSearch || !visible) return null;

    return (
        <div className='!w-full border-b border-gray-200 bg-white'>
            <div className='!max-w-3xl !mx-auto flex items-center justify-center !py-4 !px-4'>
                <div className='flex items-center !w-full border border-gray-300 rounded-full !px-4 !py-2'>
                    <img 
                        src={assets.search_icon} 
                        alt="Search" 
                        className='!w-5 !h-5 opacity-50'
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='flex-1 !ml-3 outline-none text-gray-700 placeholder-gray-400 text-sm'
                        type="text"
                        placeholder='Search products...'
                        autoFocus
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className='!w-5 !h-5 flex items-center justify-center hover:opacity-75'
                        >
                            <img 
                                src={assets.cross_icon} 
                                alt="Clear" 
                                className='!w-3 !h-3'
                            />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowSearch(false)}
                    className='!ml-4 text-gray-500 hover:text-gray-700'
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
