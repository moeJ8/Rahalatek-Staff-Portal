import {
  calculateDuration,
  getRoomTypeInArabic,
  getCityNameInArabic,
} from "./pricingUtils";

// Helper function to get Arabic translation for hotel fields
const getHotelTranslation = (hotel, field) => {
  // For Arabic messages, always use Arabic translations
  // Check if translations object exists and has the field with Arabic translation
  if (hotel && hotel.translations && hotel.translations[field]) {
    const translation = hotel.translations[field].ar;
    if (
      translation &&
      typeof translation === "string" &&
      translation.trim() !== ""
    ) {
      return translation;
    }
  }
  // Fallback to base field (English)
  return hotel && hotel[field] ? hotel[field] : "";
};

// Helper function to get Arabic translation for tour fields
const getTourTranslation = (tour, field) => {
  // For Arabic messages, always use Arabic translations
  if (tour && tour.translations && tour.translations[field]) {
    if (field === "highlights" || field === "policies") {
      // Handle array fields
      const baseArray = tour[field] || [];
      const translations = tour.translations[field] || [];

      if (Array.isArray(baseArray) && Array.isArray(translations)) {
        return baseArray.map((item, index) => {
          const translation = translations[index]?.ar;
          if (
            translation &&
            typeof translation === "string" &&
            translation.trim() !== ""
          ) {
            return translation;
          }
          return item;
        });
      }
    } else {
      // Handle string fields (name, description, detailedDescription)
      const translation = tour.translations[field]?.ar;
      if (
        translation &&
        typeof translation === "string" &&
        translation.trim() !== ""
      ) {
        return translation;
      }
    }
  }
  // Fallback to base field (English)
  return tour && tour[field] ? tour[field] : "";
};

// RTL mark to ensure proper right-to-left display
const RLM = "\u200F";

// Function to convert numeric stars to Arabic text
const getStarsInArabic = (stars) => {
  const starsNum = parseInt(stars);
  if (starsNum === 3) return "ثلاث نجوم";
  if (starsNum === 4) return "أربع نجوم";
  if (starsNum === 5) return "خمس نجوم";
  return `${stars} نجوم`;
};

const arabicDayOrdinals = [
  "الاول",
  "الثاني",
  "الثالث",
  "الرابع",
  "الخامس",
  "السادس",
  "السابع",
  "الثامن",
  "التاسع",
  "العاشر",
  "الحادي عشر",
  "الثاني عشر",
  "الثالث عشر",
  "الرابع عشر",
  "الخامس عشر",
];

// Add city name translations
const cityTranslations = {
  // Turkey
  Antalya: "انطاليا",
  Bodrum: "بودروم",
  Bursa: "بورصة",
  Cappadocia: "كابادوكيا",
  Fethiye: "فتحية",
  Istanbul: "اسطنبول",
  Trabzon: "طرابزون",

  // Malaysia
  "Kuala Lumpur": "كوالالمبور",
  Penang: "بينانغ",
  Langkawi: "لنكاوي",
  Malacca: "ملقا",
  "Johor Bahru": "جوهور بهرو",
  "Kota Kinabalu": "كوتا كينابالو",
  Kuching: "كوتشينغ",
  "Cameron Highlands": "مرتفعات الكاميرون",
  "Genting Highlands": "مرتفعات جنتنغ",

  // Thailand
  Bangkok: "بانكوك",
  Phuket: "فوكيت",
  Pattaya: "باتايا",
  "Chiang Mai": "شيانغ ماي",
  Krabi: "كرابي",
  "Koh Samui": "كوه ساموي",
  "Hua Hin": "هوا هين",
  Ayutthaya: "أيوتايا",
  "Chiang Rai": "شيانغ راي",
  Kanchanaburi: "كانشانابوري",

  // Indonesia
  Jakarta: "جاكرتا",
  Bali: "بالي",
  Yogyakarta: "يوجياكارتا",
  Bandung: "باندونغ",
  Surabaya: "سورابايا",
  Medan: "ميدان",
  Lombok: "لومبوك",
  Bogor: "بوغور",
  Malang: "مالانغ",
  Solo: "سولو",
  Ubud: "أوبود",
  Sanur: "سانور",
  Seminyak: "سيمينياك",

  // Saudi Arabia
  Riyadh: "الرياض",
  Jeddah: "جدة",
  Mecca: "مكة المكرمة",
  Medina: "المدينة المنورة",
  Dammam: "الدمام",
  Khobar: "الخبر",
  Taif: "الطائف",
  Abha: "أبها",
  Tabuk: "تبوك",
  "Al Khobar": "الخبر",

  // Morocco
  Casablanca: "الدار البيضاء",
  Marrakech: "مراكش",
  Rabat: "الرباط",
  Fez: "فاس",
  Tangier: "طنجة",
  Agadir: "أكادير",
  Meknes: "مكناس",
  Essaouira: "الصويرة",
  Chefchaouen: "شفشاون",
  Ouarzazate: "ورزازات",

  // Egypt
  Cairo: "القاهرة",
  Alexandria: "الإسكندرية",
  Luxor: "الأقصر",
  Aswan: "أسوان",
  Hurghada: "الغردقة",
  "Sharm El Sheikh": "شرم الشيخ",
  Dahab: "دهب",
  "Marsa Alam": "مرسى علم",
  Taba: "طابا",
  Giza: "الجيزة",

  // Azerbaijan
  Baku: "باكو",
  Ganja: "جانجا",
  Sumgayit: "سومغايت",
  Mingachevir: "مينجتشفير",
  Qabalah: "قبالة",
  Shaki: "شاكي",
  Lankaran: "لانكاران",
  Shamakhi: "شماخي",
  Quba: "قوبا",
  Gabala: "جابالا",

  // Georgia
  Tbilisi: "تبليسي",
  Batumi: "باتومي",
  Kutaisi: "كوتايسي",
  Rustavi: "روستافي",
  Zugdidi: "زوجديدي",
  Gori: "غوري",
  Telavi: "تيلافي",
  Mestia: "ميستيا",
  Kazbegi: "كازبيجي",
  Sighnaghi: "سيغناغي",
  Mtskheta: "متسخيتا",
  Borjomi: "بورجومي",

  // Albania
  Tirana: "تيرانا",
  Durres: "دوريس",
  Vlore: "فلورا",
  Shkoder: "شكودرا",
  Fier: "فيير",
  Korce: "كورتشا",
  Berat: "بيرات",
  Gjirokaster: "جيروكاسترا",
  Sarande: "ساراندا",
  Kruje: "كروجا",
};

// Country flag mappings
const countryFlags = {
  Turkey: "🇹🇷",
  Malaysia: "🇲🇾",
  Thailand: "🇹🇭",
  Indonesia: "🇮🇩",
  "Saudi Arabia": "🇸🇦",
  Morocco: "🇲🇦",
  Egypt: "🇪🇬",
  Azerbaijan: "🇦🇿",
  Georgia: "🇬🇪",
  Albania: "🇦🇱",
};

// Helper function to get country from city
const getCountryFromCity = (city) => {
  // Import the COUNTRY_CITIES mapping
  const countryCitiesMap = {
    Turkey: [
      "Istanbul",
      "Antalya",
      "Cappadocia",
      "Trabzon",
      "Bodrum",
      "Fethiye",
      "Bursa",
    ],
    Malaysia: [
      "Kuala Lumpur",
      "Penang",
      "Langkawi",
      "Malacca",
      "Johor Bahru",
      "Kota Kinabalu",
      "Kuching",
      "Cameron Highlands",
      "Genting Highlands",
    ],
    Thailand: [
      "Bangkok",
      "Phuket",
      "Pattaya",
      "Chiang Mai",
      "Krabi",
      "Koh Samui",
      "Hua Hin",
      "Ayutthaya",
      "Chiang Rai",
      "Kanchanaburi",
    ],
    Indonesia: [
      "Jakarta",
      "Bali",
      "Yogyakarta",
      "Bandung",
      "Surabaya",
      "Medan",
      "Lombok",
      "Bogor",
      "Malang",
      "Solo",
      "Ubud",
      "Sanur",
      "Seminyak",
    ],
    "Saudi Arabia": [
      "Riyadh",
      "Jeddah",
      "Mecca",
      "Medina",
      "Dammam",
      "Khobar",
      "Taif",
      "Abha",
      "Tabuk",
      "Al Khobar",
    ],
    Morocco: [
      "Casablanca",
      "Marrakech",
      "Rabat",
      "Fez",
      "Tangier",
      "Agadir",
      "Meknes",
      "Essaouira",
      "Chefchaouen",
      "Ouarzazate",
    ],
    Egypt: [
      "Cairo",
      "Alexandria",
      "Luxor",
      "Aswan",
      "Hurghada",
      "Sharm El Sheikh",
      "Dahab",
      "Marsa Alam",
      "Taba",
      "Giza",
    ],
    Azerbaijan: [
      "Baku",
      "Ganja",
      "Sumgayit",
      "Mingachevir",
      "Qabalah",
      "Shaki",
      "Lankaran",
      "Shamakhi",
      "Quba",
      "Gabala",
    ],
    Georgia: [
      "Tbilisi",
      "Batumi",
      "Kutaisi",
      "Rustavi",
      "Zugdidi",
      "Gori",
      "Telavi",
      "Mestia",
      "Kazbegi",
      "Sighnaghi",
      "Mtskheta",
      "Borjomi",
    ],
    Albania: [
      "Tirana",
      "Durres",
      "Vlore",
      "Shkoder",
      "Fier",
      "Korce",
      "Berat",
      "Gjirokaster",
      "Sarande",
      "Kruje",
    ],
  };

  for (const [country, cities] of Object.entries(countryCitiesMap)) {
    if (cities.includes(city)) {
      return country;
    }
  }
  return "Turkey"; // Default fallback
};

// Helper function to get unique countries from selected cities
const getCountriesFromCities = (cities) => {
  const countries = [
    ...new Set(cities.map((city) => getCountryFromCity(city))),
  ];
  return countries;
};

// Helper function to generate flags string from countries
const getFlagsFromCountries = (countries) => {
  return countries.map((country) => countryFlags[country] || "🌍").join(" ");
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
  dailyItinerary = [],
  getAirportArabicName,
}) => {
  const totalNights = calculateDuration(startDate, endDate);
  const finalPrice = tripPrice || calculatedPrice;

  // Get countries from selected cities
  const countries = getCountriesFromCities(selectedCities);
  const flagsString = getFlagsFromCountries(countries);

  // Format cities for Arabic message
  const formattedCities = selectedCities
    .map((city) => cityTranslations[city] || city)
    .join(" و ");

  // Helper function to format date as dd/mm/yyyy
  const formatDateDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedStartDate = formatDateDDMMYYYY(startDate);
  const formattedEndDate = formatDateDDMMYYYY(endDate);

  // Generate transportation text for each hotel with reception/farewell
  const transportationLines = [];

  hotelEntries.forEach((entry) => {
    const hotelData = entry.hotelData;
    if (!hotelData) return;
    const hotelName = hotelData.name || "الفندق";

    // Check if this hotel has reception/farewell options enabled
    const includeReception =
      typeof entry.includeReception === "boolean"
        ? entry.includeReception
        : false;
    const includeFarewell =
      typeof entry.includeFarewell === "boolean"
        ? entry.includeFarewell
        : false;
    const transportVehicleType = entry.transportVehicleType || "Vito"; // Default to Vito if not specified

    const airportName = getAirportArabicName(
      entry.selectedAirport || hotelData.airport || "المطار"
    );

    const vehicleText =
      transportVehicleType === "Bus"
        ? `${transportVehicleType} خاص`
        : `بسيارة ${transportVehicleType} خاصة`;

    if (includeReception && includeFarewell) {
      transportationLines.push(
        `${RLM}استقبال وتوديع بين ${airportName} وفندق ${hotelName} ${vehicleText}`
      );
    } else {
      if (includeReception) {
        transportationLines.push(
          `${RLM}الاستقبال من ${airportName} إلى فندق ${hotelName} ${vehicleText}`
        );
      }

      if (includeFarewell) {
        transportationLines.push(
          `${RLM}التوديع إلى ${airportName} من فندق ${hotelName} ${vehicleText}`
        );
      }
    }
  });

  // Join transportation lines
  const transportationText =
    transportationLines.length > 0
      ? transportationLines
          .map((line) => `${RLM}• ${line.replace(RLM, "")}`)
          .join("\n\n")
      : "";

  // Generate hotel information for each hotel
  let hotelInfoText = "";
  const showHotelNumbers = hotelEntries.length > 1;

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

        entry.roomAllocations.forEach((room) => {
          if (
            room.roomTypeIndex !== undefined &&
            room.roomTypeIndex !== "" &&
            hotelData.roomTypes[room.roomTypeIndex]
          ) {
            const roomType = hotelData.roomTypes[room.roomTypeIndex].type;

            if (!roomTypeCounts[roomType]) {
              roomTypeCounts[roomType] = {
                count: 0,
                adults: 0,
                childrenUnder3: 0,
                children3to6: 0,
                children6to12: 0,
              };
            }

            roomTypeCounts[roomType].count += 1;
            roomTypeCounts[roomType].adults += room.occupants;
            roomTypeCounts[roomType].childrenUnder3 += room.childrenUnder3 || 0;
            roomTypeCounts[roomType].children3to6 += room.children3to6 || 0;
            roomTypeCounts[roomType].children6to12 += room.children6to12 || 0;
          }
        });

        // Format room type information with occupant details
        Object.entries(roomTypeCounts).forEach(([type, details]) => {
          let detailString = `${details.count} ${getRoomTypeInArabic(type)}`;

          roomDetailsList.push(detailString);
        });

        roomTypeInfo = roomDetailsList.join(" و ");
      } else {
        const defaultRoomType = hotelData.roomTypes[0].type;
        roomTypeInfo = `${Math.ceil(numGuests / 2)} ${getRoomTypeInArabic(
          defaultRoomType
        )}`;
      }
    } else if (hotelData.roomType) {
      // Fallback for old data structure
      roomTypeInfo = `${numGuests} ${getRoomTypeInArabic(hotelData.roomType)}`;
    }

    // Get Arabic translations for hotel
    const hotelName = hotelData.name; // Hotel name doesn't have translation in schema
    const hotelDescription = getHotelTranslation(hotelData, "description");

    // Add hotel info to the text
    const hotelNumberLabel = showHotelNumbers ? ` ${index + 1}` : "";
    hotelInfoText += `${RLM}${
      index > 0 ? "\n\n" : ""
    }• الفندق${hotelNumberLabel}:
${RLM}(${hotelCheckIn} - ${hotelCheckOut})
${RLM}الاقامة في ${getCityNameInArabic(
      hotelData.city
    )} في فندق ${hotelName} ${getStarsInArabic(
      hotelData.stars
    )} لمدة ${hotelNights} ليالي ضمن ${roomTypeInfo} ${
      entry.includeBreakfast && hotelData.breakfastIncluded
        ? "شامل الافطار"
        : "بدون افطار"
    }
${hotelDescription ? `${RLM}${hotelDescription}` : ""}
`;
  });

  // Generate guests information with children details
  let guestsInfo = `${RLM}${numGuests} بالغ`;

  // Calculate total people for the hotel section
  const infantsCount = parseInt(childrenUnder3) || 0;
  const children3to6Count = parseInt(children3to6) || 0;
  const children6to12Count = parseInt(children6to12) || 0;
  const totalChildren = includeChildren
    ? infantsCount + children3to6Count + children6to12Count
    : 0;

  if (includeChildren) {
    if (totalChildren > 0) {
      guestsInfo += ` و ${totalChildren} ${
        totalChildren === 1 ? "طفل" : "أطفال"
      }`;

      // Add details about each age group
      let childrenDetails = [];
      if (infantsCount > 0) {
        childrenDetails.push(
          `${RLM}${infantsCount} ${
            infantsCount === 1 ? "طفل" : "أطفال"
          } تحت 3 سنوات (مجاناً للجولات)`
        );
      }
      if (children3to6Count > 0) {
        childrenDetails.push(
          `${RLM}${children3to6Count} ${
            children3to6Count === 1 ? "طفل" : "أطفال"
          } 3-6 سنوات (مجاناً للفندق)`
        );
      }
      if (children6to12Count > 0) {
        childrenDetails.push(
          `${RLM}${children6to12Count} ${
            children6to12Count === 1 ? "طفل" : "أطفال"
          } 6-12 سنة (سعر خاص)`
        );
      }

      if (childrenDetails.length > 0) {
        guestsInfo += `\n${childrenDetails.join("\n")}`;
      }
    }
  }

  // Use dailyItinerary if available, otherwise fall back to selectedTours
  const sortedDays =
    dailyItinerary && dailyItinerary.length > 0
      ? [...dailyItinerary].sort((a, b) => a.day - b.day)
      : [];

  const tourDays = sortedDays.filter(
    (day) => day.tourInfo && day.tourInfo.tourId
  );
  const tourCount = tourDays.length;

  // Generate itinerary text from daily itinerary
  let itineraryDetails = "";
  if (sortedDays.length > 0) {
    itineraryDetails = sortedDays
      .map((day) => {
        const dayTitle =
          day.translations?.title?.ar || day.title || `اليوم ${day.day}`;
        const dayDescription =
          day.translations?.description?.ar || day.description || "";

        // For tour days, get tour information
        if (day.tourInfo && day.tourInfo.tourId) {
          const tourId =
            typeof day.tourInfo.tourId === "object"
              ? day.tourInfo.tourId._id || day.tourInfo.tourId.id
              : day.tourInfo.tourId;

          const tour = tours.find((t) => t._id === tourId);

          if (tour) {
            const tourName = getTourTranslation(tour, "name");
            const tourDescription = getTourTranslation(tour, "description");
            const tourDetailedDescription = getTourTranslation(
              tour,
              "detailedDescription"
            );
            const tourHighlights = getTourTranslation(tour, "highlights");

            let vipCarInfo = "";
            if (tour.tourType === "VIP") {
              vipCarInfo = `${RLM}جولة VIP خاصة مع سيارة ${tour.vipCarType}`;
            }

            // For tour days, show day number + Arabic tour name
            return `${RLM}اليوم ${day.day}: ${tourName}
${tourDescription ? `${RLM}${tourDescription}\n` : ""}${
              vipCarInfo ? `${vipCarInfo}\n` : ""
            }${
              tourDetailedDescription
                ? `${RLM}${tourDetailedDescription}\n`
                : ""
            }${
              tourHighlights && tourHighlights.length > 0
                ? tourHighlights
                    .map((highlight) => `${RLM}• ${highlight}`)
                    .join("\n")
                : ""
            }`;
          } else {
            console.warn(`Tour not found for tourId: ${tourId}`, {
              day,
              tours: tours.map((t) => t._id),
            });
          }
        }

        // For non-tour days (arrival, departure, rest)
        return `${RLM}${dayTitle}
${dayDescription ? `${RLM}${dayDescription}` : ""}`;
      })
      .join("\n\n");
  } else {
    // Fallback to old selectedTours method
    const orderedTourData = selectedTours
      .map((tourId) => tours.find((tour) => tour._id === tourId))
      .filter(Boolean);

    itineraryDetails = orderedTourData
      .map((tour, index) => {
        const tourName = getTourTranslation(tour, "name");
        const tourDescription = getTourTranslation(tour, "description");
        const tourDetailedDescription = getTourTranslation(
          tour,
          "detailedDescription"
        );
        const tourHighlights = getTourTranslation(tour, "highlights");

        let vipCarInfo = "";
        if (tour.tourType === "VIP") {
          vipCarInfo = `${RLM}جولة VIP خاصة مع سيارة ${tour.vipCarType}`;
        }

        return `${RLM}اليوم ${arabicDayOrdinals[index]}:
${RLM}${tourName}${tourDescription ? `\n${RLM}${tourDescription}` : ""}${
          vipCarInfo ? `\n${vipCarInfo}` : ""
        }
${tourDetailedDescription ? `${RLM}${tourDetailedDescription}\n` : ""}${
          tourHighlights && tourHighlights.length > 0
            ? tourHighlights
                .map((highlight) => `${RLM}• ${highlight}`)
                .join("\n")
            : ""
        }`;
      })
      .join("\n\n");
  }

  const itinerary = `${RLM}${flagsString} بكج ${formattedCities} ${flagsString}
${RLM}🗓 من ${formattedStartDate} لغاية ${formattedEndDate}
${RLM}⏰ المدة ${totalNights} ليالي
${guestsInfo}
${RLM}💵 سعر البكج ${finalPrice}$

${RLM}يشمل:

${transportationText ? `${transportationText}\n\n` : ""}
${hotelInfoText}

${tourCount > 0 ? `${RLM}• عدد الجولات: ${tourCount}\n\n` : ""}${
    itineraryDetails ? `${RLM}• تفاصيل الرحلة:\n${itineraryDetails}` : ""
  }`;

  return itinerary;
};

// English day ordinals
const englishDayOrdinals = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
];

// Function to convert numeric stars to English text
const getStarsInEnglish = (stars) => {
  const starsNum = parseInt(stars);
  if (starsNum === 3) return "3-star";
  if (starsNum === 4) return "4-star";
  if (starsNum === 5) return "5-star";
  return `${stars}-star`;
};

// Helper function to get English room type name
const getRoomTypeInEnglish = (roomType) => {
  const roomTypeMap = {
    Single: "Single Room",
    Double: "Double Room",
    Twin: "Twin Room",
    Triple: "Triple Room",
    Quad: "Quad Room",
    Suite: "Suite",
    "Family Room": "Family Room",
    "Deluxe Room": "Deluxe Room",
    "Standard Room": "Standard Room",
  };
  return roomTypeMap[roomType] || roomType;
};

export const generateBookingMessageEnglish = ({
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
  dailyItinerary = [],
}) => {
  const totalNights = calculateDuration(startDate, endDate);
  const finalPrice = tripPrice || calculatedPrice;

  // Get countries from selected cities
  const countries = getCountriesFromCities(selectedCities);
  const flagsString = getFlagsFromCountries(countries);

  // Format cities for English message (use original English names)
  const formattedCities = selectedCities.join(" & ");

  // Helper function to format date as dd/mm/yyyy
  const formatDateDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedStartDate = formatDateDDMMYYYY(startDate);
  const formattedEndDate = formatDateDDMMYYYY(endDate);

  // Generate transportation text for each hotel with reception/farewell
  const transportationLines = [];

  hotelEntries.forEach((entry) => {
    const hotelData = entry.hotelData;
    if (!hotelData) return;
    const hotelName = hotelData.name || "Hotel";

    // Check if this hotel has reception/farewell options enabled
    const includeReception =
      typeof entry.includeReception === "boolean"
        ? entry.includeReception
        : false;
    const includeFarewell =
      typeof entry.includeFarewell === "boolean"
        ? entry.includeFarewell
        : false;
    const transportVehicleType = entry.transportVehicleType || "Vito";

    const airportName = entry.selectedAirport || hotelData.airport || "Airport";

    const vehicleText =
      transportVehicleType === "Bus"
        ? `Private ${transportVehicleType}`
        : `Private ${transportVehicleType} car`;

    if (includeReception && includeFarewell) {
      transportationLines.push(
        `Pick up & Drop off between ${airportName} and ${hotelName} by ${vehicleText}`
      );
    } else {
      if (includeReception) {
        transportationLines.push(
          `Pick up from ${airportName} to ${hotelName} by ${vehicleText}`
        );
      }

      if (includeFarewell) {
        transportationLines.push(
          `Drop off from ${hotelName} to ${airportName} by ${vehicleText}`
        );
      }
    }
  });

  // Join transportation lines
  const transportationText =
    transportationLines.length > 0
      ? transportationLines.map((line) => `• ${line}`).join("\n\n")
      : "";

  // Generate hotel information for each hotel
  let hotelInfoText = "";
  const showHotelNumbers = hotelEntries.length > 1;

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

        entry.roomAllocations.forEach((room) => {
          if (
            room.roomTypeIndex !== undefined &&
            room.roomTypeIndex !== "" &&
            hotelData.roomTypes[room.roomTypeIndex]
          ) {
            const roomType = hotelData.roomTypes[room.roomTypeIndex].type;

            if (!roomTypeCounts[roomType]) {
              roomTypeCounts[roomType] = {
                count: 0,
                adults: 0,
                childrenUnder3: 0,
                children3to6: 0,
                children6to12: 0,
              };
            }

            roomTypeCounts[roomType].count += 1;
            roomTypeCounts[roomType].adults += room.occupants;
            roomTypeCounts[roomType].childrenUnder3 += room.childrenUnder3 || 0;
            roomTypeCounts[roomType].children3to6 += room.children3to6 || 0;
            roomTypeCounts[roomType].children6to12 += room.children6to12 || 0;
          }
        });

        // Format room type information with occupant details
        Object.entries(roomTypeCounts).forEach(([type, details]) => {
          let detailString = `${details.count} ${getRoomTypeInEnglish(type)}`;
          roomDetailsList.push(detailString);
        });

        roomTypeInfo = roomDetailsList.join(" & ");
      } else {
        const defaultRoomType = hotelData.roomTypes[0].type;
        roomTypeInfo = `${Math.ceil(numGuests / 2)} ${getRoomTypeInEnglish(
          defaultRoomType
        )}`;
      }
    } else if (hotelData.roomType) {
      // Fallback for old data structure
      roomTypeInfo = `${numGuests} ${getRoomTypeInEnglish(hotelData.roomType)}`;
    }

    // Use English hotel name and description (original, not translated)
    const hotelName = hotelData.name;
    const hotelDescription = hotelData.description || "";

    // Add hotel info to the text
    const hotelNumberLabel = showHotelNumbers ? ` ${index + 1}` : "";
    hotelInfoText += `${index > 0 ? "\n\n" : ""}• Hotel${hotelNumberLabel}:
(${hotelCheckIn} - ${hotelCheckOut})
Accommodation in ${hotelData.city} at ${hotelName} ${getStarsInEnglish(
      hotelData.stars
    )} hotel for ${hotelNights} night${
      hotelNights !== 1 ? "s" : ""
    } in ${roomTypeInfo} ${
      entry.includeBreakfast && hotelData.breakfastIncluded
        ? "with breakfast"
        : "without breakfast"
    }
${hotelDescription ? hotelDescription : ""}
`;
  });

  // Generate guests information with children details
  let guestsInfo = `${numGuests} adult${numGuests !== 1 ? "s" : ""}`;

  // Calculate total people for the hotel section
  const infantsCount = parseInt(childrenUnder3) || 0;
  const children3to6Count = parseInt(children3to6) || 0;
  const children6to12Count = parseInt(children6to12) || 0;
  const totalChildren = includeChildren
    ? infantsCount + children3to6Count + children6to12Count
    : 0;

  if (includeChildren) {
    if (totalChildren > 0) {
      guestsInfo += ` & ${totalChildren} ${
        totalChildren === 1 ? "child" : "children"
      }`;

      // Add details about each age group
      let childrenDetails = [];
      if (infantsCount > 0) {
        childrenDetails.push(
          `${infantsCount} ${
            infantsCount === 1 ? "child" : "children"
          } under 3 years (free on tours)`
        );
      }
      if (children3to6Count > 0) {
        childrenDetails.push(
          `${children3to6Count} ${
            children3to6Count === 1 ? "child" : "children"
          } 3-6 years (free accommodation)`
        );
      }
      if (children6to12Count > 0) {
        childrenDetails.push(
          `${children6to12Count} ${
            children6to12Count === 1 ? "child" : "children"
          } 6-12 years (special rate)`
        );
      }

      if (childrenDetails.length > 0) {
        guestsInfo += `\n${childrenDetails.join("\n")}`;
      }
    }
  }

  // Use dailyItinerary if available, otherwise fall back to selectedTours
  const sortedDays =
    dailyItinerary && dailyItinerary.length > 0
      ? [...dailyItinerary].sort((a, b) => a.day - b.day)
      : [];

  const tourDays = sortedDays.filter(
    (day) => day.tourInfo && day.tourInfo.tourId
  );
  const tourCount = tourDays.length;

  // Generate itinerary text from daily itinerary
  let itineraryDetails = "";
  if (sortedDays.length > 0) {
    itineraryDetails = sortedDays
      .map((day) => {
        const dayTitle = day.title || `Day ${day.day}`;
        const dayDescription = day.description || "";

        // For tour days, get tour information
        if (day.tourInfo && day.tourInfo.tourId) {
          const tourId =
            typeof day.tourInfo.tourId === "object"
              ? day.tourInfo.tourId._id || day.tourInfo.tourId.id
              : day.tourInfo.tourId;

          const tour = tours.find((t) => t._id === tourId);

          if (tour) {
            const tourName = tour.name || "";
            const tourDescription = tour.description || "";
            const tourDetailedDescription = tour.detailedDescription || "";
            const tourHighlights = tour.highlights || [];

            let vipCarInfo = "";
            if (tour.tourType === "VIP") {
              vipCarInfo = `VIP private tour with ${tour.vipCarType} car`;
            }

            // For tour days, show day number + English tour name
            return `Day ${day.day}: ${tourName}
${tourDescription ? `${tourDescription}\n` : ""}${
              vipCarInfo ? `${vipCarInfo}\n` : ""
            }${tourDetailedDescription ? `${tourDetailedDescription}\n` : ""}${
              tourHighlights && tourHighlights.length > 0
                ? tourHighlights.map((highlight) => `• ${highlight}`).join("\n")
                : ""
            }`;
          } else {
            console.warn(`Tour not found for tourId: ${tourId} (English)`);
          }
        }

        // For non-tour days (arrival, departure, rest)
        return `${dayTitle}
${dayDescription || ""}`;
      })
      .join("\n\n");
  } else {
    // Fallback to old selectedTours method
    const orderedTourData = selectedTours
      .map((tourId) => tours.find((tour) => tour._id === tourId))
      .filter(Boolean);

    itineraryDetails = orderedTourData
      .map((tour, index) => {
        const tourName = tour.name || "";
        const tourDescription = tour.description || "";
        const tourDetailedDescription = tour.detailedDescription || "";
        const tourHighlights = tour.highlights || [];

        let vipCarInfo = "";
        if (tour.tourType === "VIP") {
          vipCarInfo = `VIP private tour with ${tour.vipCarType} car`;
        }

        return `Day ${englishDayOrdinals[index]}:
${tourName}${tourDescription ? `\n${tourDescription}` : ""}${
          vipCarInfo ? `\n${vipCarInfo}` : ""
        }
${tourDetailedDescription ? `${tourDetailedDescription}\n` : ""}${
          tourHighlights && tourHighlights.length > 0
            ? tourHighlights.map((highlight) => `• ${highlight}`).join("\n")
            : ""
        }`;
      })
      .join("\n\n");
  }

  const itinerary = `${flagsString} ${formattedCities} Package ${flagsString}
🗓 From ${formattedStartDate} to ${formattedEndDate}
⏰ Duration: ${totalNights} night${totalNights !== 1 ? "s" : ""}
${guestsInfo}
💵 Package Price: $${finalPrice}

Includes:

${transportationText ? `${transportationText}\n\n` : ""}
${hotelInfoText}

${tourCount > 0 ? `• Number of Tours: ${tourCount}\n\n` : ""}${
    itineraryDetails ? `• Itinerary Details:\n${itineraryDetails}` : ""
  }`;

  return itinerary;
};
