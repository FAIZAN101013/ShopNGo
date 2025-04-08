// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
    const quickLinks = [
        { name: 'Home', path: '/' },
        { name: 'Collection', path: '/collection' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' }
    ];

    const helpLinks = [
        { name: 'Track Order', path: '/orders' },
        { name: 'Returns', path: '/returns' },
        { name: 'Shipping Info', path: '/shipping' },
        { name: 'FAQ', path: '/faq' }
    ];

    const socialLinks = [
        { name: 'Facebook', icon: assets.facebook_icon, url: 'https://facebook.com' },
        { name: 'Instagram', icon: assets.instagram_icon, url: 'https://instagram.com' },
        { name: 'Twitter', icon: assets.twitter_icon, url: 'https://twitter.com' }
    ];

    return (
        <footer className="bg-gray-50">
            <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 !gap-12 !py-16">
                    {/* Brand Section */}
                    <div className="!space-y-4">
                        <Link to="/">
                            <img src={assets.logo} alt="ShopNGo Logo" className="!h-8" />
                        </Link>
                        <p className="text-gray-600 !text-sm !leading-relaxed">
                            Your premier destination for fashion and lifestyle products. 
                            Discover the latest trends and timeless classics.
                        </p>
                        {/* Social Links */}
                        <div className="flex !gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="!w-10 !h-10 rounded-full bg-white flex items-center justify-center
                                             hover:bg-gray-100 transition-colors border border-gray-200"
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
                        <h3 className="text-gray-900 font-semibold !mb-4">Quick Links</h3>
                        <ul className="!space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        to={link.path}
                                        className="text-gray-600 hover:text-black transition-colors !text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="text-gray-900 font-semibold !mb-4">Help</h3>
                        <ul className="!space-y-3">
                            {helpLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        to={link.path}
                                        className="text-gray-600 hover:text-black transition-colors !text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                </div>

                    {/* Contact Info */}
                <div>
                        <h3 className="text-gray-900 font-semibold !mb-4">Contact Us</h3>
                        <ul className="!space-y-3">
                            <li>
                                <a 
                                    href="tel:+1234567890" 
                                    className="text-gray-600 hover:text-black transition-colors !text-sm flex items-center !gap-2"
                                >
                                    <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                                        />
                                    </svg>
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="mailto:info@shopngo.com" 
                                    className="text-gray-600 hover:text-black transition-colors !text-sm flex items-center !gap-2"
                                >
                                    <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                                        />
                                    </svg>
                                    info@shopngo.com
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://maps.google.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-black transition-colors !text-sm flex items-center !gap-2"
                                >
                                    <svg className="!w-4 !h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                                        />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                                        />
                                    </svg>
                                    123 Shopping Street, NY 10001
                                </a>
                            </li>
                    </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 !py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center !gap-4">
                        <p className="text-gray-600 text-sm">
                            © {new Date().getFullYear()} ShopNGo. All rights reserved.
                        </p>
                        <div className="flex !gap-6">
                            <Link to="/privacy" className="text-gray-600 hover:text-black transition-colors text-sm">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-600 hover:text-black transition-colors text-sm">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;