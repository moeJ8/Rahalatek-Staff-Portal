import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AboutHeroSection from '../../components/Visitors/AboutHeroSection';
import CompanyStory from '../../components/Visitors/CompanyStory';
import MissionVisionValues from '../../components/Visitors/MissionVisionValues';
import Statistics from '../../components/Visitors/Statistics';
import WhyChooseUs from '../../components/Visitors/WhyChooseUs';
import ServicesSection from '../../components/Visitors/ServicesSection';
import BranchesSection from '../../components/Visitors/BranchesSection';
import ClientReviewsSection from '../../components/Visitors/ClientReviewsSection';
import PartnersSection from '../../components/PartnersSection';
import CTASection from '../../components/Visitors/CTASection';

const AboutUsPage = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  useEffect(() => {
    const baseUrl = window.location.origin;
    const currentLang = i18n.language;
    
    // Language-specific content
    const content = {
      en: {
        title: 'About Us - Rahalatek',
        description: 'Learn more about Rahalatek - Your trusted partner for premium tourism and travel services in Türkiye. Discover our story, mission, values, and what makes us special.',
        keywords: 'about Rahalatek, travel agency Turkey, tourism company, our story, mission vision values, why choose us, travel partners, Turkey tours about',
        ogLocale: 'en_US'
      },
      ar: {
        title: 'من نحن - رحلاتك',
        description: 'تعرف على المزيد حول رحلاتك - شريكك الموثوق لخدمات السياحة والسفر المميزة في تركيا. اكتشف قصتنا، مهمتنا، قيمنا، وما يميزنا.',
        keywords: 'من نحن رحلاتك, وكالة سفر تركيا, شركة سياحة, قصتنا, المهمة الرؤية القيم, لماذا تختارنا, شركاء سفر, جولات تركيا',
        ogLocale: 'ar_SA'
      },
      fr: {
        title: 'À Propos de Nous - Rahalatek',
        description: 'En savoir plus sur Rahalatek - Votre partenaire de confiance pour les services de tourisme et de voyage premium en Turquie. Découvrez notre histoire, notre mission, nos valeurs et ce qui nous rend spéciaux.',
        keywords: 'à propos Rahalatek, agence voyage Turquie, compagnie tourisme, notre histoire, mission vision valeurs, pourquoi nous choisir, partenaires voyage, visites Turquie',
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

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${baseUrl}/about`;

    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(tag => tag.remove());

    // Add hreflang tags for all language versions
    const languages = [
      { code: 'en', path: '/about' },
      { code: 'ar', path: '/ar/about' },
      { code: 'fr', path: '/fr/about' }
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
    defaultLink.href = `${baseUrl}/about`;
    document.head.appendChild(defaultLink);

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero Section - NO RTL */}
      <div className="-mt-6">
        <AboutHeroSection />
      </div>
      
      {/* Apply RTL to all sections below */}
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Company Story */}
        <CompanyStory />
        
        {/* Mission, Vision & Values */}
        <MissionVisionValues />
        
        {/* Branches Section */}
        <div className="-mt-12">
          <BranchesSection />
        </div>
        
        {/* Statistics */}
        <Statistics />
        
        {/* Why Choose Us */}
        <WhyChooseUs />
        
        {/* Our Services */}
        <div className="-mt-12 bg-white dark:bg-slate-950">
          <ServicesSection />
        </div>
        
        {/* Client Reviews Section */}
        <ClientReviewsSection />
        
        {/* Partners Section */}
        <div className="bg-white dark:bg-slate-950">
          <PartnersSection />
        </div>
        
        {/* Call to Action */}
        <CTASection />
      </div>
    </div>
  );
};

export default AboutUsPage;

