import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Table } from 'flowbite-react';
import { FaQrcode, FaPrint, FaCalendarDay, FaClock, FaUsers, FaChartLine, FaDownload, FaEye, FaCheck, FaTimes, FaCalendarAlt, FaList, FaChevronLeft, FaChevronRight, FaCog, FaCalendarCheck, FaTrash, FaPen, FaBusinessTime, FaGift, FaUserClock, FaUserCheck, FaGlobe, FaUser } from 'react-icons/fa';
import { HiRefresh, HiPlus } from 'react-icons/hi';
import CustomButton from './CustomButton';
import RahalatekLoader from './RahalatekLoader';
import CustomTable from './CustomTable';
import SearchableSelect from './SearchableSelect';
import Search from './Search';
import CustomScrollbar from './CustomScrollbar';
import Select from './Select';
import CustomDatePicker from './CustomDatePicker';
import TextInput from './TextInput';
import CustomModal from './CustomModal';
import CustomTooltip from './CustomTooltip';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CustomCheckbox from './CustomCheckbox';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Time conversion utility functions
const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const convertTo12Hour = (time24h) => {
  if (!time24h) return '';
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export default function AttendancePanel() {
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [reportFilters, setReportFilters] = useState({
    period: 'daily',
    userId: '',
    status: '',
    specificDate: ''
  });
  const [reportSummary, setReportSummary] = useState(null);
  const [yearlyView, setYearlyView] = useState(false);
  const [settingsView, setSettingsView] = useState(false);
  const [vacationsView, setVacationsView] = useState(false);
  const [activeReportsTab, setActiveReportsTab] = useState('attendance');
  
  // Working Hours Tracking states
  const [workingHoursData, setWorkingHoursData] = useState([]);
  const [workingHoursLoading, setWorkingHoursLoading] = useState(false);
  const [workingHoursFilters, setWorkingHoursFilters] = useState({
    userId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  
  // Per-User Working Days Configuration states
  const [userDailyHours, setUserDailyHours] = useState(8);
  const [yearlyData, setYearlyData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyLoading, setYearlyLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [dayModal, setDayModal] = useState({ visible: false, data: null, activeTab: 'attendance' });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Settings data states
  const [workingDaysConfig, setWorkingDaysConfig] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [userLeaves, setUserLeaves] = useState([]);
  
  // Settings UI states
  const [activeSettingsTab, setActiveSettingsTab] = useState('working-days');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, leaveId: null, leaveName: '' });
  const [holidayDeleteConfirmation, setHolidayDeleteConfirmation] = useState({ show: false, holidayId: null, holidayName: '' });
  
  // Vacations view states
  const [vacationsData, setVacationsData] = useState({
    allLeaves: [],
    annualLeaveStats: [],
    userAnnualStats: null,
    holidays: []
  });
  const [vacationsLoading, setVacationsLoading] = useState(false);
  const [selectedVacationYear, setSelectedVacationYear] = useState(new Date().getFullYear());
  const [selectedVacationMonth, setSelectedVacationMonth] = useState('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [selectedLeaveCategory, setSelectedLeaveCategory] = useState('all');
  const [selectedLeaveUser, setSelectedLeaveUser] = useState('all');
  const [activeVacationsTab, setActiveVacationsTab] = useState('overview');
  const [availableVacationYears, setAvailableVacationYears] = useState([]);
  const [availableVacationMonths, setAvailableVacationMonths] = useState([]);
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState([]);
  const [availableLeaveCategories, setAvailableLeaveCategories] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [holidaySearchTerm, setHolidaySearchTerm] = useState('');
  const [workingDaysForm, setWorkingDaysForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    defaultWorkingDays: [0, 1, 2, 3, 4, 6] // Sunday, Monday to Thursday, Saturday (Friday is non-working)
  });
  
  // Per-user working days states
  const [workingDaysMode, setWorkingDaysMode] = useState('global'); // 'global' or 'user'
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [customConfigUsers, setCustomConfigUsers] = useState([]);
  const [showCustomConfigsModal, setShowCustomConfigsModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    description: '',
    holidayType: 'single-day', // 'single-day' or 'multiple-day'
    date: '',         // For single-day holidays
    startDate: '',    // For multiple-day holidays
    endDate: '',      // For multiple-day holidays
    type: 'company',
    isRecurring: false,
    color: '#f87171'
  });
  const [leaveForm, setLeaveForm] = useState({
    userId: '',
    leaveType: 'sick',
    customLeaveType: '',
    leaveCategory: 'single-day',
    date: '',           // For single-day and hourly leaves
    startDate: '',      // For multiple-day leaves
    endDate: '',        // For multiple-day leaves  
    startTime: '09:00 AM', // For hourly leaves
    endTime: '05:00 PM',   // For hourly leaves
    reason: ''
  });
  
  // Admin editing states
  const [editModal, setEditModal] = useState({ visible: false, data: null });
  const [createModal, setCreateModal] = useState({ visible: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ visible: false, recordId: null, recordData: null });
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  
  // Edit leave modal states
  const [editLeaveModal, setEditLeaveModal] = useState({ visible: false, leave: null });
  const [editLeaveForm, setEditLeaveForm] = useState({
    leaveType: '',
    customLeaveType: '',
    leaveCategory: '',
    date: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
    status: ''
  });
  const [editLeaveLoading, setEditLeaveLoading] = useState(false);


  const authUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = authUser.isAdmin || false;
  const isAccountant = authUser.isAccountant || false;

  // Fetch settings data (working days, holidays, leaves)
  const fetchSettingsData = useCallback(async (year, month) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch working days configuration
      const workingDaysResponse = await fetch(`/api/working-days?year=${year}&month=${month + 1}`, { headers });
      if (workingDaysResponse.ok) {
        const workingDaysData = await workingDaysResponse.json();
        setWorkingDaysConfig(workingDaysData.data);
      }
      
      // Fetch holidays for the month
      const holidaysResponse = await fetch(`/api/holidays?year=${year}&month=${month + 1}`, { headers });
      if (holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        setHolidays(holidaysData.data);
      }
      
      // Fetch user leaves for the month
      const leavesResponse = await fetch(`/api/user-leave?year=${year}&month=${month + 1}`, { headers });
      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        setUserLeaves(leavesData.data);
      }
    } catch (error) {
      console.error('Error fetching settings data:', error);
    }
  }, []);

  // Helper function to determine day styling based on settings
  const getDayInfo = useCallback((year, month, day) => {
    const date = new Date(year, month, day);
    const dayInfo = {
      isWorkingDay: true,
      isHoliday: false,
      hasLeave: false,
      holidayInfo: null,
      leaveInfo: [],
      bgColor: '',
      textColor: '',
      label: ''
    };

    // Check if it's a working day
    if (workingDaysConfig?.workingDays) {
      const dayConfig = workingDaysConfig.workingDays.find(d => d.day === day);
      if (dayConfig) {
        dayInfo.isWorkingDay = dayConfig.isWorkingDay;
    } else {
        // Fallback to default working days of week
        const dayOfWeek = date.getDay();
        dayInfo.isWorkingDay = workingDaysConfig.defaultWorkingDaysOfWeek?.includes(dayOfWeek) || false;
      }
    } else {
      // Default: Sunday, Monday to Thursday, Saturday (Friday is non-working)
      const dayOfWeek = date.getDay();
      dayInfo.isWorkingDay = [0, 1, 2, 3, 4, 6].includes(dayOfWeek);
    }

    // Check for holidays
    const holiday = holidays.find(h => {
      if (h.holidayType === 'single-day') {
      const holidayDate = new Date(h.date);
      return holidayDate.getDate() === day && 
             holidayDate.getMonth() === month && 
             holidayDate.getFullYear() === year;
      } else if (h.holidayType === 'multiple-day') {
        // Normalize dates for comparison
        const startDate = new Date(h.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(h.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        const checkDate = new Date(year, month, day);
        checkDate.setHours(12, 0, 0, 0); // Set to midday to avoid timezone issues
        
        return checkDate >= startDate && checkDate <= endDate;
      }
      return false;
    });
    if (holiday) {
      dayInfo.isHoliday = true;
      dayInfo.holidayInfo = holiday;
    }

    // Check for user leaves
    const dayLeaves = userLeaves.filter(leave => {
      if (leave.leaveCategory === 'multiple-day') {
        // Normalize dates to start of day for proper comparison
      const startDate = new Date(leave.startDate);
        startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(leave.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        const currentDate = new Date(date);
        currentDate.setHours(12, 0, 0, 0); // Set to midday to avoid timezone issues
        
        return currentDate >= startDate && currentDate <= endDate;
      } else {
        // For single-day and hourly leaves
        const leaveDate = new Date(leave.date);
        return date.toDateString() === leaveDate.toDateString();
      }
    });
    if (dayLeaves.length > 0) {
      dayInfo.hasLeave = true;
      dayInfo.leaveInfo = dayLeaves;
    }

    // Set styling based on day type
    if (dayInfo.isHoliday) {
      dayInfo.bgColor = 'bg-purple-200 dark:bg-purple-800/50';
      dayInfo.textColor = 'text-purple-900 dark:text-purple-100';
      dayInfo.label = `Holiday: ${dayInfo.holidayInfo.name}`;
    } else if (dayInfo.hasLeave) {
      const hasHourlyLeave = dayInfo.leaveInfo.some(leave => leave.leaveCategory === 'hourly');
      if (hasHourlyLeave) {
        dayInfo.bgColor = 'bg-orange-200 dark:bg-orange-800/50';
        dayInfo.textColor = 'text-orange-900 dark:text-orange-100';
        dayInfo.label = `${dayInfo.leaveInfo.length} employee(s) on leave (incl. hourly)`;
      } else {
      dayInfo.bgColor = 'bg-yellow-200 dark:bg-yellow-800/50';
      dayInfo.textColor = 'text-yellow-900 dark:text-yellow-100';
      dayInfo.label = `${dayInfo.leaveInfo.length} employee(s) on leave`;
      }
    } else if (!dayInfo.isWorkingDay) {
      dayInfo.bgColor = 'bg-gray-200 dark:bg-gray-800';
      dayInfo.textColor = 'text-gray-600 dark:text-gray-400';
      dayInfo.label = 'Non-working day';
    }

    return dayInfo;
  }, [workingDaysConfig, holidays, userLeaves]);

  // Settings management functions
  const loadWorkingDaysConfig = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/working-days?year=${workingDaysForm.year}&month=${workingDaysForm.month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkingDaysConfig(data.data);
        
        // IMPORTANT: Update the form's defaultWorkingDays to match the loaded configuration
        // This prevents the bug where switching months corrupts the calendar display
        if (data.data && data.data.defaultWorkingDaysOfWeek) {
          setWorkingDaysForm(prev => ({
            ...prev,
            defaultWorkingDays: data.data.defaultWorkingDaysOfWeek
          }));
        }
      }
    } catch (error) {
      console.error('Error loading working days:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, [workingDaysForm.year, workingDaysForm.month]);

  // Load user-specific working days configuration
  const loadUserWorkingDaysConfig = useCallback(async (userId) => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/working-days/user?year=${workingDaysForm.year}&month=${workingDaysForm.month}&userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkingDaysConfig(data.data);
        
        // Update the form's defaultWorkingDays
        if (data.data && data.data.defaultWorkingDaysOfWeek) {
          setWorkingDaysForm(prev => ({
            ...prev,
            defaultWorkingDays: data.data.defaultWorkingDaysOfWeek
          }));
        }
        
        // Update daily hours
        if (data.data && data.data.dailyHours) {
          setUserDailyHours(data.data.dailyHours);
        } else {
          setUserDailyHours(8); // Default to 8 hours
        }
      }
    } catch (error) {
      console.error('Error loading user working days:', error);
      toast.error('Failed to load user working days configuration');
      setUserDailyHours(8); // Default to 8 hours on error
    } finally {
      setSettingsLoading(false);
    }
  }, [workingDaysForm.year, workingDaysForm.month]);

  // Update user-specific working days configuration
  const updateUserWorkingDays = useCallback(async (userId, year, month, workingDays, defaultWorkingDaysOfWeek, dailyHours) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/working-days/user', {
        userId,
        year,
        month,
        workingDays,
        defaultWorkingDaysOfWeek,
        dailyHours
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('User working days updated successfully');
        // Reload the user's configuration to reflect changes
        await loadUserWorkingDaysConfig(userId);
        // Trigger calendar refresh
        window.dispatchEvent(new CustomEvent('workingDaysUpdated'));
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating user working days:', error);
      toast.error('Failed to update user working days: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  }, [loadUserWorkingDaysConfig]);

  // Load users with custom configurations
  const loadCustomConfigUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/working-days/custom-configs?year=${workingDaysForm.year}&month=${workingDaysForm.month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomConfigUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading custom configs:', error);
    }
  }, [workingDaysForm.year, workingDaysForm.month]);

  // Apply global configuration to a specific user
  const handleApplyGlobalToUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/working-days/apply-global', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: [userId],
          year: workingDaysForm.year,
          month: workingDaysForm.month
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        
        // Reload the user's configuration and custom configs list
        if (selectedUserId === userId) {
          loadUserWorkingDaysConfig(userId);
        }
        loadCustomConfigUsers();
        
        // Trigger refresh for user calendars
        window.dispatchEvent(new CustomEvent('workingDaysUpdated', {
          detail: { 
            userId: userId,
            year: workingDaysForm.year,
            month: workingDaysForm.month
          }
        }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to apply global configuration');
      }
    } catch (error) {
      console.error('Error applying global config:', error);
      toast.error('Failed to apply global configuration');
    }
  };

  // Apply global configuration to all users
  const handleApplyGlobalToAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/working-days/apply-global-all', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: workingDaysForm.year,
          month: workingDaysForm.month
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        
        // Reload configurations
        if (selectedUserId) {
          loadUserWorkingDaysConfig(selectedUserId);
        }
        loadCustomConfigUsers();
        
        // Trigger refresh for all user calendars since this affects all users
        window.dispatchEvent(new CustomEvent('workingDaysUpdated', {
          detail: { 
            userId: null, // null means all users
            year: workingDaysForm.year,
            month: workingDaysForm.month
          }
        }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to apply global configuration to all users');
      }
    } catch (error) {
      console.error('Error applying global config to all:', error);
      toast.error('Failed to apply global configuration to all users');
    }
  };

  // Auto-load working days configuration when year/month changes
  // This prevents the calendar corruption bug where switching months would
  // show incorrect non-working days due to stale defaultWorkingDays state
  useEffect(() => {
    if (settingsView && activeSettingsTab === 'working-days') {
      if (workingDaysMode === 'global') {
        loadWorkingDaysConfig();
      } else if (workingDaysMode === 'user' && selectedUserId) {
        loadUserWorkingDaysConfig(selectedUserId);
      }
      // Always load custom configs to show bulk actions
      loadCustomConfigUsers();
    }
  }, [workingDaysForm.year, workingDaysForm.month, settingsView, activeSettingsTab, workingDaysMode, selectedUserId, loadWorkingDaysConfig, loadUserWorkingDaysConfig, loadCustomConfigUsers]);

  // Load user's annual leave data for the main dashboard
  useEffect(() => {
    if (!yearlyView && !settingsView && !vacationsView) {
      const loadUserAnnualData = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/user-leave/annual-stats?year=${new Date().getFullYear()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            setVacationsData(prev => ({
              ...prev,
              userAnnualStats: data.data
            }));
          }
        } catch (error) {
          console.error('Error loading user annual leave data:', error);
        }
      };
      
      loadUserAnnualData();
    }
  }, [yearlyView, settingsView, vacationsView]);

  // Reload vacations data when year changes (will be added after loadVacationsData is defined)

  const saveWorkingDaysConfig = useCallback(async (workingDays) => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      
      // Choose the appropriate endpoint based on mode
      const endpoint = workingDaysMode === 'user' ? '/api/working-days/user' : '/api/working-days';
      const requestBody = {
        year: workingDaysForm.year,
        month: workingDaysForm.month,
        workingDays,
        defaultWorkingDaysOfWeek: workingDaysForm.defaultWorkingDays
      };
      
      // Add userId for user-specific saves
      if (workingDaysMode === 'user' && selectedUserId) {
        requestBody.userId = selectedUserId;
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Working days configuration saved successfully!', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
          }
        });
        
        // Reload the appropriate configuration
        if (workingDaysMode === 'global') {
          await loadWorkingDaysConfig();
        } else if (workingDaysMode === 'user' && selectedUserId) {
          await loadUserWorkingDaysConfig(selectedUserId);
        }
        
        // Reload custom configs list
        loadCustomConfigUsers();
        
        // Refresh calendar data if in calendar view
        if (yearlyView) {
          fetchSettingsData(selectedYear, currentMonth);
        }
        
        // Trigger refresh for user calendars
        window.dispatchEvent(new CustomEvent('workingDaysUpdated', {
          detail: { 
            userId: workingDaysMode === 'user' ? selectedUserId : null,
            year: workingDaysForm.year,
            month: workingDaysForm.month
          }
        }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save working days configuration', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: 'bold',
          }
        });
      }
    } catch (error) {
      console.error('Error saving working days:', error);
      toast.error('Error saving working days configuration', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
        }
      });
    } finally {
      setSettingsLoading(false);
    }
  }, [workingDaysForm, workingDaysMode, selectedUserId, loadWorkingDaysConfig, loadUserWorkingDaysConfig, loadCustomConfigUsers, yearlyView, selectedYear, currentMonth, fetchSettingsData]);

  const loadHolidays = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/holidays', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHolidays(data.data);
      }
    } catch (error) {
      console.error('Error loading holidays:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const loadVacationsData = useCallback(async () => {
    try {
      setVacationsLoading(true);
      const token = localStorage.getItem('token');
      
      // Load all leaves (no filters - we'll filter on frontend)
      const leavesResponse = await fetch(`/api/user-leave?year=${selectedVacationYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Load annual leave statistics for all users (admin only)
      const annualStatsResponse = await fetch(`/api/user-leave/annual-stats/all?year=${selectedVacationYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Load current user's annual leave statistics
      const userStatsResponse = await fetch(`/api/user-leave/annual-stats?year=${selectedVacationYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Load holidays
      const holidaysResponse = await fetch('/api/holidays', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let allLeaves = [];
      let annualLeaveStats = [];
      let userAnnualStats = null;
      let holidays = [];
      
      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        allLeaves = leavesData.data || [];
      }
      
      if (annualStatsResponse.ok) {
        const annualData = await annualStatsResponse.json();
        annualLeaveStats = annualData.data?.users || [];
      }
      
      if (userStatsResponse.ok) {
        const userData = await userStatsResponse.json();
        userAnnualStats = userData.data;
      }

      if (holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        holidays = holidaysData.data || [];
      }
      
      setVacationsData({
        allLeaves,
        annualLeaveStats,
        userAnnualStats,
        holidays
      });
      
    } catch (error) {
      console.error('Error loading vacations data:', error);
    } finally {
      setVacationsLoading(false);
    }
  }, [selectedVacationYear]);

  const saveHoliday = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      
      // Validate form based on holiday type
      if (holidayForm.holidayType === 'single-day' && !holidayForm.date) {
        alert('Please select a date for the holiday');
        return;
      }
      
      if (holidayForm.holidayType === 'multiple-day' && (!holidayForm.startDate || !holidayForm.endDate)) {
        alert('Please select both start and end dates for the holiday');
        return;
      }
      
      if (holidayForm.holidayType === 'multiple-day' && new Date(holidayForm.startDate) > new Date(holidayForm.endDate)) {
        alert('Start date cannot be after end date');
        return;
      }
      
      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(holidayForm)
      });

      if (response.ok) {
        setHolidayForm({
          name: '',
          description: '',
          holidayType: 'single-day',
          date: '',
          startDate: '',
          endDate: '',
          type: 'company',
          isRecurring: false,
          color: '#f87171'
        });
        await loadHolidays();
        if (vacationsView) {
          await loadVacationsData();
        }
        toast.success('Holiday added successfully!', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#ffffff',
            fontWeight: 'bold',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#4CAF50'
          },
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add holiday', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#ffffff',
            fontWeight: 'bold',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#f44336'
          },
        });
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error('Error saving holiday', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#ffffff',
          fontWeight: 'bold',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#f44336'
        },
      });
    } finally {
      setSettingsLoading(false);
    }
  }, [holidayForm, loadHolidays, vacationsView, loadVacationsData]);

  const deleteHoliday = useCallback(async (holidayId) => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/holidays/${holidayId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Holiday deleted successfully!', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
          }
        });
        await loadHolidays();
        // Also refresh vacations data if in vacations view
        if (vacationsView) {
          await loadVacationsData();
        }
        setHolidayDeleteConfirmation({ show: false, holidayId: null, holidayName: '' });
      } else {
        toast.error('Failed to delete holiday', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: 'bold',
          }
        });
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Error deleting holiday', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
        }
      });
    } finally {
      setSettingsLoading(false);
    }
  }, [loadHolidays, vacationsView, loadVacationsData]);

  const loadUserLeaves = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-leave', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserLeaves(data.data);
      }
    } catch (error) {
      console.error('Error loading user leaves:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const loadAvailableVacationYears = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load all leaves without year filter to get available years
      const leavesResponse = await fetch('/api/user-leave', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        const allLeaves = leavesData.data || [];
        
        // Extract unique years from leaves
        const years = new Set();
        allLeaves.forEach(leave => {
          if (leave.date) {
            years.add(new Date(leave.date).getFullYear());
          }
          if (leave.startDate) {
            years.add(new Date(leave.startDate).getFullYear());
          }
        });
        
        // Add current year if no data exists
        const currentYear = new Date().getFullYear();
        years.add(currentYear);
        
        // Sort years in descending order (newest first)
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        setAvailableVacationYears(sortedYears);
        
        // Set current year as default if not already set
        if (!selectedVacationYear && sortedYears.length > 0) {
          setSelectedVacationYear(currentYear);
        }
      }
    } catch (error) {
      console.error('Error loading available vacation years:', error);
      // Fallback to current year
      const currentYear = new Date().getFullYear();
      setAvailableVacationYears([currentYear]);
      setSelectedVacationYear(currentYear);
    }
  }, [selectedVacationYear]);

  const loadAvailableVacationMonths = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load leaves for the selected year to get available months
      const leavesResponse = await fetch(`/api/user-leave?year=${selectedVacationYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        const allLeaves = leavesData.data || [];
        
        // Extract unique months from leaves
        const months = new Set();
        allLeaves.forEach(leave => {
          let leaveDate;
          if (leave.date) {
            leaveDate = new Date(leave.date);
          } else if (leave.startDate) {
            leaveDate = new Date(leave.startDate);
          }
          
          if (leaveDate) {
            months.add(leaveDate.getMonth() + 1); // 1-12
          }
        });
        
        // Sort months in ascending order
        const sortedMonths = Array.from(months).sort((a, b) => a - b);
        setAvailableVacationMonths(sortedMonths);
      }
    } catch (error) {
      console.error('Error loading available vacation months:', error);
      setAvailableVacationMonths([]);
    }
  }, [selectedVacationYear]);

  const loadAvailableLeaveTypes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load leaves for the selected year to get available leave types
      const leavesResponse = await fetch(`/api/user-leave?year=${selectedVacationYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        const allLeaves = leavesData.data || [];
        
        // Extract unique leave types
        const types = new Set();
        allLeaves.forEach(leave => {
          if (leave.leaveType) {
            types.add(leave.leaveType);
          }
        });
        
        // Sort leave types alphabetically
        const sortedTypes = Array.from(types).sort();
        setAvailableLeaveTypes(sortedTypes);
      }
    } catch (error) {
      console.error('Error loading available leave types:', error);
      setAvailableLeaveTypes([]);
    }
  }, [selectedVacationYear]);

  const loadAvailableLeaveCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load leaves for the selected year to get available leave categories
      const leavesResponse = await fetch(`/api/user-leave?year=${selectedVacationYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        const allLeaves = leavesData.data || [];
        
        // Extract unique leave categories
        const categories = new Set();
        allLeaves.forEach(leave => {
          if (leave.leaveCategory) {
            categories.add(leave.leaveCategory);
          }
        });
        
        // Sort leave categories in a logical order
        const categoryOrder = ['hourly', 'single-day', 'multiple-day'];
        const sortedCategories = categoryOrder.filter(cat => categories.has(cat));
        setAvailableLeaveCategories(sortedCategories);
      }
    } catch (error) {
      console.error('Error loading available leave categories:', error);
      setAvailableLeaveCategories([]);
    }
  }, [selectedVacationYear]);

  // Load available years when vacations view opens
  useEffect(() => {
    if (vacationsView) {
      loadAvailableVacationYears();
    }
  }, [vacationsView, loadAvailableVacationYears]);

  // Load available months, types, and categories when year changes
  useEffect(() => {
    if (vacationsView && selectedVacationYear) {
      loadAvailableVacationMonths();
      loadAvailableLeaveTypes();
      loadAvailableLeaveCategories();
      setSelectedVacationMonth('all'); // Reset filters when year changes
      setSelectedLeaveType('all');
      setSelectedLeaveCategory('all');
    }
  }, [vacationsView, selectedVacationYear, loadAvailableVacationMonths, loadAvailableLeaveTypes, loadAvailableLeaveCategories]);

  // Reload vacations data when year changes
  useEffect(() => {
    if (vacationsView && selectedVacationYear && availableVacationYears.length > 0) {
      loadVacationsData();
    }
  }, [selectedVacationYear, vacationsView, availableVacationYears.length, loadVacationsData]);

  // Clear search when changing tabs or years
  useEffect(() => {
    setUserSearchTerm('');
    setHolidaySearchTerm('');
  }, [activeVacationsTab, selectedVacationYear]);

  // Reset all filters function
  const resetAllFilters = useCallback(() => {
    setSelectedVacationMonth('all');
    setSelectedLeaveType('all');
    setSelectedLeaveCategory('all');
    setSelectedLeaveUser('all');
  }, []);

  // Frontend filtering with useMemo for instant results
  const filteredLeaves = useMemo(() => {
    let filtered = vacationsData.allLeaves || [];
    
    // Filter by year first
    filtered = filtered.filter(leave => {
      let leaveDate;
      if (leave.date) {
        leaveDate = new Date(leave.date);
      } else if (leave.startDate) {
        leaveDate = new Date(leave.startDate);
      }
      return leaveDate && leaveDate.getFullYear() === selectedVacationYear;
    });
    
    // Filter by month
    if (selectedVacationMonth !== 'all') {
      filtered = filtered.filter(leave => {
        let leaveDate;
        if (leave.date) {
          leaveDate = new Date(leave.date);
        } else if (leave.startDate) {
          leaveDate = new Date(leave.startDate);
        }
        return leaveDate && leaveDate.getMonth() + 1 === parseInt(selectedVacationMonth);
      });
    }
    
    // Filter by leave type
    if (selectedLeaveType !== 'all') {
      filtered = filtered.filter(leave => leave.leaveType === selectedLeaveType);
    }
    
    // Filter by leave category
    if (selectedLeaveCategory !== 'all') {
      filtered = filtered.filter(leave => leave.leaveCategory === selectedLeaveCategory);
    }
    
    // Filter by user
    if (selectedLeaveUser !== 'all') {
      filtered = filtered.filter(leave => leave.userId?._id === selectedLeaveUser);
    }
    
    // Sort by creation time (newest first)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA; // Descending order (newest first)
    });
    
    return filtered;
  }, [vacationsData.allLeaves, selectedVacationYear, selectedVacationMonth, selectedLeaveType, selectedLeaveCategory, selectedLeaveUser]);

  const saveUserLeave = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-leave', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leaveForm)
      });

      if (response.ok) {
        setLeaveForm({
          userId: '',
          leaveType: 'sick',
          customLeaveType: '',
          leaveCategory: 'single-day',
          date: '',
          startDate: '',
          endDate: '',
          startTime: '09:00 AM',
          endTime: '05:00 PM',
          reason: ''
        });
        await loadUserLeaves();
        toast.success('Leave record added successfully', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4CAF50',
          },
        });
      } else {
        toast.error('Failed to add leave record', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#f44336',
          },
        });
      }
    } catch (error) {
      console.error('Error saving user leave:', error);
      toast.error('Error saving leave record', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setSettingsLoading(false);
    }
  }, [leaveForm, loadUserLeaves]);

  const deleteUserLeave = useCallback(async (leaveId) => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user-leave/${leaveId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadUserLeaves();
        // Also refresh vacations data if in vacations view
        if (vacationsView) {
          await loadVacationsData();
        }
        toast.success('Leave record deleted successfully', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4CAF50',
          },
        });
      } else {
        toast.error('Failed to delete leave record', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#f44336',
          },
        });
      }
    } catch (error) {
      console.error('Error deleting user leave:', error);
      toast.error('Error deleting leave record', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setSettingsLoading(false);
    }
  }, [loadUserLeaves, vacationsView, loadVacationsData]);

  // Handle edit leave functionality
  const handleEditLeave = useCallback((leave) => {
    // Format dates and times for form inputs
    const formatDateForInput = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    };

    setEditLeaveForm({
      leaveType: leave.leaveType || '',
      customLeaveType: leave.customLeaveType || '',
      leaveCategory: leave.leaveCategory || '',
      date: formatDateForInput(leave.date),
      startDate: formatDateForInput(leave.startDate),
      endDate: formatDateForInput(leave.endDate),
      startTime: leave.startTime || '',
      endTime: leave.endTime || '',
      reason: leave.reason || '',
      status: leave.status || ''
    });

    setEditLeaveModal({ visible: true, leave });
  }, []);

  // Handle update leave submission
  const handleUpdateLeave = useCallback(async () => {
    if (!editLeaveModal.leave) return;

    try {
      setEditLeaveLoading(true);
      const token = localStorage.getItem('token');
      
      // Prepare update data
      const updateData = { ...editLeaveForm };
      
      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          delete updateData[key];
        }
      });

      const response = await fetch(`/api/user-leave/${editLeaveModal.leave._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('Leave updated successfully!', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4CAF50',
          },
        });

        // Close modal and refresh data
        setEditLeaveModal({ visible: false, leave: null });
        
        // Refresh the leaves data
        if (vacationsView) {
          await loadVacationsData();
        } else {
          await loadUserLeaves();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update leave', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#f44336',
          },
        });
      }
    } catch (error) {
      console.error('Error updating leave:', error);
      toast.error('Error updating leave record', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setEditLeaveLoading(false);
    }
  }, [editLeaveForm, editLeaveModal.leave, vacationsView, loadVacationsData, loadUserLeaves]);

  const fetchAttendanceReports = useCallback(async () => {
    try {
      setReportLoading(true);
      const token = localStorage.getItem('token');
      
      // Prepare query parameters
      const queryParams = { ...reportFilters };
      
      // Handle custom date
      if (reportFilters.period === 'custom') {
        if (reportFilters.specificDate && reportFilters.specificDate.trim()) {
          let dayNum, monthNum, yearNum;
          
          // Check if date is in YYYY-MM-DD format (ISO format from date picker)
          if (reportFilters.specificDate.includes('-') && reportFilters.specificDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Parse YYYY-MM-DD format
            const [year, month, day] = reportFilters.specificDate.split('-');
            dayNum = parseInt(day, 10);
            monthNum = parseInt(month, 10);
            yearNum = parseInt(year, 10);

          } 
          // Check if date is in DD/MM/YYYY format
          else if (reportFilters.specificDate.includes('/') && reportFilters.specificDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            // Parse DD/MM/YYYY format
            const [day, month, year] = reportFilters.specificDate.split('/');
            dayNum = parseInt(day, 10);
            monthNum = parseInt(month, 10);
            yearNum = parseInt(year, 10);

          } else {
            return;
          }
          
          // Validate parsed numbers
          if (dayNum && monthNum && yearNum && 
              dayNum >= 1 && dayNum <= 31 && 
              monthNum >= 1 && monthNum <= 12 && 
              yearNum >= 1900) {
            
            // Create date objects in local timezone
            const startDate = new Date(yearNum, monthNum - 1, dayNum, 0, 0, 0, 0);
            const endDate = new Date(yearNum, monthNum - 1, dayNum, 23, 59, 59, 999);
            
            // Validate the date is valid
            if (!isNaN(startDate.getTime()) && 
                startDate.getDate() === dayNum && 
                startDate.getMonth() === monthNum - 1 && 
                startDate.getFullYear() === yearNum) {
              
              // Use local timezone dates to match how attendance records are stored
              queryParams.startDate = startDate.toISOString();
              queryParams.endDate = endDate.toISOString();
              

            } else {
              return;
            }
          } else {
            return;
          }
        } else {
          // Custom period selected but no date provided - fallback to daily
          queryParams.period = 'daily';
        }
      }
      
      // Remove specificDate from query params as backend doesn't need it
      delete queryParams.specificDate;
      
      const params = new URLSearchParams(queryParams);
      const response = await axios.get(`/api/attendance/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceReports(response.data.data.records);
      setReportSummary(response.data.data.summary);
    } catch (error) {
      console.error('Error fetching attendance reports:', error);
      toast.error('Failed to load attendance reports', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setReportLoading(false);
    }
  }, [reportFilters]);

  const fetchWorkingHoursTracking = useCallback(async () => {
    try {
      setWorkingHoursLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = {
        userId: workingHoursFilters.userId || '',
        year: workingHoursFilters.year,
        month: workingHoursFilters.month,
        period: 'monthly'
      };
      
      const params = new URLSearchParams(queryParams);
      const response = await axios.get(`/api/attendance/working-hours-tracking?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWorkingHoursData(response.data.data.trackingData);
    } catch (error) {
      console.error('Error fetching working hours tracking:', error);
      toast.error('Failed to load working hours tracking', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setWorkingHoursLoading(false);
    }
  }, [workingHoursFilters]);



  // Load leave data for attendance reports calculations
  const loadLeaveDataForReports = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get the current year from report filters or default to current year
      let targetYear = new Date().getFullYear();
      
      // If we have a custom date filter, extract the year from it
      if (reportFilters.period === 'custom' && reportFilters.specificDate) {
        if (reportFilters.specificDate.includes('-')) {
          const [year] = reportFilters.specificDate.split('-');
          targetYear = parseInt(year, 10) || targetYear;
        } else if (reportFilters.specificDate.includes('/')) {
          const parts = reportFilters.specificDate.split('/');
          if (parts.length === 3) {
            targetYear = parseInt(parts[2], 10) || targetYear;
          }
        }
      }
      
      // Load leaves for the target year
      const leavesResponse = await fetch(`/api/user-leave?year=${targetYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        setVacationsData(prev => ({
          ...prev,
          allLeaves: leavesData.data || []
        }));
      }
    } catch (error) {
      console.error('Error loading leave data for reports:', error);
    }
  }, [reportFilters.period, reportFilters.specificDate]);

  useEffect(() => {
    fetchUsers();
    fetchAttendanceReports();
    loadLeaveDataForReports(); // Load leave data for hours calculation
    if (isAdmin) {
      fetchQRCode();
    }
  }, [fetchAttendanceReports, loadLeaveDataForReports, isAdmin]);



  const fetchAvailableYears = useCallback(async (skipYearValidation = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/attendance/available-years', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const years = response.data.data || [];
      setAvailableYears(years);
      
      // Only validate/change selected year if not skipping validation
      if (!skipYearValidation && years.length > 0) {
        const maxYear = Math.max(...years);
        const nextYear = maxYear + 1;
        
        // Get current selected year at the time of this call
        setSelectedYear(currentSelectedYear => {
          if (!years.includes(currentSelectedYear) && currentSelectedYear !== nextYear) {
            return maxYear;
          }
          return currentSelectedYear;
        });
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
      // Fallback to current year if API fails
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear]);
      if (!skipYearValidation) {
        setSelectedYear(currentYear);
      }
    }
  }, []);

  // Effect to fetch available years when working hours tab is activated
  useEffect(() => {
    if (activeReportsTab === 'working-hours') {
      fetchAvailableYears(true); // Load available years for the dropdown
      fetchWorkingHoursTracking();
      // Load leave data for hourly leave calculations
      loadLeaveDataForReports();
    }
  }, [activeReportsTab, fetchWorkingHoursTracking, fetchAvailableYears, loadLeaveDataForReports]);

  // Effect to reload leave data when working hours filters change
  useEffect(() => {
    if (activeReportsTab === 'working-hours') {
      loadLeaveDataForReports();
    }
  }, [workingHoursFilters, activeReportsTab, loadLeaveDataForReports]);

  const fetchYearlyData = useCallback(async () => {
    try {
      setYearlyLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/attendance/yearly-calendar?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setYearlyData(response.data.data);
    } catch (error) {
      console.error('Error fetching yearly data:', error);
      toast.error('Failed to load yearly attendance data', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setYearlyLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (yearlyView && (isAdmin || authUser?.isAccountant)) {
      fetchAvailableYears(true); // Skip year validation on initial load
      fetchYearlyData();
    }
  }, [yearlyView, fetchAvailableYears, fetchYearlyData, isAdmin, authUser?.isAccountant]);

  const fetchQRCode = async () => {
    try {
      setQrLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/attendance/qr', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrCode(response.data.data);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast.error('Failed to load QR code', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setQrLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/attendance/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handlePrintQR = () => {
    const qrData = qrCode;
    
    if (!qrData) {
      toast.error('No QR code to print', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Attendance QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #333;
              padding: 30px;
              border-radius: 10px;
              background: white;
            }
            .qr-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .qr-subtitle {
              font-size: 18px;
              color: #666;
              margin-bottom: 20px;
            }
            .qr-image {
              margin: 20px 0;
            }
            .qr-info {
              font-size: 14px;
              color: #888;
              margin-top: 20px;
            }
            .instructions {
              margin-top: 30px;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 8px;
              max-width: 400px;
            }
            .instructions h3 {
              margin-top: 0;
              color: #333;
            }
            .instructions ol {
              text-align: left;
              color: #666;
            }
            @page {
              size: A4;
              margin: 0.3in;
            }
            @media print {
              * {
                box-sizing: border-box;
              }
              body { 
                margin: 0;
                padding: 0;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              }
              .qr-container {
                padding: 20px;
                margin-bottom: 15px;
                width: 100%;
                max-width: 500px;
              }
              .qr-title {
                font-size: 22px;
                margin-bottom: 8px;
              }
              .qr-subtitle {
                font-size: 16px;
                margin-bottom: 15px;
              }
              .qr-image {
                margin: 15px 0;
              }
              .qr-image img {
                width: 220px !important;
                height: 220px !important;
              }
              .qr-info {
                font-size: 13px;
                margin-top: 15px;
              }
              .instructions {
                margin-top: 20px;
                padding: 15px;
                font-size: 13px;
                max-width: 100%;
                width: 100%;
                max-width: 500px;
              }
              .instructions h3 {
                font-size: 16px;
                margin-bottom: 10px;
                margin-top: 0;
              }
              .instructions ol {
                margin: 0;
                padding-left: 18px;
              }
              .instructions li {
                margin-bottom: 4px;
                line-height: 1.4;
              }
              .note {
                margin-top: 12px;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-title">Employee Attendance</div>
            <div class="qr-subtitle">Monthly QR Code - ${qrData.monthYear}</div>
            <div class="qr-image">
              <img src="${qrData.qrCodeImage}" alt="Attendance QR Code" style="width: 250px; height: 250px;"/>
            </div>
            <div class="qr-info">
              <div>Valid until: ${new Date(qrData.expiresAt).toLocaleDateString()}</div>
              <div>Generated: ${new Date(qrData.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="instructions">
            <h3>Instructions for Employees:</h3>
            <ol>
              <li>Open your camera app or QR scanner</li>
              <li>Point camera at this QR code</li>
              <li>Tap the notification to open attendance page</li>
              <li>Tap "Start Camera to Check In/Out"</li>
              <li>Scan this same QR code again through the app</li>
            </ol>
            <p><strong>Note:</strong> Use the same QR code for both check-in and check-out.</p>
          </div>
        </body>
      </html>
    `;

    // Create a blob and use it for printing to avoid about:blank
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
        URL.revokeObjectURL(url);
      };
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'checked-in':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'checked-out':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'not-checked-in':
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checked-in':
        return <FaCheck className="w-3 h-3 text-green-600" />;
      case 'checked-out':
        return <FaClock className="w-3 h-3 text-blue-600" />;
      default:
        return <FaTimes className="w-3 h-3 text-gray-600" />;
    }
  };

  // Helper function to check if user has hourly leave on a specific date
  const hasHourlyLeaveOnDate = useCallback((userId, date) => {
    if (!vacationsData.allLeaves) return false;

    const attendanceDate = new Date(date);
    
    return vacationsData.allLeaves.some(leave => {
      if (leave.leaveCategory !== 'hourly' || leave.userId?._id !== userId) {
        return false;
      }

      const leaveDate = new Date(leave.date);
      return leaveDate.toDateString() === attendanceDate.toDateString();
    });
  }, [vacationsData.allLeaves]);

  // Helper function to get hourly leave details for tooltip
  const getHourlyLeaveTooltip = useCallback((userId, date) => {
    if (!vacationsData.allLeaves || !userId) return null;

    const attendanceDate = new Date(date);
    
    const hourlyLeaves = vacationsData.allLeaves.filter(leave => {
      if (leave.leaveCategory !== 'hourly' || leave.userId?._id !== userId) {
        return false;
      }

      const leaveDate = new Date(leave.date);
      return leaveDate.toDateString() === attendanceDate.toDateString();
    });

    if (hourlyLeaves.length === 0) return null;

    const totalHours = hourlyLeaves.reduce((total, leave) => {
      const hours = parseFloat(leave.hoursCount) || 0;
      const validatedHours = isNaN(hours) || hours < 0 || hours > 24 ? 0 : hours;
      return total + validatedHours;
    }, 0);
    
    // Format leave details
    const leaveDetails = hourlyLeaves.map(leave => {
      const startTime = leave.startTime || '';
      const endTime = leave.endTime || '';
      const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';
      
      // Safely handle hours display
      const hours = parseFloat(leave.hoursCount) || 0;
      const validatedHours = isNaN(hours) || hours < 0 || hours > 24 ? 0 : hours;
      const hoursDisplay = validatedHours > 0 ? `${validatedHours}h` : '';
      
      return `${leave.leaveType || 'Leave'}${leave.customLeaveType ? ` (${leave.customLeaveType})` : ''}: ${timeRange} ${hoursDisplay}`.trim();
    }).join(', ');

    return {
      title: `Hourly Leave - ${attendanceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      content: `Total: ${totalHours}h`,
      detail: leaveDetails
    };
  }, [vacationsData.allLeaves]);

  // Helper function to calculate actual work hours after subtracting hourly leave
  const calculateActualWorkHours = useCallback((attendanceRecord) => {
    if (!attendanceRecord.hoursWorked || !vacationsData.allLeaves) {
      return attendanceRecord.hoursWorked;
    }

    const attendanceDate = new Date(attendanceRecord.date);
    const userId = attendanceRecord.userId?._id;

    // Find hourly leaves for this user on this date
    const hourlyLeaves = vacationsData.allLeaves.filter(leave => {
      if (leave.leaveCategory !== 'hourly' || leave.userId?._id !== userId) {
        return false;
      }

      const leaveDate = new Date(leave.date);
      return leaveDate.toDateString() === attendanceDate.toDateString();
    });

    // Calculate total leave hours for this date
    const totalLeaveHours = hourlyLeaves.reduce((total, leave) => {
      // Ensure hoursCount is a valid number
      const hours = parseFloat(leave.hoursCount) || 0;
      // Add validation to prevent extremely large values
      const validatedHours = isNaN(hours) || hours < 0 || hours > 24 ? 0 : hours;
      return total + validatedHours;
    }, 0);

    // Ensure worked hours is a valid number
    const workedHours = parseFloat(attendanceRecord.hoursWorked) || 0;
    
    // Subtract leave hours from worked hours
    const actualHours = Math.max(0, workedHours - totalLeaveHours);
    
    // Round to 2 decimal places to avoid floating point precision issues
    return Math.round(actualHours * 100) / 100;
  }, [vacationsData.allLeaves]);

  // Helper function to calculate actual worked hours for working hours tracking (subtract hourly leave)
  const calculateActualWorkedHoursForEmployee = useCallback((employeeData) => {
    if (!employeeData.totalHoursWorked || !vacationsData.allLeaves) {
      return {
        actualHours: employeeData.totalHoursWorked || 0,
        deductedHours: 0,
        hasDeduction: false
      };
    }

    const { year, month, userId } = {
      year: workingHoursFilters.year,
      month: workingHoursFilters.month,
      userId: employeeData.userId || employeeData._id
    };

    // Find all hourly leaves for this employee in the selected month/year
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const employeeHourlyLeaves = vacationsData.allLeaves.filter(leave => {
      if (leave.leaveCategory !== 'hourly' || leave.userId?._id !== userId) {
        return false;
      }

      const leaveDate = new Date(leave.date);
      return leaveDate >= monthStart && leaveDate <= monthEnd;
    });

    // Calculate total hourly leave hours for the month
    const totalLeaveHours = employeeHourlyLeaves.reduce((total, leave) => {
      const hours = parseFloat(leave.hoursCount) || 0;
      const validatedHours = isNaN(hours) || hours < 0 || hours > 24 ? 0 : hours;
      return total + validatedHours;
    }, 0);

    const originalHours = parseFloat(employeeData.totalHoursWorked) || 0;
    const actualHours = Math.max(0, originalHours - totalLeaveHours);

    return {
      actualHours: Math.round(actualHours * 100) / 100,
      deductedHours: Math.round(totalLeaveHours * 100) / 100,
      hasDeduction: totalLeaveHours > 0,
      originalHours: originalHours
    };
  }, [vacationsData.allLeaves, workingHoursFilters]);

  // Helper function to get monthly hourly leave details for tooltip in working hours tab
  const getMonthlyHourlyLeaveTooltip = useCallback((employeeData) => {
    if (!vacationsData.allLeaves) return null;

    const { year, month, userId } = {
      year: workingHoursFilters.year,
      month: workingHoursFilters.month,
      userId: employeeData.userId || employeeData._id
    };

    // Find all hourly leaves for this employee in the selected month/year
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const employeeHourlyLeaves = vacationsData.allLeaves.filter(leave => {
      if (leave.leaveCategory !== 'hourly' || leave.userId?._id !== userId) {
        return false;
      }

      const leaveDate = new Date(leave.date);
      return leaveDate >= monthStart && leaveDate <= monthEnd;
    });

    if (employeeHourlyLeaves.length === 0) return null;

    const totalHours = employeeHourlyLeaves.reduce((total, leave) => {
      const hours = parseFloat(leave.hoursCount) || 0;
      const validatedHours = isNaN(hours) || hours < 0 || hours > 24 ? 0 : hours;
      return total + validatedHours;
    }, 0);

    // Format leave details with dates
    const leaveDetails = employeeHourlyLeaves.map(leave => {
      const leaveDate = new Date(leave.date);
      const formattedDate = leaveDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      const startTime = leave.startTime || '';
      const endTime = leave.endTime || '';
      const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';
      
      const hours = parseFloat(leave.hoursCount) || 0;
      const validatedHours = isNaN(hours) || hours < 0 || hours > 24 ? 0 : hours;
      const hoursDisplay = validatedHours > 0 ? `${validatedHours}h` : '';
      
      const leaveTypeDisplay = leave.leaveType || 'Leave';
      const customTypeDisplay = leave.customLeaveType ? ` (${leave.customLeaveType})` : '';
      
      return `${formattedDate}: ${leaveTypeDisplay}${customTypeDisplay} ${timeRange} ${hoursDisplay}`.trim();
    }).join('\n');

    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      title: `Hourly Leave - ${monthName}`,
      content: `Total: ${totalHours}h (${employeeHourlyLeaves.length} leave${employeeHourlyLeaves.length !== 1 ? 's' : ''})`,
      detail: leaveDetails
    };
  }, [vacationsData.allLeaves, workingHoursFilters]);

  // Helper function to check if employee has hourly leave in the selected month
  const hasHourlyLeaveInMonth = useCallback((employeeData) => {
    if (!vacationsData.allLeaves) return false;

    const { year, month, userId } = {
      year: workingHoursFilters.year,
      month: workingHoursFilters.month,
      userId: employeeData.userId || employeeData._id
    };

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    return vacationsData.allLeaves.some(leave => {
      if (leave.leaveCategory !== 'hourly' || leave.userId?._id !== userId) {
        return false;
      }

      const leaveDate = new Date(leave.date);
      return leaveDate >= monthStart && leaveDate <= monthEnd;
    });
  }, [vacationsData.allLeaves, workingHoursFilters]);

  const handleDayClick = (dayData, day, month) => {
    setDayModal({
      visible: true,
      activeTab: 'attendance',
      data: {
        day,
        month,
        users: dayData.users,
        date: dayData.date
      }
    });
  };

  const closeDayModal = () => {
    setDayModal({ visible: false, data: null, activeTab: 'attendance' });
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = direction === 'prev' ? prev - 1 : prev + 1;
      const finalMonth = newMonth < 0 ? 11 : newMonth > 11 ? 0 : newMonth;
      
      // Fetch settings data for the new month
      fetchSettingsData(selectedYear, finalMonth);
      
      return finalMonth;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];



  const exportReport = () => {
    if (attendanceReports.length === 0) {
      toast.error('No data to export', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
      return;
    }

    const csvHeaders = ['Date', 'Employee', 'Check In', 'Check Out', 'Hours Worked', 'Status'];
    const csvData = attendanceReports.map(record => [
      formatDate(record.date),
      record.userId?.username || 'Unknown',
      formatTime(record.checkIn),
      formatTime(record.checkOut),
      record.hoursWorked || 0,
      record.status
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = reportFilters.period === 'custom' && reportFilters.specificDate 
      ? reportFilters.specificDate.replace(/\//g, '-')
      : new Date().toISOString().split('T')[0];
    a.download = `attendance-report-${reportFilters.period}-${dateStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Admin attendance management functions
  const handleEditAttendance = (record) => {
    const formatDateForInput = (date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    };

    setEditModal({
      visible: true,
      data: {
        ...record,
        checkInTime: record.checkIn ? new Date(record.checkIn).toTimeString().slice(0, 5) : '',
        checkOutTime: record.checkOut ? new Date(record.checkOut).toTimeString().slice(0, 5) : '',
        date: formatDateForInput(record.date)
      }
    });
  };



  const handleDeleteAttendance = (record) => {
    setDeleteModal({
      visible: true,
      recordId: record._id,
      recordData: record
    });
  };

  const confirmDeleteAttendance = async () => {
    try {
      setAdminActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/attendance/admin/delete/${deleteModal.recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Attendance record deleted successfully', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
      setDeleteModal({ visible: false, recordId: null, recordData: null });
      fetchAttendanceReports();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to delete attendance record', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  const submitEditAttendance = async (formData) => {
    try {
      setAdminActionLoading(true);
      const token = localStorage.getItem('token');
      
             // Prepare data for API - create proper ISO strings to avoid timezone issues
       const createLocalDateTime = (date, time) => {
         // Parse date parts (YYYY-MM-DD format)
         const [year, month, day] = date.split('-');
         // Parse time parts (HH:MM format)
         const [hours, minutes] = time.split(':');
         // Create date object with explicit values (month is 0-indexed)
         const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0);
         return localDate.toISOString();
       };

       const editData = {
         checkIn: formData.checkInTime ? createLocalDateTime(formData.date, formData.checkInTime) : null,
         checkOut: formData.checkOutTime ? createLocalDateTime(formData.date, formData.checkOutTime) : null,
         status: formData.status,
         notes: formData.notes,
         adminNotes: formData.adminNotes
       };

      await axios.put(`/api/attendance/admin/edit/${editModal.data._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Attendance record updated successfully', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
      setEditModal({ visible: false, data: null });
      fetchAttendanceReports();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to update attendance record', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  const submitCreateAttendance = async (formData) => {
    try {
      setAdminActionLoading(true);
      const token = localStorage.getItem('token');
      
      // Prepare data for API - create proper ISO strings to avoid timezone issues
      const createLocalDateTime = (date, time) => {
        // Parse date parts (YYYY-MM-DD format)
        const [year, month, day] = date.split('-');
        // Parse time parts (HH:MM format)
        const [hours, minutes] = time.split(':');
        // Create date object with explicit values (month is 0-indexed)
        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0);
        return localDate.toISOString();
      };

      const createData = {
        userId: formData.userId,
        date: formData.date,
        checkIn: formData.checkInTime ? createLocalDateTime(formData.date, formData.checkInTime) : null,
        checkOut: formData.checkOutTime ? createLocalDateTime(formData.date, formData.checkOutTime) : null,
        status: formData.status || 'checked-out',
        notes: formData.notes || '',
        adminNotes: formData.adminNotes || 'Manually created by admin'
      };

      await axios.post('/api/attendance/admin/manual-entry', createData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Manual attendance entry created successfully', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
      setCreateModal({ visible: false, data: null });
      fetchAttendanceReports();
    } catch (error) {
      console.error('Error creating attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to create attendance record', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  return (
    <Card className="w-full dark:bg-slate-950" id="attendance-panel" role="tabpanel" aria-labelledby="tab-attendance">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 dark:text-white flex items-center justify-center">
            <FaCalendarDay className="mr-3 text-teal-600 dark:text-teal-400" />
            Attendance Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage employee attendance, generate QR codes, and view reports
          </p>
        </div>

        {/* QR Code Section - Admin Only */}
        {isAdmin && (
          <Card className="bg-gray-50 dark:bg-slate-950">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <h3 className="text-lg font-semibold dark:text-white flex items-center">
                <FaQrcode className="mr-2 text-blue-800 dark:text-teal-400" />
                QR Code
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <CustomButton
                  variant="orange"
                  size="sm"
                  onClick={fetchQRCode}
                  icon={HiRefresh}
                  disabled={qrLoading}
                  className="w-full sm:w-auto"
                >
                  Refresh
                </CustomButton>
                <CustomButton
                  variant="blueToTeal"
                  size="sm"
                  onClick={handlePrintQR}
                  icon={FaPrint}
                  disabled={!qrCode || qrLoading}
                  className="w-full sm:w-auto"
                >
                  Print QR Code
                </CustomButton>
              </div>
            </div>

            {qrLoading ? (
              <div className="flex justify-center py-8">
                <RahalatekLoader size="lg" />
              </div>
            ) : qrCode ? (
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <img 
                    src={qrCode.qrCodeImage} 
                    alt="Monthly Attendance QR Code"
                    className="w-48 h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Month: </span>
                    <span className="text-lg font-semibold dark:text-white">{qrCode.monthYear}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Valid until: </span>
                    <span className="dark:text-white">{formatDate(qrCode.expiresAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Generated: </span>
                    <span className="dark:text-white">{formatDate(qrCode.createdAt)}</span>
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Failed to load QR code. Click refresh to try again.
              </div>
            )}
          </Card>
        )}

        {/* View Toggle - Responsive */}
        <div className="flex justify-center mb-6">
          <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-t-lg overflow-hidden shadow-sm w-full sm:w-auto">
            <div className={`${isAdmin ? 'grid grid-cols-4 sm:flex' : 'grid grid-cols-2 sm:flex'} gap-0 w-full`}>
              <button
                onClick={() => { setYearlyView(false); setSettingsView(false); setVacationsView(false); }}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                  !yearlyView && !settingsView && !vacationsView
                    ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                }`}
              >
                <FaList className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
                <span className="sm:hidden">Reports</span>
              </button>
              <button
                onClick={() => { 
                  setYearlyView(true); 
                  setSettingsView(false); 
                  setVacationsView(false);
                  // Fetch settings data for current month/year when calendar view is opened
                  setTimeout(() => {
                    fetchSettingsData(selectedYear, currentMonth);
                  }, 100); // Small delay to ensure state is updated
                }}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                  yearlyView && !settingsView && !vacationsView
                    ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                }`}
              >
                <FaCalendarAlt className="w-4 h-4" />
                <span className="hidden sm:inline">Calendar</span>
                <span className="sm:hidden">Calendar</span>
              </button>
              {(isAdmin || isAccountant) && (
                <button
                  onClick={() => { 
                    setYearlyView(false); 
                    setSettingsView(false);
                    setVacationsView(true);
                    loadVacationsData();
                  }}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                    vacationsView
                      ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                  }`}
                >
                  <FaUserClock className="w-4 h-4" />
                  <span className="hidden sm:inline">Vacations & Leaves</span>
                  <span className="sm:hidden">Vacations</span>
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => { 
                    setYearlyView(false); 
                    setSettingsView(true);
                    setVacationsView(false);
                    // Load initial settings data
                    if (activeSettingsTab === 'working-days') {
                      loadWorkingDaysConfig();
                      fetchAvailableYears(true);
                    } else if (activeSettingsTab === 'holidays') {
                      loadHolidays();
                    } else if (activeSettingsTab === 'leave') {
                      loadUserLeaves();
                      loadUsers();
                    }
                  }}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                    settingsView
                      ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                  }`}
                >
                  <FaCog className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Settings</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Conditional Content Based on View */}
        {vacationsView && (isAdmin || isAccountant) ? (
          /* Vacations & Leaves Section */
          <Card className="bg-gray-50 dark:bg-slate-950">
            <div className="p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold dark:text-white flex items-center mb-4 sm:mb-6">
                <FaUserClock className="mr-2 text-blue-800 dark:text-teal-400 w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Vacations & Leaves Management</span>
                <span className="sm:hidden">Vacations</span>
              </h3>

              {/* Year Selector */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="w-full sm:w-48">
                  <Select
                    label="Year"
                    value={selectedVacationYear}
                    onChange={(value) => setSelectedVacationYear(parseInt(value))}
                    options={availableVacationYears.map(year => ({
                      value: year,
                      label: year.toString()
                    }))}
                    placeholder="Select year..."
                    disabled={vacationsLoading}
                  />
                </div>
                <CustomButton
                  variant="orange"
                  size="sm"
                  onClick={() => {
                    loadAvailableVacationYears();
                    loadAvailableVacationMonths();
                    loadAvailableLeaveTypes();
                    loadAvailableLeaveCategories();
                    loadVacationsData();
                  }}
                  icon={HiRefresh}
                  disabled={vacationsLoading}
                >
                  Refresh Data
                </CustomButton>
              </div>

              {/* Vacations Navigation */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-t-lg overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setActiveVacationsTab('overview')}
                    className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                      activeVacationsTab === 'overview'
                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                    }`}
                  >
                    <FaCalendarCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Annual Overview</span>
                    <span className="sm:hidden">Overview</span>
                  </button>
                  <button 
                    onClick={() => setActiveVacationsTab('leaves')}
                    className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                      activeVacationsTab === 'leaves'
                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                    }`}
                  >
                    <FaList className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">All Leaves</span>
                    <span className="sm:hidden">Leaves</span>
                  </button>
                  <button 
                    onClick={() => setActiveVacationsTab('holidays')}
                    className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                      activeVacationsTab === 'holidays'
                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                    }`}
                  >
                    <FaGift className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Company Holidays</span>
                    <span className="sm:hidden">Holidays</span>
                  </button>
                </div>
              </div>

              {/* Conditional Content Based on Active Vacations Tab */}
              {vacationsLoading && (
                <div className="flex justify-center py-8">
                  <RahalatekLoader size="md" />
                </div>
              )}

              {!vacationsLoading && activeVacationsTab === 'overview' && (
                <div>
                  {/* Annual Leave Statistics */}
                  {vacationsData.annualLeaveStats.length > 0 ? (
                    <div>
                      <style>
                        {`
                          @keyframes progressScale {
                            from {
                              transform: scaleX(0);
                            }
                            to {
                              transform: scaleX(1);
                            }
                          }
                        `}
                      </style>
                      
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <FaCalendarCheck className="w-5 h-5 mr-2 text-blue-800 dark:text-teal-400" />
                          Annual Leave Overview ({selectedVacationYear})
                        </div>
                        {userSearchTerm && (
                          <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                            {vacationsData.annualLeaveStats.filter(userStats => 
                              userStats.username.toLowerCase().includes(userSearchTerm.toLowerCase())
                            ).length} of {vacationsData.annualLeaveStats.length} employees
                          </span>
                        )}
                      </h4>
                      
                      {/* Search Bar */}
                      <div className="mb-6">
                        <Search
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          placeholder="Search employees by name..."
                          className="max-w-md"
                        />
                      </div>
                      
                      {(() => {
                        const filteredStats = vacationsData.annualLeaveStats.filter(userStats => 
                          userStats.username.toLowerCase().includes(userSearchTerm.toLowerCase())
                        );
                        
                        if (filteredStats.length === 0 && userSearchTerm) {
                          return (
                            <div className="text-center py-12">
                              <FaUsers className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No employees found</h4>
                              <p className="text-gray-500 dark:text-gray-400">No employees match your search for "{userSearchTerm}"</p>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredStats.map((userStats, index) => {
                           const progressPercentage = (userStats.daysUsed / userStats.maxAnnualDays) * 100;
                           
                           return (
                             <div 
                               key={userStats.userId} 
                               className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                               style={{
                                 animationDelay: `${index * 100}ms`
                               }}
                             >
                               <div className="flex items-center justify-between mb-4">
                                 <h5 className="font-semibold text-gray-900 dark:text-white">
                                   {userStats.username}
                                 </h5>
                                 
                                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                   userStats.remainingDays > 7 
                                     ? 'bg-green-500 text-white'
                                     : userStats.remainingDays > 3
                                     ? 'bg-yellow-500 text-white'
                                     : 'bg-red-500 text-white'
                                 }`}>
                                   {userStats.remainingDays} left
                                 </span>
                               </div>
                               
                               <div className="space-y-3">
                                 <div className="flex justify-between text-sm">
                                   <span className="text-gray-600 dark:text-slate-300">Days Used:</span>
                                   <span className="font-semibold text-gray-900 dark:text-white">
                                     {userStats.daysUsed} / {userStats.maxAnnualDays}
                                   </span>
                                 </div>
                                 
                                 <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                   <div 
                                     className={`h-3 rounded-full transition-all duration-500 ease-out ${
                                       progressPercentage > 80 
                                         ? 'bg-gradient-to-r from-red-400 to-red-600' 
                                         : progressPercentage > 60 
                                         ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                                         : 'bg-gradient-to-r from-green-400 to-green-600'
                                     }`}
                                     style={{ 
                                       width: `${progressPercentage}%`,
                                       transform: `scaleX(0)`,
                                       transformOrigin: 'left',
                                       animation: `progressScale 0.6s ease-out ${index * 150}ms forwards`
                                     }}
                                   ></div>
                                 </div>
                               </div>
                             </div>
                           );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaCalendarCheck className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Annual Leave Data</h4>
                      <p className="text-gray-500 dark:text-gray-400">Annual leave statistics will appear here once employees start taking annual leave.</p>
                    </div>
                  )}
                </div>
              )}

              {!vacationsLoading && activeVacationsTab === 'leaves' && (
                <div>
                  {/* Title */}
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                      <FaList className="w-5 h-5 mr-2 text-blue-800 dark:text-teal-400" />
                      All Leaves ({selectedVacationYear}) - {filteredLeaves.length} records
                    </h4>
                  </div>
                  
                  {/* Centered Filters */}
                  <div className="flex justify-center mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl w-full">
                      {/* Month Filter */}
                      <div>
                        <Select
                          label="Month"
                          value={selectedVacationMonth}
                          onChange={(value) => setSelectedVacationMonth(value)}
                          options={[
                            { value: 'all', label: 'All Months' },
                            ...availableVacationMonths.map(month => ({
                              value: month,
                              label: new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })
                            }))
                          ]}
                          placeholder="Select month..."
                          disabled={vacationsLoading}
                        />
                      </div>
                      
                      {/* Leave Type Filter */}
                      <div>
                        <Select
                          label="Leave Type"
                          value={selectedLeaveType}
                          onChange={(value) => setSelectedLeaveType(value)}
                          options={[
                            { value: 'all', label: 'All Types' },
                            ...availableLeaveTypes.map(type => ({
                              value: type,
                              label: type.charAt(0).toUpperCase() + type.slice(1)
                            }))
                          ]}
                          placeholder="Select type..."
                          disabled={vacationsLoading}
                        />
                      </div>
                      
                      {/* Leave Category Filter */}
                      <div>
                        <Select
                          label="Category"
                          value={selectedLeaveCategory}
                          onChange={(value) => setSelectedLeaveCategory(value)}
                          options={[
                            { value: 'all', label: 'All Categories' },
                            ...availableLeaveCategories.map(category => ({
                              value: category,
                              label: category === 'hourly' ? 'Hourly' : 
                                     category === 'single-day' ? 'Single Day' : 'Multiple Days'
                            }))
                          ]}
                          placeholder="Select category..."
                          disabled={vacationsLoading}
                        />
                      </div>
                      
                      {/* User Filter */}
                      <div>
                        <Select
                          label="User"
                          value={selectedLeaveUser}
                          onChange={(value) => setSelectedLeaveUser(value)}
                          options={[
                            { value: 'all', label: 'All Users' },
                            ...users.map(user => ({
                              value: user._id,
                              label: user.username
                            }))
                          ]}
                          placeholder="Select user..."
                          disabled={vacationsLoading}
                        />
                      </div>
                      
                      {/* Reset Button */}
                      <div className="relative w-full">
                        <div className="mb-2 block">
                          <label className="text-gray-700 dark:text-gray-200 font-medium">
                            Actions
                          </label>
                        </div>
                        <CustomButton
                          variant="red"
                          size="sm"
                          onClick={resetAllFilters}
                          disabled={vacationsLoading || (selectedVacationMonth === 'all' && selectedLeaveType === 'all' && selectedLeaveCategory === 'all' && selectedLeaveUser === 'all')}
                          className="w-full py-3 text-sm font-medium"
                        >
                          Reset Filters
                        </CustomButton>
                      </div>
                    </div>
                  </div>
                  
                  <CustomTable
                    headers={['Employee', 'Leave Type', 'Category', 'Duration', 'Date(s)', 'Status', 'Reason', 'Actions']}
                    data={filteredLeaves}
                    renderRow={(leave) => (
                      <>
                        <Table.Cell className="font-medium text-gray-900 dark:text-white">
                          {leave.userId?.username || 'Unknown User'}
                        </Table.Cell>
                        <Table.Cell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            leave.leaveType === 'annual' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : leave.leaveType === 'sick'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : leave.leaveType === 'emergency'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            leave.leaveCategory === 'hourly'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                              : leave.leaveCategory === 'single-day'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          }`}>
                            {leave.leaveCategory === 'hourly' ? 'Hourly' : 
                             leave.leaveCategory === 'single-day' ? 'Single Day' : 'Multiple Days'}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 font-medium">
                          {leave.leaveCategory === 'hourly' 
                            ? `${leave.hoursCount || 0}h (${leave.startTime} - ${leave.endTime})`
                            : `${leave.daysCount || 1} day${(leave.daysCount || 1) > 1 ? 's' : ''}`
                          }
                        </Table.Cell>
                        <Table.Cell className="text-gray-900 dark:text-gray-200 font-medium">
                          {leave.leaveCategory === 'multiple-day' 
                            ? `${new Date(leave.startDate).toLocaleDateString('en-GB')} to ${new Date(leave.endDate).toLocaleDateString('en-GB')}`
                            : new Date(leave.date || leave.startDate).toLocaleDateString('en-GB')
                          }
                        </Table.Cell>
                        <Table.Cell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            leave.status === 'approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : leave.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="max-w-xs truncate text-gray-900 dark:text-gray-200">
                          {leave.reason || 'No reason provided'}
                        </Table.Cell>
                        <Table.Cell>
                          {isAdmin ? (
                            <div className="flex items-center gap-2">
                              <CustomButton
                                variant="teal"
                                size="sm"
                                onClick={() => handleEditLeave(leave)}
                                icon={FaPen}
                                title="Edit Leave"
                                disabled={vacationsLoading}
                                className="!p-2"
                              />
                              <CustomButton
                                variant="red"
                                size="sm"
                                onClick={() => {
                                  setDeleteConfirmation({
                                    show: true,
                                    leaveId: leave._id,
                                    leaveName: `${leave.userId?.username || 'Unknown'}'s ${leave.leaveType} leave`
                                  });
                                }}
                                icon={FaTrash}
                                title="Delete Leave"
                                disabled={vacationsLoading}
                                className="!p-2"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-sm">View Only</span>
                          )}
                        </Table.Cell>
                      </>
                    )}
                    emptyMessage="No leaves found for this year."
                  />
                </div>
              )}

              {!vacationsLoading && activeVacationsTab === 'holidays' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FaGift className="w-5 h-5 mr-2 text-blue-800 dark:text-teal-400" />
                      Company Holidays ({vacationsData.holidays.length})
                    </div>
                    {holidaySearchTerm && (
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        {vacationsData.holidays.filter(holiday => 
                          holiday.name.toLowerCase().includes(holidaySearchTerm.toLowerCase()) ||
                          holiday.type.toLowerCase().includes(holidaySearchTerm.toLowerCase()) ||
                          (holiday.description && holiday.description.toLowerCase().includes(holidaySearchTerm.toLowerCase()))
                        ).length} of {vacationsData.holidays.length} holidays
                      </span>
                    )}
                  </h4>
                  
                  {/* Search Bar */}
                  <div className="mb-6">
                    <Search
                      value={holidaySearchTerm}
                      onChange={(e) => setHolidaySearchTerm(e.target.value)}
                      placeholder="Search holidays by name, type, or description..."
                      className="max-w-md"
                    />
                  </div>
                  
                  {(() => {
                    const filteredHolidays = vacationsData.holidays.filter(holiday => 
                      holiday.name.toLowerCase().includes(holidaySearchTerm.toLowerCase()) ||
                      holiday.type.toLowerCase().includes(holidaySearchTerm.toLowerCase()) ||
                      (holiday.description && holiday.description.toLowerCase().includes(holidaySearchTerm.toLowerCase()))
                    );
                    
                    if (filteredHolidays.length === 0 && holidaySearchTerm) {
                      return (
                        <div className="text-center py-12">
                          <FaGift className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No holidays found</h4>
                          <p className="text-gray-500 dark:text-gray-400">No holidays match your search for "{holidaySearchTerm}"</p>
                        </div>
                      );
                    }
                    
                    if (filteredHolidays.length > 0) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {filteredHolidays.map((holiday, index) => (
                        <div 
                          key={holiday._id} 
                          className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {holiday.name}
                            </h5>
                            
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              holiday.type === 'company' 
                                ? 'bg-blue-500 text-white'
                                : holiday.type === 'public'
                                ? 'bg-green-500 text-white'
                                : 'bg-purple-500 text-white'
                            }`}>
                              {holiday.type === 'company' ? 'Company' : 
                               holiday.type === 'public' ? 'Public' : 'Other'}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-slate-300">
                                {holiday.holidayType === 'multiple-day' ? 'Duration:' : 'Date:'}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {holiday.holidayType === 'multiple-day' ? (
                                  `${new Date(holiday.startDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })} - ${new Date(holiday.endDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}`
                                ) : (
                                  new Date(holiday.date).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                )}
                              </span>
                            </div>
                            
                            {holiday.holidayType !== 'multiple-day' && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-slate-300">Day:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {new Date(holiday.date).toLocaleDateString('en-GB', {
                                    weekday: 'long'
                                  })}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-slate-300">Duration:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {holiday.holidayType === 'multiple-day' ? (
                                  (() => {
                                    const start = new Date(holiday.startDate);
                                    const end = new Date(holiday.endDate);
                                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                    return `${days} day${days > 1 ? 's' : ''}`;
                                  })()
                                ) : '1 day'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-slate-300">Recurring:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {holiday.recurring ? 'Annual' : 'One-time'}
                              </span>
                            </div>
                            
                            {holiday.description && (
                              <div className="pt-2 border-t border-gray-200 dark:border-slate-600">
                                <p className="text-sm text-gray-600 dark:text-slate-300 italic">
                                  {holiday.description}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                (() => {
                                  const now = new Date();
                                  if (holiday.holidayType === 'multiple-day') {
                                    const endDate = new Date(holiday.endDate);
                                    return endDate > now ? 'bg-green-500 text-white' : 'bg-gray-500 text-white';
                                  } else {
                                    const holidayDate = new Date(holiday.date);
                                    return holidayDate > now ? 'bg-green-500 text-white' : 'bg-gray-500 text-white';
                                  }
                                })()
                              }`}>
                                {(() => {
                                  const now = new Date();
                                  if (holiday.holidayType === 'multiple-day') {
                                    const endDate = new Date(holiday.endDate);
                                    return endDate > now ? '📅 Upcoming' : '📅 Past';
                                  } else {
                                    const holidayDate = new Date(holiday.date);
                                    return holidayDate > now ? '📅 Upcoming' : '📅 Past';
                                  }
                                })()}
                              </span>
                              
                              {isAdmin && (
                                <CustomButton
                                  variant="red"
                                  size="sm"
                                  onClick={() => {
                                    setHolidayDeleteConfirmation({
                                      show: true,
                                      holidayId: holiday._id,
                                      holidayName: holiday.holidayType === 'multiple-day' 
                                        ? `${holiday.name} (${new Date(holiday.startDate).toLocaleDateString('en-GB')} - ${new Date(holiday.endDate).toLocaleDateString('en-GB')})`
                                        : `${holiday.name} (${new Date(holiday.date).toLocaleDateString('en-GB')})`
                                    });
                                  }}
                                  icon={FaTrash}
                                  title="Delete Holiday"
                                  className="!p-2"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                          ))}
                        </div>
                      );
                    }
                    
                    return (
                      <div className="text-center py-12">
                        <FaGift className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Company Holidays</h4>
                        <p className="text-gray-500 dark:text-gray-400">Company holidays will appear here once they are configured in the settings.</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </Card>
        ) : settingsView && isAdmin ? (
          /* Settings Section */
          <Card className="bg-gray-50 dark:bg-slate-950">
            <div className="p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold dark:text-white flex items-center mb-4 sm:mb-6">
                <FaCog className="mr-2 text-blue-800 dark:text-teal-400 w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Attendance Settings</span>
                <span className="sm:hidden">Settings</span>
              </h3>
              {/* Settings Navigation */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-t-lg overflow-hidden shadow-sm">
                  <button 
                    onClick={() => {
                      setActiveSettingsTab('working-days');
                      loadWorkingDaysConfig();
                      // Fetch available years to populate the year dropdown
                      fetchAvailableYears(true);
                    }}
                    className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                      activeSettingsTab === 'working-days'
                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                    }`}
                  >
                    <FaBusinessTime className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Working Days</span>
                    <span className="sm:hidden">Days</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveSettingsTab('holidays');
                      loadHolidays();
                    }}
                    className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                      activeSettingsTab === 'holidays'
                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                    }`}
                  >
                    <FaGift className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Company Holidays</span>
                    <span className="sm:hidden">Holidays</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveSettingsTab('leave');
                      loadUserLeaves();
                      loadUsers();
                    }}
                    className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                      activeSettingsTab === 'leave'
                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                    }`}
                  >
                    <FaUserClock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Employee Leave</span>
                    <span className="sm:hidden">Leave</span>
                  </button>
                </div>
              </div>

              {/* Conditional Content Based on Active Tab */}
              {settingsLoading && (
                <div className="flex justify-center py-8">
                  <RahalatekLoader size="md" />
                </div>
              )}

              {!settingsLoading && activeSettingsTab === 'working-days' && (
                <div className="space-y-6">
                  {/* Year/Month Selector */}
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Select
                          label="Year"
                          value={workingDaysForm.year}
                          onChange={(value) => setWorkingDaysForm({...workingDaysForm, year: parseInt(value)})}
                          options={(() => {
                            // Get available years from attendance data
                            const baseYears = availableYears.length > 0 ? [...availableYears] : [new Date().getFullYear()];
                            
                            // Add the next year if it's not already in the list
                            const maxYear = Math.max(...baseYears);
                            const nextYear = maxYear + 1;
                            if (!baseYears.includes(nextYear)) {
                              baseYears.push(nextYear);
                            }
                            
                            // Sort years in descending order and create options
                            return baseYears
                              .sort((a, b) => b - a)
                              .map(year => ({ value: year, label: year.toString() }));
                          })()}
                        />
                      </div>
                      <div>
                        <Select
                          label="Month"
                          value={workingDaysForm.month}
                          onChange={(value) => setWorkingDaysForm({...workingDaysForm, month: parseInt(value)})}
                          options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => ({
                            value: index + 1,
                            label: month
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* User Configuration Section */}
                  <div className="mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FaUsers className="mr-2 text-blue-600 dark:text-teal-400" />
                        Configuration Mode
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Mode Selection */}
                        <div className="flex flex-wrap gap-2">
                          <CustomButton
                            onClick={() => {
                              setWorkingDaysMode('global');
                              setSelectedUserId(null);
                              loadWorkingDaysConfig();
                            }}
                            variant={workingDaysMode === 'global' ? 'blue' : 'gray'}
                            size="sm"
                          >
                            Global Configuration
                          </CustomButton>
                          <CustomButton
                            onClick={() => {
                              setWorkingDaysMode('user');
                              loadUsers();
                            }}
                            variant={workingDaysMode === 'user' ? 'blue' : 'gray'}
                            size="sm"
                          >
                            Per-User Configuration
                          </CustomButton>
                        </div>

                        {/* User Selection (only visible in user mode) */}
                        {workingDaysMode === 'user' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <SearchableSelect
                                  label="Select User"
                                  placeholder="Search and select a user..."
                                  value={selectedUserId || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedUserId(value || null);
                                    if (value) {
                                      loadUserWorkingDaysConfig(value);
                                    }
                                  }}
                                  options={users.map(user => ({
                                    value: user._id,
                                    label: user.email ? `${user.username} (${user.email})` : user.username
                                  }))}
                                />
                              </div>
                              
                              {selectedUserId && (
                                <div className="flex items-end">
                                  <CustomButton
                                    onClick={() => handleApplyGlobalToUser(selectedUserId)}
                                    variant="green"
                                    size="md"
                                    icon={FaGlobe}
                                    className="!py-3"
                                  >
                                    Apply Global Config
                                  </CustomButton>
                                </div>
                              )}
                            </div>
                            
                            {/* Daily Hours Configuration (only visible when user is selected) */}
                            {selectedUserId && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <TextInput
                                    label="Daily Working Hours"
                                    type="number"
                                    min="1"
                                    max="24"
                                    step="0.5"
                                    value={userDailyHours}
                                    onChange={(e) => setUserDailyHours(parseFloat(e.target.value) || 8)}
                                    placeholder="8"
                                    className="text-center"
                                  />
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Hours per working day (default: 8)
                                  </p>
                                </div>
                                <div className="flex items-start pt-8">
                                  <CustomButton
                                    onClick={async () => {
                                      try {
                                        // Use the selected year and month from the UI, not current date
                                        const selectedYear = workingDaysForm.year;
                                        const selectedMonth = workingDaysForm.month;
                                        
                                        // Get current working days configuration first
                                        const token = localStorage.getItem('token');
                                        const response = await axios.get(`/api/working-days/user?userId=${selectedUserId}&year=${selectedYear}&month=${selectedMonth}`, {
                                          headers: { Authorization: `Bearer ${token}` }
                                        });
                                        
                                        const currentConfig = response.data.data;
                                        
                                        // Update with new daily hours, keeping existing working days
                                        await updateUserWorkingDays(
                                          selectedUserId,
                                          selectedYear,
                                          selectedMonth,
                                          currentConfig.workingDays || [],
                                          currentConfig.defaultWorkingDaysOfWeek,
                                          userDailyHours
                                        );
                                      } catch (error) {
                                        console.error('Error updating daily hours:', error);
                                        toast.error('Failed to update daily hours');
                                      }
                                    }}
                                    variant="blue"
                                    size="md"
                                    icon={FaClock}
                                    className="!py-3"
                                  >
                                    Update Daily Hours
                                  </CustomButton>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Global Apply Options (only visible in user mode with custom configs) */}
                        {workingDaysMode === 'user' && customConfigUsers.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                              Bulk Actions
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              <CustomButton
                                onClick={() => handleApplyGlobalToAllUsers()}
                                variant="blue"
                                size="sm"
                                icon={FaGlobe}
                              >
                                Apply Global to All Users
                              </CustomButton>
                              <CustomButton
                                onClick={() => setShowCustomConfigsModal(true)}
                                variant="teal"
                                size="sm"
                                icon={FaEye}
                              >
                                View Custom Configs ({customConfigUsers.length})
                              </CustomButton>
                            </div>
                          </div>
                        )}

                        {/* Configuration Status */}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {workingDaysMode === 'global' ? (
                            <span className="flex items-center gap-2">
                              <FaGlobe className="w-4 h-4" />
                              Editing global configuration (affects all users without custom settings)
                            </span>
                          ) : selectedUserId ? (
                            <span className="flex items-center gap-2">
                              <FaUser className="w-4 h-4" />
                              Editing configuration for: {users.find(u => u._id === selectedUserId)?.username}
                              {workingDaysConfig?.isGlobal && (
                                <span className="text-gray-500">(using global settings)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-500">Select a user to configure their working days</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Configurations Modal */}
      <CustomModal
        isOpen={showCustomConfigsModal}
        onClose={() => setShowCustomConfigsModal(false)}
        title="Users with Custom Working Days"
        size="lg"
      >
        <div className="space-y-4">
          {customConfigUsers.length > 0 ? (
            <div className="space-y-3">
              {customConfigUsers.map((config) => (
                <div key={config._id} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {config.userId?.username}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {config.userId?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Updated by: {config.updatedBy?.username} • {new Date(config.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <CustomButton
                        onClick={() => {
                          setSelectedUserId(config.userId._id);
                          setWorkingDaysMode('user');
                          loadUserWorkingDaysConfig(config.userId._id);
                          setShowCustomConfigsModal(false);
                        }}
                        variant="blue"
                        size="xs"
                      >
                        Edit
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleApplyGlobalToUser(config.userId._id)}
                        variant="green"
                        size="xs"
                      >
                        Revert to Global
                      </CustomButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUser className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Custom Configurations</h4>
              <p className="text-gray-500 dark:text-gray-400">All users are using the global working days configuration.</p>
            </div>
          )}
        </div>
      </CustomModal>

                  {/* Monthly Calendar Grid */}
                  {workingDaysConfig && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
                        <span className="hidden sm:inline">
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][workingDaysForm.month - 1]} {workingDaysForm.year} - Working Days Configuration
                        </span>
                        <span className="sm:hidden">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][workingDaysForm.month - 1]} {workingDaysForm.year} - Working Days
                        </span>
                      </h4>
                      
                      {/* Month Working Days Count */}
                      <div className="text-center mb-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(() => {
                            const daysInMonth = new Date(workingDaysForm.year, workingDaysForm.month, 0).getDate();
                            let workingDaysCount = 0;
                            
                            for (let day = 1; day <= daysInMonth; day++) {
                              const dayInfo = getDayInfo(workingDaysForm.year, workingDaysForm.month - 1, day);
                              if (dayInfo.isWorkingDay && !dayInfo.isHoliday) {
                                workingDaysCount++;
                              }
                            }
                            
                            const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][workingDaysForm.month - 1];
                            const dailyHours = workingDaysMode === 'user' && selectedUserId ? userDailyHours : 8;
                            const totalHours = workingDaysCount * dailyHours;
                            return `${workingDaysCount} working days in ${monthName} (${totalHours} hours)`;
                          })()}
                        </span>
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                        {/* Header */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</span>
                          </div>
                        ))}
                        
                        {/* Days */}
                        {(() => {
                          const firstDay = new Date(workingDaysForm.year, workingDaysForm.month - 1, 1).getDay();
                          const daysInMonth = new Date(workingDaysForm.year, workingDaysForm.month, 0).getDate();
                          const days = [];
                          
                          // Empty cells for days before month starts
                          for (let i = 0; i < firstDay; i++) {
                            days.push(<div key={`empty-${i}`} className="p-0.5 sm:p-1"></div>);
                          }
                          
                          // Days of the month
                          for (let day = 1; day <= daysInMonth; day++) {
                            const dayConfig = workingDaysConfig.workingDays?.find(d => d.day === day);
                            const isWorkingDay = dayConfig?.isWorkingDay ?? true;
                            
                            days.push(
                              <div key={day} className="p-0.5 sm:p-1">
                                <button
                                  onClick={() => {
                                    const updatedWorkingDays = workingDaysConfig.workingDays?.map(d => 
                                      d.day === day ? { ...d, isWorkingDay: !d.isWorkingDay } : d
                                    ) || [];
                                    
                                    if (!dayConfig) {
                                      updatedWorkingDays.push({ day, isWorkingDay: false });
                                    }
                                    
                                    setWorkingDaysConfig({
                                      ...workingDaysConfig,
                                      workingDays: updatedWorkingDays.sort((a, b) => a.day - b.day)
                                    });
                                  }}
                                  className={`w-full h-8 sm:h-10 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all border sm:border-2 ${
                                    isWorkingDay
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50'
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50'
                                  }`}
                                  title={`Day ${day}: ${isWorkingDay ? 'Working Day' : 'Non-Working Day'} - Click to toggle`}
                                >
                                  {day}
                                </button>
                              </div>
                            );
                          }
                          
                          return days;
                        })()}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded mr-2"></span>
                          <span className="hidden sm:inline">Working Day</span>
                          <span className="sm:hidden">Working</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded mr-2"></span>
                          <span className="hidden sm:inline">Non-Working Day</span>
                          <span className="sm:hidden">Non-Working</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span className="hidden sm:inline">Click on any day to toggle between working and non-working status</span>
                        <span className="sm:hidden">Tap any day to toggle status</span>
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <CustomButton 
                          onClick={async () => {
                            if (workingDaysConfig?.workingDays) {
                              await saveWorkingDaysConfig(workingDaysConfig.workingDays);
                              // Force refresh calendar if it's open
                              if (yearlyView) {
                                setTimeout(() => {
                                  fetchSettingsData(selectedYear, currentMonth);
                                }, 500);
                              }
                            }
                          }}
                          disabled={!workingDaysConfig?.workingDays || settingsLoading}
                          variant="green"
                          size="sm"
                          className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">{settingsLoading ? 'Saving...' : 'Save Changes'}</span>
                          <span className="sm:hidden">{settingsLoading ? 'Saving...' : 'Save'}</span>
                        </CustomButton>
                        <CustomButton 
                          onClick={async () => {
                            const daysInMonth = new Date(workingDaysForm.year, workingDaysForm.month, 0).getDate();
                            const defaultWorkingDays = [];
                            
                            for (let day = 1; day <= daysInMonth; day++) {
                              const date = new Date(workingDaysForm.year, workingDaysForm.month - 1, day);
                              const dayOfWeek = date.getDay();
                              const isWorkingDay = workingDaysForm.defaultWorkingDays.includes(dayOfWeek);
                              defaultWorkingDays.push({ day, isWorkingDay });
                            }
                            
                            await saveWorkingDaysConfig(defaultWorkingDays);
                          }}
                          variant="orange"
                          size="sm"
                          className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Reset to Default</span>
                          <span className="sm:hidden">Reset</span>
                        </CustomButton>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!settingsLoading && activeSettingsTab === 'holidays' && (
                <div className="space-y-6">
                  {/* Add Holiday Form */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Add New Holiday
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <TextInput
                          label="Holiday Name"
                          type="text"
                          value={holidayForm.name}
                          onChange={(e) => setHolidayForm({...holidayForm, name: e.target.value})}
                          placeholder="e.g., New Year's Day"
                        />
                      </div>
                      <div>
                        <Select
                          label="Holiday Duration"
                          value={holidayForm.holidayType}
                          onChange={(value) => setHolidayForm({...holidayForm, holidayType: value, date: '', startDate: '', endDate: ''})}
                          options={[
                            { value: 'single-day', label: 'Single Day' },
                            { value: 'multiple-day', label: 'Multiple Days' }
                          ]}
                        />
                      </div>
                    </div>

                    {/* Dynamic Date Inputs */}
                    {holidayForm.holidayType === 'single-day' ? (
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <CustomDatePicker
                          label="Date"
                          value={holidayForm.date}
                          onChange={(value) => setHolidayForm({...holidayForm, date: value})}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <CustomDatePicker
                          label="Start Date"
                          value={holidayForm.startDate}
                          onChange={(value) => setHolidayForm({...holidayForm, startDate: value})}
                        />
                        <CustomDatePicker
                          label="End Date"
                          value={holidayForm.endDate}
                          onChange={(value) => setHolidayForm({...holidayForm, endDate: value})}
                        />
                    </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Select
                          label="Type"
                          value={holidayForm.type}
                          onChange={(value) => setHolidayForm({...holidayForm, type: value})}
                          options={[
                            { value: 'company', label: 'Company Holiday' },
                            { value: 'national', label: 'National Holiday' },
                            { value: 'religious', label: 'Religious Holiday' },
                            { value: 'custom', label: 'Custom' }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recurring
                        </label>
                        <div className="mt-2">
                          <CustomCheckbox
                            id="holiday-recurring"
                            label="Repeat yearly"
                            checked={holidayForm.isRecurring}
                            onChange={(checked) => setHolidayForm({...holidayForm, isRecurring: checked})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <TextInput
                        as="textarea"
                        rows={3}
                        label="Description (Optional)"
                        value={holidayForm.description}
                        onChange={(e) => setHolidayForm({...holidayForm, description: e.target.value})}
                        placeholder="Additional details about this holiday..."
                      />
                    </div>

                    <CustomButton
                      onClick={saveHoliday}
                      disabled={!holidayForm.name || 
                        (holidayForm.holidayType === 'single-day' && !holidayForm.date) ||
                        (holidayForm.holidayType === 'multiple-day' && (!holidayForm.startDate || !holidayForm.endDate))
                      }
                      color="purple"
                      size="sm"
                    >
                      Add Holiday
                    </CustomButton>
                  </div>


                </div>
              )}

              {!settingsLoading && activeSettingsTab === 'leave' && (
                <div className="space-y-6">
                  {/* Add Employee Leave Form */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Add Employee Leave
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <SearchableSelect
                          label="Employee"
                          value={leaveForm.userId}
                          onChange={(e) => setLeaveForm({...leaveForm, userId: e.target.value})}
                          options={users.map(user => ({
                            value: user._id,
                            label: user.username
                          }))}
                          placeholder="Select Employee"
                        />
                      </div>
                      <div>
                        <Select
                          label="Leave Type"
                          value={leaveForm.leaveType}
                          onChange={(value) => setLeaveForm({...leaveForm, leaveType: value})}
                          options={[
                            { value: 'sick', label: 'Sick Leave' },
                            { value: 'annual', label: 'Annual Leave' },
                            { value: 'emergency', label: 'Emergency Leave' },
                            { value: 'maternity', label: 'Maternity Leave' },
                            { value: 'paternity', label: 'Paternity Leave' },
                            { value: 'unpaid', label: 'Unpaid Leave' },
                            { value: 'personal', label: 'Personal Leave' },
                            { value: 'bereavement', label: 'Bereavement Leave' },
                            { value: 'custom', label: 'Custom' }
                          ]}
                        />
                      </div>
                      <div>
                        <Select
                          label="Leave Category"
                          value={leaveForm.leaveCategory}
                          onChange={(value) => setLeaveForm({...leaveForm, leaveCategory: value, date: '', startDate: '', endDate: ''})}
                          options={[
                            { value: 'hourly', label: 'Hourly Leave' },
                            { value: 'single-day', label: 'Single Day Leave' },
                            { value: 'multiple-day', label: 'Multiple Day Leave' }
                          ]}
                        />
                      </div>
                    </div>

                    {/* Dynamic Date/Time Inputs Based on Leave Category */}
                    {leaveForm.leaveCategory === 'hourly' && (
                      <>
                        <div className="mb-4">
                          <CustomDatePicker
                            label="Date"
                            value={leaveForm.date}
                            onChange={(value) => setLeaveForm({...leaveForm, date: value})}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <TextInput
                              label="Start Time"
                              type="time"
                              value={leaveForm.startTime?.includes('AM') || leaveForm.startTime?.includes('PM') 
                                ? convertTo24Hour(leaveForm.startTime) 
                                : leaveForm.startTime || '09:00'}
                              onChange={(e) => setLeaveForm({...leaveForm, startTime: convertTo12Hour(e.target.value)})}
                              placeholder="09:00 AM"
                              step="60"
                            />
                          </div>
                          <div>
                            <TextInput
                              label="End Time"
                              type="time"
                              value={leaveForm.endTime?.includes('AM') || leaveForm.endTime?.includes('PM') 
                                ? convertTo24Hour(leaveForm.endTime) 
                                : leaveForm.endTime || '17:00'}
                              onChange={(e) => setLeaveForm({...leaveForm, endTime: convertTo12Hour(e.target.value)})}
                              placeholder="05:00 PM"
                              step="60"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {leaveForm.leaveCategory === 'single-day' && (
                      <div className="mb-4">
                        <CustomDatePicker
                          label="Date"
                          value={leaveForm.date}
                          onChange={(value) => setLeaveForm({...leaveForm, date: value})}
                        />
                      </div>
                    )}
                    
                    {leaveForm.leaveCategory === 'multiple-day' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <CustomDatePicker
                          label="Start Date"
                          value={leaveForm.startDate}
                          onChange={(value) => setLeaveForm({...leaveForm, startDate: value})}
                        />
                      </div>
                      <div>
                        <CustomDatePicker
                          label="End Date"
                          value={leaveForm.endDate}
                          onChange={(value) => setLeaveForm({...leaveForm, endDate: value})}
                        />
                      </div>
                        </div>
                      )}

                    <div className="mb-4">
                      <TextInput
                        as="textarea"
                        rows={3}
                        label="Reason"
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                        placeholder="Reason for leave..."
                      />
                    </div>

                    <CustomButton
                      onClick={saveUserLeave}
                      disabled={!leaveForm.userId || 
                        (leaveForm.leaveCategory === 'hourly' && (!leaveForm.date || !leaveForm.startTime || !leaveForm.endTime)) ||
                        (leaveForm.leaveCategory === 'single-day' && !leaveForm.date) ||
                        (leaveForm.leaveCategory === 'multiple-day' && (!leaveForm.startDate || !leaveForm.endDate))
                      }
                      color="orange"
                      size="sm"
                    >
                      Add Leave
                    </CustomButton>
                  </div>


                </div>
              )}
            </div>
          </Card>
        ) : yearlyView && (isAdmin || authUser?.isAccountant) ? (
          <Card className="bg-gray-50 dark:bg-slate-950">
            {/* Responsive Calendar Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0 mb-6">
              {/* Title and Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h3 className="text-lg font-semibold dark:text-white flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-800 dark:text-teal-400" />
                  Yearly Attendance Calendar
                </h3>
                {yearlyData && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaUsers className="w-4 h-4" />
                      {yearlyData.summary?.totalUsers || 0} Employees
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarDay className="w-4 h-4" />
                      {yearlyData.summary?.totalWorkingDays || 0} Working Days ({(yearlyData.summary?.totalWorkingDays || 0) * 8} Hours)
                    </span>
                  </div>
                )}
              </div>
              
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 self-start lg:self-auto">
                <Select
                  value={selectedYear}
                  onChange={(value) => setSelectedYear(parseInt(value))}
                  options={(() => {
                    // Get available years from attendance data
                    const baseYears = availableYears.length > 0 ? [...availableYears] : [new Date().getFullYear()];
                    
                    // Add the next year if it's not already in the list
                    const maxYear = Math.max(...baseYears);
                    const nextYear = maxYear + 1;
                    if (!baseYears.includes(nextYear)) {
                      baseYears.push(nextYear);
                    }
                    
                    // Sort years in descending order and create options
                    return baseYears
                      .sort((a, b) => b - a)
                      .map(year => ({ value: year, label: year.toString() }));
                  })()}
                />
                <CustomButton
                  variant="orange"
                  onClick={() => {
                    fetchYearlyData();
                    // Also refresh settings data when refreshing calendar
                    fetchSettingsData(selectedYear, currentMonth);
                  }}
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto"
                  disabled={yearlyLoading}
                >
                  <HiRefresh className={`w-4 h-4 ${yearlyLoading ? 'animate-spin' : ''}`} />
                  <span className="sm:hidden">Refresh Data</span>
                  <span className="hidden sm:inline">Refresh</span>
                </CustomButton>
              </div>
            </div>

            {yearlyLoading ? (
              <div className="flex justify-center py-12">
                <RahalatekLoader size="lg" />
              </div>
            ) : yearlyData ? (
              <div className="space-y-6">

                {/* Calendar Carousel */}
                <div className="relative">
                  {/* Responsive Month Title */}
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {monthNames[currentMonth]} {yearlyData.year}
                    </h3>
                  </div>

                  {/* Mobile/Tablet: Calendar without side arrows */}
                  <div className="block lg:hidden w-full">
                    {(() => {
                      const monthData = yearlyData.calendar[currentMonth] || {};
                      
                      return (
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-2 sm:p-4 w-full">
                        {/* Month Working Days Info */}
                        <div className="text-center mb-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(() => {
                              // Admin calendar data only contains working days, so just count the days
                              const workingDaysInMonth = Object.keys(monthData).length;
                              const totalHours = workingDaysInMonth * 8;
                              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                              return `${workingDaysInMonth} working days in ${monthNames[currentMonth]} (${totalHours} hours)`;
                            })()}
                          </span>
                        </div>
                        
                        {/* Responsive Calendar Grid */}
                        <div className="space-y-1 sm:space-y-2">
                          {/* Responsive Days Header */}
                          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4 mb-2 sm:mb-4 lg:mb-6">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                              <div key={day} className="text-center p-1 sm:p-2 lg:p-3">
                                <span className="text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                                  {/* Show single letter on mobile, 3 letters on tablet, full on desktop */}
                                  <span className="sm:hidden">{day.charAt(0)}</span>
                                  <span className="hidden sm:inline lg:hidden">{day.slice(0, 3)}</span>
                                  <span className="hidden lg:inline">{day}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Responsive Calendar Days */}
                          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4">
                            {(() => {
                              const firstDay = new Date(yearlyData.year, currentMonth, 1).getDay();
                              const daysInMonth = new Date(yearlyData.year, currentMonth + 1, 0).getDate();
                              const days = [];
                              
                              // Empty cells for days before month starts
                              for (let i = 0; i < firstDay; i++) {
                                days.push(<div key={`empty-${i}`} className="p-0.5 sm:p-1 lg:p-3"></div>);
                              }
                              
                              // Days of the month
                              for (let day = 1; day <= daysInMonth; day++) {
                                const dayData = monthData[day];
                                const dayInfo = getDayInfo(yearlyData.year, currentMonth, day);
                                
                                // Special handling for holidays and non-working days
                                if (dayInfo.isHoliday || !dayInfo.isWorkingDay) {
                                  const tooltipInfo = {
                                    day,
                                    month: currentMonth,
                                    year: yearlyData.year,
                                    isHoliday: dayInfo.isHoliday,
                                    isWorkingDay: dayInfo.isWorkingDay,
                                    holidayInfo: dayInfo.holidayInfo,
                                    label: dayInfo.label
                                  };

                                  days.push(
                                    <div 
                                      key={day} 
                                      className="p-0.5 sm:p-1 lg:p-3 text-center relative"
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
                                      <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-14 lg:h-14 flex items-center justify-center text-xs sm:text-sm lg:text-base font-semibold rounded sm:rounded-md lg:rounded-lg ${dayInfo.bgColor} ${dayInfo.textColor} border-2 ${
                                        dayInfo.isHoliday ? 'border-purple-400' : 'border-gray-400'
                                      }`}>
                                        {day}
                                      </div>
                                    </div>
                                  );
                                } else if (dayData) {
                                  const dayInfo = getDayInfo(yearlyData.year, currentMonth, day);
                                  const currentDate = new Date();
                                  currentDate.setHours(23, 59, 59, 999); // End of today
                                  const dayDate = new Date(yearlyData.year, currentMonth, day);
                                  const isFutureDay = dayDate > currentDate;
                                  
                                  const presentCount = dayData.users.filter(user => user.status !== 'absent').length;
                                  const totalUsers = dayData.users.length;
                                  const attendanceRate = totalUsers > 0 ? (presentCount / totalUsers) * 100 : 0;
                                  
                                  let bgColor = 'bg-red-200 dark:bg-red-800/50 text-red-900 dark:text-red-100';
                                  if (isFutureDay) {
                                    bgColor = 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600';
                                  } else {
                                    if (attendanceRate >= 80) bgColor = 'bg-green-200 dark:bg-green-800/50 text-green-900 dark:text-green-100';
                                    else if (attendanceRate >= 60) bgColor = 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-100';
                                    else if (attendanceRate >= 40) bgColor = 'bg-orange-200 dark:bg-orange-800/50 text-orange-900 dark:text-orange-100';
                                  }
                                  
                                  const tooltipInfo = {
                                    day,
                                    month: currentMonth,
                                    year: yearlyData.year,
                                    attendanceRate: attendanceRate.toFixed(0),
                                    presentCount,
                                    totalUsers: dayData.users.length,
                                    hasLeave: dayInfo.hasLeave,
                                    leaveInfo: dayInfo.label,
                                    isFutureDay
                                  };

                                  days.push(
                                    <div 
                                      key={day} 
                                      className="p-0.5 sm:p-1 lg:p-3 text-center relative" 
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
                                      <div className={`relative w-6 h-6 sm:w-8 sm:h-8 lg:w-14 lg:h-14 flex items-center justify-center text-xs sm:text-sm lg:text-base font-semibold rounded sm:rounded-md lg:rounded-lg ${bgColor} ${
                                        isFutureDay 
                                          ? 'cursor-not-allowed opacity-50' 
                                          : 'cursor-pointer hover:scale-105 transition-transform shadow-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                      }`}
                                           onClick={isFutureDay ? undefined : () => handleDayClick(dayData, day, monthNames[currentMonth])}>
                                        {day}
                                        {dayInfo.hasLeave && (
                                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white flex items-center justify-center">
                                            <span className="text-xs text-white font-bold">{dayInfo.leaveInfo.length}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  days.push(
                                    <div key={day} className="p-0.5 sm:p-1 lg:p-3 text-center">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-14 lg:h-14 flex items-center justify-center text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded sm:rounded-md lg:rounded-lg border border-gray-200 dark:border-gray-700">
                                        {day}
                                      </div>
                                    </div>
                                  );
                                }
                              }
                              
                              return days;
                            })()}
                          </div>
                        </div>
                        
                        {/* Responsive Month Summary */}
                        <div className="mt-3 sm:mt-4 lg:mt-6 pt-2 sm:pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 text-center">
                            <div>
                              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                {Object.keys(monthData).length}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                <span className="sm:hidden">Days</span>
                                <span className="hidden sm:inline">Working Days</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                ({Object.keys(monthData).length * 8} Hours)
                              </div>
                            </div>
                            <div>
                              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                {(() => {
                                  const workingDays = Object.keys(monthData).length;
                                  if (workingDays === 0) return '0%';
                                  
                                  const totalPossible = workingDays * yearlyData.summary.totalUsers;
                                  const totalPresent = Object.values(monthData).reduce((total, day) => 
                                    total + day.users.filter(user => user.status !== 'absent').length, 0
                                  );
                                  
                                  return totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) + '%' : '0%';
                                })()}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                <span className="sm:hidden">Avg</span>
                                <span className="hidden sm:inline">Avg Attendance</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                {Object.values(monthData).reduce((total, day) => 
                                  total + day.users.filter(user => user.status !== 'absent').length, 0
                                )}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                <span className="sm:hidden">Present</span>
                                <span className="hidden sm:inline">Total Present</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Mobile/Tablet: Navigation arrows below calendar (hidden on desktop) */}
                  <div className="flex lg:hidden justify-center items-center gap-4 mt-4">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
                    >
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Desktop: Calendar with side arrows */}
                  <div className="hidden lg:flex items-center justify-center gap-6">
                    {/* Left Arrow */}
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
                    >
                      <FaChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Desktop Calendar */}
                    {(() => {
                      const monthData = yearlyData.calendar[currentMonth] || {};
                      
                      return (
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8 w-full max-w-4xl">
                        {/* Month Working Days Info */}
                        <div className="text-center mb-6">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {(() => {
                              // Admin calendar data only contains working days, so just count the days
                              const workingDaysInMonth = Object.keys(monthData).length;
                              const totalHours = workingDaysInMonth * 8;
                              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                              return `${workingDaysInMonth} working days in ${monthNames[currentMonth]} (${totalHours} hours)`;
                            })()}
                          </span>
                        </div>
                        
                        {/* Calendar Grid */}
                        <div className="space-y-2">
                          {/* Days Header */}
                          <div className="grid grid-cols-7 gap-4 mb-6">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                              <div key={day} className="text-center p-3">
                                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{day}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar Days */}
                          <div className="grid grid-cols-7 gap-4">
                            {(() => {
                              const firstDay = new Date(yearlyData.year, currentMonth, 1).getDay();
                              const daysInMonth = new Date(yearlyData.year, currentMonth + 1, 0).getDate();
                              const days = [];
                              
                              // Empty cells for days before month starts
                              for (let i = 0; i < firstDay; i++) {
                                days.push(<div key={`empty-${i}`} className="p-3"></div>);
                              }
                              
                              // Days of the month
                              for (let day = 1; day <= daysInMonth; day++) {
                                const dayData = monthData[day];
                                const dayInfo = getDayInfo(yearlyData.year, currentMonth, day);
                                
                                // Special handling for holidays and non-working days
                                if (dayInfo.isHoliday || !dayInfo.isWorkingDay) {
                                  const tooltipInfo = {
                                    day,
                                    month: currentMonth,
                                    year: yearlyData.year,
                                    isHoliday: dayInfo.isHoliday,
                                    isWorkingDay: dayInfo.isWorkingDay,
                                    holidayInfo: dayInfo.holidayInfo,
                                    label: dayInfo.label
                                  };

                                  days.push(
                                    <div 
                                      key={day} 
                                      className="p-3 text-center relative"
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
                                      <div className={`w-14 h-14 flex items-center justify-center text-base font-semibold rounded-lg ${dayInfo.bgColor} ${dayInfo.textColor} border-2 ${
                                        dayInfo.isHoliday ? 'border-purple-400' : 'border-gray-400'
                                      }`}>
                                        {day}
                                      </div>
                                    </div>
                                  );
                                } else if (dayData) {
                                  const dayInfo = getDayInfo(yearlyData.year, currentMonth, day);
                                  const currentDate = new Date();
                                  currentDate.setHours(23, 59, 59, 999); // End of today
                                  const dayDate = new Date(yearlyData.year, currentMonth, day);
                                  const isFutureDay = dayDate > currentDate;
                                  
                                  const presentCount = dayData.users.filter(user => user.status !== 'absent').length;
                                  const totalUsers = dayData.users.length;
                                  const attendanceRate = totalUsers > 0 ? (presentCount / totalUsers) * 100 : 0;
                                  
                                  let bgColor = 'bg-red-200 dark:bg-red-800/50 text-red-900 dark:text-red-100';
                                  if (isFutureDay) {
                                    bgColor = 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600';
                                  } else {
                                    if (attendanceRate >= 80) bgColor = 'bg-green-200 dark:bg-green-800/50 text-green-900 dark:text-green-100';
                                    else if (attendanceRate >= 60) bgColor = 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-100';
                                    else if (attendanceRate >= 40) bgColor = 'bg-orange-200 dark:bg-orange-800/50 text-orange-900 dark:text-orange-100';
                                  }
                                  
                                  const tooltipInfo = {
                                    day,
                                    month: currentMonth,
                                    year: yearlyData.year,
                                    attendanceRate: attendanceRate.toFixed(0),
                                    presentCount,
                                    totalUsers: dayData.users.length,
                                    hasLeave: dayInfo.hasLeave,
                                    leaveInfo: dayInfo.label,
                                    isFutureDay
                                  };

                                  days.push(
                                    <div 
                                      key={day} 
                                      className="p-3 text-center relative" 
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
                                      <div className={`relative w-14 h-14 flex items-center justify-center text-base font-semibold rounded-lg ${bgColor} ${
                                        isFutureDay 
                                          ? 'cursor-not-allowed opacity-50' 
                                          : 'cursor-pointer hover:scale-105 transition-transform shadow-sm border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                      }`}
                                           onClick={isFutureDay ? undefined : () => handleDayClick(dayData, day, monthNames[currentMonth])}>
                                        {day}
                                        {dayInfo.hasLeave && (
                                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border border-white flex items-center justify-center">
                                            <span className="text-xs text-white font-bold">{dayInfo.leaveInfo.length}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  days.push(
                                    <div key={day} className="p-3 text-center">
                                      <div className="w-14 h-14 flex items-center justify-center text-base text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        {day}
                                      </div>
                                    </div>
                                  );
                                }
                              }
                              
                              return days;
                            })()}
                          </div>
                        </div>
                        
                        {/* Desktop Month Summary */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {Object.keys(monthData).length}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Working Days</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                ({Object.keys(monthData).length * 8} Hours)
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {(() => {
                                  const workingDays = Object.keys(monthData).length;
                                  if (workingDays === 0) return '0%';
                                  
                                  const totalPossible = workingDays * yearlyData.summary.totalUsers;
                                  const totalPresent = Object.values(monthData).reduce((total, day) => 
                                    total + day.users.filter(user => user.status !== 'absent').length, 0
                                  );
                                  
                                  return totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) + '%' : '0%';
                                })()}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {Object.values(monthData).reduce((total, day) => 
                                  total + day.users.filter(user => user.status !== 'absent').length, 0
                                )}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Total Present</div>
                            </div>
                          </div>
                        </div>
                        </div>
                      );
                    })()}

                    {/* Right Arrow */}
                    <button
                      onClick={() => navigateMonth('next')}
                      className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
                    >
                      <FaChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Responsive Legend */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-lg bg-green-200 dark:bg-green-800/50 border border-green-300 dark:border-green-700 flex-shrink-0"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="sm:hidden">80%+</span>
                        <span className="hidden sm:inline">80%+ Present</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-lg bg-yellow-200 dark:bg-yellow-800/50 border border-yellow-300 dark:border-yellow-700 flex-shrink-0"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">60-79%</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-lg bg-orange-200 dark:bg-orange-800/50 border border-orange-300 dark:border-orange-700 flex-shrink-0"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">40-59%</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-lg bg-red-200 dark:bg-red-800/50 border border-red-300 dark:border-red-700 flex-shrink-0"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="sm:hidden">0-39%</span>
                        <span className="hidden sm:inline">Below 40%</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex-shrink-0"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="sm:hidden">Friday</span>
                        <span className="hidden sm:inline">Friday/Holiday</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 opacity-50 flex-shrink-0"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="sm:hidden">Future</span>
                        <span className="hidden sm:inline">Future Day</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-lg bg-purple-200 dark:bg-purple-800/50 border-2 border-purple-400 flex-shrink-0"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="sm:hidden">Holiday</span>
                        <span className="hidden sm:inline">Company Holiday</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="relative w-4 h-4 sm:w-6 sm:h-6 rounded-lg bg-green-200 dark:bg-green-800/50 border border-green-300 dark:border-green-700 flex-shrink-0">
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-white"></div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="sm:hidden">Leave</span>
                        <span className="hidden sm:inline">Employee Leave</span>
                      </span>
                    </div>
                  </div>
                  
                </div>

                {/* Day Details Modal */}
                <CustomModal
                  isOpen={dayModal.visible && dayModal.data}
                  onClose={closeDayModal}
                  title={dayModal.data ? `${dayModal.data.month} ${dayModal.data.day}, ${yearlyData?.year}` : ''}
                  subtitle={dayModal.data && yearlyData ? (() => {
                          const modalDate = new Date(yearlyData.year, monthNames.indexOf(dayModal.data.month), dayModal.data.day);
                          return modalDate.toLocaleDateString('en-US', { weekday: 'long' });
                  })() : ''}
                >
                  <div className="space-y-4">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <nav className="flex justify-center space-x-8" aria-label="Tabs">
                        <button
                          onClick={() => setDayModal(prev => ({ ...prev, activeTab: 'attendance' }))}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            dayModal.activeTab === 'attendance'
                              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                              : 'border-transparent text-gray-500 hover:text-teal-600 hover:border-teal-300 dark:text-gray-400 dark:hover:text-teal-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FaUserCheck className="w-4 h-4" />
                            Attendance
                          </div>
                        </button>
                        <button
                          onClick={() => setDayModal(prev => ({ ...prev, activeTab: 'leaves' }))}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            dayModal.activeTab === 'leaves'
                              ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                              : 'border-transparent text-gray-500 hover:text-orange-600 hover:border-orange-300 dark:text-gray-400 dark:hover:text-orange-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FaUserClock className="w-4 h-4" />
                            Leaves ({(() => {
                              if (!dayModal.data?.date) return 0;
                              const modalDate = new Date(dayModal.data.date);
                              return userLeaves.filter(leave => {
                                if (leave.leaveCategory === 'multiple-day') {
                                  const leaveStart = new Date(leave.startDate);
                                  leaveStart.setHours(0, 0, 0, 0);
                                  const leaveEnd = new Date(leave.endDate);
                                  leaveEnd.setHours(23, 59, 59, 999);
                                  const currentDate = new Date(modalDate);
                                  currentDate.setHours(12, 0, 0, 0);
                                  return currentDate >= leaveStart && currentDate <= leaveEnd;
                                } else {
                                  const leaveDate = new Date(leave.date);
                                  return modalDate.toDateString() === leaveDate.toDateString();
                                }
                              }).length;
                            })()})
                          </div>
                        </button>
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <CustomScrollbar className="max-h-96 space-y-6">
                      {/* Attendance Tab */}
                      {dayModal.activeTab === 'attendance' && (
                        <>
                      {/* Present Employees */}
                      {(() => {
                        const presentUsers = dayModal.data?.users.filter(user => user.status !== 'absent') || [];
                        return presentUsers.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-3 flex items-center">
                              <FaCheck className="w-4 h-4 mr-2" />
                              Present Employees ({presentUsers.length})
                            </h4>
                            <div className="space-y-3">
                              {presentUsers.map(user => (
                                <div key={user.userId} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      user.status === 'checked-out' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                    }`}>
                                      {user.status === 'checked-out' ? 'Completed' : 'Checked In'}
                                    </span>
                                  </div>
                                  
                                  {/* Hours and Times */}
                                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-4">
                                      {user.checkIn && (
                                        <span>In: {formatTime(user.checkIn)}</span>
                                      )}
                                      {user.checkOut && (
                                        <span>Out: {formatTime(user.checkOut)}</span>
                                      )}
                                    </div>
                                    {user.hoursWorked > 0 && (
                                      <span className="font-medium text-blue-600 dark:text-blue-400">
                                        {user.hoursWorked.toFixed(1)}h worked
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}

                      {/* Absent Employees */}
                      {(() => {
                        const absentUsers = dayModal.data?.users.filter(user => user.status === 'absent') || [];
                        return absentUsers.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-3 flex items-center">
                              <FaTimes className="w-4 h-4 mr-2" />
                              Absent Employees ({absentUsers.length})
                            </h4>
                            <div className="space-y-3">
                              {absentUsers.map(user => (
                                <div key={user.userId} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                                      Absent
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}

                          {/* No attendance data */}
                          {(!dayModal.data?.users || dayModal.data.users.length === 0) && (
                            <div className="text-center py-8">
                              <FaUserCheck className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                              <p className="text-gray-500 dark:text-gray-400">No attendance data for this day</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Leaves Tab */}
                      {dayModal.activeTab === 'leaves' && (
                        <>
                          {/* Employees on Leave */}
                          {(() => {
                            if (!dayModal.data?.date) return null;
                            
                            // Get employees on leave for this specific date
                            const modalDate = new Date(dayModal.data.date);
                            const employeesOnLeave = userLeaves.filter(leave => {
                              if (leave.leaveCategory === 'multiple-day') {
                                const leaveStart = new Date(leave.startDate);
                                leaveStart.setHours(0, 0, 0, 0);
                                const leaveEnd = new Date(leave.endDate);
                                leaveEnd.setHours(23, 59, 59, 999);
                                
                                const currentDate = new Date(modalDate);
                                currentDate.setHours(12, 0, 0, 0);
                                
                                return currentDate >= leaveStart && currentDate <= leaveEnd;
                              } else {
                                const leaveDate = new Date(leave.date);
                                return modalDate.toDateString() === leaveDate.toDateString();
                              }
                            });

                            return employeesOnLeave.length > 0 ? (
                              <div>
                                <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-3 flex items-center">
                                  <FaUserClock className="w-4 h-4 mr-2" />
                                  Employees on Leave ({employeesOnLeave.length})
                                </h4>
                                <div className="space-y-3">
                                  {employeesOnLeave.map(leave => (
                                    <div key={leave._id} className={`p-3 rounded-lg border ${leave.leaveCategory === 'hourly' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}`}>
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                              {leave.userId?.username || 'Unknown User'}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.leaveCategory === 'hourly' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'}`}>
                                              {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
                                            </span>
                                          </div>
                                          
                                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            {/* Duration Information */}
                                            <div className="flex items-center gap-1">
                                              <FaClock className="w-3 h-3" />
                                              <span>
                                                {leave.leaveCategory === 'hourly' && (
                                                  `${leave.hoursCount || 0}h (${leave.startTime} - ${leave.endTime})`
                                                )}
                                                {leave.leaveCategory === 'single-day' && '1 day'}
                                                {leave.leaveCategory === 'multiple-day' && `${leave.daysCount || 0} day${(leave.daysCount || 0) > 1 ? 's' : ''}`}
                                              </span>
                                            </div>
                                            
                                            {/* Date Information */}
                                            <div className="flex items-center gap-1">
                                              <FaCalendarAlt className="w-3 h-3" />
                                              <span>
                                                {leave.leaveCategory === 'multiple-day' 
                                                  ? `${new Date(leave.startDate).toLocaleDateString('en-GB')} to ${new Date(leave.endDate).toLocaleDateString('en-GB')}`
                                                  : new Date(leave.date || leave.startDate).toLocaleDateString('en-GB')
                                                }
                                              </span>
                                            </div>
                                            
                                            {/* Reason */}
                                            {leave.reason && (
                                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <span className="font-medium">Reason:</span> {leave.reason}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <FaUserClock className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No employees on leave for this day</p>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </CustomScrollbar>

                      {/* Summary */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {dayModal.data?.users.length || 0}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Total Employees</div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">
                              {dayModal.data?.users.filter(u => u.status !== 'absent').length || 0}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">Present</div>
                          </div>
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                              {(() => {
                                if (!dayModal.data?.date) return 0;
                                const modalDate = new Date(dayModal.data.date);
                                return userLeaves.filter(leave => {
                                  if (leave.leaveCategory === 'multiple-day') {
                                    const leaveStart = new Date(leave.startDate);
                                    leaveStart.setHours(0, 0, 0, 0);
                                    const leaveEnd = new Date(leave.endDate);
                                    leaveEnd.setHours(23, 59, 59, 999);
                                    const currentDate = new Date(modalDate);
                                    currentDate.setHours(12, 0, 0, 0);
                                    return currentDate >= leaveStart && currentDate <= leaveEnd;
                                  } else {
                                    const leaveDate = new Date(leave.date);
                                    return modalDate.toDateString() === leaveDate.toDateString();
                                  }
                                }).length;
                              })()}
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">On Leave</div>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {dayModal.data?.users.length > 0 ? Math.round((dayModal.data.users.filter(u => u.status !== 'absent').length / dayModal.data.users.length) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Attendance Rate</div>
                          </div>
                        </div>
                      </div>
                        </div>
                </CustomModal>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No yearly data available. Click refresh to load.</p>
              </div>
            )}
          </Card>
        ) : (
          /* Reports Section */
          <Card className="bg-gray-50 dark:bg-slate-950">
          {/* Reports Subtabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
            <h3 className="text-lg font-semibold dark:text-white flex items-center">
              <FaChartLine className="mr-2 text-blue-800 dark:text-teal-400" />
              Reports
            </h3>
          </div>

          {/* Reports Subtabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveReportsTab('attendance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeReportsTab === 'attendance'
                    ? 'border-blue-500 dark:border-teal-500 text-blue-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <FaList className="w-4 h-4 inline-block mr-2" />
                Attendance Reports
              </button>
              <button
                onClick={() => setActiveReportsTab('working-hours')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeReportsTab === 'working-hours'
                    ? 'border-blue-500 dark:border-teal-500 text-blue-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <FaClock className="w-4 h-4 inline-block mr-2" />
                Working Hours Tracking
              </button>
            </nav>
          </div>

          {/* Attendance Reports Tab */}
          {activeReportsTab === 'attendance' && (
            <>
              {/* Responsive Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <h4 className="text-md font-semibold dark:text-white flex items-center">
                  <FaList className="mr-2 text-blue-600 dark:text-teal-400" />
                  Attendance Records
                </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              {isAdmin && (
                <CustomButton
                  variant="green"
                  size="sm"
                  onClick={() => setCreateModal({ visible: true, data: {} })}
                  icon={HiPlus}
                  disabled={adminActionLoading}
                  className="w-full sm:w-auto"
                >
                  <span className="sm:hidden">Create</span>
                  <span className="hidden sm:inline">Manual Entry</span>
                </CustomButton>
              )}
              <CustomButton
                variant="gray"
                size="sm"
                onClick={exportReport}
                icon={FaDownload}
                disabled={attendanceReports.length === 0}
                className="w-full sm:w-auto"
              >
                <span className="sm:hidden">Export</span>
                <span className="hidden sm:inline">Export CSV</span>
              </CustomButton>
              <CustomButton
                variant="orange"
                size="sm"
                onClick={fetchAttendanceReports}
                icon={HiRefresh}
                disabled={reportLoading}
                className="w-full sm:w-auto"
              >
                Refresh
              </CustomButton>
            </div>
          </div>

          {/* Responsive Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Period
              </label>
              <Select
                value={reportFilters.period}
                onChange={(value) => setReportFilters({
                  ...reportFilters, 
                  period: value
                })}
                options={[
                  { value: 'daily', label: 'Today' },
                  { value: 'weekly', label: 'This Week' },
                  { value: 'monthly', label: 'This Month' },
                  { value: 'yearly', label: 'This Year' }
                ]}
              />
            </div>
            
            {/* Date Picker - Always visible */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date
              </label>
              <CustomDatePicker
                value={reportFilters.specificDate}
                onChange={(date) => setReportFilters({...reportFilters, specificDate: date, period: 'custom'})}
                placeholder="DD/MM/YYYY"
                popupPosition="up"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employee
              </label>
              <SearchableSelect
                value={reportFilters.userId}
                onChange={(e) => setReportFilters({...reportFilters, userId: e.target.value})}
                options={[
                  { value: '', label: 'All Employees' },
                  ...users.map(user => ({
                    value: user._id,
                    label: user.username
                  }))
                ]}
                placeholder="Select employee..."
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <Select
                value={reportFilters.status}
                onChange={(value) => setReportFilters({...reportFilters, status: value})}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'checked-in', label: 'Checked In' },
                  { value: 'checked-out', label: 'Checked Out' },
                  { value: 'not-checked-in', label: 'Not Checked In' }
                ]}
                placeholder="All Statuses"
              />
            </div>
          </div>

          {/* Responsive Summary Cards */}
          {reportSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 p-3 sm:p-4 rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                    <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</h3>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {reportSummary.totalRecords}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4 rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
                    <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Checked In</h3>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {reportSummary.checkedInToday}
                </div>
              </div>
              
              {/* Checked Out */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 p-3 sm:p-4 rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg">
                    <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Checked Out</h3>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {reportSummary.checkedOutToday}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 p-3 sm:p-4 rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
                    <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</h3>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {reportSummary.totalHours.toFixed(1)}h
                </div>
              </div>
            </div>
          )}

          {/* Responsive Reports Table */}
          {reportLoading ? (
            <div className="flex justify-center py-8">
              <RahalatekLoader size="lg" />
            </div>
          ) : attendanceReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No attendance records found for the selected criteria.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <CustomScrollbar>
                <div className="min-w-full">
                  <CustomTable
                    headers={[
                      { label: 'Date' },
                      { label: 'Employee' },
                      { label: 'Check In' },
                      { label: 'Check Out' },
                      { label: 'Hours' },
                      { label: 'Status' },
                      ...(isAdmin ? [{ label: 'Actions' }] : [])
                    ]}
                    data={attendanceReports}
                    renderRow={(record) => (
                      <>
                        <Table.Cell className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          <div className="text-xs sm:text-sm">
                            {formatDate(record.date)}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {hasHourlyLeaveOnDate(record.userId?._id, record.date) ? (
                              <CustomTooltip
                                {...getHourlyLeaveTooltip(record.userId?._id, record.date)}
                              >
                                <div className="text-xs sm:text-sm font-medium max-w-[120px] truncate text-yellow-600 dark:text-yellow-400 cursor-help">
                                  {record.userId?.username || 'Unknown'}
                                </div>
                              </CustomTooltip>
                            ) : (
                              <div className="text-xs sm:text-sm font-medium max-w-[120px] truncate text-gray-900 dark:text-white">
                                {record.userId?.username || 'Unknown'}
                              </div>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono">
                            {formatTime(record.checkIn)}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900 dark:text-white font-mono">
                            {formatTime(record.checkOut)}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {(() => {
                              if (!record.hoursWorked) return '--';
                              
                              const actualHours = calculateActualWorkHours(record);
                              const originalHours = record.hoursWorked;
                              
                              // If hours were deducted, show both original and actual on same line
                              if (actualHours !== originalHours) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <span className="text-red-500 line-through text-xs">{originalHours}h</span>
                                    <span className="text-green-600 font-semibold">{actualHours}h</span>
                                  </div>
                                );
                              }
                              
                              return `${actualHours}h`;
                            })()}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {getStatusIcon(record.status)}
                            <span className={`${getStatusBadge(record.status)} text-xs px-2 py-1`}>
                              {record.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {record.manuallyEdited && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Edited
                              </span>
                            )}
                          </div>
                        </Table.Cell>
                        {isAdmin && (
                          <Table.Cell className="whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditAttendance(record)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                disabled={adminActionLoading}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAttendance(record)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                disabled={adminActionLoading}
                              >
                                Delete
                              </button>
                            </div>
                          </Table.Cell>
                        )}
                      </>
                    )}
                    emptyMessage="No attendance records found."
                  />
                </div>
              </CustomScrollbar>
            </div>
          )}
            </>
          )}

          {/* Working Hours Tracking Tab */}
          {activeReportsTab === 'working-hours' && (
            <>
              {/* Working Hours Filters */}
              <div className="mb-6">
                <h4 className="text-md font-semibold dark:text-white mb-4 flex items-center">
                  <FaClock className="mr-2 text-blue-600 dark:text-teal-400" />
                  Working Hours Analysis
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* User Filter */}
                  <div>
                    <SearchableSelect
                      label="Select Employee"
                      placeholder="All Employees"
                      value={workingHoursFilters.userId}
                      onChange={(e) => setWorkingHoursFilters(prev => ({ ...prev, userId: e.target.value }))}
                      options={[
                        { value: '', label: 'All Employees' },
                        ...users.map(user => ({ 
                          value: user._id, 
                          label: user.email ? `${user.username} (${user.email})` : user.username
                        }))
                      ]}
                    />
                  </div>
                  
                  {/* Year Filter */}
                  <div>
                    <Select
                      label="Year"
                      value={workingHoursFilters.year}
                      onChange={(value) => setWorkingHoursFilters(prev => ({ ...prev, year: parseInt(value) }))}
                      options={availableYears.length > 0 
                        ? availableYears.map(year => ({ value: year, label: year.toString() }))
                        : [
                            { value: new Date().getFullYear(), label: new Date().getFullYear().toString() },
                            { value: new Date().getFullYear() - 1, label: (new Date().getFullYear() - 1).toString() }
                          ]
                      }
                    />
                  </div>
                  
                  {/* Month Filter */}
                  <div>
                    <Select
                      label="Month"
                      value={workingHoursFilters.month}
                      onChange={(value) => setWorkingHoursFilters(prev => ({ ...prev, month: parseInt(value) }))}
                      options={[
                        { value: 1, label: 'January' },
                        { value: 2, label: 'February' },
                        { value: 3, label: 'March' },
                        { value: 4, label: 'April' },
                        { value: 5, label: 'May' },
                        { value: 6, label: 'June' },
                        { value: 7, label: 'July' },
                        { value: 8, label: 'August' },
                        { value: 9, label: 'September' },
                        { value: 10, label: 'October' },
                        { value: 11, label: 'November' },
                        { value: 12, label: 'December' }
                      ]}
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <CustomButton
                    variant="red"
                    size="sm"
                    onClick={() => {
                      setWorkingHoursFilters({
                        userId: '',
                        year: new Date().getFullYear(),
                        month: new Date().getMonth() + 1
                      });
                    }}
                    icon={FaTimes}
                    disabled={
                      workingHoursLoading || 
                      (workingHoursFilters.userId === '' && 
                       workingHoursFilters.year === new Date().getFullYear() && 
                       workingHoursFilters.month === new Date().getMonth() + 1)
                    }
                  >
                    Reset Filters
                  </CustomButton>
                  <CustomButton
                    variant="orange"
                    size="sm"
                    onClick={fetchWorkingHoursTracking}
                    icon={HiRefresh}
                    disabled={workingHoursLoading}
                  >
                    Refresh Data
                  </CustomButton>
                </div>
              </div>

              {/* Working Hours Table */}
              {workingHoursLoading ? (
                <div className="flex justify-center py-8">
                  <RahalatekLoader size="lg" />
                </div>
              ) : workingHoursData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No working hours data found for the selected criteria.
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <CustomScrollbar>
                    <div className="min-w-full">
                      <CustomTable
                        headers={[
                          { label: 'Employee', className: 'text-left w-1/4' },
                          { label: 'Required Hours', className: 'text-center w-1/5' },
                          { label: 'Hours Worked', className: 'text-center w-1/5' },
                          { label: 'Progress', className: 'text-center w-1/4' },
                          { label: 'Records', className: 'text-center w-1/12' }
                        ]}
                        data={workingHoursData}
                        renderRow={(data) => (
                          <>
                            <Table.Cell className="font-medium text-gray-900 dark:text-white text-left w-1/4">
                              <div className="flex flex-col">
                                {hasHourlyLeaveInMonth(data) ? (
                                  <CustomTooltip
                                    {...getMonthlyHourlyLeaveTooltip(data)}
                                  >
                                    <span className="font-semibold text-sm text-yellow-600 dark:text-yellow-400 cursor-help">
                                      {data.username}
                                    </span>
                                  </CustomTooltip>
                                ) : (
                                  <span className="font-semibold text-sm">{data.username}</span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">{data.email}</span>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="text-center w-1/5">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-blue-600 dark:text-blue-500 text-sm">
                                  {data.totalRequiredHours}h
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({data.totalWorkingDays} days × {data.dailyHours || 8}h)
                                </span>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="text-center w-1/5">
                              {(() => {
                                const hoursCalc = calculateActualWorkedHoursForEmployee(data);
                                
                                if (hoursCalc.hasDeduction) {
                                  return (
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center gap-1">
                                        <span className="font-bold text-xs text-red-500 line-through">
                                          {hoursCalc.originalHours}h
                                        </span>
                                        <span className={`font-bold text-sm ${
                                          hoursCalc.actualHours >= data.totalRequiredHours 
                                            ? 'text-green-600 dark:text-green-500' 
                                            : 'text-red-600 dark:text-red-500'
                                        }`}>
                                          {hoursCalc.actualHours}h
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        (-{hoursCalc.deductedHours}h leave)
                                      </span>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <span className={`font-bold text-sm ${
                                    data.totalHoursWorked >= data.totalRequiredHours 
                                      ? 'text-green-600 dark:text-green-500' 
                                      : 'text-red-600 dark:text-red-500'
                                  }`}>
                                    {data.totalHoursWorked}h
                                  </span>
                                );
                              })()}
                            </Table.Cell>
                            <Table.Cell className="text-center w-1/4">
                              {(() => {
                                const hoursCalc = calculateActualWorkedHoursForEmployee(data);
                                const actualPercentage = Math.round((hoursCalc.actualHours / data.totalRequiredHours) * 100);
                                
                                return (
                                  <div className="flex items-center justify-center">
                                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          actualPercentage >= 100 ? 'bg-green-600' :
                                          actualPercentage >= 80 ? 'bg-yellow-600' :
                                          'bg-red-700'
                                        }`}
                                        style={{ width: `${Math.min(actualPercentage, 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className={`text-xs font-medium ${
                                      actualPercentage >= 100 ? 'text-green-600 dark:text-green-400' :
                                      actualPercentage >= 80 ? 'text-yellow-600 dark:text-yellow-400' :
                                      'text-red-600 dark:text-red-400'
                                    }`}>
                                      {actualPercentage}%
                                    </span>
                                  </div>
                                );
                              })()}
                            </Table.Cell>
                            <Table.Cell className="text-center w-1/12">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {data.attendanceRecords}
                              </span>
                            </Table.Cell>
                          </>
                        )}
                        emptyMessage="No working hours data found."
                      />
                    </div>
                  </CustomScrollbar>
                </div>
              )}
            </>
          )}
        </Card>
        )}

        {/* User Annual Leave Section - Shows for all users when not in admin views */}

      </div>

      {/* Edit Attendance Modal */}
      {editModal.visible && (
        <AttendanceEditModal
          isOpen={editModal.visible}
          onClose={() => setEditModal({ visible: false, data: null })}
          attendanceData={editModal.data}
          onSubmit={submitEditAttendance}
          isLoading={adminActionLoading}
        />
      )}

      {/* Create Attendance Modal */}
      {createModal.visible && (
        <AttendanceCreateModal
          isOpen={createModal.visible}
          onClose={() => setCreateModal({ visible: false, data: null })}
          initialData={createModal.data}
          users={users}
          onSubmit={submitCreateAttendance}
          isLoading={adminActionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, recordId: null, recordData: null })}
        onConfirm={confirmDeleteAttendance}
        isLoading={adminActionLoading}
        itemType="attendance record"
        itemName={deleteModal.recordData ? `${deleteModal.recordData.userId?.username || 'User'}` : ''}
        itemExtra={deleteModal.recordData ? new Date(deleteModal.recordData.date).toLocaleDateString('en-GB') : ''}
      />

      {/* Leave Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteConfirmation.show}
        onClose={() => setDeleteConfirmation({ show: false, leaveId: null, leaveName: '' })}
        onConfirm={() => {
          deleteUserLeave(deleteConfirmation.leaveId);
          setDeleteConfirmation({ show: false, leaveId: null, leaveName: '' });
        }}
        isLoading={settingsLoading}
        itemType="leave record"
        itemName={deleteConfirmation.leaveName}
      />

      {/* Holiday Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={holidayDeleteConfirmation.show}
        onClose={() => setHolidayDeleteConfirmation({ show: false, holidayId: null, holidayName: '' })}
        onConfirm={() => {
          deleteHoliday(holidayDeleteConfirmation.holidayId);
        }}
        isLoading={settingsLoading}
        itemType="holiday"
        itemName={holidayDeleteConfirmation.holidayName}
      />

      {/* Custom Tooltip */}
      {hoveredDay && (
        <div 
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y
          }}
        >
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-3 max-w-xs">
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {new Date(hoveredDay.year, hoveredDay.month, hoveredDay.day).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <div className="space-y-1 text-xs">
              {/* Holiday Information */}
              {hoveredDay.isHoliday && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-2 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-600 dark:text-purple-400 text-sm">🎉</span>
                    <span className="font-semibold text-purple-900 dark:text-purple-100">
                      {hoveredDay.holidayInfo?.name || 'Holiday'}
                    </span>
                  </div>
                  {hoveredDay.holidayInfo?.description && (
                    <p className="text-purple-700 dark:text-purple-300 text-xs leading-tight">
                      {hoveredDay.holidayInfo.description}
                    </p>
                  )}
                </div>
              )}

              {/* Non-Working Day Information */}
              {!hoveredDay.isWorkingDay && !hoveredDay.isHoliday && (
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-md p-2 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">📅</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                      Non-Working Day
                    </span>
                  </div>
                </div>
              )}

              {/* Attendance Information (for regular days) */}
              {hoveredDay.attendanceRate !== undefined && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Attendance Rate:</span>
                    <span className={`font-semibold ${
                      hoveredDay.isFutureDay 
                        ? 'text-gray-500' 
                        : hoveredDay.attendanceRate >= 80 
                          ? 'text-green-600 dark:text-green-400' 
                          : hoveredDay.attendanceRate >= 60 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                      {hoveredDay.isFutureDay ? 'Future' : `${hoveredDay.attendanceRate}%`}
                    </span>
                  </div>
                  
                  {!hoveredDay.isFutureDay && hoveredDay.presentCount !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Present/Total:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {hoveredDay.presentCount}/{hoveredDay.totalUsers}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              {/* Leave Information */}
              {hoveredDay.hasLeave && (
                <div className="pt-1 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 text-xs">🏖️</span>
                    <span className="text-gray-600 dark:text-gray-300 text-xs leading-tight">
                      {hoveredDay.leaveInfo}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-slate-600"></div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-slate-800 -mt-1"></div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Leave Modal */}
      {editLeaveModal.visible && (
        <CustomModal
          isOpen={editLeaveModal.visible}
          onClose={() => setEditLeaveModal({ visible: false, leave: null })}
          title="Edit Leave"
          subtitle={editLeaveModal.leave ? `Editing ${editLeaveModal.leave.userId?.username || 'Unknown'}'s ${editLeaveModal.leave.leaveType} leave` : ''}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateLeave(); }} className="space-y-4">
            {/* Leave Type */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Leave Type"
                value={editLeaveForm.leaveType}
                onChange={(value) => setEditLeaveForm(prev => ({ ...prev, leaveType: value }))}
                options={[
                  { value: 'sick', label: 'Sick Leave' },
                  { value: 'annual', label: 'Annual Leave' },
                  { value: 'emergency', label: 'Emergency Leave' },
                  { value: 'maternity', label: 'Maternity Leave' },
                  { value: 'paternity', label: 'Paternity Leave' },
                  { value: 'unpaid', label: 'Unpaid Leave' },
                  { value: 'personal', label: 'Personal Leave' },
                  { value: 'bereavement', label: 'Bereavement Leave' },
                  { value: 'custom', label: 'Custom' }
                ]}
                required
              />
              
              <Select
                label="Category"
                value={editLeaveForm.leaveCategory}
                onChange={(value) => setEditLeaveForm(prev => ({ ...prev, leaveCategory: value }))}
                options={[
                  { value: 'hourly', label: 'Hourly' },
                  { value: 'single-day', label: 'Single Day' },
                  { value: 'multiple-day', label: 'Multiple Days' }
                ]}
                required
              />
            </div>

            {/* Custom Leave Type - Only show if custom is selected */}
            {editLeaveForm.leaveType === 'custom' && (
              <TextInput
                label="Custom Leave Type"
                value={editLeaveForm.customLeaveType}
                onChange={(e) => setEditLeaveForm(prev => ({ ...prev, customLeaveType: e.target.value }))}
                placeholder="Enter custom leave type"
                maxLength={50}
              />
            )}

            {/* Date fields based on category */}
            {editLeaveForm.leaveCategory === 'single-day' && (
              <CustomDatePicker
                label="Date *"
                value={editLeaveForm.date}
                onChange={(date) => setEditLeaveForm(prev => ({ ...prev, date }))}
                placeholder="Select date"
                required
                popupSize="small"
              />
            )}

            {editLeaveForm.leaveCategory === 'hourly' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <CustomDatePicker
                    label="Date *"
                    value={editLeaveForm.date}
                    onChange={(date) => setEditLeaveForm(prev => ({ ...prev, date }))}
                    placeholder="Select date"
                    required
                    popupSize="small"
                  />
                </div>
                <TextInput
                  label="Start Time"
                  type="time"
                  value={editLeaveForm.startTime?.includes('AM') || editLeaveForm.startTime?.includes('PM') 
                    ? convertTo24Hour(editLeaveForm.startTime) 
                    : editLeaveForm.startTime || '09:00'}
                  onChange={(e) => setEditLeaveForm(prev => ({ ...prev, startTime: convertTo12Hour(e.target.value) }))}
                  placeholder="09:00 AM"
                  step="60"
                />
                <TextInput
                  label="End Time"
                  type="time"
                  value={editLeaveForm.endTime?.includes('AM') || editLeaveForm.endTime?.includes('PM') 
                    ? convertTo24Hour(editLeaveForm.endTime) 
                    : editLeaveForm.endTime || '17:00'}
                  onChange={(e) => setEditLeaveForm(prev => ({ ...prev, endTime: convertTo12Hour(e.target.value) }))}
                  placeholder="05:00 PM"
                  step="60"
                />
              </div>
            )}

            {editLeaveForm.leaveCategory === 'multiple-day' && (
              <div className="grid grid-cols-2 gap-4">
                <CustomDatePicker
                  label="Start Date *"
                  value={editLeaveForm.startDate}
                  onChange={(date) => setEditLeaveForm(prev => ({ ...prev, startDate: date }))}
                  placeholder="Select start date"
                  required
                  popupSize="small"
                />
                <CustomDatePicker
                  label="End Date *"
                  value={editLeaveForm.endDate}
                  onChange={(date) => setEditLeaveForm(prev => ({ ...prev, endDate: date }))}
                  placeholder="Select end date"
                  required
                  popupSize="small"
                />
              </div>
            )}

            {/* Status */}
            <Select
              label="Status"
              value={editLeaveForm.status}
              onChange={(value) => setEditLeaveForm(prev => ({ ...prev, status: value }))}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              required
            />

            {/* Reason */}
            <TextInput
              as="textarea"
              rows={3}
              label="Reason"
              value={editLeaveForm.reason}
              onChange={(e) => setEditLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Reason for leave..."
              maxLength={500}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <CustomButton 
                variant="gray" 
                onClick={() => setEditLeaveModal({ visible: false, leave: null })} 
                disabled={editLeaveLoading}
              >
                Cancel
              </CustomButton>
              <CustomButton 
                type="submit" 
                disabled={editLeaveLoading}
                variant="teal"
              >
                {editLeaveLoading ? 'Updating...' : 'Update Leave'}
              </CustomButton>
            </div>
          </form>
        </CustomModal>
      )}
    </Card>
  );
}



// Edit Attendance Modal Component
function AttendanceEditModal({ isOpen, onClose, attendanceData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    checkInTime: attendanceData?.checkInTime || '',
    checkOutTime: attendanceData?.checkOutTime || '',
    status: attendanceData?.status || 'checked-out',
    notes: attendanceData?.notes || '',
    adminNotes: attendanceData?.adminNotes || '',
    date: attendanceData?.date || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Attendance - ${attendanceData?.userId?.username}`}
      subtitle={formData.date}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            type="time"
            label="Check In Time"
            value={formData.checkInTime}
            onChange={(e) => handleChange('checkInTime', e.target.value)}
            step="60"
          />
          <TextInput
            type="time"
            label="Check Out Time"
            value={formData.checkOutTime}
            onChange={(e) => handleChange('checkOutTime', e.target.value)}
            step="60"
          />
        </div>

        <Select
          label="Status"
          value={formData.status}
          onChange={(value) => handleChange('status', value)}
          options={[
            { value: 'not-checked-in', label: 'Not Checked In' },
            { value: 'checked-in', label: 'Checked In' },
            { value: 'checked-out', label: 'Checked Out' }
          ]}
        />

        <TextInput
          as="textarea"
          rows={3}
          label="Employee Notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Employee notes..."
        />

        <TextInput
          as="textarea"
          rows={3}
          label="Admin Notes"
          value={formData.adminNotes}
          onChange={(e) => handleChange('adminNotes', e.target.value)}
          placeholder="Reason for edit..."
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CustomButton variant="gray" onClick={onClose} disabled={isLoading}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}

// Create Attendance Modal Component
function AttendanceCreateModal({ isOpen, onClose, initialData, users, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    userId: initialData?.userId || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    checkInTime: '09:00',
    checkOutTime: '17:00',
    status: 'checked-out',
    notes: '',
    adminNotes: 'Manually created by admin'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedUser = users.find(u => u._id === formData.userId);

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Manual Attendance Entry"
      subtitle={selectedUser ? `For ${selectedUser.username}` : 'Select employee and set attendance details'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Employee"
            value={formData.userId}
            onChange={(value) => handleChange('userId', value)}
            options={[
              { value: '', label: 'Select Employee' },
              ...users.map(user => ({ 
                value: user._id, 
                label: user.username 
              }))
            ]}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Date *
            </label>
            <CustomDatePicker
              value={formData.date}
              onChange={(date) => handleChange('date', date)}
              placeholder="Select date"
              required
              popupSize="small"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            type="time"
            label="Check In Time"
            value={formData.checkInTime}
            onChange={(e) => handleChange('checkInTime', e.target.value)}
            step="60"
          />
          <TextInput
            type="time"
            label="Check Out Time"
            value={formData.checkOutTime}
            onChange={(e) => handleChange('checkOutTime', e.target.value)}
            step="60"
          />
        </div>

        <TextInput
          as="textarea"
          rows={3}
          label="Employee Notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Reason for attendance (sick leave, forgot to check in, etc.)"
        />

        <TextInput
          as="textarea"
          rows={2}
          label="Admin Notes"
          value={formData.adminNotes}
          onChange={(e) => handleChange('adminNotes', e.target.value)}
          placeholder="Internal admin notes..."
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CustomButton variant="gray" onClick={onClose} disabled={isLoading}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Entry'}
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
