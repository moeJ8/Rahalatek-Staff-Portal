import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Select as FlowbiteSelect, Label, Card, Checkbox } from 'flowbite-react';
import CustomModal from './CustomModal';
import VoucherPreview from './VoucherPreview';
import CustomButton from './CustomButton';
import RahalatekLoader from './RahalatekLoader';
import { toast } from 'react-hot-toast';
import TextInput from './TextInput';
import SearchableSelect from './SearchableSelect';
import CustomDatePicker from './CustomDatePicker';
import Select from './Select';
import { HiDuplicate } from 'react-icons/hi';
import { getCountries, getCitiesByCountry, inferCountryFromCity } from '../utils/countryCities';

// Helper function to get profit color classes based on value
const getProfitColorClass = (profit) => {
  if (profit < 0) {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-green-600 dark:text-green-400';
};

export default function VoucherForm({ onSuccess }) {
  // Form data state
  const [formData, setFormData] = useState({
    clientName: '',
    nationality: '',
    phoneNumber: '',
    officeName: 'Rahalatek Travel',
    arrivalDate: '',
    departureDate: '',
    capital: '',
        hotels: [{
      country: '',
      city: '',
      hotelName: '',
      roomType: '',
      nights: 1,
      checkIn: '',
      checkOut: '',
      pax: 1,
      adults: null,
      children: null,
      confirmationNumber: '',
      officeName: '',
      price: 0
    }],
        transfers: [{
      type: 'ARV',
      date: '',
      time: '',
      flightNumber: '',
      city: '',
      from: '',
      to: '',
      pax: 1,
      adults: null,
      children: null,
      vehicleType: 'VITO',
      officeName: '',
      price: 0
    }],
    trips: [{
      country: '',
      city: '',
      tourName: '',
      count: 1,
      type: '',
      pax: 1,
      adults: null,
      children: null,
      officeName: '',
      price: 0
    }],
    flights: [{
      companyName: '',
      from: '',
      to: '',
      flightNumber: '',
      departureDate: '',
      arrivalDate: '',
      luggage: '',
      officeName: '',
      price: 0
    }],
    payments: {
      hotels: {
        officeName: '',
        price: 0
      },
      transfers: {
        officeName: '',
        price: 0
      },
      trips: {
        officeName: '',
        price: 0
      },
      flights: {
        officeName: '',
        price: 0
      }
    },
    note: '',
    totalAmount: 0,
    currency: 'USD',
    advancedPayment: false,
    advancedAmount: 0,
    remainingAmount: 0
  });

  // Custom hotel input state
  const [useCustomHotel, setUseCustomHotel] = useState([false]);

  // Custom hotel city input state
  const [useCustomHotelCity, setUseCustomHotelCity] = useState([false]);

  // Custom tour input state
  const [useCustomTour, setUseCustomTour] = useState([false]);

  // Custom city input state for transfers
  const [useCustomTransferCity, setUseCustomTransferCity] = useState([false]);

  // Custom city input state for trips
  const [useCustomTripCity, setUseCustomTripCity] = useState([false]);

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState(null);



  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [cities, setCities] = useState([]);
  const [offices, setOffices] = useState([]);
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [existingClients, setExistingClients] = useState([]);
  const [existingClientsLoading, setExistingClientsLoading] = useState(false);

  // Duplicate voucher functionality
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedVoucherToDuplicate, setSelectedVoucherToDuplicate] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [duplicateModalLoading, setDuplicateModalLoading] = useState(false);

  // Function to open duplicate modal
  const openDuplicateModal = async () => {
    // Open modal immediately
    setDuplicateModalOpen(true);
    setDuplicateModalLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAvailableVouchers(response.data.data);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      toast.error('Failed to load vouchers for duplication.');
    } finally {
      setDuplicateModalLoading(false);
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
        country: hotel.country || inferCountryFromCity(hotel.city) || '',
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
        clientName: `${voucherToDuplicate.clientName} (Copy)`,
        nationality: voucherToDuplicate.nationality,
        phoneNumber: voucherToDuplicate.phoneNumber || '',
        officeName: voucherToDuplicate.officeName || 'Rahalatek Travel',
        arrivalDate: voucherToDuplicate.arrivalDate ? new Date(voucherToDuplicate.arrivalDate).toISOString().split('T')[0] : '',
        departureDate: voucherToDuplicate.departureDate ? new Date(voucherToDuplicate.departureDate).toISOString().split('T')[0] : '',
        capital: voucherToDuplicate.capital || '',
        hotels: processedHotels,
        transfers: processedTransfers,
        trips: (voucherToDuplicate.trips || []).map(trip => ({
          ...trip,
          country: trip.country || inferCountryFromCity(trip.city) || ''
        })),
        flights: voucherToDuplicate.flights ? voucherToDuplicate.flights.map(flight => ({
          ...flight,
          departureDate: flight.departureDate ? new Date(flight.departureDate).toISOString().split('T')[0] : '',
          arrivalDate: flight.arrivalDate ? new Date(flight.arrivalDate).toISOString().split('T')[0] : ''
        })) : [],
        payments: {
          hotels: {
            officeName: voucherToDuplicate.payments?.hotels?.officeName || '',
            price: voucherToDuplicate.payments?.hotels?.price || 0
          },
          transfers: {
            officeName: voucherToDuplicate.payments?.transfers?.officeName || '',
            price: voucherToDuplicate.payments?.transfers?.price || 0
          },
          trips: {
            officeName: voucherToDuplicate.payments?.trips?.officeName || '',
            price: voucherToDuplicate.payments?.trips?.price || 0
          },
          flights: {
            officeName: voucherToDuplicate.payments?.flights?.officeName || '',
            price: voucherToDuplicate.payments?.flights?.price || 0
          }
        },
        note: voucherToDuplicate.note || '',
        totalAmount: voucherToDuplicate.totalAmount || 0,
        currency: voucherToDuplicate.currency || 'USD',
        advancedPayment: voucherToDuplicate.advancedPayment || false,
        advancedAmount: voucherToDuplicate.advancedAmount || 0,
        remainingAmount: voucherToDuplicate.remainingAmount || 0
      });
      
      // Display dates are now handled by CustomDatePicker
      
      // Update custom hotel states
      setUseCustomHotel(voucherToDuplicate.hotels.map(hotel => {
        const hotelExists = hotels.some(h => h.name === hotel.hotelName);
        return !hotelExists && hotel.hotelName !== '';
      }));
      
      // Update custom hotel city states
      setUseCustomHotelCity(voucherToDuplicate.hotels.map(hotel => {
        const cityExists = cities.includes(hotel.city);
        return !cityExists && hotel.city !== '';
      }));
      
      // Update custom tour states
      setUseCustomTour(Array.isArray(voucherToDuplicate.trips) ? voucherToDuplicate.trips.map(trip => {
        const tourExists = tours.some(t => t.name === trip.tourName);
        return !tourExists && trip.tourName !== '';
      }) : []);
      
      toast.success('Voucher data duplicated successfully! Make changes as needed and submit to create a new voucher.', {
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
  
  // Date formatting functions
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  

  
  // Date formatting is now handled by CustomDatePicker
  
  useEffect(() => {
    const fetchEssentialData = async () => {
      setLoading(true);
      try {
        // Only fetch essential data needed for form functionality
        const [hotelResponse, tourResponse, officeResponse] = await Promise.all([
          axios.get('/api/hotels'),
          axios.get('/api/tours'),
          axios.get('/api/offices')
        ]);
        
        setHotels(hotelResponse.data);
        setTours(tourResponse.data);
        setOffices(officeResponse.data.data);
        
        // Extract unique cities from hotels and tours
        const uniqueCities = [...new Set([
          ...hotelResponse.data.map(h => h.city),
          ...tourResponse.data.map(t => t.city)
        ])];
        
        setCities(uniqueCities);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load data. Please try again.', {
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
    
    fetchEssentialData();
  }, []);

  // Lazy load existing clients only when needed (when user starts typing)
  const fetchExistingClients = async () => {
    if (existingClients.length === 0) {
      setExistingClientsLoading(true);
      try {
        const voucherResponse = await axios.get('/api/vouchers');
        const clientNames = [...new Set(voucherResponse.data.data
          .map(voucher => voucher.clientName)
          .filter(name => name && name.trim() !== '')
        )].sort();
        setExistingClients(clientNames);
      } catch (err) {
        console.error('Failed to load existing clients:', err);
        // Don't show error toast for this non-critical feature
      } finally {
        setExistingClientsLoading(false);
      }
    }
  };



  // Handle input changes for main form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

  // Hotel fields handlers
  const handleAddHotel = () => {
    setFormData(prev => ({
      ...prev,
      hotels: [
        ...prev.hotels,
        { 
          country: '',
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
    setUseCustomHotelCity(prev => [...prev, false]);
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
    
    // Remove entry from useCustomHotelCity array
    const updatedUseCustomCity = [...useCustomHotelCity];
    updatedUseCustomCity.splice(index, 1);
    setUseCustomHotelCity(updatedUseCustomCity);
  };

  const moveHotelUp = (index) => {
    if (index === 0) return;
    
    const updatedHotels = [...formData.hotels];
    const updatedCustomStates = [...useCustomHotel];
    const updatedCustomCityStates = [...useCustomHotelCity];
    
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
    [updatedCustomCityStates[index], updatedCustomCityStates[index - 1]] = [updatedCustomCityStates[index - 1], updatedCustomCityStates[index]];
    
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
    setUseCustomHotelCity(updatedCustomCityStates);
  };

  const moveHotelDown = (index) => {
    if (index === formData.hotels.length - 1) return;
    
    const updatedHotels = [...formData.hotels];
    const updatedCustomStates = [...useCustomHotel];
    const updatedCustomCityStates = [...useCustomHotelCity];
    
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
    [updatedCustomCityStates[index], updatedCustomCityStates[index + 1]] = [updatedCustomCityStates[index + 1], updatedCustomCityStates[index]];
    
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
    setUseCustomHotelCity(updatedCustomCityStates);
  };

  const handleHotelChange = (index, field, value) => {
    const updatedHotels = [...formData.hotels];
    updatedHotels[index][field] = value;
    
    // If changing country, reset city
    if (field === 'country') {
      updatedHotels[index].city = '';
    }
    
    // If selecting a hotel name, populate the city and country
    if (field === 'hotelName' && !useCustomHotel[index]) {
      const selectedHotel = hotels.find(h => h.name === value);
      if (selectedHotel) {
        updatedHotels[index].city = selectedHotel.city;
        if (selectedHotel.country) {
          updatedHotels[index].country = selectedHotel.country;
        }
      }
    }
    
    setFormData({
      ...formData,
      hotels: updatedHotels
    });
  };

  // Toggle custom hotel input
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

  // Toggle custom city input for hotels
  const toggleCustomHotelCity = (index) => {
    const newUseCustom = [...useCustomHotelCity];
    newUseCustom[index] = !newUseCustom[index];
    setUseCustomHotelCity(newUseCustom);
    
    if (!newUseCustom[index]) {
      const updatedHotels = [...formData.hotels];
      updatedHotels[index].city = '';
      setFormData(prev => ({
        ...prev,
        hotels: updatedHotels
      }));
    }
  };

  // Toggle custom city input for transfers
  const toggleCustomTransferCity = (index) => {
    const newUseCustom = [...useCustomTransferCity];
    newUseCustom[index] = !newUseCustom[index];
    setUseCustomTransferCity(newUseCustom);
    
    if (!newUseCustom[index]) {
      const updatedTransfers = [...formData.transfers];
      updatedTransfers[index].city = '';
      setFormData(prev => ({
        ...prev,
        transfers: updatedTransfers
      }));
    }
  };

  // Toggle custom city input for trips
  const toggleCustomTripCity = (index) => {
    const newUseCustom = [...useCustomTripCity];
    newUseCustom[index] = !newUseCustom[index];
    setUseCustomTripCity(newUseCustom);
    
    if (!newUseCustom[index]) {
      const updatedTrips = [...formData.trips];
      updatedTrips[index].city = '';
      setFormData(prev => ({
        ...prev,
        trips: updatedTrips
      }));
    }
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
    
    setFormData({
      ...formData,
      hotels: updatedHotels
    });
  };

  // Transfer fields handlers
  const handleAddTransfer = () => {
    setFormData({
      ...formData,
      transfers: [
        ...formData.transfers,
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
    });
    
    setUseCustomTransferCity(prev => [...prev, false]);
  };

  const handleRemoveTransfer = (index) => {
    const updatedTransfers = [...formData.transfers];
    updatedTransfers.splice(index, 1);
    setFormData({
      ...formData,
      transfers: updatedTransfers
    });
    
    const updatedCustomCities = [...useCustomTransferCity];
    updatedCustomCities.splice(index, 1);
    setUseCustomTransferCity(updatedCustomCities);
  };

  const moveTransferUp = (index) => {
    if (index === 0) return;
    
    const updatedTransfers = [...formData.transfers];
    const updatedCustomCities = [...useCustomTransferCity];
    
    // Store the original dates before swapping
    const currentDate = updatedTransfers[index].date;
    const previousDate = updatedTransfers[index - 1].date;
    
    // Swap all transfer data
    [updatedTransfers[index], updatedTransfers[index - 1]] = [updatedTransfers[index - 1], updatedTransfers[index]];
    [updatedCustomCities[index], updatedCustomCities[index - 1]] = [updatedCustomCities[index - 1], updatedCustomCities[index]];
    
    // Restore original dates to their positions
    updatedTransfers[index].date = currentDate;
    updatedTransfers[index - 1].date = previousDate;
    
    setFormData({
      ...formData,
      transfers: updatedTransfers
    });
    
    setUseCustomTransferCity(updatedCustomCities);
  };

  const moveTransferDown = (index) => {
    if (index === formData.transfers.length - 1) return;
    
    const updatedTransfers = [...formData.transfers];
    const updatedCustomCities = [...useCustomTransferCity];
    
    // Store the original dates before swapping
    const currentDate = updatedTransfers[index].date;
    const nextDate = updatedTransfers[index + 1].date;
    
    // Swap all transfer data
    [updatedTransfers[index], updatedTransfers[index + 1]] = [updatedTransfers[index + 1], updatedTransfers[index]];
    [updatedCustomCities[index], updatedCustomCities[index + 1]] = [updatedCustomCities[index + 1], updatedCustomCities[index]];
    
    // Restore original dates to their positions
    updatedTransfers[index].date = currentDate;
    updatedTransfers[index + 1].date = nextDate;
    
    setFormData({
      ...formData,
      transfers: updatedTransfers
    });
    
    setUseCustomTransferCity(updatedCustomCities);
  };

  const handleTransferChange = (index, field, value) => {
    const updatedTransfers = [...formData.transfers];
    updatedTransfers[index][field] = value;
    setFormData({
      ...formData,
      transfers: updatedTransfers
    });
  };



  // Helper function to update transfer date
  const updateTransferDate = (index, isoDate) => {
    const updatedTransfers = [...formData.transfers];
    updatedTransfers[index].date = isoDate;
    
    setFormData({
      ...formData,
      transfers: updatedTransfers
    });
  };

  // Trip fields handlers
  const handleAddTrip = () => {
    setFormData({
      ...formData,
      trips: [
        ...formData.trips,
        { 
          country: '',
          city: '', 
          tourName: '', 
          count: 1, 
          type: '', 
          pax: 1 
        }
      ]
    });
    
    setUseCustomTour(prev => [...prev, false]);
    setUseCustomTripCity(prev => [...prev, false]);
  };

  const handleRemoveTrip = (index) => {
    const updatedTrips = [...formData.trips];
    updatedTrips.splice(index, 1);
    setFormData({
      ...formData,
      trips: updatedTrips
    });
    
    const updatedCustomTours = [...useCustomTour];
    updatedCustomTours.splice(index, 1);
    setUseCustomTour(updatedCustomTours);
    
    const updatedCustomCities = [...useCustomTripCity];
    updatedCustomCities.splice(index, 1);
    setUseCustomTripCity(updatedCustomCities);
  };

  const moveTripUp = (index) => {
    if (index === 0) return;
    
    const updatedTrips = [...formData.trips];
    const updatedCustomStates = [...useCustomTour];
    const updatedCustomCities = [...useCustomTripCity];
    
    // Swap all trip data (no date preservation needed)
    [updatedTrips[index], updatedTrips[index - 1]] = [updatedTrips[index - 1], updatedTrips[index]];
    [updatedCustomStates[index], updatedCustomStates[index - 1]] = [updatedCustomStates[index - 1], updatedCustomStates[index]];
    [updatedCustomCities[index], updatedCustomCities[index - 1]] = [updatedCustomCities[index - 1], updatedCustomCities[index]];
    
    setFormData({
      ...formData,
      trips: updatedTrips
    });
    
    setUseCustomTour(updatedCustomStates);
    setUseCustomTripCity(updatedCustomCities);
  };

  const moveTripDown = (index) => {
    if (index === formData.trips.length - 1) return;
    
    const updatedTrips = [...formData.trips];
    const updatedCustomStates = [...useCustomTour];
    const updatedCustomCities = [...useCustomTripCity];
    
    // Swap all trip data (no date preservation needed)
    [updatedTrips[index], updatedTrips[index + 1]] = [updatedTrips[index + 1], updatedTrips[index]];
    [updatedCustomStates[index], updatedCustomStates[index + 1]] = [updatedCustomStates[index + 1], updatedCustomStates[index]];
    [updatedCustomCities[index], updatedCustomCities[index + 1]] = [updatedCustomCities[index + 1], updatedCustomCities[index]];
    
    setFormData({
      ...formData,
      trips: updatedTrips
    });
    
    setUseCustomTour(updatedCustomStates);
    setUseCustomTripCity(updatedCustomCities);
  };

  const handleTripChange = (index, field, value) => {
    const updatedTrips = [...formData.trips];
    updatedTrips[index][field] = value;
    
    // If changing country, reset city
    if (field === 'country') {
      updatedTrips[index].city = '';
    }
    
    // If selecting a tour name and not in custom mode, populate the city, country and type
    if (field === 'tourName' && !useCustomTour[index]) {
      const selectedTour = tours.find(t => t.name === value);
      if (selectedTour) {
        updatedTrips[index].city = selectedTour.city;
        updatedTrips[index].type = selectedTour.tourType;
        if (selectedTour.country) {
          updatedTrips[index].country = selectedTour.country;
        }
      }
    }
    
    setFormData({
      ...formData,
      trips: updatedTrips
    });
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
    setFormData({
      ...formData,
      flights: [...formData.flights, {
        companyName: '',
        from: '',
        to: '',
        flightNumber: '',
        departureDate: '',
        arrivalDate: '',
        luggage: ''
      }]
    });
  };

  const handleRemoveFlight = (index) => {
    const updatedFlights = [...formData.flights];
    updatedFlights.splice(index, 1);
    setFormData({
      ...formData,
      flights: updatedFlights
    });
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
    
    setFormData({
      ...formData,
      flights: updatedFlights
    });
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
    
    setFormData({
      ...formData,
      flights: updatedFlights
    });
  };

  const handleFlightChange = (index, field, value) => {
    const updatedFlights = [...formData.flights];
    updatedFlights[index][field] = value;
    setFormData({
      ...formData,
      flights: updatedFlights
    });
  };



  const updateFlightDate = (index, dateType, isoDate) => {
    const updatedFlights = [...formData.flights];
    updatedFlights[index] = {
      ...updatedFlights[index],
      [dateType]: isoDate
    };
    setFormData({ ...formData, flights: updatedFlights });
  };



  // Auto-calculate capital from both individual service payments and global payments
  useEffect(() => {
    const hotelPayments = formData.hotels.reduce((sum, hotel) => sum + (Number(hotel.price) || 0), 0);
    const transferPayments = formData.transfers.reduce((sum, transfer) => sum + (Number(transfer.price) || 0), 0);
    const tripPayments = formData.trips.reduce((sum, trip) => sum + (Number(trip.price) || 0), 0);
    const flightPayments = formData.flights.reduce((sum, flight) => sum + (Number(flight.price) || 0), 0);
    
    // Only use global payments when there are NO individual payments for that service type
    // AND when individual service arrays are empty (to avoid double counting)
    const globalHotelPayment = (hotelPayments === 0 && formData.hotels.length === 0) ? (Number(formData.payments.hotels.price) || 0) : 0;
    const globalTransferPayment = (transferPayments === 0 && formData.transfers.length === 0) ? (Number(formData.payments.transfers.price) || 0) : 0;
    const globalTripPayment = (tripPayments === 0 && formData.trips.length === 0) ? (Number(formData.payments.trips.price) || 0) : 0;
    const globalFlightPayment = (flightPayments === 0 && formData.flights.length === 0) ? (Number(formData.payments.flights.price) || 0) : 0;
    
    const totalPayments = hotelPayments + transferPayments + tripPayments + flightPayments +
                         globalHotelPayment + globalTransferPayment + globalTripPayment + globalFlightPayment;
    
    setFormData(prev => ({
      ...prev,
      capital: totalPayments.toString()
    }));
  }, [formData.hotels, formData.transfers, formData.trips, formData.flights, formData.payments]);

  // Validation function for adults/children requirement
  const validateAdultsChildrenRequirement = () => {
    const allSections = [...formData.hotels, ...formData.transfers, ...formData.trips];

    for (const item of allSections) {
      if (item.pax) {
        const hasAdults = item.adults !== null && item.adults > 0;
        const hasChildren = item.children !== null && item.children > 0;
        const isTransfer = formData.transfers.includes(item);

        // Check if only one of them is filled (not both or neither) - but exclude transfers
        if (!isTransfer && ((hasAdults && !hasChildren) || (!hasAdults && hasChildren))) {
          const sectionName = formData.hotels.includes(item) ? 'Hotels' :
                            formData.trips.includes(item) ? 'Trips' : 'Transfers';

          toast.error(
            `${sectionName} section: Both Adults and Children must be filled together, or leave both empty. You cannot fill only one of them.`,
            {
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
            }
          );
          return false;
        }

        // If both are filled, check the sum matches PAX
        if (hasAdults && hasChildren) {
          const total = item.adults + item.children;
          if (total !== item.pax) {
            const remaining = item.pax - total;
            const sectionName = formData.hotels.includes(item) ? 'Hotels' :
                              formData.transfers.includes(item) ? 'Transfers' : 'Trips';

            toast.error(
              `${sectionName} section: PAX mismatch! Total PAX: ${item.pax}, Adults + Children: ${total}. ${remaining > 0 ? `Missing ${remaining}` : `Exceeding by ${Math.abs(remaining)}`}`,
              {
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
              }
            );
            return false;
          }
        }
      }
    }
    return true;
  };

  // Preview and submit handlers
  const handlePreview = async () => {
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

    // Validate adults/children requirement
    if (!validateAdultsChildrenRequirement()) {
      return;
    }

    setLoading(true);
    
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      // Get a new voucher number from the server
      const response = await axios.get('/api/vouchers/next-number', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Create a preview version with the new voucher number
      setGeneratedVoucher({
        ...formData,
        voucherNumber: response.data.nextNumber || 10000
      });
      
      setShowPreview(true);
    } catch (err) {
      console.error('Error getting voucher number:', err);
      toast.error('Could not get a unique voucher number. Using a default number instead.', {
        duration: 3000,
        style: {
          background: '#ff9800',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ff9800',
        },
      });
      // Continue with preview even if we couldn't get a unique number
      setGeneratedVoucher({
        ...formData,
        voucherNumber: 10000 // Default number if API call fails
      });
      setShowPreview(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const formattedTrips = formData.trips.map(trip => ({
        city: trip.city,
        tourName: trip.tourName,
        count: Number(trip.count),
        type: trip.type,
        pax: Number(trip.pax),
        adults: trip.adults,
        children: trip.children,
        officeName: trip.officeName || '',
        price: Number(trip.price) || 0
      }));

      const payload = {
        voucherNumber: generatedVoucher.voucherNumber, 
        clientName: formData.clientName,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber,
        officeName: formData.officeName || 'direct client',
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        capital: formData.capital,
        totalAmount: Number(formData.totalAmount),
        currency: formData.currency,
        hotels: formData.hotels,
        transfers: formData.transfers,
        trips: formattedTrips,
        flights: formData.flights,
        payments: {
          hotels: {
            officeName: formData.payments?.hotels?.officeName || '',
            price: Number(formData.payments?.hotels?.price) || 0
          },
          transfers: {
            officeName: formData.payments?.transfers?.officeName || '',
            price: Number(formData.payments?.transfers?.price) || 0
          },
          trips: {
            officeName: formData.payments?.trips?.officeName || '',
            price: Number(formData.payments?.trips?.price) || 0
          },
          flights: {
            officeName: formData.payments?.flights?.officeName || '',
            price: Number(formData.payments?.flights?.price) || 0
          }
        },
        note: formData.note,
        advancedPayment: formData.advancedPayment,
        advancedAmount: formData.advancedPayment ? Number(formData.advancedAmount) : 0,
        remainingAmount: formData.advancedPayment ? Number(formData.remainingAmount) : 0
      };
      
      console.log('Sending payload:', payload);

      const response = await axios.post('/api/vouchers', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setGeneratedVoucher(response.data.data);
      toast.success(`Voucher #${generatedVoucher.voucherNumber} for ${formData.clientName} has been created successfully!`, {
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
      
      // Call onSuccess callback if provided
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating voucher:', err);
      toast.error(err.response?.data?.message || 'Failed to create voucher. Please try again.', {
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

  return (
    <div>
      {/* <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Voucher Generator</h2> */}
      
      {loading && !showPreview ? (
        <div className="flex items-center justify-center min-h-screen">
          <RahalatekLoader size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          
          {!showPreview ? (
            <Card className="dark:bg-slate-950">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold dark:text-white">Client Information</h3>
                <CustomButton
                  variant="gray"
                  onClick={openDuplicateModal}
                  title="Duplicate existing voucher data"
                  icon={HiDuplicate}
                >
                  Duplicate Voucher
                </CustomButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="clientName" value="Client Name" className="block" />
                    <div className="flex items-center">
                      <Checkbox
                        id="existingClient"
                        checked={isExistingClient}
                        onChange={(e) => {
                          setIsExistingClient(e.target.checked);
                          if (e.target.checked) {
                            // Lazy load existing clients when user switches to existing client mode
                            fetchExistingClients();
                          } else {
                            // Clear client name when switching to manual input
                            setFormData({...formData, clientName: ''});
                          }
                        }}
                      />
                      <Label htmlFor="existingClient" value="Existing Client" className="ml-2 text-sm" />
                    </div>
                  </div>
                  
                  {isExistingClient ? (
                    <SearchableSelect
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      options={existingClients.map(client => ({
                        value: client,
                        label: client
                      }))}
                      placeholder="Select existing client..."
                      loading={existingClientsLoading}
                      required
                    />
                  ) : (
                    <TextInput
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Enter new client name..."
                      required
                    />
                  )}
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
                  <Label htmlFor="officeName" value="Office" className="mb-2 block" />
                  <SearchableSelect
                    id="officeName"
                    name="officeName"
                    value={formData.officeName}
                    onChange={(e) => setFormData({...formData, officeName: e.target.value})}
                    options={[
                      { value: 'Rahalatek Travel', label: 'Rahalatek Travel - Turkey (Direct Client)' },
                      ...offices.filter(office => office.name !== 'Rahalatek Travel').map(office => ({
                        value: office.name,
                        label: `${office.name} - ${office.location}`
                      }))
                    ]}
                    placeholder="Search for an office..."
                  />
                </div>
                
                <div>
                  <CustomDatePicker
                    label="Arrival Date"
                    value={formData.arrivalDate}
                    onChange={(newIsoDate) => {
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
                      }
                    }}
                    required
                  />
                </div>
                
                <div>
                  <CustomDatePicker
                    label="Departure Date"
                    value={formData.departureDate}
                    min={formData.arrivalDate || ''}
                    onChange={(newIsoDate) => {
                      setFormData({
                        ...formData,
                        departureDate: newIsoDate
                      });
                    }}
                    required
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
                  <div key={`hotel-${index}`} className="bg-gray-50 dark:bg-slate-950 border dark:border-slate-600 p-4 rounded-lg mb-4">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label value="Country" className="block mb-2" />
                        <SearchableSelect
                          id={`hotelCountry-${index}`}
                          value={hotel.country}
                          onChange={(e) => handleHotelChange(index, 'country', e.target.value)}
                          options={[
                            { value: '', label: 'Select Country' },
                            ...getCountries().map(country => ({ value: country, label: country }))
                          ]}
                          placeholder="Search for a country..."
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label value="City" className="block" />
                          <div className="flex items-center">
                            <Checkbox 
                              id={`customHotelCity-${index}`}
                              checked={useCustomHotelCity[index]}
                              onChange={() => toggleCustomHotelCity(index)}
                            />
                            <Label htmlFor={`customHotelCity-${index}`} value="Custom City" className="ml-2 text-sm" />
                          </div>
                        </div>
                        
                        {useCustomHotelCity[index] ? (
                          <TextInput
                            value={hotel.city}
                            onChange={(e) => handleHotelChange(index, 'city', e.target.value)}
                            placeholder="Enter city name"
                          />
                        ) : (
                          <SearchableSelect
                            id={`hotelCity-${index}`}
                            value={hotel.city}
                            onChange={(e) => handleHotelChange(index, 'city', e.target.value)}
                            options={[
                              { value: '', label: 'Select City' },
                              ...getCitiesByCountry(hotel.country || '').map(city => ({ value: city, label: city }))
                            ]}
                            placeholder="Search for a city..."
                            disabled={!hotel.country}
                          />
                        )}
                        {!hotel.country && !useCustomHotelCity[index] && (
                          <p className="text-xs text-gray-500 mt-1">Select a country first</p>
                        )}
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
                            options={hotels.filter(h => {
                              const countryMatch = !hotel.country || h.country === hotel.country;
                              const cityMatch = !hotel.city || h.city === hotel.city;
                              return countryMatch && cityMatch;
                            }).map(h => ({
                              value: h.name,
                              label: h.stars ? `${h.name} (${h.stars}★) - ${h.city}${h.country ? `, ${h.country}` : ''}` : h.name
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
                        <CustomDatePicker
                          label="Check In"
                          value={formData.hotels[index].checkIn}
                          onChange={(newIsoDate) => updateHotelDate(index, 'checkIn', newIsoDate)}
                          required
                        />
                      </div>
                      
                      <div>
                        <CustomDatePicker
                          label="Check Out"
                          value={formData.hotels[index].checkOut}
                          min={formData.hotels[index].checkIn || ''}
                          onChange={(newIsoDate) => updateHotelDate(index, 'checkOut', newIsoDate)}
                          required
                        />
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

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label value="Adults" className="mb-2 block" />
                          <TextInput
                            type="number"
                            value={hotel.adults !== null ? hotel.adults : ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : null;
                              if (value === null) {
                                // Clear both adults and children if adults is cleared
                                handleHotelChange(index, 'adults', null);
                                handleHotelChange(index, 'children', null);
                              } else if (value >= 1 && hotel.children !== null && hotel.children >= 0) {
                                // Both adults and children must be filled together
                                const maxAdults = hotel.pax - hotel.children;
                                if (value <= maxAdults) {
                                  handleHotelChange(index, 'adults', value);
                                }
                              } else if (hotel.children === null && value >= 1) {
                                // If children is not set, set both to 1
                                handleHotelChange(index, 'adults', value);
                                handleHotelChange(index, 'children', 0);
                              }
                            }}
                            min="0"
                            max={hotel.pax - (hotel.children || 0)}
                            disabled={!hotel.pax || hotel.pax < 1}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label value="Children" className="mb-2 block" />
                          <TextInput
                            type="number"
                            value={hotel.children || ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : null;
                              if (value === null) {
                                // Clear both adults and children if children is cleared
                                handleHotelChange(index, 'adults', null);
                                handleHotelChange(index, 'children', null);
                              } else if (value >= 0 && hotel.adults !== null && hotel.adults >= 1) {
                                // Both adults and children must be filled together
                                const maxChildren = hotel.pax - hotel.adults;
                                if (value <= maxChildren) {
                                  handleHotelChange(index, 'children', value);
                                }
                              } else if (hotel.adults === null && value >= 0) {
                                // If adults is not set, set both to 1 and 0
                                handleHotelChange(index, 'adults', 1);
                                handleHotelChange(index, 'children', value);
                              }
                            }}
                            min="0"
                            max={hotel.pax - (hotel.adults !== null ? hotel.adults : 1)}
                            disabled={!hotel.pax || hotel.pax < 1}
                            placeholder="Optional"
                          />
                        </div>
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
                  <div key={`transfer-${index}`} className="bg-gray-50 dark:bg-slate-950 border dark:border-slate-600 p-4 rounded-lg mb-4">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label value="Type" className="mb-2 block" />
                        <Select 
                          value={transfer.type} 
                          onChange={(value) => handleTransferChange(index, 'type', value)}
                          options={[
                            { value: 'ARV', label: 'Arrival (ARV)' },
                            { value: 'DEP', label: 'Departure (DEP)' }
                          ]}
                          placeholder="Select Type"
                        />
                      </div>
                      
                      <div>
                        <CustomDatePicker
                          label="Date"
                          value={formData.transfers[index].date}
                          onChange={(newIsoDate) => updateTransferDate(index, newIsoDate)}
                          required
                        />
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
                        <div className="flex justify-between items-center mb-2">
                          <Label value="City" className="block" />
                          <div className="flex items-center">
                            <Checkbox 
                              id={`customTransferCity-${index}`}
                              checked={useCustomTransferCity[index]}
                              onChange={() => toggleCustomTransferCity(index)}
                            />
                            <Label htmlFor={`customTransferCity-${index}`} value="Custom City" className="ml-2 text-sm" />
                          </div>
                        </div>
                        
                        {useCustomTransferCity[index] ? (
                          <TextInput
                            value={transfer.city}
                            onChange={(e) => handleTransferChange(index, 'city', e.target.value)}
                            placeholder="Enter city name"
                          />
                        ) : (
                          <SearchableSelect
                            id={`transferCity-${index}`}
                            value={transfer.city}
                            onChange={(e) => handleTransferChange(index, 'city', e.target.value)}
                            options={[
                              { value: '', label: 'Select a city' },
                              ...(() => {
                                // Get unique countries from selected hotels
                                const hotelCountries = [...new Set(
                                  formData.hotels
                                    .map(hotel => hotel.country)
                                    .filter(country => country && country.trim() !== '')
                                )];
                                
                                // Get cities from all hotel countries
                                const availableCities = hotelCountries.flatMap(country => 
                                  getCitiesByCountry(country)
                                );
                                
                                // Remove duplicates and sort
                                const uniqueCities = [...new Set(availableCities)].sort();
                                
                                return uniqueCities.map(city => ({ value: city, label: city }));
                              })()
                            ]}
                            placeholder={
                              formData.hotels.some(hotel => hotel.country) 
                                ? "Search for a city..." 
                                : "Select hotel countries first"
                            }
                            disabled={!formData.hotels.some(hotel => hotel.country)}
                          />
                        )}
                        {!formData.hotels.some(hotel => hotel.country) && !useCustomTransferCity[index] && (
                          <p className="text-xs text-gray-500 mt-1">Select hotel countries first to see available cities</p>
                        )}
                      </div>
                      
                      <div>
                        <Label value="From" className="mb-2 block" />
                        <TextInput
                          value={transfer.from}
                          onChange={(e) => handleTransferChange(index, 'from', e.target.value)}
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

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label value="Adults" className="mb-2 block" />
                          <TextInput
                            type="number"
                            value={transfer.adults !== null ? transfer.adults : ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : null;
                              if (value === null) {
                                // For transfers, allow clearing just adults
                                handleTransferChange(index, 'adults', null);
                              } else if (value >= 0) {
                                // For transfers, allow setting just adults
                                handleTransferChange(index, 'adults', value);
                              }
                            }}
                            min="0"
                            max={transfer.pax - (transfer.children || 0)}
                            disabled={!transfer.pax || transfer.pax < 1}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label value="Children" className="mb-2 block" />
                          <TextInput
                            type="number"
                            value={transfer.children || ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : null;
                              if (value === null) {
                                // For transfers, allow clearing just children
                                handleTransferChange(index, 'children', null);
                              } else if (value >= 0) {
                                // For transfers, allow setting just children
                                handleTransferChange(index, 'children', value);
                              }
                            }}
                            min="0"
                            max={transfer.pax - (transfer.adults !== null ? transfer.adults : 1)}
                            disabled={!transfer.pax || transfer.pax < 1}
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div>
                        <Label value="Vehicle Type" className="mb-2 block" />
                        <Select 
                          value={transfer.vehicleType} 
                          onChange={(value) => handleTransferChange(index, 'vehicleType', value)}
                          options={[
                            { value: 'VAN', label: 'VAN' },
                            { value: 'VITO', label: 'VITO' },
                            { value: 'SPRINTER', label: 'SPRINTER' },
                            { value: 'BUS', label: 'BUS' }
                          ]}
                          placeholder="Select Vehicle Type"
                        />
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
                  <div key={`trip-${index}`} className="bg-gray-50 dark:bg-slate-950 border dark:border-slate-600 p-4 rounded-lg mb-4">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label value="Country" className="block mb-2" />
                        <SearchableSelect
                          id={`tripCountry-${index}`}
                          value={trip.country}
                          onChange={(e) => handleTripChange(index, 'country', e.target.value)}
                          options={[
                            { value: '', label: 'Select Country' },
                            ...getCountries().map(country => ({ value: country, label: country }))
                          ]}
                          placeholder="Search for a country..."
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label value="City" className="block" />
                          <div className="flex items-center">
                            <Checkbox 
                              id={`customTripCity-${index}`}
                              checked={useCustomTripCity[index]}
                              onChange={() => toggleCustomTripCity(index)}
                            />
                            <Label htmlFor={`customTripCity-${index}`} value="Custom City" className="ml-2 text-sm" />
                          </div>
                        </div>
                        
                        {useCustomTripCity[index] ? (
                          <TextInput
                            value={trip.city}
                            onChange={(e) => handleTripChange(index, 'city', e.target.value)}
                            placeholder="Enter city name"
                          />
                        ) : (
                          <SearchableSelect
                            id={`tripCity-${index}`}
                            value={trip.city}
                            onChange={(e) => handleTripChange(index, 'city', e.target.value)}
                            options={[
                              { value: '', label: 'Select City' },
                              ...getCitiesByCountry(trip.country || '').map(city => ({ value: city, label: city }))
                            ]}
                            placeholder="Search for a city..."
                            disabled={!trip.country}
                          />
                        )}
                        {!trip.country && !useCustomTripCity[index] && (
                          <p className="text-xs text-gray-500 mt-1">Select a country first</p>
                        )}
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
                              .filter(t => {
                                const countryMatch = !trip.country || t.country === trip.country;
                                const cityMatch = !trip.city || t.city === trip.city;
                                return countryMatch && cityMatch;
                              })
                              .map(t => ({
                                value: t.name,
                                label: `${t.name} - ${t.tourType} (${t.city}${t.country ? `, ${t.country}` : ''})`
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

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label value="Adults" className="mb-2 block" />
                          <TextInput
                            type="number"
                            value={trip.adults !== null ? trip.adults : ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : null;
                              if (value === null) {
                                // Clear both adults and children if adults is cleared
                                handleTripChange(index, 'adults', null);
                                handleTripChange(index, 'children', null);
                              } else if (value >= 1 && trip.children !== null && trip.children >= 0) {
                                // Both adults and children must be filled together
                                const maxAdults = trip.pax - trip.children;
                                if (value <= maxAdults) {
                                  handleTripChange(index, 'adults', value);
                                }
                              } else if (trip.children === null && value >= 1) {
                                // If children is not set, set both to 1
                                handleTripChange(index, 'adults', value);
                                handleTripChange(index, 'children', 0);
                              }
                            }}
                            min="0"
                            max={trip.pax - (trip.children || 0)}
                            disabled={!trip.pax || trip.pax < 1}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label value="Children" className="mb-2 block" />
                          <TextInput
                            type="number"
                            value={trip.children || ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : null;
                              if (value === null) {
                                // Clear both adults and children if children is cleared
                                handleTripChange(index, 'adults', null);
                                handleTripChange(index, 'children', null);
                              } else if (value >= 0 && trip.adults !== null && trip.adults >= 1) {
                                // Both adults and children must be filled together
                                const maxChildren = trip.pax - trip.adults;
                                if (value <= maxChildren) {
                                  handleTripChange(index, 'children', value);
                                }
                              } else if (trip.adults === null && value >= 0) {
                                // If adults is not set, set both to 1 and 0
                                handleTripChange(index, 'adults', 1);
                                handleTripChange(index, 'children', value);
                              }
                            }}
                            min="0"
                            max={trip.pax - (trip.adults !== null ? trip.adults : 1)}
                            disabled={!trip.pax || trip.pax < 1}
                            placeholder="Optional"
                          />
                        </div>
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
                  <div key={`flight-${index}`} className="bg-gray-50 dark:bg-slate-950 border dark:border-slate-600 p-4 rounded-lg mb-4">
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
                        <CustomDatePicker
                          label="Departure Date"
                          value={flight.departureDate}
                          onChange={(newIsoDate) => updateFlightDate(index, 'departureDate', newIsoDate)}
                          required
                        />
                      </div>
                      
                      <div>
                        <CustomDatePicker
                          label="Arrival Date"
                          value={flight.arrivalDate}
                          min={flight.departureDate || ''}
                          onChange={(newIsoDate) => updateFlightDate(index, 'arrivalDate', newIsoDate)}
                          required
                        />
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
              
              {/* Payment Section */}
              <div className="mt-6 mb-6">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold dark:text-white">Payment Distribution</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Assign payment amounts to different offices for each service. Total will be calculated as capital.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-950 border dark:border-slate-600 p-4 rounded-lg space-y-6">
                  {/* Currency Selection */}
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex justify-center">
                      <div className="w-32">
                        <Select
                          value={formData.currency}
                          onChange={(value) => {
                            setFormData({
                              ...formData,
                              currency: value
                            });
                          }}
                          options={[
                            { value: 'USD', label: '$ USD' },
                            { value: 'EUR', label: '€ EUR' },
                            { value: 'TRY', label: '₺ TRY' }
                          ]}
                          placeholder="Select Currency"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hotels Payment - Individual Items */}
                  {formData.hotels.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Hotels Payment Assignment
                        </h4>
                      </div>
                      {formData.hotels.map((hotel, index) => (
                        <div key={index} className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                                  {index + 1}
                                </span>
                                <Label value={hotel.hotelName || 'Unnamed Hotel'} className="text-sm font-medium text-gray-800 dark:text-gray-200" />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 pl-8 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {hotel.city}
                              </p>
                            </div>
                            <div>
                              <Label value="Office" className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400" />
                              <SearchableSelect
                                value={hotel.officeName || ''}
                                onChange={(e) => handleHotelChange(index, 'officeName', e.target.value)}
                                options={offices.map(office => ({
                                  value: office.name,
                                  label: `${office.name} - ${office.location}`
                                }))}
                                placeholder="Select office..."
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label value="Price" className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400" />
                              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400">
                                <TextInput
                                  type="number"
                                  value={hotel.price || 0}
                                  onChange={(e) => handleHotelChange(index, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="flex-grow text-sm border-0 focus:ring-0"
                                  disabled={!hotel.officeName}
                                />
                                <span className="inline-flex items-center px-3 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-slate-600 dark:text-gray-300">
                                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Transfers Payment - Individual Items */}
                  {formData.transfers.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Transfers Payment Assignment
                        </h4>
                      </div>
                      {formData.transfers.map((transfer, index) => (
                        <div key={index} className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                                  {index + 1}
                                </span>
                                <Label value={transfer.type || 'Transfer'} className="text-sm font-medium text-gray-800 dark:text-gray-200" />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 pl-8 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {transfer.from} → {transfer.to}
                              </p>
                            </div>
                            <div>
                              <Label value="Office" className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400" />
                              <SearchableSelect
                                value={transfer.officeName || ''}
                                onChange={(e) => handleTransferChange(index, 'officeName', e.target.value)}
                                options={offices.map(office => ({
                                  value: office.name,
                                  label: `${office.name} - ${office.location}`
                                }))}
                                placeholder="Select office..."
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label value="Price" className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400" />
                              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-green-500 dark:focus-within:ring-green-400">
                                <TextInput
                                  type="number"
                                  value={transfer.price || 0}
                                  onChange={(e) => handleTransferChange(index, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="flex-grow text-sm border-0 focus:ring-0"
                                  disabled={!transfer.officeName}
                                />
                                <span className="inline-flex items-center px-3 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-slate-600 dark:text-gray-300">
                                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trips Payment - Individual Items */}
                  {formData.trips.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Trips Payment Assignment
                        </h4>
                      </div>
                      {formData.trips.map((trip, index) => (
                        <div key={index} className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full">
                                  {index + 1}
                                </span>
                                <Label value={trip.tourName || 'Unnamed Trip'} className="text-sm font-medium text-gray-800 dark:text-gray-200" />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 pl-8 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {trip.city}
                              </p>
                            </div>
                            <div>
                              <Label value="Office" className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400" />
                              <SearchableSelect
                                value={trip.officeName || ''}
                                onChange={(e) => handleTripChange(index, 'officeName', e.target.value)}
                                options={offices.map(office => ({
                                  value: office.name,
                                  label: `${office.name} - ${office.location}`
                                }))}
                                placeholder="Select office..."
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label value="Price" className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400" />
                              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-purple-500 dark:focus-within:ring-purple-400">
                                <TextInput
                                  type="number"
                                  value={trip.price || 0}
                                  onChange={(e) => handleTripChange(index, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="flex-grow text-sm border-0 focus:ring-0"
                                  disabled={!trip.officeName}
                                />
                                <span className="inline-flex items-center px-3 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-slate-600 dark:text-gray-300">
                                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flights Payment - Individual Items */}
                  {formData.flights.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Flights Payment Assignment
                        </h4>
                      </div>
                      {formData.flights.map((flight, index) => (
                        <div key={index} className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full">
                                  {index + 1}
                                </span>
                                <Label value={flight.companyName || 'Unnamed Flight'} className="text-sm font-medium text-gray-800 dark:text-gray-200" />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 pl-8 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {flight.from} → {flight.to}
                              </p>
                            </div>
                            <div>
                              <Label value="Office" className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400" />
                              <SearchableSelect
                                value={flight.officeName || ''}
                                onChange={(e) => handleFlightChange(index, 'officeName', e.target.value)}
                                options={offices.map(office => ({
                                  value: office.name,
                                  label: `${office.name} - ${office.location}`
                                }))}
                                placeholder="Select office..."
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label value="Price" className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400" />
                              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-orange-500 dark:focus-within:ring-orange-400">
                                <TextInput
                                  type="number"
                                  value={flight.price || 0}
                                  onChange={(e) => handleFlightChange(index, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="flex-grow text-sm border-0 focus:ring-0"
                                  disabled={!flight.officeName}
                                />
                                <span className="inline-flex items-center px-3 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-slate-600 dark:text-gray-300">
                                  {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total Display */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <Label value="Total Capital" className="text-lg font-semibold text-gray-800 dark:text-gray-200" />
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mr-1">
                          {formData.capital || '0'}
                        </span>
                        <span className="text-lg text-gray-600 dark:text-gray-400">
                          {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capital" value="Capital (Read Only)" className="mb-2 block" />
                        <div className="flex">
                          <TextInput
                            id="capital"
                            name="capital"
                            value={formData.capital}
                            placeholder="Capital will be calculated automatically"
                            className="flex-grow"
                            readOnly
                            disabled
                          />
                          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md dark:bg-slate-600 dark:text-gray-400 dark:border-slate-600">
                            {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Capital is calculated automatically and cannot be edited manually</p>
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
                           <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md dark:bg-slate-600 dark:text-gray-400 dark:border-slate-600">
                             {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₺'}
                           </span>
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
                    </div>

                    <div className="mt-4">
                      <div>
                        <Label htmlFor="note" value="Note" className="mb-2 block" />
                        <textarea
                          id="note"
                          name="note"
                          value={formData.note}
                          onChange={handleInputChange}
                          placeholder="Add any additional notes..."
                          rows={3}
                          className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md transition-all duration-200 resize-vertical"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <CustomButton variant="blueToTeal" onClick={handlePreview}>
                  Preview Voucher
                </CustomButton>
              </div>
            </Card>
          ) : (
            <div>
              <div className="flex justify-between mb-4">
                <CustomButton variant="gray" onClick={() => setShowPreview(false)}>
                  Back to Edit
                </CustomButton>
              </div>
              
              <VoucherPreview 
                voucherData={generatedVoucher || { ...formData, voucherNumber: 10000 }}
                onSave={handleSubmit}
                saveButton={
                  <CustomButton variant="blueToTeal" onClick={handleSubmit} disabled={loading} loading={loading} className="w-full sm:w-auto flex justify-center">
                    Save Voucher
                  </CustomButton>
                }
              />
            </div>
          )}

          {/* Voucher Duplication Modal */}
          <CustomModal
            isOpen={duplicateModalOpen}
            onClose={closeDuplicateModal}
            title="Duplicate Existing Voucher"
            subtitle="Select a voucher to duplicate its data. You can modify the duplicated data before creating a new voucher."
            maxWidth="md:max-w-2xl"
          >
                      <div className="space-y-6">
            {duplicateModalLoading ? (
              <div className="text-center py-12">
                <RahalatekLoader size="sm" />
                <p className="text-base text-gray-600 mt-4">Loading vouchers...</p>
              </div>
            ) : availableVouchers.length > 0 ? (
              <div className="space-y-2 relative">
                <Label htmlFor="selectVoucherToDuplicate" value="Select Voucher" />
                <SearchableSelect
                  id="selectVoucherToDuplicate"
                  value={selectedVoucherToDuplicate}
                  onChange={(e) => setSelectedVoucherToDuplicate(e.target.value)}
                  options={[
                    { value: '', label: 'Choose a voucher' },
                    ...availableVouchers.map(voucher => ({
                      value: voucher._id,
                      label: `#${voucher.voucherNumber} - ${voucher.clientName} (${formatDateForDisplay(voucher.arrivalDate)} to ${formatDateForDisplay(voucher.departureDate)})`
                    }))
                  ]}
                  placeholder="Search for a voucher to duplicate..."
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No vouchers available to duplicate. Please create a voucher first.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <CustomButton variant="gray" onClick={closeDuplicateModal}>
                Cancel
              </CustomButton>
              <CustomButton
                variant="gray"
                onClick={handleDuplicateVoucher}
                disabled={!selectedVoucherToDuplicate || duplicateModalLoading}
                icon={HiDuplicate}
              >
                Duplicate
              </CustomButton>
            </div>
          </div>
          </CustomModal>
        </div>
      )}
    </div>
  );
} 