import React from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'

const NavBar = () => {
  return (
    <div className='flex justify-between items-center py-5 font-medium px-5 relative bg-white '>
      {/* Logo */}
      <img src={assets.logo} className='w-36' alt="Logo" />

      {/* Navigation Links */}
      <ul className='hidden sm:flex gap-6 text-sm text-gray-700'>
        {["Home", "Collection", "About", "Contact"].map((item, index) => (
          <NavLink 
            key={index} 
            to={`/${item.toLowerCase()}`} 
            className='relative flex flex-col items-center gap-1 transition duration-300 hover:text-black'
          >
            <p>{item}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden group-hover:block transition-all duration-300' />
          </NavLink>
        ))}
      </ul>

      {/* Icons Section */}
      <div className='flex items-center gap-6'>
        <img src={assets.search_icon} className='w-5 cursor-pointer hover:scale-110 transition' alt="Search Icon" />

        {/* Profile Dropdown */}
        <div className='relative group'>
          <img src={assets.profile_icon} className='w-6 cursor-pointer hover:scale-110 transition' alt="Profile Icon" />
          
          {/* Dropdown Menu */}
          <div className='absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-lg overflow-hidden opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300'>
            <ul className='flex flex-col text-gray-600'>
              <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition'>My Profile</li>
              <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition'>Orders</li>
              <li className='px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer transition'>Logout</li>
            </ul>
          </div>
        </div>

        {/* Cart Icon with Badge */}
        <Link to='/cart' className='relative'>
          <img src={assets.cart_icon} className="w-6 cursor-pointer hover:scale-110 transition" alt="Cart Icon" />
          <p className='absolute -right-2 -bottom-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full'>
            10
          </p>
        </Link>
        <p></p>
      </div>
    </div>
  )
}

export default NavBar
