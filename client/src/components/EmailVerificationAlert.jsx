import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaTimes, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';

export default function EmailVerificationAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkEmailVerificationStatus();
  }, []);

  const checkEmailVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/auth/email-verification-status', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { hasEmail, isEmailVerified } = response.data;
      
      // Show alert if user has no email or email is not verified
      setShowAlert(hasEmail && !isEmailVerified);
    } catch (error) {
      console.error('Error checking email verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Don't render if loading, dismissed, or shouldn't show alert
  if (loading || dismissed || !showAlert) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Email Verification Required
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Please verify your email address to receive important notifications about arrivals, departures, and system updates.
            </p>
            <Link
              to="/profile?edit=true"
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <FaEnvelope className="w-3 h-3 mr-2" />
              Verify Email Now
            </Link>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors duration-200"
          title="Dismiss alert"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
