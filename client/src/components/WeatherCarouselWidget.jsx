import React, { useState, useEffect } from 'react';
import { 
  FaCloud, 
  FaSun, 
  FaCloudRain, 
  FaSnowflake,
  FaCloudSun,
  FaBolt,
  FaEye,
  FaWind,
  FaTint,
  FaThermometerHalf,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import RahalatekLoader from './RahalatekLoader';

export default function WeatherCarouselWidget() {
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [error, setError] = useState('');

  // Cities for Turkish tour destinations
  const cities = [
    { name: 'Istanbul', country: 'Turkey' },
    { name: 'Trabzon', country: 'Turkey' },
    { name: 'Antalya', country: 'Turkey' },
    { name: 'Bodrum', country: 'Turkey' },
    { name: 'Bursa', country: 'Turkey' },
    { name: 'Cappadocia', country: 'Turkey' },
    { name: 'Fethiye', country: 'Turkey' },
    { name: 'Aleppo', country: 'Syria' }
  ];

  useEffect(() => {
    fetchWeatherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Using OpenWeatherMap API
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      
      // Check if API key exists
      if (!API_KEY) {
        throw new Error('Weather API key not found. Please add VITE_WEATHER_API_KEY to your .env file.');
      }

      const weatherPromises = cities.map(async (city) => {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city.name},${city.country}&appid=${API_KEY}&units=metric`
          );
          
          if (!response.ok) {
            throw new Error(`Weather data not available for ${city.name}`);
          }
          
          const data = await response.json();
          return {
            city: city.name,
            ...data
          };
        } catch (error) {
          console.error(`Failed to fetch weather for ${city.name}:`, error);
          // Check if it's an API key issue
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.warn('API key not activated yet. Keys typically take 10-60 minutes to activate.');
          }
          // Return null for failed requests - we'll filter these out
          return null;
        }
      });

      const weatherResults = await Promise.all(weatherPromises);
      const weatherMap = {};
      weatherResults.forEach(result => {
        // Only add successful results (filter out null values)
        if (result && result.city) {
          weatherMap[result.city] = result;
        }
      });
      
      setWeatherData(weatherMap);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherMain) => {
    const iconClass = "w-8 h-8";
    
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return <FaSun className={`${iconClass} text-yellow-500`} />;
      case 'clouds':
        return <FaCloud className={`${iconClass} text-gray-500`} />;
      case 'rain':
      case 'drizzle':
        return <FaCloudRain className={`${iconClass} text-blue-500`} />;
      case 'snow':
        return <FaSnowflake className={`${iconClass} text-blue-200`} />;
      case 'thunderstorm':
        return <FaBolt className={`${iconClass} text-purple-500`} />;
      case 'mist':
      case 'fog':
      case 'haze':
        return <FaCloudSun className={`${iconClass} text-gray-400`} />;
      default:
        return <FaSun className={`${iconClass} text-yellow-500`} />;
    }
  };

  // Filter cities that have weather data
  const availableCities = cities.filter(city => weatherData[city.name]);
  const hasAnyData = availableCities.length > 0;

  const nextCity = () => {
    if (hasAnyData) {
      setCurrentCityIndex((prev) => (prev + 1) % availableCities.length);
    }
  };

  const prevCity = () => {
    if (hasAnyData) {
      setCurrentCityIndex((prev) => (prev - 1 + availableCities.length) % availableCities.length);
    }
  };
  
  // Adjust current index if it's out of bounds for available cities
  const adjustedIndex = hasAnyData ? Math.min(currentCityIndex, availableCities.length - 1) : 0;
  const currentCity = hasAnyData ? availableCities[adjustedIndex] : cities[0];
  const currentWeather = weatherData[currentCity?.name];

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
              <FaCloudSun className="text-blue-600 dark:text-teal-400 text-lg" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Weather Forecast</h3>
          </div>
        </div>
        <div className="p-6 flex justify-center items-center h-32">
          <RahalatekLoader size="md" />
        </div>
      </div>
    );
  }

  if (error || !hasAnyData) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
              <FaCloudSun className="text-blue-600 dark:text-teal-400 text-lg" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Weather Forecast</h3>
          </div>
        </div>
        <div className="p-6 text-center">
          {error ? (
            <p className="text-red-500 dark:text-red-400">{error}</p>
          ) : (
            <div className="space-y-3">
              <FaCloudSun className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Weather data not available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  API key activation pending (10-60 minutes)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
              <FaCloudSun className="text-blue-600 dark:text-teal-400 text-lg" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Weather Forecast</h3>
          </div>
          
          {/* City Counter */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>{hasAnyData ? adjustedIndex + 1 : 0}</span>
            <span>/</span>
            <span>{hasAnyData ? availableCities.length : 0}</span>
          </div>
        </div>
      </div>

      {/* Carousel Content */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevCity}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <FaChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>

        <button
          onClick={nextCity}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <FaChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Weather Card */}
        <div className="p-6 mx-12">
          {currentWeather ? (
            <div className="text-center">
              {/* City Name */}
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {currentCity.name}
              </h4>
              
              {/* Weather Icon and Temp */}
              <div className="flex items-center justify-center gap-4 mb-4">
                {getWeatherIcon(currentWeather.weather?.[0]?.main)}
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {Math.round(currentWeather.main?.temp || 0)}°C
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {currentWeather.weather?.[0]?.description || 'Clear sky'}
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaThermometerHalf className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Feels like</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {Math.round(currentWeather.main?.feels_like || 0)}°C
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaTint className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Humidity</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {currentWeather.main?.humidity || 0}%
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaWind className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Wind</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {Math.round(currentWeather.wind?.speed || 0)} m/s
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaEye className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Visibility</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {Math.round((currentWeather.visibility || 10000) / 1000)}km
                  </div>
                </div>
              </div>

              {/* City Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {availableCities.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCityIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === adjustedIndex
                        ? 'bg-blue-500 dark:bg-teal-400 w-4'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaCloudSun className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Weather data not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
