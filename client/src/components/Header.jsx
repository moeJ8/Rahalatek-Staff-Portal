import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CustomDarkModeToggle from './CustomDarkModeToggle';
import CustomButton from './CustomButton';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import Searchbar from './Searchbar';
import UserCalendar from './UserCalendar';
import { 
  FaCheck, FaTimes, FaSignInAlt, FaSignOutAlt, FaClock, 
  FaHome, FaClipboardList, FaTicketAlt, FaHotel, FaRoute, FaBox, FaEnvelope, FaInfoCircle,
  FaChartLine, FaUser, FaUserClock, FaCalendarAlt, FaMoon, FaSignOutAlt as FaLogout 
} from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import axios from 'axios';

export default function Header() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mobileMenuExpanded, setMobileMenuExpanded] = useState(false);
  const [mobilePublicPagesOpen, setMobilePublicPagesOpen] = useState(false);
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
    setMobileMenuExpanded(false);
    setMobilePublicPagesOpen(false);
  };

  // Check if current page is a public page where sign-in should be hidden
  const isPublicPage = () => {
    return location.pathname.startsWith('/hotels/') || location.pathname.startsWith('/tours/');
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

  const isSignInPage = location.pathname === '/signin';

  return (
    <header className={`shadow-md mb-6 transition-all duration-300 sticky top-0 z-50 ${
      isSignInPage 
        ? 'bg-white/10 backdrop-blur-md border-b border-white/20' 
        : 'bg-white dark:bg-slate-950'
    }`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-20">
            <Link to={user ? "/home" : "/"} className="flex items-center">
              <img 
                src={isSignInPage ? "/logodark.png" : (darkMode ? "/logodark.png" : "/Logolight.png")} 
                alt="Rahalatek Logo" 
                className="h-11 object-contain"
                loading="eager"
                decoding="async"
              />
            </Link>
            
            {/* Search Bar - Left side, only for admin/accountant */}
            {user && (user?.isAdmin || user?.isAccountant) && <Searchbar />}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden xl:flex gap-4 items-center">
            
            {user ? (
              <>
                <Link 
                  to="/home" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isActive('/home') 
                      ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                  }`}
                >
                  Home
                  <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                    isActive('/home') ? 'w-full' : 'w-0 group-hover:w-full'
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
                {(user?.isAdmin || user?.isAccountant || user?.isContentManager) && (
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
                {/* Guest Navigation Links */}
                <Link 
                  to="/" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/') 
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  Home
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to="/guest/hotels" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/guest/hotels') 
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  Hotels
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/guest/hotels') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to="/guest/tours" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/guest/tours') 
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  Tours
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/guest/tours') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to="/packages" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/packages') 
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  Packages
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/packages') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to="/contact" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/contact') 
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  Contact
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/contact') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to="/about" 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/about') 
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  About Us
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/about') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                {!isSignInPage && <CustomDarkModeToggle />}
                {!isPublicPage() && (
                  <CustomButton 
                    as={Link} 
                    to="/signin"
                    variant="rippleBlueToYellowTeal" 
                    size="sm"
                  >
                    Sign In
                  </CustomButton>
                )}
              </>
            )}
            
           
          </nav>
          
          {/* Mobile Burger Menu Button */}
          <div className="xl:hidden flex items-center gap-2">
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
        
        {/* Mobile Menu Dropdown - 3x3 Grid */}
        <div className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out border-t dark:border-gray-700 ${
          mobileMenuOpen 
            ? 'max-h-[1000px] opacity-100 mt-4 py-4' 
            : 'max-h-0 opacity-0 mt-0 py-0 border-transparent'
        }`}>
            {user ? (
              <>
                {/* 3x3 Grid for Authenticated Users */}
                <div className="grid grid-cols-3 gap-4 px-2">
                  {/* Row 1 */}
                  <Link 
                    to="/home"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/home') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaHome className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Home</span>
                  </Link>
                  
                  <Link 
                    to="/booking"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/booking') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaClipboardList className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Booking</span>
                  </Link>
                  
                  <Link 
                    to="/vouchers"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/vouchers') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaTicketAlt className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Vouchers</span>
                  </Link>
                  
                  {/* Row 2 */}
                  <Link 
                    to="/hotels"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/hotels') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaHotel className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Hotels</span>
                  </Link>
                  
                  <Link 
                    to="/tours"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/tours') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaRoute className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Tours</span>
                  </Link>
                  
                  {(user.isAdmin || user.isAccountant || user.isContentManager) ? (
                    <Link 
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                        isSignInPage
                          ? 'text-white hover:bg-white/10'
                          : isActive('/dashboard') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                      }`}
                    >
                      <FaChartLine className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-xs font-medium text-center">Dashboard</span>
                    </Link>
                  ) : (
                    <Link 
                      to="/profile"
                      onClick={closeMobileMenu}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                        isActive('/profile') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                      }`}
                    >
                      <FaUser className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-xs font-medium text-center">Profile</span>
                    </Link>
                  )}
                  
                  {/* Row 3 */}
                  {(user.isAdmin || user.isAccountant) && (
                    <Link 
                      to="/profile"
                      onClick={closeMobileMenu}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                        isActive('/profile') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                      }`}
                    >
                      <FaUser className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-xs font-medium text-center">Profile</span>
                    </Link>
                  )}
                  
                  <Link 
                    to="/attendance"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/attendance') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaUserClock className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Attendance</span>
                  </Link>
                  
                  <button 
                    onClick={() => {
                      closeMobileMenu();
                      handleCalendarClick();
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaCalendarAlt className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Calendar</span>
                  </button>
                </div>
                
                {/* Collapsible Public Pages Section */}
                <div className="mt-4 px-2">
                  <button
                    onClick={() => setMobilePublicPagesOpen(!mobilePublicPagesOpen)}
                    className="w-full flex items-center justify-center py-2 px-4 rounded-lg transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm font-medium mr-2">Public Pages</span>
                    {mobilePublicPagesOpen ? (
                      <HiChevronUp className="text-lg transition-transform duration-200" />
                    ) : (
                      <HiChevronDown className="text-lg transition-transform duration-200" />
                    )}
                  </button>
                  
                  {/* Expanded Public Pages */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    mobilePublicPagesOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="grid grid-cols-3 gap-3">
                      <Link 
                        to="/"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                          isActive('/') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaHome className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-medium text-center">Home</span>
                      </Link>
                      
                      <Link 
                        to="/guest/hotels"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                          isActive('/guest/hotels') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaHotel className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-medium text-center">Hotels</span>
                      </Link>
                      
                      <Link 
                        to="/guest/tours"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                          isActive('/guest/tours') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaRoute className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-medium text-center">Tours</span>
                      </Link>
                      
                      <Link 
                        to="/packages"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                          isActive('/packages') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaBox className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-medium text-center">Packages</span>
                      </Link>
                      
                      <Link 
                        to="/contact"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                          isActive('/contact') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaEnvelope className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-medium text-center">Contact</span>
                      </Link>
                      
                      <Link 
                        to="/about"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                          isActive('/about') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaInfoCircle className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-medium text-center">About</span>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Collapsible More Options Section */}
                <div className="mt-4 px-2">
                  <button
                    onClick={() => setMobileMenuExpanded(!mobileMenuExpanded)}
                    className="w-full flex items-center justify-center py-2 px-4 rounded-lg transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm font-medium mr-2">More</span>
                    {mobileMenuExpanded ? (
                      <HiChevronUp className="text-lg transition-transform duration-200" />
                    ) : (
                      <HiChevronDown className="text-lg transition-transform duration-200" />
                    )}
                  </button>
                  
                  {/* Expanded Options */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    mobileMenuExpanded ? 'max-h-32 opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="flex justify-center">
                      {/* Theme Toggle */}
                      <div className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                        isSignInPage
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                      }`}>
                        <div className="transform group-hover:scale-110 transition-transform duration-200">
                          <CustomDarkModeToggle variant={isSignInPage ? "light" : "default"} />
                        </div>
                        <span className="text-xs font-medium text-center mt-1">Theme</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Logout Button - Below Grid */}
                <div className="mt-6 px-2">
                  <CustomButton
                    onClick={handleLogout}
                    variant="red"
                    size="lg"
                    className="w-full"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaLogout className="text-lg" />
                      <span>Logout ({user.username})</span>
                    </div>
                  </CustomButton>
                </div>
              </>
            ) : (
              <>
                {/* Guest Mobile Navigation - 3 Column Grid */}
                <div className="grid grid-cols-3 gap-4 px-2">
                  <Link 
                    to="/"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/') 
                          ? 'text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-yellow-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaHome className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Home</span>
                  </Link>
                  
                  <Link 
                    to="/guest/hotels"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/guest/hotels') 
                          ? 'text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-yellow-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaHotel className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Hotels</span>
                  </Link>
                  
                  <Link 
                    to="/guest/tours"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/guest/tours') 
                          ? 'text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-yellow-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaRoute className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Tours</span>
                  </Link>
                  
                  <Link 
                    to="/packages"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/packages') 
                          ? 'text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-yellow-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaBox className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Packages</span>
                  </Link>
                  
                  <Link 
                    to="/contact"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/contact') 
                          ? 'text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-yellow-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaEnvelope className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">Contact</span>
                  </Link>
                  
                  <Link 
                    to="/about"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/about') 
                          ? 'text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-yellow-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaInfoCircle className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">About Us</span>
                  </Link>
                </div>
                
                {/* Collapsible More Options Section for Guests */}
                <div className="mt-4 px-2">
                  <button
                    onClick={() => setMobileMenuExpanded(!mobileMenuExpanded)}
                    className="w-full flex items-center justify-center py-2 px-4 rounded-lg transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm font-medium mr-2">More</span>
                    {mobileMenuExpanded ? (
                      <HiChevronUp className="text-lg transition-transform duration-200" />
                    ) : (
                      <HiChevronDown className="text-lg transition-transform duration-200" />
                    )}
                  </button>
                  
                  {/* Expanded Options for Guests */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    mobileMenuExpanded ? 'max-h-32 opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="flex justify-center">
                      {/* Theme Toggle */}
                      <div className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                        isSignInPage
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                      }`}>
                        <div className="transform group-hover:scale-110 transition-transform duration-200">
                          <CustomDarkModeToggle variant={isSignInPage ? "light" : "default"} />
                        </div>
                        <span className="text-xs font-medium text-center mt-1">Theme</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sign In Button for Guests */}
                {!isPublicPage() && (
                  <div className="mt-6 px-2">
                    <CustomButton
                      as={Link}
                      to="/signin"
                      onClick={closeMobileMenu}
                      variant="rippleBlueToYellowTeal"
                      size="lg"
                      className="w-full"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FaSignInAlt className="text-lg" />
                        <span>Sign In</span>
                      </div>
                    </CustomButton>
                  </div>
                )}
              </>
            )}
        </div>
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