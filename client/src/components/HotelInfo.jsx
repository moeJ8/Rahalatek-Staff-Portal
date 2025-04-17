import React from 'react';
import { FaStar, FaBed, FaUtensils, FaPlane, FaCarSide, FaCalendarAlt, FaChild } from 'react-icons/fa';
import { getMonthName, getRoomPriceForMonth } from '../utils/pricingUtils';

const HotelInfo = ({ hotelData }) => {
  if (!hotelData) return null;

  // Create star rating display
  const renderStars = (count) => {
    return Array(count).fill(0).map((_, i) => (
      <FaStar key={i} className="text-yellow-400 inline" />
    ));
  };
  
  // Get current month for pricing
  const currentDate = new Date();
  const currentMonth = getMonthName(currentDate);
  const currentMonthCapitalized = currentMonth ? currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1) : '';

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg h-full">
      <div className="flex flex-col mb-4">
        <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate text-center">
          {hotelData.name}
        </h5>
        <div className="flex justify-center">
          <span className="flex items-center text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded whitespace-nowrap">
            {renderStars(hotelData.stars)}
            <span className="ml-1 text-gray-700 dark:text-gray-300">{hotelData.stars}-star</span>
          </span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mt-4 mb-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-start">
            <FaBed className="text-blue-500 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
            <div className="w-full">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Room Types:</p>
              
              {currentMonth && (
                <div className="flex justify-center items-center text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1 px-3 rounded-full mt-1 mb-2 shadow-sm">
                  <FaCalendarAlt className="mr-1" size={10} />
                  <span>{currentMonthCapitalized} pricing</span>
                </div>
              )}
              
              {hotelData.roomTypes && hotelData.roomTypes.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {hotelData.roomTypes.map((roomType, index) => {
                    // Get the current month's price if available
                    const currentMonthPrice = getRoomPriceForMonth(roomType, currentDate, false);
                    const currentMonthChildPrice = getRoomPriceForMonth(roomType, currentDate, true);
                    
                    return (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex justify-between gap-2">
                        <span>{roomType.type.replace(" ROOM", "").replace(" SUITE", "")}</span> 
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-green-600 dark:text-green-400">
                            ${currentMonthPrice}/night
                          </span>
                          {currentMonthChildPrice > 0 && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <FaChild className="mr-1" size={10} />
                              <span>${currentMonthChildPrice} child</span>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Standard pricing: ${hotelData.pricePerNightPerPerson} per person per night
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mt-2 md:mt-0 md:space-y-3 md:pl-4 flex flex-col">
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
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 min-h-[4.5rem]">
        {hotelData.description ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{hotelData.description}</p>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 opacity-0">.</p>
        )}
      </div>
    </div>
  );
};

export default HotelInfo; 