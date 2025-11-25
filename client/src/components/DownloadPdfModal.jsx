import React, { useState } from "react";
import { FaFilePdf, FaGlobeAmericas, FaGlobe } from "react-icons/fa";
import CustomModal from "./CustomModal";
import CustomButton from "./CustomButton";
import CustomCheckbox from "./CustomCheckbox";

/**
 * Modal prompting user to pick PDF language for download and customize options.
 */
export default function DownloadPdfModal({
  show,
  onClose,
  booking,
  onDownloadEnglish,
  onDownloadArabic,
  isDownloading,
}) {
  const [hideHeader, setHideHeader] = useState(false);
  const [hidePrice, setHidePrice] = useState(false);

  const handleDownloadEnglish = () => {
    onDownloadEnglish({ hideHeader, hidePrice });
  };

  const handleDownloadArabic = () => {
    onDownloadArabic({ hideHeader, hidePrice });
  };

  const handleClose = () => {
    // Reset options when closing
    setHideHeader(false);
    setHidePrice(false);
    onClose();
  };

  return (
    <CustomModal
      isOpen={show}
      onClose={handleClose}
      title="Download Booking PDF"
      maxWidth="md:max-w-md"
    >
      <div className="text-center">
        <FaFilePdf className="mx-auto mb-4 h-12 w-12 text-blue-600" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Choose PDF language
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {booking
            ? `Booking for ${booking.clientName || "your client"}`
            : "Select a booking to continue."}
        </p>

        {/* PDF Customization Options */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-left">
            PDF Options
          </h4>
          <div className="space-y-3 text-left">
            <CustomCheckbox
              id="hideHeader"
              label="Hide header (logo & company name)"
              checked={hideHeader}
              onChange={setHideHeader}
            />
            <CustomCheckbox
              id="hidePrice"
              label="Hide price information"
              checked={hidePrice}
              onChange={setHidePrice}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <CustomButton
            variant="blue"
            onClick={handleDownloadEnglish}
            disabled={!booking || isDownloading}
            loading={isDownloading}
            icon={FaGlobeAmericas}
            className="flex-1"
          >
            English PDF
          </CustomButton>
          <CustomButton
            variant="green"
            onClick={handleDownloadArabic}
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
