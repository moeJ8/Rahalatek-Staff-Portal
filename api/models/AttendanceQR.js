const mongoose = require('mongoose');

const attendanceQRSchema = new mongoose.Schema({
    monthYear: {
        type: String,
        required: true,
        unique: true,
        // Format: "2025-01", "2025-02", etc.
        match: /^\d{4}-\d{2}$/
    },
    qrCodeData: {
        type: String,
        required: true,
        unique: true
    },
    qrCodeImage: {
        type: String, // Base64 encoded image
        required: true
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
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries (monthYear and qrCodeData already indexed via unique: true)
attendanceQRSchema.index({ isActive: 1, expiresAt: 1 });

// Static method to get current month's QR code
attendanceQRSchema.statics.getCurrentMonthQR = async function() {
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    return await this.findOne({
        monthYear: monthYear,
        isActive: true,
        expiresAt: { $gt: new Date() }
    });
};

// Static method to create new monthly QR code
attendanceQRSchema.statics.generateMonthlyQR = async function(adminUserId) {
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Deactivate any existing QR for this month
    await this.updateMany(
        { monthYear: monthYear },
        { isActive: false }
    );
    
    // Generate random string for uniqueness
    const randomString = Math.random().toString(36).substring(2, 15);
    const qrCodeData = `ATTENDANCE-${monthYear}-${randomString}`;
    
    // Calculate expiry date (last day of current month)
    const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    expiresAt.setHours(23, 59, 59, 999);
    
    const qrCode = new this({
        monthYear,
        qrCodeData,
        qrCodeImage: '', // Will be set by the controller
        isActive: true,
        createdBy: adminUserId,
        expiresAt
    });
    
    return qrCode;
};

// Static method to verify QR code
attendanceQRSchema.statics.verifyQRCode = async function(qrCodeData) {
    return await this.findOne({
        qrCodeData: qrCodeData,
        isActive: true,
        expiresAt: { $gt: new Date() }
    });
};

// Method to check if QR code is expired
attendanceQRSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

// Static method to cleanup expired QR codes
attendanceQRSchema.statics.cleanupExpiredQR = async function() {
    const result = await this.updateMany(
        {
            expiresAt: { $lt: new Date() },
            isActive: true
        },
        {
            isActive: false
        }
    );
    
    return result;
};

module.exports = mongoose.model('AttendanceQR', attendanceQRSchema);
