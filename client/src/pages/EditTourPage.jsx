import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Label, Textarea, Select } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiX } from 'react-icons/hi';
import CustomButton from '../components/CustomButton';
import CustomSelect from '../components/Select';
import TextInput from '../components/TextInput';
import RahalatekLoader from '../components/RahalatekLoader';
import toast from 'react-hot-toast';


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
    const [loading, setLoading] = useState(true);
    const [highlightInput, setHighlightInput] = useState('');

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await axios.get(`/api/tours/${id}`);
                setTourData(response.data);
            } catch (err) {
                console.error('Failed to fetch tour:', err);
                toast.error('Failed to load tour. Please try again later.');
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



    const showSuccessMessage = (message) => {
        toast.success(message, {
            duration: 3000,
            style: {
                background: '#22c55e',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#22c55e',
            },
        });
    };
    
    const handleTourSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/tours/${id}`, tourData);
            showSuccessMessage('Tour updated successfully!');
            setTimeout(() => {
                navigate('/tours');
            }, 2000);
        } catch (err) {
            toast.error('Failed to update tour');
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
            <div className="py-8">
                <RahalatekLoader size="lg" />
            </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="dark:bg-slate-900">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Edit Tour</h2>
                    
                    <form onSubmit={handleTourSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <CustomSelect
                                    id="tourCity"
                                    label="City"
                                    value={tourData.city}
                                    onChange={(value) => setTourData({...tourData, city: value})}
                                    options={[
                                        { value: "Antalya", label: "Antalya" },
                                        { value: "Bodrum", label: "Bodrum" },
                                        { value: "Bursa", label: "Bursa" },
                                        { value: "Cappadocia", label: "Cappadocia" },
                                        { value: "Fethiye", label: "Fethiye" },
                                        { value: "Istanbul", label: "Istanbul" },
                                        { value: "Trabzon", label: "Trabzon" }
                                    ]}
                                    placeholder="Select City"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <CustomSelect
                                    id="tourType"
                                    label="Tour Type"
                                    value={tourData.tourType || 'Group'}
                                    onChange={(value) => setTourData({...tourData, tourType: value})}
                                    options={[
                                        { value: "Group", label: "Group Tour (per person)" },
                                        { value: "VIP", label: "VIP Tour (per car)" }
                                    ]}
                                    required
                                />
                            </div>
                            
                            {tourData.tourType === 'VIP' && (
                                <div>
                                    <CustomSelect
                                        id="vipCarType"
                                        label="VIP Car Type"
                                        value={tourData.vipCarType || 'Vito'}
                                        onChange={(value) => {
                                            let minCapacity = 2;
                                            let maxCapacity = 8;
                                            
                                            if (value === 'Sprinter') {
                                                minCapacity = 9;
                                                maxCapacity = 16;
                                            }
                                            
                                            setTourData({
                                                ...tourData,
                                                vipCarType: value,
                                                carCapacity: {
                                                    min: minCapacity,
                                                    max: maxCapacity
                                                }
                                            });
                                        }}
                                        options={[
                                            { value: "Vito", label: "Vito (2-8 persons)" },
                                            { value: "Sprinter", label: "Sprinter (9-16 persons)" }
                                        ]}
                                        required
                                    />
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        {tourData.vipCarType === 'Vito' 
                                            ? 'Capacity: 2-8 persons' 
                                            : 'Capacity: 9-16 persons'}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                        
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
                            <TextInput
                                id="tourDetailDesc"
                                name="detailedDescription"
                                as="textarea"
                                rows={4}
                                value={tourData.detailedDescription || ''}
                                onChange={handleTourChange}
                                label="Detailed Description"
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
                                <CustomButton 
                                    type="button"
                                    onClick={handleAddHighlight} 
                                    variant="purple"
                                    size="sm"
                                    icon={HiPlus}
                                >
                                    Add
                                </CustomButton>
                            </div>
                            
                            {tourData.highlights && tourData.highlights.length > 0 && (
                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Added Highlights:</h4>
                                    <ul className="space-y-2">
                                        {tourData.highlights.map((highlight, index) => (
                                            <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <span className="text-gray-800 dark:text-gray-200">• {highlight}</span>
                                                <CustomButton 
                                                    variant="red" 
                                                    size="xs"
                                                    onClick={() => handleRemoveHighlight(index)}
                                                    icon={HiX}
                                                    title="Remove highlight"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <CustomButton type="submit" variant="pinkToOrange">
                            Update Tour
                        </CustomButton>
                    </form>
                </Card>
    </div>
  )
}
