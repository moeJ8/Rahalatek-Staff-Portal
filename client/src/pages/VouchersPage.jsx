import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Alert, TextInput, Select } from 'flowbite-react';
import SearchableSelect from '../components/SearchableSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CustomScrollbar from '../components/CustomScrollbar';
import { toast } from 'react-hot-toast';
import { FaTrash, FaEye, FaPen, FaCalendarAlt, FaPlane, FaMoneyBill, FaUser, FaSearch, FaPlus } from 'react-icons/fa';

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
  const [departureDateFilter, setDepartureDateFilter] = useState('');
  const [customDepartureDate, setCustomDepartureDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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

  useEffect(() => {
    // Check if the current user is an admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.isAdmin || false);
    setCurrentUserId(user.id || null);
  }, []);

  // Simple helper function to check if user can manage a voucher
  const canManageVoucher = (voucher) => {
    if (isAdmin) return true;
    return voucher.createdBy && voucher.createdBy._id === currentUserId;
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      // Include the token in the request headers
      const response = await axios.get('/api/vouchers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setVouchers(response.data.data);
      setFilteredVouchers(response.data.data);
      
      // Extract unique users for filter dropdown
      const users = response.data.data
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

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Helper function to check if a date falls within a range
  const isDateInRange = (dateString, range, customDateValue = null) => {
    if (!dateString || !range) return true;
    
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Handle custom date
    if (range === 'custom' && customDateValue) {
      const selectedDate = new Date(customDateValue);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      return dateOnly.getTime() === selectedDateOnly.getTime();
    }
    
    switch (range) {
      case 'today': {
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return dateOnly.getTime() === today.getTime();
      }
      
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateOnlyYesterday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return dateOnlyYesterday.getTime() === yesterday.getTime();
      }
      
      case 'this-week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return date >= weekStart;
      }
      
      case 'last-week': {
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        lastWeekEnd.setHours(23, 59, 59, 999);
        return date >= lastWeekStart && date <= lastWeekEnd;
      }
      
      case 'this-month': {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      
      case 'last-month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return date >= lastMonth && date <= lastMonthEnd;
      }
      
      case 'this-year': {
        return date.getFullYear() === now.getFullYear();
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
    
    // Apply departure date filter
    if (departureDateFilter) {
      filtered = filtered.filter(voucher => 
        isDateInRange(voucher.departureDate, departureDateFilter, customDepartureDate)
      );
    }
    
    setFilteredVouchers(filtered);
  }, [searchQuery, userFilter, dateFilter, customDate, arrivalDateFilter, customArrivalDate, departureDateFilter, customDepartureDate, vouchers]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };



  const handleDateFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setDateFilter(selectedFilter);
    
    // Clear custom date when switching away from custom
    if (selectedFilter !== 'custom') {
      setCustomDate('');
    }
  };

  const handleArrivalDateFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setArrivalDateFilter(selectedFilter);
    
    // Clear custom date when switching away from custom
    if (selectedFilter !== 'custom') {
      setCustomArrivalDate('');
    }
  };

  const handleDepartureDateFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setDepartureDateFilter(selectedFilter);
    
    // Clear custom date when switching away from custom
    if (selectedFilter !== 'custom') {
      setCustomDepartureDate('');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setUserFilter('');
    setDateFilter('');
    setCustomDate('');
    setArrivalDateFilter('');
    setCustomArrivalDate('');
    setDepartureDateFilter('');
    setCustomDepartureDate('');
  };

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
      
      // Remove the deleted voucher from the list
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vouchers</h1>
        <div className="flex gap-3">
          <Button 
            color="gray"
            onClick={() => navigate('/trash')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
          >
            <FaTrash className="mr-1 mt-1 text-xs" />
            View Trash
          </Button>
          <Button 
            gradientDuoTone="purpleToPink" 
            onClick={() => navigate('/vouchers/new')}
          >
            <FaPlus className="mr-1 mt-1 text-xs" />
            Create New Voucher
          </Button>
        </div>
      </div>

      <Card>
        {/* Search Bar and Filters */}
        <div className="mb-4">
          {/* Search Bar */}
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
          <div className="flex flex-col lg:flex-row gap-4 justify-center">
            {/* Creation Date Filter */}
            <div className="flex gap-2">
              <div className="w-48">
                <Select
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                >
                  <option value="">Created - All Time</option>
                  <option value="today">Created - Today</option>
                  <option value="yesterday">Created - Yesterday</option>
                  <option value="this-week">Created - This Week</option>
                  <option value="last-week">Created - Last Week</option>
                  <option value="this-month">Created - This Month</option>
                  <option value="last-month">Created - Last Month</option>
                  <option value="this-year">Created - This Year</option>
                  <option value="custom">Created - Custom Date</option>
                </Select>
              </div>
              
              {/* Custom Creation Date Picker */}
              {dateFilter === 'custom' && (
                <div className="w-40">
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
              <div className="w-48">
                <Select
                  value={arrivalDateFilter}
                  onChange={handleArrivalDateFilterChange}
                >
                  <option value="">Arrival - All Time</option>
                  <option value="today">Arrival - Today</option>
                  <option value="yesterday">Arrival - Yesterday</option>
                  <option value="this-week">Arrival - This Week</option>
                  <option value="last-week">Arrival - Last Week</option>
                  <option value="this-month">Arrival - This Month</option>
                  <option value="last-month">Arrival - Last Month</option>
                  <option value="this-year">Arrival - This Year</option>
                  <option value="custom">Arrival - Custom Date</option>
                </Select>
              </div>
              
              {/* Custom Arrival Date Picker */}
              {arrivalDateFilter === 'custom' && (
                <div className="w-40">
                  <CustomDatePicker
                    value={customArrivalDate}
                    onChange={setCustomArrivalDate}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              )}
            </div>

            {/* Departure Date Filter */}
            <div className="flex gap-2">
              <div className="w-48">
                <Select
                  value={departureDateFilter}
                  onChange={handleDepartureDateFilterChange}
                >
                  <option value="">Departure - All Time</option>
                  <option value="today">Departure - Today</option>
                  <option value="yesterday">Departure - Yesterday</option>
                  <option value="this-week">Departure - This Week</option>
                  <option value="last-week">Departure - Last Week</option>
                  <option value="this-month">Departure - This Month</option>
                  <option value="last-month">Departure - Last Month</option>
                  <option value="this-year">Departure - This Year</option>
                  <option value="custom">Departure - Custom Date</option>
                </Select>
              </div>
              
              {/* Custom Departure Date Picker */}
              {departureDateFilter === 'custom' && (
                <div className="w-40">
                  <CustomDatePicker
                    value={customDepartureDate}
                    onChange={setCustomDepartureDate}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              )}
            </div>
            
            {/* User Filter - Show for admins or when there are multiple users */}
            {(isAdmin || uniqueUsers.length > 1) && (
              <div className="w-64">
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
            {(searchQuery || userFilter || dateFilter || arrivalDateFilter || departureDateFilter) && (
              <div className="flex items-start">
                <Button
                  color="gray"
                  size="sm"
                  onClick={handleClearFilters}
                  className="whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || userFilter || dateFilter || arrivalDateFilter || departureDateFilter) && (
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
                  Created: {dateFilter === 'custom' ? formatDate(customDate) : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1).replace('-', ' ')}
                </span>
              )}
              {arrivalDateFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Arrival: {arrivalDateFilter === 'custom' ? formatDate(customArrivalDate) : arrivalDateFilter.charAt(0).toUpperCase() + arrivalDateFilter.slice(1).replace('-', ' ')}
                </span>
              )}
              {departureDateFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                  Departure: {departureDateFilter === 'custom' ? formatDate(customDepartureDate) : departureDateFilter.charAt(0).toUpperCase() + departureDateFilter.slice(1).replace('-', ' ')}
                </span>
              )}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {(searchQuery || userFilter || dateFilter || arrivalDateFilter || departureDateFilter) ? 'No vouchers match your filter criteria.' : 'No vouchers found. Click "Create New Voucher" to create one.'}
          </div>
        ) : (
          <>
            {/* Desktop Table View (visible on sm screens and up) */}
            <div className="hidden sm:block overflow-x-auto">
              <CustomScrollbar>
                <Table striped>
                  <Table.Head className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Voucher #</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Client</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Arrival</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Departure</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Capital</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Total</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Created</Table.HeadCell>
                    {isAdmin && <Table.HeadCell className="text-sm font-semibold px-4 py-3">Created By</Table.HeadCell>}
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
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{formatDate(voucher.arrivalDate)}</Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{formatDate(voucher.departureDate)}</Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                          {voucher.capital ? `${getCurrencySymbol(voucher.currency)}${voucher.capital}` : '-'}
                        </Table.Cell>
                        <Table.Cell className="text-sm font-medium text-gray-900 dark:text-white px-4 py-3">
                          {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{formatDate(voucher.createdAt)}</Table.Cell>
                        {isAdmin && (
                          <Table.Cell className="text-sm text-indigo-600 dark:text-indigo-300 px-4 py-3">
                            {voucher.createdBy ? <span className="font-semibold">{voucher.createdBy.username}</span> : 'N/A'}
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
                                <button
                                  className="font-medium text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteClick(voucher)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
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
                        
                        <div className="flex items-center col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                        
                        {isAdmin && voucher.createdBy && (
                          <div className="flex items-center col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <FaUser className="mr-2 text-indigo-600 dark:text-indigo-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Created By</div>
                              <div className="text-sm text-indigo-700 dark:text-indigo-300">
                                <span className="font-semibold">{voucher.createdBy.username}</span>
                              </div>
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
                            <button
                              className="flex items-center justify-center text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteClick(voucher)}
                            >
                              <FaTrash className="mr-1" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </CustomScrollbar>
            </div>
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
    </div>
  );
} 