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
                .sort({ 
                    date: 1,
                    startDate: 1
                });
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

        const { name, description, holidayType, date, startDate, endDate, isRecurring, recurrencePattern, type, color } = req.body;

        // Validate required fields based on holiday type
        if (!name || !holidayType) {
            return res.status(400).json({
                success: false,
                message: 'Name and holiday type are required'
            });
        }

        if (holidayType === 'single-day' && !date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required for single-day holidays'
            });
        }

        if (holidayType === 'multiple-day' && (!startDate || !endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required for multiple-day holidays'
            });
        }

        if (holidayType === 'multiple-day' && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be after end date'
            });
        }

        // Create holiday data object
        const holidayData = {
            name,
            description,
            holidayType: holidayType || 'single-day',
            isRecurring: isRecurring || false,
            recurrencePattern: recurrencePattern || 'yearly',
            type: type || 'company',
            color: color || '#f87171',
            createdBy: req.user.userId
        };

        // Add date fields based on holiday type
        if (holidayType === 'single-day') {
            holidayData.date = new Date(date);
            
            // Check if holiday already exists on this date
            const existingHoliday = await Holiday.findOne({
                holidayType: 'single-day',
                date: new Date(date),
                isActive: true
            });

            if (existingHoliday) {
                return res.status(400).json({
                    success: false,
                    message: 'A holiday already exists on this date'
                });
            }
        } else {
            holidayData.startDate = new Date(startDate);
            holidayData.endDate = new Date(endDate);
            
            // Check for overlapping holidays
            const overlappingHoliday = await Holiday.findOne({
                $or: [
                    // Single-day holidays within the range
                    {
                        holidayType: 'single-day',
                        date: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    },
                    // Multiple-day holidays that overlap
                    {
                        holidayType: 'multiple-day',
                        $or: [
                            {
                                startDate: { $lte: new Date(endDate) },
                                endDate: { $gte: new Date(startDate) }
                            }
                        ]
                    }
                ],
                isActive: true
            });

            if (overlappingHoliday) {
                return res.status(400).json({
                    success: false,
                    message: 'A holiday already overlaps with this date range'
                });
            }
        }

        const holiday = new Holiday(holidayData);

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
            $or: [
                // Single-day holidays
                {
                    holidayType: 'single-day',
                    date: {
                        $gte: new Date(previousYear, 0, 1),
                        $lt: new Date(year, 0, 1)
                    }
                },
                // Multiple-day holidays
                {
                    holidayType: 'multiple-day',
                    startDate: {
                        $gte: new Date(previousYear, 0, 1),
                        $lt: new Date(year, 0, 1)
                    }
                }
            ]
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
