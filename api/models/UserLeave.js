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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // Number of days (calculated automatically)
    daysCount: {
        type: Number,
        min: 0.5
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
    // Half day or full day
    isHalfDay: {
        type: Boolean,
        default: false
    },
    // If half day, specify which half
    halfDayPeriod: {
        type: String,
        enum: ['morning', 'afternoon'],
        default: null
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

// Pre-save hook to calculate days count
userLeaveSchema.pre('save', function(next) {
    if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        
        // Calculate the difference in days
        const timeDiff = end.getTime() - start.getTime();
        let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        // If it's a half day, count as 0.5
        if (this.isHalfDay && daysDiff === 1) {
            daysDiff = 0.5;
        }
        
        this.daysCount = daysDiff;
    }
    next();
});

// Static method to get user leaves for a date range
userLeaveSchema.statics.getUserLeavesForRange = async function(userId, startDate, endDate) {
    return await this.find({
        userId,
        status: 'approved',
        $or: [
            {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            }
        ]
    }).populate('userId', 'username email').sort({ startDate: 1 });
};

// Static method to get all leaves for a date range (for calendar view)
userLeaveSchema.statics.getAllLeavesForRange = async function(startDate, endDate) {
    return await this.find({
        status: 'approved',
        $or: [
            {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            }
        ]
    }).populate('userId', 'username email').sort({ startDate: 1 });
};

// Static method to check if user is on leave on a specific date
userLeaveSchema.statics.isUserOnLeave = async function(userId, date) {
    const leave = await this.findOne({
        userId,
        status: 'approved',
        startDate: { $lte: date },
        endDate: { $gte: date }
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
        startDate: { $gte: startDate, $lte: endDate }
    });
    
    const stats = {
        total: 0,
        sick: 0,
        annual: 0,
        emergency: 0,
        other: 0
    };
    
    leaves.forEach(leave => {
        stats.total += leave.daysCount;
        
        switch(leave.leaveType) {
            case 'sick':
                stats.sick += leave.daysCount;
                break;
            case 'annual':
                stats.annual += leave.daysCount;
                break;
            case 'emergency':
                stats.emergency += leave.daysCount;
                break;
            default:
                stats.other += leave.daysCount;
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

module.exports = mongoose.model('UserLeave', userLeaveSchema);
