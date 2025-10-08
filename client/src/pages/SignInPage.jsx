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
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = 'https://res.cloudinary.com/dnzqnr6js/image/upload/q_95,f_auto/v1759933787/pexels-afterglow-10901250_dgbgtv.jpg';
    img.onload = () => setImageLoaded(true);
  }, []);

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
      
      navigate('/home', { replace: true });
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
          <form onSubmit={handleResetStepOne} className="space-y-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="username" value="Email or Username" className="text-white text-sm" />
              </div>
              <TextInput
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email or username"
                variant="glass"
              />
            </div>
            
            <CustomButton
              type="submit"
              variant="blueToTeal"
              className="w-full mt-6"
            >
              NEXT
            </CustomButton>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-white/90 hover:text-white hover:underline text-sm"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        );
        
      case 2:
        return (
          <form onSubmit={handleResetStepTwo} className="space-y-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="securityQuestion" value="Security Question" className="text-white text-sm" />
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-lg mb-4">
                {securityQuestion}
              </div>
              
              <div className="mb-2 block">
                <Label htmlFor="securityAnswer" value="Answer" className="text-white text-sm" />
              </div>
              <TextInput
                id="securityAnswer"
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Enter your answer"
                variant="glass"
              />
            </div>
            
            <CustomButton
              type="submit"
              variant="blueToTeal"
              className="w-full mt-6"
            >
              VERIFY
            </CustomButton>
            
            <div className="mt-6 flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setResetStep(1)}
                className="text-white/90 hover:text-white hover:underline"
              >
                ← Back
              </button>
              
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-white/90 hover:text-white hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        );
        
      case 3:
        return (
          <form onSubmit={handleResetStepThree} className="space-y-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="newPassword" value="New Password" className="text-white text-sm" />
              </div>
              <div className="relative">
                <TextInput
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full"
                  variant="glass"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-white/70" />
                  ) : (
                    <FaEye className="text-white/70" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <div className="mb-2 block">
                <Label htmlFor="confirmPassword" value="Confirm Password" className="text-white text-sm" />
              </div>
              <TextInput
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                variant="glass"
              />
            </div>
            
            <CustomButton
              type="submit"
              variant="blueToTeal"
              className="w-full mt-6"
            >
              RESET PASSWORD
            </CustomButton>
            
            <div className="mt-6 flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setResetStep(2)}
                className="text-white/90 hover:text-white hover:underline"
              >
                ← Back
              </button>
              
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-white/90 hover:text-white hover:underline"
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
    <div className="h-[calc(100vh-7rem)] relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image with Overlay - Fixed to viewport */}
      <div className="fixed inset-0 z-0">
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dnzqnr6js/image/upload/q_95,f_auto/v1759933787/pexels-afterglow-10901250_dgbgtv.jpg')`,
          }}
        />
        {/* Placeholder gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-teal-900 transition-opacity duration-500 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`} />
        {/* Darker overlay for better contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 py-8">
        
        {/* Left side - Glassmorphism Auth Form */}
        <div className="w-full max-w-lg">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8">
            <h2 className="text-2xl font-semibold text-center mb-8 text-white">
              {isForgotPassword ? 
                (resetStep === 1 ? 'Reset Password' : 
                 resetStep === 2 ? 'Security Verification' : 
                 'Create New Password') 
                : (isLogin ? 'Login to Your Account' : 'Create Your Account')}
            </h2>
          
          {isForgotPassword ? (
            renderResetForm()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="username" value="Email or Username" className="text-white text-sm" />
                </div>
                <TextInput
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email or username"
                  variant="glass"
                />
              </div>
              
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="password" value="Password" className="text-white text-sm" />
                </div>
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full"
                    variant="glass"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-white/70" />
                    ) : (
                      <FaEye className="text-white/70" />
                    )}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <>
                  {/* Email Field */}
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="email" value="Email (Optional)" className="text-white text-sm" />
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
                      variant="glass"
                    />
                  </div>

                  {/* Phone Number Section */}
                  <div>
                    <div className="mb-2 block">
                      <Label value="Phone Number (Optional)" className="text-white text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <div className="md:col-span-2">
                        <SearchableSelect
                          id="countryCode"
                          options={countryCodes}
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          placeholder="Select country code"
                          variant="glass"
                        />
                      </div>
                      <div className="md:col-span-3">
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
                          variant="glass"
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
                      variant="glass"
                    />
                  </div>
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="securityAnswer" value="Security Answer" className="text-white text-sm" />
                    </div>
                    <TextInput
                      id="securityAnswer"
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder="Enter your answer"
                      variant="glass"
                    />
                    <p className="mt-1 text-xs text-white/70">
                      This will be used to verify your identity if you need to reset your password.
                    </p>
                  </div>
                </>
              )}
              
              <CustomButton
                type="submit"
                variant="blueToTeal"
                className="w-full mt-6"
              >
                {isLogin ? 'LOGIN' : 'REGISTER'}
              </CustomButton>
              
              <div className="mt-6 text-center flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white/90 hover:text-white hover:underline text-sm"
                >
                  {isLogin ? 'New staff member? Register' : 'Already have account?'}
                </button>
                
                {isLogin && (
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="text-white/90 hover:text-white hover:underline text-sm"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            </form>
          )}
          </div>
        </div>

        {/* Right side - Inspirational Quote (Hidden on mobile) */}
        <div className="hidden lg:block w-full max-w-2xl text-center lg:text-left">
          <div className="mb-10" style={{ fontFamily: 'Jost, sans-serif' }}>
            <h1 className="text-5xl xl:text-7xl font-extrabold leading-tight mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                EXPLORE THE WORLD
              </span>
            </h1>
            <h2 className="text-3xl xl:text-5xl font-bold text-white/95 leading-tight mb-3 tracking-wide">
              WITH <span className="text-yellow-400 drop-shadow-lg">RAHALATEK</span>
            </h2>
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
              <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-yellow-300"></div>
              <p className="text-xl xl:text-2xl text-white/90 font-medium italic tracking-wider">
                Your Journey Begins Here
              </p>
              <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-yellow-300"></div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-start gap-4">
            <a 
              href="https://wa.me/905010684657" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300"
              aria-label="WhatsApp"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
            
            <a 
              href="https://www.instagram.com/rahalatek_/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            
            <a 
              href="mailto:info@rahalatek.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300"
              aria-label="Email"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 