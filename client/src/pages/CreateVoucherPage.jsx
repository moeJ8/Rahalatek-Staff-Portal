import React from 'react';
import { Card, Button } from 'flowbite-react';
import VoucherForm from '../components/VoucherForm';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function CreateVoucherPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate back to vouchers list after successful creation
    navigate('/vouchers');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/vouchers"
          className="flex items-center text-blue-600 hover:underline dark:text-blue-500"
        >
          <FaArrowLeft className="mr-2" />
          Back to Vouchers
        </Link>
      </div>
      <VoucherForm onSuccess={handleSuccess} />
    </div>
  );
} 