import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaChartLine, 
    FaUsers, 
    FaTicketAlt, 
    FaDollarSign, 
    FaBuilding, 
    FaPlane, 
    FaHotel, 
    FaMapMarkedAlt,
    FaUserClock,
    FaFileInvoiceDollar,
    FaExclamationTriangle,
    FaBell,
    FaCalendarAlt,
    FaCalendarPlus,
    FaArrowUp,
    FaArrowDown,
    FaMinus,
    FaSpinner,
    FaClock,
    FaCheckCircle,
    FaTimes,
    FaEye,
    FaUserCheck,
    FaUserTimes,
    FaMoneyBillWave,
    FaExternalLinkAlt,
    FaPlus,

} from 'react-icons/fa';
import axios from 'axios';
import RahalatekLoader from '../RahalatekLoader';
import CustomButton from '../CustomButton';
import CustomScrollbar from '../CustomScrollbar';
import ProfitChart from '../ProfitChart';
import VoucherTrendChart from '../VoucherTrendChart';
import MonthlyArrivalChart from '../MonthlyArrivalChart';
import CustomTooltip from '../CustomTooltip';
import Select from '../Select';
import UpcomingEventsWidget from '../UpcomingEventsWidget';
import LeaveVacationWidget from '../LeaveVacationWidget';
import ActiveVouchersModal from '../ActiveVouchersModal';

export default function Dashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attendanceTooltip, setAttendanceTooltip] = useState({ visible: false, x: 0, y: 0 });
    const [verifiedEmailsTooltip, setVerifiedEmailsTooltip] = useState({ visible: false, x: 0, y: 0 });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [showActiveVouchersModal, setShowActiveVouchersModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardAnalytics();
    }, []);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        
        checkDarkMode();
        
        // Watch for theme changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        return () => observer.disconnect();
    }, []);

    const fetchDashboardAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('/api/analytics/dashboard-analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setAnalytics(response.data);
        } catch (err) {
            console.error('Error fetching dashboard analytics:', err);
            setError('Failed to load dashboard analytics');
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return <FaArrowUp className="w-3 h-3 text-green-500 dark:text-green-400" />;
        if (trend < 0) return <FaArrowDown className="w-3 h-3 text-red-500 dark:text-red-400" />;
        return <FaMinus className="w-3 h-3 text-gray-500 dark:text-gray-400" />;
    };

    const formatCurrency = (amount, currency = 'USD') => {
        const symbols = { USD: '$', EUR: '€', TRY: '₺' };
        return `${symbols[currency] || '$'}${Number(amount).toLocaleString()}`;
    };

    const formatPercentage = (percentage) => {
        return `${percentage.toFixed(1)}%`;
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const itemDate = new Date(date);
        const diffInMinutes = Math.floor((now - itemDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    // Get available currencies from chart data
    const availableCurrencies = React.useMemo(() => {
        if (!analytics?.charts?.monthlyProfitChart) return [{ value: 'USD', label: 'USD' }];
        
        const currencies = new Set();
        analytics.charts.monthlyProfitChart.forEach(monthData => {
            if (monthData.currencies) {
                Object.keys(monthData.currencies).forEach(currency => {
                    const currencyData = monthData.currencies[currency];
                    if (currencyData && (currencyData.clientRevenue > 0 || currencyData.voucherCount > 0)) {
                        currencies.add(currency);
                    }
                });
            }
        });
        
        // Custom sort order: USD, EUR, TRY, then others alphabetically
        const customOrder = ['USD', 'EUR', 'TRY'];
        const currencyArray = Array.from(currencies);
        
        const sortedCurrencies = currencyArray.sort((a, b) => {
            const aIndex = customOrder.indexOf(a);
            const bIndex = customOrder.indexOf(b);
            
            // If both are in custom order, sort by their position
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
            // If only a is in custom order, it comes first
            if (aIndex !== -1) return -1;
            // If only b is in custom order, it comes first
            if (bIndex !== -1) return 1;
            // If neither is in custom order, sort alphabetically
            return a.localeCompare(b);
        });
        
        return sortedCurrencies.map(currency => ({
            value: currency,
            label: currency
        }));
    }, [analytics]);

    // Set default currency when data loads
    React.useEffect(() => {
        if (availableCurrencies.length > 0 && !availableCurrencies.find(c => c.value === selectedCurrency)) {
            setSelectedCurrency(availableCurrencies[0].value);
        }
    }, [availableCurrencies, selectedCurrency]);

    // Get current month data for selected currency
    const getCurrentMonthData = () => {
        if (!analytics?.charts?.monthlyProfitChart) return { revenue: 0, costs: 0, profit: 0 };
        
        const currentMonth = new Date().getMonth() + 1;
        const currentMonthData = analytics.charts.monthlyProfitChart.find(
            data => data.monthNumber === currentMonth
        );
        
        if (!currentMonthData?.currencies?.[selectedCurrency]) {
            return { revenue: 0, costs: 0, profit: 0 };
        }
        
        const currencyData = currentMonthData.currencies[selectedCurrency];
        return {
            revenue: currencyData.clientRevenue || 0,
            costs: currencyData.supplierCosts || 0,
            profit: currencyData.profit || 0
        };
    };

    const currentMonthData = getCurrentMonthData();

    // Calculate revenue growth for selected currency
    const getRevenueGrowth = () => {
        if (!analytics?.charts?.monthlyProfitChart) return 0;
        
        const currentMonth = new Date().getMonth() + 1;
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const previousYear = currentMonth === 1 ? new Date().getFullYear() - 1 : new Date().getFullYear();
        
        const currentMonthData = analytics.charts.monthlyProfitChart.find(
            data => data.monthNumber === currentMonth && data.year === new Date().getFullYear()
        );
        
        const previousMonthData = analytics.charts.monthlyProfitChart.find(
            data => data.monthNumber === previousMonth && data.year === previousYear
        );
        
        const currentRevenue = currentMonthData?.currencies?.[selectedCurrency]?.clientRevenue || 0;
        const previousRevenue = previousMonthData?.currencies?.[selectedCurrency]?.clientRevenue || 0;
        
        if (previousRevenue === 0) return 0;
        
        return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    };

    const revenueGrowth = getRevenueGrowth();

    // Calculate profit growth for selected currency
    const getProfitGrowth = () => {
        if (!analytics?.charts?.monthlyProfitChart) return 0;
        
        const currentMonth = new Date().getMonth() + 1;
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const previousYear = currentMonth === 1 ? new Date().getFullYear() - 1 : new Date().getFullYear();
        
        const currentMonthData = analytics.charts.monthlyProfitChart.find(
            data => data.monthNumber === currentMonth && data.year === new Date().getFullYear()
        );
        
        const previousMonthData = analytics.charts.monthlyProfitChart.find(
            data => data.monthNumber === previousMonth && data.year === previousYear
        );
        
        const currentProfit = currentMonthData?.currencies?.[selectedCurrency]?.profit || 0;
        const previousProfit = previousMonthData?.currencies?.[selectedCurrency]?.profit || 0;
        
        if (previousProfit === 0) return 0;
        
        return ((currentProfit - previousProfit) / previousProfit) * 100;
    };

    const profitGrowth = getProfitGrowth();

    // Get currency symbol
    const getCurrencySymbol = (currency) => {
        const symbols = { USD: '$', EUR: '€', TRY: '₺', GBP: '£' };
        return symbols[currency] || currency + ' ';
    };

    // Attendance tooltip handlers
    const handleAttendanceMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setAttendanceTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };

    const handleAttendanceMouseLeave = () => {
        setAttendanceTooltip({ visible: false, x: 0, y: 0 });
    };

    // Verified emails tooltip handlers
    const handleVerifiedEmailsMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setVerifiedEmailsTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };

    const handleVerifiedEmailsMouseLeave = () => {
        setVerifiedEmailsTooltip({ visible: false, x: 0, y: 0 });
    };

    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-slate-950 min-h-screen flex items-center justify-center">
                <RahalatekLoader size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 dark:bg-slate-950 min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm p-8">
                        <div className="text-center">
                            <FaExclamationTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                            <CustomButton
                                onClick={fetchDashboardAnalytics}
                                variant="blue"
                                size="md"
                                icon={FaSpinner}
                            >
                                Try Again
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-slate-950 min-h-screen">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
                        <FaChartLine className="mr-2 sm:mr-3 text-blue-600 dark:text-teal-400 w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="hidden sm:inline">Dashboard Overview</span>
                        <span className="sm:hidden">Dashboard</span>
                    </h1>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
                    {/* Financial Overview Widget */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
                            {/* Header */}
                            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div 
                                        className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl cursor-pointer hover:bg-blue-200 dark:hover:bg-teal-800/50 transition-colors"
                                        onClick={() => navigate('/dashboard?tab=financials')}
                                    >
                                        <FaChartLine className="text-blue-600 dark:text-teal-400 text-base sm:text-lg" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                                        <span className="hidden sm:inline">Financial Overview</span>
                                        <span className="sm:hidden">Financial</span>
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {/* Currency Selector */}
                                    {availableCurrencies.length > 1 && (
                                        <div className="w-22 sm:w-24">
                                            <Select
                                                options={availableCurrencies}
                                                value={selectedCurrency}
                                                onChange={setSelectedCurrency}
                                                placeholder="Currency"
                                                className="text-xs sm:text-sm"
                                            />
                                        </div>
                                    )}
                                    <Link 
                                        to="/dashboard?tab=financials"
                                        className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl hover:bg-blue-200 dark:hover:bg-teal-800/50 transition-colors"
                                        title="View financial reports"
                                    >
                                        <FaExternalLinkAlt className="text-blue-600 dark:text-teal-400 text-xs sm:text-sm" />
                                    </Link>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-6 flex-1 space-y-4 sm:space-y-6">
                                {/* Financial Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    {/* Revenue */}
                                    <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-200">
                                        <div className="p-1.5 sm:p-3 bg-green-100 dark:bg-green-800/50 rounded-full mr-2 sm:mr-4">
                                            <FaDollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Revenue</p>
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <p className="text-base sm:text-2xl font-bold text-green-900 dark:text-green-100 truncate">
                                            {getCurrencySymbol(selectedCurrency)}{currentMonthData.revenue.toLocaleString()}
                                        </p>
                                        {revenueGrowth !== 0 && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                {getTrendIcon(revenueGrowth)}
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatPercentage(Math.abs(revenueGrowth))}
                                                </span>
                                            </div>
                                        )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Costs */}
                                    <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl border border-red-200 dark:border-red-700 hover:shadow-lg transition-all duration-200">
                                        <div className="p-1.5 sm:p-3 bg-red-100 dark:bg-red-800/50 rounded-full mr-2 sm:mr-4">
                                            <FaMoneyBillWave className="w-4 h-4 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Costs</p>
                                            <p className="text-base sm:text-2xl font-bold text-red-900 dark:text-red-100 truncate">
                                            {getCurrencySymbol(selectedCurrency)}{currentMonthData.costs.toLocaleString()}
                                        </p>
                                        </div>
                                    </div>
                                    
                                    {/* Net Profit */}
                                    <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-200">
                                        <div className="p-1.5 sm:p-3 bg-blue-100 dark:bg-blue-800/50 rounded-full mr-2 sm:mr-4">
                                            <FaChartLine className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Net Profit</p>
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <p className="text-base sm:text-2xl font-bold text-blue-900 dark:text-blue-100 truncate">
                                            {getCurrencySymbol(selectedCurrency)}{currentMonthData.profit.toLocaleString()}
                                        </p>
                                        {profitGrowth !== 0 && (
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                {getTrendIcon(profitGrowth)}
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatPercentage(Math.abs(profitGrowth))}
                                                </span>
                                            </div>
                                        )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly Profit Chart */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <span className="hidden sm:inline">Monthly Profit Trend</span>
                                                <span className="sm:hidden">Profit Trend</span>
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                <span className="hidden sm:inline">Profit progression for {new Date().getFullYear()}</span>
                                                <span className="sm:hidden">{new Date().getFullYear()}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{new Date().getFullYear()}</p>
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        {analytics?.charts?.monthlyProfitChart ? (
                                            <ProfitChart 
                                                monthlyProfitData={analytics.charts.monthlyProfitChart}
                                                isDarkMode={isDarkMode}
                                                selectedCurrency={selectedCurrency}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <FaChartLine className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">No profit data available</p>
                                                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                                        Chart will appear as data becomes available
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Entities Overview */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
                            {/* Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
                                        <FaBuilding className="text-blue-600 dark:text-teal-400 text-lg" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">System Entities</h3>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                <FaHotel className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Hotels</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{analytics?.inventory?.hotels || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <FaMapMarkedAlt className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Tours</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{analytics?.inventory?.tours || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <FaBuilding className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Offices</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{analytics?.inventory?.offices || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                                <FaPlane className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Airports</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{analytics?.inventory?.airports || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* System Health Indicators */}
                                <div className="space-y-3 mt-6">
                                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">System Health</h4>
                                    
                                    <div 
                                        className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-help"
                                        onMouseEnter={handleAttendanceMouseEnter}
                                        onMouseLeave={handleAttendanceMouseLeave}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <FaUserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Today's Attendance</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {analytics?.attendance?.today?.total || 0}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                                <FaUserClock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Attendance Percentage</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {analytics?.attendance?.monthlyStats?.attendancePercentage !== undefined ? `${analytics.attendance.monthlyStats.attendancePercentage}%` : 'N/A'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                                <FaUserTimes className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {analytics?.users?.pending || 0}
                                        </span>
                                    </div>

                                    <div 
                                        className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-help"
                                        onMouseEnter={handleVerifiedEmailsMouseEnter}
                                        onMouseLeave={handleVerifiedEmailsMouseLeave}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Verified Emails</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {analytics?.users?.verifiedEmails || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Recent Vouchers */}
                    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
                                    <FaTicketAlt className="text-blue-600 dark:text-teal-400 text-lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Vouchers</h3>
                            </div>
                            <Link 
                                to="/vouchers"
                                className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl hover:bg-blue-200 dark:hover:bg-teal-800/50 transition-colors"
                                title="View all vouchers"
                            >
                                <FaExternalLinkAlt className="text-blue-600 dark:text-teal-400 text-sm" />
                            </Link>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 flex-1">
                            {!analytics?.recentActivity?.vouchers || analytics.recentActivity.vouchers.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaTicketAlt className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">No recent vouchers</p>
                                </div>
                            ) : (
                                <CustomScrollbar maxHeight="350px">
                                    <div className="space-y-3">
                                        {analytics.recentActivity.vouchers.map((voucher) => (
                                            <div key={voucher._id} className="flex items-center justify-between p-1.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                        <FaTicketAlt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                                #{voucher.voucherNumber}
                                                            </span>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                {voucher.clientName}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatCurrency(voucher.totalAmount, voucher.currency)} • {formatTimeAgo(voucher.createdAt)}
                                                            {voucher.createdBy && (
                                                                <>
                                                                    {' • Created by '}
                                                                    <Link 
                                                                        to={`/profile/${voucher.createdBy._id}`}
                                                                        className="text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-300 hover:underline transition-colors"
                                                                        title="View creator profile"
                                                                    >
                                                                        {voucher.createdBy.username}
                                                                    </Link>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link to={`/vouchers/${voucher._id}`}>
                                                    <CustomButton variant="teal" size="xs" icon={FaEye} />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </CustomScrollbar>
                            )}
                        </div>
                    </div>

                    {/* Voucher Status Overview */}
                    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
                        {/* Header */}
                        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
                                    <FaTicketAlt className="text-blue-600 dark:text-teal-400 text-base sm:text-lg" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                                    <span className="hidden sm:inline">Voucher Status Overview</span>
                                    <span className="sm:hidden">Voucher Status</span>
                                </h3>
                            </div>
                            <Link 
                                to="/vouchers"
                                className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl hover:bg-blue-200 dark:hover:bg-teal-800/50 transition-colors"
                                title="View all vouchers"
                            >
                                <FaExternalLinkAlt className="text-blue-600 dark:text-teal-400 text-xs sm:text-sm" />
                            </Link>
                        </div>

                        {/* Content */}
                        <div className="p-3 sm:p-6 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 h-full">
                                {/* Total Vouchers */}
                                <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-200">
                                    <div className="p-1.5 sm:p-3 bg-blue-100 dark:bg-blue-800/50 rounded-full mr-2 sm:mr-4">
                                        <FaTicketAlt className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Total Vouchers</p>
                                        <p className="text-base sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {analytics?.overview?.totalVouchers || 0}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Active (Await) - Clickable */}
                                <button
                                    onClick={() => setShowActiveVouchersModal(true)}
                                    className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-700 hover:shadow-lg transition-all duration-200 cursor-pointer hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/40 dark:hover:to-yellow-700/40 w-full text-left"
                                    title="Click to view active vouchers"
                                >
                                    <div className="p-1.5 sm:p-3 bg-yellow-100 dark:bg-yellow-800/50 rounded-full mr-2 sm:mr-4">
                                        <FaClock className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300 text-left">Active (Await)</p>
                                        <p className="text-base sm:text-2xl font-bold text-yellow-900 dark:text-yellow-100 text-left">
                                            {analytics?.overview?.activeVouchers || 0}
                                        </p>
                                    </div>
                                </button>
                                
                                {/* Arrived */}
                                <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-200">
                                    <div className="p-1.5 sm:p-3 bg-green-100 dark:bg-green-800/50 rounded-full mr-2 sm:mr-4">
                                        <FaCheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Arrived</p>
                                        <p className="text-base sm:text-2xl font-bold text-green-900 dark:text-green-100">
                                            {analytics?.overview?.arrivedVouchers || 0}
                                        </p>
                                                </div>
                                            </div>
                                
                                {/* Cancelled */}
                                <div className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl border border-red-200 dark:border-red-700 hover:shadow-lg transition-all duration-200">
                                    <div className="p-1.5 sm:p-3 bg-red-100 dark:bg-red-800/50 rounded-full mr-2 sm:mr-4">
                                        <FaTimes className="w-4 h-4 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Cancelled</p>
                                        <p className="text-base sm:text-2xl font-bold text-red-900 dark:text-red-100">
                                            {analytics?.overview?.cancelledVouchers || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Created This Month - Full Width */}
                                <div className="col-span-2 flex items-center p-2 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-200">
                                    <div className="p-1.5 sm:p-3 bg-purple-100 dark:bg-purple-800/50 rounded-full mr-2 sm:mr-4">
                                        <FaPlus className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Created This Month</p>
                                        <p className="text-base sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {analytics?.overview?.monthlyVouchers || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Trends Charts - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Voucher Trends Widget */}
                    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
                                    <FaTicketAlt className="text-blue-600 dark:text-teal-400 text-lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Monthly Voucher Trends</h3>
                            </div>
                        </div>

                        {/* Chart Content */}
                        <div className="flex-1 p-6">
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Voucher Trends</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Vouchers created throughout {new Date().getFullYear()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{new Date().getFullYear()}</p>
                                    </div>
                                </div>
                                <div className="h-64">
                                    {analytics?.charts?.monthlyTrends && analytics.charts.monthlyTrends.length > 0 ? (
                                        <VoucherTrendChart 
                                            monthlyTrends={analytics.charts.monthlyTrends}
                                            isDarkMode={isDarkMode}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <FaTicketAlt className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">No voucher data available</p>
                                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                                    Chart will appear as data becomes available
                                                </p>
                                            </div>
                                        </div>
                                                        )}
                                                    </div>
                                                        </div>
                                                        </div>
                                                    </div>

                    {/* Monthly Arrival Trends Widget */}
                    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
                                    <FaCalendarAlt className="text-blue-600 dark:text-teal-400 text-lg" />
                                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Monthly Arrival Trends</h3>
                                            </div>
                                    </div>
                            
                        {/* Chart Content */}
                        <div className="flex-1 p-6">
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Arrival Trends</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Voucher arrivals throughout {new Date().getFullYear()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{new Date().getFullYear()}</p>
                                    </div>
                                </div>
                                <div className="h-64">
                                    {analytics?.charts?.monthlyArrivalTrends && analytics.charts.monthlyArrivalTrends.length > 0 ? (
                                        <MonthlyArrivalChart 
                                            monthlyArrivalTrends={analytics.charts.monthlyArrivalTrends}
                                            isDarkMode={isDarkMode}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <FaCalendarAlt className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">No arrival data available</p>
                                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                                    Chart will appear as data becomes available
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debt Management and Upcoming Events - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Debt Management Widget */}
                    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
                                    <FaMoneyBillWave className="text-blue-600 dark:text-teal-400 text-base sm:text-lg" />
                            </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                                    <span className="hidden sm:inline">Debt Management</span>
                                    <span className="sm:hidden">Debts</span>
                                </h3>
                        </div>
                            <Link 
                                to="/dashboard?tab=debts" 
                                className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl hover:bg-blue-200 dark:hover:bg-teal-800/50 transition-colors"
                                title="View all debts"
                            >
                                <FaExternalLinkAlt className="text-blue-600 dark:text-teal-400 text-xs sm:text-sm" />
                            </Link>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Total Open Debts */}
                                <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Total Open</p>
                                            <p className="text-base sm:text-2xl font-bold text-red-900 dark:text-red-100">
                                                {analytics?.debts?.totalOpen || 0}
                                            </p>
                                        </div>
                                        <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-800/50 rounded-lg flex-shrink-0">
                                            <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                    </div>
                            </div>
                            
                                {/* Owed To Office */}
                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-3 sm:p-4 border border-orange-200 dark:border-orange-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">We Owe</p>
                                            <p className="text-base sm:text-2xl font-bold text-orange-900 dark:text-orange-100">
                                                {analytics?.debts?.owedToOffice || 0}
                                            </p>
                                        </div>
                                        <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-800/50 rounded-lg flex-shrink-0">
                                            <FaArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    </div>
                            </div>
                            
                                {/* Owed From Office */}
                                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">They Owe</p>
                                            <p className="text-base sm:text-2xl font-bold text-green-900 dark:text-green-100">
                                                {analytics?.debts?.owedFromOffice || 0}
                                            </p>
                                        </div>
                                        <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-800/50 rounded-lg flex-shrink-0">
                                            <FaArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                            </div>
                            
                                {/* Closed This Month */}
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Closed This Month</p>
                                            <p className="text-base sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                {analytics?.debts?.closedThisMonth || 0}
                                </p>
                            </div>
                                        <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex-shrink-0">
                                            <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events Widget */}
                    <UpcomingEventsWidget />
                </div>

                {/* Users and Leave Widgets - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Users Overview */}
                    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
                        {/* Header */}
                        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
                                    <FaUsers className="text-blue-600 dark:text-teal-400 text-base sm:text-lg" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                                    <span className="hidden sm:inline">Users Overview</span>
                                    <span className="sm:hidden">Users</span>
                                </h3>
                            </div>
                            <Link 
                                to="/dashboard?tab=users"
                                className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl hover:bg-blue-200 dark:hover:bg-teal-800/50 transition-colors"
                                title="View all users"
                            >
                                <FaExternalLinkAlt className="text-blue-600 dark:text-teal-400 text-xs sm:text-sm" />
                            </Link>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 flex-1">
                            {!analytics?.recentActivity?.users || analytics.recentActivity.users.length === 0 ? (
                                <div className="text-center py-6 sm:py-8">
                                    <FaUsers className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">No users found</p>
                                </div>
                            ) : (
                                <CustomScrollbar maxHeight="500px">
                                    <div className="space-y-2 sm:space-y-3">
                                        {analytics.recentActivity.users.sort((a, b) => {
                                            // Sort by role priority: Admin (4) > Accountant (3) > Content Manager (2) > User (1)
                                            const getRolePriority = (user) => {
                                                if (user.isAdmin) return 4;
                                                if (user.isAccountant) return 3;
                                                if (user.isContentManager) return 2;
                                                return 1;
                                            };
                                            return getRolePriority(b) - getRolePriority(a);
                                        }).map((user) => {
                                            // Determine user role
                                            const getUserRole = (user) => {
                                                if (user.isAdmin) return { 
                                                    role: 'Admin', 
                                                    mobileRole: 'Admin',
                                                    color: 'bg-blue-800 text-white border border-blue-800 shadow-md' 
                                                };
                                                if (user.isAccountant) return { 
                                                    role: 'Accountant', 
                                                    mobileRole: 'Acc',
                                                    color: 'bg-green-500 text-white border border-green-600 shadow-md' 
                                                };
                                                if (user.isContentManager) return { 
                                                    role: 'Manager', 
                                                    mobileRole: 'Mgr',
                                                    color: 'bg-yellow-500 text-white border border-yellow-600 shadow-md' 
                                                };
                                                return { 
                                                    role: 'User', 
                                                    mobileRole: 'User',
                                                    color: 'bg-gray-500 text-white border border-gray-600 shadow-md' 
                                                };
                                            };

                                            const roleInfo = getUserRole(user);
                                            const hasSalary = user.salaryAmount && user.salaryCurrency;

                                            return (
                                                <div key={user._id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                                                <Link 
                                                                    to={`/profile/${user._id}`}
                                                                    className="font-medium text-sm sm:text-base text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-300 hover:underline transition-colors truncate"
                                                                    title="View user profile"
                                                                >
                                                                    {user.username}
                                                                </Link>
                                                                <span className={`inline-flex items-center justify-center rounded-lg text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg w-12 sm:w-16 min-w-12 sm:min-w-16 ${roleInfo.color}`}>
                                                                    <span className="sm:hidden">{roleInfo.mobileRole}</span>
                                                                    <span className="hidden sm:inline">{roleInfo.role}</span>
                                                                </span>
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        {hasSalary ? (
                                                            <div>
                                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                                                    {getCurrencySymbol(user.salaryCurrency)}{user.salaryAmount.toLocaleString()}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                                                                    per month
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                                                                    No salary
                                                                </p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                    set
                                                                </p>
                                                            </div>
                                                        )}
            </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CustomScrollbar>
                            )}
                        </div>
                    </div>

                    {/* Leave & Vacation Widget */}
                    <LeaveVacationWidget analytics={analytics} />
                </div>

            </div>

                {/* Custom Attendance Tooltip */}
                {attendanceTooltip.visible && (
                    <div
                        className="fixed bg-white/30 dark:bg-slate-950/30 text-gray-900 dark:text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap border border-gray-200 dark:border-gray-700 backdrop-blur-md z-[9999]"
                        style={{
                            left: Math.min(Math.max(attendanceTooltip.x, 5), window.innerWidth - 200),
                            top: attendanceTooltip.y,
                            transform: 'translate(-50%, -100%)',
                            fontSize: '11px',
                            lineHeight: '1.2'
                        }}
                    >
                        <div className="font-medium">Today's Attendance</div>
                        <div className="opacity-75">{analytics?.attendance?.today?.total || 0} users have attended today</div>
                        <div className="opacity-60">Checked in: {analytics?.attendance?.today?.checkedIn || 0} | Checked out: {analytics?.attendance?.today?.checkedOut || 0}</div>
                    </div>
                )}

                {/* Custom Verified Emails Tooltip */}
                {verifiedEmailsTooltip.visible && (
                    <div
                        className="fixed bg-white/30 dark:bg-slate-950/30 text-gray-900 dark:text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap border border-gray-200 dark:border-gray-700 backdrop-blur-md z-[9999]"
                        style={{
                            left: Math.min(Math.max(verifiedEmailsTooltip.x, 5), window.innerWidth - 200),
                            top: verifiedEmailsTooltip.y,
                            transform: 'translate(-50%, -100%)',
                            fontSize: '11px',
                            lineHeight: '1.2'
                        }}
                    >
                        <div className="font-medium">Verified Emails</div>
                        <div className="opacity-75">{analytics?.users?.verifiedEmails || 0} users have verified their email addresses</div>
                        <div className="opacity-60">Verification rate: {analytics?.users?.approved ? Math.round(((analytics?.users?.verifiedEmails || 0) / analytics.users.approved) * 100) : 0}% of approved users</div>
                    </div>
                )}

            {/* Active Vouchers Modal */}
            <ActiveVouchersModal 
                show={showActiveVouchersModal}
                onClose={() => setShowActiveVouchersModal(false)}
            />
        </div>
    );
}