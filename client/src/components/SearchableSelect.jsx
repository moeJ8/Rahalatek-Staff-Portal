import React, { useState, useEffect, useRef } from 'react';
import { Label, TextInput } from 'flowbite-react';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';
import CustomScrollbar from './CustomScrollbar';
import RahalatekLoader from './RahalatekLoader';

const SearchableSelect = ({ 
  id, 
  options, 
  value, 
  onChange, 
  placeholder = "Search...",
  label,
  required = false,
  disabled = false,
  loading = false,
  variant = "default" // default or glass
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [modalEnter, setModalEnter] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
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
    setFilteredOptions(options.filter(option => 
      option && option.label && typeof option.label === 'string' && 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [searchTerm, options]);

  useEffect(() => {
    // Find and set the label for the current value
    const selectedOption = options.find(option => option.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  useEffect(() => {
    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Focus input when dropdown opens (desktop only)
  useEffect(() => {
    if (isOpen && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isOpen, isMobile]);

  const handleSelect = (option) => {
    onChange({ target: { value: option.value } });
    setIsOpen(false);
    
    if (isMobile && showMobileModal) {
      setModalEnter(false);
      setTimeout(() => setShowMobileModal(false), 300);
    } else {
      setShowMobileModal(false);
    }
    
    setSearchTerm('');
  };

  const handleMobileToggle = () => {
    if (disabled) return;
    
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

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (!disabled && !isMobile) {
      setIsOpen(true);
    }
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    if (!disabled) {
      if (isMobile) {
        // Prevent focus and keyboard on mobile
        e.target.blur();
        setShowMobileModal(true);
      } else {
        setIsOpen(true);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <div className="mb-2 block">
          <Label htmlFor={id} value={label} className={`font-medium ${
            variant === "glass" ? 'text-white text-sm' : 'text-gray-700 dark:text-gray-200'
          }`}>
            {required && <span className={variant === "glass" ? 'text-red-400 ml-1' : 'text-red-500 dark:text-red-400 ml-1'}>*</span>}
          </Label>
        </div>
      )}
      
      <div className="relative">
        <div className={`relative backdrop-blur-sm border rounded-lg transition-all duration-200 ${
          variant === "glass"
            ? `bg-white/5 ${
                required && !value ? 'border-red-400/50' : 'border-white/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-2 focus-within:ring-white/30 focus-within:border-white/40 hover:bg-white/10 hover:border-white/30'}`
            : `bg-white/80 dark:bg-gray-800/80 ${
                required && !value 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-200/50 dark:border-gray-600/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-2 focus-within:ring-blue-500/50 dark:focus-within:ring-blue-400/50 focus-within:border-blue-400 dark:focus-within:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md'}`
        }`}>
          <div className="flex items-center">
            <FaSearch className={`absolute left-3 w-4 h-4 z-10 pointer-events-none ${
              variant === "glass" ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
            }`} />
            <input
              ref={inputRef}
              id={id}
              type="text"
              placeholder={placeholder}
              value={isOpen && !isMobile ? searchTerm : selectedLabel}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onClick={handleInputClick}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              data-form-type="other"
              disabled={disabled}
              readOnly={isMobile}
              className={`w-full bg-transparent border-0 pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-0 ${
                variant === "glass"
                  ? 'text-white placeholder-white/60'
                  : 'text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            />
            <div 
              className={`absolute right-3 transition-colors duration-200 ${
                disabled 
                  ? 'cursor-not-allowed' 
                  : variant === "glass"
                    ? 'cursor-pointer hover:text-white'
                    : 'cursor-pointer hover:text-blue-500 dark:hover:text-blue-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleMobileToggle();
              }}
            >
              <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${(isOpen && !isMobile) || showMobileModal ? 'rotate-180' : ''} ${
                variant === "glass" ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
          </div>
        </div>
      </div>
      
      {isOpen && !disabled && !isMobile && (
        <div className={`absolute z-50 w-full mt-1 border rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 ${
          variant === "glass"
            ? 'backdrop-blur-3xl bg-black/60 border-white/40'
            : 'backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-600/50'
        }`}>
          <CustomScrollbar maxHeight="400px" variant={variant}>
            <div className="p-1">
              {loading ? (
                <div className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center">
                    <RahalatekLoader size="sm" />
                  </div>
                </div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`py-3 px-4 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 mx-1 my-0.5 ${
                      variant === "glass"
                        ? value === option.value 
                          ? 'bg-white/35 text-white shadow-md border border-white/30' 
                          : 'text-white hover:bg-white/20 hover:text-white'
                        : value === option.value 
                          ? 'bg-blue-500/20 dark:bg-blue-400/30 text-blue-700 dark:text-blue-300 shadow-sm' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className={`py-4 px-4 text-center text-sm font-medium ${
                  variant === "glass" ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  No results found
                </div>
              )}
            </div>
          </CustomScrollbar>
        </div>
      )}

       {/* Mobile Modal */}
       {showMobileModal && isMobile && !disabled && (
         <div 
           className={`fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 bg-black/50 ${modalEnter ? 'backdrop-blur-sm' : 'backdrop-blur-0'} transition-all duration-300`}
           onClick={(e) => {
             if (e.target === e.currentTarget) {
               setModalEnter(false);
               setTimeout(() => {
                 setShowMobileModal(false);
                 setSearchTerm('');
               }, 300);
             }
           }}
         >
           <div 
             ref={modalRef}
             className={`w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl transform transition-all duration-300 ${modalEnter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
             style={{ maxHeight: '90vh' }}
           >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-600 rounded-t-2xl px-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {label || 'Select Option'}
                  {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
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
              
              {/* Mobile Search */}
              <div className="mt-3 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              <CustomScrollbar maxHeight="60vh">
                <div className="p-2">
                  {loading ? (
                    <div className="py-8 text-center">
                      <RahalatekLoader size="sm" />
                    </div>
                  ) : filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-4 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 mb-2 ${
                          value === option.value 
                            ? 'bg-blue-500/20 dark:bg-blue-400/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-600' 
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                        }`}
                        onClick={() => handleSelect(option)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {value === option.value && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-gray-500 dark:text-gray-400 text-center text-sm font-medium">
                      No results found
                    </div>
                  )}
                </div>
              </CustomScrollbar>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect; 