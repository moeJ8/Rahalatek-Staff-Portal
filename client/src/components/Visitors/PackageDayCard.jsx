import React from 'react';
import PackageImagesCarousel from '../PackageImagesCarousel';

const PackageDayCard = ({ day, tourData, onCardClick }) => {
    // Don't show tour images for arrival days
    const shouldShowImages = tourData && !day.isArrivalDay;
    const tourImages = shouldShowImages ? (tourData?.images?.map(img => ({
        url: img.url,
        altText: img.altText || `${tourData.name} - Tour image`
    })) || []) : [];

    return (
        <div 
            className={`relative bg-white/30 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${
                tourData && !day.isArrivalDay ? 'cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => tourData && !day.isArrivalDay && onCardClick(tourData.slug)}
        >
            {/* Day number badge - TOP LEFT CORNER */}
            <div className="absolute top-0 left-0 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 rounded-tl-xl rounded-br-xl px-4 py-2.5 z-10">
                <div className="text-center">
                    <div className="text-xl font-bold text-white">{day.day}</div>
                    <div className="text-xs text-white/90 font-medium">Days</div>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row">
                {/* Left side - content */}
                <div className={`flex-1 p-6 ${(tourData && !day.isArrivalDay) ? 'pt-6' : 'pt-16'}`}>
                    {/* Title first */}
                    <h3 className={`text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 ${
                        tourData && !day.isArrivalDay ? 'group-hover:text-blue-600 dark:group-hover:text-yellow-400' : ''
                    } ${
                        /[\u0600-\u06FF\u0750-\u077F]/.test(day.title) 
                            ? 'text-right' 
                            : (tourData && !day.isArrivalDay) ? 'text-left ml-12' : 'text-left'
                    }`}>
                        {day.title.replace(/^Day\s*\d+\s*-?\s*/i, '').trim()}
                    </h3>
                    
                    {/* Location and duration below title */}
                    {tourData && !day.isArrivalDay && (
                        <div className={`flex items-center gap-2 text-sm text-blue-600 dark:text-yellow-400 font-semibold mb-4 ${
                            /[\u0600-\u06FF\u0750-\u077F]/.test(day.title) ? 'justify-end' : 'justify-start ml-12'
                        }`}>
                            <span>📍 {tourData.city}</span>
                            {tourData.duration && (
                                <>
                                    <span>•</span>
                                    <span>⏱️ {tourData.duration}h</span>
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* Description */}
                    {day.description && (
                        <p className={`text-gray-700 dark:text-gray-300 text-sm font-semibold leading-relaxed mb-4 ${
                            /[\u0600-\u06FF\u0750-\u077F]/.test(day.description) ? 'text-right' : 'text-left'
                        }`}>
                            {day.description}
                        </p>
                    )}
                    
                    {/* Tour detailed description */}
                    {tourData?.detailedDescription && !day.isArrivalDay && (
                        <p className={`text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 ${
                            /[\u0600-\u06FF\u0750-\u077F]/.test(tourData.detailedDescription) ? 'text-right' : 'text-left'
                        }`}>
                            {tourData.detailedDescription}
                        </p>
                    )}
                    
                    {/* Activities */}
                    {day.activities && day.activities.length > 0 && (
                        <div className="mb-4">
                            <ul className="space-y-2">
                                {day.activities.slice(0, 4).map((activity, actIndex) => (
                                    <li key={actIndex} className={`flex items-start text-sm text-gray-700 dark:text-gray-300 ${
                                        /[\u0600-\u06FF\u0750-\u077F]/.test(activity) ? 'flex-row-reverse text-right' : 'text-left'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 bg-blue-500 dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0 ${
                                            /[\u0600-\u06FF\u0750-\u077F]/.test(activity) ? 'ml-3' : 'mr-3'
                                        }`}></span>
                                        {activity}
                                    </li>
                                ))}
                            </ul>
                            {day.activities.length > 4 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                    +{day.activities.length - 4} more activities
                                </p>
                            )}
                        </div>
                    )}
                    
                    {/* Meals */}
                    {(day.meals.breakfast || day.meals.lunch || day.meals.dinner) && (
                        <div className="flex flex-wrap gap-2">
                            {day.meals.breakfast && (
                                <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-400 dark:to-yellow-500 text-white font-semibold rounded-full shadow-sm">
                                    ✓ Breakfast
                                </span>
                            )}
                            {day.meals.lunch && (
                                <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-400 dark:to-yellow-500 text-white font-semibold rounded-full shadow-sm">
                                    ✓ Lunch
                                </span>
                            )}
                            {day.meals.dinner && (
                                <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-400 dark:to-yellow-500 text-white font-semibold rounded-full shadow-sm">
                                    ✓ Dinner
                                </span>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Right side - Tour images */}
                {tourImages.length > 0 && (
                    <div 
                        className="lg:w-96 flex-shrink-0 lg:self-stretch flex items-stretch" 
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        onMouseMove={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        <PackageImagesCarousel
                            images={tourImages}
                            title={tourData.name}
                            className="h-64 lg:h-full w-full rounded-none lg:rounded-r-xl overflow-hidden"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageDayCard;

