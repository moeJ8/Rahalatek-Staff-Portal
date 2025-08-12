import React, { useState, useMemo } from 'react';
import { Card } from 'flowbite-react';
import CustomDatePicker from './CustomDatePicker';
import SearchableSelect from './SearchableSelect';
import Select from './Select';
import Search from './Search';
import CustomScrollbar from './CustomScrollbar';
import { FaCalculator, FaTimes, FaSearch } from 'react-icons/fa';

const FloatingTotalsPanel = ({ 
  vouchers, 
  filteredVouchers, 
  searchQuery, 
  setSearchQuery,
  userFilter, 
  setUserFilter,
  uniqueUsers,
  dateFilter, 
  customDate, 
  setCustomDate,
  arrivalDateFilter, 
  customArrivalDate, 
  setCustomArrivalDate,
  statusFilter, 
  setStatusFilter,
  handleDateFilterChange,
  handleArrivalDateFilterChange,
  handleClearFilters
}) => {
  // Local state for panel visibility and animations
  const [showFloatingTotals, setShowFloatingTotals] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Smooth open/close handlers
  const handleOpenTotals = () => {
    setIsAnimating(true);
    setShowFloatingTotals(true);
    setTimeout(() => setIsAnimating(false), 400); // Smooth but faster animation
  };

  const handleCloseTotals = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowFloatingTotals(false);
      setIsAnimating(false);
    }, 250); // Quick close
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency) => {
    if (!currency) return '$'; // default to USD
    switch (currency) {
      case 'EUR': return '€';
      case 'TRY': return '₺';
      case 'USD':
      default: return '$';
    }
  };

  // Helper function to get profit color classes based on value
  const getProfitColorClass = (profit, isBold = false) => {
    const baseClass = isBold ? 'font-bold text-sm' : 'text-sm font-medium';
    if (profit < 0) {
      return `${baseClass} text-red-600 dark:text-red-400`;
    }
    return `${baseClass} text-green-600 dark:text-green-400`;
  };

  // Memoized totals calculation for better performance
  const totals = useMemo(() => {
    if (filteredVouchers.length === 0) return {};
    
    const totalsByCurrency = filteredVouchers.reduce((acc, voucher) => {
      const currency = voucher.currency || 'USD';
      const capital = parseFloat(voucher.capital) || 0;
      const total = parseFloat(voucher.totalAmount) || 0;
      const profit = capital > 0 ? total - capital : 0;

      if (!acc[currency]) {
        acc[currency] = { totalCapital: 0, totalAmount: 0, totalProfit: 0 };
      }

      acc[currency].totalCapital += capital;
      acc[currency].totalAmount += total;
      acc[currency].totalProfit += profit;

      return acc;
    }, {});

    return totalsByCurrency;
  }, [filteredVouchers]);

  if (vouchers.length === 0) return null;

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
              Totals
            </span>
            
            {/* Pulse indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </button>
        )}
      </div>

      {/* Mobile Modal - Centered */}
      {showFloatingTotals && (
        <div className="sm:hidden fixed inset-0 flex items-center justify-center p-4 z-50">
          <Card className={`w-[95vw] max-h-[85vh] overflow-y-auto p-3 shadow-2xl border-2 border-blue-200 dark:border-cyan-700 dark:bg-slate-900 transform transition-all duration-300 ease-in-out will-change-transform ${
            showFloatingTotals && !isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
          } animate-in slide-in-from-bottom-5 fade-in`}>
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <FaCalculator className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-cyan-400" />
              Totals Summary
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
              <FaSearch className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
              Quick Filters
            </h4>
            
            <div className="space-y-2 sm:space-y-3">
              {/* Search - Hidden on mobile, visible on desktop */}
              <div className="hidden sm:block">
                <Search
                  placeholder="Search by client name or voucher number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters Grid - 2x2 Layout */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Status Filter */}
                <div>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="All Statuses"
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: 'await', label: 'Awaiting' },
                      { value: 'arrived', label: 'Arrived' },
                      { value: 'canceled', label: 'Canceled' }
                    ]}
                  />
                </div>

                {/* User Filter */}
                <div>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'All Users' },
                      ...uniqueUsers.map(user => ({ value: user._id, label: user.username }))
                    ]}
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    placeholder="All Users"
                  />
                </div>

                {/* Creation Date Filter */}
                <div>
                  <Select
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                    placeholder="All Creation Dates"
                    options={[
                      { value: '', label: 'All Creation Dates' },
                      { value: 'january', label: 'Created - January' },
                      { value: 'february', label: 'Created - February' },
                      { value: 'march', label: 'Created - March' },
                      { value: 'april', label: 'Created - April' },
                      { value: 'may', label: 'Created - May' },
                      { value: 'june', label: 'Created - June' },
                      { value: 'july', label: 'Created - July' },
                      { value: 'august', label: 'Created - August' },
                      { value: 'september', label: 'Created - September' },
                      { value: 'october', label: 'Created - October' },
                      { value: 'november', label: 'Created - November' },
                      { value: 'december', label: 'Created - December' },
                      { value: 'this-year', label: 'Created - This Year' },
                      { value: 'last-year', label: 'Created - Last Year' },
                      { value: 'custom', label: 'Created - Custom Date' }
                    ]}
                  />
                </div>

                {/* Arrival Date Filter */}
                <div>
                  <Select
                    value={arrivalDateFilter}
                    onChange={handleArrivalDateFilterChange}
                    placeholder="All Arrival Dates"
                    options={[
                      { value: '', label: 'All Arrival Dates' },
                      { value: 'january', label: 'Arrival - January' },
                      { value: 'february', label: 'Arrival - February' },
                      { value: 'march', label: 'Arrival - March' },
                      { value: 'april', label: 'Arrival - April' },
                      { value: 'may', label: 'Arrival - May' },
                      { value: 'june', label: 'Arrival - June' },
                      { value: 'july', label: 'Arrival - July' },
                      { value: 'august', label: 'Arrival - August' },
                      { value: 'september', label: 'Arrival - September' },
                      { value: 'october', label: 'Arrival - October' },
                      { value: 'november', label: 'Arrival - November' },
                      { value: 'december', label: 'Arrival - December' },
                      { value: 'this-year', label: 'Arrival - This Year' },
                      { value: 'last-year', label: 'Arrival - Last Year' },
                      { value: 'custom', label: 'Arrival - Custom Date' }
                    ]}
                  />
                </div>
              </div>

              {/* Custom Date Pickers - Show below grid when needed */}
              {(dateFilter === 'custom' || arrivalDateFilter === 'custom') && (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {dateFilter === 'custom' ? (
                    <div>
                      <CustomDatePicker
                        value={customDate}
                        onChange={setCustomDate}
                        placeholder="Select creation date"
                        size="sm"
                      />
                    </div>
                  ) : (
                    <div></div>
                  )}
                  
                  {arrivalDateFilter === 'custom' ? (
                    <div>
                      <CustomDatePicker
                        value={customArrivalDate}
                        onChange={setCustomArrivalDate}
                        placeholder="Select arrival date"
                        size="sm"
                      />
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              )}

              {/* Clear Filters Button */}
              {(searchQuery || userFilter || dateFilter || arrivalDateFilter || statusFilter) && (
                <div className="pt-1 sm:pt-2">
                  <button
                    onClick={handleClearFilters}
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
          {Object.keys(totals).length > 0 ? (
            <div className="space-y-2 sm:space-y-4">
              {Object.entries(totals).map(([currency, amounts]) => (
                <div key={currency} className="p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-cyan-700">
                  <h4 className="text-sm sm:text-lg font-bold text-blue-800 dark:text-cyan-300 mb-2 sm:mb-3">{currency}</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Capital</p>
                      <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                        {getCurrencySymbol(currency)}{amounts.totalCapital.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Amount</p>
                      <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                        {getCurrencySymbol(currency)}{amounts.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Profit</p>
                      <p className={`text-sm sm:text-lg font-bold ${getProfitColorClass(amounts.totalProfit, true).includes('text-red') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {getCurrencySymbol(currency)}{amounts.totalProfit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 sm:py-8">
              <FaCalculator className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No vouchers match the current filters</p>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              <span>{filteredVouchers.length} of {vouchers.length} vouchers</span>
              {(searchQuery || userFilter || dateFilter || arrivalDateFilter || statusFilter) && (
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
                  Totals Summary
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
                <FaSearch className="mr-1.5 md:mr-2 w-3 h-3 md:w-4 md:h-4" />
                Quick Filters
              </h4>
              
              <div className="space-y-3">
                {/* Search - Desktop version */}
                <div>
                  <Search
                    placeholder="Search by client name or voucher number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filters Grid - 2x2 Layout */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {/* Status Filter */}
                  <div>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder="All Statuses"
                      options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'await', label: 'Awaiting' },
                        { value: 'arrived', label: 'Arrived' },
                        { value: 'canceled', label: 'Canceled' }
                      ]}
                    />
                  </div>

                  {/* User Filter */}
                  <div>
                    <SearchableSelect
                      options={[
                        { value: '', label: 'All Users' },
                        ...uniqueUsers.map(user => ({ value: user._id, label: user.username }))
                      ]}
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      placeholder="All Users"
                    />
                  </div>

                  {/* Creation Date Filter */}
                  <div>
                    <Select
                      value={dateFilter}
                      onChange={handleDateFilterChange}
                      placeholder="All Creation Dates"
                      options={[
                        { value: '', label: 'All Creation Dates' },
                        { value: 'january', label: 'Created - January' },
                        { value: 'february', label: 'Created - February' },
                        { value: 'march', label: 'Created - March' },
                        { value: 'april', label: 'Created - April' },
                        { value: 'may', label: 'Created - May' },
                        { value: 'june', label: 'Created - June' },
                        { value: 'july', label: 'Created - July' },
                        { value: 'august', label: 'Created - August' },
                        { value: 'september', label: 'Created - September' },
                        { value: 'october', label: 'Created - October' },
                        { value: 'november', label: 'Created - November' },
                        { value: 'december', label: 'Created - December' },
                        { value: 'this-year', label: 'Created - This Year' },
                        { value: 'last-year', label: 'Created - Last Year' },
                        { value: 'custom', label: 'Created - Custom Date' }
                      ]}
                    />
                  </div>

                  {/* Arrival Date Filter */}
                  <div>
                    <Select
                      value={arrivalDateFilter}
                      onChange={handleArrivalDateFilterChange}
                      placeholder="All Arrival Dates"
                      options={[
                        { value: '', label: 'All Arrival Dates' },
                        { value: 'january', label: 'Arrival - January' },
                        { value: 'february', label: 'Arrival - February' },
                        { value: 'march', label: 'Arrival - March' },
                        { value: 'april', label: 'Arrival - April' },
                        { value: 'may', label: 'Arrival - May' },
                        { value: 'june', label: 'Arrival - June' },
                        { value: 'july', label: 'Arrival - July' },
                        { value: 'august', label: 'Arrival - August' },
                        { value: 'september', label: 'Arrival - September' },
                        { value: 'october', label: 'Arrival - October' },
                        { value: 'november', label: 'Arrival - November' },
                        { value: 'december', label: 'Arrival - December' },
                        { value: 'this-year', label: 'Arrival - This Year' },
                        { value: 'last-year', label: 'Arrival - Last Year' },
                        { value: 'custom', label: 'Arrival - Custom Date' }
                      ]}
                    />
                  </div>
                </div>

                {/* Custom Date Pickers - Show below grid when needed */}
                {(dateFilter === 'custom' || arrivalDateFilter === 'custom') && (
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {dateFilter === 'custom' ? (
                      <div>
                        <CustomDatePicker
                          value={customDate}
                          onChange={setCustomDate}
                          placeholder="Select creation date"
                          size="sm"
                        />
                      </div>
                    ) : (
                      <div></div>
                    )}
                    
                    {arrivalDateFilter === 'custom' ? (
                      <div>
                        <CustomDatePicker
                          value={customArrivalDate}
                          onChange={setCustomArrivalDate}
                          placeholder="Select arrival date"
                          size="sm"
                        />
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                )}

                {/* Clear Filters Button */}
                {(searchQuery || userFilter || dateFilter || arrivalDateFilter || statusFilter) && (
                  <div className="pt-2">
                    <button
                      onClick={handleClearFilters}
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
            {Object.keys(totals).length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {Object.entries(totals).map(([currency, amounts]) => (
                  <div key={currency} className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-cyan-700">
                    <h4 className="text-base md:text-lg font-bold text-blue-800 dark:text-cyan-300 mb-2 md:mb-3">{currency}</h4>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Capital</p>
                        <p className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                          {getCurrencySymbol(currency)}{amounts.totalCapital.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Amount</p>
                        <p className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                          {getCurrencySymbol(currency)}{amounts.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Profit</p>
                        <p className={`text-base md:text-lg font-bold ${getProfitColorClass(amounts.totalProfit, true).includes('text-red') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {getCurrencySymbol(currency)}{amounts.totalProfit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaCalculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-base text-gray-500 dark:text-gray-400">No vouchers match the current filters</p>
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{filteredVouchers.length} of {vouchers.length} vouchers</span>
                {(searchQuery || userFilter || dateFilter || arrivalDateFilter || statusFilter) && (
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

export default FloatingTotalsPanel; 