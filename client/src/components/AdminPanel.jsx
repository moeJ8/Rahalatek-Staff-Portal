import React from 'react'
import axios from 'axios'
import { useState, useEffect, useMemo } from 'react'
import { TextInput, Checkbox, Textarea, Card, Label, Alert, Select, Table, Accordion, Modal } from 'flowbite-react'
import { HiPlus, HiX, HiTrash, HiCalendar, HiDuplicate } from 'react-icons/hi'
import { FaPlaneDeparture, FaMapMarkedAlt, FaBell, FaCalendarDay, FaBuilding, FaDollarSign, FaFileInvoiceDollar, FaUser, FaChartLine } from 'react-icons/fa'
import toast from 'react-hot-toast'
import UserBadge from './UserBadge'
import CustomButton from './CustomButton'
import RahalatekLoader from './RahalatekLoader'
import SearchableSelect from './SearchableSelect'
import CustomTable from './CustomTable'
import CustomScrollbar from './CustomScrollbar'
import FinancialFloatingTotalsPanel from './FinancialFloatingTotalsPanel'
import { generateArrivalReminders, cleanupExpiredNotifications } from '../utils/notificationApi'
import { getAllVouchers, updateVoucherStatus } from '../utils/voucherApi'
import StatusControls from './StatusControls'
import PaymentDateControls from './PaymentDateControls'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminPanel() {
    const navigate = useNavigate();
    
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
            ? ['hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials', 'debts', 'users', 'requests', 'notifications']
            : ['hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials', 'debts']; // Accountants can access financials and debts but not users/requests
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
        
        // Fetch offices data when switching to offices tab and data not loaded yet
        if (tabName === 'offices' && offices.length === 0 && dataLoaded) {
            fetchOffices();
        }
        
        // Reset office vouchers when switching to office-vouchers tab
        if (tabName === 'office-vouchers') {
            setSelectedOfficeForVouchers('');
            setOfficeVouchers([]);
            // Fetch users for the dropdown if not already fetched
            if (allUsers.length === 0) {
                fetchAllUsersForVouchers();
            }
        }
        
        // Fetch financial data when switching to financials tab
        if (tabName === 'financials' && dataLoaded) {
            fetchFinancialData();
        }
        
        // Fetch debt data when switching to debts tab
        if (tabName === 'debts' && dataLoaded) {
            fetchDebts();
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
    const [officeData, setOfficeData] = useState({
        name: '',
        location: '',
        email: '',
        phoneNumber: '',
        description: ''
    });
    const [airports, setAirports] = useState([]);
    const [offices, setOffices] = useState([]);
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
    
    // Add state for office vouchers functionality
    const [selectedOfficeForVouchers, setSelectedOfficeForVouchers] = useState('');
    const [officeVouchers, setOfficeVouchers] = useState([]);
    const [officeVouchersLoading, setOfficeVouchersLoading] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    
    // Add state for financials functionality
    const [financialData, setFinancialData] = useState([]);
    const [financialLoading, setFinancialLoading] = useState(false);
    const [allVouchers, setAllVouchers] = useState([]);
    const [financialFilters, setFinancialFilters] = useState({
        month: (new Date().getMonth() + 1).toString(), // Current month (1-12)
        year: new Date().getFullYear().toString(),
        currency: 'USD', // Default to USD
        viewType: 'providers' // 'providers' or 'clients'
    });
    
    // Add state for financial search
    const [financialSearchQuery, setFinancialSearchQuery] = useState('');
    const [clientTypeFilter, setClientTypeFilter] = useState('all');
    
    // Add state for debt management
    const [debts, setDebts] = useState([]);
    const [debtLoading, setDebtLoading] = useState(false);
    const [debtFilters, setDebtFilters] = useState({
        office: '',
        status: '',
        type: ''
    });
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const [debtForm, setDebtForm] = useState({
        officeName: '',
        amount: '',
        currency: 'USD',
        type: 'OWED_TO_OFFICE',
        description: '',
        dueDate: '',
        notes: ''
    });

    // Add state for debt deletion modal
    const [deleteDebtModalOpen, setDeleteDebtModalOpen] = useState(false);
    const [debtToDelete, setDebtToDelete] = useState(null);
    const [deleteDebtLoading, setDeleteDebtLoading] = useState(false);
    
    // Add state for office search
    const [officeSearchQuery, setOfficeSearchQuery] = useState('');
    
    // Custom city input state for hotels
    const [useCustomHotelCity, setUseCustomHotelCity] = useState(false);
    
    // Calculate totals by currency
    const totalsByCurrency = useMemo(() => {
        if (officeVouchers.length === 0) return {};
        
        return officeVouchers.reduce((acc, voucher) => {
            const currency = voucher.currency || 'USD';
            const total = parseFloat(voucher.totalAmount) || 0;
            const advanced = parseFloat(voucher.advancedPayment) || 0;

            if (!acc[currency]) {
                acc[currency] = { totalAmount: 0, totalAdvanced: 0 };
            }

            acc[currency].totalAmount += total;
            acc[currency].totalAdvanced += advanced;

            return acc;
        }, {});
    }, [officeVouchers]);

    // Filter offices based on search query
    const filteredOffices = useMemo(() => {
        if (!officeSearchQuery.trim()) {
            return offices;
        }
        
        const searchLower = officeSearchQuery.toLowerCase();
        return offices.filter(office => 
            office.name.toLowerCase().includes(searchLower) ||
            office.location.toLowerCase().includes(searchLower) ||
            office.email.toLowerCase().includes(searchLower) ||
            office.phoneNumber.toLowerCase().includes(searchLower)
        );
    }, [offices, officeSearchQuery]);

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
                    const [airportsResponse, hotelsResponse, toursResponse, officesResponse] = await Promise.all([
                        axios.get('/api/airports'),
                        axios.get('/api/hotels'),
                        axios.get('/api/tours'),
                        axios.get('/api/offices')
                    ]);
                    
                    setAirports(airportsResponse.data);
                    setHotels(hotelsResponse.data);
                    setTours(toursResponse.data);
                    setOffices(officesResponse.data.data);
                    
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

    // Auto-fetch debts when filters change
    useEffect(() => {
        if (activeTab === 'financials' && dataLoaded) {
            fetchDebts();
        }
    }, [debtFilters, activeTab, dataLoaded]);

    // Auto-fetch financial data when currency filter changes
    useEffect(() => {
        if (activeTab === 'financials' && dataLoaded) {
            fetchFinancialData();
        }
    }, [financialFilters.currency, activeTab, dataLoaded]);

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

    const fetchOffices = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/offices');
            setOffices(response.data.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch offices:', err);
            setError(err.response?.data?.message || 'Failed to fetch offices');
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

    const toggleCustomHotelCity = () => {
        setUseCustomHotelCity(!useCustomHotelCity);
        // Reset city value when toggling
        setHotelData({
            ...hotelData,
            city: ''
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

    const handleOfficeChange = (e) => {
        const { name, value } = e.target;
        setOfficeData({
            ...officeData,
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

    const handleOfficeSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/offices', officeData);
            setOffices([...offices, response.data.data]);
            setOfficeData({
                name: '',
                location: '',
                email: '',
                phoneNumber: '',
                description: ''
            });
            toast.success('Office added successfully!', {
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
            setError('Failed to add office');
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

    const handleDeleteOffice = async (id) => {
        try {
            await axios.delete(`/api/offices/${id}`);
            setOffices(offices.filter(office => office._id !== id));
            toast.success('Office deleted successfully!', {
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
            setError('Failed to delete office');
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
                ? ['hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials', 'users', 'requests']
                : ['hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials']; // Accountants can access financials but not users/requests
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

    // Helper functions for vouchers
    const getCurrencySymbol = (currency) => {
        if (!currency) return '$';
        switch (currency) {
            case 'EUR': return '€';
            case 'TRY': return '₺';
            case 'USD':
            default: return '$';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Fetch vouchers for selected office
    const fetchOfficeVouchers = async (officeName) => {
        if (!officeName) return;
        
        setOfficeVouchersLoading(true);
        try {
            const response = await getAllVouchers();
            
            // Filter vouchers by office name
            const filteredVouchers = response.data.filter(voucher => 
                voucher.officeName === officeName
            );
            
            setOfficeVouchers(filteredVouchers);
            setError('');
        } catch (err) {
            console.error('Failed to fetch office vouchers:', err);
            setError(err.response?.data?.message || 'Failed to fetch office vouchers');
        } finally {
            setOfficeVouchersLoading(false);
        }
    };

    // Handle office selection for vouchers
    const handleOfficeSelection = async (eventOrOfficeName) => {
        // Handle both event objects and direct string values for compatibility
        const officeName = typeof eventOrOfficeName === 'string' 
            ? eventOrOfficeName 
            : eventOrOfficeName?.target?.value || eventOrOfficeName;
            
        setSelectedOfficeForVouchers(officeName);
        if (officeName) {
            await fetchOfficeVouchers(officeName);
        } else {
            setOfficeVouchers([]);
        }
    };

    // Handle status update for vouchers
    const handleVoucherStatusUpdate = async (voucherId, newStatus) => {
        try {
            await updateVoucherStatus(voucherId, newStatus);
            setOfficeVouchers(prevVouchers =>
                prevVouchers.map(voucher =>
                    voucher._id === voucherId
                        ? { ...voucher, status: newStatus }
                        : voucher
                )
            );
            toast.success('Voucher status updated successfully');
        } catch (err) {
            console.error('Error updating voucher status:', err);
            toast.error('Failed to update voucher status');
        }
    };

    // Handle payment date update for vouchers
    const handlePaymentDateUpdate = async (voucherId, paymentDate) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/vouchers/${voucherId}/payment-date`, 
                { paymentDate },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setOfficeVouchers(prevVouchers =>
                prevVouchers.map(voucher =>
                    voucher._id === voucherId
                        ? { ...voucher, paymentDate }
                        : voucher
                )
            );
            toast.success('Payment date updated successfully');
        } catch (err) {
            console.error('Error updating payment date:', err);
            toast.error('Failed to update payment date');
        }
    };

    // Check if user can manage a voucher
    const canManageVoucher = (voucher) => {
        if (isAdmin || isAccountant) return true;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        return voucher.createdBy && voucher.createdBy._id === currentUser.id;
    };

    // Fetch all users for the created by dropdown
    const fetchAllUsersForVouchers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Fetch and aggregate financial data
    const fetchFinancialData = async () => {
        setFinancialLoading(true);
        try {
            const response = await getAllVouchers();
            const vouchers = response.data;
            
            // Store all vouchers for client office calculations
            setAllVouchers(vouchers);
            
            // Filter vouchers by selected currency first
            const filteredVouchers = vouchers.filter(voucher => {
                const voucherCurrency = voucher.currency || 'USD';
                return voucherCurrency === financialFilters.currency;
            });
            
            // Aggregate payment data by office and month for selected currency
            const aggregatedData = {};
            const voucherTracker = {}; // Track vouchers per office-month to avoid double counting
            
            filteredVouchers.forEach(voucher => {
                if (!voucher.payments) return;
                
                const voucherDate = new Date(voucher.createdAt);
                const monthYear = `${voucherDate.getFullYear()}-${String(voucherDate.getMonth() + 1).padStart(2, '0')}`;
                
                // Process each payment type
                Object.keys(voucher.payments).forEach(paymentType => {
                    const payment = voucher.payments[paymentType];
                    if (payment.officeName && payment.price > 0) {
                        const key = `${payment.officeName}-${monthYear}`;
                        
                        if (!aggregatedData[key]) {
                            aggregatedData[key] = {
                                officeName: payment.officeName,
                                month: monthYear,
                                year: voucherDate.getFullYear(),
                                monthName: voucherDate.toLocaleString('default', { month: 'long' }),
                                hotels: 0,
                                transfers: 0,
                                trips: 0,
                                flights: 0,
                                total: 0,
                                currency: voucher.currency || 'USD',
                                voucherCount: 0,
                                voucherIds: new Set()
                            };
                            voucherTracker[key] = new Set();
                        }
                        
                        aggregatedData[key][paymentType] += payment.price;
                        aggregatedData[key].total += payment.price;
                        
                        // Track unique vouchers
                        if (!voucherTracker[key].has(voucher._id)) {
                            voucherTracker[key].add(voucher._id);
                            aggregatedData[key].voucherCount++;
                        }
                    }
                });
            });
            
            // Convert to array, clean up, and sort
            const financialArray = Object.values(aggregatedData).map(item => {
                // Remove the voucherIds set that was used for tracking
                const { voucherIds: _voucherIds, ...cleanItem } = item;
                return cleanItem;
            }).sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                if (a.month !== b.month) return b.month.localeCompare(a.month);
                return a.officeName.localeCompare(b.officeName);
            });
            
            setFinancialData(financialArray);
            setError('');
        } catch (err) {
            console.error('Failed to fetch financial data:', err);
            setError(err.response?.data?.message || 'Failed to fetch financial data');
        } finally {
            setFinancialLoading(false);
        }
    };

    // Filter financial data based on current filters
    const filteredFinancialData = financialData.filter(item => {
        if (financialFilters.year && item.year.toString() !== financialFilters.year) return false;
        
        // Only apply month filter if a specific month is selected (not "All Months")
        if (financialFilters.month && typeof financialFilters.month === 'string' && financialFilters.month.trim() !== '') {
            const expectedMonth = `${financialFilters.year}-${financialFilters.month.padStart(2, '0')}`;
            if (item.month !== expectedMonth) return false;
        }
        
        // Apply search filter
        if (financialSearchQuery.trim()) {
            const searchLower = financialSearchQuery.toLowerCase();
            if (!item.officeName.toLowerCase().includes(searchLower)) return false;
        }
        
        return true;
    });

    // Calculate totals for filtered data
    const financialTotals = filteredFinancialData.reduce((acc, item) => {
        acc.hotels += item.hotels;
        acc.transfers += item.transfers;
        acc.trips += item.trips;
        acc.flights += item.flights;
        acc.total += item.total;
        acc.voucherCount += item.voucherCount;
        return acc;
    }, { hotels: 0, transfers: 0, trips: 0, flights: 0, total: 0, voucherCount: 0 });

    // Calculate total client revenue (independent of view filter)
    const totalClientRevenue = useMemo(() => {
        // Filter vouchers by currency and date filters only
        const filteredVouchers = allVouchers.filter(voucher => {
            const voucherCurrency = voucher.currency || 'USD';
            if (voucherCurrency !== financialFilters.currency) return false;
            
            // Apply date filters
            const voucherDate = new Date(voucher.createdAt);
            const voucherYear = voucherDate.getFullYear();
            const voucherMonth = voucherDate.getMonth() + 1;
            
            if (financialFilters.year && voucherYear.toString() !== financialFilters.year) return false;
            
            // Only apply month filter if a specific month is selected
            if (financialFilters.month && typeof financialFilters.month === 'string' && financialFilters.month.trim() !== '') {
                if (voucherMonth.toString() !== financialFilters.month) return false;
            }
            
            return true;
        });

        return filteredVouchers.reduce((total, voucher) => total + (voucher.totalAmount || 0), 0);
    }, [allVouchers, financialFilters.currency, financialFilters.year, financialFilters.month]);

    // Calculate total supplier revenue (independent of view filter)
    const totalSupplierRevenue = useMemo(() => {
        // Filter financial data by currency and date filters only
        const filteredSupplierData = financialData.filter(item => {
            if (financialFilters.year && item.year.toString() !== financialFilters.year) return false;
            
            // Only apply month filter if a specific month is selected
            if (financialFilters.month && typeof financialFilters.month === 'string' && financialFilters.month.trim() !== '') {
                const expectedMonth = `${financialFilters.year}-${financialFilters.month.padStart(2, '0')}`;
                if (item.month !== expectedMonth) return false;
            }
            
            return true;
        });

        return filteredSupplierData.reduce((total, item) => total + (item.total || 0), 0);
    }, [financialData, financialFilters.year, financialFilters.month]);

    // Calculate client office data when viewType is 'clients'
    const clientOfficeData = useMemo(() => {
        if (financialFilters.viewType !== 'clients') return [];

        // Filter vouchers by currency and filters
        const filteredVouchers = allVouchers.filter(voucher => {
            const voucherCurrency = voucher.currency || 'USD';
            if (voucherCurrency !== financialFilters.currency) return false;
            
            // Apply date filters
            const voucherDate = new Date(voucher.createdAt);
            const voucherYear = voucherDate.getFullYear();
            const voucherMonth = voucherDate.getMonth() + 1;
            
            if (financialFilters.year && voucherYear.toString() !== financialFilters.year) return false;
            
            // Only apply month filter if a specific month is selected (not "All Months")
            if (financialFilters.month && typeof financialFilters.month === 'string' && financialFilters.month.trim() !== '') {
                if (voucherMonth.toString() !== financialFilters.month) return false;
            }
            
            return true;
        });

        // Group vouchers by office and month (like suppliers)
        const clientOfficesMap = new Map();
        
        filteredVouchers.forEach(voucher => {
            // Include both office-based clients and direct clients
            const clientName = voucher.officeName || voucher.clientName;
            const isDirectClient = !voucher.officeName;
            
            if (!clientName) return; // Skip if no client identifier
            
            const voucherDate = new Date(voucher.createdAt);
            const monthYear = `${voucherDate.getFullYear()}-${String(voucherDate.getMonth() + 1).padStart(2, '0')}`;
            const monthName = voucherDate.toLocaleString('default', { month: 'long' });
            const year = voucherDate.getFullYear();
            
            const key = `${clientName}-${monthYear}`;
            
            if (!clientOfficesMap.has(key)) {
                clientOfficesMap.set(key, {
                    officeName: clientName, // Use clientName for direct clients
                    isDirectClient: isDirectClient,
                    month: monthYear,
                    monthName,
                    year,
                    totalAmount: 0,
                    voucherCount: 0,
                    vouchers: []
                });
            }
            
            const officeData = clientOfficesMap.get(key);
            officeData.totalAmount += parseFloat(voucher.totalAmount) || 0;
            officeData.voucherCount += 1;
            officeData.vouchers.push(voucher);
        });
        
        // Convert to array and sort by year desc, month desc, then total amount desc
        return Array.from(clientOfficesMap.values())
            .filter(office => {
                // Apply search filter
                if (financialSearchQuery.trim()) {
                    const searchLower = financialSearchQuery.toLowerCase();
                    if (!office.officeName.toLowerCase().includes(searchLower)) return false;
                }
                
                // Apply client type filter
                if (clientTypeFilter === 'office' && office.isDirectClient) return false;
                if (clientTypeFilter === 'direct' && !office.isDirectClient) return false;
                
                return true;
            })
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                if (a.month !== b.month) return b.month.localeCompare(a.month);
                return b.totalAmount - a.totalAmount;
            });
    }, [financialFilters, allVouchers, financialSearchQuery, clientTypeFilter]);

    // Handle filter changes
    const handleFinancialFilterChange = (filterType, value) => {
        setFinancialFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        
        if (filterType === 'viewType') {
            setClientTypeFilter('all');
        }
    };

    const clearFinancialFilters = () => {
        setFinancialFilters({
            month: (new Date().getMonth() + 1).toString(), // Current month (1-12)
            year: new Date().getFullYear().toString(),
            currency: 'USD',
            viewType: 'providers'
        });
        setClientTypeFilter('all');
    };

    // Debt management functions
    const fetchDebts = async () => {
        setDebtLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (debtFilters.office) params.append('office', debtFilters.office);
            if (debtFilters.status) params.append('status', debtFilters.status);
            if (debtFilters.type) params.append('type', debtFilters.type);
            
            const response = await axios.get(`/api/debts?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setDebts(response.data.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch debts:', err);
            setError(err.response?.data?.message || 'Failed to fetch debts');
        } finally {
            setDebtLoading(false);
        }
    };

    const handleDebtSubmit = async (e) => {
        e.preventDefault();
        setDebtLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = editingDebt ? `/api/debts/${editingDebt._id}` : '/api/debts';
            const method = editingDebt ? 'PUT' : 'POST';
            
            await axios({
                method,
                url,
                data: debtForm,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(`Debt ${editingDebt ? 'updated' : 'created'} successfully!`, {
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
            setShowDebtModal(false);
            setEditingDebt(null);
            resetDebtForm();
            fetchDebts();
        } catch (err) {
            console.error('Failed to save debt:', err);
            toast.error(err.response?.data?.message || 'Failed to save debt');
        } finally {
            setDebtLoading(false);
        }
    };

    const handleCloseDebt = async (debtId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/debts/${debtId}/close`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Debt closed successfully!', {
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
            fetchDebts();
        } catch (err) {
            console.error('Failed to close debt:', err);
            toast.error(err.response?.data?.message || 'Failed to close debt');
        }
    };

    const handleDeleteDebt = async () => {
        if (!debtToDelete) return;
        
        setDeleteDebtLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/debts/${debtToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Debt deleted successfully!', {
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
            
            fetchDebts();
            closeDeleteDebtModal();
        } catch (err) {
            console.error('Failed to delete debt:', err);
            toast.error(err.response?.data?.message || 'Failed to delete debt');
        } finally {
            setDeleteDebtLoading(false);
        }
    };

    // Add functions to open and close the delete debt modal
    const openDeleteDebtModal = (debt) => {
        setDebtToDelete(debt);
        setDeleteDebtModalOpen(true);
    };

    const closeDeleteDebtModal = () => {
        setDeleteDebtModalOpen(false);
        setDebtToDelete(null);
    };

    const openDebtModal = (debt = null) => {
        if (debt) {
            setEditingDebt(debt);
            setDebtForm({
                officeName: debt.officeName,
                amount: debt.amount.toString(),
                currency: debt.currency,
                type: debt.type,
                description: debt.description || '',
                dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '',
                notes: debt.notes || ''
            });
        } else {
            setEditingDebt(null);
            resetDebtForm();
        }
        setShowDebtModal(true);
    };

    const resetDebtForm = () => {
        setDebtForm({
            officeName: '',
            amount: '',
            currency: 'USD',
            type: 'OWED_TO_OFFICE',
            description: '',
            dueDate: '',
            notes: ''
        });
    };

    const handleDebtFilterChange = (filterType, value) => {
        setDebtFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Clear debt filters
    const clearDebtFilters = () => {
        setDebtFilters({
            office: '',
            status: '',
            type: ''
        });
    };

    // Check if financial filters are applied
    const hasFinancialFiltersApplied = () => {
        const currentYear = new Date().getFullYear().toString();
        const currentMonth = (new Date().getMonth() + 1).toString();
        return financialFilters.month !== currentMonth || 
               financialFilters.year !== currentYear || 
               financialFilters.currency !== 'USD' ||
               financialFilters.viewType !== 'providers';
    };

    // Check if debt filters are applied
    const hasDebtFiltersApplied = () => {
        return debtFilters.office !== '' || 
               debtFilters.status !== '' || 
               debtFilters.type !== '';
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
                                <button
                                    id="tab-offices"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'offices' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => handleTabChange('offices')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'offices')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'offices'}
                                    aria-controls="offices-panel"
                                >
                                    <FaBuilding className="h-5 w-5 mr-3" />
                                    Offices
                                </button>
                                <button
                                    id="tab-office-vouchers"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'office-vouchers' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => handleTabChange('office-vouchers')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'office-vouchers')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'office-vouchers'}
                                    aria-controls="office-vouchers-panel"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Office Vouchers
                                </button>
                                <button
                                    id="tab-financials"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'financials' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => handleTabChange('financials')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'financials')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'financials'}
                                    aria-controls="financials-panel"
                                >
                                    <FaDollarSign className="h-5 w-5 mr-3" />
                                    Financials
                                </button>
                                <button
                                    id="tab-debts"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'debts' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => handleTabChange('debts')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'debts')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'debts'}
                                    aria-controls="debts-panel"
                                >
                                    <FaFileInvoiceDollar className="h-5 w-5 mr-3" />
                                    Debt Management
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
                                        id="tab-offices-mobile"
                                        className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'offices' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                        onClick={() => handleTabChange('offices')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'offices')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'offices'}
                                        aria-controls="offices-panel"
                                    >
                                        Offices
                                    </button>
                                    <button
                                        id="tab-office-vouchers-mobile"
                                        className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'office-vouchers' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                        onClick={() => handleTabChange('office-vouchers')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'office-vouchers')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'office-vouchers'}
                                        aria-controls="office-vouchers-panel"
                                    >
                                        Office Vouchers
                                    </button>
                                    <button
                                        id="tab-financials-mobile"
                                        className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'financials' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                        onClick={() => handleTabChange('financials')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'financials')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'financials'}
                                        aria-controls="financials-panel"
                                    >
                                        Financials
                                    </button>
                                    <button
                                        id="tab-debts-mobile"
                                        className={`py-2 px-3 text-sm sm:text-base sm:px-4 ${activeTab === 'debts' ? 'border-b-2 border-blue-600 font-medium text-blue-600 dark:text-teal-400 dark:border-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'}`}
                                        onClick={() => handleTabChange('debts')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'debts')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'debts'}
                                        aria-controls="debts-panel"
                                    >
                                        Debts
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
                                )}
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
                                <Card className="w-full dark:bg-slate-950" id="tours-panel" role="tabpanel" aria-labelledby="tab-tours">
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
                                <Card className="w-full dark:bg-slate-950" id="airports-panel" role="tabpanel" aria-labelledby="tab-airports">
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

                            {activeTab === 'offices' && (
                                <Card className="w-full dark:bg-slate-950" id="offices-panel" role="tabpanel" aria-labelledby="tab-offices">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white text-center">Add New Office</h2>
                                    
                                    <form onSubmit={handleOfficeSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="mb-2 block">
                                                    <Label htmlFor="officeName" value="Office Name" />
                                                </div>
                                                <TextInput
                                                    id="officeName"
                                                    name="name"
                                                    value={officeData.name}
                                                    onChange={handleOfficeChange}
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <div className="mb-2 block">
                                                    <Label htmlFor="officeLocation" value="Location" />
                                                </div>
                                                <TextInput
                                                    id="officeLocation"
                                                    name="location"
                                                    value={officeData.location}
                                                    onChange={handleOfficeChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="mb-2 block">
                                                    <Label htmlFor="officeEmail" value="Email" />
                                                </div>
                                                <TextInput
                                                    id="officeEmail"
                                                    name="email"
                                                    type="email"
                                                    value={officeData.email}
                                                    onChange={handleOfficeChange}
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <div className="mb-2 block">
                                                    <Label htmlFor="officePhoneNumber" value="Phone Number" />
                                                </div>
                                                <TextInput
                                                    id="officePhoneNumber"
                                                    name="phoneNumber"
                                                    value={officeData.phoneNumber}
                                                    onChange={handleOfficeChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="mb-2 block">
                                                <Label htmlFor="officeDescription" value="Description" />
                                            </div>
                                            <Textarea
                                                id="officeDescription"
                                                name="description"
                                                rows={3}
                                                value={officeData.description}
                                                onChange={handleOfficeChange}
                                            />
                                        </div>
                                        
                                        <CustomButton 
                                            type="submit"
                                            variant="pinkToOrange"
                                        >
                                            Add Office
                                        </CustomButton>
                                        
                                        {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                                    </form>
                                    
                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Existing Offices</h3>
                                        
                                        {/* Search Bar */}
                                        <div className="mb-6">
                                            <TextInput
                                                placeholder="Search offices by name, location, email, or phone number..."
                                                value={officeSearchQuery}
                                                onChange={(e) => setOfficeSearchQuery(e.target.value)}
                                                icon={() => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                )}
                                            />
                                        </div>
                                        
                                        {filteredOffices.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {filteredOffices.map(office => (
                                                    <Card key={office._id} className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-200">
                                                        <div className="p-4">
                                                            <div className="flex">
                                                                {/* Left side - Office info and contact details */}
                                                                <div className="flex-1 pr-3">
                                                                    {/* Office name and location */}
                                                                    <div className="mb-3">
                                                                        <h4 className="font-semibold text-lg text-slate-900 dark:text-white truncate" title={office.name}>
                                                                            {office.name}
                                                                        </h4>
                                                                        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            </svg>
                                                                            {office.location}
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    {/* Contact details */}
                                                                    <div className="space-y-3 text-sm">
                                                                        <div className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                            </svg>
                                                                            <span className="text-slate-700 dark:text-slate-300 truncate" title={office.email}>
                                                                                {office.email}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                            </svg>
                                                                            <span className="text-slate-700 dark:text-slate-300">
                                                                                {office.phoneNumber}
                                                                            </span>
                                                                        </div>
                                                                        {office.description && (
                                                                            <div className="flex items-start">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                                <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                                                                                    {office.description}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Right side - Action buttons */}
                                                                <div className="flex flex-col space-y-2">
                                                                    <CustomButton
                                                                        variant="green"
                                                                        size="xs"
                                                                        onClick={() => navigate(`/office/${encodeURIComponent(office.name)}`)}
                                                                        title="View office details"
                                                                        icon={({ className }) => (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                        )}
                                                                    >
                                                                        View
                                                                    </CustomButton>
                                                                    <CustomButton
                                                                        variant="blue"
                                                                        size="xs"
                                                                        onClick={() => navigate(`/edit-office/${office._id}`)}
                                                                        title="Edit office"
                                                                        icon={({ className }) => (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                        )}
                                                                    >
                                                                        Edit
                                                                    </CustomButton>
                                                                    <CustomButton
                                                                        variant="red"
                                                                        size="xs"
                                                                        onClick={() => handleDeleteOffice(office._id)}
                                                                        title="Delete office"
                                                                        icon={({ className }) => (
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        )}
                                                                    >
                                                                        Delete
                                                                    </CustomButton>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-blue-700 dark:text-blue-200">
                                                            {officeSearchQuery.trim() 
                                                                ? `No offices found matching "${officeSearchQuery}".`
                                                                : "No offices found."
                                                            }
                                                        </p>
                                                        {officeSearchQuery.trim() && (
                                                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                                                Try adjusting your search terms or clearing the search to see all offices.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {activeTab === 'office-vouchers' && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-950" id="office-vouchers-panel" role="tabpanel" aria-labelledby="tab-office-vouchers">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white text-center">Vouchers by Office</h2>
                                    
                                    <div className="mb-6">
                                        <div className="mb-2 block">
                                            <Label htmlFor="officeSelect" value="Select Office" className="text-lg font-medium" />
                                        </div>
                                        <SearchableSelect
                                            options={offices.map(office => ({
                                                value: office.name,
                                                label: `${office.name} - ${office.location}`
                                            }))}
                                            value={selectedOfficeForVouchers}
                                            onChange={handleOfficeSelection}
                                            placeholder="Choose an office to view vouchers"
                                            className="w-full"
                                        />
                                    </div>

                                    {selectedOfficeForVouchers && (
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4 dark:text-white">
                                                Vouchers for {selectedOfficeForVouchers}
                                            </h3>
                                            
                                            {officeVouchersLoading ? (
                                                <div className="py-8">
                                                    <RahalatekLoader size="lg" />
                                                </div>
                                            ) : officeVouchers.length > 0 ? (
                                                <>
                                                    <CustomScrollbar maxHeight="70vh">
                                                        <CustomTable
                                                            headers={[
                                                                { label: "Voucher #", className: "" },
                                                                { label: "Client Name", className: "" },
                                                                { label: "Status", className: "" },
                                                                { label: "Hotel Name", className: "" },
                                                                { label: "Note", className: "" },
                                                                { label: "Pax", className: "" },
                                                                { label: "Advanced Payment", className: "" },
                                                                { label: "Total Amount", className: "text-blue-600 dark:text-blue-400" },
                                                                { label: "Arrival", className: "" },
                                                                { label: "Departure", className: "" },
                                                                { label: "Payment Status", className: "" },
                                                                { label: "Date of Payment", className: "" },
                                                                { label: "Actions", className: "" }
                                                            ]}
                                                            data={officeVouchers}
                                                            renderRow={(voucher) => (
                                                                <>
                                                                    <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        <button
                                                                            onClick={() => navigate(`/vouchers/${voucher._id}`)}
                                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-sm"
                                                                            title="View voucher details"
                                                                        >
                                                                            #{voucher.voucherNumber}
                                                                        </button>
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        <div className="truncate max-w-[150px]" title={voucher.clientName}>
                                                                            {voucher.clientName}
                                                                        </div>
                                                                    </Table.Cell>
                                                                    <Table.Cell className="px-4 py-3">
                                                                        <StatusControls
                                                                            currentStatus={voucher.status || 'await'}
                                                                            onStatusUpdate={(newStatus) => handleVoucherStatusUpdate(voucher._id, newStatus)}
                                                                            canEdit={isAdmin || isAccountant}
                                                                            arrivalDate={voucher.arrivalDate}
                                                                        />
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        <div className="truncate max-w-[150px]" title={voucher.hotels && voucher.hotels.length > 0 ? voucher.hotels.map(hotel => hotel.hotelName).filter(Boolean).join(', ') || 'N/A' : 'N/A'}>
                                                                            {voucher.hotels && voucher.hotels.length > 0 
                                                                                ? voucher.hotels.map(hotel => hotel.hotelName).filter(Boolean).join(', ') || 'N/A'
                                                                                : 'N/A'}
                                                                        </div>
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        <div className="truncate max-w-[120px]" title={voucher.note || 'N/A'}>
                                                                            {voucher.note || 'N/A'}
                                                                        </div>
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        {voucher.hotels && voucher.hotels.length > 0 
                                                                            ? voucher.hotels.reduce((total, hotel) => total + (hotel.pax || 0), 0) || 'N/A'
                                                                            : 'N/A'}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        {voucher.advancedPayment && voucher.advancedAmount 
                                                                            ? `${getCurrencySymbol(voucher.currency)}${voucher.advancedAmount}` 
                                                                            : 'N/A'}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm font-medium text-blue-600 dark:text-blue-400 px-4 py-3">
                                                                        {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        {formatDate(voucher.arrivalDate)}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        {formatDate(voucher.departureDate)}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="px-4 py-3">
                                                                        {(() => {
                                                                            // Check if voucher has any office payments and their status
                                                                            const hasApprovedPayments = voucher.officePayments && voucher.officePayments.some(payment => payment.status === 'approved');
                                                                            const hasPendingPayments = voucher.officePayments && voucher.officePayments.some(payment => payment.status === 'pending');
                                                                            const hasPayments = voucher.payments && Object.values(voucher.payments).some(payment => payment.officeName === selectedOfficeForVouchers && payment.price > 0);
                                                                            
                                                                            if (hasApprovedPayments) {
                                                                                return (
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-green-500 text-white border border-green-600 shadow-md text-[11px] px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-16">
                                                                                        Approved
                                                                                    </span>
                                                                                );
                                                                            } else if (hasPendingPayments) {
                                                                                return (
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-yellow-500 text-white border border-yellow-600 shadow-md text-[11px] px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-16">
                                                                                        Pending
                                                                                    </span>
                                                                                );
                                                                            } else if (hasPayments) {
                                                                                return (
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-500 text-white border border-gray-600 shadow-md text-[11px] px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-16">
                                                                                        No Payment
                                                                                    </span>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-400 text-white border border-gray-500 shadow-md text-[11px] px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-16">
                                                                                        N/A
                                                                                    </span>
                                                                                );
                                                                            }
                                                                        })()}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="px-4 py-3">
                                                                        <PaymentDateControls
                                                                            currentPaymentDate={voucher.paymentDate}
                                                                            onPaymentDateUpdate={(paymentDate) => handlePaymentDateUpdate(voucher._id, paymentDate)}
                                                                            canEdit={isAdmin || isAccountant}
                                                                        />
                                                                    </Table.Cell>
                                                                    <Table.Cell className="px-4 py-3">
                                                                        <div className="flex space-x-2">
                                                                            <Link 
                                                                                to={`/vouchers/${voucher._id}`}
                                                                                className="font-medium text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                            >
                                                                                View
                                                                            </Link>
                                                                            {canManageVoucher(voucher) && (
                                                                                <Link 
                                                                                    to={`/edit-voucher/${voucher._id}`}
                                                                                    className="font-medium text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                                                                >
                                                                                    Edit
                                                                                </Link>
                                                                            )}
                                                                        </div>
                                                                    </Table.Cell>
                                                                </>
                                                            )}
                                                            emptyMessage="No vouchers found for this office"
                                                            emptyIcon={() => (
                                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            )}
                                                        />
                                                    </CustomScrollbar>
                                                    
                                                    {/* Currency Totals */}
                                                    {Object.keys(totalsByCurrency).length > 0 && (
                                                        <div className="mt-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                {Object.entries(totalsByCurrency).map(([currency, amounts]) => {
                                                                    const getCardColor = (curr) => {
                                                                        switch(curr) {
                                                                            case 'USD': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
                                                                            case 'EUR': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
                                                                            case 'TRY': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
                                                                            default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
                                                                        }
                                                                    };

                                                                    const getHeaderColor = (curr) => {
                                                                        switch(curr) {
                                                                            case 'USD': return 'text-green-800 dark:text-green-300';
                                                                            case 'EUR': return 'text-blue-800 dark:text-blue-300';
                                                                            case 'TRY': return 'text-red-800 dark:text-red-300';
                                                                            default: return 'text-gray-800 dark:text-gray-300';
                                                                        }
                                                                    };

                                                                    const getTextColor = (curr) => {
                                                                        switch(curr) {
                                                                            case 'USD': return 'text-green-700 dark:text-green-400';
                                                                            case 'EUR': return 'text-blue-700 dark:text-blue-400';
                                                                            case 'TRY': return 'text-red-700 dark:text-red-400';
                                                                            default: return 'text-gray-700 dark:text-gray-400';
                                                                        }
                                                                    };

                                                                    const getBoldTextColor = (curr) => {
                                                                        switch(curr) {
                                                                            case 'USD': return 'text-green-900 dark:text-green-200';
                                                                            case 'EUR': return 'text-blue-900 dark:text-blue-200';
                                                                            case 'TRY': return 'text-red-900 dark:text-red-200';
                                                                            default: return 'text-gray-900 dark:text-gray-200';
                                                                        }
                                                                    };

                                                                    return (
                                                                        <div key={currency} className={`p-4 rounded-lg border ${getCardColor(currency)}`}>
                                                                            <h4 className={`text-lg font-semibold mb-2 ${getHeaderColor(currency)}`}>{currency} Total</h4>
                                                                            <div className="space-y-1">
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span className={getTextColor(currency)}>Total Amount:</span>
                                                                                    <span className={`font-medium ${getBoldTextColor(currency)}`}>
                                                                                        {getCurrencySymbol(currency)}{amounts.totalAmount.toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span className={getTextColor(currency)}>Advanced Payments:</span>
                                                                                    <span className={`font-medium ${getBoldTextColor(currency)}`}>
                                                                                        {getCurrencySymbol(currency)}{amounts.totalAdvanced.toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No vouchers found for {selectedOfficeForVouchers}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">This office doesn't have any vouchers yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!selectedOfficeForVouchers && (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <p className="text-lg font-medium">Select an office to view vouchers</p>
                                            <p className="text-sm">Choose an office from the dropdown above to see all vouchers assigned to that office.</p>
                                        </div>
                                    )}

                                    {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                                </Card>
                            )}

                            {activeTab === 'financials' && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-950" id="financials-panel" role="tabpanel" aria-labelledby="tab-financials">
                                    <h2 className="text-2xl font-bold mb-6 dark:text-white text-center flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        Financial Reports
                                    </h2>
                                    
                                    {/* Overview Cards */}
                                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${financialFilters.viewType === 'clients' ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4 mb-6`}>
                                        {financialFilters.viewType === 'providers' ? (
                                            <>
                                                {/* Total Revenue */}
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Revenue</p>
                                                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                                {getCurrencySymbol(financialFilters.currency)}{financialTotals.total.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                                                            <FaDollarSign className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Active Suppliers */}
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Suppliers</p>
                                                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                                {[...new Set(filteredFinancialData.map(item => item.officeName))].length}
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center">
                                                            <FaBuilding className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Total Vouchers */}
                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Vouchers</p>
                                                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                                                {financialTotals.voucherCount.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center">
                                                            <FaFileInvoiceDollar className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Average Revenue per Supplier */}
                                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg per Supplier</p>
                                                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                                                {getCurrencySymbol(financialFilters.currency)}{
                                                                    [...new Set(filteredFinancialData.map(item => item.officeName))].length > 0 
                                                                        ? (financialTotals.total / [...new Set(filteredFinancialData.map(item => item.officeName))].length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                                        : '0'
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-lg flex items-center justify-center">
                                                            <FaCalendarDay className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Profit */}
                                                <div className={`bg-gradient-to-br p-6 rounded-xl border ${
                                                    (totalClientRevenue - totalSupplierRevenue) >= 0
                                                        ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                                                        : 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'
                                                }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className={`text-sm font-medium ${
                                                                (totalClientRevenue - totalSupplierRevenue) >= 0
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}>Profit</p>
                                                            <p className={`text-2xl font-bold ${
                                                                (totalClientRevenue - totalSupplierRevenue) >= 0 
                                                                    ? 'text-green-900 dark:text-green-100' 
                                                                    : 'text-red-900 dark:text-red-100'
                                                            }`}>
                                                                {getCurrencySymbol(financialFilters.currency)}{(totalClientRevenue - totalSupplierRevenue).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                            (totalClientRevenue - totalSupplierRevenue) >= 0
                                                                ? 'bg-green-500 dark:bg-green-600'
                                                                : 'bg-red-500 dark:bg-red-600'
                                                        }`}>
                                                            <FaChartLine className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Total Client Revenue */}
                                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-6 rounded-xl border border-cyan-200 dark:border-cyan-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Total Revenue</p>
                                                            <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                                                                {getCurrencySymbol(financialFilters.currency)}{clientOfficeData.reduce((sum, office) => sum + office.totalAmount, 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-cyan-500 dark:bg-cyan-600 rounded-lg flex items-center justify-center">
                                                            <FaDollarSign className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Unique Clients */}
                                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Clients</p>
                                                            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                                                                {[...new Set(clientOfficeData.map(office => office.officeName))].length}
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-indigo-500 dark:bg-indigo-600 rounded-lg flex items-center justify-center">
                                                            <FaBuilding className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Direct Clients Count */}
                                                <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 p-6 rounded-xl border border-rose-200 dark:border-rose-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Direct Clients</p>
                                                            <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                                                                {[...new Set(clientOfficeData.filter(office => office.isDirectClient).map(office => office.officeName))].length}
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-rose-500 dark:bg-rose-600 rounded-lg flex items-center justify-center">
                                                            <FaUser className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Total Client Vouchers */}
                                                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-6 rounded-xl border border-teal-200 dark:border-teal-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Total Vouchers</p>
                                                            <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                                                                {clientOfficeData.reduce((sum, office) => sum + office.voucherCount, 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-teal-500 dark:bg-teal-600 rounded-lg flex items-center justify-center">
                                                            <FaFileInvoiceDollar className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Average Revenue per Client */}
                                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg per Client</p>
                                                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                                                {getCurrencySymbol(financialFilters.currency)}{
                                                                    [...new Set(clientOfficeData.map(office => office.officeName))].length > 0 
                                                                        ? (clientOfficeData.reduce((sum, office) => sum + office.totalAmount, 0) / [...new Set(clientOfficeData.map(office => office.officeName))].length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                                        : '0'
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-lg flex items-center justify-center">
                                                            <FaCalendarDay className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Profit */}
                                                <div className={`bg-gradient-to-br p-6 rounded-xl border ${
                                                    (totalClientRevenue - totalSupplierRevenue) >= 0
                                                        ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                                                        : 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'
                                                }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className={`text-sm font-medium ${
                                                                (totalClientRevenue - totalSupplierRevenue) >= 0
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}>Profit</p>
                                                            <p className={`text-2xl font-bold ${
                                                                (totalClientRevenue - totalSupplierRevenue) >= 0 
                                                                    ? 'text-green-900 dark:text-green-100' 
                                                                    : 'text-red-900 dark:text-red-100'
                                                            }`}>
                                                                {getCurrencySymbol(financialFilters.currency)}{(totalClientRevenue - totalSupplierRevenue).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                            (totalClientRevenue - totalSupplierRevenue) >= 0
                                                                ? 'bg-green-500 dark:bg-green-600'
                                                                : 'bg-red-500 dark:bg-red-600'
                                                        }`}>
                                                            <FaChartLine className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Filters */}
                                    <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700 p-6 rounded-lg mb-6">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                            <div>
                                                <Label htmlFor="view-type-filter" value="View Type" className="mb-2" />
                                                <SearchableSelect
                                                    id="view-type-filter"
                                                    options={[
                                                        { value: 'providers', label: 'Suppliers' },
                                                        { value: 'clients', label: 'Clients' }
                                                    ]}
                                                    value={financialFilters.viewType}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleFinancialFilterChange('viewType', value);
                                                    }}
                                                    placeholder="Select view type..."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="currency-filter" value="Currency" className="mb-2" />
                                                <SearchableSelect
                                                    id="currency-filter"
                                                    options={[
                                                        { value: 'USD', label: 'USD ($)' },
                                                        { value: 'EUR', label: 'EUR (€)' },
                                                        { value: 'TRY', label: 'TRY (₺)' }
                                                    ]}
                                                    value={financialFilters.currency}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleFinancialFilterChange('currency', value);
                                                    }}
                                                    placeholder="Search or select currency..."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="month-filter" value="Month" className="mb-2" />
                                                <SearchableSelect
                                                    id="month-filter"
                                                    options={(() => {
                                                        // Get months that have data for the selected year
                                                        const selectedYear = parseInt(financialFilters.year);
                                                        const dataMonths = [...new Set(
                                                            financialData
                                                                .filter(item => item.year === selectedYear)
                                                                .map(item => {
                                                                    // Extract month from "YYYY-MM" format
                                                                    const monthPart = item.month.split('-')[1];
                                                                    return parseInt(monthPart);
                                                                })
                                                        )];
                                                        
                                                        // If viewing current year, always include current month
                                                        const currentYear = new Date().getFullYear();
                                                        const currentMonth = new Date().getMonth() + 1;
                                                        let allMonths = dataMonths;
                                                        
                                                        if (selectedYear === currentYear) {
                                                            allMonths = [...new Set([currentMonth, ...dataMonths])];
                                                        }
                                                        
                                                        // Create options with "All Months" first, then sorted months
                                                        const monthOptions = [{ value: '', label: 'All Months' }];
                                                        
                                                        allMonths
                                                            .sort((a, b) => a - b)
                                                            .forEach(month => {
                                                                monthOptions.push({
                                                                    value: month.toString(),
                                                                    label: new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
                                                                });
                                                            });
                                                        
                                                        return monthOptions;
                                                    })()}
                                                    value={financialFilters.month}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleFinancialFilterChange('month', value);
                                                    }}
                                                    placeholder="Select month..."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="year-filter" value="Year" className="mb-2" />
                                                <SearchableSelect
                                                    id="year-filter"
                                                    options={(() => {
                                                        // Get unique years from financial data
                                                        const dataYears = [...new Set(financialData.map(item => item.year))];
                                                        
                                                        // Always include current year even if no data exists
                                                        const currentYear = new Date().getFullYear();
                                                        const allYears = [...new Set([currentYear, ...dataYears])];
                                                        
                                                        // Sort in descending order (newest first) and create options
                                                        return allYears
                                                            .sort((a, b) => b - a)
                                                            .map(year => ({
                                                                value: year.toString(),
                                                                label: year.toString()
                                                            }));
                                                    })()}
                                                    value={financialFilters.year}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleFinancialFilterChange('year', value);
                                                    }}
                                                    placeholder="Select year..."
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <CustomButton
                                                    variant="red"
                                                    onClick={clearFinancialFilters}
                                                    disabled={!hasFinancialFiltersApplied()}
                                                    className="w-full"
                                                    title={hasFinancialFiltersApplied() ? "Clear all financial filters" : "No filters to clear"}
                                                    icon={HiX}
                                                >
                                                    Clear Filters
                                                </CustomButton>
                                            </div>
                                            <div className="flex items-end">
                                                <CustomButton
                                                    variant="blue"
                                                    onClick={fetchFinancialData}
                                                    disabled={financialLoading}
                                                    className="w-full"
                                                    title="Refresh financial data"
                                                >
                                                    {financialLoading ? 'Refreshing...' : 'Refresh Data'}
                                                </CustomButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search Bar and Filters */}
                                    <div className="mb-6 -ml-2">
                                        <div className="flex gap-4 items-center">
                                            <div className="relative w-80">
                                                <TextInput
                                                    placeholder={financialFilters.viewType === 'clients' ? "Search clients by name..." : "Search offices by name..."}
                                                    value={financialSearchQuery}
                                                    onChange={(e) => setFinancialSearchQuery(e.target.value)}
                                                    icon={() => (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    )}
                                                    className="pl-5 w-full"
                                                />
                                                {financialSearchQuery && (
                                                    <button
                                                        onClick={() => setFinancialSearchQuery('')}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                        title="Clear search"
                                                    >
                                                        <HiX className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Client Type Filter - Only show in clients section */}
                                            {financialFilters.viewType === 'clients' && (
                                                <div className="w-48">
                                                    <SearchableSelect
                                                        value={clientTypeFilter}
                                                        onChange={(eventOrValue) => {
                                                            const value = typeof eventOrValue === 'string' 
                                                                ? eventOrValue 
                                                                : eventOrValue?.target?.value || eventOrValue;
                                                            setClientTypeFilter(value);
                                                        }}
                                                        options={[
                                                            { value: 'all', label: 'All Clients' },
                                                            { value: 'office', label: 'Office Clients' },
                                                            { value: 'direct', label: 'Direct Clients' }
                                                        ]}
                                                        placeholder="Client Type..."
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Reset Button */}
                                            {(financialSearchQuery || (financialFilters.viewType === 'clients' && clientTypeFilter !== 'all')) && (
                                                <CustomButton
                                                    variant="red"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFinancialSearchQuery('');
                                                        if (financialFilters.viewType === 'clients') {
                                                            setClientTypeFilter('all');
                                                        }
                                                    }}
                                                    className="whitespace-nowrap"
                                                >
                                                    <HiX className="h-4 w-4 mr-1" />
                                                    Clear
                                                </CustomButton>
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial Data Table */}
                    {financialLoading ? (
                        <div className="py-8">
                            <RahalatekLoader size="lg" />
                        </div>
                                        ) : (
                        <CustomScrollbar maxHeight="400px">
                            {financialFilters.viewType === 'providers' ? (
                                <CustomTable
                                    headers={[
                                        { label: 'Office', className: '' },
                                        { label: 'Month', className: '' },
                                        { label: 'Hotels', className: 'text-blue-600 dark:text-blue-400' },
                                        { label: 'Transfers', className: 'text-green-600 dark:text-green-400' },
                                        { label: 'Trips', className: 'text-purple-600 dark:text-purple-400' },
                                        { label: 'Flights', className: 'text-orange-600 dark:text-orange-400' },
                                        { label: 'Total', className: 'text-gray-900 dark:text-white' },
                                        { label: 'Vouchers', className: '' }
                                    ]}
                                    data={filteredFinancialData}
                                    renderRow={(item) => (
                                        <>
                                            <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                                <Link 
                                                    to={`/office/${encodeURIComponent(item.officeName)}`}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:underline transition-colors duration-200"
                                                >
                                                    {item.officeName}
                                                </Link>
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                {item.monthName} {item.year}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-blue-600 dark:text-blue-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.hotels.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-green-600 dark:text-green-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.transfers.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-purple-600 dark:text-purple-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.trips.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-orange-600 dark:text-orange-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.flights.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm font-bold text-gray-900 dark:text-white px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.total.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-600 dark:text-gray-400 px-4 py-3">
                                                {item.voucherCount}
                                            </Table.Cell>
                                        </>
                                    )}
                                    emptyMessage="No financial data found for the selected period"
                                    emptyIcon={() => (
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )}
                                />
                            ) : (
                                <CustomTable
                                    headers={[
                                        { label: 'Client', className: '' },
                                        { label: 'Month', className: '' },
                                        { label: 'Total Amount', className: 'text-gray-900 dark:text-white' },
                                        { label: 'Vouchers', className: 'text-gray-900 dark:text-white' }
                                    ]}
                                    data={clientOfficeData}
                                    renderRow={(office) => (
                                        <>
                                            <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Link 
                                                        to={office.isDirectClient ? `/client/${encodeURIComponent(office.officeName)}` : `/office/${encodeURIComponent(office.officeName)}`}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:underline transition-colors duration-200"
                                                    >
                                                        {office.officeName}
                                                    </Link>
                                                    {office.isDirectClient && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                                            <FaUser className="w-3 h-3 mr-1" />
                                                            Direct
                                                        </span>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                {office.monthName} {office.year}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{office.totalAmount.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-600 dark:text-gray-400 px-4 py-3">
                                                {office.voucherCount}
                                            </Table.Cell>
                                        </>
                                    )}
                                    emptyMessage="No clients found"
                                    emptyIcon={() => (
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )}
                                />
                            )}
                        </CustomScrollbar>
                    )}

                                    {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                                </Card>
                            )}

                            {/* Financial Floating Totals Panel */}
                            {activeTab === 'financials' && (isAdmin || isAccountant) && (
                                <FinancialFloatingTotalsPanel
                                    viewType={financialFilters.viewType}
                                    totals={financialTotals}
                                    clientOfficeData={clientOfficeData}
                                    currency={financialFilters.currency}
                                    getCurrencySymbol={getCurrencySymbol}
                                />
                            )}

                            {activeTab === 'debts' && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-950" id="debts-panel" role="tabpanel" aria-labelledby="tab-debts">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex-1"></div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
                                            <FaFileInvoiceDollar className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" />
                                            Debt Management
                                        </h2>
                                        <div className="flex-1 flex justify-end">
                                            <CustomButton
                                                variant="green"
                                                onClick={() => openDebtModal()}
                                                icon={HiPlus}
                                                title="Add new debt record"
                                            >
                                                Add Debt
                                            </CustomButton>
                                        </div>
                                    </div>

                                    {/* Debt Filters */}
                                    <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-6">
                                        <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Debt Filters</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <div>
                                                <Label htmlFor="debt-office-filter" value="Office" className="mb-2" />
                                                <SearchableSelect
                                                    id="debt-office-filter"
                                                    options={[
                                                        { value: '', label: 'All Offices' },
                                                        ...offices.map(office => ({
                                                            value: office.name,
                                                            label: `${office.name} - ${office.location}`
                                                        }))
                                                    ]}
                                                    value={debtFilters.office}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleDebtFilterChange('office', value);
                                                    }}
                                                    placeholder="Search offices..."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="debt-status-filter" value="Status" className="mb-2" />
                                                <Select
                                                    id="debt-status-filter"
                                                    value={debtFilters.status}
                                                    onChange={(e) => handleDebtFilterChange('status', e.target.value)}
                                                >
                                                    <option value="">All Status</option>
                                                    <option value="OPEN">Open</option>
                                                    <option value="CLOSED">Closed</option>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="debt-type-filter" value="Type" className="mb-2" />
                                                <Select
                                                    id="debt-type-filter"
                                                    value={debtFilters.type}
                                                    onChange={(e) => handleDebtFilterChange('type', e.target.value)}
                                                >
                                                    <option value="">All Types</option>
                                                    <option value="OWED_TO_OFFICE">We Owe Them</option>
                                                    <option value="OWED_FROM_OFFICE">They Owe Us</option>
                                                </Select>
                                            </div>
                                            <div className="flex items-end">
                                                <CustomButton
                                                    variant="red"
                                                    onClick={clearDebtFilters}
                                                    disabled={!hasDebtFiltersApplied()}
                                                    className="w-full"
                                                    title={hasDebtFiltersApplied() ? "Clear all debt filters" : "No filters to clear"}
                                                    icon={HiX}
                                                >
                                                    Clear Filters
                                                </CustomButton>
                                            </div>
                                            <div className="flex items-end">
                                                <CustomButton
                                                    variant="blue"
                                                    onClick={fetchDebts}
                                                    disabled={debtLoading}
                                                    className="w-full"
                                                    title="Refresh debt data"
                                                >
                                                    {debtLoading ? 'Loading...' : 'Refresh Debts'}
                                                </CustomButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Debt Table */}
                                                        {debtLoading ? (
                        <div className="py-8">
                            <RahalatekLoader size="lg" />
                        </div>
                    ) : (
                        <CustomTable
                            headers={[
                                { label: 'Office', className: '' },
                                { label: 'Amount', className: '' },
                                { label: 'Type', className: '' },
                                { label: 'Description', className: '' },
                                { label: 'Status', className: '' },
                                { label: 'Due Date', className: '' },
                                { label: 'Created', className: '' },
                                { label: 'Created By', className: '' },
                                { label: 'Actions', className: '' }
                            ]}
                            data={debts}
                            renderRow={(debt) => (
                                <>
                                    <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                        {debt.officeName}
                                    </Table.Cell>
                                    <Table.Cell className="text-sm px-4 py-3">
                                        <span className={`font-medium ${
                                            debt.type === 'OWED_TO_OFFICE' 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {getCurrencySymbol(debt.currency)}{debt.amount.toFixed(2)}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="text-sm px-4 py-3">
                                        <span 
                                            className={`
                                                inline-flex items-center justify-center rounded-lg 
                                                ${debt.type === 'OWED_TO_OFFICE' 
                                                    ? 'bg-red-500 text-white border border-red-600 shadow-md' 
                                                    : 'bg-green-500 text-white border border-green-600 shadow-md'
                                                }
                                                text-[11px] px-2 py-0.5 font-semibold
                                                transition-all duration-200 
                                                hover:scale-105 hover:shadow-lg
                                                min-w-16
                                            `}
                                        >
                                            {debt.type === 'OWED_TO_OFFICE' ? 'We Owe' : 'They Owe'}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3 max-w-[200px]">
                                        <div className="truncate" title={debt.description}>
                                            {debt.description || 'N/A'}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell className="px-4 py-3">
                                        <span 
                                            className={`
                                                inline-flex items-center justify-center rounded-lg 
                                                ${debt.status === 'OPEN' 
                                                    ? 'bg-yellow-500 text-white border border-yellow-600 shadow-md' 
                                                    : 'bg-green-500 text-white border border-green-600 shadow-md'
                                                }
                                                text-[11px] px-2 py-0.5 font-semibold
                                                transition-all duration-200 
                                                hover:scale-105 hover:shadow-lg
                                                min-w-16
                                            `}
                                        >
                                            {debt.status}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                        {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'N/A'}
                                    </Table.Cell>
                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                        {new Date(debt.createdAt).toLocaleDateString()}
                                    </Table.Cell>
                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                        {debt.createdBy?.username || 'Unknown'}
                                    </Table.Cell>
                                    <Table.Cell className="px-4 py-3">
                                        <div className="flex space-x-2">
                                            {debt.status === 'OPEN' && (
                                                <>
                                                    <CustomButton
                                                        variant="purple"
                                                        size="xs"
                                                        onClick={() => openDebtModal(debt)}
                                                        title="Edit debt"
                                                    >
                                                        Edit
                                                    </CustomButton>
                                                    <CustomButton
                                                        variant="green"
                                                        size="xs"
                                                        onClick={() => handleCloseDebt(debt._id)}
                                                        title="Mark as paid/closed"
                                                    >
                                                        Close
                                                    </CustomButton>
                                                </>
                                            )}
                                            {isAdmin && (
                                                <CustomButton
                                                    variant="red"
                                                    size="xs"
                                                    onClick={() => openDeleteDebtModal(debt)}
                                                    title="Delete debt"
                                                >
                                                    Delete
                                                </CustomButton>
                                            )}
                                        </div>
                                    </Table.Cell>
                                </>
                            )}
                            emptyMessage="No debts found"
                            emptyDescription="Create debt records to track financial obligations with offices."
                            emptyIcon={() => (
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                        />
                    )}

                                    {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                                </Card>
                            )}

                            {activeTab === 'users' && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-950" id="users-panel" role="tabpanel" aria-labelledby="tab-users">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">User Management</h2>
                                    
                                    {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                                    
                                    <CustomTable
                                        headers={[
                                            { label: 'Username', className: '' },
                                            { label: 'Role', className: 'text-center' },
                                            ...(isAdmin ? [
                                                { label: 'Admin Actions', className: '' },
                                                { label: 'Accountant Actions', className: '' },
                                                { label: 'Delete', className: '' }
                                            ] : [])
                                        ]}
                                        data={users.sort((a, b) => {
                                            // Sort by role priority: Admin (3) > Accountant (2) > User (1)
                                            const getRolePriority = (user) => {
                                                if (user.isAdmin) return 3;
                                                if (user.isAccountant) return 2;
                                                return 1;
                                            };
                                            return getRolePriority(b) - getRolePriority(a);
                                        })}
                                        renderRow={(user) => (
                                            <>
                                                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white px-4 py-3">
                                                    {user.username}
                                                </Table.Cell>
                                                <Table.Cell className="flex items-center justify-center px-4 py-3">
                                                    <UserBadge user={user} />
                                                </Table.Cell>
                                                {isAdmin && (
                                                    <>
                                                        <Table.Cell className="px-4 py-3">
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
                                                        <Table.Cell className="px-4 py-3">
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
                                                        <Table.Cell className="px-4 py-3">
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
                                            </>
                                        )}
                                        emptyMessage="No users found. Admin users can manage other users here."
                                        emptyIcon={() => (
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        )}
                                    />
                                </Card>
                            )}
                            
                            {activeTab === 'requests' && isAdmin && (
                                <Card className="w-full dark:bg-slate-950" id="requests-panel" role="tabpanel" aria-labelledby="tab-requests">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Pending User Approval Requests</h2>
                                    
                                    {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                                    
                                                        <CustomTable
                        headers={[
                            { label: 'Username', className: '' },
                            { label: 'Registration Date', className: '' },
                            { label: 'Actions', className: '' }
                        ]}
                        data={pendingRequests}
                        renderRow={(user) => (
                            <>
                                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white px-4 py-3">
                                    {user.username}
                                </Table.Cell>
                                <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </Table.Cell>
                                <Table.Cell className="px-4 py-3">
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
                            </>
                        )}
                        emptyMessage="No pending requests"
                        emptyDescription="There are no new user accounts awaiting approval at this time. New registration requests will appear here when users sign up."
                        emptyIcon={() => (
                            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full">
                                <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                </svg>
                            </div>
                        )}
                    />
                                </Card>
                            )}
                            
                            {/* Notifications Panel */}
                            {activeTab === 'notifications' && isAdmin && (
                                <Card className="w-full dark:bg-slate-950" id="notifications-panel" role="tabpanel" aria-labelledby="tab-notifications">
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
                                theme={{
                                    content: {
                                        base: "relative h-full w-full p-4 h-auto",
                                        inner: "relative rounded-lg bg-white shadow dark:bg-slate-900 flex flex-col max-h-[90vh]"
                                    }
                                }}
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
                                theme={{
                                    content: {
                                        base: "relative h-full w-full p-4 h-auto",
                                        inner: "relative rounded-lg bg-white shadow dark:bg-slate-900 flex flex-col max-h-[90vh]"
                                    }
                                }}
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

                            {/* Debt Modal */}
                            <Modal
                                show={showDebtModal}
                                onClose={() => setShowDebtModal(false)}
                                size="lg"
                                popup
                                theme={{
                                    content: {
                                        base: "relative h-full w-full p-4 h-auto",
                                        inner: "relative rounded-lg bg-white shadow dark:bg-slate-900 flex flex-col max-h-[90vh]"
                                    }
                                }}
                            >
                                <Modal.Header>
                                    <div className="text-center">
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                            {editingDebt ? 'Edit Debt' : 'Add New Debt'}
                                        </h3>
                                    </div>
                                </Modal.Header>
                                <Modal.Body>
                                    <form onSubmit={handleDebtSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="debt-office" value="Office" className="mb-2" />
                                                <Select
                                                    id="debt-office"
                                                    value={debtForm.officeName}
                                                    onChange={(e) => setDebtForm({ ...debtForm, officeName: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select an office</option>
                                                    {offices.map(office => (
                                                        <option key={office._id} value={office.name}>
                                                            {office.name}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="debt-type" value="Debt Type" className="mb-2" />
                                                <Select
                                                    id="debt-type"
                                                    value={debtForm.type}
                                                    onChange={(e) => setDebtForm({ ...debtForm, type: e.target.value })}
                                                    required
                                                >
                                                    <option value="OWED_TO_OFFICE">We Owe Them</option>
                                                    <option value="OWED_FROM_OFFICE">They Owe Us</option>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="debt-amount" value="Amount" className="mb-2" />
                                                <TextInput
                                                    id="debt-amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={debtForm.amount}
                                                    onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="debt-currency" value="Currency" className="mb-2" />
                                                <Select
                                                    id="debt-currency"
                                                    value={debtForm.currency}
                                                    onChange={(e) => setDebtForm({ ...debtForm, currency: e.target.value })}
                                                    required
                                                >
                                                    <option value="USD">USD ($)</option>
                                                    <option value="EUR">EUR (€)</option>
                                                    <option value="TRY">TRY (₺)</option>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="debt-description" value="Description" className="mb-2" />
                                            <TextInput
                                                id="debt-description"
                                                value={debtForm.description}
                                                onChange={(e) => setDebtForm({ ...debtForm, description: e.target.value })}
                                                placeholder="Brief description of the debt"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="debt-due-date" value="Due Date (Optional)" className="mb-2" />
                                            <TextInput
                                                id="debt-due-date"
                                                type="date"
                                                value={debtForm.dueDate}
                                                onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="debt-notes" value="Notes (Optional)" className="mb-2" />
                                            <Textarea
                                                id="debt-notes"
                                                rows={3}
                                                value={debtForm.notes}
                                                onChange={(e) => setDebtForm({ ...debtForm, notes: e.target.value })}
                                                placeholder="Additional notes about this debt"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <CustomButton
                                                variant="gray"
                                                onClick={() => setShowDebtModal(false)}
                                                disabled={debtLoading}
                                            >
                                                Cancel
                                            </CustomButton>
                                            <CustomButton
                                                type="submit"
                                                variant="green"
                                                disabled={debtLoading}
                                                icon={editingDebt ? null : HiPlus}
                                            >
                                                {debtLoading ? 'Saving...' : (editingDebt ? 'Update Debt' : 'Create Debt')}
                                            </CustomButton>
                                        </div>
                                    </form>
                                </Modal.Body>
                            </Modal>

                            {/* Delete Debt Confirmation Modal */}
                            <DeleteConfirmationModal
                                show={deleteDebtModalOpen}
                                onClose={closeDeleteDebtModal}
                                onConfirm={handleDeleteDebt}
                                isLoading={deleteDebtLoading}
                                itemType="debt record"
                                itemName={debtToDelete ? `${getCurrencySymbol(debtToDelete.currency)}${debtToDelete.amount.toFixed(2)} for ${debtToDelete.officeName}` : ''}
                                itemExtra={debtToDelete ? debtToDelete.description : ''}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
    