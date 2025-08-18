const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Holiday duration type
    holidayType: {
        type: String,
        enum: ['single-day', 'multiple-day'],
        required: true,
        default: 'single-day'
    },
    // For single-day holidays
    date: {
        type: Date,
        required: function() {
            return this.holidayType === 'single-day';
        }
    },
    // For multiple-day holidays
    startDate: {
        type: Date,
        required: function() {
            return this.holidayType === 'multiple-day';
        }
    },
    endDate: {
        type: Date,
        required: function() {
            return this.holidayType === 'multiple-day';
        }
    },
    // For recurring holidays (like national holidays)
    isRecurring: {
        type: Boolean,
        default: false
    },
    // If recurring, specify the recurrence pattern
    recurrencePattern: {
        type: String,
        enum: ['yearly', 'monthly', 'custom'],
        default: 'yearly'
    },
    // Holiday type
    type: {
        type: String,
        enum: ['national', 'company', 'religious', 'custom'],
        default: 'company'
    },
    // Color for calendar display
    color: {
        type: String,
        default: '#f87171' // red-400
    },
    isActive: {
        type: Boolean,
        default: true
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

// Index for efficient date queries
holidaySchema.index({ date: 1 });
holidaySchema.index({ startDate: 1 });
holidaySchema.index({ endDate: 1 });
holidaySchema.index({ isActive: 1, date: 1 });
holidaySchema.index({ isActive: 1, startDate: 1, endDate: 1 });
holidaySchema.index({ holidayType: 1 });

// Static method to get holidays for a date range
holidaySchema.statics.getHolidaysForRange = async function(startDate, endDate) {
    return await this.find({
        $or: [
            // Single-day holidays
            {
                holidayType: 'single-day',
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            // Multiple-day holidays that overlap with the range
            {
                holidayType: 'multiple-day',
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            }
        ],
        isActive: true
    }).sort({ 
        date: 1,
        startDate: 1
    });
};

// Static method to get holidays for a specific month/year
holidaySchema.statics.getHolidaysForMonth = async function(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await this.getHolidaysForRange(startDate, endDate);
};

// Static method to check if a specific date is a holiday
holidaySchema.statics.isHoliday = async function(date) {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const holiday = await this.findOne({
        $or: [
            // Single-day holidays
            {
                holidayType: 'single-day',
                date: {
                    $gte: dayStart,
                    $lt: dayEnd
                }
            },
            // Multiple-day holidays that include this date
            {
                holidayType: 'multiple-day',
                startDate: { $lte: dayStart },
                endDate: { $gte: dayStart }
            }
        ],
        isActive: true
    });
    
    return holiday;
};

// Method to generate recurring holiday for next year
holidaySchema.methods.generateNextYear = async function() {
    if (!this.isRecurring) return null;
    
    let nextYearDate, nextYearStartDate, nextYearEndDate;
    
    if (this.holidayType === 'single-day') {
        nextYearDate = new Date(this.date);
        nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    } else {
        nextYearStartDate = new Date(this.startDate);
        nextYearStartDate.setFullYear(nextYearStartDate.getFullYear() + 1);
        nextYearEndDate = new Date(this.endDate);
        nextYearEndDate.setFullYear(nextYearEndDate.getFullYear() + 1);
    }
    
    // Check if holiday already exists for next year
    const checkDate = nextYearDate || nextYearStartDate;
    const existing = await this.constructor.findOne({
        name: this.name,
        $or: [
            {
                holidayType: 'single-day',
                date: {
                    $gte: new Date(checkDate.getFullYear(), 0, 1),
                    $lt: new Date(checkDate.getFullYear() + 1, 0, 1)
                }
            },
            {
                holidayType: 'multiple-day',
                startDate: {
                    $gte: new Date(checkDate.getFullYear(), 0, 1),
                    $lt: new Date(checkDate.getFullYear() + 1, 0, 1)
                }
            }
        ]
    });
    
    if (existing) return existing;
    
    // Create new holiday for next year
    const newHolidayData = {
        name: this.name,
        description: this.description,
        holidayType: this.holidayType,
        isRecurring: this.isRecurring,
        recurrencePattern: this.recurrencePattern,
        type: this.type,
        color: this.color,
        createdBy: this.createdBy
    };
    
    if (this.holidayType === 'single-day') {
        newHolidayData.date = nextYearDate;
    } else {
        newHolidayData.startDate = nextYearStartDate;
        newHolidayData.endDate = nextYearEndDate;
    }
    
    const newHoliday = new this.constructor(newHolidayData);
    return await newHoliday.save();
};

module.exports = mongoose.model('Holiday', holidaySchema);
