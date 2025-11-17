const express = require('express');
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All profile routes require authentication
router.use(verifyToken);

// Get current user's profile
router.get('/me', profileController.getCurrentUserProfile);

// Update current user's profile
router.put('/me', profileController.updateCurrentUserProfile);

// Salary endpoints
router.get('/me/salary', profileController.getCurrentUserSalary);
router.get('/me/bonuses', profileController.getCurrentUserBonuses);
router.get('/:userId/salary', profileController.getUserSalary);
router.put('/:userId/salary', profileController.updateUserSalary);
router.post('/:userId/salary/base', profileController.addMonthlyBaseSalary);
router.get('/:userId/salary/base', profileController.getUserSalaryBaseEntries);
router.put('/:userId/salary/edit', profileController.editPreviousMonthSalary);
router.delete('/:userId/salary/base', profileController.deleteScheduledSalaryEntry);
router.get('/:userId/salary/receipt', profileController.downloadSalaryReceipt);

// Monthly bonuses
router.get('/:userId/bonuses', profileController.getUserBonuses);
router.post('/:userId/bonuses', profileController.addMonthlyBonus);
router.put('/:userId/bonus/edit', profileController.editPreviousMonthBonus);
router.delete('/:userId/bonus', profileController.deleteBonusEntry);

// Get any user's profile (for admins and accountants)
router.get('/:userId', profileController.getUserProfile);

// Update any user's profile (admin only)
router.put('/:userId', profileController.updateUserProfile);

module.exports = router;
