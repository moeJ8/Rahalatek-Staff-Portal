import React, { useState, useEffect } from 'react';
import { Label } from 'flowbite-react';
import CustomScrollbar from './CustomScrollbar';

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
    ...props 
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.checkbox-dropdown')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (optionValue) => {
        if (!allowMultiple) {
            // Single select mode
            onChange([optionValue]);
            setShowDropdown(false);
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

    const getDisplayText = () => {
        if (value.includes('')) {
            return allOptionsLabel;
        }
        if (value.length === 0) {
            return placeholder;
        }
        if (value.length === 1) {
            return options.find(opt => opt.value === value[0])?.label || placeholder;
        }
        
        // Show selected option names instead of count
        const selectedLabels = value
            .map(val => options.find(opt => opt.value === val)?.label)
            .filter(Boolean);
            
        if (selectedLabels.length <= 3) {
            // Show all names if 3 or fewer
            return selectedLabels.join(', ');
        } else {
            // Show first 2 names + count for more than 3
            return `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2} more`;
        }
    };

    return (
        <div className={`relative ${className}`}>
            {label && <Label htmlFor={id} value={label} className="mb-2" />}
            <div className="relative checkbox-dropdown">
                <button
                    type="button"
                    id={id}
                    className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 flex items-center justify-between shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md transition-all duration-200"
                    onClick={() => setShowDropdown(!showDropdown)}
                    {...props}
                >
                    <span className="text-gray-800 dark:text-gray-200 font-medium text-sm truncate">
                        {getDisplayText()}
                    </span>
                    <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                        <CustomScrollbar maxHeight="240px">
                            <div className="p-1">
                                {options.map(option => (
                                    <label key={option.value} className="flex items-center px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200 rounded-lg mx-1 my-0.5">
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
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 select-none">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </CustomScrollbar>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckBoxDropDown; 