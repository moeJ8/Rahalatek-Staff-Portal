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
    hotels: [{
        city: String,
        hotelName: String,
        roomType: String,
        nights: Number,
        checkIn: Date,
        checkOut: Date,
        pax: Number,
        confirmationNumber: String
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
        vehicleType: String
    }],
    trips: Schema.Types.Mixed,
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

module.exports = mongoose.model('Voucher', voucherSchema); 