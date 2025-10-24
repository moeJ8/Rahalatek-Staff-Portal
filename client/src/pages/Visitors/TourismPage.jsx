import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaMapMarkedAlt, 
  FaUserTie, 
  FaCogs, 
  FaCar, 
  FaHotel, 
  FaDollarSign,
  FaCheckCircle,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaInstagram,
  FaCircle
} from 'react-icons/fa';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';
import FeaturedTours from '../../components/Visitors/FeaturedTours';
import ContactForm from '../../components/ContactForm';
import FloatingContactButtons from '../../components/FloatingContactButtons';

export default function TourismPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };
  useEffect(() => {
    document.title = 'Tourism Tours | Rahalatek';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Discover the magic of Türkiye with the best tours from Rahalatek. Professional tour guides, diverse destinations, comfortable transportation, and competitive prices. Book your Turkish adventure today!'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'Turkey tours, tourism tours, guided tours Turkey, professional tour guides, Turkish tourism, cultural tours, adventure tours, Turkey travel, tour packages Turkey, private tours, group tours, Istanbul tours, Cappadocia tours, Antalya tours, Trabzon tours, Turkish culture, historical tours Turkey'
      );
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Tourism Tours - Discover the Magic of Türkiye | Rahalatek');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        'Discover the magic of Türkiye with the best tours from Rahalatek. Professional guides, diverse destinations, and unforgettable experiences. Book your Turkish adventure today!'
      );
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759789335/Istanbul-1_eqyqij.jpg');
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
      twitterTitle.setAttribute('content', 'Tourism Tours - Discover the Magic of Türkiye | Rahalatek');
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 
        'Discover the magic of Türkiye with the best tours from Rahalatek. Professional guides, diverse destinations, and unforgettable experiences.'
      );
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759789335/Istanbul-1_eqyqij.jpg');
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
      "@type": "TravelAgency",
      "name": "Rahalatek",
      "description": "Professional tourism and travel services in Türkiye",
      "url": window.location.origin,
      "logo": "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759789335/Istanbul-1_eqyqij.jpg",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+905010684657",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "English", "Turkish"]
      },
      "areaServed": "Türkiye",
      "serviceType": "Tourism Tours"
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, []);

  const features = [
    {
      icon: FaMapMarkedAlt,
      titleKey: 'tourismPage.features.items.0.title',
      descriptionKey: 'tourismPage.features.items.0.description',
      color: 'blue'
    },
    {
      icon: FaUserTie,
      titleKey: 'tourismPage.features.items.1.title',
      descriptionKey: 'tourismPage.features.items.1.description',
      color: 'teal'
    },
    {
      icon: FaCogs,
      titleKey: 'tourismPage.features.items.2.title',
      descriptionKey: 'tourismPage.features.items.2.description',
      color: 'purple'
    },
    {
      icon: FaCar,
      titleKey: 'tourismPage.features.items.3.title',
      descriptionKey: 'tourismPage.features.items.3.description',
      color: 'green'
    },
    {
      icon: FaHotel,
      titleKey: 'tourismPage.features.items.4.title',
      descriptionKey: 'tourismPage.features.items.4.description',
      color: 'orange'
    },
    {
      icon: FaDollarSign,
      titleKey: 'tourismPage.features.items.5.title',
      descriptionKey: 'tourismPage.features.items.5.description',
      color: 'red'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] overflow-hidden -mt-6" dir="ltr">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/trabzon_l7xlva.jpg"
            alt="Turkey tourism - Trabzon"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'Jost, sans-serif' }}>
              {t('tourismPage.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed">
              {t('tourismPage.hero.subtitle')}
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
            {t('tourismPage.nav.overview')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('tourismPage.nav.features')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('tourismPage.nav.tours')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('tourismPage.nav.pricing')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('included')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('tourismPage.nav.included')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('tourismPage.nav.contact')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('tourismPage.nav.faqs')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Discover Section */}
        <div id="overview" className="scroll-mt-24"></div>
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759399609/carousel/1759399608823_0.jpg"
                  alt="Discover the Magic of Türkiye"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800";
                  }}
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('tourismPage.discover.title')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                {t('tourismPage.discover.paragraph1')}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                {t('tourismPage.discover.paragraph2')}
              </p>
            </div>
          </div>
        </section>

        {/* What is Tour Service Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            {t('tourismPage.tourService.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            {t('tourismPage.tourService.intro')}
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {t('tourismPage.tourService.weHandle')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('tourismPage.tourService.services.0')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('tourismPage.tourService.services.1')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('tourismPage.tourService.services.2')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('tourismPage.tourService.services.3')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('tourismPage.tourService.services.4')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('tourismPage.tourService.services.5')}</span>
              </li>
            </ul>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            {t('tourismPage.tourService.conclusion')}
          </p>
          
          {/* Image */}
          <div className="relative h-[350px] sm:h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-lg mt-6">
            <img
              src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759788871/d9e89945b8247b6c12e3f249a96d93cb_l1i0wz.jpg"
              alt="Tour Service"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800";
              }}
            />
          </div>
        </section>

        {/* Features Section */}
        <div id="features" className="scroll-mt-24"></div>
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('tourismPage.features.title')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Features List */}
            <div>
              <div className="space-y-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 mt-1 ${isRTL ? 'mr-0 ml-4' : ''}`}>
                        <Icon className="w-5 h-5 text-blue-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {t(feature.titleKey)}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                          {t(feature.descriptionKey)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Large Image */}
            <div className="relative h-[400px] lg:h-[600px] rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/trabzon_l7xlva.jpg"
                alt="Tourism Tours Features - Trabzon Turkey"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800";
                }}
              />
            </div>
          </div>
        </section>

      </div>

      {/* Featured Tours Section */}
      <div id="tours" className="scroll-mt-24"></div>
      <FeaturedTours />

      {/* Cost of Tourist Trips Section */}
      <div id="pricing" className="scroll-mt-24"></div>
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t('tourismPage.pricing.title')}
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            {t('tourismPage.pricing.intro')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Packages List */}
            <div className="space-y-8">
              {/* Economy Package */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.pricing.economy.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span dangerouslySetInnerHTML={{ __html: t('tourismPage.pricing.economy.features.0') }}></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.economy.features.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.economy.features.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.economy.features.3')}</span>
                  </li>
                </ul>
              </div>

              {/* Classic Package */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.pricing.classic.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span dangerouslySetInnerHTML={{ __html: t('tourismPage.pricing.classic.features.0') }}></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.classic.features.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.classic.features.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.classic.features.3')}</span>
                  </li>
                </ul>
              </div>

              {/* Luxury Package */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.pricing.luxury.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span dangerouslySetInnerHTML={{ __html: t('tourismPage.pricing.luxury.features.0') }}></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.luxury.features.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.luxury.features.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.luxury.features.3')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.pricing.luxury.features.4')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[500px] lg:h-full rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759789335/Istanbul-1_eqyqij.jpg"
                alt="Istanbul Turkey Tourism"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800";
                }}
              />
            </div>
          </div>

          {/* Note */}
          <div className="mt-6">
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              <strong className="text-blue-600 dark:text-yellow-400">{t('tourismPage.pricing.note.label')}</strong> {t('tourismPage.pricing.note.text')}
            </p>
          </div>
        </div>
      </section>

      {/* What Does a Tour Package Include Section */}
      <div id="included" className="scroll-mt-24"></div>
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t('tourismPage.included.title')}
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            {t('tourismPage.included.intro')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Services List */}
            <div className="space-y-8">
              {/* Before your trip */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.included.beforeTrip.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.beforeTrip.items.0')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.beforeTrip.items.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.beforeTrip.items.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.beforeTrip.items.3')}</span>
                  </li>
                </ul>
              </div>

              {/* Upon arrival */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.included.uponArrival.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.uponArrival.items.0')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.uponArrival.items.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.uponArrival.items.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.uponArrival.items.3')}</span>
                  </li>
                </ul>
              </div>

              {/* During your stay */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.included.duringStay.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.duringStay.items.0')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.duringStay.items.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.duringStay.items.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.duringStay.items.3')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.duringStay.items.4')}</span>
                  </li>
                </ul>
              </div>

              {/* Additional services */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.included.additional.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.additional.items.0')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.additional.items.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.additional.items.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('tourismPage.included.additional.items.3')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[500px] lg:h-full rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759789727/tourpic_yciie0.jpg"
                alt="Tour Package in Turkey"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <div id="contact" className="scroll-mt-24"></div>
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('tourismPage.contact.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              {t('tourismPage.contact.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Email Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="mailto:info@rahalatek.com"
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-500 dark:bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaEnvelope className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.contact.email')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
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
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-500 dark:bg-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaWhatsapp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.contact.contactNow')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
                  {t('tourismPage.contact.whatsapp')}
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
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-pink-500 dark:hover:border-pink-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaInstagram className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.contact.followUs')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
                  {t('tourismPage.contact.instagram')}
                </p>
              </div>
              </a>
            </div>

            {/* Phone Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-yellow-500 dark:from-blue-400 dark:to-yellow-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="tel:+905010684657"
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-500 dark:bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaPhone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('tourismPage.contact.callNow')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
                  +905010684657
                </p>
              </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('tourismPage.contactForm.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              {t('tourismPage.contactForm.description')}
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* FAQs Section */}
      <div id="faqs" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">{t('tourismPage.faqs.title')}</h2>
          
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
                  {t('tourismPage.faqs.items.0.question')}
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
                  {t('tourismPage.faqs.items.0.answer')}
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
                  {t('tourismPage.faqs.items.1.question')}
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
                  {t('tourismPage.faqs.items.1.answer')}
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
                  {t('tourismPage.faqs.items.2.question')}
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
                  {t('tourismPage.faqs.items.2.answer')}
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 3 
                  ? `shadow-md ${isRTL ? 'border-r-4 border-r-blue-500 dark:border-r-yellow-400' : 'border-l-4 border-l-blue-500 dark:border-l-yellow-400'}` 
                  : `hover:shadow-md ${isRTL ? 'hover:border-r-4 hover:border-r-blue-500 dark:hover:border-r-yellow-400' : 'hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'}`
              }`}
            >
              <button
                onClick={() => toggleFaq(3)}
                className={`flex justify-between items-center w-full px-4 sm:px-6 py-5 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                aria-expanded={activeFaqIndex === 3}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow ${isRTL ? 'pl-3' : 'pr-3'} ${
                  activeFaqIndex === 3 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {t('tourismPage.faqs.items.3.question')}
                </h3>
                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                  activeFaqIndex === 3 
                    ? 'bg-blue-100 dark:bg-yellow-900/30 text-blue-600 dark:text-yellow-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {activeFaqIndex === 3 ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaqIndex === 3 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 sm:px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                  {t('tourismPage.faqs.items.3.answer')}
                </div>
              </div>
            </div>

            {/* FAQ 5 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 4 
                  ? `shadow-md ${isRTL ? 'border-r-4 border-r-blue-500 dark:border-r-yellow-400' : 'border-l-4 border-l-blue-500 dark:border-l-yellow-400'}` 
                  : `hover:shadow-md ${isRTL ? 'hover:border-r-4 hover:border-r-blue-500 dark:hover:border-r-yellow-400' : 'hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'}`
              }`}
            >
              <button
                onClick={() => toggleFaq(4)}
                className={`flex justify-between items-center w-full px-4 sm:px-6 py-5 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                aria-expanded={activeFaqIndex === 4}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow ${isRTL ? 'pl-3' : 'pr-3'} ${
                  activeFaqIndex === 4 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {t('tourismPage.faqs.items.4.question')}
                </h3>
                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                  activeFaqIndex === 4 
                    ? 'bg-blue-100 dark:bg-yellow-900/30 text-blue-600 dark:text-yellow-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {activeFaqIndex === 4 ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaqIndex === 4 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 sm:px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                  {t('tourismPage.faqs.items.4.answer')}
                </div>
              </div>
            </div>

            {/* FAQ 6 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 5 
                  ? `shadow-md ${isRTL ? 'border-r-4 border-r-blue-500 dark:border-r-yellow-400' : 'border-l-4 border-l-blue-500 dark:border-l-yellow-400'}` 
                  : `hover:shadow-md ${isRTL ? 'hover:border-r-4 hover:border-r-blue-500 dark:hover:border-r-yellow-400' : 'hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'}`
              }`}
            >
              <button
                onClick={() => toggleFaq(5)}
                className={`flex justify-between items-center w-full px-4 sm:px-6 py-5 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                aria-expanded={activeFaqIndex === 5}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow ${isRTL ? 'pl-3' : 'pr-3'} ${
                  activeFaqIndex === 5 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {t('tourismPage.faqs.items.5.question')}
                </h3>
                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                  activeFaqIndex === 5 
                    ? 'bg-blue-100 dark:bg-yellow-900/30 text-blue-600 dark:text-yellow-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {activeFaqIndex === 5 ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaqIndex === 5 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 sm:px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
                  {t('tourismPage.faqs.items.5.answer')}
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
