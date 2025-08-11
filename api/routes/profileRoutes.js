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

// Get any user's profile (for admins and accountants)
router.get('/:userId', profileController.getUserProfile);

// Update any user's profile (admin only)
router.put('/:userId', profileController.updateUserProfile);

module.exports = router;
