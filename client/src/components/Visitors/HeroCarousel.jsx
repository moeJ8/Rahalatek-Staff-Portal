import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CustomButton from '../CustomButton';

const HeroCarousel = ({ autoplay = true, autoplayInterval = 5000 }) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef(null);
  const autoplayRef = useRef(null);

  // Fetch active slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/carousel/active');
        
        if (!response.ok) {
          throw new Error('Failed to fetch carousel slides');
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
          // Fallback to default slides if no active slides
          setSlides([
            {
              _id: 'default-1',
              image: { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' },
              title: 'Discover Amazing Destinations',
              subtitle: 'Experience the world like never before',
              description: 'Join us on unforgettable journeys to the most beautiful places on Earth. Create memories that will last a lifetime.',
              button: {
                text: 'Start Your Journey',
                link: '/guest/tours',
                variant: 'rippleGrayToBlue'
              },
              textPosition: 'center',
              textColor: 'light'
            },
            {
              _id: 'default-2',
              image: { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80' },
              title: 'Luxury Accommodations',
              subtitle: 'Stay in the finest hotels worldwide',
              description: 'Experience unparalleled comfort and service in our carefully selected premium hotels and resorts.',
              button: {
                text: 'View Hotels',
                link: '/guest/hotels',
                variant: 'rippleGrayToBlue'
              },
              textPosition: 'center',
              textColor: 'light'
            }
          ]);
        } else {
          setSlides(data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching carousel slides:', err);
        setError('Failed to load carousel content');
        // Set fallback slides on error
        setSlides([
          {
            _id: 'fallback-1',
            image: { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' },
            title: 'Welcome to Our Travel Experience',
            subtitle: 'Discover amazing destinations worldwide',
            description: 'Create unforgettable memories with our curated tours and premium accommodations.',
            button: {
              text: 'Explore',
              link: '/guest/tours',
              variant: 'rippleGrayToBlue'
            },
            textPosition: 'center',
            textColor: 'light'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, slides.length]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Drag functionality
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const diff = e.clientX - dragStart;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    if (dragOffset > 100) {
      prevSlide();
    } else if (dragOffset < -100) {
      nextSlide();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    document.body.style.userSelect = '';
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    document.body.style.userSelect = 'none';
  };


  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    if (dragOffset > 75) {
      prevSlide();
    } else if (dragOffset < -75) {
      nextSlide();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    document.body.style.userSelect = '';
  };

  // Autoplay functionality
  useEffect(() => {
    if (autoplay && !isPaused && !isDragging) {
      autoplayRef.current = setInterval(() => {
        nextSlide();
      }, autoplayInterval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, autoplayInterval, isPaused, isDragging, currentSlide, nextSlide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.userSelect = '';
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, []);

  // Add touch event listeners with passive: false to allow preventDefault
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const touchMoveHandler = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const diff = e.touches[0].clientX - dragStart;
      setDragOffset(diff);
    };

    carousel.addEventListener('touchmove', touchMoveHandler, { passive: false });

    return () => {
      carousel.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [isDragging, dragStart]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const getTextPositionClasses = (position) => {
    switch (position) {
      case 'left':
        return 'text-left justify-start';
      case 'right':
        return 'text-right justify-end';
      default:
        return 'text-center justify-center';
    }
  };

  const getTextColorClasses = (color) => {
    return color === 'dark' ? 'text-gray-900' : 'text-white';
  };

  return (
    <div 
      className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div 
        ref={carouselRef}
        className={`flex w-full h-full ${isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab transition-transform duration-500 ease-in-out'}`}
        style={{ 
          transform: `translateX(${-currentSlide * 100 + (dragOffset * 0.02)}%)` 
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="w-full h-full flex-shrink-0 relative bg-gray-900 flex items-center justify-center">
            <div className="text-white text-xl">Loading...</div>
          </div>
        ) : slides.length === 0 ? (
          <div className="w-full h-full flex-shrink-0 relative bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-2xl mb-2">No carousel content available</h2>
              <p className="text-gray-300">Please check back later</p>
            </div>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide._id}
              className="w-full h-full flex-shrink-0 relative bg-gray-900"
            >
              {/* Background Image */}
              <img
                src={slide.image?.url || slide.image}
                alt={slide.image?.altText || slide.title}
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>
              
              {/* Content */}
              <div className={`absolute inset-0 flex items-center ${getTextPositionClasses(slide.textPosition)} p-6 md:p-12 lg:p-20`}>
                <div className={`max-w-4xl ${getTextColorClasses(slide.textColor)} z-10`}>
                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  
                  {/* Subtitle */}
                  {slide.subtitle && (
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-medium mb-6 md:mb-8 opacity-90">
                      {slide.subtitle}
                    </h2>
                  )}
                  
                  {/* Description */}
                  {slide.description && (
                    <p className="text-lg md:text-xl mb-8 md:mb-10 opacity-80 max-w-2xl leading-relaxed">
                      {slide.description}
                    </p>
                  )}
                  
                  {/* Button */}
                  {slide.button?.text && slide.button?.link && (
                    <div className="flex justify-center">
                      <CustomButton
                        as="a"
                        href={slide.button.link}
                        target={slide.button.openInNewTab ? '_blank' : undefined}
                        rel={slide.button.openInNewTab ? 'noopener noreferrer' : undefined}
                        variant={slide.button.variant || 'rippleGrayToBlue'}
                        size="lg"
                        className="shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
                      >
                        {slide.button.text}
                      </CustomButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            disabled={isTransitioning || isDragging}
            className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 opacity-0 group-hover:opacity-100 disabled:opacity-50 z-20"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            disabled={isTransitioning || isDragging}
            className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 opacity-0 group-hover:opacity-100 disabled:opacity-50 z-20"
            aria-label="Next slide"
          >
            <FaChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Dot Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={isTransitioning || isDragging}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 disabled:opacity-50 ${
                index === currentSlide 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/80 hover:scale-105'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Indicator */}
      {autoplay && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ 
              width: isPaused || isDragging ? '0%' : '100%',
              animation: isPaused || isDragging ? 'none' : `progress ${autoplayInterval}ms linear infinite`
            }}
          />
        </div>
      )}

      {/* Custom CSS for progress animation */}
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
