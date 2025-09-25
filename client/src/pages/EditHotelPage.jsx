import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Label, Textarea, Select, Checkbox, Tabs, Accordion } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiTrash, HiCalendar, HiX } from 'react-icons/hi';
import CustomButton from '../components/CustomButton';
import CustomSelect from '../components/Select';
import TextInput from '../components/TextInput';
import RahalatekLoader from '../components/RahalatekLoader';
import ImageUploader from '../components/ImageUploader';
import RoomImageUploader from '../components/RoomImageUploader';
import HotelAmenitiesModal from '../components/HotelAmenitiesModal';
import toast from 'react-hot-toast';
import { getCountries, getCitiesByCountry } from '../utils/countryCities';

export default function EditHotelPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotelData, setHotelData] = useState({
        name: '',
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
    
    const [customRoomType, setCustomRoomType] = useState("");
    const [roomImages, setRoomImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [airports, setAirports] = useState([]);
    const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
    
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
                
                setHotelData(fetchedHotel);
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
                
                let hasCustom = false;
                let customTypeName = "";
                
                // Set the selected states and prices based on existing room types
                fetchedHotel.roomTypes.forEach(roomType => {
                    const roomTypeName = standardRoomTypes.includes(roomType.type) ? roomType.type : "CUSTOM";
                    
                    newSelectedRoomTypes[roomTypeName] = true;
                    newRoomTypePrices[roomTypeName] = roomType.pricePerNight.toString();
                    newRoomTypeChildrenPrices[roomTypeName] = roomType.childrenPricePerNight?.toString() || "0";

                    // Initialize monthly prices if they exist in the data
                    if (roomType.monthlyPrices) {
                        newMonthlyPrices[roomTypeName] = roomType.monthlyPrices;
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
                        newRoomDetails[roomTypeName] = roomType.details;
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
                    
                    if (roomTypeName === "CUSTOM") {
                        hasCustom = true;
                        customTypeName = roomType.type;
                    }
                });
                
                setSelectedRoomTypes(newSelectedRoomTypes);
                setRoomTypePrices(newRoomTypePrices);
                setRoomTypeChildrenPrices(newRoomTypeChildrenPrices);
                setMonthlyPrices(newMonthlyPrices);
                setRoomImages(newRoomImages);
                setRoomHighlights(newRoomHighlights);
                setRoomDetails(newRoomDetails);
                
                if (hasCustom) {
                    setCustomRoomType(customTypeName);
                }
                
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
                    ...monthlyPrices[roomType][month],
                    [priceType]: value === '' ? 0 : parseFloat(value)
                }
            }
        });
    };

    const handleCustomRoomTypeChange = (value) => {
        setCustomRoomType(value);
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
                    ...roomDetails[roomType]?.size,
                    value: value
                }
            }
        });
    };

    const addRoomTypesToHotelData = () => {
        const roomTypes = [];
        
        // Add all checked room types to the data
        Object.keys(selectedRoomTypes).forEach(roomType => {
            if (selectedRoomTypes[roomType]) {
                const typeName = roomType === "CUSTOM" ? customRoomType : roomType;
                const pricePerNight = parseFloat(roomTypePrices[roomType]) || 0;
                const childrenPricePerNight = parseFloat(roomTypeChildrenPrices[roomType]) || 0;
                
                const roomTypeData = {
                    type: typeName,
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
            const response = await axios.put(`/api/hotels/${id}`, roomTypes);
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
                        <TextInput
                            id="hotelDesc"
                            name="description"
                            as="textarea"
                            rows={4}
                            value={hotelData.description || ''}
                            onChange={handleHotelChange}
                            label="Description"
                        />
                    </div>

                    <div>
                        <TextInput
                            id="locationDescription"
                            name="locationDescription"
                            as="textarea"
                            rows={4}
                            value={hotelData.locationDescription || ''}
                            onChange={handleHotelChange}
                            label="Location Description"
                        />
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
                                            {roomType === "CUSTOM" && (
                                                <div className="mb-3">
                                                    <Label htmlFor="custom-room-type" value="Custom Room Type Name" className="mb-1.5" />
                                                    <TextInput
                                                        id="custom-room-type"
                                                        placeholder="Enter room type name"
                                                        value={customRoomType}
                                                        onChange={(e) => handleCustomRoomTypeChange(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            )}
                                            
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
                                                        roomType={roomType === "CUSTOM" ? customRoomType || "Custom Room" : roomType}
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
                                                                        <Select
                                                                            size="sm"
                                                                            value={roomDetails[roomType]?.sleeps || 1}
                                                                            onChange={(e) => handleRoomDetailChange(roomType, 'sleeps', parseInt(e.target.value))}
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
                            
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="roomType-CUSTOM"
                                    checked={selectedRoomTypes["CUSTOM"]}
                                    onChange={() => handleRoomTypeCheckboxChange("CUSTOM")}
                                />
                                <Label htmlFor="roomType-CUSTOM">Custom Room Type</Label>
                            </div>
                            
                            {selectedRoomTypes["CUSTOM"] && (
                                <div className="flex flex-col w-full gap-3 mt-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-800 mx-auto">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                        <Label className="text-sm w-40 m-0">Room Type Name:</Label>
                                        <TextInput
                                            className="flex-grow"
                                            placeholder="Enter custom room type name"
                                            value={customRoomType}
                                            onChange={(e) => handleCustomRoomTypeChange(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <Label className="text-sm w-40 m-0">Adult Price per Night:</Label>
                                        <TextInput
                                            type="number"
                                            className="flex-grow"
                                            placeholder="Price per night"
                                            value={roomTypePrices["CUSTOM"]}
                                            onChange={(e) => handleRoomPriceChange("CUSTOM", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <Label className="text-sm w-40 m-0">Children (6-12) Price:</Label>
                                        <TextInput
                                            type="number"
                                            className="flex-grow"
                                            placeholder="Additional fee"
                                            value={roomTypeChildrenPrices["CUSTOM"]}
                                            onChange={(e) => handleChildrenRoomPriceChange("CUSTOM", e.target.value)}
                                        />
                                    </div>
                                    
                                    {/* Monthly Pricing Accordion for Custom Room */}
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
                                                                    <Label htmlFor={`CUSTOM-${month}-adult`} value="Adult Price" size="sm" className="mb-1" />
                                                                    <TextInput
                                                                        id={`CUSTOM-${month}-adult`}
                                                                        type="number"
                                                                        size="sm"
                                                                        placeholder="Adult price"
                                                                        value={monthlyPrices["CUSTOM"][month]?.adult || ""}
                                                                        onChange={(e) => handleMonthlyPriceChange("CUSTOM", month, 'adult', e.target.value)}
                                                                    />
                                                                </div>
                                                                
                                                                <div>
                                                                    <Label htmlFor={`CUSTOM-${month}-child`} value="Child Price (6-12)" size="sm" className="mb-1" />
                                                                    <TextInput
                                                                        id={`CUSTOM-${month}-child`}
                                                                        type="number"
                                                                        size="sm"
                                                                        placeholder="Child price"
                                                                        value={monthlyPrices["CUSTOM"][month]?.child || ""}
                                                                        onChange={(e) => handleMonthlyPriceChange("CUSTOM", month, 'child', e.target.value)}
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
                                    value={hotelData.breakfastPrice}
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
                                        value={hotelData.transportation.vitoReceptionPrice}
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
                                        value={hotelData.transportation.vitoFarewellPrice}
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
                                        value={hotelData.transportation.sprinterReceptionPrice}
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
                                        value={hotelData.transportation.sprinterFarewellPrice}
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