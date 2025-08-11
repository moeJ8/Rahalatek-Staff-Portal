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
            } else if (transportVehicleType === 'Bus' && airportTransport.transportation.busReceptionPrice) {
              receptionCost = parseFloat(airportTransport.transportation.busReceptionPrice);
            }
          }
          
          if (includeFarewell) {
            if (transportVehicleType === 'Vito' && airportTransport.transportation.vitoFarewellPrice) {
              farewellCost = parseFloat(airportTransport.transportation.vitoFarewellPrice);
            } else if (transportVehicleType === 'Sprinter' && airportTransport.transportation.sprinterFarewellPrice) {
              farewellCost = parseFloat(airportTransport.transportation.sprinterFarewellPrice);
            } else if (transportVehicleType === 'Bus' && airportTransport.transportation.busFarewellPrice) {
              farewellCost = parseFloat(airportTransport.transportation.busFarewellPrice);
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
          } else if (transportVehicleType === 'Bus' && selectedHotelData.transportation.busReceptionPrice) {
            receptionCost = parseFloat(selectedHotelData.transportation.busReceptionPrice);
          }
        }
        
        if (includeFarewell) {
          if (transportVehicleType === 'Vito' && selectedHotelData.transportation.vitoFarewellPrice) {
            farewellCost = parseFloat(selectedHotelData.transportation.vitoFarewellPrice);
          } else if (transportVehicleType === 'Sprinter' && selectedHotelData.transportation.sprinterFarewellPrice) {
            farewellCost = parseFloat(selectedHotelData.transportation.sprinterFarewellPrice);
          } else if (transportVehicleType === 'Bus' && selectedHotelData.transportation.busFarewellPrice) {
            farewellCost = parseFloat(selectedHotelData.transportation.busFarewellPrice);
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
          if (tourData.tourType === 'VIP') {
            // VIP tours have a single price per car
            const vipCost = parseFloat(tourData.price);
            console.log(`VIP tour cost for "${tourData.name || 'Unnamed Tour'}":`, vipCost);
            tourCost += vipCost;
          } else {
            // Group tours: per person pricing
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
    "SINGLE ROOM": "غرفة فردية",
    "DOUBLE ROOM": "غرفة ثنائية",
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

export const calculateMultiHotelTotalPrice = ({
  hotelEntries,
  numGuests,
  includeChildren,
  childrenUnder3,
  children3to6,
  children6to12,
  selectedTours,
  tours,
  selectedAirport, // Keep for backwards compatibility
}) => {
  try {
    let total = 0;
    let hotelCosts = [];
    let transportationCost = 0;
    let tourCost = 0;
    
    const adultCount = safeParseInt(numGuests);
    const children3to6Count = safeParseInt(children3to6);
    const children6to12Count = safeParseInt(children6to12);
    const infantsCount = safeParseInt(childrenUnder3);
    
    const totalChildrenCount = includeChildren ? (children3to6Count + children6to12Count + infantsCount) : 0;
    const totalPeopleCount = adultCount + totalChildrenCount;

    // Calculate costs for each hotel separately
    hotelEntries.forEach((entry, index) => {
      if (!entry.hotelData || !entry.checkIn || !entry.checkOut) {
        return;
      }
      
      const isFirstHotel = index === 0;
      const isLastHotel = index === hotelEntries.length - 1;
      let hotelCost = 0;
      let breakfastCost = 0;
      let hotelTransportCost = 0;
      
      const nights = calculateDuration(entry.checkIn, entry.checkOut);
      const nightsPerMonth = calculateNightsPerMonth(entry.checkIn, entry.checkOut);
      
      // Hotel costs
      if (entry.hotelData.roomTypes && entry.hotelData.roomTypes.length > 0) {
        if (entry.roomAllocations.length > 0) {
          entry.roomAllocations.forEach(room => {
            if (room.roomTypeIndex !== undefined && room.roomTypeIndex !== "" && 
                entry.hotelData.roomTypes[room.roomTypeIndex]) {
                const roomType = entry.hotelData.roomTypes[room.roomTypeIndex];
                
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
                  const adultPricePerNight = getRoomPriceForMonth(roomType, entry.checkIn, false);
                  const childPricePerNight = getRoomPriceForMonth(roomType, entry.checkIn, true);
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
          const firstRoomType = entry.hotelData.roomTypes[0];
          
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
            const adultPricePerNight = getRoomPriceForMonth(firstRoomType, entry.checkIn, false);
            const childPricePerNight = getRoomPriceForMonth(firstRoomType, entry.checkIn, true);
            
            hotelCost += adultPricePerNight * nights * baseRoomCount;
            
            // Add children 6-12 price if applicable
            if (includeChildren && children6to12Count > 0 && childPricePerNight) {
              hotelCost += childPricePerNight * nights * children6to12Count;
            }
          }
        }
      } else if (entry.hotelData.pricePerNightPerPerson) {
        // Legacy pricing model - use per-person rates for older hotel data
        hotelCost += entry.hotelData.pricePerNightPerPerson * nights * adultCount;
        
        // Children 6-12 pay with a special rate (if defined) or half price by default
        if (includeChildren && children6to12Count > 0) {
            const childRate = entry.hotelData.childrenPrice || (entry.hotelData.pricePerNightPerPerson * 0.5);
            hotelCost += childRate * nights * children6to12Count;
        }
      }
      
      // Breakfast costs for this hotel
      if (entry.includeBreakfast && entry.hotelData.breakfastIncluded && entry.hotelData.breakfastPrice) {
        // Calculate breakfast per room per night instead of per person
        const totalRooms = entry.roomAllocations.length > 0 ? entry.roomAllocations.length : Math.ceil(adultCount / 2);
        breakfastCost = entry.hotelData.breakfastPrice * totalRooms * nights;
        hotelCost += breakfastCost;
      }
      
      // Calculate transportation costs for this hotel - using hotel-specific settings
      const includeReception = typeof entry.includeReception === 'boolean' ? entry.includeReception : false;
      const includeFarewell = typeof entry.includeFarewell === 'boolean' ? entry.includeFarewell : false;
      const transportVehicleType = entry.transportVehicleType || 'Vito'; // Default to Vito if not specified
      
      if (includeReception) {
        // Airport Reception - from airport to this hotel
        let receptionCost = 0;
        
        // Use hotel-specific airport selection
        const hotelAirport = entry.selectedAirport || selectedAirport;
        
        // If hotel has the new airportTransportation structure
        if (entry.hotelData.airportTransportation && entry.hotelData.airportTransportation.length > 0) {
          // Find the selected airport's transportation costs
          const selectedAirportObj = entry.hotelData.airportTransportation.find(
            item => item.airport === hotelAirport
          );
          
          // If no specific airport is selected, use the first available airport
          const airportTransport = selectedAirportObj || entry.hotelData.airportTransportation[0];
          
          if (airportTransport) {
            if (transportVehicleType === 'Vito' && airportTransport.transportation.vitoReceptionPrice) {
              receptionCost = parseFloat(airportTransport.transportation.vitoReceptionPrice);
            } else if (transportVehicleType === 'Sprinter' && airportTransport.transportation.sprinterReceptionPrice) {
              receptionCost = parseFloat(airportTransport.transportation.sprinterReceptionPrice);
            } else if (transportVehicleType === 'Bus' && airportTransport.transportation.busReceptionPrice) {
              receptionCost = parseFloat(airportTransport.transportation.busReceptionPrice);
            }
          }
        } 
        // If hotel has the old transportation structure
        else if (entry.hotelData.transportation) {
          if (transportVehicleType === 'Vito' && entry.hotelData.transportation.vitoReceptionPrice) {
            receptionCost = parseFloat(entry.hotelData.transportation.vitoReceptionPrice);
          } else if (transportVehicleType === 'Sprinter' && entry.hotelData.transportation.sprinterReceptionPrice) {
            receptionCost = parseFloat(entry.hotelData.transportation.sprinterReceptionPrice);
          } else if (transportVehicleType === 'Bus' && entry.hotelData.transportation.busReceptionPrice) {
            receptionCost = parseFloat(entry.hotelData.transportation.busReceptionPrice);
          }
        }
        // Backward compatibility with very old data structure
        else if (entry.hotelData.transportationPrice) {
          // For older hotels with per-person pricing
          const transportPeopleCount = adultCount + (includeChildren ? totalChildrenCount : 0);
          // Only charge half price for one-way transfers
          receptionCost = (entry.hotelData.transportationPrice * transportPeopleCount) / 2;
        }
        
        hotelTransportCost += receptionCost;
        transportationCost += receptionCost;
      }
      
      if (includeFarewell) {
        // Airport Farewell - from this hotel to airport
        let farewellCost = 0;
        
        // Use hotel-specific airport selection
        const hotelAirport = entry.selectedAirport || selectedAirport;
        
        // If hotel has the new airportTransportation structure
        if (entry.hotelData.airportTransportation && entry.hotelData.airportTransportation.length > 0) {
          // Find the selected airport's transportation costs
          const selectedAirportObj = entry.hotelData.airportTransportation.find(
            item => item.airport === hotelAirport
          );
          
          // If no specific airport is selected, use the first available airport
          const airportTransport = selectedAirportObj || entry.hotelData.airportTransportation[0];
          
          if (airportTransport) {
            if (transportVehicleType === 'Vito' && airportTransport.transportation.vitoFarewellPrice) {
              farewellCost = parseFloat(airportTransport.transportation.vitoFarewellPrice);
            } else if (transportVehicleType === 'Sprinter' && airportTransport.transportation.sprinterFarewellPrice) {
              farewellCost = parseFloat(airportTransport.transportation.sprinterFarewellPrice);
            } else if (transportVehicleType === 'Bus' && airportTransport.transportation.busFarewellPrice) {
              farewellCost = parseFloat(airportTransport.transportation.busFarewellPrice);
            }
          }
        } 
        // If hotel has the old transportation structure
        else if (entry.hotelData.transportation) {
          if (transportVehicleType === 'Vito' && entry.hotelData.transportation.vitoFarewellPrice) {
            farewellCost = parseFloat(entry.hotelData.transportation.vitoFarewellPrice);
          } else if (transportVehicleType === 'Sprinter' && entry.hotelData.transportation.sprinterFarewellPrice) {
            farewellCost = parseFloat(entry.hotelData.transportation.sprinterFarewellPrice);
          } else if (transportVehicleType === 'Bus' && entry.hotelData.transportation.busFarewellPrice) {
            farewellCost = parseFloat(entry.hotelData.transportation.busFarewellPrice);
          }
        }
        // Backward compatibility with very old data structure
        else if (entry.hotelData.transportationPrice) {
          // For older hotels with per-person pricing
          const transportPeopleCount = adultCount + (includeChildren ? totalChildrenCount : 0);
          // Only charge half price for one-way transfers
          farewellCost = (entry.hotelData.transportationPrice * transportPeopleCount) / 2;
        }
        
        hotelTransportCost += farewellCost;
        transportationCost += farewellCost;
      }
      
      // Add hotel costs to hotelCosts array
      hotelCosts.push({
        hotel: entry.hotelData.name,
        roomCost: hotelCost - breakfastCost,
        breakfastCost,
        transportCost: hotelTransportCost, // Now attaching transport cost to specific hotels
        totalCost: hotelCost, // Don't include transport in hotel total
        includeReception,
        includeFarewell,
        transportVehicleType
      });
      
      // Add hotel cost to total
      total += hotelCost; // Remove hotelTransportCost from here to avoid double-counting
    });
    
    // Calculate tour costs
    if (selectedTours && selectedTours.length > 0 && tours && tours.length > 0) {
      selectedTours.forEach(tourId => {
        const tourData = tours.find(tour => tour._id === tourId);
        if (tourData) {
          // Check if this is a VIP tour (fixed price) or Group tour (per person)
          if (tourData.tourType === 'VIP') {
            // VIP tours have a fixed price per car, regardless of number of people
            tourCost += parseFloat(tourData.price);
          } else {
            // Group tours - charge per person
            // Base cost for adults
            const baseTourCost = parseFloat(tourData.price) * adultCount;
            tourCost += baseTourCost;
            
            // Add cost for children (if applicable)
            // Typically children under 3 are free, 3-6 might have special rates
            if (includeChildren && children6to12Count > 0) {
              // Assuming children 6-12 pay the same as adults for tours (adjust if needed)
              tourCost += parseFloat(tourData.price) * children6to12Count;
            }
            
            // Add cost for children 3-6 if special pricing exists (usually free for tours)
            if (includeChildren && children3to6Count > 0 && tourData.childrenPrice) {
              tourCost += parseFloat(tourData.childrenPrice) * children3to6Count;
            }
          }
        }
      });
      total += tourCost;
    }
    
    // Add transportation costs to total
    total += transportationCost;
    
    return {
      total: Math.round(total * 100) / 100,
      breakdown: {
        hotels: hotelCosts,
        transportation: transportationCost,
        tours: tourCost,
      }
    };
  } catch (error) {
    console.error('Error calculating total price:', error);
    return {
      total: 0,
      breakdown: {
        hotels: [],
        transportation: 0,
        tours: 0
      }
    };
  }
}; 