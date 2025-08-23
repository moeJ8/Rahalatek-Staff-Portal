const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(verifyToken);

// Get user analytics data
router.get('/user/:userId', analyticsController.getUserAnalytics);

// Get dashboard statistics
router.get('/dashboard-stats', analyticsController.getDashboardStats);

module.exports = router;
