import { useState, useEffect } from 'react';
import { TextInput } from 'flowbite-react';

const CustomDatePicker = ({ 
  value, 
  onChange, 
  placeholder = "DD/MM/YYYY", 
  className = "",
  required = false,
  name = "",
  id = ""
}) => {
  const [displayDate, setDisplayDate] = useState('');

  // Date formatting functions
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const parseDisplayDate = (displayDate) => {
    if (!displayDate || !displayDate.includes('/')) return '';
    const [day, month, year] = displayDate.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Update display date when value prop changes
  useEffect(() => {
    if (value) {
      setDisplayDate(formatDateForDisplay(value));
    } else {
      setDisplayDate('');
    }
  }, [value]);

  const handleDisplayDateChange = (e) => {
    const newDisplayDate = e.target.value;
    setDisplayDate(newDisplayDate);
    
    // Only update the ISO date if we have a valid format
    if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const newIsoDate = parseDisplayDate(newDisplayDate);
      if (newIsoDate && onChange) {
        onChange(newIsoDate);
      }
    }
  };

  const handleNativeDateChange = (e) => {
    const newIsoDate = e.target.value;
    if (onChange) {
      onChange(newIsoDate);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <TextInput
        id={id}
        name={name}
        type="text"
        value={displayDate}
        onChange={handleDisplayDateChange}
        placeholder={placeholder}
        required={required}
      />
      <input 
        type="date" 
        className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
        value={value || ''}
        onChange={handleNativeDateChange}
      />
      <span className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>
    </div>
  );
};

export default CustomDatePicker; 