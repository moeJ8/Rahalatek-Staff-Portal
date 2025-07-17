import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Label, Alert, Table, TextInput } from 'flowbite-react';
import { HiArrowLeft, HiOfficeBuilding, HiX, HiSearch } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { getAllVouchers } from '../utils/voucherApi';
import RahalatekLoader from '../components/RahalatekLoader';
import CustomButton from '../components/CustomButton';
import SearchableSelect from '../components/SearchableSelect';
import PaymentManager from '../components/PaymentManager';
import CustomTable from '../components/CustomTable';
import CustomScrollbar from '../components/CustomScrollbar';
import OfficeFloatingTotalsPanel from '../components/OfficeFloatingTotalsPanel';
import ScrollToTop from '../components/ScrollToTop';

const OfficeDetailPage = () => {
    const { officeName, clientName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine if this is a direct client or office
    const isDirectClient = location.pathname.startsWith('/client/');
    const displayName = isDirectClient ? clientName : officeName;
    
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        month: (new Date().getMonth() + 1).toString(), // Current month
        year: new Date().getFullYear().toString(),
        currency: 'USD'
    });
    const [serviceTableSearch, setServiceTableSearch] = useState('');
    const [clientTableSearch, setClientTableSearch] = useState('');
    
    const getCurrencySymbol = (currency) => {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            AED: 'د.إ',
            SAR: 'ر.س',
            TRY: '₺',
            EGP: 'ج.م'
        };
        return symbols[currency] || currency;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    const fetchOfficeVouchers = async () => {
        setLoading(true);
        try {
            const response = await getAllVouchers();
            
            // Store all vouchers (will be filtered later for each table)
            setVouchers(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch office vouchers:', err);
            setError('Failed to fetch office vouchers');
            toast.error('Failed to fetch office vouchers');
        } finally {
            setLoading(false);
        }
    };
    


    // Calculate service payments for a voucher for this office
    const calculateServicePayments = (voucher) => {
        const payments = voucher.payments || {};
        const services = {
            hotels: 0,
            transfers: 0,
            trips: 0,
            flights: 0
        };
        
        // Calculate hotels
        if (payments.hotels?.officeName === officeName) {
            services.hotels = parseFloat(payments.hotels.price) || 0;
        }
        
        // Calculate transfers
        if (payments.transfers?.officeName === officeName) {
            services.transfers = parseFloat(payments.transfers.price) || 0;
        }
        
        // Calculate trips
        if (payments.trips?.officeName === officeName) {
            services.trips = parseFloat(payments.trips.price) || 0;
        }
        
        // Calculate flights
        if (payments.flights?.officeName === officeName) {
            services.flights = parseFloat(payments.flights.price) || 0;
        }
        
        services.total = services.hotels + services.transfers + services.trips + services.flights;
        
        return services;
    };
    
    // Get vouchers that have services for this office (for the services table)
    // Direct clients don't provide services, so return empty array for them
    const serviceVouchers = useMemo(() => {
        if (isDirectClient) return [];
        
        return vouchers.filter(voucher => {
            const payments = voucher.payments || {};
            const hasHotelPayment = payments.hotels?.officeName === displayName;
            const hasTransferPayment = payments.transfers?.officeName === displayName;
            const hasTripPayment = payments.trips?.officeName === displayName;
            const hasFlightPayment = payments.flights?.officeName === displayName;
            
            return hasHotelPayment || hasTransferPayment || hasTripPayment || hasFlightPayment;
        });
    }, [vouchers, displayName, isDirectClient]);

    // Filter service vouchers based on filters and search (for the services table)
    const filteredVouchers = useMemo(() => {
        return serviceVouchers.filter(voucher => {
            const voucherDate = new Date(voucher.createdAt);
            const voucherMonth = voucherDate.getMonth() + 1; // 1-based month
            const voucherYear = voucherDate.getFullYear();
            
            // Search filter
            if (serviceTableSearch.trim()) {
                const searchTerm = serviceTableSearch.toLowerCase();
                const voucherNumber = voucher.voucherNumber?.toString().toLowerCase() || '';
                const clientName = voucher.clientName?.toLowerCase() || '';
                
                if (!voucherNumber.includes(searchTerm) && !clientName.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Currency filter
            if (filters.currency && voucher.currency !== filters.currency) return false;
            
            // Year filter
            if (filters.year && voucherYear.toString() !== filters.year) return false;
            
            // Month filter - only apply if a specific month is selected (not "All Months")
            if (filters.month && typeof filters.month === 'string' && filters.month.trim() !== '') {
                if (voucherMonth.toString() !== filters.month) return false;
            }
            
            return true;
        });
    }, [serviceVouchers, filters, serviceTableSearch]);
    
    // Calculate payments received (from PaymentManager)
    const [paymentsReceived, setPaymentsReceived] = useState(0);
    const [voucherPayments, setVoucherPayments] = useState([]);
    
    const handlePaymentsChange = (payments) => {
        // OUTGOING payments = you paid the office (reduces what they owe you)
        // INCOMING payments = office paid you (but don't affect payment balance - just for services)
        // Only count approved OUTGOING payments in balance calculations
        const totalReceived = payments.reduce((total, payment) => {
            if (payment.status === 'approved' && payment.type === 'OUTGOING') {
                return total - payment.amount; // You paid the office
            }
            return total;
        }, 0);
        setPaymentsReceived(totalReceived);
        setVoucherPayments(payments);
    };

    // Get client vouchers that belong to this office/client with search functionality
    const getClientVouchers = useMemo(() => {
        // Filter vouchers based on whether this is a direct client or office
        return vouchers.filter(voucher => {
            // For direct clients: show vouchers with matching clientName and no officeName
            // For offices: show vouchers with matching officeName
            if (isDirectClient) {
                if (voucher.officeName || voucher.clientName !== displayName) return false;
            } else {
                if (voucher.officeName !== displayName) return false;
            }
            
            // Search filter
            if (clientTableSearch.trim()) {
                const searchTerm = clientTableSearch.toLowerCase();
                const voucherNumber = voucher.voucherNumber?.toString().toLowerCase() || '';
                const clientName = voucher.clientName?.toLowerCase() || '';
                
                if (!voucherNumber.includes(searchTerm) && !clientName.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Apply same filters as the main table
            const voucherDate = new Date(voucher.createdAt);
            const voucherMonth = voucherDate.getMonth() + 1;
            const voucherYear = voucherDate.getFullYear();
            
            // Currency filter
            if (filters.currency && voucher.currency !== filters.currency) return false;
            
            // Year filter
            if (filters.year && voucherYear.toString() !== filters.year) return false;
            
            // Month filter - only apply if a specific month is selected (not "All Months")
            if (filters.month && typeof filters.month === 'string' && filters.month.trim() !== '') {
                if (voucherMonth.toString() !== filters.month) return false;
            }
            
            return true;
        });
    }, [vouchers, filters, displayName, clientTableSearch, isDirectClient]);

    // Calculate client voucher details
    const calculateClientVoucherDetails = (voucher) => {
        if (!voucherPayments) return { totalPaid: 0, remaining: voucher.totalAmount };
        
        const voucherSpecificPayments = voucherPayments.filter(payment => {
            const relatedVoucherId = payment.relatedVoucher?._id || payment.relatedVoucher;
            return relatedVoucherId === voucher._id && payment.status === 'approved';
        });
        
        const totalPaid = voucherSpecificPayments.reduce((total, payment) => {
            if (payment.type === 'INCOMING') {
                return total + payment.amount;
            }
            return total;
        }, 0);
        
        const remaining = voucher.totalAmount - totalPaid;
        return { totalPaid, remaining };
    };

    // Calculate remaining balance for a specific voucher
    const calculateVoucherRemaining = (voucherId, servicesTotal) => {
        if (!voucherPayments) return servicesTotal; // Safety check
        
        const voucherSpecificPayments = voucherPayments.filter(payment => {
            // Handle both populated and unpopulated relatedVoucher
            const relatedVoucherId = payment.relatedVoucher?._id || payment.relatedVoucher;
            return relatedVoucherId === voucherId && payment.type === 'OUTGOING' && payment.status === 'approved';
        });
        
        const totalPaid = voucherSpecificPayments.reduce((total, payment) => {
            return total + payment.amount;
        }, 0);
        
        return servicesTotal - totalPaid;
    };

    // Calculate totals for filtered vouchers
    const totals = useMemo(() => {
        const baseTotal = filteredVouchers.reduce((acc, voucher) => {
            const services = calculateServicePayments(voucher);
            
            acc.hotels += services.hotels;
            acc.transfers += services.transfers;
            acc.trips += services.trips;
            acc.flights += services.flights;
            acc.servicesProvided += services.total; // What office is owed
            return acc;
        }, { 
            hotels: 0, 
            transfers: 0, 
            trips: 0, 
            flights: 0, 
            servicesProvided: 0, // What office is owed for services
            totalRemaining: 0, // Total remaining across all vouchers
            clientTotalAmount: 0, // Total amount from client vouchers
            clientTotalPaid: 0, // Total paid from client vouchers
            clientTotalRemaining: 0 // Total remaining from client vouchers
        });

        // Calculate total remaining across all vouchers
        baseTotal.totalRemaining = filteredVouchers.reduce((total, voucher) => {
            const services = calculateServicePayments(voucher);
            const remaining = calculateVoucherRemaining(voucher._id, services.total);
            return total + remaining;
        }, 0);

        // Calculate totals from client vouchers (vouchers that belong to this office)
        const clientTotals = getClientVouchers.reduce((acc, voucher) => {
            const details = calculateClientVoucherDetails(voucher);
            acc.clientTotalAmount += voucher.totalAmount;
            acc.clientTotalPaid += details.totalPaid;
            acc.clientTotalRemaining += details.remaining;
            return acc;
        }, { clientTotalAmount: 0, clientTotalPaid: 0, clientTotalRemaining: 0 });

        baseTotal.clientTotalAmount = clientTotals.clientTotalAmount;
        baseTotal.clientTotalPaid = clientTotals.clientTotalPaid;
        baseTotal.clientTotalRemaining = clientTotals.clientTotalRemaining;

        return baseTotal;
    }, [filteredVouchers, getClientVouchers, voucherPayments]);


    
    useEffect(() => {
        fetchOfficeVouchers();
    }, [displayName]);
    
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };
    
    const clearFilters = () => {
        setFilters({
            month: (new Date().getMonth() + 1).toString(), // Current month
            year: new Date().getFullYear().toString(),
            currency: 'USD'
        });
        setServiceTableSearch('');
        setClientTableSearch('');
    };
    
    const hasFiltersApplied = () => {
        const currentYear = new Date().getFullYear().toString();
        const currentMonth = (new Date().getMonth() + 1).toString();
        return filters.month !== currentMonth ||
               filters.year !== currentYear ||
               filters.currency !== 'USD' ||
               serviceTableSearch.trim() !== '' ||
               clientTableSearch.trim() !== '';
    };
    
    // Generate dynamic month options based on available data for selected year
    const monthOptions = useMemo(() => {
        const selectedYear = parseInt(filters.year);
        const dataMonths = [...new Set(
            vouchers
                .filter(voucher => {
                    const voucherDate = new Date(voucher.createdAt);
                    return voucherDate.getFullYear() === selectedYear;
                })
                .map(voucher => {
                    const voucherDate = new Date(voucher.createdAt);
                    return voucherDate.getMonth() + 1; // 1-based month
                })
        )];
        
        // If viewing current year, always include current month
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        let allMonths = dataMonths;
        
        if (selectedYear === currentYear) {
            allMonths = [...new Set([currentMonth, ...dataMonths])];
        }
        
        // Create options with "All Months" first, then sorted months
        const monthOptionsList = [{ value: '', label: 'All Months' }];
        
        allMonths
            .sort((a, b) => a - b)
            .forEach(month => {
                monthOptionsList.push({
                    value: month.toString(),
                    label: new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
                });
            });
        
        return monthOptionsList;
    }, [vouchers, filters.year]);
    
    // Generate dynamic year options based on available data
    const yearOptions = useMemo(() => {
        const dataYears = [...new Set(
            vouchers.map(voucher => {
                const voucherDate = new Date(voucher.createdAt);
                return voucherDate.getFullYear();
            })
        )];
        
        // Always include current year even if no data exists
        const currentYear = new Date().getFullYear();
        const allYears = [...new Set([currentYear, ...dataYears])];
        
        // Sort in descending order (newest first) and create options
        return allYears
            .sort((a, b) => b - a)
            .map(year => ({
                value: year.toString(),
                label: year.toString()
            }));
    }, [vouchers]);
    
    const currencyOptions = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'TRY', label: 'TRY (₺)' }
    ];
    
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <CustomButton
                            variant="gray"
                            onClick={() => navigate('/dashboard?tab=financials')}
                            icon={HiArrowLeft}
                            title="Back to Dashboard Financials"
                        >
                            Back
                        </CustomButton>
                        <div className="flex items-center space-x-2">
                            <HiOfficeBuilding className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {displayName}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {isDirectClient ? 'Direct Client Details' : 'Office Details'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Vouchers</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {filteredVouchers.length}
                        </p>
                    </div>
                </div>
                
                {/* Filters and Voucher Table */}
                <Card className="w-full dark:bg-slate-950 mb-6">
                    {/* Filters */}
                    <div className="bg-gray-50 dark:bg-slate-950 border dark:border-slate-600 p-6 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="year-filter" value="Year" className="mb-2" />
                                <SearchableSelect
                                    id="year-filter"
                                    options={yearOptions}
                                    value={filters.year}
                                    onChange={(eventOrValue) => {
                                        const value = typeof eventOrValue === 'string' 
                                            ? eventOrValue 
                                            : eventOrValue?.target?.value || eventOrValue;
                                        handleFilterChange('year', value);
                                    }}
                                    placeholder="Search or select year..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="month-filter" value="Month" className="mb-2" />
                                <SearchableSelect
                                    id="month-filter"
                                    options={monthOptions}
                                    value={filters.month}
                                    onChange={(eventOrValue) => {
                                        const value = typeof eventOrValue === 'string' 
                                            ? eventOrValue 
                                            : eventOrValue?.target?.value || eventOrValue;
                                        handleFilterChange('month', value);
                                    }}
                                    placeholder="Search or select month..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="currency-filter" value="Currency" className="mb-2" />
                                <SearchableSelect
                                    id="currency-filter"
                                    options={currencyOptions}
                                    value={filters.currency}
                                    onChange={(eventOrValue) => {
                                        const value = typeof eventOrValue === 'string' 
                                            ? eventOrValue 
                                            : eventOrValue?.target?.value || eventOrValue;
                                        handleFilterChange('currency', value);
                                    }}
                                    placeholder="Search or select currency..."
                                />
                            </div>
                            <div className="flex items-end">
                                <CustomButton
                                    variant="red"
                                    onClick={clearFilters}
                                    disabled={!hasFiltersApplied()}
                                    className="w-full"
                                    title={hasFiltersApplied() ? "Clear all filters" : "No filters to clear"}
                                    icon={HiX}
                                >
                                    Clear Filters
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                    
                    {/* Service Breakdown Section - Only show if there are filtered vouchers */}
                    {!loading && !error && filteredVouchers.length > 0 && (
                        <>
                            {/* Voucher Details Table */}
                            <div className="p-6 pb-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Service Breakdown by Voucher
                                </h3>
                                <div className="mb-4">
                                    <TextInput
                                        placeholder="Search by voucher ID or client name..."
                                        value={serviceTableSearch}
                                        onChange={(e) => setServiceTableSearch(e.target.value)}
                                        icon={HiSearch}
                                        className="max-w-md"
                                    />
                                </div>
                            </div>
                            <div className="px-6 pb-6">
                                <CustomScrollbar maxHeight="450px">
                                    <CustomTable
                            headers={[
                                { label: "Voucher #", className: "" },
                                { label: "Client", className: "" },
                                { label: "Date", className: "" },
                                { label: "Hotels", className: "text-blue-600 dark:text-blue-400" },
                                { label: "Transfers", className: "text-green-600 dark:text-green-400" },
                                { label: "Trips", className: "text-purple-600 dark:text-purple-400" },
                                { label: "Flights", className: "text-orange-600 dark:text-orange-400" },
                                { label: "Services Total", className: "text-gray-900 dark:text-white" },
                                { label: "Remaining", className: "text-red-600 dark:text-red-400" }
                            ]}
                            data={filteredVouchers}
                            renderRow={(voucher) => {
                                const services = calculateServicePayments(voucher);
                                const remaining = calculateVoucherRemaining(voucher._id, services.total);
                                return (
                                    <>
                                        <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                            <button
                                                onClick={() => navigate(`/vouchers/${voucher._id}`)}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-sm"
                                                title="View voucher details"
                                            >
                                                #{voucher.voucherNumber}
                                            </button>
                                        </Table.Cell>
                                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                            <div className="truncate max-w-[200px]" title={voucher.clientName}>
                                                {voucher.clientName}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                            {formatDate(voucher.createdAt)}
                                        </Table.Cell>
                                        <Table.Cell className="text-sm text-blue-600 dark:text-blue-400 font-medium px-4 py-3">
                                            {getCurrencySymbol(voucher.currency)}{services.hotels.toFixed(2)}
                                        </Table.Cell>
                                        <Table.Cell className="text-sm text-green-600 dark:text-green-400 font-medium px-4 py-3">
                                            {getCurrencySymbol(voucher.currency)}{services.transfers.toFixed(2)}
                                        </Table.Cell>
                                        <Table.Cell className="text-sm text-purple-600 dark:text-purple-400 font-medium px-4 py-3">
                                            {getCurrencySymbol(voucher.currency)}{services.trips.toFixed(2)}
                                        </Table.Cell>
                                        <Table.Cell className="text-sm text-orange-600 dark:text-orange-400 font-medium px-4 py-3">
                                            {getCurrencySymbol(voucher.currency)}{services.flights.toFixed(2)}
                                        </Table.Cell>
                                        <Table.Cell className="text-sm font-bold text-gray-900 dark:text-white px-4 py-3">
                                            {getCurrencySymbol(voucher.currency)}{services.total.toFixed(2)}
                                        </Table.Cell>
                                        <Table.Cell className={`text-sm font-bold px-4 py-3 ${remaining <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {getCurrencySymbol(voucher.currency)}{remaining.toFixed(2)}
                                        </Table.Cell>
                                    </>
                                );
                            }}
                                    emptyMessage="No vouchers have payments assigned to this office with the current filters."
                                    emptyIcon={HiOfficeBuilding}
                                />
                            </CustomScrollbar>
                        </div>
                        </>
                    )}
                    
                    {/* Client Vouchers Table */}
                    {getClientVouchers.length > 0 && (
                        <div className="p-6 pt-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Client Payments
                            </h3>
                            <div className="mb-4">
                                <TextInput
                                    placeholder="Search by voucher ID or client name..."
                                    value={clientTableSearch}
                                    onChange={(e) => setClientTableSearch(e.target.value)}
                                    icon={HiSearch}
                                    className="max-w-md"
                                />
                            </div>
                            <CustomScrollbar maxHeight="450px">
                                <CustomTable
                                    headers={[
                                        { label: "Voucher #", className: "" },
                                        { label: "Client", className: "" },
                                        { label: "Date", className: "" },
                                        { label: "Total Amount", className: "text-blue-600 dark:text-blue-400" },
                                        { label: "Paid", className: "text-green-600 dark:text-green-400" },
                                        { label: "Remaining", className: "text-red-600 dark:text-red-400" }
                                    ]}
                                    data={getClientVouchers}
                                renderRow={(voucher) => {
                                    const details = calculateClientVoucherDetails(voucher);
                                    return (
                                        <>
                                            <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                                <button
                                                    onClick={() => navigate(`/vouchers/${voucher._id}`)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-sm"
                                                    title="View voucher details"
                                                >
                                                    #{voucher.voucherNumber}
                                                </button>
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                <div className="truncate max-w-[200px]" title={voucher.clientName}>
                                                    {voucher.clientName}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                {formatDate(voucher.createdAt)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-blue-600 dark:text-blue-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(voucher.currency)}{voucher.totalAmount.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-green-600 dark:text-green-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(voucher.currency)}{details.totalPaid.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className={`text-sm font-bold px-4 py-3 ${details.remaining <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {getCurrencySymbol(voucher.currency)}{details.remaining.toFixed(2)}
                                            </Table.Cell>
                                        </>
                                    );
                                }}
                                    emptyMessage="No client vouchers with payments found for this office."
                                    emptyIcon={HiOfficeBuilding}
                                />
                            </CustomScrollbar>
                        </div>
                    )}
                    
                    {/* No Financial Movement Message */}
                    {!loading && !error && filteredVouchers.length === 0 && getClientVouchers.length === 0 && (
                        <div className="p-6 text-center">
                            <div className="flex flex-col items-center justify-center py-12">
                                <HiOfficeBuilding className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No Financial Movement
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                    This office has no financial activity with the current filters. Try adjusting the date range or currency filter to see more data.
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
                
                {/* Payment Manager */}
                <div className="mb-6">
                    <Card className="w-full dark:bg-slate-950">
                        <div className="p-6">
                            <PaymentManager
                                officeName={displayName}
                                originalTotal={isDirectClient ? totals.clientTotalAmount : totals.servicesProvided}
                                currency={filters.currency}
                                onPaymentsChange={handlePaymentsChange}
                                serviceVouchers={filteredVouchers}
                                clientVouchers={getClientVouchers}
                            />
                        </div>
                    </Card>
                </div>
            </div>
            
            {/* Office Floating Totals Panel */}
            <OfficeFloatingTotalsPanel
                totals={totals}
                paymentsReceived={paymentsReceived}
                filters={filters}
                handleFilterChange={handleFilterChange}
                clearFilters={clearFilters}
                hasFiltersApplied={hasFiltersApplied}
                filteredVouchers={filteredVouchers.length}
                totalVouchers={vouchers.length}
                officeName={displayName}
                getCurrencySymbol={getCurrencySymbol}
            />

            {/* ScrollToTop positioned on left for desktop, hidden on mobile to use global one */}
            <ScrollToTop 
                position="left" 
                className="hidden md:block" 
            />
        </div>
    );
};

export default OfficeDetailPage; 