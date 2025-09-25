import React, { useEffect } from 'react';

const ModalScrollbar = ({ children, className = "", maxHeight = "55vh" }) => {
  useEffect(() => {
    // Inject the CSS styles once when component mounts
    const styleId = 'modal-scrollbar-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .modal-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .modal-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        
        .dark .modal-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        .dark .modal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #475569;
        }
        
        .dark .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #64748b;
        }
        
        /* Firefox */
        .modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .dark .modal-scrollbar {
          scrollbar-color: #475569 #1e293b;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div 
      className={`
        relative
        ${className}
      `}
      style={{ maxHeight, overflow: 'hidden' }}
    >
      <div 
        className="modal-scrollbar h-full overflow-y-auto pr-2 scroll-smooth"
        style={{
          maxHeight
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalScrollbar;
