const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// QR Code routes (Admin only)
router.get('/qr', attendanceController.getCurrentQRCode);

// User attendance routes
router.get('/status', attendanceController.getAttendanceStatus);
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);

// Admin/Accountant reports
router.get('/reports', attendanceController.getAttendanceReports);
router.get('/users', attendanceController.getAttendanceUsers);
router.get('/yearly-calendar', attendanceController.getYearlyAttendance);
router.get('/available-years', attendanceController.getAvailableYears);

// User personal calendar
router.get('/my-calendar', attendanceController.getUserYearlyAttendance);

// Admin manual check-in/out
router.post('/admin/check', attendanceController.adminCheckInOut);

// Admin attendance management
router.post('/admin/manual-entry', attendanceController.createManualAttendance);
router.put('/admin/edit/:id', attendanceController.editAttendance);
router.delete('/admin/delete/:id', attendanceController.deleteAttendance);

module.exports = router;
