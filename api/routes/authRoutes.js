const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/get-security-question', authController.getSecurityQuestion);
router.post('/verify-security-answer', authController.verifySecurityAnswer);
router.post('/reset-password', authController.resetPassword);

router.post('/admin-reset-password', verifyToken, authController.adminResetPassword);

// Email verification routes
router.post('/send-email-verification', verifyToken, authController.sendEmailVerification);
router.get('/verify-email', authController.verifyEmail);
router.get('/email-verification-status', verifyToken, authController.getEmailVerificationStatus);

router.get('/users', verifyToken, authController.getAllUsers);
router.patch('/users/role', verifyToken, authController.updateUserRole);
router.patch('/users/approve', verifyToken, authController.approveUser);
router.delete('/users/:userId', verifyToken, authController.deleteUser);

module.exports = router; 