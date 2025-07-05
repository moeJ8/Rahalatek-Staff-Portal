const express = require('express');
const router = express.Router();
const { getOfficePayments, createOfficePayment, deleteOfficePayment } = require('../controllers/officePaymentController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/:officeName', getOfficePayments);
router.post('/', createOfficePayment);
router.delete('/:paymentId', deleteOfficePayment);

module.exports = router; 