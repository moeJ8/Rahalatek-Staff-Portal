import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Label, TextInput, Textarea, Alert } from 'flowbite-react';
import { HiArrowLeft } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import RahalatekLoader from '../components/RahalatekLoader';

const EditOfficePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [officeData, setOfficeData] = useState({
        name: '',
        location: '',
        email: '',
        phoneNumber: '',
        description: ''
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const fetchOffice = async () => {
            try {
                const response = await axios.get(`/api/offices/${id}`);
                setOfficeData(response.data.data || response.data);
                setError('');
            } catch (err) {
                console.error('Failed to fetch office:', err);
                setError('Failed to load office data. Please try again.');
                toast.error('Failed to load office data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchOffice();
    }, [id]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfficeData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            const response = await axios.put(`/api/offices/${id}`, officeData);
            
            toast.success('Office updated successfully!', {
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
            
            navigate('/dashboard?tab=offices');
        } catch (err) {
            console.error('Failed to update office:', err);
            setError(err.response?.data?.message || 'Failed to update office. Please try again.');
            toast.error('Failed to update office');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <RahalatekLoader size="lg" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-950 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <CustomButton
                            variant="gray"
                            onClick={() => navigate('/dashboard?tab=offices')}
                            icon={HiArrowLeft}
                            title="Back to Dashboard"
                        >
                            Back
                        </CustomButton>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Edit Office
                            </h1>
                            <p className="text-sm text-gray-400">
                                Update office information
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Office Form */}
                <Card className="bg-slate-900 border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <Alert color="failure">{error}</Alert>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Office Name */}
                            <div>
                                <Label 
                                    htmlFor="name" 
                                    value="Office Name" 
                                    className="mb-2 text-white"
                                />
                                <TextInput
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={officeData.name}
                                    onChange={handleChange}
                                    required
                                    className="bg-slate-800 border-slate-600 text-white"
                                    placeholder="Enter office name"
                                />
                            </div>
                            
                            {/* Location */}
                            <div>
                                <Label 
                                    htmlFor="location" 
                                    value="Location" 
                                    className="mb-2 text-white"
                                />
                                <TextInput
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={officeData.location}
                                    onChange={handleChange}
                                    required
                                    className="bg-slate-800 border-slate-600 text-white"
                                    placeholder="Enter location"
                                />
                            </div>
                            
                            {/* Email */}
                            <div>
                                <Label 
                                    htmlFor="email" 
                                    value="Email" 
                                    className="mb-2 text-white"
                                />
                                <TextInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={officeData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-slate-800 border-slate-600 text-white"
                                    placeholder="Enter email address"
                                />
                            </div>
                            
                            {/* Phone Number */}
                            <div>
                                <Label 
                                    htmlFor="phoneNumber" 
                                    value="Phone Number" 
                                    className="mb-2 text-white"
                                />
                                <TextInput
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    value={officeData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    className="bg-slate-800 border-slate-600 text-white"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                        
                        {/* Description */}
                        <div>
                            <Label 
                                htmlFor="description" 
                                value="Description (Optional)" 
                                className="mb-2 text-white"
                            />
                            <Textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={officeData.description}
                                onChange={handleChange}
                                className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
                                placeholder="Enter office description"
                            />
                        </div>
                        
                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <CustomButton
                                type="button"
                                variant="gray"
                                onClick={() => navigate('/dashboard?tab=offices')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                type="submit"
                                variant="pinkToOrange"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Office'}
                            </CustomButton>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default EditOfficePage; 