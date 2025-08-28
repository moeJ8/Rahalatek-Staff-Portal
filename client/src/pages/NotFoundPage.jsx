import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import CustomButton from '../components/CustomButton';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4 py-8">
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
            <FaExclamationTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none mx-auto">
          <Link to="/" className="w-full sm:w-auto">
            <CustomButton
              variant="blue"
              size="lg"
              icon={FaHome}
              className="w-full px-6 py-3"
            >
              Back to Home
            </CustomButton>
          </Link>
          
          <Link to="/vouchers" className="w-full sm:w-auto">
            <CustomButton
              variant="teal"
              size="lg"
              icon={FaSearch}
              className="w-full px-6 py-3"
            >
              Browse Vouchers
            </CustomButton>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, please{' '}
            <Link 
              to="/profile" 
              className="text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-300 font-medium transition-colors"
            >
              contact support
            </Link>
            {' '}or try refreshing the page.
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
