import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHome, FaSearch, FaExclamationTriangle, FaBuilding, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function GuestNotFoundPage({ 
  title,
  description,
  type = "page" // "hotel", "voucher", "page", etc.
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const getTypeSpecificContent = () => {
    switch (type) {
      case 'hotel':
        return {
          title: t('notFound.hotel.title'),
          description: t('notFound.hotel.description'),
          icon: FaBuilding
        };
      case 'voucher':
        return {
          title: t('notFound.voucher.title'), 
          description: t('notFound.voucher.description'),
          icon: FaSearch
        };
      default:
        return {
          title: title || t('notFound.page.title'),
          description: description || t('notFound.page.description'),
          icon: FaExclamationTriangle
        };
    }
  };

  const content = getTypeSpecificContent();
  const IconComponent = content.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/" className="transition-transform duration-300 hover:scale-105">
            <img 
              src="/Logolight.png" 
              alt="Rahalatek Logo" 
              className="h-20 w-auto sm:h-24 lg:h-28 dark:hidden cursor-pointer"
            />
            <img 
              src="/logodark.png" 
              alt="Rahalatek Logo" 
              className="h-20 w-auto sm:h-24 lg:h-28 hidden dark:block cursor-pointer"
            />
          </Link>
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-8xl sm:text-9xl lg:text-[12rem] font-bold text-gray-200 dark:text-slate-800 leading-none select-none">
            404
          </h1>
        </div>

        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {content.title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isRTL ? 'space-x-reverse' : ''}`}>
          <div className="w-full sm:w-auto">
            <Link
              to="/"
              className={`relative text-white bg-blue-600 border-0 shadow-lg overflow-hidden rounded-md px-6 py-3 text-base font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} hover:from-blue-700 hover:to-teal-600`}
            >
              <FaHome className="w-4 h-4" />
              {t('notFound.buttons.backToHome')}
            </Link>
          </div>
          <div className="w-full sm:w-auto">
            <Link
              to="/guest/hotels"
              className={`relative text-white bg-teal-500 border-0 shadow-lg overflow-hidden rounded-md px-6 py-3 text-base font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} hover:bg-teal-600`}
            >
              <FaBuilding className="w-4 h-4" />
              {t('notFound.buttons.browseHotels')}
            </Link>
          </div>
          <div className="w-full sm:w-auto">
            <Link
              to="/guest/tours"
              className={`relative text-white bg-gray-800 border-0 shadow-lg overflow-hidden rounded-md px-6 py-3 text-base font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} hover:bg-green-600`}
            >
              <FaMapMarkerAlt className="w-4 h-4" />
              {t('notFound.buttons.browseTours')}
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('notFound.helpText')}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-10 dark:opacity-5">
          <div className="w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 dark:opacity-5">
          <div className="w-32 h-32 bg-teal-500 rounded-full blur-xl"></div>
        </div>
        <div className="absolute top-1/2 left-5 opacity-10 dark:opacity-5">
          <div className="w-16 h-16 bg-purple-500 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  );
}
