import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTimes, FaCheck, FaUser } from 'react-icons/fa';

const CreatedByControls = ({ 
  currentUserId,
  currentUsername,
  users = [],
  onUserUpdate, 
  canEdit = false, 
  size = 'sm',
  className = '' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentUserId);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = () => {
    setSelectedUserId(currentUserId);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSelectedUserId(currentUserId);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (selectedUserId === currentUserId) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onUserUpdate(selectedUserId);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update created by:', error);
      // Reset to current user on error
      setSelectedUserId(currentUserId);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (!currentUsername) return 'N/A';
    return currentUsername.length > 12 ? currentUsername.substring(0, 12) + '...' : currentUsername;
  };

  if (!canEdit) {
    return (
      <div className={`flex items-center ${className}`}>
        {currentUserId ? (
          <Link 
            to={`/profile/${currentUserId}`}
            className="font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 hover:underline transition-colors duration-200"
            title={`View ${currentUsername}'s profile`}
          >
            {getUserDisplayName()}
          </Link>
        ) : (
          <span className="font-semibold text-gray-500 dark:text-gray-400">
            {getUserDisplayName()}
          </span>
        )}
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {currentUserId ? (
          <Link 
            to={`/profile/${currentUserId}`}
            className="font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 hover:underline transition-colors duration-200"
            title={`View ${currentUsername}'s profile`}
          >
            {getUserDisplayName()}
          </Link>
        ) : (
          <span className="font-semibold text-gray-500 dark:text-gray-400">
            {getUserDisplayName()}
          </span>
        )}
        <button
          onClick={handleStartEdit}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          title="Change created by"
        >
          <FaEdit className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const getSelectSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-[10px] px-1.5 py-0.5 w-20 min-w-20';
      case 'sm':
        return 'text-[11px] px-2 py-0.5 w-24 min-w-24';
      case 'md':
        return 'text-xs px-2.5 py-1 w-28 min-w-28';
      default:
        return 'text-[11px] px-2 py-0.5 w-24 min-w-24';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={selectedUserId || ''}
        onChange={(e) => setSelectedUserId(e.target.value)}
        disabled={isLoading}
        className={`border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm ${getSelectSizeClasses()}`}
      >
        <option value="" disabled>Select user...</option>
        {users.map((user) => (
          <option 
            key={user._id} 
            value={user._id}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {user.username}
          </option>
        ))}
      </select>
      
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          disabled={isLoading || selectedUserId === currentUserId || !selectedUserId}
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

export default CreatedByControls; 