const Voucher = require('../models/Voucher');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Tour = require('../models/Tour');
const Office = require('../models/Office');
const Airport = require('../models/Airport');
const Debt = require('../models/Debt');
const OfficePayment = require('../models/OfficePayment');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const UserLeave = require('../models/UserLeave');
const Holiday = require('../models/Holiday');
const { dashboardCache, invalidateDashboardCache, initRedis } = require('../utils/redis');

// Initialize Redis when this module is loaded
initRedis().catch(err => console.error('Redis initialization failed:', err));

// Get comprehensive dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const { userId, isAdmin, isAccountant } = req.user;
        
        // Only admins and accountants can access dashboard analytics
        if (!isAdmin && !isAccountant) {
            return res.status(403).json({ message: 'Access denied. Admin or accountant privileges required.' });
        }

        // Check Redis cache first
        const cachedData = await dashboardCache.get();
        if (cachedData) {
            return res.json(cachedData);
        }

        console.log('📊 Generating fresh dashboard data...');
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Current month range
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        
        // Previous month range
        const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        
        // Current year range
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

        // Parallel data fetching for better performance
        const [
            // Voucher Analytics
            totalVouchers,
            monthlyVouchers,
            activeVouchers,
            arrivedVouchers,
            cancelledVouchers,
            
            // Debt Analytics (simplified)
            totalOpenDebts,
            debtsOwedToOffice,
            debtsOwedFromOffice,
            closedDebtsThisMonth,
            
            // User Analytics
            verifiedEmailUsers,
            approvedUsers,
            unapprovedUsers,
            
            // Attendance Analytics
            todayAttendance,
            monthlyAttendanceStats,
            recentLeaveStats,
            
            // Inventory Analytics
            totalHotels,
            totalTours,
            totalOffices,
            totalAirports,
            
            // Recent Activity
            recentVouchers,
            recentUsers
        ] = await Promise.all([
            // Voucher counts
            Voucher.countDocuments({ isDeleted: { $ne: true } }),
            Voucher.countDocuments({ 
                isDeleted: { $ne: true },
                createdAt: { $gte: monthStart, $lte: monthEnd }
            }),
            Voucher.countDocuments({ 
                isDeleted: { $ne: true },
                status: 'await'
            }),
            Voucher.countDocuments({ 
                isDeleted: { $ne: true },
                status: 'arrived'
            }),
            Voucher.countDocuments({ 
                isDeleted: { $ne: true },
                status: 'canceled'
            }),
            
            // Debt analytics (simplified - only what's displayed)
            Debt.countDocuments({ status: 'OPEN' }),
            Debt.countDocuments({ 
                status: 'OPEN',
                type: 'OWED_TO_OFFICE'
            }),
            Debt.countDocuments({ 
                status: 'OPEN',
                type: 'OWED_FROM_OFFICE'
            }),
            Debt.countDocuments({ 
                status: 'CLOSED',
                closedDate: { $gte: monthStart, $lte: monthEnd }
            }),

            // User analytics
            User.countDocuments({ 
                isApproved: true,
                isEmailVerified: true 
            }),
            User.countDocuments({ isApproved: true }),
            User.countDocuments({ isApproved: false }),
            
            // Attendance analytics
            getTodayAttendanceStats(),
            getMonthlyAttendanceStats(monthStart, monthEnd),
            
            // Leave analytics
            getRecentLeaveStats(monthStart, monthEnd),
            
            // Inventory counts
            Hotel.countDocuments(),
            Tour.countDocuments(),
            Office.countDocuments(),
            Airport.countDocuments(),
            
            // Recent activity (optimized with select fields)
            Voucher.find({ 
                isDeleted: { $ne: true },
                createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
            })
            .populate('createdBy', 'username')
            .select('voucherNumber clientName totalAmount currency createdAt createdBy')
            .sort({ createdAt: -1 })
            .limit(10),
            
            User.find({ isApproved: true })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('username email isApproved isAdmin isAccountant isContentManager isPublisher salaryAmount salaryCurrency createdAt')
        ]);

        // Removed unused financial calculations for performance

        // Build response - only include data used by frontend
        const analytics = {
            // Overview metrics (only voucher counts and monthly vouchers)
            overview: {
                totalVouchers,
                monthlyVouchers,
                activeVouchers,
                arrivedVouchers,
                cancelledVouchers
            },
            
            // Debt analytics (simplified)
            debts: {
                totalOpen: totalOpenDebts,
                owedToOffice: debtsOwedToOffice,
                owedFromOffice: debtsOwedFromOffice,
                closedThisMonth: closedDebtsThisMonth
            },
            
            // User analytics (only what's displayed)
            users: {
                pending: unapprovedUsers, // Pending approvals
                verifiedEmails: verifiedEmailUsers
            },
            
            // Attendance summary
            attendance: {
                today: todayAttendance,
                monthlyStats: monthlyAttendanceStats
            },
            
            // Leave summary
            leaves: recentLeaveStats,
            
            // Inventory counts
            inventory: {
                hotels: totalHotels,
                tours: totalTours,
                offices: totalOffices,
                airports: totalAirports
            },
            
            // Recent activity (only vouchers and users)
            recentActivity: {
                vouchers: recentVouchers,
                users: recentUsers
            },
            
            // Charts data (only used charts) - parallelized for performance
            charts: await Promise.all([
                getMonthlyTrendsOptimized(currentYear),
                getMonthlyArrivalTrendsOptimized(currentYear), 
                getMonthlyProfitData(currentYear)
            ]).then(([monthlyTrends, monthlyArrivalTrends, monthlyProfitChart]) => ({
                monthlyTrends,
                monthlyArrivalTrends,
                monthlyProfitChart
            }))
        };

        // Store in Redis cache
        await dashboardCache.set(analytics);

        res.json(analytics);

    } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
        res.status(500).json({ message: 'Error fetching dashboard analytics' });
    }
};

// Redis cache management endpoints (admin only)
exports.clearDashboardCache = async (req, res) => {
    try {
        const { isAdmin } = req.user;
        
        // Only admins can clear cache
        if (!isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const success = await dashboardCache.clear('Manual clear by admin');
        
        res.json({ 
            message: 'Dashboard cache cleared successfully',
            success
        });
    } catch (err) {
        console.error('Error clearing dashboard cache:', err);
        res.status(500).json({ message: 'Error clearing cache' });
    }
};

// Get Redis cache status (admin only)
exports.getCacheStatus = async (req, res) => {
    try {
        const { isAdmin } = req.user;
        
        if (!isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const status = await dashboardCache.getStatus();
        
        res.json(status);
    } catch (err) {
        console.error('Error getting cache status:', err);
        res.status(500).json({ message: 'Error getting cache status' });
    }
};

// Cache invalidation is now handled globally through api/utils/redis.js

// Helper functions
async function getSupplierCosts(startDate, endDate) {
    const vouchers = await Voucher.find({
        isDeleted: { $ne: true },
        createdAt: { $gte: startDate, $lte: endDate }
    });

    const costsByCurrency = {};
    
    vouchers.forEach(voucher => {
        const currency = voucher.currency || 'USD';
        
        if (!costsByCurrency[currency]) {
            costsByCurrency[currency] = 0;
        }
        
        // Sum all payment amounts
        if (voucher.payments) {
            Object.keys(voucher.payments).forEach(paymentType => {
                const payment = voucher.payments[paymentType];
                if (payment.officeName && payment.price > 0) {
                    costsByCurrency[currency] += payment.price;
                }
            });
        }
        
        // Sum individual service payments
        ['hotels', 'transfers', 'flights'].forEach(serviceType => {
            if (voucher[serviceType] && Array.isArray(voucher[serviceType])) {
                voucher[serviceType].forEach(service => {
                    if (service.officeName && service.price > 0) {
                        costsByCurrency[currency] += service.price;
                    }
                });
            }
        });
        
        // Handle trips
        if (voucher.trips && Array.isArray(voucher.trips)) {
            voucher.trips.forEach(trip => {
                if (trip.officeName && trip.price > 0) {
                    costsByCurrency[currency] += trip.price;
                }
            });
        }
    });

    return Object.keys(costsByCurrency).map(currency => ({
        _id: currency,
        totalAmount: costsByCurrency[currency]
    }));
}

async function getTodayAttendanceStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const [checkedIn, checkedOut, notCheckedIn] = await Promise.all([
        Attendance.countDocuments({
            date: { $gte: today, $lte: todayEnd },
            status: 'checked-in'
        }),
        Attendance.countDocuments({
            date: { $gte: today, $lte: todayEnd },
            status: 'checked-out'
        }),
        Attendance.countDocuments({
            date: { $gte: today, $lte: todayEnd },
            status: 'not-checked-in'
        })
    ]);

    return { checkedIn, checkedOut, notCheckedIn, total: checkedIn + checkedOut + notCheckedIn };
}

async function getMonthlyAttendanceStats(startDate, endDate) {
    const totalDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
    const totalRecords = await Attendance.countDocuments({
        date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate attendance percentage for this month
    const totalUsers = await User.countDocuments({ isApproved: true });
    const attendedUsers = await Attendance.distinct('userId', {
        date: { $gte: startDate, $lte: endDate },
        status: { $in: ['checked-in', 'checked-out'] }
    });
    
    const attendancePercentage = totalUsers > 0 ? Math.round((attendedUsers.length / totalUsers) * 100) : 0;
    
    const avgAttendancePerDay = totalDays > 0 ? Math.round((totalRecords / totalDays) * 100) / 100 : 0;
    
    return {
        totalRecords,
        totalDays,
        avgAttendancePerDay,
        attendancePercentage,
        attendedUsers: attendedUsers.length,
        totalUsers
    };
}

async function getVoucherTrends(currentStart, prevStart) {
    const currentEnd = new Date(currentStart);
    currentEnd.setMonth(currentEnd.getMonth() + 1);
    
    const prevEnd = new Date(prevStart);
    prevEnd.setMonth(prevEnd.getMonth() + 1);
    
    const [currentCount, prevCount] = await Promise.all([
        Voucher.countDocuments({
            isDeleted: { $ne: true },
            createdAt: { $gte: currentStart, $lt: currentEnd }
        }),
        Voucher.countDocuments({
            isDeleted: { $ne: true },
            createdAt: { $gte: prevStart, $lt: prevEnd }
        })
    ]);

    const growth = prevCount > 0 ? ((currentCount - prevCount) / prevCount) * 100 : 0;
    
    return { current: currentCount, previous: prevCount, growth: Math.round(growth * 100) / 100 };
}

// Optimized function using single aggregation instead of 12 queries
async function getMonthlyTrendsOptimized(year) {
    const results = await Voucher.aggregate([
        {
            $match: {
                isDeleted: { $ne: true },
                createdAt: {
                    $gte: new Date(year, 0, 1),
                    $lte: new Date(year, 11, 31, 23, 59, 59, 999)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                vouchers: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
            }
        },
        {
            $sort: { '_id': 1 }
        }
    ]);
    
    // Fill in missing months with zero values
    const trends = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let month = 1; month <= 12; month++) {
        const result = results.find(r => r._id === month);
        trends.push({
            month: monthNames[month - 1],
            vouchers: result ? result.vouchers : 0,
            revenue: result ? result.revenue : 0
        });
    }
    
    return trends;
}

// Optimized function using single aggregation instead of 12 queries
async function getMonthlyArrivalTrendsOptimized(year) {
    const results = await Voucher.aggregate([
        {
            $match: {
                isDeleted: { $ne: true },
                arrivalDate: {
                    $gte: new Date(year, 0, 1),
                    $lte: new Date(year, 11, 31, 23, 59, 59, 999)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$arrivalDate' },
                arrivals: { $sum: 1 }
            }
        },
        {
            $sort: { '_id': 1 }
        }
    ]);
    
    // Fill in missing months with zero values
    const trends = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let month = 1; month <= 12; month++) {
        const result = results.find(r => r._id === month);
        trends.push({
            month: monthNames[month - 1],
            arrivals: result ? result.arrivals : 0
        });
    }
    
    return trends;
}

async function getRevenueByMonth(year) {
    return Voucher.aggregate([
        {
            $match: {
                isDeleted: { $ne: true },
                createdAt: {
                    $gte: new Date(year, 0, 1),
                    $lte: new Date(year, 11, 31, 23, 59, 59, 999)
                }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    currency: '$currency'
                },
                revenue: { $sum: '$totalAmount' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.month': 1 }
        }
    ]);
}

function calculateTotalByCurrency(data, primaryCurrency = 'USD') {
    if (!data || data.length === 0) return 0;
    
    const primaryData = data.find(item => item._id === primaryCurrency);
    return primaryData ? primaryData.totalRevenue || primaryData.totalAmount || 0 : 0;
}

function formatCurrencyData(data) {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
        currency: item._id || 'USD',
        amount: Math.round((item.totalAmount || item.totalRevenue || 0) * 100) / 100,
        count: item.count || 0
    })).sort((a, b) => b.amount - a.amount);
}

async function getMonthlyProfitData(year) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get all available currencies
    const currencies = await Voucher.distinct('currency', { 
        isDeleted: { $ne: true },
        createdAt: { 
            $gte: new Date(year, 0, 1), 
            $lte: new Date(year, 11, 31, 23, 59, 59, 999) 
        }
    });
    
    // Ensure USD is included and filter out null/undefined
    const validCurrencies = [...new Set([...currencies.filter(c => c), 'USD'])];
    
    // OPTIMIZATION: Fetch ALL vouchers for the year at once instead of 12 separate queries per currency
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
    
    // Get all vouchers for the year with all necessary fields
    const allVouchers = await Voucher.find({
        isDeleted: { $ne: true },
        createdAt: { $gte: yearStart, $lte: yearEnd }
    }).select('totalAmount currency createdAt payments hotels transfers flights trips');
    
    const monthlyProfitData = [];
    
    for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
        
        const monthData = {
            month: monthNames[month],
            monthNumber: month + 1,
            year: year,
            currencies: {}
        };
        
        // Calculate for each currency
        for (const currency of validCurrencies) {
            // Filter vouchers for this month and currency from the pre-fetched data
            const currencyVouchers = allVouchers.filter(voucher => {
                const voucherDate = new Date(voucher.createdAt);
                const voucherCurrency = voucher.currency || 'USD';
                const matchesCurrency = currency === 'USD' ? 
                    (voucherCurrency === 'USD' || !voucherCurrency) : 
                    voucherCurrency === currency;
                
                return voucherDate >= monthStart && 
                       voucherDate <= monthEnd && 
                       matchesCurrency;
            });
            
            // Calculate client revenue (totalAmount from vouchers)
            const clientRevenue = currencyVouchers.reduce((total, voucher) => total + (voucher.totalAmount || 0), 0);
            
            // Calculate supplier costs from voucher payments - EXACT SAME LOGIC
            let supplierCosts = 0;
            
            currencyVouchers.forEach(voucher => {
                // Process old payments structure
                if (voucher.payments) {
                    Object.keys(voucher.payments).forEach(paymentType => {
                        const payment = voucher.payments[paymentType];
                        if (payment.officeName && payment.price > 0) {
                            supplierCosts += payment.price;
                        }
                    });
                }
                
                // Process new structure - individual service payments
                ['hotels', 'transfers', 'flights'].forEach(serviceType => {
                    if (voucher[serviceType] && Array.isArray(voucher[serviceType])) {
                        voucher[serviceType].forEach(service => {
                            if (service.officeName && service.price > 0) {
                                supplierCosts += service.price;
                            }
                        });
                    }
                });
                
                // Process trips
                if (voucher.trips && Array.isArray(voucher.trips)) {
                    voucher.trips.forEach(trip => {
                        if (trip.officeName && trip.price > 0) {
                            supplierCosts += trip.price;
                        }
                    });
                }
            });
            
            // Calculate profit (clientRevenue - supplierCosts) - EXACT SAME LOGIC
            const profit = clientRevenue - supplierCosts;
            const profitMargin = clientRevenue > 0 ? (profit / clientRevenue) * 100 : 0;
            
            monthData.currencies[currency] = {
                clientRevenue: Math.round(clientRevenue * 100) / 100,
                supplierCosts: Math.round(supplierCosts * 100) / 100,
                profit: Math.round(profit * 100) / 100,
                profitMargin: Math.round(profitMargin * 100) / 100,
                voucherCount: currencyVouchers.length
            };
        }
        
        monthlyProfitData.push(monthData);
    }
    
    return monthlyProfitData;
}

async function getRecentLeaveStats(monthStart, monthEnd) {
    try {
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Get current active leaves (approved leaves happening today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        const [
            monthlyLeaves,
            monthlyLeavesList,
            currentActiveLeaves,
            leavesByType,
            usersOnLeaveToday
        ] = await Promise.all([
            // Leaves this month
            UserLeave.countDocuments({
                status: 'approved',
                $or: [
                    {
                        leaveCategory: 'multiple-day',
                        startDate: { $lte: monthEnd },
                        endDate: { $gte: monthStart }
                    },
                    {
                        leaveCategory: { $in: ['single-day', 'hourly'] },
                        date: { $gte: monthStart, $lte: monthEnd }
                    }
                ]
            }),
            
            // Monthly leaves (this month)
            UserLeave.find({
                status: 'approved',
                $or: [
                    {
                        leaveCategory: 'multiple-day',
                        startDate: { $lte: monthEnd },
                        endDate: { $gte: monthStart }
                    },
                    {
                        leaveCategory: { $in: ['single-day', 'hourly'] },
                        date: { $gte: monthStart, $lte: monthEnd }
                    }
                ]
            })
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
            
            // Users currently on leave (today)
            UserLeave.find({
                status: 'approved',
                $or: [
                    {
                        leaveCategory: 'multiple-day',
                        startDate: { $lte: todayEnd },
                        endDate: { $gte: today }
                    },
                    {
                        leaveCategory: { $in: ['single-day', 'hourly'] },
                        date: { $gte: today, $lte: todayEnd }
                    }
                ]
            })
            .populate('userId', 'username email')
            .lean(),
            
            // Leave types breakdown this month
            UserLeave.aggregate([
                {
                    $match: {
                        status: 'approved',
                        $or: [
                            {
                                leaveCategory: 'multiple-day',
                                startDate: { $lte: monthEnd },
                                endDate: { $gte: monthStart }
                            },
                            {
                                leaveCategory: { $in: ['single-day', 'hourly'] },
                                date: { $gte: monthStart, $lte: monthEnd }
                            }
                        ]
                    }
                },
                {
                    $group: {
                        _id: '$leaveType',
                        count: { $sum: 1 },
                        totalDays: { $sum: '$daysCount' }
                    }
                }
            ]),
            
            // Get unique users on leave today
            UserLeave.distinct('userId', {
                status: 'approved',
                $or: [
                    {
                        leaveCategory: 'multiple-day',
                        startDate: { $lte: todayEnd },
                        endDate: { $gte: today }
                    },
                    {
                        leaveCategory: { $in: ['single-day', 'hourly'] },
                        date: { $gte: today, $lte: todayEnd }
                    }
                ]
            })
        ]);
        
        return {
            monthlyCount: monthlyLeaves,
            monthlyLeaves: monthlyLeavesList,
            activeToday: currentActiveLeaves.length,
            usersOnLeaveToday: usersOnLeaveToday.length,
            leavesByType: leavesByType.reduce((acc, item) => {
                acc[item._id] = {
                    count: item.count,
                    totalDays: item.totalDays
                };
                return acc;
            }, {}),
            currentActiveLeaves
        };
    } catch (error) {
        console.error('Error getting leave stats:', error);
        return {
            monthlyCount: 0,
            monthlyLeaves: [],
            activeToday: 0,
            usersOnLeaveToday: 0,
            leavesByType: {},
            currentActiveLeaves: []
        };
    }
}

module.exports = exports;
