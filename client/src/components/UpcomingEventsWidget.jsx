import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaPlane, 
  FaPlaneArrival, 
  FaPlaneDeparture,
  FaGift,
  FaClock,
  FaUsers,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { getAllVouchers } from '../utils/voucherApi';
import RahalatekLoader from './RahalatekLoader';
import CustomButton from './CustomButton';
import CustomScrollbar from './CustomScrollbar';
import axios from 'axios';

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState({
    departures: [],
    arrivals: [],
    holidays: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('departures');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUpcomingEvents();
    }
  }, [user]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch vouchers and holidays in parallel
      const [vouchersResponse, holidaysResponse] = await Promise.all([
        getAllVouchers(),
        axios.get('/api/holidays', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const vouchers = vouchersResponse.data || [];
      const holidays = holidaysResponse.data.data || [];

      // Filter vouchers based on user role
      let filteredVouchers = vouchers;
      if (!user?.isAdmin && !user?.isAccountant) {
        filteredVouchers = vouchers.filter(voucher => 
          voucher.createdBy?._id === user?.id || voucher.createdBy === user?.id
        );
      }

      // Get current date and next 7 days (including today)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const next7Days = new Date(today);
      next7Days.setDate(next7Days.getDate() + 7);
      next7Days.setHours(23, 59, 59, 999); // Include the entire last day

      // Filter departures (today through next 7 days)
      const departures = filteredVouchers
        .filter(voucher => {
          const departureDate = new Date(voucher.departureDate);
          const departureDateOnly = new Date(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate());
          const status = voucher.status || 'await';
          return departureDateOnly.getTime() >= today.getTime() && 
                 departureDateOnly.getTime() <= next7Days.getTime() && 
                 ['await', 'arrived'].includes(status);
        })
        .sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate));

      // Filter arrivals (today through next 7 days)
      const arrivals = filteredVouchers
        .filter(voucher => {
          const arrivalDate = new Date(voucher.arrivalDate);
          const arrivalDateOnly = new Date(arrivalDate.getFullYear(), arrivalDate.getMonth(), arrivalDate.getDate());
          const status = voucher.status || 'await';
          return arrivalDateOnly.getTime() >= today.getTime() && 
                 arrivalDateOnly.getTime() <= next7Days.getTime() && 
                 ['await', 'arrived'].includes(status);
        })
        .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate));

      // Filter holidays (next 30 days)
      const next30Days = new Date(today);
      next30Days.setDate(next30Days.getDate() + 30);
      
      const upcomingHolidays = holidays
        .filter(holiday => {
          if (!holiday.isActive) return false;
          
          let holidayDate;
          if (holiday.holidayType === 'single-day') {
            holidayDate = new Date(holiday.date);
          } else {
            holidayDate = new Date(holiday.startDate);
          }
          
          const holidayDateOnly = new Date(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate());
          return holidayDateOnly >= today && holidayDateOnly <= next30Days;
        })
        .sort((a, b) => {
          const dateA = new Date(a.holidayType === 'single-day' ? a.date : a.startDate);
          const dateB = new Date(b.holidayType === 'single-day' ? b.date : b.startDate);
          return dateA - dateB;
        })
;

      setEvents({
        departures,
        arrivals,
        holidays: upcomingHolidays
      });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  const formatDateWithTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: formatDate(dateString),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'departures':
        return events.departures.length === 0 ? (
          <div className="text-center py-8">
            <FaPlaneDeparture className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No departures in next 7 days</p>
          </div>
        ) : (
          <CustomScrollbar maxHeight="350px">
            <div className="space-y-3">
              {events.departures.map((voucher) => {
              const { date, time } = formatDateWithTime(voucher.departureDate);
              return (
                <div key={voucher._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <FaPlaneDeparture className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          #{voucher.voucherNumber}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {voucher.clientName}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {date} • {time}
                      </div>
                    </div>
                  </div>
                  <Link to={`/vouchers/${voucher._id}`}>
                    <CustomButton variant="teal" size="xs" icon={FaPlane} />
                  </Link>
                </div>
              );
              })}
            </div>
          </CustomScrollbar>
        );

      case 'arrivals':
        return events.arrivals.length === 0 ? (
          <div className="text-center py-8">
            <FaPlaneArrival className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No arrivals in next 7 days</p>
          </div>
        ) : (
          <CustomScrollbar maxHeight="350px">
            <div className="space-y-3">
              {events.arrivals.map((voucher) => {
              const { date, time } = formatDateWithTime(voucher.arrivalDate);
              return (
                <div key={voucher._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FaPlaneArrival className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          #{voucher.voucherNumber}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {voucher.clientName}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {date} • {time}
                      </div>
                    </div>
                  </div>
                  <Link to={`/vouchers/${voucher._id}`}>
                    <CustomButton variant="teal" size="xs" icon={FaPlane} />
                  </Link>
                </div>
              );
              })}
            </div>
          </CustomScrollbar>
        );

      case 'holidays':
        return events.holidays.length === 0 ? (
          <div className="text-center py-8">
            <FaGift className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No holidays in next 30 days</p>
          </div>
        ) : (
          <CustomScrollbar maxHeight="350px">
            <div className="space-y-3">
              {events.holidays.map((holiday) => {
              const holidayDate = holiday.holidayType === 'single-day' ? holiday.date : holiday.startDate;
              const endDate = holiday.holidayType === 'multiple-day' ? holiday.endDate : null;
              
              return (
                <div key={holiday._id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FaGift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {holiday.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(holidayDate)}
                      {endDate && ` - ${formatDate(endDate)}`}
                      {holiday.holidayType === 'multiple-day' && (
                        <span className="ml-1 text-purple-600 dark:text-purple-400">
                          (Multi-day)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </CustomScrollbar>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
            <FaCalendarAlt className="text-blue-600 dark:text-teal-400 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Upcoming Events</h3>
        </div>
        <Link 
          to="/dashboard"
          className="p-2 text-blue-600 dark:text-teal-400 hover:text-blue-700 dark:hover:text-teal-300 transition-all duration-200 rounded-xl hover:bg-blue-50 dark:hover:bg-teal-900/20"
        >
          <FaExternalLinkAlt className="w-5 h-5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <button
          onClick={() => setActiveTab('departures')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'departures'
              ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <FaPlaneDeparture className="w-4 h-4" />
          Departures
          {events.departures.length > 0 && (
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs">
              {events.departures.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('arrivals')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'arrivals'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <FaPlaneArrival className="w-4 h-4" />
          Arrivals
          {events.arrivals.length > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
              {events.arrivals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'holidays'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <FaGift className="w-4 h-4" />
          Holidays
          {events.holidays.length > 0 && (
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs">
              {events.holidays.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <RahalatekLoader size="md" />
          </div>
        ) : (
          getTabContent()
        )}
      </div>
    </div>
  );
}
