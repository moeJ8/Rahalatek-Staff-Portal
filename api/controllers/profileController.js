const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get current user's profile
exports.getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -resetPasswordToken -resetPasswordExpires -securityAnswer');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update current user's profile
exports.updateCurrentUserProfile = async (req, res) => {
    try {
        const { username, currentPassword, newPassword, securityQuestion, securityAnswer } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if username is being updated and if it's already taken
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.user.userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            user.username = username;
        }
        
        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change password' });
            }
            
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters long' });
            }
            
            user.password = newPassword;
        }
        
        // Handle security question update
        if (securityQuestion !== undefined) {
            user.securityQuestion = securityQuestion;
        }
        
        if (securityAnswer !== undefined && securityAnswer.trim() !== '') {
            user.securityAnswer = securityAnswer;
        }
        
        await user.save();
        
        // Return user without sensitive data
        const updatedUser = await User.findById(req.user.userId).select('-password -resetPasswordToken -resetPasswordExpires -securityAnswer');
        res.json({ 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get any user's profile (for admins and accountants)
exports.getUserProfile = async (req, res) => {
    try {
        // Check if user has permission to view other profiles
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ message: 'Access denied. Admin or accountant privileges required.' });
        }
        
        const { userId } = req.params;
        
        const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -securityAnswer');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update any user's profile (admin only)
exports.updateUserProfile = async (req, res) => {
    try {
        // Only admins can update other users' profiles
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const { userId } = req.params;
        const { username } = req.body;
        
        // Prevent admin from updating their own profile through this endpoint
        if (userId === req.user.userId) {
            return res.status(400).json({ message: 'Use the /me endpoint to update your own profile' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if username is being updated and if it's already taken
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            user.username = username;
        }
        
        await user.save();
        
        // Return user without sensitive data
        const updatedUser = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -securityAnswer');
        res.json({ 
            message: 'User profile updated successfully',
            user: updatedUser 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
