import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Alert } from 'flowbite-react';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaTrash, FaPen, FaClock, FaCrown, FaUsers, FaCar, FaPlus, FaEye, FaDollarSign, FaGem } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Flag from 'react-world-flags';
import TourInfo from '../components/TourInfo';
import CustomButton from '../components/CustomButton';
import RahalatekLoader from '../components/RahalatekLoader';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Search from '../components/Search';
import Select from '../components/Select';
import toast from 'react-hot-toast';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [tourTypeFilter, setTourTypeFilter] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedHighlights, setExpandedHighlights] = useState({});

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    const fetchTours = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/tours');
        const toursData = response.data;
        
        // Sort tours by updatedAt timestamp (newest first)
        const sortedTours = toursData.sort((a, b) => {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        
        setTours(sortedTours);
        setFilteredTours(sortedTours);
        
        // Extract unique countries and cities for filters
        const countries = [...new Set(sortedTours.map(tour => tour.country).filter(Boolean))].sort();
        const cities = [...new Set(sortedTours.map(tour => tour.city))].sort();
        setAvailableCountries(countries);
        setAvailableCities(cities);
        
        setError('');
      } catch (err) {
        console.error('Failed to fetch tours:', err);
        setError('Failed to load tours. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Filter tours based on search term and filters
  useEffect(() => {
    let filtered = tours;
    
    // Apply country filter
    if (countryFilter) {
      filtered = filtered.filter(tour => tour.country === countryFilter);
    }
    
    // Apply city filter
    if (cityFilter) {
      filtered = filtered.filter(tour => tour.city === cityFilter);
    }
    
    // Apply duration filter
    if (durationFilter) {
      const duration = parseInt(durationFilter);
      if (duration === 1) {
        filtered = filtered.filter(tour => tour.duration <= 3);
      } else if (duration === 2) {
        filtered = filtered.filter(tour => tour.duration > 3 && tour.duration <= 6);
      } else if (duration === 3) {
        filtered = filtered.filter(tour => tour.duration > 6);
      }
    }
    
    // Apply tour type filter
    if (tourTypeFilter) {
      filtered = filtered.filter(tour => tour.tourType === tourTypeFilter);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        tour =>
          tour.name.toLowerCase().includes(searchTermLower) ||
          tour.city.toLowerCase().includes(searchTermLower) ||
          (tour.country && tour.country.toLowerCase().includes(searchTermLower)) ||
          (tour.description && tour.description.toLowerCase().includes(searchTermLower)) ||
          (tour.highlights && tour.highlights.some(highlight => 
            highlight.toLowerCase().includes(searchTermLower)
          ))
      );
    }
    
    setFilteredTours(filtered);
  }, [searchTerm, countryFilter, cityFilter, durationFilter, tourTypeFilter, tours]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCountryFilter = (value) => {
    setCountryFilter(value);
    // Reset city filter when country changes
    setCityFilter('');
  };

  const handleCityFilter = (value) => {
    setCityFilter(value);
  };
  
  const handleDurationFilter = (value) => {
    setDurationFilter(value);
  };
  
  const handleTourTypeFilter = (value) => {
    setTourTypeFilter(value);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setCountryFilter('');
    setCityFilter('');
    setDurationFilter('');
    setTourTypeFilter('');
  };

  const openDeleteModal = (tour) => {
    setTourToDelete(tour);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTourToDelete(null);
  };

  const handleDeleteTour = async () => {
    if (!tourToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/tours/${tourToDelete._id}`);
      const updatedTours = tours.filter(tour => tour._id !== tourToDelete._id);
      setTours(updatedTours);
      setFilteredTours(updatedTours);
      
      toast.success(`Tour "${tourToDelete.name}" has been deleted successfully.`, {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
      
      closeDeleteModal();
    } catch (err) {
      console.error('Failed to delete tour:', err);
      setError('Failed to delete tour. Please try again later.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isAdmin = user && user.isAdmin;
  const isAccountant = user && user.isAccountant;
  const isContentManager = user && user.isContentManager;

  // Helper functions
  const getCountryCode = (country) => {
    const codes = {
      'Turkey': 'TR',
      'Malaysia': 'MY',
      'Thailand': 'TH',
      'Indonesia': 'ID',
      'Saudi Arabia': 'SA',
      'Morocco': 'MA',
      'Egypt': 'EG',
      'Azerbaijan': 'AZ',
      'Georgia': 'GE',
      'Albania': 'AL'
    };
    return codes[country] || null;
  };

  const truncateDescription = (description) => {
    if (!description) return '';
    if (description.length <= 120) return description;
    return description.substring(0, 120).trim() + '...';
  };

  const toggleHighlights = (tourId) => {
    setExpandedHighlights(prev => ({
      ...prev,
      [tourId]: !prev[tourId]
    }));
  };

  return (
            <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-8 sm:pb-12 md:pb-20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Available Tours</h1>
        
        {error && (
          <Alert color="failure" className="mb-4">
            <span>{error}</span>
          </Alert>
        )}
        
        {/* Search and Filters */}
        <div className="mb-8 mx-auto px-2 sm:px-0 sm:max-w-4xl">
          {/* Search Bar */}
          <div className="mb-4">
            <Search
              placeholder="Search by name, city, description, or highlights..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
              showClearButton={true}
            />
          </div>
          
          {/* Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            <div className="w-full">
              <Select 
                value={countryFilter}
                onChange={handleCountryFilter}
                placeholder="Filter by Country"
                options={[
                  { value: '', label: 'Filter by Country' },
                  ...availableCountries.map(country => ({ value: country, label: country }))
                ]}
                className="w-full"
              />
            </div>

            <div className="w-full">
              <Select 
                value={cityFilter}
                onChange={handleCityFilter}
                placeholder="Filter by City"
                options={[
                  { value: '', label: 'Filter by City' },
                  ...availableCities
                    .filter(city => !countryFilter || tours.some(tour => tour.city === city && tour.country === countryFilter))
                    .map(city => ({ value: city, label: city }))
                ]}
                className="w-full"
                disabled={countryFilter && !tours.some(tour => tour.country === countryFilter)}
              />
            </div>
            
            <div className="w-full">
              <Select 
                value={tourTypeFilter}
                onChange={handleTourTypeFilter}
                placeholder="Filter by Type"
                options={[
                  { value: '', label: 'Filter by Type' },
                  { value: 'Group', label: 'Group Tours' },
                  { value: 'VIP', label: 'VIP Tours' }
                ]}
                className="w-full"
              />
            </div>
            
            <div className="w-full">
              <Select 
                value={durationFilter}
                onChange={handleDurationFilter}
                placeholder="Filter by Duration"
                options={[
                  { value: '', label: 'Filter by Duration' },
                  { value: '1', label: 'Short (up to 3 hours)' },
                  { value: '2', label: 'Medium (3-6 hours)' },
                  { value: '3', label: 'Long (6+ hours)' }
                ]}
                className="w-full"
              />
            </div>
            
            <div className="w-full">
              <CustomButton 
                variant="red" 
                onClick={resetFilters}
                disabled={!searchTerm && !countryFilter && !cityFilter && !durationFilter && !tourTypeFilter}
                className="w-full h-[44px] my-0.5"
                icon={FaFilter}
              >
                Clean Filters
              </CustomButton>
            </div>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {(searchTerm || countryFilter || cityFilter || durationFilter || tourTypeFilter) ? (
              <p>Found {filteredTours.length} result{filteredTours.length !== 1 ? 's' : ''}</p>
            ) : (
              <p>Showing all {filteredTours.length} tours</p>
            )}
          </div>
        </div>
        
        {/* Create button above tour cards */}
        {(isAdmin || isAccountant || isContentManager) && (
          <div className="flex justify-end mb-4 px-2 sm:px-4">
            <CustomButton
              as={Link}
              to="/dashboard?tab=tours"
              variant="green"
              icon={FaPlus}
            >
              Create Tour
            </CustomButton>
          </div>
        )}

        {loading ? (
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 sm:px-4">
            {filteredTours.map((tour) => {
              // Get primary image or first image
              const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];
              const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Tour+Image';

              return (
                <div
                  key={tour._id}
                  className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group flex flex-col h-full"
                  onClick={() => window.open(`/tours/${tour.slug}`, '_blank', 'noopener,noreferrer')}
                >
                  {/* Tour Image */}
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={tour.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-black/60 backdrop-blur-sm rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 z-10">
                      <div className="flex items-center space-x-1 text-white">
                        {tour.tourType === 'VIP' ? (
                          <FaCrown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                        ) : (
                          <FaUsers className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        )}
                        <span className="text-xs sm:text-sm font-medium">{tour.tourType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
                    {/* Tour Name */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                      {tour.name}
                    </h3>

                    {/* Location and Duration */}
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500 dark:text-red-500" />
                        <span className="text-xs sm:text-sm truncate">
                          {tour.city}{tour.country ? `, ${tour.country}` : ''}
                        </span>
                        {tour.country && getCountryCode(tour.country) && (
                          <Flag 
                            code={getCountryCode(tour.country)} 
                            height="16" 
                            width="20"
                            className="flex-shrink-0 rounded-sm inline-block ml-1 mt-1"
                            style={{ maxWidth: '20px', maxHeight: '16px' }}
                          />
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-blue-500 dark:text-teal-400" />
                        <span className="text-xs sm:text-sm">{tour.duration}h</span>
                      </div>
                    </div>

                    {/* Tour Details */}
                    <div className="space-y-2 mb-1 text-xs">
                      {/* Price */}
                      <div className="flex items-center space-x-1">
                        <FaDollarSign className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Price: <span className="text-green-600 dark:text-green-400 font-semibold">${tour.price}</span> {tour.tourType === 'Group' ? 'per person' : 'per car'}
                        </span>
                      </div>

                      {/* VIP Car Type or Group Size */}
                      {tour.tourType === 'VIP' ? (
                        <div className="flex items-center space-x-1">
                          <FaCar className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Vehicle: {tour.vipCarType} ({tour.carCapacity?.min}-{tour.carCapacity?.max} people)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <FaUsers className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Size: Any Size
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Highlights */}
                    {tour.highlights && tour.highlights.length > 0 && (
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHighlights(tour._id);
                          }}
                          className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center space-x-1">
                            <FaGem className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                            <span className="text-xs sm:text-sm font-medium">Highlights:</span>
                          </div>
                          {expandedHighlights[tour._id] ? (
                            <HiChevronUp className="text-sm transition-transform duration-200" />
                          ) : (
                            <HiChevronDown className="text-sm transition-transform duration-200" />
                          )}
                        </button>
                        
                        {/* Expanded Highlights */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedHighlights[tour._id] ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-1">
                            {tour.highlights.map((highlight, index) => (
                              <div key={index} className="flex items-start space-x-2 text-xs">
                                <span className="text-blue-500 dark:text-teal-400 mt-0.5">•</span>
                                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {tour.description && (
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {truncateDescription(tour.description)}
                      </p>
                    )}

                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 mt-auto">
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <CustomButton 
                          as={Link} 
                          to={`/tours/${tour.slug}`}
                          variant="blue"
                          size="sm"
                          className="flex-1"
                          icon={FaEye}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Tour
                        </CustomButton>
                      </div>
                      
                      {(isAdmin || isAccountant || isContentManager) && (
                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <CustomButton 
                            as={Link} 
                            to={`/dashboard/edit-tour/${tour._id}`}
                            variant="purple"
                            size="sm"
                            className="flex-1"
                            icon={FaPen}
                          >
                            Edit
                          </CustomButton>
                          {(isAdmin || isContentManager) && (
                            <CustomButton 
                              variant="red"
                              size="sm"
                              onClick={() => openDeleteModal(tour)}
                              icon={FaTrash}
                            >
                              Delete
                            </CustomButton>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No tours found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteTour}
        isLoading={deleteLoading}
        itemType="tour"
        itemName={tourToDelete?.name || 'this tour'}
      />
    </div>
  );
}