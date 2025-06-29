import React from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'await':
        return {
          icon: <FaClock className="w-3 h-3" />,
          text: 'Awaiting',
          classes: 'bg-amber-500 text-white border border-amber-600 shadow-md dark:bg-amber-600 dark:border-amber-700'
        };
      case 'arrived':
        return {
          icon: <FaCheckCircle className="w-3 h-3" />,
          text: 'Arrived',
          classes: 'bg-green-500 text-white border border-green-600 shadow-md dark:bg-green-600 dark:border-green-700'
        };
      case 'canceled':
        return {
          icon: <FaTimesCircle className="w-3 h-3" />,
          text: 'Canceled',
          classes: 'bg-red-500 text-white border border-red-600 shadow-md dark:bg-red-600 dark:border-red-700'
        };
      default:
        return {
          icon: <FaClock className="w-3 h-3" />,
          text: 'Unknown',
          classes: 'bg-gray-500 text-white border border-gray-600 shadow-md dark:bg-gray-600 dark:border-gray-700'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-[10px] px-1.5 py-0.5 font-medium gap-1';
      case 'sm':
        return 'text-[11px] px-2 py-0.5 font-semibold gap-1';
      case 'md':
        return 'text-xs px-2.5 py-1 font-semibold gap-1.5';
      default:
        return 'text-[11px] px-2 py-0.5 font-semibold gap-1';
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-lg 
        ${config.classes} 
        ${getSizeClasses()}
        transition-all duration-200 
        hover:scale-105 hover:shadow-lg
        w-20 min-w-20
        ${className}
      `}
    >
      {config.icon}
      {config.text}
    </span>
  );
};

export default StatusBadge; 