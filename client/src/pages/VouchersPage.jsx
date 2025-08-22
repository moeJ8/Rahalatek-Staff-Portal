import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Alert, TextInput } from 'flowbite-react';
import SearchableSelect from '../components/SearchableSelect';
import Select from '../components/Select';
import Search from '../components/Search';
import CustomDatePicker from '../components/CustomDatePicker';
import StatusControls from '../components/StatusControls';
import CreatedByControls from '../components/CreatedByControls';
import FloatingTotalsPanel from '../components/FloatingTotalsPanel';
import CustomButton from '../components/CustomButton';
import CustomTable from '../components/CustomTable';
import RahalatekLoader from '../components/RahalatekLoader';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CustomScrollbar from '../components/CustomScrollbar';
import { toast } from 'react-hot-toast';
import { updateVoucherStatus, getAllVouchers } from '../utils/voucherApi';
import { FaTrash, FaPen, FaCalendarAlt, FaPlane, FaMoneyBill, FaUser, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';

export default function VouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [officeFilter, setOfficeFilter] = useState('');
  const [uniqueOffices, setUniqueOffices] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [arrivalDateFilter, setArrivalDateFilter] = useState('');
  const [customArrivalDate, setCustomArrivalDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

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

  // Fetch all users for the created by dropdown (admin only)
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const usersWithCurrentUser = [...response.data];

      const currentUserExists = usersWithCurrentUser.some(user => user._id === currentUser.id);
      if (!currentUserExists && currentUser.id && currentUser.username) {
        usersWithCurrentUser.unshift({
          _id: currentUser.id,
          username: currentUser.username,
          isAdmin: currentUser.isAdmin,
          isAccountant: currentUser.isAccountant
        });
      }

      usersWithCurrentUser.sort((a, b) => a.username.localeCompare(b.username));
      
      setAllUsers(usersWithCurrentUser);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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

      // Now fetch vouchers with the correct user info
      await fetchVouchers(userIsAdmin, userIsAccountant, userId);
      
      // Fetch all users if admin (for created by dropdown)
      if (userIsAdmin) {
        fetchAllUsers();
      }
    };

    initializeUserAndFetchData();
  }, []);

  const handleCreatedByUpdate = async (voucherId, newCreatedBy) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/vouchers/${voucherId}/created-by`,
        { createdBy: newCreatedBy },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setVouchers(prevVouchers =>
        prevVouchers.map(voucher =>
          voucher._id === voucherId
            ? { ...voucher, ...response.data.data }
            : voucher
        )
      );
      
      toast.success(`Voucher ownership transferred successfully`, {
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
    } catch (err) {
      console.error('Error updating voucher created by:', err);
      toast.error(err.response?.data?.message || 'Failed to update voucher ownership', {
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
      throw err; // Re-throw to let CreatedByControls handle the error
    }
  };

  // Simple helper function to check if user can manage a voucher
  const canManageVoucher = (voucher) => {
    if (isAdmin || isAccountant) return true;
    return voucher.createdBy && voucher.createdBy._id === currentUserId;
  };
  
  // Check if user can delete vouchers (only full admins, not accountants or regular users)
  const canDeleteVoucher = () => {
    // Only full admins can delete vouchers
    return isAdmin && !isAccountant;
  };

  const fetchVouchers = async (userIsAdmin = isAdmin, userIsAccountant = isAccountant, userId = currentUserId) => {
    setLoading(true);
    try {
      const response = await getAllVouchers();
      
      let vouchersToShow = response.data;
      
      // Apply role-based filtering: normal users can only see their own vouchers
      if (!userIsAdmin && !userIsAccountant && userId) {
        vouchersToShow = response.data.filter(voucher => 
          voucher.createdBy && voucher.createdBy._id === userId
        );
      }
      
      setVouchers(vouchersToShow);
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
      
      // Extract unique offices for filter dropdown
      const offices = vouchersToShow
        .filter(voucher => voucher.officeName)
        .map(voucher => voucher.officeName)
        .filter((office, index, arr) => arr.indexOf(office) === index)
        .sort();
      
      setUniqueOffices(offices);
      setError('');
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError('Failed to load vouchers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (voucherId, newStatus) => {
    try {
      const response = await updateVoucherStatus(voucherId, newStatus);
      
      // Update the voucher in the local state
      setVouchers(prevVouchers =>
        prevVouchers.map(voucher =>
          voucher._id === voucherId
            ? { ...voucher, ...response.data }
            : voucher
        )
      );
      
      toast.success(`Voucher status updated to "${newStatus}"`, {
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
    } catch (err) {
      console.error('Error updating voucher status:', err);
      toast.error(err.response?.data?.message || 'Failed to update voucher status', {
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
      throw err; // Re-throw to let StatusControls handle the error
    }
  };



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
      const hasActiveFilters = searchQuery || userFilter || officeFilter || dateFilter || arrivalDateFilter || statusFilter;
      
      if (hasActiveFilters && vouchers.length > 0) {
        setFilterLoading(true);
      }

      // Small delay to show loading state for better UX
      if (hasActiveFilters) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      let filtered = vouchers;
      
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
      
      // Apply office filter
      if (officeFilter) {
        filtered = filtered.filter(voucher => 
          voucher.officeName === officeFilter
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
      
      // Apply status filter
      if (statusFilter) {
        filtered = filtered.filter(voucher => 
          (voucher.status || 'await') === statusFilter
        );
      }
      
      setFilteredVouchers(filtered);
      setFilterLoading(false);
    };

    applyFilters();
  }, [searchQuery, userFilter, officeFilter, dateFilter, customDate, arrivalDateFilter, customArrivalDate, statusFilter, vouchers]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatFilterLabel = (filter) => {
    if (filter === 'custom') return 'Custom Date';
    if (filter === 'this-year') return 'This Year';
    if (filter === 'last-year') return 'Last Year';
    return filter.charAt(0).toUpperCase() + filter.slice(1);
  };



  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value !== 'custom') {
      setCustomDate('');
    }
  };

  const handleArrivalDateFilterChange = (value) => {
    setArrivalDateFilter(value);
    if (value !== 'custom') {
      setCustomArrivalDate('');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setUserFilter('');
    setOfficeFilter('');
    setDateFilter('');
    setCustomDate('');
    setArrivalDateFilter('');
    setCustomArrivalDate('');
    setStatusFilter('');
  };

  const calculateTotals = () => {
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
  };

  const totals = calculateTotals();

  const handleDeleteClick = (voucher) => {
    setVoucherToDelete(voucher);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!voucherToDelete) return;
    
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/vouchers/${voucherToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setVouchers(prevVouchers => 
        prevVouchers.filter(v => v._id !== voucherToDelete._id)
      );
      
      toast.success(`Voucher #${voucherToDelete.voucherNumber} for ${voucherToDelete.clientName} has been moved to trash.`, {
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
      setDeleteModal(false);
      setVoucherToDelete(null);
    } catch (err) {
      console.error('Error deleting voucher:', err);
      toast.error('Failed to delete voucher. Please try again.', {
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
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-[105rem] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Vouchers</h1>
        <div className="flex gap-2 sm:gap-3">
          <CustomButton 
            variant="gray"
            onClick={() => navigate('/vouchers/trash')}
            icon={FaTrash}
          >
            <span className="hidden sm:inline">View Trash</span>
          </CustomButton>
          <CustomButton 
            variant="blueToTeal" 
            onClick={() => navigate('/vouchers/new')}
            icon={FaPlus}
          >
            <span className="hidden sm:inline">Create New Voucher</span>
          </CustomButton>
        </div>
      </div>

      <Card className="dark:bg-slate-950">
        <div className="mb-4">
          <div className="mb-4">
            <Search
              id="voucher-search"
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

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select
                id="statusFilter"
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
            
            {/* Office Filter */}
            {uniqueOffices.length > 0 && (
              <div className="w-full sm:w-64 sm:col-span-2 lg:col-span-1">
                <SearchableSelect
                  id="officeFilter"
                  value={officeFilter}
                  onChange={(e) => setOfficeFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Offices' },
                    ...uniqueOffices.map(office => ({
                      value: office,
                      label: office
                    }))
                  ]}
                  placeholder="Search offices..."
                />
              </div>
            )}

            {/* Clear Filters Button */}
            {(searchQuery || userFilter || officeFilter || dateFilter || arrivalDateFilter || statusFilter) && (
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
          {(searchQuery || userFilter || officeFilter || dateFilter || arrivalDateFilter || statusFilter) && (
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
              {officeFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  Office: {officeFilter}
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
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Status: {statusFilter === 'await' ? 'Awaiting' : statusFilter === 'arrived' ? 'Arrived' : 'Canceled'}
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
            {(searchQuery || userFilter || officeFilter || dateFilter || arrivalDateFilter) ? 'No vouchers match your filter criteria.' : 'No vouchers found. Click "Create New Voucher" to create one.'}
          </div>
        ) : (
          <>
            {/* Desktop Table View (visible on sm screens and up) */}
            <div className="hidden sm:block">
              <CustomScrollbar>
                <CustomTable
                  headers={[
                    { label: 'Voucher\u00A0#' },
                    { label: 'Client' },
                    { label: 'Office' },
                    { label: 'Status' },
                    { label: 'Arrival' },
                    { label: 'Departure' },
                    { label: 'Capital' },
                    { label: 'Total' },
                    { label: 'Profit' },
                    { label: 'Created' },
                    ...(isAdmin || isAccountant ? [{ label: 'Created By' }] : []),
                    { label: 'Actions' }
                  ]}
                  data={[
                    ...filteredVouchers,
                    ...(isAdmin || isAccountant && filteredVouchers.length > 0 ? 
                      Object.keys(totals).map((currency, index) => ({
                        _id: `totals-${currency}`,
                        isTotal: true,
                        currency,
                        isFirstTotal: index === 0,
                        ...totals[currency]
                      })) : []
                    )
                  ]}
                  renderRow={(item) => {
                    if (item.isTotal) {
                      return (
                        <>
                          {/* Voucher # */}
                          <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {item.isFirstTotal ? 'TOTALS' : ''}
                          </Table.Cell>
                          {/* Client */}
                          <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {item.currency}
                          </Table.Cell>
                          {/* Office */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Status */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Arrival */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Departure */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Capital */}
                          <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {getCurrencySymbol(item.currency)}{item.totalCapital.toFixed(2)}
                          </Table.Cell>
                          {/* Total */}
                          <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {getCurrencySymbol(item.currency)}{item.totalAmount.toFixed(2)}
                          </Table.Cell>
                          {/* Profit */}
                          <Table.Cell className="font-bold text-sm text-green-600 dark:text-green-400 px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {getCurrencySymbol(item.currency)}{item.totalProfit.toFixed(2)}
                          </Table.Cell>
                          {/* Created */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Created By (if admin/accountant) */}
                          {(isAdmin || isAccountant) && (
                            <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          )}
                          {/* Actions */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                        </>
                      );
                    }
                    
                    // Regular voucher row
                    const voucher = item;
                    return (
                      <>
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
                            {voucher.clientName}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {voucher.nationality}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          {voucher.officeName ? (
                            voucher.officeName.toLowerCase() === 'direct client' ? (
                              <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                                Direct Client
                              </div>
                            ) : (
                              (isAdmin || isAccountant) ? (
                                <Link 
                                  to={`/office/${encodeURIComponent(voucher.officeName)}`}
                                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline truncate max-w-[150px] block"
                                  title={`View ${voucher.officeName} office details`}
                                >
                                  {voucher.officeName}
                                </Link>
                              ) : (
                                <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                                  {voucher.officeName}
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                              Direct Client
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <StatusControls
                            currentStatus={voucher.status || 'await'}
                            onStatusUpdate={(newStatus) => handleStatusUpdate(voucher._id, newStatus)}
                            canEdit={isAdmin || isAccountant}
                            arrivalDate={voucher.arrivalDate}
                          />
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
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{formatDate(voucher.createdAt)}</Table.Cell>
                        {(isAdmin || isAccountant) && (
                          <Table.Cell className="px-4 py-3">
                            <CreatedByControls
                              currentUserId={voucher.createdBy?._id}
                              currentUsername={voucher.createdBy?.username}
                              users={allUsers}
                              onUserUpdate={(newUserId) => handleCreatedByUpdate(voucher._id, newUserId)}
                              canEdit={isAdmin} // Only full admins can edit, not accountants
                            />
                          </Table.Cell>
                        )}
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {canManageVoucher(voucher) && (
                              <>
                                <CustomButton
                                  as={Link}
                                  to={`/edit-voucher/${voucher._id}`}
                                  variant="teal"
                                  size="xs"
                                  icon={FaPen}
                                  title="Edit voucher"
                                />
                                {canDeleteVoucher() && (
                                  <CustomButton
                                    onClick={() => handleDeleteClick(voucher)}
                                    variant="red"
                                    size="xs"
                                    icon={FaTrash}
                                    title="Delete voucher"
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </Table.Cell>
                      </>
                    );
                  }}
                  emptyMessage={(searchQuery || userFilter || officeFilter || dateFilter || arrivalDateFilter) ? 'No vouchers match your filter criteria.' : 'No vouchers found. Click "Create New Voucher" to create one.'}
                />
              </CustomScrollbar>
            </div>

            {/* Mobile Card View (visible on xs screens) */}
            <div className="sm:hidden">
              <CustomScrollbar className="pr-1">
                <div className="grid grid-cols-1 gap-4">
                  {filteredVouchers.map(voucher => (
                    <Card key={voucher._id} className="overflow-hidden shadow-sm hover:shadow dark:border-gray-700">
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                        <div>
                          <Link 
                            to={`/vouchers/${voucher._id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                            title={`View voucher #${voucher.voucherNumber} details`}
                          >
                            #{voucher.voucherNumber}
                          </Link>
                          <div className="text-sm text-gray-800 dark:text-gray-200">{voucher.clientName}</div>
                          {voucher.officeName ? (
                            voucher.officeName.toLowerCase() === 'direct client' ? (
                              <div className="text-xs text-gray-800 dark:text-gray-200">
                                Direct Client
                              </div>
                            ) : (
                              (isAdmin || isAccountant) ? (
                                <Link 
                                  to={`/office/${encodeURIComponent(voucher.officeName)}`}
                                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                  title={`View ${voucher.officeName} office details`}
                                >
                                  {voucher.officeName}
                                </Link>
                              ) : (
                                <div className="text-xs text-gray-800 dark:text-gray-200">
                                  {voucher.officeName}
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-xs text-gray-800 dark:text-gray-200">
                              Direct Client
                            </div>
                          )}
                        </div>
                        <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                          {voucher.nationality}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <FaPlane className="mr-2 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Arrival</div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(voucher.arrivalDate)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaPlane className="mr-2 text-red-600 dark:text-red-400 transform rotate-180" />
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Departure</div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(voucher.departureDate)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center col-span-2">
                          <div className="flex items-center">
                            <svg className="mr-2 text-purple-600 dark:text-purple-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="mr-3">
                              <div className="text-xs text-gray-600 dark:text-gray-400">Status</div>
                            </div>
                          </div>
                          <StatusControls
                            currentStatus={voucher.status || 'await'}
                            onStatusUpdate={(newStatus) => handleStatusUpdate(voucher._id, newStatus)}
                            canEdit={isAdmin || isAccountant}
                            arrivalDate={voucher.arrivalDate}
                            size="xs"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <FaMoneyBill className="mr-2 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-purple-600 dark:text-purple-400" />
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Created</div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(voucher.createdAt)}</div>
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
                          <svg className="mr-2 text-emerald-600 dark:text-emerald-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                                                     <div>
                             <div className="text-xs text-gray-600 dark:text-gray-400">Profit</div>
                             <div className={getProfitColorClass(voucher.capital ? voucher.totalAmount - voucher.capital : 0)}>
                               {voucher.capital ? 
                                 `${getCurrencySymbol(voucher.currency)}${(voucher.totalAmount - voucher.capital).toFixed(2)}` : 
                                 '-'
                               }
                             </div>
                           </div>
                        </div>
                        
                        {(isAdmin || isAccountant) && voucher.createdBy && (
                          <div className="flex items-center col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <FaUser className="mr-2 text-indigo-600 dark:text-indigo-400" />
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Created By</div>
                              </div>
                              <CreatedByControls
                                currentUserId={voucher.createdBy?._id}
                                currentUsername={voucher.createdBy?.username}
                                users={allUsers}
                                onUserUpdate={(newUserId) => handleCreatedByUpdate(voucher._id, newUserId)}
                                canEdit={isAdmin} // Only full admins can edit, not accountants
                                size="xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {canManageVoucher(voucher) && (
                        <div className="flex justify-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <CustomButton
                            as={Link}
                            to={`/edit-voucher/${voucher._id}`}
                            variant="teal"
                            size="sm"
                            icon={FaPen}
                            title="Edit voucher"
                          >
                            Edit
                          </CustomButton>
                          {canDeleteVoucher() && (
                            <CustomButton
                              onClick={() => handleDeleteClick(voucher)}
                              variant="red"
                              size="sm"
                              icon={FaTrash}
                              title="Delete voucher"
                            >
                              Delete
                            </CustomButton>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CustomScrollbar>
            </div>

            {/* Mobile Totals Summary - Only for Admins and Accountants */}
            {(isAdmin || isAccountant) && filteredVouchers.length > 0 && (
              <div className="sm:hidden mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Totals Summary</h3>
                {Object.keys(totals).map((currency) => (
                  <Card key={currency} className="mb-3 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">{currency}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Capital</div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {getCurrencySymbol(currency)}{totals[currency].totalCapital.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {getCurrencySymbol(currency)}{totals[currency].totalAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Profit</div>
                        <div className="font-bold text-sm text-green-600 dark:text-green-400">
                          {getCurrencySymbol(currency)}{totals[currency].totalProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setVoucherToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
        itemType="voucher (move to trash)"
        itemName={`#${voucherToDelete?.voucherNumber || ''}`}
        itemExtra={voucherToDelete?.clientName || ''}
      />

      {/* Floating Totals Panel Component - Only for Admins and Accountants */}
      {(isAdmin || isAccountant) && (
        <FloatingTotalsPanel
          vouchers={vouchers}
          filteredVouchers={filteredVouchers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          uniqueUsers={uniqueUsers}
          officeFilter={officeFilter}
          setOfficeFilter={setOfficeFilter}
          uniqueOffices={uniqueOffices}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDate={customDate}
          setCustomDate={setCustomDate}
          arrivalDateFilter={arrivalDateFilter}
          setArrivalDateFilter={setArrivalDateFilter}
          customArrivalDate={customArrivalDate}
          setCustomArrivalDate={setCustomArrivalDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleDateFilterChange={handleDateFilterChange}
          handleArrivalDateFilterChange={handleArrivalDateFilterChange}
          handleClearFilters={handleClearFilters}
          formatFilterLabel={formatFilterLabel}
        />
      )}
    </div>
  );
} 