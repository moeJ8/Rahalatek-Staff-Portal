const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all holidays (with optional filters)
router.get('/', holidayController.getAllHolidays);

// Check if a specific date is a holiday
router.get('/check', holidayController.checkHoliday);

// Create new holiday (Admin only)
router.post('/', holidayController.createHoliday);

// Generate recurring holidays for next year (Admin only)
router.post('/generate-recurring', holidayController.generateRecurringHolidays);

// Update holiday (Admin only)
router.put('/:id', holidayController.updateHoliday);

// Delete holiday (Admin only)
router.delete('/:id', holidayController.deleteHoliday);

module.exports = router;
