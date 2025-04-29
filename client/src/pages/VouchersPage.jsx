import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Alert } from 'flowbite-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import VoucherForm from '../components/VoucherForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { toast } from 'react-hot-toast';
import { FaTrash, FaEye, FaPen, FaCalendarAlt, FaPlane, FaMoneyBill } from 'react-icons/fa';

export default function VouchersPage() {
  const [showForm, setShowForm] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'View Vouchers List' : 'Create New Voucher'}
        </Button>
      </div>

      {showForm ? (
        <Card className="mb-8">
          <VoucherForm onSuccess={() => {
            setShowForm(false);
            fetchVouchers();
          }} />
        </Card>
      ) : (
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
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No vouchers found. Click "Create New Voucher" to create one.
            </div>
          ) : (
            <>
              {/* Mobile Card View (visible on xs screens) */}
              <div className="sm:hidden">
                <div className="grid grid-cols-1 gap-4">
                  {vouchers.map(voucher => (
                    <Card key={voucher._id} className="overflow-hidden">
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">#{voucher.voucherNumber}</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{voucher.clientName}</div>
                        </div>
                        <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                          {voucher.nationality}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <FaPlane className="mr-2 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Arrival</div>
                            <div className="text-sm text-gray-800 dark:text-gray-200">{formatDate(voucher.arrivalDate)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaPlane className="mr-2 text-red-600 dark:text-red-400 transform rotate-180" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Departure</div>
                            <div className="text-sm text-gray-800 dark:text-gray-200">{formatDate(voucher.departureDate)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaMoneyBill className="mr-2 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">${voucher.totalAmount}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-purple-600 dark:text-purple-400" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                            <div className="text-sm text-gray-800 dark:text-gray-200">{formatDate(voucher.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Link 
                          to={`/vouchers/${voucher._id}`}
                          className="flex items-center justify-center text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          <FaEye className="mr-1" />
                          <span>View</span>
                        </Link>
                        
                        <Link
                          to={`/edit-voucher/${voucher._id}`}
                          className="flex items-center justify-center text-purple-600 hover:text-purple-800 dark:text-purple-500 dark:hover:text-purple-400"
                        >
                          <FaPen className="mr-1" />
                          <span>Edit</span>
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteClick(voucher)}
                          className="flex items-center justify-center text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                        >
                          <FaTrash className="mr-1" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Desktop Table View (visible on sm screens and up) */}
              <div className="hidden sm:block overflow-x-auto">
                <Table striped>
                  <Table.Head>
                    <Table.HeadCell>Voucher #</Table.HeadCell>
                    <Table.HeadCell>Client</Table.HeadCell>
                    <Table.HeadCell>Arrival</Table.HeadCell>
                    <Table.HeadCell>Departure</Table.HeadCell>
                    <Table.HeadCell>Total</Table.HeadCell>
                    <Table.HeadCell>Created</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {vouchers.map(voucher => (
                      <Table.Row key={voucher._id} className="bg-white dark:bg-gray-800">
                        <Table.Cell className="font-medium">
                          {voucher.voucherNumber}
                        </Table.Cell>
                        <Table.Cell>
                          {voucher.clientName}
                          <div className="text-xs text-gray-500">{voucher.nationality}</div>
                        </Table.Cell>
                        <Table.Cell>{formatDate(voucher.arrivalDate)}</Table.Cell>
                        <Table.Cell>{formatDate(voucher.departureDate)}</Table.Cell>
                        <Table.Cell>${voucher.totalAmount}</Table.Cell>
                        <Table.Cell>{formatDate(voucher.createdAt)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-4">
                            <Link 
                              to={`/vouchers/${voucher._id}`}
                              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500"
                            >
                              View
                            </Link>
                            <Link
                              to={`/edit-voucher/${voucher._id}`}
                              className="font-medium text-purple-600 hover:text-purple-800 dark:text-purple-500"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(voucher)}
                              className="font-medium text-red-600 hover:text-red-800 dark:text-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </>
          )}
        </Card>
      )}

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