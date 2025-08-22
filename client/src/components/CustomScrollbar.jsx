import React from 'react';

// Custom scrollbar styles as a component
const CustomScrollbar = ({ children, className = '', maxHeight = "70vh" }) => {
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    /* Light mode scrollbar */
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    /* Dark mode scrollbar */
    .dark .custom-scrollbar::-webkit-scrollbar-track {
      background: #1e293b;
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 4px;
    }
    
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div
        className={`custom-scrollbar ${className.includes('overflow-visible') ? 'overflow-visible' : 'overflow-auto'} ${className}`}
        style={{ maxHeight }}
      >
        {children}
      </div>
    </>
  );
};

export default CustomScrollbar; 