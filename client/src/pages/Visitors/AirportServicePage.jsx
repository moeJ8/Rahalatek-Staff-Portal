import React, { useEffect, useState } from 'react';
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
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  useEffect(() => {
    document.title = 'Airport Reception & Farewell | Rahalatek';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Professional airport transfer services in Türkiye. VIP reception and farewell with comfortable vehicles, meet & greet, and 24/7 service. Book your seamless airport transfer today!'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'airport transfer Turkey, airport reception, airport farewell, VIP transfer, meet and greet, airport shuttle, private transfer, Turkey airport service, Istanbul airport transfer, Antalya airport transfer, Trabzon airport transfer, luxury airport transfer, Mercedes airport transfer'
      );
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Airport Reception & Farewell - Professional Transfer Service | Rahalatek');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        'Professional airport transfer services with VIP reception and comfortable vehicles across Türkiye. Meet & greet, 24/7 service, and transparent pricing.'
      );
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759859381/photo-1449965408869-eaa3f722e40d_gbhlay.jpg');
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
      twitterTitle.setAttribute('content', 'Airport Reception & Farewell - Professional Transfer Service | Rahalatek');
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 
        'Professional airport transfer services with VIP reception and comfortable vehicles across Türkiye. Meet & greet, 24/7 service.'
      );
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
    canonical.href = window.location.href;

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
  }, []);

  const features = [
    {
      icon: FaPlane,
      title: 'Meet & Greet Service',
      description: 'Our professional team meets you at the airport arrival gate with a personalized name sign, assists with luggage, and guides you through customs and immigration if needed.',
      color: 'blue'
    },
    {
      icon: FaCar,
      title: 'Comfortable Vehicles',
      description: 'Choose from our fleet of modern, air-conditioned vehicles: Vito (2-8 passengers), Sprinter (9-16 passengers), or luxury buses for larger groups, all maintained to the highest standards.',
      color: 'teal'
    },
    {
      icon: FaUserTie,
      title: 'Professional Drivers',
      description: 'Licensed, experienced drivers with excellent knowledge of local routes and traffic patterns. Multilingual drivers available (English, Arabic, Turkish) for seamless communication.',
      color: 'purple'
    },
    {
      icon: FaClock,
      title: '24/7 Availability',
      description: 'Round-the-clock service for any arrival or departure time. Flight monitoring ensures we track delays and adjust pickup times automatically, so you\'re never left waiting.',
      color: 'green'
    },
    {
      icon: FaPlane,
      title: 'Continuous Flight Status Monitoring',
      description: 'We constantly monitor your flight status to ensure we\'re on time, even in the event of delays or changes to your arrival time.',
      color: 'blue'
    },
    {
      icon: FaShieldAlt,
      title: 'Safe & Reliable',
      description: 'Fully insured vehicles with experienced drivers following all safety protocols. GPS tracking and real-time updates keep you informed throughout your journey.',
      color: 'orange'
    },
    {
      icon: FaSuitcase,
      title: 'Luggage Assistance',
      description: 'Complete luggage handling from airport pickup to hotel drop-off. We ensure your belongings are transported safely and handled with care throughout the journey.',
      color: 'red'
    },
    {
      icon: FaDollarSign,
      title: 'Transparent Pricing with No Surprises',
      description: 'Our pricing is clear and transparent from the outset, with no hidden costs or surprise additional fees upon arrival.',
      color: 'green'
    }
  ];

  const faqs = [
    {
      question: 'Do I need to book in advance?',
      answer: 'Yes, we recommend booking at least 24 hours in advance. This ensures we have the right vehicle available and can provide you with the best service. However, we also accept last-minute bookings based on availability.'
    },
    {
      question: 'Is the service available 24/7?',
      answer: 'Yes, we provide airport reception service 24 hours a day, 7 days a week, including weekends, holidays, and during peak travel times. Our team is always ready to welcome you whenever you arrive.'
    },
    {
      question: 'What if my flight is delayed?',
      answer: 'No worries! We continuously track your flight status and will be there on time, even if your arrival is delayed or changes. Our driver will meet you at your actual arrival time without any extra charge for reasonable delays.'
    },
    {
      question: 'Do you accept payment upon arrival?',
      answer: 'Yes, we accept cash payment in USD, EUR, or Turkish Lira upon arrival. We also offer advance payment options through bank transfer or credit card for your convenience. Prices are agreed upon in advance with no hidden fees.'
    },
    {
      question: 'Do you provide service for large groups?',
      answer: 'Absolutely! We have large vehicles like Mercedes Sprinter (9-16 passengers) and luxury buses (17+ passengers) specifically for groups. We can also coordinate multiple vehicles for bigger groups. Volume discounts are available for 3+ vehicles.'
    },
    {
      question: 'Do you provide child seats in the vehicles?',
      answer: 'Yes, we provide complimentary child seats and booster seats upon request. Please inform us at the time of booking about the age of the child and the number of required seats so we can prepare accordingly.'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] overflow-hidden -mt-6">
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
              Seamless Airport Transfers
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed">
              Professional airport reception and farewell services with VIP treatment
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
                Your Journey Starts with Comfort
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                Experience the ultimate convenience with our premium airport transfer service across Türkiye. From the moment you land until your departure, we ensure a smooth, comfortable, and stress-free journey. Our VIP reception service includes personalized meet and greet, luggage assistance, and direct transfer to your hotel or destination.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                Whether arriving at Istanbul, Antalya, Trabzon, or any major Turkish airport, our professional team is ready to welcome you. We serve all cities and provide door-to-door service with modern vehicles, experienced drivers, and 24/7 customer support to make your travel experience exceptional.
              </p>
            </div>
          </div>
        </section>

        {/* What is Airport Service Section */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
            What is Our Airport Transfer Service?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6 text-center">
            Our airport transfer service from Rahalatek provides complete airport reception and farewell solutions, ensuring hassle-free arrivals and departures. We handle all aspects of your airport transfer, from flight monitoring to luggage handling, delivering a premium experience from touchdown to takeoff.
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              What we provide:
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-6">
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Personalized meet and greet at arrival gate with name sign</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Professional assistance with customs, immigration, and baggage claim</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Modern vehicle fleet: Vito (2-8 pax), Sprinter (9-16 pax), or luxury buses</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Licensed drivers with excellent local knowledge and multilingual skills</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Flight tracking and automatic pickup time adjustments for delays</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>Door-to-door service from airport to hotel and hotel to airport</span>
              </li>
              <li className="flex gap-3 items-start">
                <FaCircle className="w-2 h-2 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-2" />
                <span>24/7 customer support in Arabic, English, and Turkish</span>
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base text-center">
              We transform the most stressful part of travel into a smooth and comfortable experience for you and your family.
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
            Why Choose Our Airport Transfer Service
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
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
            Airport Transfer Pricing
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            Our transparent pricing structure offers excellent value with no hidden fees. Prices vary by vehicle type, distance, and passenger count. All rates include meet and greet, luggage assistance, and professional driver service.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Pricing */}
            <div className="space-y-8">
              {/* Vito Transfer */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  1. Vito Transfer (2-8 Passengers)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span><strong>From $30-$50</strong> depending on distance and location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Perfect for couples, small families, or business travelers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Modern Mercedes Vito with air conditioning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Comfortable seating with ample luggage space</span>
                  </li>
                </ul>
              </div>

              {/* Sprinter Transfer */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  2. Sprinter Transfer (9-16 Passengers)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span><strong>From $50-$70</strong> depending on distance and location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Ideal for medium-sized groups and families</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Mercedes Sprinter with premium comfort features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Extra luggage capacity for group travelers</span>
                  </li>
                </ul>
              </div>

              {/* Bus Transfer */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  3. Bus Transfer (17+ Passengers)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span><strong>From $180-$300+</strong> depending on distance and passenger count</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Perfect for large tour groups and corporate events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Modern luxury bus with climate control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Professional driver and tour guide available</span>
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
              <strong className="text-blue-600 dark:text-yellow-400">Note:</strong> Prices vary by airport, destination city, and time of day. Night transfers (11 PM - 6 AM) may have additional surcharge. Round-trip bookings receive special discounts. Group rates available for 3+ vehicles. All prices include meet & greet, flight monitoring, and luggage assistance.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <div id="included" className="scroll-mt-24"></div>
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            What's Included in Your Airport Transfer?
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8 text-center">
            Our comprehensive airport transfer service covers every aspect of your journey from touchdown to hotel check-in and hotel to departure gate.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Left Side - Inclusions list */}
            <div className="space-y-8">
              {/* Arrival Reception */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  1. Airport Reception (Arrival)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Meet and greet at arrival gate with personalized name sign</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Assistance with baggage claim and luggage handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Help with customs and immigration procedures if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Escort to vehicle with luggage cart assistance</span>
                  </li>
                </ul>
              </div>

              {/* Transfer Journey */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  2. Transfer Journey
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Modern, air-conditioned vehicle (Vito, Sprinter, or Bus)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Professional, licensed driver with local expertise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Complimentary bottled water and Wi-Fi (select vehicles)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Safe, direct route to your hotel or destination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>GPS tracking for safety and real-time updates</span>
                  </li>
                </ul>
              </div>

              {/* Departure Farewell */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  3. Airport Farewell (Departure)
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Hotel pickup at scheduled time with flight monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Luggage loading and assistance to check-in counter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Terminal drop-off at departure gate area</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Assistance with airline check-in if required</span>
                  </li>
                </ul>
              </div>

              {/* Additional Services */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  4. Additional Services
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Flight tracking and automatic delay adjustments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>24/7 customer support hotline in multiple languages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Child seats and special equipment upon request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>Extra stops or route modifications available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>VIP fast-track services at select airports (additional fee)</span>
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
              Book Your Airport Transfer Now
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              Experience hassle-free airport transfers with professional service and comfortable vehicles. Contact us now to arrange your VIP reception or farewell service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Email Card */}
            <a
              href="mailto:info@rahalatek.com"
              className="bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 group"
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

            {/* WhatsApp Card */}
            <a
              href="https://wa.me/905010684657"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 group"
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

            {/* Instagram Card */}
            <a
              href="https://www.instagram.com/rahalatek_/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-pink-500 dark:hover:border-pink-400 transition-all duration-300 group"
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

            {/* Phone Card */}
            <a
              href="tel:+905010684657"
              className="bg-white dark:bg-slate-950 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300 group"
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
      </section>

      {/* Contact Form Section */}
      <section className="py-8 sm:py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              Have questions about our airport transfer service? We're here to help you plan your seamless arrival and departure. Send us a message and we'll get back to you as soon as possible.
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
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                  activeFaqIndex === index 
                    ? 'shadow-md border-l-4 border-l-blue-500 dark:border-l-yellow-400' 
                    : 'hover:shadow-md hover:border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full px-4 sm:px-6 py-5 text-left transition-colors duration-200"
                  aria-expanded={activeFaqIndex === index}
                >
                  <h3 className={`font-semibold text-base sm:text-lg flex-grow pr-3 ${
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
      </section>
      
      {/* Floating Contact Buttons */}
      <FloatingContactButtons />
    </div>
  );
}

