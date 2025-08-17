const WorkingDays = require('../models/WorkingDays');

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