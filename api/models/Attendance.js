const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        // Store only the date part (without time) for easier querying
        set: function(date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;
        }
    },
    checkIn: {
        type: Date,
        default: null
    },
    checkOut: {
        type: Date,
        default: null
    },
    hoursWorked: {
        type: Number,
        default: 0,
        get: function() {
            if (this.checkIn && this.checkOut) {
                const diff = this.checkOut - this.checkIn;
                return Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
            }
            return 0;
        }
    },
    status: {
        type: String,
        enum: ['checked-in', 'checked-out', 'not-checked-in'],
        default: 'not-checked-in'
    },
    notes: {
        type: String,
        default: ''
    },
    // Admin editing fields
    manuallyEdited: {
        type: Boolean,
        default: false
    },
    editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    editedAt: {
        type: Date,
        default: null
    },
    adminNotes: {
        type: String,
        default: ''
    },
    originalData: {
        checkIn: { type: Date, default: null },
        checkOut: { type: Date, default: null },
        status: { type: String, default: null }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
});

// Compound index for efficient queries
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userId: 1, createdAt: -1 });

// Method to calculate hours worked
attendanceSchema.methods.calculateHours = function() {
    if (this.checkIn && this.checkOut) {
        const diff = this.checkOut - this.checkIn;
        this.hoursWorked = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
        return this.hoursWorked;
    }
    return 0;
};

// Method to check in
attendanceSchema.methods.checkInUser = function() {
    if (this.status === 'not-checked-in') {
        this.checkIn = new Date();
        this.status = 'checked-in';
        return true;
    }
    return false;
};

// Method to check out
attendanceSchema.methods.checkOutUser = function() {
    if (this.status === 'checked-in') {
        this.checkOut = new Date();
        this.status = 'checked-out';
        this.calculateHours();
        return true;
    }
    return false;
};

// Static method to get today's attendance for a user
attendanceSchema.statics.getTodayAttendance = async function(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await this.findOne({
        userId: userId,
        date: today
    });
};

// Static method to create or get today's attendance record
attendanceSchema.statics.getOrCreateTodayAttendance = async function(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendance = await this.findOne({
        userId: userId,
        date: today
    });
    
    if (!attendance) {
        attendance = new this({
            userId: userId,
            date: today,
            status: 'not-checked-in'
        });
        await attendance.save();
    }
    
    return attendance;
};

// Method for admin to edit attendance
attendanceSchema.methods.adminEdit = function(editData, adminUserId) {
    // Store original data if not already stored
    if (!this.manuallyEdited) {
        this.originalData = {
            checkIn: this.checkIn,
            checkOut: this.checkOut,
            status: this.status
        };
    }

    // Update fields
    if (editData.checkIn !== undefined) this.checkIn = editData.checkIn;
    if (editData.checkOut !== undefined) this.checkOut = editData.checkOut;
    if (editData.status !== undefined) this.status = editData.status;
    if (editData.notes !== undefined) this.notes = editData.notes;
    if (editData.adminNotes !== undefined) this.adminNotes = editData.adminNotes;

    // Mark as manually edited
    this.manuallyEdited = true;
    this.editedBy = adminUserId;
    this.editedAt = new Date();

    // Recalculate hours if both times are set
    if (this.checkIn && this.checkOut) {
        this.calculateHours();
    }

    return this;
};

// Static method to create manual attendance entry
attendanceSchema.statics.createManualEntry = async function(data, adminUserId) {
    const attendance = new this({
        userId: data.userId,
        date: data.date,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        status: data.status || 'checked-out',
        notes: data.notes || '',
        adminNotes: data.adminNotes || 'Manually created by admin',
        manuallyEdited: true,
        editedBy: adminUserId,
        editedAt: new Date()
    });

    if (attendance.checkIn && attendance.checkOut) {
        attendance.calculateHours();
    }

    return await attendance.save();
};

// Static method to get attendance reports
attendanceSchema.statics.getAttendanceReport = async function(filters = {}) {
    const {
        startDate,
        endDate,
        userId,
        status
    } = filters;
    
    const matchConditions = {};
    
    if (startDate && endDate) {
        matchConditions.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    if (userId) {
        matchConditions.userId = new mongoose.Types.ObjectId(userId);
    }
    
    if (status) {
        matchConditions.status = status;
    }
    
    return await this.find(matchConditions)
        .populate('userId', 'username email')
        .populate('editedBy', 'username')
        .sort({ date: -1, checkIn: -1 });
};

module.exports = mongoose.model('Attendance', attendanceSchema);
