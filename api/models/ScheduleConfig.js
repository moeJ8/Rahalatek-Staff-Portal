const mongoose = require('mongoose');

const scheduleConfigSchema = new mongoose.Schema({
    jobName: {
        type: String,
        required: true,
        unique: true,
        enum: [
            'checkin-reminder',
            'checkout-reminder',
            'auto-checkout',
            'daily-summary',
            'upcoming-events',
            'monthly-financial',
            'custom-reminders',
            'weekly-blog-whatsapp-report',
            'cleanup'
        ]
    },
    cronExpression: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    // Human-readable schedule display
    displaySchedule: {
        type: String,
        required: true
    },
    // Configuration metadata
    metadata: {
        hour: { type: Number, min: 0, max: 23 },
        minute: { type: Number, min: 0, max: 59 },
        dayOfWeek: [{ type: Number, min: 0, max: 6 }], // 0 = Sunday, 6 = Saturday
        dayOfMonth: { type: Number, min: 1, max: 31 },
        intervalSeconds: { type: Number, min: 1 }
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Initialize default schedules
scheduleConfigSchema.statics.initializeDefaults = async function() {
    const defaultConfigs = [
        {
            jobName: 'checkin-reminder',
            cronExpression: '0 11 * * *',
            description: 'Daily check-in reminder for employees',
            displaySchedule: 'Every day at 11:00 AM',
            metadata: { hour: 11, minute: 0 }
        },
        {
            jobName: 'checkout-reminder',
            cronExpression: '55 18 * * *',
            description: 'Daily check-out reminder for employees',
            displaySchedule: 'Every day at 6:55 PM',
            metadata: { hour: 18, minute: 55 }
        },
        {
            jobName: 'auto-checkout',
            cronExpression: '0 23 * * *',
            description: 'Automatic checkout for forgotten employees',
            displaySchedule: 'Every day at 11:00 PM',
            metadata: { hour: 23, minute: 0 }
        },
        {
            jobName: 'daily-summary',
            cronExpression: '0 8 * * *',
            description: 'Daily arrivals and departures summary',
            displaySchedule: 'Every day at 8:00 AM',
            metadata: { hour: 8, minute: 0 }
        },
        {
            jobName: 'upcoming-events',
            cronExpression: '0 8 * * 1,4,0',
            description: 'Upcoming events email (every 3 days)',
            displaySchedule: 'Mon, Thu, Sun at 8:00 AM',
            metadata: { hour: 8, minute: 0, dayOfWeek: [1, 4, 0] }
        },
        {
            jobName: 'monthly-financial',
            cronExpression: '0 0 1 * *',
            description: 'Monthly financial summary report',
            displaySchedule: '1st of month at 12:00 AM',
            metadata: { hour: 0, minute: 0, dayOfMonth: 1 }
        },
        {
            jobName: 'custom-reminders',
            cronExpression: '*/10 * * * * *',
            description: 'Process custom user reminders',
            displaySchedule: 'Every 10 seconds',
            metadata: { intervalSeconds: 10 }
        },
        {
            jobName: 'cleanup',
            cronExpression: '0 * * * *',
            description: 'Cleanup expired notifications',
            displaySchedule: 'Every hour',
            metadata: { hour: null, minute: 0 }
        }
        ,
        {
            jobName: 'weekly-blog-whatsapp-report',
            cronExpression: '0 8 * * 1',
            description: 'Weekly WhatsApp clicks report per author',
            displaySchedule: 'Every Monday at 8:00 AM',
            metadata: { hour: 8, minute: 0, dayOfWeek: [1] }
        }
    ];

    for (const config of defaultConfigs) {
        // Only create if it doesn't exist - don't overwrite existing configurations
        const existingConfig = await this.findOne({ jobName: config.jobName });
        if (!existingConfig) {
            await this.create(config);
        }
    }
    
    console.log('✅ Default schedule configurations initialized');
};

// Helper method to generate cron expression from metadata
scheduleConfigSchema.methods.generateCronFromMetadata = function() {
    const { hour, minute, dayOfWeek, dayOfMonth, intervalSeconds } = this.metadata;
    
    if (intervalSeconds) {
        return `*/${intervalSeconds} * * * * *`;
    }
    
    if (dayOfMonth) {
        return `${minute || 0} ${hour || 0} ${dayOfMonth} * *`;
    }
    
    if (dayOfWeek && dayOfWeek.length > 0) {
        return `${minute || 0} ${hour || 0} * * ${dayOfWeek.join(',')}`;
    }
    
    if (hour !== null && hour !== undefined) {
        return `${minute || 0} ${hour} * * *`;
    }
    
    // Hourly default
    return `${minute || 0} * * * *`;
};

// Helper method to generate display schedule from metadata
scheduleConfigSchema.methods.generateDisplayFromMetadata = function() {
    const { hour, minute, dayOfWeek, dayOfMonth, intervalSeconds } = this.metadata;
    
    if (intervalSeconds) {
        return `Every ${intervalSeconds} seconds`;
    }
    
    if (dayOfMonth) {
        const time = this.formatTime(hour || 0, minute || 0);
        return `${dayOfMonth}${this.getOrdinalSuffix(dayOfMonth)} of month at ${time}`;
    }
    
    if (dayOfWeek && dayOfWeek.length > 0) {
        const days = dayOfWeek.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ');
        const time = this.formatTime(hour || 0, minute || 0);
        return `${days} at ${time}`;
    }
    
    if (hour !== null && hour !== undefined) {
        const time = this.formatTime(hour, minute || 0);
        return `Every day at ${time}`;
    }
    
    return `Every hour at ${minute || 0} minutes`;
};

// Helper methods
scheduleConfigSchema.methods.formatTime = function(hour, minute) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

scheduleConfigSchema.methods.getOrdinalSuffix = function(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

module.exports = mongoose.model('ScheduleConfig', scheduleConfigSchema);
