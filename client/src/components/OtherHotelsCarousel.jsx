import React, { useState, useRef, useEffect } from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const OtherHotelsCarousel = ({ hotels = [], currentHotelId }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  // Filter out the current hotel
  const otherHotels = hotels.filter(hotel => hotel._id !== currentHotelId);

  if (!otherHotels || otherHotels.length === 0) {
    return null;
  }

  // Screen size state
  const [screenType, setScreenType] = useState('desktop');
  const [hotelsPerSlide, setHotelsPerSlide] = useState(3);

  // Check screen size for responsive behavior
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
      setHotelsPerSlide(1);
      setIsMobile(true);
    } else if (width < 1024) {
      setScreenType('tablet');
      setHotelsPerSlide(2);
      setIsMobile(false);
    } else {
      setScreenType('desktop');
      setHotelsPerSlide(3);
      setIsMobile(false);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const totalSlides = Math.ceil(otherHotels.length / hotelsPerSlide);

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

  const handleHotelClick = (hotel) => {
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

  const HotelCard = ({ hotel }) => {
    // Get primary image or first image
    const primaryImage = hotel.images?.find(img => img.isPrimary) || hotel.images?.[0];
    const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Hotel+Image';

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
          <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/60 backdrop-blur-sm rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1">
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              {renderStars(hotel.stars)}
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="p-3 sm:p-4 md:p-6">
          {/* Hotel Name */}
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
            {hotel.name}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
            <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{hotel.city}, {hotel.country}</span>
          </div>

          {/* Description */}
          {hotel.description && (
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
              {truncateDescription(hotel.description, screenType)}
            </p>
          )}

          {/* View Hotel Button */}
          <div className="flex items-center justify-between">
            <span className="text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-200 text-xs sm:text-sm font-medium flex items-center group-hover:underline">
              View Hotel
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <div className="flex items-center space-x-0.5 sm:space-x-1 text-yellow-400">
              <FaStar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{hotel.stars} Star</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Similar Properties
        </h2>
      </div>

      {/* Carousel Container with Side Arrows */}
      <div className="relative flex items-center">
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
                {otherHotels
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
        <div className="flex justify-center mt-6 space-x-2">
          {(() => {
            const maxDotsOnMobile = 8;
            const isMobileView = screenType === 'mobile';
            
            if (!isMobileView || totalSlides <= maxDotsOnMobile) {
              // Show all dots for desktop/tablet or when slides <= 8
              return Array.from({ length: totalSlides }, (_, index) => (
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
              ));
            } else {
              // Mobile with more than 8 slides - show sliding window of 8 dots
              let startIndex = 0;
              let endIndex = maxDotsOnMobile;
              
              // Only start sliding after the 7th slide (index 6)
              if (currentSlide >= maxDotsOnMobile - 2) {
                startIndex = Math.min(currentSlide - (maxDotsOnMobile - 2), totalSlides - maxDotsOnMobile);
                endIndex = startIndex + maxDotsOnMobile;
              }
              
              return Array.from({ length: endIndex - startIndex }, (_, i) => {
                const index = startIndex + i;
                return (
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
                );
              });
            }
          })()}
        </div>
      )}
    </div>
  );
};

export default OtherHotelsCarousel;
