const express = require('express');
const router = express.Router();
const workingDaysController = require('../controllers/workingDaysController');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get working days for a specific month/year
router.get('/', workingDaysController.getWorkingDays);

// Get working days for entire year
router.get('/yearly', workingDaysController.getYearlyWorkingDays);

// Update working days configuration (Admin only)
router.put('/', workingDaysController.updateWorkingDays);

// Reset working days to default (Admin only)
router.post('/reset', workingDaysController.resetToDefault);

module.exports = router;