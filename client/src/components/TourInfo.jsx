import React, { useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaUsers, FaCrown, FaCar, FaGem, FaDollarSign, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Badge, Button } from 'flowbite-react';

const TourInfo = ({ tourData }) => {
  const [showHighlights, setShowHighlights] = useState(false);
  
  if (!tourData) return null;

  // Check if the text contains Arabic characters
  const containsRTL = (text) => {
    return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  };
  
  const isRTL = containsRTL(tourData.name);

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg h-full min-h-[24rem] flex flex-col mb-2">
      <h5 
        className="text-xl font-bold text-gray-900 dark:text-white mb-4 break-words"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {tourData.name}
      </h5>
      
      <div className="flex">
        <Badge color="info" className="text-sm flex items-center">
          <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400" /> 
          <span className="text-blue-700 dark:text-blue-300 font-medium">{tourData.city}</span>
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-3 gap-y-3 mt-4">
        <div className="space-y-3">
          {/* Type */}
          <div className="flex items-start">
            <span className="text-xl mr-2 text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0">
              {tourData.tourType === 'Group' ? (
                <FaUsers />
              ) : (
                <FaCrown className="text-amber-500 dark:text-amber-400" />
              )}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tour Type:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {tourData.tourType} Tour
              </p>
            </div>
          </div>
          
          {/* Price */}
          <div className="flex items-start">
            <FaDollarSign className="text-green-600 dark:text-green-400 mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Price:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-green-600 dark:text-green-400">${tourData.price}</span>
                {' '}{tourData.tourType === 'Group' ? 'per person' : 'per car'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Duration */}
          <div className="flex items-start">
            <FaClock className="text-green-500 dark:text-green-400 mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-green-600 dark:text-green-400">{tourData.duration}</span> hours
              </p>
            </div>
          </div>

          <div className="flex items-start">
            {tourData.tourType === 'VIP' ? (
              <>
                <FaCar className="text-purple-500 dark:text-purple-400 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {tourData.vipCarType} ({tourData.carCapacity?.min}-{tourData.carCapacity?.max})
                  </p>
                </div>
              </>
            ) : (
              <>
                <FaInfoCircle className="text-blue-500 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Group Size:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Any size</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 pt-3 pb-2 border-t border-gray-200 dark:border-gray-600 flex-grow">
        {tourData.detailedDescription ? (
          <p 
            className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3"
            dir={containsRTL(tourData.detailedDescription) ? "rtl" : "ltr"}
          >
            {tourData.detailedDescription}
          </p>
        ) : tourData.description ? (
          <p 
            className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3"
            dir={containsRTL(tourData.description) ? "rtl" : "ltr"}
          >
            {tourData.description}
          </p>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 opacity-0">.</p>
        )}
      </div>

      {/* Highlights with toggle */}
      {tourData.highlights && tourData.highlights.length > 0 && (
        <div className="mt-0 border-t border-gray-200 dark:border-gray-600 pt-1.5">
          <div className="flex justify-between items-center">
            <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <FaGem className="text-amber-500 dark:text-amber-400 mr-1.5" />
              Highlights:
            </h6>
            <Button 
              size="xs" 
              color="light" 
              pill 
              onClick={() => setShowHighlights(!showHighlights)}
              className="border border-gray-200 dark:border-gray-600"
            >
              {showHighlights ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </Button>
          </div>
          
          {showHighlights && (
            <div className="overflow-hidden mt-1">
              {tourData.highlights.map((highlight, index) => {
                const isHighlightRTL = containsRTL(highlight);
                return (
                  <p 
                    key={index} 
                    className="text-sm text-gray-700 dark:text-gray-300 py-0.5"
                    dir={isHighlightRTL ? "rtl" : "ltr"}
                  >
                    {highlight}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TourInfo; 