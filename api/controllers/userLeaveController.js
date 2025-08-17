const UserLeave = require('../models/UserLeave');
const User = require('../models/User');

// Get all user leaves
exports.getAllUserLeaves = async (req, res) => {
    try {
        const { userId, startDate, endDate, status, leaveType, year, month } = req.query;
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

        // Date filtering
        if (year && month) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0);
            query.$or = [
                {
                    startDate: { $lte: end },
                    endDate: { $gte: start }
                }
            ];
        } else if (startDate && endDate) {
            query.$or = [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ];
        }

        const leaves = await UserLeave.find(query)
            .populate('userId', 'username email')
            .populate('createdBy', 'username')
            .populate('approvedBy', 'username')
            .sort({ startDate: -1 });

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
        const { userId, leaveType, customLeaveType, startDate, endDate, reason, isHalfDay, halfDayPeriod, color } = req.body;

        if (!req.user.isAdmin && req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only create leaves for yourself or admin privileges required.'
            });
        }

        if (!userId || !leaveType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'User ID, leave type, start date, and end date are required'
            });
        }

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for overlapping leaves
        const overlappingLeave = await UserLeave.findOne({
            userId,
            status: { $in: ['pending', 'approved'] },
            $or: [
                {
                    startDate: { $lte: new Date(endDate) },
                    endDate: { $gte: new Date(startDate) }
                }
            ]
        });

        if (overlappingLeave) {
            return res.status(400).json({
                success: false,
                message: 'User already has leave scheduled for this period'
            });
        }

        const userLeave = new UserLeave({
            userId,
            leaveType,
            customLeaveType: leaveType === 'custom' ? customLeaveType : undefined,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            isHalfDay: isHalfDay || false,
            halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
            color: color || '#fbbf24',
            status: req.user.isAdmin ? 'approved' : 'pending',
            createdBy: req.user.userId,
            approvedBy: req.user.isAdmin ? req.user.userId : undefined,
            approvedAt: req.user.isAdmin ? new Date() : undefined
        });

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

        // If updating dates, check for overlaps
        if (updateData.startDate || updateData.endDate) {
            const newStartDate = updateData.startDate ? new Date(updateData.startDate) : userLeave.startDate;
            const newEndDate = updateData.endDate ? new Date(updateData.endDate) : userLeave.endDate;

            const overlappingLeave = await UserLeave.findOne({
                _id: { $ne: id },
                userId: userLeave.userId,
                status: { $in: ['pending', 'approved'] },
                $or: [
                    {
                        startDate: { $lte: newEndDate },
                        endDate: { $gte: newStartDate }
                    }
                ]
            });

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
