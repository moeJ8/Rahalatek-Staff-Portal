import React from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import axios from 'axios';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();

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

  const truncateDescription = (description, maxLength = 120) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
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

  const handleHotelClick = async (hotel) => {
    try {
      await axios.post(`/api/hotels/public/${hotel.slug}/view`);
      navigate(`/hotels/${hotel.slug}`);
    } catch (error) {
      console.error('Error tracking hotel view:', error);
      navigate(`/hotels/${hotel.slug}`);
    }
  };

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

export default HotelCard;
