const UserLeave = require('../models/UserLeave');
const User = require('../models/User');

// Get all user leaves
exports.getAllUserLeaves = async (req, res) => {
    try {
        const { userId, startDate, endDate, status, leaveType, leaveCategory, year, month } = req.query;
        let query = {};

        // Build query based on filters
        if (userId) {
            query.userId = userId;
        }

        if (status) {
            query.status = status;
        }

        if (leaveType) {
            query.leaveType = leaveType;
        }

        if (leaveCategory) {
            query.leaveCategory = leaveCategory;
        }

        // Date filtering
        if (year && month) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0);
            query.$or = [
                // Multiple-day leaves
                {
                    leaveCategory: 'multiple-day',
                    startDate: { $lte: end },
                    endDate: { $gte: start }
                },
                // Single-day and hourly leaves
                {
                    leaveCategory: { $in: ['single-day', 'hourly'] },
                    date: { $gte: start, $lte: end }
                }
            ];
        } else if (startDate && endDate) {
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            query.$or = [
                // Multiple-day leaves
                {
                    leaveCategory: 'multiple-day',
                    startDate: { $lte: rangeEnd },
                    endDate: { $gte: rangeStart }
                },
                // Single-day and hourly leaves
                {
                    leaveCategory: { $in: ['single-day', 'hourly'] },
                    date: { $gte: rangeStart, $lte: rangeEnd }
                }
            ];
        }

        const leaves = await UserLeave.find(query)
            .populate('userId', 'username email')
            .populate('createdBy', 'username')
            .populate('approvedBy', 'username')
            .sort({ startDate: -1, date: -1 });

        res.status(200).json({
            success: true,
            data: leaves
        });
    } catch (error) {
        console.error('Error fetching user leaves:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user leaves',
            error: error.message
        });
    }
};

// Create new user leave
exports.createUserLeave = async (req, res) => {
    try {
        // Check if user is admin or creating leave for themselves
        const { 
            userId, 
            leaveType, 
            customLeaveType, 
            leaveCategory,
            date,           // For single-day and hourly leaves
            startDate,      // For multiple-day leaves
            endDate,        // For multiple-day leaves
            startTime,      // For hourly leaves
            endTime,        // For hourly leaves
            reason, 
            color 
        } = req.body;

        if (!req.user.isAdmin && req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only create leaves for yourself or admin privileges required.'
            });
        }

        // Validate required fields based on leave category
        if (!userId || !leaveType || !leaveCategory) {
            return res.status(400).json({
                success: false,
                message: 'User ID, leave type, and leave category are required'
            });
        }

        // Category-specific validation
        if (leaveCategory === 'hourly') {
            if (!date || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Date, start time, and end time are required for hourly leaves'
                });
            }
        } else if (leaveCategory === 'single-day') {
            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: 'Date is required for single day leaves'
                });
            }
        } else if (leaveCategory === 'multiple-day') {
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required for multiple day leaves'
                });
            }
        }

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for overlapping leaves based on category
        let overlapQuery = {
            userId,
            status: { $in: ['pending', 'approved'] }
        };

        if (leaveCategory === 'multiple-day') {
            overlapQuery.$or = [
                // Check against other multiple-day leaves
                {
                    leaveCategory: 'multiple-day',
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                },
                // Check against single-day and hourly leaves within the range
                {
                    leaveCategory: { $in: ['single-day', 'hourly'] },
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            ];
        } else {
            // For single-day and hourly leaves
            overlapQuery.$or = [
                // Check against multiple-day leaves
                {
                    leaveCategory: 'multiple-day',
                    startDate: { $lte: new Date(date) },
                    endDate: { $gte: new Date(date) }
                },
                // Check against other single-day and hourly leaves on the same date
                {
                    leaveCategory: { $in: ['single-day', 'hourly'] },
                    date: {
                        $gte: new Date(date).setHours(0, 0, 0, 0),
                        $lt: new Date(date).setHours(23, 59, 59, 999)
                    }
                }
            ];
        }

        const overlappingLeave = await UserLeave.findOne(overlapQuery);

        if (overlappingLeave) {
            return res.status(400).json({
                success: false,
                message: 'User already has leave scheduled for this period'
            });
        }

        // Create leave object based on category
        const leaveData = {
            userId,
            leaveType,
            customLeaveType: leaveType === 'custom' ? customLeaveType : undefined,
            leaveCategory,
            reason,
            color: color || '#fbbf24',
            status: req.user.isAdmin ? 'approved' : 'pending',
            createdBy: req.user.userId,
            approvedBy: req.user.isAdmin ? req.user.userId : undefined,
            approvedAt: req.user.isAdmin ? new Date() : undefined
        };

        // Add category-specific fields
        if (leaveCategory === 'hourly') {
            leaveData.date = new Date(date);
            leaveData.startTime = startTime;
            leaveData.endTime = endTime;
        } else if (leaveCategory === 'single-day') {
            leaveData.date = new Date(date);
        } else if (leaveCategory === 'multiple-day') {
            leaveData.startDate = new Date(startDate);
            leaveData.endDate = new Date(endDate);
        }

        // Check annual leave limit if this is an annual leave
        if (leaveType === 'annual') {
            const currentYear = leaveData.date ? new Date(leaveData.date).getFullYear() : 
                               leaveData.startDate ? new Date(leaveData.startDate).getFullYear() : 
                               new Date().getFullYear();
            
            // Create temporary leave to calculate days
            const tempLeave = new UserLeave(leaveData);
            const currentStats = await UserLeave.getAnnualLeaveStats(userId, currentYear);
            const newLeaveDays = tempLeave.daysCount || 1;
            
            if (currentStats.daysUsed + newLeaveDays > 14) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot create leave. This would exceed the annual leave limit of 14 days. You have ${currentStats.remainingDays} days remaining.`,
                    data: {
                        maxAnnualDays: 14,
                        daysUsed: currentStats.daysUsed,
                        remainingDays: currentStats.remainingDays,
                        requestedDays: newLeaveDays
                    }
                });
            }
        }

        const userLeave = new UserLeave(leaveData);
        await userLeave.save();

        // Populate the response
        await userLeave.populate('userId', 'username email');
        await userLeave.populate('createdBy', 'username');
        if (userLeave.approvedBy) {
            await userLeave.populate('approvedBy', 'username');
        }

        res.status(201).json({
            success: true,
            message: 'User leave created successfully',
            data: userLeave
        });
    } catch (error) {
        console.error('Error creating user leave:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user leave',
            error: error.message
        });
    }
};

// Update user leave
exports.updateUserLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const userLeave = await UserLeave.findById(id);
        if (!userLeave) {
            return res.status(404).json({
                success: false,
                message: 'User leave not found'
            });
        }

        // Check permissions
        if (!req.user.isAdmin && req.user.userId !== userLeave.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own leaves or admin privileges required.'
            });
        }

        // Get the new category or use existing
        const newCategory = updateData.leaveCategory || userLeave.leaveCategory;

        // Check for overlaps based on category
        let shouldCheckOverlap = false;
        let overlapQuery = {
            _id: { $ne: id },
            userId: userLeave.userId,
            status: { $in: ['pending', 'approved'] }
        };

        if (newCategory === 'multiple-day') {
            const newStartDate = updateData.startDate ? new Date(updateData.startDate) : userLeave.startDate;
            const newEndDate = updateData.endDate ? new Date(updateData.endDate) : userLeave.endDate;
            
            if (updateData.startDate || updateData.endDate) {
                shouldCheckOverlap = true;
                overlapQuery.$or = [
                    {
                        leaveCategory: 'multiple-day',
                        startDate: { $lte: newEndDate },
                        endDate: { $gte: newStartDate }
                    },
                    {
                        leaveCategory: { $in: ['single-day', 'hourly'] },
                        date: { $gte: newStartDate, $lte: newEndDate }
                    }
                ];
            }
        } else {
            const newDate = updateData.date ? new Date(updateData.date) : userLeave.date;
            
            if (updateData.date) {
                shouldCheckOverlap = true;
                overlapQuery.$or = [
                    {
                        leaveCategory: 'multiple-day',
                        startDate: { $lte: newDate },
                        endDate: { $gte: newDate }
                    },
                    {
                        leaveCategory: { $in: ['single-day', 'hourly'] },
                        date: {
                            $gte: new Date(newDate).setHours(0, 0, 0, 0),
                            $lt: new Date(newDate).setHours(23, 59, 59, 999)
                        }
                    }
                ];
            }
        }

        if (shouldCheckOverlap) {
            const overlappingLeave = await UserLeave.findOne(overlapQuery);
            if (overlappingLeave) {
                return res.status(400).json({
                    success: false,
                    message: 'Updated dates would overlap with existing leave'
                });
            }
        }

        // Update the leave
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                userLeave[key] = updateData[key];
            }
        });

        await userLeave.save();

        // Populate the response
        await userLeave.populate('userId', 'username email');
        await userLeave.populate('createdBy', 'username');
        if (userLeave.approvedBy) {
            await userLeave.populate('approvedBy', 'username');
        }

        res.status(200).json({
            success: true,
            message: 'User leave updated successfully',
            data: userLeave
        });
    } catch (error) {
        console.error('Error updating user leave:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user leave',
            error: error.message
        });
    }
};

// Delete user leave
exports.deleteUserLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const userLeave = await UserLeave.findById(id);
        if (!userLeave) {
            return res.status(404).json({
                success: false,
                message: 'User leave not found'
            });
        }

        // Check permissions
        if (!req.user.isAdmin && req.user.userId !== userLeave.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own leaves or admin privileges required.'
            });
        }

        await UserLeave.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'User leave deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user leave:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user leave',
            error: error.message
        });
    }
};

// Approve/Reject leave (Admin only)
exports.updateLeaveStatus = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either approved or rejected'
            });
        }

        const userLeave = await UserLeave.findById(id);
        if (!userLeave) {
            return res.status(404).json({
                success: false,
                message: 'User leave not found'
            });
        }

        userLeave.status = status;
        userLeave.adminNotes = adminNotes;
        userLeave.approvedBy = req.user.userId;
        userLeave.approvedAt = new Date();

        await userLeave.save();

        // Populate the response
        await userLeave.populate('userId', 'username email');
        await userLeave.populate('approvedBy', 'username');

        res.status(200).json({
            success: true,
            message: `Leave ${status} successfully`,
            data: userLeave
        });
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update leave status',
            error: error.message
        });
    }
};

// Check if user is on leave on a specific date
exports.checkUserLeave = async (req, res) => {
    try {
        const { userId, date } = req.query;

        if (!userId || !date) {
            return res.status(400).json({
                success: false,
                message: 'User ID and date are required'
            });
        }

        const leave = await UserLeave.isUserOnLeave(userId, new Date(date));

        res.status(200).json({
            success: true,
            data: {
                isOnLeave: !!leave,
                leave: leave || null
            }
        });
    } catch (error) {
        console.error('Error checking user leave:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check user leave',
            error: error.message
        });
    }
};

// Get leave statistics for a user
exports.getUserLeaveStats = async (req, res) => {
    try {
        const { userId, year } = req.query;

        if (!userId || !year) {
            return res.status(400).json({
                success: false,
                message: 'User ID and year are required'
            });
        }

        // Check permissions
        if (!req.user.isAdmin && req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own statistics or admin privileges required.'
            });
        }

        const stats = await UserLeave.getUserLeaveStats(userId, parseInt(year));

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching leave statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave statistics',
            error: error.message
        });
    }
};

// Get annual leave statistics for a user
exports.getUserAnnualLeaveStats = async (req, res) => {
    try {
        const { userId, year } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();

        // If no userId provided, use current user's ID
        const targetUserId = userId || req.user.userId;

        // Check permissions
        if (!req.user.isAdmin && req.user.userId !== targetUserId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own annual leave statistics or admin privileges required.'
            });
        }

        const stats = await UserLeave.getAnnualLeaveStats(targetUserId, currentYear);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching annual leave statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch annual leave statistics',
            error: error.message
        });
    }
};

// Get annual leave statistics for all users (admin/accountant only)
exports.getAllUsersAnnualLeaveStats = async (req, res) => {
    try {
        // Check if user is admin or accountant
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or accountant privileges required.'
            });
        }

        const { year } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();

        const stats = await UserLeave.getAllUsersAnnualLeaveStats(currentYear);

        res.status(200).json({
            success: true,
            data: {
                year: currentYear,
                users: stats
            }
        });
    } catch (error) {
        console.error('Error fetching all users annual leave statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch annual leave statistics',
            error: error.message
        });
    }
};
