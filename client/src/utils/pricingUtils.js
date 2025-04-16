// Helper function to safely parse integers
export const safeParseInt = (value) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
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
  includeTransfer,
  selectedTours,
  tours,
  includeBreakfast,
}) => {
  try {
    let total = 0;
    let hotelCost = 0;
    let transportationCost = 0;
    let tourCost = 0;
    let breakfastCost = 0;
    
    const nights = calculateDuration(startDate, endDate);
    
    // Parse all inputs to ensure we're working with numbers
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
                // Base price for the room
                let roomCost = roomType.pricePerNight * nights;
                
                // Add children 6-12 price if applicable
                if (includeChildren && roomType.childrenPricePerNight) {
                    // Use the specific count of children 6-12 in this room
                    const roomChildren6to12Count = room.children6to12 || 0;
                    if (roomChildren6to12Count > 0) {
                        roomCost += roomType.childrenPricePerNight * nights * roomChildren6to12Count;
                    }
                }
                
                hotelCost += roomCost;
            }
          });
        } else {
          // If no room allocations, estimate based on first room type
          const baseRoomCount = Math.ceil(adultCount / 2); // Estimate 2 adults per room
          hotelCost += selectedHotelData.roomTypes[0].pricePerNight * nights * baseRoomCount;
          
          // Add children 6-12 price if applicable
          if (includeChildren && children6to12Count > 0 && selectedHotelData.roomTypes[0].childrenPricePerNight) {
              hotelCost += selectedHotelData.roomTypes[0].childrenPricePerNight * nights * children6to12Count;
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
      // Children under 3 and children 3-6 typically don't pay for breakfast
      // Only adults and children 6-12 pay for breakfast
      const breakfastPeopleCount = adultCount + (includeChildren ? (children6to12Count) : 0);
      breakfastCost = selectedHotelData.breakfastPrice * breakfastPeopleCount * nights;
      
      console.log('Breakfast cost calculation:', {
        breakfastPrice: selectedHotelData.breakfastPrice,
        adultCount,
        children3to6Count,
        children6to12Count,
        breakfastPeopleCount,
        nights,
        breakfastCost
      });
      
      total += breakfastCost;
    }

    // Transportation costs
    if (includeTransfer && selectedHotelData && selectedHotelData.transportationPrice) {
      // Fixed bug: Need to correctly count children in transportation cost
      // For children, we're checking if they're actually included before adding them to the count
      const transportPeopleCount = adultCount + (includeChildren ? totalChildrenCount : 0);
      transportationCost = selectedHotelData.transportationPrice * transportPeopleCount;
      
      console.log('Transportation cost calculation:', {
        transportationPrice: selectedHotelData.transportationPrice,
        adultCount,
        infantsCount,
        children3to6Count,
        children6to12Count, 
        totalChildrenCount,
        includeChildren,
        transportPeopleCount,
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
            tourCost += adultTourCost + children3to12Cost;
          } else if (tourData.tourType === 'VIP') {
            // VIP tours have a single price per car
            tourCost += parseFloat(tourData.price);
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