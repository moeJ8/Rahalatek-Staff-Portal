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

// === USER-SPECIFIC WORKING DAYS ROUTES ===

// Get working days for a specific user
router.get('/user', workingDaysController.getUserWorkingDays);

// Get users with custom working days configurations (Admin only)
router.get('/custom-configs', workingDaysController.getUsersWithCustomConfigs);

// Update working days for a specific user (Admin only)
router.put('/user', workingDaysController.updateUserWorkingDays);

// Apply global configuration to selected users (Admin only)
router.post('/apply-global', workingDaysController.applyGlobalToUsers);

// Apply global configuration to ALL users (Admin only)
router.post('/apply-global-all', workingDaysController.applyGlobalToAllUsers);

// Revert users back to global configuration (Admin only)
router.post('/revert-to-global', workingDaysController.revertToGlobal);

module.exports = router;