import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaTimes, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomScrollbar from './CustomScrollbar';
import UserBadge from './UserBadge';

const Searchbar = () => {
  const [offices, setOffices] = useState([]);
  const [directClients, setDirectClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [vouchers, setVouchers] = useState([]);
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

  // Filter offices, direct clients, users, and vouchers based on search query
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
    
    // Filter vouchers by voucher number
    const filteredVouchers = vouchers.filter(voucher => 
      voucher.voucherNumber.toString().includes(query.trim())
    ).map(voucher => ({ ...voucher, type: 'voucher' }));
    
    // Filter users (only if user has permission)
    const filteredUsers = canSearchUsers ? users.filter(user => 
      user.username.toLowerCase().includes(query)
    ).map(user => ({ ...user, type: 'user' })) : [];
    
    setFilteredResults([...filteredOffices, ...filteredClients, ...filteredVouchers, ...filteredUsers]);
  }, [searchQuery, offices, directClients, users, vouchers, canSearchUsers]);

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

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [fetchOffices(), fetchDirectClients(), fetchVouchers()];
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
    } else if (result.type === 'voucher') {
      navigate(`/vouchers/${result._id}`);
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
        <div className="relative hidden lg:block group">
          <input
            ref={inputRef}
            type="text"
            placeholder={canSearchUsers ? "Search offices, clients, users & vouchers..." : "Search offices, clients & vouchers..."}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="w-96 px-5 py-2.5 pl-11 pr-10 text-sm text-gray-900 dark:text-white 
              bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
              border border-gray-200/60 dark:border-slate-600/60 
              rounded-full shadow-sm
              hover:border-teal-400/60 dark:hover:border-teal-400/60
              focus:ring-2 focus:ring-teal-500/40 dark:focus:ring-teal-500/40 
              focus:border-teal-500 dark:focus:border-teal-500
              focus:bg-white dark:focus:bg-slate-800
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              transition-all duration-300 ease-in-out
              hover:shadow-md focus:shadow-lg"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 
            text-gray-400 dark:text-gray-500
            group-hover:text-teal-500 dark:group-hover:text-teal-400
            transition-colors duration-300" />
          
          {/* Clear button when typing */}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
                p-1 rounded-full
                text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-slate-700
                transition-all duration-200"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          )}
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
          className="lg:hidden flex items-center justify-center p-2.5 
            text-gray-600 dark:text-gray-300 
            hover:text-teal-600 dark:hover:text-teal-400 
            transition-all duration-200 
            rounded-full 
            hover:bg-teal-50 dark:hover:bg-teal-900/20
            hover:shadow-md active:scale-95"
          title={canSearchUsers ? "Search offices, clients & users" : "Search offices & clients"}
        >
          <FaSearch className="w-5 h-5" />
        </button>

              {/* Desktop Dropdown Menu */}
        <div className={`hidden lg:flex absolute left-0 top-full mt-3 w-96 max-h-[520px] 
            bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
            border border-gray-200/50 dark:border-slate-700/50 
            rounded-2xl shadow-2xl 
            z-50 overflow-hidden flex-col
            transition-all duration-200 ease-in-out origin-top ${
              showDropdown 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 
            bg-gradient-to-r from-teal-50/80 to-cyan-50/80 dark:from-teal-900/10 dark:to-cyan-900/10
            border-b border-gray-200/50 dark:border-slate-700/50">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 dark:bg-teal-500/10">
                <FaSearch className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              Search Results
            </h3>
            
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold 
                text-teal-600 dark:text-teal-400 
                bg-teal-50 dark:bg-teal-900/20 
                border border-teal-200/60 dark:border-teal-800/60 
                rounded-full">
                {filteredResults.length} found
              </span>
            )}
          </div>

          {/* Search Results */}
          <div className="flex-1 min-h-0">
            <CustomScrollbar maxHeight="440px" className="h-full">
              {loading ? (
                <div className="flex items-center justify-center px-4 py-12">
                  <div className="w-6 h-6 border-2 border-teal-600 dark:border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Loading...</span>
                </div>
              ) : !searchQuery ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                    <FaSearch className="w-8 h-8 text-teal-500 dark:text-teal-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Start typing to search</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {canSearchUsers ? "Search by office name, location, client name, or username" : "Search by office name, location, or client name"}
                  </p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <FaSearch className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">No results found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Try searching with different keywords
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredResults.map((result, index) => (
                    <div
                      key={result._id || index}
                      onClick={() => handleResultClick(result)}
                      className="px-3 py-3 mb-1.5 rounded-xl
                        hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/50 
                        dark:hover:from-teal-900/10 dark:hover:to-cyan-900/10
                        transition-all duration-200 cursor-pointer group
                        border border-transparent hover:border-teal-200/30 dark:hover:border-teal-700/30"
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon with enhanced styling */}
                        <div className="flex-shrink-0 group-hover:scale-105 group-hover:rotate-1 transition-all duration-200">
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
                            {result.type === 'office' ? (
                              <FaBuilding className="w-5 h-5 text-teal-500" />
                            ) : result.type === 'user' ? (
                              <FaUser className="w-5 h-5 text-blue-500" />
                            ) : result.type === 'voucher' ? (
                              <FaFileAlt className="w-5 h-5 text-purple-500" />
                            ) : (
                              <FaUser className="w-5 h-5 text-rose-500" />
                            )}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  result.type === 'office' 
                                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                                    : result.type === 'user'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : result.type === 'voucher'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                                }`}>
                                  {result.type === 'office' ? 'Office' : result.type === 'user' ? 'User' : result.type === 'voucher' ? 'Voucher' : 'Direct Client'}
                                </span>
                                {result.type === 'user' && <UserBadge user={result} size="xs" />}
                              </div>
                              
                              <p className="text-sm font-semibold text-gray-900 dark:text-white 
                                group-hover:text-teal-600 dark:group-hover:text-teal-400 
                                transition-colors truncate">
                                {result.type === 'voucher' ? (
                                  `#${result.voucherNumber}`
                                ) : result.type === 'client' && result.name && result.name.length > 20 ? (
                                  `${result.name.substring(0, 20)}...`
                                ) : result.type === 'user' ? (
                                  result.username
                                ) : (
                                  result.name
                                )}
                              </p>
                              
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                {result.type === 'office' ? (
                                  <>
                                    <FaMapMarkerAlt className="w-3 h-3 text-gray-400 mr-1 inline" />
                                    {result.location}
                                  </>
                                ) : result.type === 'user' ? (
                                  'System user - View profile & analytics'
                                ) : result.type === 'voucher' ? (
                                  `${result.clientName} - ${result.status}`
                                ) : (
                                  'Individual client with vouchers'
                                )}
                              </p>
                            </div>
                            
                            {/* Arrow indicator */}
                            <div className="flex-shrink-0 text-gray-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 
                              group-hover:translate-x-1 transition-all duration-200">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
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
    </div>

    {/* Mobile Search Modal */}
    {showMobileModal && (
      <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 w-screen h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200/60 dark:border-slate-700/60 
          bg-gradient-to-r from-teal-50/80 to-cyan-50/80 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-xl bg-teal-500/10 dark:bg-teal-500/10">
              <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Search</h2>
          </div>
          <button
            onClick={() => {
              setShowMobileModal(false);
              setSearchQuery('');
            }}
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-full
              text-gray-600 dark:text-gray-300 
              hover:text-gray-900 dark:hover:text-white 
              hover:bg-gray-200/50 dark:hover:bg-slate-700/50
              transition-all duration-200 active:scale-95"
          >
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-slate-900/50 w-full">
          <div className="relative w-full">
            <input
              ref={mobileInputRef}
              type="text"
              placeholder={canSearchUsers ? "Search offices, clients, users & vouchers..." : "Search offices, clients & vouchers..."}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pl-11 pr-11 text-sm sm:text-base text-gray-900 dark:text-white 
                bg-white dark:bg-slate-800 
                border-2 border-gray-200 dark:border-slate-600 
                rounded-2xl shadow-sm
                focus:ring-2 focus:ring-teal-500/40 dark:focus:ring-teal-500/40 
                focus:border-teal-500 dark:focus:border-teal-500
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                transition-all duration-200"
            />
            <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 
              text-gray-400 dark:text-gray-500" />
            
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  mobileInputRef.current?.focus();
                }}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 
                  p-1 sm:p-1.5 rounded-full
                  text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-slate-700
                  transition-all duration-200"
              >
                <FaTimes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          
          {searchQuery && (
            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold 
                text-teal-600 dark:text-teal-400 
                bg-teal-50 dark:bg-teal-900/20 
                border border-teal-200/60 dark:border-teal-800/60 
                rounded-full">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-slate-950 w-full">
          <CustomScrollbar className="h-full w-full">
            {loading ? (
              <div className="flex items-center justify-center px-4 py-16">
                <div className="w-6 h-6 border-2 border-teal-600 dark:border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Loading...</span>
              </div>
            ) : !searchQuery ? (
              <div className="px-6 py-20 text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                  <FaSearch className="w-10 h-10 text-teal-500 dark:text-teal-400" />
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">Start typing to search</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {canSearchUsers ? "Search by office name, location, client name, or username" : "Search by office name, location, or client name"}
                </p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <FaSearch className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">No results found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <div className="p-2 sm:p-3 space-y-2 w-full">
                {filteredResults.map((result, index) => (
                  <div
                    key={result._id || index}
                    onClick={() => {
                      handleResultClick(result);
                      setShowMobileModal(false);
                      setSearchQuery('');
                    }}
                    className="px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl
                      bg-white dark:bg-slate-900
                      border border-gray-200/60 dark:border-slate-700/60
                      active:bg-gradient-to-r active:from-teal-50 active:to-cyan-50 
                      dark:active:from-teal-900/10 dark:active:to-cyan-900/10
                      active:border-teal-300 dark:active:border-teal-700
                      transition-all duration-150 cursor-pointer
                      shadow-sm active:shadow-md w-full"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
                          {result.type === 'office' ? (
                            <FaBuilding className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />
                          ) : result.type === 'user' ? (
                            <FaUser className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                          ) : result.type === 'voucher' ? (
                            <FaFileAlt className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                          ) : (
                            <FaUser className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-start justify-between gap-1 sm:gap-2 w-full overflow-hidden">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                result.type === 'office' 
                                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                                  : result.type === 'user'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : result.type === 'voucher'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                              }`}>
                                {result.type === 'office' ? 'Office' : result.type === 'user' ? 'User' : result.type === 'voucher' ? 'Voucher' : 'Direct Client'}
                              </span>
                              {result.type === 'user' && <UserBadge user={result} size="xs" />}
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-1 truncate">
                              {result.type === 'voucher' ? (
                                `#${result.voucherNumber}`
                              ) : result.type === 'client' && result.name && result.name.length > 20 ? (
                                `${result.name.substring(0, 20)}...`
                              ) : result.type === 'user' ? (
                                result.username
                              ) : (
                                result.name
                              )}
                            </p>
                            
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-1 truncate">
                              {result.type === 'office' ? (
                                <>
                                  <FaMapMarkerAlt className="w-3 h-3 text-gray-400 mr-1 inline" />
                                  {result.location}
                                </>
                              ) : result.type === 'user' ? (
                                'System user - View profile & analytics'
                              ) : result.type === 'voucher' ? (
                                `${result.clientName} - ${result.status}`
                              ) : (
                                'Individual client with vouchers'
                              )}
                            </p>
                          </div>
                          
                          {/* Arrow indicator */}
                          <div className="flex-shrink-0 text-gray-400 mt-1">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
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
  </>
  );
};

export default Searchbar; 