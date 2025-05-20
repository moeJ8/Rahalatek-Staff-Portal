import React, { useState, useEffect, useRef } from 'react';
import { Label, TextInput } from 'flowbite-react';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import CustomScrollbar from './CustomScrollbar';

const SearchableSelect = ({ 
  id, 
  options, 
  value, 
  onChange, 
  placeholder = "Search...",
  label,
  required = false
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
    setIsOpen(true);
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    setIsOpen(true);
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
          <Label htmlFor={id} value={label} className="dark:text-white">
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
      )}
      
      <div className={`relative ${required && !value ? 'has-error' : ''}`}>
        <TextInput
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={isOpen ? searchTerm : selectedLabel}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          className={`w-full cursor-pointer pr-8 ${required && !value ? 'border-red-500 dark:border-red-400' : ''}`}
          icon={FaSearch}
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaChevronDown className={`text-gray-400 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <CustomScrollbar maxHeight="400px">
            <div>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`py-1.5 px-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 text-sm ${
                      value === option.value ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : ''
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="py-2 px-3 text-gray-500 dark:text-gray-400 text-center text-sm">
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