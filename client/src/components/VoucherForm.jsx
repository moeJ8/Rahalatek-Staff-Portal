import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextInput, Select, Label, Card, Checkbox } from 'flowbite-react';
import VoucherPreview from './VoucherPreview';
import { toast } from 'react-hot-toast';

export default function VoucherForm({ onSuccess }) {
  // Form data state
  const [formData, setFormData] = useState({
    clientName: '',
    nationality: '',
    arrivalDate: '',
    departureDate: '',
    hotels: [{ 
      city: '', 
      hotelName: '', 
      roomType: '', 
      nights: 1, 
      checkIn: '', 
      checkOut: '', 
      pax: 1, 
      confirmationNumber: '' 
    }],
    transfers: [{ 
      type: 'ARV', 
      date: '', 
      city: '',
      from: '', 
      to: '', 
      pax: 1, 
      vehicleType: 'VITO' 
    }],
    trips: [{ 
      city: '', 
      tourName: '', 
      count: 1, 
      type: '', 
      pax: 1 
    }],
    totalAmount: 0,
    advancedPayment: false,
    advancedAmount: 0,
    remainingAmount: 0
  });

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState(null);

  // Date display formatting
  const [displayArrivalDate, setDisplayArrivalDate] = useState('');
  const [displayDepartureDate, setDisplayDepartureDate] = useState('');

  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [cities, setCities] = useState([]);
  
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
      setLoading(true);
      try {
        const [hotelResponse, tourResponse] = await Promise.all([
          axios.get('/api/hotels'),
          axios.get('/api/tours')
        ]);
        
        setHotels(hotelResponse.data);
        setTours(tourResponse.data);
        
        // Extract unique cities
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
    
    fetchData();
  }, []);

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
    setFormData({
      ...formData,
      hotels: [
        ...formData.hotels,
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
    });
  };

  const handleRemoveHotel = (index) => {
    const updatedHotels = [...formData.hotels];
    updatedHotels.splice(index, 1);
    setFormData({
      ...formData,
      hotels: updatedHotels
    });
  };

  const handleHotelChange = (index, field, value) => {
    const updatedHotels = [...formData.hotels];
    updatedHotels[index][field] = value;
    
    // If selecting a hotel name, populate the city
    if (field === 'hotelName') {
      const selectedHotel = hotels.find(h => h.name === value);
      if (selectedHotel) {
        updatedHotels[index].city = selectedHotel.city;
      }
    }
    
    setFormData({
      ...formData,
      hotels: updatedHotels
    });
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
          city: '',
          from: '', 
          to: '', 
          pax: 1, 
          vehicleType: 'VITO' 
        }
      ]
    });
  };

  const handleRemoveTransfer = (index) => {
    const updatedTransfers = [...formData.transfers];
    updatedTransfers.splice(index, 1);
    setFormData({
      ...formData,
      transfers: updatedTransfers
    });
  };

  const handleTransferChange = (index, field, value) => {
    const updatedTransfers = [...formData.transfers];
    updatedTransfers[index][field] = value;
    setFormData({
      ...formData,
      transfers: updatedTransfers
    });
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
          city: '', 
          tourName: '', 
          count: 1, 
          type: '', 
          pax: 1 
        }
      ]
    });
  };

  const handleRemoveTrip = (index) => {
    const updatedTrips = [...formData.trips];
    updatedTrips.splice(index, 1);
    setFormData({
      ...formData,
      trips: updatedTrips
    });
  };

  const handleTripChange = (index, field, value) => {
    const updatedTrips = [...formData.trips];
    updatedTrips[index][field] = value;
    
    // If selecting a tour name, populate the city and type
    if (field === 'tourName') {
      const selectedTour = tours.find(t => t.name === value);
      if (selectedTour) {
        updatedTrips[index].city = selectedTour.city;
        updatedTrips[index].type = selectedTour.tourType;
      }
    }
    
    setFormData({
      ...formData,
      trips: updatedTrips
    });
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
        pax: Number(trip.pax)
      }));

      const payload = {
        voucherNumber: generatedVoucher.voucherNumber, 
        clientName: formData.clientName,
        nationality: formData.nationality,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        totalAmount: Number(formData.totalAmount),
        hotels: formData.hotels,
        transfers: formData.transfers,
        trips: formattedTrips,
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
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Voucher Generator</h2>
      
      {loading && !showPreview ? (
        <div className="flex justify-center items-center h-40">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {!showPreview ? (
            <Card className="dark:bg-gray-800">
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
                  <Label htmlFor="totalAmount" value="Total Amount ($)" className="mb-2 block" />
                  <TextInput
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    required
                  />
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
                        <TextInput
                          id="advancedAmount"
                          name="advancedAmount"
                          type="number"
                          placeholder="Advanced Amount ($)"
                          value={formData.advancedAmount}
                          onChange={(e) => {
                            handleInputChange(e);
                            handleAdvancedAmountChange(e);
                          }}
                          required={formData.advancedPayment}
                        />
                      </div>
                      <div>
                        <TextInput
                          id="remainingAmount"
                          name="remainingAmount"
                          type="number"
                          placeholder="Remaining Amount ($)"
                          value={formData.remainingAmount}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                  )}
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
                      name="arrivalDate"
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
                      name="departureDate"
                      className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                      value={formData.departureDate}
                      min={formData.arrivalDate}
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
              </div>
              
              {/* Hotels Section */}
              <div className="mt-6 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold dark:text-white">Hotels</h3>
                  <Button size="sm" onClick={handleAddHotel} className="bg-blue-500 text-white hover:bg-blue-600">+ Add Hotel</Button>
                </div>
                
                {formData.hotels.map((hotel, index) => (
                  <div key={`hotel-${index}`} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium dark:text-white">Hotel {index + 1}</h4>
                      {formData.hotels.length > 1 && (
                        <button 
                          onClick={() => handleRemoveHotel(index)} 
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
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
                        <Label value="Hotel Name" className="mb-2 block" />
                        <Select 
                          value={hotel.hotelName} 
                          onChange={(e) => handleHotelChange(index, 'hotelName', e.target.value)}
                        >
                          <option value="">Select Hotel</option>
                          {hotels
                            .filter(h => !hotel.city || h.city === hotel.city)
                            .map(h => (
                              <option key={h._id} value={h.name}>{h.name}</option>
                            ))}
                        </Select>
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
                  <Button size="sm" onClick={handleAddTransfer} className="bg-blue-500 text-white hover:bg-blue-600">+ Add Transfer</Button>
                </div>
                
                {formData.transfers.map((transfer, index) => (
                  <div key={`transfer-${index}`} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium dark:text-white">Transfer {index + 1}</h4>
                      {formData.transfers.length > 1 && (
                        <button 
                          onClick={() => handleRemoveTransfer(index)} 
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label value="Type" className="mb-2 block" />
                        <Select 
                          value={transfer.type} 
                          onChange={(e) => handleTransferChange(index, 'type', e.target.value)}
                        >
                          <option value="ARV">Arrival (ARV)</option>
                          <option value="DEP">Departure (DEP)</option>
                        </Select>
                      </div>
                      
                      <div>
                        <Label value="Date" className="mb-2 block" />
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
                          />
                          <input 
                            type="date" 
                            className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                            value={formData.transfers[index].date}
                            onChange={(e) => updateTransferDate(index, e.target.value)}
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
                          value={transfer.city}
                          onChange={(e) => handleTransferChange(index, 'city', e.target.value)}
                        >
                          <option value="">Select a city</option>
                          {cities.map((city, i) => (
                            <option key={`transfer-city-opt-${i}`} value={city}>{city}</option>
                          ))}
                        </Select>
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
                  <Button size="sm" onClick={handleAddTrip} className="bg-blue-500 text-white hover:bg-blue-600">+ Add Trip</Button>
                </div>
                
                {formData.trips.map((trip, index) => (
                  <div key={`trip-${index}`} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium dark:text-white">Trip {index + 1}</h4>
                      {formData.trips.length > 1 && (
                        <button 
                          onClick={() => handleRemoveTrip(index)} 
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
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
                        <Label value="Tour Name" className="mb-2 block" />
                        <Select 
                          value={trip.tourName} 
                          onChange={(e) => handleTripChange(index, 'tourName', e.target.value)}
                        >
                          <option value="">Select Tour</option>
                          {tours
                            .filter(t => !trip.city || t.city === trip.city)
                            .map(t => (
                              <option key={t._id} value={t.name}>{t.name}</option>
                            ))}
                        </Select>
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
              
              <div className="flex justify-end mt-6">
                <Button gradientDuoTone="purpleToPink" onClick={handlePreview}>
                  Preview Voucher
                </Button>
              </div>
            </Card>
          ) : (
            <div>
              <div className="flex justify-between mb-4">
                <Button color="gray" onClick={() => setShowPreview(false)}>
                  Back to Edit
                </Button>
                <Button gradientDuoTone="purpleToPink" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <div className="relative w-5 h-5 mr-2">
                      <div className="absolute top-0 left-0 w-full h-full border-2 border-white rounded-full opacity-25"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-2 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : null}
                  Save Voucher
                </Button>
              </div>
              
              <VoucherPreview 
                voucherData={generatedVoucher || { ...formData, voucherNumber: 10000 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 