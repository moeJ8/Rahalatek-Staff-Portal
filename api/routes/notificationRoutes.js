const express = require('express');
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.post('/generate-arrival-reminders', notificationController.generateArrivalReminders);
router.post('/generate-departure-reminders', notificationController.generateDepartureReminders);
router.post('/generate-daily-summary', notificationController.generateDailyArrivalsSummary);
router.post('/generate-monthly-financial-summary', notificationController.generateMonthlyFinancialSummary);
router.get('/download-financial-summary-pdf', notificationController.downloadFinancialSummaryPDF);
router.delete('/:id', notificationController.deleteNotification);
router.post('/cleanup-expired', notificationController.cleanupExpired);


// Custom reminder management (all authenticated users)
router.post('/reminders', notificationController.createReminder);
router.get('/reminders', notificationController.getAllReminders);
router.put('/reminders/:id', notificationController.updateReminder);
router.delete('/reminders/:id', notificationController.deleteReminder);

// Get all users for target selection (admin and accountant only)
router.get('/users', notificationController.getAllUsers);


module.exports = router; 