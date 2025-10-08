import React from 'react';

// Custom scrollbar styles as a component
const CustomScrollbar = ({ children, className = '', maxHeight = "70vh", style = {}, variant = "default" }) => {
  const scrollbarStyles = variant === "glass" ? `
    .glass-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .glass-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .glass-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    .glass-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  ` : `
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

  const scrollbarClass = variant === "glass" ? "glass-scrollbar" : "custom-scrollbar";

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div
        className={`${scrollbarClass} ${className.includes('overflow-visible') ? 'overflow-visible' : 'overflow-auto'} ${className}`}
        style={{ maxHeight, ...style }}
      >
        {children}
      </div>
    </>
  );
};

export default CustomScrollbar; 