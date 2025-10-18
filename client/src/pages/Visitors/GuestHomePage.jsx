import React, { useEffect } from 'react';
import HeroCarousel from '../../components/Visitors/HeroCarousel';
import Destinations from '../../components/Visitors/Destinations';
import ServicesSection from '../../components/Visitors/ServicesSection';
import FeaturedPackages from '../../components/Visitors/FeaturedPackages';
import FeaturedHotels from '../../components/Visitors/FeaturedHotels';
import FeaturedTours from '../../components/Visitors/FeaturedTours';
import RecentPosts from '../../components/Visitors/RecentPosts';
import YoutubeShortsSection from '../../components/Visitors/YoutubeShortsSection';
import PartnersSection from '../../components/PartnersSection';

export default function GuestHomePage() {
  useEffect(() => {
    document.title = 'Rahalatek';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Discover Türkiye with Rahalatek - Premium tourism services including guided tours, luxury hotels, serviced apartments, and airport transfers. Book your perfect Turkish adventure today!'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'Turkey tourism, Turkey tours, Turkey hotels, Istanbul tours, Antalya tours, Turkey travel, luxury hotels Turkey, serviced apartments Turkey, airport transfer Turkey, Turkey vacation, Turkish tourism, tour packages Turkey, Turkey travel agency, guided tours Turkey, Cappadocia tours, Trabzon tours'
      );
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Rahalatek - Premium Tourism & Travel Services in Türkiye');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 
        'Discover Türkiye with Rahalatek - Premium tourism services including guided tours, luxury hotels, serviced apartments, and airport transfers. Book your perfect Turkish adventure!'
      );
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', `${window.location.origin}/last-logo-3.png`);
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
      twitterTitle.setAttribute('content', 'Rahalatek - Premium Tourism & Travel Services in Türkiye');
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 
        'Discover Türkiye with Rahalatek - Premium tourism services including guided tours, luxury hotels, serviced apartments, and airport transfers.'
      );
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', `${window.location.origin}/last-logo-3.png`);
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin;

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "Rahalatek",
      "description": "Premium tourism and travel services in Türkiye",
      "url": window.location.origin,
      "logo": `${window.location.origin}/last-logo-3.png`,
      "image": `${window.location.origin}/last-logo-3.png`,
      "telephone": "+905010684657",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR"
      },
      "areaServed": "Türkiye",
      "serviceType": [
        "Tourism Tours",
        "Hotel Booking",
        "Luxury Serviced Apartments",
        "Airport Transfer Service"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Travel Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Tourism Tours",
              "description": "Professional guided tours across Turkey's most beautiful destinations"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Hotel Booking",
              "description": "Premium hotel reservations in Turkey's top locations"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Luxury Serviced Apartments",
              "description": "Comfortable serviced apartments for extended stays"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Airport Transfer Service",
              "description": "Professional airport reception and transfer services"
            }
          }
        ]
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+905010684657",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "English", "Turkish"]
      },
      "sameAs": [
        "https://www.instagram.com/rahalatek",
        "https://wa.me/905010684657"
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
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* Hero Carousel - Full Width with negative margin to connect to header */}
      <div className="-mt-6">
        <HeroCarousel autoplay={true} autoplayInterval={6000} />
      </div>
      
      {/* Discover our Destinations Section */}
      <Destinations />
      
      {/* Our Services Section */}
      <ServicesSection />
      
      {/* Discover Our Programs Section */}
      <FeaturedPackages />
      
      {/* Featured Tours Section */}
      <FeaturedTours />
      
      {/* Featured Hotels Section */}
      <FeaturedHotels />
      
      {/* Recent Blog Posts Section */}
      <RecentPosts />
      
      {/* YouTube Shorts Section */}
      <YoutubeShortsSection />
      
      {/* Partners Section */}
      <PartnersSection />
    </div>
  );
}
