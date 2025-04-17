import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Button, Alert, Label, TextInput, Textarea, Select, Spinner, Checkbox, Tabs, Accordion } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiX, HiTrash, HiCalendar } from 'react-icons/hi';


export default function EditHotelPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hotelData, setHotelData] = useState({
        name: '',
        city: '',
        stars: 3,
        roomTypes: [],
        breakfastIncluded: false,
        breakfastPrice: 0,
        transportation: {
            vitoReceptionPrice: 0,
            vitoFarewellPrice: 0,
            sprinterReceptionPrice: 0,
            sprinterFarewellPrice: 0
        },
        airport: '',
        description: ''
    });
    
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
    
    const [customRoomType, setCustomRoomType] = useState("");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [airports, setAirports] = useState([]);

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
                setHotelData(fetchedHotel);
                
                // Initialize room type selection and prices from existing data
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
                    
                    if (roomTypeName === "CUSTOM") {
                        hasCustom = true;
                        customTypeName = roomType.type;
                    }
                });
                
                setSelectedRoomTypes(newSelectedRoomTypes);
                setRoomTypePrices(newRoomTypePrices);
                setRoomTypeChildrenPrices(newRoomTypeChildrenPrices);
                setMonthlyPrices(newMonthlyPrices);
                
                if (hasCustom) {
                    setCustomRoomType(customTypeName);
                }
                
                const airportsResponse = await axios.get('/api/airports');
                setAirports(airportsResponse.data);
                
                setError('');
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load data. Please try again later.');
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

    const handleTransportationChange = (field, value) => {
        setHotelData({
            ...hotelData,
            transportation: {
                ...hotelData.transportation,
                [field]: value
            }
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
                
                roomTypes.push(roomTypeData);
            }
        });
        
        return {
            ...hotelData,
            roomTypes
        };
    };

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const roomTypes = addRoomTypesToHotelData();
        
        if (roomTypes.roomTypes.length === 0) {
            setError('Please add at least one room type with price');
            return;
        }
        
        try {
            await axios.put(`/api/hotels/${id}`, roomTypes);
            showSuccessMessage('Hotel updated successfully!');
            setTimeout(() => {
                navigate('/hotels');
            }, 2000);
        } catch (err) {
            setError('Failed to update hotel');
            console.log(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Edit Hotel</h2>
                
                <form onSubmit={handleHotelSubmit} className="space-y-4">
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
                        <div className="mb-2 block">
                            <Label htmlFor="hotelCity" value="City" />
                        </div>
                        <Select
                            id="hotelCity"
                            name="city"
                            value={hotelData.city}
                            onChange={handleHotelChange}
                            required
                        >
                            <option value="">Select City</option>
                            <option value="Antalya">Antalya</option>
                            <option value="Bodrum">Bodrum</option>
                            <option value="Bursa">Bursa</option>
                            <option value="Cappadocia">Cappadocia</option>
                            <option value="Fethiye">Fethiye</option>
                            <option value="Istanbul">Istanbul</option>
                            <option value="Izmir">Izmir</option>
                            <option value="Konya">Konya</option>
                            <option value="Marmaris">Marmaris</option>
                            <option value="Pamukkale">Pamukkale</option>
                            <option value="Trabzon">Trabzon</option>
                            <option value="Uzungol">Uzungol</option>
                        </Select>
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelStars" value="Stars" />
                        </div>
                        <Select
                            id="hotelStars"
                            name="stars"
                            value={hotelData.stars}
                            onChange={handleHotelChange}
                            required
                        >
                            <option value={1}>1 Star</option>
                            <option value={2}>2 Stars</option>
                            <option value={3}>3 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={5}>5 Stars</option>
                        </Select>
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelRoomTypes" value="Room Types" />
                        </div>
                        <div className="space-y-2 mb-4">
                            {standardRoomTypes.map((roomType) => (
                                <div key={roomType} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                                <div className="flex flex-col w-full gap-3 mt-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 mx-auto">
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
                            <Label htmlFor="airport" value="Nearest Airport" />
                        </div>
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
                    
                    <div className="col-span-2">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Airport Transportation Pricing (per vehicle)</h3>
                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Vito: 2-8 persons, Sprinter: 9-16 persons
                        </p>
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelDesc" value="Description" />
                        </div>
                        <Textarea
                            id="hotelDesc"
                            name="description"
                            rows={4}
                            value={hotelData.description || ''}
                            onChange={handleHotelChange}
                        />
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
                    
                    <Button type="submit" gradientDuoTone="pinkToOrange">
                        Update Hotel
                    </Button>
                    
                    {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                    {success && <Alert color="success" className="mt-4">{success}</Alert>}
                </form>
            </Card>
        </div>
    );
} 