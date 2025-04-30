import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {


    const socialLinks = [
        { name: 'Facebook', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg', url: 'https://facebook.com' },
        { name: 'Instagram', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg', url: 'https://instagram.com' },
        { name: 'Twitter', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg', url: 'https://twitter.com' }
    ];

    return (
        <footer className="bg-white !pt-12 !pb-6">
            <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 !gap-8">
                    {/* Brand Section */}
                    <div className="!space-y-4">
                        <Link to="/" className="inline-block">
                            <img src={assets.logo} alt="ShopNGo Logo" className="!h-10" />
                        </Link>
                        <p className="text-gray-600 !text-sm !leading-relaxed">
                            Your premier destination for fashion and lifestyle products.
                            Discover the latest trends and timeless classics that define your
                            unique style.
                        </p>

                        {/* Social Links */}
                        <div className="flex !gap-4 !mt-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Follow us on ${social.name}`}
                                    className="!w-8 !h-8 flex items-center justify-center"
                                >
                                    <img
                                        src={social.icon}
                                        alt={social.name}
                                        className="!w-5 !h-5"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 font-semibold !text-lg !mb-4">Quick Links</h3>
                        <ul className="!space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm !leading-relaxed"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/collection"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm !leading-relaxed"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    Collection
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm !leading-relaxed"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm !leading-relaxed"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <h3 className="text-gray-900 font-semibold !text-lg !mb-4">Customer Support</h3>
                        <ul className="!space-y-2">
                            <li>
                                <Link
                                    to="/orders"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm !leading-relaxed"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/returns"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm !leading-relaxed"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    Returns
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/shipping"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm !leading-relaxed"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/faq"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm !leading-relaxed"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact Us Section */}
                <div className="!mt-12">
                    <h3 className="text-gray-900 font-semibold !text-lg !mb-4">Contact Us</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 !gap-6">
                        <div className="flex items-center !gap-3">
                            <svg className="!w-5 !h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                            <a href="tel:+1234567890" className="text-gray-600 hover:text-black transition-colors !text-sm">
                                +91-8805910192
                            </a>
                        </div>
                        <div className="flex items-center !gap-3">
                            <svg className="!w-5 !h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <a href="mailto:info@shopngo.com" className="text-gray-600 hover:text-black transition-colors !text-sm">
                                info@shopngo.com(faizan.m.patel10@gmail.com)
                            </a>
                        </div>
                        <div className="flex items-center !gap-3">
                            <svg className="!w-5 !h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors !text-sm">
                                123 Shopping Street, IN 10001
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 !mt-12 !pt-6 flex flex-col md:flex-row justify-between items-center !gap-4">
                    <p className="text-gray-600 !text-sm">
                        © {new Date().getFullYear()} ShopNGo. All rights reserved. Mohammed Faizan Patel
                    </p>
                    <div className="flex !gap-6">
                        <Link
                            to="/privacy"
                            className="text-gray-600 hover:text-black transition-colors !text-sm"
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            className="text-gray-600 hover:text-black transition-colors !text-sm"
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            Terms of Service
                        </Link>
                        <Link
                            to="/cookies"
                            className="text-gray-600 hover:text-black transition-colors !text-sm"
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            Cookie Policy
                        </Link>
                    </div>
                    <div className="flex items-center !gap-2 !mt-4 md:!mt-0">
                        <span className="text-gray-500 !text-xs">Payment Methods:</span>
                        <div className="flex !gap-2">
                            {['visa', 'mastercard', 'paypal', 'apple-pay'].map(method => (
                                <div key={method} className="!w-8 !h-5 bg-gray-200 rounded">
                                    {/* Payment method icons would go here */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;