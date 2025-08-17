const express = require('express');
const router = express.Router();
const userLeaveController = require('../controllers/userLeaveController');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all user leaves (with optional filters)
router.get('/', userLeaveController.getAllUserLeaves);

// Check if user is on leave on a specific date
router.get('/check', userLeaveController.checkUserLeave);

// Get leave statistics for a user
router.get('/stats', userLeaveController.getUserLeaveStats);

// Create new user leave
router.post('/', userLeaveController.createUserLeave);

// Update leave status (approve/reject) - Admin only
router.put('/:id/status', userLeaveController.updateLeaveStatus);

// Update user leave
router.put('/:id', userLeaveController.updateUserLeave);

// Delete user leave
router.delete('/:id', userLeaveController.deleteUserLeave);

module.exports = router;
