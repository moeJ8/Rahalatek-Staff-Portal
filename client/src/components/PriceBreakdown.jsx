import React from 'react';
import { Alert } from 'flowbite-react';
import { safeParseInt } from '../utils/pricingUtils';
import { FaCrown, FaUsers, FaCar, FaRegCheckCircle } from 'react-icons/fa';

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
}) => {
  if (!selectedHotelData || !nights) return null;

  // Calculate the individual parts to verify the total
  let hotelTotal = 0;
  let tourTotal = 0;
  let transportTotal = 0;
  
  // Calculate hotel cost
  if (selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 && roomAllocations.length > 0) {
    roomAllocations.forEach(room => {
      if (room.roomTypeIndex !== "" && selectedHotelData.roomTypes[room.roomTypeIndex]) {
        const roomTypeObj = selectedHotelData.roomTypes[room.roomTypeIndex];
        const roomPrice = roomTypeObj.pricePerNight * nights;
        hotelTotal += roomPrice;
        
        // Add children 6-12 cost
        if (includeChildren && roomTypeObj.childrenPricePerNight && room.children6to12) {
          hotelTotal += roomTypeObj.childrenPricePerNight * nights * room.children6to12;
        }
      }
    });
  }
  
  // Calculate tour cost
  if (selectedTours.length > 0) {
    selectedTours.forEach(tourId => {
      const tour = tours.find(t => t._id === tourId);
      if (tour) {
        if (tour.tourType === 'Group') {
          // Adult cost
          tourTotal += tour.price * safeParseInt(numGuests);
          
          // Children 3+ cost (3-6 and 6-12)
          if (includeChildren) {
            const childrenCount = safeParseInt(children3to6) + safeParseInt(children6to12);
            tourTotal += tour.price * childrenCount;
          }
        } else if (tour.tourType === 'VIP') {
          tourTotal += parseFloat(tour.price);
        }
      }
    });
  }
  
  // Calculate transportation cost
  if (includeTransfer && selectedHotelData.transportationPrice) {
    const totalPeople = safeParseInt(numGuests) + (includeChildren ? 
      safeParseInt(childrenUnder3) + safeParseInt(children3to6) + safeParseInt(children6to12) : 0);
    transportTotal = selectedHotelData.transportationPrice * totalPeople;
  }
  
  // Calculate direct sum for comparison
  const directSum = hotelTotal + tourTotal + transportTotal;
  
  console.log("Price validation:", {
    providedTotal: totalPrice,
    calculatedTotal: directSum,
    hotelTotal,
    tourTotal,
    transportTotal
  });

  // Use the directly calculated price if it differs significantly from the provided totalPrice
  const displayPrice = Math.abs(directSum - totalPrice) > 0.01 ? directSum : totalPrice;

  return (
    <div className="rounded-lg overflow-hidden shadow-md">
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white">
        <div className="p-4 text-center">
          <h3 className="text-xl font-bold mb-1 text-green-400">Total Price: ${displayPrice}</h3>
          <p className="text-sm text-blue-200">{nights} nights • {numGuests} {numGuests === 1 ? 'person' : 'people'}</p>
        </div>
        
        <div className="px-4 pb-4">
          <h4 className="text-sm font-semibold text-white mb-3 border-b border-blue-800 pb-2">Price Breakdown</h4>
          
          {/* Hotel Cost Breakdown */}
          <div className="mb-3 p-3 bg-blue-950/60 rounded-lg">
            <h5 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center mr-2 text-white text-xs">1</span>
              Hotel Accommodation
            </h5>
            
            {selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 && roomAllocations.length > 0 ? (
              <div className="space-y-2 pl-8">
                {(() => {
                  const roomTypeCounts = {};
                  const totalNights = nights;
                  roomAllocations.forEach(room => {
                    if (room.roomTypeIndex !== "" && selectedHotelData.roomTypes[room.roomTypeIndex]) {
                      const roomTypeObj = selectedHotelData.roomTypes[room.roomTypeIndex];
                      const roomType = roomTypeObj.type;
                      const price = roomTypeObj.pricePerNight;
                      const childrenPrice = roomTypeObj.childrenPricePerNight || 0;
                      
                      roomTypeCounts[roomType] = roomTypeCounts[roomType] || { 
                        rooms: 0, 
                        people: 0, 
                        childrenUnder3: 0,
                        children3to6: 0,
                        children6to12: 0,
                        price, 
                        childrenPrice,
                        totalPrice: 0
                      };
                      
                      roomTypeCounts[roomType].rooms += 1;
                      roomTypeCounts[roomType].people += room.occupants;
                      roomTypeCounts[roomType].childrenUnder3 += (room.childrenUnder3 || 0);
                      roomTypeCounts[roomType].children3to6 += (room.children3to6 || 0);
                      roomTypeCounts[roomType].children6to12 += (room.children6to12 || 0);
                      roomTypeCounts[roomType].totalPrice = price * totalNights * roomTypeCounts[roomType].rooms;
                    }
                  });
                  
                  return Object.entries(roomTypeCounts).map(([type, info], index) => (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between">
                        <span className="font-medium text-white">{info.rooms}x {type}</span>
                        <span className="text-green-400 font-medium">${info.totalPrice}</span>
                      </div>
                      <div className="text-blue-300 text-xs">
                        ${info.price}/night × {totalNights} nights × {info.rooms} rooms
                      </div>
                      
                      {/* Room occupancy breakdown */}
                      <div className="ml-2 mt-1 text-blue-200">
                        <p>• Adults: {info.people}</p>
                        {includeChildren && (
                          <>
                            {info.childrenUnder3 > 0 && <p>• Children 0-3: {info.childrenUnder3} <span className="text-green-400">(free)</span></p>}
                            {info.children3to6 > 0 && <p>• Children 3-6: {info.children3to6} <span className="text-green-400">(free accommodation)</span></p>}
                            {info.children6to12 > 0 && (
                              <p>
                                • Children 6-12: {info.children6to12} 
                                {info.childrenPrice > 0 && 
                                  <span className="text-blue-300"> - ${info.childrenPrice}/night × {totalNights} nights × {info.children6to12} = <span className="text-green-400">${info.childrenPrice * totalNights * info.children6to12}</span></span>
                                }
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p className="text-xs pl-8 text-blue-300">
                Standard room rate calculation based on {numGuests} guests for {nights} nights
              </p>
            )}
          </div>
          
          {/* Tour Costs */}
          {selectedTours.length > 0 && (
            <div className="mb-3 p-3 bg-purple-950/60 rounded-lg">
              <h5 className="text-sm font-semibold text-purple-300 mb-2 flex items-center">
                <span className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center mr-2 text-white text-xs">2</span>
                Tour Prices
              </h5>
              
              <div className="space-y-2 pl-8">
                {selectedTours.map(tourId => {
                  const tour = tours.find(t => t._id === tourId);
                  if (!tour) return null;
                  
                  if (tour.tourType === 'VIP') {
                    return (
                      <div key={tourId} className="text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium text-white flex items-center">
                            {tour.name} 
                            <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-300 text-amber-900 text-xxs font-bold">
                              <FaCrown className="mr-1" size={8} />VIP
                            </span>
                          </span>
                          <span className="text-green-400 font-medium">${tour.price}</span>
                        </div>
                        
                        <div className="ml-2 mt-1 text-purple-200">
                          <p>• <FaCar className="inline mr-1" size={10} /> {tour.vipCarType} ({tour.carCapacity?.min || '?'}-{tour.carCapacity?.max || '?'} persons)</p>
                          <p>• Fixed price per car</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // For Group tours
                  const adultCost = tour.price * numGuests;
                  const childrenCount = includeChildren ? safeParseInt(children3to6) + safeParseInt(children6to12) : 0;
                  const childrenCost = childrenCount * tour.price;
                  const totalTourCost = adultCost + childrenCost;
                  
                  return (
                    <div key={tourId} className="text-xs">
                      <div className="flex justify-between">
                        <span className="font-medium text-white flex items-center">
                          {tour.name} 
                          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-blue-600 text-white text-xxs">
                            <FaUsers className="mr-1" size={8} />Group
                          </span>
                        </span>
                        <span className="text-green-400 font-medium">${totalTourCost}</span>
                      </div>
                      
                      <div className="ml-2 mt-1 text-purple-200">
                        <p>• Adults: <span className="text-green-400">${adultCost}</span> ({numGuests} × ${tour.price})</p>
                        {childrenCount > 0 && (
                          <p>• Children 3+ years: <span className="text-green-400">${childrenCost}</span> ({childrenCount} × ${tour.price})</p>
                        )}
                        {includeChildren && safeParseInt(childrenUnder3) > 0 && (
                          <p>• Children 0-3 years: <span className="text-green-400">$0</span> (free)</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Transportation Costs */}
          <div className="mb-3 p-3 bg-amber-950/60 rounded-lg">
            <h5 className="text-sm font-semibold text-amber-300 mb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center mr-2 text-white text-xs">3</span>
              Transportation
            </h5>
            
            <div className="pl-8">
              {includeTransfer && selectedHotelData.transportationPrice > 0 ? (
                <div className="text-xs">
                  {(() => {
                    // Calculate the total people count for transportation
                    const transportPeopleCount = safeParseInt(numGuests) + (
                      includeChildren ? 
                      safeParseInt(childrenUnder3) + safeParseInt(children3to6) + safeParseInt(children6to12) 
                      : 0
                    );
                    const transportCost = selectedHotelData.transportationPrice * transportPeopleCount;
                    
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium text-white">Airport Transfers</span>
                          <span className="text-green-400 font-medium">${transportCost}</span>
                        </div>
                        <div className="text-amber-200">
                          ${selectedHotelData.transportationPrice}/person × {transportPeopleCount} people
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-xs text-amber-200">No airport transfers included</p>
              )}
            </div>
          </div>
          
          {/* Guest Breakdown */}
          <div className="mb-3 p-3 bg-teal-950/60 rounded-lg">
            <h5 className="text-sm font-semibold text-teal-300 mb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-teal-800 flex items-center justify-center mr-2 text-white text-xs">4</span>
              Guest Details
            </h5>
            
            <ul className="text-xs list-disc pl-8 text-teal-100 space-y-1">
              <li>{numGuests} {numGuests === 1 ? 'Adult' : 'Adults'} (full price)</li>
              {includeChildren && safeParseInt(childrenUnder3) > 0 && (
                <li>{childrenUnder3} {safeParseInt(childrenUnder3) === 1 ? 'Child' : 'Children'} 0-3 years <span className="text-green-400">(free on tours)</span></li>
              )}
              {includeChildren && safeParseInt(children3to6) > 0 && (
                <li>{children3to6} {safeParseInt(children3to6) === 1 ? 'Child' : 'Children'} 3-6 years <span className="text-green-400">(free hotel accommodation)</span></li>
              )}
              {includeChildren && safeParseInt(children6to12) > 0 && (
                <li>{children6to12} {safeParseInt(children6to12) === 1 ? 'Child' : 'Children'} 6-12 years <span className="text-green-400">(special hotel rate)</span></li>
              )}
            </ul>
          </div>
        </div>

        <div className="py-3 px-4 bg-green-900/30 border-t border-green-800 flex items-start">
          <FaRegCheckCircle className="text-green-400 mt-0.5 flex-shrink-0 mr-2" />
          <p className="text-xs text-green-100">
            Price verified: The total amount of <span className="font-bold text-green-400">${displayPrice}</span> has been accurately calculated based on room rates, tour costs, and additional services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown; 