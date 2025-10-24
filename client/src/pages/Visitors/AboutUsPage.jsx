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
    document.title = 'About Us - Rahalatek';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Learn more about Rahalatek - Your trusted partner for premium tourism and travel services in Türkiye. Discover our story, mission, values, and what makes us special.'
      );
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        'about Rahalatek, travel agency Turkey, tourism company, our story, mission vision values, why choose us, travel partners, Turkey tours about'
      );
    }

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

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

