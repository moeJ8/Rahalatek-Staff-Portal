// Country-City mappings for frontend use
export const COUNTRY_CITIES = {
  "Turkey": [
    // Turkish cities + Fethiye and Bursa
    'Istanbul', 'Antalya', 'Cappadocia', 'Trabzon', 'Bodrum', 'Fethiye', 'Bursa'
  ],
  
  "Malaysia": [
    'Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Johor Bahru',
    'Kota Kinabalu', 'Kuching', 'Cameron Highlands', 'Genting Highlands', 'Selangor'
  ],
  
  "Thailand": [
    'Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi', 'Koh Samui',
    'Hua Hin', 'Ayutthaya', 'Chiang Rai', 'Kanchanaburi'
  ],
  
  "Indonesia": [
    'Jakarta', 'Bali', 'Yogyakarta', 'Bandung', 'Surabaya', 'Medan',
    'Lombok', 'Bogor', 'Malang', 'Solo', 'Ubud', 'Sanur', 'Seminyak'
  ],
  
  "Saudi Arabia": [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 
    'Taif', 'Abha', 'Tabuk', 'Al Khobar'
  ],
  
  "Morocco": [
    'Casablanca', 'Marrakech', 'Rabat', 'Fez', 'Tangier', 'Agadir',
    'Meknes', 'Essaouira', 'Chefchaouen', 'Ouarzazate'
  ],
  
  "Egypt": [
    'Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh',
    'Dahab', 'Marsa Alam', 'Taba', 'Giza'
  ],
  
  "Azerbaijan": [
    'Baku', 'Ganja', 'Sumgayit', 'Mingachevir', 'Qabalah', 'Shaki',
    'Lankaran', 'Shamakhi', 'Quba', 'Gabala'
  ],
  
  "Georgia": [
    'Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Zugdidi', 'Gori',
    'Telavi', 'Mestia', 'Kazbegi', 'Sighnaghi', 'Mtskheta', 'Borjomi'
  ],
  
  "Albania": [
    'Tirana', 'Durres', 'Vlora', 'Shkodra', 'Fier', 'Korce',
    'Berat', 'Gjirokaster', 'Sarande', 'Kruje'
  ]
};

// Helper functions
export const getCountries = () => Object.keys(COUNTRY_CITIES);

export const getCitiesByCountry = (country) => COUNTRY_CITIES[country] || [];

export const getAllCities = () => {
  return [...new Set(Object.values(COUNTRY_CITIES).flat())];
};

export const inferCountryFromCity = (city) => {
  for (const [country, cities] of Object.entries(COUNTRY_CITIES)) {
    if (cities.includes(city)) {
      return country;
    }
  }
  return null;
};

// Validation functions
export const isValidCountry = (country) => {
  return getCountries().includes(country);
};

export const isValidCityForCountry = (city, country) => {
  return getCitiesByCountry(country).includes(city);
};

// Format options for dropdowns
export const getCountryOptions = () => {
  return getCountries().map(country => ({
    value: country,
    label: country
  }));
};

export const getCityOptions = (countries) => {
  // Handle both single country (string) and multiple countries (array)
  if (typeof countries === 'string') {
    return getCitiesByCountry(countries).map(city => ({
      value: city,
      label: city
    }));
  }
  
  // Handle array of countries
  if (Array.isArray(countries) && countries.length > 0) {
    const cities = countries.flatMap(country => getCitiesByCountry(country));
    const uniqueCities = [...new Set(cities)].sort();
    return uniqueCities.map(city => ({
      value: city,
      label: city
    }));
  }
  
  // Return empty array if no countries provided
  return [];
};

// Get transfer cities based on hotel countries
export const getTransferCitiesFromHotelCountries = (hotelCountries) => {
  const uniqueCountries = [...new Set(hotelCountries.filter(Boolean))];
  const cities = uniqueCountries.flatMap(country => getCitiesByCountry(country));
  return [...new Set(cities)].sort();
};

export default {
  COUNTRY_CITIES,
  getCountries,
  getCitiesByCountry,
  getAllCities,
  inferCountryFromCity,
  isValidCountry,
  isValidCityForCountry,
  getCountryOptions,
  getCityOptions,
  getTransferCitiesFromHotelCountries
};
