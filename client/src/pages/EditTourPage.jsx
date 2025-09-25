import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Label, Textarea, Select } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiX, HiTrash } from 'react-icons/hi';
import CustomButton from '../components/CustomButton';
import CustomSelect from '../components/Select';
import TextInput from '../components/TextInput';
import RahalatekLoader from '../components/RahalatekLoader';
import ImageUploader from '../components/ImageUploader';
import toast from 'react-hot-toast';
import { getCountries, getCitiesByCountry } from '../utils/countryCities';


export default function EditTourPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tourData, setTourData] = useState({
        name: '',
        country: '',
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
        highlights: [],
        policies: [],
        faqs: [],
        images: []
    });
    const [loading, setLoading] = useState(true);
    const [highlightInput, setHighlightInput] = useState('');
    const [policyInput, setPolicyInput] = useState('');

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

    // Handle country change and reset city
    const handleCountryChange = (country) => {
        setTourData({
            ...tourData,
            country: country,
            city: '' // Reset city when country changes
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

    const handleAddPolicy = () => {
        if (policyInput.trim()) {
            setTourData({
                ...tourData,
                policies: [...tourData.policies, policyInput.trim()]
            });
            setPolicyInput('');
        }
    };

    const handleRemovePolicy = (index) => {
        const updatedPolicies = [...tourData.policies];
        updatedPolicies.splice(index, 1);
        setTourData({
            ...tourData,
            policies: updatedPolicies
        });
    };

    // FAQ handlers
    const handleAddFaq = () => {
        setTourData({
            ...tourData,
            faqs: [...tourData.faqs, { question: '', answer: '' }]
        });
    };

    const handleRemoveFaq = (index) => {
        const updatedFaqs = [...tourData.faqs];
        updatedFaqs.splice(index, 1);
        setTourData({
            ...tourData,
            faqs: updatedFaqs
        });
    };

    const handleFaqChange = (index, field, value) => {
        const updatedFaqs = [...tourData.faqs];
        updatedFaqs[index] = {
            ...updatedFaqs[index],
            [field]: value
        };
        setTourData({
            ...tourData,
            faqs: updatedFaqs
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    id="tourCountry"
                                    label="Country"
                                    value={tourData.country || ''}
                                    onChange={handleCountryChange}
                                    options={[
                                        { value: '', label: 'Select Country' },
                                        ...getCountries().map(country => ({ value: country, label: country }))
                                    ]}
                                    placeholder="Select Country"
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
                                        { value: '', label: 'Select City' },
                                        ...getCitiesByCountry(tourData.country || '').map(city => ({ value: city, label: city }))
                                    ]}
                                    placeholder="Select City"
                                    disabled={!tourData.country}
                                    required
                                />
                                {!tourData.country && (
                                    <p className="text-xs text-gray-500 mt-1">Select a country first</p>
                                )}
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
                        
                        {/* Tour Policies */}
                        <div>
                            <Label value="Tour Policies" className="mb-2 block" />
                            <div className="flex gap-2 mb-3">
                                <TextInput
                                    placeholder="Add a policy"
                                    value={policyInput}
                                    onChange={(e) => setPolicyInput(e.target.value)}
                                    className="flex-1"
                                />
                                <CustomButton 
                                    type="button"
                                    onClick={handleAddPolicy} 
                                    variant="purple"
                                    size="sm"
                                    icon={HiPlus}
                                >
                                    Add
                                </CustomButton>
                            </div>
                            
                            {tourData.policies && tourData.policies.length > 0 && (
                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Added Policies:</h4>
                                    <ul className="space-y-2">
                                        {tourData.policies.map((policy, index) => (
                                            <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <span className="text-gray-800 dark:text-gray-200">• {policy}</span>
                                                <CustomButton 
                                                    variant="red" 
                                                    size="xs"
                                                    onClick={() => handleRemovePolicy(index)}
                                                    icon={HiX}
                                                    title="Remove policy"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        {/* Tour FAQs */}
                        <div>
                            <Label htmlFor="faqs" value="Tour FAQs" className="mb-3 block" />
                            <div className="space-y-4">
                                {(tourData.faqs || []).map((faq, index) => (
                                    <div key={index} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-medium text-gray-900 dark:text-white">FAQ #{index + 1}</h4>
                                            <CustomButton 
                                                variant="red"
                                                size="xs"
                                                onClick={() => handleRemoveFaq(index)}
                                                icon={HiTrash}
                                                title="Remove FAQ"
                                            >
                                                Remove
                                            </CustomButton>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <TextInput
                                                    label="Question"
                                                    value={faq.question}
                                                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                                    placeholder="Enter FAQ question"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <TextInput
                                                    label="Answer"
                                                    as="textarea"
                                                    rows={3}
                                                    value={faq.answer}
                                                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                                    placeholder="Enter FAQ answer"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <CustomButton
                                    variant="blue"
                                    size="sm"
                                    onClick={handleAddFaq}
                                    icon={HiPlus}
                                >
                                    Add FAQ
                                </CustomButton>
                            </div>
                        </div>
                        
                        {/* Tour Images */}
                        <div>
                            <div className="mb-2 block">
                                <Label value="Tour Images" className="text-sm font-medium text-gray-700 dark:text-gray-200" />
                            </div>
                            <ImageUploader
                                onImagesUploaded={(images) => setTourData({...tourData, images})}
                                folder="tours"
                                maxImages={8}
                                existingImages={tourData.images || []}
                            />
                        </div>
                        
                        <CustomButton type="submit" variant="pinkToOrange">
                            Update Tour
                        </CustomButton>
                    </form>
                </Card>
    </div>
  )
}
