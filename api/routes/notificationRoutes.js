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
router.post('/generate-daily-summary', notificationController.generateDailyArrivalsSummary);
router.delete('/:id', notificationController.deleteNotification);
router.post('/cleanup-expired', notificationController.cleanupExpired);

module.exports = router; 