import React, { useState, useEffect } from 'react';
import { FaStar, FaMapMarkerAlt, FaFilter, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import Flag from 'react-world-flags';
import { useNavigate } from 'react-router-dom';
import RahalatekLoader from '../../components/RahalatekLoader';
import Search from '../../components/Search';
import Select from '../../components/Select';
import CustomButton from '../../components/CustomButton';
import axios from 'axios';
import PLACEHOLDER_IMAGES from '../../utils/placeholderImage';

const GuestHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenType, setScreenType] = useState('desktop');
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Check screen size for responsive behavior
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
    } else if (width < 1024) {
      setScreenType('tablet');
    } else {
      setScreenType('desktop');
    }
  };

  // Items per page based on screen type
  const getItemsPerPage = (type) => {
    switch(type) {
      case 'mobile':
        return 3;
      case 'tablet':
        return 6;
      case 'desktop':
      default:
        return 9;
    }
  };

  // Pagination logic
  const itemsPerPage = getItemsPerPage(screenType);
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHotels = filteredHotels.slice(startIndex, endIndex);

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Reset to page 1 when screen type or filters change
  useEffect(() => {
    setPage(1);
  }, [screenType, searchTerm, starFilter, countryFilter, cityFilter]);

  // Set page title and meta tags
  useEffect(() => {
    document.title = 'Rahalatek | Hotels';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Browse luxury hotels and premium accommodations with Rahalatek. Find 3-star to 5-star hotels, resorts, and boutique accommodations worldwide. Book your perfect stay today.'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'hotels, luxury hotels, accommodations, resorts, boutique hotels, 3-star hotels, 4-star hotels, 5-star hotels, hotel booking, premium accommodations, hotel rooms, hospitality, lodging, hotel deals'
      );
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Browse Hotels - Rahalatek | Luxury Hotels & Accommodations');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        'Browse luxury hotels and premium accommodations with Rahalatek. Find 3-star to 5-star hotels and resorts worldwide.'
      );
    }
  }, []);

  // Fetch hotels
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/hotels');
        const hotelsData = response.data;
        setHotels(hotelsData);
        setFilteredHotels(hotelsData);
        
        // Extract unique countries and cities for filters
        const countries = [...new Set(hotelsData.map(hotel => hotel.country).filter(Boolean))].sort();
        const cities = [...new Set(hotelsData.map(hotel => hotel.city))].sort();
        setAvailableCountries(countries);
        setAvailableCities(cities);
        
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setError('Failed to load hotels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Filter hotels based on search term and filters
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
    setCityFilter(''); // Reset city filter when country changes
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

  const handleHotelClick = async (hotel) => {
    try {
      // Increment view count
      await axios.post(`/api/hotels/public/${hotel.slug}/view`);
    } catch (error) {
      console.error('Error incrementing hotel views:', error);
    }
    
    // Navigate to hotel page
    navigate(`/hotels/${hotel.slug}`);
  };

  const truncateDescription = (description, screenType) => {
    if (!description) return '';
    // Adjust truncation based on screen size
    const maxLength = screenType === 'mobile' ? 80 : screenType === 'tablet' ? 100 : 120;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`w-3 h-3 sm:w-4 sm:h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      );
    }
    return stars;
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

  const HotelCard = ({ hotel }) => {
    // Get primary image or first image
    const primaryImage = hotel.images?.find(img => img.isPrimary) || hotel.images?.[0];
    const imageUrl = primaryImage?.url || PLACEHOLDER_IMAGES.hotel;

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
        onClick={() => handleHotelClick(hotel)}
      >
        {/* Hotel Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
            {renderStars(hotel.stars)}
          </div>

          {/* Hotel Name - Inside image at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className={`text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(hotel.name) ? 'text-right' : 'text-left'
            }`}>
              {hotel.name}
            </h3>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="p-3 sm:p-4 md:p-6">

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

          {/* Description */}
          {hotel.description && (
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
              {truncateDescription(hotel.description, screenType)}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Hotels</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Our Hotels
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Discover our collection of premium hotels and accommodations
          </p>
        </div>

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
                variant="rippleRedToDarkRed" 
                onClick={resetFilters}
                disabled={!searchTerm && !starFilter && !countryFilter && !cityFilter}
                className="w-full h-[44px] my-0.5"
                icon={FaFilter}
              >
                Clear Filters
              </CustomButton>
            </div>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {(searchTerm || starFilter || countryFilter || cityFilter) ? (
              <>Showing {filteredHotels.length} of {hotels.length} hotels</>
            ) : (
              <>Showing all {hotels.length} hotels</>
            )}
          </div>
        </div>

        {/* Hotels Grid */}
        {paginatedHotels.length > 0 ? (
          <>
            <div className={`grid gap-4 sm:gap-6 ${
              screenType === 'mobile' 
                ? 'grid-cols-1' 
                : screenType === 'tablet'
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}>
              {paginatedHotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                    page === 1
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:scale-110 shadow-sm hover:shadow-md'
                  }`}
                  aria-label="Previous page"
                >
                  <FaAngleLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers - Sliding Window */}
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let startPage = Math.max(1, page - Math.floor(showPages / 2));
                  let endPage = Math.min(totalPages, startPage + showPages - 1);
                  
                  if (endPage - startPage < showPages - 1) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  // Generate page number buttons (sliding window - no ellipsis)
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                          i === page
                            ? 'bg-blue-500 dark:bg-yellow-600 text-white dark:text-gray-900 border-blue-500 dark:border-yellow-600 scale-110 shadow-lg'
                            : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-yellow-600 dark:hover:text-gray-900 hover:border-blue-500 dark:hover:border-yellow-600 hover:scale-110 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Next Button */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                    page === totalPages
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:scale-110 shadow-sm hover:shadow-md'
                  }`}
                  aria-label="Next page"
                >
                  <FaAngleRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Hotels Available</h3>
            <p className="text-gray-600 dark:text-gray-400">Please check back later for our latest hotel offerings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestHotelsPage;
