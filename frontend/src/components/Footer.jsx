// Footer.jsx
import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
    return (
        <div className="px-8 sm:px-16 py-10 bg-light">
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-8 my-10 mt-20 text-sm'>
                <div>
                    <img src={assets.logo} alt="ShopNGo Logo" className='mb-6 w-32' />
                    <br />
                    <p className='w-full md:w-2/3 text-gray-500'>
                        Discover the best deals and latest trends at ShopNGo. Your one-stop shop for everything you need! From electronics to fashion, we have it all. Shop now and save big!
                    </p>
                </div>
                <div>
                    <p className='text-xl font-medium mb-4'>ShopNGo</p>
                    <br />
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy policy</li>
                        <li>Terms of service</li>
                    </ul>
                </div>
                <div>
                    <p className='text-xl font-medium mb-4'>GET IN TOUCH</p>
                    <br />
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>+91 880591****</li>
                        <li>faizan.m.patel10@gmail.com</li>
                        <li>Contact us</li>
                    </ul>
                </div>
            </div>
            <br />
            <br />
            <hr className='my-6' />
            <p className='text-sm text-center'>© 2022 ShopNGo. All rights reserved.</p>
        </div>
    );
};

export default Footer;