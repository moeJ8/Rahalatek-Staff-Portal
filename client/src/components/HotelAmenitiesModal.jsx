import React, { useState, useEffect } from 'react';
import CustomModal from './CustomModal';
import CustomButton from './CustomButton';
import ModalScrollbar from './ModalScrollbar';
import { FaHotel, FaSwimmingPool, FaWifi, FaUtensils, FaCar, FaGamepad, FaChild, FaConciergeBell, FaBusinessTime, FaAccessibleIcon, FaSpa, FaGlobe, FaEllipsisH, FaUtensilSpoon } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const HotelAmenitiesModal = ({ 
    isOpen, 
    onClose, 
    amenities = {}, 
    onSave 
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
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
            title: t('publicHotelPage.amenities.categories.topFamilyFriendlyAmenities'),
            icon: <FaChild className="w-5 h-5" />,
            amenities: [
                { key: 'gameRoom', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.gameRoom') },
                { key: 'toysGames', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.toysGames') },
                { key: 'waterslide', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.waterslide') },
                { key: 'kidsClub', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.kidsClub') },
                { key: 'kidsPool', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.kidsPool') },
                { key: 'babysitting', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.babysitting') },
                { key: 'tennisCourt', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.tennisCourt') },
                { key: 'soundproofRooms', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.soundproofRooms') },
                { key: 'groceryConvenienceStore', label: t('publicHotelPage.amenities.topFamilyFriendlyAmenities.groceryConvenienceStore') }
            ]
        },
        {
            key: 'popularAmenities',
            title: t('publicHotelPage.amenities.categories.popularAmenities'),
            icon: <FaHotel className="w-5 h-5" />,
            amenities: [
                { key: 'bar', label: t('publicHotelPage.amenities.popularAmenities.bar') },
                { key: 'pool', label: t('publicHotelPage.amenities.popularAmenities.pool') },
                { key: 'allInclusive', label: t('publicHotelPage.amenities.popularAmenities.allInclusive') },
                { key: 'breakfastIncluded', label: t('publicHotelPage.amenities.popularAmenities.breakfastIncluded') },
                { key: 'gym', label: t('publicHotelPage.amenities.popularAmenities.gym') },
                { key: 'roomService', label: t('publicHotelPage.amenities.popularAmenities.roomService') },
                { key: 'laundry', label: t('publicHotelPage.amenities.popularAmenities.laundry') },
                { key: 'housekeeping', label: t('publicHotelPage.amenities.popularAmenities.housekeeping') },
                { key: 'frontDesk24h', label: t('publicHotelPage.amenities.popularAmenities.frontDesk24h') },
                { key: 'spa', label: t('publicHotelPage.amenities.popularAmenities.spa') },
                { key: 'airConditioning', label: t('publicHotelPage.amenities.popularAmenities.airConditioning') },
                { key: 'parkingIncluded', label: t('publicHotelPage.amenities.popularAmenities.parkingIncluded') },
                { key: 'freeWiFi', label: t('publicHotelPage.amenities.popularAmenities.freeWiFi') },
                { key: 'restaurant', label: t('publicHotelPage.amenities.popularAmenities.restaurant') }
            ]
        },
        {
            key: 'businessServices',
            title: t('publicHotelPage.amenities.categories.businessServices'),
            icon: <FaBusinessTime className="w-5 h-5" />,
            amenities: [
                { key: 'businessCenter24h', label: t('publicHotelPage.amenities.businessServices.businessCenter24h') },
                { key: 'conferenceSpace', label: t('publicHotelPage.amenities.businessServices.conferenceSpace') },
                { key: 'computerStation', label: t('publicHotelPage.amenities.businessServices.computerStation') },
                { key: 'coworkingSpace', label: t('publicHotelPage.amenities.businessServices.coworkingSpace') },
                { key: 'meetingRoom', label: t('publicHotelPage.amenities.businessServices.meetingRoom') }
            ]
        },
        {
            key: 'parkingAndTransportation',
            title: t('publicHotelPage.amenities.categories.parkingAndTransportation'),
            icon: <FaCar className="w-5 h-5" />,
            amenities: [
                { key: 'airportShuttle24h', label: t('publicHotelPage.amenities.parkingAndTransportation.airportShuttle24h') },
                { key: 'freeSelfParking', label: t('publicHotelPage.amenities.parkingAndTransportation.freeSelfParking') }
            ]
        },
        {
            key: 'foodAndDrink',
            title: t('publicHotelPage.amenities.categories.foodAndDrink'),
            icon: <FaUtensils className="w-5 h-5" />,
            amenities: [
                { key: 'buffetBreakfast', label: t('publicHotelPage.amenities.foodAndDrink.buffetBreakfast') },
                { key: 'poolsideBars', label: t('publicHotelPage.amenities.foodAndDrink.poolsideBars') },
                { key: 'restaurants', label: t('publicHotelPage.amenities.foodAndDrink.restaurants') },
                { key: 'barsLounges', label: t('publicHotelPage.amenities.foodAndDrink.barsLounges') },
                { key: 'beachBar', label: t('publicHotelPage.amenities.foodAndDrink.beachBar') },
                { key: 'coffeeTeaCommonAreas', label: t('publicHotelPage.amenities.foodAndDrink.coffeeTeaCommonAreas') },
                { key: 'snackBarDeli', label: t('publicHotelPage.amenities.foodAndDrink.snackBarDeli') }
            ]
        },
        {
            key: 'internet',
            title: t('publicHotelPage.amenities.categories.internet'),
            icon: <FaWifi className="w-5 h-5" />,
            amenities: [
                { key: 'freeWiFiPublicAreas', label: t('publicHotelPage.amenities.internet.freeWiFiPublicAreas') }
            ]
        },
        {
            key: 'thingsToDo',
            title: t('publicHotelPage.amenities.categories.thingsToDo'),
            icon: <FaGamepad className="w-5 h-5" />,
            amenities: [
                { key: 'outdoorTennisCourts', label: t('publicHotelPage.amenities.thingsToDo.outdoorTennisCourts') },
                { key: 'outdoorPools', label: t('publicHotelPage.amenities.thingsToDo.outdoorPools') },
                { key: 'arcadeGameRoom', label: t('publicHotelPage.amenities.thingsToDo.arcadeGameRoom') },
                { key: 'beachVolleyball', label: t('publicHotelPage.amenities.thingsToDo.beachVolleyball') },
                { key: 'billiardsPoolTable', label: t('publicHotelPage.amenities.thingsToDo.billiardsPoolTable') },
                { key: 'bowlingAlley', label: t('publicHotelPage.amenities.thingsToDo.bowlingAlley') },
                { key: 'childrensPool', label: t('publicHotelPage.amenities.thingsToDo.childrensPool') },
                { key: 'concertsLiveShows', label: t('publicHotelPage.amenities.thingsToDo.concertsLiveShows') },
                { key: 'eveningEntertainment', label: t('publicHotelPage.amenities.thingsToDo.eveningEntertainment') },
                { key: 'fitnessClasses', label: t('publicHotelPage.amenities.thingsToDo.fitnessClasses') },
                { key: 'freeBicycleRentals', label: t('publicHotelPage.amenities.thingsToDo.freeBicycleRentals') },
                { key: 'freeChildrensClub', label: t('publicHotelPage.amenities.thingsToDo.freeChildrensClub') },
                { key: 'fullServiceSpa', label: t('publicHotelPage.amenities.thingsToDo.fullServiceSpa') },
                { key: 'games', label: t('publicHotelPage.amenities.thingsToDo.games') },
                { key: 'gymFacility', label: t('publicHotelPage.amenities.thingsToDo.gymFacility') },
                { key: 'indoorPool', label: t('publicHotelPage.amenities.thingsToDo.indoorPool') },
                { key: 'karaoke', label: t('publicHotelPage.amenities.thingsToDo.karaoke') },
                { key: 'nightclub', label: t('publicHotelPage.amenities.thingsToDo.nightclub') },
                { key: 'parasailing', label: t('publicHotelPage.amenities.thingsToDo.parasailing') },
                { key: 'playground', label: t('publicHotelPage.amenities.thingsToDo.playground') },
                { key: 'racquetballSquash', label: t('publicHotelPage.amenities.thingsToDo.racquetballSquash') },
                { key: 'sailing', label: t('publicHotelPage.amenities.thingsToDo.sailing') },
                { key: 'saunaFacility', label: t('publicHotelPage.amenities.thingsToDo.saunaFacility') },
                { key: 'scubaDiving', label: t('publicHotelPage.amenities.thingsToDo.scubaDiving') },
                { key: 'shopping', label: t('publicHotelPage.amenities.thingsToDo.shopping') },
                { key: 'steamRoom', label: t('publicHotelPage.amenities.thingsToDo.steamRoom') },
                { key: 'tableTennis', label: t('publicHotelPage.amenities.thingsToDo.tableTennis') },
                { key: 'tennisLessons', label: t('publicHotelPage.amenities.thingsToDo.tennisLessons') },
                { key: 'tvCommonAreas', label: t('publicHotelPage.amenities.thingsToDo.tvCommonAreas') },
                { key: 'waterSkiing', label: t('publicHotelPage.amenities.thingsToDo.waterSkiing') },
                { key: 'waterslideFacility', label: t('publicHotelPage.amenities.thingsToDo.waterslideFacility') },
                { key: 'windsurfing', label: t('publicHotelPage.amenities.thingsToDo.windsurfing') },
                { key: 'yogaClasses', label: t('publicHotelPage.amenities.thingsToDo.yogaClasses') }
            ]
        },
        {
            key: 'familyFriendly',
            title: t('publicHotelPage.amenities.categories.familyFriendly'),
            icon: <FaChild className="w-5 h-5" />,
            amenities: [
                { key: 'outdoorPoolsFamily', label: t('publicHotelPage.amenities.familyFriendly.outdoorPoolsFamily') },
                { key: 'arcadeGameRoomFamily', label: t('publicHotelPage.amenities.familyFriendly.arcadeGameRoomFamily') },
                { key: 'bowlingAlleyFamily', label: t('publicHotelPage.amenities.familyFriendly.bowlingAlleyFamily') },
                { key: 'childrensGames', label: t('publicHotelPage.amenities.familyFriendly.childrensGames') },
                { key: 'childrensPoolFamily', label: t('publicHotelPage.amenities.familyFriendly.childrensPoolFamily') },
                { key: 'childrensToys', label: t('publicHotelPage.amenities.familyFriendly.childrensToys') },
                { key: 'freeChildrensClubFamily', label: t('publicHotelPage.amenities.familyFriendly.freeChildrensClubFamily') },
                { key: 'freeSupervisedActivities', label: t('publicHotelPage.amenities.familyFriendly.freeSupervisedActivities') },
                { key: 'groceryConvenienceStoreFamily', label: t('publicHotelPage.amenities.familyFriendly.groceryConvenienceStoreFamily') },
                { key: 'inRoomBabysitting', label: t('publicHotelPage.amenities.familyFriendly.inRoomBabysitting') },
                { key: 'indoorPoolFamily', label: t('publicHotelPage.amenities.familyFriendly.indoorPoolFamily') },
                { key: 'laundryFacilities', label: t('publicHotelPage.amenities.familyFriendly.laundryFacilities') },
                { key: 'playgroundFamily', label: t('publicHotelPage.amenities.familyFriendly.playgroundFamily') },
                { key: 'snackBarDeliFamily', label: t('publicHotelPage.amenities.familyFriendly.snackBarDeliFamily') },
                { key: 'soundproofedRooms', label: t('publicHotelPage.amenities.familyFriendly.soundproofedRooms') },
                { key: 'stroller', label: t('publicHotelPage.amenities.familyFriendly.stroller') },
                { key: 'waterslideFamily', label: t('publicHotelPage.amenities.familyFriendly.waterslideFamily') }
            ]
        },
        {
            key: 'conveniences',
            title: t('publicHotelPage.amenities.categories.conveniences'),
            icon: <FaConciergeBell className="w-5 h-5" />,
            amenities: [
                { key: 'frontDesk24hConvenience', label: t('publicHotelPage.amenities.conveniences.frontDesk24hConvenience') },
                { key: 'giftShopNewsstand', label: t('publicHotelPage.amenities.conveniences.giftShopNewsstand') },
                { key: 'groceryConvenienceStoreConvenience', label: t('publicHotelPage.amenities.conveniences.groceryConvenienceStoreConvenience') },
                { key: 'hairSalon', label: t('publicHotelPage.amenities.conveniences.hairSalon') },
                { key: 'laundryFacilitiesConvenience', label: t('publicHotelPage.amenities.conveniences.laundryFacilitiesConvenience') },
                { key: 'lockers', label: t('publicHotelPage.amenities.conveniences.lockers') },
                { key: 'safeFrontDesk', label: t('publicHotelPage.amenities.conveniences.safeFrontDesk') }
            ]
        },
        {
            key: 'guestServices',
            title: t('publicHotelPage.amenities.categories.guestServices'),
            icon: <FaConciergeBell className="w-5 h-5" />,
            amenities: [
                { key: 'changeOfBedsheets', label: t('publicHotelPage.amenities.guestServices.changeOfBedsheets') },
                { key: 'changeOfTowels', label: t('publicHotelPage.amenities.guestServices.changeOfTowels') },
                { key: 'conciergeServices', label: t('publicHotelPage.amenities.guestServices.conciergeServices') },
                { key: 'dryCleaningLaundry', label: t('publicHotelPage.amenities.guestServices.dryCleaningLaundry') },
                { key: 'housekeepingDaily', label: t('publicHotelPage.amenities.guestServices.housekeepingDaily') },
                { key: 'multilingualStaff', label: t('publicHotelPage.amenities.guestServices.multilingualStaff') },
                { key: 'porterBellhop', label: t('publicHotelPage.amenities.guestServices.porterBellhop') },
                { key: 'proposalRomancePackages', label: t('publicHotelPage.amenities.guestServices.proposalRomancePackages') },
                { key: 'tourTicketAssistance', label: t('publicHotelPage.amenities.guestServices.tourTicketAssistance') },
                { key: 'weddingServices', label: t('publicHotelPage.amenities.guestServices.weddingServices') }
            ]
        },
        {
            key: 'outdoors',
            title: t('publicHotelPage.amenities.categories.outdoors'),
            icon: <FaSwimmingPool className="w-5 h-5" />,
            amenities: [
                { key: 'beachLoungers', label: t('publicHotelPage.amenities.outdoors.beachLoungers') },
                { key: 'beachTowels', label: t('publicHotelPage.amenities.outdoors.beachTowels') },
                { key: 'beachUmbrellas', label: t('publicHotelPage.amenities.outdoors.beachUmbrellas') },
                { key: 'garden', label: t('publicHotelPage.amenities.outdoors.garden') },
                { key: 'onTheBay', label: t('publicHotelPage.amenities.outdoors.onTheBay') },
                { key: 'onTheBeach', label: t('publicHotelPage.amenities.outdoors.onTheBeach') },
                { key: 'outdoorEntertainmentArea', label: t('publicHotelPage.amenities.outdoors.outdoorEntertainmentArea') },
                { key: 'outdoorFurniture', label: t('publicHotelPage.amenities.outdoors.outdoorFurniture') },
                { key: 'poolLoungers', label: t('publicHotelPage.amenities.outdoors.poolLoungers') },
                { key: 'poolUmbrellas', label: t('publicHotelPage.amenities.outdoors.poolUmbrellas') },
                { key: 'terrace', label: t('publicHotelPage.amenities.outdoors.terrace') }
            ]
        },
        {
            key: 'accessibility',
            title: t('publicHotelPage.amenities.categories.accessibility'),
            icon: <FaAccessibleIcon className="w-5 h-5" />,
            amenities: [
                { key: 'accessibleAirportShuttle', label: t('publicHotelPage.amenities.accessibility.accessibleAirportShuttle') },
                { key: 'elevator', label: t('publicHotelPage.amenities.accessibility.elevator') },
                { key: 'poolHoist', label: t('publicHotelPage.amenities.accessibility.poolHoist') },
                { key: 'wellLitPath', label: t('publicHotelPage.amenities.accessibility.wellLitPath') },
                { key: 'wheelchairAccessible', label: t('publicHotelPage.amenities.accessibility.wheelchairAccessible') },
                { key: 'wheelchairAccessiblePath', label: t('publicHotelPage.amenities.accessibility.wheelchairAccessiblePath') },
                { key: 'wheelchairAccessibleWashroom', label: t('publicHotelPage.amenities.accessibility.wheelchairAccessibleWashroom') },
                { key: 'wheelchairAccessibleDesk', label: t('publicHotelPage.amenities.accessibility.wheelchairAccessibleDesk') }
            ]
        },
        {
            key: 'fullServiceSpaDetails',
            title: t('publicHotelPage.amenities.categories.fullServiceSpaDetails'),
            icon: <FaSpa className="w-5 h-5" />,
            amenities: [
                { key: 'bodyScrubs', label: t('publicHotelPage.amenities.fullServiceSpaDetails.bodyScrubs') },
                { key: 'bodyWraps', label: t('publicHotelPage.amenities.fullServiceSpaDetails.bodyWraps') },
                { key: 'facials', label: t('publicHotelPage.amenities.fullServiceSpaDetails.facials') },
                { key: 'manicuresPedicures', label: t('publicHotelPage.amenities.fullServiceSpaDetails.manicuresPedicures') },
                { key: 'massage', label: t('publicHotelPage.amenities.fullServiceSpaDetails.massage') },
                { key: 'saunaService', label: t('publicHotelPage.amenities.fullServiceSpaDetails.saunaService') },
                { key: 'spaOpenDaily', label: t('publicHotelPage.amenities.fullServiceSpaDetails.spaOpenDaily') },
                { key: 'turkishBath', label: t('publicHotelPage.amenities.fullServiceSpaDetails.turkishBath') }
            ]
        },
        {
            key: 'languagesSpoken',
            title: t('publicHotelPage.amenities.categories.languagesSpoken'),
            icon: <FaGlobe className="w-5 h-5" />,
            amenities: [
                { key: 'dutch', label: t('publicHotelPage.amenities.languagesSpoken.dutch') },
                { key: 'english', label: t('publicHotelPage.amenities.languagesSpoken.english') },
                { key: 'french', label: t('publicHotelPage.amenities.languagesSpoken.french') },
                { key: 'german', label: t('publicHotelPage.amenities.languagesSpoken.german') },
                { key: 'russian', label: t('publicHotelPage.amenities.languagesSpoken.russian') },
                { key: 'turkish', label: t('publicHotelPage.amenities.languagesSpoken.turkish') }
            ]
        },
        {
            key: 'more',
            title: t('publicHotelPage.amenities.categories.more'),
            icon: <FaEllipsisH className="w-5 h-5" />,
            amenities: [
                { key: 'twoFloors', label: t('publicHotelPage.amenities.more.twoFloors') },
                { key: 'ledLighting80Percent', label: t('publicHotelPage.amenities.more.ledLighting80Percent') },
                { key: 'locallySourcedFood80Percent', label: t('publicHotelPage.amenities.more.locallySourcedFood80Percent') },
                { key: 'banquetHall', label: t('publicHotelPage.amenities.more.banquetHall') },
                { key: 'builtIn1999', label: t('publicHotelPage.amenities.more.builtIn1999') },
                { key: 'designatedSmokingAreas', label: t('publicHotelPage.amenities.more.designatedSmokingAreas') },
                { key: 'mediterraneanArchitecture', label: t('publicHotelPage.amenities.more.mediterraneanArchitecture') },
                { key: 'vegetarianBreakfast', label: t('publicHotelPage.amenities.more.vegetarianBreakfast') },
                { key: 'vegetarianDining', label: t('publicHotelPage.amenities.more.vegetarianDining') }
            ]
        },
        {
            key: 'restaurantsOnSite',
            title: t('publicHotelPage.amenities.categories.restaurantsOnSite'),
            icon: <FaUtensilSpoon className="w-5 h-5" />,
            amenities: [
                { key: 'italian', label: t('publicHotelPage.amenities.restaurantsOnSite.italian') },
                { key: 'buffetMeals', label: t('publicHotelPage.amenities.restaurantsOnSite.buffetMeals') },
                { key: 'seafood', label: t('publicHotelPage.amenities.restaurantsOnSite.seafood') },
                { key: 'sevenTwentyFour', label: t('publicHotelPage.amenities.restaurantsOnSite.sevenTwentyFour') },
                { key: 'turkish', label: t('publicHotelPage.amenities.restaurantsOnSite.turkish') }
            ]
        }
    ];

    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('publicHotelPage.amenities.modalTitle')}
            subtitle="Select the amenities and services available at this hotel"
            maxWidth="md:max-w-5xl"
            className="hotel-amenities-modal"
        >
            <div className={`flex flex-col h-[70vh] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                {/* Scrollable Content */}
                <div className="flex-1 min-h-0">
                    <div className="h-full overflow-y-auto modal-scrollbar">
                        <div className={`space-y-4 ${isRTL ? 'pl-2' : 'pr-2'}`}>
                            {amenityCategories.map((category) => (
                                <div key={category.key} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                    <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                                        <div className="text-teal-600 dark:text-teal-400">
                                            {category.icon}
                                        </div>
                                        <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {category.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {category.amenities.map((amenity) => (
                                            <label key={amenity.key} className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 ${isRTL ? 'space-x-reverse' : ''}`}>
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
                                                <span className={`text-sm font-medium text-gray-700 dark:text-gray-200 select-none leading-5 ${isRTL ? 'text-right' : 'text-left'}`}>
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
