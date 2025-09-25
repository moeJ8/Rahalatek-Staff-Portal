import React, { forwardRef, useRef, useEffect } from 'react';
import { Label } from 'flowbite-react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const TextInput = forwardRef(({ 
  id, 
  type = "text",
  value, 
  onChange, 
  placeholder = "",
  label,
  required = false,
  disabled = false,
  className = "",
  min,
  max,
  step = 1,
  rows,
  as = "input",
  ...props
}, ref) => {
  const isNumberInput = type === "number";
  const inputRef = useRef(null);
  
  // Combine refs
  const combinedRef = (node) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  useEffect(() => {
    const input = inputRef.current;
    if (input && isNumberInput) {
      const handleWheel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.blur(); // Also blur to ensure no focus-based wheel events
        setTimeout(() => input.focus(), 0); // Re-focus after a brief moment
      };

      // Add event listener with capture phase
      input.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      
      return () => {
        input.removeEventListener('wheel', handleWheel, { capture: true });
      };
    }
  }, [isNumberInput]);
  
  const baseClassName = `w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${
    required && !value 
      ? 'border-red-300 dark:border-red-600' 
      : 'border-gray-200/50 dark:border-gray-600/50'
  } rounded-lg ${isNumberInput ? 'pr-10' : ''} px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md transition-colors duration-200 ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } ${as === "textarea" ? 'resize-y' : ''} ${isNumberInput ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance:textfield]' : ''}`;

  const handleIncrement = () => {
    if (disabled) return;
    
    const currentValue = parseFloat(value) || 0;
    const stepValue = parseFloat(step);
    const newValue = currentValue + stepValue;
    const maxValue = max ? parseFloat(max) : Infinity;
    
    const finalValue = Math.min(newValue, maxValue);
    
    // Create synthetic event
    const syntheticEvent = {
      target: {
        value: finalValue.toString(),
        name: props.name,
        type: 'number'
      }
    };
    
    onChange(syntheticEvent);
  };

  const handleDecrement = () => {
    if (disabled) return;
    
    const currentValue = parseFloat(value) || 0;
    const stepValue = parseFloat(step);
    const newValue = currentValue - stepValue;
    const minValue = min ? parseFloat(min) : -Infinity;
    
    const finalValue = Math.max(newValue, minValue);
    
    // Create synthetic event
    const syntheticEvent = {
      target: {
        value: finalValue.toString(),
        name: props.name,
        type: 'number'
      }
    };
    
    onChange(syntheticEvent);
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
        {as === "textarea" ? (
          <>
            <style>{`
              .custom-textarea-scrollbar::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              
              .custom-textarea-scrollbar::-webkit-scrollbar-track {
                background: #f1f5f9;
              }
              
              .custom-textarea-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
              }
              
              .custom-textarea-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
              
              .dark .custom-textarea-scrollbar::-webkit-scrollbar-track {
                background: #1e293b;
              }
              
              .dark .custom-textarea-scrollbar::-webkit-scrollbar-thumb {
                background: #475569;
                border-radius: 4px;
              }
              
              .dark .custom-textarea-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #64748b;
              }
            `}</style>
            <textarea
              ref={ref}
              id={id}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              rows={rows || 3}
              className={`${baseClassName} resize-none custom-textarea-scrollbar`}
              {...props}
            />
          </>
        ) : (
          <>
            <input
              ref={combinedRef}
              type={type}
              id={id}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              min={min}
              max={max}
              step={step}
              className={baseClassName}
              style={{
                MozAppearance: isNumberInput ? 'textfield' : undefined,
                ...props.style
              }}
              {...props}
            />
            
            {/* Custom Number Input Controls */}
            {isNumberInput && !disabled && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors duration-150 group"
                  tabIndex={-1}
                >
                  <FaChevronUp className="w-3 h-3 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-150" />
                </button>
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors duration-150 group"
                  tabIndex={-1}
                >
                  <FaChevronDown className="w-3 h-3 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-150" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput; 