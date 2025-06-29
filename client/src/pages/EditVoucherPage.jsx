import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, TextInput, Select, Label, Checkbox, Modal, Alert, Textarea } from 'flowbite-react';
import CustomButton from '../components/CustomButton';
import RahalatekLoader from '../components/RahalatekLoader';
import axios from 'axios';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../components/SearchableSelect';
import { HiDuplicate } from 'react-icons/hi';

// Helper function to get profit color classes based on value
const getProfitColorClass = (profit) => {
  if (profit < 0) {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-green-600 dark:text-green-400';
};

export default function EditVoucherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    nationality: '',
    phoneNumber: '',
    officeName: '',
    arrivalDate: '',
    departureDate: '',
    capital: '',
    totalAmount: 0,
    currency: 'USD',
    hotels: [],
    transfers: [],
    trips: [],
    flights: [],
    note: '',
    advancedPayment: false,
    advancedAmount: 0,
    remainingAmount: 0
  });
  
  // Custom hotel input state
  const [useCustomHotel, setUseCustomHotel] = useState([]);
  
  // Custom tour input state
  const [useCustomTour, setUseCustomTour] = useState([]);
  
  // Date display formatting
  const [displayArrivalDate, setDisplayArrivalDate] = useState('');
  const [displayDepartureDate, setDisplayDepartureDate] = useState('');
  
  // Hotels, Cities, and Tours data
  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Duplicate voucher functionality
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedVoucherToDuplicate, setSelectedVoucherToDuplicate] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  
  // Date formatting functions
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const parseDisplayDate = (displayDate) => {
    if (!displayDate || !displayDate.includes('/')) return '';
    const [day, month, year] = displayDate.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  // Update display dates when ISO dates change
  useEffect(() => {
    if (formData.arrivalDate) {
      setDisplayArrivalDate(formatDateForDisplay(formData.arrivalDate));
    }
    if (formData.departureDate) {
      setDisplayDepartureDate(formatDateForDisplay(formData.departureDate));
    }
  }, [formData.arrivalDate, formData.departureDate]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch voucher, hotels, and tours in parallel
        const [voucherResponse, hotelsResponse, toursResponse] = await Promise.all([
          axios.get(`/api/vouchers/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/hotels'),
          axios.get('/api/tours')
        ]);
        
        const voucherData = voucherResponse.data.data;
        
        // Check if the user has permission to edit this voucher
        const user = JSON.parse(localStorage.getItem('user') || '{}');
            const isAdmin = user.isAdmin || false;
    const isAccountant = user.isAccountant || false;
    const currentUserId = user.id || null;
        
        // If not admin and not the creator, redirect with error
        if (!isAdmin && !isAccountant && (!voucherData.createdBy || voucherData.createdBy._id !== currentUserId)) {
          toast.error('You do not have permission to edit this voucher.', {
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
          navigate('/vouchers');
          return;
        }
        
        setVoucher(voucherData);
        
        // Set form data from voucher
        setFormData({
          clientName: voucherData.clientName || '',
          nationality: voucherData.nationality || '',
          phoneNumber: voucherData.phoneNumber || '',
          officeName: voucherData.officeName || '',
          arrivalDate: voucherData.arrivalDate ? new Date(voucherData.arrivalDate).toISOString().split('T')[0] : '',
          departureDate: voucherData.departureDate ? new Date(voucherData.departureDate).toISOString().split('T')[0] : '',
          capital: voucherData.capital || '',
          totalAmount: voucherData.totalAmount || 0,
          currency: voucherData.currency || 'USD',
          hotels: voucherData.hotels.map(hotel => ({
            ...hotel,
            checkIn: hotel.checkIn ? new Date(hotel.checkIn).toISOString().split('T')[0] : '',
            checkOut: hotel.checkOut ? new Date(hotel.checkOut).toISOString().split('T')[0] : ''
          })),
          transfers: voucherData.transfers.map(transfer => ({
            ...transfer,
            date: transfer.date ? new Date(transfer.date).toISOString().split('T')[0] : ''
          })),
          trips: voucherData.trips || [],
          flights: voucherData.flights ? voucherData.flights.map(flight => ({
            ...flight,
            departureDate: flight.departureDate ? new Date(flight.departureDate).toISOString().split('T')[0] : '',
            arrivalDate: flight.arrivalDate ? new Date(flight.arrivalDate).toISOString().split('T')[0] : ''
          })) : [],
          note: voucherData.note || '',
          advancedPayment: voucherData.advancedPayment || false,
          advancedAmount: voucherData.advancedAmount || 0,
          remainingAmount: voucherData.remainingAmount || 0
        });
        
        setUseCustomHotel(voucherData.hotels.map(hotel => {
          const hotelExists = hotelsResponse.data.some(h => h.name === hotel.hotelName);
          return !hotelExists && hotel.hotelName !== '';
        }));
        
        setUseCustomTour(voucherData.trips.map(trip => {
          const tourExists = toursResponse.data.some(t => t.name === trip.tourName);
          return !tourExists && trip.tourName !== '';
        }));
        
        setHotels(hotelsResponse.data);
        setTours(toursResponse.data);
        

        const uniqueCities = [...new Set([
          ...hotelsResponse.data.map(h => h.city),
          ...toursResponse.data.map(t => t.city)
        ])];
        
        setCities(uniqueCities);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load voucher data. Please try again.', {
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
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Hotel handlers
  const handleHotelChange = (index, field, value) => {
    const updatedHotels = [...formData.hotels];
    updatedHotels[index][field] = value;
    
    // If selecting a hotel name, populate the city
    if (field === 'hotelName' && !useCustomHotel[index]) {
      const selectedHotel = hotels.find(h => h.name === value);
      if (selectedHotel) {
        updatedHotels[index].city = selectedHotel.city;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      hotels: updatedHotels
    }));
  };
  
  const toggleCustomHotel = (index) => {
    const newUseCustom = [...useCustomHotel];
    newUseCustom[index] = !newUseCustom[index];
    setUseCustomHotel(newUseCustom);
    
    if (!newUseCustom[index]) {
      const updatedHotels = [...formData.hotels];
      updatedHotels[index].hotelName = '';
      setFormData(prev => ({
        ...prev,
        hotels: updatedHotels
      }));
    }
  };
  
  const handleAddHotel = () => {
    setFormData(prev => ({
      ...prev,
      hotels: [
        ...prev.hotels,
        { 
          city: '', 
          hotelName: '', 
          roomType: '', 
          nights: 1, 
          checkIn: '', 
          checkOut: '', 
          pax: 1, 
          confirmationNumber: '' 
        }
      ]
    }));
    
    setUseCustomHotel(prev => [...prev, false]);
  };
  
  const handleRemoveHotel = (index) => {
    const updatedHotels = [...formData.hotels];
    updatedHotels.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      hotels: updatedHotels
    }));
    
    // Remove entry from useCustomHotel array
    const updatedUseCustom = [...useCustomHotel];
    updatedUseCustom.splice(index, 1);
    setUseCustomHotel(updatedUseCustom);
  };

  const moveHotelUp = (index) => {
    if (index === 0) return;
    
    const updatedHotels = [...formData.hotels];
    const updatedCustomStates = [...useCustomHotel];
    
    // Store the original dates before swapping
    const currentDates = {
      checkIn: updatedHotels[index].checkIn,
      checkOut: updatedHotels[index].checkOut
    };
    const previousDates = {
      checkIn: updatedHotels[index - 1].checkIn,
      checkOut: updatedHotels[index - 1].checkOut
    };
    
    // Swap all hotel data
    [updatedHotels[index], updatedHotels[index - 1]] = [updatedHotels[index - 1], updatedHotels[index]];
    [updatedCustomStates[index], updatedCustomStates[index - 1]] = [updatedCustomStates[index - 1], updatedCustomStates[index]];
    
    // Restore original dates to their positions
    updatedHotels[index].checkIn = currentDates.checkIn;
    updatedHotels[index].checkOut = currentDates.checkOut;
    updatedHotels[index - 1].checkIn = previousDates.checkIn;
    updatedHotels[index - 1].checkOut = previousDates.checkOut;
    
    // Recalculate nights for both affected hotels
    [index, index - 1].forEach(hotelIndex => {
      if (updatedHotels[hotelIndex].checkIn && updatedHotels[hotelIndex].checkOut) {
        const checkInDate = new Date(updatedHotels[hotelIndex].checkIn);
        const checkOutDate = new Date(updatedHotels[hotelIndex].checkOut);
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        updatedHotels[hotelIndex].nights = Math.max(1, diffDays);
      }
    });
    
    setFormData(prev => ({
      ...prev,
      hotels: updatedHotels
    }));
    
    setUseCustomHotel(updatedCustomStates);
  };

  const moveHotelDown = (index) => {
    if (index === formData.hotels.length - 1) return;
    
    const updatedHotels = [...formData.hotels];
    const updatedCustomStates = [...useCustomHotel];
    
    // Store the original dates before swapping
    const currentDates = {
      checkIn: updatedHotels[index].checkIn,
      checkOut: updatedHotels[index].checkOut
    };
    const nextDates = {
      checkIn: updatedHotels[index + 1].checkIn,
      checkOut: updatedHotels[index + 1].checkOut
    };
    
    // Swap all hotel data
    [updatedHotels[index], updatedHotels[index + 1]] = [updatedHotels[index + 1], updatedHotels[index]];
    [updatedCustomStates[index], updatedCustomStates[index + 1]] = [updatedCustomStates[index + 1], updatedCustomStates[index]];
    
    // Restore original dates to their positions
    updatedHotels[index].checkIn = currentDates.checkIn;
    updatedHotels[index].checkOut = currentDates.checkOut;
    updatedHotels[index + 1].checkIn = nextDates.checkIn;
    updatedHotels[index + 1].checkOut = nextDates.checkOut;
    
    // Recalculate nights for both affected hotels
    [index, index + 1].forEach(hotelIndex => {
      if (updatedHotels[hotelIndex].checkIn && updatedHotels[hotelIndex].checkOut) {
        const checkInDate = new Date(updatedHotels[hotelIndex].checkIn);
        const checkOutDate = new Date(updatedHotels[hotelIndex].checkOut);
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        updatedHotels[hotelIndex].nights = Math.max(1, diffDays);
      }
    });
    
    setFormData(prev => ({
      ...prev,
      hotels: updatedHotels
    }));
    
    setUseCustomHotel(updatedCustomStates);
  };
  
  // Transfer handlers
  const handleTransferChange = (index, field, value) => {
    const updatedTransfers = [...formData.transfers];
    updatedTransfers[index][field] = value;
    setFormData(prev => ({
      ...prev,
      transfers: updatedTransfers
    }));
  };
  
  const handleAddTransfer = () => {
    setFormData(prev => ({
      ...prev,
      transfers: [
        ...prev.transfers,
        { 
          type: 'ARV', 
          date: '', 
          time: '',
          flightNumber: '',
          city: '',
          from: '', 
          to: '', 
          pax: 1, 
          vehicleType: 'VITO' 
        }
      ]
    }));
  };
  
  const handleRemoveTransfer = (index) => {
    const updatedTransfers = [...formData.transfers];
    updatedTransfers.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      transfers: updatedTransfers
    }));
  };

  const moveTransferUp = (index) => {
    if (index === 0) return;
    
    const updatedTransfers = [...formData.transfers];
    
    // Store the original dates before swapping
    const currentDate = updatedTransfers[index].date;
    const previousDate = updatedTransfers[index - 1].date;
    
    // Swap all transfer data
    [updatedTransfers[index], updatedTransfers[index - 1]] = [updatedTransfers[index - 1], updatedTransfers[index]];
    
    // Restore original dates to their positions
    updatedTransfers[index].date = currentDate;
    updatedTransfers[index - 1].date = previousDate;
    
    setFormData(prev => ({
      ...prev,
      transfers: updatedTransfers
    }));
  };

  const moveTransferDown = (index) => {
    if (index === formData.transfers.length - 1) return;
    
    const updatedTransfers = [...formData.transfers];
    
    // Store the original dates before swapping
    const currentDate = updatedTransfers[index].date;
    const nextDate = updatedTransfers[index + 1].date;
    
    // Swap all transfer data
    [updatedTransfers[index], updatedTransfers[index + 1]] = [updatedTransfers[index + 1], updatedTransfers[index]];
    
    // Restore original dates to their positions
    updatedTransfers[index].date = currentDate;
    updatedTransfers[index + 1].date = nextDate;
    
    setFormData(prev => ({
      ...prev,
      transfers: updatedTransfers
    }));
  };
  
  // Trip handlers
  const handleTripChange = (index, field, value) => {
    const updatedTrips = [...formData.trips];
    updatedTrips[index][field] = value;
    
    // If selecting a tour name and not in custom mode, populate the city and type
    if (field === 'tourName' && !useCustomTour[index]) {
      const selectedTour = tours.find(t => t.name === value);
      if (selectedTour) {
        updatedTrips[index].city = selectedTour.city;
        updatedTrips[index].type = selectedTour.tourType;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      trips: updatedTrips
    }));
  };
  
  const handleAddTrip = () => {
    setFormData(prev => ({
      ...prev,
      trips: [
        ...prev.trips,
        { 
          city: '', 
          tourName: '', 
          count: 1, 
          type: '', 
          pax: 1 
        }
      ]
    }));
    
    setUseCustomTour(prev => [...prev, false]);
  };
  
  const handleRemoveTrip = (index) => {
    const updatedTrips = [...formData.trips];
    updatedTrips.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      trips: updatedTrips
    }));
    
    const updatedCustomTours = [...useCustomTour];
    updatedCustomTours.splice(index, 1);
    setUseCustomTour(updatedCustomTours);
  };

  const moveTripUp = (index) => {
    if (index === 0) return;
    
    const updatedTrips = [...formData.trips];
    const updatedCustomStates = [...useCustomTour];
    
    // Swap all trip data (no date preservation needed)
    [updatedTrips[index], updatedTrips[index - 1]] = [updatedTrips[index - 1], updatedTrips[index]];
    [updatedCustomStates[index], updatedCustomStates[index - 1]] = [updatedCustomStates[index - 1], updatedCustomStates[index]];
    
    setFormData(prev => ({
      ...prev,
      trips: updatedTrips
    }));
    
    setUseCustomTour(updatedCustomStates);
  };

  const moveTripDown = (index) => {
    if (index === formData.trips.length - 1) return;
    
    const updatedTrips = [...formData.trips];
    const updatedCustomStates = [...useCustomTour];
    
    // Swap all trip data (no date preservation needed)
    [updatedTrips[index], updatedTrips[index + 1]] = [updatedTrips[index + 1], updatedTrips[index]];
    [updatedCustomStates[index], updatedCustomStates[index + 1]] = [updatedCustomStates[index + 1], updatedCustomStates[index]];
    
    setFormData(prev => ({
      ...prev,
      trips: updatedTrips
    }));
    
    setUseCustomTour(updatedCustomStates);
  };

  // Toggle custom tour input
  const toggleCustomTour = (index) => {
    const newUseCustom = [...useCustomTour];
    newUseCustom[index] = !newUseCustom[index];
    setUseCustomTour(newUseCustom);
    
    if (!newUseCustom[index]) {
      const updatedTrips = [...formData.trips];
      updatedTrips[index].tourName = '';
      updatedTrips[index].type = '';
      setFormData(prev => ({
        ...prev,
        trips: updatedTrips
      }));
    }
  };

  // Flight handlers
  const handleAddFlight = () => {
    setFormData(prev => ({
      ...prev,
      flights: [...prev.flights, {
        companyName: '',
        from: '',
        to: '',
        flightNumber: '',
        departureDate: '',
        arrivalDate: '',
        luggage: ''
      }]
    }));
  };

  const handleRemoveFlight = (index) => {
    const updatedFlights = [...formData.flights];
    updatedFlights.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      flights: updatedFlights
    }));
  };

  const moveFlightUp = (index) => {
    if (index === 0) return;
    
    const updatedFlights = [...formData.flights];
    
    // Store the original dates before swapping
    const currentDates = {
      departureDate: updatedFlights[index].departureDate,
      arrivalDate: updatedFlights[index].arrivalDate
    };
    const previousDates = {
      departureDate: updatedFlights[index - 1].departureDate,
      arrivalDate: updatedFlights[index - 1].arrivalDate
    };
    
    // Swap all flight data
    [updatedFlights[index], updatedFlights[index - 1]] = [updatedFlights[index - 1], updatedFlights[index]];
    
    // Restore original dates to their positions
    updatedFlights[index].departureDate = currentDates.departureDate;
    updatedFlights[index].arrivalDate = currentDates.arrivalDate;
    updatedFlights[index - 1].departureDate = previousDates.departureDate;
    updatedFlights[index - 1].arrivalDate = previousDates.arrivalDate;
    
    setFormData(prev => ({
      ...prev,
      flights: updatedFlights
    }));
  };

  const moveFlightDown = (index) => {
    if (index === formData.flights.length - 1) return;
    
    const updatedFlights = [...formData.flights];
    
    // Store the original dates before swapping
    const currentDates = {
      departureDate: updatedFlights[index].departureDate,
      arrivalDate: updatedFlights[index].arrivalDate
    };
    const nextDates = {
      departureDate: updatedFlights[index + 1].departureDate,
      arrivalDate: updatedFlights[index + 1].arrivalDate
    };
    
    // Swap all flight data
    [updatedFlights[index], updatedFlights[index + 1]] = [updatedFlights[index + 1], updatedFlights[index]];
    
    // Restore original dates to their positions
    updatedFlights[index].departureDate = currentDates.departureDate;
    updatedFlights[index].arrivalDate = currentDates.arrivalDate;
    updatedFlights[index + 1].departureDate = nextDates.departureDate;
    updatedFlights[index + 1].arrivalDate = nextDates.arrivalDate;
    
    setFormData(prev => ({
      ...prev,
      flights: updatedFlights
    }));
  };

  const handleFlightChange = (index, field, value) => {
    const updatedFlights = [...formData.flights];
    updatedFlights[index][field] = value;
    setFormData(prev => ({
      ...prev,
      flights: updatedFlights
    }));
  };

  const formatFlightDateForDisplay = (index, dateType) => {
    const date = formData.flights[index]?.[dateType];
    return date ? formatDateForDisplay(date) : '';
  };

  const updateFlightDate = (index, dateType, isoDate) => {
    const updatedFlights = [...formData.flights];
    updatedFlights[index][dateType] = isoDate;
    setFormData(prev => ({
      ...prev,
      flights: updatedFlights
    }));
  };
  
  // Helper function to format date for a specific hotel index
  const formatHotelDateForDisplay = (index, dateType) => {
    const date = formData.hotels[index][dateType];
    return formatDateForDisplay(date);
  };

  // Helper function to update hotel date
  const updateHotelDate = (index, dateType, isoDate) => {
    const updatedHotels = [...formData.hotels];
    updatedHotels[index][dateType] = isoDate;
    
    // If check-in date is later than check-out, update check-out
    if (dateType === 'checkIn' && updatedHotels[index].checkOut && updatedHotels[index].checkOut < isoDate) {
      updatedHotels[index].checkOut = isoDate;
    }
    
    if (updatedHotels[index].checkIn && updatedHotels[index].checkOut) {
      const checkInDate = new Date(updatedHotels[index].checkIn);
      const checkOutDate = new Date(updatedHotels[index].checkOut);
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      updatedHotels[index].nights = Math.max(1, diffDays);
    }
    
    setFormData(prev => ({
      ...prev,
      hotels: updatedHotels
    }));
  };

  // Helper function to format date for a specific transfer index
  const formatTransferDateForDisplay = (index) => {
    const date = formData.transfers[index].date;
    return formatDateForDisplay(date);
  };

  // Helper function to update transfer date
  const updateTransferDate = (index, isoDate) => {
    const updatedTransfers = [...formData.transfers];
    updatedTransfers[index].date = isoDate;
    
    setFormData(prev => ({
      ...prev,
      transfers: updatedTransfers
    }));
  };
  
  // Handle advanced payment checkbox
  const handleAdvancedPaymentChange = (e) => {
    const isChecked = e.target.checked;
    setFormData(prevData => ({
      ...prevData,
      advancedPayment: isChecked,
      // Reset advanced and remaining amounts when unchecking
      ...(isChecked ? {} : { advancedAmount: 0, remainingAmount: 0 })
    }));
  };

  // Handle advanced amount changes and calculate remaining amount
  const handleAdvancedAmountChange = (e) => {
    const advancedAmount = parseFloat(e.target.value) || 0;
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const remainingAmount = Math.max(0, totalAmount - advancedAmount);
    
    setFormData(prevData => ({
      ...prevData,
      advancedAmount,
      remainingAmount
    }));
  };

  // Recalculate remaining amount when total changes
  useEffect(() => {
    if (formData.advancedPayment) {
      const totalAmount = parseFloat(formData.totalAmount) || 0;
      const advancedAmount = parseFloat(formData.advancedAmount) || 0;
      const remainingAmount = Math.max(0, totalAmount - advancedAmount);
      
      setFormData(prevData => ({
        ...prevData,
        remainingAmount
      }));
    }
  }, [formData.totalAmount, formData.advancedAmount, formData.advancedPayment]);
  
  // Save voucher
  const handleSave = async () => {
    // Validate form
    if (!formData.clientName || !formData.nationality) {
      toast.error('Please fill in all required fields', {
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
      return;
    }
    
    if (!formData.arrivalDate || !formData.departureDate) {
      toast.error('Please select arrival and departure dates', {
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
      return;
    }
    
    try {
      setSaving(true);
      
      const token = localStorage.getItem('token');
      
      const formattedTrips = formData.trips.map(trip => ({
        city: trip.city,
        tourName: trip.tourName,
        count: Number(trip.count),
        type: trip.type,
        pax: Number(trip.pax)
      }));
      
      const payload = {
        voucherNumber: voucher.voucherNumber,
        clientName: formData.clientName,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber,
        officeName: formData.officeName,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        capital: formData.capital,
        totalAmount: Number(formData.totalAmount),
        currency: formData.currency,
        hotels: formData.hotels,
        transfers: formData.transfers,
        trips: formattedTrips,
        flights: formData.flights,
        note: formData.note,
        advancedPayment: formData.advancedPayment,
        advancedAmount: formData.advancedPayment ? Number(formData.advancedAmount) : 0,
        remainingAmount: formData.advancedPayment ? Number(formData.remainingAmount) : 0
      };
      
      await axios.put(`/api/vouchers/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success(`Voucher #${voucher.voucherNumber} for ${formData.clientName} has been updated successfully!`, {
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
      
      // Navigate back to voucher details
      navigate(`/vouchers/${id}`);
    } catch (err) {
      console.error('Error updating voucher:', err);
      toast.error(err.response?.data?.message || 'Failed to update voucher. Please try again.', {
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
      setSaving(false);
    }
  };
  
  // Function to open duplicate modal
  const openDuplicateModal = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out the current voucher from available vouchers
      const filteredVouchers = response.data.data.filter(v => v._id !== id);
      setAvailableVouchers(filteredVouchers);
      setDuplicateModalOpen(true);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      toast.error('Failed to load vouchers for duplication.');
    } finally {
      setLoading(false);
    }
  };

  // Function to close duplicate modal
  const closeDuplicateModal = () => {
    setDuplicateModalOpen(false);
    setSelectedVoucherToDuplicate('');
  };

  // Function to handle duplicating a voucher
  const handleDuplicateVoucher = async () => {
    if (!selectedVoucherToDuplicate) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/vouchers/${selectedVoucherToDuplicate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const voucherToDuplicate = response.data.data;
      
      // Process hotel dates to ensure they're in the correct format
      const processedHotels = voucherToDuplicate.hotels.map(hotel => ({
        ...hotel,
        checkIn: hotel.checkIn ? new Date(hotel.checkIn).toISOString().split('T')[0] : '',
        checkOut: hotel.checkOut ? new Date(hotel.checkOut).toISOString().split('T')[0] : ''
      }));
      
      // Process transfer dates
      const processedTransfers = voucherToDuplicate.transfers.map(transfer => ({
        ...transfer,
        date: transfer.date ? new Date(transfer.date).toISOString().split('T')[0] : ''
      }));
      
      // Set form data from the duplicated voucher
      setFormData({
        clientName: voucherToDuplicate.clientName,
        nationality: voucherToDuplicate.nationality,
        phoneNumber: voucherToDuplicate.phoneNumber || '',
        officeName: voucherToDuplicate.officeName || '',
        arrivalDate: voucherToDuplicate.arrivalDate ? new Date(voucherToDuplicate.arrivalDate).toISOString().split('T')[0] : '',
        departureDate: voucherToDuplicate.departureDate ? new Date(voucherToDuplicate.departureDate).toISOString().split('T')[0] : '',
        capital: voucherToDuplicate.capital || '',
        hotels: processedHotels,
        transfers: processedTransfers,
        trips: voucherToDuplicate.trips || [],
        flights: voucherToDuplicate.flights ? voucherToDuplicate.flights.map(flight => ({
          ...flight,
          departureDate: flight.departureDate ? new Date(flight.departureDate).toISOString().split('T')[0] : '',
          arrivalDate: flight.arrivalDate ? new Date(flight.arrivalDate).toISOString().split('T')[0] : ''
        })) : [],
        note: voucherToDuplicate.note || '',
        totalAmount: voucherToDuplicate.totalAmount || 0,
        currency: voucherToDuplicate.currency || 'USD',
        advancedPayment: voucherToDuplicate.advancedPayment || false,
        advancedAmount: voucherToDuplicate.advancedAmount || 0,
        remainingAmount: voucherToDuplicate.remainingAmount || 0
      });
      
      // Update display dates
      if (voucherToDuplicate.arrivalDate) {
        setDisplayArrivalDate(formatDateForDisplay(new Date(voucherToDuplicate.arrivalDate).toISOString()));
      }
      if (voucherToDuplicate.departureDate) {
        setDisplayDepartureDate(formatDateForDisplay(new Date(voucherToDuplicate.departureDate).toISOString()));
      }
      
      // Update custom hotel states
      setUseCustomHotel(voucherToDuplicate.hotels.map(hotel => {
        const hotelExists = hotels.some(h => h.name === hotel.hotelName);
        return !hotelExists && hotel.hotelName !== '';
      }));
      
      // Update custom tour states
      setUseCustomTour(voucherToDuplicate.trips.map(trip => {
        const tourExists = tours.some(t => t.name === trip.tourName);
        return !tourExists && trip.tourName !== '';
      }));
      
      toast.success('Voucher data duplicated successfully! Make changes as needed and save.', {
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
      
      closeDuplicateModal();
    } catch (err) {
      console.error('Error duplicating voucher:', err);
      toast.error('Failed to duplicate voucher. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RahalatekLoader size="lg" />
      </div>
    );
  }
  
  if (!voucher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-8 text-red-500">Voucher not found. Please check the URL and try again.</div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to={`/vouchers/${id}`}
          className="flex items-center text-blue-600 hover:underline dark:text-blue-500"
        >
          <FaArrowLeft className="mr-2" />
          Back to Voucher
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Voucher #{voucher?.voucherNumber}
        </h1>
        
        <CustomButton
          variant="gray"
          onClick={openDuplicateModal}
          title="Import data from another voucher"
          icon={HiDuplicate}
        >
          Import Data
        </CustomButton>
      </div>
      
      <Card className="mb-8 dark:bg-slate-900">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Client Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="clientName" value="Client Name" className="mb-2 block" />
            <TextInput
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="nationality" value="Nationality" className="mb-2 block" />
            <TextInput
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phoneNumber" value="Phone Number" className="mb-2 block" />
            <TextInput
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1 123-456-7890"
            />
          </div>
          
          <div>
            <Label htmlFor="officeName" value="Office Name" className="mb-2 block" />
            <TextInput
              id="officeName"
              name="officeName"
              value={formData.officeName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="arrivalDate" value="Arrival Date" className="mb-2 block" />
            <div className="relative">
              <TextInput
                id="displayArrivalDate"
                type="text"
                value={displayArrivalDate}
                onChange={(e) => {
                  const newDisplayDate = e.target.value;
                  setDisplayArrivalDate(newDisplayDate);
                  
                  // Only update the ISO date if we have a valid format
                  if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                    const newIsoDate = parseDisplayDate(newDisplayDate);
                    if (newIsoDate) {
                      setFormData({
                        ...formData,
                        arrivalDate: newIsoDate
                      });
                      
                      // If departure date is before the new arrival date, update it
                      if (formData.departureDate && formData.departureDate < newIsoDate) {
                        setFormData(prev => ({
                          ...prev,
                          departureDate: newIsoDate
                        }));
                        setDisplayDepartureDate(formatDateForDisplay(newIsoDate));
                      }
                    }
                  }
                }}
                placeholder="DD/MM/YYYY"
                required
              />
              <input 
                type="date" 
                className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                value={formData.arrivalDate}
                onChange={(e) => {
                  const newIsoDate = e.target.value;
                  setFormData({
                    ...formData,
                    arrivalDate: newIsoDate
                  });
                  setDisplayArrivalDate(formatDateForDisplay(newIsoDate));
                  
                  // If departure date is before the new arrival date, update it
                  if (formData.departureDate && formData.departureDate < newIsoDate) {
                    setFormData(prev => ({
                      ...prev,
                      departureDate: newIsoDate
                    }));
                    setDisplayDepartureDate(formatDateForDisplay(newIsoDate));
                  }
                }}
              />
              <span className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="departureDate" value="Departure Date" className="mb-2 block" />
            <div className="relative">
              <TextInput
                id="displayDepartureDate"
                type="text"
                value={displayDepartureDate}
                onChange={(e) => {
                  const newDisplayDate = e.target.value;
                  setDisplayDepartureDate(newDisplayDate);
                  
                  // Only update the ISO date if we have a valid format
                  if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                    const newIsoDate = parseDisplayDate(newDisplayDate);
                    if (newIsoDate && (!formData.arrivalDate || newIsoDate >= formData.arrivalDate)) {
                      setFormData({
                        ...formData,
                        departureDate: newIsoDate
                      });
                    }
                  }
                }}
                placeholder="DD/MM/YYYY"
                required
              />
              <input 
                type="date" 
                className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                value={formData.departureDate}
                min={formData.arrivalDate || ''}
                onChange={(e) => {
                  const newIsoDate = e.target.value;
                  setFormData({
                    ...formData,
                    departureDate: newIsoDate
                  });
                  setDisplayDepartureDate(formatDateForDisplay(newIsoDate));
                }}
              />
              <span className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="capital" value="Capital (Preview Only)" className="mb-2 block" />
            <div className="flex">
              <TextInput
                id="capital"
                name="capital"
                value={formData.capital}
                onChange={handleInputChange}
                placeholder="This will only show in preview"
                className="flex-grow"
              />
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md dark:bg-slate-600 dark:text-gray-400 dark:border-slate-600">
                {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="totalAmount" value="Total Amount" className="mb-2 block" />
            <div className="flex">
              <TextInput
                id="totalAmount"
                name="totalAmount"
                type="number"
                value={formData.totalAmount}
                onChange={handleInputChange}
                className="flex-grow"
                required
              />
              <Select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="ml-2 w-24"
              >
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="TRY">₺ TRY</option>
              </Select>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <Checkbox
                id="advancedPayment"
                checked={formData.advancedPayment}
                onChange={handleAdvancedPaymentChange}
              />
              <Label htmlFor="advancedPayment" value="Advanced Payment" className="ml-2" />
            </div>
            
            {formData.advancedPayment && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex">
                    <TextInput
                      id="advancedAmount"
                      name="advancedAmount"
                      type="number"
                      placeholder="Advanced Amount"
                      value={formData.advancedAmount}
                      onChange={(e) => {
                        handleInputChange(e);
                        handleAdvancedAmountChange(e);
                      }}
                      required={formData.advancedPayment}
                      className="flex-grow"
                    />
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md dark:bg-slate-600 dark:text-gray-400 dark:border-slate-600">
                      {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <TextInput
                      id="remainingAmount"
                      name="remainingAmount"
                      type="number"
                      placeholder="Remaining Amount"
                      value={formData.remainingAmount}
                      readOnly
                      disabled
                      className="flex-grow"
                    />
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md dark:bg-slate-600 dark:text-gray-400 dark:border-slate-600">
                      {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profit Display */}
          <div>
            <Label value="Profit" className="mb-2 block" />
            <div className="flex">
              <div className={`flex-grow px-3 py-2 text-sm font-medium rounded-l-lg border bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 ${getProfitColorClass((Number(formData.totalAmount) || 0) - (Number(formData.capital) || 0))}`}>
                {((Number(formData.totalAmount) || 0) - (Number(formData.capital) || 0)).toFixed(2)}
              </div>
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md dark:bg-slate-600 dark:text-gray-400 dark:border-slate-600">
                {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
              </span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="note" value="Note" className="mb-2 block" />
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>
        </div>
        
        {/* Hotels Section */}
        <div className="mt-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold dark:text-white">Hotels</h3>
                              <CustomButton size="sm" onClick={handleAddHotel} variant="pinkToOrange">+ Add Hotel</CustomButton>
          </div>
          
          {formData.hotels.map((hotel, index) => (
            <div key={`hotel-${index}`} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium dark:text-white">Hotel {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  {formData.hotels.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveHotelUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900'
                        }`}
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveHotelDown(index)}
                        disabled={index === formData.hotels.length - 1}
                        className={`p-1 rounded ${index === formData.hotels.length - 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900'
                        }`}
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <CustomButton 
                        variant="red"
                        size="xs"
                        onClick={() => handleRemoveHotel(index)}
                      >
                        Remove
                      </CustomButton>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label value="City" className="mb-2 block" />
                  <Select 
                    value={hotel.city} 
                    onChange={(e) => handleHotelChange(index, 'city', e.target.value)}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label value="Hotel Name" className="block" />
                    <div className="flex items-center">
                      <Checkbox 
                        id={`customHotel-${index}`}
                        checked={useCustomHotel[index]}
                        onChange={() => toggleCustomHotel(index)}
                      />
                      <Label htmlFor={`customHotel-${index}`} value="Custom Hotel" className="ml-2 text-sm" />
                    </div>
                  </div>
                  
                  {useCustomHotel[index] ? (
                    <TextInput
                      value={hotel.hotelName}
                      onChange={(e) => handleHotelChange(index, 'hotelName', e.target.value)}
                      placeholder="Enter hotel name"
                    />
                  ) : (
                    <SearchableSelect
                      id={`hotelSelect-${index}`}
                      value={hotel.hotelName}
                      onChange={(e) => handleHotelChange(index, 'hotelName', e.target.value)}
                      options={hotels
                        .filter(h => !hotel.city || h.city === hotel.city)
                        .map(h => ({
                          value: h.name,
                          label: h.stars ? `${h.name} (${h.stars}★) - ${h.city}` : h.name
                        }))}
                      placeholder="Search for a hotel..."
                    />
                  )}
                </div>
                
                <div>
                  <Label value="Room Type" className="mb-2 block" />
                  <TextInput
                    value={hotel.roomType}
                    onChange={(e) => handleHotelChange(index, 'roomType', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label value="Nights" className="mb-2 block" />
                  <TextInput
                    type="number"
                    value={hotel.nights}
                    onChange={(e) => handleHotelChange(index, 'nights', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label value="Check In" className="mb-2 block" />
                  <div className="relative">
                    <TextInput
                      type="text"
                      value={formatHotelDateForDisplay(index, 'checkIn')}
                      onChange={(e) => {
                        const newDisplayDate = e.target.value;
                        // Only update if valid format
                        if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                          const newIsoDate = parseDisplayDate(newDisplayDate);
                          if (newIsoDate) {
                            updateHotelDate(index, 'checkIn', newIsoDate);
                          }
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                    />
                    <input 
                      type="date" 
                      className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                      value={formData.hotels[index].checkIn}
                      onChange={(e) => updateHotelDate(index, 'checkIn', e.target.value)}
                    />
                    <span className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label value="Check Out" className="mb-2 block" />
                  <div className="relative">
                    <TextInput
                      type="text"
                      value={formatHotelDateForDisplay(index, 'checkOut')}
                      onChange={(e) => {
                        const newDisplayDate = e.target.value;
                        // Only update if valid format and after check-in
                        if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                          const newIsoDate = parseDisplayDate(newDisplayDate);
                          if (newIsoDate && (!formData.hotels[index].checkIn || newIsoDate >= formData.hotels[index].checkIn)) {
                            updateHotelDate(index, 'checkOut', newIsoDate);
                          }
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                    />
                    <input 
                      type="date" 
                      className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                      value={formData.hotels[index].checkOut}
                      min={formData.hotels[index].checkIn}
                      onChange={(e) => updateHotelDate(index, 'checkOut', e.target.value)}
                    />
                    <span className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label value="PAX" className="mb-2 block" />
                  <TextInput
                    type="number"
                    value={hotel.pax}
                    onChange={(e) => handleHotelChange(index, 'pax', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label value="Confirmation Number" className="mb-2 block" />
                  <TextInput
                    value={hotel.confirmationNumber}
                    onChange={(e) => handleHotelChange(index, 'confirmationNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Transfers Section */}
        <div className="mt-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold dark:text-white">Transfers</h3>
                              <CustomButton size="sm" onClick={handleAddTransfer} variant="pinkToOrange">+ Add Transfer</CustomButton>
          </div>
          
          {formData.transfers.map((transfer, index) => (
            <div key={`transfer-${index}`} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium dark:text-white">Transfer {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  {formData.transfers.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveTransferUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900'
                        }`}
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTransferDown(index)}
                        disabled={index === formData.transfers.length - 1}
                        className={`p-1 rounded ${index === formData.transfers.length - 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900'
                        }`}
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <CustomButton 
                        variant="red"
                        size="xs"
                        onClick={() => handleRemoveTransfer(index)}
                      >
                        Remove
                      </CustomButton>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor={`transferType-${index}`} value="Type" className="mb-2 block" />
                  <Select 
                    id={`transferType-${index}`}
                    value={transfer.type}
                    onChange={(e) => handleTransferChange(index, 'type', e.target.value)}
                    required
                  >
                    <option value="ARV">Arrival</option>
                    <option value="DEP">Departure</option>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`transferDate-${index}`} value="Date" className="mb-2 block" />
                  <div className="relative">
                    <TextInput
                      type="text"
                      value={formatTransferDateForDisplay(index)}
                      onChange={(e) => {
                        const newDisplayDate = e.target.value;
                        // Only update if valid format
                        if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                          const newIsoDate = parseDisplayDate(newDisplayDate);
                          if (newIsoDate) {
                            updateTransferDate(index, newIsoDate);
                          }
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                      required
                    />
                    <input 
                      type="date" 
                      id={`transferDate-${index}`}
                      className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                      value={formData.transfers[index].date}
                      onChange={(e) => updateTransferDate(index, e.target.value)}
                      required
                    />
                    <span className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label value="City" className="mb-2 block" />
                  <Select
                    value={transfer.city || ''}
                    onChange={(e) => handleTransferChange(index, 'city', e.target.value)}
                  >
                    <option value="">Select a city</option>
                    {cities.map((city, i) => (
                      <option key={`transfer-city-opt-${i}`} value={city}>{city}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Label value="Time" className="mb-2 block" />
                  <TextInput
                    value={transfer.time || ''}
                    onChange={(e) => handleTransferChange(index, 'time', e.target.value)}
                    placeholder="e.g. 14:30"
                  />
                </div>
                
                <div>
                  <Label value="Flight Number" className="mb-2 block" />
                  <TextInput
                    value={transfer.flightNumber || ''}
                    onChange={(e) => handleTransferChange(index, 'flightNumber', e.target.value)}
                    placeholder="e.g. TK1234"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`transferFrom-${index}`} value="From" className="mb-2 block" />
                  <TextInput
                    id={`transferFrom-${index}`}
                    value={transfer.from}
                    onChange={(e) => handleTransferChange(index, 'from', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label value="To" className="mb-2 block" />
                  <TextInput
                    value={transfer.to}
                    onChange={(e) => handleTransferChange(index, 'to', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label value="PAX" className="mb-2 block" />
                  <TextInput
                    type="number"
                    value={transfer.pax}
                    onChange={(e) => handleTransferChange(index, 'pax', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label value="Vehicle Type" className="mb-2 block" />
                  <Select 
                    value={transfer.vehicleType} 
                    onChange={(e) => handleTransferChange(index, 'vehicleType', e.target.value)}
                  >
                    <option value="VAN">VAN</option>
                    <option value="VITO">VITO</option>
                    <option value="SPRINTER">SPRINTER</option>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trips Section */}
        <div className="mt-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold dark:text-white">Trips</h3>
                              <CustomButton size="sm" onClick={handleAddTrip} variant="pinkToOrange">+ Add Trip</CustomButton>
          </div>
          
          {formData.trips.map((trip, index) => (
            <div key={`trip-${index}`} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium dark:text-white">Trip {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  {formData.trips.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveTripUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900'
                        }`}
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTripDown(index)}
                        disabled={index === formData.trips.length - 1}
                        className={`p-1 rounded ${index === formData.trips.length - 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900'
                        }`}
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <CustomButton 
                        variant="red"
                        size="xs"
                        onClick={() => handleRemoveTrip(index)}
                      >
                        Remove
                      </CustomButton>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label value="City" className="mb-2 block" />
                  <Select 
                    value={trip.city} 
                    onChange={(e) => handleTripChange(index, 'city', e.target.value)}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label value="Tour Name" className="block" />
                    <div className="flex items-center">
                      <Checkbox 
                        id={`customTour-${index}`}
                        checked={useCustomTour[index]}
                        onChange={() => toggleCustomTour(index)}
                      />
                      <Label htmlFor={`customTour-${index}`} value="Custom Tour" className="ml-2 text-sm" />
                    </div>
                  </div>
                  
                  {useCustomTour[index] ? (
                    <TextInput
                      value={trip.tourName}
                      onChange={(e) => handleTripChange(index, 'tourName', e.target.value)}
                      placeholder="Enter tour name"
                    />
                  ) : (
                    <SearchableSelect 
                      id={`tourSelect-${index}`}
                      value={trip.tourName} 
                      onChange={(e) => handleTripChange(index, 'tourName', e.target.value)}
                      options={tours
                        .filter(t => !trip.city || t.city === trip.city)
                        .map(t => ({
                          value: t.name,
                          label: `${t.name} - ${t.tourType} (${t.city})`
                        }))}
                      placeholder="Search for a tour..."
                    />
                  )}
                </div>
                
                <div>
                  <Label value="Count" className="mb-2 block" />
                  <TextInput
                    type="number"
                    value={trip.count}
                    onChange={(e) => handleTripChange(index, 'count', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label value="Type" className="mb-2 block" />
                  <TextInput
                    value={trip.type}
                    onChange={(e) => handleTripChange(index, 'type', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label value="PAX" className="mb-2 block" />
                  <TextInput
                    type="number"
                    value={trip.pax}
                    onChange={(e) => handleTripChange(index, 'pax', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Flights Section */}
        <div className="mt-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold dark:text-white">Flights</h3>
                              <CustomButton size="sm" onClick={handleAddFlight} variant="pinkToOrange">+ Add Flight</CustomButton>
          </div>
          
          {formData.flights.map((flight, index) => (
            <div key={`flight-${index}`} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium dark:text-white">Flight {index + 1}</h4>
                <div className="flex items-center space-x-2">
                  {formData.flights.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveFlightUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900'
                        }`}
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFlightDown(index)}
                        disabled={index === formData.flights.length - 1}
                        className={`p-1 rounded ${index === formData.flights.length - 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900'
                        }`}
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <CustomButton 
                        variant="red"
                        size="xs"
                        onClick={() => handleRemoveFlight(index)}
                      >
                        Remove
                      </CustomButton>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label value="Company Name" className="mb-2 block" />
                  <TextInput
                    value={flight.companyName}
                    onChange={(e) => handleFlightChange(index, 'companyName', e.target.value)}
                    placeholder="e.g. Turkish Airlines"
                  />
                </div>
                
                <div>
                  <Label value="From" className="mb-2 block" />
                  <TextInput
                    value={flight.from}
                    onChange={(e) => handleFlightChange(index, 'from', e.target.value)}
                    placeholder="e.g. Istanbul"
                  />
                </div>
                
                <div>
                  <Label value="To" className="mb-2 block" />
                  <TextInput
                    value={flight.to}
                    onChange={(e) => handleFlightChange(index, 'to', e.target.value)}
                    placeholder="e.g. Paris"
                  />
                </div>
                
                <div>
                  <Label value="Flight Number" className="mb-2 block" />
                  <TextInput
                    value={flight.flightNumber}
                    onChange={(e) => handleFlightChange(index, 'flightNumber', e.target.value)}
                    placeholder="e.g. TK1234"
                  />
                </div>
                
                <div>
                  <Label value="Departure Date" className="mb-2 block" />
                  <div className="relative">
                    <TextInput
                      type="text"
                      value={formatFlightDateForDisplay(index, 'departureDate')}
                      onChange={(e) => {
                        const newDisplayDate = e.target.value;
                        if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                          const newIsoDate = parseDisplayDate(newDisplayDate);
                          if (newIsoDate) {
                            updateFlightDate(index, 'departureDate', newIsoDate);
                          }
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                    />
                    <input 
                      type="date" 
                      className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                      value={flight.departureDate}
                      onChange={(e) => updateFlightDate(index, 'departureDate', e.target.value)}
                    />
                    <span className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label value="Arrival Date" className="mb-2 block" />
                  <div className="relative">
                    <TextInput
                      type="text"
                      value={formatFlightDateForDisplay(index, 'arrivalDate')}
                      onChange={(e) => {
                        const newDisplayDate = e.target.value;
                        if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                          const newIsoDate = parseDisplayDate(newDisplayDate);
                          if (newIsoDate) {
                            updateFlightDate(index, 'arrivalDate', newIsoDate);
                          }
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                    />
                    <input 
                      type="date" 
                      className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                      value={flight.arrivalDate}
                      min={flight.departureDate || ''}
                      onChange={(e) => updateFlightDate(index, 'arrivalDate', e.target.value)}
                    />
                    <span className="absolute top-0 right-0 h-full px-2 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label value="Luggage" className="mb-2 block" />
                  <TextInput
                    value={flight.luggage}
                    onChange={(e) => handleFlightChange(index, 'luggage', e.target.value)}
                    placeholder="e.g. 23kg checked, 8kg cabin"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-6">
          <CustomButton 
            variant="blueToTeal" 
            onClick={handleSave}
            disabled={saving}
            loading={saving}
            icon={FaSave}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </CustomButton>
        </div>

        {/* Voucher Duplication Modal */}
        <Modal
          show={duplicateModalOpen}
          onClose={closeDuplicateModal}
          dismissible
          size="md"
        >
          <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
            Import Data From Another Voucher
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <Alert color="warning">
                <p className="font-medium">Important</p>
                <p className="text-sm">
                  This will replace all current data in the form with data from the selected voucher.
                  Your changes will not be saved until you click "Save Changes".
                </p>
              </Alert>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a voucher to import its data. You can modify the imported data before saving.
              </p>
              
              {availableVouchers.length > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="selectVoucherToDuplicate" value="Select Voucher" />
                  <Select
                    id="selectVoucherToDuplicate"
                    value={selectedVoucherToDuplicate}
                    onChange={(e) => setSelectedVoucherToDuplicate(e.target.value)}
                    className="w-full"
                  >
                    <option value="">Choose a voucher</option>
                    {availableVouchers.map(voucher => (
                      <option key={voucher._id} value={voucher._id}>
                        #{voucher.voucherNumber} - {voucher.clientName} ({formatDateForDisplay(voucher.arrivalDate)} to {formatDateForDisplay(voucher.departureDate)})
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No other vouchers available to import data from.
                </div>
              )}
            </div>
          </Modal.Body>
                  <Modal.Footer className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                     <CustomButton variant="gray" onClick={closeDuplicateModal}>
                      Cancel 
                    </CustomButton>
                    <CustomButton variant="gray" onClick={handleDuplicateVoucher} 
                      disabled={!selectedVoucherToDuplicate}
                      icon={HiDuplicate}>
                      Import Data
                    </CustomButton>
                  </Modal.Footer>
        </Modal>
      </Card>
    </div>
  );
} 