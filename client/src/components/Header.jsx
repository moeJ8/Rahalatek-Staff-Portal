import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'flowbite-react';
import DarkModeToggle from './DarkModeToggle';


export default function Header() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth state whenever location changes or component mounts
  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = () => {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      } else {
        setUser(null);
      }
    };
    
    checkAuthStatus();
    
    // Set up an event listener for storage changes
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [location]); // Re-check auth when location changes (like after login)

  const handleLogout = () => {
    // First set user to null to update UI
    setUser(null);
    
    // Then clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Close mobile menu if open
    setMobileMenuOpen(false);
    
    // Delay navigation slightly to ensure state updates have processed
    setTimeout(() => {
      navigate('/signin', { replace: true });
    }, 10);
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md mb-6 transition-colors duration-300 sticky top-0 z-10">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/" className="flex items-center">
              <img 
                src="/last-logo-3.png" 
                alt="Logo" 
                className="h-10 object-contain"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            
            {user ? (
              <>
                <Link 
                  to="/home" 
                  className={`font-medium ${isActive('/home') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400'}`}
                >
                  Home
                </Link>
                <Link 
                  to="/hotels" 
                  className={`font-medium ${isActive('/hotels') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400'}`}
                >
                  Hotels
                </Link>
                <Link 
                  to="/tours" 
                  className={`font-medium ${isActive('/tours') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400'}`}
                >
                  Tours
                </Link>
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`font-medium ${isActive('/admin') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400'}`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <DarkModeToggle />
                
                <Button
                  gradientDuoTone="pinkToOrange"
                  size="sm"
                  onClick={handleLogout}
                >
                  Sign out ({user.username})
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/hotels" 
                  className={`font-medium ${isActive('/hotels') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400'}`}
                >
                  Hotels
                </Link>
                <Link 
                  to="/tours" 
                  className={`font-medium ${isActive('/tours') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400'}`}
                >
                  Tours
                </Link>
                <DarkModeToggle />
                <Link to="/signin">
                  <Button gradientDuoTone="purpleToPink" size="sm" outline>
                    Sign In
                  </Button>
                </Link>
              </>
            )}
            
           
          </nav>
          
          {/* Mobile Burger Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle />
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-2 border-t dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    to="/home"
                    onClick={closeMobileMenu}
                    className={`py-2 px-1 ${isActive('/home') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Home
                  </Link>
                  
                  <Link 
                    to="/hotels"
                    onClick={closeMobileMenu}
                    className={`py-2 px-1 ${isActive('/hotels') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Hotels
                  </Link>
                  
                  <Link 
                    to="/tours"
                    onClick={closeMobileMenu}
                    className={`py-2 px-1 ${isActive('/tours') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Tours
                  </Link>
                  
                  {user.isAdmin && (
                    <Link 
                      to="/admin"
                      onClick={closeMobileMenu}
                      className={`py-2 px-1 ${isActive('/admin') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="py-2 px-1 text-red-500 dark:text-red-400 text-left"
                  >
                    Logout ({user.username})
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/hotels"
                    onClick={closeMobileMenu}
                    className={`py-2 px-1 ${isActive('/hotels') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Hotels
                  </Link>
                  
                  <Link 
                    to="/tours"
                    onClick={closeMobileMenu}
                    className={`py-2 px-1 ${isActive('/tours') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Tours
                  </Link>
                
                  <Link 
                    to="/signin"
                    onClick={closeMobileMenu}
                    className="py-2 px-1 text-blue-500 dark:text-blue-400"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 