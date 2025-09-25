import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Modal } from 'flowbite-react';
import axios from 'axios';
import { FaPlane, FaTicketAlt, FaUser, FaBell, FaPlus, FaChartLine, FaSpinner } from 'react-icons/fa';
import RahalatekLoader from './RahalatekLoader';
import HomeCalendar from './HomeCalendar';
import RecentVoucherActivity from './RecentVoucherActivity';
import QuickActionsPanel from './QuickActionsPanel';
import RecentNotificationsWidget from './RecentNotificationsWidget';
import UpcomingEventsWidget from './UpcomingEventsWidget';
import WeatherCarouselWidget from './WeatherCarouselWidget';
import ActiveVouchersModal from './ActiveVouchersModal';
import EmailVerificationAlert from './EmailVerificationAlert';

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActiveVouchersModal, setShowActiveVouchersModal] = useState(false);
  

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Call API to get dashboard stats
      const response = await axios.get('/api/analytics/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };


  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-950 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <RahalatekLoader size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 py-2 sm:py-3 md:py-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.username}! 👋
          </h1>
         
        </div>

        {/* Email Verification Alert */}
        <EmailVerificationAlert />


        {error && (
          <Card className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </Card>
        )}

        {/* Modern Stats Bar */}
        <div className="bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl p-3 mb-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FaPlane className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">Today's Arrivals:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{stats?.todayArrivals || 0}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FaPlane className="w-3 h-3 text-orange-600 dark:text-orange-400 transform rotate-180" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">Today's Departures:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{stats?.todayDepartures || 0}</span>
            </div>
            
            <button
              onClick={() => setShowActiveVouchersModal(true)}
              className="flex items-center gap-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg px-2 py-1 transition-colors duration-200 cursor-pointer group"
              title="Click to view active vouchers"
            >
              <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors duration-200">
                <FaTicketAlt className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-300">Active Vouchers:</span>
              <span className="font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">{stats?.activeVouchers || 0}</span>
            </button>

            

            {!user?.isAdmin && !user?.isAccountant && (
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <FaUser className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">My Vouchers:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats?.myVouchers || 0}</span>
              </div>
            )}
          </div>
        </div>



        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
          {/* Recent Voucher Activity */}
          <div className="lg:ml-12 lg:col-span-4">
            <RecentVoucherActivity />
          </div>
          
          {/* User Calendar */}
          <div className="lg:ml-12 lg:col-span-3">
            <HomeCalendar />
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:ml-12 mb-6">
          <QuickActionsPanel />
        </div>


        {/* Notifications Section for Normal Users */}
        {!user?.isAdmin && !user?.isAccountant && (
          <div className="lg:ml-12 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl">
                    <FaBell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Personal Notifications
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      View your notifications and create personal reminders
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.href = '/notifications'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <FaBell className="w-4 h-4" />
                    View Notifications
                  </button>
                  <button
                    onClick={() => window.location.href = '/notifications/manage'}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <FaPlus className="w-4 h-4" />
                    Create Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Second Row - Notifications, Upcoming Events, and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Recent Notifications */}
          <div className="lg:ml-12 space-y-6">
            <RecentNotificationsWidget />
          </div>
          
          {/* Right Column - Upcoming Events and Weather */}
          <div className="lg:ml-12 space-y-6">
            <UpcomingEventsWidget />
            <WeatherCarouselWidget />
          </div>
        </div>
      </div>
      
      
      {/* Active Vouchers Modal */}
      <ActiveVouchersModal 
        show={showActiveVouchersModal}
        onClose={() => setShowActiveVouchersModal(false)}
      />
    </div>
  );
}
