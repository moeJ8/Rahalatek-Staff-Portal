import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaExpand } from 'react-icons/fa';

const PackageImagesCarousel = ({ 
  images = [], 
  title = "", 
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef(null);

  // Fallback image for when no images are provided
  const defaultImage = {
    url: 'https://via.placeholder.com/800x400/f3f4f6/9ca3af?text=No+Image+Available',
    altText: 'No image available'
  };

  const displayImages = images.length > 0 ? images : [defaultImage];

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToImage = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
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
    
    if (dragOffset > 120) {
      prevImage();
    } else if (dragOffset < -120) {
      nextImage();
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

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - dragStart;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    if (dragOffset > 50) {
      prevImage();
    } else if (dragOffset < -50) {
      nextImage();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    document.body.style.userSelect = '';
  };

  // Keyboard support for fullscreen modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen && e.key === 'Escape') {
        setIsFullscreen(false);
        document.body.style.overflow = '';
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.userSelect = '';
      document.body.style.overflow = '';
    };
  }, []);

  if (displayImages.length === 0) {
    return (
      <div className={`relative w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={carouselRef}
        className={`relative w-full max-h-[365px] ${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Sliding Images Container */}
        <div 
          className={`flex w-full h-full ${isDragging ? 'transition-none' : 'transition-transform duration-500 ease-in-out'}`}
          style={{ 
            transform: `translateX(${-currentIndex * 100 + (dragOffset * 0.05)}%)` 
          }}
        >
          {displayImages.map((image, index) => (
            <div
              key={image.url || index}
              className="w-full h-full flex-shrink-0 relative bg-gray-900"
            >
              <img
                src={image.url}
                alt={image.altText || `${title} - Image ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
                loading="lazy"
                style={{ objectFit: 'cover', maxHeight: '100%' }}
              />
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={isTransitioning || isDragging}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-yellow-600 dark:text-yellow-400 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-20 disabled:opacity-50 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={isTransitioning || isDragging}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-yellow-600 dark:text-yellow-400 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-20 disabled:opacity-50 backdrop-blur-sm"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Image Counter and Fullscreen */}
        <div className="absolute top-2 right-2 flex items-center space-x-2 z-10">
          {displayImages.length > 1 && (
            <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
              {currentIndex + 1} / {displayImages.length}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="View fullscreen"
          >
            <FaExpand className="w-3 h-3" />
          </button>
        </div>
        
        {/* Dot Navigation */}
        {displayImages.length > 1 && displayImages.length <= 8 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                disabled={isTransitioning || isDragging}
                className={`w-2 h-2 rounded-full transition-all duration-200 disabled:opacity-50 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            width: '100vw',
            height: '100vh'
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={displayImages[currentIndex].url}
              alt={displayImages[currentIndex].altText || `${title} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Fullscreen Controls */}
            <button
              onClick={() => {
                setIsFullscreen(false);
                document.body.style.overflow = '';
              }}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-lg font-medium">
                  {currentIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PackageImagesCarousel;

