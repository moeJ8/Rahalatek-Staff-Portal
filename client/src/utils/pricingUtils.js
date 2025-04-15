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
  includeVIP,
  vipCarPrice
}) => {
  try {
    let total = 0;
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
                if (includeChildren && children6to12Count > 0 && roomType.childrenPricePerNight) {
                    roomCost += roomType.childrenPricePerNight * nights * children6to12Count;
                }
                
                total += roomCost;
            }
          });
        } else {
          // If no room allocations, estimate based on first room type
          const baseRoomCount = Math.ceil(adultCount / 2); // Estimate 2 adults per room
          total += selectedHotelData.roomTypes[0].pricePerNight * nights * baseRoomCount;
          
          // Add children 6-12 price if applicable
          if (includeChildren && children6to12Count > 0 && selectedHotelData.roomTypes[0].childrenPricePerNight) {
              total += selectedHotelData.roomTypes[0].childrenPricePerNight * nights * children6to12Count;
          }
        }
      } else if (selectedHotelData.pricePerNightPerPerson) {
        // Legacy pricing model
        total += selectedHotelData.pricePerNightPerPerson * nights * adultCount;
        
        // Children 6-12 pay with a special rate (if defined) or half price by default
        if (includeChildren && children6to12Count > 0) {
            const childRate = selectedHotelData.childrenPrice || (selectedHotelData.pricePerNightPerPerson * 0.5);
            total += childRate * nights * children6to12Count;
        }
        
        // Children under 6 (childrenUnder3 and children3to6) are free for accommodation
      }
    }

    // Transportation costs
    if (includeTransfer && selectedHotelData.transportationPrice) {
      total += selectedHotelData.transportationPrice * totalPeopleCount;
    }

    // Tour costs
    if (selectedTours.length > 0 && tours.length > 0) {
      selectedTours.forEach(tourId => {
        const tourData = tours.find(tour => tour._id === tourId);
        if (tourData) {
          // Adults pay full price
          const adultTourCost = tourData.price * adultCount;
          
          // Children 3-12 pay full price for tours
          const children3to12Count = children3to6Count + children6to12Count;
          const children3to12Cost = includeChildren ? tourData.price * children3to12Count : 0;
          
          // Children under 3 are free for tours
          total += adultTourCost + children3to12Cost;
        }
      });
    }
    
    // Add VIP luxury car price if option is selected
    if (includeVIP && vipCarPrice) {
      const vipPrice = parseFloat(vipCarPrice);
      if (!isNaN(vipPrice)) {
        total += vipPrice;
      }
    }

    return total;
  } catch (err) {
    console.error('Error calculating total price:', err);
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