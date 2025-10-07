import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaArrowLeft, FaClock, FaUsers, FaCrown, FaGem, FaStar } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Flag from 'react-world-flags';
import axios from 'axios';
import RahalatekLoader from '../../components/RahalatekLoader';
import CustomButton from '../../components/CustomButton';

const GuestCityPage = () => {
  const { country, city } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [toursLoading, setToursLoading] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [expandedHighlights, setExpandedHighlights] = useState({});
  
  // Carousel state for tours
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [tourScreenType, setTourScreenType] = useState('desktop');
  const [toursPerSlide, setToursPerSlide] = useState(3);
  const [tourIsTransitioning, setTourIsTransitioning] = useState(false);
  const tourCarouselRef = useRef(null);
  
  // Carousel state for hotels
  const [currentHotelSlide, setCurrentHotelSlide] = useState(0);
  const [hotelScreenType, setHotelScreenType] = useState('desktop');
  const [hotelsPerSlide, setHotelsPerSlide] = useState(3);
  const [hotelIsTransitioning, setHotelIsTransitioning] = useState(false);
  const hotelCarouselRef = useRef(null);

  // Decode URL parameters
  const countryName = decodeURIComponent(country);
  const cityName = decodeURIComponent(city);

  // Set page title and meta tags
  useEffect(() => {
    document.title = `${cityName}, ${countryName} | Rahalatek`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && cityData) {
      metaDescription.setAttribute('content', 
        cityData.description.substring(0, 160)
      );
    }
  }, [cityName, countryName, cityData]);

  // Screen size detection for tours carousel
  const updateTourScreenSize = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setTourScreenType('mobile');
      setToursPerSlide(1);
    } else if (width < 1024) {
      setTourScreenType('tablet');
      setToursPerSlide(2);
    } else {
      setTourScreenType('desktop');
      setToursPerSlide(3);
    }
  }, []);

  // Screen size detection for hotels carousel
  const updateHotelScreenSize = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setHotelScreenType('mobile');
      setHotelsPerSlide(1);
    } else if (width < 1024) {
      setHotelScreenType('tablet');
      setHotelsPerSlide(2);
    } else {
      setHotelScreenType('desktop');
      setHotelsPerSlide(3);
    }
  }, []);

  useEffect(() => {
    updateTourScreenSize();
    updateHotelScreenSize();
    window.addEventListener('resize', updateTourScreenSize);
    window.addEventListener('resize', updateHotelScreenSize);
    return () => {
      window.removeEventListener('resize', updateTourScreenSize);
      window.removeEventListener('resize', updateHotelScreenSize);
    };
  }, [updateTourScreenSize, updateHotelScreenSize]);

  // Calculate total slides
  const totalTourSlides = Math.ceil((cityData?.tours?.length || 0) / toursPerSlide);
  const totalHotelSlides = Math.ceil((cityData?.hotels?.length || 0) / hotelsPerSlide);

  // Reset slides when screen size changes
  useEffect(() => {
    if (currentTourSlide >= totalTourSlides) {
      setCurrentTourSlide(0);
    }
  }, [totalTourSlides, currentTourSlide]);

  useEffect(() => {
    if (currentHotelSlide >= totalHotelSlides) {
      setCurrentHotelSlide(0);
    }
  }, [totalHotelSlides, currentHotelSlide]);

  // Tour carousel navigation
  const nextTourSlide = useCallback(() => {
    if (tourIsTransitioning) return;
    setTourIsTransitioning(true);
    setCurrentTourSlide((prev) => (prev + 1) % totalTourSlides);
    setTimeout(() => setTourIsTransitioning(false), 500);
  }, [tourIsTransitioning, totalTourSlides]);

  const prevTourSlide = useCallback(() => {
    if (tourIsTransitioning) return;
    setTourIsTransitioning(true);
    setCurrentTourSlide((prev) => (prev - 1 + totalTourSlides) % totalTourSlides);
    setTimeout(() => setTourIsTransitioning(false), 500);
  }, [tourIsTransitioning, totalTourSlides]);

  const goToTourSlide = useCallback((slideIndex) => {
    if (tourIsTransitioning || slideIndex === currentTourSlide) return;
    setTourIsTransitioning(true);
    setCurrentTourSlide(slideIndex);
    setTimeout(() => setTourIsTransitioning(false), 500);
  }, [tourIsTransitioning, currentTourSlide]);

  // Hotel carousel navigation
  const nextHotelSlide = useCallback(() => {
    if (hotelIsTransitioning) return;
    setHotelIsTransitioning(true);
    setCurrentHotelSlide((prev) => (prev + 1) % totalHotelSlides);
    setTimeout(() => setHotelIsTransitioning(false), 500);
  }, [hotelIsTransitioning, totalHotelSlides]);

  const prevHotelSlide = useCallback(() => {
    if (hotelIsTransitioning) return;
    setHotelIsTransitioning(true);
    setCurrentHotelSlide((prev) => (prev - 1 + totalHotelSlides) % totalHotelSlides);
    setTimeout(() => setHotelIsTransitioning(false), 500);
  }, [hotelIsTransitioning, totalHotelSlides]);

  const goToHotelSlide = useCallback((slideIndex) => {
    if (hotelIsTransitioning || slideIndex === currentHotelSlide) return;
    setHotelIsTransitioning(true);
    setCurrentHotelSlide(slideIndex);
    setTimeout(() => setHotelIsTransitioning(false), 500);
  }, [hotelIsTransitioning, currentHotelSlide]);

  // Handle tour click
  const handleTourClick = async (tour) => {
    try {
      await axios.post(`/api/tours/public/${tour.slug}/view`);
    } catch (error) {
      console.error('Error incrementing tour views:', error);
    }
    navigate(`/tours/${tour.slug}`);
  };

  // Handle hotel click
  const handleHotelClick = async (hotel) => {
    try {
      await axios.post(`/api/hotels/public/${hotel.slug}/view`);
    } catch (error) {
      console.error('Error incrementing hotel views:', error);
    }
    navigate(`/hotels/${hotel.slug}`);
  };

  // Get country code
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

  // Toggle highlights
  const toggleHighlights = (tourId) => {
    setExpandedHighlights(prev => ({
      ...prev,
      [tourId]: !prev[tourId]
    }));
  };

  // Render stars for hotels
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      );
    }
    return stars;
  };

  // Truncate hotel description
  const truncateDescription = (description) => {
    if (!description) return '';
    const maxLength = 120;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  // Fetch city data
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/destinations/${encodeURIComponent(countryName)}/cities/${encodeURIComponent(cityName)}`);
        setCityData(response.data);
        setToursLoading(false);
        setHotelsLoading(false);
        setLoading(false);
      } catch (error) {
        console.error('Error loading city data:', error);
        setError(error.response?.data?.message || 'Failed to load city data');
        setLoading(false);
        setToursLoading(false);
        setHotelsLoading(false);
      }
    };

    fetchCityData();
  }, [countryName, cityName]);

  // Tour Card Component
  const TourCard = ({ tour }) => {
    const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];
    const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Tour+Image';

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group flex flex-col relative"
        onClick={() => handleTourClick(tour)}
      >
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={tour.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
            {tour.tourType === 'VIP' ? (
              <FaCrown className="w-4 h-4 text-yellow-400" />
            ) : (
              <FaUsers className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm font-medium">{tour.tourType}</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className={`text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(tour.name) ? 'text-right' : 'text-left'
            }`}>
              {tour.name}
            </h3>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500" />
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
              <FaClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-blue-500 dark:text-yellow-400" />
              <span className="text-xs sm:text-sm">{tour.duration}h</span>
            </div>
          </div>

          {tour.highlights && tour.highlights.length > 0 && (
            <div className="mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHighlights(tour._id);
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-1">
                  <FaGem className="text-blue-500 dark:text-yellow-400 w-3 h-3" />
                  <span className="text-xs sm:text-sm font-medium">Highlights:</span>
                </div>
                {expandedHighlights[tour._id] ? (
                  <HiChevronUp className="text-sm transition-transform duration-200" />
                ) : (
                  <HiChevronDown className="text-sm transition-transform duration-200" />
                )}
              </button>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedHighlights[tour._id] ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-1">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <span className="text-blue-500 dark:text-yellow-400 mt-0.5">•</span>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tour.description && (
            <p className={`text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(tour.description) ? 'text-right' : 'text-left'
            }`}>
              {tour.description}
            </p>
          )}

          <div className="mt-auto">
            <div className="text-right">
              {tour.totalPrice && Number(tour.totalPrice) > 0 ? (
                <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                  ${tour.totalPrice}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Contact for pricing
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Hotel Card Component
  const HotelCard = ({ hotel }) => {
    const primaryImage = hotel.images?.find(img => img.isPrimary) || hotel.images?.[0];
    const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Hotel+Image';

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
        onClick={() => handleHotelClick(hotel)}
      >
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
            {renderStars(hotel.stars)}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className={`text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(hotel.name) ? 'text-right' : 'text-left'
            }`}>
              {hotel.name}
            </h3>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
            <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500" />
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

          {hotel.description && (
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
              {truncateDescription(hotel.description)}
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
          <h1 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <CustomButton
            variant="rippleBlueToYellowTeal"
            onClick={() => navigate(`/country/${encodeURIComponent(countryName)}`)}
          >
            Return to {countryName}
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative h-96 sm:h-[500px] md:h-[600px] overflow-hidden -mt-6">
        <div className="absolute inset-0">
          <img
            src={cityData?.image}
            alt={cityName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(`/country/${encodeURIComponent(countryName)}`)}
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to {countryName}</span>
        </button>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {getCountryCode(countryName) && (
                <Flag 
                  code={getCountryCode(countryName)} 
                  height="48" 
                  width="72"
                  className="rounded-sm shadow-lg border border-white/20"
                />
              )}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Jost, sans-serif' }}>
                {cityName}
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-gray-200" style={{ fontFamily: 'Jost, sans-serif' }}>{countryName}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description Section */}
        {cityData?.description && (
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              About {cityName}
            </h2>
            <p className="text-gray-900 dark:text-gray-100 leading-relaxed text-sm sm:text-base lg:text-lg">
              {cityData.description}
            </p>
          </section>
        )}

        {/* Touristic Features Section */}
        {cityData?.touristicFeatures && cityData.touristicFeatures.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Top Attractions & Features
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {cityData.touristicFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 sm:space-x-4"
                >
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 dark:bg-yellow-400 flex-shrink-0 mt-1.5 sm:mt-2"></span>
                  <span className="text-gray-800 dark:text-gray-100 text-sm sm:text-base leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tours Section */}
        {cityData?.tours && cityData.tours.length > 0 && (
          <section className="mb-16">
            <div className="relative mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Tours in {cityName}
              </h2>
              {/* View All Button - Desktop Only */}
              <div className="hidden lg:block lg:absolute lg:right-0 lg:top-0">
                <CustomButton
                  variant="rippleBlueToYellowTeal"
                  size="md"
                  onClick={() => navigate(`/guest/tours?city=${encodeURIComponent(cityName)}`)}
                >
                  View All Tours
                </CustomButton>
              </div>
            </div>

            {toursLoading ? (
              <div className="flex justify-center py-12">
                <RahalatekLoader size="lg" />
              </div>
            ) : (
              <>
                {/* Carousel Container */}
                <div className="relative flex items-center mb-6">
                  {/* Left Arrow */}
                  {totalTourSlides > 1 && (
                    <button
                      onClick={prevTourSlide}
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                      aria-label="Previous tours"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Tour Cards Container */}
                  <div className="flex-1 overflow-hidden" ref={tourCarouselRef}>
                    <div 
                      className="flex transition-transform duration-500 ease-in-out will-change-transform"
                      style={{ 
                        transform: `translate3d(-${currentTourSlide * 100}%, 0, 0)`,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      {Array.from({ length: totalTourSlides }, (_, slideIndex) => (
                        <div 
                          key={slideIndex} 
                          className={`w-full flex-shrink-0 ${
                            tourScreenType === 'mobile' 
                              ? 'grid grid-cols-1 gap-4' 
                              : tourScreenType === 'tablet'
                              ? 'grid grid-cols-2 gap-4'
                              : 'grid grid-cols-3 gap-6'
                          }`}
                        >
                          {cityData.tours
                            .slice(slideIndex * toursPerSlide, (slideIndex + 1) * toursPerSlide)
                            .map((tour, tourIndex) => (
                              <TourCard
                                key={`${slideIndex}-${tourIndex}`}
                                tour={tour}
                              />
                            ))
                          }
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  {totalTourSlides > 1 && (
                    <button
                      onClick={nextTourSlide}
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                      aria-label="Next tours"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Dots Indicator */}
                {totalTourSlides > 1 && (
                  <div className="flex justify-center mb-6 space-x-2">
                    {Array.from({ length: totalTourSlides }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => goToTourSlide(index)}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                          index === currentTourSlide
                            ? 'bg-yellow-400 dark:bg-blue-500 scale-125'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-500 dark:hover:bg-blue-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* View All Button - Mobile/Tablet Only */}
                <div className="flex justify-center mt-8 lg:hidden">
                  <CustomButton
                    variant="rippleBlueToYellowTeal"
                    size="md"
                    onClick={() => navigate(`/guest/tours?city=${encodeURIComponent(cityName)}`)}
                    className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
                  >
                    View All Tours
                  </CustomButton>
                </div>
              </>
            )}
          </section>
        )}

        {/* Hotels Section */}
        {cityData?.hotels && cityData.hotels.length > 0 && (
          <section>
            <div className="relative mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Hotels in {cityName}
              </h2>
              {/* View All Button - Desktop Only */}
              <div className="hidden lg:block lg:absolute lg:right-0 lg:top-0">
                <CustomButton
                  variant="rippleBlueToYellowTeal"
                  size="md"
                  onClick={() => navigate(`/guest/hotels?city=${encodeURIComponent(cityName)}`)}
                >
                  View All Hotels
                </CustomButton>
              </div>
            </div>

            {hotelsLoading ? (
              <div className="flex justify-center py-12">
                <RahalatekLoader size="lg" />
              </div>
            ) : (
              <>
                {/* Carousel Container */}
                <div className="relative flex items-center mb-6">
                  {/* Left Arrow */}
                  {totalHotelSlides > 1 && (
                    <button
                      onClick={prevHotelSlide}
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                      aria-label="Previous hotels"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Hotel Cards Container */}
                  <div className="flex-1 overflow-hidden" ref={hotelCarouselRef}>
                    <div 
                      className="flex transition-transform duration-500 ease-in-out will-change-transform"
                      style={{ 
                        transform: `translate3d(-${currentHotelSlide * 100}%, 0, 0)`,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      {Array.from({ length: totalHotelSlides }, (_, slideIndex) => (
                        <div 
                          key={slideIndex} 
                          className={`w-full flex-shrink-0 ${
                            hotelScreenType === 'mobile' 
                              ? 'grid grid-cols-1 gap-4' 
                              : hotelScreenType === 'tablet'
                              ? 'grid grid-cols-2 gap-4'
                              : 'grid grid-cols-3 gap-6'
                          }`}
                        >
                          {cityData.hotels
                            .slice(slideIndex * hotelsPerSlide, (slideIndex + 1) * hotelsPerSlide)
                            .map((hotel, hotelIndex) => (
                              <HotelCard
                                key={`${slideIndex}-${hotelIndex}`}
                                hotel={hotel}
                              />
                            ))
                          }
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  {totalHotelSlides > 1 && (
                    <button
                      onClick={nextHotelSlide}
                      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                      aria-label="Next hotels"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Dots Indicator */}
                {totalHotelSlides > 1 && (
                  <div className="flex justify-center mb-6 space-x-2">
                    {Array.from({ length: totalHotelSlides }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => goToHotelSlide(index)}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                          index === currentHotelSlide
                            ? 'bg-yellow-400 dark:bg-blue-500 scale-125'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-500 dark:hover:bg-blue-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* View All Button - Mobile/Tablet Only */}
                <div className="flex justify-center mt-8 lg:hidden">
                  <CustomButton
                    variant="rippleBlueToYellowTeal"
                    size="md"
                    onClick={() => navigate(`/guest/hotels?city=${encodeURIComponent(cityName)}`)}
                    className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
                  >
                    View All Hotels
                  </CustomButton>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default GuestCityPage;
