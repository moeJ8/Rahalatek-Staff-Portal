import React, { useState } from 'react';
import { FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
import CustomDatePicker from './CustomDatePicker';

const PaymentDateControls = ({ 
  currentPaymentDate, 
  onPaymentDateUpdate, 
  canEdit = false,
  className = '' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatInputDate = (dateString) => {
    if (!dateString) return '';
    return dateString; // CustomDatePicker expects ISO string
  };

  const handleStartEdit = () => {
    setSelectedDate(formatInputDate(currentPaymentDate));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSelectedDate(formatInputDate(currentPaymentDate));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (selectedDate === formatInputDate(currentPaymentDate)) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onPaymentDateUpdate(selectedDate);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update payment date:', error);
      // Reset to current date on error
      setSelectedDate(formatInputDate(currentPaymentDate));
    } finally {
      setIsLoading(false);
    }
  };

  if (!canEdit) {
    return (
      <div className={className}>
        <span className="text-sm text-gray-900 dark:text-white">
          {formatDisplayDate(currentPaymentDate)}
        </span>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-900 dark:text-white">
          {formatDisplayDate(currentPaymentDate)}
        </span>
        <button
          onClick={handleStartEdit}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          title="Edit payment date"
        >
          <FaEdit className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CustomDatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        placeholder="DD/MM/YYYY"
        className="w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-xs"
      />
      
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          disabled={isLoading || selectedDate === formatInputDate(currentPaymentDate)}
          className="p-1.5 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200"
          title="Save"
        >
          <FaCheck className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200"
          title="Cancel"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default PaymentDateControls; 