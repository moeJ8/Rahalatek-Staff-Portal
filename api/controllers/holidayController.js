const Holiday = require('../models/Holiday');

// Get all holidays
exports.getAllHolidays = async (req, res) => {
    try {
        const { year, month, startDate, endDate } = req.query;
        let holidays;

        if (year && month) {
            holidays = await Holiday.getHolidaysForMonth(parseInt(year), parseInt(month));
        } else if (startDate && endDate) {
            holidays = await Holiday.getHolidaysForRange(new Date(startDate), new Date(endDate));
        } else {
            // Get all active holidays
            holidays = await Holiday.find({ isActive: true })
                .populate('createdBy', 'username')
                .populate('updatedBy', 'username')
                .sort({ date: 1 });
        }

        res.status(200).json({
            success: true,
            data: holidays
        });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch holidays',
            error: error.message
        });
    }
};

// Create new holiday
exports.createHoliday = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { name, description, date, isRecurring, recurrencePattern, type, color } = req.body;

        if (!name || !date) {
            return res.status(400).json({
                success: false,
                message: 'Name and date are required'
            });
        }

        // Check if holiday already exists on this date
        const existingHoliday = await Holiday.findOne({
            date: new Date(date),
            isActive: true
        });

        if (existingHoliday) {
            return res.status(400).json({
                success: false,
                message: 'A holiday already exists on this date'
            });
        }

        const holiday = new Holiday({
            name,
            description,
            date: new Date(date),
            isRecurring: isRecurring || false,
            recurrencePattern: recurrencePattern || 'yearly',
            type: type || 'company',
            color: color || '#f87171',
            createdBy: req.user.userId
        });

        await holiday.save();

        res.status(201).json({
            success: true,
            message: 'Holiday created successfully',
            data: holiday
        });
    } catch (error) {
        console.error('Error creating holiday:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create holiday',
            error: error.message
        });
    }
};

// Update holiday
exports.updateHoliday = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        const holiday = await Holiday.findById(id);
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }

        // Update the holiday
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                holiday[key] = updateData[key];
            }
        });

        holiday.updatedBy = req.user.userId;
        await holiday.save();

        res.status(200).json({
            success: true,
            message: 'Holiday updated successfully',
            data: holiday
        });
    } catch (error) {
        console.error('Error updating holiday:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update holiday',
            error: error.message
        });
    }
};

// Delete holiday
exports.deleteHoliday = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { id } = req.params;

        const holiday = await Holiday.findById(id);
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }

        // Soft delete - set isActive to false
        holiday.isActive = false;
        holiday.updatedBy = req.user.userId;
        await holiday.save();

        res.status(200).json({
            success: true,
            message: 'Holiday deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting holiday:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete holiday',
            error: error.message
        });
    }
};

// Check if date is a holiday
exports.checkHoliday = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        const holiday = await Holiday.isHoliday(new Date(date));

        res.status(200).json({
            success: true,
            data: {
                isHoliday: !!holiday,
                holiday: holiday || null
            }
        });
    } catch (error) {
        console.error('Error checking holiday:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check holiday',
            error: error.message
        });
    }
};

// Generate recurring holidays for next year
exports.generateRecurringHolidays = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { year } = req.body;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'Year is required'
            });
        }

        // Get all recurring holidays from previous year
        const previousYear = year - 1;
        const recurringHolidays = await Holiday.find({
            isRecurring: true,
            isActive: true,
            date: {
                $gte: new Date(previousYear, 0, 1),
                $lt: new Date(year, 0, 1)
            }
        });

        const generatedHolidays = [];

        for (const holiday of recurringHolidays) {
            try {
                const newHoliday = await holiday.generateNextYear();
                if (newHoliday) {
                    generatedHolidays.push(newHoliday);
                }
            } catch (error) {
                console.error(`Error generating holiday ${holiday.name}:`, error);
            }
        }

        res.status(200).json({
            success: true,
            message: `Generated ${generatedHolidays.length} recurring holidays for ${year}`,
            data: generatedHolidays
        });
    } catch (error) {
        console.error('Error generating recurring holidays:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate recurring holidays',
            error: error.message
        });
    }
};
