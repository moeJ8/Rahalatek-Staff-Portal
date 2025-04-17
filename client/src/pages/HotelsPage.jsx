import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Spinner, Alert, TextInput, Select, Modal } from 'flowbite-react';
import { FaSearch, FaFilter, FaTrash, FaPen, FaInfoCircle } from 'react-icons/fa';
import HotelInfo from '../components/HotelInfo';
import HotelDetailModal from '../components/HotelDetailModal';
import toast from 'react-hot-toast';

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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

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
  }, []);

  useEffect(() => {
    let filtered = hotels;

    if (starFilter) {
      filtered = filtered.filter(hotel => hotel.stars === parseInt(starFilter));
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

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8 sm:pb-12 md:pb-20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">Available Hotels</h1>
        
        {error && (
          <Alert color="failure" className="mb-4">
            <span>{error}</span>
          </Alert>
        )}
        
        {/* Search and Filters */}
        <div className="mb-8 mx-auto px-2 sm:px-0 sm:max-w-4xl">
          {/* Search Bar */}
          <div className="mb-4">
            <TextInput
              type="text"
              placeholder="Search by name, city, or description..."
              value={searchTerm}
              onChange={handleSearch}
              icon={FaSearch}
              className="w-full"
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
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 px-2 sm:px-4">
            {filteredHotels.map((hotel) => (
              <Card key={hotel._id} className="dark:bg-gray-800 overflow-hidden p-0">
                <div className="flex flex-col h-full">
                  <HotelInfo hotelData={hotel} />
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 p-3 mt-3">
                    <Button 
                      gradientDuoTone="pinkToOrange"
                      size="sm"
                      onClick={() => openDetailModal(hotel)}
                      className="w-full"
                    >
                      <div className="flex items-center justify-center w-full">
                        <FaInfoCircle className="mr-1.5" />
                        <span>Show More Details</span>
                      </div>
                    </Button>
                  </div>
                  
                  {isAdmin && (
                    <div className="mt-3 border-t border-gray-200 dark:border-gray-600 flex gap-2 p-3">
                      <Button 
                        as={Link} 
                        to={`/admin/edit-hotel/${hotel._id}`}
                        gradientDuoTone="purpleToPink"
                        size="sm"
                        className="flex-1"
                      >
                        <div className="flex items-center justify-center w-full">
                          <FaPen className="mr-1.5" />
                          <span>Edit</span>
                        </div>
                      </Button>
                      <Button 
                        color="failure"
                        size="sm"
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
        size="md"
      >
        <Modal.Header>Confirm Deletion</Modal.Header>
        <Modal.Body>
          <div className="text-center sm:text-left">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete hotel <span className="font-semibold">{hotelToDelete?.name}</span>?
              This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button 
            color="failure" 
            onClick={handleDeleteHotel}
            isProcessing={deleteLoading}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
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