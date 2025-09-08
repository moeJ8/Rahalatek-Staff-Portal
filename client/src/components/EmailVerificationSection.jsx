import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaEnvelope, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CustomButton from './CustomButton';

export default function EmailVerificationSection({ userEmail, isOwnProfile = true }) {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch email verification status
  const fetchVerificationStatus = async () => {
    if (!isOwnProfile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/email-verification-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerificationStatus(response.data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
      setVerificationStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, [userEmail, isOwnProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send verification email
  const handleSendVerification = async () => {
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/auth/send-email-verification', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(response.data.message, {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: '500'
        }
      });

      // Refresh status after sending
      setTimeout(() => {
        fetchVerificationStatus();
      }, 1000);

    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification email', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
    } finally {
      setSending(false);
    }
  };

  // Don't render if not own profile
  if (!isOwnProfile) {
    return null;
  }

  // Don't render if loading or no verification status
  if (loading || !verificationStatus) {
    return null;
  }

  // Don't render anything if user doesn't have an email (to avoid layout issues)
  if (!verificationStatus.hasEmail) {
    return null;
  }

  if (verificationStatus.isEmailVerified) {
    // Simple verified badge - inline, taller height
    return (
      <div className="flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg min-h-[2.5rem]">
        <span className="text-sm font-medium text-green-800 dark:text-green-200 whitespace-nowrap">
          Verified ✓
        </span>
      </div>
    );
  } else {
    // Simple verification alert - responsive
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-md">
        <div className="flex items-center gap-2 flex-1">
          <FaExclamationTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
            Not Verified
          </span>
        </div>
        <CustomButton
          onClick={handleSendVerification}
          disabled={sending}
          size="xs"
          variant="amber"
          className="whitespace-nowrap w-full sm:w-auto"
        >
          {sending ? (
            <>
              <FaSpinner className="w-3 h-3 mr-1 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <FaEnvelope className="w-3 h-3 mr-1" />
              Verify
            </>
          )}
        </CustomButton>
      </div>
    );
  }
}
