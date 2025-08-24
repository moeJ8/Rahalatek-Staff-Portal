import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Badge, Alert, Modal } from 'flowbite-react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Search from '../components/Search';
import Select from '../components/Select';
import { FaBell, FaTrash, FaCheck, FaCheckDouble, FaTimes, FaExclamationTriangle, FaPlane, FaPlaneDeparture, FaCalendarAlt, FaCalendarDay, FaUser, FaSearch, FaFilter, FaSort, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../utils/notificationApi';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  
  // User role states
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Check if the current user is an admin or accountant
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.isAdmin || false);
    setIsAccountant(user.isAccountant || false);
  }, []);

  // Filter notifications based on search and filters
  useEffect(() => {
    let filtered = notifications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notification.metadata?.clientName && notification.metadata.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (notification.metadata?.voucherNumber && notification.metadata.voucherNumber.toString().includes(searchQuery))
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Status filter
    if (statusFilter === 'read') {
      filtered = filtered.filter(notification => isRead(notification));
    } else if (statusFilter === 'unread') {
      filtered = filtered.filter(notification => !isRead(notification));
    }

    // Sort notifications
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, typeFilter, statusFilter, sortBy]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getUserNotifications();
      setNotifications(response.data);
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
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, readBy: [...(notif.readBy || []), { user: 'current_user', readAt: new Date() }] }
          : notif
      ));
      toast.success('Notification marked as read', {
        duration: 2000,
        style: { background: '#4CAF50', color: '#fff' },
      });
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error('Failed to mark notification as read', {
        duration: 3000,
        style: { background: '#f44336', color: '#fff' },
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        readBy: [...(notif.readBy || []), { user: 'current_user', readAt: new Date() }]
      })));
      toast.success('All notifications marked as read', {
        duration: 3000,
        style: { background: '#4CAF50', color: '#fff' },
      });
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all notifications as read', {
        duration: 3000,
        style: { background: '#f44336', color: '#fff' },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (!notificationToDelete) return;

    try {
      setActionLoading(true);
      await deleteNotification(notificationToDelete._id);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationToDelete._id));
      setDeleteModalOpen(false);
      setNotificationToDelete(null);
      toast.success('Notification deleted successfully', {
        duration: 3000,
        style: { background: '#4CAF50', color: '#fff' },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete notification', {
        duration: 3000,
        style: { background: '#f44336', color: '#fff' },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      setActionLoading(true);
      const deletePromises = notifications.map(notification => 
        deleteNotification(notification._id).catch(err => {
          console.error(`Failed to delete notification ${notification._id}:`, err);
          return null;
        })
      );
      
      await Promise.allSettled(deletePromises);
      setNotifications([]);
      setClearAllModalOpen(false);
      toast.success('All notifications cleared successfully', {
        duration: 3000,
        style: { background: '#4CAF50', color: '#fff' },
      });
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      toast.error('Failed to clear all notifications', {
        duration: 3000,
        style: { background: '#f44336', color: '#fff' },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const isRead = (notification) => {
    return notification.readBy && notification.readBy.length > 0;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'voucher_arrival_reminder':
        return <FaPlane className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'voucher_departure_reminder':
        return <FaPlaneDeparture className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case 'daily_arrivals_summary':
        return <FaCalendarDay className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
      case 'user_role_change':
        return <FaUser className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      default:
        return <FaBell className="w-5 h-5 text-teal-500 dark:text-teal-400" />;
    }
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)} hours ago`;
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    }
  };

  const getTypeDisplayName = (type) => {
    const types = {
      voucher_arrival_reminder: 'Arrival Reminder',
      voucher_departure_reminder: 'Departure Reminder',
      daily_arrivals_summary: 'Daily Summary',
      user_role_change: 'Role Change',
      custom_reminder: 'Reminder'
    };
    return types[type] || type;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setStatusFilter('');
    setSortBy('newest');
  };

  const unreadCount = notifications.filter(notif => !isRead(notif)).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaBell className="w-6 h-6 mr-3 text-teal-600 dark:text-teal-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md dark:text-red-400 dark:bg-red-900/20 dark:border-red-800">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading}
                className="hidden sm:flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 hover:text-teal-700 dark:text-teal-400 dark:bg-teal-900/20 dark:border-teal-800 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 transition-all duration-200 hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <FaCheckDouble className="w-3 h-3" />
                )}
                Mark All Read
              </button>
            )}
            
            {notifications.length > 0 && (
              <button
                onClick={() => setClearAllModalOpen(true)}
                disabled={actionLoading}
                className="hidden sm:flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTrash className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 dark:bg-slate-900">
        <div className="space-y-4">
          {/* Search Bar */}
          <Search
            id="notificationSearch"
            placeholder="Search notifications by title, message, client name, or voucher number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Select
                id="typeFilter"
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
                placeholder="All Types"
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'voucher_arrival_reminder', label: 'Arrival Reminders' },
                  { value: 'voucher_departure_reminder', label: 'Departure Reminders' },
                  ...(isAdmin || isAccountant ? [{ value: 'daily_arrivals_summary', label: 'Daily Summaries' }] : []),
                  { value: 'user_role_change', label: 'Role Changes' },
                  { value: 'custom_reminder', label: 'Reminders' }
                ]}
              />
            </div>

            <div>
              <Select
                id="statusFilter"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                placeholder="All Status"
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'unread', label: 'Unread Only' },
                  { value: 'read', label: 'Read Only' }
                ]}
              />
            </div>

            <div>
              <Select
                id="sortBy"
                value={sortBy}
                onChange={(value) => setSortBy(value)}
                placeholder="Newest First"
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'type', label: 'By Type' }
                ]}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                disabled={!searchQuery && !typeFilter && !statusFilter && sortBy === 'newest'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || typeFilter || statusFilter || sortBy !== 'newest') && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Search: "{searchQuery}"
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Type: {getTypeDisplayName(typeFilter)}
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Status: {statusFilter}
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Sort: {sortBy}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Action Buttons */}
      <div className="flex gap-3 mb-4 sm:hidden">
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 hover:text-teal-700 dark:text-teal-400 dark:bg-teal-900/20 dark:border-teal-800 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? <Spinner size="sm" /> : <FaCheckDouble className="w-3 h-3" />}
          </button>
        )}
        
        {notifications.length > 0 && (
          <button
            onClick={() => setClearAllModalOpen(true)}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <Card className="dark:bg-slate-900">
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" className="text-teal-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading notifications...</span>
          </div>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="dark:bg-slate-900">
          <div className="text-center py-12">
            <FaBell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {notifications.length === 0 ? 'No notifications yet' : 'No matching notifications'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {notifications.length === 0 
                ? "You'll receive notifications for upcoming arrivals, status changes, and role updates"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {notifications.length > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
              >
                <FaTimes className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-all duration-200 hover:shadow-md dark:bg-slate-900 ${
                !isRead(notification) 
                  ? 'ring-2 ring-teal-500/20 bg-teal-50/50 dark:bg-teal-900/10' 
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className={`font-semibold ${!isRead(notification) ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200">
                          {getTypeDisplayName(notification.type)}
                        </span>
                        {!isRead(notification) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            New
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {/* Metadata */}
                      {notification.metadata && (
                        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
                          {notification.metadata.voucherNumber && (
                            <span className="flex items-center bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                              <FaCalendarAlt className="w-3 h-3 mr-1" />
                              Voucher #{notification.metadata.voucherNumber}
                            </span>
                          )}
                          {notification.metadata.clientName && (
                            <span className="flex items-center">
                              <FaUser className="w-3 h-3 mr-1" />
                              {notification.metadata.clientName}
                            </span>
                          )}
                          {notification.metadata.createdByUsername && (
                            <span className="flex items-center">
                              Created by {notification.metadata.createdByUsername}
                            </span>
                          )}
                          {notification.metadata.oldRole && notification.metadata.newRole && (
                            <span className="bg-teal-100 dark:bg-teal-900 px-2 py-1 rounded text-teal-700 dark:text-teal-300">
                              {notification.metadata.oldRole} → {notification.metadata.newRole}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FaClock className="w-3 h-3 mr-1" />
                          {formatDate(notification.createdAt)}
                        </div>
                        
                        {/* Link to voucher if available */}
                        {notification.relatedVoucher && (
                          <Link
                            to={`/vouchers/${notification.relatedVoucher._id}`}
                            className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
                          >
                            View Voucher →
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!isRead(notification) && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-sm font-medium text-teal-600 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 hover:text-teal-700 dark:text-teal-400 dark:bg-teal-900/20 dark:border-teal-800 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 transition-all duration-200 hover:scale-105"
                          title="Mark as read"
                        >
                          <FaCheck className="w-3 h-3" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setNotificationToDelete(notification);
                          setDeleteModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1 px-2 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105"
                        title="Delete notification"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Results Info */}
      {!loading && notifications.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredNotifications.length} of {notifications.length} notifications
          {unreadCount > 0 && ` • ${unreadCount} unread`}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteNotification}
        isLoading={actionLoading}
        itemType="notification"
        itemName={notificationToDelete?.title || 'this notification'}
        itemExtra={notificationToDelete?.message}
      />

      {/* Clear All Confirmation Modal */}
      <DeleteConfirmationModal
        show={clearAllModalOpen}
        onClose={() => setClearAllModalOpen(false)}
        onConfirm={handleClearAllNotifications}
        isLoading={actionLoading}
        itemType="all notifications"
        itemName={`${notifications.length} notifications`}
        itemExtra="This action cannot be undone and will permanently remove all notifications from your account"
      />
    </div>
  );
};

export default NotificationsPage; 