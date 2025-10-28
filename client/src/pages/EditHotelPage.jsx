import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Label, Textarea, Select, Checkbox, Tabs, Accordion } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiTrash, HiCalendar, HiX, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import CustomButton from '../components/CustomButton';
import CustomSelect from '../components/Select';
import TextInput from '../components/TextInput';
import RahalatekLoader from '../components/RahalatekLoader';
import ImageUploader from '../components/ImageUploader';
import RoomImageUploader from '../components/RoomImageUploader';
import HotelAmenitiesModal from '../components/HotelAmenitiesModal';
import toast from 'react-hot-toast';
import { getCountries, getCitiesByCountry } from '../utils/countryCities';
import { validateSlug, formatSlug, formatSlugWhileTyping, getSlugPreview } from '../utils/slugValidation';

export default function EditHotelPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotelData, setHotelData] = useState({
        name: '',
        slug: '',
        country: '',
        city: '',
        stars: 3,
        roomTypes: [],
        breakfastIncluded: false,
        breakfastPrice: 0,
        transportation: {
            vitoReceptionPrice: 0,
            vitoFarewellPrice: 0,
            sprinterReceptionPrice: 0,
            sprinterFarewellPrice: 0,
            busReceptionPrice: 0,
            busFarewellPrice: 0
        },
        airport: '',
        airportTransportation: [],
        description: '',
        locationDescription: '',
        translations: {
            description: { ar: '', fr: '' },
            locationDescription: { ar: '', fr: '' }
        },
        images: [],
        amenities: {},
        faqs: []
    });
    const standardRoomTypes = [
        "SINGLE ROOM",
        "DOUBLE ROOM",
        "TRIPLE ROOM",
        "FAMILY SUITE"
    ];
    const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    const monthLabels = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const [selectedRoomTypes, setSelectedRoomTypes] = useState({
        "SINGLE ROOM": false,
        "DOUBLE ROOM": false,
        "TRIPLE ROOM": false,
        "FAMILY SUITE": false,
        "CUSTOM": false
    });
    
    const [roomTypePrices, setRoomTypePrices] = useState({
        "SINGLE ROOM": "",
        "DOUBLE ROOM": "",
        "TRIPLE ROOM": "",
        "FAMILY SUITE": "",
        "CUSTOM": ""
    });
    
    const [roomTypeChildrenPrices, setRoomTypeChildrenPrices] = useState({
        "SINGLE ROOM": "",
        "DOUBLE ROOM": "",
        "TRIPLE ROOM": "",
        "FAMILY SUITE": "",
        "CUSTOM": ""
    });

    const [monthlyPrices, setMonthlyPrices] = useState({
        "SINGLE ROOM": {},
        "DOUBLE ROOM": {},
        "TRIPLE ROOM": {},
        "FAMILY SUITE": {},
        "CUSTOM": {}
    });
    
    const [customRoomTypes, setCustomRoomTypes] = useState([]);
    const [roomImages, setRoomImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [slugError, setSlugError] = useState('');
    const [airports, setAirports] = useState([]);
    const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false);

    // Translation state
    const [translationCollapse, setTranslationCollapse] = useState({
        description: false,
        locationDescription: false
    });

    // Room highlights and details state
    const [roomHighlights, setRoomHighlights] = useState({});
    const [roomDetails, setRoomDetails] = useState({});
    const [highlightInputs, setHighlightInputs] = useState({}); // Store highlight input for each room type

    // FAQ handlers
    const handleAddFaq = () => {
        setHotelData({
            ...hotelData,
            faqs: [...hotelData.faqs, { question: '', answer: '' }]
        });
    };

    const handleRemoveFaq = (index) => {
        const updatedFaqs = [...hotelData.faqs];
        updatedFaqs.splice(index, 1);
        setHotelData({
            ...hotelData,
            faqs: updatedFaqs
        });
    };

    const handleFaqChange = (index, field, value) => {
        const updatedFaqs = [...hotelData.faqs];
        updatedFaqs[index] = {
            ...updatedFaqs[index],
            [field]: value
        };
        setHotelData({
            ...hotelData,
            faqs: updatedFaqs
        });
    };

    // Translation handling functions
    const toggleTranslationCollapse = (section) => {
        setTranslationCollapse(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleTranslationChange = (field, language, value) => {
        setHotelData({
            ...hotelData,
            translations: {
                ...hotelData.translations,
                [field]: {
                    ...hotelData.translations[field],
                    [language]: value
                }
            }
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hotelResponse = await axios.get(`/api/hotels/${id}`);
                // Handle potential difference in data structure for older hotels
                const fetchedHotel = hotelResponse.data;
                if (!fetchedHotel.roomTypes || fetchedHotel.roomTypes.length === 0) {
                    // Convert old format to new format
                    fetchedHotel.roomTypes = fetchedHotel.roomType ? 
                        [{ 
                            type: fetchedHotel.roomType, 
                            pricePerNight: fetchedHotel.pricePerNightPerPerson || 0 
                        }] : [];
                }

                if (!fetchedHotel.airportTransportation || fetchedHotel.airportTransportation.length === 0) {
                    if (fetchedHotel.airport && Object.values(fetchedHotel.transportation).some(price => price > 0)) {
                        fetchedHotel.airportTransportation = [{
                            airport: fetchedHotel.airport,
                            transportation: fetchedHotel.transportation
                        }];
                    } else {
                        fetchedHotel.airportTransportation = [];
                    }
                }
                
                // Ensure amenities is always an object for proper initialization
                if (!fetchedHotel.amenities) {
                    fetchedHotel.amenities = {};
                }

                // Sanitize potentially null/undefined fields to ensure controlled inputs
                const sanitizedHotel = {
                    ...fetchedHotel,
                    name: fetchedHotel.name || '',
                    country: fetchedHotel.country || '',
                    city: fetchedHotel.city || '',
                    description: fetchedHotel.description || '',
                    locationDescription: fetchedHotel.locationDescription || '',
                    translations: fetchedHotel.translations || {
                        description: { ar: '', fr: '' },
                        locationDescription: { ar: '', fr: '' }
                    },
                    airport: fetchedHotel.airport || '',
                    breakfastPrice: fetchedHotel.breakfastPrice || 0,
                    transportation: {
                        vitoReceptionPrice: fetchedHotel.transportation?.vitoReceptionPrice || 0,
                        vitoFarewellPrice: fetchedHotel.transportation?.vitoFarewellPrice || 0,
                        sprinterReceptionPrice: fetchedHotel.transportation?.sprinterReceptionPrice || 0,
                        sprinterFarewellPrice: fetchedHotel.transportation?.sprinterFarewellPrice || 0,
                        busReceptionPrice: fetchedHotel.transportation?.busReceptionPrice || 0,
                        busFarewellPrice: fetchedHotel.transportation?.busFarewellPrice || 0
                    },
                    airportTransportation: (fetchedHotel.airportTransportation || []).map(item => ({
                        ...item,
                        airport: item.airport || '',
                        transportation: {
                            vitoReceptionPrice: item.transportation?.vitoReceptionPrice || 0,
                            vitoFarewellPrice: item.transportation?.vitoFarewellPrice || 0,
                            sprinterReceptionPrice: item.transportation?.sprinterReceptionPrice || 0,
                            sprinterFarewellPrice: item.transportation?.sprinterFarewellPrice || 0,
                            busReceptionPrice: item.transportation?.busReceptionPrice || 0,
                            busFarewellPrice: item.transportation?.busFarewellPrice || 0
                        }
                    }))
                };
                
                setHotelData(sanitizedHotel);
                const newSelectedRoomTypes = {
                    "SINGLE ROOM": false,
                    "DOUBLE ROOM": false,
                    "TRIPLE ROOM": false,
                    "FAMILY SUITE": false,
                    "CUSTOM": false
                };
                
                const newRoomTypePrices = {
                    "SINGLE ROOM": "",
                    "DOUBLE ROOM": "",
                    "TRIPLE ROOM": "",
                    "FAMILY SUITE": "",
                    "CUSTOM": ""
                };
                
                const newRoomTypeChildrenPrices = {
                    "SINGLE ROOM": "",
                    "DOUBLE ROOM": "",
                    "TRIPLE ROOM": "",
                    "FAMILY SUITE": "",
                    "CUSTOM": ""
                };

                // Initialize monthly prices
                const newMonthlyPrices = {
                    "SINGLE ROOM": {},
                    "DOUBLE ROOM": {},
                    "TRIPLE ROOM": {},
                    "FAMILY SUITE": {},
                    "CUSTOM": {}
                };

                // Initialize room images, highlights, and details
                const newRoomImages = {};
                const newRoomHighlights = {};
                const newRoomDetails = {};
                const loadedCustomRoomTypes = [];
                
                // Set the selected states and prices based on existing room types
                fetchedHotel.roomTypes.forEach(roomType => {
                    if (standardRoomTypes.includes(roomType.type)) {
                        // Handle standard room types
                        const roomTypeName = roomType.type;
                        
                        newSelectedRoomTypes[roomTypeName] = true;
                        newRoomTypePrices[roomTypeName] = roomType.pricePerNight.toString();
                        newRoomTypeChildrenPrices[roomTypeName] = roomType.childrenPricePerNight?.toString() || "0";

                        // Initialize monthly prices if they exist in the data
                        if (roomType.monthlyPrices) {
                            // Sanitize monthly prices to ensure no null values
                            const sanitizedMonthlyPrices = {};
                            months.forEach(month => {
                                sanitizedMonthlyPrices[month] = {
                                    adult: roomType.monthlyPrices[month]?.adult || 0,
                                    child: roomType.monthlyPrices[month]?.child || 0
                                };
                            });
                            newMonthlyPrices[roomTypeName] = sanitizedMonthlyPrices;
                        } else {
                            // Create empty monthly price structure if it doesn't exist
                            const emptyMonthlyPrices = {};
                            months.forEach(month => {
                                emptyMonthlyPrices[month] = {
                                    adult: 0,
                                    child: 0
                                };
                            });
                            newMonthlyPrices[roomTypeName] = emptyMonthlyPrices;
                        }

                        // Initialize room images if they exist
                        if (roomType.images && roomType.images.length > 0) {
                            newRoomImages[roomTypeName] = roomType.images;
                        }

                        // Initialize room highlights if they exist
                        if (roomType.highlights && roomType.highlights.length > 0) {
                            newRoomHighlights[roomTypeName] = roomType.highlights;
                        } else {
                            newRoomHighlights[roomTypeName] = [];
                        }

                        // Initialize room details if they exist
                        if (roomType.details) {
                            newRoomDetails[roomTypeName] = {
                                size: { 
                                    value: roomType.details.size?.value || '', 
                                    unit: roomType.details.size?.unit || 'sq m' 
                                },
                                view: roomType.details.view || '',
                                sleeps: roomType.details.sleeps || 1,
                                bedType: roomType.details.bedType || '',
                                bathroom: roomType.details.bathroom || '',
                                balcony: roomType.details.balcony || false,
                                airConditioning: roomType.details.airConditioning || false,
                                soundproofed: roomType.details.soundproofed || false,
                                freeWifi: roomType.details.freeWifi || false,
                                minibar: roomType.details.minibar || false,
                                safe: roomType.details.safe || false,
                                tv: roomType.details.tv || false,
                                hairdryer: roomType.details.hairdryer || false,
                                bathrobes: roomType.details.bathrobes || false,
                                freeCots: roomType.details.freeCots || false,
                                smokingAllowed: roomType.details.smokingAllowed || false,
                                petFriendly: roomType.details.petFriendly || false,
                                accessibleRoom: roomType.details.accessibleRoom || false
                            };
                        } else {
                            newRoomDetails[roomTypeName] = {
                                size: { value: '', unit: 'sq m' },
                                view: '',
                                sleeps: 1,
                                bedType: '',
                                bathroom: '',
                                balcony: false,
                                airConditioning: false,
                                soundproofed: false,
                                freeWifi: false,
                                minibar: false,
                                safe: false,
                                tv: false,
                                hairdryer: false,
                                bathrobes: false,
                                freeCots: false,
                                smokingAllowed: false,
                                petFriendly: false,
                                accessibleRoom: false
                            };
                        }
                    } else {
                        // Handle custom room types
                        const customRoomTypeId = `CUSTOM_${Date.now()}_${loadedCustomRoomTypes.length}`;
                        
                        loadedCustomRoomTypes.push({
                            id: customRoomTypeId,
                            name: roomType.type
                        });

                        newRoomTypePrices[customRoomTypeId] = roomType.pricePerNight.toString();
                        newRoomTypeChildrenPrices[customRoomTypeId] = roomType.childrenPricePerNight?.toString() || "0";

                        // Initialize monthly prices
                        if (roomType.monthlyPrices) {
                            // Sanitize monthly prices to ensure no null values
                            const sanitizedMonthlyPrices = {};
                            months.forEach(month => {
                                sanitizedMonthlyPrices[month] = {
                                    adult: roomType.monthlyPrices[month]?.adult || 0,
                                    child: roomType.monthlyPrices[month]?.child || 0
                                };
                            });
                            newMonthlyPrices[customRoomTypeId] = sanitizedMonthlyPrices;
                        } else {
                            const emptyMonthlyPrices = {};
                            months.forEach(month => {
                                emptyMonthlyPrices[month] = {
                                    adult: 0,
                                    child: 0
                                };
                            });
                            newMonthlyPrices[customRoomTypeId] = emptyMonthlyPrices;
                        }

                        // Initialize room images if they exist
                        if (roomType.images && roomType.images.length > 0) {
                            newRoomImages[customRoomTypeId] = roomType.images;
                        }

                        // Initialize room highlights if they exist
                        if (roomType.highlights && roomType.highlights.length > 0) {
                            newRoomHighlights[customRoomTypeId] = roomType.highlights;
                        } else {
                            newRoomHighlights[customRoomTypeId] = [];
                        }

                        // Initialize room details if they exist
                        if (roomType.details) {
                            newRoomDetails[customRoomTypeId] = {
                                size: { 
                                    value: roomType.details.size?.value || '', 
                                    unit: roomType.details.size?.unit || 'sq m' 
                                },
                                view: roomType.details.view || '',
                                sleeps: roomType.details.sleeps || 1,
                                bedType: roomType.details.bedType || '',
                                bathroom: roomType.details.bathroom || '',
                                balcony: roomType.details.balcony || false,
                                airConditioning: roomType.details.airConditioning || false,
                                soundproofed: roomType.details.soundproofed || false,
                                freeWifi: roomType.details.freeWifi || false,
                                minibar: roomType.details.minibar || false,
                                safe: roomType.details.safe || false,
                                tv: roomType.details.tv || false,
                                hairdryer: roomType.details.hairdryer || false,
                                bathrobes: roomType.details.bathrobes || false,
                                freeCots: roomType.details.freeCots || false,
                                smokingAllowed: roomType.details.smokingAllowed || false,
                                petFriendly: roomType.details.petFriendly || false,
                                accessibleRoom: roomType.details.accessibleRoom || false
                            };
                        } else {
                            newRoomDetails[customRoomTypeId] = {
                                size: { value: '', unit: 'sq m' },
                                view: '',
                                sleeps: 1,
                                bedType: '',
                                bathroom: '',
                                balcony: false,
                                airConditioning: false,
                                soundproofed: false,
                                freeWifi: false,
                                minibar: false,
                                safe: false,
                                tv: false,
                                hairdryer: false,
                                bathrobes: false,
                                freeCots: false,
                                smokingAllowed: false,
                                petFriendly: false,
                                accessibleRoom: false
                            };
                        }

                        // Set CUSTOM checkbox to true if we have custom room types
                        newSelectedRoomTypes["CUSTOM"] = true;
                    }
                });
                
                setSelectedRoomTypes(newSelectedRoomTypes);
                setRoomTypePrices(newRoomTypePrices);
                setRoomTypeChildrenPrices(newRoomTypeChildrenPrices);
                setMonthlyPrices(newMonthlyPrices);
                setRoomImages(newRoomImages);
                setRoomHighlights(newRoomHighlights);
                setRoomDetails(newRoomDetails);
                setCustomRoomTypes(loadedCustomRoomTypes);
                
                const airportsResponse = await axios.get('/api/airports');
                setAirports(airportsResponse.data);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                toast.error('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleHotelChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setHotelData({
                ...hotelData,
                [name]: checked
            });
        } else {
            setHotelData({
                ...hotelData,
                [name]: value
            });
        }
    };

    // Handle slug input with validation
    const handleSlugChange = (e) => {
        const value = e.target.value;
        const formattedSlug = formatSlugWhileTyping(value);
        
        setHotelData({
            ...hotelData,
            slug: formattedSlug,
        });

        // Validate slug and show error if invalid
        const validation = validateSlug(formattedSlug);
        if (!validation.isValid) {
            setSlugError(validation.message);
        } else {
            setSlugError('');
        }
    };

    // Handle country change and reset city
    const handleCountryChange = (country) => {
        setHotelData({
            ...hotelData,
            country: country,
            city: '' // Reset city when country changes
        });
    };

    const handleTransportationChange = (field, value) => {
        setHotelData({
            ...hotelData,
            transportation: {
                ...hotelData.transportation,
                [field]: value
            }
        });
    };

    const handleAddAirportTransportation = () => {
        setHotelData({
            ...hotelData,
            airportTransportation: [
                ...hotelData.airportTransportation,
                {
                    airport: '',
                    transportation: {
                        vitoReceptionPrice: 0,
                        vitoFarewellPrice: 0,
                        sprinterReceptionPrice: 0,
                        sprinterFarewellPrice: 0,
                        busReceptionPrice: 0,
                        busFarewellPrice: 0
                    }
                }
            ]
        });
    };
    
    const handleRemoveAirportTransportation = (index) => {
        const updatedAirportTransportation = [...hotelData.airportTransportation];
        updatedAirportTransportation.splice(index, 1);
        setHotelData({
            ...hotelData,
            airportTransportation: updatedAirportTransportation
        });
    };
    
    const handleAirportTransportationChange = (index, field, value) => {
        const updatedAirportTransportation = [...hotelData.airportTransportation];
        updatedAirportTransportation[index] = {
            ...updatedAirportTransportation[index],
            [field]: value
        };
        setHotelData({
            ...hotelData,
            airportTransportation: updatedAirportTransportation
        });
    };
    
    const handleTransportationPriceChange = (index, field, value) => {
        const updatedAirportTransportation = [...hotelData.airportTransportation];
        updatedAirportTransportation[index] = {
            ...updatedAirportTransportation[index],
            transportation: {
                ...updatedAirportTransportation[index].transportation,
                [field]: value
            }
        };
        setHotelData({
            ...hotelData,
            airportTransportation: updatedAirportTransportation
        });
    };

    const handleRoomTypeCheckboxChange = (roomType) => {
        setSelectedRoomTypes({
            ...selectedRoomTypes,
            [roomType]: !selectedRoomTypes[roomType]
        });
        
        // If unchecking, reset price and monthly prices
        if (selectedRoomTypes[roomType]) {
            setRoomTypePrices({
                ...roomTypePrices,
                [roomType]: ""
            });
            
            setRoomTypeChildrenPrices({
                ...roomTypeChildrenPrices,
                [roomType]: ""
            });

            // Reset monthly prices
            const resetMonthlyPrices = {};
            months.forEach(month => {
                resetMonthlyPrices[month] = {
                    adult: 0,
                    child: 0
                };
            });
            
            setMonthlyPrices({
                ...monthlyPrices,
                [roomType]: resetMonthlyPrices
            });

            // Reset room highlights and details
            setRoomHighlights({
                ...roomHighlights,
                [roomType]: []
            });
            
            setRoomDetails({
                ...roomDetails,
                [roomType]: {}
            });
        } else {
            // Initialize room highlights and details for newly checked room types
            setRoomHighlights({
                ...roomHighlights,
                [roomType]: []
            });
            
            setRoomDetails({
                ...roomDetails,
                [roomType]: {
                    size: { value: '', unit: 'sq m' },
                    view: '',
                    sleeps: 1,
                    bedType: '',
                    bathroom: '',
                    balcony: false,
                    airConditioning: false,
                    soundproofed: false,
                    freeWifi: false,
                    minibar: false,
                    safe: false,
                    tv: false,
                    hairdryer: false,
                    bathrobes: false,
                    freeCots: false,
                    smokingAllowed: false,
                    petFriendly: false,
                    accessibleRoom: false
                }
            });
        }
    };

    const handleRoomPriceChange = (roomType, price) => {
        setRoomTypePrices({
            ...roomTypePrices,
            [roomType]: price
        });
    };
    
    const handleChildrenRoomPriceChange = (roomType, price) => {
        setRoomTypeChildrenPrices({
            ...roomTypeChildrenPrices,
            [roomType]: price
        });
    };

    const handleMonthlyPriceChange = (roomType, month, priceType, value) => {
        setMonthlyPrices({
            ...monthlyPrices,
            [roomType]: {
                ...monthlyPrices[roomType],
                [month]: {
                    ...(monthlyPrices[roomType] && monthlyPrices[roomType][month] ? monthlyPrices[roomType][month] : {}),
                    [priceType]: value === '' ? 0 : parseFloat(value)
                }
            }
        });
    };

    const handleAddCustomRoomType = () => {
        const newCustomRoomTypeId = `CUSTOM_${Date.now()}`;
        
        // Add the new custom room type to the list
        setCustomRoomTypes([
            ...customRoomTypes,
            {
                id: newCustomRoomTypeId,
                name: ''
            }
        ]);

        // Initialize states for the new custom room type
        setRoomTypePrices({
            ...roomTypePrices,
            [newCustomRoomTypeId]: ""
        });

        setRoomTypeChildrenPrices({
            ...roomTypeChildrenPrices,
            [newCustomRoomTypeId]: ""
        });

        // Initialize monthly prices
        const emptyMonthlyPrices = {};
        months.forEach(month => {
            emptyMonthlyPrices[month] = {
                adult: 0,
                child: 0
            };
        });

        setMonthlyPrices({
            ...monthlyPrices,
            [newCustomRoomTypeId]: emptyMonthlyPrices
        });

        // Initialize room highlights and details
        setRoomHighlights({
            ...roomHighlights,
            [newCustomRoomTypeId]: []
        });
        
        setRoomDetails({
            ...roomDetails,
            [newCustomRoomTypeId]: {
                size: { value: '', unit: 'sq m' },
                view: '',
                sleeps: 1,
                bedType: '',
                bathroom: '',
                balcony: false,
                airConditioning: false,
                soundproofed: false,
                freeWifi: false,
                minibar: false,
                safe: false,
                tv: false,
                hairdryer: false,
                bathrobes: false,
                freeCots: false,
                smokingAllowed: false,
                petFriendly: false,
                accessibleRoom: false
            }
        });
    };

    const handleRemoveCustomRoomType = (index) => {
        const roomTypeId = customRoomTypes[index].id;
        
        // Create a copy without the removed room type
        const updatedCustomRoomTypes = [...customRoomTypes];
        updatedCustomRoomTypes.splice(index, 1);
        setCustomRoomTypes(updatedCustomRoomTypes);
        
        // Clean up all related state
        const { [roomTypeId]: removedPrice, ...restPrices } = roomTypePrices;
        setRoomTypePrices(restPrices);
        
        const { [roomTypeId]: removedChildrenPrice, ...restChildrenPrices } = roomTypeChildrenPrices;
        setRoomTypeChildrenPrices(restChildrenPrices);
        
        const { [roomTypeId]: removedMonthlyPrices, ...restMonthlyPrices } = monthlyPrices;
        setMonthlyPrices(restMonthlyPrices);
        
        const { [roomTypeId]: removedHighlights, ...restHighlights } = roomHighlights;
        setRoomHighlights(restHighlights);
        
        const { [roomTypeId]: removedDetails, ...restDetails } = roomDetails;
        setRoomDetails(restDetails);
        
        const { [roomTypeId]: removedImages, ...restImages } = roomImages;
        setRoomImages(restImages);
    };

    const handleCustomRoomTypeNameChange = (index, value) => {
        const updatedRoomTypes = [...customRoomTypes];
        updatedRoomTypes[index].name = value;
        setCustomRoomTypes(updatedRoomTypes);
    };

    const handleCustomRoomTypePriceChange = (index, value) => {
        const roomTypeId = customRoomTypes[index].id;
        
        setRoomTypePrices({
            ...roomTypePrices,
            [roomTypeId]: value
        });
    };
    
    const handleCustomRoomTypeChildrenPriceChange = (index, value) => {
        const roomTypeId = customRoomTypes[index].id;
        
        setRoomTypeChildrenPrices({
            ...roomTypeChildrenPrices,
            [roomTypeId]: value
        });
    };

    // Handle amenities save
    const handleAmenitiesSave = (amenities) => {
        setHotelData({
            ...hotelData,
            amenities: amenities
        });
    };

    const handleRoomImagesUploaded = (roomType, images) => {
        setRoomImages(prev => ({
            ...prev,
            [roomType]: images
        }));
    };

    // Room highlights handlers
    const handleAddHighlight = (roomType) => {
        const highlightInput = highlightInputs[roomType] || '';
        if (highlightInput.trim()) {
            setRoomHighlights({
                ...roomHighlights,
                [roomType]: [...(roomHighlights[roomType] || []), highlightInput.trim()]
            });
            setHighlightInputs({
                ...highlightInputs,
                [roomType]: ''
            });
        }
    };

    const handleRemoveHighlight = (roomType, index) => {
        const currentHighlights = roomHighlights[roomType] || [];
        setRoomHighlights({
            ...roomHighlights,
            [roomType]: currentHighlights.filter((_, i) => i !== index)
        });
    };

    const handleHighlightInputChange = (roomType, value) => {
        setHighlightInputs({
            ...highlightInputs,
            [roomType]: value
        });
    };

    // Room details handlers
    const handleRoomDetailChange = (roomType, field, value) => {
        setRoomDetails({
            ...roomDetails,
            [roomType]: {
                ...roomDetails[roomType],
                [field]: value
            }
        });
    };

    const handleRoomSizeChange = (roomType, value) => {
        setRoomDetails({
            ...roomDetails,
            [roomType]: {
                ...roomDetails[roomType],
                size: {
                    ...(roomDetails[roomType]?.size || { unit: 'sq m' }),
                    value: value
                }
            }
        });
    };

    const addRoomTypesToHotelData = () => {
        const roomTypes = [];
        
        // Add all checked standard room types to the data
        Object.keys(selectedRoomTypes).forEach(roomType => {
            if (selectedRoomTypes[roomType] && roomType !== "CUSTOM") {
                const pricePerNight = parseFloat(roomTypePrices[roomType]) || 0;
                const childrenPricePerNight = parseFloat(roomTypeChildrenPrices[roomType]) || 0;
                
                const roomTypeData = {
                    type: roomType,
                    pricePerNight: pricePerNight,
                    childrenPricePerNight: childrenPricePerNight
                };

                // Add monthly prices if they exist
                if (monthlyPrices[roomType]) {
                    roomTypeData.monthlyPrices = monthlyPrices[roomType];
                }

                // Add images if they exist
                if (roomImages[roomType] && roomImages[roomType].length > 0) {
                    roomTypeData.images = roomImages[roomType];
                }

                // Add highlights if they exist
                if (roomHighlights[roomType] && roomHighlights[roomType].length > 0) {
                    roomTypeData.highlights = roomHighlights[roomType];
                }

                // Add details if they exist
                if (roomDetails[roomType]) {
                    roomTypeData.details = roomDetails[roomType];
                }
                
                roomTypes.push(roomTypeData);
            }
        });

        // Add custom room types
        customRoomTypes.forEach(roomType => {
            if (roomType.name && roomTypePrices[roomType.id]) {
                const roomTypeData = {
                    type: roomType.name,
                    pricePerNight: parseFloat(roomTypePrices[roomType.id]) || 0,
                    childrenPricePerNight: parseFloat(roomTypeChildrenPrices[roomType.id]) || 0
                };

                // Add monthly prices if they exist
                if (monthlyPrices[roomType.id]) {
                    roomTypeData.monthlyPrices = monthlyPrices[roomType.id];
                }

                // Add images if they exist
                if (roomImages[roomType.id] && roomImages[roomType.id].length > 0) {
                    roomTypeData.images = roomImages[roomType.id];
                }

                // Add highlights if they exist
                if (roomHighlights[roomType.id] && roomHighlights[roomType.id].length > 0) {
                    roomTypeData.highlights = roomHighlights[roomType.id];
                }

                // Add details if they exist
                if (roomDetails[roomType.id]) {
                    roomTypeData.details = roomDetails[roomType.id];
                }

                roomTypes.push(roomTypeData);
            }
        });
        
        return {
            ...hotelData,
            roomTypes
        };
    };

    const showSuccessMessage = (message) => {
        toast.success(message, {
            duration: 3000,
            style: {
                background: '#22c55e',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#22c55e',
            },
        });
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        
        // Validate slug before submission
        if (hotelData.slug && hotelData.slug.trim()) {
            const validation = validateSlug(hotelData.slug);
            if (!validation.isValid) {
                toast.error(validation.message, {
                    duration: 4000,
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        padding: '16px',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#f44336',
                    },
                });
                return;
            }
        }
        
        const roomTypes = addRoomTypesToHotelData();
        
        if (roomTypes.roomTypes.length === 0) {
            toast.error('Please add at least one room type with price');
            return;
        }
        
        if (roomTypes.airportTransportation.length === 0) {
            if (roomTypes.airport && Object.values(roomTypes.transportation).some(price => price > 0)) {
                roomTypes.airportTransportation.push({
                    airport: roomTypes.airport,
                    transportation: roomTypes.transportation
                });
            }
        } else {
            roomTypes.airport = roomTypes.airportTransportation[0].airport;
            roomTypes.transportation = roomTypes.airportTransportation[0].transportation;
        }
        
        try {
            const finalHotelData = {
                ...roomTypes,
                slug: hotelData.slug ? formatSlug(hotelData.slug) : '', // Final formatting
            };
            
            const response = await axios.put(`/api/hotels/${id}`, finalHotelData);
            const updatedHotel = response.data;
            showSuccessMessage('Hotel updated successfully!');
            setTimeout(() => {
                navigate('/hotels');
            }, 2000);
        } catch (err) {
            toast.error('Failed to update hotel');
            console.log(err);
        }
    };

    if (loading) {
        return (
            <div className="py-8">
                <RahalatekLoader size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="dark:bg-slate-900">
                <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Edit Hotel</h2>
                
                <form onSubmit={handleHotelSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name" value="Hotel Name" /> 
                            </div>
                            <TextInput
                                id="name"
                                name="name"
                                value={hotelData.name}
                                onChange={handleHotelChange}
                                required
                            />
                        </div>

                        <div>
                            <CustomSelect
                                id="hotelCountry"
                                label="Country"
                                value={hotelData.country || ''}
                                onChange={handleCountryChange}
                                options={[
                                    { value: '', label: 'Select Country' },
                                    ...getCountries().map(country => ({ value: country, label: country }))
                                ]}
                                placeholder="Select Country"
                                required
                            />
                        </div>
                        
                        <div>
                            <CustomSelect
                                id="hotelCity"
                                label="City"
                                value={hotelData.city}
                                onChange={(value) => setHotelData({...hotelData, city: value})}
                                options={[
                                    { value: '', label: 'Select City' },
                                    ...getCitiesByCountry(hotelData.country || '').map(city => ({ value: city, label: city }))
                                ]}
                                placeholder="Select City"
                                disabled={!hotelData.country}
                                required
                            />
                            {!hotelData.country && (
                                <p className="text-xs text-gray-500 mt-1">Select a country first</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <CustomSelect
                            id="hotelStars"
                            label="Stars"
                            value={hotelData.stars.toString()}
                            onChange={(value) => setHotelData({...hotelData, stars: parseInt(value)})}
                            options={[
                                { value: "1", label: "1 Star" },
                                { value: "2", label: "2 Stars" },
                                { value: "3", label: "3 Stars" },
                                { value: "4", label: "4 Stars" },
                                { value: "5", label: "5 Stars" }
                            ]}
                            required
                        />
                    </div>
                    
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <Label htmlFor="hotelDesc" value="Description" />
                            <button
                                type="button"
                                onClick={() => toggleTranslationCollapse('description')}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                Translations
                                {translationCollapse.description ? <HiChevronUp /> : <HiChevronDown />}
                            </button>
                        </div>
                        <TextInput
                            id="hotelDesc"
                            name="description"
                            as="textarea"
                            rows={4}
                            value={hotelData.description || ''}
                            onChange={handleHotelChange}
                        />
                        {translationCollapse.description && (
                            <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Note: The field above is in English. Add translations below. Leave empty to use English as fallback.
                                </p>
                                <TextInput
                                    as="textarea"
                                    rows={4}
                                    label="Arabic Translation (Optional)"
                                    placeholder="Leave empty to use English"
                                    value={hotelData.translations.description.ar}
                                    onChange={(e) => handleTranslationChange('description', 'ar', e.target.value)}
                                />
                                <TextInput
                                    as="textarea"
                                    rows={4}
                                    label="French Translation (Optional)"
                                    placeholder="Leave empty to use English"
                                    value={hotelData.translations.description.fr}
                                    onChange={(e) => handleTranslationChange('description', 'fr', e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <Label htmlFor="locationDescription" value="Location Description" />
                            <button
                                type="button"
                                onClick={() => toggleTranslationCollapse('locationDescription')}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                Translations
                                {translationCollapse.locationDescription ? <HiChevronUp /> : <HiChevronDown />}
                            </button>
                        </div>
                        <TextInput
                            id="locationDescription"
                            name="locationDescription"
                            as="textarea"
                            rows={4}
                            value={hotelData.locationDescription || ''}
                            onChange={handleHotelChange}
                        />
                        {translationCollapse.locationDescription && (
                            <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Note: The field above is in English. Add translations below. Leave empty to use English as fallback.
                                </p>
                                <TextInput
                                    as="textarea"
                                    rows={4}
                                    label="Arabic Translation (Optional)"
                                    placeholder="Leave empty to use English"
                                    value={hotelData.translations.locationDescription.ar}
                                    onChange={(e) => handleTranslationChange('locationDescription', 'ar', e.target.value)}
                                />
                                <TextInput
                                    as="textarea"
                                    rows={4}
                                    label="French Translation (Optional)"
                                    placeholder="Leave empty to use English"
                                    value={hotelData.translations.locationDescription.fr}
                                    onChange={(e) => handleTranslationChange('locationDescription', 'fr', e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelRoomTypes" value="Room Types" />
                        </div>
                        <div className="space-y-2 mb-4">
                            {standardRoomTypes.map((roomType) => (
                                <div key={roomType} className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center mb-3">
                                        <Checkbox
                                            id={`roomtype-${roomType}`}
                                            className="mr-2"
                                            checked={selectedRoomTypes[roomType]}
                                            onChange={() => handleRoomTypeCheckboxChange(roomType)}
                                        />
                                        <Label htmlFor={`roomtype-${roomType}`} className="font-medium">
                                            {roomType === "CUSTOM" ? "Custom Room Type" : roomType}
                                        </Label>
                                    </div>
                                    
                                    {selectedRoomTypes[roomType] && (
                                        <div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <Label htmlFor={`price-${roomType}`} value="Base Price per Night" className="mb-1.5" />
                                                    <TextInput
                                                        id={`price-${roomType}`}
                                                        type="number"
                                                        placeholder="Price"
                                                        value={roomTypePrices[roomType]}
                                                        onChange={(e) => handleRoomPriceChange(roomType, e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`child-price-${roomType}`} value="Children (6-12) Price per Night" className="mb-1.5" />
                                                    <TextInput
                                                        id={`child-price-${roomType}`}
                                                        type="number"
                                                        placeholder="Children's Price"
                                                        value={roomTypeChildrenPrices[roomType]}
                                                        onChange={(e) => handleChildrenRoomPriceChange(roomType, e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Room Images */}
                                            <div className="mt-4">
                                                <Label value="Room Images" className="mb-2 block" />
                                                <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                                                    <RoomImageUploader
                                                        onImagesUploaded={(images) => handleRoomImagesUploaded(roomType, images)}
                                                        roomType={roomType}
                                                        maxImages={5}
                                                        existingImages={roomImages[roomType] || []}
                                                    />
                                                </div>
                                            </div>

                                            {/* Room Highlights */}
                                            <div className="mt-4">
                                                <Label value="Room Highlights" className="mb-2 block text-sm font-medium" />
                                                <div className="flex gap-2 mb-3">
                                                    <TextInput
                                                        placeholder="Add a highlight"
                                                        value={highlightInputs[roomType] || ''}
                                                        onChange={(e) => handleHighlightInputChange(roomType, e.target.value)}
                                                        className="flex-1"
                                                        size="sm"
                                                    />
                                                    <CustomButton 
                                                        type="button"
                                                        onClick={() => handleAddHighlight(roomType)}
                                                        variant="purple"
                                                        size="xs"
                                                        icon={HiPlus}
                                                        title="Add highlight to room"
                                                    >
                                                        Add
                                                    </CustomButton>
                                                </div>
                                                
                                                {(roomHighlights[roomType] || []).length > 0 && (
                                                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                                        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Added Highlights:</h4>
                                                        <ul className="space-y-2">
                                                            {(roomHighlights[roomType] || []).map((highlight, index) => (
                                                                <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                                                                    <span className="text-sm text-gray-800 dark:text-gray-200">• {highlight}</span>
                                                                    <CustomButton
                                                                        variant="red"
                                                                        size="xs"
                                                                        onClick={() => handleRemoveHighlight(roomType, index)}
                                                                        icon={HiX}
                                                                        title="Remove highlight"
                                                                    />
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Room Details & Amenities */}
                                            <div className="mt-4">
                                                <Accordion collapseAll>
                                                    <Accordion.Panel>
                                                        <Accordion.Title className="flex items-center">
                                                            <HiPlus className="mr-2" />
                                                            Room Details & Amenities
                                                        </Accordion.Title>
                                                        <Accordion.Content>
                                                            <div className="space-y-4">
                                                                {/* Basic Details */}
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <Label value="Size (sq m)" className="mb-1 block text-sm" />
                                                                        <TextInput
                                                                            type="number"
                                                                            size="sm"
                                                                            placeholder="23"
                                                                            value={roomDetails[roomType]?.size?.value || ""}
                                                                            onChange={(e) => handleRoomSizeChange(roomType, e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label value="Sleeps" className="mb-1 block text-sm" />
                                                                        <CustomSelect
                                                                            value={roomDetails[roomType]?.sleeps || 1}
                                                                            onChange={(value) => handleRoomDetailChange(roomType, 'sleeps', parseInt(value))}
                                                                            options={[
                                                                                { value: 1, label: '1 Guest' },
                                                                                { value: 2, label: '2 Guests' },
                                                                                { value: 3, label: '3 Guests' },
                                                                                { value: 4, label: '4 Guests' },
                                                                                { value: 5, label: '5 Guests' },
                                                                                { value: 6, label: '6 Guests' }
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <Label value="View" className="mb-1 block text-sm" />
                                                                        <TextInput
                                                                            size="sm"
                                                                            placeholder="Sea view, City view, etc."
                                                                            value={roomDetails[roomType]?.view || ""}
                                                                            onChange={(e) => handleRoomDetailChange(roomType, 'view', e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label value="Bed Type" className="mb-1 block text-sm" />
                                                                        <TextInput
                                                                            size="sm"
                                                                            placeholder="1 Double Bed, Twin beds, etc."
                                                                            value={roomDetails[roomType]?.bedType || ""}
                                                                            onChange={(e) => handleRoomDetailChange(roomType, 'bedType', e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Amenities Checkboxes */}
                                                                <div>
                                                                    <Label value="Room Amenities" className="mb-2 block text-sm font-medium" />
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {[
                                                                            { key: 'balcony', label: 'Balcony' },
                                                                            { key: 'airConditioning', label: 'Air conditioning' },
                                                                            { key: 'soundproofed', label: 'Soundproofed' },
                                                                            { key: 'freeWifi', label: 'Free WiFi' },
                                                                            { key: 'minibar', label: 'Minibar' },
                                                                            { key: 'tv', label: 'LCD TV' },
                                                                            { key: 'hairdryer', label: 'Hairdryer' },
                                                                            { key: 'bathrobes', label: 'Bathrobes' },
                                                                            { key: 'freeCots', label: 'Free cots/infant beds' },
                                                                            { key: 'safe', label: 'Safe' }
                                                                        ].map(({ key, label }) => (
                                                                            <div key={key} className="flex items-center gap-2">
                                                                                <Checkbox
                                                                                    id={`${roomType}-${key}`}
                                                                                    checked={roomDetails[roomType]?.[key] || false}
                                                                                    onChange={(e) => handleRoomDetailChange(roomType, key, e.target.checked)}
                                                                                />
                                                                                <Label htmlFor={`${roomType}-${key}`} className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    {label}
                                                                                </Label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Accordion.Content>
                                                    </Accordion.Panel>
                                                </Accordion>
                                            </div>
                                            
                                            {/* Monthly Pricing Accordion */}
                                            <div className="mt-4">
                                                <Accordion collapseAll>
                                                    <Accordion.Panel>
                                                        <Accordion.Title className="flex items-center">
                                                            <HiCalendar className="mr-2" /> 
                                                            Monthly Pricing Options
                                                        </Accordion.Title>
                                                        <Accordion.Content>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                                Set specific prices for different months. If a month's price is 0, the base price will be used.
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {months.map((month, index) => (
                                                                    <div key={month} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                                        <div className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                                                                            {monthLabels[index]}
                                                                        </div>
                                                                        
                                                                        <div className="mb-2">
                                                                            <Label htmlFor={`${roomType}-${month}-adult`} value="Adult Price" size="sm" className="mb-1" />
                                                                            <TextInput
                                                                                id={`${roomType}-${month}-adult`}
                                                                                type="number"
                                                                                size="sm"
                                                                                placeholder="Adult price"
                                                                                value={monthlyPrices[roomType][month]?.adult || ""}
                                                                                onChange={(e) => handleMonthlyPriceChange(roomType, month, 'adult', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        
                                                                        <div>
                                                                            <Label htmlFor={`${roomType}-${month}-child`} value="Child Price (6-12)" size="sm" className="mb-1" />
                                                                            <TextInput
                                                                                id={`${roomType}-${month}-child`}
                                                                                type="number"
                                                                                size="sm"
                                                                                placeholder="Child price"
                                                                                value={monthlyPrices[roomType][month]?.child || ""}
                                                                                onChange={(e) => handleMonthlyPriceChange(roomType, month, 'child', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </Accordion.Content>
                                                    </Accordion.Panel>
                                                </Accordion>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            <div>
                                <h3 className="text-md font-medium mb-2 text-blue-600 dark:text-teal-400">Custom Room Types</h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <Checkbox
                                        id="roomType-CUSTOM"
                                        checked={selectedRoomTypes["CUSTOM"]}
                                        onChange={() => handleRoomTypeCheckboxChange("CUSTOM")}
                                    />
                                    <Label htmlFor="roomType-CUSTOM" className="font-medium text-sm">Add custom room type(s)</Label>
                                </div>
                                
                                {selectedRoomTypes["CUSTOM"] && (
                                    <div className="w-full mt-3">
                                        {customRoomTypes.length === 0 && (
                                            <div className="mb-4 p-4 border border-dashed border-purple-300 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-slate-900 flex flex-col items-center justify-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">No custom room types added yet</p>
                                                <CustomButton
                                                    onClick={handleAddCustomRoomType}
                                                    variant="purple"
                                                    size="xs"
                                                    icon={HiPlus}
                                                    title="Add a custom room type"
                                                >
                                                    Add Custom Room Type
                                                </CustomButton>
                                            </div>
                                        )}
                                        
                                        {customRoomTypes.map((roomType, index) => (
                                            <div 
                                                key={roomType.id}
                                                className="flex flex-col w-full gap-2 mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900 shadow-sm"
                                            >
                                                <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                                                    <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">Custom Room Type {index + 1}</h4>
                                                    <CustomButton
                                                        onClick={() => handleRemoveCustomRoomType(index)}
                                                        variant="red"
                                                        size="xs"
                                                        icon={HiX}
                                                        title="Remove this custom room type"
                                                    />
                                                </div>
                                                
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs font-medium">Room Type Name:</Label>
                                                        <TextInput
                                                            className="shadow-sm text-sm"
                                                            size="sm"
                                                            placeholder="Enter custom room type name"
                                                            value={roomType.name}
                                                            onChange={(e) => handleCustomRoomTypeNameChange(index, e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs font-medium">Adult Price per Night:</Label>
                                                        <TextInput
                                                            type="number"
                                                            className="shadow-sm text-sm"
                                                            size="sm"
                                                            placeholder="Price per night"
                                                            value={roomTypePrices[roomType.id] || ''}
                                                            onChange={(e) => handleCustomRoomTypePriceChange(index, e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs font-medium">Children (6-12) Price:</Label>
                                                        <TextInput
                                                            type="number"
                                                            className="shadow-sm text-sm"
                                                            size="sm"
                                                            placeholder="Additional fee"
                                                            value={roomTypeChildrenPrices[roomType.id] || ''}
                                                            onChange={(e) => handleCustomRoomTypeChildrenPriceChange(index, e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Room Images */}
                                                    <div className="mt-3">
                                                        <Label className="text-xs font-medium mb-2 block">Room Images</Label>
                                                        <RoomImageUploader
                                                            onImagesUploaded={(images) => handleRoomImagesUploaded(roomType.id, images)}
                                                            roomType={roomType.name || `Custom Room ${index + 1}`}
                                                            maxImages={5}
                                                            existingImages={roomImages[roomType.id] || []}
                                                        />
                                                    </div>

                                                    {/* Room Highlights */}
                                                    <div className="mt-3">
                                                        <Label className="text-xs font-medium mb-2 block">Room Highlights</Label>
                                                        <div className="flex gap-2 mb-3">
                                                            <TextInput
                                                                placeholder="Add a highlight"
                                                                value={highlightInputs[roomType.id] || ''}
                                                                onChange={(e) => handleHighlightInputChange(roomType.id, e.target.value)}
                                                                className="flex-1"
                                                                size="sm"
                                                            />
                                                            <CustomButton 
                                                                type="button"
                                                                onClick={() => handleAddHighlight(roomType.id)}
                                                                variant="purple"
                                                                size="xs"
                                                                icon={HiPlus}
                                                                title="Add highlight to room"
                                                            >
                                                                Add
                                                            </CustomButton>
                                                        </div>
                                                        
                                                        {(roomHighlights[roomType.id] || []).length > 0 && (
                                                            <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                                                <h5 className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">Added Highlights:</h5>
                                                                <ul className="space-y-1">
                                                                    {(roomHighlights[roomType.id] || []).map((highlight, highlightIndex) => (
                                                                        <li key={highlightIndex} className="flex justify-between items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                                                                            <span className="text-xs text-gray-800 dark:text-gray-200">• {highlight}</span>
                                                                            <CustomButton
                                                                                variant="red"
                                                                                size="xs"
                                                                                onClick={() => handleRemoveHighlight(roomType.id, highlightIndex)}
                                                                                icon={HiX}
                                                                                title="Remove highlight"
                                                                            />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Room Details & Amenities */}
                                                    <div className="mt-3">
                                                        <Accordion collapseAll className="border-none">
                                                            <Accordion.Panel>
                                                                <Accordion.Title className="text-xs font-medium p-2 bg-gray-100 dark:bg-slate-800 flex items-center">
                                                                    <HiPlus className="mr-2" size={14} />
                                                                    Room Details & Amenities
                                                                </Accordion.Title>
                                                                <Accordion.Content className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700">
                                                                    <div className="space-y-3">
                                                                        {/* Basic Details */}
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div>
                                                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Size (sq m)</Label>
                                                                                <TextInput
                                                                                    type="number"
                                                                                    size="sm"
                                                                                    placeholder="23"
                                                                                    value={roomDetails[roomType.id]?.size?.value || ""}
                                                                                    onChange={(e) => handleRoomSizeChange(roomType.id, e.target.value)}
                                                                                    className="text-xs"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Sleeps</Label>
                                                                                <CustomSelect
                                                                                    value={roomDetails[roomType.id]?.sleeps || 1}
                                                                                    onChange={(value) => handleRoomDetailChange(roomType.id, 'sleeps', parseInt(value))}
                                                                                    options={[
                                                                                        { value: 1, label: '1 Guest' },
                                                                                        { value: 2, label: '2 Guests' },
                                                                                        { value: 3, label: '3 Guests' },
                                                                                        { value: 4, label: '4 Guests' },
                                                                                        { value: 5, label: '5 Guests' },
                                                                                        { value: 6, label: '6 Guests' }
                                                                                    ]}
                                                                                    className="text-xs"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div>
                                                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">View</Label>
                                                                                <TextInput
                                                                                    size="sm"
                                                                                    placeholder="Sea view, City view, etc."
                                                                                    value={roomDetails[roomType.id]?.view || ""}
                                                                                    onChange={(e) => handleRoomDetailChange(roomType.id, 'view', e.target.value)}
                                                                                    className="text-xs"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Bed Type</Label>
                                                                                <TextInput
                                                                                    size="sm"
                                                                                    placeholder="1 Double Bed, Twin beds, etc."
                                                                                    value={roomDetails[roomType.id]?.bedType || ""}
                                                                                    onChange={(e) => handleRoomDetailChange(roomType.id, 'bedType', e.target.value)}
                                                                                    className="text-xs"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Amenities Checkboxes */}
                                                                        <div>
                                                                            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Room Amenities</Label>
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {[
                                                                                    { key: 'balcony', label: 'Balcony' },
                                                                                    { key: 'airConditioning', label: 'Air conditioning' },
                                                                                    { key: 'soundproofed', label: 'Soundproofed' },
                                                                                    { key: 'freeWifi', label: 'Free WiFi' },
                                                                                    { key: 'minibar', label: 'Minibar' },
                                                                                    { key: 'tv', label: 'LCD TV' },
                                                                                    { key: 'hairdryer', label: 'Hairdryer' },
                                                                                    { key: 'bathrobes', label: 'Bathrobes' },
                                                                                    { key: 'freeCots', label: 'Free cots/infant beds' },
                                                                                    { key: 'safe', label: 'Safe' }
                                                                                ].map(({ key, label }) => (
                                                                                    <div key={key} className="flex items-center gap-1">
                                                                                        <Checkbox
                                                                                            id={`${roomType.id}-${key}`}
                                                                                            checked={roomDetails[roomType.id]?.[key] || false}
                                                                                            onChange={(e) => handleRoomDetailChange(roomType.id, key, e.target.checked)}
                                                                                            className="scale-75"
                                                                                        />
                                                                                        <Label htmlFor={`${roomType.id}-${key}`} className="text-xs text-gray-600 dark:text-gray-400">
                                                                                            {label}
                                                                                        </Label>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Accordion.Content>
                                                            </Accordion.Panel>
                                                        </Accordion>
                                                    </div>
                                                    
                                                    {/* Monthly pricing accordion for custom room types */}
                                                    <div className="mt-2">
                                                        <Accordion collapseAll className="border-none">
                                                            <Accordion.Panel>
                                                                <Accordion.Title className="text-xs font-medium p-2 bg-gray-100 dark:bg-slate-800 flex items-center">
                                                                    <HiCalendar className="mr-2" size={14} />
                                                                    Monthly Pricing Options
                                                                </Accordion.Title>
                                                                <Accordion.Content className="p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                                        Set different prices for specific months. If a month's price is 0, the base price will be used.
                                                                    </p>
                                                        
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                        {months.map((month, monthIndex) => (
                                                                            <div key={month} className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                                                                                <div className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                                                    {monthLabels[monthIndex]}
                                                                                </div>
                                                                                
                                                                                <div className="mb-1">
                                                                                    <Label htmlFor={`${roomType.id}-${month}-adult`} value="Adult" className="text-xs mb-0.5" />
                                                                                    <TextInput
                                                                                        id={`${roomType.id}-${month}-adult`}
                                                                                        type="number"
                                                                                        size="sm"
                                                                                        placeholder="Adult price"
                                                                                        value={monthlyPrices[roomType.id] && monthlyPrices[roomType.id][month] ? monthlyPrices[roomType.id][month].adult || "" : ""}
                                                                                        onChange={(e) => handleMonthlyPriceChange(roomType.id, month, 'adult', e.target.value)}
                                                                                        className="text-xs"
                                                                                    />
                                                                                </div>
                                                                                
                                                                                <div>
                                                                                    <Label htmlFor={`${roomType.id}-${month}-child`} value="Child (6-12)" className="text-xs mb-0.5" />
                                                                                    <TextInput
                                                                                        id={`${roomType.id}-${month}-child`}
                                                                                        type="number"
                                                                                        size="sm"
                                                                                        placeholder="Child price"
                                                                                        value={monthlyPrices[roomType.id] && monthlyPrices[roomType.id][month] ? monthlyPrices[roomType.id][month].child || "" : ""}
                                                                                        onChange={(e) => handleMonthlyPriceChange(roomType.id, month, 'child', e.target.value)}
                                                                                        className="text-xs"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </Accordion.Content>
                                                            </Accordion.Panel>
                                                        </Accordion>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {customRoomTypes.length > 0 && (
                                            <div className="flex justify-center mt-2 mb-2">
                                                <CustomButton
                                                    onClick={handleAddCustomRoomType}
                                                    variant="purple"
                                                    size="xs"
                                                    icon={HiPlus}
                                                    title="Add another custom room type"
                                                >
                                                    Add Another Custom Room Type
                                                </CustomButton>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        {hotelData.breakfastIncluded && (
                            <div className="mt-4">
                                <div className="mb-2 block">
                                    <Label htmlFor="breakfastPrice" value="Breakfast Price per Room ($)" />
                                </div>
                                <TextInput
                                    id="breakfastPrice"
                                    type="number"
                                    name="breakfastPrice"
                                    value={hotelData.breakfastPrice?.toString() || ''}
                                    onChange={handleHotelChange}
                                    placeholder="Price per room"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label value="Airport Transportation" className="text-lg font-semibold" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add transportation prices for airports serving this hotel</p>
                        </div>
                        
                        {/* For backwards compatibility */}
                        <div className="hidden">
                            <Select
                                id="airport"
                                name="airport"
                                value={hotelData.airport || ''}
                                onChange={handleHotelChange}
                            >
                                <option value="">Select Airport</option>
                                {airports.map(airport => (
                                    <option key={airport._id} value={airport.name}>
                                        {airport.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        
                        {/* Multiple airport transportation options */}
                        <div className="mb-4">
                            {hotelData.airportTransportation.length === 0 ? (
                                <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800 mb-4">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">No airport transportation options added</p>
                                    <CustomButton size="sm" onClick={handleAddAirportTransportation} variant="blue" icon={HiPlus}>
                                        Add Airport Transportation
                                    </CustomButton>
                                </div>
                            ) : (
                                <>
                                    {hotelData.airportTransportation.map((item, index) => (
                                        <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-medium text-gray-900 dark:text-white">Airport #{index + 1}</h4>
                                                <CustomButton variant="red" size="xs" onClick={() => handleRemoveAirportTransportation(index)} icon={HiTrash}>
                                                    Remove
                                                </CustomButton>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <CustomSelect
                                                    id={`airport-${index}`}
                                                    label="Select Airport"
                                                    value={item.airport}
                                                    onChange={(value) => handleAirportTransportationChange(index, 'airport', value)}
                                                    options={[
                                                        { value: "", label: "Select Airport" },
                                                        ...airports.map((airport) => ({
                                                            value: airport.name,
                                                            label: airport.name
                                                        }))
                                                    ]}
                                                    placeholder="Select Airport"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Transportation Pricing (per vehicle)</h5>
                                                <div className="grid grid-cols-2 gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg">
                                                    <div>
                                                        <Label htmlFor={`vito-reception-${index}`} value="Vito Reception Price ($)" size="sm" className="mb-1" />
                                                        <TextInput
                                                            id={`vito-reception-${index}`}
                                                            type="number"
                                                            size="sm"
                                                            value={item.transportation.vitoReceptionPrice?.toString() || ''}
                                                            onChange={(e) => handleTransportationPriceChange(index, 'vitoReceptionPrice', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`vito-farewell-${index}`} value="Vito Farewell Price ($)" size="sm" className="mb-1" />
                                                        <TextInput
                                                            id={`vito-farewell-${index}`}
                                                            type="number"
                                                            size="sm"
                                                            value={item.transportation.vitoFarewellPrice?.toString() || ''}
                                                            onChange={(e) => handleTransportationPriceChange(index, 'vitoFarewellPrice', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`sprinter-reception-${index}`} value="Sprinter Reception Price ($)" size="sm" className="mb-1" />
                                                        <TextInput
                                                            id={`sprinter-reception-${index}`}
                                                            type="number"
                                                            size="sm"
                                                            value={item.transportation.sprinterReceptionPrice?.toString() || ''}
                                                            onChange={(e) => handleTransportationPriceChange(index, 'sprinterReceptionPrice', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`sprinter-farewell-${index}`} value="Sprinter Farewell Price ($)" size="sm" className="mb-1" />
                                                        <TextInput
                                                            id={`sprinter-farewell-${index}`}
                                                            type="number"
                                                            size="sm"
                                                            value={item.transportation.sprinterFarewellPrice?.toString() || ''}
                                                            onChange={(e) => handleTransportationPriceChange(index, 'sprinterFarewellPrice', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`bus-reception-${index}`} value="Bus Reception Price ($)" size="sm" className="mb-1" />
                                                        <TextInput
                                                            id={`bus-reception-${index}`}
                                                            type="number"
                                                            size="sm"
                                                            value={item.transportation.busReceptionPrice?.toString() || ''}
                                                            onChange={(e) => handleTransportationPriceChange(index, 'busReceptionPrice', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`bus-farewell-${index}`} value="Bus Farewell Price ($)" size="sm" className="mb-1" />
                                                        <TextInput
                                                            id={`bus-farewell-${index}`}
                                                            type="number"
                                                            size="sm"
                                                            value={item.transportation.busFarewellPrice?.toString() || ''}
                                                            onChange={(e) => handleTransportationPriceChange(index, 'busFarewellPrice', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="text-center mt-3">
                                        <CustomButton size="sm" onClick={handleAddAirportTransportation} variant="blue" icon={HiPlus}>
                                            Add Another Airport
                                        </CustomButton>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* For backwards compatibility - keep the old transportation form */}
                        <div className="hidden">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Airport Transportation Pricing (per vehicle)</h3>
                            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="vitoReceptionPrice" value="Vito Reception Price ($)" />
                                    </div>
                                    <TextInput
                                        id="vitoReceptionPrice"
                                        type="number"
                                    value={hotelData.transportation.vitoReceptionPrice?.toString() || ''}
                                    onChange={(e) => handleTransportationChange('vitoReceptionPrice', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="vitoFarewellPrice" value="Vito Farewell Price ($)" />
                                    </div>
                                    <TextInput
                                        id="vitoFarewellPrice"
                                        type="number"
                                    value={hotelData.transportation.vitoFarewellPrice?.toString() || ''}
                                    onChange={(e) => handleTransportationChange('vitoFarewellPrice', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="sprinterReceptionPrice" value="Sprinter Reception Price ($)" />
                                    </div>
                                    <TextInput
                                        id="sprinterReceptionPrice"
                                        type="number"
                                    value={hotelData.transportation.sprinterReceptionPrice?.toString() || ''}
                                    onChange={(e) => handleTransportationChange('sprinterReceptionPrice', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="sprinterFarewellPrice" value="Sprinter Farewell Price ($)" />
                                    </div>
                                    <TextInput
                                        id="sprinterFarewellPrice"
                                        type="number"
                                    value={hotelData.transportation.sprinterFarewellPrice?.toString() || ''}
                                    onChange={(e) => handleTransportationChange('sprinterFarewellPrice', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Vito: 2-8 persons, Sprinter: 9-16 persons, Bus: +16 persons
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 my-4">
                        <Checkbox
                            id="breakfastIncluded"
                            name="breakfastIncluded"
                            checked={hotelData.breakfastIncluded}
                            onChange={handleHotelChange}
                        />
                        <Label htmlFor="breakfastIncluded">Breakfast Included</Label>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg my-4">
                        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Children Pricing Policy</h3>
                        <ul className="list-disc pl-5 text-blue-700 dark:text-blue-300 text-sm">
                            <li>Children under 6 years: <strong>Free accommodation</strong></li>
                            <li>Children 6-12 years: <strong>Additional fee</strong> as specified per room type</li>
                            <li>Children above 12 years: <strong>Adult price</strong></li>
                        </ul>
                        <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            The additional fee for children 6-12 years is a per night charge added to the room price.
                        </p>
                    </div>
                    
                    {/* Hotel Images */}
                    <div>
                        <div className="mb-2 block">
                            <Label value="Hotel Images" className="text-sm font-medium text-gray-700 dark:text-gray-200" />
                        </div>
                        <ImageUploader
                            onImagesUploaded={(images) => setHotelData({...hotelData, images})}
                            folder="hotels"
                            maxImages={10}
                            existingImages={hotelData.images || []}
                        />
                    </div>

                    {/* Custom URL Slug */}
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelSlug" value="Custom URL Slug (Optional)" className="text-sm font-medium text-gray-700 dark:text-gray-200" />
                        </div>
                        <TextInput
                            id="hotelSlug"
                            name="slug"
                            value={hotelData.slug}
                            onChange={handleSlugChange}
                            placeholder="e.g., grand-hotel-istanbul"
                            className={slugError ? 'border-red-500' : ''}
                        />
                        {slugError && (
                            <p className="text-red-500 text-xs mt-1">{slugError}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                            Preview: <span className="font-mono">/hotels/{getSlugPreview(hotelData.slug, hotelData.name)}</span>
                        </p>
                    </div>
                    
                    {/* Hotel Amenities & Services */}
                    <div>
                        <div className="mb-2 block">
                            <Label value="Amenities & Services" className="text-sm font-medium text-gray-700 dark:text-gray-200" />
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Configure Hotel Services
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {Object.values(hotelData.amenities || {}).some(category => 
                                        typeof category === 'object' && Object.values(category).some(val => val === true)
                                    ) ? 'Amenities configured' : 'No amenities selected'}
                                </span>
                            </div>
                            <CustomButton
                                type="button"
                                variant="blueToTeal"
                                size="sm"
                                onClick={() => setAmenitiesModalOpen(true)}
                            >
                                Configure Services
                            </CustomButton>
                        </div>
                    </div>

                    {/* Hotel FAQs */}
                    <div>
                        <Label htmlFor="faqs" value="Hotel FAQs" className="mb-3 block" />
                        <div className="space-y-4">
                            {hotelData.faqs.map((faq, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white">FAQ #{index + 1}</h4>
                                        <CustomButton 
                                            variant="red"
                                            size="xs"
                                            onClick={() => handleRemoveFaq(index)}
                                            icon={HiTrash}
                                            title="Remove FAQ"
                                        >
                                            Remove
                                        </CustomButton>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <TextInput
                                                label="Question"
                                                value={faq.question}
                                                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                                placeholder="Enter FAQ question"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <TextInput
                                                label="Answer"
                                                as="textarea"
                                                rows={3}
                                                value={faq.answer}
                                                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                                placeholder="Enter FAQ answer"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <CustomButton
                                variant="blue"
                                size="sm"
                                onClick={handleAddFaq}
                                icon={HiPlus}
                            >
                                Add FAQ
                            </CustomButton>
                        </div>
                    </div>
                    
                    <CustomButton type="submit" variant="pinkToOrange">
                        Update Hotel
                    </CustomButton>
                </form>
            </Card>

            {/* Hotel Amenities Modal */}
            <HotelAmenitiesModal
                isOpen={amenitiesModalOpen}
                onClose={() => setAmenitiesModalOpen(false)}
                amenities={hotelData.amenities}
                onSave={handleAmenitiesSave}
            />
        </div>
    );
} 