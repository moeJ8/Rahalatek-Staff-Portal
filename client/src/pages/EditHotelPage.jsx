import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Button, Alert, Label, TextInput, Textarea, Select, Spinner, Checkbox } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiX, HiTrash } from 'react-icons/hi';


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
        transportationPrice: 0,
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
                
                let hasCustom = false;
                let customTypeName = "";
                
                // Set the selected states and prices based on existing room types
                fetchedHotel.roomTypes.forEach(roomType => {
                    if (standardRoomTypes.includes(roomType.type)) {
                        newSelectedRoomTypes[roomType.type] = true;
                        newRoomTypePrices[roomType.type] = roomType.pricePerNight.toString();
                        newRoomTypeChildrenPrices[roomType.type] = roomType.childrenPricePerNight?.toString() || "0";
                    } else {
                        hasCustom = true;
                        customTypeName = roomType.type;
                        newSelectedRoomTypes["CUSTOM"] = true;
                        newRoomTypePrices["CUSTOM"] = roomType.pricePerNight.toString();
                        newRoomTypeChildrenPrices["CUSTOM"] = roomType.childrenPricePerNight?.toString() || "0";
                    }
                });
                
                setSelectedRoomTypes(newSelectedRoomTypes);
                setRoomTypePrices(newRoomTypePrices);
                setRoomTypeChildrenPrices(newRoomTypeChildrenPrices);
                
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

    const handleRoomTypeCheckboxChange = (roomType) => {
        setSelectedRoomTypes({
            ...selectedRoomTypes,
            [roomType]: !selectedRoomTypes[roomType]
        });
        
        // If unchecking, reset price
        if (selectedRoomTypes[roomType]) {
            setRoomTypePrices({
                ...roomTypePrices,
                [roomType]: ""
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

    const handleCustomRoomTypeChange = (value) => {
        setCustomRoomType(value);
    };

    const addRoomTypesToHotelData = () => {
        const roomTypes = [];
        
        // Add standard room types
        standardRoomTypes.forEach(roomType => {
            if (selectedRoomTypes[roomType] && roomTypePrices[roomType]) {
                roomTypes.push({
                    type: roomType,
                    pricePerNight: Number(roomTypePrices[roomType]),
                    childrenPricePerNight: Number(roomTypeChildrenPrices[roomType] || 0)
                });
            }
        });
        
        // Add custom room type if selected
        if (selectedRoomTypes["CUSTOM"] && customRoomType && roomTypePrices["CUSTOM"]) {
            roomTypes.push({
                type: customRoomType,
                pricePerNight: Number(roomTypePrices["CUSTOM"]),
                childrenPricePerNight: Number(roomTypeChildrenPrices["CUSTOM"] || 0)
            });
        }
        
        return roomTypes;
    };

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const roomTypes = addRoomTypesToHotelData();
        
        if (roomTypes.length === 0) {
            setError('Please add at least one room type with price');
            return;
        }
        
        try {
            const hotelDataToSubmit = {
                ...hotelData,
                roomTypes
            };
            
            await axios.put(`/api/hotels/${id}`, hotelDataToSubmit);
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
                                <div key={roomType} className="flex items-center gap-3">
                                    <Checkbox
                                        id={`roomType-${roomType}`}
                                        checked={selectedRoomTypes[roomType]}
                                        onChange={() => handleRoomTypeCheckboxChange(roomType)}
                                    />
                                    <Label htmlFor={`roomType-${roomType}`}>{roomType}</Label>
                                    {selectedRoomTypes[roomType] && (
                                        <div className="flex flex-col w-full gap-3 mt-2 ml-8 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <Label className="text-sm w-40 m-0">Adult Price per Night:</Label>
                                                <TextInput
                                                    type="number"
                                                    className="flex-grow"
                                                    placeholder="Price per night"
                                                    value={roomTypePrices[roomType]}
                                                    onChange={(e) => handleRoomPriceChange(roomType, e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <Label className="text-sm w-40 m-0">Children (6-12) Price:</Label>
                                                <TextInput
                                                    type="number"
                                                    className="flex-grow"
                                                    placeholder="Additional fee"
                                                    value={roomTypeChildrenPrices[roomType]}
                                                    onChange={(e) => handleChildrenRoomPriceChange(roomType, e.target.value)}
                                                />
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
                                <div className="flex flex-col w-full gap-3 mt-2 ml-8 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
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
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="transportationPrice" value="Transportation Price per Person ($)" />
                        </div>
                        <TextInput
                            id="transportationPrice"
                            type="number"
                            name="transportationPrice"
                            value={hotelData.transportationPrice}
                            onChange={handleHotelChange}
                        />
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
                    
                    {hotelData.breakfastIncluded && (
                        <div className="mb-4 ml-6">
                            <Label htmlFor="breakfastPrice" className="text-sm mb-1 block">Breakfast Price ($ per person)</Label>
                            <TextInput
                                id="breakfastPrice"
                                type="number"
                                name="breakfastPrice"
                                value={hotelData.breakfastPrice}
                                onChange={handleHotelChange}
                                placeholder="Price per person"
                                className="w-full max-w-xs"
                                required={hotelData.breakfastIncluded}
                            />
                        </div>
                    )}
                    
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