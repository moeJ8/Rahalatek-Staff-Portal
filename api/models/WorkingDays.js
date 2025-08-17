const mongoose = require('mongoose');

const workingDaysSchema = new mongoose.Schema({
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
    // Default working days of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    defaultWorkingDaysOfWeek: {
        type: [Number],
        default: [0, 1, 2, 3, 4, 6] // Sunday, Monday to Thursday, Saturday (Friday is non-working)
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
workingDaysSchema.index({ year: 1, month: 1 }, { unique: true });

// Static method to get working days for a specific month/year
workingDaysSchema.statics.getWorkingDaysForMonth = async function(year, month) {
    let workingDaysConfig = await this.findOne({ year, month });
    
    if (!workingDaysConfig) {
        // Create default configuration based on weekdays
        const daysInMonth = new Date(year, month, 0).getDate();
        const workingDays = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            
            // Default: Monday to Saturday (including Friday)
            const isWorkingDay = [1, 2, 3, 4, 5, 6].includes(dayOfWeek);
            
            workingDays.push({
                day,
                isWorkingDay
            });
        }
        
        workingDaysConfig = {
            year,
            month,
            workingDays,
            defaultWorkingDaysOfWeek: [1, 2, 3, 4, 6]
        };
    }
    
    return workingDaysConfig;
};

// Static method to check if a specific date is a working day
workingDaysSchema.statics.isWorkingDay = async function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const config = await this.getWorkingDaysForMonth(year, month);
    const dayConfig = config.workingDays?.find(d => d.day === day);
    
    if (dayConfig) {
        return dayConfig.isWorkingDay;
    }
    
    // Fallback to default working days of week
    const dayOfWeek = date.getDay();
    return config.defaultWorkingDaysOfWeek?.includes(dayOfWeek) || false;
};

module.exports = mongoose.model('WorkingDays', workingDaysSchema);
