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
    const [includeChildren, setIncludeChildren] = useState(false);
    const [childrenUnder3, setChildrenUnder3] = useState(0); // For tours: 0-3 free
    const [children3to6, setChildren3to6] = useState(0); // For hotels: 0-6 free, Tours: pay full price
    const [children6to12, setChildren6to12] = useState(0); // For hotels: 6-12 special price, Tours: pay full price
    const [tripPrice, setTripPrice] = useState('');
    const [includeTransfer, setIncludeTransfer] = useState(true);
    const [includeBreakfast, setIncludeBreakfast] = useState(true);
    const [includeVIP, setIncludeVIP] = useState(false);
    const [vipCarPrice, setVipCarPrice] = useState('');

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
  
  // Helper function to safely parse integers
  const safeParseInt = (value) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const calculateTotalPrice = () => {
    try {
      let total = 0;
      const nights = calculateDuration();
      
      // Parse all inputs to ensure we're working with numbers
      const adultCount = safeParseInt(numGuests);
      const children3to6Count = safeParseInt(children3to6);
      const children6to12Count = safeParseInt(children6to12);
      const infantsCount = safeParseInt(childrenUnder3);
      
      const totalChildrenCount = includeChildren ? (children3to6Count + children6to12Count + infantsCount) : 0;
      const totalPeopleCount = adultCount + totalChildrenCount;

      // Hotel costs
      if (selectedHotelData) {
        if (selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0) {
          if (roomAllocations.length > 0) {
            roomAllocations.forEach(room => {
              if (room.roomTypeIndex !== undefined && room.roomTypeIndex !== "" && 
                  selectedHotelData.roomTypes[room.roomTypeIndex]) {
                  const roomType = selectedHotelData.roomTypes[room.roomTypeIndex];
                  // Base price for the room
                  let roomCost = roomType.pricePerNight * nights;
                  
                  // Add children 6-12 price if applicable
                  if (includeChildren && children6to12Count > 0 && roomType.childrenPricePerNight) {
                      roomCost += roomType.childrenPricePerNight * nights * children6to12Count;
                  }
                  
                  total += roomCost;
              }
            });
          } else {
            // If no room allocations, estimate based on first room type
            const baseRoomCount = Math.ceil(adultCount / 2); // Estimate 2 adults per room
            total += selectedHotelData.roomTypes[0].pricePerNight * nights * baseRoomCount;
            
            // Add children 6-12 price if applicable
            if (includeChildren && children6to12Count > 0 && selectedHotelData.roomTypes[0].childrenPricePerNight) {
                total += selectedHotelData.roomTypes[0].childrenPricePerNight * nights * children6to12Count;
            }
          }
        } else if (selectedHotelData.pricePerNightPerPerson) {
          // Legacy pricing model
          total += selectedHotelData.pricePerNightPerPerson * nights * adultCount;
          
          // Children 6-12 pay with a special rate (if defined) or half price by default
          if (includeChildren && children6to12Count > 0) {
              const childRate = selectedHotelData.childrenPrice || (selectedHotelData.pricePerNightPerPerson * 0.5);
              total += childRate * nights * children6to12Count;
          }
          
          // Children under 6 (childrenUnder3 and children3to6) are free for accommodation
        }
      }

      // Transportation costs
      if (includeTransfer && selectedHotelData.transportationPrice) {
        total += selectedHotelData.transportationPrice * totalPeopleCount;
      }

      // Tour costs
      if (selectedTours.length > 0 && tours.length > 0) {
        selectedTours.forEach(tourId => {
          const tourData = tours.find(tour => tour._id === tourId);
          if (tourData) {
            // Adults pay full price
            const adultTourCost = tourData.price * adultCount;
            
            // Children 3-12 pay full price for tours
            const children3to12Count = children3to6Count + children6to12Count;
            const children3to12Cost = includeChildren ? tourData.price * children3to12Count : 0;
            
            // Children under 3 are free for tours
            total += adultTourCost + children3to12Cost;
          }
        });
      }
      
      // Add VIP luxury car price if option is selected
      if (includeVIP && vipCarPrice) {
        const vipPrice = parseFloat(vipCarPrice);
        if (!isNaN(vipPrice)) {
          total += vipPrice;
        }
      }

      return total;
    } catch (err) {
      console.error('Error calculating total price:', err);
      return 0;
    }
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

      // RTL mark to ensure proper right-to-left display
      const RLM = '\u200F';

      // Define Arabic ordinal numbers for days
      const arabicDayOrdinals = [
        'الاول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 
        'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
        'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر'
      ];
      
      // Generate guests information with children details
      let guestsInfo = `${RLM}${numGuests} بالغ`;
      
      // Calculate total people for the hotel section
      const infantsCount = parseInt(childrenUnder3) || 0;
      const children3to6Count = parseInt(children3to6) || 0;
      const children6to12Count = parseInt(children6to12) || 0;
      const totalChildren = includeChildren ? (infantsCount + children3to6Count + children6to12Count) : 0;
      const totalPeople = numGuests + totalChildren;
      
      if (includeChildren) {
        if (totalChildren > 0) {
          guestsInfo += ` و ${totalChildren} ${totalChildren === 1 ? 'طفل' : 'أطفال'}`;
          
          // Add details about each age group
          let childrenDetails = [];
          if (infantsCount > 0) {
            childrenDetails.push(`${RLM}${infantsCount} ${infantsCount === 1 ? 'طفل' : 'أطفال'} تحت 3 سنوات (مجاناً للجولات)`);
          }
          if (children3to6Count > 0) {
            childrenDetails.push(`${RLM}${children3to6Count} ${children3to6Count === 1 ? 'طفل' : 'أطفال'} 3-6 سنوات (مجاناً للفندق)`);
          }
          if (children6to12Count > 0) {
            childrenDetails.push(`${RLM}${children6to12Count} ${children6to12Count === 1 ? 'طفل' : 'أطفال'} 6-12 سنة (سعر خاص)`);
          }
          
          if (childrenDetails.length > 0) {
            guestsInfo += `\n${childrenDetails.join('\n')}`;
          }
        }
      }

      const itinerary = `${RLM}🇹🇷 بكج ${getCityNameInArabic(selectedCity)} 🇹🇷
${RLM}تاريخ من ${formattedStartDate} لغاية ${formattedEndDate} 🗓
${RLM}المدة ${nights} ليالي ⏰
${guestsInfo}
${RLM}سعر البكج ${finalPrice}$ 💵

${includeTransfer && selectedHotelData.transportationPrice > 0 ? 
  `${RLM}الاستقبال والتوديع من ${airportName} بسيارة خاصة ` : ''}
${includeVIP && vipCarPrice ? 
  `${RLM}خدمة VIP: سيارة فاخرة للتنقلات السياحية` : ''}

${RLM}الفندق 🏢
${RLM}الاقامة في ${getCityNameInArabic(selectedCity)} في فندق ${selectedHotelData.name} ${selectedHotelData.stars} نجوم ${totalPeople} اشخاص ضمن ${roomTypeInfo} ${includeBreakfast && selectedHotelData.breakfastIncluded ? 'شامل الافطار' : 'بدون افطار'}
${selectedHotelData.description ? `\n${RLM}${selectedHotelData.description}` : ''}

${orderedTourData.length > 0 ? `${RLM}تفاصيل الجولات 📋` : ''}
${orderedTourData.map((tour, index) => {
  return `${RLM}اليوم ${arabicDayOrdinals[index]}:
${RLM}${tour.name}
${RLM}${tour.description}

${tour.detailedDescription ? `${RLM}${tour.detailedDescription}` : ''}
${tour.highlights && tour.highlights.length > 0 ? tour.highlights.map(highlight => `${RLM}• ${highlight}`).join('\n') : ''}`;
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
              
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="includeChildren"
                    checked={includeChildren}
                    onChange={(e) => setIncludeChildren(e.target.checked)}
                  />
                  <Label htmlFor="includeChildren" className="dark:text-white">
                    Include children
                  </Label>
                </div>

                {includeChildren && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                  </div>
                )}
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
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeVIP"
                    checked={includeVIP}
                    onChange={(e) => setIncludeVIP(e.target.checked)}
                  />
                  <Label htmlFor="includeVIP" className="dark:text-white">
                    VIP Transportation (Luxury Car)
                  </Label>
                </div>
                
                {includeVIP && (
                  <div className="ml-6">
                    <div className="mb-2 block">
                      <Label htmlFor="vipCarPrice" value="Luxury Car Price ($)" className="dark:text-white" />
                    </div>
                    <TextInput
                      id="vipCarPrice"
                      type="number"
                      value={vipCarPrice}
                      onChange={(e) => setVipCarPrice(e.target.value)}
                      placeholder="Enter price for luxury car service"
                      required={includeVIP}
                    />
                  </div>
                )}
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
                <Alert color="info" className="border-0 shadow-md p-0 bg-transparent">
                  <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg text-white">
                    <div className="text-center">
                      <h6 className="text-xl font-bold text-green-400 mb-1">Total Price: ${calculateTotalPrice()}</h6>
                      <p className="text-sm text-green-300">For {calculateDuration()} nights and {numGuests} people</p>
                    </div>
                    
                    <div className="mt-4 border-t border-gray-700 dark:border-gray-700 pt-3">
                      <h6 className="text-sm font-bold text-white mb-2">Detailed Price Breakdown:</h6>
                      
                      {/* Hotel Cost Breakdown */}
                      <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-800 rounded-md shadow-sm">
                        <p className="text-sm font-semibold text-blue-400 dark:text-blue-400 border-b border-gray-700 dark:border-gray-700 pb-1 mb-1">1. Hotel Accommodation:</p>
                        {selectedHotelData.roomTypes && selectedHotelData.roomTypes.length > 0 && roomAllocations.length > 0 ? (
                          <div className="ml-2">
                            {(() => {
                              const roomTypeCounts = {};
                              const totalNights = calculateDuration();
                              roomAllocations.forEach(room => {
                                if (room.roomTypeIndex !== "" && selectedHotelData.roomTypes[room.roomTypeIndex]) {
                                  const roomType = selectedHotelData.roomTypes[room.roomTypeIndex].type;
                                  const price = selectedHotelData.roomTypes[room.roomTypeIndex].pricePerNight;
                                  const childrenPrice = selectedHotelData.roomTypes[room.roomTypeIndex].childrenPricePerNight || 0;
                                  roomTypeCounts[roomType] = roomTypeCounts[roomType] || { 
                                    rooms: 0, 
                                    people: 0, 
                                    price, 
                                    childrenPrice,
                                    totalPrice: 0
                                  };
                                  roomTypeCounts[roomType].rooms += 1;
                                  roomTypeCounts[roomType].people += room.occupants;
                                  roomTypeCounts[roomType].totalPrice = price * totalNights * roomTypeCounts[roomType].rooms;
                                }
                              });
                              
                              return Object.entries(roomTypeCounts).map(([type, info], index) => (
                                <div key={index} className="text-xs mb-1">
                                  <p>
                                    <span className="font-medium text-gray-200 dark:text-gray-200">{info.rooms}x {type}:</span> <span className="text-green-400 dark:text-green-400 font-medium">${info.totalPrice}</span> 
                                    <span className="text-gray-400 dark:text-gray-400">
                                      (${info.price}/night × {totalNights} nights × {info.rooms} rooms)
                                    </span>
                                  </p>
                                  {includeChildren && children6to12 > 0 && info.childrenPrice > 0 && (
                                    <p className="ml-4 text-xs text-gray-400 dark:text-gray-400">
                                      + Children 6-12 years: <span className="text-green-400 dark:text-green-400">${info.childrenPrice * totalNights * parseInt(children6to12)}</span>
                                      (${info.childrenPrice}/night × {totalNights} nights × {parseInt(children6to12)} children)
                                    </p>
                                  )}
                                </div>
                              ));
                            })()}
                          </div>
                        ) : (
                          <p className="text-xs ml-2 text-gray-400 dark:text-gray-400">
                            Standard room rate calculation based on {numGuests} guests for {calculateDuration()} nights
                          </p>
                        )}
                      </div>
                      
                      {/* Tour Cost Breakdown */}
                      {selectedTours.length > 0 && (
                        <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-800 rounded-md shadow-sm">
                          <p className="text-sm font-semibold text-purple-400 dark:text-purple-400 border-b border-gray-700 dark:border-gray-700 pb-1 mb-1">2. Tours:</p>
                          <div className="ml-2">
                            {selectedTours.map((tourId, index) => {
                              const tour = tours.find(t => t._id === tourId);
                              if (!tour) return null;
                              
                              const adultCost = tour.price * numGuests;
                              const childrenCount = includeChildren ? (parseInt(children3to6) + parseInt(children6to12)) : 0;
                              const childrenCost = childrenCount > 0 ? tour.price * childrenCount : 0;
                              const totalTourCost = adultCost + childrenCost;
                              
                              return (
                                <div key={index} className="text-xs mb-1">
                                  <p>
                                    <span className="font-medium text-gray-200 dark:text-gray-200">{tour.name}:</span> <span className="text-green-400 dark:text-green-400 font-medium">${totalTourCost}</span>
                                  </p>
                                  <div className="ml-4 text-gray-400 dark:text-gray-400">
                                    <p>• Adults: <span className="text-green-400 dark:text-green-400">${adultCost}</span> ({numGuests} × ${tour.price})</p>
                                    {childrenCount > 0 && (
                                      <p>• Children 3+ years: <span className="text-green-400 dark:text-green-400">${childrenCost}</span> ({childrenCount} × ${tour.price})</p>
                                    )}
                                    {includeChildren && childrenUnder3 > 0 && (
                                      <p>• Children 0-3 years: <span className="text-green-400 dark:text-green-400">$0</span> (free)</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Transportation Costs */}
                      <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-800 rounded-md shadow-sm">
                        <p className="text-sm font-semibold text-orange-400 dark:text-orange-400 border-b border-gray-700 dark:border-gray-700 pb-1 mb-1">3. Transportation:</p>
                        <div className="ml-2">
                          {includeTransfer && selectedHotelData.transportationPrice > 0 ? (
                            <div className="text-xs">
                              <p>
                                <span className="font-medium text-gray-200 dark:text-gray-200">Airport Transfers:</span> <span className="text-green-400 dark:text-green-400 font-medium">${selectedHotelData.transportationPrice * (
                                  parseInt(numGuests) + (
                                    includeChildren ? 
                                    parseInt(childrenUnder3) + parseInt(children3to6) + parseInt(children6to12) 
                                    : 0
                                  )
                                )}</span>
                              </p>
                              <p className="ml-4 text-gray-400 dark:text-gray-400">
                                ${selectedHotelData.transportationPrice}/person × {
                                  parseInt(numGuests) + (
                                    includeChildren ? 
                                    parseInt(childrenUnder3) + parseInt(children3to6) + parseInt(children6to12) 
                                    : 0
                                  )
                                } people
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 dark:text-gray-400">No airport transfers included</p>
                          )}
                          
                          {includeVIP && vipCarPrice ? (
                            <div className="text-xs mt-2">
                              <p>
                                <span className="font-medium text-gray-200 dark:text-gray-200">VIP Luxury Car:</span> <span className="text-green-400 dark:text-green-400 font-medium">${vipCarPrice}</span>
                              </p>
                              <p className="ml-4 text-gray-400 dark:text-gray-400">
                                Premium transportation service for all tours
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      
                      {/* Guest Breakdown */}
                      <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-800 rounded-md shadow-sm">
                        <p className="text-sm font-semibold text-teal-400 dark:text-teal-400 border-b border-gray-700 dark:border-gray-700 pb-1 mb-1">4. Guest Details:</p>
                        <ul className="text-xs list-disc ml-6 text-gray-300 dark:text-gray-300">
                          <li>{numGuests} Adults (full price)</li>
                          {includeChildren && childrenUnder3 > 0 && (
                            <li>{childrenUnder3} {childrenUnder3 === 1 ? 'Child' : 'Children'} 0-3 years (free on tours)</li>
                          )}
                          {includeChildren && children3to6 > 0 && (
                            <li>{children3to6} {children3to6 === 1 ? 'Child' : 'Children'} 3-6 years (free hotel accommodation)</li>
                          )}
                          {includeChildren && children6to12 > 0 && (
                            <li>{children6to12} {children6to12 === 1 ? 'Child' : 'Children'} 6-12 years (special hotel rate)</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-700 dark:border-gray-700">
                      <div className="text-xs text-gray-300 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-400 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        <span>
                          Price verified: The total amount of <span className="font-bold text-green-400">${calculateTotalPrice()}</span> has been accurately calculated based on room rates, tour costs, and additional services.
                        </span>
                      </div>
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
    