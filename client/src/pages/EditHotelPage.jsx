import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Label, Textarea, Select, Checkbox, Tabs, Accordion } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiTrash, HiCalendar } from 'react-icons/hi';
import CustomButton from '../components/CustomButton';
import CustomSelect from '../components/Select';
import TextInput from '../components/TextInput';
import RahalatekLoader from '../components/RahalatekLoader';
import toast from 'react-hot-toast';

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
            sprinterFarewellPrice: 0,
            busReceptionPrice: 0,
            busFarewellPrice: 0
        },
        airport: '',
        airportTransportation: [],
        description: ''
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
    const [loading, setLoading] = useState(true);
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
            await axios.put(`/api/hotels/${id}`, roomTypes);
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                id="hotelCity"
                                label="City"
                                value={hotelData.city}
                                onChange={(value) => setHotelData({...hotelData, city: value})}
                                options={[
                                    { value: "Antalya", label: "Antalya" },
                                    { value: "Bodrum", label: "Bodrum" },
                                    { value: "Bursa", label: "Bursa" },
                                    { value: "Cappadocia", label: "Cappadocia" },
                                    { value: "Fethiye", label: "Fethiye" },
                                    { value: "Istanbul", label: "Istanbul" },
                                    { value: "Trabzon", label: "Trabzon" }
                                ]}
                                placeholder="Select City"
                                required
                            />
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
                    
                    <CustomButton type="submit" variant="pinkToOrange">
                        Update Hotel
                    </CustomButton>
                </form>
            </Card>
        </div>
    );
} 