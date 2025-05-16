import { calculateDuration, getRoomTypeInArabic, getCityNameInArabic } from './pricingUtils';

// RTL mark to ensure proper right-to-left display
const RLM = '\u200F';

// Function to convert numeric stars to Arabic text
const getStarsInArabic = (stars) => {
  const starsNum = parseInt(stars);
  if (starsNum === 3) return "ثلاث نجوم";
  if (starsNum === 4) return "أربع نجوم";
  if (starsNum === 5) return "خمس نجوم";
  return `${stars} نجوم`;
};

const arabicDayOrdinals = [
  'الاول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 
  'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
  'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر'
];

export const generateBookingMessage = ({
  hotelEntries,
  selectedCity,
  startDate,
  endDate,
  numGuests,
  includeChildren,
  childrenUnder3,
  children3to6,
  children6to12,
  tripPrice,
  calculatedPrice,
  includeReception,
  includeFarewell,
  transportVehicleType,
  selectedTours,
  tours,
  getAirportArabicName
}) => {
  const totalNights = calculateDuration(startDate, endDate);
  const finalPrice = tripPrice || calculatedPrice;

  const dateOptions = {
    day: 'numeric', 
    month: 'numeric',
    numberingSystem: 'latn' 
  };
  
  const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', dateOptions);
  const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', dateOptions);

  // Generate transportation text - only for first and last hotel
  let transportationText = '';
  
  if (hotelEntries.length > 0) {
    // For reception, use the first hotel
    const firstHotel = hotelEntries[0].hotelData;
    // For farewell, use the last hotel
    const lastHotel = hotelEntries[hotelEntries.length - 1].hotelData;
    
    // Set the airport name and handle transportation
    const airportName = getAirportArabicName(firstHotel.airport || 'المطار');
    
    // Handle receptions with first hotel
    let receptionText = '';
    if (includeReception && firstHotel) {
      if (firstHotel.airportTransportation && firstHotel.airportTransportation.length > 0) {
        const selectedAirportObj = firstHotel.airportTransportation.find(
          item => item.airport === firstHotel.airport
        );
        
        const airportObj = selectedAirportObj || firstHotel.airportTransportation[0];
        
        if (airportObj && (
          (transportVehicleType === 'Vito' && airportObj.transportation.vitoReceptionPrice > 0) ||
          (transportVehicleType === 'Sprinter' && airportObj.transportation.sprinterReceptionPrice > 0)
        )) {
          const vehicleCapacityText = transportVehicleType === 'Vito' ? '(2-8 أشخاص)' : '(9-16 شخص)';
          receptionText = `${RLM}الاستقبال من ${airportName} بسيارة ${transportVehicleType} خاصة ${vehicleCapacityText}`;
        }
      } else if (firstHotel.transportation && (
        (transportVehicleType === 'Vito' && firstHotel.transportation.vitoReceptionPrice > 0) ||
        (transportVehicleType === 'Sprinter' && firstHotel.transportation.sprinterReceptionPrice > 0)
      )) {
        const vehicleCapacityText = transportVehicleType === 'Vito' ? '(2-8 أشخاص)' : '(9-16 شخص)';
        receptionText = `${RLM}الاستقبال من ${airportName} بسيارة ${transportVehicleType} خاصة ${vehicleCapacityText}`;
      }
    }
    
    // Handle farewell with last hotel
    let farewellText = '';
    if (includeFarewell && lastHotel) {
      if (lastHotel.airportTransportation && lastHotel.airportTransportation.length > 0) {
        const selectedAirportObj = lastHotel.airportTransportation.find(
          item => item.airport === lastHotel.airport
        );
        
        const airportObj = selectedAirportObj || lastHotel.airportTransportation[0];
        
        if (airportObj && (
          (transportVehicleType === 'Vito' && airportObj.transportation.vitoFarewellPrice > 0) ||
          (transportVehicleType === 'Sprinter' && airportObj.transportation.sprinterFarewellPrice > 0)
        )) {
          const vehicleCapacityText = transportVehicleType === 'Vito' ? '(2-8 أشخاص)' : '(9-16 شخص)';
          farewellText = `${RLM}التوديع إلى ${airportName} بسيارة ${transportVehicleType} خاصة ${vehicleCapacityText}`;
        }
      } else if (lastHotel.transportation && (
        (transportVehicleType === 'Vito' && lastHotel.transportation.vitoFarewellPrice > 0) ||
        (transportVehicleType === 'Sprinter' && lastHotel.transportation.sprinterFarewellPrice > 0)
      )) {
        const vehicleCapacityText = transportVehicleType === 'Vito' ? '(2-8 أشخاص)' : '(9-16 شخص)';
        farewellText = `${RLM}التوديع إلى ${airportName} بسيارة ${transportVehicleType} خاصة ${vehicleCapacityText}`;
      }
    }
    
    // Combine reception and farewell text
    if (receptionText && farewellText) {
      transportationText = `${RLM}${receptionText.substring(2)} و${farewellText.substring(2)}`;
    } else if (receptionText) {
      transportationText = receptionText;
    } else if (farewellText) {
      transportationText = farewellText;
    }
  }

  // Generate hotel information for each hotel
  let hotelInfoText = '';
  
  hotelEntries.forEach((entry, index) => {
    const hotelData = entry.hotelData;
    const hotelCheckIn = new Date(entry.checkIn).toLocaleDateString('en-US', dateOptions);
    const hotelCheckOut = new Date(entry.checkOut).toLocaleDateString('en-US', dateOptions);
    const hotelNights = calculateDuration(entry.checkIn, entry.checkOut);
    
    let roomTypeInfo = "";
    
    if (hotelData.roomTypes && hotelData.roomTypes.length > 0) {
      const roomDetailsList = [];
      
      if (entry.roomAllocations.length > 0) {
        // Group similar room types together
        const roomTypeCounts = {};
        
        entry.roomAllocations.forEach(room => {
          if (room.roomTypeIndex !== undefined && room.roomTypeIndex !== "" && 
              hotelData.roomTypes[room.roomTypeIndex]) {
              const roomType = hotelData.roomTypes[room.roomTypeIndex].type;
              
              if (!roomTypeCounts[roomType]) {
                roomTypeCounts[roomType] = {
                  count: 0,
                  adults: 0,
                  childrenUnder3: 0,
                  children3to6: 0,
                  children6to12: 0
                };
              }
              
              roomTypeCounts[roomType].count += 1;
              roomTypeCounts[roomType].adults += room.occupants;
              roomTypeCounts[roomType].childrenUnder3 += (room.childrenUnder3 || 0);
              roomTypeCounts[roomType].children3to6 += (room.children3to6 || 0);
              roomTypeCounts[roomType].children6to12 += (room.children6to12 || 0);
          }
        });
        
        // Format room type information with occupant details
        Object.entries(roomTypeCounts).forEach(([type, details]) => {
          let detailString = `${details.count} ${getRoomTypeInArabic(type)}`;
          
          roomDetailsList.push(detailString);
        });
        
        roomTypeInfo = roomDetailsList.join(' و ');
      } else {
        const defaultRoomType = hotelData.roomTypes[0].type;
        roomTypeInfo = `${Math.ceil(numGuests / 2)} ${getRoomTypeInArabic(defaultRoomType)}`;
      }
    } else if (hotelData.roomType) {
      // Fallback for old data structure
      roomTypeInfo = `${numGuests} ${getRoomTypeInArabic(hotelData.roomType)}`;
    }
    
    // Add hotel info to the text
    hotelInfoText += `${RLM}${index > 0 ? '\n' : ''}- الفندق ${index + 1}:
${RLM}الاقامة في ${getCityNameInArabic(hotelData.city)} في فندق ${hotelData.name} ${getStarsInArabic(hotelData.stars)} (${hotelCheckIn} - ${hotelCheckOut}) لمدة ${hotelNights} ليالي ضمن ${roomTypeInfo} ${entry.includeBreakfast && hotelData.breakfastIncluded ? 'شامل الافطار' : 'بدون افطار'}
${hotelData.description ? `${RLM}${hotelData.description}` : ''}
`;
  });

  // Generate guests information with children details
  let guestsInfo = `${RLM}${numGuests} بالغ`;
  
  // Calculate total people for the hotel section
  const infantsCount = parseInt(childrenUnder3) || 0;
  const children3to6Count = parseInt(children3to6) || 0;
  const children6to12Count = parseInt(children6to12) || 0;
  const totalChildren = includeChildren ? (infantsCount + children3to6Count + children6to12Count) : 0;
  
  if (includeChildren) {
    if (totalChildren > 0) {
      guestsInfo += ` و ${totalChildren} ${totalChildren === 1 ? 'طفل' : 'أطفال'}`;
      
      // Add details about each age group
      let childrenDetails = [];
      if (infantsCount > 0) {
        childrenDetails.push(`${RLM}${infantsCount} ${infantsCount === 1 ? 'طفل' : 'أطفال'} تحت 3 سنوات (مجاناً للجولات)`);
      }
      if (children3to6Count > 0) {
        childrenDetails.push(`${RLM}${children3to6Count} ${children3to6Count === 1 ? 'طفل' : 'أطفال'} 3-6 سنوات (مجاناً للفندق)`);
      }
      if (children6to12Count > 0) {
        childrenDetails.push(`${RLM}${children6to12Count} ${children6to12Count === 1 ? 'طفل' : 'أطفال'} 6-12 سنة (سعر خاص)`);
      }
      
      if (childrenDetails.length > 0) {
        guestsInfo += `\n${childrenDetails.join('\n')}`;
      }
    }
  }

  const orderedTourData = selectedTours.map(tourId => 
    tours.find(tour => tour._id === tourId)
  ).filter(Boolean);

  const itinerary = `${RLM}🇹🇷 بكج ${getCityNameInArabic(selectedCity)} 🇹🇷
${RLM}تاريخ من ${formattedStartDate} لغاية ${formattedEndDate} 🗓
${RLM}المدة ${totalNights} ليالي ⏰
${guestsInfo}
${RLM}سعر البكج ${finalPrice}$ 💵

${RLM}يشمل:

${transportationText ? `${transportationText}\n` : ''}

${hotelInfoText}

${RLM}-عدد الجولات: ${orderedTourData.length}

${orderedTourData.length > 0 ? `${RLM}-تفاصيل الجولات:` : ''}
${orderedTourData.map((tour, index) => {
  // Create VIP car capacity text with null checks
  let vipCarInfo = '';
  if (tour.tourType === 'VIP') {
    const minCapacity = tour.carCapacity?.min || '?';
    const maxCapacity = tour.carCapacity?.max || '?';
    vipCarInfo = `${RLM}جولة VIP خاصة مع سيارة ${tour.vipCarType} (${minCapacity}-${maxCapacity} أشخاص)`;
  }

  return `${RLM}اليوم ${arabicDayOrdinals[index]}:
${RLM}${tour.name} 
${RLM}${tour.description}
${vipCarInfo}

${tour.detailedDescription ? `${RLM}${tour.detailedDescription}` : ''}
${tour.highlights && tour.highlights.length > 0 ? tour.highlights.map(highlight => `${RLM}• ${highlight}`).join('\n') : ''}`;
}).join('\n\n')}`;

  return itinerary;
}; 