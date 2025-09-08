import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CustomButton from '../components/CustomButton';
import RahalatekLoader from '../components/RahalatekLoader';

export default function EmailVerificationPage() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const hasRunRef = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent multiple executions using ref
      if (hasRunRef.current) {
        console.log('Verification already attempted, skipping...');
        return;
      }
      hasRunRef.current = true;

      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const email = params.get('email');

        console.log('Starting verification with token:', token?.substring(0, 10) + '...', 'email:', email);

        if (!token || !email) {
          setStatus('error');
          setMessage('Invalid verification link. Please check your email and try again.');
          setLoading(false);
          return;
        }

        // Call the verification API
        const response = await axios.get(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
        
        console.log('Verification successful:', response.data);
        setStatus('success');
        setMessage(response.data.message);
        
        // Show success toast
        toast.success('Email verified successfully!', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: '500'
          }
        });

      } catch (error) {
        console.error('Email verification error:', error);
        console.error('Error response:', error.response?.data);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
        
        // Show error toast
        toast.error('Email verification failed!', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, []); // Empty dependency array to run only once

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <RahalatekLoader size="lg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Verifying Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'success' ? (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FaCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            ) : status === 'error' ? (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FaTimesCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FaSpinner className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold mb-4 ${
            status === 'success' 
              ? 'text-green-700 dark:text-green-400' 
              : status === 'error' 
                ? 'text-red-700 dark:text-red-400' 
                : 'text-gray-900 dark:text-white'
          }`}>
            {status === 'success' ? 'Email Verified!' : status === 'error' ? 'Verification Failed' : 'Verifying...'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Success Benefits */}
          {status === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <FaEnvelope className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  You will now receive email notifications for:
                </span>
              </div>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 ml-6">
                <li>• Arrival and departure reminders</li>
                <li>• System announcements</li>
                <li>• Important updates</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' ? (
              <>
                <CustomButton
                  onClick={handleGoToProfile}
                  variant="green"
                  size="md"
                  className="w-full"
                >
                  Go to Profile
                </CustomButton>
                <CustomButton
                  onClick={handleGoHome}
                  variant="gray"
                  size="md"
                  className="w-full"
                >
                  Go to Home
                </CustomButton>
              </>
            ) : status === 'error' ? (
              <>
                <CustomButton
                  onClick={handleGoToProfile}
                  variant="blue"
                  size="md"
                  className="w-full"
                >
                  Go to Profile
                </CustomButton>
                <CustomButton
                  onClick={handleGoHome}
                  variant="gray"
                  size="md"
                  className="w-full"
                >
                  Go to Home
                </CustomButton>
              </>
            ) : (
              <CustomButton
                onClick={handleGoHome}
                variant="gray"
                size="md"
                className="w-full"
                disabled
              >
                Please wait...
              </CustomButton>
            )}
          </div>

          {/* Help Text */}
          {status === 'error' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help? Contact your system administrator or try requesting a new verification email from your profile page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
