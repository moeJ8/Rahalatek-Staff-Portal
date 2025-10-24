import React, { useState, useEffect, useCallback } from 'react';
import { FaStar, FaMapMarkerAlt, FaFilter, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import Flag from 'react-world-flags';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RahalatekLoader from '../../components/RahalatekLoader';
import Search from '../../components/Search';
import Select from '../../components/Select';
import CustomButton from '../../components/CustomButton';
import axios from 'axios';
import PLACEHOLDER_IMAGES from '../../utils/placeholderImage';

const GuestHotelsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenType, setScreenType] = useState('desktop');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);
  const navigate = useNavigate();

  // Check screen size for responsive behavior
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
    } else if (width < 1024) {
      setScreenType('tablet');
    } else {
      setScreenType('desktop');
    }
  }, []);

  // Items per page based on screen type
  const getItemsPerPage = useCallback((type) => {
    switch(type) {
      case 'mobile':
        return 3;
      case 'tablet':
        return 6;
      case 'desktop':
      default:
        return 9;
    }
  }, []);

  // Debounce search term (300ms delay for faster response)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when screen type or filters change
  useEffect(() => {
    setPage(1);
  }, [screenType, debouncedSearchTerm, countryFilter, cityFilter, starFilter]);

  // Screen size effect
  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  // Set page title and meta tags (dynamically based on filters)
  useEffect(() => {
    // Dynamic title based on city filter
    if (cityFilter) {
      document.title = `${cityFilter} Hotels | Rahalatek`;
    } else if (countryFilter) {
      document.title = `${countryFilter} Hotels | Rahalatek`;
    } else {
      document.title = 'Rahalatek | Hotels';
    }
    
    // Update meta description based on location
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      let description;
      if (cityFilter) {
        description = `Discover luxury hotels in ${cityFilter} with Rahalatek. Browse 3-star to 5-star hotels, resorts, and premium accommodations in ${cityFilter}. Book your perfect ${cityFilter} hotel stay today.`;
      } else if (countryFilter) {
        description = `Explore ${countryFilter} hotels with Rahalatek. Find luxury hotels, resorts, and premium accommodations throughout ${countryFilter}. Book your perfect ${countryFilter} hotel stay today.`;
      } else {
        description = 'Browse luxury hotels and premium accommodations with Rahalatek. Find 3-star to 5-star hotels, resorts, and boutique accommodations worldwide. Book your perfect stay today.';
      }
      metaDescription.setAttribute('content', description);
    }

    // Update keywords based on location
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      let keywords;
      if (cityFilter) {
        keywords = `${cityFilter} hotels, ${cityFilter} accommodations, ${cityFilter} luxury hotels, ${cityFilter} resorts, hotels in ${cityFilter}, ${cityFilter} hospitality, ${cityFilter} lodging, ${cityFilter} hotel booking`;
      } else if (countryFilter) {
        keywords = `${countryFilter} hotels, ${countryFilter} accommodations, ${countryFilter} luxury hotels, ${countryFilter} resorts, hotels in ${countryFilter}, ${countryFilter} hospitality`;
      } else {
        keywords = 'hotels, luxury hotels, accommodations, resorts, boutique hotels, 3-star hotels, 4-star hotels, 5-star hotels, hotel booking, premium accommodations, hotel rooms, hospitality, lodging, hotel deals';
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Update Open Graph based on location
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      let title;
      if (cityFilter) {
        title = `${cityFilter} Hotels | Rahalatek`;
      } else if (countryFilter) {
        title = `${countryFilter} Hotels | Rahalatek`;
      } else {
        title = 'Browse Hotels - Rahalatek | Luxury Hotels & Accommodations';
      }
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      let description;
      if (cityFilter) {
        description = `Discover luxury hotels in ${cityFilter} with Rahalatek. Browse premium accommodations and resorts in ${cityFilter}.`;
      } else if (countryFilter) {
        description = `Explore ${countryFilter} hotels with Rahalatek. Find luxury hotels and premium accommodations throughout ${countryFilter}.`;
      } else {
        description = 'Browse luxury hotels and premium accommodations with Rahalatek. Find 3-star to 5-star hotels and resorts worldwide.';
      }
      ogDescription.setAttribute('content', description);
    }
  }, [cityFilter, countryFilter]);

  // Fetch filter options (only once on mount)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await axios.get('/api/hotels');
      const allHotels = response.data;
      
      // Extract unique countries and cities for filters
      const countries = [...new Set(allHotels.map(hotel => hotel.country).filter(Boolean))].sort();
      const cities = [...new Set(allHotels.map(hotel => hotel.city))].sort();
      setAvailableCountries(countries);
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  // Fetch hotels with server-side pagination and filtering
  const fetchHotels = useCallback(async () => {
    try {
      // Only show loading on initial page load
      if (page === 1 && !countryFilter && !cityFilter && !debouncedSearchTerm && !starFilter && hotels.length === 0) {
        setLoading(true);
      }
      
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: getItemsPerPage(screenType).toString()
      });
      
      if (countryFilter) params.append('country', countryFilter);
      if (cityFilter) params.append('city', cityFilter);
      if (starFilter) params.append('stars', starFilter);
      if (debouncedSearchTerm.trim()) params.append('search', debouncedSearchTerm.trim());
      
      const response = await axios.get(`/api/hotels?${params.toString()}`);
      
      if (response.data.success) {
        // Server-side paginated response
        setHotels(response.data.data.hotels);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalHotels(response.data.data.pagination.totalHotels);
      }
      
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Failed to load hotels. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, screenType, countryFilter, cityFilter, starFilter, debouncedSearchTerm, getItemsPerPage, hotels.length]);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch hotels when dependencies change
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // No more client-side filtering - everything is server-side now
  const displayedHotels = hotels;

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);
  
  const handleStarFilter = useCallback((value) => {
    setStarFilter(value);
  }, []);

  const handleCountryFilter = useCallback((value) => {
    setCountryFilter(value);
    setCityFilter(''); // Reset city filter when country changes
  }, []);

  const handleCityFilter = useCallback((value) => {
    setCityFilter(value);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setStarFilter('');
    setCountryFilter('');
    setCityFilter('');
  }, []);

  const handleHotelClick = useCallback(async (hotel) => {
    try {
      // Increment view count
      await axios.post(`/api/hotels/public/${hotel.slug}/view`);
    } catch (error) {
      console.error('Error incrementing hotel views:', error);
    }
    
    // Navigate to hotel page
    navigate(`/hotels/${hotel.slug}`);
  }, [navigate]);

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
          <div className={`flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500 dark:text-red-500" />
            <span className="text-xs sm:text-sm truncate">
              {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
            </span>
            {hotel.country && getCountryCode(hotel.country) && (
              <Flag 
                code={getCountryCode(hotel.country)} 
                height="16" 
                width="20"
                className="flex-shrink-0 rounded-sm inline-block mt-1"
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('hotelsPage.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {t('hotelsPage.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 mx-auto px-2 sm:px-0 sm:max-w-4xl">
          {/* Search Bar */}
          <div className="mb-4">
            <Search
              placeholder={t('hotelsPage.searchPlaceholder')}
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
                placeholder={t('hotelsPage.filterByStars')}
                options={[
                  { value: '', label: t('hotelsPage.filterByStars') },
                  { value: '1', label: `1 ${t('hotelsPage.star')}` },
                  { value: '2', label: `2 ${t('hotelsPage.stars')}` },
                  { value: '3', label: `3 ${t('hotelsPage.stars')}` },
                  { value: '4', label: `4 ${t('hotelsPage.stars')}` },
                  { value: '5', label: `5 ${t('hotelsPage.stars')}` }
                ]}
                className="w-full"
              />
            </div>

            <div className="w-full">
              <Select 
                value={countryFilter}
                onChange={handleCountryFilter}
                placeholder={t('hotelsPage.filterByCountry')}
                options={[
                  { value: '', label: t('hotelsPage.filterByCountry') },
                  ...availableCountries.map(country => ({ value: country, label: country }))
                ]}
                className="w-full"
              />
            </div>
            
            <div className="w-full">
              <Select 
                value={cityFilter}
                onChange={handleCityFilter}
                placeholder={t('hotelsPage.filterByCity')}
                options={[
                  { value: '', label: t('hotelsPage.filterByCity') },
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
                {t('hotelsPage.clearFilters')}
              </CustomButton>
            </div>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {totalHotels > 0 ? (
              <>{t('hotelsPage.showingPage')} {page} {t('hotelsPage.of')} {totalPages} ({totalHotels} {t('hotelsPage.hotelsTotal')})</>
            ) : (
              <>{t('hotelsPage.noHotelsFound')}</>
            )}
          </div>
        </div>

        {/* Hotels Grid */}
        {displayedHotels.length > 0 ? (
          <>
            <div className={`grid gap-4 sm:gap-6 ${
              screenType === 'mobile' 
                ? 'grid-cols-1' 
                : screenType === 'tablet'
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}>
              {displayedHotels.map((hotel) => (
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
                  {isRTL ? <FaAngleRight className="w-4 h-4" /> : <FaAngleLeft className="w-4 h-4" />}
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
                  {isRTL ? <FaAngleLeft className="w-4 h-4" /> : <FaAngleRight className="w-4 h-4" />}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('hotelsPage.noHotelsAvailable')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('hotelsPage.checkBackLater')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestHotelsPage;
