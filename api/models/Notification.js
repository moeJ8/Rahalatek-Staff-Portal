const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['voucher_arrival_reminder', 'voucher_departure_reminder', 'voucher_status_change', 'system_announcement', 'user_role_change', 'daily_arrivals_summary', 'daily_departures_summary', 'attendance_checkin_reminder', 'attendance_checkout_reminder', 'custom_reminder'],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    // Related voucher (for voucher-specific notifications)
    relatedVoucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        default: null
    },
    // User who created the voucher (for permission checking)
    voucherCreatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Target user (for user-specific notifications like role changes)
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // User who performed the action (admin who changed the role)
    actionPerformedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Users who have read this notification
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Priority level
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    // Auto-expiry date (optional)
    expiresAt: {
        type: Date,
        default: null
    },
    // Metadata for extensibility
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Custom reminder specific fields
    scheduledFor: {
        type: Date,
        default: null
    },
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isSystemWide: {
        type: Boolean,
        default: false
    },
    reminderStatus: {
        type: String,
        enum: ['scheduled', 'sent', 'cancelled'],
        default: function() {
            return this.type === 'custom_reminder' ? 'scheduled' : undefined;
        }
    }
}, { 
    timestamps: true,
    indexes: [
        { type: 1, createdAt: -1 },
        { relatedVoucher: 1 },
        { voucherCreatedBy: 1 },
        { isActive: 1, createdAt: -1 },
        { scheduledFor: 1, reminderStatus: 1 },
        { targetUsers: 1 },
        { isSystemWide: 1 }
    ]
});

// Method to check if user has read this notification
notificationSchema.methods.isReadByUser = function(userId) {
    return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to mark as read by user
notificationSchema.methods.markAsReadByUser = function(userId) {
    if (!this.isReadByUser(userId)) {
        this.readBy.push({
            user: userId,
            readAt: new Date()
        });
    }
};

// Static method to get user-specific notifications based on role
notificationSchema.statics.getUserNotifications = async function(userId, userRole) {
    let query;

    // Role-based filtering
    if (userRole === 'admin' || userRole === 'accountant') {
        // Admins and accountants see all notifications EXCEPT user-specific role changes
        query = {
            isActive: true,
            $and: [
                // Expired notifications should be filtered out
                {
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: new Date() } }
                    ]
                },
                // Show all non-role-change notifications OR role changes targeted at this user
                // For custom reminders, only show sent ones (not scheduled or cancelled)
                {
                    $or: [
                        { 
                            type: { $nin: ['user_role_change', 'custom_reminder', 'attendance_checkin_reminder', 'attendance_checkout_reminder'] }
                        },
                        { 
                            type: { $in: ['attendance_checkin_reminder', 'attendance_checkout_reminder'] }, 
                            targetUser: userId 
                        },
                        { 
                            type: 'user_role_change', 
                            targetUser: userId 
                        },
                        { 
                            type: 'custom_reminder',
                            reminderStatus: 'sent',
                            $or: [
                                { isSystemWide: true },
                                { targetUsers: userId }
                            ]
                        }
                    ]
                }
            ]
        };
    } else {
        // Regular users see notifications related to their vouchers OR targeted at them
        query = {
            isActive: true,
            $and: [
                // Expired notifications should be filtered out
                {
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: new Date() } }
                    ]
                },
                // Show vouchers they created OR notifications targeted at them
                // For custom reminders, only show sent ones (not scheduled or cancelled)
                {
                    $or: [
                        { voucherCreatedBy: userId },
                        { targetUser: userId },
                        { 
                            type: 'custom_reminder',
                            reminderStatus: 'sent',
                            $or: [
                                { isSystemWide: true },
                                { targetUsers: userId }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    return this.find(query)
        .populate('relatedVoucher', 'voucherNumber clientName arrivalDate')
        .populate('voucherCreatedBy', 'username')
        .populate('targetUser', 'username')
        .populate('actionPerformedBy', 'username')
        .sort({ createdAt: -1 })
        .limit(50); // Limit to recent 50 notifications
};

module.exports = mongoose.model('Notification', notificationSchema); 
module.exports = mongoose.model('Notification', notificationSchema); 