const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Password reset flow
router.post('/get-security-question', authController.getSecurityQuestion);
router.post('/verify-security-answer', authController.verifySecurityAnswer);
router.post('/reset-password', authController.resetPassword);

// Admin password reset (protected route)
router.post('/admin-reset-password', verifyToken, authController.adminResetPassword);

// Protected routes - only accessible by admins
router.get('/users', verifyToken, authController.getAllUsers);
router.patch('/users/role', verifyToken, authController.updateUserRole);
router.delete('/users/:userId', verifyToken, authController.deleteUser);

module.exports = router; 