import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Button, TextInput, Checkbox, Textarea, Card, Label, Alert, Select, Spinner, Badge, Table, ToggleSwitch } from 'flowbite-react'

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('hotels');
    const [hotelData, setHotelData] = useState({
        name: '',
        city: '',
        stars: '',
        pricePerNightPerPerson: '',
        breakfastIncluded: false,
        roomType: '',
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

    // Fetch airports and users on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const airportsResponse = await axios.get('/api/airports');
                setAirports(airportsResponse.data);
                
                // Only fetch users if on users tab
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

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('/api/hotels', hotelData);
            setHotelData({
                name: '',
                city: '',
                stars: '',
                pricePerNightPerPerson: '',
                breakfastIncluded: false,
                roomType: '',
                transportationPrice: '',
                airport: '',
                description: ''
            });
            showSuccessMessage('Hotel added successfully!');
        } catch (err) {
            setError('Failed to add hotel');
            console.log(err);
        }
    };

    const handleTourSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('/api/tours', tourData);
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
            <div className="flex border-b mb-4">
                <button
                    className={`py-2 px-4 ${activeTab === 'hotels' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('hotels')}
                >
                    Hotels
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'tours' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('tours')}
                >
                    Tours
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'airports' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('airports')}
                >
                    Airports
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'hotels' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Hotel</h2>
                    
                    {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                    {success && <Alert color="success" className="mb-4">{success}</Alert>}
                    
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
                                <option value="Istanbul">Istanbul</option>
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
                                <Label htmlFor="hotelPrice" value="Price per Night per Person ($)" />
                            </div>
                            <TextInput
                                id="hotelPrice"
                                type="number"
                                name="pricePerNightPerPerson"
                                value={hotelData.pricePerNightPerPerson}
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
                        
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="hotelBreakfast"
                                name="breakfastIncluded"
                                checked={hotelData.breakfastIncluded}
                                onChange={handleHotelChange}
                            />
                            <Label htmlFor="hotelBreakfast">Breakfast Included</Label>
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="hotelRoomType" value="Room Type" />
                            </div>
                            <TextInput
                                id="hotelRoomType"
                                name="roomType"
                                value={hotelData.roomType}
                                onChange={handleHotelChange}
                                required
                            />
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
                        
                        <Button type="submit" gradientDuoTone="purpleToBlue">
                            Add Hotel
                        </Button>
                    </form>
                </Card>
            )}

            {activeTab === 'tours' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Tour</h2>
                    
                    {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                    {success && <Alert color="success" className="mb-4">{success}</Alert>}
                    
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
                                <option value="Istanbul">Istanbul</option>
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
                            <div className="flex gap-2">
                                <TextInput
                                    placeholder="Add a highlight"
                                    value={highlightInput}
                                    onChange={(e) => setHighlightInput(e.target.value)}
                                    className="flex-1"
                                />
                                <Button onClick={handleAddHighlight} color="blue">Add</Button>
                            </div>
                            
                            {tourData.highlights.length > 0 && (
                                <Card className="mt-2">
                                    <ul className="space-y-2">
                                        {tourData.highlights.map((highlight, index) => (
                                            <li key={index} className="flex justify-between items-center">
                                                <span>• {highlight}</span>
                                                <Button 
                                                    color="failure" 
                                                    size="xs" 
                                                    onClick={() => handleRemoveHighlight(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}
                        </div>
                        
                        <Button type="submit" gradientDuoTone="purpleToBlue">
                            Add Tour
                        </Button>
                    </form>
                </Card>
            )}

            {activeTab === 'airports' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Airport</h2>
                    
                    {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                    {success && <Alert color="success" className="mb-4">{success}</Alert>}
                    
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
                        
                        <Button type="submit" gradientDuoTone="purpleToBlue">
                            Add Airport
                        </Button>
                    </form>
                    
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Existing Airports</h3>
                        {airports.length > 0 ? (
                            <div className="space-y-2">
                                {airports.map(airport => (
                                    <Card key={airport._id} className="flex justify-between items-center">
                                        <div className="flex justify-between w-full items-center">
                                            <div>
                                                <p className="font-medium">{airport.name}</p>
                                                <p className="text-gray-600">{airport.arabicName}</p>
                                            </div>
                                            <Button 
                                                color="failure" 
                                                size="xs"
                                                onClick={() => handleDeleteAirport(airport._id)}
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
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">User Management</h2>
                    
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
                                                    color="failure"
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
    