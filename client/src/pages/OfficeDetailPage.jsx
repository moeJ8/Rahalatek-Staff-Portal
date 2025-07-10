import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Label, Alert, Table } from 'flowbite-react';
import { HiArrowLeft, HiOfficeBuilding, HiX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { getAllVouchers } from '../utils/voucherApi';
import RahalatekLoader from '../components/RahalatekLoader';
import CustomButton from '../components/CustomButton';
import SearchableSelect from '../components/SearchableSelect';
import PaymentManager from '../components/PaymentManager';
import CustomTable from '../components/CustomTable';

const OfficeDetailPage = () => {
    const { officeName } = useParams();
    const navigate = useNavigate();
    
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        month: '',
        year: new Date().getFullYear().toString(),
        currency: 'USD'
    });
    
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
            
            // Filter vouchers that have payments for this office
            const officeVouchers = response.data.filter(voucher => {
                const payments = voucher.payments || {};
                const hasHotelPayment = payments.hotels?.officeName === officeName;
                const hasTransferPayment = payments.transfers?.officeName === officeName;
                const hasTripPayment = payments.trips?.officeName === officeName;
                const hasFlightPayment = payments.flights?.officeName === officeName;
                
                return hasHotelPayment || hasTransferPayment || hasTripPayment || hasFlightPayment;
            });
            
            setVouchers(officeVouchers);
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
    
    // Filter vouchers based on filters
    const filteredVouchers = useMemo(() => {
        return vouchers.filter(voucher => {
            const voucherDate = new Date(voucher.createdAt);
            const voucherMonth = voucherDate.getMonth() + 1; // 1-based month
            const voucherYear = voucherDate.getFullYear();
            
            // Currency filter
            if (filters.currency && voucher.currency !== filters.currency) return false;
            
            // Month filter
            if (filters.month && voucherMonth !== parseInt(filters.month)) return false;
            
            // Year filter
            if (filters.year && voucherYear !== parseInt(filters.year)) return false;
            
            return true;
        });
    }, [vouchers, filters]);
    
    // Calculate totals for filtered vouchers
    const totals = useMemo(() => {
        return filteredVouchers.reduce((acc, voucher) => {
            const services = calculateServicePayments(voucher);
            acc.hotels += services.hotels;
            acc.transfers += services.transfers;
            acc.trips += services.trips;
            acc.flights += services.flights;
            acc.total += services.total;
            return acc;
        }, { hotels: 0, transfers: 0, trips: 0, flights: 0, total: 0 });
    }, [filteredVouchers]);
    
    useEffect(() => {
        fetchOfficeVouchers();
    }, [officeName]);
    
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };
    
    const clearFilters = () => {
        setFilters({
            month: '',
            year: new Date().getFullYear().toString(),
            currency: 'USD'
        });
    };
    
    const hasFiltersApplied = () => {
        const currentYear = new Date().getFullYear().toString();
        return filters.month !== '' ||
               filters.year !== currentYear ||
               filters.currency !== 'USD';
    };
    
    const monthOptions = [
        { value: '', label: 'All Months' },
        ...Array.from({length: 12}, (_, i) => i + 1).map(month => ({
            value: month.toString(),
            label: new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
        }))
    ];
    
    const yearOptions = [
        { value: '2030', label: '2030' },
        { value: '2029', label: '2029' },
        { value: '2028', label: '2028' },
        { value: '2027', label: '2027' },
        { value: '2026', label: '2026' },
        { value: '2025', label: '2025' }
    ];
    
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
                                    {officeName}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Office Details
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
                    
                    {/* Voucher Details Table */}
                    {loading ? (
                        <div className="py-8">
                            <RahalatekLoader size="lg" />
                        </div>
                    ) : error ? (
                        <Alert color="failure" className="mb-4">{error}</Alert>
                                        ) : (
                        <CustomTable
                            headers={[
                                { label: "Voucher #", className: "" },
                                { label: "Client", className: "" },
                                { label: "Date", className: "" },
                                { label: "Hotels", className: "text-blue-600 dark:text-blue-400" },
                                { label: "Transfers", className: "text-green-600 dark:text-green-400" },
                                { label: "Trips", className: "text-purple-600 dark:text-purple-400" },
                                { label: "Flights", className: "text-orange-600 dark:text-orange-400" },
                                { label: "Total", className: "text-gray-900 dark:text-white" }
                            ]}
                            data={filteredVouchers}
                            renderRow={(voucher) => {
                                const services = calculateServicePayments(voucher);
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
                                            {voucher.clientName}
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
                                    </>
                                );
                            }}
                            emptyMessage="No vouchers have payments assigned to this office with the current filters."
                            emptyIcon={HiOfficeBuilding}
                        />
                    )}
                </Card>
                
                {/* Totals Summary */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Card className="text-center bg-blue-50 dark:bg-blue-900/20">
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Hotels</h3>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {getCurrencySymbol(filters.currency)}{totals.hotels.toFixed(2)}
                        </p>
                    </Card>
                    <Card className="text-center bg-green-50 dark:bg-green-900/20">
                        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Transfers</h3>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {getCurrencySymbol(filters.currency)}{totals.transfers.toFixed(2)}
                        </p>
                    </Card>
                    <Card className="text-center bg-purple-50 dark:bg-purple-900/20">
                        <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Trips</h3>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {getCurrencySymbol(filters.currency)}{totals.trips.toFixed(2)}
                        </p>
                    </Card>
                    <Card className="text-center bg-orange-50 dark:bg-orange-900/20">
                        <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Flights</h3>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {getCurrencySymbol(filters.currency)}{totals.flights.toFixed(2)}
                        </p>
                    </Card>
                    <Card className="text-center bg-gray-50 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Total</h3>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                            {getCurrencySymbol(filters.currency)}{totals.total.toFixed(2)}
                        </p>
                    </Card>
                </div>
                
                {/* Payment Manager */}
                <div className="mb-6">
                    <Card className="w-full dark:bg-slate-950">
                        <div className="p-6">
                            <PaymentManager
                                officeName={officeName}
                                originalTotal={totals.total}
                                currency={filters.currency}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OfficeDetailPage; 