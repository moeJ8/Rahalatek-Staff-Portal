const Voucher = require('../models/Voucher');
const OfficePayment = require('../models/OfficePayment');
const Debt = require('../models/Debt');
const User = require('../models/User');
const EmailService = require('./emailService');

class MonthlyFinancialSummaryService {
    
    /**
     * Generate monthly financial summary data for a specific month
     */
    static async generateMonthlySummaryData(year, month) {
        try {
            console.log(`📊 Generating financial summary for ${year}-${month.toString().padStart(2, '0')}`);
            
            // Set date range for the month
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            
            // 1. GET VOUCHER STATISTICS
            const voucherStats = await this.getVoucherStatistics(startDate, endDate);
            
            // 2. GET OFFICE SERVICES COSTS (supplier payments)
            const servicesCosts = await this.getServicesCostsByOffice(startDate, endDate);
            
            // 3. GET CLIENT REVENUE
            const clientRevenue = await this.getClientRevenue(startDate, endDate);
            
            // 4. GET DEBT STATISTICS (closures this month)
            const debtStats = await this.getDebtStatistics(startDate, endDate);
            
            // 5. CALCULATE PROFIT FROM VOUCHERS DIRECTLY 
            const profitByCurrency = this.calculateVoucherProfitByCurrency(voucherStats);
            
            // 6. GET PREVIOUS MONTH'S PROFIT FOR COMPARISON
            const previousMonthProfit = await this.getPreviousMonthProfit(year, month);
            const profitComparison = this.calculateProfitComparison(profitByCurrency, previousMonthProfit);
            
            return {
                period: {
                    year,
                    month,
                    monthName: startDate.toLocaleString('en-US', { month: 'long' }),
                    startDate,
                    endDate
                },
                vouchers: voucherStats,
                servicesCosts,
                clientRevenue,
                profit: profitByCurrency,
                profitComparison,
                debts: debtStats,
                generatedAt: new Date()
            };
            
        } catch (error) {
            console.error('❌ Error generating monthly summary data:', error);
            throw error;
        }
    }
    
    /**
     * Get voucher creation statistics for the month
     */
    static async getVoucherStatistics(startDate, endDate) {
        const vouchers = await Voucher.find({
            createdAt: { $gte: startDate, $lte: endDate },
            isDeleted: { $ne: true }
        });
        
        const stats = {
            totalCreated: vouchers.length,
            byStatus: {
                await: 0,
                arrived: 0,
                canceled: 0
            },
            byCurrency: {},
            byCreator: {},
            profitByCurrency: {} // Add profit tracking by currency
        };
        
        vouchers.forEach(voucher => {
            // Count by status
            stats.byStatus[voucher.status] = (stats.byStatus[voucher.status] || 0) + 1;
            
            // Count by currency
            const currency = voucher.currency || 'USD';
            if (!stats.byCurrency[currency]) {
                stats.byCurrency[currency] = { count: 0, totalAmount: 0 };
            }
            stats.byCurrency[currency].count++;
            stats.byCurrency[currency].totalAmount += voucher.totalAmount || 0;
            
            // Calculate profit from vouchers (totalAmount - capital)
            const totalAmount = parseFloat(voucher.totalAmount) || 0;
            const capital = parseFloat(voucher.capital) || 0;
            const profit = capital > 0 ? totalAmount - capital : 0; // Only calculate profit if capital is specified
            
            if (!stats.profitByCurrency[currency]) {
                stats.profitByCurrency[currency] = { 
                    totalProfit: 0, 
                    vouchersWithProfit: 0,
                    totalRevenue: 0
                };
            }
            stats.profitByCurrency[currency].totalProfit += profit;
            stats.profitByCurrency[currency].totalRevenue += totalAmount;
            if (capital > 0) {
                stats.profitByCurrency[currency].vouchersWithProfit++;
            }
            
            // Count by creator (for admin visibility)
            const creatorId = voucher.createdBy.toString();
            stats.byCreator[creatorId] = (stats.byCreator[creatorId] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * Get services costs aggregated by office from voucher payments
     */
    static async getServicesCostsByOffice(startDate, endDate) {
        const vouchers = await Voucher.find({
            createdAt: { $gte: startDate, $lte: endDate },
            isDeleted: { $ne: true }
        });
        
        const officesCosts = {};
        
        vouchers.forEach(voucher => {
            const currency = voucher.currency || 'USD';
            
            // Process old payments structure
            if (voucher.payments) {
                Object.keys(voucher.payments).forEach(paymentType => {
                    const payment = voucher.payments[paymentType];
                    if (payment.officeName && payment.price > 0) {
                        this.addOfficeCost(officesCosts, payment.officeName, currency, payment.price);
                    }
                });
            }
            
            // Process new structure - individual service payments
            ['hotels', 'transfers', 'flights'].forEach(serviceType => {
                if (voucher[serviceType] && Array.isArray(voucher[serviceType])) {
                    voucher[serviceType].forEach(service => {
                        if (service.officeName && service.price > 0) {
                            this.addOfficeCost(officesCosts, service.officeName, currency, service.price);
                        }
                    });
                }
            });
            
            // Process trips (mixed structure)
            if (voucher.trips && Array.isArray(voucher.trips)) {
                voucher.trips.forEach(trip => {
                    if (trip.officeName && trip.price > 0) {
                        this.addOfficeCost(officesCosts, trip.officeName, currency, trip.price);
                    }
                });
            }
        });
        
        // Convert to array and sort by total cost
        return Object.keys(officesCosts).map(officeName => ({
            officeName,
            ...officesCosts[officeName],
            totalCost: Object.values(officesCosts[officeName].byCurrency).reduce((sum, cost) => sum + cost, 0)
        })).sort((a, b) => b.totalCost - a.totalCost);
    }
    
    /**
     * Helper method to add office cost
     */
    static addOfficeCost(officesCosts, officeName, currency, amount) {
        if (!officesCosts[officeName]) {
            officesCosts[officeName] = {
                byCurrency: {},
                totalCost: 0
            };
        }
        
        if (!officesCosts[officeName].byCurrency[currency]) {
            officesCosts[officeName].byCurrency[currency] = 0;
        }
        
        officesCosts[officeName].byCurrency[currency] += amount;
        officesCosts[officeName].totalCost += amount;
    }
    
    /**
     * Get client revenue aggregated by currency
     */
    static async getClientRevenue(startDate, endDate) {
        const result = await Voucher.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    isDeleted: { $ne: true },
                    totalAmount: { $exists: true, $ne: null, $gt: 0 }
                }
            },
            {
                $group: {
                    _id: '$currency',
                    totalRevenue: { $sum: '$totalAmount' },
                    voucherCount: { $sum: 1 },
                    averageVoucher: { $avg: '$totalAmount' }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);
        
        return result.map(item => ({
            currency: item._id || 'USD',
            totalRevenue: Math.round(item.totalRevenue * 100) / 100,
            voucherCount: item.voucherCount,
            averageVoucher: Math.round(item.averageVoucher * 100) / 100
        }));
    }
    
    /**
     * Calculate profit directly from voucher data (totalAmount - capital)
     */
    static calculateVoucherProfitByCurrency(voucherStats) {
        const profitData = [];
        
        // Convert voucher profit data to the expected format
        Object.keys(voucherStats.profitByCurrency).forEach(currency => {
            const currencyData = voucherStats.profitByCurrency[currency];
            const profitMargin = currencyData.totalRevenue > 0 
                ? Math.round((currencyData.totalProfit / currencyData.totalRevenue) * 100 * 100) / 100
                : 0;
            
            profitData.push({
                currency,
                revenue: Math.round(currencyData.totalRevenue * 100) / 100,
                costs: Math.round((currencyData.totalRevenue - currencyData.totalProfit) * 100) / 100, // Calculated costs
                profit: Math.round(currencyData.totalProfit * 100) / 100,
                profitMargin,
                vouchersWithProfit: currencyData.vouchersWithProfit
            });
        });
        
        // Sort by profit (highest first)
        profitData.sort((a, b) => b.profit - a.profit);
        
        // If no profit data exists, return a default entry
        if (profitData.length === 0) {
            profitData.push({
                currency: 'USD',
                revenue: 0,
                costs: 0,
                profit: 0,
                profitMargin: 0,
                vouchersWithProfit: 0
            });
        }
        
        return profitData;
    }

    /**
     * Calculate profit by currency (revenue - costs) - Legacy method for service costs
     */
    static calculateProfitByCurrency(clientRevenue, servicesCosts) {
        const profitByCurrency = {};
        
        // Initialize with revenue data
        clientRevenue.forEach(revenue => {
            profitByCurrency[revenue.currency] = {
                currency: revenue.currency,
                revenue: revenue.totalRevenue,
                costs: 0,
                profit: revenue.totalRevenue,
                profitMargin: 100 // Default 100% if no costs
            };
        });
        
        // Subtract costs
        servicesCosts.forEach(office => {
            Object.keys(office.byCurrency).forEach(currency => {
                if (!profitByCurrency[currency]) {
                    profitByCurrency[currency] = {
                        currency,
                        revenue: 0,
                        costs: office.byCurrency[currency],
                        profit: -office.byCurrency[currency],
                        profitMargin: -100 // Loss if no revenue
                    };
                } else {
                    profitByCurrency[currency].costs += office.byCurrency[currency];
                    profitByCurrency[currency].profit = profitByCurrency[currency].revenue - profitByCurrency[currency].costs;
                    profitByCurrency[currency].profitMargin = profitByCurrency[currency].revenue > 0 
                        ? Math.round((profitByCurrency[currency].profit / profitByCurrency[currency].revenue) * 100 * 100) / 100
                        : -100;
                }
            });
        });
        
        // Round values and convert to array
        return Object.values(profitByCurrency).map(item => ({
            ...item,
            revenue: Math.round(item.revenue * 100) / 100,
            costs: Math.round(item.costs * 100) / 100,
            profit: Math.round(item.profit * 100) / 100
        })).sort((a, b) => b.profit - a.profit);
    }
    
    /**
     * Get debt statistics for the month
     */
    static async getDebtStatistics(startDate, endDate) {
        // Debts closed this month
        const closedDebts = await Debt.find({
            closedDate: { $gte: startDate, $lte: endDate },
            status: 'CLOSED'
        }).populate('closedBy', 'username');
        
        // New debts created this month
        const newDebts = await Debt.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });
        
        // Aggregate closed debts by currency and type
        const closedStats = {
            totalClosed: closedDebts.length,
            byCurrency: {},
            byType: {
                OWED_TO_OFFICE: 0,
                OWED_FROM_OFFICE: 0
            },
            closedValue: 0
        };
        
        closedDebts.forEach(debt => {
            const currency = debt.currency || 'USD';
            if (!closedStats.byCurrency[currency]) {
                closedStats.byCurrency[currency] = { count: 0, amount: 0 };
            }
            
            closedStats.byCurrency[currency].count++;
            closedStats.byCurrency[currency].amount += debt.amount;
            closedStats.byType[debt.type]++;
            closedStats.closedValue += debt.amount;
        });
        
        return {
            closed: closedStats,
            newDebtsCreated: newDebts.length,
            totalNewDebtValue: newDebts.reduce((sum, debt) => sum + debt.amount, 0)
        };
    }
    
    /**
     * Generate and send monthly financial summary emails to admins and accountants
     */
    static async generateMonthlyFinancialEmails(year = null, month = null) {
        try {
            // Default to previous month if not specified
            const now = new Date();
            const targetYear = year || (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
            const targetMonth = month || (now.getMonth() === 0 ? 12 : now.getMonth());
            
            // Generate financial summary data
            const summaryData = await this.generateMonthlySummaryData(targetYear, targetMonth);
            
            // Get admin and accountant users with verified emails
            const targetUsers = await User.find({
                $or: [{ isAdmin: true }, { isAccountant: true }],
                email: { $exists: true, $ne: null, $ne: '' },
                isEmailVerified: true,
                isApproved: true
            });
            
            if (targetUsers.length === 0) {
                return [];
            }
            
            // Send emails to all target users
            const emailsSent = [];
            for (const user of targetUsers) {
                try {
                    await EmailService.sendMonthlyFinancialSummaryEmail(user, summaryData);
                    emailsSent.push({
                        userId: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.isAdmin ? 'Admin' : 'Accountant'
                    });
                } catch (emailError) {
                    console.error(`❌ Error sending financial summary to ${user.email}:`, emailError);
                    // Continue with other users even if one fails
                }
            }
            return emailsSent;
            
        } catch (error) {
            console.error('❌ Error generating monthly financial emails:', error);
            throw error;
        }
    }

    /**
     * Get previous month's profit data for comparison
     */
    static async getPreviousMonthProfit(currentYear, currentMonth) {
        try {
            // Calculate previous month
            let prevYear = currentYear;
            let prevMonth = currentMonth - 1;
            
            if (prevMonth === 0) {
                prevMonth = 12;
                prevYear = currentYear - 1;
            }
            
            // Set date range for previous month
            const startDate = new Date(prevYear, prevMonth - 1, 1);
            const endDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);
            
            // Get previous month's voucher statistics
            const prevVoucherStats = await this.getVoucherStatistics(startDate, endDate);
            const prevProfitByCurrency = this.calculateVoucherProfitByCurrency(prevVoucherStats);
            
            return {
                year: prevYear,
                month: prevMonth,
                monthName: startDate.toLocaleString('en-US', { month: 'long' }),
                profit: prevProfitByCurrency
            };
            
        } catch (error) {
            console.error('❌ Error getting previous month profit:', error);
            return null;
        }
    }

    /**
     * Calculate profit comparison between current and previous month
     */
    static calculateProfitComparison(currentProfit, previousMonthData) {
        if (!previousMonthData || !previousMonthData.profit) {
            return {
                previousMonth: null,
                comparisons: []
            };
        }

        const comparisons = [];
        
        // Create comparison for each currency in current month
        currentProfit.forEach(current => {
            const previous = previousMonthData.profit.find(p => p.currency === current.currency);
            
            if (previous && previous.profit !== 0) {
                // Calculate percentage change
                const percentageChange = Math.round(((current.profit - previous.profit) / Math.abs(previous.profit)) * 100 * 100) / 100;
                
                comparisons.push({
                    currency: current.currency,
                    currentProfit: current.profit,
                    previousProfit: previous.profit,
                    change: current.profit - previous.profit,
                    percentageChange,
                    trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no_change'
                });
            } else {
                // New currency or previous month had no profit
                comparisons.push({
                    currency: current.currency,
                    currentProfit: current.profit,
                    previousProfit: 0,
                    change: current.profit,
                    percentageChange: current.profit > 0 ? 100 : 0,
                    trend: current.profit > 0 ? 'increase' : 'no_change'
                });
            }
        });

        return {
            previousMonth: {
                monthName: previousMonthData.monthName,
                year: previousMonthData.year
            },
            comparisons
        };
    }
}

module.exports = MonthlyFinancialSummaryService;
