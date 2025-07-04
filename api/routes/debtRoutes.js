const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const { verifyToken } = require('../middleware/auth');

// All debt routes require authentication and admin/accountant privileges
const requireAdminOrAccountant = (req, res, next) => {
    if (!req.user.isAdmin && !req.user.isAccountant) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin or Accountant privileges required.'
        });
    }
    next();
};

// Create new debt
router.post('/', verifyToken, requireAdminOrAccountant, debtController.createDebt);

// Get all debts with optional filtering
router.get('/', verifyToken, requireAdminOrAccountant, debtController.getAllDebts);

// Get debt summary
router.get('/summary', verifyToken, requireAdminOrAccountant, debtController.getDebtSummary);

// Get debt by ID
router.get('/:id', verifyToken, requireAdminOrAccountant, debtController.getDebtById);

// Update debt
router.put('/:id', verifyToken, requireAdminOrAccountant, debtController.updateDebt);

// Close debt
router.patch('/:id/close', verifyToken, requireAdminOrAccountant, debtController.closeDebt);

// Reopen debt (admin only)
router.patch('/:id/reopen', verifyToken, requireAdminOrAccountant, debtController.reopenDebt);

// Delete debt (admin only)
router.delete('/:id', verifyToken, requireAdminOrAccountant, debtController.deleteDebt);

module.exports = router; 