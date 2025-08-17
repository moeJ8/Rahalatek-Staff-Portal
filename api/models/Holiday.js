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
    date: {
        type: Date,
        required: true
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
holidaySchema.index({ isActive: 1, date: 1 });

// Static method to get holidays for a date range
holidaySchema.statics.getHolidaysForRange = async function(startDate, endDate) {
    return await this.find({
        date: {
            $gte: startDate,
            $lte: endDate
        },
        isActive: true
    }).sort({ date: 1 });
};

// Static method to get holidays for a specific month/year
holidaySchema.statics.getHolidaysForMonth = async function(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await this.getHolidaysForRange(startDate, endDate);
};

// Static method to check if a specific date is a holiday
holidaySchema.statics.isHoliday = async function(date) {
    const holiday = await this.findOne({
        date: {
            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        },
        isActive: true
    });
    
    return holiday;
};

// Method to generate recurring holiday for next year
holidaySchema.methods.generateNextYear = async function() {
    if (!this.isRecurring) return null;
    
    const nextYear = new Date(this.date);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    // Check if holiday already exists for next year
    const existing = await this.constructor.findOne({
        name: this.name,
        date: {
            $gte: new Date(nextYear.getFullYear(), 0, 1),
            $lt: new Date(nextYear.getFullYear() + 1, 0, 1)
        }
    });
    
    if (existing) return existing;
    
    // Create new holiday for next year
    const newHoliday = new this.constructor({
        name: this.name,
        description: this.description,
        date: nextYear,
        isRecurring: this.isRecurring,
        recurrencePattern: this.recurrencePattern,
        type: this.type,
        color: this.color,
        createdBy: this.createdBy
    });
    
    return await newHoliday.save();
};

module.exports = mongoose.model('Holiday', holidaySchema);
