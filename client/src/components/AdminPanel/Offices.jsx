import React, { useState, useEffect, useMemo } from 'react';
import { Card, Label } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import TextInput from '../TextInput';
import CustomButton from '../CustomButton';
import Search from '../Search';
import RahalatekLoader from '../RahalatekLoader';

export default function Offices() {
    const navigate = useNavigate();

    // State management
    const [officeData, setOfficeData] = useState({
        name: '',
        location: '',
        email: '',
        phoneNumber: '',
        description: ''
    });
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [officeSearchQuery, setOfficeSearchQuery] = useState('');

    // Filter offices based on search query
    const filteredOffices = useMemo(() => {
        if (!officeSearchQuery.trim()) {
            return offices;
        }
        
        const searchLower = officeSearchQuery.toLowerCase();
        return offices.filter(office => 
            office.name.toLowerCase().includes(searchLower) ||
            office.location.toLowerCase().includes(searchLower) ||
            office.email.toLowerCase().includes(searchLower) ||
            office.phoneNumber.toLowerCase().includes(searchLower)
        );
    }, [offices, officeSearchQuery]);

    // Fetch offices data
    const fetchOffices = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/offices');
            setOffices(response.data.data);
        } catch (err) {
            console.error('Failed to fetch offices:', err);
            toast.error('Failed to load offices. Please refresh the page.', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchOffices();
    }, []);

    // Handle office form input changes
    const handleOfficeChange = (e) => {
        const { name, value } = e.target;
        setOfficeData({
            ...officeData,
            [name]: value,
        });
    };

    // Handle office form submission
    const handleOfficeSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/offices', officeData);
            setOffices([...offices, response.data.data]);
            setOfficeData({
                name: '',
                location: '',
                email: '',
                phoneNumber: '',
                description: ''
            });
            toast.success('Office added successfully!', {
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
            console.log(err);
            toast.error('Failed to add office. Please try again.', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            });
        }
    };

    // Handle office deletion
    const handleDeleteOffice = async (id) => {
        try {
            await axios.delete(`/api/offices/${id}`);
            setOffices(offices.filter(office => office._id !== id));
            toast.success('Office deleted successfully!', {
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
            console.log(err);
            toast.error('Failed to delete office. Please try again.', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            });
        }
    };

    return (
        <Card className="w-full dark:bg-slate-950" id="offices-panel" role="tabpanel" aria-labelledby="tab-offices">
            <h2 className="text-xl md:text-2xl font-bold mb-4 dark:text-white text-center">Add New Office</h2>
            
            <form onSubmit={handleOfficeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="officeName" value="Office Name" />
                        </div>
                        <TextInput
                            id="officeName"
                            name="name"
                            value={officeData.name}
                            onChange={handleOfficeChange}
                            required
                        />
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="officeLocation" value="Location" />
                        </div>
                        <TextInput
                            id="officeLocation"
                            name="location"
                            value={officeData.location}
                            onChange={handleOfficeChange}
                            required
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="officeEmail" value="Email" />
                        </div>
                        <TextInput
                            id="officeEmail"
                            name="email"
                            type="email"
                            value={officeData.email}
                            onChange={handleOfficeChange}
                            required
                        />
                    </div>
                    
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="officePhoneNumber" value="Phone Number" />
                        </div>
                        <TextInput
                            id="officePhoneNumber"
                            name="phoneNumber"
                            value={officeData.phoneNumber}
                            onChange={handleOfficeChange}
                            required
                        />
                    </div>
                </div>
                
                <div>
                    <TextInput
                        id="officeDescription"
                        name="description"
                        as="textarea"
                        rows={3}
                        value={officeData.description}
                        onChange={handleOfficeChange}
                        label="Description"
                    />
                </div>
                
                <CustomButton 
                    type="submit"
                    variant="pinkToOrange"
                >
                    Add Office
                </CustomButton>
                
            </form>
            
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Existing Offices</h3>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <RahalatekLoader size="md" />
                        <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg font-medium">Loading offices...</p>
                    </div>
                ) : (
                    <>
                        {/* Search Bar */}
                        <div className="mb-6">
                            <Search
                                placeholder="Search offices by name, location, email, or phone number..."
                                value={officeSearchQuery}
                                onChange={(e) => setOfficeSearchQuery(e.target.value)}
                            />
                        </div>
                
                {filteredOffices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {filteredOffices.map(office => (
                            <Card key={office._id} className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-200">
                                <div className="p-3 md:p-4">
                                    {/* Desktop Layout: flex with actions on right */}
                                    <div className="hidden md:flex">
                                        {/* Left side - Office info and contact details */}
                                        <div className="flex-1 pr-3">
                                            {/* Office name and location */}
                                            <div className="mb-3">
                                                <h4 className="font-semibold text-base md:text-lg text-slate-900 dark:text-white truncate" title={office.name}>
                                                    {office.name}
                                                </h4>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {office.location}
                                                </p>
                                            </div>
                                            
                                            {/* Contact details */}
                                            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-slate-700 dark:text-slate-300 truncate" title={office.email}>
                                                        {office.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span className="text-slate-700 dark:text-slate-300">
                                                        {office.phoneNumber}
                                                    </span>
                                                </div>
                                                {office.description && (
                                                    <div className="flex items-start">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                                                            {office.description}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Right side - Action buttons (Desktop) */}
                                        <div className="flex flex-col space-y-1 md:space-y-2">
                                            <CustomButton
                                                variant="green"
                                                size="xs"
                                                onClick={() => navigate(`/office/${encodeURIComponent(office.name)}`)}
                                                title="View office details"
                                                className="text-xs"
                                                icon={({ className }) => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            >
                                                View
                                            </CustomButton>
                                            <CustomButton
                                                variant="blue"
                                                size="xs"
                                                onClick={() => navigate(`/edit-office/${office._id}`)}
                                                title="Edit office"
                                                className="text-xs"
                                                icon={({ className }) => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                )}
                                            >
                                                Edit
                                            </CustomButton>
                                            <CustomButton
                                                variant="red"
                                                size="xs"
                                                onClick={() => handleDeleteOffice(office._id)}
                                                title="Delete office"
                                                className="text-xs"
                                                icon={({ className }) => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            >
                                                Delete
                                            </CustomButton>
                                        </div>
                                    </div>

                                    {/* Mobile Layout: stacked with actions at bottom */}
                                    <div className="md:hidden">
                                        {/* Office info and contact details */}
                                        <div className="mb-3">
                                            {/* Office name and location */}
                                            <div className="mb-3">
                                                <h4 className="font-semibold text-base md:text-lg text-slate-900 dark:text-white truncate" title={office.name}>
                                                    {office.name}
                                                </h4>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {office.location}
                                                </p>
                                            </div>
                                            
                                            {/* Contact details */}
                                            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-slate-700 dark:text-slate-300 truncate" title={office.email}>
                                                        {office.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span className="text-slate-700 dark:text-slate-300">
                                                        {office.phoneNumber}
                                                    </span>
                                                </div>
                                                {office.description && (
                                                    <div className="flex items-start">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                                                            {office.description}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Action buttons at bottom (Mobile) */}
                                        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <CustomButton
                                                variant="green"
                                                size="xs"
                                                onClick={() => navigate(`/office/${encodeURIComponent(office.name)}`)}
                                                title="View office details"
                                                className="text-xs flex-1"
                                                icon={({ className }) => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            >
                                                View
                                            </CustomButton>
                                            <CustomButton
                                                variant="blue"
                                                size="xs"
                                                onClick={() => navigate(`/edit-office/${office._id}`)}
                                                title="Edit office"
                                                className="text-xs flex-1"
                                                icon={({ className }) => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                )}
                                            >
                                                Edit
                                            </CustomButton>
                                            <CustomButton
                                                variant="red"
                                                size="xs"
                                                onClick={() => handleDeleteOffice(office._id)}
                                                title="Delete office"
                                                className="text-xs flex-1"
                                                icon={({ className }) => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            >
                                                Delete
                                            </CustomButton>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700 dark:text-blue-200">
                                    {officeSearchQuery.trim() 
                                        ? `No offices found matching "${officeSearchQuery}".`
                                        : "No offices found."
                                    }
                                </p>
                                {officeSearchQuery.trim() && (
                                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                        Try adjusting your search terms or clearing the search to see all offices.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                    </>
                )}
            </div>
        </Card>
    );
}
