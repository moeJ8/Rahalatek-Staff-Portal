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
 * Generate monthly financial summary manually (admin only)
 */
exports.generateMonthlyFinancialSummary = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { year, month } = req.query;
        
        // Generate and send monthly financial summary emails
        const emailsSent = await NotificationService.generateMonthlyFinancialSummaryEmails(
            year ? parseInt(year) : null, 
            month ? parseInt(month) : null
        );

        res.status(200).json({
            success: true,
            message: emailsSent.length > 0 
                ? `Monthly financial summary sent to ${emailsSent.length} admin${emailsSent.length > 1 ? 's' : ''} and accountant${emailsSent.length > 1 ? 's' : ''}`
                : 'No eligible recipients found for monthly financial summary',
            data: {
                emailsSent,
                totalRecipients: emailsSent.length,
                period: {
                    year: year || (new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()),
                    month: month || (new Date().getMonth() === 0 ? 12 : new Date().getMonth())
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate monthly financial summary',
            error: error.message
        });
    }
};

/**
 * Download monthly financial summary as PDF (admin only)
 */
exports.downloadFinancialSummaryPDF = async (req, res) => {
    try {
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or accountant privileges required.'
            });
        }

        const { year, month } = req.query;
        
        // Get full user object from database
        const User = require('../models/User');
        const fullUser = await User.findById(req.user.userId).select('username email isAdmin isAccountant');
        
        if (!fullUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Generate the financial summary data
        const MonthlyFinancialSummaryService = require('../services/monthlyFinancialSummaryService');
        const PDFService = require('../services/pdfService');
        
        const summaryData = await MonthlyFinancialSummaryService.generateMonthlySummaryData(
            year ? parseInt(year) : null, 
            month ? parseInt(month) : null
        );

        // Generate PDF with full user object
        const pdfBuffer = await PDFService.generateFinancialSummaryPDF(summaryData, fullUser);
        
        // Set response headers for PDF download
        const filename = `financial-summary-${summaryData.period.year}-${summaryData.period.month.toString().padStart(2, '0')}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Send PDF
        res.end(pdfBuffer);
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            user: req.user,
            query: req.query
        });
        
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF. Please try again or contact support if the issue persists.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

/**
 * Download weekly WhatsApp clicks report as PDF
 */
exports.downloadWhatsappWeeklyPDF = async (req, res) => {
    try {
        const { notificationId } = req.query;
        if (!notificationId) {
            return res.status(400).json({ success: false, message: 'notificationId is required' });
        }

        const Notification = require('../models/Notification');
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        if (notification.type !== 'weekly_blog_whatsapp_report') {
            return res.status(400).json({ success: false, message: 'Invalid notification type for this download' });
        }

        // Authorization: allow target user to download, admins and content managers as well
        const isTarget = notification.targetUser && notification.targetUser.toString() === req.user.userId;
        if (!isTarget && !req.user.isAdmin && !req.user.isContentManager) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const WhatsappClicksReportService = require('../services/whatsappClicksReportService');
        const PDFService = require('../services/pdfService');

        let pdfBuffer;
        let fileName = notification.metadata?.fileName || `whatsapp-clicks-weekly-${new Date().toISOString().slice(0,10)}.pdf`;

        if (notification.metadata?.scope === 'all') {
            // Combined all-authors report with weekly clicks + top 10 all-time
            const week = WhatsappClicksReportService.getCurrentWeekRange();
            const Blog = require('../models/Blog');
            const postsRaw = await Blog.find({})
                .populate('author', 'username')
                .select('title slug status whatsappClicks createdAt updatedAt author clicksByDate');
            const weeklyPosts = postsRaw.map(p => ({
                title: p.title,
                slug: p.slug,
                status: p.status,
                whatsappClicks: p.whatsappClicks || 0,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                authorName: p.author?.username || 'Unknown',
                weeklyClicks: WhatsappClicksReportService.sumWeeklyClicks(p.clicksByDate, week.start, week.end)
            })).filter(p => p.weeklyClicks > 0)
              .sort((a,b) => b.weeklyClicks - a.weeklyClicks);

            const top10 = [...postsRaw]
                .sort((a,b) => (b.whatsappClicks||0) - (a.whatsappClicks||0))
                .slice(0,10)
                .map(p => ({
                    title: p.title,
                    slug: p.slug,
                    status: p.status,
                    whatsappClicks: p.whatsappClicks || 0,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                    authorName: p.author?.username || 'Unknown'
                }));

            const data = { 
                week: { start: WhatsappClicksReportService.formatDate(week.start), end: WhatsappClicksReportService.formatDate(week.end) },
                weeklyPosts,
                top10
            };
            pdfBuffer = await PDFService.generateWeeklyWhatsappClicksAllAuthorsPDF(data);
        } else {
            // Per-author report
            const authorId = notification.metadata?.author?._id || notification.targetUser || req.user.userId;
            const reportData = await WhatsappClicksReportService.buildAuthorReportData(authorId);
            pdfBuffer = await PDFService.generateWeeklyWhatsappClicksPDF(reportData, null);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.end(pdfBuffer);
    } catch (error) {
        console.error('❌ Error generating WhatsApp weekly PDF:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
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

/**
 * Create custom reminder (all authenticated users)
 */
exports.createReminder = async (req, res) => {
    try {
        const { title, message, scheduledFor, targetUsers, isSystemWide, priority } = req.body;
        const createdBy = req.user.userId;
        const isAdmin = req.user.isAdmin || false;
        const isAccountant = req.user.isAccountant || false;

        // Validate required fields
        if (!title || !message || !scheduledFor) {
            return res.status(400).json({
                success: false,
                message: 'Title, message, and scheduled time are required'
            });
        }

        // Validate scheduledFor is not too far in the past (allow for instant sending)
        const scheduledTime = new Date(scheduledFor);
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000); // 1 minute ago
        
        if (scheduledTime < oneMinuteAgo) {
            return res.status(400).json({
                success: false,
                message: 'Scheduled time cannot be more than 1 minute in the past'
            });
        }

        // For non-admin users (normal users and accountants), restrict to self-only reminders
        let finalTargetUsers = targetUsers;
        let finalIsSystemWide = isSystemWide;

        if (!isAdmin) {
            // Non-admin users can only send reminders to themselves
            finalTargetUsers = [createdBy];
            finalIsSystemWide = false;
            
            // If they tried to send to others or system-wide, return error
            if (isSystemWide || (targetUsers && targetUsers.length > 0 && !targetUsers.includes(createdBy))) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only create reminders for yourself'
                });
            }
        } else {
            // Admin logic (existing validation)
            // If not system-wide, validate targetUsers
            if (!isSystemWide && (!targetUsers || targetUsers.length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Target users are required when not sending system-wide'
                });
            }

            // Validate target users exist if provided
            if (!isSystemWide && targetUsers && targetUsers.length > 0) {
                const User = require('../models/User');
                const existingUsers = await User.find({ _id: { $in: targetUsers } });
                if (existingUsers.length !== targetUsers.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'One or more target users do not exist'
                    });
                }
            }
        }

        const reminder = await NotificationService.createCustomReminder({
            title,
            message,
            scheduledFor,
            targetUsers: finalIsSystemWide ? [] : finalTargetUsers,
            isSystemWide: Boolean(finalIsSystemWide),
            createdBy,
            priority: priority || 'medium'
        });

        res.status(201).json({
            success: true,
            message: 'Reminder created successfully',
            data: reminder
        });
    } catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create reminder'
        });
    }
};

/**
 * Get all users for target selection (admin and accountant only)
 */
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin or accountant
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or accountant privileges required.'
            });
        }

        const User = require('../models/User');
        const users = await User.find({ isApproved: true })
            .select('_id username email isAdmin isAccountant')
            .sort({ username: 1 });
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

exports.getAllReminders = async (req, res) => {
    try {
        const isAdmin = req.user.isAdmin || false;
        const userId = req.user.userId;

        const Notification = require('../models/Notification');
        
        let query = { 
            type: 'custom_reminder',
            isActive: true 
        };

        // Non-admin users can only see reminders they created
        if (!isAdmin) {
            query.actionPerformedBy = userId;
        }

        const reminders = await Notification.find(query)
        .populate('actionPerformedBy', 'username')
        .populate('targetUsers', 'username email')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reminders
        });
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reminders',
            error: error.message
        });
    }
};

exports.updateReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, scheduledFor, targetUsers, isSystemWide, priority, reminderStatus } = req.body;
        const isAdmin = req.user.isAdmin || false;
        const userId = req.user.userId;

        const Notification = require('../models/Notification');
        
        let query = { 
            _id: id, 
            type: 'custom_reminder',
            isActive: true 
        };

        // Non-admin users can only update reminders they created
        if (!isAdmin) {
            query.actionPerformedBy = userId;
        }

        const reminder = await Notification.findOne(query);

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: 'Reminder not found or you do not have permission to edit it'
            });
        }

        // For non-admin users, enforce restrictions
        if (!isAdmin) {
            // They can only edit title, message, scheduledFor, and priority
            // Cannot change target users or make it system-wide
            if (targetUsers !== undefined || isSystemWide !== undefined) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only edit title, message, scheduled time, and priority'
                });
            }
        }

        // Update fields
        if (title) reminder.title = title;
        if (message) reminder.message = message;
        if (scheduledFor) {
            const scheduledTime = new Date(scheduledFor);
            const currentScheduledTime = new Date(reminder.scheduledFor);
            const now = new Date();
            
            // Only validate future time if the scheduled time is actually being changed
            if (scheduledTime.getTime() !== currentScheduledTime.getTime()) {
                // If changing the time, require it to be in the future
                if (scheduledTime < now) {
                    return res.status(400).json({
                        success: false,
                        message: 'New scheduled time must be in the future'
                    });
                }
                
                // If rescheduling a sent reminder, change status back to scheduled
                if (reminder.reminderStatus === 'sent') {
                    reminder.reminderStatus = 'scheduled';
                }
            }
            
            reminder.scheduledFor = scheduledTime;
        }
        
        // Only admins can update these fields
        if (isAdmin) {
            if (targetUsers !== undefined) reminder.targetUsers = isSystemWide ? [] : targetUsers;
            if (isSystemWide !== undefined) reminder.isSystemWide = isSystemWide;
            if (reminderStatus) reminder.reminderStatus = reminderStatus;
        }
        
        if (priority) reminder.priority = priority;

        await reminder.save();

        res.json({
            success: true,
            message: 'Reminder updated successfully',
            data: reminder
        });
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update reminder',
            error: error.message
        });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.isAdmin || false;
        const userId = req.user.userId;

        const Notification = require('../models/Notification');
        
        let query = { 
            _id: id, 
            type: 'custom_reminder',
            isActive: true 
        };

        // Non-admin users can only delete reminders they created
        if (!isAdmin) {
            query.actionPerformedBy = userId;
        }

        const reminder = await Notification.findOne(query);

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: 'Reminder not found or you do not have permission to delete it'
            });
        }

        // Soft delete by setting isActive to false
        reminder.isActive = false;
        await reminder.save();

        res.json({
            success: true,
            message: 'Reminder deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete reminder',
            error: error.message
        });
    }
};



 