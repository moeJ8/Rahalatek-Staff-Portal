import React, { useState, useEffect } from 'react';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';
import ModalScrollbar from './ModalScrollbar';
import { FaHotel, FaSwimmingPool, FaWifi, FaUtensils, FaCar, FaGamepad, FaChild, FaConciergeBell, FaBusinessTime, FaAccessibleIcon, FaSpa, FaGlobe, FaEllipsisH, FaUtensilSpoon } from 'react-icons/fa';

const HotelAmenitiesModal = ({ 
    isOpen, 
    onClose, 
    amenities = {}, 
    onSave 
}) => {
    const [selectedAmenities, setSelectedAmenities] = useState({
        topFamilyFriendlyAmenities: {},
        popularAmenities: {},
        businessServices: {},
        parkingAndTransportation: {},
        foodAndDrink: {},
        internet: {},
        thingsToDo: {},
        familyFriendly: {},
        conveniences: {},
        guestServices: {},
        outdoors: {},
        accessibility: {},
        fullServiceSpaDetails: {},
        languagesSpoken: {},
        more: {},
        restaurantsOnSite: {}
    });

    // Initialize selectedAmenities when amenities prop changes
    useEffect(() => {
        setSelectedAmenities({
            topFamilyFriendlyAmenities: amenities?.topFamilyFriendlyAmenities || {},
            popularAmenities: amenities?.popularAmenities || {},
            businessServices: amenities?.businessServices || {},
            parkingAndTransportation: amenities?.parkingAndTransportation || {},
            foodAndDrink: amenities?.foodAndDrink || {},
            internet: amenities?.internet || {},
            thingsToDo: amenities?.thingsToDo || {},
            familyFriendly: amenities?.familyFriendly || {},
            conveniences: amenities?.conveniences || {},
            guestServices: amenities?.guestServices || {},
            outdoors: amenities?.outdoors || {},
            accessibility: amenities?.accessibility || {},
            fullServiceSpaDetails: amenities?.fullServiceSpaDetails || {},
            languagesSpoken: amenities?.languagesSpoken || {},
            more: amenities?.more || {},
            restaurantsOnSite: amenities?.restaurantsOnSite || {}
        });
    }, [amenities]);

    const handleAmenityChange = (section, amenityKey, checked) => {
        setSelectedAmenities(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [amenityKey]: checked
            }
        }));
    };

    const handleSave = () => {
        onSave(selectedAmenities);
        onClose();
    };

    const amenityCategories = [
        {
            key: 'topFamilyFriendlyAmenities',
            title: 'Top Family-Friendly Amenities',
            icon: <FaChild className="w-5 h-5" />,
            amenities: [
                { key: 'gameRoom', label: 'Game room' },
                { key: 'toysGames', label: 'Toys/Games' },
                { key: 'waterslide', label: 'Waterslide' },
                { key: 'kidsClub', label: 'Kids club' },
                { key: 'kidsPool', label: 'Kids pool' },
                { key: 'babysitting', label: 'Babysitting' },
                { key: 'tennisCourt', label: 'Tennis court' },
                { key: 'soundproofRooms', label: 'Soundproof rooms' },
                { key: 'groceryConvenienceStore', label: 'Grocery/Convenience store' }
            ]
        },
        {
            key: 'popularAmenities',
            title: 'Popular Amenities',
            icon: <FaHotel className="w-5 h-5" />,
            amenities: [
                { key: 'bar', label: 'Bar' },
                { key: 'pool', label: 'Pool' },
                { key: 'allInclusive', label: 'All inclusive' },
                { key: 'breakfastIncluded', label: 'Breakfast included' },
                { key: 'gym', label: 'Gym' },
                { key: 'roomService', label: 'Room service' },
                { key: 'laundry', label: 'Laundry' },
                { key: 'housekeeping', label: 'Housekeeping' },
                { key: 'frontDesk24h', label: '24/7 front desk' },
                { key: 'spa', label: 'Spa' },
                { key: 'airConditioning', label: 'Air conditioning' },
                { key: 'parkingIncluded', label: 'Parking included' },
                { key: 'freeWiFi', label: 'Free WiFi' },
                { key: 'restaurant', label: 'Restaurant' }
            ]
        },
        {
            key: 'businessServices',
            title: 'Business Services',
            icon: <FaBusinessTime className="w-5 h-5" />,
            amenities: [
                { key: 'businessCenter24h', label: '24-hour business center' },
                { key: 'conferenceSpace', label: '425 square feet of conference space' },
                { key: 'computerStation', label: 'Computer station' },
                { key: 'coworkingSpace', label: 'Coworking space' },
                { key: 'meetingRoom', label: 'Meeting room' }
            ]
        },
        {
            key: 'parkingAndTransportation',
            title: 'Parking and Transportation',
            icon: <FaCar className="w-5 h-5" />,
            amenities: [
                { key: 'airportShuttle24h', label: '24-hour roundtrip airport shuttle on request for a surcharge' },
                { key: 'freeSelfParking', label: 'Free self parking on site' }
            ]
        },
        {
            key: 'foodAndDrink',
            title: 'Food and Drink',
            icon: <FaUtensils className="w-5 h-5" />,
            amenities: [
                { key: 'buffetBreakfast', label: 'Free buffet breakfast available daily 7:00 AM to 10:30 AM' },
                { key: 'poolsideBars', label: '3 poolside bars' },
                { key: 'restaurants', label: '5 restaurants' },
                { key: 'barsLounges', label: '7 bars/lounges' },
                { key: 'beachBar', label: 'A beach bar' },
                { key: 'coffeeTeaCommonAreas', label: 'Coffee and tea in common areas' },
                { key: 'snackBarDeli', label: 'Snack bar/deli' }
            ]
        },
        {
            key: 'internet',
            title: 'Internet',
            icon: <FaWifi className="w-5 h-5" />,
            amenities: [
                { key: 'freeWiFiPublicAreas', label: 'Available in some public areas: Free WiFi' }
            ]
        },
        {
            key: 'thingsToDo',
            title: 'Things to Do',
            icon: <FaGamepad className="w-5 h-5" />,
            amenities: [
                { key: 'outdoorTennisCourts', label: '4 outdoor tennis courts' },
                { key: 'outdoorPools', label: '5 outdoor pools' },
                { key: 'arcadeGameRoom', label: 'Arcade/game room' },
                { key: 'beachVolleyball', label: 'Beach volleyball' },
                { key: 'billiardsPoolTable', label: 'Billiards/pool table' },
                { key: 'bowlingAlley', label: 'Bowling alley' },
                { key: 'childrensPool', label: "Children's pool" },
                { key: 'concertsLiveShows', label: 'Concerts/live shows' },
                { key: 'eveningEntertainment', label: 'Evening entertainment' },
                { key: 'fitnessClasses', label: 'Fitness classes' },
                { key: 'freeBicycleRentals', label: 'Free bicycle rentals' },
                { key: 'freeChildrensClub', label: "Free children's club" },
                { key: 'fullServiceSpa', label: 'Full-service spa' },
                { key: 'games', label: 'Games' },
                { key: 'gymFacility', label: 'Gym' },
                { key: 'indoorPool', label: 'Indoor pool' },
                { key: 'karaoke', label: 'Karaoke' },
                { key: 'nightclub', label: 'Nightclub' },
                { key: 'parasailing', label: 'Parasailing' },
                { key: 'playground', label: 'Playground' },
                { key: 'racquetballSquash', label: 'Racquetball/squash' },
                { key: 'sailing', label: 'Sailing' },
                { key: 'saunaFacility', label: 'Sauna' },
                { key: 'scubaDiving', label: 'Scuba diving' },
                { key: 'shopping', label: 'Shopping' },
                { key: 'steamRoom', label: 'Steam room' },
                { key: 'tableTennis', label: 'Table tennis' },
                { key: 'tennisLessons', label: 'Tennis lessons' },
                { key: 'tvCommonAreas', label: 'TV in common areas' },
                { key: 'waterSkiing', label: 'Water skiing' },
                { key: 'waterslideFacility', label: 'Waterslide' },
                { key: 'windsurfing', label: 'Windsurfing' },
                { key: 'yogaClasses', label: 'Yoga classes' }
            ]
        },
        {
            key: 'familyFriendly',
            title: 'Family Friendly',
            icon: <FaChild className="w-5 h-5" />,
            amenities: [
                { key: 'outdoorPoolsFamily', label: '5 outdoor pools' },
                { key: 'arcadeGameRoomFamily', label: 'Arcade/game room' },
                { key: 'bowlingAlleyFamily', label: 'Bowling alley' },
                { key: 'childrensGames', label: "Children's games" },
                { key: 'childrensPoolFamily', label: "Children's pool" },
                { key: 'childrensToys', label: "Children's toys" },
                { key: 'freeChildrensClubFamily', label: "Free children's club" },
                { key: 'freeSupervisedActivities', label: 'Free supervised activities for children' },
                { key: 'groceryConvenienceStoreFamily', label: 'Grocery/convenience store' },
                { key: 'inRoomBabysitting', label: 'In-room babysitting (surcharge)' },
                { key: 'indoorPoolFamily', label: 'Indoor pool' },
                { key: 'laundryFacilities', label: 'Laundry facilities' },
                { key: 'playgroundFamily', label: 'Playground' },
                { key: 'snackBarDeliFamily', label: 'Snack bar/deli' },
                { key: 'soundproofedRooms', label: 'Soundproofed rooms' },
                { key: 'stroller', label: 'Stroller' },
                { key: 'waterslideFamily', label: 'Waterslide' }
            ]
        },
        {
            key: 'conveniences',
            title: 'Conveniences',
            icon: <FaConciergeBell className="w-5 h-5" />,
            amenities: [
                { key: 'frontDesk24hConvenience', label: '24-hour front desk' },
                { key: 'giftShopNewsstand', label: 'Gift shop/newsstand' },
                { key: 'groceryConvenienceStoreConvenience', label: 'Grocery/convenience store' },
                { key: 'hairSalon', label: 'Hair salon' },
                { key: 'laundryFacilitiesConvenience', label: 'Laundry facilities' },
                { key: 'lockers', label: 'Lockers' },
                { key: 'safeFrontDesk', label: 'Safe at front desk' }
            ]
        },
        {
            key: 'guestServices',
            title: 'Guest Services',
            icon: <FaConciergeBell className="w-5 h-5" />,
            amenities: [
                { key: 'changeOfBedsheets', label: 'Change of bedsheets (on request)' },
                { key: 'changeOfTowels', label: 'Change of towels on request' },
                { key: 'conciergeServices', label: 'Concierge services' },
                { key: 'dryCleaningLaundry', label: 'Dry cleaning/laundry service' },
                { key: 'housekeepingDaily', label: 'Housekeeping (daily)' },
                { key: 'multilingualStaff', label: 'Multilingual staff' },
                { key: 'porterBellhop', label: 'Porter/bellhop' },
                { key: 'proposalRomancePackages', label: 'Proposal/romance packages' },
                { key: 'tourTicketAssistance', label: 'Tour and ticket assistance' },
                { key: 'weddingServices', label: 'Wedding services' }
            ]
        },
        {
            key: 'outdoors',
            title: 'Outdoors',
            icon: <FaSwimmingPool className="w-5 h-5" />,
            amenities: [
                { key: 'beachLoungers', label: 'Beach loungers' },
                { key: 'beachTowels', label: 'Beach towels' },
                { key: 'beachUmbrellas', label: 'Beach umbrellas' },
                { key: 'garden', label: 'Garden' },
                { key: 'onTheBay', label: 'On the bay' },
                { key: 'onTheBeach', label: 'On the beach' },
                { key: 'outdoorEntertainmentArea', label: 'Outdoor entertainment area' },
                { key: 'outdoorFurniture', label: 'Outdoor furniture' },
                { key: 'poolLoungers', label: 'Pool loungers' },
                { key: 'poolUmbrellas', label: 'Pool umbrellas' },
                { key: 'terrace', label: 'Terrace' }
            ]
        },
        {
            key: 'accessibility',
            title: 'Accessibility',
            icon: <FaAccessibleIcon className="w-5 h-5" />,
            amenities: [
                { key: 'accessibleAirportShuttle', label: 'Accessible airport shuttle' },
                { key: 'elevator', label: 'Elevator' },
                { key: 'poolHoist', label: 'Pool hoist on site' },
                { key: 'wellLitPath', label: 'Well-lit path to entrance' },
                { key: 'wheelchairAccessible', label: 'Wheelchair accessible (may have limitations)' },
                { key: 'wheelchairAccessiblePath', label: 'Wheelchair-accessible path to elevator' },
                { key: 'wheelchairAccessibleWashroom', label: 'Wheelchair-accessible public washroom' },
                { key: 'wheelchairAccessibleDesk', label: 'Wheelchair-accessible registration desk' }
            ]
        },
        {
            key: 'fullServiceSpaDetails',
            title: 'Full-Service Spa',
            icon: <FaSpa className="w-5 h-5" />,
            amenities: [
                { key: 'bodyScrubs', label: 'Body scrubs' },
                { key: 'bodyWraps', label: 'Body wraps' },
                { key: 'facials', label: 'Facials' },
                { key: 'manicuresPedicures', label: 'Manicures/pedicures' },
                { key: 'massage', label: 'Massage' },
                { key: 'saunaService', label: 'Sauna' },
                { key: 'spaOpenDaily', label: 'Spa open daily' },
                { key: 'turkishBath', label: 'Turkish bath' }
            ]
        },
        {
            key: 'languagesSpoken',
            title: 'Languages Spoken',
            icon: <FaGlobe className="w-5 h-5" />,
            amenities: [
                { key: 'dutch', label: 'Dutch' },
                { key: 'english', label: 'English' },
                { key: 'french', label: 'French' },
                { key: 'german', label: 'German' },
                { key: 'russian', label: 'Russian' },
                { key: 'turkish', label: 'Turkish' }
            ]
        },
        {
            key: 'more',
            title: 'More',
            icon: <FaEllipsisH className="w-5 h-5" />,
            amenities: [
                { key: 'twoFloors', label: '2 floors' },
                { key: 'ledLighting80Percent', label: 'At least 80% lighting from LEDs' },
                { key: 'locallySourcedFood80Percent', label: 'At least 80% of food locally-sourced' },
                { key: 'banquetHall', label: 'Banquet hall' },
                { key: 'builtIn1999', label: 'Built in 1999' },
                { key: 'designatedSmokingAreas', label: 'Designated smoking areas (fines apply)' },
                { key: 'mediterraneanArchitecture', label: 'Mediterranean architecture' },
                { key: 'vegetarianBreakfast', label: 'Vegetarian breakfast available' },
                { key: 'vegetarianDining', label: 'Vegetarian dining options' }
            ]
        },
        {
            key: 'restaurantsOnSite',
            title: 'Restaurants on Site',
            icon: <FaUtensilSpoon className="w-5 h-5" />,
            amenities: [
                { key: 'italian', label: 'Italian' },
                { key: 'buffetMeals', label: 'Meals Buffet' },
                { key: 'seafood', label: 'Seafood' },
                { key: 'sevenTwentyFour', label: 'Seven Twenty Four' },
                { key: 'turkish', label: 'Turkish' }
            ]
        }
    ];

    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title="Hotel Amenities & Services"
            subtitle="Select the amenities and services available at this hotel"
            maxWidth="md:max-w-5xl"
            className="hotel-amenities-modal"
        >
            <div className="flex flex-col h-[70vh]">
                {/* Scrollable Content */}
                <div className="flex-1 min-h-0">
                    <div className="h-full overflow-y-auto modal-scrollbar">
                        <div className="space-y-4 pr-2">
                            {amenityCategories.map((category) => (
                                <div key={category.key} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-teal-600 dark:text-teal-400">
                                            {category.icon}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {category.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {category.amenities.map((amenity) => (
                                            <label key={amenity.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200">
                                                <div className="relative mt-1">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={selectedAmenities[category.key]?.[amenity.key] || false}
                                                        onChange={(e) => handleAmenityChange(category.key, amenity.key, e.target.checked)}
                                                    />
                                                    <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 ${
                                                        selectedAmenities[category.key]?.[amenity.key]
                                                            ? 'bg-teal-500/20 dark:bg-teal-400/30 border-teal-500 dark:border-teal-400 shadow-sm'
                                                            : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500'
                                                    } backdrop-blur-sm`}>
                                                        {selectedAmenities[category.key]?.[amenity.key] && (
                                                            <svg className="w-3 h-3 text-teal-600 dark:text-teal-400 m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 select-none leading-5">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Sticky Footer */}
                <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 -mx-4 px-4 py-3">
                    <div className="flex justify-end space-x-3">
                        <CustomButton 
                            variant="gray" 
                            onClick={onClose}
                        >
                            Cancel
                        </CustomButton>
                        <CustomButton 
                            variant="teal" 
                            onClick={handleSave}
                        >
                            Save Amenities
                        </CustomButton>
                    </div>
                </div>
            </div>
        </CustomModal>
    );
};

export default HotelAmenitiesModal;
