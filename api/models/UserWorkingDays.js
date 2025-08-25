const mongoose = require('mongoose');

const userWorkingDaysSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    workingDays: [{
        day: {
            type: Number,
            required: true,
            min: 1,
            max: 31
        },
        isWorkingDay: {
            type: Boolean,
            default: true
        }
    }],
    // Override default working days of the week for this user
    defaultWorkingDaysOfWeek: {
        type: [Number],
        default: null // null means use global default
    },
    // Track if this is a custom configuration or inherited from global
    isCustom: {
        type: Boolean,
        default: false
    },
    // Daily working hours for this user (default 8)
    dailyHours: {
        type: Number,
        default: 8,
        min: 1,
        max: 24
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
userWorkingDaysSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });
userWorkingDaysSchema.index({ year: 1, month: 1 }); // For bulk operations
userWorkingDaysSchema.index({ isCustom: 1, year: 1, month: 1 }); // For finding custom configs

// Static method to get working days for a specific user and month
userWorkingDaysSchema.statics.getWorkingDaysForUser = async function(userId, year, month) {
    // First try to get user-specific configuration
    let userConfig = await this.findOne({ userId, year, month });
    
    if (userConfig) {
        return userConfig;
    }
    
    // Fall back to global configuration
    const WorkingDays = require('./WorkingDays');
    const globalConfig = await WorkingDays.getWorkingDaysForMonth(year, month);
    
    return {
        userId,
        year,
        month,
        workingDays: globalConfig.workingDays,
        defaultWorkingDaysOfWeek: globalConfig.defaultWorkingDaysOfWeek,
        dailyHours: 8, // Default 8 hours when using global settings
        isCustom: false,
        isGlobal: true // Flag to indicate this is using global settings
    };
};

// Static method to check if a specific date is a working day for a user
userWorkingDaysSchema.statics.isWorkingDayForUser = async function(userId, date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const config = await this.getWorkingDaysForUser(userId, year, month);
    const dayConfig = config.workingDays?.find(d => d.day === day);
    
    if (dayConfig) {
        return dayConfig.isWorkingDay;
    }
    
    // Fallback to default working days of week
    const dayOfWeek = date.getDay();
    const defaultDays = config.defaultWorkingDaysOfWeek || [0, 1, 2, 3, 4, 6];
    return defaultDays.includes(dayOfWeek);
};

// Static method to apply global configuration to specific users
userWorkingDaysSchema.statics.applyGlobalToUsers = async function(userIds, year, month, globalConfig, adminUserId) {
    const operations = userIds.map(userId => ({
        updateOne: {
            filter: { userId, year, month },
            update: {
                $set: {
                    workingDays: globalConfig.workingDays,
                    defaultWorkingDaysOfWeek: globalConfig.defaultWorkingDaysOfWeek,
                    isCustom: false,
                    updatedBy: adminUserId,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    userId,
                    year,
                    month,
                    createdBy: adminUserId
                }
            },
            upsert: true
        }
    }));
    
    return await this.bulkWrite(operations);
};

// Static method to remove user-specific configurations (revert to global)
userWorkingDaysSchema.statics.revertToGlobal = async function(userIds, year, month) {
    return await this.deleteMany({
        userId: { $in: userIds },
        year,
        month
    });
};

// Static method to get all users with custom configurations for a period
userWorkingDaysSchema.statics.getUsersWithCustomConfigs = async function(year, month) {
    return await this.find({
        year,
        month,
        isCustom: true
    }).populate('userId', 'username email isAdmin isAccountant').populate('updatedBy', 'username');
};

module.exports = mongoose.model('UserWorkingDays', userWorkingDaysSchema);
