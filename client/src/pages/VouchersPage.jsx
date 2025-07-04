import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Alert, TextInput, Select } from 'flowbite-react';
import SearchableSelect from '../components/SearchableSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import StatusControls from '../components/StatusControls';
import CreatedByControls from '../components/CreatedByControls';
import FloatingTotalsPanel from '../components/FloatingTotalsPanel';
import CustomButton from '../components/CustomButton';
import RahalatekLoader from '../components/RahalatekLoader';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CustomScrollbar from '../components/CustomScrollbar';
import { toast } from 'react-hot-toast';
import { updateVoucherStatus, getAllVouchers } from '../utils/voucherApi';
import { FaTrash, FaEye, FaPen, FaCalendarAlt, FaPlane, FaMoneyBill, FaUser, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';

export default function VouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [arrivalDateFilter, setArrivalDateFilter] = useState('');
  const [customArrivalDate, setCustomArrivalDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [loading, setLoading] = useState(true);
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
  }, [searchQuery, userFilter, dateFilter, customDate, arrivalDateFilter, customArrivalDate, statusFilter, vouchers]);

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



  const handleDateFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setDateFilter(selectedFilter);

    if (selectedFilter !== 'custom') {
      setCustomDate('');
    }
  };

  const handleArrivalDateFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setArrivalDateFilter(selectedFilter);
    
    if (selectedFilter !== 'custom') {
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
            onClick={() => navigate('/trash')}
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

      <Card className="dark:bg-slate-900">
        <div className="mb-4">
          <div className="mb-4">
            <TextInput
              type="text"
              placeholder="Search by client name or voucher number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={FaSearch}
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 sm:gap-4 lg:justify-center">
            {/* Creation Date Filter */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48">
                <Select
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                >
                  <option value="">Created - All Time</option>
                  <option value="january">Created - January</option>
                  <option value="february">Created - February</option>
                  <option value="march">Created - March</option>
                  <option value="april">Created - April</option>
                  <option value="may">Created - May</option>
                  <option value="june">Created - June</option>
                  <option value="july">Created - July</option>
                  <option value="august">Created - August</option>
                  <option value="september">Created - September</option>
                  <option value="october">Created - October</option>
                  <option value="november">Created - November</option>
                  <option value="december">Created - December</option>
                  <option value="this-year">Created - This Year</option>
                  <option value="last-year">Created - Last Year</option>
                  <option value="custom">Created - Custom Date</option>
                </Select>
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
                  value={arrivalDateFilter}
                  onChange={handleArrivalDateFilterChange}
                >
                  <option value="">Arrival - All Time</option>
                  <option value="january">Arrival - January</option>
                  <option value="february">Arrival - February</option>
                  <option value="march">Arrival - March</option>
                  <option value="april">Arrival - April</option>
                  <option value="may">Arrival - May</option>
                  <option value="june">Arrival - June</option>
                  <option value="july">Arrival - July</option>
                  <option value="august">Arrival - August</option>
                  <option value="september">Arrival - September</option>
                  <option value="october">Arrival - October</option>
                  <option value="november">Arrival - November</option>
                  <option value="december">Arrival - December</option>
                  <option value="this-year">Arrival - This Year</option>
                  <option value="last-year">Arrival - Last Year</option>
                  <option value="custom">Arrival - Custom Date</option>
                </Select>
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="await">Awaiting</option>
                <option value="arrived">Arrived</option>
                <option value="canceled">Canceled</option>
              </Select>
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
            {(searchQuery || userFilter || dateFilter || arrivalDateFilter || statusFilter) && (
              <div className="flex items-start sm:col-span-2 lg:col-span-1 justify-center sm:justify-start">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                >
                  <FaTimes className="w-3 h-3" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || userFilter || dateFilter || arrivalDateFilter || statusFilter) && (
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
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {(searchQuery || userFilter || dateFilter || arrivalDateFilter) ? 'No vouchers match your filter criteria.' : 'No vouchers found. Click "Create New Voucher" to create one.'}
          </div>
        ) : (
          <>
            {/* Desktop Table View (visible on sm screens and up) */}
            <div className="hidden sm:block overflow-x-auto">
              <CustomScrollbar>
                <Table striped>
                  <Table.Head className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Voucher #</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Client</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Status</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Arrival</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Departure</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Capital</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Total</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Profit</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Created</Table.HeadCell>
                                            {(isAdmin || isAccountant) && <Table.HeadCell className="text-sm font-semibold px-4 py-3">Created By</Table.HeadCell>}
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredVouchers.map(voucher => (
                      <Table.Row key={voucher._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                          {voucher.voucherNumber}
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
                          <div className="flex space-x-4">
                            <Link 
                              to={`/vouchers/${voucher._id}`}
                              className="font-medium text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View
                            </Link>
                            
                            {canManageVoucher(voucher) && (
                              <>
                                <Link 
                                  to={`/edit-voucher/${voucher._id}`}
                                  className="font-medium text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                >
                                  Edit
                                </Link>
                                {canDeleteVoucher() && (
                                  <button
                                    className="font-medium text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() => handleDeleteClick(voucher)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    
                    {/* Totals Row - Only for Admins and Accountants */}
                    {(isAdmin || isAccountant) && filteredVouchers.length > 0 && Object.keys(totals).map((currency, index) => (
                      <Table.Row key={currency} className="bg-gray-100 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-600">
                        <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3" colSpan="5">
                          {index === 0 ? 'TOTALS' : ''} {currency}
                        </Table.Cell>
                        <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3">
                          {getCurrencySymbol(currency)}{totals[currency].totalCapital.toFixed(2)}
                        </Table.Cell>
                        <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3">
                          {getCurrencySymbol(currency)}{totals[currency].totalAmount.toFixed(2)}
                        </Table.Cell>
                        <Table.Cell className="font-bold text-sm text-green-600 dark:text-green-400 px-4 py-3">
                          {getCurrencySymbol(currency)}{totals[currency].totalProfit.toFixed(2)}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3" colSpan={(isAdmin || isAccountant) ? "3" : "2"}>
                          {/* Empty cells for Created, Created By (if admin), Actions */}
                        </Table.Cell>
                      </Table.Row>
                    ))}

                  </Table.Body>
                </Table>
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
                          <div className="text-lg font-medium text-gray-900 dark:text-white">#{voucher.voucherNumber}</div>
                          <div className="text-sm text-gray-800 dark:text-gray-200">{voucher.clientName}</div>
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
                      
                      <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Link 
                          to={`/vouchers/${voucher._id}`}
                          className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FaEye className="mr-1" />
                          <span>View</span>
                        </Link>
                        
                        {canManageVoucher(voucher) && (
                          <>
                            <Link
                              to={`/edit-voucher/${voucher._id}`}
                              className="flex items-center justify-center text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                              <FaPen className="mr-1" />
                              <span>Edit</span>
                            </Link>
                            {canDeleteVoucher() && (
                              <button
                                className="flex items-center justify-center text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => handleDeleteClick(voucher)}
                              >
                                <FaTrash className="mr-1" />
                                <span>Delete</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
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