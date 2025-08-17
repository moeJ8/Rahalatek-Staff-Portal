import React from 'react';
import { Label } from 'flowbite-react';

const CustomCheckbox = ({ 
    id,
    label,
    checked = false,
    onChange,
    disabled = false,
    className = "",
    labelClassName = "",
    required = false,
    ...props 
}) => {
    return (
        <div className={`relative ${className}`}>
            <label 
                htmlFor={id}
                className={`flex items-center cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${labelClassName}`}
            >
                <div className="relative mr-3">
                    <input
                        type="checkbox"
                        id={id}
                        className="sr-only"
                        checked={checked}
                        onChange={(e) => {
                            if (!disabled && onChange) {
                                onChange(e.target.checked);
                            }
                        }}
                        disabled={disabled}
                        {...props}
                    />
                    <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 ${
                        checked
                            ? 'bg-blue-500/20 dark:bg-blue-400/30 border-blue-500 dark:border-blue-400 shadow-sm'
                            : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                    } backdrop-blur-sm ${disabled ? 'opacity-50' : ''}`}>
                        {checked && (
                            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400 m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                </div>
                {label && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {label}
                        {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
                    </span>
                )}
            </label>
        </div>
    );
};

export default CustomCheckbox;
