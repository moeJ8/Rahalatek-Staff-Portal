import React, { useState, useEffect, useRef } from 'react';
import { Label } from 'flowbite-react';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';
import CustomScrollbar from './CustomScrollbar';
import RahalatekLoader from './RahalatekLoader';

const CheckBoxDropDown = ({ 
    label,
    options = [],
    value = [],
    onChange,
    placeholder = "Select options...",
    allowMultiple = true,
    allOptionsLabel = "All Options",
    allowEmpty = false,
    className = "",
    id,
    disabled = false,
    searchable = false,
    loading = false,
    ...props 
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
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

    // Filter options based on search term
    useEffect(() => {
        if (searchable) {
            setFilteredOptions(options.filter(option => 
                option && option.label && typeof option.label === 'string' && 
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        } else {
            setFilteredOptions(options);
        }
    }, [searchTerm, options, searchable]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    // Focus input when dropdown opens (desktop only, searchable only)
    useEffect(() => {
        if (searchable && showDropdown && inputRef.current && !isMobile) {
            inputRef.current.focus();
        }
    }, [showDropdown, isMobile, searchable]);

    const handleToggle = (optionValue) => {
        if (!allowMultiple) {
            // Single select mode
            onChange([optionValue]);
            setShowDropdown(false);
            
            if (isMobile && showMobileModal) {
                setModalEnter(false);
                setTimeout(() => setShowMobileModal(false), 300);
            }
            return;
        }

        // Multiple select mode
        let newValues;
        if (optionValue === '') {
            // "All Options" selected - clear all selections
            newValues = [''];
        } else {
            // Toggle individual option
            const currentValues = value.filter(v => v !== ''); // Remove "All Options" if present
            if (currentValues.includes(optionValue)) {
                newValues = currentValues.filter(v => v !== optionValue);
                if (newValues.length === 0 && !allowEmpty) newValues = ['']; // Default to "All Options" if none selected and allowEmpty is false
            } else {
                newValues = [...currentValues, optionValue];
            }
        }
        onChange(newValues);
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
            setShowDropdown(!showDropdown);
        }
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputClick = (e) => {
        e.stopPropagation();
        if (!disabled) {
            if (isMobile) {
                // Prevent focus and keyboard on mobile
                e.target.blur();
                setShowMobileModal(true);
            } else {
                setShowDropdown(true);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowDropdown(false);
            setSearchTerm('');
            if (showMobileModal) {
                setModalEnter(false);
                setTimeout(() => setShowMobileModal(false), 300);
            }
        }
    };

    const getDisplayText = () => {
        if (value.includes('')) {
            return allOptionsLabel;
        }
        if (value.length === 0) {
            return placeholder;
        }
        
        // Get selected option labels
        const selectedLabels = value
            .map(val => options.find(opt => opt.value === val)?.label)
            .filter(Boolean);
            
        if (selectedLabels.length === 0) {
            return placeholder;
        }
        
        if (selectedLabels.length === 1) {
            return selectedLabels[0];
        }
        
        if (selectedLabels.length <= 3) {
            // Show all names if 3 or fewer
            return selectedLabels.join(', ');
        } else {
            // Show first 2 names + count for more than 3
            return `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2} more`;
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && <Label htmlFor={id} value={label} className="mb-2" />}
            <div className="relative checkbox-dropdown">
                {searchable ? (
                    <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-2 focus-within:ring-blue-500/50 dark:focus-within:ring-blue-400/50 focus-within:border-blue-400 dark:focus-within:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md'} transition-all duration-200`}>
                        <div className="flex items-center">
                            <FaSearch className="absolute left-3 text-gray-500 dark:text-gray-400 w-4 h-4 z-10 pointer-events-none" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={placeholder}
                                value={showDropdown && !isMobile ? searchTerm : getDisplayText()}
                                onChange={handleInputChange}
                                onClick={handleInputClick}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                                data-form-type="other"
                                disabled={disabled}
                                readOnly={isMobile}
                                className={`w-full bg-transparent border-0 pl-10 pr-10 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                            <div 
                                className={`absolute right-3 transition-colors duration-200 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-blue-500 dark:hover:text-blue-400'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMobileToggle();
                                }}
                            >
                                <FaChevronDown className={`text-gray-500 dark:text-gray-400 w-4 h-4 transition-transform duration-200 ${(showDropdown && !isMobile) || showMobileModal ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        id={id}
                        className={`w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus-within:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 flex items-center justify-between shadow-sm transition-all duration-200 ${
                            disabled 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md cursor-pointer'
                        }`}
                        onClick={() => !disabled && handleMobileToggle()}
                        disabled={disabled}
                        {...props}
                    >
                        <span className="text-gray-800 dark:text-gray-200 font-medium text-sm truncate">
                            {getDisplayText()}
                        </span>
                        <FaChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${(showDropdown && !isMobile) || showMobileModal ? 'rotate-180' : ''}`} />
                    </button>
                )}
                
                {showDropdown && !disabled && !isMobile && (
                    <div className="absolute z-10 w-full mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                        <CustomScrollbar maxHeight="240px">
                            <div className="p-1">
                                {loading ? (
                                    <div className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <RahalatekLoader size="sm" />
                                        </div>
                                    </div>
                                ) : filteredOptions.length > 0 ? (
                                    filteredOptions.map(option => (
                                        <label key={option.value} className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 rounded-lg mx-1 my-0.5 ${
                                            value.includes(option.value)
                                                ? 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30'
                                                : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                                        }`}>
                                            <div className="relative mr-3">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={value.includes(option.value)}
                                                    onChange={() => handleToggle(option.value)}
                                                />
                                                <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 ${
                                                    value.includes(option.value)
                                                        ? 'bg-blue-500/20 dark:bg-blue-400/30 border-blue-500 dark:border-blue-400 shadow-sm'
                                                        : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                                } backdrop-blur-sm`}>
                                                    {value.includes(option.value) && (
                                                        <svg className="w-3 h-3 text-blue-600 dark:text-blue-400 m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-sm font-medium select-none flex-1 ${
                                                value.includes(option.value)
                                                    ? 'text-blue-700 dark:text-blue-300'
                                                    : 'text-gray-700 dark:text-gray-200'
                                            }`}>{option.label}</span>
                                            {value.includes(option.value) && (
                                                <div className="ml-2 flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                                </div>
                                            )}
                                        </label>
                                    ))
                                ) : (
                                    <div className="py-4 px-4 text-gray-500 dark:text-gray-400 text-center text-sm font-medium">
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
                                        {label || 'Select Options'}
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
                                {searchable && (
                                    <div className="mt-3 relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search options..."
                                            value={searchTerm}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            autoFocus
                                        />
                                    </div>
                                )}
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
                                            filteredOptions.map(option => (
                                                <label key={option.value} className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                                                    value.includes(option.value)
                                                        ? 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 active:bg-blue-200/50 dark:active:bg-blue-900/40'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                                                }`}>
                                                    <div className="relative mr-3">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={value.includes(option.value)}
                                                            onChange={() => handleToggle(option.value)}
                                                        />
                                                        <div className={`w-6 h-6 rounded-md border-2 transition-all duration-200 ${
                                                            value.includes(option.value)
                                                                ? 'bg-blue-500/20 dark:bg-blue-400/30 border-blue-500 dark:border-blue-400 shadow-sm'
                                                                : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                                                        } backdrop-blur-sm`}>
                                                            {value.includes(option.value) && (
                                                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm font-medium select-none flex-1 ${
                                                        value.includes(option.value)
                                                            ? 'text-blue-700 dark:text-blue-300'
                                                            : 'text-gray-700 dark:text-gray-200'
                                                    }`}>{option.label}</span>
                                                    {value.includes(option.value) && (
                                                        <div className="ml-2 flex-shrink-0">
                                                            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                                        </div>
                                                    )}
                                                </label>
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
        </div>
    );
};

export default CheckBoxDropDown; 