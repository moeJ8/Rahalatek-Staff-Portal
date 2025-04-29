import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';
import axios from 'axios';
import VoucherPreview from '../components/VoucherPreview';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { FaArrowLeft, FaTrash, FaPen } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      
      toast.success('Voucher deleted successfully');
      navigate('/vouchers');
    } catch (err) {
      console.error('Error deleting voucher:', err);
      toast.error('Failed to delete voucher. Please try again.');
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
          className="flex items-center text-blue-600 hover:underline dark:text-blue-500"
        >
          <FaArrowLeft className="mr-2" />
          Back to Vouchers
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        {loading ? 'Loading Voucher...' : `Voucher #${voucher?.voucherNumber}`}
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <Card>
          <div className="text-center py-8 text-red-500">{error}</div>
        </Card>
      ) : voucher ? (
        <VoucherPreview 
          voucherData={voucher} 
          onDelete={handleDeleteClick}
          editUrl={`/edit-voucher/${id}`}
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