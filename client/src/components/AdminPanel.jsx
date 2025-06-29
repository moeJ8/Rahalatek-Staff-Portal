import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Button, TextInput, Checkbox, Textarea, Card, Label, Alert, Select, Badge, Table, ToggleSwitch, Accordion, Modal } from 'flowbite-react'
import { HiPlus, HiX, HiTrash, HiCalendar, HiDuplicate } from 'react-icons/hi'
import { FaPlaneDeparture, FaMapMarkedAlt, FaBell, FaCalendarDay } from 'react-icons/fa'
import toast from 'react-hot-toast'
import UserBadge from './UserBadge'
import CustomButton from './CustomButton'
import RahalatekLoader from './RahalatekLoader'
import { generateArrivalReminders, cleanupExpiredNotifications } from '../utils/notificationApi'

export default function AdminPanel() {
    // Check user role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.isAdmin || false;
    const isAccountant = user.isAccountant || false;
    
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            // Filter available tabs based on user role
                    const availableTabs = isAdmin 
            ? ['hotels', 'tours', 'airports', 'users', 'requests', 'notifications']
            : ['hotels', 'tours', 'airports']; // Accountants can't access users/requests
            if (availableTabs.includes(tabParam)) {
                return tabParam;
            }
        }
        return 'hotels';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    const handleTabChange = (tabName) => {
        // Prevent accountants from accessing admin-only tabs
        if (!isAdmin && tabName === 'requests') {
            console.warn('Access denied: Accountants cannot access user requests tab');
            return;
        }
        
        setActiveTab(tabName);
        
        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.pushState({}, '', url);
        
        // Fetch users data only when switching to users tab and data not loaded yet
        if (tabName === 'users' && users.length === 0 && dataLoaded) {
            fetchUsers();
        }
        
        // Fetch pending requests when switching to requests tab
        if (tabName === 'requests' && dataLoaded) {
            fetchPendingRequests();
        }
        
        // Fetch hotels data when switching to hotels tab and data not loaded yet
        if (tabName === 'hotels' && hotels.length === 0 && dataLoaded) {
            fetchHotels();
        }
        
        // Fetch tours data when switching to tours tab and data not loaded yet
        if (tabName === 'tours' && tours.length === 0 && dataLoaded) {
            fetchTours();
        }
    };

    const [hotelData, setHotelData] = useState({
        name: '',
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
        description: ''
    });
    const [tourData, setTourData] = useState({
        name: '',
        city: '',
        description: '',
        detailedDescription: '',
        tourType: 'Group',
        price: '',
        vipCarType: 'Vito',
        carCapacity: {
            min: 2,
            max: 8
        },
        duration: 1,
        highlights: []
    });
    const [airportData, setAirportData] = useState({
        name: '',
        arabicName: ''
    });
    const [airports, setAirports] = useState([]);
    const [users, setUsers] = useState([]);
    const [tours, setTours] = useState([]);
    const [highlightInput, setHighlightInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [customRoomTypes, setCustomRoomTypes] = useState([]);
    // Add a new state to track if initial data has been loaded
    const [dataLoaded, setDataLoaded] = useState(false);
    
    // Add state for available hotels and duplicate modal
    const [hotels, setHotels] = useState([]);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
    const [selectedHotelToDuplicate, setSelectedHotelToDuplicate] = useState('');
    
    // Add state for tour duplication
    const [tourDuplicateModalOpen, setTourDuplicateModalOpen] = useState(false);
    const [selectedTourToDuplicate, setSelectedTourToDuplicate] = useState('');
    
    // Add state for notification management
    const [notificationLoading, setNotificationLoading] = useState(false);

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
    
    useEffect(() => {
        // Only fetch data on first load or when explicitly needed
        if (!dataLoaded) {
            const fetchInitialData = async () => {
                setLoading(true);
                try {
                    const [airportsResponse, hotelsResponse, toursResponse] = await Promise.all([
                        axios.get('/api/airports'),
                        axios.get('/api/hotels'),
                        axios.get('/api/tours')
                    ]);
                    
                    setAirports(airportsResponse.data);
                    setHotels(hotelsResponse.data);
                    setTours(toursResponse.data);
                    
                    // Only fetch users if starting on users tab or requests tab
                    if (activeTab === 'users') {
                        await fetchUsers();
                    } else if (activeTab === 'requests') {
                        await fetchPendingRequests();
                    }
                    
                    setError('');
                    setDataLoaded(true);
                } catch (err) {
                    console.error('Failed to fetch data:', err);
                    setError('Failed to fetch data. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            
            fetchInitialData();
        }
    }, []);
    
    // Only fetch users data when switching to users tab and haven't loaded it yet
    useEffect(() => {
        if (activeTab === 'users' && dataLoaded && users.length === 0) {
            fetchUsers();
        }
        
        if (activeTab === 'requests' && dataLoaded) {
            fetchPendingRequests();
        }
        
        // Fetch hotels when switching to hotels tab
        if (activeTab === 'hotels' && dataLoaded && hotels.length === 0) {
            fetchHotels();
        }
        
        // Fetch tours when switching to tours tab
        if (activeTab === 'tours' && dataLoaded && tours.length === 0) {
            fetchTours();
        }
    }, [activeTab]);

    const fetchTours = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/tours');
            setTours(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch tours:', err);
            setError(err.response?.data?.message || 'Failed to fetch tours');
        } finally {
            setLoading(false);
        }
    };

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/hotels');
            setHotels(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch hotels:', err);
            setError(err.response?.data?.message || 'Failed to fetch hotels');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to view users');
                setLoading(false);
                return;
            }
            
            const response = await axios.get('/api/auth/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const approvedUsers = response.data.filter(user => user.isApproved);
            setUsers(approvedUsers);
            setError('');
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

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
                
                roomTypes.push(roomTypeData);
            }
        });
        
        return roomTypes;
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        setError('');
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
                description: ''
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
            setError('Failed to add hotel');
            toast.error('Failed to add hotel', {
                duration: 3000,
            });
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

    const handleVipCarTypeChange = (e) => {
        const carType = e.target.value;
        let minCapacity = 2;
        let maxCapacity = 8;
        
        if (carType === 'Sprinter') {
            minCapacity = 9;
            maxCapacity = 16;
        }
        
        setTourData({
            ...tourData,
            vipCarType: carType,
            carCapacity: {
                min: minCapacity,
                max: maxCapacity
            }
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
                tourType: 'Group',
                price: '',
                vipCarType: 'Vito',
                carCapacity: {
                    min: 2,
                    max: 8
                },
                duration: 1,
                highlights: []
            });
            toast.success('Tour added successfully!', {
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
            setError('Failed to add tour');
            toast.error('Failed to add tour', {
                duration: 3000,
            });
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
            toast.success('Airport added successfully!', {
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
            setError('Failed to add airport');
            console.log(err);
        }
    };

    const handleDeleteAirport = async (id) => {
        try {
            await axios.delete(`/api/airports/${id}`);
            setAirports(airports.filter(airport => airport._id !== id));
            toast.success('Airport deleted successfully!', {
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
                    ? { ...user, isAdmin: !currentStatus, isAccountant: !currentStatus ? false : user.isAccountant } 
                    : user
            ));
            
            toast.success('User role updated successfully!', {
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
            setError(err.response?.data?.message || 'Failed to update user role');
            console.log(err);
        }
    };

    const handleToggleAccountantStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to update user roles');
                return;
            }
            
            await axios.patch('/api/auth/users/role', 
                { userId, isAccountant: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Update the local state
            setUsers(users.map(user => 
                user._id === userId 
                    ? { ...user, isAccountant: !currentStatus, isAdmin: !currentStatus ? false : user.isAdmin } 
                    : user
            ));
            
            toast.success('User role updated successfully!', {
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
            setError(err.response?.data?.message || 'Failed to update user role');
            console.log(err);
        }
    };

    const handleToggleApprovalStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to update user approval status');
                return;
            }
            
            await axios.patch('/api/auth/users/approve', 
                { userId, isApproved: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (activeTab === 'requests') {
                setPendingRequests(pendingRequests.filter(user => user._id !== userId));
                toast.success('User approved successfully!', {
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
            } else {
                setUsers(users.map(user => 
                    user._id === userId 
                        ? { ...user, isApproved: !currentStatus } 
                        : user
                ));
                
                toast.success(`User ${!currentStatus ? 'approved' : 'unapproved'} successfully!`, {
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
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user approval status');
            console.log(err);
        }
    };

    // Add state variables for the delete user modal
    const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteUserLoading, setDeleteUserLoading] = useState(false);

    // Update the handleDeleteUser function to use the modal
    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        setDeleteUserLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to delete users');
                setDeleteUserLoading(false);
                return;
            }
            
            await axios.delete(`/api/auth/users/${userToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update the appropriate state based on active tab
            if (activeTab === 'requests') {
                setPendingRequests(pendingRequests.filter(user => user._id !== userToDelete._id));
                toast.success('User request rejected successfully!', {
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
            } else {
                setUsers(users.filter(user => user._id !== userToDelete._id));
                toast.success('User deleted successfully!', {
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
            }
            
            closeDeleteUserModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
            console.log(err);
        } finally {
            setDeleteUserLoading(false);
        }
    };

    // Add functions to open and close the delete user modal
    const openDeleteUserModal = (user) => {
        setUserToDelete(user);
        setDeleteUserModalOpen(true);
    };

    const closeDeleteUserModal = () => {
        setDeleteUserModalOpen(false);
        setUserToDelete(null);
    };

    // Inside the component, handle keyboard navigation with tab changing
    const handleTabKeyDown = (e, tabName) => {
        // Navigate with arrow keys
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const tabs = isAdmin 
                ? ['hotels', 'tours', 'airports', 'users', 'requests']
                : ['hotels', 'tours', 'airports']; // Accountants can't access users/requests
            const currentIndex = tabs.indexOf(activeTab);
            
            let newIndex;
            if (e.key === 'ArrowRight') {
                newIndex = (currentIndex + 1) % tabs.length;
            } else {
                newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            }
            
            handleTabChange(tabs[newIndex]);
            
            // Focus the newly active tab button
            setTimeout(() => {
                document.getElementById(`tab-${tabs[newIndex]}`).focus();
            }, 10);
        }
        // Activate tab with Enter or Space
        else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTabChange(tabName);
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
                        sprinterFarewellPrice: ''
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
    };
    
    // Function to close duplicate modal
    const closeDuplicateModal = () => {
        setDuplicateModalOpen(false);
        setSelectedHotelToDuplicate('');
    };
    
    // Function to open tour duplicate modal
    const openTourDuplicateModal = () => {
        setTourDuplicateModalOpen(true);
    };
    
    // Function to close tour duplicate modal
    const closeTourDuplicateModal = () => {
        setTourDuplicateModalOpen(false);
        setSelectedTourToDuplicate('');
    };
    
    // Function to handle tour duplication
    const handleDuplicateTour = () => {
        if (!selectedTourToDuplicate) return;
        
        const tourToDuplicate = tours.find(tour => tour._id === selectedTourToDuplicate);
        if (!tourToDuplicate) return;
        
        // Set tour data from the selected tour
        setTourData({
            name: `${tourToDuplicate.name} (Copy)`,
            city: tourToDuplicate.city,
            description: tourToDuplicate.description || '',
            detailedDescription: tourToDuplicate.detailedDescription || '',
            tourType: tourToDuplicate.tourType,
            price: tourToDuplicate.price.toString(),
            vipCarType: tourToDuplicate.vipCarType || 'Vito',
            carCapacity: {
                min: tourToDuplicate.carCapacity?.min || 2,
                max: tourToDuplicate.carCapacity?.max || 8
            },
            duration: tourToDuplicate.duration,
            highlights: tourToDuplicate.highlights ? [...tourToDuplicate.highlights] : []
        });
        
        // Close modal
        closeTourDuplicateModal();
        
        // Show success message using toast
        toast.success('Tour data duplicated successfully! Make changes as needed and submit to create a new tour.', {
            duration: 3000
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
            }
        });
        
        // Copy airport transportation
        const newAirportTransportation = [];
        if (hotelToDuplicate.airportTransportation && hotelToDuplicate.airportTransportation.length > 0) {
            hotelToDuplicate.airportTransportation.forEach(item => {
                newAirportTransportation.push({
                    airport: item.airport,
                    transportation: { ...item.transportation }
                });
            });
        } else if (hotelToDuplicate.airport && hotelToDuplicate.transportation) {
            // Handle legacy format
            newAirportTransportation.push({
                airport: hotelToDuplicate.airport,
                transportation: { ...hotelToDuplicate.transportation }
            });
        }
        
        // Set form data
        setHotelData({
            name: `${hotelToDuplicate.name} (Copy)`,
            city: hotelToDuplicate.city,
            stars: hotelToDuplicate.stars.toString(),
            roomTypes: [],
            breakfastIncluded: hotelToDuplicate.breakfastIncluded || false,
            breakfastPrice: (hotelToDuplicate.breakfastPrice || '').toString(),
            transportation: {
                vitoReceptionPrice: (hotelToDuplicate.transportation?.vitoReceptionPrice || '').toString(),
                vitoFarewellPrice: (hotelToDuplicate.transportation?.vitoFarewellPrice || '').toString(),
                sprinterReceptionPrice: (hotelToDuplicate.transportation?.sprinterReceptionPrice || '').toString(),
                sprinterFarewellPrice: (hotelToDuplicate.transportation?.sprinterFarewellPrice || '').toString()
            },
            airport: hotelToDuplicate.airport || '',
            airportTransportation: newAirportTransportation,
            description: hotelToDuplicate.description || ''
        });
        
        // Set room type states
        setSelectedRoomTypes(newSelectedRoomTypes);
        setRoomTypePrices(newRoomTypePrices);
        setRoomTypeChildrenPrices(newRoomTypeChildrenPrices);
        setMonthlyPrices(newMonthlyPrices);
        setCustomRoomTypes(newCustomRoomTypes);
        
        // Close modal
        closeDuplicateModal();
        
        // Show success message using toast
        toast.success('Hotel data duplicated successfully! Make changes as needed and submit to create a new hotel.', {
            duration: 3000
        });
    };

    const [pendingRequests, setPendingRequests] = useState([]);

    // Add a new function to fetch pending requests
    // Handle generating arrival reminders manually
    const handleGenerateArrivalReminders = async () => {
        if (!isAdmin) return;
        
        setNotificationLoading(true);
        try {
            const result = await generateArrivalReminders();
            toast.success(result.message || 'Arrival reminders generated successfully', {
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
            console.error('Error generating arrival reminders:', err);
            toast.error(err.response?.data?.message || 'Failed to generate arrival reminders', {
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
        } finally {
            setNotificationLoading(false);
        }
    };

    // Handle generating daily arrivals summary manually
    const handleGenerateDailySummary = async () => {
        if (!isAdmin) return;
        
        setNotificationLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/notifications/generate-daily-summary', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(response.data.message || 'Daily summary generated successfully', {
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
            console.error('Error generating daily summary:', err);
            toast.error(err.response?.data?.message || 'Failed to generate daily summary', {
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
        } finally {
            setNotificationLoading(false);
        }
    };

    // Handle cleaning up expired notifications
    const handleCleanupExpiredNotifications = async () => {
        if (!isAdmin) return;
        
        setNotificationLoading(true);
        try {
            const result = await cleanupExpiredNotifications();
            toast.success(result.message || 'Expired notifications cleaned up successfully', {
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
            console.error('Error cleaning up expired notifications:', err);
            toast.error(err.response?.data?.message || 'Failed to cleanup expired notifications', {
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
        } finally {
            setNotificationLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to view pending requests');
                setLoading(false);
                return;
            }
            
            const response = await axios.get('/api/auth/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Filter only users who are not approved
            const pendingUsers = response.data.filter(user => !user.isApproved);
            setPendingRequests(pendingUsers);
            setError('');
        } catch (err) {
            console.error('Failed to fetch pending requests:', err);
            setError(err.response?.data?.message || 'Failed to fetch pending requests');
        } finally {
            setLoading(false);
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
        <div className="w-full flex flex-col items-center">
            {loading ? (
                <div className="py-8">
                    <RahalatekLoader size="lg" />
                </div>
            ) : (
                <div className="w-full">
                    {/* Modern layout with sidebar and content */}
                    <div className="flex flex-col md:flex-row w-full">
                        {/* Sidebar for desktop */}
                                                    <div className="hidden md:block w-64 bg-white dark:bg-slate-900 shadow-lg rounded-lg mr-4 h-fit sticky top-4">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Management</h3>
                            </div>
                            <nav className="p-2" role="tablist" aria-label="Admin Sections">
                                <button
                                    id="tab-hotels"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'hotels' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => handleTabChange('hotels')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'hotels')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'hotels'}
                                    aria-controls="hotels-panel"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Hotels
                                </button>
                                <button
                                    id="tab-tours"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'tours' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => handleTabChange('tours')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'tours')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'tours'}
                                    aria-controls="tours-panel"
                                >
                                    <FaMapMarkedAlt className="h-5 w-5 mr-3" />
                                    Tours
                                </button>
                                <button
                                    id="tab-airports"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'airports' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => handleTabChange('airports')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'airports')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'airports'}
                                    aria-controls="airports-panel"
                                >
                                    <FaPlaneDeparture className="h-5 w-5 mr-3" />
                                    Airports
                                </button>
                                {/* Show Users tab to both admins and accountants */}
                                <button
                                    id="tab-users"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'users' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => handleTabChange('users')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'users')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'users'}
                                    aria-controls="users-panel"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Users
                                </button>
                                
                                {/* Only show User Requests tab to full admins */}
                                {isAdmin && (
                                    <button
                                        id="tab-requests"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'requests' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                        onClick={() => handleTabChange('requests')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'requests')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'requests'}
                                        aria-controls="requests-panel"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                                        </svg>
                                        <div className="flex items-center gap-2">
                                            User Requests
                                            {pendingRequests.length > 0 && (
                                                <span className="min-w-[18px] h-[18px] text-xs font-bold text-red-600 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 rounded-full flex items-center justify-center">
                                                    {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                )}
                                
                                {/* Only show Notifications tab to full admins */}
                                {isAdmin && (
                                    <button
                                        id="tab-notifications"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'notifications' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                        onClick={() => handleTabChange('notifications')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'notifications')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'notifications'}
                                        aria-controls="notifications-panel"
                                    >
                                        <FaBell className="h-5 w-5 mr-3" />
                                        Notifications
                                    </button>
                                )}
                            </nav>
                        </div>
                        
                        {/* Main content area */}
                        <div className="flex-1">
                            {/* Mobile tabs - only visible on small screens */}
                            <div className="md:hidden border-b border-gray-200 dark:border-gray-700 mb-4">
                                <div className="flex flex-wrap justify-center gap-1" role="tablist" aria-label="Admin Sections">
                                    <button
                                        id="tab-hotels-mobile"
                                        className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'hotels' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                        onClick={() => handleTabChange('hotels')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'hotels')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'hotels'}
                                        aria-controls="hotels-panel"
                                    >
                                        Hotels
                                    </button>
                                    <button
                                        id="tab-tours-mobile"
                                        className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'tours' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                        onClick={() => handleTabChange('tours')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'tours')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'tours'}
                                        aria-controls="tours-panel"
                                    >
                                        Tours
                                    </button>
                                    <button
                                        id="tab-airports-mobile"
                                        className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'airports' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                        onClick={() => handleTabChange('airports')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'airports')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'airports'}
                                        aria-controls="airports-panel"
                                    >
                                        Airports
                                    </button>
                                    <button
                                        id="tab-users-mobile"
                                        className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                        onClick={() => handleTabChange('users')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'users')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'users'}
                                        aria-controls="users-panel"
                                    >
                                        Users
                                    </button>
                                    {isAdmin && (
                                        <button
                                            id="tab-requests-mobile"
                                            className={`relative py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'requests' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                            onClick={() => handleTabChange('requests')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'requests')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'requests'}
                                            aria-controls="requests-panel"
                                        >
                                            <span className="flex items-center gap-1">
                                                User Requests
                                                {pendingRequests.length > 0 && (
                                                    <span className="min-w-[18px] h-[18px] text-xs font-bold text-red-600 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 rounded-full flex items-center justify-center">
                                                        {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button
                                            id="tab-notifications-mobile"
                                            className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                            onClick={() => handleTabChange('notifications')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'notifications')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'notifications'}
                                            aria-controls="notifications-panel"
                                        >
                                            Notifications
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Tab panels */}
                            {activeTab === 'hotels' && (
                                <Card className="w-full dark:bg-slate-900" id="hotels-panel" role="tabpanel" aria-labelledby="tab-hotels">
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
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                    <option value="Trabzon">Trabzon</option>
                                                </Select>
                                            </div>
                                            
                                            <div className="md:col-span-1">
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
                                                    <option value="">Rating</option>
                                                    <option value="3">3 Stars</option>
                                                    <option value="4">4 Stars</option>
                                                    <option value="5">5 Stars</option>
                                                </Select>
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
                                                                    <Select
                                                                        id={`airport-${index}`}
                                                                        value={item.airport}
                                                                        onChange={(e) => handleAirportTransportationChange(index, 'airport', e.target.value)}
                                                                        required
                                                                    >
                                                                        <option value="">Select Airport</option>
                                                                        {airports.length > 0 && 
                                                                            getAirportOptions().map((airport, idx) => (
                                                                                <option key={idx} value={airport.value}>
                                                                                    {airport.label}
                                                                                </option>
                                                                            ))
                                                                        }
                                                                    </Select>
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
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Vito: 2-8 persons, Sprinter: 9-16 persons
                                            </p>
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
                                        
                                        <CustomButton 
                                            type="submit"
                                            variant="pinkToOrange"
                                        >
                                            Add Hotel
                                        </CustomButton>
                                        
                                        {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                                    </form>
                                </Card>
                            )}

                            {activeTab === 'tours' && (
                                <Card className="w-full dark:bg-slate-900" id="tours-panel" role="tabpanel" aria-labelledby="tab-tours">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Add New Tour</h2>
                                    
                                    <div className="flex justify-end mb-4">
                                        <CustomButton
                                            variant="gray"
                                            onClick={openTourDuplicateModal}
                                            title="Duplicate existing tour data"
                                            icon={HiDuplicate}
                                        >
                                            Duplicate Tour
                                        </CustomButton>
                                    </div>
                                    
                                    <form onSubmit={handleTourSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    <option value="Trabzon">Trabzon</option>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                                                <div className={`grid grid-cols-1 ${tourData.tourType === 'Group' ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="tourType" value="Tour Type" />
                                </div>
                                <Select
                                    id="tourType"
                                    name="tourType"
                                    value={tourData.tourType}
                                    onChange={handleTourChange}
                                    required
                                >
                                    <option value="Group">Group Tour (per person)</option>
                                    <option value="VIP">VIP Tour (per car)</option>
                                </Select>
                            </div>
                            
                            {tourData.tourType === 'VIP' && (
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="vipCarType" value="VIP Car Type" />
                                    </div>
                                    <Select
                                        id="vipCarType"
                                        name="vipCarType"
                                        value={tourData.vipCarType}
                                        onChange={handleVipCarTypeChange}
                                        required
                                    >
                                        <option value="Vito">Vito (2-8 persons)</option>
                                        <option value="Sprinter">Sprinter (9-16 persons)</option>
                                    </Select>
                                </div>
                            )}
                            
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="tourPrice" value={tourData.tourType === 'Group' ? 'Price per Person ($)' : 'Price per Car ($)'} />
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
                        </div>
                        
                        {tourData.tourType === 'VIP' && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {tourData.vipCarType === 'Vito' 
                                    ? 'Capacity: 2-8 persons' 
                                    : 'Capacity: 9-16 persons'}
                            </div>
                        )}
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourDesc" value="Brief Description" />
                            </div>
                            <TextInput
                                id="tourDesc"
                                name="description"
                                value={tourData.description}
                                onChange={handleTourChange}
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
                                            <Label value="Tour Highlights" className="mb-2 block" />
                                            <div className="flex gap-2 mb-3">
                                                <TextInput
                                                    placeholder="Add a highlight"
                                                    value={highlightInput}
                                                    onChange={(e) => setHighlightInput(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <CustomButton 
                                                    type="button"
                                                    onClick={handleAddHighlight}
                                                    variant="purple"
                                                    icon={HiPlus}
                                                    title="Add highlight to tour"
                                                >
                                                    Add
                                                </CustomButton>
                                            </div>
                                            
                                            {tourData.highlights.length > 0 && (
                                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                                    <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Added Highlights:</h4>
                                                    <ul className="space-y-2">
                                                        {tourData.highlights.map((highlight, index) => (
                                                            <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                                                                <span className="text-gray-800 dark:text-gray-200">• {highlight}</span>
                                                                <CustomButton
                                                                    variant="red"
                                                                    size="xs"
                                                                    onClick={() => handleRemoveHighlight(index)}
                                                                    icon={HiX}
                                                                    title="Remove highlight"
                                                                />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <CustomButton 
                                            type="submit"
                                            variant="pinkToOrange"
                                        >
                                            Add Tour
                                        </CustomButton>
                                        
                                        {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                                    </form>
                                </Card>
                            )}

                            {activeTab === 'airports' && (
                                <Card className="w-full dark:bg-slate-900" id="airports-panel" role="tabpanel" aria-labelledby="tab-airports">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Add New Airport</h2>
                                    
                                    <form onSubmit={handleAirportSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        </div>
                                        
                                        <CustomButton 
                                            type="submit"
                                            variant="pinkToOrange"
                                        >
                                            Add Airport
                                        </CustomButton>
                                        
                                        {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                                    </form>
                                    
                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold mb-4 dark:text-white">Existing Airports</h3>
                                        {airports.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {airports.map(airport => (
                                                    <Card key={airport._id} className="overflow-hidden dark:bg-slate-900">
                                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                            <div>
                                                                <p className="font-medium text-lg dark:text-white">{airport.name}</p>
                                                                <p className="text-gray-600 dark:text-gray-400">{airport.arabicName}</p>
                                                            </div>
                                                            <CustomButton
                                                                variant="red"
                                                                size="xs"
                                                                onClick={() => handleDeleteAirport(airport._id)}
                                                                title="Delete airport"
                                                                icon={({ className }) => (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                )}
                                                            >
                                                                Delete
                                                            </CustomButton>
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

                            {activeTab === 'users' && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-900" id="users-panel" role="tabpanel" aria-labelledby="tab-users">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">User Management</h2>
                                    
                                    {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                                    
                                    {users.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <Table.Head>
                                                    <Table.HeadCell>Username</Table.HeadCell>
                                                    <Table.HeadCell className="text-center">Role</Table.HeadCell>
                                                    {isAdmin && (
                                                        <>
                                                            <Table.HeadCell>Admin Actions</Table.HeadCell>
                                                            <Table.HeadCell>Accountant Actions</Table.HeadCell>
                                                            <Table.HeadCell>Delete</Table.HeadCell>
                                                        </>
                                                    )}
                                                </Table.Head>
                                                <Table.Body className="divide-y">
                                                    {users
                                                        .sort((a, b) => {
                                                            // Sort by role priority: Admin (3) > Accountant (2) > User (1)
                                                            const getRolePriority = (user) => {
                                                                if (user.isAdmin) return 3;
                                                                if (user.isAccountant) return 2;
                                                                return 1;
                                                            };
                                                            return getRolePriority(b) - getRolePriority(a);
                                                        })
                                                        .map(user => (
                                                        <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-slate-900">
                                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                                {user.username}
                                                            </Table.Cell>
                                                            <Table.Cell className="flex items-center justify-center">
                                                                <UserBadge 
                                                                    user={user}
                                                                />
                                                            </Table.Cell>
                                                            {isAdmin && (
                                                                <>
                                                                    <Table.Cell>
                                                                        <div className="flex items-center">
                                                                            {user.isAdmin ? (
                                                                                <CustomButton
                                                                                    variant="orange"
                                                                                    onClick={() => handleToggleAdminStatus(user._id, user.isAdmin)}
                                                                                    title="Revoke admin privileges"
                                                                                >
                                                                                    Revoke
                                                                                </CustomButton>
                                                                            ) : (
                                                                                <CustomButton
                                                                                    variant="blue"
                                                                                    onClick={() => handleToggleAdminStatus(user._id, user.isAdmin)}
                                                                                    disabled={user.isAccountant}
                                                                                    title="Assign admin privileges"
                                                                                >
                                                                                    Assign
                                                                                </CustomButton>
                                                                            )}
                                                                        </div>
                                                                    </Table.Cell>
                                                                    <Table.Cell>
                                                                        <div className="flex items-center">
                                                                            {user.isAccountant ? (
                                                                                <CustomButton
                                                                                    variant="orange"
                                                                                    onClick={() => handleToggleAccountantStatus(user._id, user.isAccountant)}
                                                                                    title="Revoke accountant privileges"
                                                                                >
                                                                                    Revoke
                                                                                </CustomButton>
                                                                            ) : (
                                                                                <CustomButton
                                                                                    variant="teal"
                                                                                    onClick={() => handleToggleAccountantStatus(user._id, user.isAccountant)}
                                                                                    disabled={user.isAdmin}
                                                                                    title="Assign accountant privileges"
                                                                                >
                                                                                    Assign
                                                                                </CustomButton>
                                                                            )}
                                                                        </div>
                                                                    </Table.Cell>
                                                                    <Table.Cell>
                                                                        <CustomButton
                                                                            variant="red"
                                                                            onClick={() => openDeleteUserModal(user)}
                                                                            title="Delete user"
                                                                            icon={({ className }) => (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            )}
                                                                        >
                                                                            Delete
                                                                        </CustomButton>
                                                                    </Table.Cell>
                                                                </>
                                                            )}
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
                            
                            {activeTab === 'requests' && isAdmin && (
                                <Card className="w-full dark:bg-slate-900" id="requests-panel" role="tabpanel" aria-labelledby="tab-requests">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Pending User Approval Requests</h2>
                                    
                                    {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                                    
                                    {pendingRequests.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <Table.Head>
                                                    <Table.HeadCell>Username</Table.HeadCell>
                                                    <Table.HeadCell>Registration Date</Table.HeadCell>
                                                    <Table.HeadCell>Actions</Table.HeadCell>
                                                </Table.Head>
                                                <Table.Body className="divide-y">
                                                    {pendingRequests.map(user => (
                                                        <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-slate-900">
                                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                                {user.username}
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                <div className="flex items-center space-x-2">
                                                                    <CustomButton
                                                                        variant="green"
                                                                        onClick={() => handleToggleApprovalStatus(user._id, user.isApproved)}
                                                                        title="Approve user account"
                                                                        icon={({ className }) => (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    >
                                                                        Approve
                                                                    </CustomButton>
                                                                    <CustomButton
                                                                        variant="red"
                                                                        onClick={() => openDeleteUserModal(user)}
                                                                        title="Reject user account"
                                                                        icon={({ className }) => (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        )}
                                                                    >
                                                                        Reject
                                                                    </CustomButton>
                                                                </div>
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="py-8 px-4 mx-auto text-center rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 bg-white dark:bg-slate-900">
                                            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full">
                                                <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                                </svg>
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">No pending requests</h3>
                                            <p className="mb-4 text-gray-500 dark:text-gray-400">There are no new user accounts awaiting approval at this time.</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">New registration requests will appear here when users sign up.</p>
                                        </div>
                                    )}
                                </Card>
                            )}
                            
                            {/* Notifications Panel */}
                            {activeTab === 'notifications' && isAdmin && (
                                <Card className="w-full dark:bg-slate-900" id="notifications-panel" role="tabpanel" aria-labelledby="tab-notifications">
                                    <h2 className="text-2xl font-bold mb-6 dark:text-white text-center flex items-center justify-center">
                                        <FaBell className="mr-3 text-teal-600 dark:text-teal-400" />
                                        Notification Management
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        {/* Notification Tools */}
                                        <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-lg border border-teal-200 dark:border-teal-700">
                                            <h3 className="text-lg font-semibold mb-4 text-teal-800 dark:text-teal-300">
                                                System Tools
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Arrival Reminders
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Generate notifications for vouchers with clients arriving tomorrow.
                                                    </p>
                                                    <CustomButton
                                                        variant="teal"
                                                        onClick={handleGenerateArrivalReminders}
                                                        disabled={notificationLoading}
                                                        title="Generate arrival reminder notifications"
                                                        icon={notificationLoading ? null : FaBell}
                                                    >
                                                        {notificationLoading ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            "Generate Arrival Reminders"
                                                        )}
                                                    </CustomButton>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Daily Summary
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Generate morning summary of today's arrivals.
                                                    </p>
                                                    <CustomButton
                                                        variant="orange"
                                                        onClick={handleGenerateDailySummary}
                                                        disabled={notificationLoading}
                                                        title="Generate daily arrivals summary"
                                                        icon={notificationLoading ? null : FaCalendarDay}
                                                    >
                                                        {notificationLoading ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            "Generate Daily Summary"
                                                        )}
                                                    </CustomButton>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Cleanup
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Remove expired notifications from the system.
                                                    </p>
                                                    <CustomButton
                                                        variant="red"
                                                        onClick={handleCleanupExpiredNotifications}
                                                        disabled={notificationLoading}
                                                        title="Remove expired notifications"
                                                        icon={notificationLoading ? null : HiTrash}
                                                    >
                                                        {notificationLoading ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Cleaning...
                                                            </>
                                                        ) : (
                                                            "Cleanup Expired"
                                                        )}
                                                    </CustomButton>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </Card>
                            )}
                            
                            {/* Duplicate Hotel Modal */}
                            <Modal
                                show={duplicateModalOpen}
                                onClose={closeDuplicateModal}
                                size="lg"
                                popup
                            >
                                <Modal.Header>
                                    <div className="text-center">
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Duplicate Existing Hotel
                                        </h3>
                                    </div>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="space-y-6">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Select a hotel to duplicate its data. You can modify the duplicated data before creating a new hotel.
                                        </p>
                                        
                                        {hotels.length > 0 ? (
                                            <>
                                                <div>
                                                    <Label htmlFor="selectHotelToDuplicate" value="Select Hotel" />
                                                    <Select
                                                        id="selectHotelToDuplicate"
                                                        value={selectedHotelToDuplicate}
                                                        onChange={(e) => setSelectedHotelToDuplicate(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select a hotel</option>
                                                        {hotels.map(hotel => (
                                                            <option key={hotel._id} value={hotel._id}>
                                                                {hotel.name} - {hotel.city} ({hotel.stars}★)
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </div>
                                                
                                                <div className="flex justify-end gap-3">
                                                    <CustomButton
                                                        variant="gray"
                                                        onClick={closeDuplicateModal}
                                                    >
                                                        Cancel
                                                    </CustomButton>
                                                    <CustomButton
                                                        variant="blue"
                                                        onClick={handleDuplicateHotel}
                                                        disabled={!selectedHotelToDuplicate}
                                                        icon={HiDuplicate}
                                                        title="Duplicate selected hotel"
                                                    >
                                                        Duplicate
                                                    </CustomButton>
                                                </div>
                                            </>
                                        ) : (
                                            <Alert color="info">
                                                No hotels available to duplicate. Please add a hotel first.
                                            </Alert>
                                        )}
                                    </div>
                                </Modal.Body>
                            </Modal>
                            
                            {/* Tour Duplicate Modal */}
                            <Modal
                                show={tourDuplicateModalOpen}
                                onClose={closeTourDuplicateModal}
                                size="lg"
                                popup
                            >
                                <Modal.Header>
                                    <div className="text-center">
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Duplicate Existing Tour
                                        </h3>
                                    </div>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="space-y-6">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Select a tour to duplicate its data. You can modify the duplicated data before creating a new tour.
                                        </p>
                                        
                                        {tours.length > 0 ? (
                                            <>
                                                <div>
                                                    <Label htmlFor="selectTourToDuplicate" value="Select Tour" />
                                                    <Select
                                                        id="selectTourToDuplicate"
                                                        value={selectedTourToDuplicate}
                                                        onChange={(e) => setSelectedTourToDuplicate(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select a tour</option>
                                                        {tours.map(tour => (
                                                            <option key={tour._id} value={tour._id}>
                                                                {tour.name} - {tour.city} ({tour.tourType})
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </div>
                                                
                                                <div className="flex justify-end gap-3">
                                                    <CustomButton
                                                        variant="gray"
                                                        onClick={closeTourDuplicateModal}
                                                    >
                                                        Cancel
                                                    </CustomButton>
                                                    <CustomButton
                                                        variant="blue"
                                                        onClick={handleDuplicateTour}
                                                        disabled={!selectedTourToDuplicate}
                                                        icon={HiDuplicate}
                                                        title="Duplicate selected tour"
                                                    >
                                                        Duplicate
                                                    </CustomButton>
                                                </div>
                                            </>
                                        ) : (
                                            <Alert color="info">
                                                No tours available to duplicate. Please add a tour first.
                                            </Alert>
                                        )}
                                    </div>
                                </Modal.Body>
                            </Modal>

                            {/* Delete User Confirmation Modal */}
                            <Modal
                                show={deleteUserModalOpen}
                                onClose={closeDeleteUserModal}
                                popup
                                size="md"
                                theme={{
                                    root: {
                                        base: "fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
                                        show: {
                                            on: "flex bg-gray-900 bg-opacity-50 backdrop-blur-sm dark:bg-opacity-80 items-center justify-center",
                                            off: "hidden"
                                        }
                                    },
                                    content: {
                                        base: "relative h-full w-full p-4 h-auto",
                                        inner: "relative rounded-lg bg-white shadow dark:bg-slate-900 flex flex-col max-h-[90vh]"
                                    }
                                }}
                            >
                                <Modal.Header />
                                <Modal.Body>
                                    <div className="text-center">
                                        <HiTrash className="mx-auto mb-4 h-12 w-12 text-red-500" />
                                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                            Are you sure you want to {activeTab === 'requests' ? 'reject' : 'delete'} the user
                                            <div className="font-bold text-gray-900 dark:text-white mt-1">
                                                "{userToDelete?.username}"?
                                            </div>
                                        </h3>
                                        <div className="flex justify-center gap-4">
                                            <CustomButton
                                                variant="red"
                                                onClick={handleDeleteUser}
                                                disabled={deleteUserLoading}
                                                icon={({ className }) => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            >
                                                Yes, {activeTab === 'requests' ? 'reject' : 'delete'} user
                                            </CustomButton>
                                            <CustomButton
                                                variant="gray"
                                                onClick={closeDeleteUserModal}
                                                disabled={deleteUserLoading}
                                            >
                                                No, cancel
                                            </CustomButton>
                                        </div>
                                    </div>
                                </Modal.Body>
                            </Modal>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
    