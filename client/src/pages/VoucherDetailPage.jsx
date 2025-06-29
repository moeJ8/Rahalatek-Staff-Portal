import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';
import axios from 'axios';
import VoucherPreview from '../components/VoucherPreview';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import RahalatekLoader from '../components/RahalatekLoader';
import { FaArrowLeft, FaTrash, FaPen, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Check if the current user is an admin or accountant
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.isAdmin || false);
    setIsAccountant(user.isAccountant || false);
    setCurrentUserId(user.id || null);
  }, []);

  // Simple helper function to check if user can manage this voucher
  const canManageVoucher = () => {
    if (isAdmin || isAccountant) return true;
    return voucher && voucher.createdBy && voucher.createdBy._id === currentUserId;
  };

  // Check if user can delete vouchers (only full admins, not accountants or regular users)
  const canDeleteVoucher = () => {
    // Only full admins can delete vouchers
    return isAdmin && !isAccountant;
  };

  useEffect(() => {
    const fetchVoucher = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/vouchers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setVoucher(response.data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching voucher:', err);
        setError('Failed to load voucher. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/vouchers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success(`Voucher #${voucher.voucherNumber} for ${voucher.clientName} has been deleted successfully.`, {
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
      navigate('/vouchers');
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
      setDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link 
          to="/vouchers"
          className="flex items-center text-blue-600 hover:underline dark:text-blue-500 text-sm"
        >
          <FaArrowLeft className="mr-2" />
          Back to Vouchers
        </Link>
      </div>
      
      <h1 className="text-2xl font-medium mb-4 text-gray-900 dark:text-white">
        {loading ? 'Loading Voucher...' : `Voucher #${voucher?.voucherNumber}`}
      </h1>
      
      {(isAdmin || isAccountant) && voucher && voucher.createdBy && (
        <div className="flex items-center mb-5 text-gray-700 dark:text-gray-300">
          <FaUser className="mr-2 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm">
            Created by: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{voucher.createdBy.username}</span>
          </span>
        </div>
      )}
      
      {loading ? (
        <div className="py-8">
          <RahalatekLoader size="lg" />
        </div>
      ) : error ? (
        <Card>
          <div className="text-center py-8 text-red-500">{error}</div>
        </Card>
      ) : voucher ? (
        <VoucherPreview 
          voucherData={voucher} 
          onDelete={canDeleteVoucher() ? handleDeleteClick : null}
          editUrl={canManageVoucher() ? `/edit-voucher/${id}` : null}
        />
      ) : (
        <Card>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Voucher not found.
          </div>
        </Card>
      )}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
        itemType="voucher"
        itemName={`#${voucher?.voucherNumber}`}
        itemExtra={voucher?.clientName}
      />
    </div>
  );
} 