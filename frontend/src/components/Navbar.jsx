import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const NavBar = () => {
  const [visible, setVisible] = useState(false);
  const {setShowSearch} = useContext(ShopContext);
  return (
    <div className="flex justify-between items-center py-5 font-medium px-5 pr-8 relative bg-white">
      
      {/* Logo */}
      <Link to="/">
      <img src={assets.logo} className="w-36" alt="Logo" />
      </Link>
      {/* Navigation Links */}
      <ul className="hidden sm:flex gap-6 text-sm text-gray-700">
        <NavLink className='flex flex-col items-center gap-1' to={"/"}>
          <p>Home</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink  className='flex flex-col items-center gap-1' to={"/collection"}>
          <p>Collection</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink  className='flex flex-col items-center gap-1' to={"/about"}>
          <p>About</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink  className='flex flex-col items-center gap-1' to={"/contact"}>
          <p>Contact</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
       
      </ul>

      {/* Icons Section */}
      <div className="flex items-center gap-6">
        <img onClick={()=>setShowSearch(true) } src={assets.search_icon} className="w-5 cursor-pointer hover:scale-110 transition" alt="Search Icon" />

        {/* Profile Dropdown */}
        <div className="relative group">
          <img src={assets.profile_icon} className="w-6 cursor-pointer hover:scale-110 transition" alt="Profile Icon" />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-lg overflow-hidden opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
            <ul className="flex flex-col text-gray-600">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition">My Profile</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition">Orders</li>
              <li className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer transition">Logout</li>
            </ul>
          </div>
        </div>

        {/* Cart Icon with Badge */}
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-6 cursor-pointer hover:scale-110 transition" alt="Cart Icon" />
          <p className="absolute -right-2 -bottom-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
            10
          </p>
        </Link>

        {/* Mobile Menu Icon */}
        <img onClick={() => setVisible(true)} src={assets.menu_icon} className="w-5 cursor-pointer sm:hidden" alt="Menu Icon" />
      </div>

      {/* Sidebar Menu for Small Screens */}
      <div className={`absolute top-0 right-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className="flex flex-col text-gray-600 ">
          <div className="flex items-center gap-4 p-3 ">
            <img onClick={() => setVisible(false)} src={assets.dropdown_icon} className="h-4 rotate-180 cursor-pointer" alt="Close Icon" />
            <p className='pt-10'>Back</p>
          </div>

          {/* Sidebar Links */}
          <NavLink onClick={() => setVisible(false)}  className='py-2 pl-6 border gap-4' to='/'> Home </NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border gap-4'  to='/collection'> Collection </NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border gap-4'  to='/about'> About </NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border  gap-4'  to='/contact'> Contact </NavLink>
          
        </div>
      </div>
    </div>
  );
};

export default NavBar;
