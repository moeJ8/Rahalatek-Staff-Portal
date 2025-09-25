const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String,
        sparse: true,  // This allows null values without uniqueness conflicts
        unique: true,
        default: null
    },
    phoneNumber: {
        type: String,
        default: null
    },
    countryCode: {
        type: String,
        default: null
    },
    password: { 
        type: String, 
        required: true 
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    },
    isAccountant: {
        type: Boolean,
        default: false
    },
    isContentManager: {
        type: Boolean,
        default: false
    },
    isApproved: {  // Add this field for admin approval
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    securityQuestion: {
        type: String,
        default: null
    },
    securityAnswer: {
        type: String,
        default: null
    },
    // Email verification fields
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Salary fields
userSchema.add({
    salaryAmount: {
        type: Number,
        default: null,
        min: 0
    },
    salaryCurrency: {
        type: String,
        default: null
    },
    salaryDayOfMonth: {
        type: Number,
        default: null,
        min: 1,
        max: 31
    },
    salaryNotes: {
        type: String,
        default: null
    },
    salaryBaseEntries: [
        {
            year: { type: Number, required: true },
            month: { type: Number, required: true }, // 0-11
            amount: { type: Number, required: true, min: 0 },
            currency: { type: String, default: 'USD' },
            note: { type: String, default: '' },
            setBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        }
    ],
    salaryBonuses: [
        {
            year: { type: Number, required: true }, // Gregorian year of cycle reference
            month: { type: Number, required: true }, // 0-11 month index for the cycle reference (e.g., previous cycle start)
            amount: { type: Number, required: true, min: 0 },
            currency: { type: String, default: 'USD' },
            note: { type: String, default: '' },
            awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        }
    ]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Also hash security answer if modified
userSchema.pre('save', async function(next) {
    if (!this.isModified('securityAnswer') || !this.securityAnswer) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.securityAnswer = await bcrypt.hash(this.securityAnswer, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare security answers
userSchema.methods.compareSecurityAnswer = async function(candidateAnswer) {
    return await bcrypt.compare(candidateAnswer, this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema); 