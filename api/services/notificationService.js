const Notification = require('../models/Notification');
const Voucher = require('../models/Voucher');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const EmailService = require('./emailService');
const MonthlyFinancialSummaryService = require('./monthlyFinancialSummaryService');

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

                    // Send email notification to the voucher creator if they have verified email
                    try {
                        const voucherCreator = await User.findById(voucher.createdBy._id);
                        if (voucherCreator && voucherCreator.email && voucherCreator.isEmailVerified) {
                            await EmailService.sendArrivalReminderEmail(voucherCreator, voucher);
                        }
                    } catch (emailError) {
                        console.error('Error sending arrival reminder email:', emailError);
                        // Don't throw error to avoid breaking the notification flow
                    }
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

                    // Send email notification to the voucher creator if they have verified email
                    try {
                        const voucherCreator = await User.findById(voucher.createdBy._id);
                        if (voucherCreator && voucherCreator.email && voucherCreator.isEmailVerified) {
                            await EmailService.sendDepartureReminderEmail(voucherCreator, voucher);
                        }
                    } catch (emailError) {
                        console.error('Error sending departure reminder email:', emailError);
                        // Don't throw error to avoid breaking the notification flow
                    }
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
                if (role.isContentManager) return 'Content Manager';
                if (role.isPublisher) return 'Publisher';
                return 'User';
            };

            const oldRoleDisplay = getRoleDisplayName(oldRole);
            const newRoleDisplay = getRoleDisplayName(newRole);


            let priority = 'medium';
            if (newRole.isAdmin && !oldRole.isAdmin) priority = 'high';
            if (!newRole.isAdmin && !newRole.isAccountant && !newRole.isContentManager && !newRole.isPublisher && (oldRole.isAdmin || oldRole.isAccountant || oldRole.isContentManager || oldRole.isPublisher)) {
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
                    voucherNumbers: vouchersArrivingToday.map(v => v.voucherNumber),
                    vouchers: vouchersArrivingToday.map(v => ({
                        id: v._id,
                        voucherNumber: v.voucherNumber,
                        clientName: v.clientName
                    }))
                }
            });

            // Send email notifications to all admin users with verified emails
            try {
                const adminUsers = await User.find({ 
                    isAdmin: true, 
                    email: { $ne: null, $ne: '' }, 
                    isEmailVerified: true 
                });

                const emailPromises = adminUsers.map(admin => 
                    EmailService.sendArrivalSummaryEmail(admin, vouchersArrivingToday)
                );

                await Promise.all(emailPromises);
                console.log(`📧 Arrival summary emails sent to ${adminUsers.length} admin${adminUsers.length > 1 ? 's' : ''}`);
            } catch (emailError) {
                console.error('Error sending arrival summary emails:', emailError);
                // Don't throw error to avoid breaking the summary creation
            }

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
                    voucherNumbers: vouchersDepartingToday.map(v => v.voucherNumber),
                    vouchers: vouchersDepartingToday.map(v => ({
                        id: v._id,
                        voucherNumber: v.voucherNumber,
                        clientName: v.clientName
                    }))
                }
            });

            // Send email notifications to all admin users with verified emails
            try {
                const adminUsers = await User.find({ 
                    isAdmin: true, 
                    email: { $ne: null, $ne: '' }, 
                    isEmailVerified: true 
                });

                const emailPromises = adminUsers.map(admin => 
                    EmailService.sendDepartureSummaryEmail(admin, vouchersDepartingToday)
                );

                await Promise.all(emailPromises);
                console.log(`📧 Departure summary emails sent to ${adminUsers.length} admin${adminUsers.length > 1 ? 's' : ''}`);
            } catch (emailError) {
                console.error('Error sending departure summary emails:', emailError);
                // Don't throw error to avoid breaking the summary creation
            }

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
     * Create custom reminder
     */
    static async createCustomReminder({
        title,
        message,
        scheduledFor,
        targetUsers = [],
        isSystemWide = false,
        createdBy,
        priority = 'medium'
    }) {
        try {
            // Validate input
            if (!title || !message || !scheduledFor || !createdBy) {
                throw new Error('Missing required fields for custom reminder');
            }

            // Validate scheduledFor is not too far in the past (allow for instant sending)
            const scheduledTime = new Date(scheduledFor);
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60000); // 1 minute ago
            
            if (scheduledTime < oneMinuteAgo) {
                throw new Error('Scheduled time cannot be more than 1 minute in the past');
            }

            // Create the reminder notification
            const reminder = new Notification({
                type: 'custom_reminder',
                title,
                message,
                actionPerformedBy: createdBy,
                priority,
                scheduledFor: new Date(scheduledFor),
                targetUsers: isSystemWide ? [] : targetUsers,
                isSystemWide,
                reminderStatus: 'scheduled',
                isActive: true,
                metadata: {
                    createdAt: new Date(),
                    scheduledFor: new Date(scheduledFor),
                    targetUserCount: isSystemWide ? 'all' : targetUsers.length
                }
            });

            await reminder.save();
            return reminder;
        } catch (error) {
            console.error('Error creating custom reminder:', error);
            throw error;
        }
    }

    /**
     * Process and send scheduled reminders
     */
    static async processScheduledReminders() {
        try {
            const now = new Date();
            
            // Find reminders that are due to be sent (more efficient query first)
            const dueReminders = await Notification.find({
                type: 'custom_reminder',
                reminderStatus: 'scheduled',
                scheduledFor: { $lte: now },
                isActive: true
            }).populate('targetUsers', 'username email isEmailVerified')
              .populate('actionPerformedBy', 'username');

            const processedReminders = [];

            for (const reminder of dueReminders) {
                try {
                    // Mark as sent
                    reminder.reminderStatus = 'sent';
                    await reminder.save();

                    processedReminders.push(reminder);

                    // Send email notifications to target users
                    await this.sendCustomReminderEmails(reminder);
                } catch (error) {
                    console.error(`❌ Error processing reminder ${reminder._id}:`, error);
                }
            }

            return processedReminders;
        } catch (error) {
            console.error('❌ Error processing scheduled reminders:', error);
            throw error;
        }
    }

    /**
     * Send email notifications for custom reminders
     */
    static async sendCustomReminderEmails(reminder) {
        try {
            let targetUsers = [];
            
            if (reminder.isSystemWide) {
                // For system-wide reminders, get all users with verified emails
                targetUsers = await User.find({
                    email: { $exists: true, $ne: null, $ne: '' },
                    isEmailVerified: true
                });
            } else {
                // For targeted reminders, use the specified target users (already populated)
                targetUsers = reminder.targetUsers.filter(user => 
                    user.email && user.isEmailVerified
                );
            }

            // Get the creator of the reminder
            const createdByUser = reminder.actionPerformedBy;

            // Send emails to all target users
            for (const user of targetUsers) {
                try {
                    await EmailService.sendCustomReminderEmail(user, reminder, createdByUser);
                } catch (emailError) {
                    console.error(`Error sending custom reminder email to ${user.email}:`, emailError);
                    // Continue with other users even if one fails
                }
            }
        } catch (error) {
            console.error('❌ Error sending custom reminder emails:', error);
            // Don't throw error to avoid breaking the notification flow
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
     * Generate daily check-in reminder notifications
     */
    static async generateDailyCheckinReminder() {
        try {
            console.log('🔔 Generating daily check-in reminders...');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            // Get all users who should be working today (including admins)
            const usersWhoNeedToCheckIn = await User.find({
                isApproved: true
            }).select('_id username email isEmailVerified');

            if (usersWhoNeedToCheckIn.length === 0) {
                console.log('No users need check-in reminder today');
                return [];
            }

            // Check which users haven't checked in today
            const usersNotCheckedIn = [];
            for (const user of usersWhoNeedToCheckIn) {
                const attendance = await Attendance.getTodayAttendance(user._id);
                // If no attendance record OR status is 'not-checked-in'
                if (!attendance || attendance.status === 'not-checked-in') {
                    usersNotCheckedIn.push(user);
                }
            }

            if (usersNotCheckedIn.length === 0) {
                console.log('All users have already checked in today');
                return [];
            }

            console.log(`📋 ${usersNotCheckedIn.length} user${usersNotCheckedIn.length > 1 ? 's' : ''} need check-in reminder`);

            // Create notifications for users who haven't checked in
            const notifications = [];
            for (const user of usersNotCheckedIn) {
                // Check if user already has a check-in reminder today to prevent duplicates
                const existingNotification = await Notification.findOne({
                    type: 'attendance_checkin_reminder',
                    targetUser: user._id,
                    createdAt: {
                        $gte: today,
                        $lte: todayEnd
                    },
                    isActive: true
                });

                if (existingNotification) {
                    console.log(`Check-in reminder already exists for ${user.username} today`);
                    continue;
                }

                const notification = await this.createNotification({
                    type: 'attendance_checkin_reminder',
                    title: 'Daily Check-In Reminder',
                    message: 'Good morning! Don\'t forget to check in to start your workday. Please scan the QR code to check in.',
                    targetUser: user._id,
                    priority: 'medium',
                    expiresAt: todayEnd,
                    metadata: {
                        userId: user._id,
                        reminderType: 'checkin',
                        date: today.toISOString()
                    }
                });

                notifications.push(notification);
            }

            // Send email notifications to users with verified emails
            try {
                const emailPromises = usersNotCheckedIn
                    .filter(user => user.email && user.isEmailVerified)
                    .map(user => EmailService.sendCheckinReminderEmail(user));

                await Promise.all(emailPromises);
                const emailCount = emailPromises.length;
                console.log(`📧 Check-in reminder emails sent to ${emailCount} user${emailCount > 1 ? 's' : ''}`);
            } catch (emailError) {
                console.error('Error sending check-in reminder emails:', emailError);
                // Don't throw error to avoid breaking the notification creation
            }

            console.log(`✅ Created ${notifications.length} check-in reminder notification${notifications.length > 1 ? 's' : ''}`);
            return notifications;

        } catch (error) {
            console.error('Error generating daily check-in reminder:', error);
            throw error;
        }
    }

    /**
     * Generate daily check-out reminder notifications
     */
    static async generateDailyCheckoutReminder() {
        try {
            console.log('🔔 Generating daily check-out reminders...');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            // Find employees who checked in today but didn't check out yet
            const attendanceRecords = await Attendance.find({
                date: {
                    $gte: today,
                    $lte: todayEnd
                },
                status: 'checked-in' // Only those who are currently checked in
            }).populate('userId', 'username email isEmailVerified');

            if (attendanceRecords.length === 0) {
                console.log('No employees need check-out reminder today');
                return [];
            }

            console.log(`📋 ${attendanceRecords.length} employee${attendanceRecords.length > 1 ? 's' : ''} need check-out reminder`);

            // Create notifications for users who need to check out
            const notifications = [];
            for (const record of attendanceRecords) {
                const user = record.userId;
                
                // Check if user already has a check-out reminder today to prevent duplicates
                const existingNotification = await Notification.findOne({
                    type: 'attendance_checkout_reminder',
                    targetUser: user._id,
                    createdAt: {
                        $gte: today,
                        $lte: todayEnd
                    },
                    isActive: true
                });

                if (existingNotification) {
                    console.log(`Check-out reminder already exists for ${user.username} today`);
                    continue;
                }

                const notification = await this.createNotification({
                    type: 'attendance_checkout_reminder',
                    title: 'Daily Check-Out Reminder',
                    message: 'Your workday is ending soon! Don\'t forget to check out before leaving. Please scan the QR code or use manual check-out.',
                    targetUser: user._id,
                    priority: 'medium',
                    expiresAt: todayEnd,
                    metadata: {
                        userId: user._id,
                        reminderType: 'checkout',
                        date: today.toISOString(),
                        checkInTime: record.checkIn
                    }
                });

                notifications.push(notification);
            }

            // Send email notifications to users with verified emails
            try {
                const emailPromises = attendanceRecords
                    .filter(record => record.userId.email && record.userId.isEmailVerified)
                    .map(record => EmailService.sendCheckoutReminderEmail(record.userId, record));

                await Promise.all(emailPromises);
                const emailCount = emailPromises.length;
                console.log(`📧 Check-out reminder emails sent to ${emailCount} user${emailCount > 1 ? 's' : ''}`);
            } catch (emailError) {
                console.error('Error sending check-out reminder emails:', emailError);
                // Don't throw error to avoid breaking the notification creation
            }

            console.log(`✅ Created ${notifications.length} check-out reminder notification${notifications.length > 1 ? 's' : ''}`);
            return notifications;

        } catch (error) {
            console.error('Error generating daily check-out reminder:', error);
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

    /**
     * Generate and send upcoming events summary emails
     */
    static async generateUpcomingEventsEmails() {
        try {
            console.log('🔄 Starting upcoming events email generation...');
            
            // Get all users with verified emails
            const User = require('../models/User');
            const Voucher = require('../models/Voucher');
            const Holiday = require('../models/Holiday');
            
            const users = await User.find({
                email: { $exists: true, $ne: null, $ne: '' },
                isEmailVerified: true,
                isApproved: true
            });

            if (users.length === 0) {
                console.log('No users with verified emails found');
                return [];
            }

            // Get current date and next 7 days for vouchers, next 30 days for holidays
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const next7Days = new Date(today);
            next7Days.setDate(next7Days.getDate() + 7);
            next7Days.setHours(23, 59, 59, 999);

            const next30Days = new Date(today);
            next30Days.setDate(next30Days.getDate() + 30);

            // Fetch all vouchers and holidays
            const [allVouchers, holidays] = await Promise.all([
                Voucher.find({
                    $or: [
                        { isDeleted: false },
                        { isDeleted: { $exists: false } }
                    ]
                }).populate('createdBy', '_id username'),
                Holiday.find({
                    isActive: true,
                    $or: [
                        // Single-day holidays
                        {
                            holidayType: 'single-day',
                            date: { $gte: today, $lte: next30Days }
                        },
                        // Multiple-day holidays
                        {
                            holidayType: 'multiple-day',
                            startDate: { $gte: today, $lte: next30Days }
                        }
                    ]
                }).sort({
                    date: 1,
                    startDate: 1
                })
            ]);

            const emailsSent = [];

            // Process each user
            for (const user of users) {
                try {
                    // Filter vouchers based on user role (same logic as UpcomingEventsWidget)
                    let filteredVouchers = allVouchers;
                    if (!user.isAdmin && !user.isAccountant) {
                        filteredVouchers = allVouchers.filter(voucher => 
                            voucher.createdBy && voucher.createdBy._id.toString() === user._id.toString()
                        );
                    }

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

                    // Everyone can see holidays
                    const userHolidays = holidays;

                    const eventsData = {
                        departures,
                        arrivals,
                        holidays: userHolidays
                    };

                    const totalEvents = departures.length + arrivals.length + userHolidays.length;

                    // Only send email if user has upcoming events
                    if (totalEvents > 0) {
                        await EmailService.sendUpcomingEventsEmail(user, eventsData);
                        emailsSent.push({
                            userId: user._id,
                            username: user.username,
                            email: user.email,
                            eventsCount: totalEvents,
                            departures: departures.length,
                            arrivals: arrivals.length,
                            holidays: userHolidays.length
                        });
                    } else {
                        console.log(`No upcoming events for ${user.username} (${user.email})`);
                    }
                } catch (userError) {
                    console.error(`Error sending upcoming events email to ${user.email}:`, userError);
                    // Continue with other users even if one fails
                }
            }

            console.log(`📧 Upcoming events emails sent to ${emailsSent.length} user${emailsSent.length > 1 ? 's' : ''}`);
            
            // Log summary
            if (emailsSent.length > 0) {
                const totalEvents = emailsSent.reduce((sum, user) => sum + user.eventsCount, 0);
                const totalDepartures = emailsSent.reduce((sum, user) => sum + user.departures, 0);
                const totalArrivals = emailsSent.reduce((sum, user) => sum + user.arrivals, 0);
                const totalHolidays = emailsSent.reduce((sum, user) => sum + user.holidays, 0);
                
                console.log(`📊 Summary: ${totalEvents} total events (${totalDepartures} departures, ${totalArrivals} arrivals, ${totalHolidays} holidays)`);
            }

            return emailsSent;
        } catch (error) {
            console.error('❌ Error generating upcoming events emails:', error);
            throw error;
        }
    }

    /**
     * Generate and send monthly financial summary emails
     */
    static async generateMonthlyFinancialSummaryEmails(year = null, month = null) {
        try {
            // Use the MonthlyFinancialSummaryService to generate and send emails
            const emailsSent = await MonthlyFinancialSummaryService.generateMonthlyFinancialEmails(year, month);
            
            // Create individual notifications for each recipient
            if (emailsSent.length > 0) {
                const now = new Date();
                const targetYear = year || (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
                const targetMonth = month || (now.getMonth() === 0 ? 12 : now.getMonth());
                const monthName = new Date(targetYear, targetMonth - 1).toLocaleString('en-US', { month: 'long' });
                
                // Create individual notifications for each user
                for (const recipient of emailsSent) {
                    await this.createNotification({
                        type: 'monthly_financial_summary',
                        title: `Monthly Financial Report Ready - ${monthName} ${targetYear}`,
                        message: `Your monthly financial report is ready. Check your email for details, or download the PDF version directly.`,
                        targetUser: recipient.userId,
                        priority: 'medium',
                        metadata: {
                            year: targetYear,
                            month: targetMonth,
                            monthName,
                            hasDownloadLink: true,
                            downloadText: 'Download PDF',
                            role: recipient.role
                        }
                    });
                }
            }
            
            return emailsSent;
        } catch (error) {
            console.error('❌ Error generating monthly financial summary emails:', error);
            throw error;
        }
    }
}

module.exports = NotificationService; 