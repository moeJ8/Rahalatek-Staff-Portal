import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiChevronDown, HiLogout, HiUser } from 'react-icons/hi';
import { FaQrcode, FaCalendarAlt, FaHotel, FaPlane, FaHome, FaBox, FaEnvelope, FaGlobe, FaInfoCircle, FaBlog } from 'react-icons/fa';
import UserBadge from './UserBadge';

export default function UserDropdown({ user, onLogout, onCalendarClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [publicPagesOpen, setPublicPagesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleHotelsClick = () => {
    setDropdownOpen(false);
    navigate('/hotels');
  };

  const handleToursClick = () => {
    setDropdownOpen(false);
    navigate('/tours');
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleAttendanceClick = () => {
    setDropdownOpen(false);
    navigate('/attendance');
  };

  const handleCalendarClick = () => {
    setDropdownOpen(false);
    if (onCalendarClick) {
      onCalendarClick();
    }
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    onLogout();
  };

  const togglePublicPages = () => {
    setPublicPagesOpen(!publicPagesOpen);
  };

  const handleGuestHomeClick = () => {
    setDropdownOpen(false);
    navigate('/');
  };

  const handleGuestAboutClick = () => {
    setDropdownOpen(false);
    navigate('/about');
  };

  const handleGuestHotelsClick = () => {
    setDropdownOpen(false);
    navigate('/guest/hotels');
  };

  const handleGuestToursClick = () => {
    setDropdownOpen(false);
    navigate('/guest/tours');
  };

  const handleGuestPackagesClick = () => {
    setDropdownOpen(false);
    navigate('/packages');
  };

  const handleGuestBlogClick = () => {
    setDropdownOpen(false);
    navigate('/blog');
  };

  const handleGuestContactClick = () => {
    setDropdownOpen(false);
    navigate('/contact');
  };

  const getUserRole = () => {
    if (user?.isAdmin) return { text: 'Admin', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
    if (user?.isAccountant) return { text: 'Accountant', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
    if (user?.isContentManager) return { text: 'Content Manager', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
    if (user?.isPublisher) return { text: 'Publisher', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
    return { text: 'User', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
  };

  const getAvatarImage = () => {
    if (user?.isAdmin) return '/adminAvatar.png';
    if (user?.isAccountant) return '/accountantAvatar.png';
    if (user?.isContentManager) return '/accountantAvatar.png'; // Use accountant avatar for now
    if (user?.isPublisher) return '/accountantAvatar.png'; // Use accountant avatar for now
    return '/normalUserAvatar.png';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isPublicPageActive = () => {
    const publicPaths = ['/', '/about', '/guest/hotels', '/guest/tours', '/packages', '/blog', '/contact'];
    return publicPaths.includes(location.pathname) || location.pathname.startsWith('/blog/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-950 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 dark:focus:border-teal-600 active:bg-white dark:active:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md w-64"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm">
          <img 
            src={getAvatarImage()} 
            alt={`${getUserRole().text} Avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.username}</span>
          <UserBadge user={user} size="xs" />
        </div>
        <HiChevronDown 
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-all duration-200 ${
            dropdownOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 mt-3 w-64 bg-gray-50 dark:bg-slate-950 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 z-50 py-1 transition-all duration-200 ease-in-out origin-top-right ${
          dropdownOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
          {/* User Info Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 dark:from-teal-900/10 dark:to-cyan-900/10 border-b border-gray-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm flex-shrink-0 border-2 border-white dark:border-slate-800">
                <img 
                  src={getAvatarImage()} 
                  alt={`${getUserRole().text} Avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-24">
                    {user.username}
                  </span>
                  <UserBadge user={user} size="sm" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {user.email || 'Rahalatek'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleProfileClick}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                isActive('/profile') 
                  ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <HiUser className={`w-4 h-4 mr-3 ${isActive('/profile') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
              Profile
            </button>

            <button
              onClick={handleHotelsClick}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                isActive('/hotels') 
                  ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <FaHotel className={`w-4 h-4 mr-3 ${isActive('/hotels') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
              Hotels
            </button>

            <button
              onClick={handleToursClick}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                isActive('/tours') 
                  ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <FaPlane className={`w-4 h-4 mr-3 ${isActive('/tours') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
              Tours
            </button>

            <button
              onClick={handleAttendanceClick}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                isActive('/attendance') 
                  ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <FaQrcode className={`w-4 h-4 mr-3 ${isActive('/attendance') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
              My Attendance
            </button>

            <button
              onClick={handleCalendarClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <FaCalendarAlt className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              My Calendar
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* Public Pages Collapsible Section */}
            <div>
              <button
                onClick={togglePublicPages}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm transition-colors duration-200 ${
                  isPublicPageActive() 
                    ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center">
                  <FaGlobe className={`w-4 h-4 mr-3 ${isPublicPageActive() ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  Public Pages
                </div>
                <HiChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    publicPagesOpen ? 'rotate-180' : ''
                  } ${isPublicPageActive() ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} 
                />
              </button>

              {/* Collapsible Public Pages Content */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  publicPagesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-gray-50 dark:bg-slate-950 py-1">
                  <button
                    onClick={handleGuestHomeClick}
                    className={`flex items-center w-full px-4 py-2 pl-11 text-sm transition-colors duration-200 ${
                      isActive('/') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FaHome className={`w-3 h-3 mr-3 ${isActive('/') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    Home
                  </button>

                  <button
                    onClick={handleGuestHotelsClick}
                    className={`flex items-center w-full px-4 py-2 pl-11 text-sm transition-colors duration-200 ${
                      isActive('/guest/hotels') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FaHotel className={`w-3 h-3 mr-3 ${isActive('/guest/hotels') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    Hotels
                  </button>

                  <button
                    onClick={handleGuestToursClick}
                    className={`flex items-center w-full px-4 py-2 pl-11 text-sm transition-colors duration-200 ${
                      isActive('/guest/tours') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FaPlane className={`w-3 h-3 mr-3 ${isActive('/guest/tours') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    Tours
                  </button>

                  <button
                    onClick={handleGuestPackagesClick}
                    className={`flex items-center w-full px-4 py-2 pl-11 text-sm transition-colors duration-200 ${
                      isActive('/packages') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FaBox className={`w-3 h-3 mr-3 ${isActive('/packages') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    Packages
                  </button>

                  <button
                    onClick={handleGuestBlogClick}
                    className={`flex items-center w-full px-4 py-2 pl-11 text-sm transition-colors duration-200 ${
                      isActive('/blog') || location.pathname.startsWith('/blog/')
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FaBlog className={`w-3 h-3 mr-3 ${isActive('/blog') || location.pathname.startsWith('/blog/') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    Blog
                  </button>

                  <button
                    onClick={handleGuestContactClick}
                    className={`flex items-center w-full px-4 py-2 pl-11 text-sm transition-colors duration-200 ${
                      isActive('/contact') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FaEnvelope className={`w-3 h-3 mr-3 ${isActive('/contact') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    Contact
                  </button>

                  <button
                    onClick={handleGuestAboutClick}
                    className={`flex items-center w-full px-4 py-2 pl-11 text-sm transition-colors duration-200 ${
                      isActive('/about') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/30 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FaInfoCircle className={`w-3 h-3 mr-3 ${isActive('/about') ? 'text-blue-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    About Us
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              <HiLogout className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
    </div>
  );
} 