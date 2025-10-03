import React from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import Flag from 'react-world-flags';
import ImageGallery from './ImageGallery';

const PublicPackageHero = ({ package: pkg }) => {
    // Country code mapping
    const getCountryCode = (country) => {
        const codes = {
            'Turkey': 'TR',
            'Malaysia': 'MY',
            'Thailand': 'TH',
            'Indonesia': 'ID',
            'Saudi Arabia': 'SA',
            'Morocco': 'MA',
            'Egypt': 'EG',
            'Azerbaijan': 'AZ',
            'Georgia': 'GE',
            'Albania': 'AL'
        };
        return codes[country] || null;
    };

    // Format duration
    const formatDuration = (duration) => {
        if (!duration) return 'Duration TBD';
        return `${duration} ${duration === 1 ? 'day' : 'days'}`;
    };

    // Build the image array for ImageGallery - sort with primary image first
    const packageImages = pkg.images?.sort((a, b) => {
        // Primary image comes first
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
    }).map(img => ({
        url: img.url,
        altText: img.altText || `${pkg.name} - Package image`
    })) || [];

    return (
        <div className="relative bg-white dark:bg-gray-900">
            {/* Image Gallery Section */}
            <div className="w-full h-96 sm:h-[500px] lg:h-[600px] relative">
                <ImageGallery
                    images={packageImages}
                    title={pkg.name}
                    className="h-full"
                />
                
                {/* Gradient Overlay - Click-through */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Package Content - Positioned directly over images */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 pointer-events-none">
                    <div className="max-w-7xl mx-auto">
                        <div className="space-y-4">
                            {/* Package Name */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                                {pkg.name}
                            </h1>

                            {/* Location and Duration */}
                            <div className="flex flex-wrap items-start sm:items-center gap-1.5 sm:gap-2 md:gap-3 max-w-[240px] lg:max-w-none">
                                {/* Countries */}
                                {pkg.countries?.map((country, index) => (
                                    <div key={index} className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3">
                                        <Flag 
                                            code={getCountryCode(country)} 
                                            className="w-3 h-2 sm:w-4 sm:h-3 md:w-6 md:h-4 flex-shrink-0"
                                            fallback={<span className="w-3 h-2 sm:w-4 sm:h-3 md:w-6 md:h-4 bg-gray-300 rounded"></span>}
                                        />
                                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-white">{country}</span>
                                    </div>
                                ))}
                                
                                {/* Cities grouped */}
                                {pkg.cities && pkg.cities.length > 0 && (
                                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 max-w-fit">
                                        <FaMapMarkerAlt className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white flex-shrink-0" />
                                        <div className="flex gap-0.5 sm:gap-1 overflow-hidden">
                                            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-white">
                                                {pkg.cities.slice(0, 2).join(', ')}
                                            </span>
                                            {pkg.cities.length > 2 && (
                                                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-white flex-shrink-0 ml-1">
                                                    +{pkg.cities.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Duration Badge */}
                                <div className="flex items-center gap-1 sm:gap-1.5 bg-teal-500/20 backdrop-blur-sm text-white rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3">
                                    <FaCalendarAlt className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                                    <span className="text-[10px] sm:text-xs md:text-sm font-medium">{formatDuration(pkg.duration)}</span>
                                </div>

                                {/* Price Badge */}
                                {pkg.pricing?.basePrice > 0 && (
                                    <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 backdrop-blur-sm text-white rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 shadow-lg">
                                        <span className="text-[10px] sm:text-xs md:text-sm font-bold">
                                            {pkg.pricing.basePrice.toLocaleString()} {pkg.pricing.currency || 'USD'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicPackageHero;