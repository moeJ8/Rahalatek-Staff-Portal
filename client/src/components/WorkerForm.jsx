import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button, TextInput, Select, Label, Card, Checkbox, Alert, Datepicker, Spinner } from 'flowbite-react'
import BookingMessage from './BookingMessage'
import TourSelector from './TourSelector'
import RoomAllocator from './RoomAllocator'
import HotelInfo from './HotelInfo'
import PriceBreakdown from './PriceBreakdown'
import ChildrenSection from './ChildrenSection'
import { 
  calculateTotalPrice, 
  calculateDuration
} from '../utils/pricingUtils'
import { generateBookingMessage } from '../utils/messageGenerator'

export default function WorkerForm() {
    // Initial state from localStorage or defaults
    const getSavedState = () => {
      try {
        const savedData = localStorage.getItem('workerFormData');
        if (savedData) {
          return JSON.parse(savedData);
        }
      } catch (err) {
        console.error('Failed to load saved form data:', err);
        localStorage.removeItem('workerFormData');
      }
      return null;
    };
    const savedState = getSavedState();
    const [hotels, setHotels] = useState([]);
    const [tours, setTours] = useState([]);
    const [airports, setAirports] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(savedState?.selectedHotel || '');
    const [selectedHotelData, setSelectedHotelData] = useState(null);
    const [selectedCity, setSelectedCity] = useState(savedState?.selectedCity || '');
    const [message, setMessage] = useState('');
    const [availableTours, setAvailableTours] = useState([]);
    const [selectedTours, setSelectedTours] = useState(savedState?.selectedTours || []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [roomAllocations, setRoomAllocations] = useState(savedState?.roomAllocations || []);

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
    const [includeReception, setIncludeReception] = useState(savedState?.includeReception !== undefined ? savedState.includeReception : true);
    const [includeFarewell, setIncludeFarewell] = useState(savedState?.includeFarewell !== undefined ? savedState.includeFarewell : true);
    const [transportVehicleType, setTransportVehicleType] = useState(savedState?.transportVehicleType || 'Vito');
    const [includeBreakfast, setIncludeBreakfast] = useState(savedState?.includeBreakfast !== undefined ? savedState.includeBreakfast : true);
    const [selectedAirport, setSelectedAirport] = useState(savedState?.selectedAirport || '');

    // Save form data to localStorage whenever relevant state changes
    useEffect(() => {
      const saveFormData = () => {
        try {
          const formData = {
            selectedCity,
            selectedHotel,
            startDate,
            endDate,
            numGuests,
            includeChildren,
            childrenUnder3,
            children3to6,
            children6to12,
            selectedTours,
            roomAllocations,
            includeReception,
            includeFarewell,
            transportVehicleType,
            includeBreakfast,
            tripPrice,
            selectedAirport
          };
          
          localStorage.setItem('workerFormData', JSON.stringify(formData));
        } catch (err) {
          console.error('Failed to save form data:', err);
        }
      };
      
      saveFormData();
    }, [
      selectedCity, 
      selectedHotel, 
      startDate, 
      endDate, 
      numGuests, 
      includeChildren, 
      childrenUnder3, 
      children3to6, 
      children6to12, 
      selectedTours, 
      roomAllocations, 
      includeReception,
      includeFarewell,
      transportVehicleType,
      includeBreakfast, 
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
    

    useEffect(() => {
      if (selectedCity) {
        const filteredTours = tours.filter(tour => tour.city === selectedCity);
        setAvailableTours(filteredTours);
        setSelectedTours([]);
      } else {
        setAvailableTours([]);
      }
    }, [selectedCity, tours]);

    useEffect(() => {
      if (selectedHotel) {
        const hotelData = hotels.find(hotel => hotel._id === selectedHotel);
        setSelectedHotelData(hotelData);
        
        if (hotelData && hotelData.city !== selectedCity) {
          setSelectedCity(hotelData.city);
        }
      } else {
        setSelectedHotelData(null);
      }
    }, [selectedHotel, hotels, selectedCity]);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedHotel('');
    setSelectedHotelData(null);
  };

  const handleHotelChange = (e) => {
    setSelectedHotel(e.target.value);
  };

  const handleTourSelection = (tourId) => {
    setSelectedTours(prevSelected => {
      if (prevSelected.includes(tourId)) {
        return prevSelected.filter(id => id !== tourId);
      } else {
        return [...prevSelected, tourId];
      }
    });
  };
  
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
  
  const handleAddRoom = () => {
    setRoomAllocations([
      ...roomAllocations,
      { 
        roomTypeIndex: "", 
        occupants: 1,
        childrenUnder3: 0,
        children3to6: 0,
        children6to12: 0
      }
    ]);
  };

  const handleRemoveRoom = (index) => {
    const newAllocations = [...roomAllocations];
    newAllocations.splice(index, 1);
    setRoomAllocations(newAllocations);
  };

  const handleRoomTypeSelect = (roomIndex, roomTypeIndex) => {
    const newAllocations = [...roomAllocations];
    newAllocations[roomIndex].roomTypeIndex = roomTypeIndex;
    setRoomAllocations(newAllocations);
  };

  const handleOccupantsChange = (roomIndex, occupants) => {
    const newAllocations = [...roomAllocations];
    newAllocations[roomIndex].occupants = parseInt(occupants);
    setRoomAllocations(newAllocations);
  };

  const handleChildrenUnder3Change = (roomIndex, count) => {
    const newAllocations = [...roomAllocations];
    newAllocations[roomIndex].childrenUnder3 = count;
    setRoomAllocations(newAllocations);
  };

  const handleChildren3to6Change = (roomIndex, count) => {
    const newAllocations = [...roomAllocations];
    newAllocations[roomIndex].children3to6 = count;
    setRoomAllocations(newAllocations);
  };

  const handleChildren6to12Change = (roomIndex, count) => {
    const newAllocations = [...roomAllocations];
    newAllocations[roomIndex].children6to12 = count;
    setRoomAllocations(newAllocations);
  };

  const handleNumGuestsChange = (e) => {
    const newGuestCount = parseInt(e.target.value);
    setNumGuests(newGuestCount);
    
    setRoomAllocations([]);
  };

  const getTotalPrice = () => {
    // If the user has entered a trip price manually, we should respect it
    if (tripPrice && parseFloat(tripPrice) > 0) {
      return parseFloat(tripPrice);
    }
    
    // Otherwise, calculate the price
    return calculateTotalPrice({
      startDate,
      endDate,
      numGuests,
      includeChildren,
      childrenUnder3,
      children3to6,
      children6to12,
      selectedHotelData,
      roomAllocations,
      includeReception,
      includeFarewell,
      transportVehicleType,
      selectedTours,
      tours,
      includeBreakfast,
      selectedAirport
    });
  };

  const handleGenerateMessage = () => {
    let finalPrice;
    if (tripPrice && parseFloat(tripPrice) > 0) {
      finalPrice = parseFloat(tripPrice);
    } else {
      finalPrice = calculateTotalPrice({
        startDate,
        endDate,
        numGuests,
        includeChildren,
        childrenUnder3,
        children3to6,
        children6to12,
        selectedHotelData,
        roomAllocations,
        includeReception,
        includeFarewell,
        transportVehicleType,
        selectedTours,
        tours,
        includeBreakfast,
        selectedAirport
      });
    }
    
    if (selectedHotelData && selectedCity && startDate && endDate) {
      if (selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0) {
        const assignedGuests = roomAllocations.reduce((sum, room) => sum + room.occupants, 0);
        if (assignedGuests < numGuests) {
          setError(`Please assign room types for all ${numGuests} guests.`);
          return;
        }
        
        if (includeChildren) {
          const childrenUnder3Allocated = roomAllocations.reduce((sum, room) => sum + (room.childrenUnder3 || 0), 0);
          const children3to6Allocated = roomAllocations.reduce((sum, room) => sum + (room.children3to6 || 0), 0);
          const children6to12Allocated = roomAllocations.reduce((sum, room) => sum + (room.children6to12 || 0), 0);
          
          if (childrenUnder3Allocated !== childrenUnder3 || 
              children3to6Allocated !== children3to6 || 
              children6to12Allocated !== children6to12) {
            setError('Please assign all children to rooms.');
            return;
          }
        }
      }
      
      // Apply selected airport to the hotelData
      const hotelDataWithAirport = {
        ...selectedHotelData,
        airport: selectedAirport || (selectedHotelData.airportTransportation?.length > 0 
          ? selectedHotelData.airportTransportation[0]?.airport 
          : selectedHotelData.airport)
      };
      
      // Use the finalized price for the message
      const message = generateBookingMessage({
        selectedHotelData: hotelDataWithAirport,
        selectedCity,
        startDate,
        endDate,
        numGuests,
        includeChildren,
        childrenUnder3,
        children3to6,
        children6to12,
        tripPrice: finalPrice.toString(),
        calculatedPrice: finalPrice,
        includeReception,
        includeFarewell,
        transportVehicleType,
        includeBreakfast,
        roomAllocations,
        selectedTours,
        tours,
        getAirportArabicName
      });

      setMessage(message);
      
      // Clear the saved form data after successfully generating the message
      localStorage.removeItem('workerFormData');
    } else {
      setError('Please fill in all required fields.');
    }
  };

  const allRoomAllocationsComplete = () => {
    if (!selectedHotelData || !selectedHotelData.roomTypes || selectedHotelData.roomTypes.length === 0) {
      return true;
    }
    
    const adultsAllocated = roomAllocations.reduce((sum, room) => sum + room.occupants, 0) === numGuests;
    
    if (!includeChildren) {
      return adultsAllocated;
    }
    
    // Check if all children are allocated to rooms
    const childrenUnder3Allocated = roomAllocations.reduce((sum, room) => sum + (room.childrenUnder3 || 0), 0) === childrenUnder3;
    const children3to6Allocated = roomAllocations.reduce((sum, room) => sum + (room.children3to6 || 0), 0) === children3to6;
    const children6to12Allocated = roomAllocations.reduce((sum, room) => sum + (room.children6to12 || 0), 0) === children6to12;
    
    return adultsAllocated && childrenUnder3Allocated && children3to6Allocated && children6to12Allocated;
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
  
  const parseDisplayDate = (displayDate) => {
    if (!displayDate || !displayDate.includes('/')) return '';
    const [day, month, year] = displayDate.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  useEffect(() => {
    if (startDate) {
      setDisplayStartDate(formatDateForDisplay(startDate));
    }
    if (endDate) {
      setDisplayEndDate(formatDateForDisplay(endDate));
    }
  }, [startDate, endDate]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Booking Form</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="startDate" value="Start Date" className="dark:text-white" />
              </div>
              <div className="relative">
                <TextInput
                  id="displayStartDate"
                  type="text"
                  value={displayStartDate}
                  onChange={(e) => {
                    const newDisplayDate = e.target.value;
                    setDisplayStartDate(newDisplayDate);
                    
                    // Only update the ISO date if we have a valid format
                    if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                      const newIsoDate = parseDisplayDate(newDisplayDate);
                      if (newIsoDate) {
                        setStartDate(newIsoDate);
                        
                        // If end date is before the new start date, update it
                        if (endDate && endDate < newIsoDate) {
                          setEndDate(newIsoDate);
                          setDisplayEndDate(formatDateForDisplay(newIsoDate));
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
                  value={startDate}
                  onChange={(e) => {
                    const newIsoDate = e.target.value;
                    setStartDate(newIsoDate);
                    setDisplayStartDate(formatDateForDisplay(newIsoDate));
                    
                    // If end date is before the new start date, update it
                    if (endDate && endDate < newIsoDate) {
                      setEndDate(newIsoDate);
                      setDisplayEndDate(formatDateForDisplay(newIsoDate));
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
              <div className="mb-2 block">
                <Label htmlFor="endDate" value="End Date" className="dark:text-white" />
              </div>
              <div className="relative">
                <TextInput
                  id="displayEndDate"
                  type="text"
                  value={displayEndDate}
                  onChange={(e) => {
                    const newDisplayDate = e.target.value;
                    setDisplayEndDate(newDisplayDate);
                    
                    // Only update the ISO date if we have a valid format
                    if (newDisplayDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                      const newIsoDate = parseDisplayDate(newDisplayDate);
                      if (newIsoDate && (!startDate || newIsoDate >= startDate)) {
                        setEndDate(newIsoDate);
                      }
                    }
                  }}
                  placeholder="DD/MM/YYYY"
                  required
                />
                <input 
                  type="date" 
                  className="absolute top-0 right-0 h-full w-10 opacity-0 cursor-pointer"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => {
                    const newIsoDate = e.target.value;
                    setEndDate(newIsoDate);
                    setDisplayEndDate(formatDateForDisplay(newIsoDate));
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
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="citySelect" value="Select City" className="dark:text-white" />
            </div>
            <Select
              id="citySelect"
              value={selectedCity}
              onChange={handleCityChange}
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
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="hotelSelect" value="Select Hotel" className="dark:text-white" />
            </div>
            <Select
              id="hotelSelect"
              value={selectedHotel}
              onChange={handleHotelChange}
              required
            >
              <option value="">Select Hotel</option>
              {hotels
                .filter(hotel => !selectedCity || hotel.city === selectedCity)
                .map((hotel) => (
                  <option key={hotel._id} value={hotel._id}>
                    {hotel.name} ({hotel.stars}★)
                  </option>
                ))}
            </Select>
          </div>
          
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
          
          <ChildrenSection
            includeChildren={includeChildren}
            onIncludeChildrenChange={setIncludeChildren}
            childrenUnder3={childrenUnder3}
            onChildrenUnder3Change={setChildrenUnder3}
            children3to6={children3to6}
            onChildren3to6Change={setChildren3to6}
            children6to12={children6to12}
            onChildren6to12Change={setChildren6to12}
          />
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeBreakfast"
              checked={includeBreakfast}
              onChange={(e) => setIncludeBreakfast(e.target.checked)}
            />
            <Label htmlFor="includeBreakfast" className="dark:text-white">
              Include breakfast (if available)
            </Label>
          </div>
          
          {selectedHotelData && (
            <div className="mt-8 mb-6">
              <h3 className="text-xl font-bold mb-4 text-center dark:text-white border-b pb-2">Hotel & Room Selection</h3>
              
              <div className="space-y-6">
                {/* Hotel Information Card */}
                <Card className="dark:bg-gray-800 overflow-hidden">
                  <HotelInfo hotelData={selectedHotelData} />
                </Card>
                
                {/* Room Allocation Card */}
                {selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 && (
                  <Card className="dark:bg-gray-800 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold mb-4 text-center dark:text-white">Room Allocation</h4>
                      <RoomAllocator
                        selectedHotelData={selectedHotelData}
                        numGuests={numGuests}
                        roomAllocations={roomAllocations}
                        onAddRoom={handleAddRoom}
                        onRemoveRoom={handleRemoveRoom}
                        onRoomTypeSelect={handleRoomTypeSelect}
                        onOccupantsChange={handleOccupantsChange}
                        includeChildren={includeChildren}
                        childrenUnder3={childrenUnder3}
                        children3to6={children3to6}
                        children6to12={children6to12}
                        onChildrenUnder3Change={handleChildrenUnder3Change}
                        onChildren3to6Change={handleChildren3to6Change}
                        onChildren6to12Change={handleChildren6to12Change}
                      />
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          <TourSelector 
            availableTours={availableTours}
            selectedTours={selectedTours}
            onTourSelection={handleTourSelection}
            onMoveTourUp={moveTourUp}
            onMoveTourDown={moveTourDown}
          />
          
          {selectedHotelData && (selectedHotelData.airportTransportation?.length > 0 || selectedHotelData.airport) && (
            <div>
              <div className="mb-2 block">
                <Label htmlFor="clientAirport" value="Client's Airport" className="dark:text-white" />
              </div>
              <Select
                id="clientAirport"
                value={selectedAirport}
                onChange={(e) => setSelectedAirport(e.target.value)}
                required={includeReception || includeFarewell}
              >
                <option value="">Select Airport</option>
                {selectedHotelData.airportTransportation && selectedHotelData.airportTransportation.length > 0 ? (
                  selectedHotelData.airportTransportation.map((item, idx) => (
                    <option key={idx} value={item.airport}>
                      {item.airport}
                    </option>
                  ))
                ) : (
                  airports.map((airport, idx) => (
                    <option key={idx} value={airport.name}>
                      {airport.name}
                    </option>
                  ))
                )}
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select which airport the clients will be arriving at/departing from
              </p>
              
              <div className="flex items-center space-x-2 mt-3">
                <Checkbox
                  id="includeReception"
                  checked={includeReception}
                  onChange={(e) => setIncludeReception(e.target.checked)}
                />
                <Label htmlFor="includeReception" className="dark:text-white">
                  Include reception
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="includeFarewell"
                  checked={includeFarewell}
                  onChange={(e) => setIncludeFarewell(e.target.checked)}
                />
                <Label htmlFor="includeFarewell" className="dark:text-white">
                  Include farewell
                </Label>
              </div>
            </div>
          )}
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="transportVehicleType" value="Transport Vehicle Type" className="dark:text-white" />
            </div>
            <Select
              id="transportVehicleType"
              value={transportVehicleType}
              onChange={(e) => setTransportVehicleType(e.target.value)}
              required
            >
              <option value="Vito">Vito</option>
              <option value="Sprinter">Sprinter</option>
            </Select>
          </div>
          
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
          
          {startDate && endDate && selectedHotelData && (
            <PriceBreakdown
              totalPrice={getTotalPrice()}
              nights={calculateDuration(startDate, endDate)}
              numGuests={numGuests}
              selectedHotelData={selectedHotelData}
              roomAllocations={roomAllocations}
              selectedTours={selectedTours}
              tours={tours}
              includeChildren={includeChildren}
              childrenUnder3={childrenUnder3}
              children3to6={children3to6}
              children6to12={children6to12}
              includeReception={includeReception}
              includeFarewell={includeFarewell}
              transportVehicleType={transportVehicleType}
              includeBreakfast={includeBreakfast}
              startDate={startDate}
              endDate={endDate}
              selectedAirport={selectedAirport}
            />
          )}
          
          <Button 
            onClick={handleGenerateMessage}
            gradientDuoTone="purpleToPink"
            size="lg"
            className="w-full mt-6"
            disabled={selectedHotelData && selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 && !allRoomAllocationsComplete()}
          >
            Generate Booking Message
          </Button>
          
          {error && (
            <Alert color="failure" className="mt-4">
              <span>{error}</span>
            </Alert>
          )}
          
          {message && <BookingMessage message={message} />}
        </div>
      )}
    </div>
  );
};
    