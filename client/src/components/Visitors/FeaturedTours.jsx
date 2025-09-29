import React, { useState, useEffect, useRef } from 'react';
import { FaClock, FaMapMarkerAlt, FaUsers, FaCrown, FaGem } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import CustomButton from '../CustomButton';
import RahalatekLoader from '../RahalatekLoader';
import axios from 'axios';

const FeaturedTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenType, setScreenType] = useState('desktop');
  const [toursPerSlide, setToursPerSlide] = useState(3);
  const [expandedHighlights, setExpandedHighlights] = useState({});
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/tours/featured?limit=9');
        setTours(response.data);
      } catch (error) {
        console.error('Error fetching featured tours:', error);
        setError('Failed to load featured tours');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTours();
  }, []);

  // Screen size detection
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
      setToursPerSlide(1);
    } else if (width < 1024) {
      setScreenType('tablet');
      setToursPerSlide(2);
    } else {
      setScreenType('desktop');
      setToursPerSlide(3);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const totalSlides = Math.ceil(tours.length / toursPerSlide);

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

  const handleTourClick = async (tour) => {
    try {
      // Increment view count
      await axios.post(`/api/tours/public/${tour.slug}/view`);
    } catch (error) {
      console.error('Error incrementing tour views:', error);
    }
    
    // Navigate to tour page
    navigate(`/tours/${tour.slug}`);
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

  const truncateDescription = (description, screenType) => {
    if (!description) return '';
    // Adjust truncation based on screen size
    const maxLength = screenType === 'mobile' ? 80 : screenType === 'tablet' ? 100 : 120;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  const toggleHighlights = (tourId) => {
    setExpandedHighlights(prev => ({
      ...prev,
      [tourId]: !prev[tourId]
    }));
  };

  const TourCard = ({ tour }) => {
    // Get primary image or first image
    const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];
    const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Tour+Image';

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
        onClick={() => handleTourClick(tour)}
      >
        {/* Tour Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-black/60 backdrop-blur-sm rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 z-10">
            <div className="flex items-center space-x-1 text-white">
              {tour.tourType === 'VIP' ? (
                <FaCrown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              ) : (
                <FaUsers className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              )}
              <span className="text-xs sm:text-sm font-medium">{tour.tourType}</span>
            </div>
          </div>
        </div>

        {/* Tour Details */}
        <div className="p-3 sm:p-4 md:p-6">
          {/* Tour Name */}
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
            {tour.name}
          </h3>

          {/* Location and Duration */}
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500 dark:text-red-500" />
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
              <FaClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-blue-500 dark:text-teal-400" />
              <span className="text-xs sm:text-sm">{tour.duration}h</span>
            </div>
          </div>

          {/* Highlights */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHighlights(tour._id);
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-1">
                  <FaGem className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                  <span className="text-xs sm:text-sm font-medium">Highlights:</span>
                </div>
                {expandedHighlights[tour._id] ? (
                  <HiChevronUp className="text-sm transition-transform duration-200" />
                ) : (
                  <HiChevronDown className="text-sm transition-transform duration-200" />
                )}
              </button>
              
              {/* Expanded Highlights */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedHighlights[tour._id] ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-1">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <span className="text-blue-500 dark:text-teal-400 mt-0.5">•</span>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {tour.description && (
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
              {truncateDescription(tour.description, screenType)}
            </p>
          )}

          {/* Price Display */}
          <div className="mb-3 sm:mb-4">
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

          {/* View Tour Button */}
          <div className="flex items-center justify-between">
            <span className="text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-200 text-xs sm:text-sm font-medium flex items-center group-hover:underline">
              View Tour
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <span className="text-xs">{tour.tourType} Tour</span>
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
              Featured Tours
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
              Featured Tours
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
            Featured Tours
          </h2>
          {/* View All Button - Desktop Only in Header */}
          <div className="hidden lg:block lg:absolute lg:right-16 lg:top-0">
            <CustomButton
              onClick={() => navigate('/guest/tours')}
              variant="rippleBlueToYellowTeal"
              size="md"
              className="px-6 py-2 text-sm"
            >
              View All Tours
            </CustomButton>
          </div>
        </div>

        {/* Tours Carousel */}
        {tours.length > 0 ? (
          <>
            {/* Carousel Container with Side Arrows */}
            <div className="relative flex items-center mb-6">
              {/* Left Arrow */}
              {totalSlides > 1 && (
                <button
                  onClick={prevSlide}
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-500 ease-in-out text-blue-600 bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 hover:text-blue-700 dark:text-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:bg-teal-900/50 dark:hover:text-white dark:hover:border-teal-500 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-teal-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                  aria-label="Previous tours"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Tour Cards Container */}
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
                      {/* Tour cards for this slide */}
                      {tours
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
              {totalSlides > 1 && (
                <button
                  onClick={nextSlide}
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-500 ease-in-out text-blue-600 bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 hover:text-blue-700 dark:text-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:bg-teal-900/50 dark:hover:text-white dark:hover:border-teal-500 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-teal-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                  aria-label="Next tours"
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
                onClick={() => navigate('/guest/tours')}
                variant="rippleBlueToYellowTeal"
                size="md"
                className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
              >
                View All Tours
              </CustomButton>
            </div>

          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Featured Tours Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please check back later for our latest tour offerings.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTours;
