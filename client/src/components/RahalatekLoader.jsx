import React from 'react';

const RahalatekLoader = ({ size = 'md', className = '' }) => {
  // Size variants
  const containerSizes = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-48 h-48',
    xl: 'w-56 h-56'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const planeSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${containerSizes[size]} flex items-center justify-center`}>
        
        {/* Central Rahalatek Text */}
        <div className={`${textSizes[size]} font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent text-center z-10`}>
          رحلاتك
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">RAHALATEK</div>
        </div>

        {/* Rotating Airplane with Trail */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationTimingFunction: 'linear' }}>
          {/* Blue Trail/Path */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400 opacity-50"></div>
          
          {/* Airplane positioned at top, will rotate around */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            {/* Blue Trail behind plane */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-1 bg-gradient-to-l from-blue-500 to-transparent rounded-full opacity-70 transform rotate-90"></div>
              <div className="w-6 h-1 bg-gradient-to-l from-blue-400 to-transparent rounded-full opacity-50 transform rotate-90 mt-1"></div>
            </div>
            
            {/* Yellow Airplane */}
            <div className={`${planeSizes[size]} text-yellow-400 transform rotate-90 relative z-20 drop-shadow-sm`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Additional blue glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/10 to-teal-500/10 animate-pulse"></div>
      </div>
    </div>
  );
};

export default RahalatekLoader; 