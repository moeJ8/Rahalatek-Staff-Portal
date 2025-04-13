import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button, TextInput, Select, Label, Card, Checkbox, Alert, Datepicker, Spinner } from 'flowbite-react'

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
        
        // Also set the city from the hotel data
        if (hotelData && hotelData.city !== selectedCity) {
          setSelectedCity(hotelData.city);
        }
      } else {
        setSelectedHotelData(null);
      }
    }, [selectedHotel, hotels, selectedCity]);

  // Calculate trip duration
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
      // Swap current tour with the one above it
      [newSelected[index], newSelected[index - 1]] = [newSelected[index - 1], newSelected[index]];
      return newSelected;
    });
  };
  
  const moveTourDown = (tourId) => {
    setSelectedTours(prevSelected => {
      const index = prevSelected.indexOf(tourId);
      if (index < 0 || index >= prevSelected.length - 1) return prevSelected;
      
      const newSelected = [...prevSelected];
      // Swap current tour with the one below it
      [newSelected[index], newSelected[index + 1]] = [newSelected[index + 1], newSelected[index]];
      return newSelected;
    });
  };
  
  // Calculate total price including hotel, tours and transportation
  const calculateTotalPrice = () => {
    if (!selectedHotelData) return 0;
    
    const nights = calculateDuration();
    const peopleCount = parseInt(numGuests);
    
    // Hotel costs
    let totalPrice = selectedHotelData.pricePerNightPerPerson * nights * peopleCount;
    
    // Transportation costs if included
    if (includeTransfer && selectedHotelData.transportationPrice) {
      totalPrice += selectedHotelData.transportationPrice * peopleCount;
    }
    
    // Tour costs
    const selectedTourData = tours.filter(tour => selectedTours.includes(tour._id));
    const toursCost = selectedTourData.reduce((sum, tour) => sum + (tour.price * peopleCount), 0);
    totalPrice += toursCost;
    
    return totalPrice;
  };

  const handleGenerateMessage = () => {
    if (selectedHotelData && selectedCity && startDate && endDate) {
      const nights = calculateDuration();
      const calculatedPrice = calculateTotalPrice();

      const finalPrice = tripPrice || calculatedPrice;
      const orderedTourData = selectedTours.map(tourId => 
        tours.find(tour => tour._id === tourId)
      ).filter(Boolean);
      
      // Format dates in DD/MM format
      const formattedStartDate = new Date(startDate).toLocaleDateString('ar-EG', {day: 'numeric', month: 'numeric'});
      const formattedEndDate = new Date(endDate).toLocaleDateString('ar-EG', {day: 'numeric', month: 'numeric'});

      let airportName = 'المطار'; 
      
      if (selectedHotelData.airport && selectedHotelData.airport.trim() !== '') {
        airportName = getAirportArabicName(selectedHotelData.airport);
        console.log(`Using airport: ${selectedHotelData.airport}, Arabic name: ${airportName}`);
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
الاقامة في ${getCityNameInArabic(selectedCity)} في فندق ${selectedHotelData.name} ${selectedHotelData.stars} نجوم ضمن ${selectedHotelData.roomType} ${includeBreakfast && selectedHotelData.breakfastIncluded ? 'شامل الافطار' : 'بدون افطار'}
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
      setError('الرجاء ملء جميع الحقول المطلوبة.');
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
                  <Label htmlFor="numGuests" value="Number of Guests" className="dark:text-white" />
                </div>
                <TextInput
                  id="numGuests"
                  type="number"
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                  min={1}
                  required
                />
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
                        {hotel.name} ({hotel.stars} stars) - ${hotel.pricePerNightPerPerson}/night
                      </option>
                    ))}
                </Select>
              </div>
              
              {selectedHotelData && (
                <Card className="mb-4 dark:bg-gray-800">
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Hotel Information
                  </h5>
                  <div className="space-y-1">
                    <p className="font-normal text-gray-700 dark:text-gray-400">Type: {selectedHotelData.stars} stars</p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">Price: ${selectedHotelData.pricePerNightPerPerson} per person per night</p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">Breakfast: {selectedHotelData.breakfastIncluded ? 'Included' : 'Not included'}</p>
                    {selectedHotelData.airport && (
                      <p className="font-normal text-gray-700 dark:text-gray-400">Airport: {selectedHotelData.airport}</p>
                    )}
                    <p className="font-normal text-gray-700 dark:text-gray-400">Airport Transfer: ${selectedHotelData.transportationPrice} per person</p>
                  </div>
                </Card>
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
                  <div className="text-center">
                    <h6 className="text-base font-medium">Total Calculated Price: ${calculateTotalPrice()}</h6>
                    <p className="text-sm">For {calculateDuration()} nights and {numGuests} people</p>
                  </div>
                </Alert>
              )}
              
              <Button 
                onClick={handleGenerateMessage}
                gradientDuoTone="purpleToPink"
                size="lg"
                className="w-full mt-6"
              >
                Generate Booking Message
              </Button>
              
              
              {message && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
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
    