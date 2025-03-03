import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
const NavBar = () => {
  return (
      <div className='flex justify-between items-center py-5 fornt-medium '>
          <img src={assets.logo} className='w-36' alt="" />
          <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
              <NavLink className='flex  flex-col items-center gap-1'> 
                  <p>Home</p>   
                  <hr className='w-2/4  border-b-2 border-black'/>
                  
              </NavLink>
         
          </ul>
    </div>
  )
}

export default NavBar
