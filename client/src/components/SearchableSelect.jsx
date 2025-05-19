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
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange({ target: { value: option.value } });
    setIsOpen(false);
    setSearchTerm('');
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
      
      <div 
        className={`flex items-center cursor-pointer border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 p-2 relative ${required && !value ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-grow truncate text-gray-800 dark:text-gray-200">
          {selectedLabel || <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
        </div>
        <FaChevronDown className="text-gray-400 dark:text-gray-400 ml-2" />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-700 p-2 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <TextInput
                type="text"
                className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                icon={FaSearch}
              />
            </div>
          </div>
          
          <CustomScrollbar maxHeight="250px">
            <div>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 ${
                      value === option.value ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : ''
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 dark:text-gray-400 text-center">
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