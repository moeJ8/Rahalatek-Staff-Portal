import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const FloatingWhatsAppButton = () => {
  const href = 'https://wa.me/905010684657';
  const location = useLocation();

  const getSlug = () => {
    const match = location.pathname.match(/^(?:\/(?:ar|fr))?\/blog\/([^/?#]+)/);
    return match ? match[1] : null;
  };

  const handleClick = () => {
    const slug = getSlug();
    if (slug) {
      // fire and forget
      axios.post(`/api/blogs/slug/${slug}/whatsapp-click`).catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative"
        aria-label="WhatsApp"
        onClick={handleClick}
      >
        {/* Label (appears on hover) - hidden on mobile */}
        <div className="hidden sm:block absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 dark:bg-gray-800/95 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-sm">
          WhatsApp
        </div>

        {/* Icon Button - Circular - Responsive sizing */}
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-2xl">
          <FaWhatsapp className="w-5 h-5 sm:w-7 sm:h-7" />
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
          <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-20"></span>
        </div>
      </a>
    </div>
  );
};

export default FloatingWhatsAppButton;


