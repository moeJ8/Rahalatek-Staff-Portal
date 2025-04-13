import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Button, Alert, Label, TextInput, Textarea, Select, Spinner, Checkbox } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';


export default function EditHotelPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hotelData, setHotelData] = useState({
        name: '',
        city: '',
        stars: 3,
        pricePerNightPerPerson: '',
        breakfastIncluded: false,
        roomType: '',
        transportationPrice: 0,
        airport: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [airports, setAirports] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hotelResponse = await axios.get(`/api/hotels/${id}`);
                setHotelData(hotelResponse.data);
                
                const airportsResponse = await axios.get('/api/airports');
                setAirports(airportsResponse.data);
                
                setError('');
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleHotelChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setHotelData({
                ...hotelData,
                [name]: checked
            });
        } else {
            setHotelData({
                ...hotelData,
                [name]: value
            });
        }
    };

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.put(`/api/hotels/${id}`, hotelData);
            showSuccessMessage('Hotel updated successfully!');
            setTimeout(() => {
                navigate('/hotels');
            }, 2000);
        } catch (err) {
            setError('Failed to update hotel');
            console.log(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Spinner size="xl" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Edit Hotel</h2>
                
                {error && <Alert color="failure" className="mb-4">{error}</Alert>}
                {success && <Alert color="success" className="mb-4">{success}</Alert>}
                
                <form onSubmit={handleHotelSubmit} className="space-y-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelName" value="Hotel Name" /> 
                        </div>
                        <TextInput
                            id="hotelName"
                            name="name"
                            value={hotelData.name}
                            onChange={handleHotelChange}
                            required
                        />
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelCity" value="City" />
                        </div>
                        <Select
                            id="hotelCity"
                            name="city"
                            value={hotelData.city}
                            onChange={handleHotelChange}
                            required
                        >
                            <option value="">Select City</option>
                            <option value="Istanbul">Istanbul</option>
                            <option value="Trabzon">Trabzon</option>
                            <option value="Uzungol">Uzungol</option>
                        </Select>
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelStars" value="Stars" />
                        </div>
                        <Select
                            id="hotelStars"
                            name="stars"
                            value={hotelData.stars}
                            onChange={handleHotelChange}
                            required
                        >
                            <option value={1}>1 Star</option>
                            <option value={2}>2 Stars</option>
                            <option value={3}>3 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={5}>5 Stars</option>
                        </Select>
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelPrice" value="Price per Night per Person ($)" />
                        </div>
                        <TextInput
                            id="hotelPrice"
                            type="number"
                            name="pricePerNightPerPerson"
                            value={hotelData.pricePerNightPerPerson}
                            onChange={handleHotelChange}
                            required
                        />
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="roomType" value="Room Type" />
                        </div>
                        <TextInput
                            id="roomType"
                            name="roomType"
                            value={hotelData.roomType}
                            onChange={handleHotelChange}
                            placeholder="e.g. Single, Double, Suite, Family Room"
                            required
                        />
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="transportationPrice" value="Transportation Price per Person ($)" />
                        </div>
                        <TextInput
                            id="transportationPrice"
                            type="number"
                            name="transportationPrice"
                            value={hotelData.transportationPrice}
                            onChange={handleHotelChange}
                        />
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="airport" value="Nearest Airport" />
                        </div>
                        <Select
                            id="airport"
                            name="airport"
                            value={hotelData.airport || ''}
                            onChange={handleHotelChange}
                        >
                            <option value="">Select Airport</option>
                            {airports.map(airport => (
                                <option key={airport._id} value={airport.name}>
                                    {airport.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="hotelDesc" value="Description" />
                        </div>
                        <Textarea
                            id="hotelDesc"
                            name="description"
                            rows={4}
                            value={hotelData.description || ''}
                            onChange={handleHotelChange}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="breakfastIncluded"
                            name="breakfastIncluded"
                            checked={hotelData.breakfastIncluded}
                            onChange={handleHotelChange}
                        />
                        <Label htmlFor="breakfastIncluded">
                            Breakfast Included
                        </Label>
                    </div>
                    
                    <Button type="submit" gradientDuoTone="purpleToPink">
                        Update Hotel
                    </Button>
                </form>
            </Card>
        </div>
    )
} 