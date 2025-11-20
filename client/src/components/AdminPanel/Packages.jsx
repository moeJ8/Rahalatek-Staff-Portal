import React, { useState, useEffect, useCallback } from 'react';
import { Card, Label, Alert, Badge } from 'flowbite-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaSave, FaTimes, FaSpinner, FaChevronDown, FaChevronUp, FaFilter, FaSyncAlt, FaAngleLeft, FaAngleRight, FaCalendarAlt } from 'react-icons/fa';
import { HiTrash, HiPlus } from 'react-icons/hi';
import Search from '../Search';


import CustomButton from '../CustomButton';
import CustomDatePicker from '../CustomDatePicker';
import TextInput from '../TextInput';
import Select from '../Select';
import SearchableSelect from '../SearchableSelect';
import CheckBoxDropDown from '../CheckBoxDropDown';
import RahalatekLoader from '../RahalatekLoader';
import PackageHotelCard from '../PackageHotelCard';
import PackageCard from '../PackageCard';
import PackageDayBlock from '../PackageDayBlock';
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
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    // Pagination states
    const [page, setPage] = useState(1);
    const [screenType, setScreenType] = useState('desktop');
    const [totalPages, setTotalPages] = useState(1);
    const [_totalPackages, setTotalPackages] = useState(0);
    
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

    // Translation collapse states
    const [translationCollapse, setTranslationCollapse] = useState({
        name: false,
        description: false,
        includes: false,
        excludes: false
    });

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

    // Translation functions
    const handleTranslationChange = (field, language, value) => {
        setFormData({
            ...formData,
            translations: {
                ...formData.translations,
                [field]: {
                    ...formData.translations[field],
                    [language]: value
                }
            }
        });
    };

    const toggleTranslationCollapse = (field) => {
        setTranslationCollapse({
            ...translationCollapse,
            [field]: !translationCollapse[field]
        });
    };

    // Handle array translations (for includes/excludes)
    const handleArrayTranslationChange = (field, index, language, value) => {
        setFormData(prev => {
            const newTranslations = { ...prev.translations };
            if (!newTranslations[field]) {
                newTranslations[field] = [];
            }
            if (!newTranslations[field][index]) {
                newTranslations[field][index] = { ar: '', fr: '' };
            }
            newTranslations[field][index][language] = value;
            return {
                ...prev,
                translations: newTranslations
            };
        });
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
            
            // Ensure arrival day flag is set properly and remove any old tourInfo
            const { tourInfo: _tourInfo, ...cleanDay } = day;
            return {
                ...cleanDay,
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
            },
            translations: pkg.translations || {
                name: { ar: '', fr: '' },
                description: { ar: '', fr: '' },
                includes: [],
                excludes: []
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
    // Screen size detection and items per page
    const getItemsPerPage = useCallback((type) => {
        switch(type) {
            case 'mobile':
                return 3;
            case 'tablet':
                return 6;
            case 'desktop':
            default:
                return 9;
        }
    }, []);

    const updateScreenSize = useCallback(() => {
        const width = window.innerWidth;
        
        if (width < 768) {
            setScreenType('mobile');
        } else if (width < 1024) {
            setScreenType('tablet');
        } else {
            setScreenType('desktop');
        }
    }, []);

    // No more client-side filtering - everything is server-side now
    const displayedPackages = packages;

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
            isActive: true,
            translations: {
                name: { ar: '', fr: '' },
                description: { ar: '', fr: '' },
                includes: [],
                excludes: []
            }
        };
    }

    // Debounce search term (300ms delay for faster response)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(filters.search);
        }, 300);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Reset to page 1 when screen type or filters change
    useEffect(() => {
        setPage(1);
    }, [screenType, debouncedSearchTerm, filters.country, filters.city, filters.isActive, filters.createdBy]);

    // Screen size detection
    useEffect(() => {
        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, [updateScreenSize]);

    // Fetch initial data (hotels, tours, airports only)
    useEffect(() => {
        fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Only fetch hotels, tours, airports for creation forms
            const [hotelsRes, toursRes, airportsRes] = await Promise.all([
                axios.get('/api/hotels'),
                axios.get('/api/tours'),
                axios.get('/api/airports')
            ]);

            setHotels(hotelsRes.data || []);
            setTours(toursRes.data || []);
            setAirports(airportsRes.data || []);
            
            // Fetch packages with server-side pagination
            await fetchPackages();
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
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = useCallback(async () => {
        try {
            // Build query params
            const params = new URLSearchParams({
                page: page.toString(),
                limit: getItemsPerPage(screenType).toString()
            });
            
            if (filters.country) params.append('country', filters.country);
            if (filters.city) params.append('city', filters.city);
            if (filters.isActive !== '') params.append('isActive', filters.isActive);
            if (filters.createdBy) params.append('createdBy', filters.createdBy);
            if (debouncedSearchTerm.trim()) params.append('search', debouncedSearchTerm.trim());
            
            const packagesRes = await axios.get(`/api/packages?${params.toString()}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (packagesRes.data.success) {
                // Server-side paginated response
                setPackages(packagesRes.data.data.packages);
                setTotalPages(packagesRes.data.data.pagination.totalPages);
                setTotalPackages(packagesRes.data.data.pagination.totalPackages);
            }
            
        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Failed to load packages. Please try again.');
        }
    }, [page, screenType, filters.country, filters.city, filters.isActive, filters.createdBy, debouncedSearchTerm, getItemsPerPage]);

    // Fetch packages when dependencies change
    useEffect(() => {
        if (page > 0) { // Only fetch if page is set
            fetchPackages();
        }
    }, [fetchPackages, page]);

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

        // Auto-generate day blocks when duration changes
        if (field === 'duration' && value > 0) {
            generateDayBlocks(value);
        }
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
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: [...prev[field], item]
            };

            // Handle translations for includes and excludes
            if (field === 'includes' || field === 'excludes') {
                newData.translations = {
                    ...prev.translations,
                    [field]: [...(prev.translations[field] || []), { ar: '', fr: '' }]
                };
            }

            return newData;
        });
    };

    // Generate day blocks based on duration
    const generateDayBlocks = (duration) => {
        const newItinerary = [];
        
        for (let i = 1; i <= duration; i++) {
            // Check if day already exists in itinerary
            const existingDay = formData.dailyItinerary.find(d => d.day === i);
            
            if (existingDay) {
                // Keep existing day data but ensure day number is set
                newItinerary.push({
                    ...existingDay,
                    day: i // Ensure day property is always set
                });
            } else {
                // Create new day block
                const newDay = {
                    day: i,
                    title: '',
                    description: '',
                    activities: [],
                    meals: {
                        breakfast: false,
                        lunch: false,
                        dinner: false
                    },
                    isArrivalDay: i === 1,
                    isDepartureDay: i === duration,
                    isRestDay: false
                };

                // Set default titles, descriptions, activities and translations for first and last days
                if (i === 1) {
                    newDay.title = `Arrival & Hotel Check-in`;
                    newDay.description = 'Welcome to your journey! Upon arrival at the airport, you will be greeted by our representative who will assist you with the transfer to your hotel. After checking in, take some time to rest and prepare for the exciting adventures ahead.';
                    newDay.activities = [
                        'Airport reception service',
                        'Meet & greet with tour representative',
                        'Transfer to hotel',
                        'Hotel check-in assistance',
                        'Welcome briefing',
                        'Rest and prepare for upcoming tours'
                    ];
                    newDay.translations = {
                        title: {
                            ar: 'الوصول وتسجيل الدخول في الفندق',
                            fr: 'Arrivée et enregistrement à l\'hôtel'
                        },
                        description: {
                            ar: 'مرحباً بك في رحلتك! عند الوصول إلى المطار، سيستقبلك ممثلنا الذي سيساعدك في الانتقال إلى فندقك. بعد تسجيل الدخول، خذ بعض الوقت للراحة والاستعداد للمغامرات المثيرة القادمة.',
                            fr: 'Bienvenue dans votre voyage ! À votre arrivée à l\'aéroport, vous serez accueilli par notre représentant qui vous aidera lors du transfert vers votre hôtel. Après l\'enregistrement, prenez le temps de vous reposer et de vous préparer pour les aventures passionnantes à venir.'
                        },
                        activities: [
                            { ar: 'خدمة الاستقبال في المطار', fr: 'Service de réception à l\'aéroport' },
                            { ar: 'الترحيب والاستقبال مع ممثل الجولة', fr: 'Accueil avec le représentant de la visite' },
                            { ar: 'النقل إلى الفندق', fr: 'Transfert vers l\'hôtel' },
                            { ar: 'المساعدة في تسجيل الدخول بالفندق', fr: 'Assistance à l\'enregistrement à l\'hôtel' },
                            { ar: 'إحاطة ترحيبية', fr: 'Briefing de bienvenue' },
                            { ar: 'الراحة والاستعداد للجولات القادمة', fr: 'Repos et préparation pour les visites à venir' }
                        ]
                    };
                    // Predefined images for arrival day
                    newDay.images = [
                        {
                            url: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759851638/merc_wtaghb.jpg',
                            altText: 'Airport arrival and welcome'
                        },
                        {
                            url: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1762087383/675014510_aul2zd.jpg',
                            altText: 'Hotel check-in'
                        },
                        {
                            url: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855915/492475786-960x630_kjybmn.jpg',
                            altText: 'Hotel room'
                        }
                    ];
                } else if (i === duration) {
                    newDay.title = `Departure & Airport Transfer`;
                    newDay.description = 'Time to say goodbye! After breakfast and hotel check-out, you will be transferred to the airport for your departure flight. We hope you had an amazing journey and look forward to welcoming you again.';
                    newDay.activities = [
                        'Hotel check-out',
                        'Transfer to airport',
                        'Departure assistance'
                    ];
                    newDay.translations = {
                        title: {
                            ar: 'المغادرة والانتقال إلى المطار',
                            fr: 'Départ et transfert à l\'aéroport'
                        },
                        description: {
                            ar: 'حان وقت الوداع! بعد الإفطار وتسجيل المغادرة من الفندق، سيتم نقلك إلى المطار لرحلة المغادرة. نأمل أن تكون قد قضيت رحلة رائعة ونتطلع للترحيب بك مرة أخرى.',
                            fr: 'Il est temps de dire au revoir ! Après le petit-déjeuner et le check-out de l\'hôtel, vous serez transféré à l\'aéroport pour votre vol de départ. Nous espérons que vous avez passé un voyage merveilleux et nous avons hâte de vous accueillir à nouveau.'
                        },
                        activities: [
                            { ar: 'تسجيل المغادرة من الفندق', fr: 'Check-out de l\'hôtel' },
                            { ar: 'النقل إلى المطار', fr: 'Transfert vers l\'aéroport' },
                            { ar: 'المساعدة في المغادرة', fr: 'Assistance au départ' }
                        ]
                    };
                    // Predefined images for departure day
                    newDay.images = [
                        {
                            url: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1762087521/Hotel-checkout_tgrnzr.avif',
                            altText: 'Hotel check-out'
                        },
                        {
                            url: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1762087587/7d_gpd2af.jpg',
                            altText: 'Airport departure'
                        },
                        {
                            url: 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1762087700/Istanbul-Airport-Transfer-By-VIP-Turkey-Transfer_sr0poy.jpg',
                            altText: 'Goodbye and safe travels'
                        }
                    ];
                }

                newItinerary.push(newDay);
            }
        }

        setFormData(prev => ({
            ...prev,
            dailyItinerary: newItinerary
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: prev[field].filter((_, i) => i !== index)
            };

            // Handle translations for includes and excludes
            if (field === 'includes' || field === 'excludes') {
                const translationArray = prev.translations[field] || [];
                newData.translations = {
                    ...prev.translations,
                    [field]: translationArray.filter((_, i) => i !== index)
                };
            }

            return newData;
        });
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

    // Daily itinerary management - now handled by PackageDayBlock component

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
            {displayedPackages.length === 0 ? (
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
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {displayedPackages.map((pkg) => (
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                            {/* Previous Button */}
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                                    page === 1
                                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                        : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:scale-110 shadow-sm hover:shadow-md'
                                }`}
                                aria-label="Previous page"
                            >
                                <FaAngleLeft className="w-4 h-4" />
                            </button>

                            {/* Page Numbers - Sliding Window */}
                            {(() => {
                                const pages = [];
                                const showPages = 5;
                                let startPage = Math.max(1, page - Math.floor(showPages / 2));
                                let endPage = Math.min(totalPages, startPage + showPages - 1);
                                
                                if (endPage - startPage < showPages - 1) {
                                    startPage = Math.max(1, endPage - showPages + 1);
                                }

                                // Generate page number buttons (sliding window - no ellipsis)
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => setPage(i)}
                                            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                                                i === page
                                                    ? 'bg-blue-500 dark:bg-teal-500 text-white border-blue-500 dark:border-teal-500 scale-110 shadow-lg'
                                                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-teal-500 dark:hover:text-white hover:border-blue-500 dark:hover:border-teal-500 hover:scale-110 shadow-sm hover:shadow-md'
                                            }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                return pages;
                            })()}

                            {/* Next Button */}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                                    page === totalPages
                                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                        : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:scale-110 shadow-sm hover:shadow-md'
                                }`}
                                aria-label="Next page"
                            >
                                <FaAngleRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
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
                    generateDayBlocks={generateDayBlocks}
                    setFormData={setFormData}
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
                    translationCollapse={translationCollapse}
                    toggleTranslationCollapse={toggleTranslationCollapse}
                    handleTranslationChange={handleTranslationChange}
                    handleArrayTranslationChange={handleArrayTranslationChange}
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
                    generateDayBlocks={generateDayBlocks}
                    setFormData={setFormData}
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
                    translationCollapse={translationCollapse}
                    toggleTranslationCollapse={toggleTranslationCollapse}
                    handleTranslationChange={handleTranslationChange}
                    handleArrayTranslationChange={handleArrayTranslationChange}
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
    setFormData,
    onInputChange,
    onNestedInputChange,
    onArrayInputChange,
    addArrayItem,
    removeArrayItem,
    handleAddHotelToForm,
    handleRemoveHotel,
    handleHotelChange,
    generateDayBlocks,
    hotels,
    tours,
    airports,
    handleSlugChange,
    slugError,
    handleAddFaq,
    handleRemoveFaq,
    handleFaqChange,
    translationCollapse,
    toggleTranslationCollapse,
    handleTranslationChange,
    handleArrayTranslationChange
}) {
    return (
        <>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <Card className="dark:bg-slate-900">
                        <h3 className="text-lg font-semibold dark:text-white mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="name" value="Package Name *" className="dark:text-white" />
                                    <button
                                        type="button"
                                        onClick={() => toggleTranslationCollapse('name')}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        Translations
                                        {translationCollapse.name ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                </div>
                                <TextInput
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => onInputChange('name', e.target.value)}
                                    placeholder="Enter package name..."
                                    required
                                />
                                {translationCollapse.name && (
                                    <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Note: The field above is in English. Add translations below. Leave empty to use English as fallback.
                                        </p>
                                        <TextInput
                                            label="Arabic Translation (Optional)"
                                            placeholder="Leave empty to use English"
                                            value={formData.translations.name.ar}
                                            onChange={(e) => handleTranslationChange('name', 'ar', e.target.value)}
                                        />
                                        <TextInput
                                            label="French Translation (Optional)"
                                            placeholder="Leave empty to use English"
                                            value={formData.translations.name.fr}
                                            onChange={(e) => handleTranslationChange('name', 'fr', e.target.value)}
                                        />
                                    </div>
                                )}
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
                            <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="description" value="Description" className="dark:text-white" />
                                <button
                                    type="button"
                                    onClick={() => toggleTranslationCollapse('description')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    Translations
                                    {translationCollapse.description ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                            </div>
                            <TextInput
                                id="description"
                                value={formData.description}
                                onChange={(e) => onInputChange('description', e.target.value)}
                                placeholder="Enter package description..."
                                as="textarea"
                                rows={8}
                                style={{ minHeight: '220px' }}
                            />
                            {translationCollapse.description && (
                                <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Note: The field above is in English. Add translations below. Leave empty to use English as fallback.
                                    </p>
                                    <TextInput
                                        label="Arabic Translation (Optional)"
                                        placeholder="Leave empty to use English"
                                        value={formData.translations.description.ar}
                                        onChange={(e) => handleTranslationChange('description', 'ar', e.target.value)}
                                        as="textarea"
                                        rows={3}
                                    />
                                    <TextInput
                                        label="French Translation (Optional)"
                                        placeholder="Leave empty to use English"
                                        value={formData.translations.description.fr}
                                        onChange={(e) => handleTranslationChange('description', 'fr', e.target.value)}
                                        as="textarea"
                                        rows={3}
                                    />
                                </div>
                            )}
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

            {/* Step 3: Daily Itinerary & Tours */}
            {currentStep === 3 && (
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-yellow-500 dark:to-orange-500 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="w-4 h-4 text-white dark:text-gray-900" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {formData.duration}-Day Itinerary
                            </h3>
                        </div>
                        
                        {/* Compact Regenerate Button (when duration changes) */}
                        {formData.duration > 0 && formData.dailyItinerary.length !== formData.duration && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                    Duration changed ({formData.dailyItinerary.length} → {formData.duration} days)
                                </span>
                                <CustomButton
                                    onClick={() => generateDayBlocks(formData.duration)}
                                    variant="orange"
                                    size="sm"
                                    icon={FaSyncAlt}
                                >
                                    Regenerate
                                </CustomButton>
                            </div>
                        )}
                    </div>

                    {/* Day Blocks Grid */}
                    {formData.countries.length > 0 && formData.cities.length > 0 ? (
                        <div className="space-y-4">
                            {formData.dailyItinerary.length === 0 && formData.duration > 0 && (
                                <Card className="dark:bg-slate-900 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
                                    <div className="text-center py-4">
                                        <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-3">
                                            Day blocks not generated yet for {formData.duration} days
                                        </p>
                                        <CustomButton
                                            onClick={() => generateDayBlocks(formData.duration)}
                                            variant="pinkToOrange"
                                            size="md"
                                            icon={FaPlus}
                                        >
                                            Generate {formData.duration} Day Blocks
                                        </CustomButton>
                                    </div>
                                </Card>
                            )}

                            {formData.dailyItinerary.length > 0 && (
                                <>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                                        {formData.dailyItinerary
                                            .sort((a, b) => a.day - b.day)
                                            .map((day) => (
                                            <PackageDayBlock
                                                key={day.day}
                                                day={day}
                                                dayNumber={day.day}
                                                totalDays={formData.duration}
                                                tours={tours.filter(tour => 
                                                    formData.cities.includes(tour.city)
                                                )}
                                                onChange={(updatedDay) => {
                                                    // Update the specific day in dailyItinerary
                                                    const newItinerary = formData.dailyItinerary.map(d => 
                                                        d.day === day.day ? updatedDay : d
                                                    );
                                                    
                                                    // Update tours array based on day assignments
                                                    let newTours = [...formData.tours];
                                                    
                                                    // If this day has a tour assigned
                                                    if (updatedDay.tourInfo?.tourId) {
                                                        const tourId = updatedDay.tourInfo.tourId;
                                                        
                                                        // Step 1: Remove any OLD tour that was previously on this day
                                                        newTours = newTours.filter(tour => tour.day !== day.day);
                                                        
                                                        // Step 2: Remove the NEW tour from other days (tour can only be on one day)
                                                        newTours = newTours.filter(tour => tour.tourId !== tourId);
                                                        
                                                        // Step 3: Add the new tour to the current day
                                                        newTours.push({
                                                            tourId: tourId,
                                                            day: updatedDay.day
                                                        });
                                                    } else {
                                                        // If tour was removed from this day, remove from tours array
                                                        newTours = newTours.filter(tour => tour.day !== day.day);
                                                    }
                                                    
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        dailyItinerary: newItinerary,
                                                        tours: newTours
                                                    }));
                                                }}
                                            />
                                        ))}
                                    </div>

                                </>
                            )}
                        </div>
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
                </div>
            )}

            {/* Step 4: Final Details */}
            {currentStep === 4 && (
                <div className="space-y-6">
                    {/* Includes/Excludes Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="dark:bg-slate-900">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-semibold dark:text-white">Package Includes</h3>
                                    <button
                                        type="button"
                                        onClick={() => toggleTranslationCollapse('includes')}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        Translations
                                        {translationCollapse.includes ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                </div>
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
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center gap-2">
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
                                        {translationCollapse.includes && (
                                            <div className="ml-4 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    Translations for item #{index + 1}
                                                </p>
                                                <TextInput
                                                    label="Arabic Translation (Optional)"
                                                    placeholder="Leave empty to use English"
                                                    value={formData.translations.includes[index]?.ar || ''}
                                                    onChange={(e) => handleArrayTranslationChange('includes', index, 'ar', e.target.value)}
                                                    size="sm"
                                                />
                                                <TextInput
                                                    label="French Translation (Optional)"
                                                    placeholder="Leave empty to use English"
                                                    value={formData.translations.includes[index]?.fr || ''}
                                                    onChange={(e) => handleArrayTranslationChange('includes', index, 'fr', e.target.value)}
                                                    size="sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="dark:bg-slate-900">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-semibold dark:text-white">Package Excludes</h3>
                                    <button
                                        type="button"
                                        onClick={() => toggleTranslationCollapse('excludes')}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        Translations
                                        {translationCollapse.excludes ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                </div>
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
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center gap-2">
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
                                        {translationCollapse.excludes && (
                                            <div className="ml-4 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    Translations for item #{index + 1}
                                                </p>
                                                <TextInput
                                                    label="Arabic Translation (Optional)"
                                                    placeholder="Leave empty to use English"
                                                    value={formData.translations.excludes[index]?.ar || ''}
                                                    onChange={(e) => handleArrayTranslationChange('excludes', index, 'ar', e.target.value)}
                                                    size="sm"
                                                />
                                                <TextInput
                                                    label="French Translation (Optional)"
                                                    placeholder="Leave empty to use English"
                                                    value={formData.translations.excludes[index]?.fr || ''}
                                                    onChange={(e) => handleArrayTranslationChange('excludes', index, 'fr', e.target.value)}
                                                    size="sm"
                                                />
                                            </div>
                                        )}
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
