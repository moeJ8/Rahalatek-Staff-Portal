import React, { useState } from 'react';
import { Card, Label } from 'flowbite-react';
import { FaStar, FaMapMarkerAlt, FaBed, FaUtensils, FaPlane, FaChild, FaCarSide, FaCalendarAlt, FaTimes, FaEdit } from 'react-icons/fa';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Flag from 'react-world-flags';
import { getRoomPriceForMonth, getMonthName } from '../utils/pricingUtils';
import CustomButton from './CustomButton';
import CustomCheckbox from './CustomCheckbox';
import CustomDatePicker from './CustomDatePicker';
import Select from './Select';
import TextInput from './TextInput';

export default function PackageHotelCard({ 
    hotel, 
    hotelData, 
    index, 
    airports = [], 
    onRemove, 
    onChange 
}) {
    // Start in editing mode if hotel doesn't have check-in/check-out dates
    const [isEditing, setIsEditing] = useState(!hotel.checkIn || !hotel.checkOut);
    const [expandedRoomTypes, setExpandedRoomTypes] = useState(false);

    // Helper functions
    const renderStars = (count) => {
        return Array(count).fill(0).map((_, i) => (
            <FaStar key={i} className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
        ));
    };

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

    const truncateDescription = (description) => {
        if (!description) return '';
        if (description.length <= 120) return description;
        return description.substring(0, 120).trim() + '...';
    };

    const toggleRoomTypes = () => {
        setExpandedRoomTypes(!expandedRoomTypes);
    };

    // Get primary image or first image
    const primaryImage = hotelData?.images?.find(img => img.isPrimary) || hotelData?.images?.[0];
    const imageUrl = primaryImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Hotel+Image';

    // Calculate nights
    const nights = hotel.checkIn && hotel.checkOut ? 
        Math.ceil((new Date(hotel.checkOut) - new Date(hotel.checkIn)) / (1000 * 60 * 60 * 24)) : 0;

    // Calculate estimated price
    const getEstimatedPrice = () => {
        if (!hotelData || !hotel.checkIn || !hotel.checkOut) return 0;
        
        let price = 0;
        if (hotelData.roomTypes && hotelData.roomTypes.length > 0) {
            const currentDate = new Date(hotel.checkIn);
            const roomPrice = getRoomPriceForMonth(hotelData.roomTypes[0], currentDate, false);
            price = roomPrice * nights;
        }
        
        return price;
    };

    const estimatedPrice = getEstimatedPrice();

    return (
        <Card className="dark:bg-slate-900 mb-4">
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium dark:text-white text-base md:text-lg">Hotel #{index + 1}</h4>
                <div className="flex gap-1 sm:gap-2">
                    <CustomButton
                        onClick={() => setIsEditing(!isEditing)}
                        variant="blue"
                        size="xs"
                        icon={FaEdit}
                    >
                        {isEditing ? 'Done' : 'Edit'}
                    </CustomButton>
                    <CustomButton
                        onClick={onRemove}
                        variant="red"
                        size="xs"
                        icon={FaTimes}
                    >
                        Remove
                    </CustomButton>
                </div>
            </div>

            <div className={`flex flex-col gap-4 ${isEditing ? 'md:flex-row' : 'items-center'}`}>
                {/* Hotel Card Display */}
                <div className={isEditing ? 'md:w-2/3 w-full' : 'w-full max-w-2xl mx-auto'}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Hotel Image */}
                        <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                            <img
                                src={imageUrl}
                                alt={hotelData?.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                                <div className="flex items-center space-x-1">
                                    {renderStars(hotelData?.stars || 0)}
                                </div>
                            </div>
                        </div>
                        
                        {/* Hotel Details */}
                        <div className="p-3 md:p-4">
                            {/* Hotel Name */}
                            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {hotelData?.name}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                                <span className="text-sm">
                                    {hotelData?.city}{hotelData?.country ? `, ${hotelData.country}` : ''}
                                </span>
                                {hotelData?.country && getCountryCode(hotelData.country) && (
                                    <Flag 
                                        code={getCountryCode(hotelData.country)} 
                                        height="16" 
                                        width="20"
                                        className="rounded-sm"
                                    />
                                )}
                            </div>

                            {/* Room Types & Pricing */}
                            {hotelData?.roomTypes && hotelData.roomTypes.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <FaBed className="text-blue-500 dark:text-teal-400 w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Room Types:</span>
                                        </div>
                                        <div className="flex items-center text-xs bg-blue-500 dark:bg-teal-500 text-white py-1 px-2 rounded-full">
                                            <FaCalendarAlt className="mr-1" size={8} />
                                            <span className="text-xs">{getMonthName(new Date())?.charAt(0).toUpperCase() + getMonthName(new Date())?.slice(1)} pricing</span>
                                        </div>
                                    </div>
                                    
                                    {/* Show first 2 room types */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {hotelData.roomTypes.slice(0, 2).map((roomType, index) => {
                                            const currentDate = new Date();
                                            const currentMonthPrice = getRoomPriceForMonth(roomType, currentDate, false);
                                            const currentMonthChildPrice = getRoomPriceForMonth(roomType, currentDate, true);
                                            const displayPrice = currentMonthPrice > 0 ? currentMonthPrice : roomType.pricePerNight;
                                            const displayChildPrice = currentMonthChildPrice > 0 ? currentMonthChildPrice : roomType.childrenPricePerNight;
                                            
                                            return (
                                                <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                                                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
                                                        {roomType.type.replace(" ROOM", "").replace(" SUITE", "")}
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="text-green-600 dark:text-green-400 font-semibold">
                                                            ${displayPrice}/night
                                                        </span>
                                                        {displayChildPrice > 0 && (
                                                            <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1">
                                                                <FaChild className="mr-1" size={8} />
                                                                <span className="font-medium">${displayChildPrice} child</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Collapsible additional room types */}
                                    {hotelData.roomTypes.length > 2 && (
                                        <div className="mt-2">
                                            <button
                                                onClick={toggleRoomTypes}
                                                className="w-full flex items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                                                    +{hotelData.roomTypes.length - 2} more room types
                                                </span>
                                                {expandedRoomTypes ? (
                                                    <HiChevronUp className="text-sm transition-transform duration-200" />
                                                ) : (
                                                    <HiChevronDown className="text-sm transition-transform duration-200" />
                                                )}
                                            </button>
                                            
                                            {/* Expanded Room Types */}
                                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedRoomTypes ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {hotelData.roomTypes.slice(2).map((roomType, index) => {
                                                            const currentDate = new Date();
                                                            const currentMonthPrice = getRoomPriceForMonth(roomType, currentDate, false);
                                                            const currentMonthChildPrice = getRoomPriceForMonth(roomType, currentDate, true);
                                                            const displayPrice = currentMonthPrice > 0 ? currentMonthPrice : roomType.pricePerNight;
                                                            const displayChildPrice = currentMonthChildPrice > 0 ? currentMonthChildPrice : roomType.childrenPricePerNight;
                                                            
                                                            return (
                                                                <div key={index + 2} className="bg-gray-100 dark:bg-slate-700 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                                                                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
                                                                        {roomType.type.replace(" ROOM", "").replace(" SUITE", "")}
                                                                    </div>
                                                                    <div className="text-xs">
                                                                        <span className="text-green-600 dark:text-green-400 font-semibold">
                                                                            ${displayPrice}/night
                                                                        </span>
                                                                        {displayChildPrice > 0 && (
                                                                            <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1">
                                                                                <FaChild className="mr-1" size={8} />
                                                                                <span className="font-medium">${displayChildPrice} child</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Hotel Services */}
                            <div className="space-y-2 text-xs">
                                {/* Breakfast Info */}
                                <div className="flex items-center space-x-1">
                                    <FaUtensils className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {hotelData?.breakfastIncluded 
                                            ? hotelData.breakfastPrice > 0 
                                                ? <>Breakfast Included (<span className="text-green-600 dark:text-green-400 font-semibold">${hotelData.breakfastPrice}</span>)</> 
                                                : <span className="text-green-600 dark:text-green-400 font-medium">Breakfast Included</span>
                                            : hotelData?.breakfastPrice > 0 
                                                ? <>Breakfast <span className="text-green-600 dark:text-green-400 font-semibold">${hotelData.breakfastPrice}</span></>
                                                : <span className="text-gray-500 dark:text-gray-400">No Breakfast</span>
                                        }
                                    </span>
                                </div>

                                {/* Nearest Airport */}
                                {hotelData?.airport && (
                                    <div className="flex items-center space-x-1">
                                        <FaPlane className="text-blue-500 dark:text-teal-400 w-3 h-3" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Nearest Airport:</span> {hotelData.airport}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {hotelData?.description && (
                                <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed mt-3">
                                    {truncateDescription(hotelData.description)}
                                </p>
                            )}

                            {/* Configuration Summary inside card */}
                            {(hotel.checkIn || hotel.checkOut || hotel.selectedAirport || estimatedPrice > 0) && (
                                <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Configuration Summary
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        {hotel.checkIn && hotel.checkOut && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <strong>Dates:</strong> {new Date(hotel.checkIn).toLocaleDateString()} - {new Date(hotel.checkOut).toLocaleDateString()} ({nights} nights)
                                            </div>
                                        )}
                                        {hotel.selectedAirport && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <strong>Airport:</strong> {hotel.selectedAirport}
                                            </div>
                                        )}
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <strong>Vehicle:</strong> {hotel.transportVehicleType || 'Vito'}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <strong>Services:</strong>
                                            <div className="ml-4">
                                                {hotel.includeBreakfast && <div>• Breakfast included</div>}
                                                {hotel.includeReception && <div>• Airport reception</div>}
                                                {hotel.includeFarewell && <div>• Airport farewell</div>}
                                            </div>
                                        </div>
                                        {estimatedPrice > 0 && (
                                            <div className="font-semibold text-green-600 dark:text-green-400">
                                                <strong>Estimated Cost:</strong> ${estimatedPrice.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hotel Configuration */}
                {isEditing && (
                    <div className="md:w-1/3 w-full">
                        <div className="bg-white dark:bg-slate-900 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-700">
                            <h5 className="font-medium dark:text-white mb-4">Edit Configuration</h5>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label value="Check-in Date" className="dark:text-white" />
                                        <CustomDatePicker
                                            value={hotel.checkIn}
                                            onChange={(date) => onChange(index, 'checkIn', date)}
                                        />
                                    </div>
                                    <div>
                                        <Label value="Check-out Date" className="dark:text-white" />
                                        <CustomDatePicker
                                            value={hotel.checkOut}
                                            onChange={(date) => onChange(index, 'checkOut', date)}
                                            min={hotel.checkIn}
                                        />
                                    </div>
                                    <div>
                                        <Label value="Airport" className="dark:text-white" />
                                        <Select
                                            value={hotel.selectedAirport}
                                            onChange={(value) => onChange(index, 'selectedAirport', value)}
                                            options={airports.map(airport => ({
                                                value: airport.name,
                                                label: airport.name
                                            }))}
                                            placeholder="Select Airport"
                                        />
                                    </div>
                                    <div>
                                        <Label value="Vehicle Type" className="dark:text-white" />
                                        <Select
                                            value={hotel.transportVehicleType}
                                            onChange={(value) => onChange(index, 'transportVehicleType', value)}
                                            options={[
                                                { value: 'Vito', label: 'Vito (2-8 people)' },
                                                { value: 'Sprinter', label: 'Sprinter (9-16 people)' },
                                                { value: 'Bus', label: 'Bus (+16 people)' }
                                            ]}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label value="Services" className="dark:text-white" />
                                    <div className="space-y-2">
                                        <CustomCheckbox
                                            id={`breakfast-${index}`}
                                            label="Include Breakfast"
                                            checked={hotel.includeBreakfast}
                                            onChange={(checked) => onChange(index, 'includeBreakfast', checked)}
                                        />
                                        <CustomCheckbox
                                            id={`reception-${index}`}
                                            label="Airport Reception"
                                            checked={hotel.includeReception}
                                            onChange={(checked) => onChange(index, 'includeReception', checked)}
                                        />
                                        <CustomCheckbox
                                            id={`farewell-${index}`}
                                            label="Airport Farewell"
                                            checked={hotel.includeFarewell}
                                            onChange={(checked) => onChange(index, 'includeFarewell', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
