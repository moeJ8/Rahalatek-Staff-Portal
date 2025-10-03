import React, { useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaChevronRight, FaBed, FaRoute, FaCrown, FaUsers, FaStar } from 'react-icons/fa';
import Flag from 'react-world-flags';
import CustomModal from '../CustomModal';

const PackageCard = ({ pkg, onClick }) => {
    const [showHotelsModal, setShowHotelsModal] = useState(false);
    const [showToursModal, setShowToursModal] = useState(false);
    const primaryImage = pkg.images?.find(img => img.isPrimary) || pkg.images?.[0];
    
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

    // Helper function to render stars
    const renderStars = (count) => {
        return Array(count).fill(0).map((_, i) => (
            <FaStar key={i} className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
        ));
    };

    return (
        <>
        <div 
            onClick={onClick}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-slate-700 h-full flex flex-col"
        >
            {/* Image Section - Takes most of the card */}
            <div className="relative h-60 sm:h-72 overflow-hidden">
                {primaryImage ? (
                    <>
                        <img 
                            src={primaryImage.url} 
                            alt={primaryImage.altText || pkg.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                        
                        {/* Duration badge on image - TOP LEFT */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
                            <FaCalendarAlt className="w-4 h-4" />
                            <span className="text-sm font-medium">{pkg.duration} days</span>
                        </div>

                        {/* Package Name - Inside image at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className={`text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-blue-400 dark:group-hover:text-yellow-400 transition-colors duration-300 ${
                                /[\u0600-\u06FF\u0750-\u077F]/.test(pkg.name) ? 'text-right' : 'text-left'
                            }`}>
                                {pkg.name}
                            </h3>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500 text-lg">No Image</span>
                    </div>
                )}
            </div>

            {/* Content Section - Compact */}
            <div className="p-4 flex-grow flex flex-col">

                {/* Countries and Cities */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {pkg.countries?.slice(0, 2).map((country, index) => (
                        <div key={index} className="flex items-center gap-1">
                            <Flag 
                                code={getCountryCode(country)} 
                                className="w-4 h-3 flex-shrink-0"
                                fallback={<span className="w-4 h-3 bg-gray-300 rounded"></span>}
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{country}</span>
                        </div>
                    ))}
                    {pkg.countries?.length > 2 && (
                        <span className="text-xs text-gray-600 dark:text-gray-400">+{pkg.countries.length - 2}</span>
                    )}
                    {pkg.cities && pkg.cities.length > 0 && (
                        <>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                    {pkg.cities.slice(0, 2).join(', ')}
                                    {pkg.cities.length > 2 && ` +${pkg.cities.length - 2}`}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Description */}
                {pkg.description && (
                    <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 flex-grow ${
                        /[\u0600-\u06FF\u0750-\u077F]/.test(pkg.description) ? 'text-right' : 'text-left'
                    }`}>
                        {pkg.description}
                    </p>
                )}

                {/* Target Audience */}
                {pkg.targetAudience && pkg.targetAudience.length > 0 && (
                    <div className="flex items-center space-x-1 mb-2 text-xs">
                        <FaUsers className="text-blue-500 dark:text-yellow-400 w-3 h-3" />
                        <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Target:</span> {Array.isArray(pkg.targetAudience) ? pkg.targetAudience.join(', ') : pkg.targetAudience}
                        </span>
                    </div>
                )}

                {/* Hotels & Tours Mini Cards */}
                {((pkg.hotels && pkg.hotels.length > 0) || (pkg.tours && pkg.tours.length > 0)) && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {/* Hotels Mini Card */}
                        {pkg.hotels && pkg.hotels.length > 0 && (
                            <div 
                                className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 group/hotel"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowHotelsModal(true);
                                }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover/hotel:text-blue-600 dark:group-hover/hotel:text-yellow-500 uppercase tracking-wide transition-colors duration-200">
                                        Hotels
                                    </span>
                                    {(() => {
                                        // Calculate nights from the primary (first) hotel
                                        const primaryHotel = pkg.hotels[0];
                                        if (primaryHotel.checkIn && primaryHotel.checkOut) {
                                            const checkIn = new Date(primaryHotel.checkIn);
                                            const checkOut = new Date(primaryHotel.checkOut);
                                            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                                            if (nights > 0) {
                                                return (
                                                    <div className="flex items-center text-xs bg-gray-600 dark:bg-gray-600 text-white py-0.5 px-1.5 rounded-full shadow-sm">
                                                        <FaCalendarAlt className="mr-0.5" size={8} />
                                                        <span className="font-medium">{nights}</span>
                                                    </div>
                                                );
                                            }
                                        }
                                        return null;
                                    })()}
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {pkg.hotels.length} hotel{pkg.hotels.length !== 1 ? 's' : ''}
                                    </span>
                                    {pkg.hotels[0]?.hotelId?.stars && (
                                        <div className="flex items-center">
                                            {renderStars(pkg.hotels[0].hotelId.stars)}
                                        </div>
                                    )}
                                </div>
                                {pkg.hotels[0]?.hotelId?.name && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">
                                        {pkg.hotels[0].hotelId.name}
                                        {pkg.hotels.length > 1 && ` +${pkg.hotels.length - 1}`}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tours Mini Card */}
                        {pkg.tours && pkg.tours.length > 0 && (
                            <div 
                                className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 group/tour"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowToursModal(true);
                                }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover/tour:text-blue-600 dark:group-hover/tour:text-yellow-500 uppercase tracking-wide transition-colors duration-200">
                                        Tours
                                    </span>
                                    {pkg.tours && pkg.tours.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                            {pkg.tours.some(tour => tour.tourId?.tourType === 'VIP') && (
                                                <FaCrown className="text-amber-500 w-3 h-3" />
                                            )}
                                            {pkg.tours.some(tour => tour.tourId?.tourType === 'Group') && (
                                                <FaUsers className="text-gray-600 dark:text-gray-400 w-3 h-3" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {pkg.tours.length} tour{pkg.tours.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {pkg.tours && pkg.tours.length > 0 && pkg.tours[0]?.tourId?.name && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">
                                        {pkg.tours[0].tourId.name}
                                        {pkg.tours.length > 1 && ` +${pkg.tours.length - 1}`}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="mt-auto">
                    {pkg.pricing?.basePrice > 0 && (
                        <div className="text-right text-green-600 dark:text-green-500">
                            <span className="text-xl font-bold">
                                ${pkg.pricing.basePrice.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Hotels Modal */}
        <CustomModal
                isOpen={showHotelsModal}
                onClose={(e) => {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    setShowHotelsModal(false);
                }}
                title="Package Hotels"
                subtitle={`${pkg.hotels?.length || 0} hotel${(pkg.hotels?.length || 0) !== 1 ? 's' : ''} included`}
                maxWidth="md:max-w-2xl"
            >
                <div className="space-y-3">
                    {pkg.hotels && pkg.hotels.length > 0 ? (
                        pkg.hotels.map((hotel, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                            {hotel.hotelId?.name || `Hotel ${index + 1}`}
                                        </h4>
                                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                                                <span>{hotel.hotelId?.city || 'City not specified'}</span>
                                                {hotel.hotelId?.country && getCountryCode(hotel.hotelId.country) && (
                                                    <Flag 
                                                        code={getCountryCode(hotel.hotelId.country)} 
                                                        height="16" 
                                                        width="20"
                                                        className="rounded-sm"
                                                    />
                                                )}
                                            </div>
                                            {hotel.hotelId?.stars && (
                                                <div className="flex items-center gap-2">
                                                    <FaStar className="w-4 h-4 text-yellow-500" />
                                                    <span>{hotel.hotelId.stars} star hotel</span>
                                                    <div className="flex">
                                                        {renderStars(hotel.hotelId.stars)}
                                                    </div>
                                                </div>
                                            )}
                                            {hotel.checkIn && hotel.checkOut && (
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="w-4 h-4 text-blue-600 dark:text-teal-400" />
                                                    <span>
                                                        {new Date(hotel.checkIn).toLocaleDateString('en-GB')} - {new Date(hotel.checkOut).toLocaleDateString('en-GB')}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xs font-bold ${hotel.includeBreakfast ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {hotel.includeBreakfast ? '✓' : '✗'}
                                                    </span>
                                                    <span className="text-xs">Breakfast</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xs font-bold ${hotel.includeReception ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {hotel.includeReception ? '✓' : '✗'}
                                                    </span>
                                                    <span className="text-xs">Airport Reception</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xs font-bold ${hotel.includeFarewell ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {hotel.includeFarewell ? '✓' : '✗'}
                                                    </span>
                                                    <span className="text-xs">Airport Farewell</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <FaBed className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No hotels assigned to this package</p>
                        </div>
                    )}
                </div>
            </CustomModal>

            {/* Tours Modal */}
            <CustomModal
                isOpen={showToursModal}
                onClose={(e) => {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    setShowToursModal(false);
                }}
                title="Package Tours"
                subtitle={`${pkg.tours?.length || 0} tour${(pkg.tours?.length || 0) !== 1 ? 's' : ''} included`}
                maxWidth="md:max-w-2xl"
            >
                <div className="space-y-3">
                    {pkg.tours && pkg.tours.length > 0 ? (
                        pkg.tours.map((tour, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {tour.tourId?.name || `Tour ${index + 1}`}
                                            </h4>
                                            {tour.tourId?.tourType === 'VIP' ? (
                                                <FaCrown className="text-amber-500 w-4 h-4" />
                                            ) : (
                                                <FaUsers className="text-blue-600 dark:text-teal-400 w-4 h-4" />
                                            )}
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                tour.tourId?.tourType === 'VIP' 
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-teal-900 dark:text-teal-200'
                                            }`}>
                                                {tour.tourId?.tourType || 'Tour'}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                                                <span>{tour.tourId?.city || 'City not specified'}</span>
                                                {tour.tourId?.country && getCountryCode(tour.tourId.country) && (
                                                    <Flag 
                                                        code={getCountryCode(tour.tourId.country)} 
                                                        height="16" 
                                                        width="20"
                                                        className="rounded-sm"
                                                    />
                                                )}
                                            </div>
                                            {tour.tourId?.duration && (
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="w-4 h-4 text-blue-500" />
                                                    <span>{tour.tourId.duration} hours</span>
                                                </div>
                                            )}
                                            {tour.day && (
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="w-4 h-4 text-blue-600 dark:text-teal-400" />
                                                    <span>Day {tour.day} of package</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <FaUsers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No tours assigned to this package</p>
                        </div>
                    )}
                </div>
            </CustomModal>
        </>
    );
};

export default PackageCard;
