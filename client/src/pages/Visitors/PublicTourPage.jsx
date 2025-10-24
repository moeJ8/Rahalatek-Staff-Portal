import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, FaClock, FaUsers, FaCar, FaCheck, FaPhone, FaEnvelope, FaChild, FaCheckCircle, FaCrown
} from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ImageGallery from '../../components/ImageGallery';
import RahalatekLoader from '../../components/RahalatekLoader';
import OtherToursCarousel from '../../components/OtherToursCarousel';
import GuestNotFoundPage from './GuestNotFoundPage';
import NotFoundPage from '../NotFoundPage';

const PublicTourPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherTours, setOtherTours] = useState([]);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const fetchOtherTours = async () => {
    try {
      const response = await axios.get('/api/tours');
      setOtherTours(response.data);
    } catch (error) {
      console.error('Failed to fetch other tours:', error);
    }
  };

  useEffect(() => {
    const fetchTour = async () => {
      try {
        if (!slug || slug === 'undefined') {
          const user = localStorage.getItem('user');
          return user ? <NotFoundPage /> : <GuestNotFoundPage type="voucher" />;
        }

        const response = await axios.get(`/api/tours/public/${slug}`);
        const tourData = response.data;
        setTour(tourData);

        // Set dynamic page title and meta tags with tour data
        if (tourData && tourData.name) {
          document.title = `${tourData.name} | Rahalatek`;
          
          // Update meta description with tour details
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            const description = tourData.description 
              ? tourData.description.substring(0, 150) + '...'
              : `Discover ${tourData.name} with Rahalatek. ${tourData.tourType} tour in ${tourData.city}, ${tourData.country}. Duration: ${tourData.duration} hours.`;
            metaDescription.setAttribute('content', description);
          }

          // Update keywords with tour-specific terms
          const metaKeywords = document.querySelector('meta[name="keywords"]');
          if (metaKeywords) {
            const keywords = `${tourData.name}, ${tourData.city}, ${tourData.country}, ${tourData.tourType.toLowerCase()} tour, guided tour, travel, tourism, ${tourData.duration} hours, tour booking, travel experiences`;
            metaKeywords.setAttribute('content', keywords);
          }

          // Update Open Graph with tour details
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) {
            ogTitle.setAttribute('content', `${tourData.name} | Rahalatek`);
          }

          const ogDescription = document.querySelector('meta[property="og:description"]');
          if (ogDescription) {
            const ogDesc = tourData.description 
              ? tourData.description.substring(0, 200) + '...'
              : `Discover ${tourData.name} with Rahalatek. ${tourData.tourType} tour in ${tourData.city}, ${tourData.country}.`;
            ogDescription.setAttribute('content', ogDesc);
          }
        }

        // Fetch other tours
        await fetchOtherTours();
      } catch (error) {
        console.error('Failed to fetch tour:', error);
        setTour(null);
        document.title = 'Tour Not Found | Rahalatek';
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [slug, navigate]);

  const getCarTypeDisplay = (carType, capacity) => {
    if (carType === 'Vito') {
      return `${t(`publicTourPage.vehicleTypes.${carType}`, carType)} (${capacity.min}-${capacity.max} ${t('publicTourPage.vehicleCapacity')})`;
    } else if (carType === 'Sprinter') {
      return `${t(`publicTourPage.vehicleTypes.${carType}`, carType)} (${capacity.min}-${capacity.max} ${t('publicTourPage.vehicleCapacity')})`;
    }
    return t(`publicTourPage.vehicleTypes.${carType}`, carType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="lg" />
      </div>
    );
  }

  if (!tour) {
    // Check if user is authenticated to show appropriate 404 page
    const user = localStorage.getItem('user');
    return user ? <NotFoundPage /> : <GuestNotFoundPage type="voucher" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-2 sm:pt-4 md:pt-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        {/* Tour Title */}
        <div className="mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tour.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className={`flex items-center text-gray-600 dark:text-gray-400 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <FaMapMarkerAlt className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'mr-0 ml-2' : ''}`} />
              <span className="text-sm sm:text-base">
                {t(`publicTourPage.cities.${tour.city}`, tour.city)}, {t(`publicTourPage.countries.${tour.country}`, tour.country)}
              </span>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <span className="text-blue-600 dark:text-yellow-400 bg-blue-50 dark:bg-yellow-900/20 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                {t(`publicTourPage.tourTypeCombined.${tour.tourType}`, `${tour.tourType} ${t('publicTourPage.tourLabel')}`)}
              </span>
              <div className={`flex items-center text-gray-600 dark:text-gray-400 ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                <FaClock className={`w-3 h-3 sm:w-4 sm:h-4 ${isRTL ? 'mr-0 ml-1' : ''}`} />
                <span className="text-sm sm:text-base">{tour.duration} {tour.duration === 1 ? t('publicTourPage.details.hour') : t('publicTourPage.details.hours')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Image Gallery */}
        <ImageGallery 
          images={tour.images ? [...tour.images].sort((a, b) => b.isPrimary - a.isPrimary) : []} 
          title={tour.name}
          className="h-[200px] xs:h-[220px] sm:h-[280px] md:h-[320px] lg:h-[400px]"
        />
        
        {/* Navigation Bar */}
        <div className="mt-3 sm:mt-4">
          <div className="flex justify-center overflow-x-auto scrollbar-hide gap-1 sm:gap-2 md:gap-4 px-4 pb-2 sm:pb-0">
            <button 
              onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              {t('publicTourPage.nav.overview')}
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
            </button>
            {tour.highlights && tour.highlights.length > 0 && (
              <button 
                onClick={() => document.getElementById('highlights')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                {t('publicTourPage.nav.highlights')}
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
              </button>
            )}
            <button 
              onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              {t('publicTourPage.nav.information')}
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => document.getElementById('policies')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              {t('publicTourPage.nav.policies')}
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
            </button>
            {tour.faqs && tour.faqs.length > 0 && (
              <button 
                onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                {t('publicTourPage.nav.faqs')}
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div id="overview" className="scroll-mt-24"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicTourPage.overview.title')}</h2>
        <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
          {tour.description}
        </div>
        {tour.detailedDescription && (
          <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
            {tour.detailedDescription}
          </div>
        )}
      </div>

      {/* Tour Highlights */}
      {tour.highlights && tour.highlights.length > 0 && (
        <>
          <div id="highlights" className="scroll-mt-24"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicTourPage.highlights.title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {tour.highlights.map((highlight, index) => (
                <div key={index} className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3 sm:space-x-4' : 'space-x-3 sm:space-x-4'}`}>
                  <FaCheck className={`text-blue-600 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 ${isRTL ? 'mr-0 ml-3 sm:ml-4' : ''}`} />
                  <span className="text-gray-800 dark:text-gray-200 text-sm sm:text-base">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tour Details */}
      <div id="details" className="scroll-mt-24"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicTourPage.details.title')}</h2>
        
        <div className="space-y-6 sm:space-y-8">
          {/* Tour Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4 sm:space-x-6' : 'space-x-4 sm:space-x-6'}`}>
              <div className={`bg-blue-100 dark:bg-yellow-900/30 p-3 rounded-lg ${isRTL ? 'mr-0 ml-4 sm:ml-6' : ''}`}>
                {tour.tourType === 'VIP' ? (
                  <FaCrown className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 dark:text-yellow-400" />
                ) : (
                  <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 dark:text-yellow-400" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('publicTourPage.details.tourType')}</h4>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{t(`publicTourPage.tourTypes.${tour.tourType}`, tour.tourType)}</p>
              </div>
            </div>

            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4 sm:space-x-6' : 'space-x-4 sm:space-x-6'}`}>
              <div className={`bg-blue-100 dark:bg-yellow-900/30 p-3 rounded-lg ${isRTL ? 'mr-0 ml-4 sm:ml-6' : ''}`}>
                <FaClock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('publicTourPage.details.duration')}</h4>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {tour.duration} {tour.duration === 1 ? t('publicTourPage.details.hour') : t('publicTourPage.details.hours')}
                </p>
              </div>
            </div>

            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4 sm:space-x-6' : 'space-x-4 sm:space-x-6'}`}>
              <div className={`bg-blue-100 dark:bg-yellow-900/30 p-3 rounded-lg ${isRTL ? 'mr-0 ml-4 sm:ml-6' : ''}`}>
                <FaMapMarkerAlt className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('publicTourPage.details.location')}</h4>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {t(`publicTourPage.cities.${tour.city}`, tour.city)}, {t(`publicTourPage.countries.${tour.country}`, tour.country)}
                </p>
              </div>
            </div>

            {tour.tourType === 'VIP' && (
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4 sm:space-x-6' : 'space-x-4 sm:space-x-6'}`}>
                <div className={`bg-blue-100 dark:bg-yellow-900/30 p-3 rounded-lg ${isRTL ? 'mr-0 ml-4 sm:ml-6' : ''}`}>
                  <FaCar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 dark:text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('publicTourPage.details.vehicle')}</h4>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {getCarTypeDisplay(tour.vipCarType, tour.carCapacity)}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Tour Policies */}
      <div id="policies" className="scroll-mt-24"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicTourPage.policies.title')}</h2>
        
        <div className="space-y-6 sm:space-y-8">
          {/* Children Policy */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('publicTourPage.policies.childrenPolicy')}</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <FaChild className={`text-blue-600 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 ${isRTL ? 'mr-0 ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{t('publicTourPage.policies.under3')}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{tour.childrenPolicies?.under3 || t('publicTourPage.policies.free')}</p>
                </div>
              </div>
              <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <FaChild className={`text-blue-600 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 ${isRTL ? 'mr-0 ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{t('publicTourPage.policies.above3')}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{tour.childrenPolicies?.above3 || t('publicTourPage.policies.adultPrice')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Policies - Dynamic from backend */}
          {tour.policies && tour.policies.length > 0 && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('publicTourPage.policies.bookingCancellation')}</h3>
              <div className="space-y-2 sm:space-y-3">
                {tour.policies.map((policy, index) => (
                  <div key={index} className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                    <FaCheckCircle className={`text-blue-600 dark:text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 ${isRTL ? 'mr-0 ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`} />
                    <span className="text-gray-800 dark:text-gray-200 text-sm sm:text-base">{policy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Other Tours Carousel */}
      {otherTours.length > 0 && (
        <div dir="ltr">
          <OtherToursCarousel 
            tours={otherTours}
            currentTourId={tour?._id}
          />
        </div>
      )}

      {/* FAQs Section */}
      <div id="faqs" className="scroll-mt-24"></div>
      {tour.faqs && tour.faqs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('publicTourPage.faqs.title')}</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {tour.faqs.map((faq, index) => (
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
    </div>
  );
};

export default PublicTourPage;