import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomScrollbar from './CustomScrollbar';

const OfficeSearchDropdown = () => {
  const [offices, setOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const navigate = useNavigate();

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

  // Fetch offices on mount
  useEffect(() => {
    fetchOffices();
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

  // Filter offices based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOffices([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = offices.filter(office => 
      office.name.toLowerCase().includes(query) ||
      office.location.toLowerCase().includes(query)
    );
    setFilteredOffices(filtered);
  }, [searchQuery, offices]);

  const fetchOffices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/offices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffices(response.data.data);
    } catch (error) {
      console.error('Error fetching offices:', error);
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

  const handleOfficeClick = (officeName) => {
    navigate(`/office/${encodeURIComponent(officeName)}`);
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
            placeholder="Search offices..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="w-64 px-4 py-2 pl-10 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors duration-200"
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
          title="Search offices"
        >
          <FaSearch className="w-5 h-5" />
        </button>

              {/* Desktop Dropdown Menu */}
        {showDropdown && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 max-h-[400px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-teal-50 dark:bg-teal-900/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaBuilding className="w-4 h-4 mr-2 text-teal-600 dark:text-teal-400" />
              Offices
            </h3>
            
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-teal-600 bg-teal-50 border border-teal-200 rounded-md dark:text-teal-400 dark:bg-teal-900/20 dark:border-teal-800">
                {filteredOffices.length} found
              </span>
            )}
          </div>

          {/* Search Results */}
          <div className="flex-1 min-h-0 border-t border-gray-200 dark:border-slate-700">
            <CustomScrollbar maxHeight="320px" className="h-full">
              {loading ? (
                <div className="flex items-center justify-center px-4 py-8">
                  <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading offices...</span>
                </div>
              ) : !searchQuery ? (
                <div className="px-4 py-8 text-center">
                  <FaSearch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Start typing to search offices</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Search by office name or location
                  </p>
                </div>
              ) : filteredOffices.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FaBuilding className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No offices found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Try searching with different keywords
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredOffices.map((office) => (
                    <div
                      key={office._id}
                      onClick={() => handleOfficeClick(office.name)}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <FaBuilding className="w-4 h-4 text-teal-500" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {office.name}
                              </p>
                              
                              {/* Location */}
                              <div className="flex items-center mt-1">
                                <FaMapMarkerAlt className="w-3 h-3 text-gray-400 mr-1" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {office.location}
                                </p>
                              </div>
                              
                              {/* Contact Info */}
                              <div className="flex items-center space-x-4 mt-2">
                                {office.email && (
                                  <div className="flex items-center">
                                    <FaEnvelope className="w-3 h-3 text-gray-400 mr-1" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                      {office.email}
                                    </span>
                                  </div>
                                )}
                                
                                {office.phoneNumber && (
                                  <div className="flex items-center">
                                    <FaPhone className="w-3 h-3 text-gray-400 mr-1" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {office.phoneNumber}
                                    </span>
                                  </div>
                                )}
                              </div>
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
              placeholder="Search offices..."
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
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading offices...</span>
              </div>
            ) : !searchQuery ? (
              <div className="px-4 py-8 text-center">
                <FaSearch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Start typing to search offices</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Search by office name or location
                </p>
              </div>
            ) : filteredOffices.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <FaBuilding className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">No offices found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredOffices.map((office) => (
                  <div
                    key={office._id}
                    onClick={() => {
                      handleOfficeClick(office.name);
                      setShowMobileModal(false);
                      setSearchQuery('');
                    }}
                    className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <FaBuilding className="w-5 h-5 text-teal-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {office.name}
                        </p>
                        
                        <div className="flex items-center mt-1">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {office.location}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          {office.email && (
                            <div className="flex items-center">
                              <FaEnvelope className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {office.email}
                              </span>
                            </div>
                          )}
                          
                          {office.phoneNumber && (
                            <div className="flex items-center">
                              <FaPhone className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {office.phoneNumber}
                              </span>
                            </div>
                          )}
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

export default OfficeSearchDropdown; 