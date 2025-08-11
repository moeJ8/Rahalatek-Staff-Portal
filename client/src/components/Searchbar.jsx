import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomScrollbar from './CustomScrollbar';
import UserBadge from './UserBadge';

const Searchbar = () => {
  const [offices, setOffices] = useState([]);
  const [directClients, setDirectClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const navigate = useNavigate();

  // Check user role to determine if they can search for users
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canSearchUsers = currentUser.isAdmin || currentUser.isAccountant;

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !showMobileModal) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileModal]);

  // Fetch offices, direct clients, and users on mount
  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle escape key for mobile modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showMobileModal) {
        setShowMobileModal(false);
        setSearchQuery('');
      }
    };

    if (showMobileModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showMobileModal]);

  // Filter offices, direct clients, and users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Filter offices
    const filteredOffices = offices.filter(office => 
      office.name.toLowerCase().includes(query) ||
      office.location.toLowerCase().includes(query)
    ).map(office => ({ ...office, type: 'office' }));
    
    // Filter direct clients
    const filteredClients = directClients.filter(client => 
      client.name.toLowerCase().includes(query)
    ).map(client => ({ ...client, type: 'client' }));
    
    // Filter users (only if user has permission)
    const filteredUsers = canSearchUsers ? users.filter(user => 
      user.username.toLowerCase().includes(query)
    ).map(user => ({ ...user, type: 'user' })) : [];
    
    setFilteredResults([...filteredOffices, ...filteredClients, ...filteredUsers]);
  }, [searchQuery, offices, directClients, users, canSearchUsers]);

  const fetchOffices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/offices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffices(response.data.data);
    } catch (error) {
      console.error('Error fetching offices:', error);
    }
  };

  const fetchDirectClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Extract unique direct clients (vouchers without office)
      const directClientSet = new Set();
      response.data.data.forEach(voucher => {
        if (!voucher.officeName && voucher.clientName) {
          directClientSet.add(voucher.clientName.trim());
        }
      });
      
      // Convert to array of objects
      const directClientsList = Array.from(directClientSet).map(clientName => ({
        _id: `client-${clientName}`,
        name: clientName
      }));
      
      setDirectClients(directClientsList);
    } catch (error) {
      console.error('Error fetching direct clients:', error);
    }
  };

  const fetchUsers = async () => {
    if (!canSearchUsers) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [fetchOffices(), fetchDirectClients()];
      if (canSearchUsers) {
        promises.push(fetchUsers());
      }
      await Promise.all(promises);
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleResultClick = (result) => {
    if (result.type === 'office') {
      navigate(`/office/${encodeURIComponent(result.name)}`);
    } else if (result.type === 'client') {
      navigate(`/client/${encodeURIComponent(result.name)}`);
    } else if (result.type === 'user') {
      navigate(`/profile/${result._id}`);
    }
    setShowDropdown(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setSearchQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Desktop: Full Search Input */}
        <div className="relative hidden lg:block">
          <input
            ref={inputRef}
            type="text"
            placeholder={canSearchUsers ? "Search offices, clients & users..." : "Search offices & clients..."}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="w-72 px-4 py-2 pl-10 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors duration-200"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Mobile/Tablet: Search Icon Only */}
        <button
          onClick={() => {
            setShowMobileModal(true);
            // Focus mobile input after modal opens
            setTimeout(() => {
              if (mobileInputRef.current) {
                mobileInputRef.current.focus();
              }
            }, 100);
          }}
          className="lg:hidden flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          title={canSearchUsers ? "Search offices, clients & users" : "Search offices & clients"}
        >
          <FaSearch className="w-5 h-5" />
        </button>

              {/* Desktop Dropdown Menu */}
        {showDropdown && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 max-h-[400px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-teal-50 dark:bg-teal-900/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaSearch className="w-4 h-4 mr-2 text-teal-600 dark:text-teal-400" />
              Search Results
            </h3>
            
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-teal-600 bg-teal-50 border border-teal-200 rounded-md dark:text-teal-400 dark:bg-teal-900/20 dark:border-teal-800">
                {filteredResults.length} found
              </span>
            )}
          </div>

          {/* Search Results */}
          <div className="flex-1 min-h-0 border-t border-gray-200 dark:border-slate-700">
            <CustomScrollbar maxHeight="320px" className="h-full">
              {loading ? (
                <div className="flex items-center justify-center px-4 py-8">
                  <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              ) : !searchQuery ? (
                <div className="px-4 py-8 text-center">
                  <FaSearch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Start typing to search</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {canSearchUsers ? "Search by office name, location, client name, or username" : "Search by office name, location, or client name"}
                  </p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FaSearch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No results found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Try searching with different keywords
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredResults.map((result) => (
                    <div
                      key={result._id}
                      onClick={() => handleResultClick(result)}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {result.type === 'office' ? (
                            <FaBuilding className="w-4 h-4 text-teal-500" />
                          ) : result.type === 'user' ? (
                            <FaUser className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FaUser className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {result.type === 'client' && result.name && result.name.length > 20 
                                    ? `${result.name.substring(0, 20)}...` 
                                    : (result.type === 'user' ? result.username : result.name)}
                                </p>
                                {result.type === 'user' ? (
                                  <UserBadge user={result} size="xs" />
                                ) : (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    result.type === 'office' 
                                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                                  }`}>
                                    {result.type === 'office' ? 'Office' : 'Direct Client'}
                                  </span>
                                )}
                              </div>
                              
                              {result.type === 'office' ? (
                                <>
                                  {/* Location for offices */}
                                  <div className="flex items-center mt-1">
                                    <FaMapMarkerAlt className="w-3 h-3 text-gray-400 mr-1" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                      {result.location}
                                    </p>
                                  </div>
                                  
                                  {/* Contact Info for offices */}
                                  <div className="flex items-center space-x-4 mt-2">
                                    {result.email && (
                                      <div className="flex items-center">
                                        <FaEnvelope className="w-3 h-3 text-gray-400 mr-1" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                          {result.email}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {result.phoneNumber && (
                                      <div className="flex items-center">
                                        <FaPhone className="w-3 h-3 text-gray-400 mr-1" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {result.phoneNumber}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : result.type === 'user' ? (
                                <div className="mt-1">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    System user - View profile & analytics
                                  </p>
                                </div>
                              ) : (
                                <div className="mt-1">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Individual client with vouchers
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CustomScrollbar>
          </div>
        </div>
      )}
    </div>

    {/* Mobile Search Modal */}
    {showMobileModal && (
      <div className="lg:hidden fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search</h2>
          <button
            onClick={() => {
              setShowMobileModal(false);
              setSearchQuery('');
            }}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="relative">
            <input
              ref={mobileInputRef}
              type="text"
              placeholder={canSearchUsers ? "Search offices, clients & users..." : "Search offices & clients..."}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pl-12 text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-hidden">
          <CustomScrollbar className="h-full">
            {loading ? (
              <div className="flex items-center justify-center px-4 py-8">
                <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : !searchQuery ? (
              <div className="px-4 py-8 text-center">
                <FaSearch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Start typing to search</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {canSearchUsers ? "Search by office name, location, client name, or username" : "Search by office name, location, or client name"}
                </p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <FaSearch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">No results found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredResults.map((result) => (
                  <div
                    key={result._id}
                    onClick={() => {
                      handleResultClick(result);
                      setShowMobileModal(false);
                      setSearchQuery('');
                    }}
                    className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {result.type === 'office' ? (
                          <FaBuilding className="w-5 h-5 text-teal-500" />
                        ) : result.type === 'user' ? (
                          <FaUser className="w-5 h-5 text-blue-500" />
                        ) : (
                          <FaUser className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {result.type === 'client' && result.name && result.name.length > 20 
                              ? `${result.name.substring(0, 20)}...` 
                              : (result.type === 'user' ? result.username : result.name)}
                          </p>
                          {result.type === 'user' ? (
                            <UserBadge user={result} size="xs" />
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              result.type === 'office' 
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                            }`}>
                              {result.type === 'office' ? 'Office' : 'Direct Client'}
                            </span>
                          )}
                        </div>
                        
                        {result.type === 'office' ? (
                          <div className="flex items-center mt-1">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {result.location}
                            </p>
                          </div>
                        ) : result.type === 'user' ? (
                          <div className="mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              System user - View profile & analytics
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Individual client with vouchers
                            </p>
                          </div>
                        )}
                        
                        {result.type === 'office' && (result.email || result.phoneNumber) && (
                          <div className="flex items-center space-x-4 mt-2">
                            {result.email && (
                              <div className="flex items-center">
                                <FaEnvelope className="w-3 h-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {result.email}
                                </span>
                              </div>
                            )}
                            {result.phoneNumber && (
                              <div className="flex items-center">
                                <FaPhone className="w-3 h-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {result.phoneNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CustomScrollbar>
        </div>
      </div>
    )}
  </>
  );
};

export default Searchbar; 