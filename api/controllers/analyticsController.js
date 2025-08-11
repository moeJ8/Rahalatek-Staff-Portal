const Voucher = require('../models/Voucher');
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
