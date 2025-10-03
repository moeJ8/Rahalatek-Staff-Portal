import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaBed, FaUser, FaUtensils, FaUsers, FaCrown, FaStar } from 'react-icons/fa';
import Flag from 'react-world-flags';
import CustomButton from './CustomButton';
import CustomModal from './CustomModal';

const PackageCard = ({ 
  package: pkg, 
  user,
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const [showHotelsModal, setShowHotelsModal] = useState(false);
  const [showToursModal, setShowToursModal] = useState(false);
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

  const truncateDescription = (description, maxLength = 120) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };


  const formatDuration = (duration) => {
    if (!duration) return 'Duration TBD';
    return `${duration} ${duration === 1 ? 'day' : 'days'}`;
  };

  const getLocationDisplay = () => {
    if (!pkg.countries || pkg.countries.length === 0) return 'Multiple Destinations';
    
    if (pkg.countries.length === 1) {
      const country = pkg.countries[0];
      if (pkg.cities && pkg.cities.length > 0) {
        if (pkg.cities.length === 1) {
          return `${pkg.cities[0]}, ${country}`;
        } else if (pkg.cities.length <= 3) {
          return `${pkg.cities.join(', ')}, ${country}`;
        } else {
          return `${pkg.cities.slice(0, 2).join(', ')} +${pkg.cities.length - 2} more, ${country}`;
        }
      }
      return country;
    }
    
    // Multiple countries
    if (pkg.countries.length <= 2) {
      if (pkg.cities && pkg.cities.length > 0) {
        if (pkg.cities.length <= 3) {
          return `${pkg.cities.join(', ')} - ${pkg.countries.join(', ')}`;
        } else {
          return `${pkg.cities.slice(0, 2).join(', ')} +${pkg.cities.length - 2} more - ${pkg.countries.join(', ')}`;
        }
      }
      return pkg.countries.join(', ');
    }
    
    // More than 2 countries
    if (pkg.cities && pkg.cities.length > 0) {
      return `${pkg.cities.slice(0, 2).join(', ')} +${pkg.cities.length - 2} more - ${pkg.countries.length} countries`;
    }
    
    return `${pkg.countries.length} countries`;
  };

  const getAllFlags = () => {
    if (!pkg.countries || pkg.countries.length === 0) return [];
    return pkg.countries.map(country => getCountryCode(country)).filter(code => code !== null);
  };

  // Get primary image or first image
  const primaryImage = pkg.images?.find(img => img.isPrimary) || pkg.images?.[0];
  const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Package+Image';

  // Calculate nights from the primary (first) hotel only
  const getPrimaryHotelNights = () => {
    if (pkg.hotels && pkg.hotels.length > 0) {
      const primaryHotel = pkg.hotels[0];
      if (primaryHotel.checkIn && primaryHotel.checkOut) {
        const checkIn = new Date(primaryHotel.checkIn);
        const checkOut = new Date(primaryHotel.checkOut);
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      }
    }
    return 0;
  };

  const primaryHotelNights = getPrimaryHotelNights();

  // Get hotel details (if populated)
  const getHotelStars = () => {
    if (pkg.hotels && pkg.hotels.length > 0) {
      const hotelData = pkg.hotels[0].hotelId; // This should be populated
      if (hotelData && hotelData.stars) {
        return hotelData.stars;
      }
    }
    return null;
  };

  const renderStars = (count) => {
    return Array(count).fill(0).map((_, i) => (
      <FaStar key={i} className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
    ));
  };

  const hotelStars = getHotelStars();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group flex flex-col h-full w-full">
      {/* Package Image */}
      <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={pkg.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
            pkg.isActive 
              ? 'bg-green-500 text-white dark:bg-green-600' 
              : 'bg-red-500 text-white dark:bg-red-600'
          }`}>
            {pkg.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-1.5 py-0.5 z-10">
          <div className="flex items-center space-x-1 text-white">
            <FaCalendarAlt className="w-3 h-3" />
            <span className="text-xs font-medium">{formatDuration(pkg.duration)}</span>
          </div>
        </div>

      </div>
      
      {/* Package Details */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Package Name with Created By */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 flex-1 mr-2">
            {pkg.name}
          </h3>
          
          {/* Created By - Only show for admin users */}
          {user?.isAdmin && pkg.createdBy && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 flex-shrink-0">
              <span className="text-xs">
                Created by: <span className="font-medium">{pkg.createdBy.username || pkg.createdBy.email || 'Unknown'}</span>
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-start space-x-1 text-gray-600 dark:text-gray-400 mb-2">
          <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0 text-red-500 dark:text-red-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span 
              className="text-xs block truncate" 
              title={`Countries: ${pkg.countries?.join(', ') || 'N/A'} | Cities: ${pkg.cities?.join(', ') || 'N/A'}`}
            >
              {getLocationDisplay()}
            </span>
          </div>
          <div className="flex items-center space-x-1 ml-1 flex-shrink-0">
            {getAllFlags().slice(0, 2).map((flagCode, index) => (
              <Flag 
                key={index}
                code={flagCode} 
                height="12" 
                width="16"
                className="flex-shrink-0 rounded-sm"
                style={{ maxWidth: '16px', maxHeight: '12px' }}
                title={pkg.countries[index]}
              />
            ))}
            {getAllFlags().length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                +{getAllFlags().length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Package Contents */}
        {pkg.hotels && pkg.hotels.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center mb-1.5">
              <FaBed className="text-blue-500 dark:text-teal-400 w-3 h-3 mr-1" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Package Contents</span>
            </div>
            
            {/* Hotels & Tours Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHotelsModal(true);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-600 dark:text-teal-400 uppercase tracking-wide">
                    Hotels
                  </span>
                   {primaryHotelNights > 0 && (
                     <div className="flex items-center text-xs bg-blue-500 dark:bg-teal-500 text-white py-0.5 px-1.5 rounded-full shadow-sm">
                       <FaCalendarAlt className="mr-0.5" size={8} />
                       <span className="font-medium">{primaryHotelNights}</span>
                     </div>
                   )}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-700 dark:text-teal-300">
                    {pkg.hotels.length} hotel{pkg.hotels.length !== 1 ? 's' : ''}
                  </span>
                  {hotelStars && (
                    <div className="flex items-center">
                      {renderStars(hotelStars)}
                    </div>
                  )}
                </div>
                {/* Show hotel names if populated */}
                {pkg.hotels[0]?.hotelId?.name && (
                  <div className="text-xs text-blue-600 dark:text-teal-400 truncate font-medium">
                    {pkg.hotels[0].hotelId.name}
                    {pkg.hotels.length > 1 && ` +${pkg.hotels.length - 1}`}
                  </div>
                )}
              </div>

              <div 
                className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowToursModal(true);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-600 dark:text-teal-400 uppercase tracking-wide">
                    Tours
                  </span>
                  {pkg.tours && pkg.tours.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {pkg.tours.some(tour => tour.tourId?.tourType === 'VIP') && (
                        <FaCrown className="text-amber-500 w-3 h-3" />
                      )}
                      {pkg.tours.some(tour => tour.tourId?.tourType === 'Group') && (
                        <FaUsers className="text-blue-600 dark:text-teal-400 w-3 h-3" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-700 dark:text-teal-300">
                    {pkg.tours?.length || 0} tour{(pkg.tours?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* Show tour names if populated */}
                {pkg.tours && pkg.tours.length > 0 && pkg.tours[0]?.tourId?.name && (
                  <div className="text-xs text-blue-600 dark:text-teal-400 truncate font-medium">
                    {pkg.tours[0].tourId.name}
                    {pkg.tours.length > 1 && ` +${pkg.tours.length - 1}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Package Services */}
        <div className="space-y-1.5 mb-2 text-xs">
          {/* Target Audience */}
          {pkg.targetAudience && pkg.targetAudience.length > 0 && (
            <div className="flex items-center space-x-1">
              <FaUsers className="text-blue-500 dark:text-teal-400 w-3 h-3" />
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Target:</span> {Array.isArray(pkg.targetAudience) ? pkg.targetAudience.join(', ') : pkg.targetAudience}
              </span>
            </div>
          )}

          {/* Package Includes Preview */}
          {pkg.includes && pkg.includes.length > 0 && (
            <div className="flex items-start space-x-1">
              <FaUtensils className="text-blue-500 dark:text-teal-400 w-3 h-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Includes:</span> {pkg.includes.slice(0, 2).join(', ')}
                  {pkg.includes.length > 2 && ` +${pkg.includes.length - 2} more`}
                </span>
              </div>
            </div>
          )}

          {/* Transfers */}
          {pkg.transfers && pkg.transfers.length > 0 && (
            <div className="flex items-center space-x-1">
              <FaCarSide className="text-blue-500 dark:text-teal-400 w-3 h-3" />
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Transfers:</span> {pkg.transfers.length} transfer{pkg.transfers.length !== 1 ? 's' : ''} included
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {pkg.description && (
          <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed line-clamp-2 mb-2 flex-1">
            {truncateDescription(pkg.description)}
          </p>
        )}

        {/* Pricing */}
        <div>
          <div className="text-right">
            {pkg.pricing?.basePrice && Number(pkg.pricing.basePrice) > 0 ? (
              <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                ${pkg.pricing.basePrice}
              </span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Contact for pricing
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Always at bottom */}
      <div className="px-3 pb-3 mt-auto">
        <div className="space-y-1">
          <div className="flex gap-1">
            <CustomButton 
              as={Link}
              to={`/packages/${pkg.slug}`}
              variant="blue"
              size="sm"
              className="flex-1 text-xs"
              icon={FaEye}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </CustomButton>
          </div>
          
          <div className="flex gap-1 pt-1 border-t border-gray-200 dark:border-gray-700">
            <CustomButton 
              onClick={() => onEdit?.(pkg)}
              variant="purple"
              size="sm"
              className="flex-1 text-xs"
              icon={FaEdit}
            >
              Edit
            </CustomButton>
            <CustomButton
              onClick={() => onToggleStatus?.(pkg)}
              variant={pkg.isActive ? "red" : "green"}
              size="sm"
              icon={pkg.isActive ? FaToggleOff : FaToggleOn}
              className="flex-1 text-xs"
            >
              {pkg.isActive ? 'Deactivate' : 'Activate'}
            </CustomButton>
            <CustomButton
              onClick={() => onDelete?.(pkg)}
              variant="red"
              size="sm"
              icon={FaTrash}
              className="flex-1 text-xs"
            >
              Delete
            </CustomButton>
          </div>
        </div>
      </div>
      
      {/* Hotels Modal */}
      <CustomModal
        isOpen={showHotelsModal}
        onClose={() => setShowHotelsModal(false)}
        title="Package Hotels"
        subtitle={`${pkg.hotels.length} hotel${pkg.hotels.length !== 1 ? 's' : ''} included`}
        maxWidth="md:max-w-2xl"
      >
        <div className="space-y-3">
          {pkg.hotels.map((hotel, index) => (
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
          ))}
        </div>
      </CustomModal>

      {/* Tours Modal */}
      <CustomModal
        isOpen={showToursModal}
        onClose={() => setShowToursModal(false)}
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
                      {tour.tourId?.price && tour.tourId.price > 0 ? (
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            Capital: ${tour.tourId.price}
                            {tour.tourId.totalPrice && tour.tourId.totalPrice > 0 && (
                              <span className="ml-2 text-green-600 dark:text-green-400">
                                | Total: ${tour.tourId.totalPrice}
                              </span>
                            )}
                            <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                              {tour.tourId.tourType === 'Group' ? 'per person' : 'per car'}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            No price available
                          </span>
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
    </div>
  );
};

export default PackageCard;
