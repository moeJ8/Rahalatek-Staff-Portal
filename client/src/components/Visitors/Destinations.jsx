import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Flag from 'react-world-flags';

const Destinations = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Scroll functions for desktop arrows
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Update scroll button states
  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Static destinations data with beautiful country-specific images
  const destinations = [
    {
      name: 'Turkey',
      code: 'TR',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&h=400&fit=crop&q=80' // Cappadocia hot air balloons
    },
    {
      name: 'Malaysia',
      code: 'MY', 
      image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&h=400&fit=crop&q=80' // Petronas Towers KL
    },
    {
      name: 'Thailand',
      code: 'TH',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop&q=80' // Thai temple with golden Buddha
    },
    {
      name: 'Indonesia',
      code: 'ID',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&h=400&fit=crop&q=80' // Bali temple and landscape
    },
    {
      name: 'Saudi Arabia',
      code: 'SA',
      image: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=600&h=400&fit=crop&q=80' // Mecca/Modern Saudi architecture
    },
    {
      name: 'Morocco',
      code: 'MA',
      image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&h=400&fit=crop&q=80' // Morocco desert and tourism
    },
    {
      name: 'Egypt',
      code: 'EG',
      image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=400&fit=crop&q=80' // Egypt pyramids
    },
    {
      name: 'Azerbaijan',
      code: 'AZ',
      image: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=600&h=400&fit=crop&q=80' // Azerbaijan Baku
    },
    {
      name: 'Georgia',
      code: 'GE',
      image: 'https://images.unsplash.com/photo-1571104508999-893933ded431?w=600&h=400&fit=crop&q=80' // Georgia Tbilisi
    },
    {
      name: 'Albania',
      code: 'AL',
      image: 'https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=600&h=400&fit=crop&q=80' // Albania Riviera coastline
    }
  ];


  const DestinationCard = ({ destination }) => {
    const handleCardClick = () => {
      navigate(`/country/${encodeURIComponent(destination.name)}`);
    };

    return (
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group h-40 sm:h-48 md:h-56 flex-shrink-0 w-56 sm:w-64 md:w-72 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>

        {/* Flag Icon */}
        <div className="absolute top-3 right-3 z-10">
          <Flag 
            code={destination.code} 
            height="24" 
            width="32"
            className="rounded-sm shadow-md border border-white/20"
          />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white z-10">
          {/* Country Name */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold group-hover:text-yellow-300 transition-colors">
            {destination.name}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Discover our Destinations
          </h2>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
            <FaMapMarkerAlt className="w-4 h-4" />
            <p>Explore amazing countries and create unforgettable memories</p>
          </div>
        </div>

        {/* Destinations Horizontal Scroll */}
        <div className="relative group/arrows">
          {/* Left Arrow - Desktop Only */}
          <button
            onClick={scrollLeft}
            className={`hidden md:flex absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 transition-all duration-500 ease-in-out text-blue-600 bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 hover:text-blue-700 dark:text-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:bg-teal-900/50 dark:hover:text-white dark:hover:border-teal-500 backdrop-blur-lg rounded-full items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-teal-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-20 opacity-0 group-hover/arrows:opacity-100 ${
              !canScrollLeft ? 'group-hover/arrows:opacity-50' : ''
            }`}
            disabled={!canScrollLeft}
          >
            <FaChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
          </button>

          {/* Right Arrow - Desktop Only */}
          <button
            onClick={scrollRight}
            className={`hidden md:flex absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 transition-all duration-500 ease-in-out text-blue-600 bg-yellow-50 border-2 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 hover:text-blue-700 dark:text-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:bg-teal-900/50 dark:hover:text-white dark:hover:border-teal-500 backdrop-blur-lg rounded-full items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-teal-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-20 opacity-0 group-hover/arrows:opacity-100 ${
              !canScrollRight ? 'group-hover/arrows:opacity-50' : ''
            }`}
            disabled={!canScrollRight}
          >
            <FaChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            onScroll={updateScrollButtons}
          >
            {destinations.map((destination, index) => (
              <DestinationCard
                key={index}
                destination={destination}
              />
            ))}
          </div>
        </div>
        </div>
    </section>
  );
};

export default Destinations;
