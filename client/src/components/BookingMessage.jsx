import React from 'react';
import { toast } from 'react-hot-toast';

const BookingMessage = ({ message }) => {
  const handleCopyMessage = () => {
    const textarea = document.createElement('textarea');
    textarea.value = message;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    let copySuccessful = false;
    
    try {
      copySuccessful = document.execCommand('copy');
    } catch {
      copySuccessful = false;
    }
    
    document.body.removeChild(textarea);
    
    if (!copySuccessful) {
      try {
        navigator.clipboard.writeText(message);
        copySuccessful = true;
      } catch {
        copySuccessful = false;
      }
    }
    
    if (copySuccessful) {
      toast.success("تم نسخ الرسالة بنجاح", { 
        position: "bottom-center",
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px'
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        }
      });
    } else {
      toast.error("فشل نسخ الرسالة. الرجاء المحاولة مرة أخرى.", {
        position: "bottom-center",
        duration: 3000
      });
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex justify-center mb-3">
        <button 
          className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-bold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto min-w-[200px] min-h-[48px] text-lg transition-colors"
          onClick={handleCopyMessage}
        >
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
          </svg>
          نسخ الرسالة
        </button>
      </div>
      <div className="whitespace-pre-line text-right dir-rtl dark:text-white">
        {message}
      </div>
    </div>
  );
};

export default BookingMessage; 