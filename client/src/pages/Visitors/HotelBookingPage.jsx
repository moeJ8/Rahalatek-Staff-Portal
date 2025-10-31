import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaHotel,
  FaBed,
  FaConciergeBell,
  FaWifi,
  FaSwimmingPool,
  FaUtensils,
  FaCheckCircle,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaInstagram,
  FaCircle
} from 'react-icons/fa';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';
import FeaturedHotels from '../../components/Visitors/FeaturedHotels';
import ContactForm from '../../components/ContactForm';
import FloatingContactButtons from '../../components/FloatingContactButtons';

export default function HotelBookingPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };
  useEffect(() => {
    document.title = 'Hotel Booking | Rahalatek';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Book the best hotels in Türkiye with Rahalatek. Luxury accommodations, family-friendly resorts, budget hotels, and premium services across Turkey. Best rates guaranteed!'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'Turkey hotels, hotel booking Turkey, luxury hotels, family resorts, budget hotels, Turkish hotels, hotel reservation, accommodation Turkey, beachfront hotels, city hotels, Istanbul hotels, Antalya hotels, Cappadocia hotels, Trabzon hotels, 5 star hotels Turkey, boutique hotels Turkey'
      );
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Hotel Booking - Premium Accommodations in Türkiye | Rahalatek');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        'Book the best hotels in Türkiye with Rahalatek. Luxury accommodations, family-friendly resorts, and premium services. Best rates guaranteed!'
      );
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1758985729/hotels/1758985728978_0.jpg');
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
      twitterTitle.setAttribute('content', 'Hotel Booking - Premium Accommodations in Türkiye | Rahalatek');
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 
        'Book the best hotels in Türkiye with Rahalatek. Luxury accommodations, family-friendly resorts, and premium services.'
      );
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1758985729/hotels/1758985728978_0.jpg');
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
      "name": "Rahalatek Hotel Booking",
      "description": "Premium hotel booking service in Türkiye",
      "url": window.location.href,
      "image": "https://res.cloudinary.com/dnzqnr6js/image/upload/v1758985729/hotels/1758985728978_0.jpg",
      "telephone": "+905010684657",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR"
      },
      "areaServed": "Türkiye",
      "serviceType": "Hotel Booking",
      "priceRange": "$$-$$$"
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
      icon: FaHotel,
      titleKey: 'hotelBookingPage.features.items.0.title',
      descriptionKey: 'hotelBookingPage.features.items.0.description',
      color: 'blue'
    },
    {
      icon: FaBed,
      titleKey: 'hotelBookingPage.features.items.1.title',
      descriptionKey: 'hotelBookingPage.features.items.1.description',
      color: 'teal'
    },
    {
      icon: FaConciergeBell,
      titleKey: 'hotelBookingPage.features.items.2.title',
      descriptionKey: 'hotelBookingPage.features.items.2.description',
      color: 'purple'
    },
    {
      icon: FaWifi,
      titleKey: 'hotelBookingPage.features.items.3.title',
      descriptionKey: 'hotelBookingPage.features.items.3.description',
      color: 'green'
    },
    {
      icon: FaSwimmingPool,
      titleKey: 'hotelBookingPage.features.items.4.title',
      descriptionKey: 'hotelBookingPage.features.items.4.description',
      color: 'orange'
    },
    {
      icon: FaUtensils,
      titleKey: 'hotelBookingPage.features.items.5.title',
      descriptionKey: 'hotelBookingPage.features.items.5.description',
      color: 'red'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] overflow-hidden -mt-6" dir="ltr">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop&q=95"
            alt="Luxury Hotel - Turkey"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'Jost, sans-serif' }}>
              {t('hotelBookingPage.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed">
              {t('hotelBookingPage.hero.subtitle')}
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
            {t('hotelBookingPage.nav.overview')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            <span className="hidden sm:inline">{t('hotelBookingPage.nav.whyChooseUsFull')}</span>
            <span className="inline sm:hidden">{t('hotelBookingPage.nav.whyChooseUsShort')}</span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('hotelBookingPage.nav.hotels')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('hotelBookingPage.nav.pricing')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('included')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('hotelBookingPage.nav.included')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('hotelBookingPage.nav.contact')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('hotelBookingPage.nav.faqs')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Introduction Section - Placeholder for content */}
        <div id="overview" className="scroll-mt-24"></div>
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=1200&fit=crop&q=95"
                  alt="Hotel Booking in Turkey"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('hotelBookingPage.introduction.title')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                {t('hotelBookingPage.introduction.paragraph1')}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                {t('hotelBookingPage.introduction.paragraph2')}
              </p>
            </div>
          </div>
        </section>

        {/* What is Hotel Booking Service Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            {t('hotelBookingPage.hotelService.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            {t('hotelBookingPage.hotelService.description')}
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {t('hotelBookingPage.hotelService.weProvide')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('hotelBookingPage.hotelService.services.0')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('hotelBookingPage.hotelService.services.1')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('hotelBookingPage.hotelService.services.2')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('hotelBookingPage.hotelService.services.3')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('hotelBookingPage.hotelService.services.4')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('hotelBookingPage.hotelService.services.5')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('hotelBookingPage.hotelService.services.6')}</span>
              </li>
            </ul>
          </div>
          
          {/* Image */}
          <div className="relative h-[350px] sm:h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-lg mt-6">
            <img
              src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&h=900&fit=crop&q=95"
              alt="Hotel Services"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Features Section */}
        <div id="features" className="scroll-mt-24"></div>
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('hotelBookingPage.features.title')}
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
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&h=1800&fit=crop&q=95"
                alt="Hotel Features"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

      </div>

      {/* Featured Hotels Section */}
      <div id="hotels" className="scroll-mt-24"></div>
      <div dir="ltr">
        <FeaturedHotels />
      </div>

      {/* Hotel Pricing Section */}
      <div id="pricing" className="scroll-mt-24"></div>
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t('hotelBookingPage.pricing.title')}
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            {t('hotelBookingPage.pricing.intro')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Pricing packages */}
            <div className="space-y-8">
              {/* Budget Hotels */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('hotelBookingPage.pricing.budget.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span dangerouslySetInnerHTML={{ __html: t('hotelBookingPage.pricing.budget.features.0') }}></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.budget.features.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.budget.features.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.budget.features.3')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.budget.features.4')}</span>
                  </li>
                </ul>
              </div>

              {/* Standard Hotels */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('hotelBookingPage.pricing.standard.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span dangerouslySetInnerHTML={{ __html: t('hotelBookingPage.pricing.standard.features.0') }}></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.standard.features.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.standard.features.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.standard.features.3')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.standard.features.4')}</span>
                  </li>
                </ul>
              </div>

              {/* Luxury Hotels */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('hotelBookingPage.pricing.luxury.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span dangerouslySetInnerHTML={{ __html: t('hotelBookingPage.pricing.luxury.features.0') }}></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.luxury.features.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.luxury.features.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.luxury.features.3')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.luxury.features.4')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.pricing.luxury.features.5')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[500px] lg:h-full rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&h=1200&fit=crop&q=95"
                alt="Hotel Room"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Note */}
          <div className="mt-6">
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              <strong className="text-blue-600 dark:text-yellow-400">{t('hotelBookingPage.pricing.note.label')}</strong> {t('hotelBookingPage.pricing.note.text')}
            </p>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <div id="included" className="scroll-mt-24"></div>
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t('hotelBookingPage.included.title')}
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            {t('hotelBookingPage.included.intro')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Inclusions list */}
            <div className="space-y-8">
              {/* Before Your Arrival */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('hotelBookingPage.included.beforeArrival.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.beforeArrival.items.0')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.beforeArrival.items.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.beforeArrival.items.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.beforeArrival.items.3')}</span>
                  </li>
                </ul>
              </div>

              {/* Airport & Transportation */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('hotelBookingPage.included.transportation.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.transportation.items.0')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.transportation.items.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.transportation.items.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.transportation.items.3')}</span>
                  </li>
                </ul>
              </div>

              {/* Room & Amenities */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('hotelBookingPage.included.roomAmenities.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.roomAmenities.items.0')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.roomAmenities.items.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.roomAmenities.items.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.roomAmenities.items.3')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.roomAmenities.items.4')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.roomAmenities.items.5')}</span>
                  </li>
                </ul>
              </div>

              {/* Dining & Services */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('hotelBookingPage.included.dining.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.dining.items.0')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.dining.items.1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.dining.items.2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.dining.items.3')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.dining.items.4')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('hotelBookingPage.included.dining.items.5')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[500px] lg:h-full rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1600&h=1200&fit=crop&q=95"
                alt="Hotel Amenities and Services"
                className="w-full h-full object-cover"
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
              {t('hotelBookingPage.contact.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              {t('hotelBookingPage.contact.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Email Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="mailto:info@rahalatek.com"
                className="relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center flex-grow justify-between">
                <div className="w-20 h-20 bg-blue-500 dark:bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaEnvelope className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 min-h-[3rem] flex items-center justify-center leading-tight">
                  {t('hotelBookingPage.contact.email')}
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
                className="relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center flex-grow justify-between">
                <div className="w-20 h-20 bg-green-500 dark:bg-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaWhatsapp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 min-h-[3rem] flex items-center justify-center leading-tight">
                  {t('hotelBookingPage.contact.contactNow')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
                  {t('hotelBookingPage.contact.whatsapp')}
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
                className="relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-pink-500 dark:hover:border-pink-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center flex-grow justify-between">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaInstagram className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 min-h-[3rem] flex items-center justify-center leading-tight">
                  {t('hotelBookingPage.contact.followUs')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
                  {t('hotelBookingPage.contact.instagram')}
                </p>
              </div>
              </a>
            </div>

            {/* Phone Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-yellow-500 dark:from-blue-400 dark:to-yellow-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="tel:+905010684657"
                className="relative flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center flex-grow justify-between">
                <div className="w-20 h-20 bg-blue-500 dark:bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaPhone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 min-h-[3rem] flex items-center justify-center leading-tight">
                  {t('hotelBookingPage.contact.callNow')}
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
              {t('hotelBookingPage.contactForm.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              {t('hotelBookingPage.contactForm.description')}
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* FAQs Section */}
      <div id="faqs" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">{t('hotelBookingPage.faqs.title')}</h2>
          
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
                  {t('hotelBookingPage.faqs.items.0.question')}
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
                  {t('hotelBookingPage.faqs.items.0.answer')}
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
                  {t('hotelBookingPage.faqs.items.1.question')}
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
                  {t('hotelBookingPage.faqs.items.1.answer')}
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
                  {t('hotelBookingPage.faqs.items.2.question')}
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
                  {t('hotelBookingPage.faqs.items.2.answer')}
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
                  {t('hotelBookingPage.faqs.items.3.question')}
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
                  {t('hotelBookingPage.faqs.items.3.answer')}
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
                  {t('hotelBookingPage.faqs.items.4.question')}
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
                  {t('hotelBookingPage.faqs.items.4.answer')}
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
                  {t('hotelBookingPage.faqs.items.5.question')}
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
                  {t('hotelBookingPage.faqs.items.5.answer')}
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

