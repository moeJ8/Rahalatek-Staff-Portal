import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CustomScrollbar from './CustomScrollbar';
import { useTranslation } from 'react-i18next';

const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  className = "",
  maxWidth = "md:max-w-lg",
  maxHeight = "max-h-[85vh]",
  zIndex = 9998
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [modalEnter, setModalEnter] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setModalEnter(true), 50);
    } else {
      setModalEnter(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setModalEnter(false);
    setTimeout(() => onClose(), 300);
  };



  if (!isOpen) return null;

  const modalContent = (
    <div className={`fixed top-0 right-0 left-0 h-screen overflow-y-auto overflow-x-hidden md:inset-0 ${modalEnter ? 'backdrop-blur-md' : 'backdrop-blur-0'} transition-all duration-300 flex items-center justify-center bg-gray-900 bg-opacity-50`} style={{ zIndex }}>
      <div className={`relative w-full p-4 max-w-md ${maxWidth} ${className}`}>
        <div className={`relative rounded-lg bg-white shadow dark:bg-slate-900 flex flex-col ${maxHeight} transform transition-all duration-300 overflow-visible ${modalEnter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Header */}
          <div className={`flex items-start p-3 sm:p-4 border-b rounded-t dark:border-gray-600 ${isRTL ? 'flex-row-reverse' : 'justify-between'}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              className={`text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white ${isRTL ? 'mr-auto' : 'ml-auto'}`}
              onClick={handleClose}
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-hidden">
            <CustomScrollbar className="h-full">
              <div className="p-4 space-y-4">
                {children}
              </div>
            </CustomScrollbar>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root level
  return createPortal(modalContent, document.body);
};

export default CustomModal;
