import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextInput, Label, Button, Card, Alert } from 'flowbite-react';

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUsername('');
    setPassword('');
    setError('');
    
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [location.key]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(endpoint, { username, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (response.data.user.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 flex flex-col">
      {/* Mobile header - visible only on small screens */}
      <div className="md:hidden text-center mb-6">
        <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
            {isLogin ? 'Sign In' : 'Register'}
          </h2>
          
          {error && (
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
          )}
          
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
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <Button
              type="submit"
              gradientDuoTone="purpleToPink"
              className="w-full"
            >
              {isLogin ? 'Sign In' : 'Register'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              {isLogin ? 'New employee? Register here' : 'Already registered? Sign In'}
            </button>
          </div>
        </Card>
        
        {/* Company Info - Hidden on mobile, visible on md+ screens */}
        <div className="hidden md:block w-full max-w-md">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
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