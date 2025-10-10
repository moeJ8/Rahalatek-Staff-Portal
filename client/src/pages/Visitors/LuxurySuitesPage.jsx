import React, { useEffect, useState } from 'react';
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
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] overflow-hidden -mt-6">
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
              Luxury Suites
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed">
              Experience unparalleled luxury and comfort
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
            Overview
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            <span className="hidden sm:inline">Why Choose Us</span>
            <span className="inline sm:hidden">Why Us</span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            Apartment Types
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            Destinations
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            Contact
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            FAQs
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
                Enjoy privacy and comfort with enchanting views of Turkey's most beautiful tourist attractions.
              </h2>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Do you face these problems while staying in traditional hotels?
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Small, cramped rooms that are not enough for a family or lack privacy.</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Exorbitant additional costs for every service, from the restaurant to the laundry.</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Lack of a kitchen forces you to always eat out.</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Difficulty accommodating large families in adjoining rooms.</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Language barrier with non-Arabic-speaking hotel staff.</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Lack of privacy in the hotel lobby, restaurants, and among guests.</span>
              </li>
              </ul>
            </div>
          </div>
        </section>

        {/* What is the Service Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            What is the service of your travels' serviced apartments?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            You travels' serviced apartments are the perfect solution for those seeking the comfort of home and the services of a hotel. When you choose to stay in Turkey with your travels, you don't want to feel like an ordinary tourist, but rather like a resident experiencing the real thing.
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              You travels' serviced apartments offer:
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-6">
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Spacious spaces and multiple rooms suitable for families and groups</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Fully equipped kitchens for preparing your favorite meals and saving on restaurant costs</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Private living room for relaxation and family gatherings</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Hotel services such as cleaning and 24-hour reception</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Absolute privacy, as if you were in your own home</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Best value for money, especially for long stays</span>
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
            Features of Rehlatak Apartments
          </h2>
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-8 text-center">
            Why are Rehlatak Apartments the best choice for accommodation in Turkey?
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Content */}
            <div>
              {/* Feature 1: Strategic Locations */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Strategic Locations in the Heart of Turkish Cities
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                  Rehlatak Apartments are located in the best tourist areas in Turkey – just minutes' walk from:
                </p>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Turkey's most famous tourist attractions and historical monuments</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Main shopping centers and popular markets</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Public transportation stations</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>The best restaurants and cafes</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2: Luxurious Amenities */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Luxurious amenities that exceed your expectations
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Comfortable beds with premium orthopedic mattresses</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Central air conditioning with temperature control</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Modern home appliances including a washing machine, refrigerator, and microwave</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Complete kitchenware to prepare your favorite meals</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Free high-speed internet</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Arabic and international channels</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3: Comprehensive Services */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Comprehensive services in Arabic and English from the Rehlatak team
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>24/7 Arabic and English support team</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Airport pickup and drop-off service</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Regular cleaning upon request</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Medical assistance when needed</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Tour guidance to the best places and restaurants</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Flexible arrival procedures to suit your travel schedule</span>
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
            Hotel Apartment Options from Rehlatak that Suit All Needs
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            We offer a variety of hotel apartments from Rehlatak and also provide a diverse collection of apartments to suit all your needs
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
                  Studio Apartment | Starting from $35/night
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Ideal for solo travelers or couples</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Compact space with all basic amenities</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Central location in the heart of the city</span>
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
                  One Bedroom Apartment | Starting from $55/night
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Suitable for families or small groups (2-3 people)</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Separate bedroom with spacious living area</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Fully equipped kitchen for family meals</span>
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
                  Two Bedroom Apartment | Starting from $75/night
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Suitable for families (4-6 people)</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Two spacious bedrooms with large living space</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Fully equipped kitchen and complete dining area</span>
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
                Rahalatek Luxury Apartments | Starting from $120/night
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Premium entertainment experience like no other</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Luxury bathrooms with modern amenities</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Spacious areas with exclusive modern furnishings</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Comes with jacuzzi or private sauna</span>
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
            Popular Destinations for Luxury Suites
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
                  Istanbul - Capital of Civilizations
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Luxury apartments overlooking the Bosphorus</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Located near major historical landmarks</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Easy access to shopping centers and restaurants</span>
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
                  Trabzon - Jewel of the North
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Luxury apartments with mountain views</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Close to Uzungol and natural attractions</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Premium amenities with stunning sea views</span>
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
                  Antalya - Turkish Riviera
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Luxury beachfront apartments</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Close to ancient ruins and tourist attractions</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Modern amenities with traditional Turkish charm</span>
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
                  Bursa - The Green City
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Luxury apartments with mountain views</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Close to natural hot springs and ski resorts</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                    <span>Premium facilities with stunning green landscapes</span>
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
              Book Your Luxury Suite Now
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              Experience the comfort of home with the luxury of a hotel. Contact us now to reserve your perfect serviced apartment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Email Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="mailto:info@rahalatek.com"
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 dark:bg-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaEnvelope className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Email
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
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 dark:bg-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaWhatsapp className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Contact Us Now
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                  WhatsApp
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
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-pink-500 dark:hover:border-pink-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaInstagram className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Follow Us
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                  Instagram
                </p>
              </div>
              </a>
            </div>

            {/* Phone Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-yellow-500 dark:from-blue-400 dark:to-yellow-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
              <a
                href="tel:+905010684657"
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 dark:bg-yellow-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaPhone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Call Us Now
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
              Get in Touch
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              Have questions about our luxury suites? We're here to help you find the perfect accommodation for your stay. Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* FAQs Section */}
      <div id="faqs" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {/* FAQ 1 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 0 
                  ? 'shadow-md border-l-4 border-l-blue-500 dark:border-l-yellow-400' 
                  : 'hover:shadow-md hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'
              }`}
            >
              <button
                onClick={() => toggleFaq(0)}
                className="flex justify-between items-center w-full px-4 sm:px-6 py-5 text-left transition-colors duration-200"
                aria-expanded={activeFaqIndex === 0}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow pr-3 ${
                  activeFaqIndex === 0 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  What types of hotel apartments are available with Rahalatek?
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
                  Rahalatek offers a diverse range of hotel apartments to suit all needs:<br/><br/>
                  • <strong>Studio Apartments (25-40m²):</strong> Compact open space with small kitchen, suitable for 1-2 people.<br/>
                  • <strong>One Bedroom Apartment (70-80m²):</strong> Includes living room, separate kitchen, and bathroom, ideal for 3-4 people.<br/>
                  • <strong>Two Bedroom Apartment (100-70m²):</strong> Two separate bedrooms with living room, full kitchen, suitable for families up to 6 people.<br/>
                  • <strong>Three Bedroom Apartment (150-100m²):</strong> Three separate bedrooms, large living room, full kitchen, suitable for large groups.<br/>
                  • <strong>Duplex and Penthouses (150+m²):</strong> Luxury apartments on two floors or at the top of the building with panoramic views, an exceptional experience.<br/><br/>
                  All Rahalatek apartments are fully furnished and equipped with international standards to ensure you a comfortable stay.
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 1 
                  ? 'shadow-md border-l-4 border-l-blue-500 dark:border-l-yellow-400' 
                  : 'hover:shadow-md hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'
              }`}
            >
              <button
                onClick={() => toggleFaq(1)}
                className="flex justify-between items-center w-full px-4 sm:px-6 py-5 text-left transition-colors duration-200"
                aria-expanded={activeFaqIndex === 1}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow pr-3 ${
                  activeFaqIndex === 1 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  What is the difference between Rahalatek's hotel apartments and serviced apartments?
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
                  <strong>Hotel Apartments from Rahalatek</strong> offer hotel services such as reception around the clock, regular cleaning, laundry service, and sometimes shared amenities like a gym and pool.<br/><br/>
                  <strong>Serviced Apartments</strong> are typically more independent like regular apartments, usually without reception or daily services, and may not include amenities such as a round-the-clock reception.<br/><br/>
                  With Rahalatek, you get <strong>fully serviced apartments</strong> with all hotel services, freedom of space, and the privacy and comfort that sets the apartments apart.
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 2 
                  ? 'shadow-md border-l-4 border-l-blue-500 dark:border-l-yellow-400' 
                  : 'hover:shadow-md hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'
              }`}
            >
              <button
                onClick={() => toggleFaq(2)}
                className="flex justify-between items-center w-full px-4 sm:px-6 py-5 text-left transition-colors duration-200"
                aria-expanded={activeFaqIndex === 2}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow pr-3 ${
                  activeFaqIndex === 2 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  What is the difference between Rahalatek's hotel apartments and hotels?
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
                  <strong>Rahalatek's hotel apartments offer:</strong><br/><br/>
                  • Larger spaces (150-25m²) compared to small hotel rooms (15-30m²)<br/>
                  • Fully equipped kitchen without the need for a restaurant<br/>
                  • Multiple separate rooms and one or more bathrooms comparable to a hotel<br/>
                  • Flexibility in preparing meals instead of relying solely on hotel restaurants<br/>
                  • Suitable for long stays while hotel accommodation is suitable for short stays<br/>
                  • Lower cost for families and groups compared to higher costs for multiple rooms in a hotel<br/>
                  • Comfortable home environment with Rahalatek compared to the commercial and tourist feel<br/><br/>
                  The main advantage of Rahalatek's hotel apartments is <strong>freedom, privacy, and value for money</strong>, especially for stays exceeding 3 nights.
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

