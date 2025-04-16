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
    const [hotels, setHotels] = useState([]);
    const [tours, setTours] = useState([]);
    const [airports, setAirports] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState('');
    const [selectedHotelData, setSelectedHotelData] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');
    const [message, setMessage] = useState('');
    const [availableTours, setAvailableTours] = useState([]);
    const [selectedTours, setSelectedTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [roomAllocations, setRoomAllocations] = useState([]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [numGuests, setNumGuests] = useState(2);
    const [includeChildren, setIncludeChildren] = useState(false);
    const [childrenUnder3, setChildrenUnder3] = useState(0); // For tours: 0-3 free
    const [children3to6, setChildren3to6] = useState(0); // For hotels: 0-6 free, Tours: pay full price
    const [children6to12, setChildren6to12] = useState(0); // For hotels: 6-12 special price, Tours: pay full price
    const [tripPrice, setTripPrice] = useState('');
    const [includeTransfer, setIncludeTransfer] = useState(true);
    const [includeBreakfast, setIncludeBreakfast] = useState(true);

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
      includeTransfer,
      selectedTours,
      tours,
      includeBreakfast
    });
  };

  const handleGenerateMessage = () => {
    // Don't clear the tripPrice field if it was explicitly set by the user
    // Only use calculated price if no manual override exists
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
        includeTransfer,
        selectedTours,
        tours,
        includeBreakfast
      });
      // Update the trip price field with the calculated value
      setTripPrice(finalPrice.toString());
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
      
      // Use the finalized price for the message
      const message = generateBookingMessage({
        selectedHotelData,
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
        includeTransfer,
        includeBreakfast,
        roomAllocations,
        selectedTours,
        tours,
        getAirportArabicName
      });

      setMessage(message);
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Booking Form</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="startDate" value="Start Date" className="dark:text-white" />
              </div>
              <TextInput
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="endDate" value="End Date" className="dark:text-white" />
              </div>
              <TextInput
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
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
              <option value="Izmir">Izmir</option>
              <option value="Konya">Konya</option>
              <option value="Marmaris">Marmaris</option>
              <option value="Pamukkale">Pamukkale</option>
              <option value="Trabzon">Trabzon</option>
              <option value="Uzungol">Uzungol</option>
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
                    {hotel.name} ({hotel.stars} stars) {hotel.roomTypes && hotel.roomTypes.length > 0 
                     ? `- ${hotel.roomTypes.length} room types available` 
                     : `- $${hotel.pricePerNightPerPerson}/night`}
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
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeTransfer"
              checked={includeTransfer}
              onChange={(e) => setIncludeTransfer(e.target.checked)}
            />
            <Label htmlFor="includeTransfer" className="dark:text-white">
              Include airport transfer
            </Label>
          </div>
          
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
              includeTransfer={includeTransfer}
              includeBreakfast={includeBreakfast}
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
    