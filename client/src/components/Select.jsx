import React, { useState, useEffect, useRef } from 'react';
import { Label } from 'flowbite-react';
import { FaChevronDown } from 'react-icons/fa';
import CustomScrollbar from './CustomScrollbar';

const Select = ({ 
  id, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option...",
  label,
  required = false,
  disabled = false,
  className = "",
  variant = "default", // default or glass
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const dropdownRef = useRef(null);

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
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    if (disabled) return;
    
    onChange(option.value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        // Handle arrow navigation through options
        const currentIndex = options.findIndex(option => option.value === value);
        let nextIndex;
        
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        }
        
        if (options[nextIndex]) {
          onChange(options[nextIndex].value);
        }
      }
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
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
              } focus-within:ring-2 focus-within:ring-white/30 focus-within:border-white/40 hover:bg-white/10 hover:border-white/30`
            : `bg-white/80 dark:bg-gray-800/80 ${
                required && !value 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-200/50 dark:border-gray-600/50'
              } focus-within:ring-2 focus-within:ring-blue-500/50 dark:focus-within:ring-blue-400/50 focus-within:border-blue-400 dark:focus-within:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md`
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <div className="flex items-center">
            <button
              type="button"
              id={id}
              className={`w-full bg-transparent border-0 pl-4 pr-10 py-3 text-left text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer ${
                variant === "glass"
                  ? 'text-white placeholder-white/60'
                  : 'text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400'
              }`}
              onClick={handleToggle}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              {...props}
            >
              <span className={`block truncate ${
                selectedLabel 
                  ? (variant === "glass" ? 'text-white' : 'text-gray-800 dark:text-gray-200')
                  : (variant === "glass" ? 'text-white/60' : 'text-gray-500 dark:text-gray-400')
              }`}>
                {selectedLabel || placeholder}
              </span>
            </button>
            <div 
              className={`absolute right-3 cursor-pointer transition-colors duration-200 ${
                variant === "glass"
                  ? 'hover:text-white'
                  : 'hover:text-blue-500 dark:hover:text-blue-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) handleToggle();
              }}
            >
              <FaChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
                variant === "glass" ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className={`absolute z-50 w-full mt-1 border rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 ${
          variant === "glass"
            ? 'backdrop-blur-3xl bg-black/60 border-white/40'
            : 'backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-600/50'
        }`}>
          <CustomScrollbar maxHeight="400px" variant={variant}>
            <div className="p-1">
              {options.length > 0 ? (
                options.map((option) => (
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
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className={`py-4 px-4 text-center text-sm font-medium ${
                  variant === "glass" ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  No options available
                </div>
              )}
            </div>
          </CustomScrollbar>
        </div>
      )}
    </div>
  );
};

export default Select; 