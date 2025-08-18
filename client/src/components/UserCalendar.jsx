import React, { useState, useEffect, useCallback } from 'react';
import { Card } from 'flowbite-react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaCheck, FaTimes, FaExclamationTriangle, FaGift } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import CustomButton from './CustomButton';
import RahalatekLoader from './RahalatekLoader';
import CustomScrollbar from './CustomScrollbar';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function UserCalendar({ isOpen, onClose }) {
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    const validYear = Math.max(currentYear, 2025);
    return Math.min(validYear, 2026); // Cap at 2026
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [modalEnter, setModalEnter] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch user's calendar data
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/attendance/my-calendar?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCalendarData(response.data.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (isOpen) {
      fetchCalendarData();
      setTimeout(() => setModalEnter(true), 50);
    } else {
      setModalEnter(false);
    }
  }, [isOpen, fetchCalendarData]);

  // Handle close with animation
  const handleClose = () => {
    setModalEnter(false);
    setTimeout(() => onClose(), 300);
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        const newYear = selectedYear - 1;
        if (newYear >= 2025) {
          setCurrentMonth(11);
          setSelectedYear(newYear);
        }
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        const newYear = selectedYear + 1;
        if (newYear <= 2026) {
          setCurrentMonth(0);
          setSelectedYear(newYear);
        }
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getDayColor = (dayData) => {
    const { status, leave, holiday, isWorkingDay } = dayData;
    
    if (holiday) {
      return 'bg-purple-200 dark:bg-purple-800/50 text-purple-900 dark:text-purple-100 border-purple-400';
    }
    
    if (!isWorkingDay) {
      return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300';
    }
    
    if (leave) {
      if (leave.leaveCategory === 'hourly') {
        return 'bg-orange-200 dark:bg-orange-800/50 text-orange-900 dark:text-orange-100 border-orange-400';
      }
      return 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-100 border-yellow-400';
    }
    
    switch (status) {
      case 'checked-out':
        return 'bg-green-200 dark:bg-green-800/50 text-green-900 dark:text-green-100 border-green-400';
      case 'checked-in':
        return 'bg-blue-200 dark:bg-blue-800/50 text-blue-900 dark:text-blue-100 border-blue-400';
      case 'absent':
        return 'bg-red-200 dark:bg-red-800/50 text-red-900 dark:text-red-100 border-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300';
    }
  };

  const getStatusIcon = (dayData) => {
    const { status, leave, holiday, isWorkingDay } = dayData;
    
    if (holiday) return <FaGift className="w-3 h-3" />;
    if (!isWorkingDay) return null;
    if (leave) {
      if (leave.leaveCategory === 'hourly') {
        return <FaClock className="w-3 h-3" />;
      }
      return <FaClock className="w-3 h-3" />;
    }
    
    switch (status) {
      case 'checked-out':
        return <FaCheck className="w-3 h-3" />;
      case 'checked-in':
        return <FaClock className="w-3 h-3" />;
      case 'absent':
        return <FaTimes className="w-3 h-3" />;
      default:
        return <FaExclamationTriangle className="w-3 h-3" />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTooltipContent = (dayData, day, month, year) => {
    const { status, attendance, leave, holiday, isWorkingDay } = dayData;
    const dateObj = new Date(year, month, day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    if (holiday) {
      return {
        title: `${dayName}, ${formattedDate}`,
        content: `Company Holiday: ${holiday.name}`,
        detail: holiday.description || 'No work scheduled'
      };
    }
    
    if (!isWorkingDay) {
      return {
        title: `${dayName}, ${formattedDate}`,
        content: 'Non-Working Day',
        detail: 'Weekend or configured off day'
      };
    }
    
    if (leave) {
      let content = `On Leave: ${leave.leaveType}`;
      let detail = leave.reason || 'Personal leave';
      
      if (leave.leaveCategory === 'hourly') {
        content = `Hourly Leave: ${leave.leaveType}`;
        detail = `${leave.startTime} - ${leave.endTime} (${leave.hoursCount || 0}h)${leave.reason ? ` | ${leave.reason}` : ''}`;
      } else if (leave.leaveCategory === 'single-day') {
        content = `Day Leave: ${leave.leaveType}`;
      } else if (leave.leaveCategory === 'multiple-day') {
        content = `Multi-day Leave: ${leave.leaveType}`;
      }
      
      return {
        title: `${dayName}, ${formattedDate}`,
        content,
        detail
      };
    }
    
    if (attendance) {
      const hours = attendance.hoursWorked || 0;
      return {
        title: `${dayName}, ${formattedDate}`,
        content: status === 'checked-out' ? 'Present (Full Day)' : 'Present (Partial)',
        detail: `In: ${formatTime(attendance.checkIn)} | Out: ${formatTime(attendance.checkOut)} | Hours: ${hours}h`
      };
    }
    
    return {
      title: `${dayName}, ${formattedDate}`,
      content: 'Absent',
      detail: 'No attendance recorded'
    };
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-30 ${modalEnter ? 'backdrop-blur-sm' : 'backdrop-blur-0'} transition-all duration-300 flex items-center justify-center p-2 sm:p-4 z-50`}>
      <div className={`bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 ${modalEnter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <FaCalendarAlt className="text-teal-600 dark:text-teal-400 text-lg sm:text-xl" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">My Calendar</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CustomButton
              variant="orange"
              size="sm"
              onClick={fetchCalendarData}
              icon={HiRefresh}
              disabled={loading}
              className="hidden sm:flex"
            >
              Refresh
            </CustomButton>
            <button
              onClick={fetchCalendarData}
              disabled={loading}
              className="sm:hidden p-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50"
            >
              <HiRefresh className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <CustomScrollbar className="p-3 sm:p-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <RahalatekLoader size="lg" />
            </div>
          ) : calendarData ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Year Navigation */}
              <div className="flex justify-center items-center gap-2 mb-4">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  disabled={selectedYear <= 2025}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-all ${
                    selectedYear <= 2025 
                      ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {selectedYear - 1}
                </button>
                <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white px-1 sm:px-2">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  disabled={selectedYear >= 2026}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-all ${
                    selectedYear >= 2026 
                      ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {selectedYear + 1}
                </button>
              </div>

              {/* Summary Statistics */}
              <div className="text-center">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg">
                    <div className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {calendarData.summary.totalWorkingDays}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Total Working Days</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg">
                    <div className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400">
                      {calendarData.summary.presentDays}
                    </div>
                    <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Present Days</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 rounded-lg">
                    <div className="text-base sm:text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {calendarData.summary.leaveDays}
                    </div>
                    <div className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">Leave Days</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg">
                    <div className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400">
                      {calendarData.summary.absentDays}
                    </div>
                    <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">Absent Days</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
                    <div className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {calendarData.summary.attendanceRate}%
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Attendance Rate</div>
                  </div>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex justify-center items-center gap-2 mb-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
                >
                  <FaChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
                >
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Month Name and Working Days Info */}
              <div className="text-center mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {monthNames[currentMonth]}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(() => {
                    if (!calendarData) return '';
                    const monthData = calendarData.calendar[currentMonth];
                    if (!monthData) return '';
                    const workingDaysInMonth = Object.values(monthData).filter(day => 
                      day.isWorkingDay && !day.holiday
                    ).length;
                    return `${workingDaysInMonth} working days in ${monthNames[currentMonth]}`;
                  })()}
                </span>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <div key={day} className="text-center p-1 sm:p-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 1)}</span>
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {(() => {
                    const monthData = calendarData.calendar[currentMonth] || {};
                    const firstDay = new Date(selectedYear, currentMonth, 1).getDay();
                    const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
                    const days = [];
                    
                    // Empty cells for days before month starts
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="p-1 sm:p-2"></div>);
                    }
                    
                    // Get today's date for comparison
                    const today = new Date();
                    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === selectedYear;
                    const currentDay = today.getDate();
                    
                    // Days of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dayData = monthData[day];
                      const isToday = isCurrentMonth && day === currentDay;
                      
                      if (dayData) {
                        const colorClass = getDayColor(dayData);
                        const icon = getStatusIcon(dayData);
                        const tooltipInfo = getTooltipContent(dayData, day, currentMonth, selectedYear);
                        
                        days.push(
                          <div
                            key={day}
                            className="p-1 sm:p-2 text-center relative"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipPosition({
                                x: rect.left + rect.width / 2,
                                y: rect.top - 10
                              });
                              setHoveredDay(tooltipInfo);
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                          >
                            <div className={`relative w-8 h-8 sm:w-12 sm:h-12 flex flex-col items-center justify-center text-xs sm:text-sm font-semibold rounded border-2 sm:rounded-lg ${colorClass} transition-all hover:scale-105`}>
                              <span className="text-xs">{day}</span>
                              {icon && <div className="mt-0.5 sm:block hidden">{icon}</div>}
                              {isToday && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        days.push(
                          <div key={day} className="p-1 sm:p-2 text-center relative">
                            <div className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border sm:rounded-lg border-gray-200 dark:border-gray-700`}>
                              {day}
                            </div>
                            {isToday && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        );
                      }
                    }
                    
                    return days;
                  })()}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Legend</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-200 border border-green-400 flex items-center justify-center">
                      <FaCheck className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-green-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Present</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-200 border border-yellow-400 flex items-center justify-center">
                      <FaClock className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-yellow-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Day Leave</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-orange-200 border border-orange-400 flex items-center justify-center">
                      <FaClock className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-orange-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Hourly Leave</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-200 border border-red-400 flex items-center justify-center">
                      <FaTimes className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-red-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Absent</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-200 border border-purple-400 flex items-center justify-center">
                      <FaGift className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-purple-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Holiday</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-200 border border-gray-300"></div>
                    <span className="text-gray-700 dark:text-gray-300">Non-Working</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-200 border border-blue-400 flex items-center justify-center">
                      <FaClock className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-blue-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Checked In</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Failed to load calendar data. Click refresh to try again.
            </div>
          )}
        </CustomScrollbar>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed bg-gray-900 dark:bg-gray-800 text-white px-1.5 py-0.5 sm:p-3 rounded sm:rounded-lg shadow-sm sm:shadow-lg text-xs z-50 pointer-events-none max-w-28 sm:max-w-xs"
          style={{
            left: Math.min(Math.max(tooltipPosition.x, 5), window.innerWidth - 120),
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium text-xs leading-none">{hoveredDay.title}</div>
          <div className="text-gray-200 text-xs leading-none">{hoveredDay.content}</div>
          <div className="text-gray-400 text-xs leading-none mt-0.5 sm:mt-1">{hoveredDay.detail}</div>
        </div>
      )}
    </div>
  );
}
