import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Label, Card, Checkbox, Alert, } from 'flowbite-react'
import TextInput from './TextInput'
import Select from './Select'
import BookingMessage from './BookingMessage'
import TourSelector from './TourSelector'
import RoomAllocator from './RoomAllocator'
import PriceBreakdown from './PriceBreakdown'
import HotelDetailModal from './HotelDetailModal'
import SearchableSelect from './SearchableSelect'
import CheckBoxDropDown from './CheckBoxDropDown'
import CustomButton from './CustomButton'
import CustomDatePicker from './CustomDatePicker'
import RahalatekLoader from './RahalatekLoader'
import { FaInfoCircle, FaUndoAlt } from 'react-icons/fa'
import { 
  calculateDuration,
  calculateMultiHotelTotalPrice
} from '../utils/pricingUtils'
import { generateBookingMessage } from '../utils/messageGenerator'
import { 
  getCountries, 
  getCitiesByCountry, 
  getCountryOptions,
  getCityOptions
} from '../utils/countryCities'

export default function BookingForm() {
    // Initial state from localStorage or defaults
    const getSavedState = () => {
      try {
        const savedData = localStorage.getItem('bookingFormData');
        if (savedData) {
          return JSON.parse(savedData);
        }
      } catch (err) {
        console.error('Failed to load saved form data:', err);
        localStorage.removeItem('bookingFormData');
      }
      return null;
    };
    const savedState = getSavedState();
    const [hotels, setHotels] = useState([]);
    const [tours, setTours] = useState([]);
    const [airports, setAirports] = useState([]);
    
    // Replace single hotel selection with array of hotel entries
    const [hotelEntries, setHotelEntries] = useState(savedState?.hotelEntries || []);
    const [selectedCountries, setSelectedCountries] = useState(savedState?.selectedCountries || []);
    const [selectedCities, setSelectedCities] = useState(savedState?.selectedCities || []);
    const [message, setMessage] = useState('');
    const [availableTours, setAvailableTours] = useState([]);
    const [selectedTours, setSelectedTours] = useState(savedState?.selectedTours || []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // For hotel detail modal
    const [selectedHotelForModal, setSelectedHotelForModal] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    
    // For date handling
    const [startDate, setStartDate] = useState(savedState?.startDate || '');
    const [endDate, setEndDate] = useState(savedState?.endDate || '');
    const [displayStartDate, setDisplayStartDate] = useState('');
    const [displayEndDate, setDisplayEndDate] = useState('');
    
    const [numGuests, setNumGuests] = useState(savedState?.numGuests || 2);
    const [includeChildren, setIncludeChildren] = useState(savedState?.includeChildren || false);
    const [childrenUnder3, setChildrenUnder3] = useState(savedState?.childrenUnder3 || 0);
    const [children3to6, setChildren3to6] = useState(savedState?.children3to6 || 0);
    const [children6to12, setChildren6to12] = useState(savedState?.children6to12 || 0);
    const [tripPrice, setTripPrice] = useState(savedState?.tripPrice || '');
    const [includeReception, _setIncludeReception] = useState(savedState?.includeReception !== undefined ? savedState.includeReception : true);
    const [includeFarewell, _setIncludeFarewell] = useState(savedState?.includeFarewell !== undefined ? savedState.includeFarewell : true);
    const [transportVehicleType, _setTransportVehicleType] = useState(savedState?.transportVehicleType || 'Vito');
    const [selectedAirport, _setSelectedAirport] = useState(savedState?.selectedAirport || '');

    // Set error with timeout
    const setErrorWithTimeout = (errorMessage) => {
      setError(errorMessage);
      setTimeout(() => {
        setError('');
      }, 5000); // 5 seconds
    };

    // Reset form function
    const resetForm = () => {
      // Reset all form fields to initial values
      setHotelEntries([]);
      setSelectedCountries([]);
      setSelectedCities([]);
      setMessage('');
      setSelectedTours([]);
      setStartDate('');
      setEndDate('');
      setDisplayStartDate('');
      setDisplayEndDate('');
      setNumGuests(2);
      setIncludeChildren(false);
      setChildrenUnder3(0);
      setChildren3to6(0);
      setChildren6to12(0);
      setTripPrice('');
      _setIncludeReception(true);
      _setIncludeFarewell(true);
      _setTransportVehicleType('Vito');
      _setSelectedAirport('');
      
      // Clear localStorage
      localStorage.removeItem('bookingFormData');
    };

    // Save form data to localStorage whenever relevant state changes
    useEffect(() => {
      const saveFormData = () => {
        try {
          const formData = {
            selectedCountries,
            selectedCities,
            hotelEntries,
            startDate,
            endDate,
            numGuests,
            includeChildren,
            childrenUnder3,
            children3to6,
            children6to12,
            selectedTours,
            includeReception,
            includeFarewell,
            transportVehicleType,
            includeBreakfast: hotelEntries.some(entry => entry.includeBreakfast),
            tripPrice,
            selectedAirport
          };
          
          localStorage.setItem('bookingFormData', JSON.stringify(formData));
        } catch (err) {
          console.error('Failed to save form data:', err);
        }
      };
      
      saveFormData();
    }, [
      selectedCountries,
      selectedCities, 
      hotelEntries,
      startDate, 
      endDate, 
      numGuests, 
      includeChildren, 
      childrenUnder3, 
      children3to6, 
      children6to12, 
      selectedTours, 
      includeReception,
      includeFarewell,
      transportVehicleType,
      tripPrice,
      selectedAirport
    ]);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [hotelResponse, tourResponse, airportResponse] = await Promise.all([
            axios.get('/api/hotels'),
            axios.get('/api/tours'),
            axios.get('/api/airports')
          ]);
          
          setHotels(hotelResponse.data);
          setTours(tourResponse.data);
          setAirports(airportResponse.data);
          setError('');
        } catch (err) {
          console.log(err);
          setError('Failed to load data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);
    

    const getAirportArabicName = (airportName) => {
      if (!airportName || !airports || airports.length === 0) {
        return 'المطار';
      }
      
      const airport = airports.find(a => a.name === airportName);

      if (!airport || !airport.arabicName) {
        console.log(`No Arabic name found for airport: ${airportName}`);
        return 'المطار';
      }
      
      return airport.arabicName;
    };
    

    // Update cities when countries change
    useEffect(() => {
      if (selectedCountries.includes('')) {
        // "All Countries" selected - show all cities
        const allCities = getCountries().flatMap(country => getCitiesByCountry(country));
        setSelectedCities([...new Set(allCities)]);
      } else if (selectedCountries.length > 0) {
        // Specific countries selected - show only their cities
        const countriesCities = selectedCountries.flatMap(country => getCitiesByCountry(country));
        const uniqueCities = [...new Set(countriesCities)];
        
        // Keep only cities that belong to selected countries
        setSelectedCities(prevCities => 
          prevCities.filter(city => uniqueCities.includes(city))
        );
      } else {
        // No countries selected - clear cities
        setSelectedCities([]);
      }
    }, [selectedCountries]);

    useEffect(() => {
      if (selectedCities.length > 0) {
        const filteredTours = tours.filter(tour => selectedCities.includes(tour.city));
        setAvailableTours(filteredTours);
      } else {
        setAvailableTours([]);
      }
    }, [selectedCities, tours]);

  
  const handleCountrySelection = (countries) => {
    setSelectedCountries(countries);
    // Clear hotel entries and tours when countries change
    setHotelEntries([]);
    setSelectedTours([]);
  };

  const handleCitySelection = (cities) => {
    setSelectedCities(cities);
    // Clear hotel entries and tours when cities change
    setHotelEntries([]);
    setSelectedTours([]);
  };

  const handleNumGuestsChange = (e) => {
    const newGuestCount = parseInt(e.target.value);
    setNumGuests(newGuestCount);
    
    // Reset all room allocations when guest count changes
    const updatedEntries = hotelEntries.map(entry => ({
      ...entry,
      roomAllocations: []
    }));
    
    setHotelEntries(updatedEntries);
  };

  const handleAddHotel = () => {
    setHotelEntries([
      ...hotelEntries,
      {
        hotelId: '',
        hotelData: null,
        checkIn: startDate,
        checkOut: endDate,
        displayCheckIn: displayStartDate,
        displayCheckOut: displayEndDate,
        roomAllocations: [],
        includeBreakfast: true,
        selectedAirport: selectedAirport,
        includeReception: includeReception,
        includeFarewell: includeFarewell,
        transportVehicleType: transportVehicleType
      }
    ]);
  };

  const handleRemoveHotel = (index) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries.splice(index, 1);
    setHotelEntries(updatedEntries);
  };

  const handleHotelChange = (index, hotelId) => {
    const updatedEntries = [...hotelEntries];
    const hotelData = hotels.find(hotel => hotel._id === hotelId);
    
    updatedEntries[index] = {
      ...updatedEntries[index],
      hotelId,
      hotelData,
      roomAllocations: [] // Reset room allocations when hotel changes
    };
    
    setHotelEntries(updatedEntries);
  };

  const handleHotelDateChange = (index, field, value, displayValue) => {
    const updatedEntries = [...hotelEntries];
    
    if (field === 'checkIn') {
      updatedEntries[index].checkIn = value;
      updatedEntries[index].displayCheckIn = displayValue;
      
      // If check-out is before check-in, update check-out
      if (updatedEntries[index].checkOut && updatedEntries[index].checkOut < value) {
        updatedEntries[index].checkOut = value;
        updatedEntries[index].displayCheckOut = displayValue;
      }
    } else if (field === 'checkOut') {
      updatedEntries[index].checkOut = value;
      updatedEntries[index].displayCheckOut = displayValue;
    }
    
    setHotelEntries(updatedEntries);
  };

  const handleHotelBreakfastChange = (index, value) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[index].includeBreakfast = value;
    setHotelEntries(updatedEntries);
  };

  const handleAddRoom = (hotelIndex) => {
    const updatedEntries = [...hotelEntries];
    
    updatedEntries[hotelIndex].roomAllocations = [
      ...updatedEntries[hotelIndex].roomAllocations,
      { 
        roomTypeIndex: "", 
        occupants: 1,
        childrenUnder3: 0,
        children3to6: 0,
        children6to12: 0
      }
    ];
    
    setHotelEntries(updatedEntries);
  };

  const handleRemoveRoom = (hotelIndex, roomIndex) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[hotelIndex].roomAllocations.splice(roomIndex, 1);
    setHotelEntries(updatedEntries);
  };

  const handleRoomTypeSelect = (hotelIndex, roomIndex, roomTypeIndex) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[hotelIndex].roomAllocations[roomIndex].roomTypeIndex = roomTypeIndex;
    setHotelEntries(updatedEntries);
  };

  const handleOccupantsChange = (hotelIndex, roomIndex, occupants) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[hotelIndex].roomAllocations[roomIndex].occupants = parseInt(occupants);
    setHotelEntries(updatedEntries);
  };

  const handleChildrenUnder3Change = (hotelIndex, roomIndex, count) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[hotelIndex].roomAllocations[roomIndex].childrenUnder3 = count;
    setHotelEntries(updatedEntries);
  };

  const handleChildren3to6Change = (hotelIndex, roomIndex, count) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[hotelIndex].roomAllocations[roomIndex].children3to6 = count;
    setHotelEntries(updatedEntries);
  };

  const handleChildren6to12Change = (hotelIndex, roomIndex, count) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[hotelIndex].roomAllocations[roomIndex].children6to12 = count;
    setHotelEntries(updatedEntries);
  };

  const handleHotelAirportChange = (index, airport) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[index].selectedAirport = airport;
    setHotelEntries(updatedEntries);
  };

  const handleHotelReceptionChange = (index, value) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[index].includeReception = value;
    setHotelEntries(updatedEntries);
  };
  
  const handleHotelFarewellChange = (index, value) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[index].includeFarewell = value;
    setHotelEntries(updatedEntries);
  };

  const handleHotelVehicleTypeChange = (index, vehicleType) => {
    const updatedEntries = [...hotelEntries];
    updatedEntries[index].transportVehicleType = vehicleType;
    setHotelEntries(updatedEntries);
  };

  const getTotalPrice = () => {
    // If the user has entered a trip price manually, we should respect it
    // Only use manual price if it's a non-empty string entered by the user
    if (tripPrice && typeof tripPrice === 'string' && tripPrice.trim() !== '' && parseFloat(tripPrice) > 0) {
      return parseFloat(tripPrice);
    }
    
    // Use calculateMultiHotelTotalPrice to properly include transportation costs
    if (hotelEntries.length > 0 && hotelEntries.every(entry => entry.hotelData)) {
      const priceDetails = calculateMultiHotelTotalPrice({
        hotelEntries,
        numGuests,
        includeChildren,
        childrenUnder3,
        children3to6,
        children6to12,
        selectedTours,
        tours
      });
      
      return priceDetails.total;
    }
    
    return 0;
  };

  const handleGenerateMessage = () => {
    let finalPrice;
    // Only use manual price if it's explicitly entered by the user
    if (tripPrice && typeof tripPrice === 'string' && tripPrice.trim() !== '' && parseFloat(tripPrice) > 0) {
      finalPrice = parseFloat(tripPrice);
    } else {
      finalPrice = getTotalPrice();
    }
    
    // Validate that at least one hotel is selected
    if (hotelEntries.length === 0) {
      setErrorWithTimeout('Please select at least one hotel.');
      return;
    }
    
    // Validate each hotel entry
    for (let i = 0; i < hotelEntries.length; i++) {
      const entry = hotelEntries[i];
      
      if (!entry.hotelData || !entry.checkIn || !entry.checkOut) {
        setErrorWithTimeout(`Please fill in all required fields for hotel #${i + 1}.`);
        return;
      }
      
      if (!entry.selectedAirport) {
        setErrorWithTimeout(`Please select an airport for hotel #${i + 1}.`);
        return;
      }
      
      if (entry.hotelData.roomTypes && entry.hotelData.roomTypes.length > 0) {
        const assignedGuests = entry.roomAllocations.reduce((sum, room) => sum + room.occupants, 0);
        if (assignedGuests < numGuests) {
          setErrorWithTimeout(`Please assign room types for all ${numGuests} guests in hotel ${entry.hotelData.name}.`);
          return;
        }
        
        if (includeChildren) {
          const childrenUnder3Allocated = entry.roomAllocations.reduce((sum, room) => sum + (room.childrenUnder3 || 0), 0);
          const children3to6Allocated = entry.roomAllocations.reduce((sum, room) => sum + (room.children3to6 || 0), 0);
          const children6to12Allocated = entry.roomAllocations.reduce((sum, room) => sum + (room.children6to12 || 0), 0);
          
          if (childrenUnder3Allocated !== childrenUnder3 || 
              children3to6Allocated !== children3to6 || 
              children6to12Allocated !== children6to12) {
            setErrorWithTimeout(`Please assign all children to rooms in hotel ${entry.hotelData.name}.`);
            return;
          }
        }
      }
      
      // Apply selected airport to the hotelData
      entry.hotelData = {
        ...entry.hotelData,
        airport: entry.selectedAirport || (entry.hotelData.airportTransportation?.length > 0 
          ? entry.hotelData.airportTransportation[0]?.airport 
          : entry.hotelData.airport)
      };
    }
    
    // Generate message with multiple hotels
    const message = generateBookingMessage({
      hotelEntries,
      selectedCities,
      startDate,
      endDate,
      numGuests,
      includeChildren,
      childrenUnder3,
      children3to6,
      children6to12,
      tripPrice: tripPrice && typeof tripPrice === 'string' && tripPrice.trim() !== '' ? tripPrice : finalPrice.toString(),
      calculatedPrice: finalPrice,
      transportVehicleType,
      selectedTours,
      tours,
      getAirportArabicName
    });

    setMessage(message);
    
    // Clear the saved form data after successfully generating the message
    localStorage.removeItem('bookingFormData');
  };

  const allRoomAllocationsComplete = () => {
    if (hotelEntries.length === 0) {
      return false;
    }
    
    return hotelEntries.every(entry => {
      if (!entry.hotelData || !entry.hotelData.roomTypes || entry.hotelData.roomTypes.length === 0) {
        return true;
      }
      
      const adultsAllocated = entry.roomAllocations.reduce((sum, room) => sum + room.occupants, 0) === numGuests;
      
      if (!includeChildren) {
        return adultsAllocated;
      }
      
      const childrenUnder3Allocated = entry.roomAllocations.reduce((sum, room) => sum + (room.childrenUnder3 || 0), 0) === childrenUnder3;
      const children3to6Allocated = entry.roomAllocations.reduce((sum, room) => sum + (room.children3to6 || 0), 0) === children3to6;
      const children6to12Allocated = entry.roomAllocations.reduce((sum, room) => sum + (room.children6to12 || 0), 0) === children6to12;
      
      return adultsAllocated && childrenUnder3Allocated && children3to6Allocated && children6to12Allocated;
    });
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
  

  
  useEffect(() => {
    if (startDate) {
      setDisplayStartDate(formatDateForDisplay(startDate));
    }
    if (endDate) {
      setDisplayEndDate(formatDateForDisplay(endDate));
    }
  }, [startDate, endDate]);

  // Add the missing tour selection functions
  const handleTourSelection = (tourId) => {
    setSelectedTours(prevSelected => {
      if (prevSelected.includes(tourId)) {
        return prevSelected.filter(id => id !== tourId);
      } else {
        return [...prevSelected, tourId];
      }
    });
  };

  const handleTourDayAssignment = (tourId, dayIndex) => {
    setSelectedTours(prevSelected => {
      // Create a copy of the current array
      const newSelected = [...prevSelected];
      
      // Remove the tour from its current position
      const currentIndex = newSelected.indexOf(tourId);
      if (currentIndex !== -1) {
        newSelected.splice(currentIndex, 1);
      }
      
      // Insert the tour at the new position (dayIndex)
      // Ensure dayIndex is at most the current length of the array (after removal)
      const insertIndex = Math.min(dayIndex, newSelected.length);
      newSelected.splice(insertIndex, 0, tourId);
      
      return newSelected;
    });
  };

  // Keep these functions for backward compatibility and alternative method
  const moveTourUp = (tourId) => {
    setSelectedTours(prevSelected => {
      const index = prevSelected.indexOf(tourId);
      if (index <= 0) return prevSelected;
      
      const newSelected = [...prevSelected];
      [newSelected[index], newSelected[index - 1]] = [newSelected[index - 1], newSelected[index]];
      return newSelected;
    });
  };

  const moveTourDown = (tourId) => {
    setSelectedTours(prevSelected => {
      const index = prevSelected.indexOf(tourId);
      if (index < 0 || index >= prevSelected.length - 1) return prevSelected;
      
      const newSelected = [...prevSelected];
      [newSelected[index], newSelected[index + 1]] = [newSelected[index + 1], newSelected[index]];
      return newSelected;
    });
  };

  // Functions for hotel detail modal
  const openHotelDetailModal = (hotel) => {
    setSelectedHotelForModal(hotel);
    setDetailModalOpen(true);
  };
  
  const closeHotelDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedHotelForModal(null);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-2xl font-bold text-center sm:text-left dark:text-white">Booking Form</h2>
          <CustomButton 
            variant="gray" 
            size="xs" 
            onClick={resetForm}
            className="self-center sm:self-auto"
            icon={FaUndoAlt}
          >
            Reset
          </CustomButton>
        </div>
      </div>
      
      {loading ? (
        <div className="py-8">
          <RahalatekLoader size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <CustomDatePicker
                label="Package Start Date"
                value={startDate}
                onChange={(newIsoDate) => {
                  setStartDate(newIsoDate);
                  setDisplayStartDate(formatDateForDisplay(newIsoDate));
                  
                  // If end date is before the new start date, update it
                  if (endDate && endDate < newIsoDate) {
                    setEndDate(newIsoDate);
                    setDisplayEndDate(formatDateForDisplay(newIsoDate));
                  }
                }}
                required
              />
            </div>
            
            <div>
              <CustomDatePicker
                label="Package End Date"
                value={endDate}
                min={startDate || ''}
                onChange={(newIsoDate) => {
                  setEndDate(newIsoDate);
                  setDisplayEndDate(formatDateForDisplay(newIsoDate));
                }}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2 block">
                <Label value="Select Countries" className="dark:text-white text-sm font-medium" />
              </div>
              <CheckBoxDropDown
                id="countrySelection"
                value={selectedCountries}
                onChange={handleCountrySelection}
                options={getCountryOptions()}
                placeholder="Select countries..."
                allOptionsLabel="All Countries"
                allowMultiple={true}
                allowEmpty={true}
              />
            </div>
            
            <div className={`${selectedCountries.length === 0 && !selectedCountries.includes('') ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="mb-2 block">
                <Label value="Select Cities" className="dark:text-white text-sm font-medium" />
              </div>
              <CheckBoxDropDown
                id="citySelection"
                value={selectedCities}
                onChange={handleCitySelection}
                options={(() => {
                  if (selectedCountries.includes('')) {
                    // Show all cities if "All Countries" is selected
                    const allCities = getCountries().flatMap(country => getCitiesByCountry(country));
                    return [...new Set(allCities)].sort().map(city => ({
                      value: city,
                      label: city
                    }));
                  } else if (selectedCountries.length > 0) {
                    // Show only cities from selected countries
                    const countriesCities = selectedCountries.flatMap(country => getCitiesByCountry(country));
                    return [...new Set(countriesCities)].sort().map(city => ({
                      value: city,
                      label: city
                    }));
                  } else {
                    // No countries selected - show empty options
                    return [];
                  }
                })()}
                placeholder={selectedCountries.length === 0 && !selectedCountries.includes('') ? "Select countries first..." : "Select cities..."}
                allOptionsLabel="All Cities"
                allowMultiple={true}
                disabled={selectedCountries.length === 0 && !selectedCountries.includes('')}
              />
            </div>
          </div>
          
          {/* Guest Information Card */}
          <Card className="dark:bg-slate-900 overflow-hidden">
            <h4 className="text-lg font-semibold dark:text-white mb-4">Guest Information</h4>
            
            <div className="flex items-center mb-3">
              <Checkbox
                id="includeChildren"
                checked={includeChildren}
                onChange={(e) => setIncludeChildren(e.target.checked)}
                className="mr-2"
              />
              <Label htmlFor="includeChildren" className="dark:text-white">
                Include children
              </Label>
            </div>
            
            <div className={`grid ${includeChildren ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="numGuests" value="Number of Adults" className="dark:text-white" />
                </div>
                <TextInput
                  id="numGuests"
                  type="number"
                  value={numGuests}
                  onChange={handleNumGuestsChange}
                  min={1}
                  required
                />
              </div>
              
              {includeChildren && (
                <>
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="childrenUnder3" value="Children (0-3 years)" className="dark:text-white" />
                    </div>
                    <TextInput
                      id="childrenUnder3"
                      type="number"
                      value={childrenUnder3}
                      onChange={(e) => setChildrenUnder3(parseInt(e.target.value) || 0)}
                      min={0}
                    />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Free on tours</p>
                  </div>
                  
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="children3to6" value="Children (3-6 years)" className="dark:text-white" />
                    </div>
                    <TextInput
                      id="children3to6"
                      type="number"
                      value={children3to6}
                      onChange={(e) => setChildren3to6(parseInt(e.target.value) || 0)}
                      min={0}
                    />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Free accommodation</p>
                  </div>
                  
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="children6to12" value="Children (6-12 years)" className="dark:text-white" />
                    </div>
                    <TextInput
                      id="children6to12"
                      type="number"
                      value={children6to12}
                      onChange={(e) => setChildren6to12(parseInt(e.target.value) || 0)}
                      min={0}
                    />
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Special hotel rate</p>
                  </div>
                </>
              )}
            </div>
          </Card>
          
          {/* Hotels Section */}
          <div className="mt-8 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-center dark:text-white">Hotels</h3>
              <CustomButton 
                onClick={handleAddHotel}
                variant="pinkToOrange"
                size="sm"
                disabled={!selectedCities.length || !startDate || !endDate}
              >
                + Add Hotel
              </CustomButton>
            </div>
            
            {hotelEntries.map((entry, hotelIndex) => (
              <Card key={hotelIndex} className="dark:bg-slate-900 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold dark:text-white">Hotel #{hotelIndex + 1}</h4>
                  {hotelEntries.length > 1 && (
                    <CustomButton 
                      onClick={() => handleRemoveHotel(hotelIndex)}
                      variant="red"
                      size="xs"
                    >
                      Remove
                    </CustomButton>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor={`hotelSelect-${hotelIndex}`} value="Select Hotel" className="dark:text-white" />
                    </div>
                    <SearchableSelect
                      id={`hotelSelect-${hotelIndex}`}
                      value={entry.hotelId}
                      onChange={(e) => handleHotelChange(hotelIndex, e.target.value)}
                      options={hotels
                        .filter(hotel => selectedCities.length === 0 || selectedCities.includes(hotel.city))
                        .map((hotel) => ({
                          value: hotel._id,
                          label: `${hotel.name} (${hotel.stars}★) - ${hotel.city}`
                        }))}
                      placeholder="Select Hotel"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <CustomDatePicker
                        label="Check-in Date"
                        value={entry.checkIn || ''}
                        min={startDate}
                        max={endDate}
                        onChange={(newIsoDate) => {
                          handleHotelDateChange(hotelIndex, 'checkIn', newIsoDate, formatDateForDisplay(newIsoDate));
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <CustomDatePicker
                        label="Check-out Date"
                        value={entry.checkOut || ''}
                        min={entry.checkIn || startDate}
                        max={endDate}
                        onChange={(newIsoDate) => {
                          handleHotelDateChange(hotelIndex, 'checkOut', newIsoDate, formatDateForDisplay(newIsoDate));
                        }}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`includeBreakfast-${hotelIndex}`}
                      checked={entry.includeBreakfast}
                      onChange={(e) => handleHotelBreakfastChange(hotelIndex, e.target.checked)}
                    />
                    <Label htmlFor={`includeBreakfast-${hotelIndex}`} className="dark:text-white">
                      Include breakfast (if available)
                    </Label>
                  </div>
                  
                  {/* Hotel Info & Room Allocation */}
                  {entry.hotelData && (
                    <div className="space-y-6 mt-4">
                      {/* Hotel Details Button */}
                      <div className="flex justify-center">
                        <CustomButton 
                          variant="pinkToOrange"
                          size="md"
                          onClick={() => openHotelDetailModal(entry.hotelData)}
                          icon={FaInfoCircle}
                        >
                          Show Hotel Details
                        </CustomButton>
                      </div>
                      
                      {/* Room Allocation Card */}
                      {entry.hotelData.roomTypes && entry.hotelData.roomTypes.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-600 mt-4">
                          <h4 className="text-lg font-semibold mb-4 text-center dark:text-white">Room Allocation</h4>
                          <RoomAllocator
                            selectedHotelData={entry.hotelData}
                            numGuests={numGuests}
                            roomAllocations={entry.roomAllocations}
                            onAddRoom={() => handleAddRoom(hotelIndex)}
                            onRemoveRoom={(roomIndex) => handleRemoveRoom(hotelIndex, roomIndex)}
                            onRoomTypeSelect={(roomIndex, typeIndex) => handleRoomTypeSelect(hotelIndex, roomIndex, typeIndex)}
                            onOccupantsChange={(roomIndex, occupants) => handleOccupantsChange(hotelIndex, roomIndex, occupants)}
                            includeChildren={includeChildren}
                            childrenUnder3={childrenUnder3}
                            children3to6={children3to6}
                            children6to12={children6to12}
                            onChildrenUnder3Change={(roomIndex, count) => handleChildrenUnder3Change(hotelIndex, roomIndex, count)}
                            onChildren3to6Change={(roomIndex, count) => handleChildren3to6Change(hotelIndex, roomIndex, count)}
                            onChildren6to12Change={(roomIndex, count) => handleChildren6to12Change(hotelIndex, roomIndex, count)}
                          />
                        </div>
                      )}
                      
                      {/* Airport & Transportation */}
                      <div className="space-y-4 mt-4 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900">
                        <h6 className="font-medium text-gray-900 dark:text-white">Airport & Transportation</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Select
                              id={`hotelAirport-${hotelIndex}`}
                              label="Hotel Airport"
                              value={entry.selectedAirport || ""}
                              onChange={(value) => handleHotelAirportChange(hotelIndex, value)}
                              placeholder="Select Airport"
                              options={(() => {
                                let airportOptions = [{ value: '', label: 'Select Airport' }];
                                
                                // Only show airports associated with this hotel
                                if (entry.hotelData.airportTransportation && entry.hotelData.airportTransportation.length > 0) {
                                  // If hotel has airportTransportation array, use those airports
                                  airportOptions.push(...entry.hotelData.airportTransportation.map((item) => ({
                                    value: item.airport,
                                    label: item.airport
                                  })));
                                } else if (entry.hotelData.airport) {
                                  // If hotel just has a single airport field, show that
                                  airportOptions.push({
                                    value: entry.hotelData.airport,
                                    label: entry.hotelData.airport
                                  });
                                } else {
                                  // If no airports are found for this hotel, show all airports as fallback
                                  airportOptions.push(...airports.map((airport) => ({
                                    value: airport.name,
                                    label: airport.name
                                  })));
                                }
                                
                                return airportOptions;
                              })()}
                              required
                            />
                          </div>
                          
                          <div>
                            <Select
                              id={`vehicleType-${hotelIndex}`}
                              label="Transport Vehicle Type"
                              value={entry.transportVehicleType || "Vito"}
                              onChange={(value) => handleHotelVehicleTypeChange(hotelIndex, value)}
                              placeholder="Select Vehicle Type"
                              options={[
                                { value: 'Vito', label: 'Vito (2-8 people)' },
                                { value: 'Sprinter', label: 'Sprinter (9-16 people)' },
                                { value: 'Bus', label: 'Bus (+16 people)' }
                              ]}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-3">
                          <Checkbox
                            id={`includeReception-${hotelIndex}`}
                            checked={entry.includeReception}
                            onChange={(e) => handleHotelReceptionChange(hotelIndex, e.target.checked)}
                          />
                          <Label htmlFor={`includeReception-${hotelIndex}`} className="dark:text-white">
                            Include reception from airport
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id={`includeFarewell-${hotelIndex}`}
                            checked={entry.includeFarewell}
                            onChange={(e) => handleHotelFarewellChange(hotelIndex, e.target.checked)}
                          />
                          <Label htmlFor={`includeFarewell-${hotelIndex}`} className="dark:text-white">
                            Include farewell to airport
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          
          <TourSelector 
            availableTours={availableTours}
            selectedTours={selectedTours}
            onTourSelection={handleTourSelection}
            onTourDayAssignment={handleTourDayAssignment}
            onMoveTourUp={moveTourUp}
            onMoveTourDown={moveTourDown}
          />
          
          
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="tripPrice" value="Trip Price ($)" className="dark:text-white" />
            </div>
            <TextInput
              id="tripPrice"
              type="text"
              value={tripPrice}
              onChange={(e) => setTripPrice(e.target.value)}
              placeholder="Will be calculated automatically if left empty"
            />
          </div>
          
          {startDate && endDate && hotelEntries.length > 0 && hotelEntries.every(entry => entry.hotelData && entry.checkIn && entry.checkOut) && (
            <PriceBreakdown
              totalPrice={tripPrice && tripPrice.trim() !== '' ? parseFloat(tripPrice) : null}
              nights={calculateDuration(startDate, endDate)}
              numGuests={numGuests}
              hotelEntries={hotelEntries}
              selectedTours={selectedTours}
              tours={tours}
              includeChildren={includeChildren}
              childrenUnder3={childrenUnder3}
              children3to6={children3to6}
              children6to12={children6to12}
              startDate={startDate}
              endDate={endDate}
            />
          )}
          
          <CustomButton 
            onClick={handleGenerateMessage}
            variant="blueToTeal"
            size="lg"
            className="w-full mt-6"
            disabled={!allRoomAllocationsComplete()}
          >
            Generate Booking Message
          </CustomButton>
          
          {error && (
            <Alert color="failure" className="mt-4">
              <span>{error}</span>
            </Alert>
          )}
          
          {message && <BookingMessage message={message} />}
        </div>
      )}
      
      {/* Hotel Detail Modal */}
      {selectedHotelForModal && (
        <HotelDetailModal 
          isOpen={detailModalOpen} 
          onClose={closeHotelDetailModal} 
          hotelData={selectedHotelForModal} 
        />
      )}
    </div>
  );
};
    