export const safeParseInt = (value) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const getMonthName = (date) => {
  if (!date) return null;
  
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const dateObj = new Date(date);
  return months[dateObj.getMonth()];
};

export const getRoomPriceForMonth = (roomType, date, isChild = false) => {
  if (!roomType || !date) {
    return isChild ? roomType.childrenPricePerNight : roomType.pricePerNight;
  }
  
  const monthName = getMonthName(date);
  if (roomType.monthlyPrices && 
      roomType.monthlyPrices[monthName] && 
      roomType.monthlyPrices[monthName][isChild ? 'child' : 'adult'] > 0) {
    return roomType.monthlyPrices[monthName][isChild ? 'child' : 'adult'];
  }

  return isChild ? roomType.childrenPricePerNight : roomType.pricePerNight;
};

export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const calculateNightsPerMonth = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Ensure start date is before end date
  if (start > end) return [];
  
  const result = [];
  let currentDate = new Date(start);
  
  while (currentDate < end) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthKey = `${year}-${month}`;
    
    const existingEntry = result.find(entry => entry.monthKey === monthKey);
    
    if (existingEntry) {
      existingEntry.nights += 1;
    } else {
      result.push({
        monthKey,
        month,
        year,
        date: new Date(currentDate),
        nights: 1
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
};

export const calculateTotalPrice = ({
  startDate,
  endDate,
  numGuests,
  includeChildren,
  childrenUnder3,
  children3to6,
  children6to12,
  selectedHotelData,
  roomAllocations,
  selectedTours,
  tours,
  includeBreakfast,
  includeReception,
  includeFarewell,
  transportVehicleType,
  selectedAirport,
}) => {
  try {
    let total = 0;
    let hotelCost = 0;
    let transportationCost = 0;
    let tourCost = 0;
    let breakfastCost = 0;
    
    const nights = calculateDuration(startDate, endDate);
    const nightsPerMonth = calculateNightsPerMonth(startDate, endDate);

    const adultCount = safeParseInt(numGuests);
    const children3to6Count = safeParseInt(children3to6);
    const children6to12Count = safeParseInt(children6to12);
    const infantsCount = safeParseInt(childrenUnder3);
    
    const totalChildrenCount = includeChildren ? (children3to6Count + children6to12Count + infantsCount) : 0;
    const totalPeopleCount = adultCount + totalChildrenCount;

    // Hotel costs
    if (selectedHotelData) {
      if (selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0) {
        if (roomAllocations.length > 0) {
          roomAllocations.forEach(room => {
            if (room.roomTypeIndex !== undefined && room.roomTypeIndex !== "" && 
                selectedHotelData.roomTypes[room.roomTypeIndex]) {
                const roomType = selectedHotelData.roomTypes[room.roomTypeIndex];
                
                // Calculate cost per month for multi-month stays
                let roomCost = 0;
                
                if (nightsPerMonth.length > 1) {
                  // If stay spans multiple months, calculate for each month separately
                  nightsPerMonth.forEach(monthData => {
                    const adultPricePerNight = getRoomPriceForMonth(roomType, monthData.date, false);
                    const childPricePerNight = getRoomPriceForMonth(roomType, monthData.date, true);
                    
                    roomCost += adultPricePerNight * monthData.nights;
                    
                    if (includeChildren && childPricePerNight) {
                      // Use the specific count of children 6-12 in this room
                      const roomChildren6to12Count = room.children6to12 || 0;
                      if (roomChildren6to12Count > 0) {
                        roomCost += childPricePerNight * monthData.nights * roomChildren6to12Count;
                      }
                    }
                  });
                } else {
                  // Single month stay (original calculation)
                  const adultPricePerNight = getRoomPriceForMonth(roomType, startDate, false);
                  const childPricePerNight = getRoomPriceForMonth(roomType, startDate, true);
                  roomCost = adultPricePerNight * nights;
                  
                  if (includeChildren && childPricePerNight) {
                    // Use the specific count of children 6-12 in this room
                    const roomChildren6to12Count = room.children6to12 || 0;
                    if (roomChildren6to12Count > 0) {
                      roomCost += childPricePerNight * nights * roomChildren6to12Count;
                    }
                  }
                }
                
                hotelCost += roomCost;
            }
          });
        } else {
          // If no room allocations, estimate based on first room type
          const baseRoomCount = Math.ceil(adultCount / 2); // Estimate 2 adults per room
          const firstRoomType = selectedHotelData.roomTypes[0];
          
          // Calculate cost per month for multi-month stays
          if (nightsPerMonth.length > 1) {
            // If stay spans multiple months, calculate for each month separately
            nightsPerMonth.forEach(monthData => {
              const adultPricePerNight = getRoomPriceForMonth(firstRoomType, monthData.date, false);
              const childPricePerNight = getRoomPriceForMonth(firstRoomType, monthData.date, true);
              
              hotelCost += adultPricePerNight * monthData.nights * baseRoomCount;
              
              // Add children 6-12 price if applicable
              if (includeChildren && children6to12Count > 0 && childPricePerNight) {
                hotelCost += childPricePerNight * monthData.nights * children6to12Count;
              }
            });
          } else {
            // Single month stay (original calculation)
            const adultPricePerNight = getRoomPriceForMonth(firstRoomType, startDate, false);
            const childPricePerNight = getRoomPriceForMonth(firstRoomType, startDate, true);
            
            hotelCost += adultPricePerNight * nights * baseRoomCount;
            
            // Add children 6-12 price if applicable
            if (includeChildren && children6to12Count > 0 && childPricePerNight) {
              hotelCost += childPricePerNight * nights * children6to12Count;
            }
          }
        }
      } else if (selectedHotelData.pricePerNightPerPerson) {
        // Legacy pricing model - use per-person rates for older hotel data
        hotelCost += selectedHotelData.pricePerNightPerPerson * nights * adultCount;
        
        // Children 6-12 pay with a special rate (if defined) or half price by default
        if (includeChildren && children6to12Count > 0) {
            const childRate = selectedHotelData.childrenPrice || (selectedHotelData.pricePerNightPerPerson * 0.5);
            hotelCost += childRate * nights * children6to12Count;
        }
      }
    }
    
    total += hotelCost;

    // Breakfast costs
    if (includeBreakfast && selectedHotelData && selectedHotelData.breakfastIncluded && selectedHotelData.breakfastPrice) {
      // Calculate breakfast per room per night instead of per person
      const totalRooms = roomAllocations.length > 0 ? roomAllocations.length : Math.ceil(adultCount / 2);
      breakfastCost = selectedHotelData.breakfastPrice * totalRooms * nights;
      
      console.log('Breakfast cost calculation:', {
        breakfastPrice: selectedHotelData.breakfastPrice,
        totalRooms,
        nights,
        breakfastCost,
        roomAllocations: roomAllocations.length
      });
      
      total += breakfastCost;
    }

    // Transportation costs
    if (selectedHotelData) {
      let receptionCost = 0;
      let farewellCost = 0;
      
      // If hotel has the new airportTransportation structure
      if (selectedHotelData.airportTransportation && selectedHotelData.airportTransportation.length > 0) {
        // Find the selected airport's transportation costs based on the airport value set in selectedHotelData
        const selectedAirportObj = selectedHotelData.airportTransportation.find(
          item => item.airport === (selectedAirport || selectedHotelData.airport)
        );
        
        // If no specific airport is selected, use the first available airport
        const airportTransport = selectedAirportObj || selectedHotelData.airportTransportation[0];
        
        console.log('Selected airport for transportation:', selectedAirport || selectedHotelData.airport || airportTransport?.airport);
        
        if (airportTransport) {
          if (includeReception) {
            if (transportVehicleType === 'Vito' && airportTransport.transportation.vitoReceptionPrice) {
              receptionCost = parseFloat(airportTransport.transportation.vitoReceptionPrice);
            } else if (transportVehicleType === 'Sprinter' && airportTransport.transportation.sprinterReceptionPrice) {
              receptionCost = parseFloat(airportTransport.transportation.sprinterReceptionPrice);
            }
          }
          
          if (includeFarewell) {
            if (transportVehicleType === 'Vito' && airportTransport.transportation.vitoFarewellPrice) {
              farewellCost = parseFloat(airportTransport.transportation.vitoFarewellPrice);
            } else if (transportVehicleType === 'Sprinter' && airportTransport.transportation.sprinterFarewellPrice) {
              farewellCost = parseFloat(airportTransport.transportation.sprinterFarewellPrice);
            }
          }
        }
        
        transportationCost = receptionCost + farewellCost;
      } 
      // If hotel has the old transportation structure
      else if (selectedHotelData.transportation) {
        if (includeReception) {
          if (transportVehicleType === 'Vito' && selectedHotelData.transportation.vitoReceptionPrice) {
            receptionCost = parseFloat(selectedHotelData.transportation.vitoReceptionPrice);
          } else if (transportVehicleType === 'Sprinter' && selectedHotelData.transportation.sprinterReceptionPrice) {
            receptionCost = parseFloat(selectedHotelData.transportation.sprinterReceptionPrice);
          }
        }
        
        if (includeFarewell) {
          if (transportVehicleType === 'Vito' && selectedHotelData.transportation.vitoFarewellPrice) {
            farewellCost = parseFloat(selectedHotelData.transportation.vitoFarewellPrice);
          } else if (transportVehicleType === 'Sprinter' && selectedHotelData.transportation.sprinterFarewellPrice) {
            farewellCost = parseFloat(selectedHotelData.transportation.sprinterFarewellPrice);
          }
        }
        
        transportationCost = receptionCost + farewellCost;
      } 
      // Backward compatibility with very old data structure
      else if (selectedHotelData.transportationPrice) {
        // For older hotels with per-person pricing
        const transportPeopleCount = adultCount + (includeChildren ? totalChildrenCount : 0);
        
        if (includeReception && includeFarewell) {
          transportationCost = selectedHotelData.transportationPrice * transportPeopleCount;
        } else if (includeReception || includeFarewell) {
          // Only charge half price for one-way transfers
          transportationCost = (selectedHotelData.transportationPrice * transportPeopleCount) / 2;
        }
      }
      
      console.log('Transportation cost calculation:', {
        transportVehicleType,
        receptionCost,
        farewellCost, 
        includeReception,
        includeFarewell,
        transportationCost
      });
      
      total += transportationCost;
    }

    // Tour costs
    if (selectedTours.length > 0 && tours.length > 0) {
      selectedTours.forEach(tourId => {
        const tourData = tours.find(tour => tour._id === tourId);
        if (tourData) {
          // For Group tours: Adults and children 3-12 pay per person
          // For VIP tours: One price per car regardless of the number of people
          if (tourData.tourType === 'Group') {
            // Adults pay full price
            const adultTourCost = tourData.price * adultCount;
            
            // Children 3-12 pay full price for tours
            const children3to12Count = children3to6Count + children6to12Count;
            const children3to12Cost = includeChildren ? tourData.price * children3to12Count : 0;
            
            // Children under 3 are free for tours
            const tourSubtotal = adultTourCost + children3to12Cost;
            
            console.log(`Group tour cost calculation for "${tourData.name || 'Unnamed Tour'}":`, {
              adultCount,
              adultTourCost,
              children3to12Count,
              children3to12Cost,
              tourSubtotal,
              tourPrice: tourData.price
            });
            
            tourCost += tourSubtotal;
          } else if (tourData.tourType === 'VIP') {
            // VIP tours have a single price per car
            const vipCost = parseFloat(tourData.price);
            console.log(`VIP tour cost for "${tourData.name || 'Unnamed Tour'}":`, vipCost);
            tourCost += vipCost;
          }
        }
      });
      
      total += tourCost;
    }

    // Log the breakdown for debugging
    console.log('Price breakdown:', {
      hotelCost,
      breakfastCost,
      transportationCost,
      tourCost,
      total,
      nights,
      adultCount,
      children3to6Count,
      children6to12Count,
      infantsCount,
      totalPeopleCount
    });

    return total;
  } catch (error) {
    console.error('Error calculating price:', error);
    return 0;
  }
};

export const getRoomTypeInArabic = (roomType) => {
  const roomTypeMap = {
    "SINGLE ROOM": "غرفة مفردة",
    "DOUBLE ROOM": "غرفة مزدوجة",
    "TRIPLE ROOM": "غرفة ثلاثية",
    "FAMILY SUITE": "جناح عائلي"
  };
  
  return roomTypeMap[roomType] || roomType;
};

export const getCityNameInArabic = (cityName) => {
  const cityMap = {
    'Istanbul': 'اسطنبول',
    'Trabzon': 'طرابزون',
    'Uzungol': 'أوزنجول',
    'Antalya': 'أنطاليا',
    'Bodrum': 'بودروم',
    'Bursa': 'بورصة',
    'Cappadocia': 'كابادوكيا',
    'Fethiye': 'فتحية',
    'Izmir': 'إزمير',
    'Konya': 'قونيا',
    'Marmaris': 'مرمريس',
    'Pamukkale': 'باموكالي'
  };
  return cityMap[cityName] || cityName;
}; 