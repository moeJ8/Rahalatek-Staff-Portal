import { calculateDuration, getRoomTypeInArabic, getCityNameInArabic } from './pricingUtils';

// RTL mark to ensure proper right-to-left display
const RLM = '\u200F';

const arabicDayOrdinals = [
  'الاول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 
  'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
  'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر'
];

export const generateBookingMessage = ({
  selectedHotelData,
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
  includeTransfer,
  includeBreakfast,
  includeVIP,
  vipCarPrice,
  roomAllocations,
  selectedTours,
  tours,
  getAirportArabicName
}) => {
  const nights = calculateDuration(startDate, endDate);
  const finalPrice = tripPrice || calculatedPrice;

  const dateOptions = {
    day: 'numeric', 
    month: 'numeric',
    numberingSystem: 'latn' 
  };
  
  const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', dateOptions);
  const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', dateOptions);

  let airportName = 'المطار'; 
  
  if (selectedHotelData.airport && selectedHotelData.airport.trim() !== '') {
    airportName = getAirportArabicName(selectedHotelData.airport);
  }

  let roomTypeInfo = "";
  
  if (selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0) {
    const roomTypeCounts = {};
    
    if (roomAllocations.length > 0) {
      roomAllocations.forEach(room => {
        if (room.roomTypeIndex !== undefined && room.roomTypeIndex !== "" && 
            selectedHotelData.roomTypes[room.roomTypeIndex]) {
            const roomType = selectedHotelData.roomTypes[room.roomTypeIndex].type;
            roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1; 
        }
      });
    } else {
      const defaultRoomType = selectedHotelData.roomTypes[0].type;
      roomTypeCounts[defaultRoomType] = Math.ceil(numGuests / 2);
    }
    
    // Format the room type information
    roomTypeInfo = Object.entries(roomTypeCounts)
        .map(([type, count]) => `${count} ${getRoomTypeInArabic(type)}`)
        .join(' و ');
  } else if (selectedHotelData.roomType) {
    // Fallback for old data structure
    roomTypeInfo = `${numGuests} ${getRoomTypeInArabic(selectedHotelData.roomType)}`;
  }

  // Generate guests information with children details
  let guestsInfo = `${RLM}${numGuests} بالغ`;
  
  // Calculate total people for the hotel section
  const infantsCount = parseInt(childrenUnder3) || 0;
  const children3to6Count = parseInt(children3to6) || 0;
  const children6to12Count = parseInt(children6to12) || 0;
  const totalChildren = includeChildren ? (infantsCount + children3to6Count + children6to12Count) : 0;
  const totalPeople = numGuests + totalChildren;
  
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
${RLM}المدة ${nights} ليالي ⏰
${guestsInfo}
${RLM}سعر البكج ${finalPrice}$ 💵

${includeTransfer && selectedHotelData.transportationPrice > 0 ? 
  `${RLM}الاستقبال والتوديع من ${airportName} بسيارة خاصة ` : ''}
${includeVIP && vipCarPrice ? 
  `${RLM}خدمة VIP: سيارة فاخرة للتنقلات السياحية` : ''}

${RLM}الفندق 🏢
${RLM}الاقامة في ${getCityNameInArabic(selectedCity)} في فندق ${selectedHotelData.name} ${selectedHotelData.stars} نجوم ${totalPeople} اشخاص ضمن ${roomTypeInfo} ${includeBreakfast && selectedHotelData.breakfastIncluded ? 'شامل الافطار' : 'بدون افطار'}
${selectedHotelData.description ? `\n${RLM}${selectedHotelData.description}` : ''}

${orderedTourData.length > 0 ? `${RLM}تفاصيل الجولات 📋` : ''}
${orderedTourData.map((tour, index) => {
  return `${RLM}اليوم ${arabicDayOrdinals[index]}:
${RLM}${tour.name}
${RLM}${tour.description}

${tour.detailedDescription ? `${RLM}${tour.detailedDescription}` : ''}
${tour.highlights && tour.highlights.length > 0 ? tour.highlights.map(highlight => `${RLM}• ${highlight}`).join('\n') : ''}`;
}).join('\n\n')}`;

  return itinerary;
}; 