import React from "react";

const RahalatekLoader = ({ size = "md", className = "" }) => {
  // Size variants
  const containerSizes = {
    sm: "w-32 h-32",
    md: "w-40 h-40",
    lg: "w-48 h-48",
    xl: "w-56 h-56",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const planeSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
    xl: "w-8 h-8",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`relative ${containerSizes[size]} flex items-center justify-center`}
      >
        {/* Animated Background Rings */}
        <div
          className="absolute inset-4 rounded-full border-2 border-blue-200 dark:border-blue-900/30 animate-ping"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute inset-6 rounded-full border-2 border-teal-200 dark:border-teal-900/30 animate-ping"
          style={{ animationDuration: "3s", animationDelay: "0.5s" }}
        ></div>

        {/* Gradient Glow Background */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 via-transparent to-teal-100 dark:from-blue-950/20 dark:via-transparent dark:to-teal-950/20 animate-pulse"
          style={{ animationDuration: "2s" }}
        ></div>

        {/* Central Rahalatek Text with Enhanced Styling */}
        <div
          className={`${textSizes[size]} font-bold text-center z-10 relative`}
        >
          <div
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 dark:from-blue-400 dark:via-blue-500 dark:to-teal-400 bg-clip-text text-transparent drop-shadow-sm animate-pulse"
            style={{ animationDuration: "2s" }}
          >
            رحلاتك
          </div>
          <div className="text-[0.6rem] sm:text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
            RAHALATEK
          </div>
        </div>

        {/* Outer Orbit - Airplane 1 */}
        <div
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "4s", animationTimingFunction: "linear" }}
        >
          {/* Solid orbital path */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-300 dark:border-blue-700 opacity-40"></div>

          {/* Airplane at top */}
          <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Airplane Icon */}
            <div
              className={`${planeSizes[size]} text-yellow-500 dark:text-yellow-400 transform rotate-90 drop-shadow-lg filter`}
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Decorative Dots */}
        <div
          className="absolute inset-6 animate-spin"
          style={{ animationDuration: "6s", animationTimingFunction: "linear" }}
        >
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-400 dark:bg-blue-500 rounded-full transform -translate-x-1/2 shadow-lg shadow-blue-500/50"></div>
          <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-teal-400 dark:bg-teal-500 rounded-full transform -translate-x-1/2 shadow-lg shadow-teal-500/50"></div>
          <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full transform -translate-y-1/2 shadow-lg shadow-yellow-500/50"></div>
          <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-blue-400 dark:bg-blue-500 rounded-full transform -translate-y-1/2 shadow-lg shadow-blue-500/50"></div>
        </div>

        {/* Center Glow Effect */}
        <div
          className="absolute inset-8 rounded-full bg-gradient-radial from-blue-400/20 via-transparent to-transparent dark:from-blue-500/10 blur-xl animate-pulse"
          style={{ animationDuration: "2s" }}
        ></div>
      </div>
    </div>
  );
};

export default RahalatekLoader;
