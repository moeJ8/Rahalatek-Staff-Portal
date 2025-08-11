import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Alert } from 'flowbite-react';
import RahalatekLoader from '../components/RahalatekLoader';
import { FaSearch, FaFilter, FaTrash, FaPen, FaInfoCircle } from 'react-icons/fa';
import HotelInfo from '../components/HotelInfo';
import HotelDetailModal from '../components/HotelDetailModal';
import CustomButton from '../components/CustomButton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Search from '../components/Search';
import Select from '../components/Select';
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
  
  const handleStarFilter = (value) => {
    setStarFilter(value);
  };
  
  const handleCityFilter = (value) => {
    setCityFilter(value);
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
    const isAccountant = user && user.isAccountant;

  return (
            <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-8 sm:pb-12 md:pb-20">
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
            <Search
              placeholder="Search by name, city, or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
              showClearButton={true}
            />
          </div>
          
          {/* Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
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
                value={cityFilter}
                onChange={handleCityFilter}
                placeholder="Filter by City"
                options={[
                  { value: '', label: 'Filter by City' },
                  ...availableCities.map(city => ({ value: city, label: city }))
                ]}
                className="w-full"
              />
            </div>
            
            <div className="w-full sm:col-span-2 lg:col-span-1">
              <CustomButton 
                variant="red" 
                onClick={resetFilters}
                disabled={!searchTerm && !starFilter && !cityFilter}
                className="w-full h-[44px] my-0.5"
                icon={FaFilter}
              >
                Clean Filters
              </CustomButton>
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
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 px-2 sm:px-4">
            {filteredHotels.map((hotel) => (
              <Card key={hotel._id} className="dark:bg-slate-900 overflow-hidden p-0 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <HotelInfo hotelData={hotel} />
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 p-3 mt-auto">
                    <CustomButton 
                      variant="pinkToOrange"
                      size="sm"
                      onClick={() => openDetailModal(hotel)}
                      className="w-full"
                      icon={FaInfoCircle}
                    >
                      Show More Details
                    </CustomButton>
                  </div>
                  
                  {(isAdmin || isAccountant) && (
                    <div className="mt-0 border-t border-gray-200 dark:border-gray-600 flex gap-2 p-3">
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