import React, { useState, useRef, useEffect } from 'react';
import { FaWifi, FaTv, FaSnowflake, FaVolumeDown, FaBaby, FaShower, FaRulerCombined, FaEye, FaUsers, FaBed, FaGlassCheers, FaShieldAlt, FaTshirt, FaDoorOpen } from 'react-icons/fa';
import { MdDry } from 'react-icons/md';
import { MdBalcony } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import ImageCarousel from './ImageCarousel';
import CustomModal from './CustomModal';

const HotelRoomsCarousel = ({ roomTypes = [] }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);

  if (!roomTypes || roomTypes.length === 0) {
    return null;
  }

  // Screen size state
  const [screenType, setScreenType] = useState('desktop');
  const [roomsPerSlide, setRoomsPerSlide] = useState(3);

  // Check screen size for responsive behavior
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
      setRoomsPerSlide(1);
      setIsMobile(true);
    } else if (width < 1024) {
      setScreenType('tablet');
      setRoomsPerSlide(2);
      setIsMobile(false);
    } else {
      setScreenType('desktop');
      setRoomsPerSlide(3);
      setIsMobile(false);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);
  const totalSlides = Math.ceil(roomTypes.length / roomsPerSlide);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8" dir="ltr">

      {/* Carousel Container with Side Arrows */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
        {totalSlides > 1 && (
          <button
            onClick={prevSlide}
            className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-500 ease-in-out text-blue-600 bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 hover:text-blue-700 dark:text-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:bg-teal-900/50 dark:hover:text-white dark:hover:border-teal-500 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-teal-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
            aria-label="Previous rooms"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Room Cards Container */}
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
              {/* Room cards for this slide */}
              {roomTypes
                .slice(slideIndex * roomsPerSlide, (slideIndex + 1) * roomsPerSlide)
                .map((roomType, roomIndex) => (
                  <div key={`${slideIndex}-${roomIndex}`} dir="ltr">
                    <RoomCard
                      roomType={roomType}
                    />
                  </div>
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
            aria-label="Next rooms"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Slide indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center space-x-2 mt-4 sm:mt-6">
          {(() => {
            const maxDotsOnMobile = 8;
            const isMobileView = screenType === 'mobile';
            
            if (!isMobileView || totalSlides <= maxDotsOnMobile) {
              // Show all dots for desktop/tablet or when slides <= 8
              return Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? 'bg-blue-600 dark:bg-teal-500'
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
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                      index === currentSlide
                        ? 'bg-blue-600 dark:bg-teal-500'
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

const RoomCard = ({ roomType }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const details = roomType.details || {};
  const highlights = roomType.highlights || [];

  // Default room image if no images are available
  const defaultImage = {
    url: 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Room+Image',
    altText: 'Room image placeholder'
  };

  const roomImages = roomType.images && roomType.images.length > 0 
    ? [...roomType.images].sort((a, b) => b.isPrimary - a.isPrimary)
    : [defaultImage];
  
  const handleMouseDown = () => {
    setIsDragging(false);
  };
  
  const handleMouseMove = () => {
    setIsDragging(true);
  };
  
  const handleClick = () => {
    if (!isDragging) {
      setIsDetailsModalOpen(true);
    }
  };

  // Function to get amenity icon
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('balcony')) return <MdBalcony className="w-3 h-3" />;
    if (amenityLower.includes('air conditioning')) return <FaSnowflake className="w-3 h-3" />;
    if (amenityLower.includes('soundproof')) return <FaVolumeDown className="w-3 h-3" />;
    if (amenityLower.includes('wifi')) return <FaWifi className="w-3 h-3" />;
    if (amenityLower.includes('tv')) return <FaTv className="w-3 h-3" />;
    if (amenityLower.includes('minibar')) return <FaDoorOpen className="w-3 h-3" />;
    if (amenityLower.includes('cot') || amenityLower.includes('infant')) return <FaBaby className="w-3 h-3" />;
    if (amenityLower.includes('bathrobe') || amenityLower.includes('hairdryer')) return <FaShower className="w-3 h-3" />;
    return <span className="w-3 h-3 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-xs text-green-600 dark:text-green-300">•</span>;
  };

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Room Image Carousel */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <ImageCarousel
          images={roomImages}
          title={`${roomType.type} Room`}
          className="w-full h-full rounded-t-xl"
          currentImageIndex={selectedImageIndex}
          onImageChange={setSelectedImageIndex}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
        
        {/* Room Name - Inside image at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <h3 className="text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300">
            {roomType.type}
          </h3>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Room details */}
        <div className="grid grid-cols-2 gap-2 mb-2 sm:mb-3">
          {details.size?.value && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <FaRulerCombined className="w-3 h-3 mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{details.size.value} {details.size.unit}</span>
            </div>
          )}
          {details.view && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <FaEye className="w-3 h-3 mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{details.view}</span>
            </div>
          )}
          {details.sleeps && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <FaUsers className="w-3 h-3 mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">Sleeps {details.sleeps}</span>
            </div>
          )}
          {details.bedType && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <FaBed className="w-3 h-3 mr-1.5 sm:mr-2 text-gray-500 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{details.bedType}</span>
            </div>
          )}
        </div>
        
        {/* Amenities - First 3 items */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {highlights.slice(0, 3).map((highlight, index) => (
              <span key={index} className="text-xs text-gray-700 dark:text-gray-300">
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Room Details Modal */}
      <CustomModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`${roomType.type} - Room Details`}
        subtitle="Complete room specifications and amenities"
        maxWidth="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
      >
        <div className="space-y-2 sm:space-y-3 md:space-y-5">
          {/* Room Specifications */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-lg p-2 sm:p-3 md:p-4 border border-blue-100 dark:border-slate-600">
            <div className="flex items-center mb-1.5 sm:mb-2 md:mb-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-blue-500 rounded-md flex items-center justify-center mr-1.5 sm:mr-2">
                <FaRulerCombined className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">Room Specifications</h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
              {details.size?.value && (
                <div className="bg-white dark:bg-slate-900 rounded-md p-3 border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center mb-1">
                    <FaRulerCombined className="w-3 h-3 text-blue-500 mr-2" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Size</span>
                  </div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">{details.size.value} {details.size.unit}</div>
                </div>
              )}
              {details.view && (
                <div className="bg-white dark:bg-slate-900 rounded-md p-3 border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center mb-1">
                    <FaEye className="w-3 h-3 text-blue-500 mr-2" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">View</span>
                  </div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">{details.view}</div>
                </div>
              )}
              {details.sleeps && (
                <div className="bg-white dark:bg-slate-900 rounded-md p-3 border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center mb-1">
                    <FaUsers className="w-3 h-3 text-blue-500 mr-2" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Occupancy</span>
                  </div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">Sleeps {details.sleeps}</div>
                </div>
              )}
              {details.bedType && (
                <div className="bg-white dark:bg-slate-900 rounded-md p-3 border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center mb-1">
                    <FaBed className="w-3 h-3 text-blue-500 mr-2" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Bed Type</span>
                  </div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">{details.bedType}</div>
                </div>
              )}
            </div>
          </div>

          {/* Room Amenities */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 rounded-lg p-2 sm:p-3 md:p-4 border border-green-100 dark:border-slate-600">
            <div className="flex items-center mb-1.5 sm:mb-2 md:mb-3">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-md flex items-center justify-center mr-1.5 sm:mr-2">
                <FaSnowflake className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">Room Amenities</h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {[
                { key: 'balcony', label: 'Balcony', icon: MdBalcony },
                { key: 'airConditioning', label: 'Air conditioning', icon: FaSnowflake },
                { key: 'soundproofed', label: 'Soundproofed', icon: FaVolumeDown },
                { key: 'freeWifi', label: 'Free WiFi', icon: FaWifi },
                { key: 'minibar', label: 'Minibar', icon: FaGlassCheers },
                { key: 'tv', label: 'LCD TV', icon: FaTv },
                { key: 'hairdryer', label: 'Hairdryer', icon: MdDry },
                { key: 'bathrobes', label: 'Bathrobes', icon: FaTshirt },
                { key: 'freeCots', label: 'Free cots/infant beds', icon: FaBaby },
                { key: 'safe', label: 'Safe', icon: FaShieldAlt }
              ].map(({ key, label, icon: Icon }) => (
                details[key] && (
                  <div key={key} className="flex items-center bg-white dark:bg-slate-900 rounded-md p-2 border border-gray-200 dark:border-slate-600">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-2">
                      <Icon className="w-2.5 h-2.5 text-green-600 dark:text-green-300" />
                    </div>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{label}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* All Highlights */}
          {highlights.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 rounded-lg p-2 sm:p-3 md:p-4 border border-purple-100 dark:border-slate-600">
              <div className="flex items-center mb-1.5 sm:mb-2 md:mb-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-purple-500 rounded-md flex items-center justify-center mr-1.5 sm:mr-2">
                  <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">Highlights</h3>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {highlights.map((highlight, index) => (
                  <span key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium shadow-sm">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CustomModal>
    </div>
  );
};

export default HotelRoomsCarousel;
