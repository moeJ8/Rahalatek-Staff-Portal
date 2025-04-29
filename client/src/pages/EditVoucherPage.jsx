import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, TextInput, Select, Label, Checkbox } from 'flowbite-react';
import axios from 'axios';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

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
    arrivalDate: '',
    departureDate: '',
    totalAmount: 0,
    hotels: [],
    transfers: [],
    trips: [],
    advancedPayment: false,
    advancedAmount: 0,
    remainingAmount: 0
  });
  
  // Date display formatting
  const [displayArrivalDate, setDisplayArrivalDate] = useState('');
  const [displayDepartureDate, setDisplayDepartureDate] = useState('');
  
  // Hotels, Cities, and Tours data
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
        setVoucher(voucherData);
        
        // Set form data from voucher
        setFormData({
          clientName: voucherData.clientName || '',
          nationality: voucherData.nationality || '',
          arrivalDate: voucherData.arrivalDate ? new Date(voucherData.arrivalDate).toISOString().split('T')[0] : '',
          departureDate: voucherData.departureDate ? new Date(voucherData.departureDate).toISOString().split('T')[0] : '',
          totalAmount: voucherData.totalAmount || 0,
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
          advancedPayment: voucherData.advancedPayment || false,
          advancedAmount: voucherData.advancedAmount || 0,
          remainingAmount: voucherData.remainingAmount || 0
        });
        
        // Set hotels and tours data
        setHotels(hotelsResponse.data);
        setTours(toursResponse.data);
        
        // Extract unique cities
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
    if (field === 'hotelName') {
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
  };
  
  const handleRemoveHotel = (index) => {
    const updatedHotels = [...formData.hotels];
    updatedHotels.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      hotels: updatedHotels
    }));
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
  
  // Trip handlers
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
  };
  
  const handleRemoveTrip = (index) => {
    const updatedTrips = [...formData.trips];
    updatedTrips.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      trips: updatedTrips
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-40">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
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
      
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Edit Voucher #{voucher?.voucherNumber}
      </h1>
      
      <Card className="mb-8">
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
                      setFormData(prev => ({
                        ...prev,
                        arrivalDate: newIsoDate
                      }));
                      
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
                  setFormData(prev => ({
                    ...prev,
                    arrivalDate: newIsoDate
                  }));
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
                      setFormData(prev => ({
                        ...prev,
                        departureDate: newIsoDate
                      }));
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
                  setFormData(prev => ({
                    ...prev,
                    departureDate: newIsoDate
                  }));
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
            <Button size="sm" onClick={handleAddHotel}>+ Add Hotel</Button>
          </div>
          
          {formData.hotels.map((hotel, index) => (
            <div key={`hotel-${index}`} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium dark:text-white">Hotel {index + 1}</h4>
                {formData.hotels.length > 1 && (
                  <Button 
                    color="failure"
                    size="xs"
                    onClick={() => handleRemoveHotel(index)}
                  >
                    Remove
                  </Button>
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
            <Button size="sm" onClick={handleAddTransfer}>+ Add Transfer</Button>
          </div>
          
          {formData.transfers.map((transfer, index) => (
            <div key={`transfer-${index}`} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium dark:text-white">Transfer {index + 1}</h4>
                {formData.transfers.length > 1 && (
                  <Button 
                    color="failure"
                    size="xs"
                    onClick={() => handleRemoveTransfer(index)}
                  >
                    Remove
                  </Button>
                )}
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
            <Button size="sm" onClick={handleAddTrip}>+ Add Trip</Button>
          </div>
          
          {formData.trips.map((trip, index) => (
            <div key={`trip-${index}`} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium dark:text-white">Trip {index + 1}</h4>
                {formData.trips.length > 1 && (
                  <Button 
                    color="failure"
                    size="xs"
                    onClick={() => handleRemoveTrip(index)}
                  >
                    Remove
                  </Button>
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
          <Button 
            gradientDuoTone="purpleToPink" 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center"
          >
            {saving ? (
              <>
                <div className="relative w-5 h-5 mr-2">
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-white rounded-full opacity-25"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-t-white rounded-full animate-spin"></div>
                </div>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2 mt-1" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
} 