import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch} = useContext(ShopContext);
    const [visible, setVisible] = useState(false)
    const location = useLocation();

    useEffect(() => {
       if(location.pathname.includes('collection')) {
          setVisible(true);
       }
       else {
        setVisible(false)
       }
    }, [location])

  return showSearch && visible ? (
    <div className='border-t border-b bg-gradient-to-r from-pink-50 via-white to-rose-50 text-center py-6'>
        <div className='inline-flex items-center justify-center border-2 border-pink-300 bg-white px-6 py-3 my-2 mx-3 rounded-full w-3/4 sm:w-1/2 shadow-md hover:shadow-lg transition-all duration-300 focus-within:border-pink-500'>
            <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className='flex-1 outline-none bg-inherit text-sm text-gray-700 placeholder-gray-400' 
                type="text" 
                placeholder='Search for products, categories...' 
            />
            <svg className='w-5 h-5 text-pink-500' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <button 
            onClick={() => setShowSearch(false)} 
            className='inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm text-gray-600 hover:text-pink-500 transition-colors duration-300'
        >
            <svg className='w-4 h-4' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close</span>
        </button>
    </div>
  ) : null
}

export default SearchBar