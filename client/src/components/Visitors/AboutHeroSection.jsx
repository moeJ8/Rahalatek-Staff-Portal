import React, { useState, useEffect } from 'react';

const AboutHeroSection = () => {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch active hero from API
  useEffect(() => {
    const fetchHero = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/about-hero/active');
        
        if (!response.ok) {
          throw new Error('Failed to fetch about hero');
        }
        
        const data = await response.json();
        setHero(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching about hero:', err);
        setError('Failed to load hero content');
        // Set fallback hero on error
        setHero({
          _id: 'fallback',
          title: 'About Us',
          subtitle: 'Discover Our Story',
          description: 'Learn more about our company, our mission, and what makes us special.',
          image: {
            url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            altText: 'About Us'
          },
          textPosition: 'center',
          textColor: 'light'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  const getTextPositionClasses = (position) => {
    switch (position) {
      case 'left':
        return 'text-left items-start';
      case 'right':
        return 'text-right items-end';
      default:
        return 'text-center items-center';
    }
  };

  const getTextColorClasses = (color) => {
    return color === 'dark' ? 'text-gray-900' : 'text-white';
  };

  if (loading) {
    return (
      <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!hero) {
    return null;
  }

  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
      {/* Background Image */}
      <img
        src={hero.image?.url || hero.image}
        alt={hero.image?.altText || hero.title}
        className="w-full h-full object-cover"
        loading="eager"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className={`absolute inset-0 flex flex-col justify-center ${
        hero.textPosition === 'left' ? 'items-start' :
        hero.textPosition === 'right' ? 'items-end' :
        'items-center'
      } p-4 sm:p-6 md:p-10 lg:p-20`}>
        <div className={`max-w-4xl ${getTextColorClasses(hero.textColor)} z-10 ${getTextPositionClasses(hero.textPosition)}`}>
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight">
            {hero.title}
          </h1>
          
          {/* Subtitle */}
          {hero.subtitle && (
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium mb-3 sm:mb-4 md:mb-6 opacity-90">
              {hero.subtitle}
            </h2>
          )}
          
          {/* Description */}
          {hero.description && (
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl opacity-80 leading-relaxed ${
              hero.textPosition === 'center' ? 'mx-auto max-w-2xl' :
              hero.textPosition === 'right' ? 'ml-auto max-w-2xl' :
              'max-w-2xl'
            }`}>
              {hero.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutHeroSection;

