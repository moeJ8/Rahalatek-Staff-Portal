import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    const baseUrl = window.location.origin;
    
    // Language-specific content
    const content = {
      en: {
        title: 'Rahalatek - Premium Travel & Tourism Services',
        description: 'Discover Türkiye with Rahalatek - Premium tourism services including guided tours, luxury hotels, serviced apartments, and airport transfers. Book your perfect Turkish adventure today!',
        keywords: 'Turkey tourism, Turkey tours, Turkey hotels, Istanbul tours, Antalya tours, Turkey travel, luxury hotels Turkey, serviced apartments Turkey, airport transfer Turkey, Turkey vacation, Turkish tourism, tour packages Turkey, Turkey travel agency, guided tours Turkey, Cappadocia tours, Trabzon tours',
        ogLocale: 'en_US'
      },
      ar: {
        title: 'رحلاتك - خدمات السياحة والسفر المميزة',
        description: 'اكتشف تركيا مع رحلاتك - خدمات سياحية مميزة تشمل الجولات الإرشادية، الفنادق الفاخرة، الشقق المفروشة، وخدمات النقل من المطار. احجز مغامرتك التركية المثالية اليوم!',
        keywords: 'سياحة تركيا, جولات تركيا, فنادق تركيا, جولات اسطنبول, جولات أنطاليا, سفر تركيا, فنادق فاخرة تركيا, شقق مفروشة تركيا, نقل مطار تركيا, عطلة تركيا, سياحة تركية, باقات سياحية تركيا, وكالة سفر تركيا, جولات إرشادية تركيا, جولات كابادوكيا, جولات ترابزون',
        ogLocale: 'ar_SA'
      },
      fr: {
        title: 'Rahalatek - Services Tourisme & Voyage Premium',
        description: 'Découvrez la Turquie avec Rahalatek - Services touristiques premium incluant des visites guidées, des hôtels de luxe, des appartements meublés et des transferts aéroport. Réservez votre aventure turque parfaite aujourd\'hui!',
        keywords: 'tourisme Turquie, visites Turquie, hôtels Turquie, visites Istanbul, visites Antalya, voyage Turquie, hôtels de luxe Turquie, appartements meublés Turquie, transfert aéroport Turquie, vacances Turquie, tourisme turc, forfaits touristiques Turquie, agence de voyage Turquie, visites guidées Turquie, visites Cappadocia, visites Trabzon',
        ogLocale: 'fr_FR'
      }
    };

    const langContent = content[currentLang] || content.en;

    // Update page title
    document.title = langContent.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', langContent.description);
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', langContent.keywords);
    }

    // Update Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', langContent.title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', langContent.description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', `${baseUrl}/last-logo-3.png`);
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
    ogLocale.setAttribute('content', langContent.ogLocale);
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
      twitterTitle.setAttribute('content', langContent.title);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', langContent.description);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', `${baseUrl}/last-logo-3.png`);
    }

    // Add canonical URL (always point to base URL without language prefix)
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = baseUrl;

    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(tag => tag.remove());

    // Add hreflang tags for all language versions
    const languages = [
      { code: 'en', path: '/' },
      { code: 'ar', path: '/ar' },
      { code: 'fr', path: '/fr' }
    ];

    languages.forEach(({ code, path }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = code;
      link.href = `${baseUrl}${path}`;
      document.head.appendChild(link);
    });

    // Add x-default pointing to English (base URL)
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = baseUrl;
    document.head.appendChild(defaultLink);

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
              "name": "Airport Pick up & Drop off Service",
              "description": "Professional airport pick up and drop off transfer services"
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
  }, [currentLang]);

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
