import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Alert, TextInput, Select, Modal } from 'flowbite-react';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaTrash, FaPen, FaClock, FaCrown, FaUsers, FaCar } from 'react-icons/fa';
import TourInfo from '../components/TourInfo';
import CustomButton from '../components/CustomButton';
import RahalatekLoader from '../components/RahalatekLoader';
import toast from 'react-hot-toast';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        
        // Extract unique cities for city filter
        const cities = [...new Set(sortedTours.map(tour => tour.city))].sort();
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
    
    // Apply search term
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        tour =>
          tour.name.toLowerCase().includes(searchTermLower) ||
          tour.city.toLowerCase().includes(searchTermLower) ||
          (tour.description && tour.description.toLowerCase().includes(searchTermLower)) ||
          (tour.highlights && tour.highlights.some(highlight => 
            highlight.toLowerCase().includes(searchTermLower)
          ))
      );
    }
    
    setFilteredTours(filtered);
  }, [searchTerm, cityFilter, durationFilter, tours]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCityFilter = (e) => {
    setCityFilter(e.target.value);
  };
  
  const handleDurationFilter = (e) => {
    setDurationFilter(e.target.value);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setDurationFilter('');
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

  return (
            <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-8 sm:pb-12 md:pb-20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">Available Tours</h1>
        
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
              placeholder="Search by name, city, description, or highlights..."
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
            
            <div className="w-full">
              <Select 
                value={durationFilter}
                onChange={handleDurationFilter}
                className="w-full"
              >
                <option value="">Filter by Duration</option>
                <option value="1">Short (up to 3 hours)</option>
                <option value="2">Medium (3-6 hours)</option>
                <option value="3">Long (6+ hours)</option>
              </Select>
            </div>
            
            <div className="w-full sm:col-span-2 lg:col-span-1">
              <CustomButton 
                variant="gray" 
                onClick={resetFilters}
                disabled={!searchTerm && !cityFilter && !durationFilter}
                className="w-full"
                icon={FaFilter}
              >
                Reset Filters
              </CustomButton>
            </div>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {(searchTerm || cityFilter || durationFilter) ? (
              <p>Found {filteredTours.length} result{filteredTours.length !== 1 ? 's' : ''}</p>
            ) : (
              <p>Showing all {filteredTours.length} tours</p>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 sm:px-4">
            {filteredTours.map((tour) => (
              <Card key={tour._id} className="overflow-hidden h-full min-h-[26rem] p-0 dark:bg-slate-900">
                <div className="flex flex-col h-full">
                  <div className="flex-grow">
                    <TourInfo tourData={tour} />
                  </div>
                  
                  {(isAdmin || isAccountant) && (
                    <div className="mt-3 border-t border-gray-200 dark:border-gray-600 flex gap-2 p-3">
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
                      {isAdmin && (
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
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No tours found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModalOpen}
        onClose={closeDeleteModal}
        popup
        size="md"
        theme={{
          root: {
            base: "fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
            show: {
              on: "flex bg-gray-900 bg-opacity-50 backdrop-blur-sm dark:bg-opacity-80 items-center justify-center",
              off: "hidden"
            }
          },
          content: {
            base: "relative h-full w-full p-4 h-auto",
            inner: "relative rounded-lg bg-white shadow dark:bg-gray-700 flex flex-col max-h-[90vh]"
          }
        }}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FaTrash className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the tour
              <div className="font-bold text-gray-900 dark:text-white mt-1">
                "{tourToDelete?.name}"?
              </div>
            </h3>
            <div className="flex justify-center gap-4">
              <CustomButton
                variant="red"
                onClick={handleDeleteTour}
                loading={deleteLoading}
              >
                Yes, delete tour
              </CustomButton>
              <CustomButton
                variant="gray"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                No, cancel
              </CustomButton>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}