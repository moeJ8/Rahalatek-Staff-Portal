import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert, TextInput, Select, Modal } from 'flowbite-react';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaTrash, FaPen, FaClock } from 'react-icons/fa';

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
  const [deleteSuccess, setDeleteSuccess] = useState('');

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
  }, [deleteSuccess]);

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
      // Remove the deleted tour from the tours array
      const updatedTours = tours.filter(tour => tour._id !== tourToDelete._id);
      setTours(updatedTours);
      setFilteredTours(updatedTours);
      
      setDeleteSuccess(`Tour "${tourToDelete.name}" has been deleted successfully.`);
      // Hide success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
      closeDeleteModal();
    } catch (err) {
      console.error('Failed to delete tour:', err);
      setError('Failed to delete tour. Please try again later.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isAdmin = user && user.isAdmin;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8 sm:pb-12 md:pb-20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">Available Tours</h1>
        
        {/* Delete Success Message */}
        {deleteSuccess && (
          <Alert color="success" className="mb-4">
            <span>{deleteSuccess}</span>
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
              <Button 
                color="light" 
                onClick={resetFilters}
                disabled={!searchTerm && !cityFilter && !durationFilter}
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
            {(searchTerm || cityFilter || durationFilter) ? (
              <p>Found {filteredTours.length} result{filteredTours.length !== 1 ? 's' : ''}</p>
            ) : (
              <p>Showing all {filteredTours.length} tours</p>
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
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 sm:px-4">
            {filteredTours.map((tour) => (
              <Card key={tour._id} className="dark:bg-gray-800 h-full overflow-hidden">
                <div className="flex flex-col h-full">
                  <div>
                    <h5 className="text-lg sm:text-xl font-bold tracking-tight text-gray-800 dark:text-white mb-1 line-clamp-2">
                      {tour.name}
                    </h5>
                    <Badge color="info" className="mb-2 dark:text-cyan-500 text-xs sm:text-sm">
                    <FaMapMarkerAlt className="inline mr-1 mb-0.5" />{tour.city}</Badge>
                    <p className="font-normal text-gray-700 dark:text-white mb-2 text-sm line-clamp-3 sm:line-clamp-4 overflow-hidden">
                      {tour.description}
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                      <Badge color="success" className="text-xs sm:text-sm">${tour.price} per person</Badge>
                      <Badge color="purple" className="text-xs sm:text-sm">
                        <FaClock className="inline mr-1" />{tour.duration} hours
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 sm:pt-4">
                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">Highlights:</h6>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-400 text-xs sm:text-sm">
                          {tour.highlights.slice(0, 3).map((highlight, index) => (
                            <li key={index} className="line-clamp-1">{highlight}</li>
                          ))}
                          {tour.highlights.length > 3 && <li>...and more</li>}
                        </ul>
                      </div>
                    )}
                    
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button 
                          as={Link} 
                          to={`/admin/edit-tour/${tour._id}`}
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
                          onClick={() => openDeleteModal(tour)}
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
              <Button
                color="failure"
                onClick={handleDeleteTour}
                isProcessing={deleteLoading}
              >
                Yes, delete tour
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