import React from "react";
import { FaFilePdf, FaGlobeAmericas, FaGlobe } from "react-icons/fa";
import CustomModal from "./CustomModal";
import CustomButton from "./CustomButton";

/**
 * Modal prompting user to pick PDF language for download.
 */
export default function DownloadPdfModal({
  show,
  onClose,
  booking,
  onDownloadEnglish,
  onDownloadArabic,
  isDownloading,
}) {
  return (
    <CustomModal
      isOpen={show}
      onClose={onClose}
      title="Download Booking PDF"
      maxWidth="md:max-w-md"
    >
      <div className="text-center">
        <FaFilePdf className="mx-auto mb-4 h-12 w-12 text-blue-600" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Choose PDF language
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {booking
            ? `Booking for ${booking.clientName || "your client"}`
            : "Select a booking to continue."}
        </p>
        <div className="flex gap-3">
          <CustomButton
            variant="blue"
            onClick={onDownloadEnglish}
            disabled={!booking || isDownloading}
            loading={isDownloading}
            icon={FaGlobeAmericas}
            className="flex-1"
          >
            English PDF
          </CustomButton>
          <CustomButton
            variant="green"
            onClick={onDownloadArabic}
            disabled={!booking}
            icon={FaGlobe}
            className="flex-1"
          >
            Arabic PDF
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
}


