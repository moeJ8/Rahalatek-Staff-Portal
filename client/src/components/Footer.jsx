import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { shouldHideLanguageSwitcher } from '../utils/pageUtils';
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaYoutube,
  FaFacebook,
  FaEnvelope, 
  FaPhone,
  FaMapMarkerAlt,
  FaHotel,
  FaRoute,
  FaBox,
  FaBlog,
  FaInfoCircle,
  FaTicketAlt,
  FaClipboardList,
  FaHome,
  FaChartLine
} from 'react-icons/fa';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const currentYear = new Date().getFullYear();
  const [user, setUser] = useState(null);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const location = useLocation();
  
  // Check if we're on the About Us page
  const isAboutPage = location.pathname === '/about';
  
  // Check if we're on a protected/auth page
  const isAuthenticated = !!user;
  const hideLanguageSwitcher = shouldHideLanguageSwitcher(location.pathname, isAuthenticated);
  
  // Force English translations for protected/auth pages
  const getTranslation = (key) => {
    if (hideLanguageSwitcher) {
      // Force English translations for protected/auth pages
      const englishTranslations = {
        'footer.companyDescription': 'Your trusted partner for unforgettable travel experiences. We specialize in creating personalized tours and hotel bookings across Turkey and Southeast Asia.',
        'footer.istanbul': 'Istanbul, Turkey',
        'footer.quickAccess': 'Quick Access',
        'footer.explore': 'Explore',
        'footer.home': 'Home',
        'footer.booking': 'Booking',
        'footer.vouchers': 'Vouchers',
        'footer.dashboard': 'Dashboard',
        'footer.hotels': 'Hotels',
        'footer.tours': 'Tours',
        'footer.packages': 'Packages',
        'footer.blog': 'Blog',
        'footer.topDestinations': 'Top Destinations',
        'footer.turkey': 'Turkey',
        'footer.malaysia': 'Malaysia',
        'footer.thailand': 'Thailand',
        'footer.indonesia': 'Indonesia',
        'footer.company': 'Company',
        'footer.aboutUs': 'About Us',
        'footer.contactUs': 'Contact Us',
        'footer.social': 'Follow Us',
        'footer.copyright': 'Rahalatek. All rights reserved.',
        'footer.privacyPolicy': 'Privacy Policy',
        'footer.termsOfService': 'Terms of Service',
        'footer.support': 'Support'
      };
      return englishTranslations[key] || key;
    }
    return t(key);
  };

  useEffect(() => {
    const checkAuth = () => {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  // Determine color scheme based on user authentication
  const getLinkClasses = () => {
    if (user) {
      // Authenticated: Blue/Teal
      return "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400 transition-colors duration-200";
    } else {
      // Guest: Blue/Yellow
      return "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors duration-200";
    }
  };


  const getHeadingClasses = () => {
    if (user) {
      return "text-gray-900 dark:text-white font-semibold mb-4 text-lg";
    } else {
      return "text-gray-900 dark:text-white font-semibold mb-4 text-lg";
    }
  };

  const getDividerClasses = () => {
    if (user) {
      return "border-gray-200 dark:border-gray-800";
    } else {
      return "border-gray-200 dark:border-gray-800";
    }
  };
  
  // Force LTR layout for protected/auth pages
  const footerDirection = hideLanguageSwitcher ? 'ltr' : (isRTL ? 'rtl' : 'ltr');
  
  return (
    <footer className={`bg-gray-25 dark:bg-slate-950 shadow-inner mt-auto transition-all duration-300 border-t border-gray-200 dark:border-gray-800 ${isAboutPage ? 'mt-0' : 'mt-8 md:mt-12'}`} dir={footerDirection}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12 ml-0 md:ml-8 lg:ml-24">
          
          {/* Company Info Section */}
          <div className="space-y-4 col-span-2 lg:col-span-1">
            <Link to={user ? (user.isPublisher ? "/dashboard" : "/home") : "/"} className="inline-block">
              <img 
                src={darkMode ? "/logodark.png" : "/Logolight.png"}
                alt="Rahalatek Logo" 
                className="h-12 object-contain"
                loading="lazy"
              />
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {getTranslation('footer.companyDescription')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <a 
                href="tel:+905010684657"
                className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}
              >
                <FaPhone className="text-xs" />
                <span dir="ltr">+90 501 068 46 57</span>
              </a>
              <a 
                href="mailto:info@rahalatek.com"
                className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}
              >
                <FaEnvelope className="text-xs" />
                <span dir="ltr">info@rahalatek.com</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaMapMarkerAlt className="text-xs mt-1 flex-shrink-0" />
                <span>{getTranslation('footer.istanbul')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className={getHeadingClasses()}>
              {user ? getTranslation('footer.quickAccess') : getTranslation('footer.explore')}
            </h3>
            <ul className="space-y-3">
              {user ? (
                <>
                  {!user.isPublisher && (
                    <>
                      <li>
                        <Link to="/home" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                          <FaHome className="text-xs" />
                          <span>{getTranslation('footer.home')}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/booking" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                          <FaClipboardList className="text-xs" />
                          <span>{getTranslation('footer.booking')}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/vouchers" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                          <FaTicketAlt className="text-xs" />
                          <span>{getTranslation('footer.vouchers')}</span>
                        </Link>
                      </li>
                    </>
                  )}
                  {(user.isAdmin || user.isAccountant || user.isContentManager || user.isPublisher) && (
                    <li>
                      <Link to="/dashboard" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                        <FaChartLine className="text-xs" />
                        <span>{getTranslation('footer.dashboard')}</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/hotels" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                      <FaHotel className="text-xs" />
                      <span>{getTranslation('footer.hotels')}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/tours" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                      <FaRoute className="text-xs" />
                      <span>{getTranslation('footer.tours')}</span>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                      <FaHome className="text-xs" />
                      <span>{t('footer.home')}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/guest/hotels" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                      <FaHotel className="text-xs" />
                      <span>{getTranslation('footer.hotels')}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/guest/tours" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                      <FaRoute className="text-xs" />
                      <span>{getTranslation('footer.tours')}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/packages" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                      <FaBox className="text-xs" />
                      <span>{getTranslation('footer.packages')}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                      <FaBlog className="text-xs" />
                      <span>{getTranslation('footer.blog')}</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Destinations Section - Only for guests */}
          {!user && (
            <div>
              <h3 className={getHeadingClasses()}>{getTranslation('footer.topDestinations')}</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/country/Turkey" className={`text-sm ${getLinkClasses()}`}>
                    {getTranslation('footer.turkey')}
                  </Link>
                </li>
                <li>
                  <Link to="/country/Malaysia" className={`text-sm ${getLinkClasses()}`}>
                    {getTranslation('footer.malaysia')}
                  </Link>
                </li>
                <li>
                  <Link to="/country/Thailand" className={`text-sm ${getLinkClasses()}`}>
                    {getTranslation('footer.thailand')}
                  </Link>
                </li>
                <li>
                  <Link to="/country/Indonesia" className={`text-sm ${getLinkClasses()}`}>
                    {getTranslation('footer.indonesia')}
                  </Link>
                </li>
                <li>
                </li>
              </ul>
            </div>
          )}

          {/* Company Section */}
          <div>
            <h3 className={getHeadingClasses()}>{getTranslation('footer.company')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                  <FaInfoCircle className="text-xs" />
                  <span>{getTranslation('footer.aboutUs')}</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`flex items-center gap-2 text-sm ${getLinkClasses()}`}>
                  <FaEnvelope className="text-xs" />
                  <span>{getTranslation('footer.contactUs')}</span>
                </Link>
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="mt-6">
              <h4 className="text-gray-900 dark:text-white font-medium mb-3 text-sm">{getTranslation('footer.social')}</h4>
              <div className="flex gap-2.5">
                <a 
                  href="https://www.facebook.com/rahalatek" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#0C63D4] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  aria-label="Facebook"
                >
                  <FaFacebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.instagram.com/rahalatek_/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] hover:from-[#6B2C94] hover:via-[#C1276C] hover:to-[#D7673F] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://wa.me/905010684657" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#1FAD56] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.youtube.com/@rahalatek" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#FF0000] hover:bg-[#CC0000] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  aria-label="YouTube"
                >
                  <FaYoutube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className={`border-t ${getDividerClasses()} my-8`}></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 ml-0 md:ml-8 lg:ml-24">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
            <p>&copy; {currentYear} {getTranslation('footer.copyright')}</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-sm mr-0 md:mr-8 lg:mr-10">
            <Link to="/about" className={getLinkClasses()}>
              {getTranslation('footer.privacyPolicy')}
            </Link>
            <Link to="/about" className={getLinkClasses()}>
              {getTranslation('footer.termsOfService')}
            </Link>
            <Link to="/contact" className={getLinkClasses()}>
              {getTranslation('footer.support')}
            </Link>
          </div>
        </div>     
      </div>
    </footer>
  );
} 