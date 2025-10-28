import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import { FaGlobe, FaTimes } from 'react-icons/fa';

export default function LanguageSwitcher({ variant = 'default' }) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLanguage = i18n.language;
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [modalEnter, setModalEnter] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only set the lang attribute for accessibility, not dir
    if (currentLanguage === 'ar') {
      document.documentElement.setAttribute('lang', 'ar');
    } else if (currentLanguage === 'fr') {
      document.documentElement.setAttribute('lang', 'fr');
    } else if (currentLanguage === 'tr') {
      document.documentElement.setAttribute('lang', 'tr');
    } else if (currentLanguage === 'de') {
      document.documentElement.setAttribute('lang', 'de');
    } else {
      document.documentElement.setAttribute('lang', 'en');
    }
  }, [currentLanguage]);

  // Handle modal animations
  useEffect(() => {
    if (showMobileModal) {
      setTimeout(() => setModalEnter(true), 50);
    } else {
      setModalEnter(false);
    }
  }, [showMobileModal]);

  // Prevent body scroll when mobile modal is open
  useEffect(() => {
    if (showMobileModal && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileModal, isMobile]);

  // Detect language from URL and sync with i18n
  useEffect(() => {
    const urlPath = location.pathname;
    const urlLangMatch = urlPath.match(/^\/(ar|fr)/);

    if (urlLangMatch) {
      const urlLang = urlLangMatch[1];
      // Only change i18n language if it doesn't match the URL language
      if (i18n.language !== urlLang) {
        i18n.changeLanguage(urlLang);
      }
    } else {
      // No language prefix in URL, ensure we're using English
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en');
      }
    }
  }, [location.pathname, i18n]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang) => {
    // Update i18n language
    i18n.changeLanguage(lang);
    
    // Update URL based on current page
    const path = location.pathname;
    let newPath = path;
    
    // Remove existing language prefix if present
    const pathWithoutLang = path.replace(/^\/(ar|fr)/, '') || '/';
    
    // Check if we're on a protected/authenticated page (don't add language prefix)
    const isProtectedPage = path.startsWith('/dashboard') || 
                            path.startsWith('/home') || 
                            path.startsWith('/booking') ||
                            path.startsWith('/vouchers') ||
                            path.startsWith('/profile') ||
                            path.startsWith('/tours') && !path.includes('/tours/') ||
                            path.startsWith('/hotels') && !path.includes('/hotels/') ||
                            path.startsWith('/attendance') ||
                            path === '/signin' ||
                            path === '/verify-email';
    
    // Only add language prefix for public pages
    if (!isProtectedPage) {
      if (lang === 'ar' || lang === 'fr') {
        newPath = `/${lang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
      } else {
        newPath = pathWithoutLang;
      }
    }
    
    // Only navigate if the path changed
    if (newPath !== path) {
      navigate(newPath, { replace: true });
    }
    
    setIsOpen(false);
    
    if (isMobile && showMobileModal) {
      setModalEnter(false);
      setTimeout(() => setShowMobileModal(false), 300);
    } else {
      setShowMobileModal(false);
    }
  };

  const handleMobileToggle = () => {
    if (isMobile) {
      if (showMobileModal) {
        // Close with animation
        setModalEnter(false);
        setTimeout(() => setShowMobileModal(false), 300);
      } else {
        setShowMobileModal(true);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Variant styles for sign-in page
  const isLightVariant = variant === 'light';

  const allLanguages = [
    { code: 'en', name: 'English', flagCode: 'GB' },
    { code: 'ar', name: 'العربية', flagCode: 'SA' },
    { code: 'fr', name: 'Français', flagCode: 'FR' },
    { code: 'tr', name: 'Türkçe', flagCode: 'TR' }, // Hidden for future support
    { code: 'de', name: 'Deutsch', flagCode: 'DE' } // Hidden for future support
  ];

  // Filter to only show visible languages (en, ar, fr)
  const visibleLanguages = ['en', 'ar', 'fr'];
  const languages = allLanguages.filter(lang => visibleLanguages.includes(lang.code));

  const currentLangData = allLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Language Button - Matching Theme Toggle Design */}
      <button
        onClick={handleMobileToggle}
        className={`p-2 rounded-lg focus:outline-none transition-all duration-200 hover:scale-110 group ${
          isLightVariant 
            ? "text-white hover:bg-white/10" 
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title={currentLanguage === 'en' ? 'Switch Language' : currentLanguage === 'ar' ? 'تغيير اللغة' : currentLanguage === 'fr' ? 'Changer de langue' : currentLanguage === 'tr' ? 'Dil Değiştir' : 'Sprache wechseln'}
      >
        <Flag 
          code={currentLangData?.flagCode} 
          className="w-5 h-5 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
          fallback={<FaGlobe className="w-5 h-5" />}
        />
      </button>

      {/* Desktop Dropdown Menu */}
      {isOpen && !isMobile && (
        <div className={`absolute ${currentLanguage === 'ar' ? 'left-0' : 'right-0'} mt-3 w-40 rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-200 ease-in-out origin-top ${
          isLightVariant
            ? 'bg-white/95 backdrop-blur-xl border border-white/20'
            : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50'
        }`}>
          <div className="p-2 space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  currentLanguage === lang.code
                    ? isLightVariant
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : isLightVariant
                      ? 'text-gray-700 hover:bg-gray-50'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
                title={lang.name}
              >
                <Flag 
                  code={lang.flagCode} 
                  className={`w-5 h-5 rounded-full object-cover shadow-sm transition-all duration-200 flex-shrink-0 ${
                    currentLanguage === lang.code 
                      ? 'ring-2 ring-blue-500 dark:ring-yellow-400' 
                      : 'group-hover:scale-110 group-hover:rotate-3'
                  }`}
                  fallback={<FaGlobe className="w-4 h-4" />}
                />
                <span className="font-medium text-sm flex-1 text-left truncate">
                  {lang.name}
                </span>
                {currentLanguage === lang.code && (
                  <svg 
                    className="w-4 h-4 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Modal - Portal to body */}
      {showMobileModal && isMobile && createPortal(
        <div 
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 ${modalEnter ? 'backdrop-blur-sm' : 'backdrop-blur-0'} transition-all duration-300`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalEnter(false);
              setTimeout(() => {
                setShowMobileModal(false);
              }, 300);
            }
          }}
        >
          <div 
            ref={modalRef}
            className={`w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl transform transition-all duration-300 ${modalEnter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ maxHeight: '80vh' }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-600 rounded-t-2xl px-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentLanguage === 'en' ? 'Select Language' : currentLanguage === 'ar' ? 'اختر اللغة' : currentLanguage === 'fr' ? 'Sélectionner la langue' : currentLanguage === 'tr' ? 'Dil Seç' : 'Sprache wählen'}
                </h3>
                <button
                  onClick={() => {
                    setModalEnter(false);
                    setTimeout(() => setShowMobileModal(false), 300);
                  }}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              <div className="p-2">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className={`p-4 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 mb-2 ${
                      currentLanguage === lang.code 
                        ? 'bg-blue-500/20 dark:bg-blue-400/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                    }`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Flag 
                          code={lang.flagCode} 
                          className="w-6 h-6 rounded-full object-cover shadow-sm flex-shrink-0"
                          fallback={<FaGlobe className="w-4 h-4" />}
                        />
                        <span>{lang.name}</span>
                      </div>
                      {currentLanguage === lang.code && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}