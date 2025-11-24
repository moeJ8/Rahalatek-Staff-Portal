import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CustomDarkModeToggle from './CustomDarkModeToggle';
import CustomButton from './CustomButton';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import Searchbar from './Searchbar';
import PublicSearchbar from './PublicSearchbar';
import UserCalendar from './UserCalendar';
import LanguageSwitcher from './LanguageSwitcher';
import { shouldHideLanguageSwitcher } from '../utils/pageUtils';
import { getLocalizedPath } from '../hooks/useLocalizedNavigate';
import { 
  FaCheck, FaTimes, FaSignInAlt, FaSignOutAlt, FaClock, 
  FaHome, FaClipboardList, FaTicketAlt, FaHotel, FaRoute, FaBox, FaEnvelope, FaInfoCircle,
  FaChartLine, FaUser, FaUserClock, FaCalendarAlt, FaMoon, FaSignOutAlt as FaLogout, FaBlog, FaMoneyBillWave 
} from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import axios from 'axios';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mobilePublicPagesOpen, setMobilePublicPagesOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [hoveredIndicator, setHoveredIndicator] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const darkMode = useSelector((state) => state.theme.darkMode);

  // Check if we're on a protected/auth page
  const isAuthenticated = !!user;
  // Keep language switcher visible; we'll lock header language/dir separately
  const hideLanguageSwitcher = shouldHideLanguageSwitcher(location.pathname, isAuthenticated);
  
  // Force English translations for protected/auth pages
  const getTranslation = (key) => {
    if (isAuthenticated) {
      // Force English translations for protected/auth pages
      const englishTranslations = {
        'header.home': 'Home',
        'header.hotels': 'Hotels',
        'header.tours': 'Tours',
        'header.packages': 'Packages',
        'header.blog': 'Blog',
        'header.contact': 'Contact',
        'header.about': 'About Us',
        'header.signIn': 'Sign In',
        'header.dashboard': 'Dashboard',
        'header.booking': 'Bookings',
        'header.vouchers': 'Vouchers',
        'header.profile': 'Profile',
        'header.attendance': 'Attendance',
        'header.calendar': 'Calendar',
        'header.logout': 'Logout',
        'header.payments': 'Payments',
        'header.publicPages': 'Public Pages',
        'header.more': 'More',
        'header.theme': 'Theme',
        'header.language': 'Language'
      };
      return englishTranslations[key] || key;
    }
    return t(key);
  };

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
    // Handle language-prefixed URLs (e.g., /ar/packages, /fr/packages)
    const currentPath = location.pathname;
    
    // Check exact match
    if (currentPath === path) return true;
    
    // Check with language prefix (/ar, /fr)
    const langPrefixes = ['/ar', '/fr'];
    for (const prefix of langPrefixes) {
      if (currentPath === `${prefix}${path}`) return true;
    }
    
    return false;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobilePublicPagesOpen(false);
  };

  // Check if current page is a public page where sign-in should be hidden
  const isPublicPage = () => {
    // Show sign-in button on all public pages
    // This function now returns false to always show the sign-in button
    return false;
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

  const isSignInPage = location.pathname === '/signin' || 
                       location.pathname === '/ar/signin' || 
                       location.pathname === '/fr/signin';
  const isRTL = i18n.language === 'ar';
  
  // Force LTR layout for protected/auth pages
  const headerDirection = isAuthenticated ? 'ltr' : (isRTL ? 'rtl' : 'ltr');

  return (
    <header dir={headerDirection} className={`shadow-md mb-6 transition-all duration-300 sticky top-0 z-50 ${
      isSignInPage 
        ? 'bg-white/10 backdrop-blur-md border-b border-white/20' 
        : 'bg-white dark:bg-slate-950'
    }`}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-20">
            <Link to={user ? (user.isPublisher ? "/dashboard" : "/home") : getLocalizedPath('/', i18n.language)} className="flex items-center">
              <img 
                src={isSignInPage ? "/logodark.png" : (darkMode ? "/logodark.png" : "/Logolight.png")} 
                alt="Rahalatek Logo" 
                className="h-11 object-contain"
                loading="eager"
                decoding="async"
              />
            </Link>
            
            {/* Search Bar - Left side (Desktop only - xl and above) */}
            <div className="hidden xl:block">
              {user ? (
                // Authenticated users: Search offices, clients & users (admin/accountant only - NOT publishers)
                (user?.isAdmin || user?.isAccountant) && !user?.isPublisher && <Searchbar />
              ) : (
                // Guest users: Search hotels, tours, packages & blogs
                !isSignInPage && <PublicSearchbar />
              )}
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden xl:flex gap-4 items-center">
            
            {user ? (
              <>
                {/* Publishers only see Dashboard link */}
                {user.isPublisher ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                        isActive('/dashboard') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                      }`}
                    >
                      {getTranslation('header.dashboard')}
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                        isActive('/dashboard') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></span>
                    </Link>
                     {!hideLanguageSwitcher && <LanguageSwitcher />}
                    <CustomDarkModeToggle />
                    <NotificationDropdown />
                    {renderAttendanceIndicators()}
                    <UserDropdown user={user} onLogout={handleLogout} onCalendarClick={handleCalendarClick} />
                  </>
                ) : (
                  <>
                    {/* Regular users see all navigation */}
                    <Link 
                      to="/home" 
                      className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                        isActive('/home') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                      }`}
                    >
                      {getTranslation('header.home')}
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                        isActive('/home') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></span>
                    </Link>
                    <Link 
                      to="/bookings" 
                      className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                        isActive('/bookings') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50/80 dark:bg-teal-900/20' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10'
                      }`}
                    >
                      {getTranslation('header.booking')}
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                        isActive('/bookings') ? 'w-full' : 'w-0 group-hover:w-full'
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
                      {getTranslation('header.vouchers')}
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
                        {getTranslation('header.dashboard')}
                        <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-teal-400 transition-all duration-300 ${
                          isActive('/dashboard') ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}></span>
                      </Link>
                    )}
                     {!hideLanguageSwitcher && <LanguageSwitcher />}
                    <CustomDarkModeToggle />
                    <NotificationDropdown />
                    {renderAttendanceIndicators()}
                    <UserDropdown user={user} onLogout={handleLogout} onCalendarClick={handleCalendarClick} />
                  </>
                )}
              </>
            ) : (
              <>
                {/* Guest Navigation Links */}
                <Link 
                  to={getLocalizedPath('/', i18n.language)} 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/') || isActive('/ar') || isActive('/fr')
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  {getTranslation('header.home')}
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/') || isActive('/ar') || isActive('/fr') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to={getLocalizedPath('/guest/hotels', i18n.language)} 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/guest/hotels') || isActive('/ar/guest/hotels') || isActive('/fr/guest/hotels')
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  {getTranslation('header.hotels')}
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/guest/hotels') || isActive('/ar/guest/hotels') || isActive('/fr/guest/hotels') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to={getLocalizedPath('/guest/tours', i18n.language)} 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/guest/tours') || isActive('/ar/guest/tours') || isActive('/fr/guest/tours')
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  {getTranslation('header.tours')}
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/guest/tours') || isActive('/ar/guest/tours') || isActive('/fr/guest/tours') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to={getLocalizedPath('/packages', i18n.language)} 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/packages') 
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  {getTranslation('header.packages')}
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/packages') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to={getLocalizedPath('/blog', i18n.language)} 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/blog') || isActive('/ar/blog') || isActive('/fr/blog') || location.pathname.startsWith('/blog/') || location.pathname.startsWith('/ar/blog/') || location.pathname.startsWith('/fr/blog/')
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  {getTranslation('header.blog')}
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/blog') || isActive('/ar/blog') || isActive('/fr/blog') || location.pathname.startsWith('/blog/') || location.pathname.startsWith('/ar/blog/') || location.pathname.startsWith('/fr/blog/') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to={getLocalizedPath('/contact', i18n.language)} 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/contact') || isActive('/ar/contact') || isActive('/fr/contact')
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  {getTranslation('header.contact')}
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/contact') || isActive('/ar/contact') || isActive('/fr/contact') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                <Link 
                  to={getLocalizedPath('/about', i18n.language)} 
                  className={`font-medium py-2 px-3 rounded-lg transition-all duration-300 relative group ${
                    isSignInPage
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : isActive('/about') || isActive('/ar/about') || isActive('/fr/about')
                        ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/80 dark:bg-yellow-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  {getTranslation('header.about')}
                  {!isSignInPage && (
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 ${
                      isActive('/about') || isActive('/ar/about') || isActive('/fr/about') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  )}
                </Link>
                {!isSignInPage && (
                  <>
                     {!hideLanguageSwitcher && <LanguageSwitcher />}
                    <CustomDarkModeToggle />
                  </>
                )}
                {isSignInPage && !hideLanguageSwitcher && <LanguageSwitcher variant="light" />}
                {!isPublicPage() && (
                  <CustomButton 
                    as={Link} 
                    to={getLocalizedPath("/signin", i18n.language)}
                    variant="rippleBlueToYellowTeal" 
                    size="sm"
                  >
                    {getTranslation('header.signIn')}
                  </CustomButton>
                )}
              </>
            )}
            
           
          </nav>
          
          {/* Mobile Burger Menu Button */}
          <div className="xl:hidden flex items-center gap-2">
            {/* Search for guests and users with permission */}
            {!user && !isSignInPage && <PublicSearchbar />}
            {user && (user?.isAdmin || user?.isAccountant) && !user?.isPublisher && <Searchbar />}
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
                {/* Publishers get a menu without Home, Booking, and Vouchers */}
                {user.isPublisher ? (
                  <>
                    {/* 2x3 Grid for Publishers */}
                    <div className="grid grid-cols-3 gap-4 px-2">
                      {/* Row 1 */}
                      <Link 
                        to="/dashboard"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                          isActive('/dashboard') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaChartLine className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium text-center">{getTranslation('header.dashboard')}</span>
                      </Link>
                      
                      <Link 
                        to="/hotels"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                          isActive('/hotels') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaHotel className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium text-center">{getTranslation('header.hotels')}</span>
                      </Link>
                      
                      <Link 
                        to="/tours"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                          isActive('/tours') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaRoute className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium text-center">{getTranslation('header.tours')}</span>
                      </Link>
                      
                      {/* Row 2 */}
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
                        <span className="text-xs font-medium text-center">{getTranslation('header.profile')}</span>
                      </Link>
                      
                      <Link 
                        to="/attendance"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                          isActive('/attendance') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaUserClock className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium text-center">{getTranslation('header.attendance')}</span>
                      </Link>
                      
                    {(user.isAdmin || user.isAccountant) && (
                      <Link 
                        to="/payments"
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                          isActive('/payments') 
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaMoneyBillWave className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium text-center">{getTranslation('header.payments')}</span>
                      </Link>
                    )}
                    
                      <button 
                        onClick={() => {
                          closeMobileMenu();
                          handleCalendarClick();
                        }}
                        className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md"
                      >
                        <FaCalendarAlt className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium text-center">{getTranslation('header.calendar')}</span>
                      </button>
                    </div>
                    
                    {/* Collapsible Public Pages Section */}
                    <div className="mt-4 px-2">
                      <button
                        onClick={() => setMobilePublicPagesOpen(!mobilePublicPagesOpen)}
                        className="w-full flex items-center justify-center py-2 px-4 rounded-lg transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <span className="text-sm font-medium mr-2">{getTranslation('header.publicPages')}</span>
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
                            to={getLocalizedPath("/", i18n.language)}
                            onClick={closeMobileMenu}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                              isActive('/') 
                                ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                            }`}
                          >
                            <FaHome className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-[10px] font-medium text-center">{getTranslation('header.home')}</span>
                          </Link>
                          
                          <Link 
                            to={getLocalizedPath("/guest/hotels", i18n.language)}
                            onClick={closeMobileMenu}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                              isActive('/guest/hotels') 
                                ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                            }`}
                          >
                            <FaHotel className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-[10px] font-medium text-center">{t('header.hotels')}</span>
                          </Link>
                          
                          <Link 
                            to={getLocalizedPath("/guest/tours", i18n.language)}
                            onClick={closeMobileMenu}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                              isActive('/guest/tours') 
                                ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                            }`}
                          >
                            <FaRoute className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-[10px] font-medium text-center">{t('header.tours')}</span>
                          </Link>
                          
                          <Link 
                            to={getLocalizedPath("/packages", i18n.language)}
                            onClick={closeMobileMenu}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                              isActive('/packages') 
                                ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                            }`}
                          >
                            <FaBox className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-[10px] font-medium text-center">{t('header.packages')}</span>
                          </Link>
                          
                          <Link 
                            to={getLocalizedPath("/blog", i18n.language)}
                            onClick={closeMobileMenu}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                              isActive('/blog') || location.pathname.startsWith('/blog/')
                                ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                            }`}
                          >
                            <FaBlog className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-[10px] font-medium text-center">{t('header.blog')}</span>
                          </Link>
                          
                          <Link 
                            to={getLocalizedPath("/contact", i18n.language)}
                            onClick={closeMobileMenu}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                              isActive('/contact') 
                                ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                            }`}
                          >
                            <FaEnvelope className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-[10px] font-medium text-center">{t('header.contact')}</span>
                          </Link>
                          
                          <Link 
                            to={getLocalizedPath("/about", i18n.language)}
                            onClick={closeMobileMenu}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                              isActive('/about') 
                                ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                            }`}
                          >
                            <FaInfoCircle className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                            <span className="text-[10px] font-medium text-center">{t('header.about')}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Theme Toggle */}
                    <div className="mt-4 px-2">
                      <div className="flex justify-center">
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md">
                          <div className="transform group-hover:scale-110 transition-transform duration-200">
                            <CustomDarkModeToggle />
                          </div>
                          <span className="text-xs font-medium text-center mt-1">{getTranslation('header.theme')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Logout Button - Below Everything */}
                    <div className="mt-6 px-2">
                      <CustomButton
                        onClick={handleLogout}
                        variant="red"
                        size="lg"
                        className="w-full"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <FaLogout className="text-lg" />
                          <span>{getTranslation('header.logout')} ({user.username})</span>
                        </div>
                      </CustomButton>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 3x3 Grid for Regular Authenticated Users */}
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
                        <span className="text-xs font-medium text-center">{getTranslation('header.home')}</span>
                      </Link>
                  
                  <Link 
                    to="/bookings"
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/bookings') 
                          ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaClipboardList className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium text-center">{getTranslation('header.booking')}</span>
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
                        <span className="text-xs font-medium text-center">{getTranslation('header.vouchers')}</span>
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
                    <span className="text-xs font-medium text-center">{t('header.hotels')}</span>
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
                    <span className="text-xs font-medium text-center">{t('header.tours')}</span>
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
                      <span className="text-xs font-medium text-center">{t('header.dashboard')}</span>
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
                      <span className="text-xs font-medium text-center">{t('header.profile')}</span>
                    </Link>
                  )}
                      
                      {/* Row 3 */}
                      {(user.isAdmin || user.isAccountant) && (
                        <Link 
                          to="/payments"
                          onClick={closeMobileMenu}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                            isActive('/payments') 
                              ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                          }`}
                        >
                          <FaMoneyBillWave className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-medium text-center">{getTranslation('header.payments')}</span>
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
                        <span className="text-xs font-medium text-center">{getTranslation('header.attendance')}</span>
                      </Link>
                      
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
                          <span className="text-xs font-medium text-center">{getTranslation('header.profile')}</span>
                        </Link>
                      )}

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
                        <span className="text-xs font-medium text-center">{getTranslation('header.calendar')}</span>
                      </button>
                    </div>
                    
                    {/* Collapsible Public Pages Section */}
                    <div className="mt-4 px-2">
                  <button
                    onClick={() => setMobilePublicPagesOpen(!mobilePublicPagesOpen)}
                    className="w-full flex items-center justify-center py-2 px-4 rounded-lg transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm font-medium mr-2">{t('header.publicPages')}</span>
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
                        to={getLocalizedPath("/", i18n.language)}
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
                        to={getLocalizedPath("/guest/hotels", i18n.language)}
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
                        to={getLocalizedPath("/guest/tours", i18n.language)}
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
                        to={getLocalizedPath("/packages", i18n.language)}
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
                        to={getLocalizedPath("/blog", i18n.language)}
                        onClick={closeMobileMenu}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-300 group ${
                          isActive('/blog') || location.pathname.startsWith('/blog/')
                            ? 'text-blue-600 dark:text-teal-400 bg-blue-50 dark:bg-teal-900/20 shadow-md' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}
                      >
                        <FaBlog className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-[10px] font-medium text-center">Blog</span>
                      </Link>
                      
                      <Link 
                        to={getLocalizedPath("/contact", i18n.language)}
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
                        to={getLocalizedPath("/about", i18n.language)}
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
                    
                    {/* Theme / Language Controls */}
                    <div className="mt-4 px-2">
                      <div className="flex justify-center gap-4">
                        <div className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                          isSignInPage
                            ? 'text-white hover:bg-white/10'
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                        }`}>
                          <div className="transform group-hover:scale-110 transition-transform duration-200">
                            <CustomDarkModeToggle variant={isSignInPage ? "light" : "default"} />
                          </div>
                          <span className="text-xs font-medium text-center mt-1">{getTranslation('header.theme')}</span>
                        </div>
                        {!hideLanguageSwitcher && (
                          <div className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                            isSignInPage
                              ? 'text-white hover:bg-white/10'
                              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-blue-50/50 dark:hover:bg-teal-900/10 hover:shadow-md'
                          }`}>
                            <div className="transform group-hover:scale-110 transition-transform duration-200">
                              <LanguageSwitcher variant={isSignInPage ? "light" : "default"} />
                            </div>
                            <span className="text-xs font-medium text-center mt-1">
                              {getTranslation('header.language')}
                            </span>
                          </div>
                        )}
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
                          <span>{getTranslation('header.logout')} ({user.username})</span>
                        </div>
                      </CustomButton>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Guest Mobile Navigation - 3 Column Grid */}
                <div className="grid grid-cols-3 gap-4 px-2">
                  <Link 
                    to={getLocalizedPath("/", i18n.language)}
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
                    <span className="text-xs font-medium text-center">{getTranslation('header.home')}</span>
                  </Link>
                  
                  <Link 
                    to={getLocalizedPath("/guest/hotels", i18n.language)}
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
                    <span className="text-xs font-medium text-center">{t('header.hotels')}</span>
                  </Link>
                  
                  <Link 
                    to={getLocalizedPath("/guest/tours", i18n.language)}
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
                    <span className="text-xs font-medium text-center">{t('header.tours')}</span>
                  </Link>
                  
                  <Link 
                    to={getLocalizedPath("/packages", i18n.language)}
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
                    <span className="text-xs font-medium text-center">{t('header.packages')}</span>
                  </Link>
                  
                  <Link 
                    to={getLocalizedPath("/blog", i18n.language)}
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : isActive('/blog') || location.pathname.startsWith('/blog/')
                          ? 'text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-yellow-900/20 shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}
                  >
                    <FaBlog className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-center">{t('header.blog')}</span>
                  </Link>
                  
                  <Link 
                    to={getLocalizedPath("/contact", i18n.language)}
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
                    <span className="text-xs font-medium text-center">{t('header.contact')}</span>
                  </Link>
                  
                  <Link 
                    to={getLocalizedPath("/about", i18n.language)}
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
                    <span className="text-xs font-medium text-center">{t('header.about')}</span>
                  </Link>
                </div>
                
                {/* Theme / Language Controls for Guests */}
                <div className="mt-4 px-2">
                  <div className="flex justify-center gap-4">
                    <div className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        <CustomDarkModeToggle variant={isSignInPage ? "light" : "default"} />
                      </div>
                      <span className="text-xs font-medium text-center mt-1">{t('header.theme')}</span>
                    </div>
                    
                    <div className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 group ${
                      isSignInPage
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 hover:shadow-md'
                    }`}>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        <LanguageSwitcher variant={isSignInPage ? "light" : "default"} />
                      </div>
                      <span className="text-xs font-medium text-center mt-1">
                        {i18n.language === 'en'
                          ? 'Language'
                          : i18n.language === 'ar'
                          ? 'اللغة'
                          : i18n.language === 'fr'
                          ? 'Langue'
                          : i18n.language === 'tr'
                          ? 'Dil'
                          : 'Sprache'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Sign In Button for Guests */}
                {!isPublicPage() && (
                  <div className="mt-6 px-2">
                    <CustomButton
                      as={Link}
                      to={getLocalizedPath("/signin", i18n.language)}
                      onClick={closeMobileMenu}
                      variant="rippleBlueToYellowTeal"
                      size="lg"
                      className="w-full"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FaSignInAlt className="text-lg" />
                        <span>{t('header.signIn')}</span>
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