import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaExpand, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ImageGallery = ({ 
  images = [], 
  title = "", 
  className = "",
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Fallback image for when no images are provided
  const defaultImage = {
    url: 'https://via.placeholder.com/800x400/f3f4f6/9ca3af?text=No+Image+Available',
    altText: 'No image available'
  };

  const displayImages = images.length > 0 ? images : [defaultImage];
  
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  }, [displayImages.length]);

  const prevLightboxImage = useCallback(() => {
    setLightboxIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  }, [displayImages.length]);

  // Keyboard support for lightbox modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          prevLightboxImage();
        } else if (e.key === 'ArrowRight') {
          nextLightboxImage();
        }
      }
    };

    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, nextLightboxImage, prevLightboxImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Show 4 images on mobile, 5 on tablet/desktop
  const isMobile = window.innerWidth < 640;
  const maxImages = isMobile ? 4 : 5;
  const previewImages = displayImages.slice(0, maxImages);
  const remainingCount = Math.max(0, displayImages.length - maxImages);

  if (displayImages.length === 0) {
    return (
      <div className={`relative w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className={`relative w-full ${className}`}>
        <div className="flex gap-1 sm:gap-2 h-full">
          {/* Main Large Image */}
          <div className="flex-[2] sm:flex-[1.5] relative">
            <button
              onClick={() => openLightbox(0)}
              className="w-full h-full group relative overflow-hidden rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <img
                src={displayImages[0].url}
                alt={displayImages[0].altText || `${title} - Main image`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                draggable={false}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              {/* Expand icon */}
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-black/50 text-white p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FaExpand className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </button>
          </div>

          {/* Grid of Smaller Images */}
          {displayImages.length > 1 && (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
              {previewImages.slice(1).map((image, index) => {
                const actualIndex = index + 1;
                const isLastMobile = isMobile && actualIndex === 3 && remainingCount > 0;
                const isLastDesktop = !isMobile && actualIndex === 4 && remainingCount > 0;
                const isLast = isLastMobile || isLastDesktop;
                
                return (
                  <button
                    key={image.url || actualIndex}
                    onClick={() => openLightbox(actualIndex)}
                    className={`relative group overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      actualIndex === 1 ? 'rounded-tr-lg' : 
                      actualIndex === 2 ? 'sm:rounded-none' :
                      actualIndex === 3 ? (isMobile ? 'rounded-br-lg' : 'sm:rounded-none') :
                      actualIndex === 4 ? 'rounded-br-lg' : ''
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${title} - Image ${actualIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      draggable={false}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Show remaining count on last image */}
                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-sm sm:text-lg font-semibold">
                          {remainingCount}+
                        </span>
                      </div>
                    )}
                    
                    {/* Expand icon */}
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black/50 text-white p-1 sm:p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaExpand className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </div>
                  </button>
                );
              })}
              
              {/* Fill empty grid spots if needed */}
              {previewImages.length < 4 && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal - Rendered as Portal to document.body */}
      {isLightboxOpen && createPortal(
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
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-110 z-10"
            aria-label="Close gallery"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/60 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-lg font-medium z-10">
            {lightboxIndex + 1} / {displayImages.length}
          </div>

          {/* Main Image */}
          <img
            src={displayImages[lightboxIndex].url}
            alt={displayImages[lightboxIndex].altText || `${title} - Image ${lightboxIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevLightboxImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-4 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextLightboxImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-4 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Next image"
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Thumbnail Navigation */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2 max-w-full overflow-x-auto px-2 sm:px-4">
              {displayImages.slice(0, window.innerWidth < 640 ? 6 : 10).map((image, index) => (
                <button
                  key={image.url || index}
                  onClick={() => setLightboxIndex(index)}
                  className={`flex-shrink-0 w-10 h-8 sm:w-16 sm:h-12 rounded overflow-hidden transition-all duration-200 ${
                    index === lightboxIndex
                      ? 'ring-1 sm:ring-2 ring-white ring-offset-1 sm:ring-offset-2 ring-offset-black'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {displayImages.length > (window.innerWidth < 640 ? 6 : 10) && (
                <div className="flex items-center px-1 sm:px-2 text-white/70 text-xs sm:text-sm">
                  +{displayImages.length - (window.innerWidth < 640 ? 6 : 10)}
                </div>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default ImageGallery;
