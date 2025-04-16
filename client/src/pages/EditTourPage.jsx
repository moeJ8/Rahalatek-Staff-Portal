import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Button, Alert, Label, TextInput, Textarea, Select, Spinner } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiX } from 'react-icons/hi';


export default function EditTourPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tourData, setTourData] = useState({
        name: '',
        city: '',
        description: '',
        detailedDescription: '',
        tourType: 'Group',
        price: '',
        vipCarType: 'Vito',
        carCapacity: {
            min: 2,
            max: 8
        },
        duration: 1,
        highlights: []
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [highlightInput, setHighlightInput] = useState('');

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await axios.get(`/api/tours/${id}`);
                setTourData(response.data);
                setError('');
            } catch (err) {
                console.error('Failed to fetch tour:', err);
                setError('Failed to load tour. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTour();
    }, [id]);

    const handleTourChange = (e) => {
        const { name, value } = e.target;
        setTourData({
            ...tourData,
            [name]: value,
        });
    };

    const handleVipCarTypeChange = (e) => {
        const carType = e.target.value;
        let minCapacity = 2;
        let maxCapacity = 8;
        
        if (carType === 'Sprinter') {
            minCapacity = 9;
            maxCapacity = 16;
        }
        
        setTourData({
            ...tourData,
            vipCarType: carType,
            carCapacity: {
                min: minCapacity,
                max: maxCapacity
            }
        });
    };

    const showSuccessMessage = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(''), 3000);
    };
    const handleTourSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.put(`/api/tours/${id}`, tourData);
            showSuccessMessage('Tour updated successfully!');
            setTimeout(() => {
                navigate('/tours');
            }, 2000);
        } catch (err) {
            setError('Failed to update tour');
            console.log(err);
        }
    };
    const handleAddHighlight = () => {
        if (highlightInput.trim()) {
            setTourData({
                ...tourData,
                highlights: [...tourData.highlights, highlightInput.trim()]
            });
            setHighlightInput('');
        }
    };

    const handleRemoveHighlight = (index) => {
        const updatedHighlights = [...tourData.highlights];
        updatedHighlights.splice(index, 1);
        setTourData({
            ...tourData,
            highlights: updatedHighlights
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-56">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-600 rounded-full animate-spin"></div>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Edit Tour</h2>
                    
                    <form onSubmit={handleTourSubmit} className="space-y-4">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourName" value="Tour Name" /> 
                            </div>
                            <TextInput
                                id="tourName"
                                name="name"
                                value={tourData.name}
                                onChange={handleTourChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourCity" value="City" />
                            </div>
                            <Select
                                id="tourCity"
                                name="city"
                                value={tourData.city}
                                onChange={handleTourChange}
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
                                <Label htmlFor="tourType" value="Tour Type" />
                            </div>
                            <Select
                                id="tourType"
                                name="tourType"
                                value={tourData.tourType || 'Group'}
                                onChange={handleTourChange}
                                required
                            >
                                <option value="Group">Group Tour (per person)</option>
                                <option value="VIP">VIP Tour (per car)</option>
                            </Select>
                        </div>
                        
                        {tourData.tourType === 'VIP' && (
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="vipCarType" value="VIP Car Type" />
                                </div>
                                <Select
                                    id="vipCarType"
                                    name="vipCarType"
                                    value={tourData.vipCarType || 'Vito'}
                                    onChange={handleVipCarTypeChange}
                                    required
                                >
                                    <option value="Vito">Vito (2-8 persons)</option>
                                    <option value="Sprinter">Sprinter (9-16 persons)</option>
                                </Select>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {tourData.vipCarType === 'Vito' 
                                        ? 'Capacity: 2-8 persons' 
                                        : 'Capacity: 9-16 persons'}
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourDesc" value="Brief Description" />
                            </div>
                            <TextInput
                                id="tourDesc"
                                name="description"
                                value={tourData.description}
                                onChange={handleTourChange}
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourDetailDesc" value="Detailed Description" />
                            </div>
                            <Textarea
                                id="tourDetailDesc"
                                name="detailedDescription"
                                rows={4}
                                value={tourData.detailedDescription || ''}
                                onChange={handleTourChange}
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourPrice" value={tourData.tourType === 'Group' ? 'Price per Person ($)' : 'Price per Car ($)'} />
                            </div>
                            <TextInput
                                id="tourPrice"
                                type="number"
                                name="price"
                                value={tourData.price}
                                onChange={handleTourChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourDuration" value="Duration (hours)" />
                            </div>
                            <TextInput
                                id="tourDuration"
                                type="number"
                                name="duration"
                                value={tourData.duration}
                                onChange={handleTourChange}
                                min={1}
                                required
                            />
                        </div>
                        
                        <div>
                            <Label value="Tour Highlights" className="mb-2 block" />
                            <div className="flex gap-2 mb-3">
                                <TextInput
                                    placeholder="Add a highlight"
                                    value={highlightInput}
                                    onChange={(e) => setHighlightInput(e.target.value)}
                                    className="flex-1"
                                />
                                <Button 
                                    onClick={handleAddHighlight} 
                                    gradientDuoTone="purpleToPink"
                                    size="sm"
                                >
                                    <div className="flex items-center">
                                        <HiPlus className="h-4 w-4" />
                                        <span className="ml-1">Add</span>
                                    </div>
                                </Button>
                            </div>
                            
                            {tourData.highlights && tourData.highlights.length > 0 && (
                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Added Highlights:</h4>
                                    <ul className="space-y-2">
                                        {tourData.highlights.map((highlight, index) => (
                                            <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <span className="text-gray-800 dark:text-gray-200">• {highlight}</span>
                                                <Button 
                                                    color="failure" 
                                                    size="xs"
                                                    pill
                                                    onClick={() => handleRemoveHighlight(index)}
                                                >
                                                    <HiX className="h-4 w-4" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <Button type="submit" gradientDuoTone="pinkToOrange">
                            Update Tour
                        </Button>
                        
                        {error && <Alert color="failure" className="mt-4">{error}</Alert>}
                        {success && <Alert color="success" className="mt-4">{success}</Alert>}
                    </form>
                </Card>
    </div>
  )
}
