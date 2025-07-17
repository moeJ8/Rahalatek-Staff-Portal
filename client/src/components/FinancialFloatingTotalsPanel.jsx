import React, { useState } from 'react';
import { Card } from 'flowbite-react';
import CustomScrollbar from './CustomScrollbar';
import { FaCalculator, FaTimes } from 'react-icons/fa';

const FinancialFloatingTotalsPanel = ({ 
  viewType,
  totals,
  clientOfficeData,
  currency,
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

  // Calculate client office summary stats
  const clientStats = {
    uniqueOffices: [...new Set(clientOfficeData.map(office => office.officeName))].length,
    directClients: [...new Set(clientOfficeData.filter(office => office.isDirectClient).map(office => office.officeName))].length,
    totalVouchers: clientOfficeData.reduce((sum, office) => sum + office.voucherCount, 0),
    totalRevenue: clientOfficeData.reduce((sum, office) => sum + office.totalAmount, 0)
  };

  return (
    <>
      {/* Button - bottom-left on mobile, bottom-right on desktop */}
      <div className="fixed bottom-6 left-6 sm:left-auto sm:right-6 z-50">
        {!showFloatingTotals && (
          <button
            onClick={handleOpenTotals}
            disabled={isAnimating}
            className="group relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 will-change-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Icon with subtle animation */}
            <div className="relative">
              <FaCalculator className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:rotate-12" />
            </div>
            
            {/* Text - hidden on mobile */}
            <span className="hidden sm:inline-block text-sm sm:text-base font-medium tracking-wide">
              Financial Totals
            </span>
            
            {/* Pulse indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
          </button>
        )}
      </div>

      {/* Mobile Modal - Centered */}
      {showFloatingTotals && (
        <div className="block sm:hidden fixed inset-0 flex items-center justify-center p-4 z-50">
          <Card className={`w-[95vw] max-h-[85vh] overflow-y-auto p-3 shadow-2xl border-2 border-green-200 dark:border-emerald-700 dark:bg-slate-900 transform transition-all duration-300 ease-in-out will-change-transform ${
            showFloatingTotals && !isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
          } animate-in slide-in-from-bottom-5 fade-in`}>
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <FaCalculator className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-emerald-400" />
                Financial Summary
              </h3>
              <button
                onClick={handleCloseTotals}
                disabled={isAnimating}
                className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                title="Close"
              >
                <FaTimes className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>

            {/* Mobile Content */}
            <div className="space-y-3">
              {viewType === 'providers' ? (
                <>
                  {/* Supplier Breakdown */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400">Hotels</h4>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {getCurrencySymbol(currency)}{totals.hotels.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <h4 className="text-xs font-semibold text-green-600 dark:text-green-400">Transfers</h4>
                      <p className="text-sm font-bold text-green-700 dark:text-green-300">
                        {getCurrencySymbol(currency)}{totals.transfers.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400">Trips</h4>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {getCurrencySymbol(currency)}{totals.trips.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                      <h4 className="text-xs font-semibold text-orange-600 dark:text-orange-400">Flights</h4>
                      <p className="text-sm font-bold text-orange-700 dark:text-orange-300">
                        {getCurrencySymbol(currency)}{totals.flights.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Revenue</h4>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {getCurrencySymbol(currency)}{totals.total.toFixed(2)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Client Office Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400">Clients</h4>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {clientStats.uniqueOffices}
                      </p>
                    </div>
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-700">
                      <h4 className="text-xs font-semibold text-rose-600 dark:text-rose-400">Direct</h4>
                      <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                        {clientStats.directClients}
                      </p>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <h4 className="text-xs font-semibold text-green-600 dark:text-green-400">Vouchers</h4>
                      <p className="text-sm font-bold text-green-700 dark:text-green-300">
                        {clientStats.totalVouchers}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400">Revenue</h4>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {getCurrencySymbol(currency)}{clientStats.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Desktop Modal - Bottom Right */}
      {showFloatingTotals && (
        <div className="hidden sm:block fixed bottom-6 right-6 md:right-4 lg:right-6 z-50">
          <Card className={`w-[380px] md:w-[420px] lg:w-[500px] max-h-[65vh] md:max-h-[70vh] lg:max-h-[75vh] shadow-2xl border-2 border-green-200 dark:border-emerald-700 dark:bg-slate-900 transform transition-all duration-300 ease-in-out will-change-transform ${
            showFloatingTotals && !isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
          } animate-in slide-in-from-bottom-5 fade-in`}>
            <CustomScrollbar maxHeight="calc(65vh - 2rem)" className="h-full">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <FaCalculator className="mr-1.5 md:mr-2 text-green-600 dark:text-emerald-400 w-4 h-4 md:w-5 md:h-5" />
                  Financial Summary
                </h3>
                <button
                  onClick={handleCloseTotals}
                  disabled={isAnimating}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                  title="Close"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Desktop Content */}
              <div className="space-y-4">
                {viewType === 'providers' ? (
                  <>
                    {/* Supplier Breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Hotels</h4>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {getCurrencySymbol(currency)}{totals.hotels.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">Transfers</h4>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                          {getCurrencySymbol(currency)}{totals.transfers.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                        <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400">Trips</h4>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                          {getCurrencySymbol(currency)}{totals.trips.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                        <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400">Flights</h4>
                        <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                          {getCurrencySymbol(currency)}{totals.flights.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                      <h4 className="text-base font-semibold text-gray-600 dark:text-gray-400">Total Revenue</h4>
                      <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {getCurrencySymbol(currency)}{totals.total.toFixed(2)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Client Office Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Total Clients</h4>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {clientStats.uniqueOffices}
                        </p>
                      </div>
                      <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-700">
                        <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400">Direct Clients</h4>
                        <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
                          {clientStats.directClients}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">Total Vouchers</h4>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                          {clientStats.totalVouchers}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                        <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400">Total Revenue</h4>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                          {getCurrencySymbol(currency)}{clientStats.totalRevenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CustomScrollbar>
          </Card>
        </div>
      )}
    </>
  );
};

export default FinancialFloatingTotalsPanel; 