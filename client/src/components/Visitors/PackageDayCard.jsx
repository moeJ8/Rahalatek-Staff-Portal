import React from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslatedText, getTranslatedArray } from '../../utils/translationUtils';
import PackageImagesCarousel from '../PackageImagesCarousel';
import CustomTooltip from '../CustomTooltip';

const PackageDayCard = ({ day, tourData, onCardClick }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    
    // Translate tour data if it exists
    const translatedTourName = tourData ? getTranslatedText(tourData, 'name', i18n.language) : '';
    const translatedTourDescription = tourData ? getTranslatedText(tourData, 'description', i18n.language) : '';
    const translatedDetailedDescription = tourData ? getTranslatedText(tourData, 'detailedDescription', i18n.language) : '';
    const translatedHighlights = tourData ? getTranslatedArray(tourData, 'highlights', i18n.language) : [];
    
    // Determine which images to show
    const isStaticDay = day.isArrivalDay || day.isDepartureDay || day.isRestDay;
    let tourImages = [];
    
    if (tourData && !isStaticDay) {
        // Tour day: show tour images
        tourImages = tourData?.images?.map(img => ({
            url: img.url,
            altText: img.altText || `${translatedTourName} - Tour image`
        })) || [];
    } else if (isStaticDay && day.images && day.images.length > 0) {
        // Static day: show predefined images
        tourImages = day.images.map(img => ({
            url: img.url,
            altText: img.altText || day.title
        }));
    }

    // Helper function to translate arrival day content
    const translateArrivalContent = (text) => {
        if (!text) return text;
        
        // Check if this is arrival day content and translate it
        if (text.includes('Arrival & Transfer')) {
            return text.replace('Arrival & Transfer', t('publicPackagePage.dayCard.arrivalTransfer'));
        }
        if (text.includes('Arrival at airport, meet & greet service, transfer to hotel, check-in and rest.')) {
            return t('publicPackagePage.dayCard.arrivalDescription');
        }
        if (text.includes('Airport reception service')) {
            return text.replace('Airport reception service', t('publicPackagePage.dayCard.airportReceptionService'));
        }
        if (text.includes('Meet & greet with tour representative')) {
            return text.replace('Meet & greet with tour representative', t('publicPackagePage.dayCard.meetGreetRepresentative'));
        }
        if (text.includes('Transfer to hotel')) {
            return text.replace('Transfer to hotel', t('publicPackagePage.dayCard.transferToHotel'));
        }
        if (text.includes('Hotel check-in assistance')) {
            return text.replace('Hotel check-in assistance', t('publicPackagePage.dayCard.hotelCheckinAssistance'));
        }
        if (text.includes('Welcome briefing')) {
            return text.replace('Welcome briefing', t('publicPackagePage.dayCard.welcomeBriefing'));
        }
        if (text.includes('Rest and prepare for upcoming tours')) {
            return text.replace('Rest and prepare for upcoming tours', t('publicPackagePage.dayCard.restPrepare'));
        }
        
        return text;
    };


    return (
        <div 
            className={`relative bg-white/30 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${
                tourData && !isStaticDay ? 'cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => tourData && !isStaticDay && onCardClick(tourData.slug)}
        >
            {/* Day number badge - TOP LEFT CORNER */}
            <div className="absolute top-0 left-0 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 rounded-tl-xl rounded-br-xl px-4 py-2.5 z-10">
                <div className="text-center">
                    <div className="text-md text-white/90 font-bold">
                        {i18n.language === 'ar' ? 'اليوم' : i18n.language === 'fr' ? 'Jour' : 'Day'}
                    </div>
                    {day.day && <div className="text-xl font-bold text-white">{day.day}</div>}
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row">
                {/* Left side - content */}
                <div className={`flex-1 p-6 ${tourImages.length > 0 ? 'pt-6' : 'pt-16'}`}>
                    {/* Title first */}
                    <h3 className={`text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 ${
                        tourData && !isStaticDay ? 'group-hover:text-blue-600 dark:group-hover:text-yellow-400' : ''
                    } ${
                        isRTL || /[\u0600-\u06FF\u0750-\u077F]/.test(tourData && !isStaticDay ? translatedTourName : day.title) 
                            ? 'text-right' 
                            : tourImages.length > 0 ? 'text-left ml-12' : 'text-left'
                    }`}>
                        {tourData && !isStaticDay 
                            ? translatedTourName 
                            : isStaticDay
                                ? (day.title || '').replace(/^Day\s*\d+\s*:?\s*/i, '').trim()
                                : translateArrivalContent((day.title || '').replace(/^Day\s*\d+\s*:?\s*/i, '').trim())
                        }
                    </h3>
                    
                    {/* Location and duration below title */}
                    {tourData && !isStaticDay && (
                        <div className={`flex items-center gap-2 text-sm text-blue-600 dark:text-yellow-400 font-semibold mb-4 ${
                            isRTL || /[\u0600-\u06FF\u0750-\u077F]/.test(translatedTourName) ? 'justify-end' : 'justify-start ml-12'
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
                    
                    {/* Description - Show tour description if available, otherwise day description */}
                    {((tourData && !isStaticDay && translatedTourDescription) || day.description) && (() => {
                        const descText = tourData && !isStaticDay && translatedTourDescription 
                            ? translatedTourDescription 
                            : isStaticDay
                                ? day.description
                                : translateArrivalContent(day.description);
                        const hasArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(descText || '');
                        const shouldBeRTL = isRTL || hasArabic;
                        
                        return (
                            <p 
                                className={`text-gray-700 dark:text-gray-300 text-sm font-semibold leading-relaxed mb-1 ${
                                    isStaticDay ? 'mt-5' : ''
                                } ${
                                    shouldBeRTL ? 'text-right' : 'text-left'
                                }`}
                                dir={shouldBeRTL ? 'rtl' : 'ltr'}
                            >
                                {descText}
                            </p>
                        );
                    })()}
                    
                    {/* Tour detailed description */}
                    {translatedDetailedDescription && !isStaticDay && (
                        <p className={`text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2 line-clamp-1 ${
                            /[\u0600-\u06FF\u0750-\u077F]/.test(translatedDetailedDescription) ? 'text-right' : 'text-left'
                        }`}>
                            {translatedDetailedDescription}
                        </p>
                    )}
                    
                    {/* Activities */}
                    {day.activities && day.activities.length > 0 && (
                        <div className="mb-4">
                            <ul className="space-y-2">
                                {(isStaticDay ? day.activities : day.activities.slice(0, 4)).map((activity, actIndex) => {
                                    // Try to match activity with tour highlights and translate
                                    let translatedActivity = activity;
                                    if (tourData && tourData.highlights && translatedHighlights.length > 0) {
                                        const index = tourData.highlights.findIndex(h => h === activity);
                                        if (index >= 0 && translatedHighlights[index]) {
                                            translatedActivity = translatedHighlights[index];
                                        }
                                    } else if (isStaticDay) {
                                        // For static days, use the activity as-is (already translated by backend)
                                        translatedActivity = activity;
                                    } else {
                                        // For other days, use i18n translation
                                        translatedActivity = translateArrivalContent(activity);
                                    }
                                    
                                    return (
                                        <li key={actIndex} className={`flex items-start text-sm text-gray-700 dark:text-gray-300 ${
                                            isRTL || /[\u0600-\u06FF\u0750-\u077F]/.test(translatedActivity) 
                                                ? 'flex-row-reverse text-right' 
                                                : 'text-left'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 bg-blue-500 dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0 ${
                                                isRTL || /[\u0600-\u06FF\u0750-\u077F]/.test(translatedActivity) 
                                                    ? 'ml-3' 
                                                    : 'mr-3'
                                            }`}></span>
                                            {translatedActivity}
                                        </li>
                                    );
                                })}
                            </ul>
                            {!isStaticDay && day.activities.length > 4 && (() => {
                                const remainingActivities = day.activities.slice(4);
                                const translatedRemainingActivities = remainingActivities.map(activity => {
                                    if (tourData && tourData.highlights && translatedHighlights.length > 0) {
                                        const index = tourData.highlights.findIndex(h => h === activity);
                                        if (index >= 0 && translatedHighlights[index]) {
                                            return translatedHighlights[index];
                                        }
                                    }
                                    return activity;
                                });
                                
                                return (
                                    <CustomTooltip
                                        content={
                                            <div className="max-w-sm">
                                                <ul className="space-y-2">
                                                    {translatedRemainingActivities.map((activity, idx) => {
                                                        const hasArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(activity);
                                                        return (
                                                            <li key={idx} className={`flex items-center text-xs ${
                                                                isRTL || hasArabic ? 'flex-row-reverse text-right' : 'text-left'
                                                            }`}>
                                                                <span className={`w-1.5 h-1.5 bg-blue-500 dark:bg-yellow-400 rounded-full flex-shrink-0 ${
                                                                    isRTL || hasArabic ? 'ml-2' : 'mr-2'
                                                                }`}></span>
                                                                <span className="break-words">{activity}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        }
                                    >
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic cursor-help hover:text-blue-600 dark:hover:text-yellow-400 transition-colors">
                                            +{day.activities.length - 4} more activities
                                        </p>
                                    </CustomTooltip>
                                );
                            })()}
                        </div>
                    )}
                    
                    {/* Meals */}
                    {day.meals && (day.meals.breakfast || day.meals.lunch || day.meals.dinner) && (
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
                            title={translatedTourName}
                            className="h-64 lg:h-full w-full rounded-none lg:rounded-r-xl overflow-hidden"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageDayCard;

