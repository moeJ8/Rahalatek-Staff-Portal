// Country-City mappings for tour management system
const COUNTRY_CITIES = {
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
    'Tirana', 'Durres', 'Vlore', 'Shkoder', 'Shkodra', 'Fier', 'Korce',
    'Berat', 'Gjirokaster', 'Sarande', 'Kruje'
  ]
};

// Helper functions
const getCountries = () => Object.keys(COUNTRY_CITIES);

const getCitiesByCountry = (country) => COUNTRY_CITIES[country] || [];

const getAllCities = () => {
  return [...new Set(Object.values(COUNTRY_CITIES).flat())];
};

const inferCountryFromCity = (city) => {
  for (const [country, cities] of Object.entries(COUNTRY_CITIES)) {
    if (cities.includes(city)) {
      return country;
    }
  }
  return null;
};

// Validation functions
const isValidCountry = (country) => {
  return getCountries().includes(country);
};

const isValidCityForCountry = (city, country) => {
  return getCitiesByCountry(country).includes(city);
};

module.exports = {
  COUNTRY_CITIES,
  getCountries,
  getCitiesByCountry,
  getAllCities,
  inferCountryFromCity,
  isValidCountry,
  isValidCityForCountry
};
