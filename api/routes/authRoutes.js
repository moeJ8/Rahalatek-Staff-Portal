const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Protected routes - only accessible by admins
router.get('/users', verifyToken, authController.getAllUsers);
router.patch('/users/role', verifyToken, authController.updateUserRole);
router.delete('/users/:userId', verifyToken, authController.deleteUser);

module.exports = router; 