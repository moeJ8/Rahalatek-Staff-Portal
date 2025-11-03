const express = require('express');
const router = express.Router();
const { 
    getOfficePayments, 
    createOfficePayment, 
    deleteOfficePayment, 
    approveOfficePayment, 
    updatePaymentDate,
    downloadOfficeDetailPDF,
    getOfficeVouchers
} = require('../controllers/officePaymentController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/:officeName/vouchers', getOfficeVouchers);
router.get('/:officeName/download-pdf', downloadOfficeDetailPDF);
router.get('/:officeName', getOfficePayments);
router.post('/', createOfficePayment);
router.delete('/:paymentId', deleteOfficePayment);
router.patch('/:paymentId/approve', approveOfficePayment);
router.patch('/:paymentId/payment-date', updatePaymentDate);

module.exports = router; 