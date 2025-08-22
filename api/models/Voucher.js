const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voucherSchema = new mongoose.Schema({
    voucherNumber: {
        type: Number,
        required: true,
        unique: true
    },
    voucherId: {
        type: Number,
        unique: true
    },
    bookingNumber: {
        type: Number,
        unique: true
    },
    clientName: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    officeName: {
        type: String,
        default: ''
    },
    bookingReference: {
        type: String,
        required: true
    },
    arrivalDate: {
        type: Date,
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    capital: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'TRY'],
        default: 'USD'
    },
    hotels: [{
        city: String,
        hotelName: String,
        roomType: String,
        nights: Number,
        checkIn: Date,
        checkOut: Date,
        pax: Number,
        adults: { type: Number, default: null },
        children: { type: Number, default: null },
        confirmationNumber: String,
        // Add payment info to each hotel
        officeName: { type: String, default: '' },
        price: { type: Number, default: 0 }
    }],
    transfers: [{
        type: { type: String, enum: ['ARV', 'DEP'] },
        date: Date,
        time: String,
        flightNumber: String,
        city: String,
        from: String,
        to: String,
        pax: Number,
        adults: { type: Number, default: null },
        children: { type: Number, default: null },
        vehicleType: String,
        // Add payment info to each transfer
        officeName: { type: String, default: '' },
        price: { type: Number, default: 0 }
    }],
    trips: Schema.Types.Mixed,
    flights: [{
        companyName: String,
        from: String,
        to: String,
        flightNumber: String,
        departureDate: Date,
        arrivalDate: Date,
        luggage: String,
        // Add payment info to each flight
        officeName: { type: String, default: '' },
        price: { type: Number, default: 0 }
    }],
    // Keep the old payments structure for backward compatibility
    payments: {
        hotels: {
            officeName: {
                type: String,
                default: ''
            },
            price: {
                type: Number,
                default: 0
            }
        },
        transfers: {
            officeName: {
                type: String,
                default: ''
            },
            price: {
                type: Number,
                default: 0
            }
        },
        trips: {
            officeName: {
                type: String,
                default: ''
            },
            price: {
                type: Number,
                default: 0
            }
        },
        flights: {
            officeName: {
                type: String,
                default: ''
            },
            price: {
                type: Number,
                default: 0
            }
        }
    },
    note: {
        type: String,
        default: ''
    },
    totalAmount: {
        type: Number,
        required: true
    },
    advancedPayment: {
        type: Boolean,
        default: false
    },
    advancedAmount: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    paymentDate: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['await', 'arrived', 'canceled'],
        default: 'await'
    },
    statusUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    statusUpdatedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });


voucherSchema.pre('save', function(next) {
    if (this.voucherNumber) {
        if (!this.voucherId) {
            this.voucherId = this.voucherNumber;
        }

        if (!this.bookingNumber) {
            this.bookingNumber = this.voucherNumber;
        }
    }
    next();
});

voucherSchema.statics.getNextVoucherNumber = async function() {
    try {
        const lastVoucher = await this.findOne().sort({ voucherNumber: -1 });

        const nextNumber = lastVoucher ? lastVoucher.voucherNumber + 1 : 10000;
        
        return nextNumber;
    } catch (error) {
        return 10000 + Math.floor(Math.random() * 1000);
    }
};

// Method to check and update status based on arrival date
voucherSchema.methods.updateStatusIfNeeded = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const arrivalDate = new Date(this.arrivalDate);
    arrivalDate.setHours(0, 0, 0, 0);
    
    // Set default status if not exists
    if (!this.status) {
        this.status = 'await';
    }
    
    // If arrival date has passed and status is still 'await', update to 'arrived'
    if (arrivalDate <= today && this.status === 'await') {
        this.status = 'arrived';
        this.statusUpdatedAt = new Date();
        return true; // Status was updated
    }
    
    return false; // No status update needed
};

// Static method to bulk update statuses for all vouchers
voucherSchema.statics.updateAllStatuses = async function() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // First, set default status for vouchers that don't have one
        await this.updateMany(
            {
                status: { $exists: false },
                isDeleted: { $ne: true }
            },
            {
                status: 'await'
            }
        );
        
        // Then update vouchers that should be 'arrived'
        const result = await this.updateMany(
            {
                arrivalDate: { $lte: today },
                $or: [
                    { status: 'await' },
                    { status: { $exists: false } }
                ],
                isDeleted: { $ne: true }
            },
            {
                status: 'arrived',
                statusUpdatedAt: new Date()
            }
        );
        
        return result;
    } catch (error) {
        console.error('Error updating voucher statuses:', error);
        throw error;
    }
};

module.exports = mongoose.model('Voucher', voucherSchema); 