import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';
import RahalatekLoader from './RahalatekLoader';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Helper function to format decimal hours to proper time format (e.g., 7.77 -> "7h 46m")
const formatDecimalHours = (decimalHours) => {
  if (!decimalHours || decimalHours === 0) return '0h';
  
  // Convert decimal to proper hours and minutes
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

export default function HomeCalendar() {
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
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Listen for working days updates to refresh calendar
  useEffect(() => {
    const handleWorkingDaysUpdate = () => {
      fetchCalendarData();
    };

    window.addEventListener('workingDaysUpdated', handleWorkingDaysUpdate);
    return () => window.removeEventListener('workingDaysUpdated', handleWorkingDaysUpdate);
  }, [fetchCalendarData]);

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
        detail = `${leave.startTime} - ${leave.endTime} (${formatDecimalHours(leave.hoursCount || 0)})${leave.reason ? ` | ${leave.reason}` : ''}`;
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
        detail: `In: ${formatTime(attendance.checkIn)} | Out: ${formatTime(attendance.checkOut)} | Hours: ${formatDecimalHours(hours)}`
      };
    }
    
    return {
      title: `${dayName}, ${formattedDate}`,
      content: 'Absent',
      detail: 'No attendance recorded'
    };
  };

  return (
    <>
    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden max-w-lg mx-auto backdrop-blur-sm">
      {/* Clean Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
              <FaCalendarAlt className="text-blue-600 dark:text-teal-400 text-sm sm:text-lg" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">My Calendar</h3>
          </div>
          <button
            onClick={fetchCalendarData}
            disabled={loading}
            className="p-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-all duration-200 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-6 space-y-3 sm:space-y-5">

        {loading ? (
          <div className="flex justify-center py-8">
            <RahalatekLoader size="md" />
          </div>
        ) : calendarData ? (
          <div className="space-y-5">
            {/* Modern Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                disabled={selectedYear <= 2025}
                className={`px-1.5 sm:px-2 py-1 text-xs font-medium rounded transition-all ${
                  selectedYear <= 2025 
                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                }`}
              >
                {selectedYear - 1}
              </button>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  <FaChevronLeft className="w-3 sm:w-4 h-3 sm:h-4" />
                </button>
                
                <div className="text-center min-w-[70px] sm:min-w-[80px]">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {monthNames[currentMonth]} {selectedYear}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    {(() => {
                      const monthData = calendarData.calendar[currentMonth] || {};
                      const workingDaysInMonth = Object.values(monthData).filter(day => day.isWorkingDay).length;
                      const dailyHours = calendarData.monthlyDailyHours?.[currentMonth + 1] || 8;
                      const totalHours = workingDaysInMonth * dailyHours;
                      return `${workingDaysInMonth} working days (${totalHours}h)`;
                    })()}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                    {(() => {
                      const monthData = calendarData.calendar[currentMonth] || {};
                      const today = new Date();
                      const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === selectedYear;
                      
                      if (!isCurrentMonth) {
                        // For past/future months, don't show remaining days
                        return '';
                      }
                      
                      // For current month, count remaining working days from today onwards
                      const currentDay = today.getDate();
                      const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
                      let remainingDays = 0;
                      
                      for (let day = currentDay; day <= daysInMonth; day++) {
                        const dayData = monthData[day];
                        if (dayData && dayData.isWorkingDay) {
                          remainingDays++;
                        }
                      }
                      
                      return `${remainingDays} left`;
                    })()}
                  </div>
                </div>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  <FaChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
                </button>
              </div>
              
              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                disabled={selectedYear >= 2026}
                className={`px-1.5 sm:px-2 py-1 text-xs font-medium rounded transition-all ${
                  selectedYear >= 2026 
                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                }`}
              >
                {selectedYear + 1}
              </button>
            </div>

            

                        {/* Modern Calendar Grid */}
            <div className="bg-white dark:bg-slate-900/30 rounded-xl p-2 sm:p-4">
              {/* Clean Days Header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center py-1 sm:py-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Beautiful Calendar Days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {(() => {
                  const monthData = calendarData.calendar[currentMonth] || {};
                  const firstDay = new Date(selectedYear, currentMonth, 1).getDay();
                  const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
                  const days = [];
                  
                  // Empty cells for days before month starts
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="h-8 sm:h-10"></div>);
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
                      const { status, leave, holiday, isWorkingDay } = dayData;
                      const tooltipInfo = getTooltipContent(dayData, day, currentMonth, selectedYear);
                      
                      let bgColor = 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300';
                      
                      if (holiday) {
                        bgColor = 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300';
                      } else if (!isWorkingDay) {
                        bgColor = 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400';
                      } else if (leave) {
                        bgColor = 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
                      } else if (status === 'checked-out') {
                        bgColor = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
                      } else if (status === 'checked-in') {
                        bgColor = 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
                      } else if (status === 'absent') {
                        bgColor = 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
                      }
                      
                      days.push(
                        <div
                          key={day}
                          className="text-center relative"
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
                          <div className={`relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl ${bgColor} transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md`}>
                            <span>{day}</span>
                            {isToday && (
                              <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full border border-white dark:border-slate-800 sm:border-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      days.push(
                        <div key={day} className="text-center relative">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            {day}
                          </div>
                          {isToday && (
                            <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full border border-white dark:border-slate-800 sm:border-2"></div>
                          )}
                        </div>
                      );
                    }
                  }
                  
                  return days;
                })()}
              </div>
            </div>

            {/* Stats Under Calendar */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
              <div className="grid grid-cols-6 gap-0.5 sm:gap-1 text-center">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">{calendarData.summary.presentDays}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Present</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">{calendarData.summary.leaveDays}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Leave</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-red-500 dark:text-red-400">{calendarData.summary.absentDays}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Absent</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">{calendarData.summary.attendanceRate}%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Rate</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">{calendarData.summary.totalWorkingDays}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">Total Days</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 sm:hidden">Total</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
                    {(() => {
                      const today = new Date();
                      const isCurrentYear = today.getFullYear() === selectedYear;
                      
                      if (!isCurrentYear) {
                        // For past years, show 0. For future years, show total year working days
                        const isPastYear = selectedYear < today.getFullYear();
                        if (isPastYear) return '0';
                        
                        // For future years, calculate total working days for the year
                        let totalYearDays = 0;
                        for (let month = 0; month < 12; month++) {
                          const monthData = calendarData.calendar[month] || {};
                          totalYearDays += Object.values(monthData).filter(day => day.isWorkingDay).length;
                        }
                        return totalYearDays;
                      }
                      
                      // For current year, count remaining working days from today onwards
                      const currentMonth = today.getMonth();
                      const currentDay = today.getDate();
                      let remainingDays = 0;
                      
                      // Count remaining days in current month (from today onwards)
                      const currentMonthData = calendarData.calendar[currentMonth] || {};
                      const daysInCurrentMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
                      
                      for (let day = currentDay; day <= daysInCurrentMonth; day++) {
                        const dayData = currentMonthData[day];
                        if (dayData && dayData.isWorkingDay) {
                          remainingDays++;
                        }
                      }
                      
                      // Count all working days in remaining months of the year
                      for (let month = currentMonth + 1; month < 12; month++) {
                        const monthData = calendarData.calendar[month] || {};
                        remainingDays += Object.values(monthData).filter(day => day.isWorkingDay).length;
                      }
                      
                      return remainingDays;
                    })()}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">Days Left</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 sm:hidden">Left</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-2">📅</div>
            <div className="text-slate-500 dark:text-slate-400">Failed to load calendar data</div>
            <button 
              onClick={fetchCalendarData}
              className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Clean Tooltip */}
    {hoveredDay && (
      <div
        className="fixed bg-white/30 dark:bg-slate-950/30 text-gray-900 dark:text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap border border-gray-200 dark:border-gray-700 backdrop-blur-md"
        style={{
          left: Math.min(Math.max(tooltipPosition.x, 5), window.innerWidth - 200),
          top: tooltipPosition.y,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999,
          fontSize: '11px',
          lineHeight: '1.2'
        }}
      >
        <div className="font-medium">{hoveredDay.title}</div>
        <div className="opacity-75">{hoveredDay.content}</div>
        <div className="opacity-60">{hoveredDay.detail}</div>
      </div>
    )}
    </>
  );
}
