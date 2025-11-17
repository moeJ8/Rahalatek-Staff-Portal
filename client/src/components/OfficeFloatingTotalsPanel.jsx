import React, { useState } from 'react';
import { Card, Select, Label } from 'flowbite-react';
import SearchableSelect from './SearchableSelect';
import CustomScrollbar from './CustomScrollbar';
import { FaCalculator, FaTimes, FaFilter } from 'react-icons/fa';

const OfficeFloatingTotalsPanel = ({ 
  totals,
  paymentsReceived,
  filters,
  handleFilterChange,
  clearFilters,
  hasFiltersApplied,
  filteredVouchers,
  totalVouchers,
  officeName,
  getCurrencySymbol
}) => {
  // Local state for panel visibility and animations
  const [showFloatingTotals, setShowFloatingTotals] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Smooth open/close handlers
  const handleOpenTotals = () => {
    setIsAnimating(true);
    setShowFloatingTotals(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleCloseTotals = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowFloatingTotals(false);
      setIsAnimating(false);
    }, 250);
  };

  // Filter options
  const monthOptions = [
    { value: 'all-time', label: 'All Time' },
    { value: 'current-year', label: 'This Year' },
    ...Array.from({length: 12}, (_, i) => i + 1).map(month => ({
      value: month.toString(),
      label: new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
    }))
  ];



  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'TRY', label: 'TRY (₺)' }
  ];

  return (
    <>
      {/* Button - bottom-left on mobile, bottom-right on desktop */}
      <div className="fixed bottom-6 left-6 sm:left-auto sm:right-6 z-50">
        {!showFloatingTotals && (
          <button
            onClick={handleOpenTotals}
            disabled={isAnimating}
            className="group relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 will-change-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Icon with subtle animation */}
            <div className="relative">
              <FaCalculator className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:rotate-12" />
            </div>
            
            {/* Text - hidden on mobile */}
            <span className="hidden sm:inline-block text-sm sm:text-base font-medium tracking-wide">
              Office Totals
            </span>
            
            {/* Pulse indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </button>
        )}
      </div>

      {/* Mobile Modal - Centered */}
      {showFloatingTotals && (
        <div className="block sm:hidden fixed inset-0 flex items-center justify-center p-4 z-50">
          <Card className={`w-[95vw] max-h-[85vh] overflow-y-auto p-3 shadow-2xl border-2 border-blue-200 dark:border-cyan-700 dark:bg-slate-900 transform transition-all duration-300 ease-in-out will-change-transform ${
            showFloatingTotals && !isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
          } animate-in slide-in-from-bottom-5 fade-in`}>
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <FaCalculator className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-cyan-400" />
                {officeName} Totals
              </h3>
              <button
                onClick={handleCloseTotals}
                disabled={isAnimating}
                className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-all duration-200 hover:scale-110 active:scale-90"
                title="Close"
              >
                <FaTimes className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>

            {/* Quick Filters Section */}
            <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                <FaFilter className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                Quick Filters
              </h4>
              
              <div className="space-y-2 sm:space-y-3">
                                  {/* Filters Grid - 1x2 Layout */}
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {/* Month/Time Filter */}
                  <div>
                    <Label htmlFor="month-filter-mobile" value="Time Period" className="text-xs mb-1" />
                    <SearchableSelect
                      id="month-filter-mobile"
                      options={monthOptions}
                      value={filters.month}
                      onChange={(eventOrValue) => {
                        const value = typeof eventOrValue === 'string' 
                          ? eventOrValue 
                          : eventOrValue?.target?.value || eventOrValue;
                        handleFilterChange('month', value);
                      }}
                      placeholder="Select time period..."
                      size="sm"
                    />
                  </div>

                  {/* Currency Filter */}
                  <div>
                    <Label htmlFor="currency-filter-mobile" value="Currency" className="text-xs mb-1" />
                    <SearchableSelect
                      id="currency-filter-mobile"
                      options={currencyOptions}
                      value={filters.currency}
                      onChange={(eventOrValue) => {
                        const value = typeof eventOrValue === 'string' 
                          ? eventOrValue 
                          : eventOrValue?.target?.value || eventOrValue;
                        handleFilterChange('currency', value);
                      }}
                      placeholder="Select currency..."
                      size="sm"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasFiltersApplied() && (
                  <div className="pt-1 sm:pt-2">
                    <button
                      onClick={clearFilters}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap w-full"
                    >
                      <FaTimes className="w-3 h-3" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Totals Display */}
            <div className="space-y-2 sm:space-y-3">
              {/* Service Breakdown */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400">Hotels</h4>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {getCurrencySymbol(filters.currency)}{totals.hotels.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <h4 className="text-xs font-semibold text-green-600 dark:text-green-400">Transfers</h4>
                  <p className="text-sm font-bold text-green-700 dark:text-green-300">
                    {getCurrencySymbol(filters.currency)}{totals.transfers.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400">Trips</h4>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    {getCurrencySymbol(filters.currency)}{totals.trips.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                  <h4 className="text-xs font-semibold text-orange-600 dark:text-orange-400">Flights</h4>
                  <p className="text-sm font-bold text-orange-700 dark:text-orange-300">
                    {getCurrencySymbol(filters.currency)}{totals.flights.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Main Totals */}
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Services Provided</h4>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {getCurrencySymbol(filters.currency)}{totals.servicesProvided.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Payment Balance</h4>
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                    {getCurrencySymbol(filters.currency)}{paymentsReceived.toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg border ${totals.totalRemaining <= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
                  <h4 className={`text-sm font-semibold ${totals.totalRemaining <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>Total Remaining</h4>
                  <p className={`text-lg font-bold ${totals.totalRemaining <= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                    {getCurrencySymbol(filters.currency)}{totals.totalRemaining.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Client Table Totals */}
              {totals.clientTotalAmount > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">Client Vouchers Totals</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400">Total Amount</h4>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {getCurrencySymbol(filters.currency)}{totals.clientTotalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <h4 className="text-xs font-semibold text-green-600 dark:text-green-400">Paid</h4>
                      <p className="text-sm font-bold text-green-700 dark:text-green-300">
                        {getCurrencySymbol(filters.currency)}{totals.clientTotalPaid.toFixed(2)}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg border ${totals.clientTotalRemaining <= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'}`}>
                      <h4 className={`text-xs font-semibold ${totals.clientTotalRemaining <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>Remaining</h4>
                      <div>
                        <p className={`text-sm font-bold ${totals.clientTotalRemaining <= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                          {totals.clientTotalRemaining < 0 ? '+' : ''}{getCurrencySymbol(filters.currency)}{Math.abs(totals.clientTotalRemaining).toFixed(2)}
                        </p>
                        {totals.clientTotalRemaining < 0 && (
                          <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Overpaid</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                <span>{filteredVouchers} of {totalVouchers} vouchers</span>
                {hasFiltersApplied() && (
                  <span className="text-blue-600 dark:text-cyan-400">Filtered</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Desktop Modal - Bottom Right */}
      {showFloatingTotals && (
        <div className="hidden sm:block fixed bottom-6 right-6 md:right-4 lg:right-6 z-50">
          <Card className={`w-[380px] md:w-[420px] lg:w-[500px] max-h-[65vh] md:max-h-[70vh] lg:max-h-[75vh] shadow-2xl border-2 border-blue-200 dark:border-cyan-700 dark:bg-slate-900 transform transition-all duration-300 ease-in-out will-change-transform ${
            showFloatingTotals && !isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
          } animate-in slide-in-from-bottom-5 fade-in`}>
            <CustomScrollbar maxHeight="calc(65vh - 2rem)" className="h-full">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <FaCalculator className="mr-1.5 md:mr-2 text-blue-600 dark:text-cyan-400 w-4 h-4 md:w-5 md:h-5" />
                  {officeName} Totals
                </h3>
                <button
                  onClick={handleCloseTotals}
                  disabled={isAnimating}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-all duration-200 hover:scale-110 active:scale-90"
                  title="Close"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Filters Section */}
              <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <h4 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-3 flex items-center">
                  <FaFilter className="mr-1.5 md:mr-2 w-3 h-3 md:w-4 md:h-4" />
                  Quick Filters
                </h4>
                
                <div className="space-y-3">
                  {/* Filters Grid */}
                  <div className="grid grid-cols-1 gap-2 md:gap-3">
                    {/* Month/Time Filter */}
                    <div>
                      <Label htmlFor="month-filter-desktop" value="Time Period" className="text-xs mb-1" />
                      <SearchableSelect
                        id="month-filter-desktop"
                        options={monthOptions}
                        value={filters.month}
                        onChange={(eventOrValue) => {
                          const value = typeof eventOrValue === 'string' 
                            ? eventOrValue 
                            : eventOrValue?.target?.value || eventOrValue;
                          handleFilterChange('month', value);
                        }}
                        placeholder="Select time period..."
                        size="sm"
                      />
                    </div>

                    {/* Currency Filter */}
                    <div>
                      <Label htmlFor="currency-filter-desktop" value="Currency" className="text-xs mb-1" />
                      <SearchableSelect
                        id="currency-filter-desktop"
                        options={currencyOptions}
                        value={filters.currency}
                        onChange={(eventOrValue) => {
                          const value = typeof eventOrValue === 'string' 
                            ? eventOrValue 
                            : eventOrValue?.target?.value || eventOrValue;
                          handleFilterChange('currency', value);
                        }}
                        placeholder="Select currency..."
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {hasFiltersApplied() && (
                    <div className="pt-2">
                      <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap w-full"
                      >
                        <FaTimes className="w-3 h-3" />
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals Display */}
              <div className="space-y-3 md:space-y-4">
                {/* Service Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Hotels</h4>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {getCurrencySymbol(filters.currency)}{(totals.hotels || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">Transfers</h4>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      {getCurrencySymbol(filters.currency)}{(totals.transfers || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400">Trips</h4>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {getCurrencySymbol(filters.currency)}{(totals.trips || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400">Flights</h4>
                    <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                      {getCurrencySymbol(filters.currency)}{(totals.flights || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-700 col-span-2">
                    <h4 className="text-sm font-semibold text-pink-600 dark:text-pink-400">Others</h4>
                    <p className="text-lg font-bold text-pink-700 dark:text-pink-300">
                      {getCurrencySymbol(filters.currency)}{(totals.others || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Main Totals */}
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                    <h4 className="text-base font-semibold text-gray-600 dark:text-gray-400">Services Provided</h4>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {getCurrencySymbol(filters.currency)}{totals.servicesProvided.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                    <h4 className="text-base font-semibold text-indigo-600 dark:text-indigo-400">Payment Balance</h4>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                      {getCurrencySymbol(filters.currency)}{paymentsReceived.toFixed(2)}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border ${totals.totalRemaining <= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
                    <h4 className={`text-base font-semibold ${totals.totalRemaining <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>Total Remaining</h4>
                    <p className={`text-2xl font-bold ${totals.totalRemaining <= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                      {getCurrencySymbol(filters.currency)}{totals.totalRemaining.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Client Table Totals */}
                {totals.clientTotalAmount > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-base font-semibold text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">Client Vouchers Totals</h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Total Amount</h4>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {getCurrencySymbol(filters.currency)}{totals.clientTotalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">Paid</h4>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                          {getCurrencySymbol(filters.currency)}{totals.clientTotalPaid.toFixed(2)}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg border ${totals.clientTotalRemaining <= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'}`}>
                        <h4 className={`text-sm font-semibold ${totals.clientTotalRemaining <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>Remaining</h4>
                        <div>
                          <p className={`text-lg font-bold ${totals.clientTotalRemaining <= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                            {totals.clientTotalRemaining < 0 ? '+' : ''}{getCurrencySymbol(filters.currency)}{Math.abs(totals.clientTotalRemaining).toFixed(2)}
                          </p>
                          {totals.clientTotalRemaining < 0 && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Overpaid</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{filteredVouchers} of {totalVouchers} vouchers</span>
                  {hasFiltersApplied() && (
                    <span className="text-blue-600 dark:text-cyan-400">Filtered</span>
                  )}
                </div>
              </div>
            </CustomScrollbar>
          </Card>
        </div>
      )}
    </>
  );
};

export default OfficeFloatingTotalsPanel; 