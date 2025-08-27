import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CustomDarkModeToggle from './CustomDarkModeToggle';
import CustomButton from './CustomButton';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import Searchbar from './Searchbar';
import UserCalendar from './UserCalendar';
import { FaCheck, FaTimes, FaSignInAlt, FaSignOutAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';

export default function Header() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [hoveredIndicator, setHoveredIndicator] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const darkMode = useSelector((state) => state.theme.darkMode);

  // Fetch attendance status
  const fetchAttendanceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/attendance/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendanceStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
      setAttendanceStatus(null);
    }
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
        fetchAttendanceStatus();
      } else {
        setUser(null);
        setAttendanceStatus(null);
      }
    };
    
    checkAuthStatus();

    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [location]);

  // Refresh attendance status every 5 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchAttendanceStatus();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    // Only remove authentication-related items, preserve darkMode setting
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    setUser(null);
    
    // Dispatch custom event to notify App component about auth change
    window.dispatchEvent(new Event('auth-change'));
    navigate('/signin', { replace: true });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleCalendarClick = () => {
    setCalendarOpen(true);
  };

  const handleCalendarClose = () => {
    setCalendarOpen(false);
  };

  // Handle attendance indicator click
  const handleAttendanceClick = () => {
    navigate('/attendance');
  };

  // Get tooltip content for attendance indicators
  const getTooltipContent = (type, status, checkIn, checkOut) => {
    if (type === 'checkin') {
      if (status === 'not-checked-in') {
        return {
          title: 'Check-in Status',
          content: 'Not checked in today',
          detail: 'Click to go to attendance page'
        };
      } else {
        return {
          title: 'Check-in Status',
          content: 'Checked in',
          detail: `Time: ${new Date(checkIn).toLocaleTimeString()}`
        };
      }
    } else if (type === 'checkout') {
      if (status === 'checked-out') {
        return {
          title: 'Check-out Status',
          content: 'Work completed',
          detail: `Time: ${new Date(checkOut).toLocaleTimeString()} • Click to view attendance`
        };
      } else {
        return {
          title: 'Check-out Status',
          content: 'Still working',
          detail: 'Click to check out when done'
        };
      }
    }
  };

  // Render attendance indicators
  const renderAttendanceIndicators = () => {
    if (!user || !attendanceStatus) return null;

    const { status, checkIn, checkOut } = attendanceStatus;

    return (
      <div className="flex items-center gap-2">
        {/* Check-in indicator */}
        <div 
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
            status === 'not-checked-in' 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 cursor-pointer' 
              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-2 border-green-200 dark:border-green-800'
          }`}
          onClick={status === 'not-checked-in' ? handleAttendanceClick : undefined}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPosition({
              x: rect.left + rect.width / 2,
              y: rect.bottom + 10
            });
            setHoveredIndicator(getTooltipContent('checkin', status, checkIn, checkOut));
          }}
          onMouseLeave={() => setHoveredIndicator(null)}
        >
          {status === 'not-checked-in' ? <FaTimes className="w-3 h-3" /> : <FaSignInAlt className="w-3 h-3" />}
        </div>

        {/* Check-out indicator - only show after check-in */}
        {status !== 'not-checked-in' && (
          <div 
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer ${
              status === 'checked-out' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800' 
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-2 border-yellow-200 dark:border-yellow-800'
            }`}
            onClick={handleAttendanceClick}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.bottom + 10
              });
              setHoveredIndicator(getTooltipContent('checkout', status, checkIn, checkOut));
            }}
            onMouseLeave={() => setHoveredIndicator(null)}
          >
            {status === 'checked-out' ? <FaSignOutAlt className="w-3 h-3" /> : <FaClock className="w-3 h-3" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="bg-white dark:bg-slate-950 shadow-md mb-6 transition-colors duration-300 sticky top-0 z-50">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-20">
            <Link to="/" className="flex items-center">
              <img 
                src={darkMode ? "/logodark.png" : "/Logolight.png"} 
                alt="Logo" 
                className="h-11 object-contain"
              />
            </Link>
            
            {/* Search Bar - Left side, only for admin/accountant */}
            {user && (user?.isAdmin || user?.isAccountant) && <Searchbar />}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 items-center">
            
            {user ? (
              <>
                <Link 
                  to="/" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isActive('/') 
                      ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                  }`}
                >
                  Home
                  <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                    isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
                <Link 
                  to="/booking" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isActive('/booking') 
                      ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                  }`}
                >
                  Booking
                  <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                    isActive('/booking') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
                <Link 
                  to="/vouchers" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isActive('/vouchers') 
                      ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                  }`}
                >
                  Vouchers
                  <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                    isActive('/vouchers') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
                {(user?.isAdmin || user?.isAccountant) && (
                  <Link 
                    to="/dashboard" 
                    className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                      isActive('/dashboard') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    Dashboard
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                      isActive('/dashboard') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </Link>
                )}
                <CustomDarkModeToggle />
                <NotificationDropdown />
                {renderAttendanceIndicators()}
                <UserDropdown user={user} onLogout={handleLogout} onCalendarClick={handleCalendarClick} />
              </>
            ) : (
              <>
                <CustomDarkModeToggle />
                <CustomButton 
                  as={Link} 
                  to="/signin"
                  variant="blueToTeal" 
                  size="sm"
                >
                  Sign In
                </CustomButton>
              </>
            )}
            
           
          </nav>
          
          {/* Mobile Burger Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <CustomDarkModeToggle />
            {user && <NotificationDropdown />}
            {user && renderAttendanceIndicators()}
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-teal-400 focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 py-2 border-t dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    to="/"
                    onClick={closeMobileMenu}
                    className={`py-3 px-4 rounded-lg transition-all duration-300 relative group font-medium ${
                      isActive('/') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    Home
                    <span className={`absolute bottom-0 left-4 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                      isActive('/') ? 'w-8' : 'w-0 group-hover:w-8'
                    }`}></span>
                  </Link>
                  
                  <Link 
                    to="/booking"
                    onClick={closeMobileMenu}
                    className={`py-3 px-4 rounded-lg transition-all duration-300 relative group font-medium ${
                      isActive('/booking') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    Booking
                    <span className={`absolute bottom-0 left-4 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                      isActive('/booking') ? 'w-8' : 'w-0 group-hover:w-8'
                    }`}></span>
                  </Link>
                  
                  <Link 
                    to="/vouchers"
                    onClick={closeMobileMenu}
                    className={`py-3 px-4 rounded-lg transition-all duration-300 relative group font-medium ${
                      isActive('/vouchers') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    Vouchers
                    <span className={`absolute bottom-0 left-4 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                      isActive('/vouchers') ? 'w-8' : 'w-0 group-hover:w-8'
                    }`}></span>
                  </Link>
                  
                  {(user.isAdmin || user.isAccountant) && (
                    <Link 
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className={`py-3 px-4 rounded-lg transition-all duration-300 relative group font-medium ${
                        isActive('/dashboard') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                      }`}
                    >
                      Dashboard
                      <span className={`absolute bottom-0 left-4 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                        isActive('/dashboard') ? 'w-8' : 'w-0 group-hover:w-8'
                      }`}></span>
                    </Link>
                  )}
                  
                  <Link 
                    to="/profile"
                    onClick={closeMobileMenu}
                    className={`py-3 px-4 rounded-lg transition-all duration-300 relative group font-medium ${
                      isActive('/profile') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    Profile
                    <span className={`absolute bottom-0 left-4 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                      isActive('/profile') ? 'w-8' : 'w-0 group-hover:w-8'
                    }`}></span>
                  </Link>
                  
                  <Link 
                    to="/attendance"
                    onClick={closeMobileMenu}
                    className={`py-3 px-4 rounded-lg transition-all duration-300 relative group font-medium ${
                      isActive('/attendance') 
                        ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                    }`}
                  >
                    My Attendance
                    <span className={`absolute bottom-0 left-4 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                      isActive('/attendance') ? 'w-8' : 'w-0 group-hover:w-8'
                    }`}></span>
                  </Link>
                  
                  <button 
                    onClick={() => {
                      closeMobileMenu();
                      handleCalendarClick();
                    }}
                    className="py-3 px-4 rounded-lg transition-all duration-300 relative group font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 text-left w-full"
                  >
                    My Calendar
                    <span className="absolute bottom-0 left-4 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 w-0 group-hover:w-8"></span>
                  </button>
                   
                   <button
                     onClick={handleLogout}
                     className="py-2 px-1 text-red-500 dark:text-red-400 text-left"
                   >
                     Logout ({user.username})
                   </button>
                 </>
               ) : (
                 <>
                   <Link 
                     to="/signin"
                     onClick={closeMobileMenu}
                     className="py-2 px-1 text-blue-500 dark:text-blue-400"
                   >
                     Sign In
                   </Link>
                 </>
               )}
             </div>
           </div>
                 )}
      </div>

      {/* User Calendar Modal */}
      <UserCalendar isOpen={calendarOpen} onClose={handleCalendarClose} />

      {/* Attendance Tooltip */}
      {hoveredIndicator && (
        <div
          className="fixed bg-gray-900 dark:bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, 0)'
          }}
        >
          <div className="font-semibold">{hoveredIndicator.title}</div>
          <div className="text-gray-200">{hoveredIndicator.content}</div>
          <div className="text-gray-400 text-xs mt-1">{hoveredIndicator.detail}</div>
        </div>
      )}
    </header>
  );
} 