import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaStar, FaMapMarkerAlt, FaWifi, FaCoffee, FaCar, FaChild, FaPhone, FaEnvelope, 
  FaCheckCircle, FaUsers, FaBed, FaCalendarAlt, FaPlane, FaBus, FaShuttleVan,
  FaDumbbell, FaSpa, FaUtensilSpoon, FaConciergeBell, FaParking,
  FaGamepad, FaBaby, FaVolleyballBall, FaMusic, FaBicycle, FaTheaterMasks,
  FaWineGlass, FaShoppingCart, FaCut, FaKey, FaBuilding, FaDesktop, FaHandshake,
  FaUmbrella, FaTree, FaWheelchair, FaMicrophone, FaGlobe, FaTv,
  FaShower, FaBath, FaTshirt, FaStore, FaGift, FaBell, FaLanguage, FaHeart,
  FaRing, FaTicketAlt, FaMapMarked, FaSuitcase, FaSnowflake, FaFan, FaSoap,
  FaBook, FaGuitar, FaCamera, FaFish, FaShip, FaSun, FaMoon, FaLeaf,
  FaVolumeDown, FaWater, FaHands
} from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import ImageGallery from '../../components/ImageGallery';
import RahalatekLoader from '../../components/RahalatekLoader';
import HotelRoomsCarousel from '../../components/HotelRoomsCarousel';
import OtherHotelsCarousel from '../../components/OtherHotelsCarousel';
import ModalScrollbar from '../../components/ModalScrollbar';
import CustomModal from '../../components/CustomModal';
import GuestNotFoundPage from './GuestNotFoundPage';
import NotFoundPage from '../NotFoundPage';
import { getTranslatedText } from '../../utils/translationUtils';

const PublicHotelPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [_selectedRoomType, setSelectedRoomType] = useState(null);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [otherHotels, setOtherHotels] = useState([]);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  // Get current month for pricing


  const fetchOtherHotels = async () => {
    try {
      const response = await axios.get('/api/hotels/public');
      setOtherHotels(response.data);
    } catch (error) {
      console.error('Failed to fetch other hotels:', error);
    }
  };

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        if (!slug || slug === 'undefined') {
          toast.error('Invalid hotel URL');
          navigate('/');
          return;
        }

        // Add language parameter to the API request (only for ar/fr)
        const langParam = (i18n.language === 'ar' || i18n.language === 'fr') ? `?lang=${i18n.language}` : '';
        const response = await axios.get(`/api/hotels/public/${slug}${langParam}`);
        const hotelData = response.data;
        setHotel(hotelData);
        
        // Set dynamic page title and meta tags with hotel data
        if (hotelData && hotelData.name) {
          document.title = `${hotelData.name} | Rahalatek`;
          
          // Update meta description with hotel details
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            const description = hotelData.description 
              ? hotelData.description.substring(0, 150) + '...'
              : `Experience luxury at ${hotelData.name} with Rahalatek. ${hotelData.stars}-star hotel in ${hotelData.city}, ${hotelData.country}. Premium accommodations and excellent service.`;
            metaDescription.setAttribute('content', description);
          }

          // Update keywords with hotel-specific terms
          const metaKeywords = document.querySelector('meta[name="keywords"]');
          if (metaKeywords) {
            const keywords = `${hotelData.name}, ${hotelData.city}, ${hotelData.country}, ${hotelData.stars} star hotel, luxury hotel, hotel booking, accommodations, hospitality, premium hotel, travel, tourism`;
            metaKeywords.setAttribute('content', keywords);
          }

          // Update Open Graph with hotel details
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) {
            ogTitle.setAttribute('content', `${hotelData.name} | Rahalatek`);
          }

          const ogDescription = document.querySelector('meta[property="og:description"]');
          if (ogDescription) {
            const ogDesc = hotelData.description
              ? hotelData.description.substring(0, 200) + '...'
              : `Experience luxury at ${hotelData.name} with Rahalatek. ${hotelData.stars}-star hotel in ${hotelData.city}, ${hotelData.country}.`;
            ogDescription.setAttribute('content', ogDesc);
          }

          // Add hreflang tags for SEO
          const currentPath = window.location.pathname;
          const pathWithoutLang = currentPath.replace(/^\/(ar|fr)/, '') || '/hotels';

          // Remove existing hreflang tags
          const existingTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
          existingTags.forEach(tag => tag.remove());

          // Add hreflang tags for all language versions
          const languages = [
            { code: 'en', name: 'English' },
            { code: 'ar', name: 'Arabic' },
            { code: 'fr', name: 'French' }
          ];

          languages.forEach(({ code }) => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = code;

            // Build the full URL for this language
            const baseUrl = window.location.origin;
            if (code === 'en') {
              link.href = `${baseUrl}${pathWithoutLang}`;
            } else {
              link.href = `${baseUrl}/${code}${pathWithoutLang}`;
            }

            document.head.appendChild(link);
          });

          // Add x-default hreflang for English
          const defaultLink = document.createElement('link');
          defaultLink.rel = 'alternate';
          defaultLink.hreflang = 'x-default';
          defaultLink.href = `${window.location.origin}${pathWithoutLang}`;
          document.head.appendChild(defaultLink);
        }
        
        if (hotelData.roomTypes && hotelData.roomTypes.length > 0) {
          setSelectedRoomType(hotelData.roomTypes[0]);
        }

        // Fetch other hotels
        await fetchOtherHotels();
      } catch (error) {
        console.error('Failed to fetch hotel:', error);
        setHotel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [slug, navigate, i18n.language]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };


  // Get all selected amenities from all categories
  const getAllSelectedAmenities = () => {
    if (!hotel?.amenities) return [];
    
    const allAmenities = [];
    
    Object.entries(hotel.amenities).forEach(([categoryKey, categoryData]) => {
      if (typeof categoryData === 'object' && categoryData !== null) {
        Object.entries(categoryData).forEach(([amenityKey, value]) => {
          if (value === true) {
            // Try to get translation first, fallback to formatted key
            const translationKey = `publicHotelPage.amenities.${categoryKey}.${amenityKey}`;
            const amenityName = t(translationKey, {
              defaultValue: amenityKey
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim()
                .replace(/Wifi/i, 'WiFi')
                .replace(/24h/i, '24/7')
                .replace(/Ac/i, 'AC')
            });
            
            allAmenities.push({
              key: amenityKey,
              name: amenityName,
              category: categoryKey
            });
          }
        });
      }
    });
    
    return allAmenities;
  };

  const getAmenityIcon = (amenityKey) => {
    const iconMap = {
      // Top Family-Friendly Amenities
      gameRoom: <FaGamepad className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      toysGames: <FaChild className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      waterslide: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      waterslideFacility: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      waterslideFamily: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      kidsClub: <FaChild className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      freeChildrensClub: <FaChild className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      freeChildrensClubFamily: <FaChild className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      kidsPool: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      childrensPool: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      childrensPoolFamily: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      babysitting: <FaBaby className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      inRoomBabysitting: <FaBaby className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      tennisCourt: <FaVolleyballBall className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      outdoorTennisCourts: <FaVolleyballBall className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      tennisLessons: <FaVolleyballBall className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      soundproofRooms: <FaVolumeDown className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      soundproofed: <FaVolumeDown className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      soundproofedRooms: <FaVolumeDown className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      groceryConvenienceStore: <FaShoppingCart className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      groceryConvenienceStoreFamily: <FaShoppingCart className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      groceryConvenienceStoreConvenience: <FaShoppingCart className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,

      // Popular Amenities  
      bar: <FaWineGlass className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      barsLounges: <FaWineGlass className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      beachBar: <FaUmbrella className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      poolsideBars: <FaWineGlass className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      pool: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      outdoorPools: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      outdoorPoolsFamily: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      indoorPool: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      indoorPoolFamily: <FaWater className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      allInclusive: <FaCheckCircle className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      breakfastIncluded: <FaCoffee className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      buffetBreakfast: <FaCoffee className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      coffeeTeaCommonAreas: <FaCoffee className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      gym: <FaDumbbell className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      gymFacility: <FaDumbbell className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      fitnessClasses: <FaDumbbell className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      roomService: <FaConciergeBell className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      laundry: <FaTshirt className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      laundryFacilities: <FaTshirt className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      laundryFacilitiesConvenience: <FaTshirt className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      dryCleaningLaundry: <FaTshirt className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      housekeeping: <FaSoap className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      housekeepingDaily: <FaSoap className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      frontDesk24h: <FaBell className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      frontDesk24hConvenience: <FaBell className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      spa: <FaSpa className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      fullServiceSpa: <FaSpa className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      saunaFacility: <FaFan className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      steamRoom: <FaSnowflake className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      airConditioning: <FaSnowflake className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      parkingIncluded: <FaParking className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      freeSelfParking: <FaParking className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      freeWiFi: <FaWifi className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      freeWiFiPublicAreas: <FaWifi className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      restaurant: <FaUtensilSpoon className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      restaurants: <FaUtensilSpoon className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      snackBarDeli: <FaStore className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      snackBarDeliFamily: <FaStore className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,

      // Business Services
      businessCenter24h: <FaBuilding className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      conferenceSpace: <FaHandshake className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      computerStation: <FaDesktop className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      coworkingSpace: <FaUsers className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      meetingRoom: <FaUsers className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,

      // Parking and Transportation
      airportShuttle24h: <FaPlane className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      accessibleAirportShuttle: <FaPlane className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,

      // Additional amenities with consistent blue/teal colors
      arcadeGameRoom: <FaGamepad className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      arcadeGameRoomFamily: <FaGamepad className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      games: <FaGamepad className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      childrensGames: <FaGamepad className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      beachVolleyball: <FaVolleyballBall className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      billiardsPoolTable: <FaGamepad className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      bowlingAlley: <FaGamepad className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      bowlingAlleyFamily: <FaGamepad className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      concertsLiveShows: <FaMusic className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      eveningEntertainment: <FaTheaterMasks className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      freeBicycleRentals: <FaBicycle className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      karaoke: <FaMicrophone className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      nightclub: <FaMusic className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      parasailing: <FaUmbrella className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      playground: <FaChild className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      playgroundFamily: <FaChild className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      racquetballSquash: <FaVolleyballBall className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      sailing: <FaShip className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      scubaDiving: <FaFish className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      shopping: <FaShoppingCart className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      tableTennis: <FaVolleyballBall className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      waterSkiing: <FaFish className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      windsurfing: <FaShip className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      yogaClasses: <FaLeaf className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      
      // Family & Convenience
      childrensToys: <FaChild className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      freeSupervisedActivities: <FaUsers className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      stroller: <FaBaby className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      giftShopNewsstand: <FaGift className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      hairSalon: <FaCut className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      lockers: <FaKey className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      safeFrontDesk: <FaKey className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      
      // Guest Services
      changeOfBedsheets: <FaBed className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      changeOfTowels: <FaBath className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      conciergeServices: <FaConciergeBell className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      multilingualStaff: <FaLanguage className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      porterBellhop: <FaSuitcase className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      proposalRomancePackages: <FaHeart className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      weddingServices: <FaRing className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      tourTicketAssistance: <FaTicketAlt className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      
      // Outdoor & Accessibility
      beachLoungers: <FaUmbrella className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      beachTowels: <FaBath className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      beachUmbrellas: <FaUmbrella className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      garden: <FaTree className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      onTheBay: <FaShip className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      onTheBeach: <FaSun className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      outdoorEntertainmentArea: <FaMusic className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      outdoorFurniture: <FaTree className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      poolLoungers: <FaUmbrella className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      poolUmbrellas: <FaUmbrella className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      terrace: <FaTree className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      accessibleRoom: <FaWheelchair className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      elevator: <FaUsers className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      poolHoist: <FaWheelchair className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      wellLitPath: <FaSun className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      wheelchairAccessible: <FaWheelchair className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      wheelchairAccessiblePath: <FaWheelchair className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      wheelchairAccessibleWashroom: <FaWheelchair className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      wheelchairAccessibleDesk: <FaWheelchair className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      
      // Spa & Room Amenities
      bodyScrubs: <FaHands className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      bodyWraps: <FaHands className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      facials: <FaSpa className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      manicuresPedicures: <FaCut className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      massage: <FaHands className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      saunaService: <FaFan className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      spaOpenDaily: <FaSpa className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      turkishBath: <FaBath className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      balcony: <FaTree className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      minibar: <FaWineGlass className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      safe: <FaKey className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      tv: <FaTv className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      hairdryer: <FaFan className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      bathrobes: <FaTshirt className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      freeCots: <FaBed className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      smokingAllowed: <FaFan className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      petFriendly: <FaHeart className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      
      // Languages & Miscellaneous
      dutch: <FaLanguage className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      english: <FaLanguage className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      french: <FaLanguage className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      german: <FaLanguage className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      russian: <FaLanguage className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      turkish: <FaLanguage className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      twoFloors: <FaBuilding className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      ledLighting80Percent: <FaSun className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      locallySourcedFood80Percent: <FaLeaf className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      banquetHall: <FaUsers className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      builtIn1999: <FaBuilding className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      designatedSmokingAreas: <FaFan className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      mediterraneanArchitecture: <FaBuilding className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      vegetarianBreakfast: <FaLeaf className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      vegetarianDining: <FaLeaf className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      italian: <FaUtensilSpoon className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      buffetMeals: <FaUtensilSpoon className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      seafood: <FaFish className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,
      sevenTwentyFour: <FaBell className="w-5 h-5 text-blue-500 dark:text-yellow-400" />,

      // Generic icon for any unmatched amenities
      default: <FaCheckCircle className="w-5 h-5 text-blue-500 dark:text-yellow-400" />
    };
    
    return iconMap[amenityKey] || iconMap.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="lg" />
      </div>
    );
  }

  if (!hotel) {
    // Check if user is authenticated to show appropriate 404 page
    const user = localStorage.getItem('user');
    return user ? <NotFoundPage /> : <GuestNotFoundPage type="hotel" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-2 sm:pt-4 md:pt-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        {/* Hotel Title */}
        <div className="mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{hotel.name}</h1>
          <div className={`flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 ${isRTL ? 'sm:space-x-reverse sm:space-x-4' : 'sm:space-x-4'}`}>
            <div className={`flex items-center text-gray-600 dark:text-gray-400 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base">
                {t(`publicHotelPage.cities.${hotel.city}`, hotel.city)}, {t(`publicHotelPage.countries.${hotel.country}`, hotel.country)}
              </span>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              {renderStars(hotel.stars)}
              <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {hotel.stars} {t('publicHotelPage.starProperty')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Image Gallery */}
        <ImageGallery 
          images={hotel.images ? [...hotel.images].sort((a, b) => b.isPrimary - a.isPrimary) : []} 
          title={hotel.name}
          className="h-[200px] xs:h-[220px] sm:h-[280px] md:h-[320px] lg:h-[400px]"
        />
        
        {/* Navigation Bar */}
        <div className="mt-3 sm:mt-4">
          <div className="flex justify-center overflow-x-auto scrollbar-hide gap-1 sm:gap-2 md:gap-4 px-4 pb-2 sm:pb-0">
            <button 
              onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              {t('publicHotelPage.nav.overview')}
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
            </button>
            {hotel.roomTypes && hotel.roomTypes.length > 0 && (
              <button 
                onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                {t('publicHotelPage.nav.rooms')}
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
              </button>
            )}
            <button 
              onClick={() => document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              {t('publicHotelPage.nav.amenities')}
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
            </button>
            {hotel.transportation && (
              hotel.transportation.vitoReceptionPrice > 0 || 
              hotel.transportation.vitoFarewellPrice > 0 || 
              hotel.transportation.sprinterReceptionPrice > 0 || 
              hotel.transportation.sprinterFarewellPrice > 0 || 
              hotel.transportation.busReceptionPrice > 0 || 
              hotel.transportation.busFarewellPrice > 0
            ) && (
              <button 
                onClick={() => document.getElementById('transportation')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                {t('publicHotelPage.nav.transportation')}
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
              </button>
            )}
            {hotel.locationDescription && (
              <button 
                onClick={() => document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                {t('publicHotelPage.nav.location')}
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
              </button>
            )}
            <button 
              onClick={() => document.getElementById('policies')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              {t('publicHotelPage.nav.policies')}
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
            </button>
            {hotel.faqs && hotel.faqs.length > 0 && (
              <button 
                onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                {t('publicHotelPage.nav.faqs')}
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div id="overview" className="scroll-mt-24"></div>
      {hotel.description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <p className="text-gray-900 dark:text-gray-100 leading-relaxed text-sm sm:text-base">
            {getTranslatedText(hotel, 'description', i18n.language)}
          </p>
        </div>
      )}

      {/* Popular Amenities */}
      <div id="amenities" className="scroll-mt-24"></div>
      {(() => {
        const allAmenities = getAllSelectedAmenities();
        if (allAmenities.length === 0) return null;
        
        const displayedAmenities = allAmenities.slice(0, 9); // Show first 9 amenities
        
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicHotelPage.amenities.title')}</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {displayedAmenities.map((amenity) => (
                <div key={`${amenity.category}-${amenity.key}`} className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3 sm:space-x-4' : 'space-x-3 sm:space-x-4'}`}>
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex items-center justify-center flex-shrink-0 ${isRTL ? 'mr-0 ml-3 sm:ml-4' : ''}`}>
                    {getAmenityIcon(amenity.key)}
                  </div>
                  <span className="text-gray-800 dark:text-gray-100 text-sm sm:text-base">
                    {amenity.name}
                  </span>
                </div>
              ))}
            </div>
            
            {allAmenities.length > 9 && (
              <button 
                onClick={() => setShowAmenitiesModal(true)}
                className="text-blue-600 dark:text-yellow-400 hover:underline font-medium"
              >
                {t('publicHotelPage.amenities.seeAll')} {allAmenities.length} {t('publicHotelPage.amenities.amenities')}
              </button>
            )}
            
            {allAmenities.length <= 9 && allAmenities.length > 0 && (
              <button 
                onClick={() => setShowAmenitiesModal(true)}
                className="text-blue-600 dark:text-yellow-400 hover:underline font-medium"
              >
                {t('publicHotelPage.amenities.seeAll')}
              </button>
            )}
          </div>
        );
      })()}

      {/* Hotel Rooms Carousel */}
      <div id="rooms" className="scroll-mt-24"></div>
      {hotel.roomTypes && hotel.roomTypes.length > 0 && (
        <div>
          {/* Heading with RTL support for Arabic */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {t('publicHotelPage.nav.rooms')}
            </h2>
          </div>
          {/* Carousel with forced LTR layout */}
          <div dir="ltr">
            <HotelRoomsCarousel 
              roomTypes={hotel.roomTypes}
            />
          </div>
        </div>
      )}

      {/* Transportation */}
      <div id="transportation" className="scroll-mt-24"></div>
      {hotel.transportation && (
        hotel.transportation.vitoReceptionPrice > 0 || 
        hotel.transportation.vitoFarewellPrice > 0 || 
        hotel.transportation.sprinterReceptionPrice > 0 || 
        hotel.transportation.sprinterFarewellPrice > 0 || 
        hotel.transportation.busReceptionPrice > 0 || 
        hotel.transportation.busFarewellPrice > 0
      ) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicHotelPage.transportation.title')}</h2>
          
          {/* Airport Information */}
          {hotel.airport && (
            <div className="mb-4 sm:mb-6 text-center">
              <div className={`inline-flex items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full shadow-lg ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-3' : 'space-x-2 sm:space-x-3'}`}>
                <FaPlane className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'mr-0 ml-2 sm:ml-3' : ''}`} />
                <span className="font-medium text-sm sm:text-base">{t('publicHotelPage.transportation.airport')}: {hotel.airport}</span>
              </div>
            </div>
          )}

          {/* Transportation Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Vito Transportation */}
            {(hotel.transportation.vitoReceptionPrice > 0 || hotel.transportation.vitoFarewellPrice > 0) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className={`flex items-center mb-3 sm:mb-4 ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-3' : 'space-x-2 sm:space-x-3'}`}>
                  <FaCar className={`text-blue-600 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'mr-0 ml-2 sm:ml-3' : ''}`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('publicHotelPage.transportation.vehicles.vito')}</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">{t('publicHotelPage.transportation.vitoCapacity')}</p>
                <div className="space-y-1.5 sm:space-y-2">
                  {hotel.transportation.vitoReceptionPrice > 0 && (
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`}></span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('publicHotelPage.transportation.airportReception')}</span>
                    </div>
                  )}
                  {hotel.transportation.vitoFarewellPrice > 0 && (
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`}></span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('publicHotelPage.transportation.airportFarewell')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sprinter Transportation */}
            {(hotel.transportation.sprinterReceptionPrice > 0 || hotel.transportation.sprinterFarewellPrice > 0) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className={`flex items-center mb-3 sm:mb-4 ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-3' : 'space-x-2 sm:space-x-3'}`}>
                  <FaShuttleVan className={`text-blue-600 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'mr-0 ml-2 sm:ml-3' : ''}`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('publicHotelPage.transportation.vehicles.sprinter')}</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">{t('publicHotelPage.transportation.sprinterCapacity')}</p>
                <div className="space-y-1.5 sm:space-y-2">
                  {hotel.transportation.sprinterReceptionPrice > 0 && (
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`}></span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('publicHotelPage.transportation.airportReception')}</span>
                    </div>
                  )}
                  {hotel.transportation.sprinterFarewellPrice > 0 && (
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`}></span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('publicHotelPage.transportation.airportFarewell')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bus Transportation */}
            {(hotel.transportation.busReceptionPrice > 0 || hotel.transportation.busFarewellPrice > 0) && (
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className={`flex items-center mb-3 sm:mb-4 ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-3' : 'space-x-2 sm:space-x-3'}`}>
                  <FaBus className={`text-blue-600 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'mr-0 ml-2 sm:ml-3' : ''}`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('publicHotelPage.transportation.vehicles.bus')}</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">{t('publicHotelPage.transportation.busCapacity')}</p>
                <div className="space-y-1.5 sm:space-y-2">
                  {hotel.transportation.busReceptionPrice > 0 && (
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`}></span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('publicHotelPage.transportation.airportReception')}</span>
                    </div>
                  )}
                  {hotel.transportation.busFarewellPrice > 0 && (
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`}></span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('publicHotelPage.transportation.airportFarewell')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      <div id="location" className="scroll-mt-24"></div>
      {hotel.locationDescription && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicHotelPage.location.title')}</h2>
          <p className="text-gray-800 dark:text-gray-100 leading-relaxed text-sm sm:text-base lg:text-lg">
            {getTranslatedText(hotel, 'locationDescription', i18n.language)}
          </p>
        </div>
      )}

      {/* Policy */}
      <div id="policies" className="scroll-mt-24"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicHotelPage.policies.title')}</h2>
        
        <div className="space-y-6 sm:space-y-8">
          {/* Children Policies */}
          {hotel.childrenPolicies && (
            <div>
              <h3 className={`text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center ${isRTL ? 'space-x-reverse' : ''}`}>
                <FaChild className={`text-blue-500 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`} />
                {t('publicHotelPage.policies.childrenPolicy')}
              </h3>
              <div className="space-y-2 text-sm sm:text-base text-gray-800 dark:text-gray-100">
                <p><span className="font-medium">{t('publicHotelPage.policies.under6')}:</span> {hotel.childrenPolicies.under6 === 'Free' ? t('publicHotelPage.policies.free') : hotel.childrenPolicies.under6}</p>
                <p><span className="font-medium">{t('publicHotelPage.policies.age6to12')}:</span> {hotel.childrenPolicies.age6to12 === 'Additional charge per room type' ? t('publicHotelPage.policies.additionalCharge') : hotel.childrenPolicies.age6to12}</p>
                <p><span className="font-medium">{t('publicHotelPage.policies.above12')}:</span> {hotel.childrenPolicies.above12 === 'Adult price' ? t('publicHotelPage.policies.adultPrice') : hotel.childrenPolicies.above12}</p>
              </div>
            </div>
          )}

          {/* Breakfast Policy */}
          <div>
            <h3 className={`text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center ${isRTL ? 'space-x-reverse' : ''}`}>
              <FaCoffee className={`text-blue-500 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`} />
              {t('publicHotelPage.policies.breakfastPolicy')}
            </h3>
            <div className="text-sm sm:text-base text-gray-800 dark:text-gray-100">
              {hotel.breakfastIncluded ? (
                <p className={`flex items-center ${isRTL ? 'space-x-reverse' : ''}`}>
                  <FaCheckCircle className={`text-green-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span>{t('publicHotelPage.policies.breakfastIncluded')}</span>
                </p>
              ) : (
                <p>{t('publicHotelPage.policies.breakfastAvailable')}</p>
              )}
            </div>
          </div>

          {/* General Policies */}
          <div>
            <h3 className={`text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center ${isRTL ? 'space-x-reverse' : ''}`}>
              <FaUsers className={`text-blue-500 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`} />
              {t('publicHotelPage.policies.generalPolicies')}
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-gray-800 dark:text-gray-100">
              <p>• {t('publicHotelPage.policies.checkInOut')}</p>
              <p>• {t('publicHotelPage.policies.cancellation')}</p>
              <p>• {t('publicHotelPage.policies.photoId')}</p>
              <p>• {t('publicHotelPage.policies.specialRequests')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Other Hotels Carousel */}
      {otherHotels.length > 0 && (
        <div dir="ltr">
          <OtherHotelsCarousel 
            hotels={otherHotels}
            currentHotelId={hotel?._id}
          />
        </div>
      )}

      {/* FAQs Section */}
      <div id="faqs" className="scroll-mt-24"></div>
      {hotel.faqs && hotel.faqs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicHotelPage.faqs.title')}</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {hotel.faqs.map((faq, index) => (
              <div 
                key={index}
                className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                  activeFaqIndex === index 
                    ? `shadow-md ${isRTL ? 'border-r-4 border-r-blue-500 dark:border-r-yellow-400' : 'border-l-4 border-l-blue-500 dark:border-l-yellow-400'}` 
                    : `hover:shadow-md ${isRTL ? 'hover:border-r-4 hover:border-r-blue-500 dark:hover:border-r-yellow-400' : 'hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'}`
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`flex justify-between items-center w-full px-4 sm:px-6 py-5 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                  aria-expanded={activeFaqIndex === index}
                >
                  <h3 className={`font-semibold text-base sm:text-lg flex-grow ${isRTL ? 'pl-3' : 'pr-3'} ${
                    activeFaqIndex === index 
                      ? 'text-blue-700 dark:text-yellow-300' 
                      : 'text-gray-800 dark:text-gray-100'
                  }`}>
                    {faq.question}
                  </h3>
                  <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                    activeFaqIndex === index 
                      ? 'bg-blue-100 dark:bg-yellow-900/30 text-blue-600 dark:text-yellow-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {activeFaqIndex === index ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                  </span>
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    activeFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 sm:px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Hotel Details */}
          <div className="lg:col-span-2">



          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="space-y-6">
            

          </div>
        </div>
      </div>

      {/* Amenities Modal */}
      <CustomModal
        isOpen={showAmenitiesModal}
        onClose={() => setShowAmenitiesModal(false)}
        title={t('publicHotelPage.amenities.modalTitle')}
        subtitle={isRTL 
          ? `${hotel?.name || ''} ${t('publicHotelPage.amenities.allAmenities')}`
          : `${t('publicHotelPage.amenities.allAmenities')} ${hotel?.name || ''}`
        }
        maxWidth="md:max-w-4xl"
        className="amenities-modal"
      >
        <ModalScrollbar maxHeight="560px">
          <div className={`space-y-4 pb-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {(() => {
                const allAmenities = getAllSelectedAmenities();
                const amenitiesByCategory = {};
                
                // Group amenities by category
                allAmenities.forEach(amenity => {
                  if (!amenitiesByCategory[amenity.category]) {
                    amenitiesByCategory[amenity.category] = [];
                  }
                  amenitiesByCategory[amenity.category].push(amenity);
                });

              return Object.entries(amenitiesByCategory).map(([categoryKey, amenities]) => {
                      // Try to get translation for category title, fallback to formatted key
                      const categoryTranslationKey = `publicHotelPage.amenities.categories.${categoryKey}`;
                      const categoryTitle = t(categoryTranslationKey, {
                        defaultValue: categoryKey
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim()
                          .replace(/Family Friendly/i, 'Family-Friendly')
                      });

                      return (
                  <div key={categoryKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <h3 className={`text-base font-semibold text-gray-900 dark:text-white mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {categoryTitle}
                          </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {amenities.map((amenity) => (
                              <div key={`${categoryKey}-${amenity.key}`} className={`flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                          <div className="w-5 h-5 flex items-center justify-center">
                                  {getAmenityIcon(amenity.key)}
                                </div>
                          <span className={`text-gray-800 dark:text-gray-100 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                  {amenity.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
              });
              })()}
          </div>
        </ModalScrollbar>
      </CustomModal>
    </div>
  );
};

export default PublicHotelPage;