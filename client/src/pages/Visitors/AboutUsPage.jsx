import React, { useEffect } from 'react';
import AboutHeroSection from '../../components/Visitors/AboutHeroSection';
import CompanyStory from '../../components/Visitors/CompanyStory';
import MissionVisionValues from '../../components/Visitors/MissionVisionValues';
import Statistics from '../../components/Visitors/Statistics';
import WhyChooseUs from '../../components/Visitors/WhyChooseUs';
import ServicesSection from '../../components/Visitors/ServicesSection';
import BranchesSection from '../../components/Visitors/BranchesSection';
import PartnersSection from '../../components/PartnersSection';
import CTASection from '../../components/Visitors/CTASection';

const AboutUsPage = () => {
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
      {/* Hero Section */}
      <div className="-mt-6">
        <AboutHeroSection />
      </div>
      
      {/* Company Story */}
      <CompanyStory />
      
      {/* Mission, Vision & Values */}
      <MissionVisionValues />
      
      {/* Statistics */}
      <Statistics />
      
      {/* Why Choose Us */}
      <WhyChooseUs />
      
      {/* Our Services */}
      <div className="bg-gray-50 dark:bg-slate-900 -mt-12">
        <ServicesSection />
      </div>
      
      {/* Branches Section */}
      <BranchesSection />
      
      {/* Partners Section */}
      <div className="bg-white dark:bg-slate-950">
        <PartnersSection />
      </div>
      
      {/* Call to Action */}
      <CTASection />
    </div>
  );
};

export default AboutUsPage;

