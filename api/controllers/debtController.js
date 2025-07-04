const Debt = require('../models/Debt');

// Create a new debt
exports.createDebt = async (req, res) => {
    try {
        const {
            officeName,
            amount,
            currency,
            type,
            description,
            dueDate,
            relatedVoucher,
            notes
        } = req.body;

        const debt = new Debt({
            officeName,
            amount: parseFloat(amount),
            currency: currency || 'USD',
            type,
            description: description || '',
            dueDate: dueDate ? new Date(dueDate) : null,
            relatedVoucher: relatedVoucher || null,
            notes: notes || '',
            createdBy: req.user.userId
        });

        await debt.save();
        
        const populatedDebt = await Debt.findById(debt._id)
            .populate('createdBy', 'username')
            .populate('closedBy', 'username')
            .populate('relatedVoucher', 'voucherNumber');

        res.status(201).json({
            success: true,
            data: populatedDebt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create debt',
            error: error.message
        });
    }
};

// Get all debts with optional filtering
exports.getAllDebts = async (req, res) => {
    try {
        const { office, status, type, currency } = req.query;
        
        const filter = {};
        if (office) filter.officeName = office;
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (currency) filter.currency = currency;

        const debts = await Debt.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username')
            .populate('closedBy', 'username')
            .populate('relatedVoucher', 'voucherNumber');

        res.status(200).json({
            success: true,
            count: debts.length,
            data: debts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get debts',
            error: error.message
        });
    }
};

// Get debt by ID
exports.getDebtById = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('closedBy', 'username')
            .populate('relatedVoucher', 'voucherNumber');

        if (!debt) {
            return res.status(404).json({
                success: false,
                message: 'Debt not found'
            });
        }

        res.status(200).json({
            success: true,
            data: debt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get debt',
            error: error.message
        });
    }
};

// Update debt
exports.updateDebt = async (req, res) => {
    try {
        const {
            officeName,
            amount,
            currency,
            type,
            description,
            dueDate,
            notes
        } = req.body;

        const debt = await Debt.findById(req.params.id);
        
        if (!debt) {
            return res.status(404).json({
                success: false,
                message: 'Debt not found'
            });
        }

        // Only allow updating if debt is still open
        if (debt.status === 'CLOSED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update closed debt'
            });
        }

        // Update fields
        if (officeName !== undefined) debt.officeName = officeName;
        if (amount !== undefined) debt.amount = parseFloat(amount);
        if (currency !== undefined) debt.currency = currency;
        if (type !== undefined) debt.type = type;
        if (description !== undefined) debt.description = description;
        if (dueDate !== undefined) debt.dueDate = dueDate ? new Date(dueDate) : null;
        if (notes !== undefined) debt.notes = notes;

        await debt.save();

        const updatedDebt = await Debt.findById(debt._id)
            .populate('createdBy', 'username')
            .populate('closedBy', 'username')
            .populate('relatedVoucher', 'voucherNumber');

        res.status(200).json({
            success: true,
            data: updatedDebt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update debt',
            error: error.message
        });
    }
};

// Close debt
exports.closeDebt = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);
        
        if (!debt) {
            return res.status(404).json({
                success: false,
                message: 'Debt not found'
            });
        }

        if (debt.status === 'CLOSED') {
            return res.status(400).json({
                success: false,
                message: 'Debt is already closed'
            });
        }

        await debt.closeDebt(req.user.userId);

        const closedDebt = await Debt.findById(debt._id)
            .populate('createdBy', 'username')
            .populate('closedBy', 'username')
            .populate('relatedVoucher', 'voucherNumber');

        res.status(200).json({
            success: true,
            message: 'Debt closed successfully',
            data: closedDebt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to close debt',
            error: error.message
        });
    }
};

// Reopen debt
exports.reopenDebt = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);
        
        if (!debt) {
            return res.status(404).json({
                success: false,
                message: 'Debt not found'
            });
        }

        if (debt.status === 'OPEN') {
            return res.status(400).json({
                success: false,
                message: 'Debt is already open'
            });
        }

        // Only admins can reopen debts
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can reopen debts'
            });
        }

        await debt.reopenDebt();

        const reopenedDebt = await Debt.findById(debt._id)
            .populate('createdBy', 'username')
            .populate('closedBy', 'username')
            .populate('relatedVoucher', 'voucherNumber');

        res.status(200).json({
            success: true,
            message: 'Debt reopened successfully',
            data: reopenedDebt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reopen debt',
            error: error.message
        });
    }
};

// Delete debt
exports.deleteDebt = async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);
        
        if (!debt) {
            return res.status(404).json({
                success: false,
                message: 'Debt not found'
            });
        }

        // Only admins can delete debts
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can delete debts'
            });
        }

        await Debt.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Debt deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete debt',
            error: error.message
        });
    }
};

// Get debt summary by office
exports.getDebtSummary = async (req, res) => {
    try {
        const { office } = req.query;
        
        const summary = await Debt.getDebtSummaryByOffice(office);

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get debt summary',
            error: error.message
        });
    }
}; 