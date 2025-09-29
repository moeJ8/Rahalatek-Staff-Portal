import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import CustomButton from '../CustomButton';
import RahalatekLoader from '../RahalatekLoader';
import axios from 'axios';

const FeaturedHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenType, setScreenType] = useState('desktop');
  const [hotelsPerSlide, setHotelsPerSlide] = useState(3);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedHotels = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/hotels/featured?limit=9');
        setHotels(response.data);
      } catch (error) {
        console.error('Error fetching featured hotels:', error);
        setError('Failed to load featured hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedHotels();
  }, []);

  // Screen size detection
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
      setHotelsPerSlide(1);
    } else if (width < 1024) {
      setScreenType('tablet');
      setHotelsPerSlide(2);
    } else {
      setScreenType('desktop');
      setHotelsPerSlide(3);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const totalSlides = Math.ceil(hotels.length / hotelsPerSlide);

  // Reset slide when screen size changes
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
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
    const maxLength = 120;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  const HotelCard = ({ hotel }) => {
    // Get primary image or first image
    const primaryImage = hotel.images?.find(img => img.isPrimary) || hotel.images?.[0];
    const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Hotel+Image';

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
        onClick={() => handleHotelClick(hotel)}
      >
        {/* Hotel Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 z-10">
            <div className="flex items-center space-x-1">
              {renderStars(hotel.stars)}
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="p-4">
          {/* Hotel Name */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
            {hotel.name}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
            <FaMapMarkerAlt className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span className="text-sm truncate">
              {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
            </span>
            {hotel.country && getCountryCode(hotel.country) && (
              <Flag 
                code={getCountryCode(hotel.country)} 
                height="16" 
                width="20"
                className="flex-shrink-0 rounded-sm"
                style={{ maxWidth: '20px', maxHeight: '16px' }}
              />
            )}
          </div>

          {/* Description */}
          {hotel.description && (
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
              {truncateDescription(hotel.description)}
            </p>
          )}

          {/* View Hotel Button */}
          <div className="flex items-center justify-between">
            <span className="text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-200 text-sm font-medium flex items-center group-hover:underline">
              View Hotel
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <div className="flex items-center space-x-1 text-yellow-400">
              <FaStar className="w-3 h-3" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{hotel.stars} Star</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Hotels
            </h2>
          </div>
          <div className="flex justify-center">
            <RahalatekLoader size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Hotels
            </h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-white dark:bg-slate-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Hotels
          </h2>
          {/* View All Button - Desktop Only in Header */}
          <div className="hidden lg:block lg:absolute lg:right-16 lg:top-0">
            <CustomButton
              onClick={() => navigate('/guest/hotels')}
              variant="rippleBlueToYellowTeal"
              size="md"
              className="px-6 py-2 text-sm"
            >
              View All Hotels
            </CustomButton>
          </div>
        </div>

        {/* Hotels Carousel */}
        {hotels.length > 0 ? (
          <>
            {/* Carousel Container with Side Arrows */}
            <div className="relative flex items-center mb-6">
              {/* Left Arrow */}
              {totalSlides > 1 && (
                <button
                  onClick={prevSlide}
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-500 ease-in-out text-blue-600 bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 hover:text-blue-700 dark:text-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:bg-teal-900/50 dark:hover:text-white dark:hover:border-teal-500 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-teal-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                  aria-label="Previous hotels"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Hotel Cards Container */}
              <div className="flex-1 overflow-hidden" ref={carouselRef}>
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* Generate slides */}
                  {Array.from({ length: totalSlides }, (_, slideIndex) => (
                    <div 
                      key={slideIndex} 
                      className={`w-full flex-shrink-0 ${
                        screenType === 'mobile' 
                          ? 'grid grid-cols-1 gap-4' 
                          : screenType === 'tablet'
                          ? 'grid grid-cols-2 gap-4'
                          : 'grid grid-cols-3 gap-6'
                      }`}
                    >
                      {/* Hotel cards for this slide */}
                      {hotels
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
              {totalSlides > 1 && (
                <button
                  onClick={nextSlide}
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-500 ease-in-out text-blue-600 bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 hover:text-blue-700 dark:text-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:bg-teal-900/50 dark:hover:text-white dark:hover:border-teal-500 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-teal-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                  aria-label="Next hotels"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Dots Indicator */}
            {totalSlides > 1 && (
              <div className="flex justify-center mb-6 space-x-2">
                {Array.from({ length: totalSlides }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-blue-600 dark:bg-teal-400 scale-125'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* View All Button - Mobile/Tablet Only */}
            <div className="flex justify-center mt-8 lg:hidden">
              <CustomButton
                onClick={() => navigate('/guest/hotels')}
                variant="rippleBlueToYellowTeal"
                size="md"
                className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
              >
                View All Hotels
              </CustomButton>
            </div>

          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Featured Hotels Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please check back later for our latest hotel offerings.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHotels;
