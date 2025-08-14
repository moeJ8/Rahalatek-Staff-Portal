const NotificationService = require('../services/notificationService');

/**
 * Get all notifications for the current user
 */
exports.getUserNotifications = async (req, res) => {
    try {
        const { userId, isAdmin, isAccountant } = req.user;
        
        const notifications = await NotificationService.getUserNotifications(
            userId, 
            isAdmin, 
            isAccountant
        );

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications',
            error: error.message
        });
    }
};

/**
 * Get unread notifications count for the current user
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const { userId, isAdmin, isAccountant } = req.user;
        
        const count = await NotificationService.getUnreadCount(
            userId, 
            isAdmin, 
            isAccountant
        );

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            error: error.message
        });
    }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        
        const notification = await NotificationService.markAsRead(id, userId);

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

/**
 * Mark all notifications as read for the current user
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const { userId, isAdmin, isAccountant } = req.user;
        
        const result = await NotificationService.markAllAsRead(
            userId, 
            isAdmin, 
            isAccountant
        );

        res.status(200).json({
            success: true,
            message: `${result.updated} notifications marked as read`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

/**
 * Generate arrival reminders manually (admin only)
 */
exports.generateArrivalReminders = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const notifications = await NotificationService.generateArrivalReminders();

        res.status(200).json({
            success: true,
            message: `Generated ${notifications.length} arrival reminder notifications`,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate arrival reminders',
            error: error.message
        });
    }
};

/**
 * Generate departure reminders manually (admin only)
 */
exports.generateDepartureReminders = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const notifications = await NotificationService.generateDepartureReminders();

        res.status(200).json({
            success: true,
            message: `Generated ${notifications.length} departure reminder notifications`,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate departure reminders',
            error: error.message
        });
    }
};

/**
 * Generate daily arrivals and departures summary manually (admin only)
 */
exports.generateDailyArrivalsSummary = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Generate both arrivals and departures summaries
        const [arrivalNotifications, departureNotifications] = await Promise.all([
            NotificationService.generateDailyArrivalsSummary(true),
            NotificationService.generateDailyDeparturesSummary(true)
        ]);

        const totalNotifications = arrivalNotifications.length + departureNotifications.length;
        const messages = [];
        
        if (arrivalNotifications.length > 0) {
            messages.push('Daily arrivals summary regenerated');
        } else {
            messages.push('No arrivals today');
        }
        
        if (departureNotifications.length > 0) {
            messages.push('Daily departures summary regenerated');
        } else {
            messages.push('No departures today');
        }

        res.status(200).json({
            success: true,
            message: totalNotifications > 0 
                ? messages.join(' and ') + ' successfully'
                : 'No arrivals or departures today - no summaries to generate',
            data: {
                arrivals: arrivalNotifications,
                departures: departureNotifications,
                total: totalNotifications
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate daily summaries',
            error: error.message
        });
    }
};

/**
 * Delete a notification (all users can delete their own notifications)
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, isAdmin } = req.user;
        
        // Get the notification first to check permissions
        const Notification = require('../models/Notification');
        const notification = await Notification.findById(id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        // Check if user can delete this notification
        // Admins can delete any notification, users can only delete notifications related to their vouchers or targeted at them
        const canDelete = isAdmin || 
                         (notification.voucherCreatedBy && notification.voucherCreatedBy.toString() === userId) ||
                         (notification.targetUser && notification.targetUser.toString() === userId) ||
                         !notification.voucherCreatedBy; // System-wide notifications can be deleted by anyone
        
        if (!canDelete) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own notifications.'
            });
        }

        const deletedNotification = await NotificationService.deleteNotification(id);

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
            data: deletedNotification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

/**
 * Clean up expired notifications (admin only)
 */
exports.cleanupExpired = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const result = await NotificationService.cleanupExpiredNotifications();

        res.status(200).json({
            success: true,
            message: `Cleaned up ${result.modifiedCount} expired notifications`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cleanup expired notifications',
            error: error.message
        });
    }
}; 