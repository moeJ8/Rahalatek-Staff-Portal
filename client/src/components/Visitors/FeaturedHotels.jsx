import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTranslatedText } from '../../utils/translationUtils';
import Flag from 'react-world-flags';
import CustomButton from '../CustomButton';
import RahalatekLoader from '../RahalatekLoader';
import axios from 'axios';
import PLACEHOLDER_IMAGES from '../../utils/placeholderImage';

const FeaturedHotels = () => {
  const { t, i18n } = useTranslation();
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
        // Add language parameter to the API request
        const lang = i18n.language;
        const langParam = (lang === 'ar' || lang === 'fr') ? `&lang=${lang}` : '';
        const response = await axios.get(`/api/hotels/featured?limit=9${langParam}`);
        setHotels(response.data);
      } catch (error) {
        console.error('Error fetching featured hotels:', error);
        setError('Failed to load featured hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedHotels();
  }, [i18n.language]);

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
    
    // Navigate to hotel page with language prefix for SEO (only for ar/fr)
    const lang = i18n.language;
    const url = (lang === 'ar' || lang === 'fr') ? `/${lang}/hotels/${hotel.slug}` : `/hotels/${hotel.slug}`;
    navigate(url);
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
    const imageUrl = primaryImage?.url || PLACEHOLDER_IMAGES.hotel;
    
    // Get translated hotel name and description
    const translatedName = getTranslatedText(hotel, 'name', i18n.language);
    const translatedDescription = getTranslatedText(hotel, 'description', i18n.language);

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
        onClick={() => handleHotelClick(hotel)}
      >
        {/* Hotel Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={translatedName}
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
              /[\u0600-\u06FF\u0750-\u077F]/.test(translatedName) ? 'text-right' : 'text-left'
            }`}>
              {translatedName}
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
          {translatedDescription && (
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
              {truncateDescription(translatedDescription)}
            </p>
          )}
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
              {t('home.hotels.title')}
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
              {t('home.hotels.title')}
            </h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-6 md:py-8" dir="ltr">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t('home.hotels.title')}
          </h2>
          {/* View All Button - Desktop Only in Header */}
          <div className="hidden lg:block lg:absolute lg:right-16 lg:top-0">
            <CustomButton
              onClick={() => navigate('/guest/hotels')}
              variant="rippleBlueToYellowTeal"
              size="md"
              className="px-6 py-2 text-sm"
            >
              {t('home.hotels.viewAll')}
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
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
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
            {totalSlides > 1 && (
              <div className="flex justify-center mb-6 space-x-2">
                {Array.from({ length: totalSlides }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
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
                onClick={() => navigate('/guest/hotels')}
                variant="rippleBlueToYellowTeal"
                size="md"
                className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
              >
                {t('home.hotels.viewAll')}
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
