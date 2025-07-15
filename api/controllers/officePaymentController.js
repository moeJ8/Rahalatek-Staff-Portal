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
            .populate('relatedVoucher', 'voucherNumber clientName')
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
        const { type, amount, currency, notes, officeName, voucherId, paymentDate } = req.body;

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

        const paymentData = {
            type,
            amount,
            currency,
            notes: notes || '',
            officeName,
            createdBy: req.user.userId
        };

        // Add voucher relation if provided
        if (voucherId) {
            paymentData.relatedVoucher = voucherId;
        }

        // Add payment date if provided
        if (paymentDate) {
            paymentData.paymentDate = new Date(paymentDate);
        }

        const payment = new OfficePayment(paymentData);

        const savedPayment = await payment.save();
        const populatedPayment = await OfficePayment.findById(savedPayment._id)
            .populate('createdBy', 'name')
            .populate('relatedVoucher', 'voucherNumber clientName');

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

// Approve an office payment (Admin/Accountant only)
exports.approveOfficePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        // Check if user is admin or accountant
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ 
                message: 'Only administrators and accountants can approve payments' 
            });
        }

        const payment = await OfficePayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ 
                message: 'Only pending payments can be approved' 
            });
        }

        const updateData = {
            status: 'approved',
            approvedBy: req.user.userId,
            approvedAt: new Date()
        };

        // If payment date is provided, update it
        if (req.body.paymentDate) {
            updateData.paymentDate = new Date(req.body.paymentDate);
        }

        const updatedPayment = await OfficePayment.findByIdAndUpdate(
            paymentId,
            updateData,
            { new: true }
        )
        .populate('createdBy', 'name')
        .populate('relatedVoucher', 'voucherNumber clientName')
        .populate('approvedBy', 'name');

        // If the payment is linked to a voucher and has a payment date, update the voucher's payment date
        if (updatedPayment.relatedVoucher && updateData.paymentDate) {
            const Voucher = require('../models/Voucher');
            await Voucher.findByIdAndUpdate(
                updatedPayment.relatedVoucher._id,
                { paymentDate: updateData.paymentDate }
            );
        }

        res.json(updatedPayment);
    } catch (error) {
        console.error('Error approving office payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 

// Update payment date for an office payment (Admin/Accountant only)
exports.updatePaymentDate = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { paymentDate } = req.body;

        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        if (!paymentDate) {
            return res.status(400).json({ message: 'Payment date is required' });
        }

        // Check if user is admin or accountant
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ 
                message: 'Only administrators and accountants can update payment dates' 
            });
        }

        const payment = await OfficePayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const updatedPayment = await OfficePayment.findByIdAndUpdate(
            paymentId,
            { paymentDate: new Date(paymentDate) },
            { new: true }
        )
        .populate('createdBy', 'name')
        .populate('relatedVoucher', 'voucherNumber clientName')
        .populate('approvedBy', 'name');

        // If the payment is linked to a voucher, also update the voucher's payment date
        if (updatedPayment.relatedVoucher) {
            const Voucher = require('../models/Voucher');
            await Voucher.findByIdAndUpdate(
                updatedPayment.relatedVoucher._id,
                { paymentDate: new Date(paymentDate) }
            );
        }

        res.json(updatedPayment);
    } catch (error) {
        console.error('Error updating payment date:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 