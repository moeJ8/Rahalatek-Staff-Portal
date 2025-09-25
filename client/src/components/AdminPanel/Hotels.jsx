import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Checkbox, Card, Label, Select, Textarea, Accordion } from 'flowbite-react'
import { HiPlus, HiX, HiTrash, HiDuplicate, HiCalendar } from 'react-icons/hi'
import toast from 'react-hot-toast'
import CustomButton from '../CustomButton'
import CustomSelect from '../Select'
import TextInput from '../TextInput'
import RahalatekLoader from '../RahalatekLoader'
import CustomModal from '../CustomModal'
import SearchableSelect from '../SearchableSelect'
import ImageUploader from '../ImageUploader'
import RoomImageUploader from '../RoomImageUploader'
import HotelAmenitiesModal from '../HotelAmenitiesModal'
import { getCountries, getCitiesByCountry } from '../../utils/countryCities'



export default function Hotels() {
    const [hotelData, setHotelData] = useState({
        name: '',
        country: '',
        city: '',
        stars: '',
        roomTypes: [],
        breakfastIncluded: false,
        breakfastPrice: '',
        transportation: {
            vitoReceptionPrice: '',
            vitoFarewellPrice: '',
            sprinterReceptionPrice: '',
            sprinterFarewellPrice: ''
        },
        airport: '',
        airportTransportation: [],
        description: '',
        locationDescription: '',
        images: [],
        amenities: {},
        faqs: []
    });
    const [customRoomTypes, setCustomRoomTypes] = useState([]);
    const [roomImages, setRoomImages] = useState({});
    const [hotels, setHotels] = useState([]);
    const [selectedHotelToDuplicate, setSelectedHotelToDuplicate] = useState('');
    const [useCustomHotelCity, setUseCustomHotelCity] = useState(false);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
    const [airports, setAirports] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
    
    // Room highlights and details state
    const [roomHighlights, setRoomHighlights] = useState({});
    const [roomDetails, setRoomDetails] = useState({});
    const [highlightInputs, setHighlightInputs] = useState({}); // Store highlight input for each room type

    // Fetch airports data on component mount
    useEffect(() => {
        const fetchAirports = async () => {
            try {
                const response = await axios.get('/api/airports');
                setAirports(response.data);
            } catch (err) {
                console.error('Failed to fetch airports:', err);
            }
        };
        
        fetchAirports();
    }, []);

    const getAirportOptions = () => {
        return airports.map(airport => ({
            value: airport.name,
            label: `${airport.name} (${airport.arabicName})`
        }));
    };

      // Standard room types for hotels
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

    // Initialize monthly prices for each room type
    const [monthlyPrices, setMonthlyPrices] = useState({
        "SINGLE ROOM": {},
        "DOUBLE ROOM": {},
        "TRIPLE ROOM": {},
        "FAMILY SUITE": {},
        "CUSTOM": {}
    });

    const fetchHotels = async () => {
        setModalLoading(true);
        try {
            const response = await axios.get('/api/hotels');
            setHotels(response.data);
        } catch (err) {
            console.error('Failed to fetch hotels:', err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleHotelChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHotelData({
            ...hotelData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const toggleCustomHotelCity = () => {
        setUseCustomHotelCity(!useCustomHotelCity);
        // Reset city value when toggling
        setHotelData({
            ...hotelData,
            city: ''
        });
    };

    // Handle amenities save
    const handleAmenitiesSave = (amenities) => {
        setHotelData({
            ...hotelData,
            amenities: amenities
        });
    };

    // Handle country change and reset city
    const handleCountryChange = (country) => {
        setHotelData({
            ...hotelData,
            country: country,
            city: '' // Reset city when country changes
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
            // Initialize monthly prices for newly checked room types
            const initialMonthlyPrices = {};
            months.forEach(month => {
                initialMonthlyPrices[month] = {
                    adult: 0,
                    child: 0
                };
            });
            
            setMonthlyPrices({
                ...monthlyPrices,
                [roomType]: initialMonthlyPrices
            });
            
            // Initialize room highlights and details
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

    const handleMonthlyPriceChange = (roomType, month, priceType, value) => {
        setMonthlyPrices({
            ...monthlyPrices,
            [roomType]: {
                ...monthlyPrices[roomType],
                [month]: {
                    ...monthlyPrices[roomType][month],
                    [priceType]: value === '' ? 0 : parseFloat(value)
                }
            }
        });
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
        
        // Initialize the price fields for this room type
        setRoomTypePrices({
            ...roomTypePrices,
            [newCustomRoomTypeId]: ''
        });
        
        setRoomTypeChildrenPrices({
            ...roomTypeChildrenPrices,
            [newCustomRoomTypeId]: ''
        });

        // Initialize monthly prices for the new custom room type
        const initialMonthlyPrices = {};
        months.forEach(month => {
            initialMonthlyPrices[month] = {
                adult: 0,
                child: 0
            };
        });
        
        setMonthlyPrices({
            ...monthlyPrices,
            [newCustomRoomTypeId]: initialMonthlyPrices
        });
    };

    const handleRemoveCustomRoomType = (index) => {
        const roomTypeId = customRoomTypes[index].id;
        
        // Create a copy without the removed room type
        const updatedCustomRoomTypes = [...customRoomTypes];
        updatedCustomRoomTypes.splice(index, 1);
        setCustomRoomTypes(updatedCustomRoomTypes);
        
        // Remove the prices for this room type
        const updatedRoomTypePrices = { ...roomTypePrices };
        delete updatedRoomTypePrices[roomTypeId];
        setRoomTypePrices(updatedRoomTypePrices);
        
        const updatedRoomTypeChildrenPrices = { ...roomTypeChildrenPrices };
        delete updatedRoomTypeChildrenPrices[roomTypeId];
        setRoomTypeChildrenPrices(updatedRoomTypeChildrenPrices);

        // Remove monthly prices for this room type
        const updatedMonthlyPrices = { ...monthlyPrices };
        delete updatedMonthlyPrices[roomTypeId];
        setMonthlyPrices(updatedMonthlyPrices);
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
                    ...roomDetails[roomType]?.size,
                    value: value
                }
            }
        });
    };

    const addRoomTypesToHotelData = () => {
        const roomTypes = [];
        
        // Add standard room types
        standardRoomTypes.forEach(roomType => {
            if (selectedRoomTypes[roomType] && roomTypePrices[roomType]) {
                const roomTypeData = {
                    type: roomType,
                    pricePerNight: Number(roomTypePrices[roomType]),
                    childrenPricePerNight: Number(roomTypeChildrenPrices[roomType] || 0)
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
                    pricePerNight: Number(roomTypePrices[roomType.id]),
                    childrenPricePerNight: Number(roomTypeChildrenPrices[roomType.id] || 0)
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
        
        return roomTypes;
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        try {
            // Get room types from the form
            const roomTypes = addRoomTypesToHotelData();
            
            // Create a new hotel data object with the room types included
            const hotelDataWithRoomTypes = {
                ...hotelData,
                roomTypes: roomTypes
            };
            
            // Send the updated hotel data to the API
            await axios.post('/api/hotels', hotelDataWithRoomTypes);
            
            // Reset the form
            setHotelData({
                name: '',
                country: '',
                city: '',
                stars: '',
                roomTypes: [],
                breakfastIncluded: false,
                breakfastPrice: '',
                transportation: {
                    vitoReceptionPrice: '',
                    vitoFarewellPrice: '',
                    sprinterReceptionPrice: '',
                    sprinterFarewellPrice: ''
                },
                airport: '',
                airportTransportation: [],
                description: '',
                images: [],
                amenities: {}
            });
            
            // Reset room type related states
            setSelectedRoomTypes({
                "SINGLE ROOM": false,
                "DOUBLE ROOM": false,
                "TRIPLE ROOM": false,
                "FAMILY SUITE": false,
                "CUSTOM": false
            });
            
            setRoomTypePrices({
                "SINGLE ROOM": "",
                "DOUBLE ROOM": "",
                "TRIPLE ROOM": "",
                "FAMILY SUITE": "",
                "CUSTOM": ""
            });
            
            setRoomTypeChildrenPrices({
                "SINGLE ROOM": "",
                "DOUBLE ROOM": "",
                "TRIPLE ROOM": "",
                "FAMILY SUITE": "",
                "CUSTOM": ""
            });
            
            setCustomRoomTypes([]);
            
            toast.success('Hotel added successfully!', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#4CAF50',
                },
            });
        } catch (err) {
            toast.error('Failed to add hotel', {
                duration: 3000,
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
            console.log(err);
        }
    };

    const handleAddAirportTransportation = () => {
        setHotelData({
            ...hotelData,
            airportTransportation: [
                ...hotelData.airportTransportation,
                {
                    airport: '',
                    transportation: {
                        vitoReceptionPrice: '',
                        vitoFarewellPrice: '',
                        sprinterReceptionPrice: '',
                        sprinterFarewellPrice: '',
                        busReceptionPrice: '',
                        busFarewellPrice: ''
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

    // Function to open duplicate modal
    const openDuplicateModal = () => {
        setDuplicateModalOpen(true);
        // Fetch hotels only when modal is opened
        if (hotels.length === 0) {
            fetchHotels();
        }
    };
    
    // Function to close duplicate modal
    const closeDuplicateModal = () => {
        setDuplicateModalOpen(false);
        setSelectedHotelToDuplicate('');
    };

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

    // Function to handle hotel duplication
    const handleDuplicateHotel = () => {
        if (!selectedHotelToDuplicate) return;
        
        const hotelToDuplicate = hotels.find(hotel => hotel._id === selectedHotelToDuplicate);
        if (!hotelToDuplicate) return;
        
        // Prepare new custom room types for the duplicated hotel
        const newCustomRoomTypes = [];
        const newSelectedRoomTypes = { ...selectedRoomTypes };
        const newRoomTypePrices = { ...roomTypePrices };
        const newRoomTypeChildrenPrices = { ...roomTypeChildrenPrices };
        const newMonthlyPrices = { ...monthlyPrices };
        
        // Prepare room images, highlights, and details objects
        const newRoomImages = {};
        const newRoomHighlights = {};
        const newRoomDetails = {};
        
        // Process room types
        hotelToDuplicate.roomTypes.forEach(roomType => {
            const type = roomType.type;
            
            // Check if it's a standard room type
            if (standardRoomTypes.includes(type)) {
                newSelectedRoomTypes[type] = true;
                newRoomTypePrices[type] = roomType.pricePerNight.toString();
                newRoomTypeChildrenPrices[type] = (roomType.childrenPricePerNight || '').toString();
                
                // Copy monthly prices if available
                if (roomType.monthlyPrices) {
                    newMonthlyPrices[type] = roomType.monthlyPrices;
                }
                
                // Copy room images if available
                if (roomType.images && roomType.images.length > 0) {
                    newRoomImages[type] = roomType.images;
                }
                
                // Copy room highlights if available
                if (roomType.highlights && roomType.highlights.length > 0) {
                    newRoomHighlights[type] = roomType.highlights;
                }
                
                // Copy room details if available
                if (roomType.details) {
                    newRoomDetails[type] = roomType.details;
                }
            } else {
                // It's a custom room type
                const customId = `CUSTOM_${Date.now()}_${newCustomRoomTypes.length}`;
                newCustomRoomTypes.push({
                    id: customId,
                    name: type
                });
                
                newSelectedRoomTypes['CUSTOM'] = true;
                newRoomTypePrices[customId] = roomType.pricePerNight.toString();
                newRoomTypeChildrenPrices[customId] = (roomType.childrenPricePerNight || '').toString();
                
                // Copy monthly prices if available
                if (roomType.monthlyPrices) {
                    newMonthlyPrices[customId] = roomType.monthlyPrices;
                }
                
                // Copy room images if available
                if (roomType.images && roomType.images.length > 0) {
                    newRoomImages[customId] = roomType.images;
                }
                
                // Copy room highlights if available
                if (roomType.highlights && roomType.highlights.length > 0) {
                    newRoomHighlights[customId] = roomType.highlights;
                }
                
                // Copy room details if available
                if (roomType.details) {
                    newRoomDetails[customId] = roomType.details;
                }
            }
        });
        
        // Set the hotel data with duplicated data
        setHotelData({
            name: hotelToDuplicate.name + ' (Copy)',
            country: hotelToDuplicate.country || '',
            city: hotelToDuplicate.city,
            stars: hotelToDuplicate.stars.toString(),
            roomTypes: [],
            breakfastIncluded: hotelToDuplicate.breakfastIncluded,
            breakfastPrice: hotelToDuplicate.breakfastPrice ? hotelToDuplicate.breakfastPrice.toString() : '',
            transportation: {
                vitoReceptionPrice: hotelToDuplicate.transportation.vitoReceptionPrice ? hotelToDuplicate.transportation.vitoReceptionPrice.toString() : '',
                vitoFarewellPrice: hotelToDuplicate.transportation.vitoFarewellPrice ? hotelToDuplicate.transportation.vitoFarewellPrice.toString() : '',
                sprinterReceptionPrice: hotelToDuplicate.transportation.sprinterReceptionPrice ? hotelToDuplicate.transportation.sprinterReceptionPrice.toString() : '',
                sprinterFarewellPrice: hotelToDuplicate.transportation.sprinterFarewellPrice ? hotelToDuplicate.transportation.sprinterFarewellPrice.toString() : ''
            },
            airport: hotelToDuplicate.airport || '',
            airportTransportation: hotelToDuplicate.airportTransportation || [],
            description: hotelToDuplicate.description || '',
            locationDescription: hotelToDuplicate.locationDescription || '',
            images: hotelToDuplicate.images || [],
            amenities: hotelToDuplicate.amenities || {},
            faqs: hotelToDuplicate.faqs || []
        });
        
        // Set the room type data
        setSelectedRoomTypes(newSelectedRoomTypes);
        setRoomTypePrices(newRoomTypePrices);
        setRoomTypeChildrenPrices(newRoomTypeChildrenPrices);
        setMonthlyPrices(newMonthlyPrices);
        setCustomRoomTypes(newCustomRoomTypes);
        setRoomImages(newRoomImages);
        setRoomHighlights(newRoomHighlights);
        setRoomDetails(newRoomDetails);
        
        // Close modal
        closeDuplicateModal();
        
        // Show success message using toast
        toast.success('Hotel data duplicated successfully! Make changes as needed and submit to create a new hotel.', {
            duration: 3000,
            style: {
                background: '#4CAF50',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#4CAF50',
            },
        });
    };
    
  return (
        <>
        <Card className="w-full dark:bg-slate-950" id="hotels-panel" role="tabpanel" aria-labelledby="tab-hotels">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white text-center">Add New Hotel</h2>
                                    
                                    <div className="flex justify-end mb-4">
                                        <CustomButton
                                            variant="gray"
                                            onClick={openDuplicateModal}
                                            title="Duplicate existing hotel data"
                                            icon={HiDuplicate}
                                        >
                                            Duplicate Hotel
                                        </CustomButton>
                                    </div>
                                    
                                    <form onSubmit={handleHotelSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-1">
                                                <div className="mb-2 block">
                                                    <Label htmlFor="hotelName" value="Hotel Name" />
                                                </div>
                                                <TextInput
                                                    id="hotelName"
                                                    name="name"
                                                    value={hotelData.name}
                                                    onChange={handleHotelChange}
                                                    required
                                                />
                                            </div>

                                            <div className="md:col-span-1">
                                                <div className="mb-2 block">
                                                    <Label htmlFor="hotelCountry" value="Country" />
                                                </div>
                                                <SearchableSelect
                                                    id="hotelCountry"
                                                    value={hotelData.country}
                                                    onChange={(e) => handleCountryChange(e.target.value)}
                                                    options={[
                                                        { value: '', label: 'Select Country' },
                                                        ...getCountries().map(country => ({ value: country, label: country }))
                                                    ]}
                                                    placeholder="Search for a country..."
                                                />
                                            </div>
                                            
                            <div className="md:col-span-1">
                                <div className="flex justify-between items-center mb-3">
                                    <Label htmlFor="hotelCity" value="City" />
                                    <div className="flex items-center">
                                        <Checkbox 
                                            id="customHotelCity"
                                            checked={useCustomHotelCity}
                                            onChange={toggleCustomHotelCity}
                                        />
                                        <Label htmlFor="customHotelCity" value="Custom City" className="ml-2 text-sm" />
                                    </div>
                                </div>
                                
                                {useCustomHotelCity ? (
                                    <TextInput
                                        id="hotelCity"
                                        name="city"
                                        value={hotelData.city}
                                        onChange={handleHotelChange}
                                        placeholder="Enter city name"
                                        required
                                    />
                                ) : (
                                    <SearchableSelect
                                        id="hotelCity"
                                        value={hotelData.city}
                                        onChange={(e) => handleHotelChange({ target: { name: 'city', value: e.target.value } })}
                                        options={[
                                            { value: '', label: 'Select City' },
                                            ...getCitiesByCountry(hotelData.country).map(city => ({ value: city, label: city }))
                                        ]}
                                        placeholder="Search for a city..."
                                        disabled={!hotelData.country}
                                    />
                                )}
                                {!hotelData.country && !useCustomHotelCity && (
                                    <p className="text-xs text-gray-500 mt-1">Select a country first</p>
                                )}
                            </div>
                                            
                                            <div className="md:col-span-1">
                                                <div className="mb-2 block">
                                                    <Label htmlFor="hotelStars" value="Stars" />
                                                </div>
                                                <CustomSelect
                                                    id="hotelStars"
                                                    value={hotelData.stars}
                                                    onChange={(value) => handleHotelChange({ target: { name: 'stars', value } })}
                                                    options={[
                                                        { value: '', label: 'Rating' },
                                                        { value: '3', label: '3 Stars' },
                                                        { value: '4', label: '4 Stars' },
                                                        { value: '5', label: '5 Stars' }
                                                    ]}
                                                    placeholder="Rating"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        

                                        
                                        <div>
                                            <div className="mb-2 block">
                                                <Label htmlFor="hotelBreakfast" value="Breakfast" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="hotelBreakfast"
                                                    name="breakfastIncluded"
                                                    checked={hotelData.breakfastIncluded}
                                                    onChange={handleHotelChange}
                                                />
                                                <Label htmlFor="hotelBreakfast">Breakfast Included</Label>
                                            </div>
                                            
                                            {hotelData.breakfastIncluded && (
                                                <div className="mt-2 ml-6">
                                                    <Label htmlFor="breakfastPrice" className="text-sm mb-1 block">Breakfast Price ($ per room)</Label>
                                                    <TextInput
                                                        id="breakfastPrice"
                                                        type="number"
                                                        name="breakfastPrice"
                                                        value={hotelData.breakfastPrice}
                                                        onChange={handleHotelChange}
                                                        placeholder="Price per room"
                                                        className="w-full max-w-xs"
                                                        required={hotelData.breakfastIncluded}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <div className="mb-3 block">
                                                <Label htmlFor="hotelRoomTypes" value="Room Types" className="text-lg font-semibold" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select the room types available at this hotel</p>
                                            </div>
                                            <div className="space-y-4 mb-4">
                                                
                                                <div className="border-b pb-4 mb-2">
                                                    <h3 className="text-md font-medium mb-3 text-blue-600 dark:text-teal-400">Standard Room Types</h3>
                                                    {standardRoomTypes.map((roomType) => (
                                                        <div key={roomType} className="flex items-center gap-2 mb-2">
                                                            <Checkbox
                                                                id={`roomType-${roomType}`}
                                                                checked={selectedRoomTypes[roomType]}
                                                                onChange={() => handleRoomTypeCheckboxChange(roomType)}
                                                            />
                                                            <Label htmlFor={`roomType-${roomType}`} className="font-medium text-sm">{roomType}</Label>
                                                            {selectedRoomTypes[roomType] && (
                                                                <div className="flex flex-col w-full gap-2 mt-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900 shadow-sm">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                        <Label className="text-xs font-medium w-32 m-0">Adult Price:</Label>
                                                                        <TextInput
                                                                            type="number"
                                                                            size="sm"
                                                                            className="flex-grow shadow-sm text-sm"
                                                                            placeholder="Price per night"
                                                                            value={roomTypePrices[roomType]}
                                                                            onChange={(e) => handleRoomPriceChange(roomType, e.target.value)}
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                        <Label className="text-xs font-medium w-32 m-0">Children Price:</Label>
                                                                        <TextInput
                                                                            type="number"
                                                                            size="sm"
                                                                            className="flex-grow shadow-sm text-sm"
                                                                            placeholder="Additional fee"
                                                                            value={roomTypeChildrenPrices[roomType]}
                                                                            onChange={(e) => handleChildrenRoomPriceChange(roomType, e.target.value)}
                                                                        />
                                                                    </div>
                                                                    
                                                                    {/* Room Images */}
                                                                    <div className="mt-3">
                                                                        <Label className="text-xs font-medium mb-2 block">Room Images</Label>
                                                                        <RoomImageUploader
                                                                            onImagesUploaded={(images) => handleRoomImagesUploaded(roomType, images)}
                                                                            roomType={roomType}
                                                                            maxImages={5}
                                                                            existingImages={roomImages[roomType] || []}
                                                                        />
                                                                    </div>

                                                                    {/* Room Highlights */}
                                                                    <div className="mt-3">
                                                                        <Label className="text-xs font-medium mb-2 block">Room Highlights</Label>
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
                                                                                <h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Added Highlights:</h4>
                                                                                <ul className="space-y-2">
                                                                                    {(roomHighlights[roomType] || []).map((highlight, index) => (
                                                                                        <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                                                                                            <span className="text-xs text-gray-800 dark:text-gray-200">• {highlight}</span>
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

                                                                    {/* Room Details */}
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
                                                                                                    value={roomDetails[roomType]?.size?.value || ""}
                                                                                                    onChange={(e) => handleRoomSizeChange(roomType, e.target.value)}
                                                                                                    className="text-xs"
                                                                                                />
                                                                                            </div>
                                                                                            <div>
                                                                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Sleeps</Label>
                                                                                                <Select
                                                                                                    size="sm"
                                                                                                    value={roomDetails[roomType]?.sleeps || 1}
                                                                                                    onChange={(e) => handleRoomDetailChange(roomType, 'sleeps', parseInt(e.target.value))}
                                                                                                    className="text-xs"
                                                                                                >
                                                                                                    <option value={1}>1 Guest</option>
                                                                                                    <option value={2}>2 Guests</option>
                                                                                                    <option value={3}>3 Guests</option>
                                                                                                    <option value={4}>4 Guests</option>
                                                                                                    <option value={5}>5 Guests</option>
                                                                                                    <option value={6}>6 Guests</option>
                                                                                                </Select>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="grid grid-cols-2 gap-2">
                                                                                            <div>
                                                                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">View</Label>
                                                                                                <TextInput
                                                                                                    size="sm"
                                                                                                    placeholder="Sea view, City view, etc."
                                                                                                    value={roomDetails[roomType]?.view || ""}
                                                                                                    onChange={(e) => handleRoomDetailChange(roomType, 'view', e.target.value)}
                                                                                                    className="text-xs"
                                                                                                />
                                                                                            </div>
                                                                                            <div>
                                                                                                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Bed Type</Label>
                                                                                                <TextInput
                                                                                                    size="sm"
                                                                                                    placeholder="1 Double Bed, Twin beds, etc."
                                                                                                    value={roomDetails[roomType]?.bedType || ""}
                                                                                                    onChange={(e) => handleRoomDetailChange(roomType, 'bedType', e.target.value)}
                                                                                                    className="text-xs"
                                                                                                />
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Amenities Checkboxes */}
                                                                                        <div>
                                                                                            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Room Amenities</Label>
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
                                                                                                        <Label htmlFor={`${roomType}-${key}`} className="text-xs text-gray-600 dark:text-gray-400">
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

                                                                    {/* Monthly pricing accordion */}
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
                                                                                        {months.map((month, index) => (
                                                                                            <div key={month} className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                                                                                                <div className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                                                                    {monthLabels[index]}
                                                                                                </div>
                                                                                                
                                                                                                <div className="mb-1">
                                                                                                    <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                                                                                        Adult Price
                                                                                                    </Label>
                                                                                                    <TextInput
                                                                                                        type="number"
                                                                                                        size="sm"
                                                                                                        placeholder="0"
                                                                                                        value={monthlyPrices[roomType][month]?.adult || ""}
                                                                                                        onChange={(e) => handleMonthlyPriceChange(roomType, month, 'adult', e.target.value)}
                                                                                                        className="text-xs p-1"
                                                                                                    />
                                                                                                </div>
                                                                                                
                                                                                                <div>
                                                                                                    <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                                                                                        Child Price
                                                                                                    </Label>
                                                                                                    <TextInput
                                                                                                        type="number"
                                                                                                        size="sm"
                                                                                                        placeholder="0"
                                                                                                        value={monthlyPrices[roomType][month]?.child || ""}
                                                                                                        onChange={(e) => handleMonthlyPriceChange(roomType, month, 'child', e.target.value)}
                                                                                                        className="text-xs p-1"
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
                                                </div>
                                                
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
                                                                                            {months.map((month, index) => (
                                                                                                <div key={month} className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                                                                                                    <div className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                                                                                                        {monthLabels[index]}
                                                                                                    </div>
                                                                                                    
                                                                                                    <div className="mb-1">
                                                                                                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                                                                                            Adult Price
                                                                                                        </Label>
                                                                                                        <TextInput
                                                                                                            type="number"
                                                                                                            size="sm"
                                                                                                            placeholder="0"
                                                                                                            value={monthlyPrices[roomType.id]?.[month]?.adult || ""}
                                                                                                            onChange={(e) => handleMonthlyPriceChange(roomType.id, month, 'adult', e.target.value)}
                                                                                                            className="text-xs p-1"
                                                                                                        />
                                                                                                    </div>
                                                                                                    
                                                                                                    <div>
                                                                                                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                                                                                            Child Price
                                                                                                        </Label>
                                                                                                        <TextInput
                                                                                                            type="number"
                                                                                                            size="sm"
                                                                                                            placeholder="0"
                                                                                                            value={monthlyPrices[roomType.id]?.[month]?.child || ""}
                                                                                                            onChange={(e) => handleMonthlyPriceChange(roomType.id, month, 'child', e.target.value)}
                                                                                                            className="text-xs p-1"
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
                                                                        Add Another
                                                                    </CustomButton>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-span-2">
                                            <div className="mb-2 block">
                                                <Label value="Airport Transportation" className="text-lg font-semibold" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add transportation prices for airports serving this hotel</p>
                                            </div>
                                            
                                            {/* For backwards compatibility */}
                                            <div className="hidden">
                                                <Select
                                                    id="hotelAirport"
                                                    name="airport"
                                                    value={hotelData.airport}
                                                    onChange={handleHotelChange}
                                                >
                                                    <option value="">Select Airport</option>
                                                    {airports.length > 0 && 
                                                        getAirportOptions().map((airport, index) => (
                                                            <option key={index} value={airport.value}>
                                                                {airport.label}
                                                            </option>
                                                        ))
                                                    }
                                                </Select>
                                            </div>
                                            
                                            {/* Multiple airport transportation options */}
                                            <div className="mb-4">
                                                {hotelData.airportTransportation.length === 0 ? (
                                                    <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900 mb-4">
                                                        <p className="text-gray-500 dark:text-gray-400 mb-4">No airport transportation options added</p>
                                                        <CustomButton 
                                                            onClick={handleAddAirportTransportation}
                                                            variant="blue"
                                                            icon={HiPlus}
                                                            title="Add airport transportation option"
                                                        >
                                                            Add Airport Transportation
                                                        </CustomButton>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {hotelData.airportTransportation.map((item, index) => (
                                                            <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <h4 className="font-medium text-gray-900 dark:text-white">Airport #{index + 1}</h4>
                                                                    <CustomButton 
                                                                        variant="red"
                                                                        size="xs"
                                                                        onClick={() => handleRemoveAirportTransportation(index)}
                                                                        icon={HiTrash}
                                                                        title="Remove airport transportation"
                                                                    >
                                                                        Remove
                                                                    </CustomButton>
                                                                </div>
                                                                
                                                                <div className="mb-4">
                                                                    <Label htmlFor={`airport-${index}`} value="Select Airport" className="mb-2" />
                                                                    <CustomSelect
                                                                        id={`airport-${index}`}
                                                                        value={item.airport}
                                                                        onChange={(value) => handleAirportTransportationChange(index, 'airport', value)}
                                                                        options={[
                                                                            { value: '', label: 'Select Airport' },
                                                                            ...(airports.length > 0 ? getAirportOptions() : [])
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
                                                                                value={item.transportation.vitoReceptionPrice}
                                                                                onChange={(e) => handleTransportationPriceChange(index, 'vitoReceptionPrice', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label htmlFor={`vito-farewell-${index}`} value="Vito Farewell Price ($)" size="sm" className="mb-1" />
                                                                            <TextInput
                                                                                id={`vito-farewell-${index}`}
                                                                                type="number"
                                                                                size="sm"
                                                                                value={item.transportation.vitoFarewellPrice}
                                                                                onChange={(e) => handleTransportationPriceChange(index, 'vitoFarewellPrice', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label htmlFor={`sprinter-reception-${index}`} value="Sprinter Reception Price ($)" size="sm" className="mb-1" />
                                                                            <TextInput
                                                                                id={`sprinter-reception-${index}`}
                                                                                type="number"
                                                                                size="sm"
                                                                                value={item.transportation.sprinterReceptionPrice}
                                                                                onChange={(e) => handleTransportationPriceChange(index, 'sprinterReceptionPrice', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label htmlFor={`sprinter-farewell-${index}`} value="Sprinter Farewell Price ($)" size="sm" className="mb-1" />
                                                                            <TextInput
                                                                                id={`sprinter-farewell-${index}`}
                                                                                type="number"
                                                                                size="sm"
                                                                                value={item.transportation.sprinterFarewellPrice}
                                                                                onChange={(e) => handleTransportationPriceChange(index, 'sprinterFarewellPrice', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label htmlFor={`bus-reception-${index}`} value="Bus Reception Price ($)" size="sm" className="mb-1" />
                                                                            <TextInput
                                                                                id={`bus-reception-${index}`}
                                                                                type="number"
                                                                                size="sm"
                                                                                value={item.transportation.busReceptionPrice}
                                                                                onChange={(e) => handleTransportationPriceChange(index, 'busReceptionPrice', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label htmlFor={`bus-farewell-${index}`} value="Bus Farewell Price ($)" size="sm" className="mb-1" />
                                                                            <TextInput
                                                                                id={`bus-farewell-${index}`}
                                                                                type="number"
                                                                                size="sm"
                                                                                value={item.transportation.busFarewellPrice}
                                                                                onChange={(e) => handleTransportationPriceChange(index, 'busFarewellPrice', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        <div className="text-center mt-3">
                                                            <CustomButton 
                                                                onClick={handleAddAirportTransportation}
                                                                variant="blue"
                                                                icon={HiPlus}
                                                                title="Add another airport transportation"
                                                            >
                                                                Add Another Airport
                                                            </CustomButton>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {/* For backwards compatibility - keep the old transportation form */}
                                            <div className="hidden">
                                                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Default Airport Transportation Pricing (per vehicle)</h3>
                                                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                                    <div>
                                                        <div className="mb-2 block">
                                                            <Label htmlFor="vitoReceptionPrice" value="Vito Reception Price ($)" />
                                                        </div>
                                                        <TextInput
                                                            id="vitoReceptionPrice"
                                                            type="number"
                                                            value={hotelData.transportation.vitoReceptionPrice}
                                                            onChange={(e) => setHotelData({
                                                                ...hotelData,
                                                                transportation: {
                                                                    ...hotelData.transportation,
                                                                    vitoReceptionPrice: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="mb-2 block">
                                                            <Label htmlFor="vitoFarewellPrice" value="Vito Farewell Price ($)" />
                                                        </div>
                                                        <TextInput
                                                            id="vitoFarewellPrice"
                                                            type="number"
                                                            value={hotelData.transportation.vitoFarewellPrice}
                                                            onChange={(e) => setHotelData({
                                                                ...hotelData,
                                                                transportation: {
                                                                    ...hotelData.transportation,
                                                                    vitoFarewellPrice: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="mb-2 block">
                                                            <Label htmlFor="sprinterReceptionPrice" value="Sprinter Reception Price ($)" />
                                                        </div>
                                                        <TextInput
                                                            id="sprinterReceptionPrice"
                                                            type="number"
                                                            value={hotelData.transportation.sprinterReceptionPrice}
                                                            onChange={(e) => setHotelData({
                                                                ...hotelData,
                                                                transportation: {
                                                                    ...hotelData.transportation,
                                                                    sprinterReceptionPrice: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="mb-2 block">
                                                            <Label htmlFor="sprinterFarewellPrice" value="Sprinter Farewell Price ($)" />
                                                        </div>
                                                        <TextInput
                                                            id="sprinterFarewellPrice"
                                                            type="number"
                                                            value={hotelData.transportation.sprinterFarewellPrice}
                                                            onChange={(e) => setHotelData({
                                                                ...hotelData,
                                                                transportation: {
                                                                    ...hotelData.transportation,
                                                                    sprinterFarewellPrice: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="mb-2 block">
                                                            <Label htmlFor="busReceptionPrice" value="Bus Reception Price ($)" />
                                                        </div>
                                                        <TextInput
                                                            id="busReceptionPrice"
                                                            type="number"
                                                            value={hotelData.transportation.busReceptionPrice}
                                                            onChange={(e) => setHotelData({
                                                                ...hotelData,
                                                                transportation: {
                                                                    ...hotelData.transportation,
                                                                    busReceptionPrice: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="mb-2 block">
                                                            <Label htmlFor="busFarewellPrice" value="Bus Farewell Price ($)" />
                                                        </div>
                                                        <TextInput
                                                            id="busFarewellPrice"
                                                            type="number"
                                                            value={hotelData.transportation.busFarewellPrice}
                                                            onChange={(e) => setHotelData({
                                                                ...hotelData,
                                                                transportation: {
                                                                    ...hotelData.transportation,
                                                                    busFarewellPrice: e.target.value
                                                                }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Vito: 2-8 persons, Sprinter: 9-16 persons, Bus: +16 persons
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <TextInput
                                                id="hotelDescription"
                                                name="description"
                                                as="textarea"
                                                rows={3}
                                                value={hotelData.description}
                                                onChange={handleHotelChange}
                                                label="Hotel Description"
                                            />
                                        </div>

                                        <div>
                                            <TextInput
                                                id="locationDescription"
                                                name="locationDescription"
                                                as="textarea"
                                                rows={3}
                                                value={hotelData.locationDescription}
                                                onChange={handleHotelChange}
                                                label="Location Description"
                                            />
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

                                        {/* Hotel FAQs */}
                                        <div>
                                            <Label htmlFor="faqs" value="Hotel FAQs" className="mb-3 block" />
                                            <div className="space-y-4">
                                                {(hotelData.faqs || []).map((faq, index) => (
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
                                        
                                        <CustomButton 
                                            type="submit"
                                            variant="pinkToOrange"
                                        >
                                            Add Hotel
                                        </CustomButton>
                                        
                                    </form>
                                </Card>
                        
                        {/* Duplicate Hotel Modal */}
                        <CustomModal
                            isOpen={duplicateModalOpen}
                            onClose={closeDuplicateModal}
                            title="Duplicate Existing Hotel"
                            subtitle="Select a hotel to duplicate its data. You can modify the duplicated data before creating a new hotel."
                            maxWidth="md:max-w-2xl"
                        >
                            <div className="space-y-6">
                                {modalLoading ? (
                                    <div className="text-center py-12">
                                        <RahalatekLoader size="sm" />
                                        <p className="text-base text-gray-600 mt-4">Loading hotels...</p>
                                    </div>
                                ) : hotels.length > 0 ? (
                                    <div className="space-y-2 relative">
                                        <CustomSelect
                                            id="selectHotelToDuplicate"
                                            label="Select Hotel"
                                            value={selectedHotelToDuplicate}
                                            onChange={(value) => setSelectedHotelToDuplicate(value)}
                                            options={[
                                                { value: "", label: "Choose a hotel" },
                                                ...hotels.map(hotel => ({
                                                    value: hotel._id,
                                                    label: `${hotel.name} - ${hotel.city} (${hotel.stars}★)`
                                                }))
                                            ]}
                                            placeholder="Select a hotel to duplicate"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        No hotels available to duplicate. Please add a hotel first.
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <CustomButton variant="gray" onClick={closeDuplicateModal}>
                                        Cancel
                                    </CustomButton>
                                    <CustomButton
                                        variant="gray"
                                        onClick={handleDuplicateHotel}
                                        disabled={!selectedHotelToDuplicate || modalLoading}
                                        icon={HiDuplicate}
                                    >
                                        Duplicate
                                    </CustomButton>
                                </div>
                            </div>
                        </CustomModal>

                        {/* Hotel Amenities Modal */}
                        <HotelAmenitiesModal
                            isOpen={amenitiesModalOpen}
                            onClose={() => setAmenitiesModalOpen(false)}
                            amenities={hotelData.amenities}
                            onSave={handleAmenitiesSave}
                        />
        </>
  )
}