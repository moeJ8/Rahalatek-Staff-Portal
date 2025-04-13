import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import { FaMapMarkerAlt } from 'react-icons/fa';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    
    const fetchTours = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/tours');
        setTours(response.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch tours:', err);
        setError('Failed to load tours. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const isAdmin = user && user.isAdmin;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Available Tours</h1>
        
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
            {tours.map((tour) => (
              <Card key={tour._id} className="dark:bg-gray-800 h-full">
                <div className="flex flex-col h-full">
                  <div>
                    <h5 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">
                        
                      {tour.name}
                    </h5>
                    <Badge color="info" className="mb-2 dark:text-cyan-500">
                    <FaMapMarkerAlt className="inline mr-1 mb-1" />{tour.city}</Badge>
                    <p className="font-normal text-gray-700 dark:text-white mb-2">
                      {tour.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge color="success">${tour.price} per person</Badge>
                      <Badge color="purple">{tour.duration} hours</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4">
                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="mb-4">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-2">Highlights:</h6>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-400">
                          {tour.highlights.slice(0, 3).map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                          {tour.highlights.length > 3 && <li>...and more</li>}
                        </ul>
                      </div>
                    )}
                    
                    {isAdmin && (
                      <Button 
                        as={Link} 
                        to={`/admin/edit-tour/${tour._id}`}
                        gradientDuoTone="purpleToPink"
                        size="sm"
                        className="w-full"
                      >
                        Edit Tour
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