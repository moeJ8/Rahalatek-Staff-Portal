const Voucher = require('../models/Voucher');
const OfficePayment = require('../models/OfficePayment');
const mongoose = require('mongoose');

// Get user analytics data
exports.getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        const { year, currency } = req.query; // Get year and currency from query parameters
        
        // Check if user has permission to view analytics
        if (!req.user.isAdmin && !req.user.isAccountant && req.user.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        // Get all vouchers created by this user (excluding deleted ones)
        const allUserVouchers = await Voucher.find({
            createdBy: userObjectId,
            isDeleted: { $ne: true }
        }).sort({ createdAt: -1 });

        // Get available years from the data
        const availableYears = [...new Set(allUserVouchers.map(voucher => 
            new Date(voucher.createdAt).getFullYear()
        ))].sort((a, b) => b - a); // Sort descending (newest first)

        // Get available currencies from the data for monthly filtering
        const availableCurrencies = [...new Set(allUserVouchers.map(voucher => 
            voucher.currency || 'USD'
        ))].sort();

        // Default to current year if no year specified, or latest available year if current year has no data
        const currentYear = new Date().getFullYear();
        const selectedYear = year && availableYears.includes(parseInt(year)) ? parseInt(year) : 
                           (availableYears.includes(currentYear) ? currentYear : 
                            (availableYears.length > 0 ? availableYears[0] : currentYear));

        // Filter vouchers by selected year
        let userVouchers = allUserVouchers.filter(voucher => 
            new Date(voucher.createdAt).getFullYear() === selectedYear
        );

        // Filter by currency if specific currency is selected (not 'ALL') for overview stats
        if (currency && currency !== 'ALL') {
            userVouchers = userVouchers.filter(voucher => 
                (voucher.currency || 'USD') === currency
            );
        }
        
        // Basic voucher counts
        const totalVouchers = userVouchers.length;
        const activeVouchers = userVouchers.filter(v => v.status === 'await').length;
        const completedVouchers = userVouchers.filter(v => v.status === 'arrived').length;
        const cancelledVouchers = userVouchers.filter(v => v.status === 'canceled').length;
        
        // Revenue calculations
        const totalRevenue = userVouchers.reduce((sum, voucher) => sum + (voucher.totalAmount || 0), 0);
        const averageVoucherValue = totalVouchers > 0 ? totalRevenue / totalVouchers : 0;
        
        // Profit calculations
        const totalProfit = userVouchers.reduce((sum, voucher) => {
            const capital = parseFloat(voucher.capital) || 0;
            const total = parseFloat(voucher.totalAmount) || 0;
            const profit = capital > 0 ? total - capital : 0;
            return sum + profit;
        }, 0);
        const averageProfit = totalVouchers > 0 ? totalProfit / totalVouchers : 0;
        
        // Revenue by currency
        const revenueByCurrency = userVouchers.reduce((acc, voucher) => {
            const currency = voucher.currency || 'USD';
            const amount = voucher.totalAmount || 0;
            acc[currency] = (acc[currency] || 0) + amount;
            return acc;
        }, {});

        // Profit by currency
        const profitByCurrency = userVouchers.reduce((acc, voucher) => {
            const currency = voucher.currency || 'USD';
            const capital = parseFloat(voucher.capital) || 0;
            const total = parseFloat(voucher.totalAmount) || 0;
            const profit = capital > 0 ? total - capital : 0;
            acc[currency] = (acc[currency] || 0) + profit;
            return acc;
        }, {});
        
        // Monthly analytics for the selected year
        const monthlyData = {};
        
        // Initialize all months for the selected year
        for (let month = 0; month < 12; month++) {
            // Use UTC date to match how voucher dates are processed
            const monthKey = new Date(Date.UTC(selectedYear, month, 1)).toISOString().substring(0, 7); // YYYY-MM format
            monthlyData[monthKey] = {
                count: 0,
                revenue: 0,
                profit: 0,
                monthName: new Date(Date.UTC(selectedYear, month, 1)).toLocaleDateString('en-US', { month: 'short' })
            };
        }
        
        // Calculate monthly data (vouchers are already filtered by year)
        userVouchers.forEach(voucher => {
            const voucherDate = new Date(voucher.createdAt);
            const monthKey = voucherDate.toISOString().substring(0, 7);
            if (monthlyData[monthKey]) {
                const capital = parseFloat(voucher.capital) || 0;
                const total = parseFloat(voucher.totalAmount) || 0;
                const profit = capital > 0 ? total - capital : 0;
                
                monthlyData[monthKey].count += 1;
                monthlyData[monthKey].revenue += voucher.totalAmount || 0;
                monthlyData[monthKey].profit += profit;
            }
        });
        
        // Convert monthly data to arrays for charts
        const monthlyVoucherCounts = Object.keys(monthlyData).sort().map(key => ({
            month: monthlyData[key].monthName,
            count: monthlyData[key].count,
            revenue: monthlyData[key].revenue,
            profit: monthlyData[key].profit
        }));

        // Monthly data is already filtered by currency since we applied currency filter to userVouchers
        const filteredMonthlyData = monthlyVoucherCounts;
        
        // Recent activity (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recentVouchers = userVouchers.filter(voucher => 
            new Date(voucher.createdAt) >= sixMonthsAgo
        );
        
        const recentRevenue = recentVouchers.reduce((sum, voucher) => sum + (voucher.totalAmount || 0), 0);
        
        // Performance metrics (current month vs last month within selected year)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYearActual = now.getFullYear();
        
        // For performance comparison, use current month/last month only if we're viewing current year
        // These calculations will automatically respect the currency filter since userVouchers is already filtered
        let thisMonthVouchers = [];
        let lastMonthVouchers = [];
        
        if (selectedYear === currentYearActual) {
            thisMonthVouchers = userVouchers.filter(voucher => {
                const voucherDate = new Date(voucher.createdAt);
                return voucherDate.getMonth() === currentMonth && 
                       voucherDate.getFullYear() === selectedYear;
            });
            
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? selectedYear - 1 : selectedYear;
            
            // Only get last month data if it's within the same year we're viewing
            if (lastMonthYear === selectedYear) {
                lastMonthVouchers = userVouchers.filter(voucher => {
                    const voucherDate = new Date(voucher.createdAt);
                    return voucherDate.getMonth() === lastMonth && 
                           voucherDate.getFullYear() === lastMonthYear;
                });
            }
        }
        
        const thisMonthRevenue = thisMonthVouchers.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
        const lastMonthRevenue = lastMonthVouchers.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
        
        // Calculate profit for current and last month
        const thisMonthProfit = thisMonthVouchers.reduce((sum, voucher) => {
            const capital = parseFloat(voucher.capital) || 0;
            const total = parseFloat(voucher.totalAmount) || 0;
            const profit = capital > 0 ? total - capital : 0;
            return sum + profit;
        }, 0);
        
        const lastMonthProfit = lastMonthVouchers.reduce((sum, voucher) => {
            const capital = parseFloat(voucher.capital) || 0;
            const total = parseFloat(voucher.totalAmount) || 0;
            const profit = capital > 0 ? total - capital : 0;
            return sum + profit;
        }, 0);
        
        // Calculate growth percentages
        const voucherGrowth = lastMonthVouchers.length > 0 
            ? ((thisMonthVouchers.length - lastMonthVouchers.length) / lastMonthVouchers.length) * 100 
            : 0;
            
        const revenueGrowth = lastMonthRevenue > 0 
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
            : 0;

        const profitGrowth = lastMonthProfit > 0 
            ? ((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100 
            : 0;
        
        const analytics = {
            selectedYear,
            availableYears,
            availableCurrencies,
            overview: {
                totalVouchers,
                activeVouchers,
                completedVouchers,
                cancelledVouchers,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                averageVoucherValue: Math.round(averageVoucherValue * 100) / 100,
                totalProfit: Math.round(totalProfit * 100) / 100,
                averageProfit: Math.round(averageProfit * 100) / 100
            },
            revenue: {
                total: Math.round(totalRevenue * 100) / 100,
                byCurrency: Object.keys(revenueByCurrency).map(currency => ({
                    currency,
                    amount: Math.round(revenueByCurrency[currency] * 100) / 100,
                    percentage: totalRevenue > 0 ? Math.round((revenueByCurrency[currency] / totalRevenue) * 100) : 0
                })).sort((a, b) => b.amount - a.amount),
                recent: Math.round(recentRevenue * 100) / 100
            },
            profit: {
                total: Math.round(totalProfit * 100) / 100,
                byCurrency: Object.keys(profitByCurrency).map(currency => ({
                    currency,
                    amount: Math.round(profitByCurrency[currency] * 100) / 100,
                    percentage: totalProfit > 0 ? Math.round((profitByCurrency[currency] / totalProfit) * 100) : 0
                })).sort((a, b) => b.amount - a.amount),
                average: Math.round(averageProfit * 100) / 100
            },
            monthly: {
                vouchers: filteredMonthlyData,
                revenue: filteredMonthlyData,
                profit: filteredMonthlyData
            },
            performance: {
                thisMonth: {
                    vouchers: thisMonthVouchers.length,
                    revenue: Math.round(thisMonthRevenue * 100) / 100,
                    profit: Math.round(thisMonthProfit * 100) / 100
                },
                lastMonth: {
                    vouchers: lastMonthVouchers.length,
                    revenue: Math.round(lastMonthRevenue * 100) / 100,
                    profit: Math.round(lastMonthProfit * 100) / 100
                },
                growth: {
                    vouchers: Math.round(voucherGrowth * 100) / 100,
                    revenue: Math.round(revenueGrowth * 100) / 100,
                    profit: Math.round(profitGrowth * 100) / 100
                }
            },
            summary: {
                mostActiveMonth: filteredMonthlyData.reduce((max, month) => 
                    month.count > max.count ? month : max, { count: 0, month: 'None' }
                ),
                highestRevenueMonth: filteredMonthlyData.reduce((max, month) => 
                    month.revenue > max.revenue ? month : max, { revenue: 0, month: 'None' }
                ),
                highestProfitMonth: filteredMonthlyData.reduce((max, month) => 
                    month.profit > max.profit ? month : max, { profit: 0, month: 'None' }
                )
            }
        };
        
        res.json(analytics);
        
    } catch (err) {
        console.error('Error fetching user analytics:', err);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const { userId, isAdmin, isAccountant } = req.user;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        // Start of current month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        let vouchersQuery = {
            isDeleted: { $ne: true }
        };
        
        // For regular users, only show their own vouchers
        if (!isAdmin && !isAccountant) {
            vouchersQuery.createdBy = new mongoose.Types.ObjectId(userId);
        }
        
        // Today's arrivals
        const todayArrivals = await Voucher.countDocuments({
            ...vouchersQuery,
            arrivalDate: {
                $gte: today,
                $lte: todayEnd
            }
        });
        
        // Today's departures
        const todayDepartures = await Voucher.countDocuments({
            ...vouchersQuery,
            departureDate: {
                $gte: today,
                $lte: todayEnd
            }
        });
        
        // Active vouchers (status: await only)
        const activeVouchers = await Voucher.countDocuments({
            ...vouchersQuery,
            status: 'await'
        });
        
        let stats = {
            todayArrivals,
            todayDepartures,
            activeVouchers
        };
        
        // Additional stats for admin/accountant
        if (isAdmin || isAccountant) {
            // This month's revenue by currency
            const monthlyRevenue = await Voucher.aggregate([
                {
                    $match: {
                        isDeleted: { $ne: true },
                        createdAt: { $gte: monthStart },
                        totalAmount: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: '$currency',
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { totalAmount: -1 }
                }
            ]);
            
            // Get main currency (highest revenue)
            const mainRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0] : null;
            stats.thisMonthRevenue = mainRevenue ? {
                amount: mainRevenue.totalAmount,
                currency: mainRevenue._id || 'USD',
                count: mainRevenue.count
            } : { amount: 0, currency: 'USD', count: 0 };

            // Calculate supplier costs from voucher payments (matching AdminPanel logic)
            const monthlyVouchers = await Voucher.find({
                isDeleted: { $ne: true },
                createdAt: { $gte: monthStart }
            });

            // Calculate supplier costs by aggregating payment data by currency
            const supplierCostsByCurrency = {};
            
            monthlyVouchers.forEach(voucher => {
                const currency = voucher.currency || 'USD';
                
                if (!supplierCostsByCurrency[currency]) {
                    supplierCostsByCurrency[currency] = 0;
                }
                
                // Sum all payment amounts from the old payments structure
                if (voucher.payments) {
                    Object.keys(voucher.payments).forEach(paymentType => {
                        const payment = voucher.payments[paymentType];
                        if (payment.officeName && payment.price > 0) {
                            supplierCostsByCurrency[currency] += payment.price;
                        }
                    });
                }
                
                // Sum individual service payments (new structure)
                ['hotels', 'transfers', 'flights'].forEach(serviceType => {
                    if (voucher[serviceType] && Array.isArray(voucher[serviceType])) {
                        voucher[serviceType].forEach(service => {
                            if (service.officeName && service.price > 0) {
                                supplierCostsByCurrency[currency] += service.price;
                            }
                        });
                    }
                });
                
                // Handle trips (mixed structure)
                if (voucher.trips && Array.isArray(voucher.trips)) {
                    voucher.trips.forEach(trip => {
                        if (trip.officeName && trip.price > 0) {
                            supplierCostsByCurrency[currency] += trip.price;
                        }
                    });
                }
            });

            // Get main currency supplier costs (same currency as revenue)
            const mainCurrency = mainRevenue ? mainRevenue._id || 'USD' : 'USD';
            const supplierCosts = supplierCostsByCurrency[mainCurrency] || 0;
            const clientRevenue = mainRevenue ? mainRevenue.totalAmount : 0;
            const profit = clientRevenue - supplierCosts;

            stats.thisMonthSupplierCosts = {
                amount: supplierCosts,
                currency: mainCurrency,
                count: mainRevenue ? mainRevenue.count : 0
            };

            stats.thisMonthProfit = {
                amount: profit,
                currency: mainCurrency,
                count: mainRevenue ? mainRevenue.count : 0
            };
            
            // Pending payments (vouchers without payment date)
            const pendingPayments = await Voucher.aggregate([
                {
                    $match: {
                        isDeleted: { $ne: true },
                        paymentDate: null,
                        status: { $in: ['await', 'arrived'] },
                        totalAmount: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: '$currency',
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { totalAmount: -1 }
                }
            ]);
            
            const mainPending = pendingPayments.length > 0 ? pendingPayments[0] : null;
            stats.pendingPayments = mainPending ? {
                amount: mainPending.totalAmount,
                currency: mainPending._id || 'USD',
                count: mainPending.count
            } : { amount: 0, currency: 'USD', count: 0 };
            
        } else {
            // For regular users, show their voucher count
            const myVouchers = await Voucher.countDocuments({
                createdBy: new mongoose.Types.ObjectId(userId),
                isDeleted: { $ne: true }
            });
            
            stats.myVouchers = myVouchers;
        }
        
        res.json(stats);
        
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};
