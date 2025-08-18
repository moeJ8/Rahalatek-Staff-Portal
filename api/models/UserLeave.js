const mongoose = require('mongoose');

const userLeaveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['sick', 'annual', 'emergency', 'maternity', 'paternity', 'unpaid', 'personal', 'bereavement', 'custom'],
        required: true
    },
    customLeaveType: {
        type: String,
        trim: true,
        maxlength: 50
    },
    // Leave category determines input behavior
    leaveCategory: {
        type: String,
        enum: ['hourly', 'single-day', 'multiple-day'],
        required: true,
        default: 'single-day'
    },
    // For single-day and hourly leaves
    date: {
        type: Date,
        required: function() {
            return this.leaveCategory === 'hourly' || this.leaveCategory === 'single-day';
        }
    },
    // For multiple-day leaves
    startDate: {
        type: Date,
        required: function() {
            return this.leaveCategory === 'multiple-day';
        }
    },
    endDate: {
        type: Date,
        required: function() {
            return this.leaveCategory === 'multiple-day';
        }
    },
    // For hourly leaves
    startTime: {
        type: String, // Format: "HH:MM AM/PM"
        required: function() {
            return this.leaveCategory === 'hourly';
        }
    },
    endTime: {
        type: String, // Format: "HH:MM AM/PM"
        required: function() {
            return this.leaveCategory === 'hourly';
        }
    },
    // Number of days/hours (calculated automatically)
    daysCount: {
        type: Number,
        min: 0
    },
    // For hourly leaves - actual hours taken
    hoursCount: {
        type: Number,
        min: 0,
        default: 0
    },
    reason: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Status of the leave request
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'approved' // Default approved for admin-created leaves
    },
    // Admin notes
    adminNotes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Color for calendar display
    color: {
        type: String,
        default: '#fbbf24' // yellow-400
    },
    // Supporting documents (file paths)
    documents: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
userLeaveSchema.index({ userId: 1, startDate: 1, endDate: 1 });
userLeaveSchema.index({ startDate: 1, endDate: 1 });
userLeaveSchema.index({ status: 1, startDate: 1 });

// Pre-save hook to calculate days and hours count
userLeaveSchema.pre('save', function(next) {
    // Reset counts
    this.daysCount = 0;
    this.hoursCount = 0;
    
    if (this.leaveCategory === 'hourly') {
        // Calculate hours for hourly leave
        if (this.date && this.startTime && this.endTime) {
            const hours = this.calculateHoursFromTime(this.startTime, this.endTime);
            this.hoursCount = hours;
            this.daysCount = Math.round((hours / 8) * 100) / 100; // Convert to fractional days (8-hour workday)
        }
    } else if (this.leaveCategory === 'single-day') {
        // Single day leave
        this.daysCount = 1;
        this.hoursCount = 8; // Assume 8-hour workday
    } else if (this.leaveCategory === 'multiple-day') {
        // Multiple day leave
        if (this.startDate && this.endDate) {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            
            // Calculate the difference in days
            const timeDiff = end.getTime() - start.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            
            this.daysCount = daysDiff;
            this.hoursCount = daysDiff * 8; // Assume 8-hour workdays
        }
    }
    next();
});

// Method to calculate hours from time strings (e.g., "09:00 AM", "05:30 PM")
userLeaveSchema.methods.calculateHoursFromTime = function(startTime, endTime) {
    try {
        // Parse time strings
        const parseTime = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            
            let hour24 = hours;
            if (period === 'PM' && hours !== 12) {
                hour24 += 12;
            } else if (period === 'AM' && hours === 12) {
                hour24 = 0;
            }
            
            return hour24 + (minutes / 60);
        };
        
        const startHour = parseTime(startTime);
        const endHour = parseTime(endTime);
        
        // Calculate difference
        let hoursDiff = endHour - startHour;
        
        // Handle overnight scenarios (shouldn't happen in normal leave scenarios)
        if (hoursDiff < 0) {
            hoursDiff += 24;
        }
        
        return Math.round(hoursDiff * 100) / 100; // Round to 2 decimal places
    } catch (error) {
        console.error('Error calculating hours from time:', error);
        return 0;
    }
};

// Static method to get user leaves for a date range
userLeaveSchema.statics.getUserLeavesForRange = async function(userId, startDate, endDate) {
    // Normalize dates to avoid timezone issues
    const rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(endDate);
    rangeEnd.setHours(23, 59, 59, 999);
    
    return await this.find({
        userId,
        status: 'approved',
        $or: [
            // Multiple-day leaves
            {
                leaveCategory: 'multiple-day',
                startDate: { $lte: rangeEnd },
                endDate: { $gte: rangeStart }
            },
            // Single-day and hourly leaves
            {
                leaveCategory: { $in: ['single-day', 'hourly'] },
                date: { $gte: rangeStart, $lte: rangeEnd }
            }
        ]
    }).populate('userId', 'username email').sort({ startDate: 1, date: 1 });
};

// Static method to get all leaves for a date range (for calendar view)
userLeaveSchema.statics.getAllLeavesForRange = async function(startDate, endDate) {
    // Normalize dates to avoid timezone issues
    const rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(endDate);
    rangeEnd.setHours(23, 59, 59, 999);
    
    return await this.find({
        status: 'approved',
        $or: [
            // Multiple-day leaves
            {
                leaveCategory: 'multiple-day',
                startDate: { $lte: rangeEnd },
                endDate: { $gte: rangeStart }
            },
            // Single-day and hourly leaves
            {
                leaveCategory: { $in: ['single-day', 'hourly'] },
                date: { $gte: rangeStart, $lte: rangeEnd }
            }
        ]
    }).populate('userId', 'username email').sort({ startDate: 1, date: 1 });
};

// Static method to check if user is on leave on a specific date
userLeaveSchema.statics.isUserOnLeave = async function(userId, date) {
    // Normalize the input date to avoid timezone issues
    const checkDate = new Date(date);
    checkDate.setHours(12, 0, 0, 0); // Set to midday
    
    const leave = await this.findOne({
        userId,
        status: 'approved',
        $or: [
            // Multiple-day leaves
            {
                leaveCategory: 'multiple-day',
                startDate: { 
                    $lte: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 23, 59, 59)
                },
                endDate: { 
                    $gte: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 0, 0, 0)
                }
            },
            // Single-day and hourly leaves
            {
                leaveCategory: { $in: ['single-day', 'hourly'] },
                date: {
                    $gte: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 0, 0, 0),
                    $lt: new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() + 1, 0, 0, 0)
                }
            }
        ]
    });
    
    return leave;
};

// Static method to get leave statistics for a user
userLeaveSchema.statics.getUserLeaveStats = async function(userId, year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const leaves = await this.find({
        userId,
        status: 'approved',
        $or: [
            // Multiple-day leaves
            {
                leaveCategory: 'multiple-day',
                startDate: { $gte: startDate, $lte: endDate }
            },
            // Single-day and hourly leaves
            {
                leaveCategory: { $in: ['single-day', 'hourly'] },
                date: { $gte: startDate, $lte: endDate }
            }
        ]
    });
    
    const stats = {
        totalDays: 0,
        totalHours: 0,
        sick: 0,
        annual: 0,
        emergency: 0,
        other: 0,
        hourlyLeaves: 0,
        singleDayLeaves: 0,
        multipleDayLeaves: 0
    };
    
    leaves.forEach(leave => {
        stats.totalDays += leave.daysCount || 0;
        stats.totalHours += leave.hoursCount || 0;
        
        // Count by category
        if (leave.leaveCategory === 'hourly') stats.hourlyLeaves++;
        else if (leave.leaveCategory === 'single-day') stats.singleDayLeaves++;
        else if (leave.leaveCategory === 'multiple-day') stats.multipleDayLeaves++;
        
        // Count by type
        switch(leave.leaveType) {
            case 'sick':
                stats.sick += leave.daysCount || 0;
                break;
            case 'annual':
                stats.annual += leave.daysCount || 0;
                break;
            case 'emergency':
                stats.emergency += leave.daysCount || 0;
                break;
            default:
                stats.other += leave.daysCount || 0;
                break;
        }
    });
    
    return stats;
};

// Get leave type display name
userLeaveSchema.methods.getLeaveTypeDisplay = function() {
    if (this.leaveType === 'custom' && this.customLeaveType) {
        return this.customLeaveType;
    }
    
    const typeNames = {
        sick: 'Sick Leave',
        annual: 'Annual Leave',
        emergency: 'Emergency Leave',
        maternity: 'Maternity Leave',
        paternity: 'Paternity Leave',
        unpaid: 'Unpaid Leave',
        personal: 'Personal Leave',
        bereavement: 'Bereavement Leave'
    };
    
    return typeNames[this.leaveType] || this.leaveType;
};

// Get leave category display name
userLeaveSchema.methods.getLeaveCategoryDisplay = function() {
    const categoryNames = {
        'hourly': 'Hourly Leave',
        'single-day': 'Single Day Leave',
        'multiple-day': 'Multiple Day Leave'
    };
    
    return categoryNames[this.leaveCategory] || this.leaveCategory;
};

// Get leave duration display text
userLeaveSchema.methods.getDurationDisplay = function() {
    if (this.leaveCategory === 'hourly') {
        return `${this.hoursCount}h (${this.startTime} - ${this.endTime})`;
    } else if (this.leaveCategory === 'single-day') {
        return '1 day';
    } else if (this.leaveCategory === 'multiple-day') {
        return `${this.daysCount} days`;
    }
    return '';
};

// Static method to get annual leave statistics for a user
userLeaveSchema.statics.getAnnualLeaveStats = async function(userId, year = new Date().getFullYear()) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
    
    const annualLeaves = await this.find({
        userId,
        leaveType: 'annual',
        status: 'approved',
        $or: [
            // Multiple-day leaves
            {
                leaveCategory: 'multiple-day',
                startDate: { $lte: yearEnd },
                endDate: { $gte: yearStart }
            },
            // Single-day and hourly leaves
            {
                leaveCategory: { $in: ['single-day', 'hourly'] },
                date: { $gte: yearStart, $lte: yearEnd }
            }
        ]
    });
    
    let totalDaysUsed = 0;
    
    for (const leave of annualLeaves) {
        if (leave.leaveCategory === 'multiple-day') {
            // For multiple-day leaves, calculate overlap with the year
            const leaveStart = new Date(Math.max(leave.startDate.getTime(), yearStart.getTime()));
            const leaveEnd = new Date(Math.min(leave.endDate.getTime(), yearEnd.getTime()));
            const daysDiff = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            totalDaysUsed += daysDiff;
        } else {
            // For single-day and hourly leaves, add the days count
            totalDaysUsed += leave.daysCount || 1;
        }
    }
    
    const maxAnnualDays = 14;
    const remainingDays = Math.max(0, maxAnnualDays - totalDaysUsed);
    
    return {
        year,
        maxAnnualDays,
        daysUsed: totalDaysUsed,
        remainingDays,
        leaves: annualLeaves
    };
};

// Static method to get annual leave statistics for all users
userLeaveSchema.statics.getAllUsersAnnualLeaveStats = async function(year = new Date().getFullYear()) {
    const User = require('./User');
    const users = await User.find({ role: { $ne: 'admin' } }, 'username email');
    
    const stats = [];
    for (const user of users) {
        const userStats = await this.getAnnualLeaveStats(user._id, year);
        stats.push({
            userId: user._id,
            username: user.username,
            email: user.email,
            ...userStats
        });
    }
    
    return stats;
};

module.exports = mongoose.model('UserLeave', userLeaveSchema);
