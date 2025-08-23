import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Hero = () => {
  return (
    // overflow-hidden keeps the image inside the border when it scales on hover.
    <div className='flex flex-col sm:flex-row border border-gray-400 overflow-hidden hover:shadow-xl transition-shadow duration-300'>
      {/* Left Side */}
      <div className='w-full sm:w-1/2 py-10 px-6 flex justify-center items-center sm:py-0'>
        <div className='text-[#414141]'>
          <div className='flex items-center gap-2'>
            <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
            <p className='font-medium text-sm md:text-base'>OUR BESTSELLERS</p>
          </div>
          <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>Latest Arrivals</h1>
          {/* This was plain text before, so the main call to action on the
              homepage did nothing when clicked. */}
          <Link
            to='/collection'
            className='group inline-flex items-center gap-2 font-semibold text-sm md:text-base'
          >
            SHOP NOW
            <span className='w-8 md:w-11 h-[1px] bg-[#414141] transition-all duration-300 group-hover:w-14 md:group-hover:w-16'></span>
          </Link>
        </div>
      </div>
      {/* Right Side */}
      <Link to='/collection' className='w-full sm:w-1/2'>
        <img
          className='w-full hover:scale-105 transition-transform duration-500'
          src={assets.hero_img}
          alt='Latest arrivals'
          fetchPriority='high'
          decoding='async'
        />
      </Link>
    </div>
  );
};

export default Hero;
