import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Button, TextInput, Checkbox, Textarea, Card, Label, Alert, Select, Spinner, Badge, Table, ToggleSwitch } from 'flowbite-react'
import { HiPlus, HiX, HiTrash } from 'react-icons/hi'

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('hotels');
    const [hotelData, setHotelData] = useState({
        name: '',
        city: '',
        stars: '',
        roomTypes: [],
        breakfastIncluded: false,
        transportationPrice: '',
        airport: '',
        description: ''
    });
    const [tourData, setTourData] = useState({
        name: '',
        city: '',
        description: '',
        detailedDescription: '',
        price: '',
        duration: 1,
        highlights: []
    });
    const [airportData, setAirportData] = useState({
        name: '',
        arabicName: ''
    });
    const [airports, setAirports] = useState([]);
    const [users, setUsers] = useState([]);
    const [highlightInput, setHighlightInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [customRoomType, setCustomRoomType] = useState("");

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
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const airportsResponse = await axios.get('/api/airports');
                setAirports(airportsResponse.data);
                
                if (activeTab === 'users') {
                    await fetchUsers();
                }
                
                setError('');
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to fetch data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to view users');
                return;
            }
            
            const response = await axios.get('/api/auth/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError(err.response?.data?.message || 'Failed to fetch users');
        }
    };

    // Get airport options for hotel form
    const getAirportOptions = () => {
        return airports.map(airport => ({
            value: airport.name,
            label: `${airport.name} (${airport.arabicName})`
        }));
    };

    const handleHotelChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHotelData({
            ...hotelData,
            [name]: type === 'checkbox' ? checked : value,
        });
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
            
            await axios.post('/api/hotels', hotelDataToSubmit);
            setHotelData({
                name: '',
                city: '',
                stars: '',
                roomTypes: [],
                breakfastIncluded: false,
                transportationPrice: '',
                airport: '',
                description: ''
            });
            
            // Reset room type selections
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
            
            setCustomRoomType("");
            
            showSuccessMessage('Hotel added successfully!');
        } catch (err) {
            setError('Failed to add hotel');
            console.log(err);
        }
    };

    const handleTourChange = (e) => {
        const { name, value } = e.target;
        setTourData({
            ...tourData,
            [name]: value,
        });
    };

    const handleAirportChange = (e) => {
        const { name, value } = e.target;
        setAirportData({
            ...airportData,
            [name]: value,
        });
    };

    const handleAddHighlight = () => {
        if (highlightInput.trim()) {
            setTourData({
                ...tourData,
                highlights: [...tourData.highlights, highlightInput.trim()]
            });
            setHighlightInput('');
        }
    };

    const handleRemoveHighlight = (index) => {
        const updatedHighlights = [...tourData.highlights];
        updatedHighlights.splice(index, 1);
        setTourData({
            ...tourData,
            highlights: updatedHighlights
        });
    };

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleTourSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const tourDataWithPolicies = {
                ...tourData,
                childrenPolicies: {
                    under3: 'Free',
                    above3: 'Adult price'
                }
            };
            
            await axios.post('/api/tours', tourDataWithPolicies);
            setTourData({
                name: '',
                city: '',
                description: '',
                detailedDescription: '',
                price: '',
                duration: 1,
                highlights: []
            });
            showSuccessMessage('Tour added successfully!');
        } catch (err) {
            setError('Failed to add tour');
            console.log(err);
        }
    };

    const handleAirportSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/airports', airportData);
            setAirports([...airports, response.data]);
            setAirportData({
                name: '',
                arabicName: ''
            });
            showSuccessMessage('Airport added successfully!');
        } catch (err) {
            setError('Failed to add airport');
            console.log(err);
        }
    };

    const handleDeleteAirport = async (id) => {
        try {
            await axios.delete(`/api/airports/${id}`);
            setAirports(airports.filter(airport => airport._id !== id));
            showSuccessMessage('Airport deleted successfully!');
        } catch (err) {
            setError('Failed to delete airport');
            console.log(err);
        }
    };

    const handleToggleAdminStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to update user roles');
                return;
            }
            
            await axios.patch('/api/auth/users/role', 
                { userId, isAdmin: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Update the local state
            setUsers(users.map(user => 
                user._id === userId 
                    ? { ...user, isAdmin: !currentStatus } 
                    : user
            ));
            
            showSuccessMessage('User role updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user role');
            console.log(err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('You must be logged in to delete users');
                    return;
                }
                
                await axios.delete(`/api/auth/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Update the local state by removing the deleted user
                setUsers(users.filter(user => user._id !== userId));
                
                showSuccessMessage('User deleted successfully!');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
                console.log(err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-56">
                <Spinner size="xl" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-4">
            {/* Custom Tab Implementation */}
            <div className="flex flex-wrap justify-center border-b mb-4 gap-1">
                <button
                    className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'hotels' ? 'border-b-2 border-purple-600 font-medium text-purple-600 dark:text-purple-400 dark:border-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                    onClick={() => setActiveTab('hotels')}
                >
                    Hotels
                </button>
                <button
                    className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'tours' ? 'border-b-2 border-purple-600 font-medium text-purple-600 dark:text-purple-400 dark:border-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                    onClick={() => setActiveTab('tours')}
                >
                    Tours
                </button>
                <button
                    className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'airports' ? 'border-b-2 border-purple-600 font-medium text-purple-600 dark:text-purple-400 dark:border-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                    onClick={() => setActiveTab('airports')}
                >
                    Airports
                </button>
                <button
                    className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'users' ? 'border-b-2 border-purple-600 font-medium text-purple-600 dark:text-purple-400 dark:border-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'hotels' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Add New Hotel</h2>
                    
                    <form onSubmit={handleHotelSubmit} className="space-y-4">
                        <div>
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
                                <option value="">Select Rating</option>
                                <option value="3">3 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="5">5 Stars</option>
                            </Select>
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="hotelTransport" value="Airport Transportation Price ($)" />
                            </div>
                            <TextInput
                                id="hotelTransport"
                                type="number"
                                name="transportationPrice"
                                value={hotelData.transportationPrice}
                                onChange={handleHotelChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="hotelAirport" value="Airport for Transportation" />
                            </div>
                            <Select
                                id="hotelAirport"
                                name="airport"
                                value={hotelData.airport}
                                onChange={handleHotelChange}
                                required={hotelData.transportationPrice > 0}
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
                            {airports.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">Loading airports...</p>
                            )}
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="hotelBreakfast" value="Breakfast Included" />
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
                                <Label htmlFor="hotelDescription" value="Hotel Description" />
                            </div>
                            <Textarea
                                id="hotelDescription"
                                name="description"
                                rows={3}
                                value={hotelData.description}
                                onChange={handleHotelChange}
                            />
                        </div>
                        
                        <Button type="submit" gradientDuoTone="pinkToOrange">
                            Add Hotel
                        </Button>
                        
                        {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                        {success && <Alert color="success" className="mt-4">{success}</Alert>}
                    </form>
                </Card>
            )}

            {activeTab === 'tours' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Add New Tour</h2>
                    
                    <form onSubmit={handleTourSubmit} className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourName" value="Tour Name" />
                            </div>
                            <TextInput
                                id="tourName"
                                name="name"
                                value={tourData.name}
                                onChange={handleTourChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourCity" value="City" />
                            </div>
                            <Select
                                id="tourCity"
                                name="city"
                                value={tourData.city}
                                onChange={handleTourChange}
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
                                <Label htmlFor="tourDesc" value="Brief Description" />
                            </div>
                            <TextInput
                                id="tourDesc"
                                name="description"
                                value={tourData.description}
                                onChange={handleTourChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourDetailDesc" value="Detailed Description" />
                            </div>
                            <Textarea
                                id="tourDetailDesc"
                                name="detailedDescription"
                                rows={4}
                                value={tourData.detailedDescription}
                                onChange={handleTourChange}
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourPrice" value="Price per Person ($)" />
                            </div>
                            <TextInput
                                id="tourPrice"
                                type="number"
                                name="price"
                                value={tourData.price}
                                onChange={handleTourChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourDuration" value="Duration (hours)" />
                            </div>
                            <TextInput
                                id="tourDuration"
                                type="number"
                                name="duration"
                                value={tourData.duration}
                                onChange={handleTourChange}
                                min={1}
                                required
                            />
                        </div>
                        
                        <div>
                            <Label value="Tour Highlights" className="mb-2 block" />
                            <div className="flex gap-2 mb-3">
                                <TextInput
                                    placeholder="Add a highlight"
                                    value={highlightInput}
                                    onChange={(e) => setHighlightInput(e.target.value)}
                                    className="flex-1"
                                />
                                <Button 
                                    onClick={handleAddHighlight} 
                                    gradientDuoTone="purpleToPink"
                                    size="sm"
                                >
                                    <div className="flex items-center">
                                        <HiPlus className="h-4 w-4" />
                                        <span className="ml-1">Add</span>
                                    </div>
                                </Button>
                            </div>
                            
                            {tourData.highlights.length > 0 && (
                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Added Highlights:</h4>
                                    <ul className="space-y-2">
                                        {tourData.highlights.map((highlight, index) => (
                                            <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <span className="text-gray-800 dark:text-gray-200">• {highlight}</span>
                                                <Button 
                                                    color="failure" 
                                                    size="xs"
                                                    pill
                                                    onClick={() => handleRemoveHighlight(index)}
                                                >
                                                    <HiX className="h-4 w-4" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <Button type="submit" gradientDuoTone="pinkToOrange">
                            Add Tour
                        </Button>
                        
                        {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                        {success && <Alert color="success" className="mt-4">{success}</Alert>}
                    </form>
                </Card>
            )}

            {activeTab === 'airports' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Add New Airport</h2>
                    
                    <form onSubmit={handleAirportSubmit} className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="airportName" value="Airport Name" />
                            </div>
                            <TextInput
                                id="airportName"
                                name="name"
                                value={airportData.name}
                                onChange={handleAirportChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="airportArabicName" value="Arabic Name" />
                            </div>
                            <TextInput
                                id="airportArabicName"
                                name="arabicName"
                                value={airportData.arabicName}
                                onChange={handleAirportChange}
                                required
                            />
                        </div>
                        
                        <Button type="submit" gradientDuoTone="pinkToOrange">
                            Add Airport
                        </Button>
                        
                        {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                        {success && <Alert color="success" className="mt-4">{success}</Alert>}
                    </form>
                    
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Existing Airports</h3>
                        {airports.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {airports.map(airport => (
                                    <Card key={airport._id} className="overflow-hidden">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <div>
                                                <p className="font-medium text-lg dark:text-white">{airport.name}</p>
                                                <p className="text-gray-600 dark:text-gray-400">{airport.arabicName}</p>
                                            </div>
                                            <Button 
                                                color='failure'
                                                size="xs"
                                                onClick={() => handleDeleteAirport(airport._id)}
                                                className="mt-2 sm:mt-0"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Alert color="info">No airports found.</Alert>
                        )}
                    </div>
                </Card>
            )}

            {activeTab === 'users' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">User Management</h2>
                    
                    {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                    {success && <Alert color="success" className="mb-4">{success}</Alert>}
                    
                    {users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <Table.Head>
                                    <Table.HeadCell>Username</Table.HeadCell>
                                    <Table.HeadCell>Admin Status</Table.HeadCell>
                                    <Table.HeadCell>Admin Actions</Table.HeadCell>
                                    <Table.HeadCell>Delete</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {users.map(user => (
                                        <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                {user.username}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge color={user.isAdmin ? "success" : "gray"}>
                                                    {user.isAdmin ? "Admin" : "User"}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center">
                                                    {user.isAdmin ? (
                                                        <Button 
                                                            gradientDuoTone="purpleToPink" 
                                                            size="xs"
                                                            onClick={() => handleToggleAdminStatus(user._id, user.isAdmin)}
                                                        >
                                                            Revoke
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            gradientDuoTone="greenToBlue" 
                                                            size="xs"
                                                            onClick={() => handleToggleAdminStatus(user._id, user.isAdmin)}
                                                        >
                                                            Assign
                                                        </Button>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Button 
                                                    gradientDuoTone="pinkToOrange"
                                                    size="xs"
                                                    onClick={() => handleDeleteUser(user._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    ) : (
                        <Alert color="info">No users found. Admin users can manage other users here.</Alert>
                    )}
                </Card>
            )}
        </div>
    );
}
    