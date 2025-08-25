const WorkingDays = require('../models/WorkingDays');
const UserWorkingDays = require('../models/UserWorkingDays');
const User = require('../models/User');

// Get working days configuration for a specific month/year
exports.getWorkingDays = async (req, res) => {
    try {
        const { year, month } = req.query;
        
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required'
            });
        }
        
        const workingDays = await WorkingDays.getWorkingDaysForMonth(
            parseInt(year), 
            parseInt(month)
        );
        
        res.status(200).json({
            success: true,
            data: workingDays
        });
    } catch (error) {
        console.error('Error fetching working days:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch working days',
            error: error.message
        });
    }
};

// Update working days configuration for a specific month/year
exports.updateWorkingDays = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { year, month, workingDays, defaultWorkingDaysOfWeek } = req.body;
        
        if (!year || !month || !workingDays) {
            return res.status(400).json({
                success: false,
                message: 'Year, month, and working days are required'
            });
        }
        
        const existingConfig = await WorkingDays.findOne({ year, month });
        
        if (existingConfig) {
            // Update existing configuration
            existingConfig.workingDays = workingDays;
            if (defaultWorkingDaysOfWeek) {
                existingConfig.defaultWorkingDaysOfWeek = defaultWorkingDaysOfWeek;
            }
            existingConfig.updatedBy = req.user.userId;
            
            await existingConfig.save();
            
            res.status(200).json({
                success: true,
                message: 'Working days updated successfully',
                data: existingConfig
            });
        } else {
            // Create new configuration
            const newConfig = new WorkingDays({
                year,
                month,
                workingDays,
                defaultWorkingDaysOfWeek: defaultWorkingDaysOfWeek || [1, 2, 3, 4, 6],
                createdBy: req.user.userId
            });
            
            await newConfig.save();
            
            res.status(201).json({
                success: true,
                message: 'Working days configuration created successfully',
                data: newConfig
            });
        }
    } catch (error) {
        console.error('Error updating working days:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update working days',
            error: error.message
        });
    }
};

// Get working days for multiple months (for yearly view)
exports.getYearlyWorkingDays = async (req, res) => {
    try {
        const { year } = req.query;
        
        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'Year is required'
            });
        }
        
        const yearlyData = {};
        
        // Get working days for all 12 months
        for (let month = 1; month <= 12; month++) {
            const workingDays = await WorkingDays.getWorkingDaysForMonth(
                parseInt(year), 
                month
            );
            yearlyData[month] = workingDays;
        }
        
        res.status(200).json({
            success: true,
            data: {
                year: parseInt(year),
                months: yearlyData
            }
        });
    } catch (error) {
        console.error('Error fetching yearly working days:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch yearly working days',
            error: error.message
        });
    }
};

// Reset working days to default for a specific month
exports.resetToDefault = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { year, month } = req.body;
        
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required'
            });
        }
        
        // Delete existing configuration to fall back to defaults
        await WorkingDays.findOneAndDelete({ year, month });
        
        // Get the default configuration
        const defaultConfig = await WorkingDays.getWorkingDaysForMonth(year, month);
        
        res.status(200).json({
            success: true,
            message: 'Working days reset to default successfully',
            data: defaultConfig
        });
    } catch (error) {
        console.error('Error resetting working days:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset working days',
            error: error.message
        });
    }
};

// Get working days for a specific user
exports.getUserWorkingDays = async (req, res) => {
    try {
        const { year, month, userId } = req.query;
        
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required'
            });
        }

        // If userId provided, get user-specific config; otherwise get current user's config
        const targetUserId = userId || req.user.userId;
        
        // Check if admin is requesting another user's config
        if (userId && userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Cannot view other users working days.'
            });
        }
        
        const workingDays = await UserWorkingDays.getWorkingDaysForUser(
            targetUserId,
            parseInt(year), 
            parseInt(month)
        );
        
        res.status(200).json({
            success: true,
            data: workingDays
        });
    } catch (error) {
        console.error('Error fetching user working days:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user working days',
            error: error.message
        });
    }
};

// Update working days for a specific user
exports.updateUserWorkingDays = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { userId, year, month, workingDays, defaultWorkingDaysOfWeek, dailyHours } = req.body;
        
        if (!userId || !year || !month || !workingDays) {
            return res.status(400).json({
                success: false,
                message: 'User ID, year, month, and working days are required'
            });
        }
        
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const existingConfig = await UserWorkingDays.findOne({ userId, year, month });
        
        if (existingConfig) {
            // Update existing configuration
            existingConfig.workingDays = workingDays;
            if (defaultWorkingDaysOfWeek) {
                existingConfig.defaultWorkingDaysOfWeek = defaultWorkingDaysOfWeek;
            }
            if (dailyHours !== undefined) {
                existingConfig.dailyHours = dailyHours;
            }
            existingConfig.isCustom = true;
            existingConfig.updatedBy = req.user.userId;
            
            await existingConfig.save();
            
            res.status(200).json({
                success: true,
                message: `Working days updated successfully for ${user.username}`,
                data: existingConfig
            });
        } else {
            // Create new configuration
            const newConfig = new UserWorkingDays({
                userId,
                year,
                month,
                workingDays,
                defaultWorkingDaysOfWeek: defaultWorkingDaysOfWeek || [0, 1, 2, 3, 4, 6],
                dailyHours: dailyHours || 8,
                isCustom: true,
                createdBy: req.user.userId
            });
            
            await newConfig.save();
            
            res.status(201).json({
                success: true,
                message: `Working days configuration created successfully for ${user.username}`,
                data: newConfig
            });
        }
    } catch (error) {
        console.error('Error updating user working days:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user working days',
            error: error.message
        });
    }
};

// Apply global configuration to selected users
exports.applyGlobalToUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { userIds, year, month } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || !year || !month) {
            return res.status(400).json({
                success: false,
                message: 'User IDs array, year, and month are required'
            });
        }
        
        if (userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one user ID is required'
            });
        }
        
        // Get global configuration
        const globalConfig = await WorkingDays.getWorkingDaysForMonth(year, month);
        
        // Apply to selected users
        const result = await UserWorkingDays.applyGlobalToUsers(
            userIds, 
            year, 
            month, 
            globalConfig,
            req.user.userId
        );
        
        // Get user names for response
        const users = await User.find({ _id: { $in: userIds } }, 'username');
        const userNames = users.map(u => u.username).join(', ');
        
        res.status(200).json({
            success: true,
            message: `Global configuration applied to ${userIds.length} user${userIds.length > 1 ? 's' : ''}: ${userNames}`,
            data: {
                affectedUsers: userIds.length,
                modifiedCount: result.modifiedCount || 0,
                upsertedCount: result.upsertedCount || 0
            }
        });
    } catch (error) {
        console.error('Error applying global configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply global configuration',
            error: error.message
        });
    }
};

// Apply global configuration to ALL users
exports.applyGlobalToAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { year, month } = req.body;
        
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required'
            });
        }
        
        // Get all users
        const allUsers = await User.find({}, '_id');
        const userIds = allUsers.map(user => user._id);
        
        // Get global configuration
        const globalConfig = await WorkingDays.getWorkingDaysForMonth(year, month);
        
        // Apply to all users
        const result = await UserWorkingDays.applyGlobalToUsers(
            userIds, 
            year, 
            month, 
            globalConfig,
            req.user.userId
        );
        
        res.status(200).json({
            success: true,
            message: `Global configuration applied to all ${userIds.length} users`,
            data: {
                affectedUsers: userIds.length,
                modifiedCount: result.modifiedCount || 0,
                upsertedCount: result.upsertedCount || 0
            }
        });
    } catch (error) {
        console.error('Error applying global configuration to all users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply global configuration to all users',
            error: error.message
        });
    }
};

// Get users with custom working days configurations
exports.getUsersWithCustomConfigs = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { year, month } = req.query;
        
        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required'
            });
        }
        
        const customConfigs = await UserWorkingDays.getUsersWithCustomConfigs(
            parseInt(year),
            parseInt(month)
        );
        
        res.status(200).json({
            success: true,
            data: customConfigs,
            count: customConfigs.length
        });
    } catch (error) {
        console.error('Error fetching custom configurations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom configurations',
            error: error.message
        });
    }
};

// Revert users back to global configuration (remove custom configs)
exports.revertToGlobal = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const { userIds, year, month } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || !year || !month) {
            return res.status(400).json({
                success: false,
                message: 'User IDs array, year, and month are required'
            });
        }
        
        // Remove custom configurations
        const result = await UserWorkingDays.revertToGlobal(userIds, year, month);
        
        // Get user names for response
        const users = await User.find({ _id: { $in: userIds } }, 'username');
        const userNames = users.map(u => u.username).join(', ');
        
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} user${result.deletedCount !== 1 ? 's' : ''} reverted to global configuration: ${userNames}`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        console.error('Error reverting to global configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revert to global configuration',
            error: error.message
        });
    }
};