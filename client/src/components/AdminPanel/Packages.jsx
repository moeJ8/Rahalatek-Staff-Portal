import React, { useState, useEffect } from 'react';
import { Card, Label, Alert, Badge } from 'flowbite-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaSave, FaTimes, FaSpinner, FaChevronDown, FaChevronUp, FaFilter, FaSyncAlt } from 'react-icons/fa';
import { HiTrash, HiPlus } from 'react-icons/hi';
import Search from '../Search';


import CustomButton from '../CustomButton';
import CustomDatePicker from '../CustomDatePicker';
import TextInput from '../TextInput';
import Select from '../Select';
import SearchableSelect from '../SearchableSelect';
import CheckBoxDropDown from '../CheckBoxDropDown';
import TourSelector from '../TourSelector';
import RahalatekLoader from '../RahalatekLoader';
import PackageHotelCard from '../PackageHotelCard';
import PackageCard from '../PackageCard';
import MultiStepModal from '../MultiStepModal';
import ImageUploader from '../ImageUploader';
import CustomCheckbox from '../CustomCheckbox';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { getCountryOptions, getCityOptions, getCountries } from '../../utils/countryCities';
import { validateSlug, formatSlug, formatSlugWhileTyping, getSlugPreview } from '../../utils/slugValidation';

export default function Packages({ user }) {
    const [packages, setPackages] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [tours, setTours] = useState([]);
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        country: '',
        city: '',
        isActive: '',
        createdBy: ''
    });
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState(getInitialFormData());
    const [formLoading, setFormLoading] = useState(false);
    const [slugError, setSlugError] = useState('');
    
    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Step states
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const stepTitles = {
        1: 'Basic Information',
        2: 'Hotels Selection', 
        3: 'Tours & Daily Itinerary',
        4: 'Final Details & Images'
    };

    // Step navigation functions
    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const resetSteps = () => {
        setCurrentStep(1);
    };

    const goToStep = (stepNumber) => {
        if (stepNumber >= 1 && stepNumber <= totalSteps) {
            setCurrentStep(stepNumber);
        }
    };

    // Package management functions
    const handleViewPackage = (pkg) => {
        // For now, just show package details in console
        console.log('Viewing package:', pkg);
        toast.success(`Viewing package: ${pkg.name}`, {
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

    const handleEditPackage = (pkg) => {
        setSelectedPackage(pkg);
        
        // Check if package has arrival day (by flag or by title pattern)
        const hasArrivalDay = (pkg.dailyItinerary || []).some(day => 
            day.isArrivalDay || (day.day === 1 && day.title && day.title.includes('Arrival'))
        );
        
        // Transform tours with proper day assignments
        const transformedTours = (pkg.tours || []).map(tour => ({
            ...tour,
            tourId: typeof tour.tourId === 'object' ? tour.tourId._id : tour.tourId,
            day: tour.day || null
        }));
        
        // Transform daily itinerary with tour info populated
        const transformedItinerary = (pkg.dailyItinerary || []).map(day => {
            // Check if this is arrival day (by flag or by title)
            const isArrival = day.isArrivalDay || (day.day === 1 && day.title && day.title.includes('Arrival'));
            
            // Find tour assigned to this day
            const assignedTour = pkg.tours?.find(t => t.day === day.day);
            
            if (assignedTour && !isArrival) {
                const tourId = typeof assignedTour.tourId === 'object' ? assignedTour.tourId._id : assignedTour.tourId;
                const tourData = typeof assignedTour.tourId === 'object' ? assignedTour.tourId : tours.find(t => t._id === tourId);
                
                if (tourData) {
                    return {
                        ...day,
                        isArrivalDay: isArrival, // Ensure the flag is set
                        tourInfo: {
                            tourId: tourData._id || tourId,
                            name: tourData.name,
                            city: tourData.city,
                            duration: tourData.duration,
                            price: tourData.price || tourData.totalPrice || 0,
                            tourType: tourData.tourType
                        }
                    };
                }
            }
            
            // Ensure arrival day flag is set properly
            return {
                ...day,
                isArrivalDay: isArrival
            };
        });
        
        // Transform the populated data back to the form format
        const transformedData = {
            ...pkg,
            slug: pkg.slug || '',
            countries: pkg.countries || [],
            cities: pkg.cities || [],
            hotels: (pkg.hotels || []).map(hotel => ({
                ...hotel,
                hotelId: typeof hotel.hotelId === 'object' ? hotel.hotelId._id : hotel.hotelId,
                checkIn: hotel.checkIn ? new Date(hotel.checkIn).toISOString().split('T')[0] : '',
                checkOut: hotel.checkOut ? new Date(hotel.checkOut).toISOString().split('T')[0] : ''
            })),
            tours: transformedTours,
            transfers: pkg.transfers || [],
            dailyItinerary: transformedItinerary,
            includes: pkg.includes || [],
            excludes: pkg.excludes || [],
            includeArrivalDay: hasArrivalDay, // Explicitly set arrival day checkbox
            images: pkg.images || [],
            faqs: pkg.faqs || [],
            targetAudience: Array.isArray(pkg.targetAudience) ? pkg.targetAudience : (pkg.targetAudience ? [pkg.targetAudience] : ['Family']),
            pricing: {
                ...pkg.pricing,
                basePrice: pkg.pricing?.basePrice || 0
            }
        };
        
        setFormData(transformedData);
        setCurrentStep(1);
        setIsEditModalOpen(true);
    };

    // Show delete confirmation modal
    const handleDeletePackage = (pkg) => {
        setPackageToDelete(pkg);
        setShowDeleteModal(true);
    };

    // Actually delete the package after confirmation
    const confirmDeletePackage = async () => {
        if (!packageToDelete) return;

        try {
            setDeleteLoading(true);
            await axios.delete(`/api/packages/${packageToDelete._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            setPackages((prevPackages) => (prevPackages || []).filter(p => p._id !== packageToDelete._id));
            
            // Close modal and reset state
            setShowDeleteModal(false);
            setPackageToDelete(null);
            
            toast.success('Package deleted successfully', {
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
        } catch (error) {
            console.error('Error deleting package:', error);
            toast.error('Failed to delete package', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setPackageToDelete(null);
    };

    // Step validation logic
    const getStepValidation = () => {
        return {
            1: !!(formData.name && formData.countries.length > 0 && formData.cities.length > 0),
            2: !!(formData.hotels.length > 0),
            3: !!(formData.tours.length > 0),
            4: !!(formData.pricing?.basePrice && formData.pricing.basePrice > 0)
        };
    };

    // Get missing fields for each step
    const getStepMissingFields = () => {
        const missingFields = {
            1: [],
            2: [],
            3: [],
            4: []
        };

        // Step 1 validation
        if (!formData.name) missingFields[1].push('Package Name');
        if (formData.countries.length === 0) missingFields[1].push('Countries');
        if (formData.cities.length === 0) missingFields[1].push('Cities');

        // Step 2 validation
        if (formData.hotels.length === 0) missingFields[2].push('Hotels');

        // Step 3 validation
        if (formData.tours.length === 0) missingFields[3].push('Tours');

        // Step 4 validation
        if (!formData.pricing?.basePrice || formData.pricing.basePrice <= 0) {
            missingFields[4].push('Base Price');
        }

        return missingFields;
    };

    const handleTogglePackageStatus = async (pkg) => {
        try {
            const response = await axios.patch(`/api/packages/${pkg._id}/toggle-status`);
            const responseData = response.data?.data || response.data;
            setPackages((prevPackages) => (prevPackages || []).map(p => 
                p._id === pkg._id ? { ...p, isActive: responseData.isActive } : p
            ));
            toast.success(`Package ${responseData.isActive ? 'activated' : 'deactivated'} successfully`, {
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
        } catch (error) {
            console.error('Error toggling package status:', error);
            toast.error('Failed to update package status', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        }
    };

    const handleUpdatePackage = async (packageData) => {
        try {
            setFormLoading(true);
            
            // Format slug if provided
            const cleanedPackageData = {
                ...packageData,
                slug: packageData.slug ? formatSlug(packageData.slug) : ''
            };
            
            const response = await axios.put(`/api/packages/${selectedPackage._id}`, cleanedPackageData);
            
            const updatedPackage = response.data?.data || response.data;
            setPackages((prevPackages) => (prevPackages || []).map(p => 
                p._id === selectedPackage._id ? updatedPackage : p
            ));
            
            setIsEditModalOpen(false);
            setSelectedPackage(null);
            setFormData(getInitialFormData());
            setCurrentStep(1);
            toast.success('Package updated successfully!', {
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
        } catch (error) {
            console.error('Error updating package:', error);
            toast.error(error.response?.data?.message || 'Failed to update package', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        } finally {
            setFormLoading(false);
        }
    };

    // Get unique creators from packages data
    const getUniqueCreators = () => {
        const creators = new Set();
        packages.forEach(pkg => {
            if (pkg.createdBy && pkg.createdBy.username) {
                creators.add(JSON.stringify({
                    id: pkg.createdBy._id || pkg.createdBy.id,
                    username: pkg.createdBy.username,
                    email: pkg.createdBy.email
                }));
            }
        });
        return Array.from(creators).map(creatorStr => JSON.parse(creatorStr));
    };

    // Filter packages based on search and filters
    const filteredPackages = (packages || []).filter(pkg => {
        const searchTerm = filters.search?.toLowerCase() || '';
        
        const matchesSearch = !filters.search || 
            pkg.name?.toLowerCase().includes(searchTerm) ||
            pkg.description?.toLowerCase().includes(searchTerm) ||
            pkg.countries?.some(country => country.toLowerCase().includes(searchTerm)) ||
            pkg.cities?.some(city => city.toLowerCase().includes(searchTerm)) ||
            // Search in hotel names (populated data)
            pkg.hotels?.some(hotel => hotel.hotelId?.name?.toLowerCase().includes(searchTerm)) ||
            // Search in tour names (populated data)
            pkg.tours?.some(tour => tour.tourId?.name?.toLowerCase().includes(searchTerm)) ||
            // Search in hotel cities (populated data)
            pkg.hotels?.some(hotel => hotel.hotelId?.city?.toLowerCase().includes(searchTerm)) ||
            // Search in tour cities (populated data)
            pkg.tours?.some(tour => tour.tourId?.city?.toLowerCase().includes(searchTerm));

        const matchesCountry = !filters.country || 
            pkg.countries?.includes(filters.country);

        const matchesCity = !filters.city || 
            pkg.cities?.includes(filters.city);

        const matchesStatus = filters.isActive === '' || 
            pkg.isActive?.toString() === filters.isActive;

        const matchesCreatedBy = !filters.createdBy || 
            pkg.createdBy?._id === filters.createdBy || 
            pkg.createdBy?.id === filters.createdBy;

        return matchesSearch && matchesCountry && matchesCity && matchesStatus && matchesCreatedBy;
    });

    function getInitialFormData() {
        return {
            name: '',
            slug: '',
            description: '',
            countries: [],
            cities: [],
            duration: 7,
            hotels: [],
            tours: [],
            transfers: [],
            dailyItinerary: [],
            includes: ['Airport transfers', 'Accommodation', 'Breakfast'],
            excludes: ['International flights', 'Personal expenses', 'Travel insurance'],
            includeArrivalDay: false,
            pricing: {
                basePrice: 0,
                currency: 'USD'
            },
            targetAudience: ['Family'],
            images: [],
            faqs: [],
            isActive: true
        };
    }

    // Fetch initial data (only for creation, no package listing)
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [packagesRes, hotelsRes, toursRes, airportsRes] = await Promise.all([
                axios.get('/api/packages', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }).catch(err => {
                    console.warn('Failed to fetch packages:', err);
                    return { data: [] };
                }),
                axios.get('/api/hotels'),
                axios.get('/api/tours'),
                axios.get('/api/airports')
            ]);

            // Handle both paginated and non-paginated responses
            const packagesData = packagesRes.data?.data || packagesRes.data;
            setPackages(Array.isArray(packagesData) ? packagesData : []);
            setHotels(hotelsRes.data || []);
            setTours(toursRes.data || []);
            setAirports(airportsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data. Please try again.');
            toast.error('Failed to load data', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
            // Ensure packages is always an array even on error
            setPackages([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const packagesRes = await axios.get('/api/packages', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Handle both paginated and non-paginated responses
            const packagesData = packagesRes.data?.data || packagesRes.data;
            setPackages(Array.isArray(packagesData) ? packagesData : []);
            
            toast.success('Packages refreshed successfully', {
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
        } catch (error) {
            console.error('Error refreshing packages:', error);
            toast.error('Failed to refresh packages', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        }
    };

    // Form handlers
    const handleInputChange = (field, value) => {
        // Clean array values to ensure they contain only strings
        let cleanValue = value;
        if (Array.isArray(value) && (field === 'countries' || field === 'cities')) {
            cleanValue = value.filter(item => typeof item === 'string' && item.trim() !== '');
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: cleanValue
        }));
    };

    const handleNestedInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Handle slug input with validation
    const handleSlugChange = (e) => {
        const value = e.target.value;
        const formattedSlug = formatSlugWhileTyping(value);
        
        setFormData(prev => ({
            ...prev,
            slug: formattedSlug,
        }));

        // Validate slug and show error if invalid
        const validation = validateSlug(formattedSlug);
        if (!validation.isValid) {
            setSlugError(validation.message);
        } else {
            setSlugError('');
        }
    };

    const handleArrayInputChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (field, item = '') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], item]
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Hotel management
    const handleAddHotelToForm = (selectedHotelId) => {
        // Handle both event objects and direct values
        const hotelId = selectedHotelId?.target?.value || selectedHotelId;
        if (hotelId) {
            const newHotel = {
                hotelId: hotelId,
                checkIn: '',
                checkOut: '',
                roomTypes: [],
                includeBreakfast: true,
                selectedAirport: '',
                includeReception: true,
                includeFarewell: true,
                transportVehicleType: 'Vito'
            };
            
            setFormData(prev => ({
                ...prev,
                hotels: [...prev.hotels, newHotel]
            }));
        }
    };

    const handleRemoveHotel = (index) => {
        setFormData(prev => ({
            ...prev,
            hotels: prev.hotels.filter((_, i) => i !== index)
        }));
    };

    const handleHotelChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            hotels: prev.hotels.map((hotel, i) => 
                i === index ? { ...hotel, [field]: value } : hotel
            )
        }));
    };

    // Tour management is now handled by TourSelector component

    // Daily itinerary management
    const handleAddDayItinerary = () => {
        setFormData(prev => {
            const newDayNumber = prev.dailyItinerary.length + 1;
            
            // Check if there's already a tour assigned to this day number
            const assignedTour = prev.tours.find(tour => tour.day === newDayNumber);
            let tourInfo = undefined;
            
            if (assignedTour) {
                const tourData = tours.find(t => t._id === assignedTour.tourId);
                if (tourData) {
                    tourInfo = {
                        tourId: tourData._id,
                        name: tourData.name,
                        city: tourData.city,
                        duration: tourData.duration,
                        price: tourData.price,
                        tourType: tourData.tourType
                    };
                }
            }
            
            const newDay = {
                day: newDayNumber,
                title: tourInfo ? `Day ${newDayNumber} - ${tourInfo.name}` : '',
                description: tourInfo ? tours.find(t => t._id === assignedTour.tourId)?.description || '' : '',
                activities: tourInfo ? tours.find(t => t._id === assignedTour.tourId)?.highlights || [''] : [''],
                meals: {
                    breakfast: false,
                    lunch: false,
                    dinner: false
                },
                tourInfo: tourInfo
            };
            
            return {
                ...prev,
                dailyItinerary: [...prev.dailyItinerary, newDay]
            };
        });
    };

    const handleDayItineraryChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            dailyItinerary: prev.dailyItinerary.map((day, i) => 
                i === index ? { ...day, [field]: value } : day
            )
        }));
    };

    const handleMealChange = (dayIndex, meal, value) => {
        setFormData(prev => ({
            ...prev,
            dailyItinerary: prev.dailyItinerary.map((day, i) => 
                i === dayIndex ? {
                    ...day,
                    meals: { ...day.meals, [meal]: value }
                } : day
            )
        }));
    };

    // Submit handlers
    const handleCreatePackage = async () => {
        // Basic validation
        if (!formData.name || formData.countries.length === 0 || formData.cities.length === 0) {
            toast.error('Please fill in all required fields', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
            return;
        }

        // Validate slug before submission
        if (formData.slug && formData.slug.trim()) {
            const validation = validateSlug(formData.slug);
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

        // Validate pricing
        if (!formData.pricing?.basePrice || formData.pricing.basePrice <= 0) {
            toast.error('Please set a valid base price for the package', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
            return;
        }

        // Validate hotels have check-in and check-out dates
        const invalidHotels = formData.hotels.filter((hotel) => !hotel.checkIn || !hotel.checkOut);
        if (invalidHotels.length > 0) {
            const hotelNumbers = formData.hotels
                .map((hotel, index) => (!hotel.checkIn || !hotel.checkOut) ? `#${index + 1}` : null)
                .filter(Boolean)
                .join(', ');
            toast.error(`Please set check-in and check-out dates for hotel(s): ${hotelNumbers}`, {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
            return;
        }

        // Validate daily itinerary titles and descriptions
        const invalidDayTitles = formData.dailyItinerary.filter((day) => !day.title || day.title.trim() === '');
        if (invalidDayTitles.length > 0) {
            const dayNumbers = formData.dailyItinerary
                .map((day, index) => (!day.title || day.title.trim() === '') ? `Day ${index + 1}` : null)
                .filter(Boolean)
                .join(', ');
            toast.error(`Please add titles for: ${dayNumbers}`, {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
            return;
        }



        // Filter out empty strings from includes and excludes
        const cleanedFormData = {
            ...formData,
            // Format slug if provided
            slug: formData.slug ? formatSlug(formData.slug) : '',
            // Ensure cities are simple strings
            cities: formData.cities.filter(city => typeof city === 'string' && city.trim() !== ''),
            // Clean includes and excludes
            includes: formData.includes.filter(item => item.trim() !== ''),
            excludes: formData.excludes.filter(item => item.trim() !== ''),
            // Clean daily itinerary
            dailyItinerary: formData.dailyItinerary.map(day => ({
                ...day,
                title: day.title?.trim() || '',
                description: day.description?.trim() || '',
                activities: day.activities?.filter(activity => activity.trim() !== '') || []
            })),
            // Ensure hotels have proper date format
            hotels: formData.hotels.map(hotel => ({
                ...hotel,
                checkIn: hotel.checkIn ? new Date(hotel.checkIn).toISOString() : null,
                checkOut: hotel.checkOut ? new Date(hotel.checkOut).toISOString() : null
            })),
            // Ensure pricing has basePrice
            pricing: {
                ...formData.pricing,
                basePrice: formData.pricing?.basePrice || 0
            }
        };

        // Ensure at least one item in includes and excludes
        if (cleanedFormData.includes.length === 0) {
            toast.error('Please add at least one item to Package Includes', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
            return;
        }
        if (cleanedFormData.excludes.length === 0) {
            toast.error('Please add at least one item to Package Excludes', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
            return;
        }

        setFormLoading(true);
        try {
            // Debug: Log the data being sent
            console.log('Sending package data:', JSON.stringify(cleanedFormData, null, 2));
            
            const response = await axios.post('/api/packages', cleanedFormData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Add the new package to the list
            const newPackage = response.data?.data || response.data;
            setPackages((prevPackages) => [newPackage, ...(prevPackages || [])]);

            setIsCreateModalOpen(false);
            setFormData(getInitialFormData());
            resetSteps();
            toast.success('Package created successfully', {
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
        } catch (error) {
            console.error('Error creating package:', error);
            toast.error(error.response?.data?.message || 'Failed to create package', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        } finally {
            setFormLoading(false);
        }
    };


    // Modal handlers
    const openCreateModal = () => {
        setFormData(getInitialFormData());
        resetSteps();
        setIsCreateModalOpen(true);
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedPackage(null);
        setFormData(getInitialFormData());
        resetSteps();
    };

    if (loading) {
        return (
            <div className="p-8">
                <RahalatekLoader size="lg" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <div className="flex justify-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Package Management</h2>
                </div>
                <div className="flex justify-center sm:justify-end">
                    <CustomButton
                        onClick={openCreateModal}
                        variant="blueToTeal"
                        size="sm"
                        icon={FaPlus}
                        className="w-full sm:w-auto"
                    >
                        Create Package
                    </CustomButton>
                </div>
            </div>

            {error && (
                <Alert color="failure" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Search and Filter Bar */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col gap-4">
                    <div className="flex-1">
                        <Search
                            placeholder="Search packages, hotels, tours, cities..."
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3">
                        <div className="flex-1">
                            <SearchableSelect
                                value={filters.country}
                                onChange={(e) => setFilters({...filters, country: e.target.value, city: ''})}
                                placeholder="All Countries"
                                options={[
                                    { value: '', label: 'All Countries' },
                                    ...getCountryOptions()
                                ]}
                            />
                        </div>
                        <div className="flex-1">
                            <SearchableSelect
                                value={filters.city}
                                onChange={(e) => setFilters({...filters, city: e.target.value})}
                                placeholder="All Cities"
                                options={[
                                    { value: '', label: 'All Cities' },
                                    ...(filters.country ? getCityOptions([filters.country]) : getCityOptions(getCountries()))
                                ]}
                            />
                        </div>
                        <div className="flex-1">
                            <SearchableSelect
                                value={filters.isActive}
                                onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                                placeholder="All Status"
                                options={[
                                    { value: '', label: 'All Status' },
                                    { value: 'true', label: 'Active' },
                                    { value: 'false', label: 'Inactive' }
                                ]}
                            />
                        </div>
                        <div className="flex-1">
                            <SearchableSelect
                                value={filters.createdBy}
                                onChange={(e) => setFilters({...filters, createdBy: e.target.value})}
                                placeholder="All Creators"
                                options={[
                                    { value: '', label: 'All Creators' },
                                    ...getUniqueCreators().map(creator => ({
                                        value: creator.id,
                                        label: creator.username || creator.email || 'Unknown'
                                    }))
                                ]}
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <CustomButton 
                                variant="red" 
                                onClick={() => setFilters({ search: '', country: '', city: '', isActive: '', createdBy: '' })}
                                disabled={!filters.search && !filters.country && !filters.city && !filters.isActive && !filters.createdBy}
                                className="w-full h-[44px] my-0.5"
                                icon={FaFilter}
                            >
                                Clear Filters
                            </CustomButton>
                        </div>
                        <div className="flex-shrink-0">
                            <CustomButton 
                                variant="orange" 
                                onClick={fetchPackages}
                                className="w-full h-[44px] my-0.5"
                                icon={FaSyncAlt}
                            >
                                Refresh Data
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Cards Grid */}
            {filteredPackages.length === 0 ? (
                <Card className="dark:bg-slate-900 text-center py-12">
                    <div className="max-w-md mx-auto">
                        <div className="mb-4">
                            <FaPlus className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {(packages || []).length === 0 ? 'No Packages Created Yet' : 'No Packages Found'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {(packages || []).length === 0 
                                ? 'Create your first comprehensive tour package with hotels, tours, and detailed itineraries.'
                                : 'Try adjusting your search or filter criteria to find packages.'
                            }
                        </p>
                        {(packages || []).length === 0 && (
                            <CustomButton
                                onClick={openCreateModal}
                                variant="blueToTeal"
                                size="lg"
                                icon={FaPlus}
                            >
                                Create First Package
                            </CustomButton>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredPackages.map((pkg) => (
                        <PackageCard
                            key={pkg._id}
                            package={pkg}
                            user={user}
                            onView={handleViewPackage}
                            onEdit={handleEditPackage}
                            onDelete={handleDeletePackage}
                            onToggleStatus={handleTogglePackageStatus}
                        />
                    ))}
                </div>
            )}

            {/* Create Package Modal */}
            <MultiStepModal
                isOpen={isCreateModalOpen}
                onClose={closeModals}
                title="Create New Package"
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepTitles={stepTitles}
                onNext={nextStep}
                onPrevious={prevStep}
                onStepClick={goToStep}
                onSubmit={handleCreatePackage}
                isLoading={formLoading}
                submitText="Create Package"
                submitIcon={formLoading ? FaSpinner : FaSave}
                bodyMaxHeight="max-h-[65vh] lg:max-h-[85vh]"
                stepValidation={getStepValidation()}
                stepMissingFields={getStepMissingFields()}
            >
                <PackageFormSteps
                    currentStep={currentStep}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onNestedInputChange={handleNestedInputChange}
                    onArrayInputChange={handleArrayInputChange}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                    handleAddHotelToForm={handleAddHotelToForm}
                    handleRemoveHotel={handleRemoveHotel}
                    handleHotelChange={handleHotelChange}
                    handleAddDayItinerary={handleAddDayItinerary}
                    handleDayItineraryChange={handleDayItineraryChange}
                    handleMealChange={handleMealChange}
                    hotels={hotels}
                    tours={tours}
                    airports={airports}
                    handleSlugChange={handleSlugChange}
                    slugError={slugError}
                    handleAddFaq={() => addArrayItem('faqs', { question: '', answer: '' })}
                    handleRemoveFaq={(index) => removeArrayItem('faqs', index)}
                    handleFaqChange={(index, field, value) => {
                        const updatedFaqs = [...formData.faqs];
                        updatedFaqs[index] = {
                            ...updatedFaqs[index],
                            [field]: value
                        };
                        handleInputChange('faqs', updatedFaqs);
                    }}
                />
            </MultiStepModal>

            {/* Edit Package Modal */}
            <MultiStepModal
                isOpen={isEditModalOpen}
                onClose={closeModals}
                title={`Edit Package: ${selectedPackage?.name || ''}`}
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepTitles={stepTitles}
                onNext={nextStep}
                onPrevious={prevStep}
                onStepClick={goToStep}
                onSubmit={() => handleUpdatePackage(formData)}
                isLoading={formLoading}
                submitText="Update Package"
                submitIcon={formLoading ? FaSpinner : FaSave}
                bodyMaxHeight="max-h-[65vh] lg:max-h-[85vh]"
                stepValidation={getStepValidation()}
                stepMissingFields={getStepMissingFields()}
            >
                <PackageFormSteps
                    currentStep={currentStep}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onNestedInputChange={handleNestedInputChange}
                    onArrayInputChange={handleArrayInputChange}
                    addArrayItem={addArrayItem}
                    removeArrayItem={removeArrayItem}
                    handleAddHotelToForm={handleAddHotelToForm}
                    handleRemoveHotel={handleRemoveHotel}
                    handleHotelChange={handleHotelChange}
                    handleAddDayItinerary={handleAddDayItinerary}
                    handleDayItineraryChange={handleDayItineraryChange}
                    handleMealChange={handleMealChange}
                    hotels={hotels}
                    tours={tours}
                    airports={airports}
                    handleSlugChange={handleSlugChange}
                    slugError={slugError}
                    handleAddFaq={() => addArrayItem('faqs', { question: '', answer: '' })}
                    handleRemoveFaq={(index) => removeArrayItem('faqs', index)}
                    handleFaqChange={(index, field, value) => {
                        const updatedFaqs = [...formData.faqs];
                        updatedFaqs[index] = {
                            ...updatedFaqs[index],
                            [field]: value
                        };
                        handleInputChange('faqs', updatedFaqs);
                    }}
                />
            </MultiStepModal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={confirmDeletePackage}
                isLoading={deleteLoading}
                itemType="package"
                itemName={packageToDelete?.name}
                itemExtra={packageToDelete ? `${packageToDelete.duration} days` : ''}
            />
        </div>
    );
}

// Package Form Steps Component
function PackageFormSteps({
    currentStep,
    formData,
    onInputChange,
    onNestedInputChange,
    onArrayInputChange,
    addArrayItem,
    removeArrayItem,
    handleAddHotelToForm,
    handleRemoveHotel,
    handleHotelChange,
    handleAddDayItinerary,
    handleDayItineraryChange,
    handleMealChange,
    hotels,
    tours,
    airports,
    handleSlugChange,
    slugError,
    handleAddFaq,
    handleRemoveFaq,
    handleFaqChange
}) {
    // Collapsed days state
    const [collapsedDays, setCollapsedDays] = useState(new Set());

    // Toggle day collapse state
    const toggleDayCollapse = (dayIndex) => {
        setCollapsedDays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dayIndex)) {
                newSet.delete(dayIndex);
            } else {
                newSet.add(dayIndex);
            }
            return newSet;
        });
    };

    return (
        <>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <Card className="dark:bg-slate-900">
                        <h3 className="text-lg font-semibold dark:text-white mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name" value="Package Name *" className="dark:text-white" />
                                <TextInput
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => onInputChange('name', e.target.value)}
                                    placeholder="Enter package name..."
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="duration" value="Duration (Days) *" className="dark:text-white" />
                                <TextInput
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={formData.duration}
                                    onChange={(e) => onInputChange('duration', parseInt(e.target.value) || 1)}
                                    placeholder="Enter duration in days..."
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <CheckBoxDropDown
                                    label="Countries *"
                                    options={getCountryOptions()}
                                    value={formData.countries}
                                    onChange={(selectedCountries) => {
                                        onInputChange('countries', selectedCountries);
                                        // Clear cities when countries change
                                        onInputChange('cities', []);
                                    }}
                                    placeholder="Search countries..."
                                    allowMultiple={true}
                                    allowEmpty={true}
                                    searchable={true}
                                />
                            </div>
                            
                            <div>
                                <CheckBoxDropDown
                                    label="Cities *"
                                    options={getCityOptions(formData.countries)}
                                    value={formData.cities}
                                    onChange={(selectedCities) => {
                                        onInputChange('cities', selectedCities);
                                    }}
                                    placeholder={formData.countries.length === 0 ? "Select countries first..." : "Search cities..."}
                                    allowMultiple={true}
                                    allowEmpty={true}
                                    disabled={formData.countries.length === 0}
                                    searchable={true}
                                />
                                {formData.countries.length === 0 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Please select countries first
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <Label htmlFor="description" value="Description" className="dark:text-white" />
                            <TextInput
                                id="description"
                                value={formData.description}
                                onChange={(e) => onInputChange('description', e.target.value)}
                                placeholder="Enter package description..."
                                as="textarea"
                                rows={4}
                            />
                        </div>
                    </Card>
                </div>
            )}

            {/* Step 2: Hotels Selection */}
            {currentStep === 2 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">Hotels Selection</h3>
                    <div className="mb-3 md:mb-4">
                            <Label value="Add Hotel" className="dark:text-white" />
                            <SearchableSelect
                                options={hotels
                                    .filter(hotel => formData.cities.length === 0 || formData.cities.includes(hotel.city))
                                    .map(hotel => ({
                                        value: hotel._id,
                                        label: `${hotel.name} - ${hotel.city} (${hotel.stars}⭐)`
                                    }))
                                }
                                value=""
                                onChange={handleAddHotelToForm}
                                placeholder="Search and select hotels..."
                                disabled={formData.cities.length === 0}
                                key={formData.hotels.length}
                            />
                            {formData.cities.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Please select cities first to see available hotels.
                                </p>
                            )}
                        </div>

                        {formData.hotels.length > 0 ? (
                            <div className="space-y-3 md:space-y-4">
                                {formData.hotels.map((hotelConfig, index) => {
                                    const hotel = hotels.find(h => h._id === hotelConfig.hotelId);
                                    return hotel ? (
                                        <PackageHotelCard
                                            key={hotelConfig.hotelId}
                                            hotel={hotelConfig}
                                            hotelData={hotel}
                                            index={index}
                                            onChange={handleHotelChange}
                                            onRemove={() => handleRemoveHotel(index)}
                                            airports={airports}
                                        />
                                    ) : null;
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p>No hotels added yet. Select cities and add hotels to your package.</p>
                            </div>
                        )}
                </div>
            )}

            {/* Step 3: Tours & Daily Itinerary */}
            {currentStep === 3 && (
                <div className="space-y-6">
                    {/* Tours Section */}
                    {formData.countries.length > 0 && formData.cities.length > 0 ? (
                        <TourSelector
                            availableTours={tours.filter(tour => 
                                formData.cities.length === 0 || formData.cities.includes(tour.city)
                            )}
                            selectedTours={formData.tours.map(t => t.tourId)}
                            hideDayAssignment={true}
                            onTourSelection={(tourId) => {
                                const existingTourIndex = formData.tours.findIndex(t => t.tourId === tourId);
                                
                                if (existingTourIndex >= 0) {
                                    // Remove tour and its activities from itinerary
                                    const removedTour = formData.tours[existingTourIndex];
                                    const selectedTour = tours.find(t => t._id === tourId);
                                    const tourActivity = `${selectedTour?.name} (${selectedTour?.city})`;
                                    
                                    // Update tours
                                    onInputChange('tours', formData.tours.filter((_, i) => i !== existingTourIndex));
                                    
                                    // Remove tour activity from daily itinerary
                                    if (removedTour.day) {
                                        const updatedItinerary = formData.dailyItinerary.map(dayEntry => {
                                            if (dayEntry.day === removedTour.day) {
                                                return {
                                                    ...dayEntry,
                                                    activities: dayEntry.activities.filter(activity => activity !== tourActivity)
                                                };
                                            }
                                            return dayEntry;
                                        });
                                        onInputChange('dailyItinerary', updatedItinerary);
                                    }
                                } else {
                                    // Add tour without automatic day assignment (will be assigned from Daily Itinerary)
                                    const newTour = {
                                        tourId: tourId,
                                        day: null // No automatic day assignment
                                    };
                                    
                                    // Update tours
                                    onInputChange('tours', [...formData.tours, newTour]);
                                }
                            }}
                            onTourDayAssignment={(tourId, day) => {
                                // eslint-disable-next-line no-unused-vars
                                const selectedTour = tours.find(t => t._id === tourId);
                                const dayNumber = parseInt(day);
                                
                                const updatedTours = formData.tours.map(tour => 
                                    tour.tourId === tourId ? { ...tour, day: dayNumber } : tour
                                );
                                onInputChange('tours', updatedTours);
                            }}
                        />
                    ) : (
                        <Card className="dark:bg-slate-900">
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <div className="mb-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Select Countries and Cities First
                                </h3>
                                <p className="text-sm">
                                    Please go back to Step 1 and select at least one country and city to see available tours.
                                </p>
                                <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                                    <p>Selected: {formData.countries.length} countries, {formData.cities.length} cities</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Daily Itinerary Section */}
                    <Card className="dark:bg-slate-900">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
                            <h3 className="text-base sm:text-lg font-semibold dark:text-white">Daily Itinerary</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
                                <CustomCheckbox
                                    id="includeArrivalDay"
                                    label="Include Day 1 as Arrival & Transfer"
                                    checked={formData.includeArrivalDay || false}
                                    onChange={(checked) => {
                                        onInputChange('includeArrivalDay', checked);
                                        if (checked) {
                                                // Add Day 1 as arrival day and shift other tours
                                                const arrivalDay = {
                                                    day: 1,
                                                    title: 'Day 1 - Arrival & Transfer',
                                                    description: 'Arrival at airport, meet & greet service, transfer to hotel, check-in and rest.',
                                                    activities: [
                                                        'Airport reception service',
                                                        'Meet & greet with tour representative', 
                                                        'Transfer to hotel',
                                                        'Hotel check-in assistance',
                                                        'Welcome briefing',
                                                        'Rest and prepare for upcoming tours'
                                                    ],
                                                    meals: {
                                                        breakfast: false,
                                                        lunch: false,
                                                        dinner: false
                                                    },
                                                    isArrivalDay: true
                                                };
                                                
                                                // Shift existing tour days +1
                                                const updatedTours = formData.tours.map(tour => ({
                                                    ...tour,
                                                    day: tour.day + 1
                                                }));
                                                
                                                const updatedItinerary = formData.dailyItinerary
                                                    .filter(day => !day.isArrivalDay) // Remove any existing arrival day
                                                    .map(day => ({
                                                        ...day,
                                                        day: day.day + 1,
                                                        title: day.title.replace(/Day \d+/, `Day ${day.day + 1}`)
                                                    }));
                                                
                                                // Add arrival day and sort
                                                const newItinerary = [arrivalDay, ...updatedItinerary]
                                                    .sort((a, b) => a.day - b.day);
                                                
                                                onInputChange('tours', updatedTours);
                                                onInputChange('dailyItinerary', newItinerary);
                                            } else {
                                                // Remove arrival day and shift tours back
                                                const updatedTours = formData.tours.map(tour => ({
                                                    ...tour,
                                                    day: Math.max(1, tour.day - 1)
                                                }));
                                                
                                                const updatedItinerary = formData.dailyItinerary
                                                    .filter(day => !day.isArrivalDay)
                                                    .map(day => ({
                                                        ...day,
                                                        day: Math.max(1, day.day - 1),
                                                        title: day.title.replace(/Day \d+/, `Day ${Math.max(1, day.day - 1)}`)
                                                    }));
                                                
                                                onInputChange('tours', updatedTours);
                                                onInputChange('dailyItinerary', updatedItinerary);
                                            }
                                        }}
                                />
                                <CustomButton
                                    onClick={handleAddDayItinerary}
                                    variant="pinkToOrange"
                                    size="sm"
                                    icon={FaPlus}
                                    className="w-full sm:w-auto"
                                >
                                    Add Day
                                </CustomButton>
                            </div>
                        </div>
                        
                        {formData.dailyItinerary.map((day, index) => (
                            <div key={index} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium dark:text-white">Day {day.day}</h4>
                                        {day.isArrivalDay && (
                                            <Badge color="info" size="sm">Arrival Day</Badge>
                                        )}
                                        <button
                                            onClick={() => toggleDayCollapse(index)}
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {collapsedDays.has(index) ? (
                                                <FaChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            ) : (
                                                <FaChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {!day.isArrivalDay && (
                                        <CustomButton
                                            onClick={() => removeArrayItem('dailyItinerary', index)}
                                            variant="red"
                                            size="sm"
                                            shape="circular"
                                            icon={FaTimes}
                                        />
                                    )}
                                </div>
                                
                                {/* Collapsible content */}
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                    collapsedDays.has(index) ? 'max-h-0 opacity-0' : 'max-h-screen opacity-100'
                                }`}>
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Selected Tour Card */}
                                        {day.tourInfo && (
                                            <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-lg">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        {day.tourInfo.tourType === 'VIP' ? (
                                                            <span 
                                                                className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-300 border border-amber-600 w-fit"
                                                                style={{ 
                                                                    color: '#7B5804', 
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.75rem',
                                                                    textShadow: '0 0 2px rgba(255,255,255,0.5)'
                                                                }}
                                                            >
                                                                VIP
                                                            </span>
                                                        ) : day.tourInfo.tourType === 'Group' ? (
                                                            <Badge color="blue" size="sm" className="w-fit">Group</Badge>
                                                        ) : (
                                                            <Badge color="green" size="sm" className="w-fit">Private</Badge>
                                                        )}
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                            <span className="text-sm font-medium dark:text-white">{day.tourInfo.name}</span>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">({day.tourInfo.city})</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                                        ${day.tourInfo.price}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    {/* Tour Assignment for this day */}
                                    {!day.isArrivalDay && (
                                        <div>
                                            <Label value="Assign Tour to this Day" className="dark:text-white" />
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Select
                                                    key={`day-${day.day}-${formData.tours.length}-${formData.tours.filter(t => t.day === null || t.day === day.day).length}`}
                                                    value={day.tourInfo?.tourId || ''}
                                                    onChange={(selectedTourId) => {
                                                        if (selectedTourId) {
                                                            // Assign tour to this day
                                                            const selectedTour = tours.find(t => t._id === selectedTourId);
                                                            if (selectedTour) {
                                                                // Update the tour's day assignment
                                                                const updatedTours = formData.tours.map(tour => 
                                                                    tour.tourId === selectedTourId 
                                                                        ? { ...tour, day: day.day }
                                                                        : tour.day === day.day 
                                                                            ? { ...tour, day: null } // Remove previous tour from this day
                                                                            : tour
                                                                );
                                                                onInputChange('tours', updatedTours);
                                                                
                                                                // Update this day's tour info
                                                                const updatedDayInfo = {
                                                                    ...day,
                                                                    tourInfo: {
                                                                        tourId: selectedTour._id,
                                                                        name: selectedTour.name,
                                                                        city: selectedTour.city,
                                                                        tourType: selectedTour.tourType,
                                                                        price: selectedTour.price
                                                                    },
                                                                    activities: selectedTour.highlights || day.activities,
                                                                    title: `Day ${day.day} - ${selectedTour.name}`,
                                                                    description: selectedTour.description || day.description
                                                                };
                                                                
                                                                // Update daily itinerary
                                                                const updatedItinerary = formData.dailyItinerary.map((d, i) => 
                                                                    i === index ? updatedDayInfo : d
                                                                );
                                                                onInputChange('dailyItinerary', updatedItinerary);
                                                            }
                                                        } else {
                                                            // Remove tour assignment from this day
                                                            const updatedTours = formData.tours.map(tour => 
                                                                tour.day === day.day ? { ...tour, day: null } : tour
                                                            );
                                                            onInputChange('tours', updatedTours);
                                                            
                                                            // Clear tour info from this day
                                                            const updatedDayInfo = {
                                                                ...day,
                                                                tourInfo: null,
                                                                activities: [],
                                                                title: `Day ${day.day}`,
                                                                description: ''
                                                            };
                                                            
                                                            const updatedItinerary = formData.dailyItinerary.map((d, i) => 
                                                                i === index ? updatedDayInfo : d
                                                            );
                                                            onInputChange('dailyItinerary', updatedItinerary);
                                                        }
                                                    }}
                                                    options={[
                                                        { value: '', label: 'Select a tour for this day...' },
                                                        ...formData.tours
                                                            .filter(tour => tour.day === null || tour.day === day.day)
                                                            .map(tour => {
                                                                const tourId = typeof tour.tourId === 'object' ? tour.tourId._id : tour.tourId;
                                                                const tourData = tours.find(t => t._id === tourId);
                                                                
                                                                if (!tourData) {
                                                                    return {
                                                                        value: tourId,
                                                                        label: `Tour ${tourId.toString().slice(-8)} (Loading...)`
                                                                    };
                                                                }
                                                                
                                                                const isAssigned = tour.day === day.day;
                                                                
                                                                return {
                                                                    value: tourId,
                                                                    label: `${tourData.name} (${tourData.city}) - $${tourData.price}${isAssigned ? ' ✓' : ''}`
                                                                };
                                                            })
                                                    ]}
                                                    placeholder="Select a tour for this day..."
                                                    className="flex-1"
                                                />
                                                {day.tourInfo && (
                                                    <CustomButton
                                                        onClick={() => {
                                                            // Remove tour assignment
                                                            const updatedTours = formData.tours.map(tour => 
                                                                tour.day === day.day ? { ...tour, day: null } : tour
                                                            );
                                                            onInputChange('tours', updatedTours);
                                                            
                                                            const updatedDayInfo = {
                                                                ...day,
                                                                tourInfo: null,
                                                                activities: [],
                                                                title: `Day ${day.day}`,
                                                                description: ''
                                                            };
                                                            
                                                            const updatedItinerary = formData.dailyItinerary.map((d, i) => 
                                                                i === index ? updatedDayInfo : d
                                                            );
                                                            onInputChange('dailyItinerary', updatedItinerary);
                                                        }}
                                                        variant="red"
                                                        size="sm"
                                                        shape="circular"
                                                        icon={FaTimes}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <Label value="Day Title" className="dark:text-white" />
                                        <TextInput
                                            value={day.title}
                                            onChange={(e) => handleDayItineraryChange(index, 'title', e.target.value)}
                                            placeholder="e.g., Arrival Day, City Tour, etc."
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label value="Description (Optional)" className="dark:text-white" />
                                        <TextInput
                                            value={day.description}
                                            onChange={(e) => handleDayItineraryChange(index, 'description', e.target.value)}
                                            placeholder="Describe the day's activities and highlights... (optional)"
                                            as="textarea"
                                            rows={3}
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label value="Tour Highlights & Activities" className="dark:text-white" />
                                        <div className="space-y-2">
                                            {day.activities && day.activities.length > 0 ? (
                                                day.activities.map((activity, actIndex) => (
                                                    <div key={actIndex} className="flex items-center gap-2">
                                                        <TextInput
                                                            value={activity}
                                                            onChange={(e) => {
                                                                const newActivities = [...day.activities];
                                                                newActivities[actIndex] = e.target.value;
                                                                handleDayItineraryChange(index, 'activities', newActivities);
                                                            }}
                                                            placeholder="Tour highlight or activity description..."
                                                            className="flex-1"
                                                        />
                                                        <CustomButton
                                                            onClick={() => {
                                                                const newActivities = day.activities.filter((_, i) => i !== actIndex);
                                                                handleDayItineraryChange(index, 'activities', newActivities);
                                                            }}
                                                            variant="red"
                                                            size="sm"
                                                            shape="circular"
                                                            icon={FaTimes}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-500 dark:text-gray-400 text-sm">
                                                    No highlights or activities added yet. Tour highlights will automatically appear here when a tour is assigned to this day.
                                                </div>
                                            )}
                                            <CustomButton
                                                onClick={() => {
                                                    const newActivities = [...(day.activities || []), ''];
                                                    handleDayItineraryChange(index, 'activities', newActivities);
                                                }}
                                                variant="blue"
                                                size="xs"
                                                icon={FaPlus}
                                                className="mt-2"
                                            >
                                                Add Highlight/Activity
                                            </CustomButton>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label value="Meals Included" className="dark:text-white" />
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                                            <CustomCheckbox
                                                id={`breakfast-${index}`}
                                                label="Breakfast"
                                                checked={day.meals.breakfast}
                                                onChange={(checked) => handleMealChange(index, 'breakfast', checked)}
                                            />
                                            <CustomCheckbox
                                                id={`lunch-${index}`}
                                                label="Lunch"
                                                checked={day.meals.lunch}
                                                onChange={(checked) => handleMealChange(index, 'lunch', checked)}
                                            />
                                            <CustomCheckbox
                                                id={`dinner-${index}`}
                                                label="Dinner"
                                                checked={day.meals.dinner}
                                                onChange={(checked) => handleMealChange(index, 'dinner', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Show unassigned tours */}
                        {formData.tours.filter(t => t.day === null).length > 0 && (
                            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                                    📋 Unassigned Tours ({formData.tours.filter(t => t.day === null).length})
                                </h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                                    The following tours are selected but not yet assigned to any day. Use the dropdown in each day section to assign them:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tours.filter(t => t.day === null).map(tour => {
                                        const tourData = tours.find(t => t._id === tour.tourId);
                                        return tourData ? (
                                            <span key={tour.tourId} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                                                {tourData.name} ({tourData.city})
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                        
                    </Card>
                </div>
            )}

            {/* Step 4: Final Details */}
            {currentStep === 4 && (
                <div className="space-y-6">
                    {/* Includes/Excludes Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="dark:bg-slate-900">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold dark:text-white">Package Includes</h3>
                                <CustomButton
                                    onClick={() => addArrayItem('includes', '')}
                                    variant="green"
                                    size="xs"
                                    icon={FaPlus}
                                >
                                    Add Item
                                </CustomButton>
                            </div>
                            <div className="space-y-2">
                                {formData.includes.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <TextInput
                                            value={item}
                                            onChange={(e) => onArrayInputChange('includes', index, e.target.value)}
                                            placeholder="What's included in the package..."
                                            className="flex-1"
                                        />
                                        <CustomButton
                                            onClick={() => removeArrayItem('includes', index)}
                                            variant="red"
                                            size="sm"
                                            shape="circular"
                                            icon={FaTimes}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="dark:bg-slate-900">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold dark:text-white">Package Excludes</h3>
                                <CustomButton
                                    onClick={() => addArrayItem('excludes', '')}
                                    variant="orange"
                                    size="xs"
                                    icon={FaPlus}
                                >
                                    Add Item
                                </CustomButton>
                            </div>
                            <div className="space-y-2">
                                {formData.excludes.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <TextInput
                                            value={item}
                                            onChange={(e) => onArrayInputChange('excludes', index, e.target.value)}
                                            placeholder="What's not included..."
                                            className="flex-1"
                                        />
                                        <CustomButton
                                            onClick={() => removeArrayItem('excludes', index)}
                                            variant="red"
                                            size="sm"
                                            shape="circular"
                                            icon={FaTimes}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Package Settings & Pricing */}
                    <Card className="dark:bg-slate-900">
                        <h3 className="text-lg font-semibold dark:text-white mb-4">Package Settings & Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <CheckBoxDropDown
                                    label="Target Audience *"
                                    options={[
                                        { value: 'Family', label: 'Family' },
                                        { value: 'Couples', label: 'Couples' },
                                        { value: 'Solo Travelers', label: 'Solo Travelers' },
                                        { value: 'Groups', label: 'Groups' },
                                        { value: 'Business', label: 'Business' },
                                        { value: 'Luxury', label: 'Luxury' },
                                        { value: 'Budget', label: 'Budget' }
                                    ]}
                                    value={formData.targetAudience}
                                    onChange={(selectedAudiences) => onInputChange('targetAudience', selectedAudiences)}
                                    placeholder="Select target audiences..."
                                    allowMultiple={true}
                                    allowEmpty={true}
                                />
                            </div>
                            <div>
                                <Label value="Base Price (USD)" className="dark:text-white" />
                                <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.pricing.basePrice}
                                    onChange={(e) => onNestedInputChange('pricing', 'basePrice', parseFloat(e.target.value) || 0)}
                                    placeholder="Enter base price..."
                                />
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <CustomCheckbox
                                id="isActive"
                                label="Package is Active"
                                checked={formData.isActive}
                                onChange={(checked) => onInputChange('isActive', checked)}
                            />
                        </div>
                    </Card>

                    {/* Package Images Section */}
                    <Card className="dark:bg-slate-900">
                        <h3 className="text-lg font-semibold dark:text-white mb-4">Package Images</h3>
                        <div>
                            <Label value="Upload Package Images" className="dark:text-white mb-2 block" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Add attractive images to showcase your package. The first image will be used as the primary image.
                                {formData.images && formData.images.length > 0 && (
                                    <span className="text-green-600 dark:text-green-400 font-medium ml-2">
                                        ({formData.images.length} image{formData.images.length !== 1 ? 's' : ''} added)
                                    </span>
                                )}
                            </p>
                            <ImageUploader
                                onImagesUploaded={(images) => onInputChange('images', images)}
                                folder="packages"
                                maxImages={8}
                                existingImages={formData.images || []}
                            />
                        </div>
                    </Card>

                    {/* Package FAQs */}
                    <Card className="dark:bg-slate-900">
                        <h3 className="text-lg font-semibold dark:text-white mb-4">Package FAQs</h3>
                        <div>
                            <Label htmlFor="faqs" value="Frequently Asked Questions" className="mb-3 block" />
                            <div className="space-y-4">
                                {(formData.faqs || []).map((faq, index) => (
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
                    </Card>

                    {/* Package Slug Section */}
                    <Card className="dark:bg-slate-900">
                        <h3 className="text-lg font-semibold dark:text-white mb-4">Package URL Slug</h3>
                        <div className="space-y-4">
                            <div>
                                <Label value="Custom URL Slug (Optional)" className="dark:text-white mb-2 block" />
                                <TextInput
                                    value={formData.slug}
                                    onChange={handleSlugChange}
                                    placeholder="e.g., istanbul-tour-package"
                                    className={slugError ? 'border-red-500' : ''}
                                />
                                {slugError && (
                                    <p className="text-red-500 text-sm mt-1">{slugError}</p>
                                )}
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                    Preview: /packages/{getSlugPreview(formData.slug, formData.name)}
                                </p>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p className="font-medium mb-2">Slug Guidelines:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Use lowercase letters, numbers, and hyphens only</li>
                                    <li>Keep it short and descriptive (3-100 characters)</li>
                                    <li>No spaces or special characters</li>
                                    <li>Leave empty to auto-generate from package name</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
