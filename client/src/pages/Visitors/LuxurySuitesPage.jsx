import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaCheckCircle,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaInstagram,
  FaCircle
} from 'react-icons/fa';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';
import ContactForm from '../../components/ContactForm';
import FloatingContactButtons from '../../components/FloatingContactButtons';

export default function LuxurySuitesPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };
  useEffect(() => {
    document.title = 'Luxury Suites | Rahalatek';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Experience luxury serviced apartments in Türkiye with Rahalatek. Premium suites with exceptional amenities, privacy, and world-class service. Book your perfect stay today!'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'luxury suites Turkey, premium serviced apartments, luxury accommodation Turkey, furnished apartments Istanbul, luxury apartments Antalya, serviced apartments Trabzon, luxury suites Cappadocia, premium accommodation Turkey, luxury stay Turkey, furnished apartments Turkey'
      );
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Luxury Suites - Premium Serviced Apartments in Türkiye | Rahalatek');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        'Experience luxury serviced apartments in Türkiye with Rahalatek. Premium suites with exceptional amenities, privacy, and world-class service. Book your perfect stay today!'
      );
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855915/492475786-960x630_kjybmn.jpg');
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href);
    }

    // Update Twitter Card
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard) {
      twitterCard.setAttribute('content', 'summary_large_image');
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'Luxury Suites - Premium Serviced Apartments in Türkiye | Rahalatek');
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 
        'Experience luxury serviced apartments in Türkiye with Rahalatek. Premium suites with exceptional amenities, privacy, and world-class service.'
      );
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855915/492475786-960x630_kjybmn.jpg');
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": "Rahalatek Luxury Suites",
      "description": "Premium serviced apartments and luxury suites in Türkiye",
      "url": window.location.href,
      "image": "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855915/492475786-960x630_kjybmn.jpg",
      "telephone": "+905010684657",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR"
      },
      "areaServed": "Türkiye",
      "serviceType": "Luxury Serviced Apartments",
      "priceRange": "$$$-$$$$",
      "amenityFeature": [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Fully Equipped Kitchen"
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Free Wi-Fi"
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Air Conditioning"
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "24/7 Support"
        }
      ]
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] overflow-hidden -mt-6" dir="ltr">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://res.cloudinary.com/dnzqnr6js/image/upload/c_fill,w_2560,h_1440,q_100,f_auto/v1759860833/Panorama_vvjf0a.jpg"
            alt="Luxury Suites"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'Jost, sans-serif' }}>
              {t('luxurySuitesPage.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed">
              {t('luxurySuitesPage.hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="mt-3 sm:mt-4">
        <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide gap-1 sm:gap-2 md:gap-4 px-4 pb-2 sm:pb-0">
          <button 
            onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('luxurySuitesPage.nav.overview')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            <span className="hidden sm:inline">{t('luxurySuitesPage.nav.whyChooseUsFull')}</span>
            <span className="inline sm:hidden">{t('luxurySuitesPage.nav.whyChooseUsShort')}</span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('luxurySuitesPage.nav.apartmentTypes')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('luxurySuitesPage.nav.destinations')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('luxurySuitesPage.nav.contact')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('luxurySuitesPage.nav.faqs')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Introduction Section */}
        <div id="overview" className="scroll-mt-24"></div>
        <section className="mb-8 sm:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759854757/7341960_uzi0fz.jpg"
                  alt="Luxury Suite"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('luxurySuitesPage.introduction.title')}
              </h2>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t('luxurySuitesPage.introduction.subtitle')}
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.introduction.problems.0')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.introduction.problems.1')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.introduction.problems.2')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.introduction.problems.3')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.introduction.problems.4')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.introduction.problems.5')}</span>
              </li>
              </ul>
            </div>
          </div>
        </section>

        {/* What is the Service Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            {t('luxurySuitesPage.serviceSection.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            {t('luxurySuitesPage.serviceSection.description')}
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {t('luxurySuitesPage.serviceSection.offersTitle')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-6">
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.serviceSection.offers.0')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.serviceSection.offers.1')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.serviceSection.offers.2')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.serviceSection.offers.3')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.serviceSection.offers.4')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('luxurySuitesPage.serviceSection.offers.5')}</span>
              </li>
            </ul>
          </div>
          
          {/* Image */}
          <div className="relative h-[350px] sm:h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-lg mt-6">
            <img
              src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759854903/419921490_yi71dt.jpg?w=1920&h=1080&fit=crop&q=95"
              alt="Serviced Apartments"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Features Section */}
        <div id="features" className="scroll-mt-24"></div>
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            {t('luxurySuitesPage.features.title')}
          </h2>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-8 text-center">
            {t('luxurySuitesPage.features.subtitle')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Content */}
            <div>
              {/* Feature 1: Strategic Locations */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.features.strategic.title')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                  {t('luxurySuitesPage.features.strategic.description')}
                </p>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.strategic.points.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.strategic.points.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.strategic.points.2')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.strategic.points.3')}</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2: Luxurious Amenities */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.features.amenities.title')}
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.amenities.points.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.amenities.points.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.amenities.points.2')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.amenities.points.3')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.amenities.points.4')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.amenities.points.5')}</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3: Comprehensive Services */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.features.services.title')}
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.services.points.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.services.points.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.services.points.2')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.services.points.3')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.services.points.4')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.features.services.points.5')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Image */}
            <div className="relative h-[400px] lg:h-[600px] rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855361/Istanbuls-Aprtments-on-the-sea-3_cvbrpj.jpg?w=1920&h=1080&fit=crop&q=95"
                alt="Istanbul Apartments"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* Apartment Options Section */}
        <div id="amenities" className="scroll-mt-24"></div>
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            {t('luxurySuitesPage.apartmentTypes.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            {t('luxurySuitesPage.apartmentTypes.description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Studio Apartment */}
            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-102 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-yellow-400 transition-all duration-300">
              <div className="relative h-64 sm:h-72">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855917/494290891-960x640_u06otx.jpg?w=1200&h=800&fit=crop&q=95"
                  alt="Studio Apartment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.apartmentTypes.studio.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.studio.features.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.studio.features.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.studio.features.2')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* One Bedroom Apartment */}
            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-102 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-yellow-400 transition-all duration-300">
              <div className="relative h-64 sm:h-72">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855915/492475786-960x630_kjybmn.jpg?w=1200&h=800&fit=crop&q=95"
                  alt="One Bedroom Apartment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.apartmentTypes.oneBedroom.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.oneBedroom.features.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.oneBedroom.features.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.oneBedroom.features.2')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Two Bedroom Apartment */}
            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-102 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-yellow-400 transition-all duration-300">
              <div className="relative h-64 sm:h-72">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855915/423676149-960x667_lg6elb.jpg?w=1200&h=800&fit=crop&q=95"
                  alt="Two Bedroom Apartment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.apartmentTypes.twoBedroom.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.twoBedroom.features.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.twoBedroom.features.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.twoBedroom.features.2')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Luxury Apartment */}
            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-102 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-yellow-400 transition-all duration-300">
              <div className="relative h-64 sm:h-72">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855914/504869683-960x640_cgd2n3.jpg?w=1200&h=800&fit=crop&q=95"
                  alt="Luxury Apartment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('luxurySuitesPage.apartmentTypes.luxury.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.luxury.features.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.luxury.features.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.luxury.features.2')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.apartmentTypes.luxury.features.3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Section */}
        <div id="destinations" className="scroll-mt-24"></div>
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('luxurySuitesPage.destinations.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Destination Card 1 - Istanbul */}
            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-102 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-yellow-400 transition-all duration-300">
              <div className="relative h-64 sm:h-72">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759857215/turkey-2809936_1280-960x720_m9tl9e.jpg?w=1200&h=800&fit=crop&q=95"
                  alt="Istanbul"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.destinations.istanbul.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.istanbul.features.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.istanbul.features.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.istanbul.features.2')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Destination Card 2 - Trabzon */}
            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-102 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-yellow-400 transition-all duration-300">
              <div className="relative h-64 sm:h-72">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759857214/high-angle-view-buildings-mountains-against-sky-landscape-uzungol-turkey-960x640_wcmszt.webp?w=1200&h=800&fit=crop&q=95"
                  alt="Trabzon"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.destinations.trabzon.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.trabzon.features.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.trabzon.features.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.trabzon.features.2')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Destination Card 3 - Antalya */}
            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-102 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-yellow-400 transition-all duration-300">
              <div className="relative h-64 sm:h-72">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759857214/527859113-960x639_plf9mg.jpg?w=1200&h=800&fit=crop&q=95"
                  alt="Antalya"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.destinations.antalya.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.antalya.features.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.antalya.features.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.antalya.features.2')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Destination Card 4 - Bursa */}
            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:scale-102 hover:-translate-y-1 hover:border-blue-500 dark:hover:border-yellow-400 transition-all duration-300">
              <div className="relative h-64 sm:h-72">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759857213/istockphoto-1337018056-612x612-1_ludtco.jpg?w=1200&h=800&fit=crop&q=95"
                  alt="Bursa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('luxurySuitesPage.destinations.bursa.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.bursa.features.0')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.bursa.features.1')}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                    <span>{t('luxurySuitesPage.destinations.bursa.features.2')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Call to Action Section */}
      <div id="contact" className="scroll-mt-24"></div>
      <section className="bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('luxurySuitesPage.contact.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              {t('luxurySuitesPage.contact.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Email Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="mailto:info@rahalatek.com"
                className="relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center flex-grow justify-between">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 dark:bg-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaEnvelope className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 min-h-[3rem] flex items-center justify-center leading-tight">
                  {t('luxurySuitesPage.contact.email')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                  info@rahalatek.com
                </p>
              </div>
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="https://wa.me/905010684657"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center flex-grow justify-between">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 dark:bg-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaWhatsapp className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 min-h-[3rem] flex items-center justify-center leading-tight">
                  {t('luxurySuitesPage.contact.contactNow')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                  {t('luxurySuitesPage.contact.whatsapp')}
                </p>
              </div>
              </a>
            </div>

            {/* Instagram Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 dark:from-purple-600 dark:via-pink-600 dark:to-orange-500 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="https://www.instagram.com/rahalatek_/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-pink-500 dark:hover:border-pink-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center flex-grow justify-between">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaInstagram className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 min-h-[3rem] flex items-center justify-center leading-tight">
                  {t('luxurySuitesPage.contact.followUs')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                  {t('luxurySuitesPage.contact.instagram')}
                </p>
              </div>
              </a>
            </div>

            {/* Phone Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-yellow-500 dark:from-blue-400 dark:to-yellow-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="tel:+905010684657"
                className="relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center flex-grow justify-between">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 dark:bg-yellow-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaPhone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 min-h-[3rem] flex items-center justify-center leading-tight">
                  {t('luxurySuitesPage.contact.callNow')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium break-all">
                  +905010684657
                </p>
              </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('luxurySuitesPage.contactForm.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              {t('luxurySuitesPage.contactForm.description')}
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* FAQs Section */}
      <div id="faqs" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">{t('luxurySuitesPage.faqs.title')}</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {/* FAQ 1 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 0 
                  ? `shadow-md ${isRTL ? 'border-r-4 border-r-blue-500 dark:border-r-yellow-400' : 'border-l-4 border-l-blue-500 dark:border-l-yellow-400'}` 
                  : `hover:shadow-md ${isRTL ? 'hover:border-r-4 hover:border-r-blue-500 dark:hover:border-r-yellow-400' : 'hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'}`
              }`}
            >
              <button
                onClick={() => toggleFaq(0)}
                className={`flex justify-between items-center w-full px-4 sm:px-6 py-5 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                aria-expanded={activeFaqIndex === 0}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow ${isRTL ? 'pl-3' : 'pr-3'} ${
                  activeFaqIndex === 0 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {t('luxurySuitesPage.faqs.items.0.question')}
                </h3>
                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                  activeFaqIndex === 0 
                    ? 'bg-blue-100 dark:bg-yellow-900/30 text-blue-600 dark:text-yellow-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {activeFaqIndex === 0 ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaqIndex === 0 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 sm:px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                  {t('luxurySuitesPage.faqs.items.0.answer')}
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 1 
                  ? `shadow-md ${isRTL ? 'border-r-4 border-r-blue-500 dark:border-r-yellow-400' : 'border-l-4 border-l-blue-500 dark:border-l-yellow-400'}` 
                  : `hover:shadow-md ${isRTL ? 'hover:border-r-4 hover:border-r-blue-500 dark:hover:border-r-yellow-400' : 'hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'}`
              }`}
            >
              <button
                onClick={() => toggleFaq(1)}
                className={`flex justify-between items-center w-full px-4 sm:px-6 py-5 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                aria-expanded={activeFaqIndex === 1}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow ${isRTL ? 'pl-3' : 'pr-3'} ${
                  activeFaqIndex === 1 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {t('luxurySuitesPage.faqs.items.1.question')}
                </h3>
                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                  activeFaqIndex === 1 
                    ? 'bg-blue-100 dark:bg-yellow-900/30 text-blue-600 dark:text-yellow-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {activeFaqIndex === 1 ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaqIndex === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 sm:px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                  {t('luxurySuitesPage.faqs.items.1.answer')}
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 2 
                  ? `shadow-md ${isRTL ? 'border-r-4 border-r-blue-500 dark:border-r-yellow-400' : 'border-l-4 border-l-blue-500 dark:border-l-yellow-400'}` 
                  : `hover:shadow-md ${isRTL ? 'hover:border-r-4 hover:border-r-blue-500 dark:hover:border-r-yellow-400' : 'hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'}`
              }`}
            >
              <button
                onClick={() => toggleFaq(2)}
                className={`flex justify-between items-center w-full px-4 sm:px-6 py-5 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                aria-expanded={activeFaqIndex === 2}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow ${isRTL ? 'pl-3' : 'pr-3'} ${
                  activeFaqIndex === 2 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {t('luxurySuitesPage.faqs.items.2.question')}
                </h3>
                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                  activeFaqIndex === 2 
                    ? 'bg-blue-100 dark:bg-yellow-900/30 text-blue-600 dark:text-yellow-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {activeFaqIndex === 2 ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaqIndex === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 sm:px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                  {t('luxurySuitesPage.faqs.items.2.answer')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Contact Buttons */}
      <FloatingContactButtons />
    </div>
  );
}

