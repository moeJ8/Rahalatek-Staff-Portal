import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Modal, Alert, Badge, TextInput } from 'flowbite-react';
import RahalatekLoader from '../components/RahalatekLoader';
import CustomButton from '../components/CustomButton';
import CustomTable from '../components/CustomTable';
import SearchableSelect from '../components/SearchableSelect';
import Select from '../components/Select';
import Search from '../components/Search';
import CustomDatePicker from '../components/CustomDatePicker';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CustomScrollbar from '../components/CustomScrollbar';
import { toast } from 'react-hot-toast';
import { FaTrash, FaTrashRestore, FaCalendarAlt, FaSearch, FaUser, FaTimes, FaCheck } from 'react-icons/fa';

export default function TrashPage() {
  const [trashedVouchers, setTrashedVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [arrivalDateFilter, setArrivalDateFilter] = useState('');
  const [customArrivalDate, setCustomArrivalDate] = useState('');

  // Multi-select states
  const [selectedVouchers, setSelectedVouchers] = useState(new Set());
  const [bulkRestoreModal, setBulkRestoreModal] = useState(false);
  const [bulkPermanentDeleteModal, setBulkPermanentDeleteModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState('');
  const [permanentDeleteModal, setPermanentDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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

  // Helper function to get profit color classes based on value
  const getProfitColorClass = (profit, isBold = false) => {
    const baseClass = isBold ? 'font-bold text-sm' : 'text-sm font-medium';
    if (profit < 0) {
      return `${baseClass} text-red-600 dark:text-red-400`;
    }
    return `${baseClass} text-green-600 dark:text-green-400`;
  };

  // Multi-select helper functions
  const handleSelectVoucher = (voucherId, isSelected) => {
    const newSelected = new Set(selectedVouchers);
    if (isSelected) {
      newSelected.add(voucherId);
    } else {
      newSelected.delete(voucherId);
    }
    setSelectedVouchers(newSelected);
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      // Only allow selection if user can manage vouchers
      if (canManageVoucher()) {
        setSelectedVouchers(new Set(filteredVouchers.map(voucher => voucher._id)));
      }
    } else {
      setSelectedVouchers(new Set());
    }
  };

  const isAllSelected = () => {
    if (!canManageVoucher() || filteredVouchers.length === 0) return false;
    return filteredVouchers.every(voucher => selectedVouchers.has(voucher._id));
  };

  const handleBulkRestore = () => {
    if (selectedVouchers.size === 0) return;
    setBulkRestoreModal(true);
  };

  const handleBulkPermanentDelete = () => {
    if (selectedVouchers.size === 0) return;
    setBulkPermanentDeleteModal(true);
  };

  const handleBulkRestoreConfirm = async () => {
    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const voucherIds = Array.from(selectedVouchers);
      
      // Restore all selected vouchers
      await Promise.all(
        voucherIds.map(voucherId =>
          axios.post(`/api/vouchers/${voucherId}/restore`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      setSelectedVouchers(new Set());
      setBulkRestoreModal(false);
      
      toast.success(`${voucherIds.length} voucher${voucherIds.length > 1 ? 's' : ''} restored successfully.`, {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
      
      fetchTrashedVouchers(); // Refresh the list
    } catch (err) {
      console.error('Error bulk restoring vouchers:', err);
      toast.error('Failed to restore some vouchers. Please try again.', {
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
      setBulkActionLoading(false);
    }
  };

  const handleBulkPermanentDeleteConfirm = async () => {
    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const voucherIds = Array.from(selectedVouchers);
      
      // Permanently delete all selected vouchers
      await Promise.all(
        voucherIds.map(voucherId =>
          axios.delete(`/api/vouchers/${voucherId}/permanent`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );

      setSelectedVouchers(new Set());
      setBulkPermanentDeleteModal(false);
      
      toast.success(`${voucherIds.length} voucher${voucherIds.length > 1 ? 's' : ''} permanently deleted.`, {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
      
      fetchTrashedVouchers(); // Refresh the list
    } catch (err) {
      console.error('Error bulk permanently deleting vouchers:', err);
      toast.error('Failed to permanently delete some vouchers. Please try again.', {
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
      setBulkActionLoading(false);
    }
  };

  // Simple helper function to check if user can manage a voucher
  const canManageVoucher = () => {
    // Only full admins can manage vouchers in trash (restore/delete)
    // Regular users and accountants cannot restore or permanently delete vouchers
    return isAdmin && !isAccountant;
  };

  const fetchTrashedVouchers = useCallback(async (userIsAdmin = isAdmin, userIsAccountant = isAccountant, userId = currentUserId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vouchers/trash', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      let vouchersToShow = response.data.data;
      
      // Apply role-based filtering: normal users can only see their own vouchers
      if (!userIsAdmin && !userIsAccountant && userId) {
        vouchersToShow = response.data.data.filter(voucher => 
          voucher.createdBy && voucher.createdBy._id === userId
        );
      }
      
      setTrashedVouchers(vouchersToShow);
      setFilteredVouchers(vouchersToShow);
      
      // Extract unique users for filter dropdown
      const users = vouchersToShow
        .filter(voucher => voucher.createdBy && voucher.createdBy.username)
        .map(voucher => voucher.createdBy)
        .filter((user, index, arr) => 
          arr.findIndex(u => u._id === user._id) === index
        )
        .sort((a, b) => a.username.localeCompare(b.username));
      
      setUniqueUsers(users);
      setError('');
    } catch (err) {
      console.error('Error fetching trashed vouchers:', err);
      setError('Failed to load trashed vouchers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isAccountant, currentUserId]);

  // Initialize user info and fetch data
  useEffect(() => {
    const initializeUserAndFetchData = async () => {
      // Check if the current user is an admin or accountant
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userIsAdmin = user.isAdmin || false;
      const userIsAccountant = user.isAccountant || false;
      const userId = user.id || null;
      
      setIsAdmin(userIsAdmin);
      setIsAccountant(userIsAccountant);
      setCurrentUserId(userId);

      // Now fetch trashed vouchers with the correct user info
      await fetchTrashedVouchers(userIsAdmin, userIsAccountant, userId);
    };

    initializeUserAndFetchData();
  }, [fetchTrashedVouchers]);

  // Clear selected vouchers when filters change
  useEffect(() => {
    setSelectedVouchers(new Set());
  }, [searchQuery, userFilter, dateFilter, customDate, arrivalDateFilter, customArrivalDate]);

  // Helper function to check if a date falls within a range
  const isDateInRange = (dateString, range, customDateValue = null) => {
    if (!dateString || !range) return true;
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Handle custom date
    if (range === 'custom' && customDateValue) {
      const selectedDate = new Date(customDateValue);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      return dateOnly.getTime() === selectedDateOnly.getTime();
    }
    
    // Handle month-based filtering
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const monthIndex = monthNames.indexOf(range);
    if (monthIndex !== -1) {
      // Check if the date is in the specified month of the current year
      return date.getMonth() === monthIndex && date.getFullYear() === now.getFullYear();
    }
    
    // Handle year-based filtering
    switch (range) {
      case 'this-year': {
        return date.getFullYear() === now.getFullYear();
      }
      
      case 'last-year': {
        return date.getFullYear() === now.getFullYear() - 1;
      }
      
      default:
        return true;
    }
  };

  // Filter vouchers based on search query, user filter, and date filters
  useEffect(() => {
    const applyFilters = async () => {
      // Show loading if there are active filters
      const hasActiveFilters = searchQuery || userFilter || dateFilter || arrivalDateFilter;
      
      if (hasActiveFilters && trashedVouchers.length > 0) {
        setFilterLoading(true);
      }

      // Small delay to show loading state for better UX
      if (hasActiveFilters) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      let filtered = trashedVouchers;
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(voucher => 
          voucher.clientName.toLowerCase().includes(query) || 
          voucher.voucherNumber.toString().includes(query)
        );
      }
      
      // Apply user filter
      if (userFilter) {
        filtered = filtered.filter(voucher => 
          voucher.createdBy && voucher.createdBy._id === userFilter
        );
      }
      
      // Apply creation date filter
      if (dateFilter) {
        filtered = filtered.filter(voucher => 
          isDateInRange(voucher.createdAt, dateFilter, customDate)
        );
      }
      
      // Apply arrival date filter
      if (arrivalDateFilter) {
        filtered = filtered.filter(voucher => 
          isDateInRange(voucher.arrivalDate, arrivalDateFilter, customArrivalDate)
        );
      }
      
      setFilteredVouchers(filtered);
      setFilterLoading(false);
    };

    applyFilters();
  }, [searchQuery, userFilter, dateFilter, customDate, arrivalDateFilter, customArrivalDate, trashedVouchers]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to format filter labels
  const formatFilterLabel = (filter) => {
    if (filter === 'custom') return 'Custom Date';
    if (filter === 'this-year') return 'This Year';
    if (filter === 'last-year') return 'Last Year';
    return filter.charAt(0).toUpperCase() + filter.slice(1);
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    // Clear custom date when switching away from custom
    if (value !== 'custom') {
      setCustomDate('');
    }
  };

  const handleArrivalDateFilterChange = (value) => {
    setArrivalDateFilter(value);
    // Clear custom date when switching away from custom
    if (value !== 'custom') {
      setCustomArrivalDate('');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setUserFilter('');
    setDateFilter('');
    setCustomDate('');
    setArrivalDateFilter('');
    setCustomArrivalDate('');
  };

  const handleRestoreClick = async (voucher) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/vouchers/${voucher._id}/restore`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Voucher restored successfully', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
      fetchTrashedVouchers(); // Refresh the list
    } catch (err) {
      console.error('Error restoring voucher:', err);
      toast.error('Failed to restore voucher');
    }
  };

  const handlePermanentDeleteClick = (voucher) => {
    setVoucherToDelete(voucher);
    setPermanentDeleteModal(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!voucherToDelete) return;
    
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/vouchers/${voucherToDelete._id}/permanent`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Voucher permanently deleted', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
      setPermanentDeleteModal(false);
      setVoucherToDelete(null);
      fetchTrashedVouchers(); // Refresh the list
    } catch (err) {
      console.error('Error permanently deleting voucher:', err);
      toast.error('Failed to permanently delete voucher');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trash</h1>
        <div className="flex gap-2 sm:gap-3">
          {/* Bulk Action Buttons - Show when vouchers are selected */}
          {selectedVouchers.size > 0 && canManageVoucher() && (
            <>
              <CustomButton 
                variant="green"
                onClick={handleBulkRestore}
                icon={FaTrashRestore}
              >
                <span className="hidden sm:inline">Restore Selected ({selectedVouchers.size})</span>
                <span className="sm:hidden">Restore ({selectedVouchers.size})</span>
              </CustomButton>
              <CustomButton 
                variant="red"
                onClick={handleBulkPermanentDelete}
                icon={FaTrash}
              >
                <span className="hidden sm:inline">Delete Forever ({selectedVouchers.size})</span>
                <span className="sm:hidden">Delete ({selectedVouchers.size})</span>
              </CustomButton>
            </>
          )}
          <Link to="/vouchers">
            <CustomButton variant="gray">
              Back to Vouchers
            </CustomButton>
          </Link>
        </div>
      </div>

      <Card className="dark:bg-slate-950">
        {/* Search Bar and Filters */}
        <div className="mb-4">
          {/* Search Bar */}
          <div className="mb-4">
            <Search
              id="trash-search"
              placeholder="Search by client name or voucher number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 sm:gap-4 lg:justify-center">
            {/* Creation Date Filter */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48">
                <Select
                  id="dateFilter"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  placeholder="Created - All Time"
                  options={[
                    { value: '', label: 'Created - All Time' },
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
              
              {/* Custom Creation Date Picker */}
              {dateFilter === 'custom' && (
                <div className="w-32 sm:w-40">
                  <CustomDatePicker
                    value={customDate}
                    onChange={setCustomDate}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              )}
            </div>

            {/* Arrival Date Filter */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48">
                <Select
                  id="arrivalDateFilter"
                  value={arrivalDateFilter}
                  onChange={handleArrivalDateFilterChange}
                  placeholder="Arrival - All Time"
                  options={[
                    { value: '', label: 'Arrival - All Time' },
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
              
              {/* Custom Arrival Date Picker */}
              {arrivalDateFilter === 'custom' && (
                <div className="w-32 sm:w-40">
                  <CustomDatePicker
                    value={customArrivalDate}
                    onChange={setCustomArrivalDate}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              )}
            </div>

            {/* User Filter - Show for admins or when there are multiple users */}
                          {(isAdmin || isAccountant || uniqueUsers.length > 1) && (
              <div className="w-full sm:w-64 sm:col-span-2 lg:col-span-1">
                <SearchableSelect
                  id="userFilter"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Users' },
                    ...uniqueUsers.map(user => ({
                      value: user._id,
                      label: user.username
                    }))
                  ]}
                  placeholder="Search users..."
                />
              </div>
            )}

            {/* Clear Filters Button */}
            {(searchQuery || userFilter || dateFilter || arrivalDateFilter) && (
              <div className="flex items-start sm:col-span-2 lg:col-span-1 justify-center sm:justify-start">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                >
                  <FaTimes className="w-3 h-3" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || userFilter || dateFilter || arrivalDateFilter) && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Search: "{searchQuery}"
                </span>
              )}
              {userFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  User: {uniqueUsers.find(user => user._id === userFilter)?.username || 'Unknown'}
                </span>
              )}
              {dateFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Created: {dateFilter === 'custom' ? formatDate(customDate) : formatFilterLabel(dateFilter)}
                </span>
              )}
              {arrivalDateFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Arrival: {arrivalDateFilter === 'custom' ? formatDate(customArrivalDate) : formatFilterLabel(arrivalDateFilter)}
                </span>
              )}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filterLoading ? (
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {(searchQuery || userFilter || dateFilter || arrivalDateFilter) ? 'No vouchers match your filter criteria.' : 'No vouchers in trash.'}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <CustomScrollbar>
                <CustomTable
                  headers={[
                    ...(canManageVoucher() ? [{ 
                      label: (
                        <input
                          type="checkbox"
                          checked={isAllSelected()}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                      ),
                      className: "w-12"
                    }] : []),
                    { label: 'Voucher\u00A0#' },
                    { label: 'Client' },
                    { label: 'Office' },
                    { label: 'Arrival' },
                    { label: 'Departure' },
                    { label: 'Capital' },
                    { label: 'Total' },
                    { label: 'Profit' },
                    { label: 'Created\u00A0By' },
                    { label: 'Deleted' },
                    ...(isAdmin || isAccountant ? [{ label: 'Deleted\u00A0By' }] : []),
                    { label: 'Actions' }
                  ]}
                  data={filteredVouchers}
                  renderRow={(voucher) => {
                    const isSelected = selectedVouchers.has(voucher._id);
                    
                    return (
                      <>
                        {/* Checkbox column */}
                        {canManageVoucher() && (
                          <Table.Cell className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectVoucher(voucher._id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                          </Table.Cell>
                        )}
                        <Table.Cell className="px-4 py-3">
                          <Link 
                            to={`/vouchers/${voucher._id}`}
                            className="font-medium text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                            title={`View voucher #${voucher.voucherNumber} details`}
                          >
                            {voucher.voucherNumber}
                          </Link>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-white truncate max-w-[200px]">
                            {voucher.clientName.length > 20 ? voucher.clientName.substring(0, 20) + '...' : voucher.clientName}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {voucher.nationality}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="text-sm truncate max-w-[150px]">
                            {voucher.officeName ? (
                              (isAdmin || isAccountant) ? (
                                <Link 
                                  to={`/office/${encodeURIComponent(voucher.officeName)}`}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                                  title={`View ${voucher.officeName} office details`}
                                >
                                  {voucher.officeName}
                                </Link>
                              ) : (
                                <span className="text-gray-900 dark:text-white">{voucher.officeName}</span>
                              )
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">-</span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{formatDate(voucher.arrivalDate)}</Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{formatDate(voucher.departureDate)}</Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                          {voucher.capital ? `${getCurrencySymbol(voucher.currency)}${voucher.capital}` : '-'}
                        </Table.Cell>
                        <Table.Cell className="text-sm font-medium text-gray-900 dark:text-white px-4 py-3">
                          {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                        </Table.Cell>
                        <Table.Cell className={`${getProfitColorClass(voucher.capital ? voucher.totalAmount - voucher.capital : 0)} px-4 py-3`}>
                          {voucher.capital ? 
                            `${getCurrencySymbol(voucher.currency)}${(voucher.totalAmount - voucher.capital).toFixed(2)}` : 
                            '-'
                          }
                        </Table.Cell>
                        <Table.Cell className="text-sm px-4 py-3">
                          {voucher.createdBy ? (
                            <Link 
                              to={`/profile/${voucher.createdBy._id}`}
                              className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 hover:underline transition-colors duration-200"
                              title={`View ${voucher.createdBy.username}'s profile`}
                            >
                              {voucher.createdBy.username.length > 10 ? voucher.createdBy.username.substring(0, 10) + '...' : voucher.createdBy.username}
                            </Link>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">N/A</span>
                          )}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{formatDate(voucher.deletedAt)}</Table.Cell>
                        {(isAdmin || isAccountant) && (
                          <Table.Cell className="text-sm text-red-600 dark:text-red-300 px-4 py-3">
                            {voucher.deletedBy ? <span className="font-semibold">{voucher.deletedBy.username.length > 12 ? voucher.deletedBy.username.substring(0, 12) + '...' : voucher.deletedBy.username}</span> : 'N/A'}
                          </Table.Cell>
                        )}
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {canManageVoucher() && (
                              <>
                                <CustomButton
                                  onClick={() => handleRestoreClick(voucher)}
                                  variant="green"
                                  size="xs"
                                  icon={FaTrashRestore}
                                  title="Restore voucher"
                                />
                                <CustomButton
                                  onClick={() => handlePermanentDeleteClick(voucher)}
                                  variant="red"
                                  size="xs"
                                  icon={FaTrash}
                                  title="Delete forever"
                                />
                              </>
                            )}
                          </div>
                        </Table.Cell>
                      </>
                    );
                  }}
                  emptyMessage={(searchQuery || userFilter || dateFilter || arrivalDateFilter) ? 'No vouchers match your filter criteria.' : 'No vouchers in trash.'}
                />
              </CustomScrollbar>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden">
              <CustomScrollbar className="pr-1">
                <div className="grid grid-cols-1 gap-4">
                  {filteredVouchers.map(voucher => {
                    const isSelected = selectedVouchers.has(voucher._id);
                    
                    return (
                      <Card key={voucher._id} className={`overflow-hidden shadow-sm hover:shadow dark:border-gray-700 dark:bg-slate-900 ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}>
                        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Mobile Checkbox */}
                            {canManageVoucher() && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleSelectVoucher(voucher._id, e.target.checked)}
                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                              />
                            )}
                            <div className="flex-1">
                              <Link 
                                to={`/vouchers/${voucher._id}`}
                                className="text-lg font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                                title={`View voucher #${voucher.voucherNumber} details`}
                              >
                                #{voucher.voucherNumber}
                              </Link>
                              <div className="text-sm text-gray-800 dark:text-gray-200">{voucher.clientName}</div>
                              {voucher.officeName && (
                                (isAdmin || isAccountant) ? (
                                  <Link 
                                    to={`/office/${encodeURIComponent(voucher.officeName)}`}
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                                    title={`View ${voucher.officeName} office details`}
                                  >
                                    {voucher.officeName}
                                  </Link>
                                ) : (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{voucher.officeName}</div>
                                )
                              )}
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full">
                            Deleted {formatDate(voucher.deletedAt)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Arrival</div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(voucher.arrivalDate)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-purple-600 dark:text-purple-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Departure</div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(voucher.departureDate)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <FaUser className="mr-2 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Created By</div>
                              <div className="text-sm">
                                {voucher.createdBy ? (
                                  <Link 
                                    to={`/profile/${voucher.createdBy._id}`}
                                    className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 hover:underline transition-colors duration-200"
                                    title={`View ${voucher.createdBy.username}'s profile`}
                                  >
                                    {voucher.createdBy.username}
                                  </Link>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="mr-2 text-orange-600 dark:text-orange-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Capital</div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {voucher.capital ? `${getCurrencySymbol(voucher.currency)}${voucher.capital}` : '-'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="mr-2 text-green-600 dark:text-green-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className={getProfitColorClass(voucher.capital ? voucher.totalAmount - voucher.capital : 0, true).replace('text-sm', 'text-lg')}>
                            <span className="text-xs text-gray-600 dark:text-gray-400 block">Profit</span>
                            {voucher.capital ? 
                              `${getCurrencySymbol(voucher.currency)}${(voucher.totalAmount - voucher.capital).toFixed(2)}` : 
                              '-'
                            }
                          </div>
                          
                          {canManageVoucher() && (
                            <div className="flex space-x-2">
                              <CustomButton 
                                size="xs" 
                                variant="green"
                                onClick={() => handleRestoreClick(voucher)}
                                icon={FaTrashRestore}
                                title="Restore voucher"
                              >
                              </CustomButton>
                              <CustomButton 
                                size="xs" 
                                variant="red"
                                onClick={() => handlePermanentDeleteClick(voucher)}
                                icon={FaTrash}
                                title="Delete forever"
                              >
                              </CustomButton>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CustomScrollbar>
            </div>
          </>
        )}
      </Card>

      {/* Bulk Restore Confirmation Modal */}
      <DeleteConfirmationModal
        show={bulkRestoreModal}
        onClose={() => setBulkRestoreModal(false)}
        onConfirm={handleBulkRestoreConfirm}
        isLoading={bulkActionLoading}
        itemType={`${selectedVouchers.size} voucher${selectedVouchers.size > 1 ? 's' : ''} (restore)`}
        itemName=""
        itemExtra=""
      />

      {/* Bulk Permanent Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={bulkPermanentDeleteModal}
        onClose={() => setBulkPermanentDeleteModal(false)}
        onConfirm={handleBulkPermanentDeleteConfirm}
        isLoading={bulkActionLoading}
        itemType={`${selectedVouchers.size} voucher${selectedVouchers.size > 1 ? 's' : ''} (permanently delete)`}
        itemName=""
        itemExtra=""
      />

      {/* Single Permanent Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={permanentDeleteModal}
        onClose={() => setPermanentDeleteModal(false)}
        onConfirm={handlePermanentDeleteConfirm}
        itemType="voucher (permanently)"
        itemName={`#${voucherToDelete?.voucherNumber || ''}`}
        itemExtra={voucherToDelete?.clientName || ''}
        isLoading={deleteLoading}
      />
    </div>
  );
} 