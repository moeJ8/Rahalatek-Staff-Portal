import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaPlane,
  FaCar,
  FaUserTie,
  FaClock,
  FaShieldAlt,
  FaSuitcase,
  FaDollarSign,
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

export default function AirportServicePage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  // Language-aware meta content functions
  const getLocalizedMetaTitle = () => {
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      return 'خدمة نقل المطار - رحلاتك';
    }
    if (currentLang === 'fr') {
      return 'Service Transfert Aéroport - Rahalatek';
    }
    return 'Airport Transfer Service - Rahalatek';
  };

  const getLocalizedMetaDescription = () => {
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      return 'خدمات نقل المطار الاحترافية في تركيا مع رحلاتك. استقبال وتوديع VIP مع سيارات مريحة، استقبال في المطار، وخدمة على مدار الساعة. احجز نقل المطار الخاص بك اليوم!';
    }
    if (currentLang === 'fr') {
      return 'Services de transfert aéroport professionnels en Turquie avec Rahalatek. Réception et adieu VIP avec véhicules confortables, accueil à l\'aéroport et service 24/7. Réservez votre transfert aéroport aujourd\'hui!';
    }
    return 'Professional airport transfer services in Türkiye. VIP reception and farewell with comfortable vehicles, meet & greet, and 24/7 service. Book your seamless airport transfer today!';
  };

  const getLocalizedMetaKeywords = () => {
    const currentLang = i18n.language;
    
    if (currentLang === 'ar') {
      return 'نقل المطار تركيا, استقبال المطار, توديع المطار, نقل VIP, استقبال في المطار, نقل المطار, نقل خاص, خدمة مطار تركيا, نقل مطار إسطنبول, نقل مطار أنطاليا, نقل مطار طرابزون, نقل فاخر المطار, نقل مرسيدس المطار, رحلاتك';
    }
    if (currentLang === 'fr') {
      return 'transfert aéroport Turquie, réception aéroport, adieu aéroport, transfert VIP, accueil aéroport, navette aéroport, transfert privé, service aéroport Turquie, transfert aéroport Istanbul, transfert aéroport Antalya, transfert aéroport Trabzon, transfert luxe aéroport, transfert Mercedes aéroport, Rahalatek';
    }
    return 'airport transfer Turkey, airport reception, airport farewell, VIP transfer, meet and greet, airport shuttle, private transfer, Turkey airport service, Istanbul airport transfer, Antalya airport transfer, Trabzon airport transfer, luxury airport transfer, Mercedes airport transfer, Rahalatek';
  };

  // SEO Meta Tags and hreflang
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
      ogImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759859381/photo-1449965408869-eaa3f722e40d_gbhlay.jpg');
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
      twitterImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759859381/photo-1449965408869-eaa3f722e40d_gbhlay.jpg');
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/airport-service`;

    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(tag => tag.remove());

    // Add hreflang tags for all language versions
    const languages = [
      { code: 'en', path: '/airport-service' },
      { code: 'ar', path: '/ar/airport-service' },
      { code: 'fr', path: '/fr/airport-service' }
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
    defaultLink.href = `${baseUrl}/airport-service`;
    document.head.appendChild(defaultLink);

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Rahalatek Airport Transfer Service",
      "description": "Professional airport transfer and reception services in Türkiye",
      "url": window.location.href,
      "image": "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759859381/photo-1449965408869-eaa3f722e40d_gbhlay.jpg",
      "provider": {
        "@type": "Organization",
        "name": "Rahalatek",
        "telephone": "+905010684657"
      },
      "areaServed": "Türkiye",
      "serviceType": "Airport Transfer",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Airport Transfer Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Vito Transfer (2-8 passengers)"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Sprinter Transfer (9-16 passengers)"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Luxury Bus Transfer (17+ passengers)"
            }
          }
        ]
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const features = [
    {
      icon: FaPlane,
      titleKey: 'airportServicePage.features.items.feature1.title',
      descriptionKey: 'airportServicePage.features.items.feature1.description',
      color: 'blue'
    },
    {
      icon: FaCar,
      titleKey: 'airportServicePage.features.items.feature2.title',
      descriptionKey: 'airportServicePage.features.items.feature2.description',
      color: 'teal'
    },
    {
      icon: FaUserTie,
      titleKey: 'airportServicePage.features.items.feature3.title',
      descriptionKey: 'airportServicePage.features.items.feature3.description',
      color: 'purple'
    },
    {
      icon: FaClock,
      titleKey: 'airportServicePage.features.items.feature4.title',
      descriptionKey: 'airportServicePage.features.items.feature4.description',
      color: 'green'
    },
    {
      icon: FaPlane,
      titleKey: 'airportServicePage.features.items.feature5.title',
      descriptionKey: 'airportServicePage.features.items.feature5.description',
      color: 'blue'
    },
    {
      icon: FaShieldAlt,
      titleKey: 'airportServicePage.features.items.feature6.title',
      descriptionKey: 'airportServicePage.features.items.feature6.description',
      color: 'orange'
    },
    {
      icon: FaSuitcase,
      titleKey: 'airportServicePage.features.items.feature7.title',
      descriptionKey: 'airportServicePage.features.items.feature7.description',
      color: 'red'
    },
    {
      icon: FaDollarSign,
      titleKey: 'airportServicePage.features.items.feature8.title',
      descriptionKey: 'airportServicePage.features.items.feature8.description',
      color: 'green'
    }
  ];

  const faqs = [
    {
      questionKey: 'airportServicePage.faqs.items.faq1.question',
      answerKey: 'airportServicePage.faqs.items.faq1.answer'
    },
    {
      questionKey: 'airportServicePage.faqs.items.faq2.question',
      answerKey: 'airportServicePage.faqs.items.faq2.answer'
    },
    {
      questionKey: 'airportServicePage.faqs.items.faq3.question',
      answerKey: 'airportServicePage.faqs.items.faq3.answer'
    },
    {
      questionKey: 'airportServicePage.faqs.items.faq4.question',
      answerKey: 'airportServicePage.faqs.items.faq4.answer'
    },
    {
      questionKey: 'airportServicePage.faqs.items.faq5.question',
      answerKey: 'airportServicePage.faqs.items.faq5.answer'
    },
    {
      questionKey: 'airportServicePage.faqs.items.faq6.question',
      answerKey: 'airportServicePage.faqs.items.faq6.answer'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] overflow-hidden -mt-6" dir="ltr">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop&q=95"
            alt="Airport Transfer Service"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'Jost, sans-serif' }}>
              {t('airportServicePage.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed">
              {t('airportServicePage.hero.subtitle')}
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
            {t('airportServicePage.nav.overview')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            <span className="hidden sm:inline">{t('airportServicePage.nav.whyChooseUsFull')}</span>
            <span className="inline sm:hidden">{t('airportServicePage.nav.whyChooseUsShort')}</span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('airportServicePage.nav.pricing')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('included')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('airportServicePage.nav.whatsIncluded')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('airportServicePage.nav.contact')}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            {t('airportServicePage.nav.faqs')}
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
                  src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1600&h=1200&fit=crop&q=95"
                  alt="Airport Reception Service"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('airportServicePage.introduction.title')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                {t('airportServicePage.introduction.paragraph1')}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                {t('airportServicePage.introduction.paragraph2')}
              </p>
            </div>
          </div>
        </section>

        {/* What is Airport Service Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            {t('airportServicePage.serviceSection.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            {t('airportServicePage.serviceSection.description')}
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {t('airportServicePage.serviceSection.whatWeProvide')}
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-6">
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('airportServicePage.serviceSection.items.item1')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('airportServicePage.serviceSection.items.item2')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('airportServicePage.serviceSection.items.item3')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('airportServicePage.serviceSection.items.item4')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('airportServicePage.serviceSection.items.item5')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('airportServicePage.serviceSection.items.item6')}</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className={`w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2 ${isRTL ? 'mr-0 ml-3' : ''}`} />
                <span>{t('airportServicePage.serviceSection.items.item7')}</span>
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base text-center">
              {t('airportServicePage.serviceSection.closing')}
            </p>
          </div>
          
          {/* Image */}
          <div className="relative h-[350px] sm:h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-lg mt-6">
            <img
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=900&fit=crop&q=95"
              alt="Airport Transfer"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Features Section */}
        <div id="features" className="scroll-mt-24"></div>
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t('airportServicePage.features.title')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
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
                src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759851638/merc_wtaghb.jpg"
                alt="Luxury Mercedes Transfer Vehicle"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

      </div>

      {/* Service Pricing Section */}
      <div id="pricing" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t('airportServicePage.pricing.title')}
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            {t('airportServicePage.pricing.intro')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Pricing */}
            <div className="space-y-8">
              {/* Vito Transfer */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('airportServicePage.pricing.vito.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.vito.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.vito.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.vito.feature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.vito.feature4')}</span>
                  </li>
                </ul>
              </div>

              {/* Sprinter Transfer */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('airportServicePage.pricing.sprinter.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.sprinter.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.sprinter.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.sprinter.feature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.sprinter.feature4')}</span>
                  </li>
                </ul>
              </div>

              {/* Bus Transfer */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('airportServicePage.pricing.bus.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.bus.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.bus.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.bus.feature3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.pricing.bus.feature4')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[500px] lg:h-full rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759851638/transfer_batkzo.jpg"
                alt="Professional Airport Transfer Service"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Note */}
          <div className="mt-6">
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              <strong className="text-blue-600 dark:text-yellow-400">{t('airportServicePage.pricing.note.label')}</strong> {t('airportServicePage.pricing.note.text')}
            </p>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <div id="included" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t('airportServicePage.included.title')}
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            {t('airportServicePage.included.intro')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Inclusions list */}
            <div className="space-y-8">
              {/* Arrival Reception */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('airportServicePage.included.arrival.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.arrival.item1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.arrival.item2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.arrival.item3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.arrival.item4')}</span>
                  </li>
                </ul>
              </div>

              {/* Transfer Journey */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('airportServicePage.included.journey.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.journey.item1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.journey.item2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.journey.item3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.journey.item4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.journey.item5')}</span>
                  </li>
                </ul>
              </div>

              {/* Departure Farewell */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('airportServicePage.included.departure.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.departure.item1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.departure.item2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.departure.item3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.departure.item4')}</span>
                  </li>
                </ul>
              </div>

              {/* Additional Services */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('airportServicePage.included.additional.title')}
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.additional.item1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.additional.item2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.additional.item3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.additional.item4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className={`w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 ${isRTL ? 'mr-0 ml-2' : ''}`} />
                    <span>{t('airportServicePage.included.additional.item5')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[500px] lg:h-full rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://res.cloudinary.com/dnzqnr6js/image/upload/v1759851638/Istanbul_airport_pbhkhl.jpg"
                alt="Istanbul Airport Service"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <div id="contact" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('airportServicePage.contact.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              {t('airportServicePage.contact.description')}
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
                  {t('airportServicePage.contact.email')}
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
                  {t('airportServicePage.contact.contactUsNow')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                  {t('airportServicePage.contact.whatsapp')}
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
                  {t('airportServicePage.contact.followUs')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                  {t('airportServicePage.contact.instagram')}
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
                  {t('airportServicePage.contact.callUsNow')}
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
              {t('airportServicePage.contactForm.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              {t('airportServicePage.contactForm.description')}
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* FAQs Section */}
      <div id="faqs" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">{t('airportServicePage.faqs.title')}</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
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
                    {t(faq.questionKey)}
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
                    {t(faq.answerKey)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Floating Contact Buttons */}
      <FloatingContactButtons />
    </div>
  );
}

