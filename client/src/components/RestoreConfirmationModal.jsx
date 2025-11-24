import React from 'react';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';
import { FaTrashRestore } from 'react-icons/fa';

/**
 * A reusable confirmation modal for restore operations
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onConfirm - Function to call when confirming the restore
 * @param {boolean} props.isLoading - Whether the restore is in progress
 * @param {string} props.itemType - The type of item being restored (e.g., "booking", "voucher")
 * @param {string} props.itemName - Primary identifier of the item (e.g., name, number)
 * @param {string} [props.itemExtra] - Optional additional information about the item
 */
export default function RestoreConfirmationModal({
  show,
  onClose,
  onConfirm,
  isLoading,
  itemType,
  itemName,
  itemExtra
}) {
  return (
    <CustomModal
      isOpen={show}
      onClose={onClose}
      title="Confirm Restore"
      maxWidth="md:max-w-md"
    >
      <div className="text-center">
        <FaTrashRestore className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
          Are you sure you want to restore the {itemType}
          <div className="font-bold text-gray-900 dark:text-white mt-1">
            {itemName}{itemExtra ? ` ${itemExtra}` : ''}
          </div>
        </h3>
        <div className="flex justify-center gap-4">
          <CustomButton
            variant="green"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            Yes, restore
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

