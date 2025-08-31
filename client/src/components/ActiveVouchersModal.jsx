import React, { useState, useEffect } from 'react';
import { FaEye, FaPlaneArrival, FaPlaneDeparture, FaUser, FaMoneyBillWave, FaMapMarkerAlt } from 'react-icons/fa';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';
import RahalatekLoader from './RahalatekLoader';
import ModalScrollbar from './ModalScrollbar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function ActiveVouchersModal({ show, onClose }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check user role for conditional visibility
  const authUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = authUser.isAdmin || false;
  const isAccountant = authUser.isAccountant || false;
  const canSeeCreatedBy = isAdmin || isAccountant;

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency) => {
    if (!currency) return '$';
    switch (currency) {
      case 'EUR': return '€';
      case 'TRY': return '₺';
      case 'USD':
      default: return '$';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to get days until arrival
  const getDaysUntilArrival = (arrivalDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arrival = new Date(arrivalDate);
    arrival.setHours(0, 0, 0, 0);
    const diffTime = arrival - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to get arrival status color and text
  const getArrivalStatus = (arrivalDate) => {
    const days = getDaysUntilArrival(arrivalDate);
    
    if (days < 0) {
      return {
        text: `${Math.abs(days)} days overdue`,
        className: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      };
    } else if (days === 0) {
      return {
        text: 'Arriving today',
        className: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      };
    } else if (days === 1) {
      return {
        text: 'Arriving tomorrow',
        className: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      };
    } else if (days <= 7) {
      return {
        text: `${days} days away`,
        className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      };
    } else {
      return {
        text: `${days} days away`,
        className: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
      };
    }
  };

  // Fetch active vouchers
  const fetchActiveVouchers = async () => {
    if (!show) return;
    
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vouchers/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVouchers(response.data.data);
    } catch (err) {
      console.error('Error fetching active vouchers:', err);
      setError('Failed to load active vouchers');
      toast.error('Failed to load active vouchers', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (show) {
      fetchActiveVouchers();
    }
  }, [show]);

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setVouchers([]);
      setError('');
    }
  }, [show]);

  return (
    <CustomModal
      isOpen={show}
      onClose={onClose}
      title="Active Vouchers"
      subtitle={`${vouchers.length} voucher${vouchers.length !== 1 ? 's' : ''} with "Awaiting" status`}
      maxWidth="md:max-w-4xl"
      className="active-vouchers-modal"
    >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RahalatekLoader size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            <CustomButton
              onClick={fetchActiveVouchers}
              variant="blue"
              size="sm"
            >
              Try Again
            </CustomButton>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              No active vouchers found
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              All vouchers have either arrived or been canceled
            </p>
          </div>
        ) : (
          <ModalScrollbar maxHeight="480px">
            <div className="space-y-3 pb-6">
                {vouchers.map((voucher) => {
                  const arrivalStatus = getArrivalStatus(voucher.arrivalDate);
                  
                  return (
                    <div
                      key={voucher._id}
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/vouchers/${voucher._id}`}
                              onClick={onClose}
                              className="text-base font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline transition-colors duration-200"
                              title="View voucher details"
                            >
                              #{voucher.voucherNumber}
                            </Link>
                            <h4 className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[250px]">
                              {voucher.clientName}
                            </h4>
                          </div>
                          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                            <FaMapMarkerAlt className="w-2.5 h-2.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            {voucher.nationality}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${arrivalStatus.className}`}>
                            {arrivalStatus.text}
                          </span>
                          <CustomButton
                            as={Link}
                            to={`/vouchers/${voucher._id}`}
                            onClick={onClose}
                            variant="teal"
                            size="xs"
                            icon={FaEye}
                            title="View voucher details"
                          />
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className={`grid gap-1.5 text-xs ${
                        canSeeCreatedBy 
                          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-7' 
                          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                      }`}>
                        {/* Arrival Date */}
                        <div className="flex items-center gap-1.5 order-1">
                          <FaPlaneArrival className="w-3 h-3 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Arrival</div>
                            <div className="font-medium text-gray-900 dark:text-white truncate text-xs">
                              {formatDate(voucher.arrivalDate).split(' ')[0]}
                            </div>
                          </div>
                        </div>

                        {/* Departure Date */}
                        <div className="flex items-center gap-1.5 order-2">
                          <FaPlaneDeparture className="w-3 h-3 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Departure</div>
                            <div className="font-medium text-gray-900 dark:text-white truncate text-xs">
                              {formatDate(voucher.departureDate).split(' ')[0]}
                            </div>
                          </div>
                        </div>

                        {/* Capital */}
                        <div className="flex items-center gap-1.5 order-5 sm:order-3">
                          <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/50 rounded flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-400 rounded"></div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Capital</div>
                            <div className="font-medium text-gray-900 dark:text-white truncate text-xs">
                              {voucher.capital ? `${getCurrencySymbol(voucher.currency)}${voucher.capital}` : '-'}
                            </div>
                          </div>
                        </div>

                        {/* Total Amount */}
                        <div className="flex items-center gap-1.5 order-3 sm:order-4">
                          <FaMoneyBillWave className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Total</div>
                            <div className="font-medium text-gray-900 dark:text-white truncate text-xs">
                              {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                            </div>
                          </div>
                        </div>

                        {/* Profit */}
                        <div className="flex items-center gap-1.5 order-4 sm:order-5">
                          <div className="w-3 h-3 bg-emerald-100 dark:bg-emerald-900/50 rounded flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded"></div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Profit</div>
                            <div className={`font-medium truncate text-xs ${
                              voucher.capital ? 
                                (voucher.totalAmount - voucher.capital >= 0 ? 
                                  'text-emerald-600 dark:text-emerald-400' : 
                                  'text-red-600 dark:text-red-400'
                                ) : 
                                'text-gray-900 dark:text-white'
                            }`}>
                              {voucher.capital ? 
                                `${getCurrencySymbol(voucher.currency)}${(voucher.totalAmount - voucher.capital).toFixed(2)}` : 
                                '-'
                              }
                            </div>
                          </div>
                        </div>

                        {/* Office */}
                        <div className={`flex items-center gap-1.5 ${canSeeCreatedBy ? 'order-7' : 'order-6'}`}>
                          <div className="w-3 h-3 bg-teal-100 dark:bg-teal-900/50 rounded flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-teal-600 dark:bg-teal-400 rounded"></div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Office</div>
                            {voucher.officeName && voucher.officeName.trim() !== '' && voucher.officeName.toLowerCase() !== 'direct client' ? (
                              canSeeCreatedBy ? (
                                <Link
                                  to={`/office/${encodeURIComponent(voucher.officeName)}`}
                                  onClick={onClose}
                                  className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline transition-colors duration-200 truncate text-xs cursor-pointer"
                                  title="View office details"
                                >
                                  {voucher.officeName}
                                </Link>
                              ) : (
                                <div className="font-medium text-gray-900 dark:text-white truncate text-xs">
                                  {voucher.officeName}
                                </div>
                              )
                            ) : (
                              <div className="font-medium text-gray-500 dark:text-gray-400 truncate text-xs">
                                Direct Client
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Created By - Only visible to admins and accountants */}
                        {canSeeCreatedBy && (
                          <div className="flex items-center gap-1.5 order-6">
                            <FaUser className="w-3 h-3 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Created By</div>
                              <div className="font-medium text-gray-900 dark:text-white truncate text-xs">
                                {voucher.createdBy?.username || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </ModalScrollbar>
        )}
    </CustomModal>
  );
}
