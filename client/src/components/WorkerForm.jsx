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
    
    // Enhanced trip details
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
    
    // Get Arabic name for an airport
    const getAirportArabicName = (airportName) => {
      const airport = airports.find(a => a.name === airportName);
      return airport ? airport.arabicName : airportName;
    };
    
    // Update available tours when city changes
    useEffect(() => {
      if (selectedCity) {
        const filteredTours = tours.filter(tour => tour.city === selectedCity);
        setAvailableTours(filteredTours);
        setSelectedTours([]);
      } else {
        setAvailableTours([]);
      }
    }, [selectedCity, tours]);
    
    // Update selected hotel data when hotel changes
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
      
      // Use user-entered price if provided, otherwise use calculated price
      const finalPrice = tripPrice || calculatedPrice;
      
      // Get selected tour data
      const selectedTourData = tours.filter(tour => selectedTours.includes(tour._id));
      const toursText = selectedTourData.map(tour => `- ${tour.name}`).join('\n');
      
      // Format dates in DD/MM format
      const formattedStartDate = new Date(startDate).toLocaleDateString('ar-EG', {day: 'numeric', month: 'numeric'});
      const formattedEndDate = new Date(endDate).toLocaleDateString('ar-EG', {day: 'numeric', month: 'numeric'});
      
      // Get Arabic airport name from our airports API
      const airportName = selectedHotelData.airport ? 
                          getAirportArabicName(selectedHotelData.airport) : 
                          'المطار';
      
      // Build the message in the requested format
      const itinerary = `📆التاريخ ${formattedStartDate} لغاية ${formattedEndDate}
⏰المدة ${nights} ليالي 
👬${numGuests} شخص 
💵سعر البكج ${finalPrice}$


${getCityNameInArabic(selectedCity)} 📍

${includeTransfer && selectedHotelData.transportationPrice > 0 ? 
  `🚘 الاستقبال و التوديع من ${airportName} بسيارة خاصة (${selectedHotelData.transportationPrice}$ للشخص)` : ''}

🏢الاقامة في ${getCityNameInArabic(selectedCity)} في فندق ${selectedHotelData.stars} نجوم ${selectedHotelData.name} ضمن غرفة ${selectedHotelData.roomType} ${includeBreakfast && selectedHotelData.breakfastIncluded ? 'شامل الافطار' : 'بدون افطار'} لمدة ${nights} ليالي 
${selectedHotelData.description ? `\n${selectedHotelData.description}` : ''}

${selectedTourData.length > 0 ? '🚘القيام بجولات بسيارة خاصة:' : ''}

${toursText}

----------------------------------------

${selectedTourData.length > 0 ? 'تفاصيل الجولات:' : ''}

${selectedTourData.map(tour => (`⿡${tour.name}:
${tour.detailedDescription || tour.description}
${tour.highlights && tour.highlights.length > 0 ? tour.highlights.map(highlight => `- ${highlight}`).join('\n') : ''}
`)).join('\n')}`;

      setMessage(itinerary);
      
      // Auto-update the price field if it's empty
      if (!tripPrice) {
        setTripPrice(calculatedPrice.toString());
      }
    } else {
      setError('الرجاء ملء جميع الحقول المطلوبة.');
    }
  };
  
  // Helper function to translate city names to Arabic
  const getCityNameInArabic = (cityName) => {
    const cityMap = {
      'Istanbul': 'اسطنبول',
      'Trabzon': 'طرابزون',
      'Uzungol': 'أوزنجول'
    };
    return cityMap[cityName] || cityName;
  };

    return (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">نموذج الحجز</h2>
          
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
                    <Label htmlFor="startDate" value="تاريخ البداية" className="dark:text-white" />
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
                    <Label htmlFor="endDate" value="تاريخ النهاية" className="dark:text-white" />
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="numGuests" value="عدد الضيوف" className="dark:text-white" />
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
                    <Label htmlFor="tripPrice" value="سعر الرحلة ($)" className="dark:text-white" />
                  </div>
                  <TextInput
                    id="tripPrice"
                    type="text"
                    value={tripPrice}
                    onChange={(e) => setTripPrice(e.target.value)}
                    placeholder="سيتم حسابه تلقائيًا إذا تركت فارغًا"
                  />
                </div>
              </div>
              
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="citySelect" value="اختر المدينة" className="dark:text-white" />
                </div>
                <Select
                  id="citySelect"
                  value={selectedCity}
                  onChange={handleCityChange}
                  required
                >
                  <option value="">اختر المدينة</option>
                  <option value="Istanbul">اسطنبول</option>
                  <option value="Trabzon">طرابزون</option>
                  <option value="Uzungol">أوزنجول</option>
                </Select>
              </div>
              
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="hotelSelect" value="اختر الفندق" className="dark:text-white" />
                </div>
                <Select
                  id="hotelSelect"
                  value={selectedHotel}
                  onChange={handleHotelChange}
                  required
                >
                  <option value="">اختر الفندق</option>
                  {hotels
                    .filter(hotel => !selectedCity || hotel.city === selectedCity)
                    .map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name} ({hotel.stars} نجوم) - ${hotel.pricePerNightPerPerson}/ليلة
                      </option>
                    ))}
                </Select>
              </div>
              
              {selectedHotelData && (
                <Card className="mb-4 dark:bg-gray-800">
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    معلومات الفندق
                  </h5>
                  <div className="space-y-1">
                    <p className="font-normal text-gray-700 dark:text-gray-400">النوع: {selectedHotelData.stars} نجوم</p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">السعر: ${selectedHotelData.pricePerNightPerPerson} للشخص في الليلة</p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">الإفطار: {selectedHotelData.breakfastIncluded ? 'مشمول' : 'غير مشمول'}</p>
                    {selectedHotelData.airport && (
                      <p className="font-normal text-gray-700 dark:text-gray-400">المطار: {getAirportArabicName(selectedHotelData.airport)}</p>
                    )}
                    <p className="font-normal text-gray-700 dark:text-gray-400">النقل من المطار: ${selectedHotelData.transportationPrice} للشخص</p>
                  </div>
                </Card>
              )}
              
              {availableTours.length > 0 && (
                <div>
                  <div className="mb-2 block">
                    <Label value="اختر الجولات" className="dark:text-white" />
                  </div>
                  <Card className="dark:bg-gray-800">
                    {availableTours.map(tour => (
                      <div key={tour._id} className="flex items-center pb-4 border-b dark:border-gray-700 last:border-b-0 last:pb-0 mb-2">
                        <Checkbox
                          id={tour._id}
                          checked={selectedTours.includes(tour._id)}
                          onChange={() => handleTourSelection(tour._id)}
                          className="ml-2"
                        />
                        <Label htmlFor={tour._id} className="flex-1">
                          <div className="font-medium dark:text-white">{tour.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{tour.description}</div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">${tour.price} للشخص • {tour.duration} ساعة</div>
                        </Label>
                      </div>
                    ))}
                  </Card>
                </div>
              )}
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="includeTransfer"
                  checked={includeTransfer}
                  onChange={(e) => setIncludeTransfer(e.target.checked)}
                />
                <Label htmlFor="includeTransfer" className="dark:text-white">
                  تضمين خدمة النقل من وإلى المطار
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="includeBreakfast"
                  checked={includeBreakfast}
                  onChange={(e) => setIncludeBreakfast(e.target.checked)}
                />
                <Label htmlFor="includeBreakfast" className="dark:text-white">
                  تضمين وجبة الإفطار (إذا كان متاحًا)
                </Label>
              </div>
              
              {startDate && endDate && selectedHotelData && (
                <Alert color="success">
                  <div className="text-center">
                    <h6 className="text-base font-medium">السعر الإجمالي المحسوب: ${calculateTotalPrice()}</h6>
                    <p className="text-sm">لمدة {calculateDuration()} ليالي لـ {numGuests} أشخاص</p>
                  </div>
                </Alert>
              )}
              
              <Button 
                onClick={handleGenerateMessage}
                gradientDuoTone="purpleToPink"
                size="lg"
                className="w-full mt-6"
              >
                إنشاء رسالة الحجز
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
    