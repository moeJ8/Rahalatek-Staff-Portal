import React from 'react';

const CustomButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'sm',
  className = '',
  title,
  icon: Icon,
  as: Component = 'button',
  loading = false,
  type = 'button',
  ...props 
}) => {
  const getVariantClasses = () => {
    const baseClasses = "flex items-center justify-center gap-1 font-medium rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeClasses = {
      xs: "px-2 py-1.5 text-xs",
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-3 text-base"
    };

    const variantClasses = {
      // Red variant - for delete actions
      red: "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300",
      
      // Blue variant - for admin actions
      blue: "text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-300",
      
      // Teal variant - for accountant actions
      teal: "text-teal-600 bg-teal-50 border border-teal-200 hover:bg-teal-100 hover:text-teal-700 dark:text-teal-400 dark:bg-teal-900/20 dark:border-teal-800 dark:hover:bg-teal-900/30 dark:hover:text-teal-300",
      
      // Green variant - for assign/approve actions
      green: "text-green-600 bg-green-50 border border-green-200 hover:bg-green-100 hover:text-green-700 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-300",
      
      // Orange variant - for warning/revoke actions
      orange: "text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:text-orange-700 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800 dark:hover:bg-orange-900/30 dark:hover:text-orange-300",
      
      // Amber variant - for verification actions
      amber: "text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:text-amber-700 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800 dark:hover:bg-amber-900/30 dark:hover:text-amber-300",
      
      // Purple variant - for special actions
      purple: "text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800 dark:hover:bg-purple-900/30 dark:hover:text-purple-300",
      
      // Indigo variant - for financial/premium actions
      indigo: "text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300",
      
      // Yellow variant - for warning/attention actions
      yellow: "text-yellow-600 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-300",
      
      // Gradient variants
      greenToBlue: "text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 border-0 shadow-md hover:shadow-lg",
      blueToTeal: "text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 border-0 shadow-md hover:shadow-lg",
      purpleToPink: "text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 shadow-md hover:shadow-lg",
      pinkToOrange: "text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 border-0 shadow-md hover:shadow-lg",
      
      // Gray variant - for neutral actions
      gray: "text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300",
      
      // Primary variant (default)
      primary: "text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  return (
    <Component
      onClick={onClick}
      disabled={disabled || loading}
      className={`${getVariantClasses()} ${className}`}
      title={title}
      type={Component === 'button' ? type : undefined}
      {...props}
    >
      {loading ? (
        <>
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-3 h-3" />}
          {children}
        </>
      )}
    </Component>
  );
};

export default CustomButton; 