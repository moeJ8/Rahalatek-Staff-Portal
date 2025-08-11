import React, { useState, useRef } from 'react';
import { Label } from 'flowbite-react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const Search = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "Search...",
  label,
  required = false,
  disabled = false,
  className = "",
  onClear,
  showClearButton = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      // Create synthetic event for clearing
      const syntheticEvent = {
        target: { value: '' }
      };
      onChange(syntheticEvent);
    }
    
    // Focus back to input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (value) {
        handleClear();
      } else {
        inputRef.current?.blur();
      }
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <div className="mb-2 block">
          <Label htmlFor={id} value={label} className="text-gray-700 dark:text-gray-200 font-medium">
            {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
          </Label>
        </div>
      )}
      
      <div className="relative">
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${
          required && !value 
            ? 'border-red-300 dark:border-red-600' 
            : isFocused
            ? 'border-blue-400 dark:border-blue-500'
            : 'border-gray-200/50 dark:border-gray-600/50'
        } rounded-lg ${
          isFocused 
            ? 'ring-2 ring-blue-500/50 dark:ring-blue-400/50' 
            : ''
        } shadow-sm transition-all duration-200 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-100/80 dark:bg-gray-700/80' 
            : 'hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md'
        }`}>
          <div className="flex items-center">
            <FaSearch className="absolute left-3 text-gray-500 dark:text-gray-400 w-4 h-4 z-10 pointer-events-none" />
            <input
              ref={inputRef}
              id={id}
              type="text"
              value={value || ''}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className={`w-full bg-transparent border-0 pl-10 ${
                value && showClearButton ? 'pr-10' : 'pr-4'
              } py-3 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0`}
              {...props}
            />
            {value && showClearButton && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
                tabIndex={-1}
              >
                <FaTimes className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 