import React, { useState, useRef, useEffect } from 'react';
import { FaClock, FaMapMarkerAlt, FaCrown, FaUsers, FaGem, FaCircle } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTranslatedText, getTranslatedArray } from '../utils/translationUtils';
import PLACEHOLDER_IMAGES from '../utils/placeholderImage';

const OtherToursCarousel = ({ tours = [], currentTourId }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedHighlights, setExpandedHighlights] = useState({});
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  // Filter out the current tour
  const otherTours = tours.filter(tour => tour._id !== currentTourId);

  if (!otherTours || otherTours.length === 0) {
    return null;
  }

  // Screen size state
  const [screenType, setScreenType] = useState('desktop');
  const [toursPerSlide, setToursPerSlide] = useState(3);

  // Check screen size for responsive behavior
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
      setToursPerSlide(1);
      setIsMobile(true);
    } else if (width < 1024) {
      setScreenType('tablet');
      setToursPerSlide(2);
      setIsMobile(false);
    } else {
      setScreenType('desktop');
      setToursPerSlide(3);
      setIsMobile(false);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const totalSlides = Math.ceil(otherTours.length / toursPerSlide);

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

  const handleTourClick = (tour) => {
    const lang = i18n.language;
    const langPrefix = (lang === 'ar' || lang === 'fr') ? `/${lang}` : '';
    navigate(`${langPrefix}/tours/${tour.slug}`);
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
    const imageUrl = primaryImage?.url || PLACEHOLDER_IMAGES.tour;

    // Get translated content
    const translatedName = getTranslatedText(tour, 'name', i18n.language);
    const translatedDescription = getTranslatedText(tour, 'description', i18n.language);
    const translatedHighlights = getTranslatedArray(tour, 'highlights', i18n.language);

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group flex flex-col relative"
        onClick={() => handleTourClick(tour)}
        dir="ltr"
      >
        {/* Tour Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
            {tour.tourType === 'VIP' ? (
              <FaCrown className="w-4 h-4 text-yellow-400" />
            ) : (
              <FaUsers className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm font-medium">{tour.tourType}</span>
          </div>

          {/* Tour Name - Inside image at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className={`text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(translatedName) ? 'text-right' : 'text-left'
            }`}>
              {translatedName}
            </h3>
          </div>
        </div>

        {/* Tour Details */}
        <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">

          {/* Location and Duration */}
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500 dark:text-red-500" />
              <span className="text-xs sm:text-sm truncate">
                {tour.city}{tour.country ? `, ${tour.country}` : ''}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FaClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-blue-500 dark:text-yellow-400" />
              <span className="text-xs sm:text-sm">{tour.duration}h</span>
            </div>
          </div>

          {/* Highlights */}
          {translatedHighlights && translatedHighlights.length > 0 && (
            <div className="mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHighlights(tour._id);
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                  <FaGem className="text-blue-500 dark:text-yellow-400 w-3 h-3" />
                  <span className="text-xs sm:text-sm font-medium">{t('toursPage.highlights')}</span>
                </div>
                {expandedHighlights[tour._id] ? (
                  <HiChevronUp className="text-sm transition-transform duration-200" />
                ) : (
                  <HiChevronDown className="text-sm transition-transform duration-200" />
                )}
              </button>
              
              {/* Expanded Highlights */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedHighlights[tour._id] ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-1" dir={isRTL ? 'rtl' : 'ltr'}>
                  {translatedHighlights.map((highlight, index) => (
                    <div key={index} className={`flex items-start ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} text-xs`}>
                      <FaCircle className="text-blue-500 dark:text-yellow-400 w-1.5 h-1.5 mt-1.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {translatedDescription && (
            <p className={`text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(translatedDescription) ? 'text-right' : 'text-left'
            }`}>
              {translatedDescription}
            </p>
          )}

          {/* Price Display */}
          <div className="mt-auto">
            <div className="text-right">
              {tour.totalPrice && Number(tour.totalPrice) > 0 ? (
                <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                  ${tour.totalPrice}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {t('toursPage.contactForPricing')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('publicTourPage.otherTours')}
        </h2>
      </div>

      {/* Carousel Container with Side Arrows */}
      <div className="relative flex items-center">
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
                {otherTours
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

export default OtherToursCarousel;
