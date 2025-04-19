const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Helper to check and fix database schema
exports.checkAndFixSchema = async () => {
    try {
        // Check if the users collection exists and has documents
        const collections = await mongoose.connection.db.listCollections().toArray();
        const usersCollection = collections.find(c => c.name === 'users');
        
        if (usersCollection) {
            // Drop the old index if it exists
            try {
                await mongoose.connection.db.collection('users').dropIndex('email_1');
                console.log('Dropped old email index');
            } catch (err) {
                // Index might not exist, which is fine
                console.log('No old index to drop or other issue:', err.message);
            }
        }
    } catch (err) {
        console.error('Error fixing schema:', err);
    }
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, password, isAdmin, securityQuestion, securityAnswer } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Create new user
        const user = new User({
            username,
            password,
            isAdmin: isAdmin || false,
            securityQuestion,
            securityAnswer
        });
        
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all users - Only admins can access this
exports.getAllUsers = async (req, res) => {
    try {
        // Verify that the requester is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        // Get all users except the requesting admin
        const users = await User.find({ _id: { $ne: req.user.userId } }).select('-password');
        
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user admin status - Only admins can access this
exports.updateUserRole = async (req, res) => {
    try {
        // Verify that the requester is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const { userId, isAdmin } = req.body;
        
        // Make sure you can't modify your own admin status
        if (userId === req.user.userId) {
            return res.status(400).json({ message: 'You cannot modify your own admin status.' });
        }
        
        // Find and update the user
        const user = await User.findByIdAndUpdate(
            userId, 
            { isAdmin }, 
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a user - Only admins can access this
exports.deleteUser = async (req, res) => {
    try {
        // Verify that the requester is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const { userId } = req.params;

        // Make sure you can't delete yourself
        if (userId === req.user.userId) {
            return res.status(400).json({ message: 'You cannot delete your own account.' });
        }

        // Find and delete the user
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Check if user exists and get security question
exports.getSecurityQuestion = async (req, res) => {
    try {
        const { username } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if user has a security question set
        if (!user.securityQuestion) {
            return res.status(400).json({ 
                message: 'No security question is set for this account. Please contact an administrator.' 
            });
        }
        
        // Return the security question
        res.status(200).json({ 
            username: user.username,
            securityQuestion: user.securityQuestion 
        });
    } catch (err) {
        console.error('Error fetching security question:', err);
        res.status(500).json({ message: 'Error retrieving security question' });
    }
};

// Verify security answer and create reset token
exports.verifySecurityAnswer = async (req, res) => {
    try {
        const { username, securityAnswer } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify security answer
        const isMatch = await user.compareSecurityAnswer(securityAnswer);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect security answer' });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Set token expiration (15 minutes)
        const resetExpires = Date.now() + 15 * 60 * 1000;
        
        // Save to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();
        
        res.status(200).json({
            message: 'Security answer verified',
            resetToken: resetToken,
            expiresIn: '15 minutes'
        });
    } catch (err) {
        console.error('Error verifying security answer:', err);
        res.status(500).json({ message: 'Error processing security verification' });
    }
};

// Reset password with valid token
exports.resetPassword = async (req, res) => {
    try {
        const { username, resetToken, newPassword } = req.body;
        
        // Find user with matching username and valid token
        const user = await User.findOne({
            username,
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ 
                message: 'Password reset token is invalid or has expired' 
            });
        }
        
        // Set new password
        user.password = newPassword;
        
        // Clear reset token fields
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        
        await user.save();
        
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Password reset error:', err);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

// Admin reset password (only available to admins)
exports.adminResetPassword = async (req, res) => {
    try {
        // Verify admin status
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin privileges required' });
        }
        
        const { username, newPassword } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ message: 'Password reset successfully by admin' });
    } catch (err) {
        console.error('Admin password reset error:', err);
        res.status(500).json({ message: 'Failed to reset password' });
    }
}; 