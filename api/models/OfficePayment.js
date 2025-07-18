const mongoose = require('mongoose');

const officePaymentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['INCOMING', 'OUTGOING']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'TRY', 'EGP']
    },
    notes: {
        type: String,
        default: ''
    },
    officeName: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedVoucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        default: null
    },
    autoGenerated: {
        type: Boolean,
        default: false
    },
    paymentDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for efficient querying
officePaymentSchema.index({ officeName: 1, currency: 1 });

module.exports = mongoose.model('OfficePayment', officePaymentSchema); 