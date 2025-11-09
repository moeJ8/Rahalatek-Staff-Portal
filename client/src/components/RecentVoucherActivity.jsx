import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaPlane, FaEye, FaPlus, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import RahalatekLoader from './RahalatekLoader';
import CustomButton from './CustomButton';

export default function RecentVoucherActivity() {
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const fetchRecentVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use optimized recent endpoint - filtering done on backend
      const response = await axios.get('/api/vouchers/recent?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecentVouchers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recent vouchers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRecentVouchers();
    }
  }, [user, fetchRecentVouchers]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'await':
        return {
          label: 'Pending',
          icon: <FaClock className="w-3 h-3" />,
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          dotColor: 'bg-yellow-500'
        };
      case 'arrived':
        return {
          label: 'Arrived',
          icon: <FaCheck className="w-3 h-3" />,
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-300',
          dotColor: 'bg-green-500'
        };
      case 'canceled':
        return {
          label: 'Canceled',
          icon: <FaTimes className="w-3 h-3" />,
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-700 dark:text-red-300',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          label: 'Unknown',
          icon: <FaClock className="w-3 h-3" />,
          bgColor: 'bg-gray-100 dark:bg-gray-900/30',
          textColor: 'text-gray-700 dark:text-gray-300',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', TRY: '₺' };
    return `${symbols[currency] || '$'}${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] sm:min-h-[618px] flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
            <FaTicketAlt className="text-blue-600 dark:text-teal-400 text-base sm:text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">Recent Vouchers</h3>
        </div>
        <Link 
          to="/vouchers"
          className="p-1.5 sm:p-2 text-blue-600 dark:text-teal-400 hover:text-blue-700 dark:hover:text-teal-300 transition-all duration-200 rounded-xl hover:bg-blue-50 dark:hover:bg-teal-900/20"
        >
          <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 flex flex-col">
        {loading ? (
          <div className="flex justify-center py-8">
            <RahalatekLoader size="md" />
          </div>
        ) : recentVouchers.length === 0 ? (
          <div className="text-center py-8">
            <FaTicketAlt className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No vouchers found</p>
            <Link 
              to="/vouchers/new"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-teal-400 hover:text-blue-700 dark:hover:text-teal-300"
            >
              <FaPlus className="w-3 h-3" />
              Create your first voucher
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-5 flex-1">
          {recentVouchers.map((voucher) => {
            const statusInfo = getStatusInfo(voucher.status);
            
            return (
              <div 
                key={voucher._id}
                className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Status Indicator */}
                  <div className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${statusInfo.bgColor}`}>
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statusInfo.dotColor}`}></div>
                    <span className={`text-xs font-medium ${statusInfo.textColor} hidden sm:inline`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Voucher Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                        #{voucher.voucherNumber}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
                        {voucher.clientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="hidden sm:inline">Arrival: {formatDate(voucher.arrivalDate)}</span>
                      <span className="sm:hidden">{formatDate(voucher.arrivalDate)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{formatCurrency(voucher.totalAmount, voucher.currency)}</span>
                      {(user?.isAdmin || user?.isAccountant) && voucher.createdBy && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">by {voucher.createdBy.username || voucher.createdBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <Link to={`/vouchers/${voucher._id}`} className="flex-shrink-0">
                  <CustomButton
                    variant="teal"
                    size="xs"
                    icon={FaEye}
                  >
                  </CustomButton>
                </Link>
              </div>
            );
          })}
          </div>
        )}

        {/* Quick Action */}
        {!loading && (
          <div className="mt-4 sm:mt-auto">
            <Link
              to="/vouchers/new"
              className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-700/50 text-blue-600 dark:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <FaPlus className="w-3 h-3" />
              Create New Voucher
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
