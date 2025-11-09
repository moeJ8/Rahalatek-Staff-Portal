import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaArrowLeft, FaHotel, FaRoute, FaCity, FaClock, FaUsers, FaCrown, FaGem, FaStar } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Flag from 'react-world-flags';
import axios from 'axios';
import RahalatekLoader from '../../components/RahalatekLoader';
import CustomButton from '../../components/CustomButton';
import HorizontalScrollbar from '../../components/HorizontalScrollbar';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

const GuestCountryPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { country } = useParams();
  const navigate = useLocalizedNavigate();
  const [loading, setLoading] = useState(false);
  const [error, _] = useState(null);
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [expandedHighlights, setExpandedHighlights] = useState({});
  
  // Carousel state for tours
  const [currentTourSlide, setCurrentTourSlide] = useState(0);
  const [tourScreenType, setTourScreenType] = useState('desktop');
  const [toursPerSlide, setToursPerSlide] = useState(3);
  const [tourIsTransitioning, setTourIsTransitioning] = useState(false);
  const tourCarouselRef = useRef(null);
  
  // Carousel state for hotels
  const [currentHotelSlide, setCurrentHotelSlide] = useState(0);
  const [hotelScreenType, setHotelScreenType] = useState('desktop');
  const [hotelsPerSlide, setHotelsPerSlide] = useState(3);
  const [hotelIsTransitioning, setHotelIsTransitioning] = useState(false);
  const hotelCarouselRef = useRef(null);

  // Decode country name from URL
  const countryName = decodeURIComponent(country);

  // Language-aware meta content functions
  const getLocalizedMetaTitle = () => {
    const currentLang = i18n.language;
    const translatedCountryName = t(`countryPage.countryNames.${countryName}`, countryName);
    
    if (currentLang === 'ar') {
      return `استكشف ${translatedCountryName} - رحلاتك`;
    }
    if (currentLang === 'fr') {
      return `Explorez ${translatedCountryName} - Rahalatek`;
    }
    return `${translatedCountryName} - Rahalatek`;
  };

  const getLocalizedMetaDescription = () => {
    const currentLang = i18n.language;
    const translatedCountryName = t(`countryPage.countryNames.${countryName}`, countryName);
    
    if (currentLang === 'ar') {
      return `استكشف ${translatedCountryName} مع رحلاتك. اكتشف جولات رائعة، فنادق فاخرة، وإقامات مميزة في ${translatedCountryName}. احجز تجربة سفرك المثالية اليوم.`;
    }
    if (currentLang === 'fr') {
      return `Explorez ${translatedCountryName} avec Rahalatek. Découvrez des visites incroyables, des hôtels de luxe et des hébergements premium à ${translatedCountryName}. Réservez votre expérience de voyage parfaite aujourd'hui.`;
    }
    return `Explore ${translatedCountryName} with Rahalatek. Discover amazing tours, luxury hotels, and premium accommodations in ${translatedCountryName}. Book your perfect travel experience today.`;
  };

  const getLocalizedMetaKeywords = () => {
    const currentLang = i18n.language;
    const translatedCountryName = t(`countryPage.countryNames.${countryName}`, countryName);
    
    if (currentLang === 'ar') {
      return `${translatedCountryName}, جولات ${translatedCountryName}, فنادق ${translatedCountryName}, سفر ${translatedCountryName}, سياحة ${translatedCountryName}, عطلة ${translatedCountryName}, السفر إلى ${translatedCountryName}, وجهات ${translatedCountryName}, تجارب ${translatedCountryName}, رحلاتك`;
    }
    if (currentLang === 'fr') {
      return `${translatedCountryName}, visites ${translatedCountryName}, hôtels ${translatedCountryName}, voyage ${translatedCountryName}, tourisme ${translatedCountryName}, vacances ${translatedCountryName}, voyage à ${translatedCountryName}, destinations ${translatedCountryName}, expériences ${translatedCountryName}, Rahalatek`;
    }
    return `${countryName}, ${countryName} tours, ${countryName} hotels, ${countryName} travel, ${countryName} tourism, ${countryName} vacation, travel to ${countryName}, ${countryName} destinations, ${countryName} experiences, Rahalatek`;
  };

  // Helper function to get country data (needed for SEO)
  const getCountryDataForSEO = (countryName) => {
    const countries = {
      'Turkey': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759680467/turkey_uabvzb.jpg'
      },
      'Malaysia': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681612/malaysia_y1j9qm.jpg'
      },
      'Thailand': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681613/thailand_mevzsd.jpg'
      },
      'Indonesia': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681593/indonesia_z0it15.jpg'
      },
      'Saudi Arabia': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681608/saudi-arabia_n7v7gs.jpg'
      },
      'Morocco': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681610/morocco_hll4kh.jpg'
      },
      'Egypt': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681770/egypt_ehyxvu.jpg'
      },
      'Azerbaijan': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681625/azerbaijan_d4mecb.jpg'
      },
      'Georgia': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681595/georgia_id0au5.jpg'
      },
      'Albania': {
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681631/albania_ftb9qt.jpg'
      },
      'United Arab Emirates': {
        heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&h=700&fit=crop&q=85'
      }
    };
    return countries[countryName] || { heroImage: null };
  };

  // SEO Meta Tags and hreflang
  useEffect(() => {
    const baseUrl = window.location.origin;
    const currentLang = i18n.language;
    const encodedCountry = encodeURIComponent(countryName);
    
    const langContent = {
      en: {
        title: getLocalizedMetaTitle(),
        description: getLocalizedMetaDescription(),
        keywords: getLocalizedMetaKeywords(),
        ogLocale: 'en_US'
      },
      ar: {
        title: getLocalizedMetaTitle(),
        description: getLocalizedMetaDescription(),
        keywords: getLocalizedMetaKeywords(),
        ogLocale: 'ar_SA'
      },
      fr: {
        title: getLocalizedMetaTitle(),
        description: getLocalizedMetaDescription(),
        keywords: getLocalizedMetaKeywords(),
        ogLocale: 'fr_FR'
      }
    };

    const content = langContent[currentLang] || langContent.en;

    // Update page title
    document.title = content.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', content.description);
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', content.keywords);
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', content.title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', content.description);
    }

    const countryDataForSEO = getCountryDataForSEO(countryName);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && countryDataForSEO.heroImage) {
      ogImage.setAttribute('content', countryDataForSEO.heroImage);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href);
    }

    // Add multiple og:locale tags for all languages
    const existingOgLocales = document.querySelectorAll('meta[property="og:locale"]');
    existingOgLocales.forEach(tag => tag.remove());

    // Add og:locale for current language (primary)
    let ogLocale = document.createElement('meta');
    ogLocale.setAttribute('property', 'og:locale');
    ogLocale.setAttribute('content', content.ogLocale);
    document.head.appendChild(ogLocale);

    // Add alternate og:locale for other languages
    const alternateLocales = [
      { lang: 'en', locale: 'en_US' },
      { lang: 'ar', locale: 'ar_SA' },
      { lang: 'fr', locale: 'fr_FR' }
    ].filter(loc => loc.lang !== currentLang);

    alternateLocales.forEach(({ locale }) => {
      const altLocale = document.createElement('meta');
      altLocale.setAttribute('property', 'og:locale:alternate');
      altLocale.setAttribute('content', locale);
      document.head.appendChild(altLocale);
    });

    // Update Twitter Card
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard) {
      twitterCard.setAttribute('content', 'summary_large_image');
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', content.title);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', content.description);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && countryDataForSEO.heroImage) {
      twitterImage.setAttribute('content', countryDataForSEO.heroImage);
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/country/${encodedCountry}`;

    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(tag => tag.remove());

    // Add hreflang tags for all language versions
    const languages = [
      { code: 'en', path: `/country/${encodedCountry}` },
      { code: 'ar', path: `/ar/country/${encodedCountry}` },
      { code: 'fr', path: `/fr/country/${encodedCountry}` }
    ];

    languages.forEach(({ code, path }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = code;
      link.href = `${baseUrl}${path}`;
      document.head.appendChild(link);
    });

    // Add x-default pointing to English
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `${baseUrl}/country/${encodedCountry}`;
    document.head.appendChild(defaultLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryName, i18n.language, t]);

  // Country data with comprehensive information (cities now fetched from backend)
  const getCountryData = (countryName) => {
    const countries = {
      'Turkey': {
        code: 'TR',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759680467/turkey_uabvzb.jpg',
        overview: 'Discover Turkey, where East meets West in the most spectacular way imaginable. This transcontinental treasure bridges Europe and Asia, offering travelers an intoxicating blend of ancient wonders, stunning coastlines, and warm Mediterranean hospitality. Begin your Turkish adventure in Istanbul, the only city spanning two continents, where Byzantine churches stand beside Ottoman mosques, and traditional bazaars neighbor trendy rooftop bars. Cruise the Bosphorus Strait, explore imperial palaces, and lose yourself in the Grand Bazaar\'s labyrinthine lanes. Journey south to the sun-drenched Turkish Riviera, where Antalya\'s pristine beaches and ancient ruins create the perfect Mediterranean escape—over 300 days of sunshine annually guarantee perfect beach weather. Experience Cappadocia\'s otherworldly landscape, where millions of years of volcanic activity created fairy chimneys and rock formations that seem straight from a dream. Float over this magical terrain in a hot air balloon at sunrise, stay in luxurious cave hotels, and explore underground cities carved into the rock. Head to the Black Sea coast for Trabzon\'s lush green mountains, the cliff-hanging Sumela Monastery, and pristine alpine lakes. Party in sophisticated Bodrum, where superyachts dock at glamorous marinas and beach clubs line the Aegean coast. Paraglide over the world-famous Blue Lagoon in Fethiye, ski Turkey\'s premier slopes at Uludağ in Bursa, or relax in centuries-old thermal baths. Taste incredible Turkish cuisine from street vendors\' simit and döner to Michelin-starred restaurants\' innovative creations. Experience authentic hammam traditions, sip endless çay (tea) with friendly locals, and discover why Turkey has been welcoming travelers for millennia. With excellent infrastructure, diverse landscapes from Mediterranean beaches to mountain plateaus, rich cultural heritage spanning empires, and exceptional value for money, Turkey delivers unforgettable experiences for families, couples, adventure seekers, and culture enthusiasts alike.'
      },
      'Malaysia': {
        code: 'MY',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681612/malaysia_y1j9qm.jpg',
        overview: 'Experience Malaysia, Southeast Asia\'s most diverse destination, where ultra-modern cities meet ancient rainforests, and pristine tropical islands border vibrant multicultural communities. This fascinating country uniquely blends Malay, Chinese, Indian, and European influences, creating an extraordinary cultural tapestry that delights every visitor. Start in dynamic Kuala Lumpur, where the iconic Petronas Twin Towers pierce the skyline, world-class shopping malls dazzle shoppers, and incredible street food tempts at every corner—from spicy laksa to sweet roti canai. Explore George Town in Penang, a UNESCO World Heritage site famous for its colonial architecture, colorful street art murals, and legendary status as Malaysia\'s culinary capital with some of Asia\'s best hawker food. Escape to Langkawi\'s tropical paradise of 99 islands, where duty-free shopping meets pristine beaches, and the famous Sky Bridge offers breathtaking jungle views. Discover Malacca\'s charming colonial heritage with Portuguese forts, Dutch buildings, and unique Peranakan culture producing delicious Nyonya cuisine. Venture into ancient rainforests—some of the world\'s oldest at 130 million years—spotting orangutans in Borneo, exploring the Cameron Highlands\' misty tea plantations, or trekking through Taman Negara National Park. Dive world-class sites off Sipadan Island, relax on Perhentian Islands\' powder-white beaches, or island-hop through the pristine Langkawi archipelago. Sample incredible diversity of flavors from Malay rendang and satay to Chinese dim sum, Indian banana leaf curry, and Peranakan specialties. Visit towering Batu Caves\' Hindu temples, experience traditional kampung village life, and witness the blend of mosques, temples, and churches standing harmoniously side-by-side. With English widely spoken, excellent infrastructure, affordable prices, year-round tropical weather, and genuinely warm hospitality, Malaysia offers accessible Southeast Asian adventures perfect for first-time visitors and seasoned travelers seeking authentic experiences, making it ideal for families, honeymooners, foodies, and nature enthusiasts.'
      },
      'Thailand': {
        code: 'TH',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681613/thailand_mevzsd.jpg',
        overview: 'Welcome to Thailand, the "Land of Smiles," where legendary hospitality meets exotic adventure in Southeast Asia\'s most beloved destination. This tropical paradise offers an unbeatable combination of stunning beaches, ancient temples, delicious cuisine, and affordable luxury that keeps travelers returning year after year. Begin in electrifying Bangkok, where golden spires of the Grand Palace and Wat Arun temple gleam beside modern skyscrapers, and the world\'s best street food sizzles at every corner—taste authentic pad Thai, mango sticky rice, and tom yum soup where they were perfected. Shop till you drop at massive Chatuchak Market with 15,000 stalls, sip cocktails at glamorous rooftop bars, and cruise the Chao Phraya River past illuminated temples. Escape to Thailand\'s island paradise: Phuket offers vibrant Patong Beach nightlife alongside serene Kata Beach family fun, with spectacular Phi Phi Islands day trips to Maya Bay. Discover Koh Samui\'s luxury resorts and beach clubs, Krabi\'s dramatic limestone cliffs and hidden lagoons, or the backpacker haven of Koh Tao for world-class scuba diving. Journey north to cultural Chiang Mai, gateway to misty mountains, hill tribe villages, and ethical elephant sanctuaries where you can feed and bathe these gentle giants. Learn Thai cooking in hands-on classes, explore 300+ ancient temples, shop night markets for handicrafts, and experience the magical Yi Peng Lantern Festival. Adventure seekers can trek jungle trails, zipline through rainforests, go white-water rafting, or ride ATVs through countryside. Indulge in affordable luxury with beachfront resorts, traditional Thai massage, and spa treatments at prices that seem impossible. Experience warm smiles everywhere—from tuk-tuk drivers to resort staff, Thais genuinely love welcoming visitors. With delicious food at every price point, stunning natural beauty, rich Buddhist culture, exciting nightlife, and incredible value for money, Thailand delivers the perfect tropical escape for honeymooners, families, backpackers, luxury travelers, and everyone in between.'
      },
      'Indonesia': {
        code: 'ID',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681593/indonesia_z0it15.jpg',
        overview: 'Discover Indonesia, the world\'s largest archipelago of over 17,000 islands, offering the ultimate tropical adventure across Southeast Asia\'s most diverse nation. This exotic paradise delivers everything from Bali\'s spiritual temples and world-class surfing to Java\'s ancient Borobudur Buddhist monument and active volcanoes. Start in Bali, Indonesia\'s crown jewel, where stunning rice terraces cascade down hillsides, beach clubs party until dawn in Seminyak, and yoga retreats find zen in Ubud\'s jungle settings. Watch traditional Kecak fire dances at clifftop Uluwatu Temple, trek Mount Batur volcano for sunrise, and explore the Sacred Monkey Forest. Experience Jakarta\'s urban energy with mega malls, museums, and gateway to the Thousand Islands for snorkeling escapes. Visit Yogyakarta, Java\'s cultural soul, home to magnificent Borobudur—the world\'s largest Buddhist temple—and dramatic Prambanan Hindu complex. Watch Ramayana ballet performances, learn batik making, and explore the living Sultan\'s palace. Adventure to Komodo National Park to see prehistoric Komodo dragons, Indonesia\'s endemic giant lizards. Dive or snorkel Raja Ampat\'s pristine coral reefs, considered Earth\'s most biodiverse marine ecosystem. Trek through ancient Sumatran rainforests spotting orangutans, relax on the Gili Islands\' car-free beaches, or surf world-famous breaks from Uluwatu to Desert Point. Sample incredibly diverse cuisine from Balinese babi guling to Javanese nasi goreng, Padang\'s spicy rendang to fresh seafood grilled on beaches. Experience warm Indonesian hospitality, affordable luxury resorts, traditional ceremonies, and gamelan music. With hundreds of ethnic groups, languages, and cultural traditions, stunning volcanic landscapes, pristine beaches, incredible biodiversity, and prices that stretch every budget, Indonesia offers limitless exploration for adventurers, beach lovers, culture seekers, and spiritual travelers discovering Southeast Asia\'s most enchanting archipelago.'
      },
      'Saudi Arabia': {
        code: 'SA',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681608/saudi-arabia_n7v7gs.jpg',
        overview: 'Experience Saudi Arabia, the Arabian Peninsula\'s largest country now opening its treasures to international tourism after decades of exclusivity. This transformative nation offers intrepid travelers unprecedented access to ancient heritage sites, futuristic megacities, pristine Red Sea diving, and vast desert landscapes. Explore Riyadh\'s modern capital with the iconic Kingdom Centre Tower, the dramatic Edge of the World cliff formations, and the UNESCO site of Diriyah—birthplace of the Saudi state with traditional mud-brick architecture. Discover cosmopolitan Jeddah, the gateway city featuring historic Al-Balad\'s coral-stone houses (UNESCO site), the world\'s tallest fountain, and a 30km Corniche waterfront promenade. Dive the Red Sea\'s pristine coral reefs rivaling Egypt\'s, with untouched sites and abundant marine life. Visit the spectacular rock formations and ancient Nabataean tombs of Al-Ula (Saudi Arabia\'s answer to Petra), attend concerts at Maraya, the world\'s largest mirrored building in the desert. Experience the Empty Quarter (Rub\' al Khali), Earth\'s largest continuous sand desert, on 4x4 adventures or camel treks to Bedouin camps under star-filled skies. Explore Taif\'s cool mountain climate, rose gardens, and fruit markets—the summer escape for Saudis seeking relief from desert heat. Discover traditional souks selling gold, frankincense, dates, and carpets, taste authentic Saudi cuisine like kabsa and mandi, and experience legendary Arabian hospitality over Arabic coffee and dates. Witness the nation\'s rapid transformation with entertainment zones, music festivals, and modern attractions while respecting rich cultural traditions. Saudi Arabia offers adventurous travelers a rare opportunity to explore an emerging destination combining ancient heritage, dramatic natural beauty, modern luxury, and authentic Arabian culture before the crowds discover this hidden gem.'
      },
      'Morocco': {
        code: 'MA',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681610/morocco_hll4kh.jpg',
        overview: 'Journey to Morocco, North Africa\'s most enchanting destination, where ancient medinas, Sahara Desert adventures, and Atlantic beaches create an exotic escape just hours from Europe. This captivating kingdom blends Arab, Berber, African, and European influences into a sensory feast of colorful souks, aromatic spices, intricate tilework, and warm hospitality. Begin in magical Marrakech, where Jemaa el-Fnaa square comes alive with snake charmers, storytellers, and sizzling food stalls, and the labyrinthine medina souks sell everything from hand-woven carpets to fragrant argan oil. Stay in traditional riads—ornate courtyard houses turned boutique hotels—and explore the stunning Majorelle Garden with its electric blue walls. Wander through Fez\'s medieval medina, the world\'s largest car-free urban zone and UNESCO site, where leather tanners work using methods unchanged for centuries, and artisans create intricate mosaics and metalwork. Discover the "Blue Pearl" of Chefchaouen, where entire neighborhoods painted in shades of blue create Instagram-perfect backdrops in the Rif Mountains. Visit imperial cities like Rabat and Meknes, showcasing grand palaces and historic gates. Experience the ultimate desert adventure—ride camels into the Sahara at sunset, spend nights in luxury Berber camps under infinite stars, and watch sunrise paint the dunes gold. Explore dramatic Atlas Mountains, visiting traditional Berber villages, hiking scenic valleys, and seeing North Africa\'s highest peaks. Surf Atlantic swells in laid-back Essaouira and Taghazout, or relax on Mediterranean beaches in Tangier. Indulge in incredible Moroccan cuisine—fragrant tagines, fluffy couscous, sweet pastilla, mint tea, and fresh bread from communal ovens. Experience authentic hammams, shop for leather goods and lanterns, and learn to bargain in the souks. With stunning riads, luxury hotels, and budget accommodations, diverse landscapes from mountains to desert to coast, rich artistic traditions, and genuine warmth, Morocco delivers an exotic adventure that feels both foreign and welcoming, perfect for couples, families, adventure travelers, and culture enthusiasts.'
      },
      'Egypt': {
        code: 'EG',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681770/egypt_ehyxvu.jpg',
        overview: 'Step into Egypt, the cradle of civilization and home to humanity\'s most iconic ancient monuments spanning 5,000 years of history. This legendary destination fulfills childhood dreams of exploring pyramids, decoding hieroglyphics, and cruising the Nile River just like the pharaohs. Begin at the Pyramids of Giza, the last surviving Wonder of the Ancient World, where the Great Pyramid and enigmatic Sphinx have stood guard for 4,500 years. Explore Cairo\'s world-renowned Egyptian Museum housing King Tutankhamun\'s golden treasures and rooms full of mummies, then haggle in the atmospheric Khan el-Khalili bazaar for papyrus, jewelry, and spices. Cruise the lifeline Nile River on luxury boats or traditional feluccas, watching timeless scenes of farmers, fishermen, and ancient temples glide past. Travel to Luxor, the world\'s greatest open-air museum, where the massive Karnak Temple complex, the beautiful Luxor Temple, and the royal tombs in the Valley of the Kings (including Tutankhamun\'s) create an archaeologist\'s paradise. Rise before dawn for unforgettable hot air balloon flights over these ancient monuments. Venture to Aswan for the stunning Philae Temple on its island and day trips to Abu Simbel\'s colossal statues of Ramses II. Escape to the Red Sea coast for world-class diving and snorkeling—pristine coral reefs at Sharm El Sheikh, Hurghada, and Dahab rival any tropical destination. Relax at beach resorts, learn to windsurf, or explore underwater wrecks. Experience vibrant Egyptian culture through belly dancing shows, traditional music, aromatic shisha cafes, and delicious cuisine from koshari street food to fresh seafood. Visit Coptic churches, Islamic mosques, and Bedouin desert camps. With affordable prices, improved infrastructure, welcoming people eager to share their heritage, and monuments that defined human civilization, Egypt offers bucket-list experiences that transport you through time while providing modern comforts—perfect for history buffs, families, adventure seekers, and anyone dreaming of ancient wonders.'
      },
      'Azerbaijan': {
        code: 'AZ',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681625/azerbaijan_d4mecb.jpg',
        overview: 'Explore Azerbaijan, the "Land of Fire," an emerging destination where futuristic architecture meets ancient traditions at the crossroads of Europe and Asia. This fascinating Caucasus nation surprises visitors with its dramatic contrasts—from Baku\'s ultra-modern Flame Towers and Zaha Hadid-designed Heydar Aliyev Center to UNESCO-listed Old City\'s medieval stone streets. Walk through Baku\'s Icherisheher walled city discovering the mysterious Maiden Tower, visit the Palace of Shirvanshahs, and stroll the lengthy Caspian Sea Boulevard with its parks and attractions. Experience the country\'s "eternal flames" at ancient Zoroastrian fire temples where natural gas seeping from the earth has burned for thousands of years. Venture to Gobustan to see 40,000-year-old rock art petroglyphs and bizarre bubbling mud volcanoes. Explore the mountainous regions with medieval castles, colorful villages, and stunning Caucasus scenery. Visit the Azerbaijan Carpet Museum showcasing the country\'s renowned weaving traditions. Sample delicious Azerbaijani cuisine blending Turkish, Persian, and Russian influences—try plov (saffron rice), dolma, kebabs, and sweet pakhlava with aromatic tea. Experience warm Caucasian hospitality, shop modern malls and traditional markets, and discover a country investing heavily in tourism infrastructure. With its blend of oil-funded modernity and ancient Silk Road heritage, dramatic landscapes from Caspian beaches to mountain villages, rich cultural traditions, and relatively undiscovered status, Azerbaijan offers adventurous travelers a unique destination combining Eastern mystique with European sophistication at surprisingly affordable prices—perfect for those seeking destinations off the beaten path.'
      },
      'Georgia': {
        code: 'GE',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681595/georgia_id0au5.jpg',
        overview: 'Welcome to Georgia, the jewel of the Caucasus and one of Europe\'s most captivating emerging destinations, where ancient wine culture meets dramatic mountain landscapes and legendary hospitality. This small country packs enormous diversity—from charming Tbilisi\'s cobblestone Old Town and natural sulfur baths to the soaring Caucasus peaks and Black Sea beaches. Discover why Georgia claims to be the birthplace of wine—archaeological evidence proves 8,000 years of winemaking using traditional qvevri (clay vessels buried underground). Tour Kakheti wine region\'s vineyards, taste unique amber wines, and experience traditional Georgian feasts (supra) with endless toasts and dishes covering the entire table. Explore Tbilisi\'s eclectic architecture mixing medieval churches, Art Nouveau mansions, and Soviet buildings, all connected by a modern glass Bridge of Peace. Ride the cable car to ancient Narikala Fortress for panoramic city views, then descend to the historic bathhouse district for authentic Georgian spa experiences. Journey to Kazbegi to see the iconic Gergeti Trinity Church perched on a hilltop with Mount Kazbek towering behind—one of the world\'s most photographed mountain churches. Visit Stepantsminda for hiking, horseback riding, and breathtaking Caucasus scenery. Head to the Black Sea coast where subtropical Batumi offers palm-lined beaches, modern architecture, botanical gardens, and lively nightlife. Discover Mtskheta, Georgia\'s ancient capital and UNESCO site with stunning hilltop monasteries. Explore fortress towns like Sighnaghi overlooking the Alazani Valley, cave cities carved into cliffs, and medieval defensive towers dotting mountain villages. Taste incredible Georgian cuisine—khinkali (soup dumplings), khachapuri (cheese bread), and countless unique dishes accompanied by Georgian wine or chacha (grape vodka). Experience unmatched Georgian hospitality where locals treat guests as gifts from God. With dramatic mountain scenery, ancient culture, extraordinary food and wine, therapeutic sulfur baths, adventure activities from skiing to paragliding, incredibly affordable prices, and warm, welcoming people, Georgia offers authentic experiences, natural beauty, and cultural richness that leave every visitor planning their return visit.'
      },
      'Albania': {
        code: 'AL',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_85,w_1400,h_700,c_fill,g_auto,dpr_auto/v1759681631/albania_ftb9qt.jpg',
        overview: 'Uncover Albania, Europe\'s last hidden gem and the Balkans\' best-kept secret, where pristine beaches rival the Greek islands, ancient heritage sites dot dramatic mountains, and authentic culture thrives without tourist crowds—all at a fraction of Western Europe\'s prices. This Mediterranean jewel, emerging from decades of isolation, now welcomes travelers to discover UNESCO World Heritage sites, stunning Riviera coastline, and warm Albanian hospitality. Explore charming Tirana, the colorful capital, where communist-era bunkers transformed into art museums contrast with trendy Blloku district\'s cafes and nightlife. Ride the Dajti Mountain cable car for spectacular views, then wander vibrant Skanderbeg Square surrounded by museums and mosques. Journey to Berat, the "City of a Thousand Windows," where white Ottoman houses cascade down hillsides, and ancient castle ruins overlook the Osum River—a perfectly preserved UNESCO town seemingly frozen in time. Visit Gjirokastër\'s stone fortress and traditional architecture, another UNESCO site showcasing authentic Albanian mountain culture. Head south to the Albanian Riviera, where postcard-perfect Ksamil beaches rival the Caribbean with white sand and turquoise waters facing Corfu. Base yourself in Sarande\'s beachfront hotels, visit the stunning Blue Eye natural spring with impossibly blue water, and explore Butrint National Park\'s Greek and Roman ruins by the sea. Hike the dramatic Albanian Alps, visit remote mountain villages where traditions endure, and explore the turquoise waters of Komani Lake. Discover ancient Illyrian ruins, Ottoman bridges, and medieval castles throughout the country. Taste delicious Albanian cuisine—byrek (savory pies), tavë kosi (lamb with yogurt), fresh seafood, and local raki. Experience genuine warmth from locals excited to share their country, enjoy Mediterranean climate, and explore stunning nature from mountains to pristine coastline. With incredible value (cheapest country in Europe), diverse landscapes, rich history, authentic experiences, and absence of tourist crowds, Albania rewards adventurous travelers seeking undiscovered destinations offering the Mediterranean dream without the price tag or masses—perfect for budget travelers, couples, and those wanting to explore before everyone else discovers this Balkan treasure.'
      },
      'United Arab Emirates': {
        code: 'AE',
        heroImage: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1762608287/zq-lee-VbDjv8-8ibc-unsplash_qfopyr.jpg',
        overview: 'Experience the United Arab Emirates, a dazzling Arabian destination where ultra-modern luxury meets traditional desert culture in the most spectacular way. This federation of seven emirates has transformed from pearl-diving villages to a global hub of innovation, luxury, and extraordinary experiences in just five decades. Start in Dubai, the jewel of the UAE and a city of superlatives—home to the world\'s tallest building (Burj Khalifa at 828m), largest shopping mall (Dubai Mall), and most luxurious hotels including the iconic sail-shaped Burj Al Arab. Shop at traditional Gold and Spice Souks, then explore futuristic Dubai Marina\'s skyscrapers and beach clubs. Experience thrilling desert safaris with dune bashing, camel rides, and Bedouin-style dinners under stars, or hit the slopes at indoor Ski Dubai. Visit Abu Dhabi, the sophisticated capital, featuring the stunning Sheikh Zayed Grand Mosque with its gleaming white marble and intricate Islamic architecture—one of the world\'s most beautiful mosques. Explore Louvre Abu Dhabi\'s world-class art collection, race on Yas Island\'s Formula 1 circuit, and relax on pristine Saadiyat Island beaches. Discover Sharjah, the UAE\'s cultural capital, with excellent museums, traditional architecture, and authentic Arabian atmosphere. Adventure to Ras Al Khaimah for mountain hiking in Jebel Jais (UAE\'s highest peak) and the world\'s longest zipline, or explore Fujairah\'s pristine diving sites and historic forts on the east coast. Experience Al Ain\'s desert oases, ancient forts, and the famous camel market. Enjoy year-round sunshine (350+ days annually), world-class beaches on both Arabian Gulf and Gulf of Oman, and water sports from jet skiing to paddleboarding. Indulge in incredible dining from Michelin-starred restaurants to authentic Emirati cuisine—try machboos, harees, and luqaimat. Shop tax-free in gleaming malls, traditional souks, and during the famous Dubai Shopping Festival. Experience unmatched luxury at 7-star hotels, relax at award-winning spas, and enjoy world-class entertainment from concerts to theme parks. With excellent infrastructure, absolute safety, English widely spoken, convenient location as a global hub, visa-free entry for many nationalities, and unique blend of Arabian heritage with futuristic innovation, the UAE delivers extraordinary experiences for luxury travelers, families, business visitors, and adventure seekers wanting to experience the modern Middle East at its finest.'
      }
    };
    return countries[countryName] || { 
      code: null, 
      heroImage: null, 
      overview: 'Discover this amazing destination with its unique culture and beautiful landscapes.'
    };
  };

  const countryData = getCountryData(countryName);

  // Screen size detection for tours carousel
  const updateTourScreenSize = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setTourScreenType('mobile');
      setToursPerSlide(1);
    } else if (width < 1024) {
      setTourScreenType('tablet');
      setToursPerSlide(2);
    } else {
      setTourScreenType('desktop');
      setToursPerSlide(3);
    }
  };

  // Screen size detection for hotels carousel
  const updateHotelScreenSize = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setHotelScreenType('mobile');
      setHotelsPerSlide(1);
    } else if (width < 1024) {
      setHotelScreenType('tablet');
      setHotelsPerSlide(2);
    } else {
      setHotelScreenType('desktop');
      setHotelsPerSlide(3);
    }
  };

  useEffect(() => {
    updateTourScreenSize();
    updateHotelScreenSize();
    window.addEventListener('resize', updateTourScreenSize);
    window.addEventListener('resize', updateHotelScreenSize);
    return () => {
      window.removeEventListener('resize', updateTourScreenSize);
      window.removeEventListener('resize', updateHotelScreenSize);
    };
  }, []);

  // Calculate total slides
  const totalTourSlides = Math.ceil(tours.length / toursPerSlide);
  const totalHotelSlides = Math.ceil(hotels.length / hotelsPerSlide);

  // Reset slides when screen size changes
  useEffect(() => {
    if (currentTourSlide >= totalTourSlides) {
      setCurrentTourSlide(0);
    }
  }, [totalTourSlides, currentTourSlide]);

  useEffect(() => {
    if (currentHotelSlide >= totalHotelSlides) {
      setCurrentHotelSlide(0);
    }
  }, [totalHotelSlides, currentHotelSlide]);

  // Tour carousel navigation with transition lock
  const nextTourSlide = useCallback(() => {
    if (tourIsTransitioning) return;
    setTourIsTransitioning(true);
    setCurrentTourSlide((prev) => (prev + 1) % totalTourSlides);
    setTimeout(() => setTourIsTransitioning(false), 500);
  }, [tourIsTransitioning, totalTourSlides]);

  const prevTourSlide = useCallback(() => {
    if (tourIsTransitioning) return;
    setTourIsTransitioning(true);
    setCurrentTourSlide((prev) => (prev - 1 + totalTourSlides) % totalTourSlides);
    setTimeout(() => setTourIsTransitioning(false), 500);
  }, [tourIsTransitioning, totalTourSlides]);

  const goToTourSlide = useCallback((slideIndex) => {
    if (tourIsTransitioning || slideIndex === currentTourSlide) return;
    setTourIsTransitioning(true);
    setCurrentTourSlide(slideIndex);
    setTimeout(() => setTourIsTransitioning(false), 500);
  }, [tourIsTransitioning, currentTourSlide]);

  // Hotel carousel navigation with transition lock
  const nextHotelSlide = useCallback(() => {
    if (hotelIsTransitioning) return;
    setHotelIsTransitioning(true);
    setCurrentHotelSlide((prev) => (prev + 1) % totalHotelSlides);
    setTimeout(() => setHotelIsTransitioning(false), 500);
  }, [hotelIsTransitioning, totalHotelSlides]);

  const prevHotelSlide = useCallback(() => {
    if (hotelIsTransitioning) return;
    setHotelIsTransitioning(true);
    setCurrentHotelSlide((prev) => (prev - 1 + totalHotelSlides) % totalHotelSlides);
    setTimeout(() => setHotelIsTransitioning(false), 500);
  }, [hotelIsTransitioning, totalHotelSlides]);

  const goToHotelSlide = useCallback((slideIndex) => {
    if (hotelIsTransitioning || slideIndex === currentHotelSlide) return;
    setHotelIsTransitioning(true);
    setCurrentHotelSlide(slideIndex);
    setTimeout(() => setHotelIsTransitioning(false), 500);
  }, [hotelIsTransitioning, currentHotelSlide]);

  // Handle tour click
  const handleTourClick = async (tour) => {
    try {
      await axios.post(`/api/tours/public/${tour.slug}/view`);
    } catch (error) {
      console.error('Error incrementing tour views:', error);
    }
    navigate(`/tours/${tour.slug}`);
  };

  // Handle hotel click
  const handleHotelClick = async (hotel) => {
    try {
      await axios.post(`/api/hotels/public/${hotel.slug}/view`);
    } catch (error) {
      console.error('Error incrementing hotel views:', error);
    }
    navigate(`/hotels/${hotel.slug}`);
  };

  // Get country code
  const getCountryCode = (country) => {
    const codes = {
      'Turkey': 'TR',
      'Malaysia': 'MY',
      'Thailand': 'TH',
      'Indonesia': 'ID',
      'Saudi Arabia': 'SA',
      'Morocco': 'MA',
      'Egypt': 'EG',
      'Azerbaijan': 'AZ',
      'Georgia': 'GE',
      'Albania': 'AL',
      'United Arab Emirates': 'AE'
    };
    return codes[country] || null;
  };

  // Toggle highlights function for TourCard
  const toggleHighlights = (tourId) => {
    setExpandedHighlights(prev => ({
      ...prev,
      [tourId]: !prev[tourId]
    }));
  };

  // Render stars for hotels
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      );
    }
    return stars;
  };

  // Truncate hotel description
  const truncateDescription = (description) => {
    if (!description) return '';
    const maxLength = 120;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cities, tours, and hotels from backend in parallel
        const [citiesResponse, toursResponse, hotelsResponse] = await Promise.all([
          axios.get(`/api/destinations/${encodeURIComponent(countryName)}/cities`),
          axios.get(`/api/tours/country/${encodeURIComponent(countryName)}`),
          axios.get(`/api/hotels/country/${encodeURIComponent(countryName)}`)
        ]);
        
        // Process cities data from backend with high-quality optimized Cloudinary URLs
        const citiesData = citiesResponse.data.cities || [];
        const formattedCities = citiesData.map(city => {
          const tourText = city.tourCount === 1 ? t('countryPage.tour') : t('countryPage.tours');
          const hotelText = city.hotelCount === 1 ? t('countryPage.hotel') : t('countryPage.hotels');
          const translatedCityName = t(`countryPage.cities.${city.name}`, city.name);
          return {
            name: translatedCityName,
            originalName: city.name, // Keep original English name for navigation
            description: `${city.tourCount} ${tourText} • ${city.hotelCount} ${hotelText}`,
            image: city.image ? city.image.replace('/upload/', '/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/') : city.image
          };
        });
        
        setCities(formattedCities);
        setCitiesLoading(false);
        
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
        
        // If API fails, set empty cities array
        setCities([]);
        
        // Set empty arrays if API calls fail
        setTours([]);
        setHotels([]);
        setCitiesLoading(false);
        setToursLoading(false);
        setHotelsLoading(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [countryName, t]);

  // Tour Card Component
  const TourCard = ({ tour }) => {
    const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];
    const rawImageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Tour+Image';
    // Optimize Cloudinary URLs for high quality and fast loading
    const imageUrl = rawImageUrl.includes('cloudinary.com') 
      ? rawImageUrl.replace('/upload/', '/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/')
      : rawImageUrl;

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group flex flex-col relative"
        onClick={() => handleTourClick(tour)}
      >
        {/* Tour Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={tour.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
            {tour.tourType === 'VIP' ? (
              <FaCrown className="w-4 h-4 text-yellow-400" />
            ) : (
              <FaUsers className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm font-medium">{tour.tourType}</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className={`text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(tour.name) ? 'text-right' : 'text-left'
            }`}>
              {tour.name}
            </h3>
          </div>
        </div>

        {/* Tour Details */}
        <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500 dark:text-red-500" />
              <span className="text-xs sm:text-sm truncate">
                {tour.city}{tour.country ? `, ${tour.country}` : ''}
              </span>
              {tour.country && getCountryCode(tour.country) && (
                <Flag 
                  code={getCountryCode(tour.country)} 
                  height="16" 
                  width="20"
                  className="flex-shrink-0 rounded-sm inline-block ml-1 mt-1"
                  style={{ maxWidth: '20px', maxHeight: '16px' }}
                />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <FaClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-blue-500 dark:text-yellow-400" />
              <span className="text-xs sm:text-sm">{tour.duration}h</span>
            </div>
          </div>

          {tour.highlights && tour.highlights.length > 0 && (
            <div className="mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHighlights(tour._id);
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-1">
                  <FaGem className="text-blue-500 dark:text-yellow-400 w-3 h-3" />
                  <span className="text-xs sm:text-sm font-medium">{t('countryPage.highlights')}</span>
                </div>
                {expandedHighlights[tour._id] ? (
                  <HiChevronUp className="text-sm transition-transform duration-200" />
                ) : (
                  <HiChevronDown className="text-sm transition-transform duration-200" />
                )}
              </button>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedHighlights[tour._id] ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-1">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <span className="text-blue-500 dark:text-yellow-400 mt-0.5">•</span>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tour.description && (
            <p className={`text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(tour.description) ? 'text-right' : 'text-left'
            }`}>
              {tour.description}
            </p>
          )}

          <div className="mt-auto">
            <div className="text-right">
              {tour.totalPrice && Number(tour.totalPrice) > 0 ? (
                <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                  ${tour.totalPrice}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {t('countryPage.contactForPricing')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Hotel Card Component
  const HotelCard = ({ hotel }) => {
    const primaryImage = hotel.images?.find(img => img.isPrimary) || hotel.images?.[0];
    const rawImageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Hotel+Image';
    // Optimize Cloudinary URLs for high quality and fast loading
    const imageUrl = rawImageUrl.includes('cloudinary.com') 
      ? rawImageUrl.replace('/upload/', '/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/')
      : rawImageUrl;

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
        onClick={() => handleHotelClick(hotel)}
      >
        {/* Hotel Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
            {renderStars(hotel.stars)}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className={`text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(hotel.name) ? 'text-right' : 'text-left'
            }`}>
              {hotel.name}
            </h3>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
            <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-red-500 dark:text-red-500" />
            <span className="text-xs sm:text-sm truncate">
              {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
            </span>
            {hotel.country && getCountryCode(hotel.country) && (
              <Flag 
                code={getCountryCode(hotel.country)} 
                height="16" 
                width="20"
                className="flex-shrink-0 rounded-sm inline-block ml-1 mt-1"
                style={{ maxWidth: '20px', maxHeight: '16px' }}
              />
            )}
          </div>

          {hotel.description && (
            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
              {truncateDescription(hotel.description)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const CityCard = ({ city }) => (
    <div 
      className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group cursor-pointer"
      onClick={() => navigate(`/country/${encodeURIComponent(countryName)}/city/${encodeURIComponent(city.originalName || city.name)}`)}
    >
      <div className="h-48 relative overflow-hidden">
        <img 
          src={city.image} 
          alt={city.name}
          loading="lazy"
          decoding="async"
          width="400"
          height="300"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} text-white`}>
          <h3 className="text-xl font-bold mb-1 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors">{city.name}</h3>
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
          <h1 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">{t('countryPage.error')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <CustomButton
            variant="rippleBlueToYellowTeal"
            onClick={() => navigate('/guest')}
          >
            {t('countryPage.returnToHomepage')}
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden -mt-6" dir="ltr">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={countryData.heroImage}
            alt={countryName}
            className="w-full h-full object-cover"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} z-20 flex items-center gap-2 text-white hover:text-yellow-300 transition-colors bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2`}
        >
          <FaArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="hidden sm:inline">{t('countryPage.backToHomepage')}</span>
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Jost, sans-serif' }}>
                {t(`countryPage.countryNames.${countryName}`, countryName)}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            {t('countryPage.about')} {t(`countryPage.countryNames.${countryName}`, countryName)}
          </h2>
          <p className="text-gray-900 dark:text-gray-100 leading-relaxed text-sm sm:text-base lg:text-lg">
            {t(`countryPage.countries.${countryName}`, countryData.overview)}
          </p>
        </section>

        {/* Cities Section */}
        <section className="mb-16" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t('countryPage.popularCities')}
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
                  <div key={index} className="flex-shrink-0 w-[385px]">
                    <CityCard city={city} />
                  </div>
                ))}
              </div>
            </HorizontalScrollbar>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaCity className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('countryPage.noCitiesAvailable')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('countryPage.workingOnCities')} {t(`countryPage.countryNames.${countryName}`, countryName)}.
              </p>
            </div>
          )}
        </section>

        {/* Tours Section */}
        <section className="mb-16" dir="ltr">
          <div className="relative mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t('countryPage.featuredTours')}
            </h2>
            {/* View All Button - Desktop Only in Header */}
            {tours.length > 0 && (
              <div className={`hidden lg:block lg:absolute ${isRTL ? 'lg:left-0' : 'lg:right-0'} lg:top-0`}>
                <CustomButton
                  variant="rippleBlueToYellowTeal"
                  size="md"
                  onClick={() => navigate(`/guest/tours?country=${encodeURIComponent(countryName)}`)}
                >
                  {t('countryPage.viewAllTours')}
                </CustomButton>
              </div>
            )}
          </div>

          {toursLoading ? (
            <div className="flex justify-center py-12">
              <RahalatekLoader size="lg" />
            </div>
          ) : tours.length > 0 ? (
            <>
              {/* Carousel Container with Side Arrows */}
              <div className="relative flex items-center mb-6">
                {/* Left Arrow */}
                {totalTourSlides > 1 && (
                  <button
                    onClick={prevTourSlide}
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                    aria-label="Previous tours"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Tour Cards Container */}
                <div className="flex-1 overflow-hidden" ref={tourCarouselRef}>
                  <div 
                    className="flex transition-transform duration-500 ease-in-out will-change-transform"
                    style={{ 
                      transform: `translate3d(-${currentTourSlide * 100}%, 0, 0)`,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    {Array.from({ length: totalTourSlides }, (_, slideIndex) => (
                      <div 
                        key={slideIndex} 
                        className={`w-full flex-shrink-0 ${
                          tourScreenType === 'mobile' 
                            ? 'grid grid-cols-1 gap-4' 
                            : tourScreenType === 'tablet'
                            ? 'grid grid-cols-2 gap-4'
                            : 'grid grid-cols-3 gap-6'
                        }`}
                      >
                        {tours
                          .slice(slideIndex * toursPerSlide, (slideIndex + 1) * toursPerSlide)
                          .map((tour, tourIndex) => (
                <TourCard
                              key={`${slideIndex}-${tourIndex}`}
                  tour={tour}
                            />
                          ))
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Arrow */}
                {totalTourSlides > 1 && (
                  <button
                    onClick={nextTourSlide}
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                    aria-label="Next tours"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dots Indicator */}
              {totalTourSlides > 1 && (
                <div className="flex justify-center mb-6 gap-2">
                  {Array.from({ length: totalTourSlides }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTourSlide(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                        index === currentTourSlide
                          ? 'bg-yellow-400 dark:bg-blue-500 scale-125'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-500 dark:hover:bg-blue-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
              )}

              {/* View All Button - Mobile/Tablet Only */}
              <div className="flex justify-center mt-8 lg:hidden">
                <CustomButton
                  variant="rippleBlueToYellowTeal"
                  size="md"
                  onClick={() => navigate(`/guest/tours?country=${encodeURIComponent(countryName)}`)}
                  className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
                >
                  {t('countryPage.viewAllTours')}
                </CustomButton>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaRoute className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('countryPage.noToursAvailable')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('countryPage.workingOnTours')} {t(`countryPage.countryNames.${countryName}`, countryName)}. {t('countryPage.checkBackSoon')}
              </p>
            </div>
          )}
        </section>

        {/* Hotels Section */}
        <section dir="ltr">
          <div className="relative mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t('countryPage.featuredHotels')}
            </h2>
            {/* View All Button - Desktop Only in Header */}
            {hotels.length > 0 && (
              <div className={`hidden lg:block lg:absolute ${isRTL ? 'lg:left-0' : 'lg:right-0'} lg:top-0`}>
                <CustomButton
                  variant="rippleBlueToYellowTeal"
                  size="md"
                  onClick={() => navigate(`/guest/hotels?country=${encodeURIComponent(countryName)}`)}
                >
                  {t('countryPage.viewAllHotels')}
                </CustomButton>
              </div>
            )}
          </div>

          {hotelsLoading ? (
            <div className="flex justify-center py-12">
              <RahalatekLoader size="lg" />
            </div>
          ) : hotels.length > 0 ? (
            <>
              {/* Carousel Container with Side Arrows */}
              <div className="relative flex items-center mb-6">
                {/* Left Arrow */}
                {totalHotelSlides > 1 && (
                  <button
                    onClick={prevHotelSlide}
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                    aria-label="Previous hotels"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Hotel Cards Container */}
                <div className="flex-1 overflow-hidden" ref={hotelCarouselRef}>
                  <div 
                    className="flex transition-transform duration-500 ease-in-out will-change-transform"
                    style={{ 
                      transform: `translate3d(-${currentHotelSlide * 100}%, 0, 0)`,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    {Array.from({ length: totalHotelSlides }, (_, slideIndex) => (
                      <div 
                        key={slideIndex} 
                        className={`w-full flex-shrink-0 ${
                          hotelScreenType === 'mobile' 
                            ? 'grid grid-cols-1 gap-4' 
                            : hotelScreenType === 'tablet'
                            ? 'grid grid-cols-2 gap-4'
                            : 'grid grid-cols-3 gap-6'
                        }`}
                      >
                        {hotels
                          .slice(slideIndex * hotelsPerSlide, (slideIndex + 1) * hotelsPerSlide)
                          .map((hotel, hotelIndex) => (
                <HotelCard
                              key={`${slideIndex}-${hotelIndex}`}
                  hotel={hotel}
                            />
                          ))
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Arrow */}
                {totalHotelSlides > 1 && (
                  <button
                    onClick={nextHotelSlide}
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                    aria-label="Next hotels"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dots Indicator */}
              {totalHotelSlides > 1 && (
                <div className="flex justify-center mb-6 gap-2">
                  {Array.from({ length: totalHotelSlides }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToHotelSlide(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                        index === currentHotelSlide
                          ? 'bg-yellow-400 dark:bg-blue-500 scale-125'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-500 dark:hover:bg-blue-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
              )}

              {/* View All Button - Mobile/Tablet Only */}
              <div className="flex justify-center mt-8 lg:hidden">
                <CustomButton
                  variant="rippleBlueToYellowTeal"
                  size="md"
                  onClick={() => navigate(`/guest/hotels?country=${encodeURIComponent(countryName)}`)}
                  className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
                >
                  {t('countryPage.viewAllHotels')}
                </CustomButton>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaHotel className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('countryPage.noHotelsAvailable')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('countryPage.workingOnHotels')} {t(`countryPage.countryNames.${countryName}`, countryName)}. {t('countryPage.checkBackSoon')}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GuestCountryPage;
