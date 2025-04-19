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
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    isAdmin: { 
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
    }
}, { timestamps: true });

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