const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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
        const { username, password, isAdmin } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Create new user
        const user = new User({
            username,
            password,
            isAdmin: isAdmin || false
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