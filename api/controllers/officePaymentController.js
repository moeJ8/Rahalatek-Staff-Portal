const OfficePayment = require('../models/OfficePayment');

// Get all payments for an office by currency
exports.getOfficePayments = async (req, res) => {
    try {
        const { officeName } = req.params;
        const { currency } = req.query;

        if (!officeName) {
            return res.status(400).json({ message: 'Office name is required' });
        }

        const query = { officeName: decodeURIComponent(officeName) };
        if (currency) {
            query.currency = currency;
        }

        const payments = await OfficePayment.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        console.error('Error fetching office payments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new office payment
exports.createOfficePayment = async (req, res) => {
    try {
        const { type, amount, currency, notes, officeName } = req.body;

        if (!type || !amount || !currency || !officeName) {
            return res.status(400).json({ 
                message: 'Type, amount, currency, and office name are required' 
            });
        }

        if (!['INCOMING', 'OUTGOING'].includes(type)) {
            return res.status(400).json({ 
                message: 'Type must be either INCOMING or OUTGOING' 
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ 
                message: 'Amount must be greater than 0' 
            });
        }

        const payment = new OfficePayment({
            type,
            amount,
            currency,
            notes: notes || '',
            officeName,
            createdBy: req.user.userId
        });

        const savedPayment = await payment.save();
        const populatedPayment = await OfficePayment.findById(savedPayment._id)
            .populate('createdBy', 'name');

        res.status(201).json(populatedPayment);
    } catch (error) {
        console.error('Error creating office payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete an office payment
exports.deleteOfficePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        const payment = await OfficePayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        await OfficePayment.findByIdAndDelete(paymentId);
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting office payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 