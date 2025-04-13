import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import { FaMapMarkerAlt, FaStar, FaCoffee, FaBed } from 'react-icons/fa';

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    const fetchHotels = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/hotels');
        setHotels(response.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch hotels:', err);
        setError('Failed to load hotels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const isAdmin = user && user.isAdmin;

  // Render stars based on hotel rating
  const renderStars = (count) => {
    return Array(count).fill(0).map((_, index) => (
      <FaStar key={index} className="inline text-yellow-400" />
    ));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Available Hotels</h1>
        
        {error && (
          <Alert color="failure" className="mb-4">
            <span>{error}</span>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner size="xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Card key={hotel._id} className="dark:bg-gray-800 h-full">
                <div className="flex flex-col h-full">
                  <div>
                    <h5 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">
                      {hotel.name}
                    </h5>
                    <div className="mb-1">
                      {renderStars(hotel.stars)}
                    </div>
                    <Badge color="info" className="mb-2 dark:text-cyan-500">
                      <FaMapMarkerAlt className="inline mr-1 mb-1" />{hotel.city}
                    </Badge>
                    {hotel.description && (
                      <p className="font-normal text-gray-700 dark:text-white mb-3 line-clamp-5  overflow-hidden ">
                        {hotel.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge color="success">${hotel.pricePerNightPerPerson} per night</Badge>
                      <Badge color="purple">
                        <FaBed className="inline mr-1" />{hotel.roomType}
                      </Badge>
                      {hotel.breakfastIncluded && (
                        <Badge color="indigo">
                          <FaCoffee className="inline mr-1" />Breakfast included
                        </Badge>
                      )}
                    </div>
                    {hotel.transportationPrice > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Airport transfer: ${hotel.transportationPrice} per person
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4">
                    {isAdmin && (
                      <Button 
                        as={Link} 
                        to={`/admin/edit-hotel/${hotel._id}`}
                        gradientDuoTone="purpleToPink"
                        size="sm"
                        className="w-full"
                      >
                        Edit Hotel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 