import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Alert, Badge, Spinner } from 'flowbite-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import CustomScrollbar from '../components/CustomScrollbar';
import { toast } from 'react-hot-toast';
import { FaTrash, FaTrashRestore, FaEye, FaCalendarAlt } from 'react-icons/fa';

export default function TrashPage() {
  const [trashedVouchers, setTrashedVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permanentDeleteModal, setPermanentDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

  const fetchTrashedVouchers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vouchers/trash', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTrashedVouchers(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching trashed vouchers:', err);
      setError('Failed to load trashed vouchers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedVouchers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        <Link to="/vouchers">
          <Button 
            color="gray"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
          >
            Back to Vouchers
          </Button>
        </Link>
      </div>

      <Card>
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
        ) : trashedVouchers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No vouchers in trash.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <CustomScrollbar>
                <Table striped>
                  <Table.Head className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Voucher #</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Client</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Arrival</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Departure</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Total</Table.HeadCell>
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Deleted</Table.HeadCell>
                    {isAdmin && <Table.HeadCell className="text-sm font-semibold px-4 py-3">Deleted By</Table.HeadCell>}
                    <Table.HeadCell className="text-sm font-semibold px-4 py-3">Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {trashedVouchers.map(voucher => (
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
                        <Table.Cell className="text-sm font-medium text-gray-900 dark:text-white px-4 py-3">
                          {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">{formatDate(voucher.deletedAt)}</Table.Cell>
                        {isAdmin && (
                          <Table.Cell className="text-sm text-red-600 dark:text-red-300 px-4 py-3">
                            {voucher.deletedBy ? <span className="font-semibold">{voucher.deletedBy.username}</span> : 'N/A'}
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
                                <button
                                  className="font-medium text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                  onClick={() => handleRestoreClick(voucher)}
                                >
                                  Restore
                                </button>
                                <button
                                  className="font-medium text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handlePermanentDeleteClick(voucher)}
                                >
                                  Delete Forever
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

            {/* Mobile Card View */}
            <div className="sm:hidden">
              <CustomScrollbar className="pr-1">
                <div className="grid grid-cols-1 gap-4">
                  {trashedVouchers.map(voucher => (
                    <Card key={voucher._id} className="overflow-hidden shadow-sm hover:shadow dark:border-gray-700">
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                        <div>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">#{voucher.voucherNumber}</div>
                          <div className="text-sm text-gray-800 dark:text-gray-200">{voucher.clientName}</div>
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
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link to={`/vouchers/${voucher._id}`}>
                            <Button size="xs" color="blue">
                              <FaEye className="w-3 h-3" />
                            </Button>
                          </Link>
                          
                          {canManageVoucher(voucher) && (
                            <>
                              <Button 
                                size="xs" 
                                color="success"
                                onClick={() => handleRestoreClick(voucher)}
                              >
                                <FaTrashRestore className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="xs" 
                                color="failure"
                                onClick={() => handlePermanentDeleteClick(voucher)}
                              >
                                <FaTrash className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CustomScrollbar>
            </div>
          </>
        )}
      </Card>

      {/* Permanent Delete Confirmation Modal */}
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