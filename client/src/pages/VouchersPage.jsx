import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Alert, TextInput } from 'flowbite-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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

  // Filter vouchers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVouchers(vouchers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = vouchers.filter(voucher => 
      voucher.clientName.toLowerCase().includes(query) || 
      voucher.voucherNumber.toString().includes(query)
    );
    
    setFilteredVouchers(filtered);
  }, [searchQuery, vouchers]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
      
      toast.success(`Voucher #${voucherToDelete.voucherNumber} for ${voucherToDelete.clientName} has been deleted successfully.`, {
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
        <Button 
          gradientDuoTone="purpleToPink" 
          onClick={() => navigate('/vouchers/new')}
        >
          <FaPlus className="mr-1 mt-1 text-xs" />
          Create New Voucher
        </Button>
      </div>

      <Card>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <TextInput
              type="text"
              placeholder="Search by client name or voucher number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={FaSearch}
            />
          </div>
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
            {searchQuery ? 'No vouchers match your search criteria.' : 'No vouchers found. Click "Create New Voucher" to create one.'}
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
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{voucher.capital || '-'}</Table.Cell>
                        <Table.Cell className="text-sm font-medium text-gray-900 dark:text-white px-4 py-3">${voucher.totalAmount}</Table.Cell>
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
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">${voucher.totalAmount}</div>
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
                            <div className="text-sm text-gray-900 dark:text-gray-100">{voucher.capital || '-'}</div>
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
        itemType="voucher"
        itemName={`#${voucherToDelete?.voucherNumber}`}
        itemExtra={voucherToDelete?.clientName}
      />
    </div>
  );
} 