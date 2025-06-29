import React, { useState } from 'react';
import { FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
import StatusBadge from './StatusBadge';

const StatusControls = ({ 
  currentStatus, 
  onStatusUpdate, 
  canEdit = false, 
  arrivalDate,
  size = 'sm',
  className = '' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = () => {
    setSelectedStatus(currentStatus);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (selectedStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onStatusUpdate(selectedStatus);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Reset to current status on error
      setSelectedStatus(currentStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const isArrivedDisabled = () => {
    if (selectedStatus !== 'arrived') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arrival = new Date(arrivalDate);
    arrival.setHours(0, 0, 0, 0);
    
    return arrival > today;
  };

  const getStatusOptions = () => {
    return [
      { value: 'await', label: 'Awaiting', disabled: false },
      { 
        value: 'arrived', 
        label: 'Arrived', 
        disabled: isArrivedDisabled(),
        tooltip: isArrivedDisabled() ? 'Cannot set to arrived before arrival date' : ''
      },
      { value: 'canceled', label: 'Canceled', disabled: false }
    ];
  };

  if (!canEdit) {
    return (
      <div className={className}>
        <StatusBadge status={currentStatus} size={size} />
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <StatusBadge status={currentStatus} size={size} />
        <button
          onClick={handleStartEdit}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          title="Edit status"
        >
          <FaEdit className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const getSelectSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-[10px] px-1.5 py-0.5 w-16 min-w-16';
      case 'sm':
        return 'text-[11px] px-2 py-0.5 w-20 min-w-20';
      case 'md':
        return 'text-xs px-2.5 py-1 w-24 min-w-24';
      default:
        return 'text-[11px] px-2 py-0.5 w-20 min-w-20';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        disabled={isLoading}
        className={`border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm ${getSelectSizeClasses()}`}
      >
        {getStatusOptions().map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
            title={option.tooltip}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {option.label}
          </option>
        ))}
      </select>
      
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          disabled={isLoading || selectedStatus === currentStatus}
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

export default StatusControls; 