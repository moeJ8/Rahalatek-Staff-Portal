import React from 'react';

export default function UserBadge({ user, size = 'sm' }) {
  const getBadgeStyle = () => {
    if (user?.isAdmin) return {
      text: 'Admin',
      classes: 'bg-blue-800 text-white border border-blue-800 shadow-md'
    };
    if (user?.isAccountant) return {
      text: 'Accountant', 
      classes: 'bg-green-500 text-white border border-green-600 shadow-md'
    };
    if (user?.isContentManager) return {
      text: 'Manager', 
      classes: 'bg-yellow-500 text-white border border-yellow-600 shadow-md'
    };
    return {
      text: 'User',
      classes: 'bg-gray-500 text-white border border-gray-600 shadow-md'
    };
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-[10px] px-1.5 py-0.5 font-medium';
      case 'sm':
        return 'text-[11px] px-2 py-0.5 font-semibold';
      case 'md':
        return 'text-xs px-2.5 py-1 font-semibold';
      default:
        return 'text-[11px] px-2 py-0.5 font-semibold';
    }
  };

  const badge = getBadgeStyle();

  return (
    <span 
      className={`
        inline-flex items-center justify-center rounded-lg 
        ${badge.classes} 
        ${getSizeClasses()}
        transition-all duration-200 
        hover:scale-105 hover:shadow-lg
        w-16 min-w-16
      `}
    >
      {badge.text}
    </span>
  );
} 