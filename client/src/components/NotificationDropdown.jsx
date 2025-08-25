import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Badge } from 'flowbite-react';
import { FaBell, FaCheck, FaCheckDouble, FaTimes, FaExclamationTriangle, FaPlane, FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaCalendarDay, FaUser, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import CustomScrollbar from './CustomScrollbar';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [notificationsRes, unreadCountRes] = await Promise.all([
        axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const notifData = notificationsRes.data.data;
      setNotifications(notifData);
      setFilteredNotifications(notifData);
      setUnreadCount(unreadCountRes.data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load notifications', {
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
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications based on active filter
  const filterNotifications = (notifs, filter) => {
    switch (filter) {
      case 'arrival':
        return notifs.filter(notif => 
          notif.type === 'voucher_arrival_reminder' || 
          notif.type === 'daily_arrivals_summary'
        );
      case 'departure':
        return notifs.filter(notif => 
          notif.type === 'voucher_departure_reminder' || 
          notif.type === 'daily_departures_summary'
        );
      case 'attendance':
        return notifs.filter(notif => 
          notif.type === 'attendance_checkout_reminder'
        );
      case 'reminders':
        return notifs.filter(notif => 
          notif.type === 'custom_reminder'
        );
      case 'all':
      default:
        return notifs;
    }
  };

  // Update filtered notifications when filter or notifications change
  useEffect(() => {
    setFilteredNotifications(filterNotifications(notifications, activeFilter));
  }, [notifications, activeFilter]);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const updatedNotifications = notifications.map(notif => 
        notif._id === notificationId 
          ? { ...notif, readBy: [...(notif.readBy || []), { user: userId, readAt: new Date() }] }
          : notif
      );
      setNotifications(updatedNotifications);
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read', {
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
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state - mark all as read
      const updatedNotifications = notifications.map(notif => ({
        ...notif,
        readBy: [...(notif.readBy || []), { user: 'current_user', readAt: new Date() }]
      }));
      setNotifications(updatedNotifications);
      
      setUnreadCount(0);
      toast.success('All notifications marked as read', {
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
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read', {
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
      setMarkingAllRead(false);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type, priority) => {
    const iconClass = `w-4 h-4 ${priority === 'high' || priority === 'urgent' ? 'text-red-500' : 'text-teal-500'}`;
    
    switch (type) {
      case 'voucher_arrival_reminder':
        return <FaPlaneArrival className={iconClass} />;
      case 'voucher_departure_reminder':
        return <FaPlaneDeparture className={iconClass} />;
      case 'daily_arrivals_summary':
        return <FaCalendarDay className="w-4 h-4 text-orange-500" />;
      case 'daily_departures_summary':
        return <FaCalendarDay className="w-4 h-4 text-purple-500" />;
      case 'voucher_status_change':
        return <FaCalendarAlt className={iconClass} />;
      case 'user_role_change':
        return <FaUser className={iconClass} />;
      case 'attendance_checkout_reminder':
        return <FaClock className="w-4 h-4 text-yellow-500" />;
      case 'custom_reminder':
        return <FaCalendarCheck className={iconClass} />;
      default:
        return <FaBell className={iconClass} />;
    }
  };

  // Format notification date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  // Check if notification is read by current user
  const isRead = (notification) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    const userId = user?.id;
    
    // Check if readBy array exists and has entries
    if (!notification.readBy || !Array.isArray(notification.readBy) || notification.readBy.length === 0) {
      return false;
    }
    
    // Check if current user ID is in the readBy array
    return notification.readBy.some(readUser => {
      // Handle both string IDs and objects with user property
      if (typeof readUser === 'string') {
        return readUser === userId;
      }
      if (readUser && readUser.user) {
        return readUser.user === userId;
      }
      if (readUser && readUser._id) {
        return readUser._id === userId;
      }
      return false;
    });
  };

  // Get priority badge styling
  const getPriorityBadge = (priority) => {
    if (!priority) return null; // Don't show badge if no priority is set
    
    const styles = {
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High', 
      urgent: 'Urgent'
    };
    
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${styles[priority] || styles.medium}`}>
        {labels[priority] || priority}
      </span>
    );
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications(); // Refresh when opening
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={toggleDropdown}
        className="relative flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
        title="Notifications"
      >
        <FaBell className="w-5 h-5" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs font-bold text-red-600 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="fixed left-1/2 -translate-x-1/2 top-20 sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:top-full mt-2 w-72 sm:w-96 lg:w-[28rem] max-w-[calc(100vw-1rem)] max-h-[60vh] sm:max-h-[600px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-teal-50 dark:bg-teal-900/20">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaBell className="w-4 h-4 mr-2 text-teal-600 dark:text-teal-400" />
              <span>Notifications</span>
            </h3>
            
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-1.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md dark:text-red-400 dark:bg-red-900/20 dark:border-red-800">
                {unreadCount} <span className="hidden sm:inline ml-1">unread</span>
              </span>
            )}
          </div>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                markAllAsRead();
              }}
              disabled={markingAllRead}
              className="w-full py-1.5 sm:py-2 px-2 sm:px-3 text-center text-sm sm:text-base bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 border-b border-gray-200 dark:border-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markingAllRead ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  <span>Marking as read...</span>
                </div>
              ) : (
                "Mark All as Read"
              )}
            </button>
          )}

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-1 sm:px-2 py-2 text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-0.5 sm:gap-1 ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <FaBell className="w-3 h-3" />
              <span className="hidden sm:inline">All</span>
            </button>
            <button
              onClick={() => setActiveFilter('arrival')}
              className={`flex-1 px-1 sm:px-2 py-2 text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-0.5 sm:gap-1 ${
                activeFilter === 'arrival'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <FaPlaneArrival className="w-3 h-3" />
              <span className="hidden sm:inline">Arrival</span>
            </button>
            <button
              onClick={() => setActiveFilter('departure')}
              className={`flex-1 px-1 sm:px-2 py-2 text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-0.5 sm:gap-1 ${
                activeFilter === 'departure'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <FaPlaneDeparture className="w-3 h-3" />
              <span className="hidden sm:inline">Departure</span>
            </button>
            <button
              onClick={() => setActiveFilter('attendance')}
              className={`flex-1 px-1 sm:px-2 py-2 text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-0.5 sm:gap-1 ${
                activeFilter === 'attendance'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <FaClock className="w-3 h-3" />
              <span className="hidden sm:inline">Attendance</span>
            </button>
            <button
              onClick={() => setActiveFilter('reminders')}
              className={`flex-1 px-1 sm:px-2 py-2 text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-0.5 sm:gap-1 ${
                activeFilter === 'reminders'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <FaCalendarCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Reminders</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 min-h-0">
            <CustomScrollbar maxHeight="480px" className="h-full">
              {loading ? (
                <div className="flex items-center justify-center px-4 py-8">
                  <Spinner size="md" className="text-teal-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading notifications...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FaBell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {notifications.length === 0 ? 'No notifications yet' : `No ${activeFilter === 'all' ? '' : activeFilter} notifications`}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {notifications.length === 0 
                      ? "You'll receive notifications for upcoming arrivals and role changes"
                      : `Try switching to a different filter to see more notifications`
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                                              className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150 ${
                          !isRead(notification) ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''
                        }`}
                        style={{
                          borderLeft: !isRead(notification) ? '4px solid rgb(20 184 166)' : 'none'
                        }}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-xs sm:text-sm font-medium ${!isRead(notification) ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {notification.title}
                                </p>
                                {getPriorityBadge(notification.priority)}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                                {notification.message}
                              </p>
                              
                              {/* Metadata */}
                              {notification.metadata && (
                                <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  {notification.metadata.voucherNumber && (
                                    <span className="bg-gray-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                      #{notification.metadata.voucherNumber}
                                    </span>
                                  )}
                                  {notification.metadata.createdByUsername && (
                                    <span className="flex items-center">
                                      <FaUser className="w-3 h-3 mr-1" />
                                      {notification.metadata.createdByUsername}
                                    </span>
                                  )}
                                  {notification.metadata.oldRole && notification.metadata.newRole && (
                                    <span className="bg-teal-100 dark:bg-teal-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs text-teal-700 dark:text-teal-300">
                                      {notification.metadata.oldRole} → {notification.metadata.newRole}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-1 ml-1 sm:ml-2">
                              {!isRead(notification) && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-1 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                  title="Mark as read"
                                >
                                  <FaCheck className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between mt-1 sm:mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(notification.createdAt)}
                            </span>
                            
                            {/* Link to voucher if available */}
                            {notification.relatedVoucher && (
                              <Link
                                to={`/vouchers/${notification.relatedVoucher._id}`}
                                className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
                                onClick={() => setShowDropdown(false)}
                              >
                                View Voucher →
                              </Link>
                            )}
                            {/* Show admin link for role changes */}
                            {notification.type === 'user_role_change' && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                Role updated by admin
                              </span>
                            )}
                            {/* Show attendance link for checkout reminders */}
                            {notification.type === 'attendance_checkout_reminder' && (
                              <Link
                                to="/dashboard?tab=attendance"
                                className="text-xs text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
                                onClick={() => setShowDropdown(false)}
                              >
                                Manage Attendance →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CustomScrollbar>
          </div>

          {/* Footer with view all */}
          <div className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
            <Link
              to="/notifications"
              className="flex items-center justify-center w-full text-sm sm:text-base text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors duration-200"
              onClick={() => setShowDropdown(false)}
            >
              View all
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 