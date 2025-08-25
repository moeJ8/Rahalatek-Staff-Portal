const Attendance = require('../models/Attendance');
const AttendanceQR = require('../models/AttendanceQR');
const User = require('../models/User');
const WorkingDays = require('../models/WorkingDays');
const UserWorkingDays = require('../models/UserWorkingDays');
const QRCode = require('qrcode');

// Helper function to validate check-in/check-out time (8 AM - 8 PM)
const isWithinAllowedTime = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 8 && hours < 20; // 8 AM (8) to 7:59 PM (19)
};

// Helper function to get time restriction message
const getTimeRestrictionMessage = (action) => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit' 
    });
    
    if (action === 'check-in') {
        return `Check-in is only allowed between 8:00 AM and 8:00 PM. Current time: ${currentTime}`;
    } else {
        return `Check-out is only allowed between 8:00 AM and 8:00 PM. Current time: ${currentTime}`;
    }
};

// Get or generate current month's QR code (Admin only)
exports.getCurrentQRCode = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Try to get existing QR code for current month
        let qrCode = await AttendanceQR.getCurrentMonthQR();

        // If no QR code exists or it's expired, generate a new one
        if (!qrCode) {
            qrCode = await AttendanceQR.generateMonthlyQR(req.user.userId);
            
            // Generate QR code image
            try {
                const qrImage = await QRCode.toDataURL(qrCode.qrCodeData, {
                    errorCorrectionLevel: 'M',
                    type: 'image/png',
                    quality: 0.92,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    },
                    width: 256
                });
                
                qrCode.qrCodeImage = qrImage;
                await qrCode.save();
            } catch (qrError) {
                console.error('Error generating QR image:', qrError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate QR code image'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                monthYear: qrCode.monthYear,
                qrCodeImage: qrCode.qrCodeImage,
                qrCodeData: qrCode.qrCodeData,
                expiresAt: qrCode.expiresAt,
                createdAt: qrCode.createdAt
            }
        });
    } catch (error) {
        console.error('Error getting QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get QR code',
            error: error.message
        });
    }
};

// Get user's current attendance status
exports.getAttendanceStatus = async (req, res) => {
    try {
        const attendance = await Attendance.getTodayAttendance(req.user.userId);
        
        if (!attendance) {
            return res.status(200).json({
                success: true,
                data: {
                    status: 'not-checked-in',
                    checkIn: null,
                    checkOut: null,
                    hoursWorked: 0,
                    date: new Date().toISOString().split('T')[0]
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                status: attendance.status,
                checkIn: attendance.checkIn,
                checkOut: attendance.checkOut,
                hoursWorked: attendance.hoursWorked,
                date: attendance.date
            }
        });
    } catch (error) {
        console.error('Error getting attendance status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get attendance status',
            error: error.message
        });
    }
};

// Check in with QR code
exports.checkIn = async (req, res) => {
    try {
        const { qrCodeData } = req.body;

        if (!qrCodeData) {
            return res.status(400).json({
                success: false,
                message: 'QR code data is required'
            });
        }

        // Check if current time is within allowed check-in hours
        if (!isWithinAllowedTime()) {
            return res.status(400).json({
                success: false,
                message: getTimeRestrictionMessage('check-in')
            });
        }

        // Verify QR code
        const validQR = await AttendanceQR.verifyQRCode(qrCodeData);
        if (!validQR) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired QR code'
            });
        }

        // Get or create today's attendance record
        const attendance = await Attendance.getOrCreateTodayAttendance(req.user.userId);

        // Check if already checked in
        if (attendance.status === 'checked-in') {
            return res.status(400).json({
                success: false,
                message: 'You are already checked in'
            });
        }

        // Check if already checked out (can't check in again on same day)
        if (attendance.status === 'checked-out') {
            return res.status(400).json({
                success: false,
                message: 'You have already completed your work for today'
            });
        }

        // Check in
        const checkedIn = attendance.checkInUser();
        if (checkedIn) {
            await attendance.save();
            
            res.status(200).json({
                success: true,
                message: 'Successfully checked in',
                data: {
                    status: attendance.status,
                    checkIn: attendance.checkIn,
                    checkOut: attendance.checkOut,
                    hoursWorked: attendance.hoursWorked
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to check in'
            });
        }
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check in',
            error: error.message
        });
    }
};

// Check out
exports.checkOut = async (req, res) => {
    try {
        // Check if current time is within allowed check-out hours
        if (!isWithinAllowedTime()) {
            return res.status(400).json({
                success: false,
                message: getTimeRestrictionMessage('check-out')
            });
        }

        // Get today's attendance record
        const attendance = await Attendance.getTodayAttendance(req.user.userId);

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'No check-in record found for today'
            });
        }

        // Check if not checked in
        if (attendance.status !== 'checked-in') {
            return res.status(400).json({
                success: false,
                message: 'You must check in first'
            });
        }

        // Check out
        const checkedOut = attendance.checkOutUser();
        if (checkedOut) {
            await attendance.save();
            
            res.status(200).json({
                success: true,
                message: 'Successfully checked out',
                data: {
                    status: attendance.status,
                    checkIn: attendance.checkIn,
                    checkOut: attendance.checkOut,
                    hoursWorked: attendance.hoursWorked
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to check out'
            });
        }
    } catch (error) {
        console.error('Error checking out:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check out',
            error: error.message
        });
    }
};

// Get attendance reports (Admin/Accountant only)
exports.getAttendanceReports = async (req, res) => {
    try {
        // Check if user is admin or accountant
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or accountant privileges required.'
            });
        }

        const {
            startDate,
            endDate,
            userId,
            status,
            period = 'daily' // daily, weekly, monthly, yearly
        } = req.query;

        let filters = {};
        
        // Set date range based on period if not provided
        if (!startDate || !endDate) {
            const now = new Date();
            let start, end;
            
            switch (period) {
                case 'daily':
                    start = new Date(now);
                    start.setHours(0, 0, 0, 0);
                    end = new Date(now);
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'weekly':
                    // Business week: Saturday to Friday
                    // Get local timezone offset to ensure proper date handling
                    const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
                    start = new Date(localNow);
                    // Calculate start of week (Saturday = 6, Sunday = 0, Monday = 1, etc.)
                    const dayOfWeek = localNow.getDay();
                    let daysToSaturday;
                    if (dayOfWeek === 6) {
                        // Today is Saturday - start of week
                        daysToSaturday = 0;
                    } else {
                        // Go back to previous Saturday
                        daysToSaturday = dayOfWeek + 1; // Sunday=1, Monday=2, ..., Friday=6
                    }
                    start.setDate(localNow.getDate() - daysToSaturday);
                    start.setHours(0, 0, 0, 0);
                    end = new Date(start);
                    end.setDate(start.getDate() + 6); // End of week (Friday)
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'monthly':
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'yearly':
                    start = new Date(now.getFullYear(), 0, 1);
                    end = new Date(now.getFullYear(), 11, 31);
                    end.setHours(23, 59, 59, 999);
                    break;
                default:
                    start = new Date(now);
                    start.setHours(0, 0, 0, 0);
                    end = new Date(now);
                    end.setHours(23, 59, 59, 999);
            }
            
            filters.startDate = start;
            filters.endDate = end;
        } else {
            filters.startDate = startDate;
            filters.endDate = endDate;
        }

        if (userId) filters.userId = userId;
        if (status) filters.status = status;

        const attendanceRecords = await Attendance.getAttendanceReport(filters);

        // Calculate summary statistics
        const summary = {
            totalRecords: attendanceRecords.length,
            totalHours: attendanceRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0),
            checkedInToday: attendanceRecords.filter(r => r.status === 'checked-in').length,
            checkedOutToday: attendanceRecords.filter(r => r.status === 'checked-out').length,
            averageHours: 0
        };

        const completedRecords = attendanceRecords.filter(r => r.status === 'checked-out');
        if (completedRecords.length > 0) {
            summary.averageHours = summary.totalHours / completedRecords.length;
        }

        res.status(200).json({
            success: true,
            data: {
                records: attendanceRecords,
                summary: summary,
                period: period,
                filters: filters
            }
        });
    } catch (error) {
        console.error('Error getting attendance reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get attendance reports',
            error: error.message
        });
    }
};

// Get all users for attendance reports (Admin/Accountant only)
exports.getAttendanceUsers = async (req, res) => {
    try {
        // Check if user is admin or accountant
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or accountant privileges required.'
            });
        }

        const users = await User.find({}, 'username email isAdmin isAccountant isApproved')
            .sort({ username: 1 });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

// Get working hours tracking data (Admin/Accountant only)
exports.getWorkingHoursTracking = async (req, res) => {
    try {
        // Check if user is admin or accountant
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or accountant privileges required.'
            });
        }

        const {
            userId,
            year = new Date().getFullYear(),
            month = new Date().getMonth() + 1,
            period = 'monthly' // daily, monthly, yearly
        } = req.query;

        // Get users to track
        let usersToTrack = [];
        if (userId && userId !== '') {
            const user = await User.findById(userId, 'username email');
            if (user) {
                usersToTrack = [user];
            }
        } else {
            usersToTrack = await User.find({}, 'username email').sort({ username: 1 });
        }

        const trackingData = [];

        for (const user of usersToTrack) {
            let dateRange = {};
            let totalWorkingDays = 0;
            let totalHoursWorked = 0;
            let userDailyHours = 8; // Default 8 hours

            if (period === 'daily') {
                // Single day
                const targetDate = new Date(year, month - 1, 1); // Default to 1st of month if no specific day
                dateRange = {
                    startDate: new Date(targetDate),
                    endDate: new Date(targetDate)
                };
                
                // Get working days config for this user and check if this day is a working day
                const workingDaysConfig = await UserWorkingDays.getWorkingDaysForUser(user._id, year, month);
                userDailyHours = workingDaysConfig.dailyHours || 8;
                const dayConfig = workingDaysConfig.workingDays.find(wd => wd.day === targetDate.getDate());
                if (dayConfig && dayConfig.isWorkingDay) {
                    totalWorkingDays = 1;
                }
            } else if (period === 'monthly') {
                // Entire month
                dateRange = {
                    startDate: new Date(year, month - 1, 1),
                    endDate: new Date(year, month, 0) // Last day of month
                };
                
                // Calculate working days in the month for this user
                const workingDaysConfig = await UserWorkingDays.getWorkingDaysForUser(user._id, year, month);
                userDailyHours = workingDaysConfig.dailyHours || 8;
                totalWorkingDays = workingDaysConfig.workingDays.filter(wd => wd.isWorkingDay).length;
            } else if (period === 'yearly') {
                // Entire year
                dateRange = {
                    startDate: new Date(year, 0, 1),
                    endDate: new Date(year, 11, 31)
                };
                
                // Calculate working days for the entire year
                // For yearly calculation, we'll use the average dailyHours from all months
                let totalDailyHours = 0;
                let monthsWithConfig = 0;
                
                for (let m = 1; m <= 12; m++) {
                    const workingDaysConfig = await UserWorkingDays.getWorkingDaysForUser(user._id, year, m);
                    totalWorkingDays += workingDaysConfig.workingDays.filter(wd => wd.isWorkingDay).length;
                    totalDailyHours += (workingDaysConfig.dailyHours || 8);
                    monthsWithConfig++;
                }
                
                // Average daily hours across all months
                userDailyHours = monthsWithConfig > 0 ? totalDailyHours / monthsWithConfig : 8;
            }

            // Get attendance records for this user in the date range
            const filters = {
                userId: user._id,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            };
            
            const attendanceRecords = await Attendance.getAttendanceReport(filters);
            totalHoursWorked = attendanceRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);

            const totalRequiredHours = totalWorkingDays * userDailyHours; // Use user's specific daily hours
            const percentage = totalRequiredHours > 0 ? Math.round((totalHoursWorked / totalRequiredHours) * 100) : 0;

            trackingData.push({
                userId: user._id,
                username: user.username,
                email: user.email,
                totalWorkingDays,
                totalRequiredHours,
                totalHoursWorked: Math.round(totalHoursWorked * 10) / 10, // Round to 1 decimal
                dailyHours: userDailyHours,
                percentage,
                attendanceRecords: attendanceRecords.length,
                period,
                year: parseInt(year),
                month: parseInt(month)
            });
        }

        res.status(200).json({
            success: true,
            data: {
                trackingData,
                period,
                filters: { userId, year: parseInt(year), month: parseInt(month) }
            }
        });
    } catch (error) {
        console.error('Error getting working hours tracking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get working hours tracking',
            error: error.message
        });
    }
};

// Manual admin check-in/out for users (Admin only)
exports.adminCheckInOut = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { userId, action, date } = req.body; // action: 'check-in' or 'check-out'

        if (!userId || !action) {
            return res.status(400).json({
                success: false,
                message: 'User ID and action are required'
            });
        }

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Get or create attendance record for the specified date
        let attendance = await Attendance.findOne({
            userId: userId,
            date: targetDate
        });

        if (!attendance) {
            attendance = new Attendance({
                userId: userId,
                date: targetDate,
                status: 'not-checked-in'
            });
        }

        let success = false;
        let message = '';

        if (action === 'check-in') {
            success = attendance.checkInUser();
            message = success ? 'User checked in successfully' : 'Failed to check in user';
        } else if (action === 'check-out') {
            success = attendance.checkOutUser();
            message = success ? 'User checked out successfully' : 'Failed to check out user';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "check-in" or "check-out"'
            });
        }

        if (success) {
            await attendance.save();
            
            res.status(200).json({
                success: true,
                message: message,
                data: attendance
            });
        } else {
            res.status(400).json({
                success: false,
                message: message
            });
        }
    } catch (error) {
        console.error('Error in admin check-in/out:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform admin check-in/out',
            error: error.message
        });
    }
};

// Get yearly attendance calendar data
exports.getYearlyAttendance = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        
        // Get all users
        const users = await User.find({ isAdmin: false }).select('_id username email');
        
        // Get attendance records for the year
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st
        
        const attendanceRecords = await Attendance.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('userId', 'username email').lean();
        
        // Create a map of attendance by user and date
        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            const dateKey = record.date.toISOString().split('T')[0]; // YYYY-MM-DD
            const userId = record.userId._id.toString();
            
            if (!attendanceMap[userId]) {
                attendanceMap[userId] = {};
            }
            
            attendanceMap[userId][dateKey] = {
                status: record.status,
                checkIn: record.checkIn,
                checkOut: record.checkOut,
                hoursWorked: record.hoursWorked
            };
        });
        
        // Pre-load all working days configurations for the year (for performance)
        const workingDaysConfigs = {};
        for (let month = 1; month <= 12; month++) {
            try {
                const config = await WorkingDays.getWorkingDaysForMonth(year, month);
                workingDaysConfigs[month] = config;
            } catch (error) {
                console.error(`Error loading working days for ${year}-${month}:`, error);
                // Fallback to default working days
                workingDaysConfigs[month] = {
                    defaultWorkingDaysOfWeek: [0, 1, 2, 3, 4, 6] // Sunday, Monday to Thursday, Saturday (Friday is non-working)
                };
            }
        }

        // Helper function to check if a day is working (using pre-loaded configs)
        const isWorkingDayFast = (date, monthConfig) => {
            const day = date.getDate();
            const dayOfWeek = date.getDay();
            
            // Check specific day configuration first
            if (monthConfig.workingDays) {
                const dayConfig = monthConfig.workingDays.find(d => d.day === day);
                if (dayConfig) {
                    return dayConfig.isWorkingDay;
                }
            }
            
            // Fallback to default working days of week
            const defaultDays = monthConfig.defaultWorkingDaysOfWeek || [0, 1, 2, 3, 4, 6];
            return defaultDays.includes(dayOfWeek);
        };

        // Generate calendar data
        const calendarData = {};
        
        for (let month = 0; month < 12; month++) {
            const monthData = {};
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const monthConfig = workingDaysConfigs[month + 1];
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateKey = date.toISOString().split('T')[0];
                const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                
                // Check if this day is a working day using pre-loaded configuration
                if (!isWorkingDayFast(date, monthConfig)) {
                    continue;
                }
                
                monthData[day] = {
                    date: dateKey,
                    dayOfWeek,
                    users: users.map(user => {
                        const userId = user._id.toString();
                        const attendance = attendanceMap[userId] && attendanceMap[userId][dateKey];
                        
                        return {
                            userId: user._id,
                            username: user.username,
                            email: user.email,
                            status: attendance ? attendance.status : 'absent',
                            checkIn: attendance ? attendance.checkIn : null,
                            checkOut: attendance ? attendance.checkOut : null,
                            hoursWorked: attendance ? attendance.hoursWorked : 0
                        };
                    })
                };
            }
            
            calendarData[month] = monthData;
        }
        
        res.json({
            success: true,
            data: {
                year: parseInt(year),
                calendar: calendarData,
                users: users,
                summary: {
                    totalUsers: users.length,
                    totalWorkingDays: Object.values(calendarData).reduce((total, month) => 
                        total + Object.keys(month).length, 0
                    )
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching yearly attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch yearly attendance',
            error: error.message
        });
    }
};

// Admin: Create manual attendance entry
exports.createManualAttendance = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { userId, date, checkIn, checkOut, status, notes, adminNotes } = req.body;

        // Validate required fields
        if (!userId || !date) {
            return res.status(400).json({
                success: false,
                message: 'User ID and date are required'
            });
        }

        // Check if attendance already exists for this user and date
        const existingAttendance = await Attendance.findOne({
            userId: userId,
            date: new Date(date)
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Attendance record already exists for this user and date'
            });
        }

        // Create manual entry
        const attendance = await Attendance.createManualEntry({
            userId,
            date: new Date(date),
            checkIn: checkIn ? new Date(checkIn) : null,
            checkOut: checkOut ? new Date(checkOut) : null,
            status: status || 'checked-out',
            notes: notes || '',
            adminNotes: adminNotes || `Manually created by admin`
        }, req.user.userId);

        // Populate user data
        await attendance.populate('userId', 'username email');
        await attendance.populate('editedBy', 'username');

        res.status(201).json({
            success: true,
            message: 'Manual attendance entry created successfully',
            data: attendance
        });

    } catch (error) {
        console.error('Error creating manual attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create manual attendance entry',
            error: error.message
        });
    }
};

// Admin: Edit existing attendance
exports.editAttendance = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { id } = req.params;
        const { checkIn, checkOut, status, notes, adminNotes } = req.body;

        // Find attendance record
        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }

        // Prepare edit data
        const editData = {};
        if (checkIn !== undefined) editData.checkIn = checkIn ? new Date(checkIn) : null;
        if (checkOut !== undefined) editData.checkOut = checkOut ? new Date(checkOut) : null;
        if (status !== undefined) editData.status = status;
        if (notes !== undefined) editData.notes = notes;
        if (adminNotes !== undefined) editData.adminNotes = adminNotes;

        // Apply admin edit
        attendance.adminEdit(editData, req.user.userId);
        await attendance.save();

        // Populate user data
        await attendance.populate('userId', 'username email');
        await attendance.populate('editedBy', 'username');

        res.status(200).json({
            success: true,
            message: 'Attendance record updated successfully',
            data: attendance
        });

    } catch (error) {
        console.error('Error editing attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to edit attendance record',
            error: error.message
        });
    }
};

// Admin: Delete attendance record
exports.deleteAttendance = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { id } = req.params;

        // Find and delete attendance record
        const attendance = await Attendance.findByIdAndDelete(id);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Attendance record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete attendance record',
            error: error.message
        });
    }
};

// Get user's personal yearly attendance calendar data
exports.getUserYearlyAttendance = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const userId = req.user.userId;
        
        // Validate year (users can only access current year and next year)
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        const maxAllowedYear = Math.max(currentYear, 2025) + 1; // Current year + 1, but minimum 2026
        
        if (isNaN(yearNum) || yearNum < 2025 || yearNum > maxAllowedYear) {
            return res.status(400).json({
                success: false,
                message: `Invalid year. Year must be between 2025 and ${maxAllowedYear}.`
            });
        }

        // Get attendance records for the user for the year
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st
        
        const attendanceRecords = await Attendance.find({
            userId: userId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).lean();
        
        // Create a map of attendance by date
        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            const dateKey = record.date.toISOString().split('T')[0]; // YYYY-MM-DD
            attendanceMap[dateKey] = {
                status: record.status,
                checkIn: record.checkIn,
                checkOut: record.checkOut,
                hoursWorked: record.hoursWorked
            };
        });

        // Get user's leave records for the year
        const UserLeave = require('../models/UserLeave');
        const userLeaves = await UserLeave.find({
            userId: userId,
            status: 'approved',
            $or: [
                // Multiple-day leaves
                {
                    leaveCategory: 'multiple-day',
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate }
                },
                // Single-day and hourly leaves
                {
                    leaveCategory: { $in: ['single-day', 'hourly'] },
                    date: { $gte: startDate, $lte: endDate }
                }
            ]
        }).lean();

        // Get holidays for the year
        const Holiday = require('../models/Holiday');
        const holidays = await Holiday.find({
            $or: [
                // Single-day holidays
                {
                    holidayType: 'single-day',
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                },
                // Multiple-day holidays that overlap with the year
                {
                    holidayType: 'multiple-day',
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate }
                },
                // Backward compatibility for old holidays without holidayType
                {
                    holidayType: { $exists: false },
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            ],
            isActive: true
        }).lean();
        
        // Pre-load all working days configurations for the user and year
        const workingDaysConfigs = {};
        for (let month = 1; month <= 12; month++) {
            try {
                const config = await UserWorkingDays.getWorkingDaysForUser(userId, year, month);
                workingDaysConfigs[month] = config;
            } catch (error) {
                console.error(`Error loading working days for ${year}-${month}:`, error);
                // Fallback to default working days
                workingDaysConfigs[month] = {
                    defaultWorkingDaysOfWeek: [0, 1, 2, 3, 4, 6] // Sunday, Monday to Thursday, Saturday (Friday is non-working)
                };
            }
        }

        // Helper function to check if a day is working
        const isWorkingDayFast = (date, monthConfig) => {
            const day = date.getDate();
            const dayOfWeek = date.getDay();
            
            // Check specific day configuration first
            if (monthConfig.workingDays) {
                const dayConfig = monthConfig.workingDays.find(d => d.day === day);
                if (dayConfig) {
                    return dayConfig.isWorkingDay;
                }
            }
            
            // Fallback to default working days of week
            const defaultDays = monthConfig.defaultWorkingDaysOfWeek || [0, 1, 2, 3, 4, 6];
            return defaultDays.includes(dayOfWeek);
        };

        // Helper function to check if user is on leave on a specific date
        const isOnLeave = (date) => {
            return userLeaves.find(leave => {
                if (leave.leaveCategory === 'multiple-day') {
                    // Normalize dates to start of day for proper comparison
                    const leaveStart = new Date(leave.startDate);
                    leaveStart.setHours(0, 0, 0, 0);
                    const leaveEnd = new Date(leave.endDate);
                    leaveEnd.setHours(23, 59, 59, 999);
                    
                    const currentDate = new Date(date);
                    currentDate.setHours(12, 0, 0, 0); // Set to midday to avoid timezone issues
                    
                    return currentDate >= leaveStart && currentDate <= leaveEnd;
                } else {
                    // For single-day and hourly leaves, check if the date matches
                    const leaveDate = new Date(leave.date);
                    return date.toDateString() === leaveDate.toDateString();
                }
            });
        };

        // Helper function to check if date is a holiday
        const isHoliday = (date) => {
            return holidays.find(holiday => {
                if (holiday.holidayType === 'single-day') {
                    const holidayDate = new Date(holiday.date);
                    return date.toDateString() === holidayDate.toDateString();
                } else if (holiday.holidayType === 'multiple-day') {
                    // Normalize dates for comparison
                    const startDate = new Date(holiday.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(holiday.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    
                    const checkDate = new Date(date);
                    checkDate.setHours(12, 0, 0, 0); // Set to midday to avoid timezone issues
                    
                    return checkDate >= startDate && checkDate <= endDate;
                }
                return false;
            });
        };

        // Generate calendar data
        const calendarData = {};
        
        for (let month = 0; month < 12; month++) {
            const monthData = {};
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const monthConfig = workingDaysConfigs[month + 1];
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateKey = date.toISOString().split('T')[0];
                const dayOfWeek = date.getDay();
                
                // Get attendance, leave, and holiday info for this day
                const attendance = attendanceMap[dateKey];
                const leave = isOnLeave(date);
                const holiday = isHoliday(date);
                const isWorking = isWorkingDayFast(date, monthConfig);
                
                monthData[day] = {
                    date: dateKey,
                    dayOfWeek,
                    isWorkingDay: isWorking,
                    attendance: attendance || null,
                    leave: leave || null,
                    holiday: holiday || null,
                    status: attendance ? attendance.status : (leave ? 'on-leave' : (holiday ? 'holiday' : (!isWorking ? 'non-working' : 'absent')))
                };
            }
            
            calendarData[month] = monthData;
        }
        
        // Calculate summary statistics
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today for comparison
        
        // Total working days in the year (excluding holidays)
        const totalWorkingDays = Object.values(calendarData).reduce((total, month) => {
            return total + Object.values(month).filter(day => day.isWorkingDay && !day.holiday).length;
        }, 0);
        
        // Present days (attendance recorded)
        const presentDays = Object.values(calendarData).reduce((total, month) => {
            return total + Object.values(month).filter(day => 
                day.attendance && (day.attendance.status === 'checked-in' || day.attendance.status === 'checked-out')
            ).length;
        }, 0);
        
        // Leave days
        const leaveDays = Object.values(calendarData).reduce((total, month) => {
            return total + Object.values(month).filter(day => day.leave).length;
        }, 0);
        
        // Absent days - only count past working days without attendance or leave
        const absentDays = Object.values(calendarData).reduce((total, month) => {
            return total + Object.values(month).filter(day => {
                const dayDate = new Date(day.date);
                return day.isWorkingDay && 
                       !day.holiday && 
                       !day.leave && 
                       !day.attendance && 
                       dayDate <= today; // Only count past and today
            }).length;
        }, 0);
        
        // Past working days (for calculating attendance rate accurately)
        const pastWorkingDays = Object.values(calendarData).reduce((total, month) => {
            return total + Object.values(month).filter(day => {
                const dayDate = new Date(day.date);
                return day.isWorkingDay && 
                       !day.holiday && 
                       dayDate <= today; // Only count past and today
            }).length;
        }, 0);
        
        // Extract daily hours for each month
        const monthlyDailyHours = {};
        for (let month = 1; month <= 12; month++) {
            const config = workingDaysConfigs[month];
            monthlyDailyHours[month] = config?.dailyHours || 8;
        }

        res.json({
            success: true,
            data: {
                year: parseInt(year),
                calendar: calendarData,
                summary: {
                    totalWorkingDays,
                    presentDays,
                    leaveDays,
                    absentDays,
                    pastWorkingDays,
                    attendanceRate: pastWorkingDays > 0 ? Math.round((presentDays / pastWorkingDays) * 100) : 0
                },
                monthlyDailyHours // Include user's daily hours for each month
            }
        });
        
    } catch (error) {
        console.error('Error fetching user yearly attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch yearly attendance',
            error: error.message
        });
    }
};

// Get available years with attendance data (Admin only)
exports.getAvailableYears = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Get distinct years from attendance records
        const years = await Attendance.distinct('date').then(dates => {
            const uniqueYears = [...new Set(dates.map(date => new Date(date).getFullYear()))];
            return uniqueYears.sort((a, b) => b - a); // Sort descending
        });

        // If no data exists, include current year as fallback
        const currentYear = new Date().getFullYear();
        if (years.length === 0 || !years.includes(currentYear)) {
            years.unshift(currentYear);
        }

        res.status(200).json({
            success: true,
            data: years
        });

    } catch (error) {
        console.error('Error fetching available years:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available years',
            error: error.message
        });
    }
};
