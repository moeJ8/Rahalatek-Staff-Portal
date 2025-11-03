import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Label, Alert, Table, TextInput } from 'flowbite-react';
import { HiArrowLeft, HiOfficeBuilding, HiX, HiSearch, HiRefresh } from 'react-icons/hi';
import { FaTicketAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getAllVouchers } from '../utils/voucherApi';
import RahalatekLoader from '../components/RahalatekLoader';
import CustomButton from '../components/CustomButton';
import SearchableSelect from '../components/SearchableSelect';
import CheckBoxDropDown from '../components/CheckBoxDropDown';
import Search from '../components/Search';
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
        month: [(new Date().getMonth() + 1).toString()], // Current month as array
        year: new Date().getFullYear().toString(),
        currency: 'ALL', // Default to show all currencies
        arrivalMonth: [] // Arrival month filter
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
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
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
        const services = {
            hotels: 0,
            transfers: 0,
            trips: 0,
            flights: 0
        };
        
        // Calculate hotels - sum all individual hotel prices for this office
        if (voucher.hotels) {
            voucher.hotels.forEach(hotel => {
                if (hotel.officeName === displayName) {
                    services.hotels += parseFloat(hotel.price) || 0;
                }
            });
        }
        
        // Calculate transfers - sum all individual transfer prices for this office
        if (voucher.transfers) {
            voucher.transfers.forEach(transfer => {
                if (transfer.officeName === displayName) {
                    services.transfers += parseFloat(transfer.price) || 0;
                }
            });
        }
        
        // Calculate trips - handle both individual trip payments and global payments.trips
        let tripsTotal = 0;
        let tripsHandled = false;
        
        // First, try to calculate from individual trip payments if trips is an array
        if (voucher.trips && Array.isArray(voucher.trips)) {
            voucher.trips.forEach(trip => {
                if (trip && typeof trip === 'object' && trip.officeName === displayName && trip.price) {
                    tripsTotal += parseFloat(trip.price) || 0;
                    tripsHandled = true;
                }
            });
        }
        
        // If no individual trip payments found, fall back to global payments.trips
        if (!tripsHandled && voucher.payments && voucher.payments.trips && voucher.payments.trips.officeName === displayName) {
            tripsTotal = parseFloat(voucher.payments.trips.price) || 0;
        }
        
        services.trips = tripsTotal;
        
        // Calculate flights - sum all individual flight prices for this office
        if (voucher.flights) {
            voucher.flights.forEach(flight => {
                if (flight.officeName === displayName) {
                    services.flights += parseFloat(flight.price) || 0;
                }
            });
        }
        
        services.total = services.hotels + services.transfers + services.trips + services.flights;
        
        return services;
    };
    
    // Get vouchers that have services for this office (for the services table)
    // Direct clients don't provide services, so return empty array for them
    const serviceVouchers = useMemo(() => {
        if (isDirectClient) return [];
        
        return vouchers.filter(voucher => {
            // Check if any individual service is assigned to this office
            const hasHotelService = voucher.hotels?.some(hotel => hotel.officeName === displayName);
            const hasTransferService = voucher.transfers?.some(transfer => transfer.officeName === displayName);
            // Check for trip services - both individual and global
            let hasTripService = false;
            if (voucher.trips && Array.isArray(voucher.trips)) {
                hasTripService = voucher.trips.some(trip => trip && typeof trip === 'object' && trip.officeName === displayName);
            }
            if (!hasTripService) {
                hasTripService = voucher.payments?.trips?.officeName === displayName;
            }
            const hasFlightService = voucher.flights?.some(flight => flight.officeName === displayName);
            
            return hasHotelService || hasTransferService || hasTripService || hasFlightService;
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
            
            // Currency filter - skip if 'ALL' is selected
            if (filters.currency && filters.currency !== 'ALL' && voucher.currency !== filters.currency) return false;
            
            // Year filter - MASTER filter checks BOTH createdAt and arrivalDate years
            if (filters.year) {
                const arrivalYear = voucher.arrivalDate ? new Date(voucher.arrivalDate).getFullYear() : null;
                const matchesYear = voucherYear.toString() === filters.year || 
                                   (arrivalYear && arrivalYear.toString() === filters.year);
                if (!matchesYear) return false;
            }
            
            // Month filter - only apply if specific months are selected
            if (filters.month && Array.isArray(filters.month) && filters.month.length > 0 && !filters.month.includes('')) {
                if (!filters.month.includes(voucherMonth.toString())) return false;
            }
            
            // Arrival month filter - only apply if specific months are selected
            if (filters.arrivalMonth && Array.isArray(filters.arrivalMonth) && filters.arrivalMonth.length > 0 && !filters.arrivalMonth.includes('')) {
                if (voucher.arrivalDate) {
                    const arrivalDate = new Date(voucher.arrivalDate);
                    const arrivalMonth = arrivalDate.getMonth() + 1; // 1-based month
                    if (!filters.arrivalMonth.includes(arrivalMonth.toString())) return false;
                } else {
                    return false; // No arrival date, exclude from arrival month filter
                }
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

    // Group vouchers by currency for display when 'ALL' is selected
    const groupVouchersByCurrency = (vouchers) => {
        if (filters.currency !== 'ALL') {
            return { [filters.currency]: vouchers };
        }
        
        return vouchers.reduce((groups, voucher) => {
            const currency = voucher.currency || 'USD';
            if (!groups[currency]) {
                groups[currency] = [];
            }
            groups[currency].push(voucher);
            return groups;
        }, {});
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
            
            // Currency filter - skip if 'ALL' is selected
            if (filters.currency && filters.currency !== 'ALL' && voucher.currency !== filters.currency) return false;
            
            // Year filter - MASTER filter checks BOTH createdAt and arrivalDate years
            if (filters.year) {
                const arrivalYear = voucher.arrivalDate ? new Date(voucher.arrivalDate).getFullYear() : null;
                const matchesYear = voucherYear.toString() === filters.year || 
                                   (arrivalYear && arrivalYear.toString() === filters.year);
                if (!matchesYear) return false;
            }
            
            // Month filter - only apply if specific months are selected
            if (filters.month && Array.isArray(filters.month) && filters.month.length > 0 && !filters.month.includes('')) {
                if (!filters.month.includes(voucherMonth.toString())) return false;
            }
            
            // Arrival month filter - only apply if specific months are selected
            if (filters.arrivalMonth && Array.isArray(filters.arrivalMonth) && filters.arrivalMonth.length > 0 && !filters.arrivalMonth.includes('')) {
                if (voucher.arrivalDate) {
                    const arrivalDate = new Date(voucher.arrivalDate);
                    const arrivalMonth = arrivalDate.getMonth() + 1; // 1-based month
                    if (!filters.arrivalMonth.includes(arrivalMonth.toString())) return false;
                } else {
                    return false; // No arrival date, exclude from arrival month filter
                }
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
        
        // Calculate how much they paid you (INCOMING)
        const incomingTotal = voucherSpecificPayments
            .filter(p => p.type === 'INCOMING')
            .reduce((sum, p) => sum + p.amount, 0);
        
        // Calculate additional charges you added (OUTGOING)
        const outgoingTotal = voucherSpecificPayments
            .filter(p => p.type === 'OUTGOING')
            .reduce((sum, p) => sum + p.amount, 0);
        
        // Remaining = Original Amount - What they paid + Additional charges
        const remaining = voucher.totalAmount - incomingTotal + outgoingTotal;
        
        return { 
            totalPaid: incomingTotal, 
            remaining: remaining 
        };
    };

    // Calculate remaining balance for a specific voucher
    const calculateVoucherRemaining = (voucherId, servicesTotal) => {
        if (!voucherPayments) return servicesTotal; // Safety check
        
        const voucherSpecificPayments = voucherPayments.filter(payment => {
            // Handle both populated and unpopulated relatedVoucher
            const relatedVoucherId = payment.relatedVoucher?._id || payment.relatedVoucher;
            return relatedVoucherId === voucherId && payment.status === 'approved';
        });
        
        // Calculate how much you paid them (OUTGOING)
        const outgoingTotal = voucherSpecificPayments
            .filter(p => p.type === 'OUTGOING')
            .reduce((sum, p) => sum + p.amount, 0);
        
        // Calculate additional charges from them (INCOMING)
        const incomingTotal = voucherSpecificPayments
            .filter(p => p.type === 'INCOMING')
            .reduce((sum, p) => sum + p.amount, 0);
        
        // Remaining = Services Total - What you paid + Additional charges
        return servicesTotal - outgoingTotal + incomingTotal;
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
        if (filterType === 'month') {
            // Handle multi-select for months
            setFilters(prev => ({
                ...prev,
                month: Array.isArray(value) ? value : [value]
            }));
        } else if (filterType === 'year') {
            // When year changes, reset month filter to "All Months"
            setFilters(prev => ({
                ...prev,
                year: value,
                month: [''] // Set to "All Months"
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [filterType]: value
            }));
        }
    };


    
    const clearFilters = () => {
        setFilters({
            month: [(new Date().getMonth() + 1).toString()], // Current month as array
            year: new Date().getFullYear().toString(),
            currency: 'ALL', // Reset to show all currencies
            arrivalMonth: [] // Clear arrival month filter
        });
        setServiceTableSearch('');
        setClientTableSearch('');
    };
    
    const hasFiltersApplied = () => {
        const currentYear = new Date().getFullYear().toString();
        const currentMonth = (new Date().getMonth() + 1).toString();
        return !filters.month.includes(currentMonth) || 
               filters.month.length !== 1 ||
               filters.year !== currentYear ||
               filters.currency !== 'ALL' ||
               filters.arrivalMonth.length > 0 ||
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
    
    // Generate dynamic year options based on available data (both createdAt and arrivalDate)
    const yearOptions = useMemo(() => {
        const yearsSet = new Set();
        
        // Extract years from both createdAt and arrivalDate
        vouchers.forEach(voucher => {
            // Add year from createdAt
            const createdYear = new Date(voucher.createdAt).getFullYear();
            yearsSet.add(createdYear);
            
            // Add year from arrivalDate if it exists
            if (voucher.arrivalDate) {
                const arrivalYear = new Date(voucher.arrivalDate).getFullYear();
                yearsSet.add(arrivalYear);
            }
        });
        
        // Always include current year even if no data exists
        const currentYear = new Date().getFullYear();
        yearsSet.add(currentYear);
        
        // Convert to array, sort in descending order (newest first), and create options
        return Array.from(yearsSet)
            .sort((a, b) => b - a)
            .map(year => ({
                value: year.toString(),
                label: year.toString()
            }));
    }, [vouchers]);
    
    // Generate dynamic arrival month options based on available arrival dates for selected year
    const arrivalMonthOptions = useMemo(() => {
        const selectedYear = parseInt(filters.year);
        const arrivalDataMonths = [...new Set(
            vouchers
                .filter(voucher => {
                    if (!voucher.arrivalDate) return false;
                    const arrivalDate = new Date(voucher.arrivalDate);
                    return arrivalDate.getFullYear() === selectedYear;
                })
                .map(voucher => {
                    const arrivalDate = new Date(voucher.arrivalDate);
                    return arrivalDate.getMonth() + 1; // 1-based month
                })
        )];
        
        // Create options with "All Months" first, then sorted months
        const arrivalMonthOptionsList = [{ value: '', label: 'All Months' }];
        
        arrivalDataMonths
            .sort((a, b) => a - b)
            .forEach(month => {
                arrivalMonthOptionsList.push({
                    value: month.toString(),
                    label: new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
                });
            });
        
        return arrivalMonthOptionsList;
    }, [vouchers, filters.year]);
    
    const currencyOptions = [
        { value: 'ALL', label: 'All Currencies' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'TRY', label: 'TRY (₺)' }
    ];
    
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <CustomButton
                                variant="gray"
                                size="sm"
                                icon={HiArrowLeft}
                                onClick={() => navigate(-1)}
                                className="mr-2"
                                title="Go back to previous page"
                            >
                                Back
                            </CustomButton>
                            <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-xl">
                                <HiOfficeBuilding className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {displayName}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center">
                                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                                    {isDirectClient ? 'Direct Client Details' : 'Office Details'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-600 shadow-sm">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Vouchers</p>
                            <div className="flex items-center justify-center mt-1">
                               
                                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                    {filteredVouchers.length + getClientVouchers.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Filters and Voucher Table */}
                <Card className="w-full dark:bg-slate-950 mb-6">
                    {/* Filters */}
                    <div className="bg-gray-50 dark:bg-slate-950 border dark:border-slate-600 p-6 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                            <CheckBoxDropDown
                                label="Month"
                                id="month-filter"
                                options={monthOptions}
                                value={filters.month}
                                onChange={(value) => handleFilterChange('month', value)}
                                placeholder="Select months..."
                                allOptionsLabel="All Months"
                                allowMultiple={true}
                            />
                            <CheckBoxDropDown
                                label="Arrival Month"
                                id="arrival-month-filter"
                                options={arrivalMonthOptions}
                                value={filters.arrivalMonth}
                                onChange={(value) => handleFilterChange('arrivalMonth', value)}
                                placeholder="Select arrival months..."
                                allOptionsLabel="All Arrival Months"
                                allowMultiple={true}
                            />
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
                                    className="w-full h-[48px]"
                                    title={hasFiltersApplied() ? "Clear all filters" : "No filters to clear"}
                                    icon={HiX}
                                >
                                    Clear Filters
                                </CustomButton>
                            </div>
                            <div className="flex items-end">
                                <CustomButton
                                    variant="orange"
                                    onClick={fetchOfficeVouchers}
                                    className="w-full h-[48px]"
                                    title="Refresh data from server"
                                    icon={HiRefresh}
                                >
                                    Refresh Data
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
                                    <Search
                                        placeholder="Search by voucher ID or client name..."
                                        value={serviceTableSearch}
                                        onChange={(e) => setServiceTableSearch(e.target.value)}
                                        className="max-w-md"
                                    />
                                </div>
                            </div>
                            <div className="px-6 pb-6">
                                {(() => {
                                    const groupedVouchers = groupVouchersByCurrency(filteredVouchers);
                                    const currencyOrder = ['USD', 'EUR', 'TRY'];
                                    const currencies = Object.keys(groupedVouchers).sort((a, b) => {
                                        const indexA = currencyOrder.indexOf(a);
                                        const indexB = currencyOrder.indexOf(b);
                                        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                                        if (indexA === -1) return 1;
                                        if (indexB === -1) return -1;
                                        return indexA - indexB;
                                    });
                                    
                                    return currencies.map((currency, index) => (
                                        <div key={currency} className={index > 0 ? "mt-8" : ""}>
                                            {filters.currency === 'ALL' && (
                                                <div className="mb-4">
                                                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                        <span className="bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full text-sm">
                                                            {currency} ({getCurrencySymbol(currency)})
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {groupedVouchers[currency].length} voucher{groupedVouchers[currency].length !== 1 ? 's' : ''}
                                                        </span>
                                                    </h4>
                                                </div>
                                            )}
                                            <CustomScrollbar maxHeight="450px">
                                                <CustomTable
                                                    headers={[
                                                        { label: "Voucher #", className: "" },
                                                        { label: "Client", className: "" },
                                                        { label: "Date", className: "" },
                                                        { label: "Arrival", className: "" },
                                                        { label: "Hotels", className: "text-blue-600 dark:text-blue-400" },
                                                        { label: "Transfers", className: "text-green-600 dark:text-green-400" },
                                                        { label: "Trips", className: "text-purple-600 dark:text-purple-400" },
                                                        { label: "Flights", className: "text-orange-600 dark:text-orange-400" },
                                                        { label: "Services Total", className: "text-gray-900 dark:text-white" },
                                                        { label: "Remaining", className: "text-red-600 dark:text-red-400" }
                                                    ]}
                                                    data={groupedVouchers[currency]}
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
                                                                <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                    {formatDate(voucher.arrivalDate)}
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
                                    ));
                                })()}
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
                                <Search
                                    placeholder="Search by voucher ID or client name..."
                                    value={clientTableSearch}
                                    onChange={(e) => setClientTableSearch(e.target.value)}
                                    className="max-w-md"
                                />
                            </div>
                            {(() => {
                                const groupedClientVouchers = groupVouchersByCurrency(getClientVouchers);
                                const currencyOrder = ['USD', 'EUR', 'TRY'];
                                const currencies = Object.keys(groupedClientVouchers).sort((a, b) => {
                                    const indexA = currencyOrder.indexOf(a);
                                    const indexB = currencyOrder.indexOf(b);
                                    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                                    if (indexA === -1) return 1;
                                    if (indexB === -1) return -1;
                                    return indexA - indexB;
                                });
                                
                                return currencies.map((currency, index) => (
                                    <div key={currency} className={index > 0 ? "mt-8" : ""}>
                                        {filters.currency === 'ALL' && (
                                            <div className="mb-4">
                                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                    <span className="bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full text-sm">
                                                        {currency} ({getCurrencySymbol(currency)})
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {groupedClientVouchers[currency].length} voucher{groupedClientVouchers[currency].length !== 1 ? 's' : ''}
                                                    </span>
                                                </h4>
                                            </div>
                                        )}
                                        <CustomScrollbar maxHeight="450px">
                                            <CustomTable
                                                headers={[
                                                    { label: "Voucher #", className: "" },
                                                    { label: "Client", className: "" },
                                                    { label: "Date", className: "" },
                                                    { label: "Arrival", className: "" },
                                                    { label: "Total Amount", className: "text-blue-600 dark:text-blue-400" },
                                                    { label: "Paid", className: "text-green-600 dark:text-green-400" },
                                                    { label: "Remaining", className: "text-red-600 dark:text-red-400" }
                                                ]}
                                                data={groupedClientVouchers[currency]}
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
                                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                {formatDate(voucher.arrivalDate)}
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
                                ));
                            })()}
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
                                filters={filters}
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