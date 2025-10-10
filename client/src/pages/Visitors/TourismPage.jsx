import React, { useEffect, useState } from 'react';
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
      title: 'Diversity of Destinations and Programs',
      description: 'We offer a wide range of tours in Turkey, covering various tourist attractions from north to south, from historic cities to charming beaches and stunning natural areas.',
      color: 'blue'
    },
    {
      icon: FaUserTie,
      title: 'Professional Tour Guides',
      description: 'Your tours are accompanied by Arabic and English-speaking guides who possess a deep knowledge of the history and culture of the regions you visit, enriching your experience and making it more enjoyable and beneficial.',
      color: 'teal'
    },
    {
      icon: FaCogs,
      title: 'Personal Service and Flexible Programs',
      description: 'We tailor trips to your needs, with the option to choose between private or group tours, and the freedom to adjust the program to suit your interests and budget.',
      color: 'purple'
    },
    {
      icon: FaCar,
      title: 'Comfortable Transportation in Modern Cars',
      description: 'We provide modern, air-conditioned vehicles with professional drivers to ensure safe and comfortable transportation between cities and during tours.',
      color: 'green'
    },
    {
      icon: FaHotel,
      title: 'Carefully Selected Accommodations',
      description: 'We carefully select the best hotels and resorts that offer excellent service, a strategic location, and facilities that suit your needs.',
      color: 'orange'
    },
    {
      icon: FaDollarSign,
      title: 'Competitive and Transparent Prices',
      description: 'Our prices are competitive and transparent from the outset, with no hidden fees or unexpected surprises, offering the best value for money.',
      color: 'red'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] overflow-hidden -mt-6">
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
              Discover the Magic of Türkiye
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed">
              Experience the best tours in Türkiye with professional guides and unforgettable journeys
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
            Features
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            Tours
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            Pricing
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
          </button>
          <button 
            onClick={() => document.getElementById('included')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            What's Included
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
                Discover the Magic of Türkiye
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                Embark on an unforgettable journey through Türkiye's rich history, breathtaking landscapes, and vibrant culture. From the ancient wonders of Istanbul to the fairy chimneys of Cappadocia, from the turquoise coasts of Antalya to the misty mountains of Trabzon – experience it all with our expertly curated tours.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                Our tours are designed to immerse you in the authentic Turkish experience, combining must-see landmarks with hidden gems that only locals know about. Whether you're seeking adventure, cultural enrichment, or relaxation, we have the perfect tour for you.
              </p>
            </div>
          </div>
        </section>

        {/* What is Tour Service Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            What is a Tour Service?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            The tour service from Rehlatak is a complete travel experience that allows you to discover the most beautiful and famous tourist attractions in Turkey without the hassle of planning or worrying about transportation.
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              We take care of your trips:
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Complete organization of your travel itinerary from A to Z</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Provide transportation between and within cities</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Book comfortable accommodations according to your preferences</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Arrange visits to tourist attractions accompanied by professional guides</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Provide entry tickets to sites and activities</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>24/7 support in Arabic</span>
              </li>
            </ul>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            Whether you are traveling alone, with your partner, as part of a family, or as a large group, we design a tour program in Turkey that meets your aspirations and suits your needs.
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
            Features of Our Tours
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Features List */}
            <div>
              <div className="space-y-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                          {feature.description}
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
            Cost of Tourist Trips in Türkiye
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            Our Turkey tour packages offer a variety of prices to suit different budgets, while maintaining high-quality services:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Packages List */}
            <div className="space-y-8">
              {/* Economy Package */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  1. Economy Packages
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span><strong>Starting from $250</strong> per person (3 days/2 nights)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Includes accommodation in 3-4-star hotels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Group tours with an Arabic-speaking guide</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Transportation between cities and tourist attractions</span>
                  </li>
                </ul>
              </div>

              {/* Classic Package */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  2. Classic Packages
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span><strong>Starting from $450</strong> per person (5 days/4 nights)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Accommodation in 4-5-star hotels in prime locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>A combination of private and group tours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Daily breakfasts and some main meals</span>
                  </li>
                </ul>
              </div>

              {/* Luxury Package */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  3. Luxury Packages
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span><strong>Starting from $750</strong> per person (7 days/6 nights)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Accommodation in 5-star hotels and luxury resorts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Exclusive private tours with a specialized guide</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Unique experiences and distinctive activities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Full-board accommodation with gourmet meals</span>
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
              <strong className="text-blue-600 dark:text-yellow-400">Note:</strong> Prices may vary depending on the season, accommodation type, and the specific package. We offer seasonal offers and discounts for groups and early bookings.
            </p>
          </div>
        </div>
      </section>

      {/* What Does a Tour Package Include Section */}
      <div id="included" className="scroll-mt-24"></div>
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What does a tour package in Türkiye include?
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            When you book a tour in Turkey with us, you'll receive a comprehensive package of services that covers all your needs:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Services List */}
            <div className="space-y-8">
              {/* Before your trip */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  1. Before your trip
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Personal tourism consultation to design the best program for you</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>A detailed travel plan with a clear schedule</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Assistance in choosing suitable hotels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Advice on the best times to visit and available activities</span>
                  </li>
                </ul>
              </div>

              {/* Upon arrival */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  2. Upon arrival
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Airport pick-up and drop-off service</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Private car with a professional driver</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>A tour guide to accompany you during your tours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Entrance tickets to museums and tourist attractions</span>
                  </li>
                </ul>
              </div>

              {/* During your stay */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  3. During your stay
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Accommodation in carefully selected hotels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Meals according to the chosen package</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Transportation between and within cities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Daily tours to major tourist attractions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Entertainment activities and cultural experiences</span>
                  </li>
                </ul>
              </div>

              {/* Additional services */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  4. Additional services
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Emergency and inquiry hotline (24/7)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Assistance in your language to communicate with locals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Recommendations for the best restaurants and shopping centers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Optional services such as hot air ballooning, cruises, and folklore shows</span>
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
              Book Your Dream Tourism Trip in Turkey Now
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              Discover the secrets of tourism in Turkey with a complete travel experience that includes everything from start to finish. Contact us now, and let us organize the perfect trip for you according to your budget and preferences.
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
                  Email
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
                  Contact Us Now
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
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
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-pink-500 dark:hover:border-pink-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaInstagram className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Follow Us
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
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
                className="relative flex flex-col bg-white dark:bg-slate-950 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300"
              >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-500 dark:bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FaPhone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Call Us Now
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
              Get in Touch
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              Have questions about our tours? We're here to help you plan your perfect journey. Send us a message and we'll get back to you as soon as possible.
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
                  What is the best month to visit Türkiye?
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
                  The best time to visit Türkiye is during spring (April to June) and autumn (September to November), where the weather is moderate and the tourist attractions are less crowded. However, Rahalatek organizes tours year-round, with tailored activities for each season to ensure you have a wonderful experience regardless of when you visit.
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
                  Is Türkiye expensive for tourism?
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
                  Türkiye is considered an economical tourist destination compared to European countries, offering a variety of options to suit all budgets. With Rahalatek, you can choose from economical packages starting at $250 per person, classic packages, or luxury experiences. We provide transparent pricing and excellent value for money for all our tours.
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
                  Is Türkiye safe for tourism?
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
                  Yes, Türkiye is a safe tourist destination. Turkey's major tourist cities are very secure and welcoming to visitors. With Rahalatek, you get additional safety through professional Arabic and English-speaking guides, 24/7 customer support, carefully selected accommodations, and fully insured transportation to ensure your complete peace of mind throughout your journey.
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 3 
                  ? 'shadow-md border-l-4 border-l-blue-500 dark:border-l-yellow-400' 
                  : 'hover:shadow-md hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'
              }`}
            >
              <button
                onClick={() => toggleFaq(3)}
                className="flex justify-between items-center w-full px-4 sm:px-6 py-5 text-left transition-colors duration-200"
                aria-expanded={activeFaqIndex === 3}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow pr-3 ${
                  activeFaqIndex === 3 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  How far in advance should I book my tour?
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
                  We recommend booking at least 2-4 weeks in advance to secure the best hotels and tour guides, especially during peak seasons (summer and holidays). However, Rahalatek also accommodates last-minute bookings based on availability. Early booking often comes with special discounts and better options for customization.
                </div>
              </div>
            </div>

            {/* FAQ 5 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 4 
                  ? 'shadow-md border-l-4 border-l-blue-500 dark:border-l-yellow-400' 
                  : 'hover:shadow-md hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'
              }`}
            >
              <button
                onClick={() => toggleFaq(4)}
                className="flex justify-between items-center w-full px-4 sm:px-6 py-5 text-left transition-colors duration-200"
                aria-expanded={activeFaqIndex === 4}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow pr-3 ${
                  activeFaqIndex === 4 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  Can I customize my tour itinerary?
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
                  Absolutely! One of Rahalatek's key strengths is flexibility and personalization. We can tailor your tour to match your interests, preferences, and budget. Whether you want to add specific destinations, extend your stay, choose particular activities, or adjust the pace of the tour, our team will work with you to create your perfect Turkish adventure.
                </div>
              </div>
            </div>

            {/* FAQ 6 */}
            <div 
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                activeFaqIndex === 5 
                  ? 'shadow-md border-l-4 border-l-blue-500 dark:border-l-yellow-400' 
                  : 'hover:shadow-md hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'
              }`}
            >
              <button
                onClick={() => toggleFaq(5)}
                className="flex justify-between items-center w-full px-4 sm:px-6 py-5 text-left transition-colors duration-200"
                aria-expanded={activeFaqIndex === 5}
              >
                <h3 className={`font-semibold text-base sm:text-lg flex-grow pr-3 ${
                  activeFaqIndex === 5 
                    ? 'text-blue-700 dark:text-yellow-300' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  Do you provide Arabic-speaking tour guides?
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
                  Yes! All Rahalatek tours include professional tour guides who speak fluent Arabic and English. Our guides are not only language experts but also have deep knowledge of Turkish history, culture, and local customs. They ensure you have an enriching, informative, and comfortable experience while eliminating any language barriers throughout your journey.
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
