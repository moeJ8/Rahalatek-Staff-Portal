import React, { useState, useEffect, useCallback } from 'react';
import { FaClock, FaMapMarkerAlt, FaCrown, FaUsers, FaFilter, FaGem, FaAngleLeft, FaAngleRight, FaEye, FaChevronDown, FaChevronUp, FaCircle } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Flag from 'react-world-flags';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RahalatekLoader from '../../components/RahalatekLoader';
import Search from '../../components/Search';
import CustomButton from '../../components/CustomButton';
import CustomScrollbar from '../../components/CustomScrollbar';
import SearchableSelect from '../../components/SearchableSelect';
import axios from 'axios';
import PLACEHOLDER_IMAGES from '../../utils/placeholderImage';
import { getTranslatedText, getTranslatedArray } from '../../utils/translationUtils';

const GuestToursPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [tours, setTours] = useState([]);
  const [featuredTours, setFeaturedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenType, setScreenType] = useState('desktop');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [tourTypeFilter, setTourTypeFilter] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [expandedHighlights, setExpandedHighlights] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFeaturedOpen, setIsFeaturedOpen] = useState(false);
  const navigate = useNavigate();

  // Check screen size for responsive behavior
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
    } else if (width < 1024) {
      setScreenType('tablet');
    } else {
      setScreenType('desktop');
    }
  }, []);

  // Items per page based on screen type
  const getItemsPerPage = useCallback((type) => {
    switch(type) {
      case 'mobile':
        return 3;
      case 'tablet':
        return 6;
      case 'desktop':
      default:
        return 9;
    }
  }, []);

  // Debounce search term (300ms delay for faster response)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when screen type or filters change
  useEffect(() => {
    setPage(1);
  }, [screenType, debouncedSearchTerm, countryFilter, cityFilter, durationFilter, tourTypeFilter]);

  // Screen size effect
  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  // Language-aware meta content functions
  const getLocalizedMetaTitle = () => {
    const currentLang = i18n.language;
    
    // Base English titles
    let baseTitle;
    if (cityFilter) {
      baseTitle = `${cityFilter} Tours - Rahalatek`;
    } else if (countryFilter) {
      baseTitle = `${countryFilter} Tours - Rahalatek`;
    } else {
      baseTitle = 'Rahalatek Tours - Guided Tours & Travel Experiences';
    }
    
    if (currentLang === 'ar') {
      if (cityFilter) {
        return `جولات ${cityFilter} - رحلاتك`;
      } else if (countryFilter) {
        return `جولات ${countryFilter} - رحلاتك`;
      } else {
        return 'رحلاتك - الجولات السياحية والرحلات المرشدة';
      }
    }
    if (currentLang === 'fr') {
      if (cityFilter) {
        return `Visites ${cityFilter} - Rahalatek`;
      } else if (countryFilter) {
        return `Visites ${countryFilter} - Rahalatek`;
      } else {
        return 'Rahalatek - Visites Guidées & Expériences de Voyage';
      }
    }
    return baseTitle; // English
  };

  const getLocalizedMetaDescription = () => {
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      if (cityFilter) {
        return `اكتشف جولات رائعة في ${cityFilter} مع رحلاتك. تصفح الجولات الإرشادية وتجارب VIP وباقات السفر في ${cityFilter}. احجز جولتك المثالية في ${cityFilter} اليوم.`;
      } else if (countryFilter) {
        return `استكشف جولات ${countryFilter} مع رحلاتك. اعثر على جولات إرشادية وتجارب VIP وباقات سفر في جميع أنحاء ${countryFilter}. احجز جولتك المثالية في ${countryFilter} اليوم.`;
      } else {
        return 'تصفح الجولات الإرشادية الرائعة وتجارب السفر مع رحلاتك. اعثر على جولات جماعية وجولات VIP خاصة وتجارب ثقافية وجولات مغامرات حول العالم. احجز جولتك المثالية اليوم.';
      }
    }
    if (currentLang === 'fr') {
      if (cityFilter) {
        return `Découvrez des visites incroyables à ${cityFilter} avec Rahalatek. Parcourez les visites guidées, expériences VIP et forfaits de voyage à ${cityFilter}. Réservez votre visite ${cityFilter} parfaite aujourd'hui.`;
      } else if (countryFilter) {
        return `Explorez les visites ${countryFilter} avec Rahalatek. Trouvez des visites guidées, des expériences VIP et des forfaits de voyage dans toute la ${countryFilter}. Réservez votre visite ${countryFilter} parfaite aujourd'hui.`;
      } else {
        return 'Parcourez des visites guidées incroyables et des expériences de voyage avec Rahalatek. Trouvez des visites de groupe, des visites VIP privées et des visites d\'aventure dans le monde entier. Réservez votre visite parfaite aujourd\'hui.';
      }
    }
    
    // English
    if (cityFilter) {
      return `Discover amazing tours in ${cityFilter} with Rahalatek. Browse guided tours, VIP experiences, and travel packages in ${cityFilter}. Book your perfect ${cityFilter} tour today.`;
    } else if (countryFilter) {
      return `Explore ${countryFilter} tours with Rahalatek. Find guided tours, VIP experiences, and travel packages throughout ${countryFilter}. Book your perfect ${countryFilter} tour today.`;
    } else {
      return 'Browse amazing guided tours and travel experiences with Rahalatek. Find group tours, VIP private tours, cultural experiences, and adventure tours worldwide. Book your perfect tour today.';
    }
  };

  const getLocalizedMetaKeywords = () => {
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      if (cityFilter) {
        return `جولات ${cityFilter}, سفر ${cityFilter}, جولات إرشادية ${cityFilter}, رحلاتك, سياحة ${cityFilter}`;
      } else if (countryFilter) {
        return `جولات ${countryFilter}, سفر ${countryFilter}, جولات إرشادية ${countryFilter}, رحلاتك, سياحة ${countryFilter}`;
      } else {
        return 'جولات, جولات إرشادية, رحلاتك, تجارب سفر, جولات جماعية, جولات VIP, جولات ثقافية, جولات مغامرات, حجز جولات';
      }
    }
    if (currentLang === 'fr') {
      if (cityFilter) {
        return `visites ${cityFilter}, voyage ${cityFilter}, visites guidées ${cityFilter}, Rahalatek, tourisme ${cityFilter}`;
      } else if (countryFilter) {
        return `visites ${countryFilter}, voyage ${countryFilter}, visites guidées ${countryFilter}, Rahalatek, tourisme ${countryFilter}`;
      } else {
        return 'visites, visites guidées, Rahalatek, expériences voyage, visites groupe, visites VIP, visites culturelles, visites aventure, réservation visites';
      }
    }
    
    // English
    if (cityFilter) {
      return `${cityFilter} tours, ${cityFilter} travel, ${cityFilter} guided tours, ${cityFilter} experiences, tours in ${cityFilter}, ${cityFilter} tourism, ${cityFilter} attractions, ${cityFilter} sightseeing, visit ${cityFilter}, ${cityFilter} tour packages, Rahalatek`;
    } else if (countryFilter) {
      return `${countryFilter} tours, ${countryFilter} travel, ${countryFilter} guided tours, ${countryFilter} experiences, tours in ${countryFilter}, ${countryFilter} tourism, ${countryFilter} attractions, ${countryFilter} vacation, Rahalatek`;
    } else {
      return 'tours, guided tours, travel experiences, group tours, VIP tours, private tours, cultural tours, adventure tours, city tours, tour booking, travel packages, sightseeing tours, tour guide, travel activities, Rahalatek';
    }
  };

  // SEO Meta Tags and hreflang - similar to BlogListPage and GuestHomePage
  useEffect(() => {
    const baseUrl = window.location.origin;
    const currentLang = i18n.language;
    
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

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', `${baseUrl}/last-logo-3.png`);
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
    if (twitterImage) {
      twitterImage.setAttribute('content', `${baseUrl}/last-logo-3.png`);
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/guest/tours`;

    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(tag => tag.remove());

    // Add hreflang tags for all language versions
    const languages = [
      { code: 'en', path: '/guest/tours' },
      { code: 'ar', path: '/ar/guest/tours' },
      { code: 'fr', path: '/fr/guest/tours' }
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
    defaultLink.href = `${baseUrl}/guest/tours`;
    document.head.appendChild(defaultLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, cityFilter, countryFilter]);

  // Fetch filter options (only once on mount)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await axios.get('/api/tours');
      const allTours = response.data;
      
      // Extract unique countries and cities for filters
      const countries = [...new Set(allTours.map(tour => tour.country).filter(Boolean))].sort();
      const cities = [...new Set(allTours.map(tour => tour.city))].sort();
      setAvailableCountries(countries);
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  // Fetch featured tours (most viewed)
  const fetchFeaturedTours = useCallback(async () => {
    try {
      const response = await axios.get('/api/tours/featured?limit=4');
      setFeaturedTours(response.data || []);
    } catch (error) {
      console.error('Error fetching featured tours:', error);
    }
  }, []);

  // Fetch tours with server-side pagination and filtering
  const fetchTours = useCallback(async () => {
    try {
      // Only show loading on initial page load
      if (page === 1 && !countryFilter && !cityFilter && !debouncedSearchTerm && !tourTypeFilter && tours.length === 0) {
        setLoading(true);
      }
      
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: getItemsPerPage(screenType).toString()
      });
      
      if (countryFilter) params.append('country', countryFilter);
      if (cityFilter) params.append('city', cityFilter);
      if (tourTypeFilter) params.append('tourType', tourTypeFilter);
      if (debouncedSearchTerm.trim()) params.append('search', debouncedSearchTerm.trim());
      
      const response = await axios.get(`/api/tours?${params.toString()}`);
      
      if (response.data.success) {
        // Server-side paginated response
        setTours(response.data.data.tours);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalTours(response.data.data.pagination.totalTours);
      }
      
    } catch (error) {
      console.error('Error fetching tours:', error);
      setError('Failed to load tours. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, screenType, countryFilter, cityFilter, tourTypeFilter, debouncedSearchTerm, getItemsPerPage, tours.length]);

  // Fetch filter options and featured tours on mount
  useEffect(() => {
    fetchFilterOptions();
    fetchFeaturedTours();
  }, [fetchFilterOptions, fetchFeaturedTours]);

  // Fetch tours when dependencies change
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Client-side filtering for duration only (tour type now server-side)
  const getFilteredTours = useCallback(() => {
    let filtered = tours;
    
    // Apply duration filter (client-side)
    if (durationFilter) {
      const duration = parseInt(durationFilter);
      if (duration === 1) {
        filtered = filtered.filter(tour => tour.duration <= 3);
      } else if (duration === 2) {
        filtered = filtered.filter(tour => tour.duration > 3 && tour.duration <= 6);
      } else if (duration === 3) {
        filtered = filtered.filter(tour => tour.duration > 6);
      }
    }
    
    return filtered;
  }, [tours, durationFilter]);

  const displayedTours = getFilteredTours();

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCountryFilter = useCallback((e) => {
    const value = e.target.value;
    setCountryFilter(value);
    setCityFilter(''); // Reset city filter when country changes
  }, []);

  const handleCityFilter = useCallback((e) => {
    const value = e.target.value;
    setCityFilter(value);
  }, []);

  const handleDurationFilter = useCallback((e) => {
    const value = e.target.value;
    setDurationFilter(value);
  }, []);

  const handleTourTypeFilter = useCallback((e) => {
    const value = e.target.value;
    setTourTypeFilter(value);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCountryFilter('');
    setCityFilter('');
    setDurationFilter('');
    setTourTypeFilter('');
  }, []);

  const handleTourClick = useCallback(async (tour) => {
    try {
      // Increment view count
      await axios.post(`/api/tours/public/${tour.slug}/view`);
    } catch (error) {
      console.error('Error incrementing tour views:', error);
    }
    
    // Navigate to tour page with language prefix for SEO (only for ar/fr)
    const lang = i18n.language;
    if (lang === 'ar' || lang === 'fr') {
      navigate(`/${lang}/tours/${tour.slug}`);
    } else {
      navigate(`/tours/${tour.slug}`);
    }
  }, [navigate, i18n.language]);

  const getCountryCode = useCallback((country) => {
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
      'Albania': 'AL'
    };
    return codes[country] || null;
  }, []);

  const toggleHighlights = useCallback((tourId) => {
    setExpandedHighlights(prev => ({
      ...prev,
      [tourId]: !prev[tourId]
    }));
  }, []);

  const TourCard = ({ tour }) => {
    // Get primary image or first image
    const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];
    const imageUrl = primaryImage?.url || PLACEHOLDER_IMAGES.tour;

    // Get translated content
    const translatedName = getTranslatedText(tour, 'name', i18n.language);
    const translatedDescription = getTranslatedText(tour, 'description', i18n.language);
    const translatedHighlights = getTranslatedArray(tour, 'highlights', i18n.language);

    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group flex flex-col relative"
        onClick={() => handleTourClick(tour)}
        dir="ltr"
      >
        {/* Tour Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
            {tour.tourType === 'VIP' ? (
              <FaCrown className="w-4 h-4 text-yellow-400" />
            ) : (
              <FaUsers className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm font-medium">{tour.tourType}</span>
          </div>

          {/* Tour Name - Inside image at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className={`text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(translatedName) ? 'text-right' : 'text-left'
            }`}>
              {translatedName}
            </h3>
          </div>
        </div>

        {/* Tour Details */}
        <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">

          {/* Location and Duration */}
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

                     {/* Highlights */}
           {translatedHighlights && translatedHighlights.length > 0 && (
             <div className="mb-2">
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   toggleHighlights(tour._id);
                 }}
                 className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                 dir={isRTL ? 'rtl' : 'ltr'}
               >
                 <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                   <FaGem className="text-blue-500 dark:text-yellow-400 w-3 h-3" />
                   <span className="text-xs sm:text-sm font-medium">{t('toursPage.highlights')}</span>
                 </div>
                 {expandedHighlights[tour._id] ? (
                   <HiChevronUp className="text-sm transition-transform duration-200" />
                 ) : (
                   <HiChevronDown className="text-sm transition-transform duration-200" />
                 )}
               </button>
              
                                            {/* Expanded Highlights */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedHighlights[tour._id] ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-1" dir={isRTL ? 'rtl' : 'ltr'}>
                    {translatedHighlights.map((highlight, index) => (
                      <div key={index} className={`flex items-start ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} text-xs`}>
                        <FaCircle className="text-blue-500 dark:text-yellow-400 w-1.5 h-1.5 mt-1.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          )}

          {/* Description */}
          {translatedDescription && (
            <p className={`text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2 ${
              /[\u0600-\u06FF\u0750-\u077F]/.test(translatedDescription) ? 'text-right' : 'text-left'
            }`}>
              {translatedDescription}
            </p>
          )}

          {/* Price Display */}
          <div className="mt-auto">
            <div className="text-right">
              {tour.totalPrice && Number(tour.totalPrice) > 0 ? (
                <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                  ${tour.totalPrice}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {t('toursPage.contactForPricing')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Tours</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('toursPage.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {t('toursPage.subtitle')}
          </p>
        </div>

        {/* Mobile Filter Toggle Buttons */}
        <div className="lg:hidden mb-4 space-y-3">
          {/* Filters Toggle */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <FaFilter className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {t('toursPage.filters')}
              </span>
              {(searchTerm || countryFilter || cityFilter || durationFilter || tourTypeFilter) && (
                <span className="px-2 py-0.5 text-xs bg-blue-500 dark:bg-yellow-500 text-white dark:text-gray-900 rounded-full">
                  {t('toursPage.active')}
                </span>
              )}
            </div>
            {isFiltersOpen ? (
              <FaChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <FaChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Featured Tours Toggle */}
          <button
            onClick={() => setIsFeaturedOpen(!isFeaturedOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <FaEye className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {t('toursPage.featuredTours')}
              </span>
            </div>
            {isFeaturedOpen ? (
              <FaChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <FaChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Grid Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 order-1">
            <div className="lg:sticky lg:top-24">
              {/* Desktop: Single Card with All Content */}
              <div className="hidden lg:block">
                {/* Glowing Effect Wrapper */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-yellow-600 dark:to-orange-600 rounded-2xl opacity-20 blur transition duration-300 pointer-events-none"></div>
                  {/* Single Card Container */}
                  <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow overflow-hidden">
                    <CustomScrollbar maxHeight="calc(100vh - 120px)">
                      <div className="p-3 sm:p-4">
                      {/* Search and Filters Section */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FaFilter className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('toursPage.searchAndFilter')}</h3>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-3">
                          <Search
                            placeholder={t('toursPage.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full"
                            showClearButton={true}
                          />
                        </div>

                        {/* Country Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={countryFilter}
                            onChange={handleCountryFilter}
                            placeholder={t('toursPage.allCountries')}
                            label={t('toursPage.country')}
                            options={[
                              { value: '', label: t('toursPage.allCountries') },
                              ...availableCountries.map(country => ({ value: country, label: country }))
                            ]}
                          />
                        </div>

                        {/* City Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={cityFilter}
                            onChange={handleCityFilter}
                            placeholder={t('toursPage.allCities')}
                            label={t('toursPage.city')}
                            options={[
                              { value: '', label: t('toursPage.allCities') },
                              ...availableCities
                                .filter(city => !countryFilter || tours.some(tour => tour.city === city && tour.country === countryFilter))
                                .map(city => ({ value: city, label: city }))
                            ]}
                            disabled={countryFilter && !tours.some(tour => tour.country === countryFilter)}
                          />
                        </div>

                        {/* Tour Type Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={tourTypeFilter}
                            onChange={handleTourTypeFilter}
                            placeholder={t('toursPage.allTypes')}
                            label={t('toursPage.tourType')}
                            options={[
                              { value: '', label: t('toursPage.allTypes') },
                              { value: 'Group', label: t('toursPage.groupTours') },
                              { value: 'VIP', label: t('toursPage.vipTours') }
                            ]}
                          />
                        </div>

                        {/* Duration Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={durationFilter}
                            onChange={handleDurationFilter}
                            placeholder={t('toursPage.allDurations')}
                            label={t('toursPage.duration')}
                            options={[
                              { value: '', label: t('toursPage.allDurations') },
                              { value: '1', label: t('toursPage.shortDuration') },
                              { value: '2', label: t('toursPage.mediumDuration') },
                              { value: '3', label: t('toursPage.longDuration') }
                            ]}
                          />
                        </div>

                        {/* Clear Filters Button */}
                        <CustomButton 
                          variant="rippleRedToDarkRed" 
                          onClick={resetFilters}
                          disabled={!searchTerm && !countryFilter && !cityFilter && !durationFilter && !tourTypeFilter}
                          className="w-full"
                          icon={FaFilter}
                        >
                          {t('toursPage.clearFilters')}
                        </CustomButton>

                        {/* Results Count */}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
                          {t('toursPage.showingPage')} {page} {t('toursPage.of')} {totalPages} ({totalTours} {t('toursPage.toursTotal')})
                        </div>
                      </div>

                      {/* Divider */}
                      {featuredTours.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                      )}

                      {/* Featured Tours Section */}
                      {featuredTours.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FaEye className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('toursPage.featuredTours')}</h3>
                          </div>
                          <div className="space-y-3">
                            {featuredTours.map((tour) => {
                              const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];
                              const imageUrl = primaryImage?.url || PLACEHOLDER_IMAGES.tour;
                              const translatedName = getTranslatedText(tour, 'name', i18n.language);
                              
                              return (
                                <div
                                  key={tour._id}
                                  onClick={() => handleTourClick(tour)}
                                  className="flex gap-3 group cursor-pointer"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={translatedName}
                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 dark:group-hover:ring-yellow-400 transition-all"
                                  />
                                  <div className="flex-1 min-w-0 flex flex-col">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1">
                                      {translatedName}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                      {tour.city}, {tour.country}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                      <FaClock className="w-3 h-3" />
                                      <span>{tour.duration}h</span>
                                      <span className="text-gray-300 dark:text-gray-600">•</span>
                                      <FaEye className="w-3 h-3" />
                                      <span>{tour.views || 0} {t('toursPage.views')}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      </div>
                    </CustomScrollbar>
                  </div>
                </div>
              </div>

              {/* Mobile: Separate Collapsible Filters Section */}
              <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                isFiltersOpen ? 'max-h-[600px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
              }`}>
                {/* Glowing Effect Wrapper */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-yellow-600 dark:to-orange-600 rounded-2xl opacity-20 blur transition duration-300 pointer-events-none"></div>
                  {/* Single Card Container */}
                  <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow overflow-hidden">
                    <CustomScrollbar maxHeight="calc(100vh - 120px)">
                      <div className="p-3 sm:p-4">
                      {/* Search and Filters Section */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FaFilter className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('toursPage.searchAndFilter')}</h3>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-3">
                          <Search
                            placeholder={t('toursPage.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full"
                            showClearButton={true}
                          />
                        </div>

                        {/* Country Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={countryFilter}
                            onChange={handleCountryFilter}
                            placeholder={t('toursPage.allCountries')}
                            label={t('toursPage.country')}
                            options={[
                              { value: '', label: t('toursPage.allCountries') },
                              ...availableCountries.map(country => ({ value: country, label: country }))
                            ]}
                          />
                        </div>

                        {/* City Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={cityFilter}
                            onChange={handleCityFilter}
                            placeholder={t('toursPage.allCities')}
                            label={t('toursPage.city')}
                            options={[
                              { value: '', label: t('toursPage.allCities') },
                              ...availableCities
                                .filter(city => !countryFilter || tours.some(tour => tour.city === city && tour.country === countryFilter))
                                .map(city => ({ value: city, label: city }))
                            ]}
                            disabled={countryFilter && !tours.some(tour => tour.country === countryFilter)}
                          />
                        </div>

                        {/* Tour Type Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={tourTypeFilter}
                            onChange={handleTourTypeFilter}
                            placeholder={t('toursPage.allTypes')}
                            label={t('toursPage.tourType')}
                            options={[
                              { value: '', label: t('toursPage.allTypes') },
                              { value: 'Group', label: t('toursPage.groupTours') },
                              { value: 'VIP', label: t('toursPage.vipTours') }
                            ]}
                          />
                        </div>

                        {/* Duration Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={durationFilter}
                            onChange={handleDurationFilter}
                            placeholder={t('toursPage.allDurations')}
                            label={t('toursPage.duration')}
                            options={[
                              { value: '', label: t('toursPage.allDurations') },
                              { value: '1', label: t('toursPage.shortDuration') },
                              { value: '2', label: t('toursPage.mediumDuration') },
                              { value: '3', label: t('toursPage.longDuration') }
                            ]}
                          />
                        </div>

                        {/* Clear Filters Button */}
                        <CustomButton 
                          variant="rippleRedToDarkRed" 
                          onClick={resetFilters}
                          disabled={!searchTerm && !countryFilter && !cityFilter && !durationFilter && !tourTypeFilter}
                          className="w-full"
                          icon={FaFilter}
                        >
                          {t('toursPage.clearFilters')}
                        </CustomButton>

                        {/* Results Count */}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
                          {t('toursPage.showingPage')} {page} {t('toursPage.of')} {totalPages} ({totalTours} {t('toursPage.toursTotal')})
                        </div>
                      </div>
                      </div>
                    </CustomScrollbar>
                  </div>
                </div>
              </div>

              {/* Mobile: Separate Collapsible Featured Tours Section */}
              <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                isFeaturedOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                {/* Glowing Effect Wrapper */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-yellow-600 dark:to-orange-600 rounded-2xl opacity-20 blur transition duration-300 pointer-events-none"></div>
                  {/* Single Card Container */}
                  <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow overflow-hidden">
                    <CustomScrollbar maxHeight="calc(100vh - 120px)">
                      <div className="p-3 sm:p-4">
                        {/* Featured Tours Section */}
                        {featuredTours.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FaEye className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                              <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('toursPage.featuredTours')}</h3>
                            </div>
                            <div className="space-y-3">
                              {featuredTours.map((tour) => {
                                const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0];
                                const imageUrl = primaryImage?.url || PLACEHOLDER_IMAGES.tour;
                                const translatedName = getTranslatedText(tour, 'name', i18n.language);
                                
                                return (
                                  <div
                                    key={tour._id}
                                    onClick={() => handleTourClick(tour)}
                                    className="flex gap-3 group cursor-pointer"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={translatedName}
                                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 dark:group-hover:ring-yellow-400 transition-all"
                                    />
                                    <div className="flex-1 min-w-0 flex flex-col">
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1">
                                        {translatedName}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        {tour.city}, {tour.country}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                        <FaClock className="w-3 h-3" />
                                        <span>{tour.duration}h</span>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <FaEye className="w-3 h-3" />
                                        <span>{tour.views || 0} {t('toursPage.views')}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CustomScrollbar>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-2">
            {/* Tours Grid */}
            {displayedTours.length > 0 ? (
              <>
                <div className={`grid gap-4 sm:gap-6 ${
                  screenType === 'mobile' 
                    ? 'grid-cols-1' 
                    : screenType === 'tablet'
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
                }`}>
                  {displayedTours.map((tour) => (
                    <TourCard key={tour._id} tour={tour} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                    {/* Previous Button */}
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                        page === 1
                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:scale-110 shadow-sm hover:shadow-md'
                      }`}
                      aria-label="Previous page"
                    >
                      {isRTL ? <FaAngleRight className="w-4 h-4" /> : <FaAngleLeft className="w-4 h-4" />}
                    </button>

                    {/* Page Numbers - Sliding Window */}
                    {(() => {
                      const pages = [];
                      const showPages = 5;
                      let startPage = Math.max(1, page - Math.floor(showPages / 2));
                      let endPage = Math.min(totalPages, startPage + showPages - 1);
                      
                      if (endPage - startPage < showPages - 1) {
                        startPage = Math.max(1, endPage - showPages + 1);
                      }

                      // Generate page number buttons (sliding window - no ellipsis)
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                              i === page
                                ? 'bg-blue-500 dark:bg-yellow-600 text-white dark:text-gray-900 border-blue-500 dark:border-yellow-600 scale-110 shadow-lg'
                                : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-yellow-600 dark:hover:text-gray-900 hover:border-blue-500 dark:hover:border-yellow-600 hover:scale-110 shadow-sm hover:shadow-md'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      return pages;
                    })()}

                    {/* Next Button */}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                        page === totalPages
                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:scale-110 shadow-sm hover:shadow-md'
                      }`}
                      aria-label="Next page"
                    >
                      {isRTL ? <FaAngleLeft className="w-4 h-4" /> : <FaAngleRight className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('toursPage.noToursAvailable')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || countryFilter || cityFilter || durationFilter || tourTypeFilter
                    ? t('toursPage.noToursFiltered')
                    : t('toursPage.noToursYet')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestToursPage;
