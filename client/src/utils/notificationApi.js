import axios from 'axios';

/**
 * Get all notifications for the current user
 */
export const getUserNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/notifications/unread-count', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`/api/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put('/api/notifications/mark-all-read', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Generate arrival reminders manually (admin only)
 */
export const generateArrivalReminders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/notifications/generate-arrival-reminders', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error generating arrival reminders:', error);
    throw error;
  }
};

/**
 * Delete a notification (admin only)
 */
export const deleteNotification = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`/api/notifications/${notificationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Clean up expired notifications (admin only)
 */
export const cleanupExpiredNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/notifications/cleanup-expired', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    throw error;
  }
}; 