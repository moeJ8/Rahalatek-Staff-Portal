import { useState, useEffect, useRef } from 'react';
import { Label } from 'flowbite-react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CustomScrollbar from './CustomScrollbar';

const CustomDatePicker = ({ 
  value, 
  onChange, 
  placeholder = "DD/MM/YYYY", 
  className = "",
  required = false,
  name = "",
  id = "",
  label,
  min = "",
  max = "",
  popupSize = "normal",
  popupPosition = "down" // "up", "down"
}) => {
  const [displayDate, setDisplayDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

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
      
      // Parse ISO date string in local timezone to avoid timezone shift
      const [year, month, day] = value.split('-').map(Number);
      const localDate = new Date(year, month - 1, day); // month is 0-indexed
      
      setSelectedDate(localDate);
      setCurrentMonth(localDate);
    } else {
      setDisplayDate('');
      setSelectedDate(null);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
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

  const handleDisplayDateChange = (e) => {
    if (isMobile) return; // Prevent input changes on mobile
    
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

  const handleInputClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMobile) {
      // Prevent focus and keyboard on mobile
      e.target.blur();
      handleToggle();
    } else {
      handleToggle();
    }
  };

  const handleInputFocus = (e) => {
    if (isMobile) {
      // Prevent focus on mobile to avoid keyboard
      e.target.blur();
      handleToggle();
    }
  };

  const handleDateSelect = (date) => {
    // Format date in local timezone to avoid timezone shift issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;
    
    // Check min/max constraints
    if (min && isoDate < min) {
      return; // Don't allow selection before min date
    }
    if (max && isoDate > max) {
      return; // Don't allow selection after max date
    }
    
    setSelectedDate(date);
    setDisplayDate(formatDateForDisplay(isoDate));
    if (onChange) {
      onChange(isoDate);
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && value) {
      // Parse ISO date string in local timezone
      const [year, month, day] = value.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      setCurrentMonth(localDate);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const selectYear = (year) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(year);
    setCurrentMonth(newMonth);
    setShowYearPicker(false);
  };

  const selectMonth = (monthIndex) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(monthIndex);
    setCurrentMonth(newMonth);
    setShowMonthPicker(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 1960;
    const endYear = currentYear;
    const years = [];
    
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    
    return years;
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today);
  };

  const clearDate = () => {
    setSelectedDate(null);
    setDisplayDate('');
    if (onChange) {
      onChange('');
    }
    setIsOpen(false);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const year = date.getFullYear();
      const month_num = String(date.getMonth() + 1).padStart(2, '0');
      const day_num = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month_num}-${day_num}`;
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const isDisabled = (min && dateString < min) || (max && dateString > max);
      
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled
      });
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
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
        } rounded-lg focus-within:ring-2 focus-within:ring-blue-500/50 dark:focus-within:ring-blue-400/50 focus-within:border-blue-400 dark:focus-within:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md transition-all duration-200 cursor-pointer`}>
          <div className="flex items-center">
            <input
              id={id}
              name={name}
              type="text"
              value={displayDate}
              onChange={handleDisplayDateChange}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              required={required}
              readOnly={isMobile}
              className="w-full bg-transparent border-0 pl-4 pr-12 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 cursor-pointer"
            />
            <div 
              className="absolute right-3 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              onClick={handleToggle}
            >
              <FaCalendarAlt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className={`fixed lg:absolute z-50 ${popupSize === 'small' ? 'w-52' : 'w-80'} ${popupPosition === 'up' ? 'lg:bottom-full lg:mb-1' : 'lg:top-full lg:mt-1'} bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 
                        top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:top-auto lg:left-auto lg:transform-none`}>
          {/* Calendar Header */}
          <div className={`flex items-center justify-between ${popupSize === 'small' ? 'px-2 py-1' : 'p-4'} border-b border-gray-200/50 dark:border-gray-600/50`}>
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className={`${popupSize === 'small' ? 'p-1' : 'p-2'} rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200`}
            >
              <FaChevronLeft className={`${popupSize === 'small' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 dark:text-gray-300`} />
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className={`${popupSize === 'small' ? 'text-sm' : 'text-lg'} font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-1 rounded`}
              >
                {monthNames[currentMonth.getMonth()]}
              </button>
              <button
                type="button"
                onClick={() => setShowYearPicker(!showYearPicker)}
                className={`${popupSize === 'small' ? 'text-sm' : 'text-lg'} font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-1 rounded`}
              >
                {currentMonth.getFullYear()}
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className={`${popupSize === 'small' ? 'p-1' : 'p-2'} rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200`}
            >
              <FaChevronRight className={`${popupSize === 'small' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 dark:text-gray-300`} />
            </button>
          </div>

          {/* Month Picker Dropdown */}
          {showMonthPicker && (
            <div className="border-b border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm">
              <CustomScrollbar maxHeight="192px">
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {monthNames.map((month, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectMonth(index)}
                        className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                          index === currentMonth.getMonth()
                            ? 'bg-blue-500/20 dark:bg-blue-400/30 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              </CustomScrollbar>
            </div>
          )}

          {/* Year Picker Dropdown */}
          {showYearPicker && (
            <div className="border-b border-gray-200/50 dark:border-gray-600/50 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm">
              <CustomScrollbar maxHeight="192px">
                <div className="p-2">
                  <div className="grid grid-cols-4 gap-1">
                    {generateYearOptions().map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => selectYear(year)}
                        className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                          year === currentMonth.getFullYear()
                            ? 'bg-blue-500/20 dark:bg-blue-400/30 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </CustomScrollbar>
            </div>
          )}

          {/* Calendar Grid */}
          <div className={popupSize === 'small' ? 'p-1' : 'p-4'}>
            {/* Day headers */}
            <div className={`grid grid-cols-7 ${popupSize === 'small' ? 'gap-0.5' : 'gap-1'} mb-2`}>
              {dayNames.map((day) => (
                <div key={day} className={`${popupSize === 'small' ? 'p-1' : 'p-2'} text-xs font-medium text-center text-gray-600 dark:text-gray-400`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className={`grid grid-cols-7 ${popupSize === 'small' ? 'gap-0.5' : 'gap-1'}`}>
              {generateCalendarDays().map((dayInfo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(dayInfo.date)}
                  disabled={dayInfo.isDisabled}
                  className={`${popupSize === 'small' ? 'p-1 text-xs' : 'p-2 text-sm'} rounded-lg transition-all duration-200 ${
                    dayInfo.isDisabled
                      ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50'
                      : !dayInfo.isCurrentMonth
                      ? 'text-gray-400 dark:text-gray-600 hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
                      : dayInfo.isSelected
                      ? 'bg-blue-500/20 dark:bg-blue-400/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : dayInfo.isToday
                      ? 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  {dayInfo.day}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Footer */}
          <div className={`flex items-center justify-between ${popupSize === 'small' ? 'px-2 py-1' : 'p-4'} border-t border-gray-200/50 dark:border-gray-600/50`}>
            <button
              type="button"
              onClick={clearDate}
              className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker; 