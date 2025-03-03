import React from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'

const NavBar = () => {
  return (
    <div className='flex justify-between items-center py-5 font-medium px-5'>
      {/* Logo */}
      <img src={assets.logo} className='w-36' alt="Logo" />

      {/* Navigation Links */}
      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to="/" className='flex flex-col items-center gap-1'>
          <p>Home</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to="/collection" className='flex flex-col items-center gap-1'>
          <p>Collection</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to="/about" className='flex flex-col items-center gap-1'>
          <p>About</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to="/contact" className='flex flex-col items-center gap-1'>
          <p>Contact</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </ul>

      {/* Icons Section */}
      <div className='flex items-center gap-6'>
        <img src={assets.search_icon} className='w-5 cursor-pointer' alt="Search Icon" />

        {/* Profile Dropdown */}
        <div className='group relative'>
          <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="Profile Icon" />
          <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
            <div className='flex flex-col gap-2 w-36 px-5 bg-slate-100 text-gray-500 rounded'>
              <p className='cursor-pointer hover:text-black'>My Profile</p>
              <p className='cursor-pointer hover:text-black'>Orders</p>
              <p className='cursor-pointer hover:text-black'>Logout</p>
            </div>
          </div>
        </div>

        {/* Cart Icon (Fixed) */}
        <Link to='/cart' className='relative'>
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart Icon" />
          <p className='absolute right-[-5px] bottom-[-5px] w-4 text-xs text-center leading-4 bg-black text-white aspect-square rounded'>10</p>
        </Link>
        <p></p>
      </div>
    </div>
  )
}

export default NavBar
