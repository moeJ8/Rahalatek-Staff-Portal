import React, { useState } from "react";
import { toast } from "react-hot-toast";
import CustomButton from "./CustomButton";

const BookingMessage = ({ message, messageEnglish = "" }) => {
  const hasEnglish = messageEnglish && messageEnglish.trim() !== "";
  const [activeTab, setActiveTab] = useState("arabic");

  const handleCopyMessage = (textToCopy) => {
    const textarea = document.createElement("textarea");
    textarea.value = textToCopy;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    let copySuccessful = false;

    try {
      copySuccessful = document.execCommand("copy");
    } catch {
      copySuccessful = false;
    }

    document.body.removeChild(textarea);

    if (!copySuccessful) {
      try {
        navigator.clipboard.writeText(textToCopy);
        copySuccessful = true;
      } catch {
        copySuccessful = false;
      }
    }

    if (copySuccessful) {
      const successMessage =
        activeTab === "arabic"
          ? "تم نسخ الرسالة بنجاح"
          : "Message copied successfully";
      toast.success(successMessage, {
        position: "bottom-center",
        duration: 3000,
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#4CAF50",
        },
      });
    } else {
      const errorMessage =
        activeTab === "arabic"
          ? "فشل نسخ الرسالة. الرجاء المحاولة مرة أخرى."
          : "Failed to copy message. Please try again.";
      toast.error(errorMessage, {
        position: "bottom-center",
        duration: 3000,
      });
    }
  };

  const currentMessage = activeTab === "arabic" ? message : messageEnglish;
  const copyButtonText =
    activeTab === "arabic" ? "نسخ الرسالة" : "Copy Message";

  return (
    <div className="mt-6 bg-gray-100 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-600">
      {/* Tabs - only show if English message exists */}
      {hasEnglish && (
        <div className="flex border-b border-gray-200 dark:border-slate-600">
          <button
            onClick={() => setActiveTab("arabic")}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === "arabic"
                ? "bg-blue-500 text-white dark:bg-blue-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
            } ${activeTab === "arabic" ? "rounded-tl-lg" : ""}`}
          >
            Arabic
          </button>
          <button
            onClick={() => setActiveTab("english")}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === "english"
                ? "bg-blue-500 text-white dark:bg-blue-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
            } ${activeTab === "english" ? "rounded-tr-lg" : ""}`}
          >
            English
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-center mb-3">
          <CustomButton
            onClick={() => handleCopyMessage(currentMessage)}
            variant="gray"
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
            icon={() => (
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
              </svg>
            )}
          >
            {copyButtonText}
          </CustomButton>
        </div>
        <div
          className={`whitespace-pre-line dark:text-white ${
            activeTab === "arabic" ? "text-right dir-rtl" : "text-left dir-ltr"
          }`}
        >
          {currentMessage}
        </div>
      </div>
    </div>
  );
};

export default BookingMessage;
