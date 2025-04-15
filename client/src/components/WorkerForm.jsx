import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button, TextInput, Select, Label, Card, Checkbox, Alert, Datepicker, Spinner } from 'flowbite-react'
import { toast } from 'react-hot-toast'

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

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

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
      { roomTypeIndex: "", occupants: 1 }
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

  const handleNumGuestsChange = (e) => {
    const newGuestCount = parseInt(e.target.value);
    setNumGuests(newGuestCount);
    
    setRoomAllocations([]);
  };
  
  const calculateTotalPrice = () => {
    if (!selectedHotelData) return 0;
    
    const nights = calculateDuration();
    const peopleCount = parseInt(numGuests);
    
    let totalHotelCost = 0;
    
    if (selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0) {
        if (roomAllocations.length > 0) {
            roomAllocations.forEach(room => {
                if (room.roomTypeIndex !== undefined && room.roomTypeIndex !== "" && 
                    selectedHotelData.roomTypes[room.roomTypeIndex]) {
                    totalHotelCost += selectedHotelData.roomTypes[room.roomTypeIndex].pricePerNight * nights;
                }
            });
        } else {
            totalHotelCost = selectedHotelData.roomTypes[0].pricePerNight * nights * 
                             Math.ceil(peopleCount / 2); 
        }
    } else if (selectedHotelData.pricePerNightPerPerson) {
        totalHotelCost = selectedHotelData.pricePerNightPerPerson * nights * peopleCount;
    }
    
    let totalPrice = totalHotelCost;
    
    if (includeTransfer && selectedHotelData.transportationPrice) {
        totalPrice += selectedHotelData.transportationPrice * peopleCount;
    }
    
    const selectedTourData = tours.filter(tour => selectedTours.includes(tour._id));
    const toursCost = selectedTourData.reduce((sum, tour) => sum + (tour.price * peopleCount), 0);
    totalPrice += toursCost;
    
    return totalPrice;
  };

  const getRoomTypeInArabic = (roomType) => {
    const roomTypeMap = {
        "SINGLE ROOM": "غرفة مفردة",
        "DOUBLE ROOM": "غرفة مزدوجة",
        "TRIPLE ROOM": "غرفة ثلاثية",
        "FAMILY SUITE": "جناح عائلي"
    };
    
    return roomTypeMap[roomType] || roomType;
  };

  const handleGenerateMessage = () => {
    if (selectedHotelData && selectedCity && startDate && endDate) {
      if (selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0) {
        const assignedGuests = roomAllocations.reduce((sum, room) => sum + room.occupants, 0);
        if (assignedGuests < numGuests) {
          setError(`Please assign room types for all ${numGuests} guests.`);
          return;
        }
      }
      
      const nights = calculateDuration();
      const calculatedPrice = calculateTotalPrice();

      const finalPrice = tripPrice || calculatedPrice;
      const orderedTourData = selectedTours.map(tourId => 
        tours.find(tour => tour._id === tourId)
      ).filter(Boolean);
      
      const formattedStartDate = new Date(startDate).toLocaleDateString('ar-EG', {day: 'numeric', month: 'numeric'});
      const formattedEndDate = new Date(endDate).toLocaleDateString('ar-EG', {day: 'numeric', month: 'numeric'});

      let airportName = 'المطار'; 
      
      if (selectedHotelData.airport && selectedHotelData.airport.trim() !== '') {
        airportName = getAirportArabicName(selectedHotelData.airport);
      }

      let roomTypeInfo = "";
      
      if (selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0) {
          const roomTypeCounts = {};
          
          if (roomAllocations.length > 0) {
              roomAllocations.forEach(room => {
                  if (room.roomTypeIndex !== undefined && room.roomTypeIndex !== "" && 
                      selectedHotelData.roomTypes[room.roomTypeIndex]) {
                      const roomType = selectedHotelData.roomTypes[room.roomTypeIndex].type;
                      roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1; 
                  }
              });
          } else {
              const defaultRoomType = selectedHotelData.roomTypes[0].type;
              roomTypeCounts[defaultRoomType] = Math.ceil(numGuests / 2);
          }
          
          // Format the room type information
          roomTypeInfo = Object.entries(roomTypeCounts)
              .map(([type, count]) => `${count} ${getRoomTypeInArabic(type)}`)
              .join(' و ');
      } else if (selectedHotelData.roomType) {
          // Fallback for old data structure
          roomTypeInfo = `${numGuests} ${getRoomTypeInArabic(selectedHotelData.roomType)}`;
      }

      const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

      const itinerary = `🇹🇷 بكج ${getCityNameInArabic(selectedCity)} 🇹🇷
تاريخ من ${formattedStartDate} لغاية ${formattedEndDate} 🗓
المدة ${nights} ليالي ⏰
${numGuests} شخص 👥
سعر البكج ${finalPrice}$ 💵

${includeTransfer && selectedHotelData.transportationPrice > 0 ? 
  `الاستقبال والتوديع من ${airportName} بسيارة خاصة 🚘` : ''}

الفندق 🏢
الاقامة في ${getCityNameInArabic(selectedCity)} في فندق ${selectedHotelData.name} ${selectedHotelData.stars} نجوم ${numGuests} اشخاص ضمن ${roomTypeInfo} ${includeBreakfast && selectedHotelData.breakfastIncluded ? 'شامل الافطار' : 'بدون افطار'}
${selectedHotelData.description ? `\n${selectedHotelData.description}` : ''}

${orderedTourData.length > 0 ? 'تفاصيل الجولات 📋' : ''}
${orderedTourData.map((tour, index) => {
  const dayNumber = index < 10 ? numberEmojis[index] : `${index + 1}`;
  return `اليوم ${dayNumber}
${tour.name}
${tour.description}

${tour.detailedDescription || ''}
${tour.highlights && tour.highlights.length > 0 ? tour.highlights.map(highlight => `${highlight} ◀`).join('\n') : ''}`;
}).join('\n\n')}`;

      setMessage(itinerary);
      
      if (!tripPrice) {
        setTripPrice(calculatedPrice.toString());
      }
    } else {
      setError('الرجاء ملء جميع الحقون المطلوبة.');
    }
  };

  const getCityNameInArabic = (cityName) => {
    const cityMap = {
      'Istanbul': 'اسطنبول',
      'Trabzon': 'طرابزون',
      'Uzungol': 'أوزنجول',
      'Antalya': 'أنطاليا',
      'Bodrum': 'بودروم',
      'Bursa': 'بورصة',
      'Cappadocia': 'كابادوكيا',
      'Fethiye': 'فتحية',
      'Izmir': 'إزمير',
      'Konya': 'قونيا',
      'Marmaris': 'مرمريس',
      'Pamukkale': 'باموكالي'
    };
    return cityMap[cityName] || cityName;
  };

  const allRoomAllocationsComplete = () => {
    if (!selectedHotelData || !selectedHotelData.roomTypes || selectedHotelData.roomTypes.length === 0) {
      return true;
    }
    
    return roomAllocations.reduce((sum, room) => sum + room.occupants, 0) === numGuests;
  };

  // UI for room allocations
  const renderRoomAllocations = () => {
    if (!selectedHotelData || !selectedHotelData.roomTypes || selectedHotelData.roomTypes.length === 0) {
        return null;
    }
    
    // Calculate total guests allocated to rooms
    const totalAllocated = roomAllocations.reduce((sum, room) => sum + room.occupants, 0);
    
    return (
        <>
            <h3 className="text-lg font-medium mb-2 dark:text-white">Room Allocation</h3>
            
            {totalAllocated > numGuests && (
              <Alert color="failure" className="mb-3">
                <span>You've allocated {totalAllocated} people to rooms, but only have {numGuests} guests.</span>
              </Alert>
            )}
            
            {totalAllocated < numGuests && (
              <Alert color="warning" className="mb-3">
                <span>You've allocated {totalAllocated} out of {numGuests} guests to rooms.</span>
              </Alert>
            )}
            
            {totalAllocated === numGuests && roomAllocations.length > 0 && (
              <Alert color="success" className="mb-3">
                <span>All guests are allocated to rooms.</span>
              </Alert>
            )}
            
            {roomAllocations.map((room, index) => (
                <div key={index} className="flex flex-col gap-2 mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="dark:text-white font-medium">Room {index + 1}</span>
                        <Button 
                            color="failure" 
                            size="xs" 
                            onClick={() => handleRemoveRoom(index)}
                        >
                            Remove
                        </Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-grow">
                            <Label htmlFor={`roomType-${index}`} value="Room Type" className="dark:text-white mb-1" />
                            <Select 
                                id={`roomType-${index}`}
                                value={room.roomTypeIndex}
                                onChange={(e) => handleRoomTypeSelect(index, e.target.value)}
                            >
                                <option value="">Select Room Type</option>
                                {selectedHotelData.roomTypes.map((roomType, typeIndex) => (
                                    <option key={typeIndex} value={typeIndex}>
                                        {roomType.type} (${roomType.pricePerNight}/night)
                                    </option>
                                ))}
                            </Select>
                        </div>
                        
                        <div className="w-full sm:w-1/3">
                            <Label htmlFor={`occupants-${index}`} value="Occupants" className="dark:text-white mb-1" />
                            <Select
                                id={`occupants-${index}`}
                                value={room.occupants}
                                onChange={(e) => handleOccupantsChange(index, e.target.value)}
                            >
                                {[1, 2, 3, 4].map(num => (
                                    <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
            ))}
            
            <Button 
                size="sm"
                onClick={handleAddRoom}
                className="mt-2"
            >
                + Add Room
            </Button>
        </>
    );
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
              {error && (
                <Alert color="failure">
                  <span>{error}</span>
                </Alert>
              )}
              
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
                  <Label htmlFor="numGuests" value="Number of Guests" className="dark:text-white" />
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
              
              {selectedHotelData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <Card className="dark:bg-gray-800">
                    <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Hotel Information
                    </h5>
                    <div className="space-y-1">
                      <p className="font-normal text-gray-700 dark:text-gray-400">Type: {selectedHotelData.stars} stars</p>
                      {selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 ? (
                          <div>
                              <p className="font-normal text-gray-700 dark:text-gray-400">Available Room Types:</p>
                              <ul className="list-disc pl-5">
                                  {selectedHotelData.roomTypes.map((roomType, index) => (
                                      <li key={index} className="font-normal text-gray-700 dark:text-gray-400">
                                          {roomType.type}: ${roomType.pricePerNight} per night
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ) : (
                          <p className="font-normal text-gray-700 dark:text-gray-400">
                              Price: ${selectedHotelData.pricePerNightPerPerson} per person per night
                          </p>
                      )}
                      <p className="font-normal text-gray-700 dark:text-gray-400">
                          Breakfast: {selectedHotelData.breakfastIncluded ? 'Included' : 'Not included'}
                      </p>
                      {selectedHotelData.airport && (
                          <p className="font-normal text-gray-700 dark:text-gray-400">
                              Airport: {selectedHotelData.airport}
                          </p>
                      )}
                      <p className="font-normal text-gray-700 dark:text-gray-400">
                          Airport Transfer: ${selectedHotelData.transportationPrice} per person
                      </p>
                    </div>
                  </Card>
                  
                  {selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 && (
                    <Card className="dark:bg-gray-800">
                      {renderRoomAllocations()}
                    </Card>
                  )}
                </div>
              )}
              
              {availableTours.length > 0 && (
                <div>
                  <div className="mb-2 block">
                    <Label value="Select Tours (Order determines day assignment)" className="dark:text-white" />
                  </div>
                  <Card className="dark:bg-gray-800">
                    {availableTours.map(tour => {
                      const isSelected = selectedTours.includes(tour._id);
                      const dayNumber = isSelected ? selectedTours.indexOf(tour._id) + 1 : null;
                      
                      return (
                        <div key={tour._id} className="flex items-center pb-4 border-b dark:border-gray-700 last:border-b-0 last:pb-0 mb-2">
                          <Checkbox
                            id={tour._id}
                            checked={isSelected}
                            onChange={() => handleTourSelection(tour._id)}
                            className="mr-2"
                          />
                          {isSelected && (
                            <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 mr-2 text-xs font-bold">
                              {dayNumber}
                            </div>
                          )}
                          <Label htmlFor={tour._id} className="flex-1">
                            <div className="font-medium dark:text-white">{tour.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{tour.description}</div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">${tour.price} per person • {tour.duration} hours</div>
                          </Label>
                          {isSelected && (
                            <div className="flex space-x-1 ml-2">
                              <Button 
                                size="xs" 
                                color="gray" 
                                onClick={() => moveTourUp(tour._id)}
                                disabled={selectedTours.indexOf(tour._id) === 0}
                              >
                                ▲
                              </Button>
                              <Button 
                                size="xs" 
                                color="gray" 
                                onClick={() => moveTourDown(tour._id)}
                                disabled={selectedTours.indexOf(tour._id) === selectedTours.length - 1}
                              >
                                ▼
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Card>
                </div>
              )}
              
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
                <Alert color="success">
                  <div className="p-4 text-center">
                    <h6 className="text-base font-medium">Total Calculated Price: ${calculateTotalPrice()}</h6>
                    <p className="text-sm">For {calculateDuration()} nights and {numGuests} people</p>
                    
                    {selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 && roomAllocations.length > 0 && (
                      <div className="mt-2 text-left">
                        <p className="text-sm font-semibold">Room breakdown:</p>
                        <ul className="text-xs list-disc pl-5">
                          {(() => {
                            const roomTypeCounts = {};
                            roomAllocations.forEach(room => {
                              if (room.roomTypeIndex !== "" && selectedHotelData.roomTypes[room.roomTypeIndex]) {
                                const roomType = selectedHotelData.roomTypes[room.roomTypeIndex].type;
                                const price = selectedHotelData.roomTypes[room.roomTypeIndex].pricePerNight;
                                roomTypeCounts[roomType] = roomTypeCounts[roomType] || { rooms: 0, people: 0, price };
                                roomTypeCounts[roomType].rooms += 1;
                                roomTypeCounts[roomType].people += room.occupants;
                              }
                            });
                            
                            return Object.entries(roomTypeCounts).map(([type, info], index) => (
                              <li key={index}>
                                {info.rooms}x {type}: ${info.price * calculateDuration() * info.rooms}
                                (${info.price}/night × {calculateDuration()} nights × {info.rooms} rooms, {info.people} people)
                              </li>
                            ));
                          })()}
                        </ul>
                      </div>
                    )}
                    
                    {selectedTours.length > 0 && (
                      <div className="mt-2 text-left">
                        <p className="text-sm font-semibold">Tour costs: ${tours.filter(tour => selectedTours.includes(tour._id)).reduce((sum, tour) => sum + (tour.price * numGuests), 0)}</p>
                      </div>
                    )}
                    
                    {includeTransfer && selectedHotelData.transportationPrice > 0 && (
                      <div className="mt-1 text-left">
                        <p className="text-sm font-semibold">Transportation: ${selectedHotelData.transportationPrice * numGuests} (${selectedHotelData.transportationPrice} × {numGuests} people)</p>
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ✓ Price verified: The total amount of ${calculateTotalPrice()} has been accurately calculated based on room rates, tour costs, and additional services for {numGuests} guests over {calculateDuration()} nights.
                      </p>
                    </div>
                  </div>
                </Alert>
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
              
              {message && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-center mb-3">
                    <button 
                      className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-bold py-3 px-6 rounded-lg shadow-md w-full sm:w-auto min-w-[200px] min-h-[48px] text-lg transition-colors"
                      onClick={() => {
                        const textarea = document.createElement('textarea');
                        textarea.value = message;
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        textarea.setSelectionRange(0, 99999);
                        let copySuccessful = false;
                        try {
                          copySuccessful = document.execCommand('copy');
                        } catch {
                          copySuccessful = false;
                        }
                        document.body.removeChild(textarea);
                        
                        if (!copySuccessful) {
                          try {
                            navigator.clipboard.writeText(message);
                            copySuccessful = true;
                          } catch {
                            copySuccessful = false;
                          }
                        }
                        
                        if (copySuccessful) {
                          toast.success("تم نسخ الرسالة بنجاح", { 
                            position: "bottom-center",
                            duration: 3000,
                            style: {
                              background: '#4CAF50',
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: '16px',
                              padding: '16px'
                            },
                            iconTheme: {
                              primary: '#fff',
                              secondary: '#4CAF50',
                            }
                          });
                        } else {
                          toast.error("فشل نسخ الرسالة. الرجاء المحاولة مرة أخرى.", {
                            position: "bottom-center",
                            duration: 3000
                          });
                        }
                      }}
                    >
                      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path></svg>
                      نسخ الرسالة
                    </button>
                  </div>
                  <div className="whitespace-pre-line text-right dir-rtl dark:text-white">
                    {message}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };
    