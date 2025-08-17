const Notification = require('../models/Notification');
const Voucher = require('../models/Voucher');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

class NotificationService {
    

    static async createNotification({
        type,
        title,
        message,
        relatedVoucher = null,
        voucherCreatedBy = null,
        targetUser = null,
        actionPerformedBy = null,
        priority = 'medium',
        expiresAt = null,
        metadata = {}
    }) {
        try {
            const notification = new Notification({
                type,
                title,
                message,
                relatedVoucher,
                voucherCreatedBy,
                targetUser,
                actionPerformedBy,
                priority,
                expiresAt,
                metadata
            });

            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Generate arrival reminder notifications for vouchers arriving tomorrow
     */
    static async generateArrivalReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const tomorrowEnd = new Date(tomorrow);
            tomorrowEnd.setHours(23, 59, 59, 999);


            const vouchersArrivingTomorrow = await Voucher.find({
                arrivalDate: {
                    $gte: tomorrow,
                    $lte: tomorrowEnd
                },
                status: 'await',
                $or: [
                    { isDeleted: false },
                    { isDeleted: { $exists: false } }
                ]
            }).populate('createdBy', 'username');

            const notifications = [];

            for (const voucher of vouchersArrivingTomorrow) {

                const existingNotification = await Notification.findOne({
                    type: 'voucher_arrival_reminder',
                    relatedVoucher: voucher._id,
                    isActive: true
                });

                if (!existingNotification) {
                    const notification = await this.createNotification({
                        type: 'voucher_arrival_reminder',
                        title: `Client Arrival Tomorrow`,
                        message: `${voucher.clientName} (Voucher #${voucher.voucherNumber}) is scheduled to arrive tomorrow.`,
                        relatedVoucher: voucher._id,
                        voucherCreatedBy: voucher.createdBy._id,
                        priority: 'high',
                        metadata: {
                            voucherNumber: voucher.voucherNumber,
                            clientName: voucher.clientName,
                            arrivalDate: voucher.arrivalDate,
                            createdByUsername: voucher.createdBy.username
                        }
                    });

                    notifications.push(notification);
                }
            }


            if (notifications.length > 0) {
                console.log(`${notifications.length} arrival reminders sent`);
            }
            return notifications;
        } catch (error) {
            console.error('Error generating arrival reminders:', error);
            throw error;
        }
    }

    /**
     * Generate departure reminder notifications for vouchers departing tomorrow
     */
    static async generateDepartureReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const tomorrowEnd = new Date(tomorrow);
            tomorrowEnd.setHours(23, 59, 59, 999);

            const vouchersDepartingTomorrow = await Voucher.find({
                departureDate: {
                    $gte: tomorrow,
                    $lte: tomorrowEnd
                },
                status: { $in: ['await', 'arrived'] }, // Only vouchers that haven't been cancelled
                $or: [
                    { isDeleted: false },
                    { isDeleted: { $exists: false } }
                ]
            }).populate('createdBy', 'username');

            const notifications = [];

            for (const voucher of vouchersDepartingTomorrow) {
                // Check if we already have a departure reminder for this voucher
                const existingNotification = await Notification.findOne({
                    type: 'voucher_departure_reminder',
                    relatedVoucher: voucher._id,
                    isActive: true
                });

                if (!existingNotification) {
                    const notification = await this.createNotification({
                        type: 'voucher_departure_reminder',
                        title: `Client Departure Tomorrow`,
                        message: `${voucher.clientName} (Voucher #${voucher.voucherNumber}) is scheduled to depart tomorrow.`,
                        relatedVoucher: voucher._id,
                        voucherCreatedBy: voucher.createdBy._id,
                        priority: 'high',
                        metadata: {
                            voucherNumber: voucher.voucherNumber,
                            clientName: voucher.clientName,
                            departureDate: voucher.departureDate,
                            createdByUsername: voucher.createdBy.username
                        }
                    });

                    notifications.push(notification);
                }
            }

            if (notifications.length > 0) {
                console.log(`${notifications.length} departure reminders sent`);
            }
            return notifications;
        } catch (error) {
            console.error('Error generating departure reminders:', error);
            throw error;
        }
    }

    /**
     * Create role change notification
     */
    static async createRoleChangeNotification({
        targetUserId,
        adminUserId,
        newRole,
        oldRole
    }) {
        try {

            const getRoleDisplayName = (role) => {
                if (role.isAdmin) return 'Admin';
                if (role.isAccountant) return 'Accountant';
                return 'User';
            };

            const oldRoleDisplay = getRoleDisplayName(oldRole);
            const newRoleDisplay = getRoleDisplayName(newRole);


            let priority = 'medium';
            if (newRole.isAdmin && !oldRole.isAdmin) priority = 'high';
            if (!newRole.isAdmin && !newRole.isAccountant && (oldRole.isAdmin || oldRole.isAccountant)) {
                priority = 'high';
            }

            const notification = await this.createNotification({
                type: 'user_role_change',
                title: `Your Role Has Been Updated`,
                message: `Your account role has been changed from ${oldRoleDisplay} to ${newRoleDisplay} by an administrator.`,
                targetUser: targetUserId,
                actionPerformedBy: adminUserId,
                priority,
                metadata: {
                    oldRole: oldRoleDisplay,
                    newRole: newRoleDisplay,
                    changedAt: new Date()
                }
                        });

            return notification;
        } catch (error) {
            console.error('Error creating role change notification:', error);
            throw error;
        }
    }

    /**
     * Generate daily arrivals summary for today
     */
    static async generateDailyArrivalsSummary(forceRegenerate = false) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);


            const vouchersArrivingToday = await Voucher.find({
                arrivalDate: {
                    $gte: today,
                    $lte: todayEnd
                },
                $or: [
                    { isDeleted: false },
                    { isDeleted: { $exists: false } }
                ]
            }).populate('createdBy', 'username').sort({ arrivalDate: 1 });


            if (vouchersArrivingToday.length === 0) {
                return [];
            }


            const voucherNumbers = vouchersArrivingToday.map(v => `#${v.voucherNumber}`).join(', ');
            const summaryMessage = `Today's Arrivals (${vouchersArrivingToday.length}): ${voucherNumbers}`;


            const existingSummary = await Notification.findOne({
                type: 'daily_arrivals_summary',
                createdAt: {
                    $gte: today,
                    $lte: todayEnd
                },
                isActive: true
            });

            if (existingSummary && !forceRegenerate) {
                return [];
            }


            if (existingSummary && forceRegenerate) {
                await Notification.findByIdAndUpdate(existingSummary._id, { isActive: false });
            }


            const notification = await this.createNotification({
                type: 'daily_arrivals_summary',
                title: `Today's Arrivals Summary - ${today.toLocaleDateString()}`,
                message: summaryMessage,
                priority: 'medium',
                expiresAt: todayEnd,
                metadata: {
                    date: today.toISOString(),
                    totalArrivals: vouchersArrivingToday.length,
                    voucherNumbers: vouchersArrivingToday.map(v => v.voucherNumber)
                }
            });


            return [notification];
        } catch (error) {
            console.error('Error generating daily arrivals summary:', error);
            throw error;
        }
    }

    /**
     * Generate daily departures summary for today
     */
    static async generateDailyDeparturesSummary(forceRegenerate = false) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            // Find vouchers departing today
            const vouchersDepartingToday = await Voucher.find({
                departureDate: {
                    $gte: today,
                    $lte: todayEnd
                },
                $or: [
                    { isDeleted: false },
                    { isDeleted: { $exists: false } }
                ]
            }).populate('createdBy', 'username').sort({ departureDate: 1 });

            // If no departures today, don't create a summary
            if (vouchersDepartingToday.length === 0) {
                return [];
            }

            // Create summary message
            const voucherNumbers = vouchersDepartingToday.map(v => `#${v.voucherNumber}`).join(', ');
            const summaryMessage = `Today's Departures (${vouchersDepartingToday.length}): ${voucherNumbers}`;

            // Check if we already have a summary for today
            const existingSummary = await Notification.findOne({
                type: 'daily_departures_summary',
                createdAt: {
                    $gte: today,
                    $lte: todayEnd
                },
                isActive: true
            });

            if (existingSummary && !forceRegenerate) {
                return [];
            }

            // If regenerating, deactivate the old one
            if (existingSummary && forceRegenerate) {
                await Notification.findByIdAndUpdate(existingSummary._id, { isActive: false });
            }

            // Create the notification
            const notification = await this.createNotification({
                type: 'daily_departures_summary',
                title: `Today's Departures Summary - ${today.toLocaleDateString()}`,
                message: summaryMessage,
                priority: 'medium',
                expiresAt: todayEnd,
                metadata: {
                    date: today.toISOString(),
                    totalDepartures: vouchersDepartingToday.length,
                    voucherNumbers: vouchersDepartingToday.map(v => v.voucherNumber)
                }
            });

            return [notification];
        } catch (error) {
            console.error('Error generating daily departures summary:', error);
            throw error;
        }
    }

    /**
     * Get user notifications based on their role
     */
    static async getUserNotifications(userId, isAdmin, isAccountant) {
        try {
            let userRole = 'user';
            if (isAdmin) userRole = 'admin';
            else if (isAccountant) userRole = 'accountant';

            return await Notification.getUserNotifications(userId, userRole);
        } catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read by user
     */
    static async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findById(notificationId);
            if (!notification) {
                throw new Error('Notification not found');
            }

            notification.markAsReadByUser(userId);
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId, isAdmin, isAccountant) {
        try {
            let userRole = 'user';
            if (isAdmin) userRole = 'admin';
            else if (isAccountant) userRole = 'accountant';

            const notifications = await Notification.getUserNotifications(userId, userRole);
            
            const updatePromises = notifications
                .filter(notification => !notification.isReadByUser(userId))
                .map(notification => {
                    notification.markAsReadByUser(userId);
                    return notification.save();
                });

            await Promise.all(updatePromises);
            return { updated: updatePromises.length };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Get unread notifications count for user
     */
    static async getUnreadCount(userId, isAdmin, isAccountant) {
        try {
            let userRole = 'user';
            if (isAdmin) userRole = 'admin';
            else if (isAccountant) userRole = 'accountant';

            const notifications = await Notification.getUserNotifications(userId, userRole);
            return notifications.filter(notification => !notification.isReadByUser(userId)).length;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    /**
     * Clean up expired notifications
     */
    static async cleanupExpiredNotifications() {
        try {
            const result = await Notification.updateMany(
                {
                    expiresAt: { $lte: new Date() },
                    isActive: true
                },
                {
                    isActive: false
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`🧹 Cleaned up ${result.modifiedCount} expired notifications`);
            }
            return result;
        } catch (error) {
            console.error('Error cleaning up expired notifications:', error);
            throw error;
        }
    }

    /**
     * Delete notification (admin only)
     */
    static async deleteNotification(notificationId) {
        try {
            const result = await Notification.findByIdAndUpdate(
                notificationId,
                { isActive: false },
                { new: true }
            );
            return result;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    /**
     * Generate checkout reminder notification for admins (employees who forgot to check out)
     */
    static async generateAttendanceCheckoutReminder() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            // Find employees who checked in today but didn't check out
            const attendanceRecords = await Attendance.find({
                date: {
                    $gte: today,
                    $lte: todayEnd
                },
                status: 'checked-in', // Still checked in
                checkIn: { $ne: null }, // Has check-in time
                checkOut: null // No check-out time
            }).populate('userId', 'username email');

            if (attendanceRecords.length === 0) {
                console.log('No employees forgot to check out today');
                return [];
            }

            // Check if we already sent a reminder today
            const existingNotification = await Notification.findOne({
                type: 'attendance_checkout_reminder',
                createdAt: {
                    $gte: today,
                    $lte: todayEnd
                },
                isActive: true
            });

            if (existingNotification) {
                console.log('Checkout reminder already sent today');
                return [];
            }

            // Create list of employees
            const employeeNames = attendanceRecords.map(record => record.userId.username).join(', ');
            const employeeCount = attendanceRecords.length;

            // Create notification for admins
            const notification = await this.createNotification({
                type: 'attendance_checkout_reminder',
                title: `${employeeCount} Employee${employeeCount > 1 ? 's' : ''} Forgot to Check Out`,
                message: `The following employee${employeeCount > 1 ? 's' : ''} forgot to check out today: ${employeeNames}. Click to manage their attendance.`,
                priority: 'high',
                expiresAt: todayEnd,
                metadata: {
                    date: today.toISOString(),
                    employeeCount,
                    employees: attendanceRecords.map(record => ({
                        userId: record.userId._id,
                        username: record.userId.username,
                        email: record.userId.email,
                        checkInTime: record.checkIn
                    })),
                    redirectTo: '/admin/attendance'
                }
            });

            console.log(`✅ Checkout reminder sent for ${employeeCount} employee${employeeCount > 1 ? 's' : ''}`);
            return [notification];
        } catch (error) {
            console.error('Error generating attendance checkout reminder:', error);
            throw error;
        }
    }

    /**
     * Automatically check out employees who forgot to check out (without setting checkout time)
     */
    static async autoCheckoutForgottenEmployees() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            // Find employees who checked in today but didn't check out
            const attendanceRecords = await Attendance.find({
                date: {
                    $gte: today,
                    $lte: todayEnd
                },
                status: 'checked-in', // Still checked in
                checkIn: { $ne: null }, // Has check-in time
                checkOut: null // No check-out time
            }).populate('userId', 'username');

            if (attendanceRecords.length === 0) {
                console.log('No employees to auto-checkout today');
                return [];
            }

            const updatedRecords = [];

            // Update each record to checked-out status without setting checkout time
            for (const record of attendanceRecords) {
                record.status = 'checked-out';
                // NOTE: We intentionally don't set checkOut time so admin can set it manually
                // record.checkOut remains null
                // hoursWorked remains 0 since we need both checkIn and checkOut for calculation
                
                await record.save();
                updatedRecords.push({
                    userId: record.userId._id,
                    username: record.userId.username,
                    date: record.date
                });
            }

            console.log(`🔄 Auto-checkout completed for ${updatedRecords.length} employee${updatedRecords.length > 1 ? 's' : ''}`);
            return updatedRecords;
        } catch (error) {
            console.error('Error in auto-checkout process:', error);
            throw error;
        }
    }
}

module.exports = NotificationService; 