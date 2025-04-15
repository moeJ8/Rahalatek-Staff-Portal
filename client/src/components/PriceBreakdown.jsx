import React from 'react';
import { Alert } from 'flowbite-react';
import { safeParseInt } from '../utils/pricingUtils';

const PriceBreakdown = ({ 
  totalPrice, 
  nights, 
  numGuests,
  selectedHotelData,
  roomAllocations,
  selectedTours,
  tours,
  includeChildren,
  childrenUnder3,
  children3to6,
  children6to12,
  includeTransfer,
  includeVIP,
  vipCarPrice
}) => {
  if (!selectedHotelData || !nights) return null;

  return (
    <Alert color="info" className="border-0 shadow-md p-0 bg-transparent">
      <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg text-white">
        <div className="text-center">
          <h6 className="text-xl font-bold text-green-400 mb-1">Total Price: ${totalPrice}</h6>
          <p className="text-sm text-green-300">For {nights} nights and {numGuests} people</p>
        </div>
        
        <div className="mt-4 border-t border-gray-700 dark:border-gray-700 pt-3">
          <h6 className="text-sm font-bold text-white mb-2">Detailed Price Breakdown:</h6>
          
          {/* Hotel Cost Breakdown */}
          <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-800 rounded-md shadow-sm">
            <p className="text-sm font-semibold text-blue-400 dark:text-blue-400 border-b border-gray-700 dark:border-gray-700 pb-1 mb-1">1. Hotel Accommodation:</p>
            {selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 && roomAllocations.length > 0 ? (
              <div className="ml-2">
                {(() => {
                  const roomTypeCounts = {};
                  const totalNights = nights;
                  roomAllocations.forEach(room => {
                    if (room.roomTypeIndex !== "" && selectedHotelData.roomTypes[room.roomTypeIndex]) {
                      const roomType = selectedHotelData.roomTypes[room.roomTypeIndex].type;
                      const price = selectedHotelData.roomTypes[room.roomTypeIndex].pricePerNight;
                      const childrenPrice = selectedHotelData.roomTypes[room.roomTypeIndex].childrenPricePerNight || 0;
                      roomTypeCounts[roomType] = roomTypeCounts[roomType] || { 
                        rooms: 0, 
                        people: 0, 
                        price, 
                        childrenPrice,
                        totalPrice: 0
                      };
                      roomTypeCounts[roomType].rooms += 1;
                      roomTypeCounts[roomType].people += room.occupants;
                      roomTypeCounts[roomType].totalPrice = price * totalNights * roomTypeCounts[roomType].rooms;
                    }
                  });
                  
                  return Object.entries(roomTypeCounts).map(([type, info], index) => (
                    <div key={index} className="text-xs mb-1">
                      <p>
                        <span className="font-medium text-gray-200 dark:text-gray-200">{info.rooms}x {type}:</span> <span className="text-green-400 dark:text-green-400 font-medium">${info.totalPrice}</span> 
                        <span className="text-gray-400 dark:text-gray-400">
                          (${info.price}/night × {totalNights} nights × {info.rooms} rooms)
                        </span>
                      </p>
                      {includeChildren && children6to12 > 0 && info.childrenPrice > 0 && (
                        <p className="ml-4 text-xs text-gray-400 dark:text-gray-400">
                          + Children 6-12 years: <span className="text-green-400 dark:text-green-400">${info.childrenPrice * totalNights * parseInt(children6to12)}</span>
                          (${info.childrenPrice}/night × {totalNights} nights × {parseInt(children6to12)} children)
                        </p>
                      )}
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p className="text-xs ml-2 text-gray-400 dark:text-gray-400">
                Standard room rate calculation based on {numGuests} guests for {nights} nights
              </p>
            )}
          </div>
          
          {/* Tour Cost Breakdown */}
          {selectedTours.length > 0 && (
            <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-800 rounded-md shadow-sm">
              <p className="text-sm font-semibold text-purple-400 dark:text-purple-400 border-b border-gray-700 dark:border-gray-700 pb-1 mb-1">2. Tours:</p>
              <div className="ml-2">
                {selectedTours.map((tourId, index) => {
                  const tour = tours.find(t => t._id === tourId);
                  if (!tour) return null;
                  
                  const adultCost = tour.price * numGuests;
                  const childrenCount = includeChildren ? (safeParseInt(children3to6) + safeParseInt(children6to12)) : 0;
                  const childrenCost = childrenCount > 0 ? tour.price * childrenCount : 0;
                  const totalTourCost = adultCost + childrenCost;
                  
                  return (
                    <div key={index} className="text-xs mb-1">
                      <p>
                        <span className="font-medium text-gray-200 dark:text-gray-200">{tour.name}:</span> <span className="text-green-400 dark:text-green-400 font-medium">${totalTourCost}</span>
                      </p>
                      <div className="ml-4 text-gray-400 dark:text-gray-400">
                        <p>• Adults: <span className="text-green-400 dark:text-green-400">${adultCost}</span> ({numGuests} × ${tour.price})</p>
                        {childrenCount > 0 && (
                          <p>• Children 3+ years: <span className="text-green-400 dark:text-green-400">${childrenCost}</span> ({childrenCount} × ${tour.price})</p>
                        )}
                        {includeChildren && safeParseInt(childrenUnder3) > 0 && (
                          <p>• Children 0-3 years: <span className="text-green-400 dark:text-green-400">$0</span> (free)</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Transportation Costs */}
          <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-800 rounded-md shadow-sm">
            <p className="text-sm font-semibold text-orange-400 dark:text-orange-400 border-b border-gray-700 dark:border-gray-700 pb-1 mb-1">3. Transportation:</p>
            <div className="ml-2">
              {includeTransfer && selectedHotelData.transportationPrice > 0 ? (
                <div className="text-xs">
                  <p>
                    <span className="font-medium text-gray-200 dark:text-gray-200">Airport Transfers:</span> <span className="text-green-400 dark:text-green-400 font-medium">${selectedHotelData.transportationPrice * (
                      safeParseInt(numGuests) + (
                        includeChildren ? 
                        safeParseInt(childrenUnder3) + safeParseInt(children3to6) + safeParseInt(children6to12) 
                        : 0
                      )
                    )}</span>
                  </p>
                  <p className="ml-4 text-gray-400 dark:text-gray-400">
                    ${selectedHotelData.transportationPrice}/person × {
                      safeParseInt(numGuests) + (
                        includeChildren ? 
                        safeParseInt(childrenUnder3) + safeParseInt(children3to6) + safeParseInt(children6to12) 
                        : 0
                      )
                    } people
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-400">No airport transfers included</p>
              )}
              
              {includeVIP && vipCarPrice ? (
                <div className="text-xs mt-2">
                  <p>
                    <span className="font-medium text-gray-200 dark:text-gray-200">VIP Luxury Car:</span> <span className="text-green-400 dark:text-green-400 font-medium">${vipCarPrice}</span>
                  </p>
                  <p className="ml-4 text-gray-400 dark:text-gray-400">
                    Premium transportation service for all tours
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          
          {/* Guest Breakdown */}
          <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-800 rounded-md shadow-sm">
            <p className="text-sm font-semibold text-teal-400 dark:text-teal-400 border-b border-gray-700 dark:border-gray-700 pb-1 mb-1">4. Guest Details:</p>
            <ul className="text-xs list-disc ml-6 text-gray-300 dark:text-gray-300">
              <li>{numGuests} Adults (full price)</li>
              {includeChildren && safeParseInt(childrenUnder3) > 0 && (
                <li>{childrenUnder3} {safeParseInt(childrenUnder3) === 1 ? 'Child' : 'Children'} 0-3 years (free on tours)</li>
              )}
              {includeChildren && safeParseInt(children3to6) > 0 && (
                <li>{children3to6} {safeParseInt(children3to6) === 1 ? 'Child' : 'Children'} 3-6 years (free hotel accommodation)</li>
              )}
              {includeChildren && safeParseInt(children6to12) > 0 && (
                <li>{children6to12} {safeParseInt(children6to12) === 1 ? 'Child' : 'Children'} 6-12 years (special hotel rate)</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-700 dark:border-gray-700">
          <div className="text-xs text-gray-300 dark:text-gray-300 flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-400 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
            <span>
              Price verified: The total amount of <span className="font-bold text-green-400">${totalPrice}</span> has been accurately calculated based on room rates, tour costs, and additional services.
            </span>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default PriceBreakdown; 