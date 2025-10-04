import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PackageCard from './PackageCard';
import CustomButton from '../CustomButton';
import RahalatekLoader from '../RahalatekLoader';
import axios from 'axios';

const FeaturedPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenType, setScreenType] = useState('desktop');
  const [packagesPerSlide, setPackagesPerSlide] = useState(3);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/packages/featured?limit=9');
        if (response.data?.success) {
          setPackages(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching featured packages:', error);
        setError('Failed to load featured packages');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPackages();
  }, []);

  // Screen size detection
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
      setPackagesPerSlide(1);
    } else if (width < 1024) {
      setScreenType('tablet');
      setPackagesPerSlide(2);
    } else {
      setScreenType('desktop');
      setPackagesPerSlide(3);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const totalSlides = Math.ceil(packages.length / packagesPerSlide);

  // Reset slide when screen size changes
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const handlePackageClick = async (pkg) => {
    try {
      // Increment view count
      await axios.post(`/api/packages/public/${pkg.slug}/view`);
    } catch (error) {
      console.error('Error incrementing package views:', error);
    }
    
    // Navigate to package page
    navigate(`/packages/${pkg.slug}`);
  };

  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Discover Our Programs
            </h2>
          </div>
          <div className="flex justify-center">
            <RahalatekLoader size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Discover Our Programs
            </h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  return (
    <section className="py-6 sm:py-8 md:py-12 bg-white dark:bg-slate-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            Discover Our Programs
          </h2>
        </div>

        {/* Packages Carousel */}
        <>
          {/* Carousel Container with Side Arrows */}
          <div className="relative flex items-center mb-6">
            {/* Left Arrow */}
            {totalSlides > 1 && (
              <button
                onClick={prevSlide}
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                aria-label="Previous packages"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Package Cards Container */}
            <div className="flex-1 overflow-hidden" ref={carouselRef}>
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Generate slides */}
                {Array.from({ length: totalSlides }, (_, slideIndex) => (
                  <div 
                    key={slideIndex} 
                    className={`w-full flex-shrink-0 ${
                      screenType === 'mobile' 
                        ? 'grid grid-cols-1 gap-4' 
                        : screenType === 'tablet'
                        ? 'grid grid-cols-2 gap-4'
                        : 'grid grid-cols-3 gap-6'
                    }`}
                  >
                    {/* Package cards for this slide */}
                    {packages
                      .slice(slideIndex * packagesPerSlide, (slideIndex + 1) * packagesPerSlide)
                      .map((pkg, pkgIndex) => (
                        <PackageCard
                          key={`${slideIndex}-${pkgIndex}`}
                          pkg={pkg}
                          onClick={() => handlePackageClick(pkg)}
                        />
                      ))
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            {totalSlides > 1 && (
              <button
                onClick={nextSlide}
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                aria-label="Next packages"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="flex justify-center mb-6 space-x-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-yellow-400 dark:bg-blue-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-500 dark:hover:bg-blue-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      </div>
    </section>
  );
};

export default FeaturedPackages;

