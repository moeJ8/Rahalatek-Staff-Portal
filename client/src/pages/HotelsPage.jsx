import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Alert } from 'flowbite-react';
import RahalatekLoader from '../components/RahalatekLoader';
import { FaSearch, FaFilter, FaTrash, FaPen, FaInfoCircle, FaPlus, FaEye, FaStar, FaMapMarkerAlt, FaBed, FaUtensils, FaPlane, FaChild, FaCarSide, FaCalendarAlt } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Flag from 'react-world-flags';
import HotelInfo from '../components/HotelInfo';
import HotelDetailModal from '../components/HotelDetailModal';
import CustomButton from '../components/CustomButton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Search from '../components/Search';
import Select from '../components/Select';
import { getRoomPriceForMonth, getMonthName } from '../utils/pricingUtils';
import toast from 'react-hot-toast';

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState({});

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    const fetchHotels = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/hotels');
        const hotelsData = response.data;
        setHotels(hotelsData);
        setFilteredHotels(hotelsData);
        
        // Extract unique countries and cities for filters
        const countries = [...new Set(hotelsData.map(hotel => hotel.country).filter(Boolean))].sort();
        const cities = [...new Set(hotelsData.map(hotel => hotel.city))].sort();
        setAvailableCountries(countries);
        setAvailableCities(cities);
        
        setError('');
      } catch (err) {
        console.error('Failed to fetch hotels:', err);
        setError('Failed to load hotels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    let filtered = hotels;

    if (starFilter) {
      filtered = filtered.filter(hotel => hotel.stars === parseInt(starFilter));
    }

    if (countryFilter) {
      filtered = filtered.filter(hotel => hotel.country === countryFilter);
    }

    if (cityFilter) {
      filtered = filtered.filter(hotel => hotel.city === cityFilter);
    }

    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        hotel =>
          hotel.name.toLowerCase().includes(searchTermLower) ||
          hotel.city.toLowerCase().includes(searchTermLower) ||
          (hotel.country && hotel.country.toLowerCase().includes(searchTermLower)) ||
          (hotel.description && hotel.description.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredHotels(filtered);
  }, [searchTerm, starFilter, countryFilter, cityFilter, hotels]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStarFilter = (value) => {
    setStarFilter(value);
  };

  const handleCountryFilter = (value) => {
    setCountryFilter(value);
    // Reset city filter when country changes
    setCityFilter('');
  };
  
  const handleCityFilter = (value) => {
    setCityFilter(value);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setStarFilter('');
    setCountryFilter('');
    setCityFilter('');
  };

  const openDeleteModal = (hotel) => {
    setHotelToDelete(hotel);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setHotelToDelete(null);
  };
  
  const openDetailModal = (hotel) => {
    setSelectedHotel(hotel);
    setDetailModalOpen(true);
  };
  
  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedHotel(null);
  };

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/hotels/${hotelToDelete._id}`);
      const updatedHotels = hotels.filter(hotel => hotel._id !== hotelToDelete._id);
      setHotels(updatedHotels);
      setFilteredHotels(updatedHotels);
      toast.success(`Hotel "${hotelToDelete.name}" has been deleted successfully.`, {
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
      console.error('Failed to delete hotel:', err);
      setError('Failed to delete hotel. Please try again later.');
    } finally {
      setDeleteLoading(false);
    }
  };

      const isAdmin = user && user.isAdmin;
    const isAccountant = user && user.isAccountant;

  // Helper functions
  const renderStars = (count) => {
    return Array(count).fill(0).map((_, i) => (
      <FaStar key={i} className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
    ));
  };

  const truncateDescription = (description) => {
    if (!description) return '';
    if (description.length <= 120) return description;
    return description.substring(0, 120).trim() + '...';
  };

  const toggleRoomExpansion = (hotelId) => {
    setExpandedRooms(prev => ({
      ...prev,
      [hotelId]: !prev[hotelId]
    }));
  };

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

  return (
            <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-8 sm:pb-12 md:pb-20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Available Hotels</h1>
        
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
              placeholder="Search by name, city, or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
              showClearButton={true}
            />
          </div>
          
          {/* Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="w-full">
              <Select 
                value={starFilter}
                onChange={handleStarFilter}
                placeholder="Filter by Stars"
                options={[
                  { value: '', label: 'Filter by Stars' },
                  { value: '1', label: '1 Star' },
                  { value: '2', label: '2 Stars' },
                  { value: '3', label: '3 Stars' },
                  { value: '4', label: '4 Stars' },
                  { value: '5', label: '5 Stars' }
                ]}
                className="w-full"
              />
            </div>

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
                    .filter(city => !countryFilter || hotels.some(hotel => hotel.city === city && hotel.country === countryFilter))
                    .map(city => ({ value: city, label: city }))
                ]}
                className="w-full"
                disabled={countryFilter && !hotels.some(hotel => hotel.country === countryFilter)}
              />
            </div>
            
            <div className="w-full sm:col-span-2 lg:col-span-1">
              <CustomButton 
                variant="red" 
                onClick={resetFilters}
                disabled={!searchTerm && !starFilter && !countryFilter && !cityFilter}
                className="w-full h-[44px] my-0.5"
                icon={FaFilter}
              >
                Clean Filters
              </CustomButton>
            </div>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {(searchTerm || starFilter || countryFilter || cityFilter) ? (
              <p>Found {filteredHotels.length} result{filteredHotels.length !== 1 ? 's' : ''}</p>
            ) : (
              <p>Showing all {filteredHotels.length} hotels</p>
            )}
          </div>
        </div>
        
        {/* Create button above hotel cards */}
        {(isAdmin || isAccountant) && (
          <div className="flex justify-end mb-4 px-2 sm:px-4">
            <CustomButton
              as={Link}
              to="/dashboard?tab=hotels"
              variant="green"
              icon={FaPlus}
            >
              Create Hotel
            </CustomButton>
          </div>
        )}

        {loading ? (
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 sm:px-4">
            {filteredHotels.map((hotel) => {
              // Get primary image or first image
              const primaryImage = hotel.images?.find(img => img.isPrimary) || hotel.images?.[0];
              const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Hotel+Image';

              return (
                <div
                  key={hotel._id}
                  className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
                  onClick={() => window.open(`/hotels/${hotel.slug}`, '_blank', 'noopener,noreferrer')}
                >
                  {/* Hotel Image */}
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-black/60 backdrop-blur-sm rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 z-10">
                      <div className="flex items-center space-x-0.5 sm:space-x-1">
                        {renderStars(hotel.stars)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hotel Details */}
                  <div className="p-3 sm:p-4 md:p-6">
                    {/* Hotel Name */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                      {hotel.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                      <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500 dark:text-red-500" />
                      <span className="text-xs sm:text-sm truncate">
                        {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
                      </span>
                      {hotel.country && getCountryCode(hotel.country) && (
                        <Flag 
                          code={getCountryCode(hotel.country)} 
                          height="16" 
                          width="20"
                          className="flex-shrink-0 rounded-sm inline-block ml-1 mt-1"
                          style={{ maxWidth: '20px', maxHeight: '16px' }}
                        />
                      )}
                    </div>

                    {/* Room Types & Pricing */}
                    {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <FaBed className="text-blue-500 dark:text-teal-400 w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Room Types:</span>
                          </div>
                          <div className="flex items-center text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1 px-2 rounded-full shadow-sm">
                            <FaCalendarAlt className="mr-1 mt-0.5" size={10} />
                            <span>{getMonthName(new Date())?.charAt(0).toUpperCase() + getMonthName(new Date())?.slice(1)} pricing</span>
                          </div>
                        </div>
                        
                        {/* First 4 rooms in 2x2 grid */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {hotel.roomTypes.slice(0, 4).map((roomType, index) => {
                            const currentDate = new Date();
                            const currentMonthPrice = getRoomPriceForMonth(roomType, currentDate, false);
                            const currentMonthChildPrice = getRoomPriceForMonth(roomType, currentDate, true);
                            const displayPrice = currentMonthPrice > 0 ? currentMonthPrice : roomType.pricePerNight;
                            const displayChildPrice = currentMonthChildPrice > 0 ? currentMonthChildPrice : roomType.childrenPricePerNight;
                            
                            return (
                              <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
                                  {roomType.type.replace(" ROOM", "").replace(" SUITE", "")}
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-green-600 dark:text-green-400 font-semibold">
                                    ${displayPrice}/night
                                  </span>
                                  {displayChildPrice > 0 && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                      <FaChild className="mr-1" size={9} />
                                      <span className="font-medium">${displayChildPrice} child</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Collapsible section for additional rooms */}
                        {hotel.roomTypes.length > 4 && (
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRoomExpansion(hotel._id);
                              }}
                              className="w-full flex items-center justify-center py-1 px-2 rounded-lg transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs"
                            >
                              <span className="font-medium mr-1">
                                {expandedRooms[hotel._id] ? 'Show Less' : `+${hotel.roomTypes.length - 4} More Rooms`}
                              </span>
                              {expandedRooms[hotel._id] ? (
                                <HiChevronUp className="text-sm transition-transform duration-200" />
                              ) : (
                                <HiChevronDown className="text-sm transition-transform duration-200" />
                              )}
                            </button>
                            
                            {/* Expanded rooms grid */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedRooms[hotel._id] ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                              <div className="grid grid-cols-2 gap-2">
                                {hotel.roomTypes.slice(4).map((roomType, index) => {
                                  const currentDate = new Date();
                                  const currentMonthPrice = getRoomPriceForMonth(roomType, currentDate, false);
                                  const currentMonthChildPrice = getRoomPriceForMonth(roomType, currentDate, true);
                                  const displayPrice = currentMonthPrice > 0 ? currentMonthPrice : roomType.pricePerNight;
                                  const displayChildPrice = currentMonthChildPrice > 0 ? currentMonthChildPrice : roomType.childrenPricePerNight;
                                  
                                  return (
                                    <div key={index + 4} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
                                        {roomType.type.replace(" ROOM", "").replace(" SUITE", "")}
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-green-600 dark:text-green-400 font-semibold">
                                          ${displayPrice}/night
                                        </span>
                                        {displayChildPrice > 0 && (
                                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                                            <FaChild className="mr-1" size={9} />
                                            <span className="font-medium">${displayChildPrice} child</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hotel Services */}
                    <div className="space-y-2 mb-3 sm:mb-4 text-xs">
                      {/* Breakfast Info */}
                      <div className="flex items-center space-x-1">
                        <FaUtensils className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {hotel.breakfastIncluded 
                            ? hotel.breakfastPrice > 0 
                              ? <>Breakfast Included (<span className="text-green-600 dark:text-green-400 font-semibold">${hotel.breakfastPrice}</span>)</> 
                              : <span className="text-green-600 dark:text-green-400 font-medium">Breakfast Included</span>
                            : hotel.breakfastPrice > 0 
                              ? <>Breakfast <span className="text-green-600 dark:text-green-400 font-semibold">${hotel.breakfastPrice}</span></>
                              : <span className="text-gray-500 dark:text-gray-400">No Breakfast</span>
                          }
                        </span>
                      </div>

                      {/* Nearest Airport */}
                      {hotel.airport && (
                        <div className="flex items-center space-x-1">
                          <FaPlane className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Nearest Airport:</span> {hotel.airport}
                          </span>
                        </div>
                      )}

                      {/* Airport Transfer */}
                      {hotel.transportation && (
                        <div className="flex items-center space-x-1">
                          <FaCarSide className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Airport Transfer: <span className="text-green-600 dark:text-green-400 font-semibold">${hotel.transportation.vitoReceptionPrice || hotel.transportation.sprinterReceptionPrice || hotel.transportation.busReceptionPrice || 0}</span> per person
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {hotel.description && (
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                        {truncateDescription(hotel.description)}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                      <CustomButton 
                        variant="pinkToOrange"
                        size="sm"
                        onClick={() => openDetailModal(hotel)}
                        className="flex-1"
                        icon={FaInfoCircle}
                      >
                        Details
                      </CustomButton>
                      <CustomButton 
                        as={Link} 
                        to={`/hotels/${hotel.slug}`}
                        variant="blue"
                        size="sm"
                        className="flex-1"
                        icon={FaEye}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </CustomButton>
                  </div>
                  
                  {(isAdmin || isAccountant) && (
                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <CustomButton 
                        as={Link} 
                        to={`/dashboard/edit-hotel/${hotel._id}`}
                        variant="purple"
                        size="sm"
                        className="flex-1"
                        icon={FaPen}
                      >
                        Edit
                      </CustomButton>
                      {isAdmin && (
                        <CustomButton 
                          variant="red"
                          size="sm"
                          onClick={() => openDeleteModal(hotel)}
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
            <p className="text-gray-600 dark:text-gray-400">No hotels found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteHotel}
        isLoading={deleteLoading}
        itemType="hotel"
        itemName={hotelToDelete?.name || 'this hotel'}
      />
      
      {selectedHotel && (
        <HotelDetailModal 
          isOpen={detailModalOpen} 
          onClose={closeDetailModal} 
          hotelData={selectedHotel} 
        />
      )}
    </div>
  );
} 