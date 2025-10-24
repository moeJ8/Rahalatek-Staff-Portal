import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomButton from '../CustomButton';
import RahalatekLoader from '../RahalatekLoader';
import PublicBlogCard from './PublicBlogCard';
import axios from 'axios';

const RecentPosts = () => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenType, setScreenType] = useState('desktop');
  const [blogsPerSlide, setBlogsPerSlide] = useState(3);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/blogs/recent?limit=9');
        if (response.data.success) {
          setBlogs(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching recent blogs:', error);
        setError('Failed to load recent blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBlogs();
  }, []);

  // Screen size detection
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
      setBlogsPerSlide(1);
    } else if (width < 1024) {
      setScreenType('tablet');
      setBlogsPerSlide(2);
    } else {
      setScreenType('desktop');
      setBlogsPerSlide(3);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const totalSlides = Math.ceil(blogs.length / blogsPerSlide);

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

  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.blog.title')}
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
              {t('home.blog.title')}
            </h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-8 md:py-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t('home.blog.title')}
          </h2>
          {/* View All Button - Desktop Only in Header */}
          <div className="hidden lg:block lg:absolute lg:right-16 lg:top-0">
            <CustomButton
              onClick={() => navigate('/blog')}
              variant="rippleBlueToYellowTeal"
              size="md"
              className="px-6 py-2 text-sm"
            >
              {t('home.blog.viewAll')}
            </CustomButton>
          </div>
        </div>

        {/* Blogs Carousel */}
        {blogs.length > 0 ? (
          <>
            {/* Carousel Container with Side Arrows */}
            <div className="relative flex items-center mb-6">
              {/* Left Arrow */}
              {totalSlides > 1 && (
                <button
                  onClick={prevSlide}
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                  aria-label="Previous blogs"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Blog Cards Container */}
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
                      {/* Blog cards for this slide */}
                      {blogs
                        .slice(slideIndex * blogsPerSlide, (slideIndex + 1) * blogsPerSlide)
                        .map((blog, blogIndex) => (
                          <PublicBlogCard
                            key={`${slideIndex}-${blogIndex}`}
                            blog={blog}
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
                  aria-label="Next blogs"
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

            {/* View All Button - Mobile/Tablet Only */}
            <div className="flex justify-center mt-8 lg:hidden">
              <CustomButton
                onClick={() => navigate('/blog')}
                variant="rippleBlueToYellowTeal"
                size="md"
                className="px-4 py-2 sm:px-8 sm:py-3 text-sm sm:text-base"
              >
                {t('home.blog.viewAll')}
              </CustomButton>
            </div>

          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Recent Posts Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please check back later for our latest blog posts.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentPosts;

