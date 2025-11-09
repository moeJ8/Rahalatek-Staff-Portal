const express = require("express");
const voucherController = require("../controllers/voucherController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);
router.get("/next-number", voucherController.getNextVoucherNumber);
router.post("/", voucherController.createVoucher);
router.get("/recent", voucherController.getRecentVouchers);
router.get("/upcoming-events", voucherController.getUpcomingEvents);
router.get("/financials", voucherController.getVouchersForFinancials);
router.get("/metadata", voucherController.getVouchersMetadata);
router.get("/list", voucherController.getVouchersList);
router.get("/active", voucherController.getActiveVouchers);
router.get("/", voucherController.getAllVouchers);
router.get("/trash", voucherController.getTrashedVouchers);
router.get("/number/:number", voucherController.getVoucherByNumber);
router.get("/:id", voucherController.getVoucherById);
router.put("/:id", voucherController.updateVoucher);
router.put("/:id/status", voucherController.updateVoucherStatus);
router.patch("/:id/payment-date", voucherController.updateVoucherPaymentDate);
router.put("/:id/created-by", voucherController.updateVoucherCreatedBy);
router.delete("/:id", voucherController.deleteVoucher);
router.post("/:id/restore", voucherController.restoreVoucher);
router.delete("/:id/permanent", voucherController.permanentlyDeleteVoucher);

module.exports = router;
