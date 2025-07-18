import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextInput, Label, Card, Alert } from 'flowbite-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import CustomButton from '../components/CustomButton';

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Enter username, 2: Security question, 3: New password
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUsername('');
    setPassword('');
    setError('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMessage('');
    setIsForgotPassword(false);
    setResetStep(1);
    setSecurityQuestion('');
    setSecurityAnswer('');
    setResetToken('');
    
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [location.key]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      // Add security question and answer for registration
      const requestData = isLogin 
        ? { username, password }
        : { username, password, securityQuestion, securityAnswer };
      
      const response = await axios.post(endpoint, requestData);
      
      if (!isLogin) {
        setSuccessMessage('Your account has been created. Please wait for admin approval to log in.');
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage('');
        }, 3000);
        return;
      }
      
      if (response.data.isPendingApproval) {
        setError('Your account is pending approval by an administrator.');
        return;
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/home', { replace: true });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isPendingApproval) {
        setError('Your account is pending approval by an administrator.');
      } else {
        setError(err.response?.data?.message || 'An error occurred');
      }
      console.error(err);
    }
  };

  const handleResetStepOne = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!username) {
      setError('Please enter your username');
      return;
    }
    
    try {
      const response = await axios.post('/api/auth/get-security-question', { username });
      setSecurityQuestion(response.data.securityQuestion);
      setResetStep(2);
    } catch (err) {
      console.error('Error fetching security question:', err);
      if (err.response?.status === 404) {
        setError('User not found. Please check your username.');
      } else {
        setError(err.response?.data?.message || 'Unable to retrieve security question');
      }
    }
  };

  const handleResetStepTwo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!securityAnswer) {
      setError('Please answer the security question');
      return;
    }
    
    try {
      const response = await axios.post('/api/auth/verify-security-answer', { 
        username, 
        securityAnswer 
      });
      
      setResetToken(response.data.resetToken);
      setResetStep(3);
    } catch (err) {
      console.error('Error verifying security answer:', err);
      setError(err.response?.data?.message || 'Incorrect security answer');
      setSecurityAnswer('');
    }
  };

  const handleResetStepThree = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await axios.post('/api/auth/reset-password', { 
        username, 
        resetToken,
        newPassword 
      });
      
      setSuccessMessage('Password has been reset successfully');
      setNewPassword('');
      setConfirmPassword('');
      
      // Return to login form after 3 seconds
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMessage('');
        setResetStep(1);
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.response) {
        setError(err.response.data.message || 'Failed to reset password');
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError('');
    setSuccessMessage('');
    setNewPassword('');
    setConfirmPassword('');
    setResetStep(1);
    setSecurityQuestion('');
    setSecurityAnswer('');
    setResetToken('');
  };

  // Render the appropriate reset password form based on current step
  const renderResetForm = () => {
    switch (resetStep) {
      case 1:
        return (
          <form onSubmit={handleResetStepOne} className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="username" value="Username" className="dark:text-white" />
              </div>
              <TextInput
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your employee username"
              />
            </div>
            
            <CustomButton
              type="submit"
              variant="blueToTeal"
              className="w-full"
            >
              Next
            </CustomButton>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-blue-500 dark:text-blue-400 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        );
        
      case 2:
        return (
          <form onSubmit={handleResetStepTwo} className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="securityQuestion" value="Security Question" className="dark:text-white" />
              </div>
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg mb-4 shadow-md">
                {securityQuestion}
              </div>
              
              <div className="mb-2 block">
                <Label htmlFor="securityAnswer" value="Answer" className="dark:text-white" />
              </div>
              <TextInput
                id="securityAnswer"
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
                placeholder="Enter your answer"
              />
            </div>
            
            <CustomButton
              type="submit"
              variant="blueToTeal"
              className="w-full"
            >
              Verify
            </CustomButton>
            
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setResetStep(1)}
                className="text-blue-500 dark:text-blue-400 hover:underline"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-blue-500 dark:text-blue-400 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        );
        
      case 3:
        return (
          <form onSubmit={handleResetStepThree} className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="newPassword" value="New Password" className="dark:text-white" />
              </div>
              <div className="relative">
                <TextInput
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-500 dark:text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <div className="mb-2 block">
                <Label htmlFor="confirmPassword" value="Confirm Password" className="dark:text-white" />
              </div>
              <TextInput
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>
            
            <CustomButton
              type="submit"
              variant="blueToTeal"
              className="w-full"
            >
              Reset Password
            </CustomButton>
            
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setResetStep(2)}
                className="text-blue-500 dark:text-blue-400 hover:underline"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-blue-500 dark:text-blue-400 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 py-8 px-4 flex flex-col">
      {/* Mobile header - visible only on small screens */}
      <div className="md:hidden text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Rahalatek Staff Portal
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Internal tour management system
        </p>
      </div>
      
      {/* Main content container */}
      <div className="flex flex-col md:flex-row-reverse items-center justify-center flex-1 max-w-5xl mx-auto">
        {/* Auth Form */}
        <Card className="w-full max-w-md md:mb-0 md:ml-8 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            {isForgotPassword ? 
              (resetStep === 1 ? 'Reset Password' : 
               resetStep === 2 ? 'Security Verification' : 
               'Create New Password') 
              : (isLogin ? 'Sign In' : 'Register')}
          </h2>
          
          {error && (
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert color="success" className="mb-4">
              {successMessage}
            </Alert>
          )}
          
          {isForgotPassword ? (
            renderResetForm()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="username" value="Username" className="dark:text-white" />
                </div>
                <TextInput
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your employee username"
                />
              </div>
              
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="password" value="Password" className="dark:text-white" />
                </div>
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FaEye className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <>
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="securityQuestion" value="Security Question" className="dark:text-white" />
                    </div>
                    <select
                      id="securityQuestion"
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 
                      dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                      dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="">Select a security question</option>
                      <option value="What was your childhood nickname?">What was your childhood nickname?</option>
                      <option value="What is the name of your first pet?">What is the name of your first pet?</option>
                      <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                      <option value="What was the model of your first car?">What was the model of your first car?</option>
                      <option value="In what city were you born?">In what city were you born?</option>
                    </select>
                  </div>
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="securityAnswer" value="Security Answer" className="dark:text-white" />
                    </div>
                    <TextInput
                      id="securityAnswer"
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      required
                      placeholder="Enter your answer"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      This will be used to verify your identity if you need to reset your password.
                    </p>
                  </div>
                </>
              )}
              
              <CustomButton
                type="submit"
                variant="blueToTeal"
                className="w-full"
              >
                {isLogin ? 'Sign In' : 'Register'}
              </CustomButton>
              
              <div className="mt-4 text-center flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-500 dark:text-blue-400 hover:underline"
                >
                  {isLogin ? 'New employee? Register' : 'Already registered? Sign In'}
                </button>
                
                {isLogin && (
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            </form>
          )}
        </Card>
        
        {/* Company Info - Hidden on mobile, visible on md+ screens */}
        <div className="hidden md:block w-full max-w-md">
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Rahalatek Staff Portal
            </h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Internal Management System
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sign in to access the tour management dashboard. Contact your administrator if you're having trouble accessing your account.
              </p>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Quick Reference</h3>
                <ul className="space-y-2 text-left text-sm">
                  <li className="text-gray-600 dark:text-gray-300">
                    • Manage tour bookings and hotel reservations
                  </li>
                  <li className="text-gray-600 dark:text-gray-300">
                    • Access client information and booking details
                  </li>
                  <li className="text-gray-600 dark:text-gray-300">
                    • Update tour availability and pricing
                  </li>
                  <li className="text-gray-600 dark:text-gray-300">
                    • Generate printable booking confirmations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Simplified info panel for mobile only */}
        <div className="md:hidden w-full max-w-md mt-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="font-medium text-gray-800 dark:text-white mb-2 text-center">Features</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600 dark:text-gray-300 border dark:border-gray-700 rounded p-2 text-center">
                Tour Bookings
              </div>
              <div className="text-gray-600 dark:text-gray-300 border dark:border-gray-700 rounded p-2 text-center">
                Hotel Reservations
              </div>
              <div className="text-gray-600 dark:text-gray-300 border dark:border-gray-700 rounded p-2 text-center">
                Client Information
              </div>
              <div className="text-gray-600 dark:text-gray-300 border dark:border-gray-700 rounded p-2 text-center">
                Price Management
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 