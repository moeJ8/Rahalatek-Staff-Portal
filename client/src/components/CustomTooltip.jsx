import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

const CustomTooltip = ({ children, title, content, detail, disabled = false }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = useCallback((e) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setIsVisible(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  const tooltipContent = (
    <div
      className="fixed bg-white/30 dark:bg-slate-950/30 text-gray-900 dark:text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap border border-gray-200 dark:border-gray-700 backdrop-blur-md"
      style={{
        left: Math.min(Math.max(tooltipPosition.x, 5), window.innerWidth - 200),
        top: tooltipPosition.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        fontSize: '11px',
        lineHeight: '1.2'
      }}
    >
      {title && <div className="font-medium">{title}</div>}
      {content && <div className="opacity-75">{content}</div>}
      {detail && <div className="opacity-60">{detail}</div>}
    </div>
  );

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {/* Render tooltip using portal */}
      {isVisible && typeof window !== 'undefined' && 
        ReactDOM.createPortal(tooltipContent, document.body)
      }
    </>
  );
};

export default CustomTooltip;
