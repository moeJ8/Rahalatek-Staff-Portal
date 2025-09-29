import React from 'react';

// Horizontal custom scrollbar component for horizontal scrolling sections
const HorizontalScrollbar = ({ children, className = '' }) => {
  const scrollbarStyles = `
    .horizontal-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    /* Light mode horizontal scrollbar */
    .horizontal-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    
    .horizontal-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    
    .horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    /* Dark mode horizontal scrollbar */
    .dark .horizontal-scrollbar::-webkit-scrollbar-track {
      background: #1e293b;
      border-radius: 4px;
    }
    
    .dark .horizontal-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 4px;
    }
    
    .dark .horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    /* Firefox scrollbar styling */
    .horizontal-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }

    .dark .horizontal-scrollbar {
      scrollbar-color: #475569 #1e293b;
    }

    /* Smooth scrolling */
    .horizontal-scrollbar {
      scroll-behavior: smooth;
    }
  `;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div
        className={`horizontal-scrollbar overflow-x-auto ${className}`}
      >
        {children}
      </div>
    </>
  );
};

export default HorizontalScrollbar;
