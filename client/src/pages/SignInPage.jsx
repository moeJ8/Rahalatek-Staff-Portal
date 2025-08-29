import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Label, Card } from 'flowbite-react';
import TextInput from '../components/TextInput';
import CustomSelect from '../components/Select';
import SearchableSelect from '../components/SearchableSelect';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import CustomButton from '../components/CustomButton';
import { countryCodes } from '../utils/countryCodes';
import toast from 'react-hot-toast';

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Enter username, 2: Security question, 3: New password
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [emailValidationShown, setEmailValidationShown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUsername('');
    setEmail('');
    setPhoneNumber('');
    setCountryCode('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsForgotPassword(false);
    setResetStep(1);
    setSecurityQuestion('');
    setSecurityAnswer('');
    setResetToken('');
    setEmailValidationShown(false);
    
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [location.key]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!username.trim()) {
      toast.error('Please enter your email or username', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter your password', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
      return;
    }
    
    // Additional validation for registration
    if (!isLogin) {
      if (!securityQuestion) {
        toast.error('Please select a security question', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
        return;
      }
      
      if (!securityAnswer.trim()) {
        toast.error('Please provide an answer to your security question', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
        return;
      }
    }
    
    // Validate email format if provided
    if (!isLogin && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address (example@domain.com)', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
      return;
    }
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      // Add security question and answer for registration
      const requestData = isLogin 
        ? { username, password }
        : { username, email, phoneNumber, countryCode, password, securityQuestion, securityAnswer };
      
      const response = await axios.post(endpoint, requestData);
      
      if (!isLogin) {
        toast.success('Your account has been created. Please wait for admin approval to log in.', {
          duration: 4000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: '500'
          }
        });
        setTimeout(() => {
          setIsLogin(true);
        }, 3000);
        return;
      }
      
      if (response.data.isPendingApproval) {
        toast.error('Your account is pending approval by an administrator.', {
          duration: 4000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
        return;
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Trigger auth state update
      window.dispatchEvent(new Event('auth-change'));
      
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isPendingApproval) {
        toast.error('Your account is pending approval by an administrator.', {
          duration: 4000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
      } else {
        toast.error(err.response?.data?.message || 'An error occurred', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
      }
      console.error(err);
    }
  };

  const handleResetStepOne = async (e) => {
    e.preventDefault();
    
    if (!username) {
      toast.error('Please enter your email or username', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
      return;
    }
    
    try {
      const response = await axios.post('/api/auth/get-security-question', { username });
      setSecurityQuestion(response.data.securityQuestion);
      setResetStep(2);
    } catch (err) {
      console.error('Error fetching security question:', err);
      if (err.response?.status === 404) {
        toast.error('User not found. Please check your email or username.', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
      } else {
        toast.error(err.response?.data?.message || 'Unable to retrieve security question', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
      }
    }
  };

  const handleResetStepTwo = async (e) => {
    e.preventDefault();
    
    if (!securityAnswer) {
      toast.error('Please answer the security question', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
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
      toast.error(err.response?.data?.message || 'Incorrect security answer', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
      setSecurityAnswer('');
    }
  };

  const handleResetStepThree = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', {
        duration: 3000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
      return;
    }
    
    try {
      await axios.post('/api/auth/reset-password', { 
        username, 
        resetToken,
        newPassword 
      });
      
      toast.success('Password has been reset successfully', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: '500'
        }
      });
      setNewPassword('');
      setConfirmPassword('');
      
      // Return to login form after 3 seconds
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetStep(1);
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.response) {
        toast.error(err.response.data.message || 'Failed to reset password', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
      } else if (err.request) {
        toast.error('No response from server. Please try again later.', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
      } else {
        toast.error('An error occurred. Please try again.', {
          duration: 3000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
      }
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
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
                <Label htmlFor="username" value="Email or Username" className="dark:text-white" />
              </div>
              <TextInput
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email or username"
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
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 md:py-8 px-4 flex flex-col">
      {/* Mobile header - visible only on small screens */}
      <div className="md:hidden text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Rahalatek Staff Portal
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Rahalatek Management Platform
        </p>
      </div>
      
      {/* Main content container */}
      <div className="flex flex-col md:flex-row-reverse items-center justify-center md:flex-1 max-w-5xl mx-auto">

        <div className="w-full max-w-md md:mb-0 md:ml-8">

          <div className="hidden md:block h-8 mb-4"></div>
          <Card className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            {isForgotPassword ? 
              (resetStep === 1 ? 'Reset Password' : 
               resetStep === 2 ? 'Security Verification' : 
               'Create New Password') 
              : (isLogin ? 'Sign In' : 'Register')}
          </h2>
          
          {isForgotPassword ? (
            renderResetForm()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="username" value="Email or Username" className="dark:text-white" />
                </div>
                <TextInput
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email or username"
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
                  {/* Email Field */}
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="email" value="Email (Optional)" className="dark:text-white" />
                    </div>
                    <TextInput
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Reset validation flag when user starts typing
                        setEmailValidationShown(false);
                      }}
                      onBlur={(e) => {
                        // Validate email format on blur
                        if (e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) && !emailValidationShown) {
                          setEmailValidationShown(true);
                          toast.error('Please enter a valid email address (example@domain.com)', {
                            duration: 3000,
                            style: {
                              background: '#f44336',
                              color: '#fff',
                              fontWeight: '500'
                            }
                          });
                        }
                      }}
                      placeholder="Enter your email address"
                    />
                  </div>

                  {/* Phone Number Section */}
                  <div>
                    <div className="mb-2 block">
                      <Label value="Phone Number (Optional)" className="dark:text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="md:col-span-1">
                        <SearchableSelect
                          id="countryCode"
                          options={countryCodes}
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          placeholder="Select country code"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <TextInput
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => {
                            // Only allow numbers and basic formatting characters
                            const value = e.target.value.replace(/[^0-9\s\-()]/g, '');
                            setPhoneNumber(value);
                          }}
                          onKeyPress={(e) => {
                            // Prevent typing non-numeric characters
                            if (!/[0-9\s\-()]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                              e.preventDefault();
                            }
                          }}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <CustomSelect
                      id="securityQuestion"
                      label="Security Question"
                      value={securityQuestion}
                      onChange={(value) => setSecurityQuestion(value)}
                      options={[
                        { value: "What was your childhood nickname?", label: "What was your childhood nickname?" },
                        { value: "What is the name of your first pet?", label: "What is the name of your first pet?" },
                        { value: "What is your mother's maiden name?", label: "What is your mother's maiden name?" },
                        { value: "What was the model of your first car?", label: "What was the model of your first car?" },
                        { value: "In what city were you born?", label: "In what city were you born?" }
                      ]}
                      placeholder="Select a security question"
                    />
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
                  className="text-blue-500 dark:text-blue-400 hover:underline text-sm sm:text-base"
                >
                  {isLogin ? 'New employee? Register' : 'Already registered? Sign In'}
                </button>
                
                {isLogin && (
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="text-blue-500 dark:text-blue-400 hover:underline text-sm sm:text-base"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            </form>
          )}
        </Card>
        </div>
        
        {/* Company Info - Hidden on mobile, visible on md+ screens */}
        <div className="hidden md:block w-full max-w-md">
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Rahalatek Staff Portal
            </h1>
            
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                Employee Portal
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access your work dashboard to manage daily operations, track attendance, and collaborate with your team. Please sign in with your employee credentials.
              </p>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">For Employees</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  This internal system is designed for Rahalatek staff members to efficiently manage their work responsibilities. If you're having trouble accessing your account, please contact your supervisor or IT administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Simplified info panel for mobile only */}
        <div className="md:hidden w-full max-w-md mt-4">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg p-4 rounded-lg shadow-md">
            <h3 className="font-medium text-gray-800 dark:text-white mb-2 text-center">Employee Access</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center leading-relaxed">
              Sign in to access your work dashboard, manage daily tasks, and collaborate with your team members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 