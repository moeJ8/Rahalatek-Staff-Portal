import React from 'react';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';
import { FaTrash } from 'react-icons/fa';

/**
 * A reusable confirmation modal for delete operations
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onConfirm - Function to call when confirming the deletion
 * @param {boolean} props.isLoading - Whether the deletion is in progress
 * @param {string} props.itemType - The type of item being deleted (e.g., "voucher", "tour", "hotel")
 * @param {string} props.itemName - Primary identifier of the item (e.g., name, number)
 * @param {string} [props.itemExtra] - Optional additional information about the item
 */
export default function DeleteConfirmationModal({
  show,
  onClose,
  onConfirm,
  isLoading,
  itemType,
  itemName,
  itemExtra
}) {
  const capitalizedItemType = itemType.charAt(0).toUpperCase() + itemType.slice(1);

  return (
    <CustomModal
      isOpen={show}
      onClose={onClose}
      title="Confirm Deletion"
      maxWidth="md:max-w-md"
    >
      <div className="text-center">
        <FaTrash className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
          Are you sure you want to delete the {itemType}
          <div className="font-bold text-gray-900 dark:text-white mt-1">
            {itemName}{itemExtra ? ` for ${itemExtra}` : ''}
          </div>
        </h3>
        <div className="flex justify-center gap-4">
          <CustomButton
            variant="red"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {itemType.includes('move to trash') ? 'Yes, move to trash' : 
             itemType.includes('permanently') ? 'Yes, delete forever' : 
             `Yes, delete ${itemType}`}
          </CustomButton>
          <CustomButton
            variant="gray"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
} 