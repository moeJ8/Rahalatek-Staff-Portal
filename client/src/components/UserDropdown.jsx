import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChevronDown, HiLogout, HiUser } from 'react-icons/hi';
import { FaQrcode, FaCalendarAlt, FaHotel, FaPlane } from 'react-icons/fa';
import UserBadge from './UserBadge';

export default function UserDropdown({ user, onLogout, onCalendarClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
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

  const getUserRole = () => {
    if (user?.isAdmin) return { text: 'Admin', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
    if (user?.isAccountant) return { text: 'Accountant', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
    if (user?.isContentManager) return { text: 'Content Manager', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
    return { text: 'User', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
  };

  const getAvatarImage = () => {
    if (user?.isAdmin) return '/adminAvatar.png';
    if (user?.isAccountant) return '/accountantAvatar.png';
    if (user?.isContentManager) return '/accountantAvatar.png'; // Use accountant avatar for now
    return '/normalUserAvatar.png';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 active:bg-white dark:active:bg-slate-900 active:border-gray-300 dark:active:border-gray-600 "
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
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm flex-shrink-0">
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email || 'Rahalatek'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleProfileClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <HiUser className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Profile
            </button>

            <button
              onClick={handleHotelsClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <FaHotel className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Hotels
            </button>

            <button
              onClick={handleToursClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <FaPlane className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              Tours
            </button>

            <button
              onClick={handleAttendanceClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <FaQrcode className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              My Attendance
            </button>

            <button
              onClick={handleCalendarClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <FaCalendarAlt className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
              My Calendar
            </button>
            
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              <HiLogout className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 