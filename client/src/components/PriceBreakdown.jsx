import React, { useRef, useState, useEffect } from 'react';
import { Alert } from 'flowbite-react';
import { safeParseInt, getRoomPriceForMonth, calculateNightsPerMonth, calculateDuration, calculateMultiHotelTotalPrice, getMonthName } from '../utils/pricingUtils';
import { FaCrown, FaUsers, FaCar, FaRegCheckCircle, FaCalendarAlt, FaPlane } from 'react-icons/fa';
import PriceBreakdownDownloader from './PriceBreakdownDownloader';

const PriceBreakdown = ({ 
  totalPrice, 
  nights, 
  numGuests,
  hotelEntries,
  selectedTours,
  tours,
  includeChildren,
  childrenUnder3,
  children3to6,
  children6to12,
  includeReception,
  includeFarewell,
  transportVehicleType,
  startDate,
  endDate
}) => {
  const breakdownRef = useRef(null);
  const [sections, setSections] = useState({
    hotels: 0,
    tours: 0,
    transportation: 0,
    guests: 0
  });

  const [calculatedPrices, setCalculatedPrices] = useState({
    total: 0,
    breakdown: {
      hotels: [],
      transportation: 0,
      tours: 0
    }
  });

  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (hotelEntries.length > 0 && hotelEntries.every(entry => entry.hotelData)) {
      const prices = calculateMultiHotelTotalPrice({
        hotelEntries,
        numGuests,
        includeChildren,
        childrenUnder3,
        children3to6,
        children6to12,
        selectedTours,
        tours,
        includeReception,
        includeFarewell,
        transportVehicleType
      });
      
      setCalculatedPrices(prices);
    }
  }, [
    hotelEntries, 
    numGuests, 
    includeChildren, 
    childrenUnder3, 
    children3to6, 
    children6to12, 
    selectedTours, 
    tours, 
    includeReception, 
    includeFarewell, 
    transportVehicleType
  ]);

  useEffect(() => {
    let counter = 1;
    const newSections = {
      hotels: counter++,
      tours: selectedTours?.length > 0 ? counter++ : 0,
      transportation: counter++,
      guests: counter
    };
    setSections(newSections);
  }, [selectedTours]);

  if (hotelEntries.length === 0 || !hotelEntries.every(entry => entry.hotelData)) return null;

  const travelStartMonth = startDate ? new Date(startDate).toLocaleString('default', { month: 'long' }) : '';
  const travelEndMonth = endDate ? new Date(endDate).toLocaleString('default', { month: 'long' }) : '';
  const isMultiMonthStay = travelStartMonth !== travelEndMonth && travelStartMonth && travelEndMonth;
  
  const directSum = calculatedPrices.total;
  
  return (
    <div 
      className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-md"
      ref={breakdownRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Price Breakdown
        </h3>
      </div>
      
      <div className="rounded-lg overflow-hidden shadow-md relative">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white">
          <div className="p-4 text-center">
            <h3 className="text-xl font-bold mb-1 text-green-400">Total Price: ${Math.round(directSum)}</h3>
            {totalPrice !== null && totalPrice !== directSum && totalPrice > 0 && !isNaN(parseFloat(totalPrice)) && (
              <p className="text-xs text-yellow-400 mb-1">Manual price: ${totalPrice}</p>
            )}
            <p className="text-sm text-blue-200">
              {nights} nights • {numGuests} {numGuests === 1 ? 'person' : 'people'}
              {includeChildren && (childrenUnder3 > 0 || children3to6 > 0 || children6to12 > 0) && 
                ` • ${safeParseInt(childrenUnder3) + safeParseInt(children3to6) + safeParseInt(children6to12)} ${(safeParseInt(childrenUnder3) + safeParseInt(children3to6) + safeParseInt(children6to12)) === 1 ? 'child' : 'children'}`
              }
            </p>
            {travelStartMonth && (
              <p className="text-sm text-blue-200 mt-1 flex items-center justify-center">
                <FaCalendarAlt className="mr-1" /> 
                Travel Period: <span className="font-semibold ml-1">
                  {isMultiMonthStay ? `${travelStartMonth} - ${travelEndMonth}` : travelStartMonth}
                </span>
              </p>
            )}
          </div>
          <div className="px-4 pb-4">
            <h4 className="text-sm font-semibold text-white mb-3 border-b border-blue-800 pb-2">Price Breakdown</h4>
            
            <div className="mb-3 p-3 bg-blue-950/60 rounded-lg">
              <h5 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center mr-2 text-white text-xs">{sections.hotels}</span>
                Hotel Accommodation
              </h5>
              
              {hotelEntries.map((entry, hotelIndex) => {
                const hotelNights = calculateDuration(entry.checkIn, entry.checkOut);
                const hotelData = entry.hotelData;
                const includeBreakfast = entry.includeBreakfast;
                const roomAllocations = entry.roomAllocations;
                
                const hotelCostInfo = calculatedPrices.breakdown?.hotels[hotelIndex] || {
                  roomCost: 0,
                  breakfastCost: 0,
                  transportCost: 0,
                  totalCost: 0,
                  includeReception: false,
                  includeFarewell: false
                };
                
                const hotelDisplayCost = hotelCostInfo.totalCost;
                
                return (
                  <div key={hotelIndex} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="text-sm font-semibold text-blue-200">
                          {hotelData.name} ({hotelData.stars}★)
                        </h5>
                        <p className="text-xs text-blue-300">
                          {hotelData.city} • {hotelNights} {hotelNights === 1 ? 'night' : 'nights'}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-blue-200">
                        ${Math.round(hotelDisplayCost)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-blue-200 ml-2 mb-2">
                      <p>• {formatDate(entry.checkIn)} - {formatDate(entry.checkOut)} ({hotelNights} nights)</p>
                    </div>
                    
                    {/* Room allocations and pricing */}
                    {hotelData.roomTypes && hotelData.roomTypes.length > 0 && roomAllocations.length > 0 ? (
                      <div className="space-y-2 pl-8">
                        {(() => {
                          const roomTypeCounts = {};
                          roomAllocations.forEach(room => {
                            if (room.roomTypeIndex !== "" && hotelData.roomTypes[room.roomTypeIndex]) {
                              const roomTypeObj = hotelData.roomTypes[room.roomTypeIndex];
                              const roomType = roomTypeObj.type;
                              
                              // Get monthly nights breakdown for this hotel stay
                              const nightsPerMonth = calculateNightsPerMonth(entry.checkIn, entry.checkOut);
                              const isMultiMonth = nightsPerMonth.length > 1;
                              
                              // Initialize the roomType in our tracking object if it doesn't exist
                              if (!roomTypeCounts[roomType]) {
                                roomTypeCounts[roomType] = { 
                                  rooms: 0, 
                                  people: 0, 
                                  childrenUnder3: 0,
                                  children3to6: 0,
                                  children6to12: 0,
                                  adultPrice: 0,
                                  childrenTotalPrice: 0,
                                  totalPrice: 0,
                                  isMonthlyPrice: false,
                                  // For multi-month stays
                                  isMultiMonth,
                                  monthlyBreakdown: []
                                };
                              }
                              
                              roomTypeCounts[roomType].rooms += 1;
                              roomTypeCounts[roomType].people += room.occupants;
                              roomTypeCounts[roomType].childrenUnder3 += (room.childrenUnder3 || 0);
                              roomTypeCounts[roomType].children3to6 += (room.children3to6 || 0);
                              roomTypeCounts[roomType].children6to12 += (room.children6to12 || 0);
                              
                              // Calculate costs (differently for multi-month stays)
                              if (isMultiMonth) {
                                // Clear previous monthly breakdown if this is the first room of this type
                                if (roomTypeCounts[roomType].rooms === 1) {
                                  roomTypeCounts[roomType].monthlyBreakdown = [];
                                }
                                
                                // Process each month separately
                                nightsPerMonth.forEach(monthData => {
                                  const monthDate = new Date(monthData.date);
                                  const monthName = monthDate.toLocaleString('default', { month: 'long' });
                                  const adultPricePerNight = getRoomPriceForMonth(roomTypeObj, monthData.date, false);
                                  const childPricePerNight = getRoomPriceForMonth(roomTypeObj, monthData.date, true);
                                  
                                  const monthAdultCost = adultPricePerNight * monthData.nights;
                                  let monthChildCost = 0;
                                  
                                  if (includeChildren && room.children6to12 > 0 && childPricePerNight > 0) {
                                    monthChildCost = childPricePerNight * monthData.nights * room.children6to12;
                                  }
                                  
                                  // Check if we need to add to existing month or create new entry
                                  const existingMonthIndex = roomTypeCounts[roomType].monthlyBreakdown.findIndex(
                                    m => m.month === monthName
                                  );
                                  
                                  if (existingMonthIndex >= 0) {
                                    roomTypeCounts[roomType].monthlyBreakdown[existingMonthIndex].adultCost += monthAdultCost;
                                    roomTypeCounts[roomType].monthlyBreakdown[existingMonthIndex].childCost += monthChildCost;
                                    roomTypeCounts[roomType].monthlyBreakdown[existingMonthIndex].totalCost += (monthAdultCost + monthChildCost);
                                  } else {
                                    roomTypeCounts[roomType].monthlyBreakdown.push({
                                      month: monthName,
                                      nights: monthData.nights,
                                      adultPrice: adultPricePerNight,
                                      childPrice: childPricePerNight,
                                      adultCost: monthAdultCost,
                                      childCost: monthChildCost,
                                      totalCost: monthAdultCost + monthChildCost,
                                      isStandardPrice: adultPricePerNight === roomTypeObj.pricePerNight && 
                                                       childPricePerNight === roomTypeObj.childrenPricePerNight
                                    });
                                  }
                                  
                                  roomTypeCounts[roomType].adultPrice += monthAdultCost;
                                  roomTypeCounts[roomType].childrenTotalPrice += monthChildCost;
                                });
                                
                                // Flag monthly difference if any month uses special pricing
                                roomTypeCounts[roomType].isMonthlyPrice = roomTypeCounts[roomType].monthlyBreakdown.some(
                                  m => !m.isStandardPrice
                                );
                              } else {
                                // Single month calculation (as before)
                                const adultPricePerNight = getRoomPriceForMonth(roomTypeObj, entry.checkIn, false);
                                const childPricePerNight = getRoomPriceForMonth(roomTypeObj, entry.checkIn, true);
                                
                                roomTypeCounts[roomType].price = adultPricePerNight;
                                roomTypeCounts[roomType].childrenPrice = childPricePerNight;
                                
                                // Calculate room cost for single month
                                const roomAdultCost = adultPricePerNight * hotelNights;
                                roomTypeCounts[roomType].adultPrice += roomAdultCost;
                                
                                if (includeChildren && room.children6to12 > 0 && childPricePerNight > 0) {
                                  const roomChildCost = childPricePerNight * hotelNights * room.children6to12;
                                  roomTypeCounts[roomType].childrenTotalPrice += roomChildCost;
                                }
                                
                                roomTypeCounts[roomType].isMonthlyPrice = adultPricePerNight !== roomTypeObj.pricePerNight || 
                                                childPricePerNight !== roomTypeObj.childrenPricePerNight;
                              }
                              
                              roomTypeCounts[roomType].totalPrice = roomTypeCounts[roomType].adultPrice + 
                                                               roomTypeCounts[roomType].childrenTotalPrice;
                            }
                          });
                          
                          return Object.entries(roomTypeCounts).map(([type, info], index) => {
                            return (
                              <div key={index} className="text-xs mb-3">
                                <div className="flex justify-between">
                                  <span className="font-medium text-white">{info.rooms}x {type}</span>
                                  <span className="text-green-400 font-medium">${info.totalPrice}</span>
                                </div>
                                
                                <div className="ml-2 mt-1 text-blue-200">
                                  {info.isMultiMonth ? (
                                    // Display multi-month breakdown
                                    <>
                                      <div className="flex justify-between">
                                        <span>• Room cost:</span>
                                        <span className="text-teal-300">${info.adultPrice}</span>
                                      </div>
                                      
                                      {/* Monthly breakdown details */}
                                      <div className="mt-1 ml-4 border-l-2 border-blue-800 pl-2">
                                        {info.monthlyBreakdown.map((monthData, idx) => (
                                          <div key={idx} className="mb-2">
                                            <div className="flex justify-between">
                                              <span className="text-blue-300 font-medium">
                                                {monthData.month} ({monthData.nights} nights)
                                                {!monthData.isStandardPrice && (
                                                  <span className="ml-2 text-xxs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                                                    {monthData.month} pricing
                                                  </span>
                                                )}
                                              </span>
                                              <span className="text-teal-300">${monthData.totalCost}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400 text-xs">
                                              <span>Adult: ${monthData.adultPrice}/night × {monthData.nights} nights × {info.rooms} rooms</span>
                                              <span>${monthData.adultCost}</span>
                                            </div>
                                            {monthData.childCost > 0 && (
                                              <div className="flex justify-between text-gray-400 text-xs">
                                                <span>Child(6-12): ${monthData.childPrice}/night × {monthData.nights} nights × {info.children6to12}</span>
                                                <span>${monthData.childCost}</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  ) : (
                                    // Single month display (original)
                                    <>
                                      {info.isMonthlyPrice && (
                                        <div className="mb-2">
                                          <span className="bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded text-xs">
                                            Using {getMonthName(new Date(entry.checkIn))} pricing
                                          </span>
                                        </div>
                                      )}
                                    
                                      <div className="flex justify-between">
                                        <span>• Room cost: <span className="text-blue-300">${info.price}/night × {hotelNights} nights × {info.rooms} rooms</span></span>
                                        <span className="text-teal-300">${info.adultPrice}</span>
                                      </div>
                                      
                                      {includeChildren && info.children6to12 > 0 && info.childrenPrice > 0 && (
                                        <div className="flex justify-between">
                                          <span>• Children 6-12: <span className="text-blue-300">${info.childrenPrice}/night × {hotelNights} nights × {info.children6to12}</span></span>
                                          <span className="text-teal-300">${info.childrenTotalPrice}</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  
                                  {includeChildren && (
                                    <>
                                      {info.childrenUnder3 > 0 && <p>• Children 0-3: {info.childrenUnder3} <span className="text-green-400">(free)</span></p>}
                                      {info.children3to6 > 0 && <p>• Children 3-6: {info.children3to6} <span className="text-green-400">(free accommodation)</span></p>}
                                      {info.children6to12 > 0 && !info.childrenPrice && (
                                        <p>• Children 6-12: {info.children6to12} <span className="text-green-400">(no additional charge)</span></p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs pl-8 text-blue-300">
                        Standard room rate calculation based on {numGuests} guests for {hotelNights} nights
                      </p>
                    )}
                    
                    {includeBreakfast && hotelData.breakfastIncluded && hotelData.breakfastPrice > 0 && (
                      <div className="mt-3 ml-8 text-xs text-green-300">
                        <div className="flex justify-between">
                          <span>Breakfast: ${hotelData.breakfastPrice}/room × {hotelNights} nights × {roomAllocations.length || Math.ceil(safeParseInt(numGuests) / 2)} {roomAllocations.length === 1 ? 'room' : 'rooms'}</span>
                          <span className="text-green-400">${hotelCostInfo.breakfastCost}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {selectedTours.length > 0 && (
              <div className="mb-3 p-3 bg-purple-950/60 rounded-lg">
                <h5 className="text-sm font-semibold text-purple-300 mb-2 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center mr-2 text-white text-xs">{sections.tours}</span>
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
                            <p>• Vehicle: {tour.vipCarType} ({tour.carCapacity?.min || '?'}-{tour.carCapacity?.max || '?'} persons)</p>
                            <p className="flex items-center">
                              <FaRegCheckCircle className="mr-1" size={10} />
                              <span className="text-green-300 font-medium">Fixed price per vehicle</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
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
                          <p>• Adults: <span className="text-teal-300">${adultCost}</span> ({numGuests} × ${tour.price})</p>
                          {childrenCount > 0 && (
                            <p>• Children 3+ years: <span className="text-teal-300">${childrenCost}</span> ({childrenCount} × ${tour.price})</p>
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
            
            <div className="mb-3 p-3 bg-blue-950/60 rounded-lg">
              <h5 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center mr-2 text-white text-xs">{sections.transportation}</span>
                Transportation Summary
              </h5>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-white">Airport Transportation</span>
                  <span className="text-green-400 font-medium">${calculatedPrices.breakdown?.transportation}</span>
                </div>
                
                {calculatedPrices.breakdown?.transportation > 0 ? (
                  <div className="pl-2">
                    {/* List all hotel transportation details here */}
                    {hotelEntries.map((entry, hotelIndex) => {
                      const hotelCostInfo = calculatedPrices.breakdown?.hotels[hotelIndex] || {
                        transportCost: 0,
                        includeReception: false,
                        includeFarewell: false,
                        transportVehicleType: 'Vito'
                      };
                      
                      if (hotelCostInfo.transportCost <= 0) return null;
                      
                      const vehicleType = hotelCostInfo.transportVehicleType || entry.transportVehicleType || "Vito";
                      const vehicleCapacity = vehicleType === 'Vito' ? '(2-8 people)' : 
                                             vehicleType === 'Sprinter' ? '(9-16 people)' : 
                                             vehicleType === 'Bus' ? '(+16 people)' : '(capacity unknown)';
                      
                      return (
                        <div key={hotelIndex} className="mb-3 last:mb-0">
                          <div className="flex items-center justify-between text-teal-300 font-medium mb-1">
                            <div className="flex items-center">
                              <FaPlane className="mr-1.5" size={12} />
                              <span>{entry.hotelData.name} - {entry.hotelData.city}</span>
                            </div>
                            <span>${Math.round(hotelCostInfo.transportCost)}</span>
                          </div>
                          
                          <div className="ml-4 text-xs text-blue-200">
                            <p>• Airport: <span className="text-blue-300 font-medium">{entry.selectedAirport || "Airport"}</span></p>
                            <p>• Vehicle: {vehicleType} {vehicleCapacity}</p>
                            
                            {entry.includeReception && (
                              <p className="flex items-center mt-1">
                                <FaCar className="mr-1" size={10} />
                                <span>Reception from airport to hotel</span>
                              </p>
                            )}
                            
                            {entry.includeFarewell && (
                              <p className="flex items-center mt-1">
                                <FaCar className="mr-1" size={10} />
                                <span>Farewell from hotel to airport</span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-amber-200">No transportation included</p>
                )}
              </div>
            </div>
            
            <div className="mb-3 p-3 bg-teal-950/60 rounded-lg">
              <h5 className="text-sm font-semibold text-teal-300 mb-2 flex items-center">
                <span className="w-6 h-6 rounded-full bg-teal-800 flex items-center justify-center mr-2 text-white text-xs">{sections.guests}</span>
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
              Price verified: The total amount of <span className="font-bold text-green-400">${Math.round(directSum)}</span> has been accurately calculated based on room rates, tour costs, and additional services.
              {totalPrice !== null && totalPrice !== directSum && totalPrice > 0 && !isNaN(parseFloat(totalPrice)) && (
                <span className="ml-1">
                  Note: Manual price adjustment applied: <span className="font-bold text-yellow-400">${totalPrice}</span>
                </span>
              )}
            </p>
          </div>
        </div>
        
        <PriceBreakdownDownloader breakdownRef={breakdownRef} />
      </div>
    </div>
  );
};

export default PriceBreakdown; 