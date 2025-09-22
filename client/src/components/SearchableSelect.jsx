import React, { useState, useEffect, useRef } from 'react';
import { Label, TextInput } from 'flowbite-react';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
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
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedLabel, setSelectedLabel] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(options.filter(option => 
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

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange({ target: { value: option.value } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(true);
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
          <Label htmlFor={id} value={label} className="text-gray-700 dark:text-gray-200 font-medium">
            {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
          </Label>
        </div>
      )}
      
      <div className="relative">
        <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${
          required && !value 
            ? 'border-red-300 dark:border-red-600' 
            : 'border-gray-200/50 dark:border-gray-600/50'
        } rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-2 focus-within:ring-blue-500/50 dark:focus-within:ring-blue-400/50 focus-within:border-blue-400 dark:focus-within:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md'} transition-all duration-200`}>
          <div className="flex items-center">
            <FaSearch className="absolute left-3 text-gray-500 dark:text-gray-400 w-4 h-4 z-10 pointer-events-none" />
            <input
              ref={inputRef}
              id={id}
              type="text"
              placeholder={placeholder}
              value={isOpen ? searchTerm : selectedLabel}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onClick={handleInputClick}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoFill="off"
              data-form-type="other"
              disabled={disabled}
              className={`w-full bg-transparent border-0 pl-10 pr-10 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            />
            <div 
              className={`absolute right-3 transition-colors duration-200 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-blue-500 dark:hover:text-blue-400'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  setIsOpen(!isOpen);
                }
              }}
            >
              <FaChevronDown className={`text-gray-500 dark:text-gray-400 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
          <CustomScrollbar maxHeight="400px">
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
                      value === option.value 
                        ? 'bg-blue-500/20 dark:bg-blue-400/30 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </div>
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
    </div>
  );
};

export default SearchableSelect; 