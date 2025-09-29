import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaArrowLeft, FaHotel, FaRoute, FaCity } from 'react-icons/fa';
import Flag from 'react-world-flags';
import axios from 'axios';
import RahalatekLoader from '../../components/RahalatekLoader';
import CustomButton from '../../components/CustomButton';
import HorizontalScrollbar from '../../components/HorizontalScrollbar';
import TourCard from '../../components/Visitors/TourCard';
import HotelCard from '../../components/Visitors/HotelCard';

const GuestCountryPage = () => {
  const { country } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, _] = useState(null);
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [expandedHighlights, setExpandedHighlights] = useState({});

  // Decode country name from URL
  const countryName = decodeURIComponent(country);

  // Set page title and meta tags with country name
  useEffect(() => {
    document.title = `${countryName} | Rahalatek`;
    
    // Update meta description with country details
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        `Explore ${countryName} with Rahalatek. Discover amazing tours, luxury hotels, and premium accommodations in ${countryName}. Book your perfect travel experience today.`
      );
    }

    // Update keywords with country-specific terms
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        `${countryName}, ${countryName} tours, ${countryName} hotels, ${countryName} travel, ${countryName} tourism, ${countryName} vacation, travel to ${countryName}, ${countryName} destinations, ${countryName} experiences`
      );
    }

    // Update Open Graph with country details
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `Explore ${countryName} | Rahalatek`);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        `Explore ${countryName} with Rahalatek. Discover amazing tours, luxury hotels, and premium accommodations in ${countryName}.`
      );
    }
  }, [countryName]);

  // Country data with comprehensive information
  const getCountryData = (countryName) => {
    const countries = {
      'Turkey': {
        code: 'TR',
        heroImage: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&h=600&fit=crop&q=80',
        overview: 'Turkey is a transcontinental country located mainly on the Anatolian Peninsula in Western Asia, with a smaller portion on the Balkan Peninsula in Southeast Europe. With a rich history spanning ancient civilizations, Byzantine and Ottoman empires, Turkey offers visitors an incredible blend of cultures, stunning landscapes, and world-class hospitality. From the fairy chimneys of Cappadocia to the beautiful Mediterranean coast, from the historic streets of Istanbul to the pristine beaches of Antalya, Turkey provides unforgettable experiences for every type of traveler.',
        cities: [
          { name: 'Istanbul', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop&q=80', description: 'Historic city bridging Europe and Asia' },
          { name: 'Cappadocia', image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&q=80', description: 'Famous for hot air balloons and fairy chimneys' },
          { name: 'Antalya', image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=300&fit=crop&q=80', description: 'Beautiful Mediterranean coastal city' },
          { name: 'Pamukkale', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80', description: 'Natural thermal pools and terraces' },
          { name: 'Bodrum', image: 'https://images.unsplash.com/photo-1622214530775-87e1b30c6f17?w=400&h=300&fit=crop&q=80', description: 'Vibrant coastal resort town with ancient castle' },
          { name: 'Ephesus', image: 'https://images.unsplash.com/photo-1612151355494-8beb73675bdb?w=400&h=300&fit=crop&q=80', description: 'Ancient Greek and Roman archaeological site' },
          { name: 'Trabzon', image: 'https://images.unsplash.com/photo-1618092041823-9b97de203ad9?w=400&h=300&fit=crop&q=80', description: 'Black Sea city with Sumela Monastery' },
          { name: 'Kas', image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=300&fit=crop&q=80', description: 'Charming Mediterranean diving paradise' }
        ]
      },
      'Malaysia': {
        code: 'MY',
        heroImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=600&fit=crop&q=80',
        overview: 'Malaysia is a Southeast Asian country occupying parts of the Malay Peninsula and the island of Borneo. Known for its beaches, rainforests, and mix of Malay, Chinese, Indian, and European cultural influences, Malaysia offers incredible diversity in a compact area. From the modern skyline of Kuala Lumpur to the colonial architecture of Penang, from the pristine beaches of Langkawi to the ancient rainforests of Borneo, Malaysia provides visitors with unforgettable experiences and warm hospitality.',
        cities: [
          { name: 'Kuala Lumpur', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop&q=80', description: 'Modern capital with iconic Petronas Towers' },
          { name: 'Penang', image: 'https://images.unsplash.com/photo-1571200669781-0b701df0de68?w=400&h=300&fit=crop&q=80', description: 'UNESCO World Heritage site with rich culture' },
          { name: 'Langkawi', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80', description: 'Beautiful tropical island paradise' },
          { name: 'Malacca', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80', description: 'Historic city with colonial charm' },
          { name: 'Kota Kinabalu', image: 'https://images.unsplash.com/photo-1596738012750-3707c22e4bb5?w=400&h=300&fit=crop&q=80', description: 'Gateway to Mount Kinabalu and Borneo adventures' },
          { name: 'Johor Bahru', image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop&q=80', description: 'Modern border city with theme parks' },
          { name: 'Cameron Highlands', image: 'https://images.unsplash.com/photo-1567202417690-a21b4b2cf7b3?w=400&h=300&fit=crop&q=80', description: 'Cool highland retreat with tea plantations' },
          { name: 'Kuching', image: 'https://images.unsplash.com/photo-1586183778882-44e7b5c1e9a4?w=400&h=300&fit=crop&q=80', description: 'Cat city and gateway to Sarawak rainforests' }
        ]
      },
      'Thailand': {
        code: 'TH',
        heroImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&h=600&fit=crop&q=80',
        overview: 'Thailand, known as the "Land of Smiles," is a Southeast Asian country famous for its tropical beaches, opulent royal palaces, ancient ruins, and ornate temples displaying figures of Buddha. The country offers an incredible mix of bustling cities, peaceful temples, pristine beaches, and lush jungles. From the vibrant street life of Bangkok to the stunning islands of the south, from the cultural richness of Chiang Mai to the historical significance of Ayutthaya, Thailand provides visitors with diverse experiences and legendary Thai hospitality.',
        cities: [
          { name: 'Bangkok', image: 'https://images.unsplash.com/photo-1563492065-4c9a4ed7c42d?w=400&h=300&fit=crop&q=80', description: 'Vibrant capital with temples and street food' },
          { name: 'Chiang Mai', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop&q=80', description: 'Cultural hub in northern Thailand' },
          { name: 'Phuket', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80', description: 'Famous beach destination and island paradise' },
          { name: 'Koh Phi Phi', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop&q=80', description: 'Stunning tropical islands and crystal-clear waters' },
          { name: 'Ayutthaya', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&q=80', description: 'Ancient capital with magnificent temple ruins' },
          { name: 'Krabi', image: 'https://images.unsplash.com/photo-1552550049-db097c9480d1?w=400&h=300&fit=crop&q=80', description: 'Limestone cliffs and pristine beaches' },
          { name: 'Pattaya', image: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop&q=80', description: 'Vibrant beach resort city' },
          { name: 'Koh Samui', image: 'https://images.unsplash.com/photo-1561461696-6e4b8bb1b3c1?w=400&h=300&fit=crop&q=80', description: 'Tropical island with coconut groves and beaches' }
        ]
      },
      'Indonesia': {
        code: 'ID',
        heroImage: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&h=600&fit=crop&q=80',
        overview: 'Indonesia is the world\'s largest archipelago, consisting of over 17,000 islands stretching across Southeast Asia. This diverse nation offers incredible natural beauty, rich cultural heritage, and warm hospitality. From the ancient temples of Java to the pristine beaches of Bali, from the orangutans of Borneo to the Komodo dragons of Flores, Indonesia provides endless opportunities for adventure and discovery. With hundreds of ethnic groups and languages, Indonesia offers visitors a truly unique and diverse travel experience.',
        cities: [
          { name: 'Bali', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop&q=80', description: 'Island paradise with temples and beaches' },
          { name: 'Jakarta', image: 'https://images.unsplash.com/photo-1555980221-2b0f44fce7cf?w=400&h=300&fit=crop&q=80', description: 'Bustling capital city' },
          { name: 'Yogyakarta', image: 'https://images.unsplash.com/photo-1595435742656-5272d0d4080f?w=400&h=300&fit=crop&q=80', description: 'Cultural heart of Java with ancient temples' },
          { name: 'Lombok', image: 'https://images.unsplash.com/photo-1517632287068-b1a5ba0fe8e6?w=400&h=300&fit=crop&q=80', description: 'Pristine beaches and Mount Rinjani' },
          { name: 'Ubud', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop&q=80', description: 'Cultural heart of Bali with rice terraces' },
          { name: 'Komodo Island', image: 'https://images.unsplash.com/photo-1541600383154-61c5b22bf938?w=400&h=300&fit=crop&q=80', description: 'Home to the famous Komodo dragons' },
          { name: 'Bandung', image: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=300&fit=crop&q=80', description: 'Cool mountain city known for fashion and food' },
          { name: 'Gili Islands', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop&q=80', description: 'Three paradise islands near Lombok' }
        ]
      },
      'Saudi Arabia': {
        code: 'SA',
        heroImage: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1200&h=600&fit=crop&q=80',
        overview: 'Saudi Arabia, the birthplace of Islam and home to its two holiest cities, Mecca and Medina, is a country of immense historical and cultural significance. Recently opened to tourism, Saudi Arabia offers visitors a unique opportunity to explore ancient heritage sites, modern architectural marvels, and stunning natural landscapes. From the rock formations of Al-Ula to the futuristic city of NEOM, from the Empty Quarter desert to the Red Sea coast, Saudi Arabia provides an extraordinary blend of tradition and innovation.',
        cities: [
          { name: 'Riyadh', image: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=400&h=300&fit=crop&q=80', description: 'Modern capital with skyscrapers and heritage' },
          { name: 'Al-Ula', image: 'https://images.unsplash.com/photo-1573160103600-34419185a351?w=400&h=300&fit=crop&q=80', description: 'Ancient heritage site with stunning rock formations' },
          { name: 'Jeddah', image: 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=400&h=300&fit=crop&q=80', description: 'Historic port city on the Red Sea' },
          { name: 'Taif', image: 'https://images.unsplash.com/photo-1562004340-d513bc476c0d?w=400&h=300&fit=crop&q=80', description: 'Mountain city known for roses and cool climate' },
          { name: 'Abha', image: 'https://images.unsplash.com/photo-1595435742656-5272d0d4080f?w=400&h=300&fit=crop&q=80', description: 'Mountain resort city with cool climate' },
          { name: 'Dammam', image: 'https://images.unsplash.com/photo-1574482620223-1b1d50e8bcc7?w=400&h=300&fit=crop&q=80', description: 'Eastern province capital on the Arabian Gulf' },
          { name: 'Najran', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80', description: 'Historical city near the Yemen border' },
          { name: 'Yanbu', image: 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80', description: 'Red Sea port city with beautiful beaches' }
        ]
      },
      'Morocco': {
        code: 'MA',
        heroImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&h=600&fit=crop&q=80',
        overview: 'Morocco is a North African country that has captivated travelers for centuries with its imperial cities, stunning architecture, vibrant markets, and diverse landscapes. From the bustling souks of Marrakech to the blue-painted streets of Chefchaouen, from the Sahara Desert to the Atlantic coast, Morocco offers an exotic blend of Arab, Berber, and European influences. The country\'s rich history, delicious cuisine, and warm hospitality make it an unforgettable destination for cultural exploration and adventure.',
        cities: [
          { name: 'Marrakech', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop&q=80', description: 'Imperial city with vibrant souks and palaces' },
          { name: 'Chefchaouen', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop&q=80', description: 'Beautiful blue city in the mountains' },
          { name: 'Fes', image: 'https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80', description: 'Ancient imperial city with the world\'s largest medina' },
          { name: 'Casablanca', image: 'https://images.unsplash.com/photo-1560725252-9eb432d3db01?w=400&h=300&fit=crop&q=80', description: 'Modern economic capital with Hassan II Mosque' },
          { name: 'Rabat', image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=300&fit=crop&q=80', description: 'Capital city with royal palaces and gardens' },
          { name: 'Essaouira', image: 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80', description: 'Coastal city with Portuguese fortifications' },
          { name: 'Meknes', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80', description: 'Imperial city with impressive architecture' },
          { name: 'Agadir', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80', description: 'Modern beach resort on the Atlantic coast' }
        ]
      },
      'Egypt': {
        code: 'EG',
        heroImage: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&h=600&fit=crop&q=80',
        overview: 'Egypt, the cradle of civilization, offers visitors an incredible journey through ancient history and modern culture. Home to the iconic Pyramids of Giza, the magnificent temples of Luxor, and the life-giving Nile River, Egypt has fascinated travelers for millennia. From the bustling streets of Cairo to the pristine beaches of the Red Sea, from the Valley of the Kings to the modern resort city of Sharm El Sheikh, Egypt provides an unparalleled mix of archaeological wonders, cultural richness, and natural beauty.',
        cities: [
          { name: 'Cairo', image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=300&fit=crop&q=80', description: 'Capital city with pyramids and ancient treasures' },
          { name: 'Luxor', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop&q=80', description: 'Open-air museum with magnificent temples' },
          { name: 'Aswan', image: 'https://images.unsplash.com/photo-1550053267-13a2e6b3eac4?w=400&h=300&fit=crop&q=80', description: 'Beautiful Nile city with Nubian culture' },
          { name: 'Sharm El Sheikh', image: 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80', description: 'Red Sea resort with world-class diving' },
          { name: 'Hurghada', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80', description: 'Red Sea resort town with beautiful coral reefs' },
          { name: 'Alexandria', image: 'https://images.unsplash.com/photo-1574482620223-1b1d50e8bcc7?w=400&h=300&fit=crop&q=80', description: 'Historic Mediterranean port city' },
          { name: 'Dahab', image: 'https://images.unsplash.com/photo-1561461696-6e4b8bb1b3c1?w=400&h=300&fit=crop&q=80', description: 'Laid-back Sinai Peninsula diving destination' },
          { name: 'Abu Simbel', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80', description: 'Ancient temples of Ramesses II' }
        ]
      },
      'Azerbaijan': {
        code: 'AZ',
        heroImage: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=1200&h=600&fit=crop&q=80',
        overview: 'Azerbaijan, known as the "Land of Fire," is a transcontinental country located at the boundary of Eastern Europe and Western Asia. This fascinating nation offers visitors a unique blend of ancient culture and modern architecture, stunning natural landscapes, and rich traditions. From the futuristic skyline of Baku to the ancient fire temples, from the mud volcanoes to the Caspian Sea shores, Azerbaijan provides an intriguing mix of history, culture, and natural wonders that few travelers have yet discovered.',
        cities: [
          { name: 'Baku', image: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop&q=80', description: 'Capital city with Flame Towers and old city' },
          { name: 'Ganja', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80', description: 'Second largest city with rich history' },
          { name: 'Sheki', image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop&q=80', description: 'Historic city with beautiful palace and crafts' },
          { name: 'Quba', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80', description: 'Mountain city known for carpets and apples' },
          { name: 'Gabala', image: 'https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80', description: 'Mountain resort town with beautiful nature' },
          { name: 'Lankaran', image: 'https://images.unsplash.com/photo-1567202417690-a21b4b2cf7b3?w=400&h=300&fit=crop&q=80', description: 'Subtropical city near the Iranian border' },
          { name: 'Nakhchivan', image: 'https://images.unsplash.com/photo-1595435742656-5272d0d4080f?w=400&h=300&fit=crop&q=80', description: 'Autonomous exclave with ancient monuments' },
          { name: 'Shamakhi', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80', description: 'Historic city with ancient observatories' }
        ]
      },
      'Georgia': {
        code: 'GE',
        heroImage: 'https://images.unsplash.com/photo-1571104508999-893933ded431?w=1200&h=600&fit=crop&q=80',
        overview: 'Georgia, situated at the crossroads of Europe and Asia, is a country of incredible diversity and beauty. Known for its ancient wine-making traditions, stunning mountain landscapes, and legendary hospitality, Georgia offers visitors an authentic and unforgettable experience. From the charming capital Tbilisi with its sulfur baths and old town to the wine regions of Kakheti, from the dramatic peaks of the Caucasus Mountains to the Black Sea coast, Georgia provides a perfect blend of culture, nature, and adventure.',
        cities: [
          { name: 'Tbilisi', image: 'https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&h=300&fit=crop&q=80', description: 'Charming capital with sulfur baths and old town' },
          { name: 'Batumi', image: 'https://images.unsplash.com/photo-1576154421306-9ff4b57e4112?w=400&h=300&fit=crop&q=80', description: 'Black Sea resort city with modern architecture' },
          { name: 'Mtskheta', image: 'https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80', description: 'Ancient capital and UNESCO World Heritage site' },
          { name: 'Kazbegi', image: 'https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80', description: 'Mountain town with stunning Caucasus views' },
          { name: 'Svaneti', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80', description: 'Remote region with medieval towers' },
          { name: 'Kakheti', image: 'https://images.unsplash.com/photo-1567202417690-a21b4b2cf7b3?w=400&h=300&fit=crop&q=80', description: 'Wine region with ancient monasteries' },
          { name: 'Kutaisi', image: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop&q=80', description: 'Ancient city with UNESCO World Heritage sites' },
          { name: 'Borjomi', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80', description: 'Spa town famous for mineral water' }
        ]
      },
      'Albania': {
        code: 'AL',
        heroImage: 'https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=1200&h=600&fit=crop&q=80',
        overview: 'Albania, hidden gem of the Balkans, offers visitors pristine beaches, rugged mountains, and a rich cultural heritage largely undiscovered by mass tourism. This Mediterranean country provides incredible value and authentic experiences, from the UNESCO World Heritage sites of Berat and Gjirokastër to the stunning Albanian Riviera, from the vibrant capital Tirana to the dramatic Albanian Alps. With its warm hospitality, delicious cuisine, and diverse landscapes, Albania is quickly becoming one of Europe\'s most exciting emerging destinations.',
        cities: [
          { name: 'Tirana', image: 'https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=400&h=300&fit=crop&q=80', description: 'Colorful capital city with vibrant culture' },
          { name: 'Berat', image: 'https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80', description: 'UNESCO city known as "City of a Thousand Windows"' },
          { name: 'Saranda', image: 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80', description: 'Beautiful coastal town on the Albanian Riviera' },
          { name: 'Gjirokastër', image: 'https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80', description: 'Stone city with Ottoman architecture' },
          { name: 'Valbona', image: 'https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80', description: 'Alpine valley in the Albanian Alps' },
          { name: 'Shkodra', image: 'https://images.unsplash.com/photo-1571200669781-0b701df0de68?w=400&h=300&fit=crop&q=80', description: 'Historical city near Lake Shkodra' },
          { name: 'Ksamil', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80', description: 'Small village with pristine beaches' },
          { name: 'Kruje', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80', description: 'Historic town and birthplace of Skanderbeg' }
        ]
      }
    };
    return countries[countryName] || { 
      code: null, 
      heroImage: null, 
      overview: 'Discover this amazing destination with its unique culture and beautiful landscapes.',
      cities: []
    };
  };

  const countryData = getCountryData(countryName);

  // Toggle highlights function for TourCard
  const toggleHighlights = (tourId) => {
    setExpandedHighlights(prev => ({
      ...prev,
      [tourId]: !prev[tourId]
    }));
  };


  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get country data for this specific country
        const currentCountryData = getCountryData(countryName);
        
        // Set cities from static data immediately
        setCities(currentCountryData.cities);
        setCitiesLoading(false);
        
        // Fetch tours and hotels from backend
        const [toursResponse, hotelsResponse] = await Promise.all([
          axios.get(`/api/tours/country/${encodeURIComponent(countryName)}`),
          axios.get(`/api/hotels/country/${encodeURIComponent(countryName)}`)
        ]);
        
        // Sort by views (descending) and take top 6 items for 3x2 grid
        const sortedTours = toursResponse.data
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 6);
        
        const sortedHotels = hotelsResponse.data
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 6);
        
        setTours(sortedTours);
        setHotels(sortedHotels);
        setToursLoading(false);
        setHotelsLoading(false);
        
        // Set loading to false
        setLoading(false);
      } catch (error) {
        console.error('Error loading country data:', error);
        // Don't set error for individual API failures, just log them
        if (error.response?.status !== 404) {
          console.error('API Error:', error.response?.data?.message || error.message);
        }
        
        // Set empty arrays if API calls fail
        setTours([]);
        setHotels([]);
        setToursLoading(false);
        setHotelsLoading(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [countryName]);



  const CityCard = ({ city }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group">
      <div className="h-48 relative overflow-hidden">
        <img 
          src={city.image} 
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold mb-1">{city.name}</h3>
          <p className="text-gray-200 text-sm">{city.description}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <CustomButton
            variant="rippleBlueToYellowTeal"
            onClick={() => navigate('/guest')}
          >
            Return to Homepage
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative h-96 sm:h-[500px] md:h-[600px] overflow-hidden -mt-6">
        <div className="absolute inset-0">
          <img
            src={countryData.heroImage}
            alt={countryName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Homepage</span>
        </button>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {countryData.code && (
                <Flag 
                  code={countryData.code} 
                  height="48" 
                  width="72"
                  className="rounded-sm shadow-lg border border-white/20"
                />
              )}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                {countryName}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaMapMarkerAlt className="w-6 h-6 text-blue-600 dark:text-teal-400 mr-3" />
              About {countryName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              {countryData.overview}
            </p>
          </div>
        </section>

        {/* Cities Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaCity className="w-6 h-6 text-blue-600 dark:text-teal-400 mr-3" />
              Popular Cities
            </h2>
          </div>

          {citiesLoading ? (
            <div className="flex justify-center py-12">
              <RahalatekLoader size="lg" />
            </div>
          ) : cities.length > 0 ? (
            <HorizontalScrollbar className="pb-4">
              <div className="flex gap-6" style={{ width: 'max-content' }}>
                {cities.map((city, index) => (
                  <div key={index} className="flex-shrink-0 w-80">
                    <CityCard city={city} />
                  </div>
                ))}
              </div>
            </HorizontalScrollbar>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaCity className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Cities Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're working on adding popular cities for {countryName}.
              </p>
            </div>
          )}
        </section>

        {/* Tours Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaRoute className="w-6 h-6 text-blue-600 dark:text-teal-400 mr-3" />
              Featured Tours
            </h2>
            {tours.length > 0 && (
              <CustomButton
                variant="rippleBlueToYellowTeal"
                size="md"
                onClick={() => navigate(`/tours?country=${encodeURIComponent(countryName)}`)}
              >
                View All Tours
              </CustomButton>
            )}
          </div>

          {toursLoading ? (
            <div className="flex justify-center py-12">
              <RahalatekLoader size="lg" />
            </div>
          ) : tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard
                  key={tour._id}
                  tour={tour}
                  expandedHighlights={expandedHighlights}
                  onToggleHighlights={toggleHighlights}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaRoute className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Tours Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're working on adding amazing tours for {countryName}. Check back soon!
              </p>
            </div>
          )}
        </section>

        {/* Hotels Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaHotel className="w-6 h-6 text-blue-600 dark:text-teal-400 mr-3" />
              Featured Hotels
            </h2>
            {hotels.length > 0 && (
              <CustomButton
                variant="rippleBlueToYellowTeal"
                size="md"
                onClick={() => navigate(`/hotels?country=${encodeURIComponent(countryName)}`)}
              >
                View All Hotels
              </CustomButton>
            )}
          </div>

          {hotelsLoading ? (
            <div className="flex justify-center py-12">
              <RahalatekLoader size="lg" />
            </div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel._id}
                  hotel={hotel}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaHotel className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Hotels Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're working on adding luxury accommodations for {countryName}. Check back soon!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GuestCountryPage;
