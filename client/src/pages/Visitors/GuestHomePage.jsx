import React, { useEffect } from 'react';
import HeroCarousel from '../../components/Visitors/HeroCarousel';
import Destinations from '../../components/Visitors/Destinations';
import FeaturedPackages from '../../components/Visitors/FeaturedPackages';
import FeaturedHotels from '../../components/Visitors/FeaturedHotels';
import FeaturedTours from '../../components/Visitors/FeaturedTours';
import PartnersSection from '../../components/PartnersSection';

export default function GuestHomePage() {
  useEffect(() => {
    document.title = 'Rahalatek';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Discover amazing tours and luxury hotels worldwide with Rahalatek. Browse curated travel experiences, book guided tours, and find premium accommodations. Your trusted tourism platform for unforgettable journeys.'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'tourism, travel, tours, hotels, vacation, travel booking, guided tours, luxury hotels, travel experiences, destinations, travel platform, tour packages, hotel booking, adventure tours, cultural tours, city tours, travel agency'
      );
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Rahalatek - Discover Amazing Tours & Luxury Hotels');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        'Discover amazing tours and luxury hotels worldwide with Rahalatek. Browse curated travel experiences and premium accommodations.'
      );
    }
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* Hero Carousel - Full Width with negative margin to connect to header */}
      <div className="-mt-6">
        <HeroCarousel autoplay={true} autoplayInterval={6000} />
      </div>
      
      {/* Discover our Destinations Section */}
      <Destinations />
      
      {/* Discover Our Programs Section */}
      <FeaturedPackages />
      
      {/* Featured Tours Section */}
      <FeaturedTours />
      
      {/* Featured Hotels Section */}
      <FeaturedHotels />
      
      {/* Partners Section */}
      <PartnersSection />
    </div>
  );
}
