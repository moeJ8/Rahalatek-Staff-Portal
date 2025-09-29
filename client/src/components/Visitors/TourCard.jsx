import React, { useState } from 'react';
import { FaClock, FaMapMarkerAlt, FaUsers, FaCrown, FaGem } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Flag from 'react-world-flags';
import axios from 'axios';

const TourCard = ({ tour, expandedHighlights, onToggleHighlights }) => {
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

  const handleTourClick = async (tour) => {
    try {
      await axios.post(`/api/tours/public/${tour.slug}/view`);
      navigate(`/tours/${tour.slug}`);
    } catch (error) {
      console.error('Error tracking tour view:', error);
      navigate(`/tours/${tour.slug}`);
    }
  };

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
                onToggleHighlights(tour._id);
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
            
            {expandedHighlights[tour._id] && (
              <div className="mt-2 space-y-1">
                {tour.highlights.slice(0, 3).map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-1.5 text-gray-600 dark:text-gray-400">
                    <span className="text-xs mt-1">•</span>
                    <span className="text-xs leading-relaxed">{highlight}</span>
                  </div>
                ))}
                {tour.highlights.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    +{tour.highlights.length - 3} more highlights
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2">
          {truncateDescription(tour.description, 120)}
        </p>

        {/* Total Price Display */}
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
          <span className="text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-200 text-sm font-medium flex items-center group-hover:underline">
            View Tour
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <div className="flex items-center space-x-1 text-blue-600 dark:text-teal-400">
            {tour.tourType === 'VIP' ? (
              <FaCrown className="w-3 h-3" />
            ) : (
              <FaUsers className="w-3 h-3" />
            )}
            <span className="text-xs">{tour.tourType}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
