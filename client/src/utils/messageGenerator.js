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

// Add city name translations
const cityTranslations = {
  'Antalya': 'انطاليا',
  'Bodrum': 'بودروم',
  'Bursa': 'بورصة',
  'Cappadocia': 'كابادوكيا',
  'Fethiye': 'فتحية',
  'Istanbul': 'اسطنبول',
  'Trabzon': 'طرابزون'
};

export const generateBookingMessage = ({
  hotelEntries,
  selectedCities,
  startDate,
  endDate,
  numGuests,
  includeChildren,
  childrenUnder3,
  children3to6,
  children6to12,
  tripPrice,
  calculatedPrice,
  selectedTours,
  tours,
  getAirportArabicName
}) => {
  const totalNights = calculateDuration(startDate, endDate);
  const finalPrice = tripPrice || calculatedPrice;

  // Format cities for Arabic message
  const formattedCities = selectedCities
    .map(city => cityTranslations[city] || city)
    .join(' و ');

  // Helper function to format date as dd/mm/yyyy
  const formatDateDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const formattedStartDate = formatDateDDMMYYYY(startDate);
  const formattedEndDate = formatDateDDMMYYYY(endDate);

  // Generate transportation text for each hotel with reception/farewell
  let transportationLines = [];
  
  hotelEntries.forEach((entry) => {
    const hotelData = entry.hotelData;
    if (!hotelData) return;
    
    // Check if this hotel has reception/farewell options enabled
    const includeReception = typeof entry.includeReception === 'boolean' ? entry.includeReception : false;
    const includeFarewell = typeof entry.includeFarewell === 'boolean' ? entry.includeFarewell : false;
    const transportVehicleType = entry.transportVehicleType || 'Vito'; // Default to Vito if not specified
    
    // Handle reception for this hotel
    if (includeReception) {
      // Use hotel-specific airport
      const airportName = getAirportArabicName(entry.selectedAirport || hotelData.airport || 'المطار');
      
      if (hotelData.airportTransportation && hotelData.airportTransportation.length > 0) {
        const selectedAirportObj = hotelData.airportTransportation.find(
          item => item.airport === entry.selectedAirport || hotelData.airport
        );
        
        const airportObj = selectedAirportObj || hotelData.airportTransportation[0];
        
        if (airportObj && (
          (transportVehicleType === 'Vito' && airportObj.transportation.vitoReceptionPrice > 0) ||
          (transportVehicleType === 'Sprinter' && airportObj.transportation.sprinterReceptionPrice > 0) ||
          (transportVehicleType === 'Bus' && airportObj.transportation.busReceptionPrice > 0)
        )) {
          const vehicleText = transportVehicleType === 'Bus' ? `${transportVehicleType} خاص` : `بسيارة ${transportVehicleType} خاصة`;
          transportationLines.push(`${RLM}الاستقبال من ${airportName} ${vehicleText}`);
        }
      } else if (hotelData.transportation && (
        (transportVehicleType === 'Vito' && hotelData.transportation.vitoReceptionPrice > 0) ||
        (transportVehicleType === 'Sprinter' && hotelData.transportation.sprinterReceptionPrice > 0) ||
        (transportVehicleType === 'Bus' && hotelData.transportation.busReceptionPrice > 0)
      )) {
        const vehicleText = transportVehicleType === 'Bus' ? `${transportVehicleType} خاص` : `بسيارة ${transportVehicleType} خاصة`;
        transportationLines.push(`${RLM}الاستقبال من ${airportName} ${vehicleText}`);
      }
    }
    
    // Handle farewell for this hotel
    if (includeFarewell) {
      // Use hotel-specific airport
      const airportName = getAirportArabicName(entry.selectedAirport || hotelData.airport || 'المطار');
      
      if (hotelData.airportTransportation && hotelData.airportTransportation.length > 0) {
        const selectedAirportObj = hotelData.airportTransportation.find(
          item => item.airport === entry.selectedAirport || hotelData.airport
        );
        
        const airportObj = selectedAirportObj || hotelData.airportTransportation[0];
        
        if (airportObj && (
          (transportVehicleType === 'Vito' && airportObj.transportation.vitoFarewellPrice > 0) ||
          (transportVehicleType === 'Sprinter' && airportObj.transportation.sprinterFarewellPrice > 0) ||
          (transportVehicleType === 'Bus' && airportObj.transportation.busFarewellPrice > 0)
        )) {
          const vehicleText = transportVehicleType === 'Bus' ? `${transportVehicleType} خاص` : `بسيارة ${transportVehicleType} خاصة`;
          transportationLines.push(`${RLM}التوديع إلى ${airportName} ${vehicleText}`);
        }
      } else if (hotelData.transportation && (
        (transportVehicleType === 'Vito' && hotelData.transportation.vitoFarewellPrice > 0) ||
        (transportVehicleType === 'Sprinter' && hotelData.transportation.sprinterFarewellPrice > 0) ||
        (transportVehicleType === 'Bus' && hotelData.transportation.busFarewellPrice > 0)
      )) {
        const vehicleText = transportVehicleType === 'Bus' ? `${transportVehicleType} خاص` : `بسيارة ${transportVehicleType} خاصة`;
        transportationLines.push(`${RLM}التوديع إلى ${airportName} ${vehicleText}`);
      }
    }
    
    // Special case: If both reception and farewell are at the same hotel with the same airport
    if (includeReception && includeFarewell && hotelData.airport === entry.selectedAirport) {
      const airportName = getAirportArabicName(entry.selectedAirport || hotelData.airport || 'المطار');
      
      // Remove the individual lines for this hotel and create a combined line
      transportationLines = transportationLines.filter(line => 
        !line.includes(`الاستقبال من ${airportName}`) && 
        !line.includes(`التوديع إلى ${airportName}`)
      );
      
      const vehicleText = transportVehicleType === 'Bus' ? `${transportVehicleType} خاص` : `بسيارة ${transportVehicleType} خاصة`;
      transportationLines.push(`${RLM}استقبال وتوديع من وإلى ${airportName} ${vehicleText}`);
    }
  });

  // Join transportation lines
  const transportationText = transportationLines.length > 0 
    ? transportationLines.map(line => `${RLM}• ${line.replace(RLM, '')}`).join('\n\n')
    : '';

  // Generate hotel information for each hotel
  let hotelInfoText = '';
  
  hotelEntries.forEach((entry, index) => {
    const hotelData = entry.hotelData;
    const hotelCheckIn = formatDateDDMMYYYY(entry.checkIn);
    const hotelCheckOut = formatDateDDMMYYYY(entry.checkOut);
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
    hotelInfoText += `${RLM}${index > 0 ? '\n\n' : ''}• الفندق ${index + 1}:
${RLM}(${hotelCheckIn} - ${hotelCheckOut})
${RLM}الاقامة في ${getCityNameInArabic(hotelData.city)} في فندق ${hotelData.name} ${getStarsInArabic(hotelData.stars)} لمدة ${hotelNights} ليالي ضمن ${roomTypeInfo} ${entry.includeBreakfast && hotelData.breakfastIncluded ? 'شامل الافطار' : 'بدون افطار'}
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

  const itinerary = `${RLM}🇹🇷 بكج ${formattedCities} 🇹🇷
${RLM}🗓 من ${formattedStartDate} لغاية ${formattedEndDate}
${RLM}⏰ المدة ${totalNights} ليالي
${guestsInfo}
${RLM}💵 سعر البكج ${finalPrice}$

${RLM}يشمل:

${transportationText ? `${transportationText}\n\n` : ''}
${hotelInfoText}

${RLM}• عدد الجولات: ${orderedTourData.length}

${orderedTourData.length > 0 ? `${RLM}• تفاصيل الجولات:\n` : ''}${orderedTourData.map((tour, index) => {
  // Create VIP car capacity text with null checks
  let vipCarInfo = '';
  if (tour.tourType === 'VIP') {
    vipCarInfo = `${RLM}جولة VIP خاصة مع سيارة ${tour.vipCarType}`;
  }

  return `${RLM}اليوم ${arabicDayOrdinals[index]}:
${RLM}${tour.name}${tour.description ? `\n${RLM}${tour.description}` : ''}${vipCarInfo ? `\n${vipCarInfo}` : ''}
${tour.detailedDescription ? `${RLM}${tour.detailedDescription}\n` : ''}${tour.highlights && tour.highlights.length > 0 ? tour.highlights.map(highlight => `${RLM}• ${highlight}`).join('\n') : ''}`;
}).join('\n\n')}`;

  return itinerary;
}; 