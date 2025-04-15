import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert, TextInput, Select, Modal } from 'flowbite-react';
import { FaMapMarkerAlt, FaStar, FaCoffee, FaBed, FaSearch, FaFilter, FaTrash, FaPen } from 'react-icons/fa';

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');

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
        
        // Extract unique cities for the city filter
        const cities = [...new Set(hotelsData.map(hotel => hotel.city))].sort();
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
  }, [deleteSuccess]);

  // Filter hotels based on search term and filters
  useEffect(() => {
    let filtered = hotels;
    
    // Apply star filter
    if (starFilter) {
      filtered = filtered.filter(hotel => hotel.stars === parseInt(starFilter));
    }
    
    // Apply city filter
    if (cityFilter) {
      filtered = filtered.filter(hotel => hotel.city === cityFilter);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        hotel =>
          hotel.name.toLowerCase().includes(searchTermLower) ||
          hotel.city.toLowerCase().includes(searchTermLower) ||
          (hotel.description && hotel.description.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredHotels(filtered);
  }, [searchTerm, starFilter, cityFilter, hotels]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStarFilter = (e) => {
    setStarFilter(e.target.value);
  };
  
  const handleCityFilter = (e) => {
    setCityFilter(e.target.value);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setStarFilter('');
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

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/hotels/${hotelToDelete._id}`);
      // Remove the deleted hotel from the hotels array
      const updatedHotels = hotels.filter(hotel => hotel._id !== hotelToDelete._id);
      setHotels(updatedHotels);
      setFilteredHotels(updatedHotels);
      
      setDeleteSuccess(`Hotel "${hotelToDelete.name}" has been deleted successfully.`);
      // Hide success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
      closeDeleteModal();
    } catch (err) {
      console.error('Failed to delete hotel:', err);
      setError('Failed to delete hotel. Please try again later.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isAdmin = user && user.isAdmin;

  // Render stars based on hotel rating
  const renderStars = (count) => {
    return Array(count).fill(0).map((_, index) => (
      <FaStar key={index} className="inline text-yellow-400" />
    ));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8 sm:pb-12 md:pb-20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">Available Hotels</h1>
        
        {/* Delete Success Message */}
        {deleteSuccess && (
          <Alert color="success" className="mb-4">
            <span>{deleteSuccess}</span>
          </Alert>
        )}
        
        {/* Search and Filters */}
        <div className="mb-8 mx-auto px-2 sm:px-0 sm:max-w-4xl">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <TextInput
              type="text"
              placeholder="Search by name, city, or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-full"
            />
          </div>
          
          {/* Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div className="w-full">
              <Select 
                value={starFilter}
                onChange={handleStarFilter}
                className="w-full"
              >
                <option value="">Filter by Stars</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </Select>
            </div>
            
            <div className="w-full">
              <Select 
                value={cityFilter}
                onChange={handleCityFilter}
                className="w-full"
              >
                <option value="">Filter by City</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>
            </div>
            
            <div className="w-full sm:col-span-2 lg:col-span-1">
              <Button 
                color="light" 
                onClick={resetFilters}
                disabled={!searchTerm && !starFilter && !cityFilter}
                className="w-full"
              >
                <div className="flex items-center justify-center w-full">
                  <FaFilter className="mr-1.5" />
                  <span>Reset Filters</span>
                </div>
              </Button>
            </div>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {(searchTerm || starFilter || cityFilter) ? (
              <p>Found {filteredHotels.length} result{filteredHotels.length !== 1 ? 's' : ''}</p>
            ) : (
              <p>Showing all {filteredHotels.length} hotels</p>
            )}
          </div>
        </div>
        
        {error && (
          <Alert color="failure" className="mb-4">
            <span>{error}</span>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner size="xl" />
          </div>
        ) : filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 sm:px-4">
            {filteredHotels.map((hotel) => (
              <Card key={hotel._id} className="dark:bg-gray-800 h-full overflow-hidden">
                <div className="flex flex-col h-full">
                  <div>
                    <h5 className="text-lg sm:text-xl font-bold tracking-tight text-gray-800 dark:text-white mb-1 line-clamp-2">
                      {hotel.name}
                    </h5>
                    <div className="mb-1">
                      {renderStars(hotel.stars)}
                    </div>
                    <Badge color="info" className="mb-2 dark:text-cyan-500 text-xs sm:text-sm">
                      <FaMapMarkerAlt className="inline mr-1 mb-0.5" />{hotel.city}
                    </Badge>
                    {hotel.description && (
                      <p className="font-normal text-gray-700 dark:text-white mb-3 text-sm line-clamp-3 sm:line-clamp-4 md:line-clamp-5 overflow-hidden">
                        {hotel.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                      {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                        hotel.roomTypes.map((roomType, index) => (
                          <Badge key={index} color="success" className="text-xs sm:text-sm">
                            <FaBed className="inline mr-1" />{roomType.type}: ${roomType.pricePerNight}
                          </Badge>
                        ))
                      ) : (
                        <>
                          <Badge color="success" className="text-xs sm:text-sm">${hotel.pricePerNightPerPerson} per night</Badge>
                          <Badge color="purple" className="text-xs sm:text-sm">
                            <FaBed className="inline mr-1" />{hotel.roomType}
                          </Badge>
                        </>
                      )}
                      {hotel.breakfastIncluded && (
                        <Badge color="indigo" className="text-xs sm:text-sm">
                          <FaCoffee className="inline mr-1" />Breakfast included
                        </Badge>
                      )}
                    </div>
                    {hotel.transportationPrice > 0 && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Airport transfer: ${hotel.transportationPrice} per person
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-3 sm:pt-4">
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button 
                          as={Link} 
                          to={`/admin/edit-hotel/${hotel._id}`}
                          gradientDuoTone="purpleToPink"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                        >
                          <div className="flex items-center justify-center w-full">
                            <FaPen className="mr-1.5" />
                            <span>Edit</span>
                          </div>
                        </Button>
                        <Button 
                          color="failure"
                          size="sm"
                          className="text-xs sm:text-sm"
                          onClick={() => openDeleteModal(hotel)}
                        >
                          <div className="flex items-center justify-center w-full">
                            <FaTrash className="mr-1.5" />
                            <span>Delete</span>
                          </div>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No hotels found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModalOpen}
        onClose={closeDeleteModal}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FaTrash className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the hotel
              <div className="font-bold text-gray-900 dark:text-white mt-1">
                "{hotelToDelete?.name}"?
              </div>
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={handleDeleteHotel}
                isProcessing={deleteLoading}
              >
                Yes, delete hotel
              </Button>
              <Button
                color="gray"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
} 