const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['scheduler', 'email', 'system', 'notification']
    },
    dataType: {
        type: String,
        required: true,
        enum: ['string', 'number', 'boolean', 'object', 'array']
    },
    validation: {
        required: { type: Boolean, default: true },
        min: { type: Number },
        max: { type: Number },
        enum: [String],
        pattern: { type: String }
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

// Initialize default system configurations
systemConfigSchema.statics.initializeDefaults = async function() {
    const defaultConfigs = [
            {
                key: 'SYSTEM_TIMEZONE',
                value: 'UTC', // Default timezone - can be changed via admin panel
                description: 'System timezone for all scheduled jobs',
            category: 'scheduler',
            dataType: 'string',
            validation: {
                required: true,
                enum: [
                    'UTC', 'Europe/Istanbul', 'Asia/Damascus', 'Europe/London',
                    'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo',
                    'Australia/Sydney', 'Europe/Paris', 'Europe/Berlin'
                ]
            }
        },
        {
            key: 'EMAIL_ENABLED',
            value: true,
            description: 'Enable/disable all email notifications',
            category: 'email',
            dataType: 'boolean'
        },
        {
            key: 'EMAIL_RETRY_ATTEMPTS',
            value: 3,
            description: 'Number of retry attempts for failed emails',
            category: 'email',
            dataType: 'number',
            validation: { min: 1, max: 10 }
        },
        {
            key: 'NOTIFICATION_CLEANUP_DAYS',
            value: 30,
            description: 'Days to keep notifications before cleanup',
            category: 'notification',
            dataType: 'number',
            validation: { min: 1, max: 365 }
        },
        {
            key: 'SCHEDULER_AUTO_RESTART',
            value: true,
            description: 'Automatically restart scheduler on configuration changes',
            category: 'scheduler',
            dataType: 'boolean'
        }
    ];

    for (const config of defaultConfigs) {
        // Only create if it doesn't exist - don't overwrite existing values
        const existingConfig = await this.findOne({ key: config.key });
        if (!existingConfig) {
            await this.create(config);
        }
    }
    
    console.log('✅ Default system configurations initialized');
};

// Get configuration value by key
systemConfigSchema.statics.getValue = async function(key, defaultValue = null) {
    const config = await this.findOne({ key });
    return config ? config.value : defaultValue;
};

// Set configuration value by key
systemConfigSchema.statics.setValue = async function(key, value, modifiedBy = null) {
    const config = await this.findOneAndUpdate(
        { key },
        { 
            value, 
            lastModified: new Date(),
            ...(modifiedBy && { modifiedBy })
        },
        { new: true }
    );
    
    if (!config) {
        throw new Error(`Configuration key '${key}' not found`);
    }
    
    return config;
};

// Get all configurations by category
systemConfigSchema.statics.getByCategory = async function(category) {
    return await this.find({ category }).sort({ key: 1 });
};

// Validate configuration value
systemConfigSchema.methods.validateValue = function(value) {
    const { dataType, validation } = this;
    
    // Type validation
    switch (dataType) {
        case 'string':
            if (typeof value !== 'string') return false;
            break;
        case 'number':
            if (typeof value !== 'number') return false;
            break;
        case 'boolean':
            if (typeof value !== 'boolean') return false;
            break;
        case 'object':
            if (typeof value !== 'object' || Array.isArray(value)) return false;
            break;
        case 'array':
            if (!Array.isArray(value)) return false;
            break;
    }
    
    // Additional validation
    if (validation.required && (value === null || value === undefined)) {
        return false;
    }
    
    if (validation.min !== undefined && value < validation.min) {
        return false;
    }
    
    if (validation.max !== undefined && value > validation.max) {
        return false;
    }
    
    if (validation.enum && !validation.enum.includes(value)) {
        return false;
    }
    
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return false;
    }
    
    return true;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
