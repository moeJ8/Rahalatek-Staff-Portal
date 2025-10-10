import React, { useEffect, useState } from 'react';
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
      title: 'Wide Selection of Hotels',
      description: 'From luxury 5-star resorts to budget-friendly accommodations, we offer a diverse range of hotels across Turkey to suit every traveler\'s needs and budget.',
      color: 'blue'
    },
    {
      icon: FaBed,
      title: 'Quality Accommodations',
      description: 'All our partner hotels are carefully selected and regularly inspected to ensure the highest standards of comfort, cleanliness, and service quality.',
      color: 'teal'
    },
    {
      icon: FaConciergeBell,
      title: 'Premium Services',
      description: 'Enjoy exceptional services including room service, concierge assistance, and 24/7 support to make your stay comfortable and memorable.',
      color: 'purple'
    },
    {
      icon: FaWifi,
      title: 'Modern Amenities',
      description: 'Free Wi-Fi, air conditioning, modern bathrooms, flat-screen TVs, and all the amenities you need for a comfortable stay.',
      color: 'green'
    },
    {
      icon: FaSwimmingPool,
      title: 'Exclusive Facilities',
      description: 'Access to swimming pools, fitness centers, spa facilities, and recreational areas to enhance your vacation experience.',
      color: 'orange'
    },
    {
      icon: FaUtensils,
      title: 'Dining Options',
      description: 'Enjoy delicious meals with breakfast included, multiple restaurant options, and special dietary accommodations available.',
      color: 'red'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] overflow-hidden -mt-6">
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
              Your Perfect Stay with Rahalatek
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed">
              Book premium hotels across Türkiye and other countries with the best prices and exceptional service
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
            onClick={() => document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            Hotels
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
                Your Gateway to Perfect Accommodations
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                Experience unparalleled comfort and luxury with our carefully curated hotel selection across Türkiye. From the historic charm of Istanbul to the sun-kissed beaches of Antalya, from the fairy-tale landscapes of Cappadocia to the pristine mountains of Trabzon, we offer premium accommodations that cater to every traveler's dream.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                Our extensive portfolio features handpicked hotels ranging from elegant 3-star comfort to opulent 5-star luxury resorts. Whether you're planning a romantic getaway, a family vacation, or a business trip, our hotel booking service ensures you find the perfect accommodation that matches your preferences, budget, and travel style, all backed by competitive prices and exceptional customer service.
              </p>
            </div>
          </div>
        </section>

        {/* What is Hotel Booking Service Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            What is Our Hotel Booking Service?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            Our hotel booking service from Rahalatek is your complete accommodation solution in Turkey, offering seamless reservations at carefully selected hotels that meet the highest standards of quality, comfort, and hospitality. We handle every aspect of your hotel stay, from finding the perfect room to arranging special requests, ensuring a stress-free and memorable experience.
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              What we provide:
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Carefully selected 3, 4, and 5-star hotels across all major Turkish cities</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Multiple room types to suit solo travelers, couples, families, and groups</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Flexible booking options with breakfast included or room-only arrangements</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Airport transfer services with comfortable vehicles (Vito, Sprinter, or Bus options)</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Seasonal pricing with special rates and exclusive deals throughout the year</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Family-friendly policies with special rates for children under 6 and ages 6-12</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>24/7 customer support in Arabic and English for your convenience</span>
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
            Why Choose Our Hotel Booking Service
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
      <div>
        <FeaturedHotels />
      </div>

      {/* Hotel Pricing Section */}
      <div id="pricing" className="scroll-mt-24"></div>
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Hotel Pricing & Packages
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            Our hotel packages are designed to offer exceptional value with flexible pricing options to match every budget. All rates include taxes and are available in multiple currencies (USD, EUR, TRY) with seasonal variations for the best deals.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Pricing packages */}
            <div className="space-y-8">
              {/* Budget Hotels */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  1. Budget Hotels (3-Star)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span><strong>From $45-$70</strong> per night per room</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Comfortable rooms with essential amenities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Daily breakfast included in most properties</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Free Wi-Fi and air conditioning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Central locations near major attractions</span>
                  </li>
                </ul>
              </div>

              {/* Standard Hotels */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  2. Standard Hotels (4-Star)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span><strong>From $80-$140</strong> per night per room</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Superior rooms with premium amenities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Full breakfast buffet with international options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Swimming pool and fitness facilities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Restaurant and room service available</span>
                  </li>
                </ul>
              </div>

              {/* Luxury Hotels */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  3. Luxury Hotels (5-Star)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span><strong>From $150-$400+</strong> per night per room</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Luxurious suites with stunning views</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Gourmet dining and exclusive breakfast options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Full-service spa, multiple pools, and beach access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Concierge services and exclusive amenities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>VIP airport transfers included</span>
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
              <strong className="text-blue-600 dark:text-yellow-400">Note:</strong> Prices vary by season, location, and room type. Monthly pricing variations available (June-August peak season, December-January winter rates). We offer special group discounts, extended stay rates, and early booking promotions. Children under 6 stay free in most hotels, ages 6-12 enjoy reduced rates.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <div id="included" className="scroll-mt-24"></div>
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What's Included in Your Hotel Booking?
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            When you book a hotel through Rahalatek, you receive a comprehensive package that covers all essential services and amenities for a comfortable and worry-free stay in Turkey.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Inclusions list */}
            <div className="space-y-8">
              {/* Before Your Arrival */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  1. Before Your Arrival
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Personalized consultation to select the perfect hotel for your needs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Detailed hotel information with photos, amenities, and location details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Confirmed reservation with booking confirmation number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Pre-arrival communication about check-in procedures</span>
                  </li>
                </ul>
              </div>

              {/* Airport & Transportation */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  2. Airport & Transportation
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Airport pick-up service with meet & greet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Comfortable vehicle options: Vito (2-8 passengers), Sprinter (9-16), or Bus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Professional, licensed drivers with local knowledge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Return airport transfer for departure</span>
                  </li>
                </ul>
              </div>

              {/* Room & Amenities */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  3. Room & Amenities
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Choice of room types: Standard, Deluxe, Suite, Family Rooms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Air conditioning and climate control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Free high-speed Wi-Fi throughout the property</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Flat-screen TV with satellite channels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Private bathroom with complimentary toiletries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Daily housekeeping service</span>
                  </li>
                </ul>
              </div>

              {/* Dining & Services */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  4. Dining & Additional Services
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Daily breakfast buffet (Turkish and international cuisine)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Access to hotel restaurants and bars</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Swimming pool and fitness center access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>24/7 front desk and concierge service</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>24/7 customer support in Arabic and English</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0" />
                    <span>Special assistance for special requests and dietary needs</span>
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
              Book Your Perfect Hotel in Turkey Now
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              Experience the best accommodations in Turkey with premium service and competitive prices. Contact us now to find your ideal hotel.
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
              Have questions about hotel booking? We're here to help you find the perfect accommodation. Send us a message and we'll get back to you as soon as possible.
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
                  How far in advance should I book a hotel?
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
                  We recommend booking hotels at least 1-2 weeks in advance to secure the best rates and room availability, especially during peak season (June-August) and major holidays. However, Rahalatek can also accommodate last-minute bookings based on hotel availability. Early booking often comes with special discounts and more room type options.
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
                  Is breakfast included in the hotel price?
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
                  Most of our hotel packages include daily breakfast buffet with Turkish and international options. The breakfast inclusion is clearly mentioned in the hotel description. Some budget hotels may offer room-only rates, which we can customize based on your preference. We always specify what's included when providing pricing.
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
                  Can I cancel or modify my hotel reservation?
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
                  Yes, cancellation and modification policies vary by hotel and booking type. Most hotels offer free cancellation up to 24-72 hours before check-in. Some promotional rates may have stricter cancellation policies. We always inform you of the specific cancellation policy before confirming your booking, and our team is available to assist with any changes to your reservation.
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
                  Do children stay free at hotels?
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
                  Most hotels in our selection offer free accommodation for children under 6 years old when sharing the same room with parents. Children aged 6-12 typically receive a 50% discount. These family-friendly policies apply when using existing beds. Extra beds or cribs can be arranged for an additional fee. Specific policies vary by hotel, and we'll provide exact details when booking.
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
                  Is airport transfer included with hotel booking?
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
                  Airport transfer is included with 5-star luxury hotel bookings. For 3-star and 4-star hotels, airport transfer can be added to your package at competitive rates. We offer comfortable vehicle options including Vito (2-8 passengers), Sprinter (9-16 passengers), and luxury buses for larger groups. All transfers include meet & greet service with professional drivers.
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
                  What payment methods do you accept?
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
                  We accept multiple payment methods for your convenience: bank transfer, credit/debit cards (Visa, Mastercard), and cash payment in USD, EUR, or Turkish Lira. Payment can be made in advance to secure your booking or at the hotel upon check-in, depending on the hotel's policy. We provide secure payment processing and detailed receipts for all transactions.
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

