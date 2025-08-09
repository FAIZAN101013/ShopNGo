import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const NavBar = () => {
  const [visible, setVisible] = useState(false);
  const { setShowSearch, getCartItemsCount } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/collection", label: "Collection" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    { path: "/orders", label: "My Orders" }
  ];

  const handleSearchClick = () => {
    if (location.pathname.includes('collection')) {
      setShowSearch(true);
    } else {
      navigate('/collection');
      setTimeout(() => setShowSearch(true), 100);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      toast.success('Logged out');
    } catch {}
    setVisible(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white sticky top-0 z-50">
      <div className="!max-w-7xl !mx-auto !px-4">
        <div className="flex justify-between items-center !h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={assets.logo} className="!w-36 !h-auto" alt="Logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center !gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative text-sm font-medium !py-2 transition-colors
                  ${isActive
                    ? 'text-black after:absolute after:bottom-0 after:left-0 after:!w-full after:!h-0.5 after:bg-black'
                    : 'text-gray-500 hover:text-black'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Icons Section */}
          <div className="flex items-center !gap-6">
            {/* Search Icon */}
            <button
              onClick={handleSearchClick}
              className="!w-10 !h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
            >
              <img
                src={assets.search_icon}
                className="!w-5 !h-5"
                alt="Search"
              />
            </button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="!w-10 !h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
                <img
                  src={assets.profile_icon}
                  className="!w-6 !h-6"
                  alt="Profile"
                />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 !mt-1 !w-48 bg-white rounded-lg shadow-lg overflow-hidden opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right">
                <div className="!py-1">
                  <Link to="/profile" className="block !px-4 !py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Profile
                  </Link>
                  <Link to="/orders" className="block !px-4 !py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Orders
                  </Link>
                  <div className="!h-[1px] bg-gray-100 !my-1"></div>
                  <button onClick={handleLogout} className="!w-full text-left !px-4 !py-2 text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative !w-10 !h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
            >
              <img
                src={assets.cart_icon}
                className="!w-6 !h-6"
                alt="Cart"
              />
              {getCartItemsCount() > 0 && (
                <span className="absolute !-top-1 !-right-1 !min-w-[20px] !h-5 flex items-center justify-center bg-black text-white text-xs font-medium rounded-full !px-1.5">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setVisible(true)}
              className="!w-10 !h-10 md:hidden flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
            >
              <img
                src={assets.menu_icon}
                className="!w-5 !h-5"
                alt="Menu"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {visible && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-50 md:hidden">
          <div className="absolute right-0 top-0 !h-full !w-64 bg-white">
            <div className="flex justify-between items-center !px-4 !py-4">
              <h2 className="font-medium text-gray-900">Menu</h2>
              <button
                onClick={() => setVisible(false)}
                className="!w-8 !h-8 flex items-center justify-center rounded-full hover:bg-gray-50"
              >
                <img
                  src={assets.cross_icon}
                  className="!w-4 !h-4"
                  alt="Close"
                />
              </button>
            </div>
            <div className="!py-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setVisible(false)}
                  className={({ isActive }) =>
                    `block !px-4 !py-3 text-sm ${isActive
                      ? 'bg-gray-50 text-black font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
