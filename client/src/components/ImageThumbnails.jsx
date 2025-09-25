import React from 'react';

const ImageThumbnails = ({ 
  images = [], 
  currentIndex = 0, 
  onImageSelect, 
  className = "" 
}) => {
  // Don't render if less than 2 images
  if (images.length <= 1) {
    return null;
  }

  const displayImages = images.length > 0 ? images : [];

  return (
    <div className={`w-full bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-gray-700 py-4 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
          {displayImages.map((image, index) => (
            <button
              key={image.url || index}
              onClick={() => onImageSelect(index)}
              className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 ${
                index === currentIndex
                  ? 'ring-3 ring-blue-500 dark:ring-teal-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                  : 'hover:ring-2 hover:ring-blue-300 dark:hover:ring-teal-300 hover:ring-offset-1'
              }`}
              aria-label={`Go to image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={image.altText || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500/20 dark:bg-teal-400/20" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageThumbnails;
