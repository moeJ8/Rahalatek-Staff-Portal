import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Label } from 'flowbite-react';
import toast from 'react-hot-toast';
import CustomButton from '../CustomButton';
import TextInput from '../TextInput';
import RahalatekLoader from '../RahalatekLoader';

export default function Airports() {
    const [airportData, setAirportData] = useState({
        name: '',
        arabicName: ''
    });
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch airports on component mount
    useEffect(() => {
        fetchAirports();
    }, []);

    const fetchAirports = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/airports');
            setAirports(response.data);
        } catch (err) {
            console.error('Failed to fetch airports:', err);
            toast.error('Failed to fetch airports', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#f44336',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAirportChange = (e) => {
        const { name, value } = e.target;
        setAirportData({
            ...airportData,
            [name]: value,
        });
    };

    const handleAirportSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/airports', airportData);
            setAirports([...airports, response.data]);
            setAirportData({
                name: '',
                arabicName: ''
            });
            toast.success('Airport added successfully!', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#4CAF50',
                },
            });
        } catch (err) {
            toast.error('Failed to add airport', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#f44336',
                },
            });
            console.log(err);
        }
    };

    const handleDeleteAirport = async (id) => {
        try {
            await axios.delete(`/api/airports/${id}`);
            setAirports(airports.filter(airport => airport._id !== id));
            toast.success('Airport deleted successfully!', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#4CAF50',
                },
            });
        } catch (err) {
            console.error('Failed to delete airport:', err);
            toast.error('Failed to delete airport', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#f44336',
                },
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RahalatekLoader />
            </div>
        );
    }

    return (
        <Card className="w-full dark:bg-slate-950">
            <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Airport Management</h2>
            
            <form onSubmit={handleAirportSubmit} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="airportName" value="Airport Name" />
                        </div>
                        <TextInput
                            id="airportName"
                            name="name"
                            value={airportData.name}
                            onChange={handleAirportChange}
                            placeholder="Enter airport name"
                            required
                        />
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="airportArabicName" value="Arabic Name" />
                        </div>
                        <TextInput
                            id="airportArabicName"
                            name="arabicName"
                            value={airportData.arabicName}
                            onChange={handleAirportChange}
                            placeholder="Enter Arabic name"
                            required
                        />
                    </div>
                </div>
                
                <CustomButton 
                    type="submit"
                    variant="pinkToOrange"
                    className="w-full md:w-auto"
                >
                    Add Airport
                </CustomButton>
                
            </form>

            {/* Airports List */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">
                    Existing Airports ({airports.length})
                </h3>
                
                {airports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {airports.map(airport => (
                            <Card key={airport._id} className="overflow-hidden dark:bg-slate-900">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-lg dark:text-white">{airport.name}</p>
                                        <p className="text-gray-600 dark:text-gray-400">{airport.arabicName}</p>
                                    </div>
                                    <CustomButton
                                        variant="red"
                                        size="xs"
                                        onClick={() => handleDeleteAirport(airport._id)}
                                        title="Delete airport"
                                        icon={({ className }) => (
                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    >
                                        Delete
                                    </CustomButton>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No airports found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add your first airport using the form above</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
