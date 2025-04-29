const express = require('express');
const voucherController = require('../controllers/voucherController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.get('/next-number', voucherController.getNextVoucherNumber);
router.post('/', voucherController.createVoucher);
router.get('/', voucherController.getAllVouchers);
router.get('/number/:number', voucherController.getVoucherByNumber);
router.get('/:id', voucherController.getVoucherById);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;