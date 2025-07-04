const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    officeName: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'TRY'],
        default: 'USD'
    },
    type: {
        type: String,
        enum: ['OWED_TO_OFFICE', 'OWED_FROM_OFFICE'], // OWED_TO_OFFICE = we owe them, OWED_FROM_OFFICE = they owe us
        required: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    },
    dueDate: {
        type: Date,
        default: null
    },
    closedDate: {
        type: Date,
        default: null
    },
    relatedVoucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient queries
debtSchema.index({ officeName: 1, status: 1 });
debtSchema.index({ type: 1, status: 1 });
debtSchema.index({ createdAt: -1 });

// Virtual for formatting amount with currency
debtSchema.virtual('formattedAmount').get(function() {
    const symbols = { USD: '$', EUR: '€', TRY: '₺' };
    return `${symbols[this.currency] || '$'}${this.amount.toFixed(2)}`;
});

// Method to close debt
debtSchema.methods.closeDebt = function(userId) {
    this.status = 'CLOSED';
    this.closedDate = new Date();
    this.closedBy = userId;
    return this.save();
};

// Method to reopen debt
debtSchema.methods.reopenDebt = function() {
    this.status = 'OPEN';
    this.closedDate = null;
    this.closedBy = null;
    return this.save();
};

// Static method to get debt summary by office
debtSchema.statics.getDebtSummaryByOffice = async function(officeName = null) {
    const matchCondition = { status: 'OPEN' };
    if (officeName) {
        matchCondition.officeName = officeName;
    }

    return this.aggregate([
        { $match: matchCondition },
        {
            $group: {
                _id: {
                    officeName: '$officeName',
                    currency: '$currency'
                },
                totalOwedToOffice: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'OWED_TO_OFFICE'] }, '$amount', 0]
                    }
                },
                totalOwedFromOffice: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'OWED_FROM_OFFICE'] }, '$amount', 0]
                    }
                },
                netBalance: {
                    $sum: {
                        $cond: [
                            { $eq: ['$type', 'OWED_FROM_OFFICE'] },
                            '$amount',
                            { $multiply: ['$amount', -1] }
                        ]
                    }
                },
                debtCount: { $sum: 1 }
            }
        },
        {
            $project: {
                officeName: '$_id.officeName',
                currency: '$_id.currency',
                totalOwedToOffice: 1,
                totalOwedFromOffice: 1,
                netBalance: 1,
                debtCount: 1,
                _id: 0
            }
        },
        { $sort: { officeName: 1, currency: 1 } }
    ]);
};

module.exports = mongoose.model('Debt', debtSchema); 