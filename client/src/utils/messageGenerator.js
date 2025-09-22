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
  // Turkey
  'Antalya': 'انطاليا',
  'Bodrum': 'بودروم',
  'Bursa': 'بورصة',
  'Cappadocia': 'كابادوكيا',
  'Fethiye': 'فتحية',
  'Istanbul': 'اسطنبول',
  'Trabzon': 'طرابزون',
  
  // Malaysia
  'Kuala Lumpur': 'كوالالمبور',
  'Penang': 'بينانغ',
  'Langkawi': 'لنكاوي',
  'Malacca': 'ملقا',
  'Johor Bahru': 'جوهور بهرو',
  'Kota Kinabalu': 'كوتا كينابالو',
  'Kuching': 'كوتشينغ',
  'Cameron Highlands': 'مرتفعات الكاميرون',
  'Genting Highlands': 'مرتفعات جنتنغ',
  
  // Thailand
  'Bangkok': 'بانكوك',
  'Phuket': 'فوكيت',
  'Pattaya': 'باتايا',
  'Chiang Mai': 'شيانغ ماي',
  'Krabi': 'كرابي',
  'Koh Samui': 'كوه ساموي',
  'Hua Hin': 'هوا هين',
  'Ayutthaya': 'أيوتايا',
  'Chiang Rai': 'شيانغ راي',
  'Kanchanaburi': 'كانشانابوري',
  
  // Indonesia
  'Jakarta': 'جاكرتا',
  'Bali': 'بالي',
  'Yogyakarta': 'يوجياكارتا',
  'Bandung': 'باندونغ',
  'Surabaya': 'سورابايا',
  'Medan': 'ميدان',
  'Lombok': 'لومبوك',
  'Bogor': 'بوغور',
  'Malang': 'مالانغ',
  'Solo': 'سولو',
  'Ubud': 'أوبود',
  'Sanur': 'سانور',
  'Seminyak': 'سيمينياك',
  
  // Saudi Arabia
  'Riyadh': 'الرياض',
  'Jeddah': 'جدة',
  'Mecca': 'مكة المكرمة',
  'Medina': 'المدينة المنورة',
  'Dammam': 'الدمام',
  'Khobar': 'الخبر',
  'Taif': 'الطائف',
  'Abha': 'أبها',
  'Tabuk': 'تبوك',
  'Al Khobar': 'الخبر',
  
  // Morocco
  'Casablanca': 'الدار البيضاء',
  'Marrakech': 'مراكش',
  'Rabat': 'الرباط',
  'Fez': 'فاس',
  'Tangier': 'طنجة',
  'Agadir': 'أكادير',
  'Meknes': 'مكناس',
  'Essaouira': 'الصويرة',
  'Chefchaouen': 'شفشاون',
  'Ouarzazate': 'ورزازات',
  
  // Egypt
  'Cairo': 'القاهرة',
  'Alexandria': 'الإسكندرية',
  'Luxor': 'الأقصر',
  'Aswan': 'أسوان',
  'Hurghada': 'الغردقة',
  'Sharm El Sheikh': 'شرم الشيخ',
  'Dahab': 'دهب',
  'Marsa Alam': 'مرسى علم',
  'Taba': 'طابا',
  'Giza': 'الجيزة',
  
  // Azerbaijan
  'Baku': 'باكو',
  'Ganja': 'جانجا',
  'Sumgayit': 'سومغايت',
  'Mingachevir': 'مينجتشفير',
  'Qabalah': 'قبالة',
  'Shaki': 'شاكي',
  'Lankaran': 'لانكاران',
  'Shamakhi': 'شماخي',
  'Quba': 'قوبا',
  'Gabala': 'جابالا',
  
  // Georgia
  'Tbilisi': 'تبليسي',
  'Batumi': 'باتومي',
  'Kutaisi': 'كوتايسي',
  'Rustavi': 'روستافي',
  'Zugdidi': 'زوجديدي',
  'Gori': 'غوري',
  'Telavi': 'تيلافي',
  'Mestia': 'ميستيا',
  'Kazbegi': 'كازبيجي',
  'Sighnaghi': 'سيغناغي',
  'Mtskheta': 'متسخيتا',
  'Borjomi': 'بورجومي',
  
  // Albania
  'Tirana': 'تيرانا',
  'Durres': 'دوريس',
  'Vlore': 'فلورا',
  'Shkoder': 'شكودرا',
  'Fier': 'فيير',
  'Korce': 'كورتشا',
  'Berat': 'بيرات',
  'Gjirokaster': 'جيروكاسترا',
  'Sarande': 'ساراندا',
  'Kruje': 'كروجا'
};

// Country flag mappings
const countryFlags = {
  'Turkey': '🇹🇷',
  'Malaysia': '🇲🇾',
  'Thailand': '🇹🇭',
  'Indonesia': '🇮🇩',
  'Saudi Arabia': '🇸🇦',
  'Morocco': '🇲🇦',
  'Egypt': '🇪🇬',
  'Azerbaijan': '🇦🇿',
  'Georgia': '🇬🇪',
  'Albania': '🇦🇱'
};

// Helper function to get country from city
const getCountryFromCity = (city) => {
  // Import the COUNTRY_CITIES mapping
  const countryCitiesMap = {
    "Turkey": ['Istanbul', 'Antalya', 'Cappadocia', 'Trabzon', 'Bodrum', 'Fethiye', 'Bursa'],
    "Malaysia": ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Johor Bahru', 'Kota Kinabalu', 'Kuching', 'Cameron Highlands', 'Genting Highlands'],
    "Thailand": ['Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi', 'Koh Samui', 'Hua Hin', 'Ayutthaya', 'Chiang Rai', 'Kanchanaburi'],
    "Indonesia": ['Jakarta', 'Bali', 'Yogyakarta', 'Bandung', 'Surabaya', 'Medan', 'Lombok', 'Bogor', 'Malang', 'Solo', 'Ubud', 'Sanur', 'Seminyak'],
    "Saudi Arabia": ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Taif', 'Abha', 'Tabuk', 'Al Khobar'],
    "Morocco": ['Casablanca', 'Marrakech', 'Rabat', 'Fez', 'Tangier', 'Agadir', 'Meknes', 'Essaouira', 'Chefchaouen', 'Ouarzazate'],
    "Egypt": ['Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Dahab', 'Marsa Alam', 'Taba', 'Giza'],
    "Azerbaijan": ['Baku', 'Ganja', 'Sumgayit', 'Mingachevir', 'Qabalah', 'Shaki', 'Lankaran', 'Shamakhi', 'Quba', 'Gabala'],
    "Georgia": ['Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Zugdidi', 'Gori', 'Telavi', 'Mestia', 'Kazbegi', 'Sighnaghi', 'Mtskheta', 'Borjomi'],
    "Albania": ['Tirana', 'Durres', 'Vlore', 'Shkoder', 'Fier', 'Korce', 'Berat', 'Gjirokaster', 'Sarande', 'Kruje']
  };
  
  for (const [country, cities] of Object.entries(countryCitiesMap)) {
    if (cities.includes(city)) {
      return country;
    }
  }
  return 'Turkey'; // Default fallback
};

// Helper function to get unique countries from selected cities
const getCountriesFromCities = (cities) => {
  const countries = [...new Set(cities.map(city => getCountryFromCity(city)))];
  return countries;
};

// Helper function to generate flags string from countries
const getFlagsFromCountries = (countries) => {
  return countries.map(country => countryFlags[country] || '🌍').join(' ');
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

  // Get countries from selected cities
  const countries = getCountriesFromCities(selectedCities);
  const flagsString = getFlagsFromCountries(countries);

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

  const itinerary = `${RLM}${flagsString} بكج ${formattedCities} ${flagsString}
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