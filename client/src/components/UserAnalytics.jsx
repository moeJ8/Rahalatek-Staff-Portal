import React, { useState, useEffect } from 'react';
import { Card } from 'flowbite-react';
import Select from './Select';
import { 
    HiDocumentText, 
    HiClock, 
    HiCheckCircle, 
    HiXCircle, 
    HiCurrencyDollar,
    HiTrendingUp,
    HiTrendingDown,
    HiCalendar,
    HiChartBar,
    HiFilter,
    HiCash
} from 'react-icons/hi';
import axios from 'axios';
import RahalatekLoader from './RahalatekLoader';
import toast from 'react-hot-toast';

const getCurrencySymbol = (currency) => {
    const symbols = {
        USD: '$',
        EUR: '€',
        TRY: '₺'
    };
    return symbols[currency] || '$';
};

const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(number * 100) / 100);
};

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </span>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm ${
                            trend.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                            {trend.value >= 0 ? <HiTrendingUp className="w-4 h-4" /> : <HiTrendingDown className="w-4 h-4" />}
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                )}
            </div>
        </div>
    </Card>
);

const CurrencyBreakdown = ({ revenueByCurrency, profitByCurrency }) => {
    // Create a combined dataset with all currencies from both revenue and profit
    const allCurrencies = [...new Set([
        ...revenueByCurrency.map(item => item.currency),
        ...profitByCurrency.map(item => item.currency)
    ])];

    const combinedData = allCurrencies.map(currency => {
        const revenueData = revenueByCurrency.find(item => item.currency === currency) || { amount: 0, percentage: 0 };
        const profitData = profitByCurrency.find(item => item.currency === currency) || { amount: 0, percentage: 0 };
        
        return {
            currency,
            revenue: revenueData.amount,
            revenuePercentage: revenueData.percentage,
            profit: profitData.amount,
            profitPercentage: profitData.percentage
        };
    }).sort((a, b) => b.revenue - a.revenue); // Sort by revenue (highest first)

    return (
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <HiCurrencyDollar className="w-5 h-5" />
                    Revenue & Profit by Currency
                </h3>
            </div>
            <div className="space-y-4">
                {combinedData.map(({ currency, revenue, revenuePercentage, profit, profitPercentage }) => (
                    <div key={currency} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {currency}
                                </span>
                            </div>
                        </div>
                        
                        {/* Revenue Row */}
                        <div className="flex items-center justify-between mb-1 ml-6">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {getCurrencySymbol(currency)}{formatNumber(revenue)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {revenuePercentage}%
                                </div>
                            </div>
                        </div>
                        
                        {/* Profit Row */}
                        <div className="flex items-center justify-between ml-6">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Profit</span>
                            <div className="text-right">
                                <div className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {getCurrencySymbol(currency)}{formatNumber(profit)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {profitPercentage}%
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const MonthlyChart = ({ monthlyData, title, dataKey, color }) => {
    const [animateBars, setAnimateBars] = useState(false);
    useEffect(() => {
        setAnimateBars(false);
        const t = setTimeout(() => setAnimateBars(true), 60);
        return () => clearTimeout(t);
    }, [monthlyData, dataKey]);

    return (
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <HiChartBar className="w-5 h-5" />
                    {title}
                </h3>
            </div>
            <div className="space-y-2">
                {monthlyData.map((data, index) => {
                    const maxValue = Math.max(...monthlyData.map(d => d[dataKey]));
                    const percentage = maxValue > 0 ? (data[dataKey] / maxValue) * 100 : 0;
                    
                    return (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-8 text-xs text-gray-600 dark:text-gray-400">
                                {data.month}
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${color} transition-[width] duration-700 ease-out will-change-[width]`}
                                        style={{ width: animateBars ? `${percentage}%` : '0%' }}
                                    />
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                                    {dataKey === 'revenue' ? formatNumber(data[dataKey]) : data[dataKey]}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default function UserAnalytics({ userId }) {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('ALL');

    useEffect(() => {
        if (userId) {
            fetchAnalytics();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    useEffect(() => {
        if (userId && selectedYear) {
            fetchAnalytics(selectedYear, selectedCurrency);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear]);

    useEffect(() => {
        if (userId && selectedYear && selectedCurrency) {
            fetchAnalytics(selectedYear, selectedCurrency);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCurrency]);

    const fetchAnalytics = async (year = '', currency = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (currency) params.append('currency', currency);
            
            const url = `/api/analytics/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await axios.get(url);
            setAnalytics(response.data);
            
            // Set the selected year if it wasn't already set
            if (!selectedYear && response.data.selectedYear) {
                setSelectedYear(response.data.selectedYear.toString());
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load analytics');
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleYearChange = (event) => {
        const year = event.target.value;
        setSelectedYear(year);
    };

    const handleCurrencyChange = (value) => {
        setSelectedCurrency(value);
    };

    // Fetch monthly data filtered by currency
    const [monthlyData, setMonthlyData] = useState(null);
    const [monthlyLoading, setMonthlyLoading] = useState(false);
    
    // Fetch financial data filtered by currency
    const [filteredFinancialData, setFilteredFinancialData] = useState(null);

    // eslint-disable-next-line no-unused-vars
    const fetchFilteredData = async (currency = 'ALL') => {
        if (!analytics?.selectedYear) return;
        
        try {
            setMonthlyLoading(true);
            
            const params = new URLSearchParams();
            params.append('year', analytics.selectedYear);
            if (currency !== 'ALL') {
                params.append('currency', currency);
            }
            
            const response = await axios.get(`/api/analytics/user/${userId}?${params.toString()}`);
            
            // Set both monthly and financial data
            setMonthlyData(response.data.monthly);
            setFilteredFinancialData(response.data);
        } catch (err) {
            console.error('Error fetching filtered data:', err);
            // Fallback to original data
            setMonthlyData(analytics?.monthly);
            setFilteredFinancialData(null);
        } finally {
            setMonthlyLoading(false);
        }
    };

    // Note: Currency filtering is now handled by fetchAnalytics API call

    if (loading) {
        return (
            <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center py-12">
                    <RahalatekLoader size="lg" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700">
                <div className="text-center py-12">
                    <HiXCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Failed to Load Analytics
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </Card>
        );
    }

    if (!analytics) {
        return null;
    }

    const { overview, revenue, profit, monthly, performance } = analytics;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <HiChartBar className="w-6 h-6" />
                        Analytics Overview
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Performance metrics and insights for voucher management
                        {analytics?.selectedYear && (
                            <span className="block text-sm mt-1">
                                Showing data for {analytics.selectedYear}
                            </span>
                        )}
                    </p>
                </div>
                
                {/* Year Filter */}
                {analytics?.availableYears && analytics.availableYears.length > 1 && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <HiFilter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</span>
                        </div>
                        <Select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="min-w-[100px]"
                            sizing="sm"
                        >
                            {analytics.availableYears.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Vouchers"
                    value={overview.totalVouchers}
                    icon={HiDocumentText}
                    color="bg-blue-500"
                    trend={performance.growth.vouchers !== 0 ? { value: performance.growth.vouchers } : null}
                />
                <StatCard
                    title="Active Vouchers"
                    value={overview.activeVouchers}
                    icon={HiClock}
                    color="bg-orange-500"
                    subtitle="Awaiting arrival"
                />
                <StatCard
                    title="Completed Vouchers"
                    value={overview.completedVouchers}
                    icon={HiCheckCircle}
                    color="bg-green-500"
                    subtitle="Successfully arrived"
                />
                <StatCard
                    title="Cancelled Vouchers"
                    value={overview.cancelledVouchers}
                    icon={HiXCircle}
                    color="bg-red-500"
                    subtitle="Cancelled bookings"
                />
            </div>

            {/* Currency Filter for Financial Stats */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Overview</h3>
                {analytics?.availableCurrencies && analytics.availableCurrencies.length > 1 && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <HiCurrencyDollar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency:</span>
                        </div>
                        <Select
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            options={[
                                { value: 'ALL', label: 'All Currencies' },
                                ...analytics.availableCurrencies.map(currency => ({
                                    value: currency,
                                    label: currency === 'USD' ? '$ USD' : 
                                           currency === 'EUR' ? '€ EUR' : 
                                           currency === 'TRY' ? '₺ TRY' : currency
                                }))
                            ]}
                            className="min-w-[140px]"
                        />
                    </div>
                )}
            </div>

            {/* Revenue & Profit Stats - 2x2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={selectedCurrency === 'ALL' ? 
                        <span className="flex items-center gap-1"><HiCash className="w-5 h-5 text-green-600" />{formatNumber((filteredFinancialData?.revenue?.total) || revenue.total)}</span> :
                        `${selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'TRY' ? '₺' : '$'}${formatNumber((filteredFinancialData?.revenue?.total) || revenue.total)}`
                    }
                    icon={HiCurrencyDollar}
                    color="bg-emerald-500"
                    trend={performance.growth.revenue !== 0 ? { value: performance.growth.revenue } : null}
                />
                <StatCard
                    title="This Month Revenue"
                    value={selectedCurrency === 'ALL' ? 
                        <span className="flex items-center gap-1"><HiCash className="w-5 h-5 text-green-600" />{formatNumber((filteredFinancialData?.performance?.thisMonth?.revenue) || performance.thisMonth.revenue)}</span> :
                        `${selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'TRY' ? '₺' : '$'}${formatNumber((filteredFinancialData?.performance?.thisMonth?.revenue) || performance.thisMonth.revenue)}`
                    }
                    icon={HiCalendar}
                    color="bg-cyan-500"
                    subtitle={`${(filteredFinancialData?.performance?.thisMonth?.vouchers) || performance.thisMonth.vouchers} vouchers`}
                />
            </div>

            {/* Profit Stats - same row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <StatCard
                    title="Total Profit"
                    value={selectedCurrency === 'ALL' ? 
                        <span className="flex items-center gap-1"><HiCash className="w-5 h-5 text-green-600" />{formatNumber((filteredFinancialData?.profit?.total) || profit.total)}</span> :
                        `${selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'TRY' ? '₺' : '$'}${formatNumber((filteredFinancialData?.profit?.total) || profit.total)}`
                    }
                    icon={HiCash}
                    color="bg-green-500"
                    trend={performance.growth.profit !== 0 ? { value: performance.growth.profit } : null}
                />
                <StatCard
                    title="This Month Profit"
                    value={selectedCurrency === 'ALL' ? 
                        <span className="flex items-center gap-1"><HiCash className="w-5 h-5 text-green-600" />{formatNumber((filteredFinancialData?.performance?.thisMonth?.profit) || performance.thisMonth.profit)}</span> :
                        `${selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'TRY' ? '₺' : '$'}${formatNumber((filteredFinancialData?.performance?.thisMonth?.profit) || performance.thisMonth.profit)}`
                    }
                    icon={HiCalendar}
                    color="bg-indigo-500"
                    subtitle={`${(filteredFinancialData?.performance?.thisMonth?.vouchers) || performance.thisMonth.vouchers} vouchers`}
                />
            </div>

            {/* Charts and Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CurrencyBreakdown 
                    revenueByCurrency={revenue.byCurrency} 
                    profitByCurrency={profit.byCurrency} 
                />
                
                <MonthlyChart
                    monthlyData={monthly.vouchers}
                    title="Monthly Voucher Count"
                    dataKey="count"
                    color="bg-blue-500"
                />
            </div>

            {/* Monthly Charts */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MonthlyChart
                        monthlyData={monthlyLoading ? [] : (monthlyData?.revenue || monthly.revenue)}
                        title={`Monthly Revenue${selectedCurrency !== 'ALL' ? ` (${selectedCurrency})` : ''}`}
                        dataKey="revenue"
                        color="bg-emerald-500"
                    />
                    
                    <MonthlyChart
                        monthlyData={monthlyLoading ? [] : (monthlyData?.profit || monthly.profit)}
                        title={`Monthly Profit${selectedCurrency !== 'ALL' ? ` (${selectedCurrency})` : ''}`}
                        dataKey="profit"
                        color="bg-green-500"
                    />
                </div>
            </div>

            {/* Summary Stats */}
            {(monthlyData || analytics.summary) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <HiTrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Most Active Month</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {monthlyLoading ? 'Loading...' : 
                                        `${(monthlyData?.vouchers || analytics.summary?.mostActiveMonth)?.month || 'None'} (${(monthlyData?.vouchers || analytics.summary?.mostActiveMonth)?.count || 0} vouchers)`
                                    }
                                </p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-lg">
                                <HiCurrencyDollar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Highest Revenue Month{selectedCurrency !== 'ALL' ? ` (${selectedCurrency})` : ''}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {monthlyLoading ? 'Loading...' : (() => {
                                        // Use filtered monthly data if available, otherwise fall back to original summary
                                        const monthlyRevenueData = monthlyData?.revenue || monthly.revenue;
                                        const highestRevenueData = monthlyRevenueData?.reduce((max, month) => 
                                            month.revenue > max.revenue ? month : max, { revenue: 0, month: 'None' }
                                        ) || analytics.summary?.highestRevenueMonth;
                                        
                                        const currencySymbol = selectedCurrency !== 'ALL' ? 
                                            (selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'TRY' ? '₺' : '$') : '';
                                        
                                        return `${highestRevenueData?.month || 'None'} (${currencySymbol}${formatNumber(highestRevenueData?.revenue || 0)})`;
                                    })()}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <HiCash className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Highest Profit Month{selectedCurrency !== 'ALL' ? ` (${selectedCurrency})` : ''}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {monthlyLoading ? 'Loading...' : (() => {
                                        // Use filtered monthly data if available, otherwise fall back to original summary
                                        const monthlyProfitData = monthlyData?.profit || monthly.profit;
                                        const highestProfitData = monthlyProfitData?.reduce((max, month) => 
                                            month.profit > max.profit ? month : max, { profit: 0, month: 'None' }
                                        ) || analytics.summary?.highestProfitMonth;
                                        
                                        const currencySymbol = selectedCurrency !== 'ALL' ? 
                                            (selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'TRY' ? '₺' : '$') : '';
                                        
                                        return `${highestProfitData?.month || 'None'} (${currencySymbol}${formatNumber(highestProfitData?.profit || 0)})`;
                                    })()}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
