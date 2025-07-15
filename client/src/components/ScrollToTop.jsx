import { useState, useEffect } from 'react';
import { HiArrowUp } from 'react-icons/hi';

function ScrollToTop({ position = 'right', className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Position classes based on prop
  const getPositionClasses = () => {
    if (position === 'left') {
      return 'bottom-5 left-5'; // Left side positioning
    }
    return 'bottom-5 right-5'; // Default right side positioning
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`fixed ${getPositionClasses()} z-50 p-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-110 ${className}`}
          aria-label="Scroll to top"
        >
          <HiArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
}

export default ScrollToTop; 