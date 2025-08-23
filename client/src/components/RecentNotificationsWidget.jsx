import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBell, 
  FaTicketAlt, 
  FaPlane, 
  FaClock, 
  FaExclamationTriangle, 
  FaInfo, 
  FaCheckCircle,
  FaEye,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { getUserNotifications } from '../utils/notificationApi';
import RahalatekLoader from './RahalatekLoader';
import CustomButton from './CustomButton';

export default function RecentNotificationsWidget() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
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
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getUserNotifications();
      
      // Get the 5 most recent notifications
      const recent = (response.data || []).slice(0, 5);
      setNotifications(recent);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'voucher_arrival_reminder':
      case 'voucher_departure_reminder':
        return <FaPlane className="w-4 h-4" />;
      case 'voucher_status_change':
        return <FaTicketAlt className="w-4 h-4" />;
      case 'daily_arrivals_summary':
      case 'daily_departures_summary':
        return <FaClock className="w-4 h-4" />;
      case 'attendance_checkout_reminder':
        return <FaClock className="w-4 h-4" />;
      case 'system_announcement':
        return <FaExclamationTriangle className="w-4 h-4" />;
      case 'user_role_change':
        return <FaCheckCircle className="w-4 h-4" />;
      default:
        return <FaInfo className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'voucher_arrival_reminder':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          textColor: 'text-blue-600 dark:text-blue-400',
          dotColor: 'bg-blue-500'
        };
      case 'voucher_departure_reminder':
        return {
          bgColor: 'bg-orange-50 dark:bg-orange-900/30',
          textColor: 'text-orange-600 dark:text-orange-400',
          dotColor: 'bg-orange-500'
        };
      case 'voucher_status_change':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          textColor: 'text-green-600 dark:text-green-400',
          dotColor: 'bg-green-500'
        };
      case 'daily_arrivals_summary':
      case 'daily_departures_summary':
        return {
          bgColor: 'bg-purple-50 dark:bg-purple-900/30',
          textColor: 'text-purple-600 dark:text-purple-400',
          dotColor: 'bg-purple-500'
        };
      case 'attendance_checkout_reminder':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          dotColor: 'bg-yellow-500'
        };
      case 'system_announcement':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          textColor: 'text-red-600 dark:text-red-400',
          dotColor: 'bg-red-500'
        };
      case 'user_role_change':
        return {
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          dotColor: 'bg-emerald-500'
        };
      default:
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-900/30',
          textColor: 'text-gray-600 dark:text-gray-400',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  const isUnread = (notification) => {
    if (!user) return false;
    return !notification.readBy?.some(read => read.user === user.id);
  };

  return (
    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[850px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
            <FaBell className="text-blue-600 dark:text-teal-400 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Notifications</h3>
        </div>
        <Link 
          to="/notifications"
          className="p-2 text-blue-600 dark:text-teal-400 hover:text-blue-700 dark:hover:text-teal-300 transition-all duration-200 rounded-xl hover:bg-blue-50 dark:hover:bg-teal-900/20"
        >
          <FaExternalLinkAlt className="w-5 h-5" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5 flex-1 flex flex-col">
        {loading ? (
          <div className="flex justify-center py-8">
            <RahalatekLoader size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <FaBell className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {notifications.map((notification) => {
              const colorInfo = getNotificationColor(notification.type);
              const unread = isUnread(notification);
              
              return (
                <div 
                  key={notification._id}
                  className={`
                    p-4 rounded-xl transition-colors shadow-sm hover:shadow-md
                    ${unread 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400' 
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Notification Icon */}
                    <div className={`flex items-center justify-center p-2 rounded-lg ${colorInfo.bgColor}`}>
                      <div className={colorInfo.textColor}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm mb-1 ${unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-xs leading-relaxed ${unread ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                            {notification.message}
                          </p>
                        </div>
                        {unread && (
                          <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${colorInfo.dotColor}`}></div>
                        )}
                      </div>
                      
                      {/* Time and Action */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                                                 {notification.relatedVoucher && (
                           <Link to={`/vouchers/${notification.relatedVoucher._id}`}>
                             <CustomButton
                               variant="teal"
                               size="xs"
                               icon={FaEye}
                             >
                             </CustomButton>
                           </Link>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Action */}
        {!loading && notifications.length > 0 && (
          <div className="mt-auto">
            <Link
              to="/notifications"
              className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-700/50 text-blue-600 dark:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <FaBell className="w-3 h-3" />
              View All Notifications
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
