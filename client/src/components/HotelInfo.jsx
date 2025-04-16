import React from 'react';
import { FaStar, FaBed, FaUtensils, FaPlane, FaCarSide } from 'react-icons/fa';

const HotelInfo = ({ hotelData }) => {
  if (!hotelData) return null;

  // Create star rating display
  const renderStars = (count) => {
    return Array(count).fill(0).map((_, i) => (
      <FaStar key={i} className="text-yellow-400 inline" />
    ));
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
      <h5 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center justify-between">
        <span>{hotelData.name}</span>
        <span className="flex items-center text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
          {renderStars(hotelData.stars)}
          <span className="ml-1 text-gray-700 dark:text-gray-300">{hotelData.stars}-star</span>
        </span>
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <FaBed className="text-blue-500 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Room Types:</p>
              {hotelData.roomTypes && hotelData.roomTypes.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {hotelData.roomTypes.map((roomType, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex justify-between">
                      <span>{roomType.type}</span> 
                      <span className="font-medium text-green-600 dark:text-green-400">${roomType.pricePerNight}/night</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Standard pricing: ${hotelData.pricePerNightPerPerson} per person per night
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <FaUtensils className="text-amber-500 dark:text-amber-400 mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Breakfast:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {hotelData.breakfastIncluded ? 
                  <span className="text-green-600 dark:text-green-400">Included</span> : 
                  <span className="text-gray-500 dark:text-gray-400">Not included</span>}
              </p>
            </div>
          </div>
          
          {hotelData.airport && (
            <div className="flex items-start">
              <FaPlane className="text-blue-500 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Nearest Airport:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{hotelData.airport}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <FaCarSide className="text-purple-500 dark:text-purple-400 mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Airport Transfer:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-green-600 dark:text-green-400">${hotelData.transportationPrice}</span> per person
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {hotelData.description && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-700 dark:text-gray-300">{hotelData.description}</p>
        </div>
      )}
    </div>
  );
};

export default HotelInfo; 