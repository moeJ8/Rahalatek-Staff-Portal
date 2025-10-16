import React, { useState } from 'react'
import axios from 'axios'
import { Card, Label } from 'flowbite-react'
import { HiPlus, HiX, HiDuplicate, HiTrash } from 'react-icons/hi'
import toast from 'react-hot-toast'
import CustomButton from '../CustomButton'
import CustomSelect from '../Select'
import TextInput from '../TextInput'
import RahalatekLoader from '../RahalatekLoader'
import CustomModal from '../CustomModal'
import SearchableSelect from '../SearchableSelect'
import ImageUploader from '../ImageUploader'
import { getCountries, getCitiesByCountry } from '../../utils/countryCities'
import { validateSlug, formatSlug, formatSlugWhileTyping } from '../../utils/slugValidation'

export default function Tours() {
    
    const [tourData, setTourData] = useState({
        name: '',
        slug: '',
        country: '',
        city: '',
        description: '',
        detailedDescription: '',
        tourType: 'Group',
        price: '',
        totalPrice: '',
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
    const [tours, setTours] = useState([]);
    const [highlightInput, setHighlightInput] = useState('');
    const [policyInput, setPolicyInput] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    
    // Add state for tour duplication
    const [tourDuplicateModalOpen, setTourDuplicateModalOpen] = useState(false);
    const [selectedTourToDuplicate, setSelectedTourToDuplicate] = useState('');
    
    // Add state for slug validation
    const [slugError, setSlugError] = useState('');
    
    
    const fetchTours = async () => {
        setModalLoading(true);
        try {
            const response = await axios.get('/api/tours');
            setTours(response.data);
        } catch (err) {
            console.error('Failed to fetch tours:', err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleTourChange = (e) => {
        const { name, value } = e.target;
        setTourData({
            ...tourData,
            [name]: value,
        });
    };

    // Handle slug input with validation
    const handleSlugChange = (e) => {
        const value = e.target.value;
        const formattedSlug = formatSlugWhileTyping(value);
        
        setTourData({
            ...tourData,
            slug: formattedSlug,
        });

        // Validate slug and show error if invalid
        const validation = validateSlug(formattedSlug);
        if (!validation.isValid) {
            setSlugError(validation.message);
        } else {
            setSlugError('');
        }
    };

    // Handle country change and reset city
    const handleCountryChange = (country) => {
        setTourData({
            ...tourData,
            country: country,
            city: '' // Reset city when country changes
        });
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

    const handleTourSubmit = async (e) => {
        e.preventDefault();
        
        // Validate slug before submission
        if (tourData.slug && tourData.slug.trim()) {
            const validation = validateSlug(tourData.slug);
            if (!validation.isValid) {
                toast.error(validation.message, {
                    duration: 4000,
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
                return;
            }
        }
        
        try {
            const tourDataWithPolicies = {
                ...tourData,
                slug: tourData.slug ? formatSlug(tourData.slug) : '', // Final formatting
                childrenPolicies: {
                    under3: 'Free',
                    above3: 'Adult price'
                }
            };
            
            await axios.post('/api/tours', tourDataWithPolicies);
            setTourData({
                name: '',
                slug: '',
                country: '',
                city: '',
                description: '',
                detailedDescription: '',
                tourType: 'Group',
                price: '',
                totalPrice: '',
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
            setSlugError('');
            fetchTours(); // Refresh tours list
            toast.success('Tour added successfully!', {
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
            toast.error('Failed to add tour', {
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

    // Function to open tour duplicate modal
    const openTourDuplicateModal = () => {
        setTourDuplicateModalOpen(true);
        // Fetch tours only when modal is opened
        if (tours.length === 0) {
            fetchTours();
        }
    };
    
    // Function to close tour duplicate modal
    const closeTourDuplicateModal = () => {
        setTourDuplicateModalOpen(false);
        setSelectedTourToDuplicate('');
    };
    
    // Function to handle tour duplication
    const handleDuplicateTour = () => {
        if (!selectedTourToDuplicate) return;
        
        const tourToDuplicate = tours.find(tour => tour._id === selectedTourToDuplicate);
        if (!tourToDuplicate) return;
        
        // Set tour data from the selected tour
        setTourData({
            name: `${tourToDuplicate.name} (Copy)`,
            slug: '', // Clear slug for duplication to allow auto-generation
            country: tourToDuplicate.country || '',
            city: tourToDuplicate.city,
            description: tourToDuplicate.description || '',
            detailedDescription: tourToDuplicate.detailedDescription || '',
            tourType: tourToDuplicate.tourType,
            price: tourToDuplicate.price.toString(),
            totalPrice: tourToDuplicate.totalPrice?.toString() || '',
            vipCarType: tourToDuplicate.vipCarType || 'Vito',
            carCapacity: {
                min: tourToDuplicate.carCapacity?.min || 2,
                max: tourToDuplicate.carCapacity?.max || 8
            },
            duration: tourToDuplicate.duration,
            highlights: tourToDuplicate.highlights ? [...tourToDuplicate.highlights] : [],
            policies: tourToDuplicate.policies ? [...tourToDuplicate.policies] : [],
            faqs: tourToDuplicate.faqs ? [...tourToDuplicate.faqs] : [],
            images: tourToDuplicate.images ? [...tourToDuplicate.images] : []
        });
        
        // Close modal
        closeTourDuplicateModal();
        
        // Show success message using toast
        toast.success('Tour data duplicated successfully! Make changes as needed and submit to create a new tour.', {
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
    };

    return (
        <>
            <Card className="w-full dark:bg-slate-950" id="tours-panel" role="tabpanel" aria-labelledby="tab-tours">
                <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Add New Tour</h2>
                
                <div className="flex justify-end mb-4">
                    <CustomButton
                        variant="gray"
                        onClick={openTourDuplicateModal}
                        title="Duplicate existing tour data"
                        icon={HiDuplicate}
                    >
                        Duplicate Tour
                    </CustomButton>
                </div>
                
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
                            <Label value="Country" className="block mb-2" />
                            <SearchableSelect
                                id="tourCountry"
                                value={tourData.country}
                                onChange={(e) => handleCountryChange(e.target.value)}
                                options={[
                                    { value: '', label: 'Select Country' },
                                    ...getCountries().map(country => ({ value: country, label: country }))
                                ]}
                                placeholder="Search for a country..."
                            />
                        </div>
                        
                        <div>
                            <Label value="City" className="block mb-2" />
                            <SearchableSelect
                                id="tourCity"
                                value={tourData.city}
                                onChange={(e) => setTourData({...tourData, city: e.target.value})}
                                options={[
                                    { value: '', label: 'Select City' },
                                    ...getCitiesByCountry(tourData.country).map(city => ({ value: city, label: city }))
                                ]}
                                placeholder="Search for a city..."
                                disabled={!tourData.country}
                            />
                            {!tourData.country && (
                                <p className="text-xs text-gray-500 mt-1">Select a country first</p>
                            )}
                        </div>
                    </div>
                    
                    <div className={`grid grid-cols-1 ${tourData.tourType === 'Group' ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
                        <div>
                            <CustomSelect
                                id="tourType"
                                label="Tour Type"
                                value={tourData.tourType}
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
                                    value={tourData.vipCarType}
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
                            </div>
                        )}
                        
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tourPrice" value={tourData.tourType === 'Group' ? 'Price per Person ($) (Capital)' : 'Price per Car ($) (Capital)'} />
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
                                <Label htmlFor="tourTotalPrice" value="Total Price ($)" />
                            </div>
                            <TextInput
                                id="tourTotalPrice"
                                type="number"
                                name="totalPrice"
                                value={tourData.totalPrice}
                                onChange={handleTourChange}
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
                    
                    {tourData.tourType === 'VIP' && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {tourData.vipCarType === 'Vito' 
                                ? 'Capacity: 2-8 persons' 
                                : 'Capacity: 9-16 persons'}
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
                        <TextInput
                            id="tourDetailDesc"
                            name="detailedDescription"
                            as="textarea"
                            rows={4}
                            value={tourData.detailedDescription}
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
                                icon={HiPlus}
                                title="Add highlight to tour"
                            >
                                Add
                            </CustomButton>
                        </div>
                        
                        {tourData.highlights.length > 0 && (
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Added Highlights:</h4>
                                <ul className="space-y-2">
                                    {tourData.highlights.map((highlight, index) => (
                                        <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
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
                                icon={HiPlus}
                                title="Add policy to tour"
                            >
                                Add
                            </CustomButton>
                        </div>
                        
                        {tourData.policies.length > 0 && (
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Added Policies:</h4>
                                <ul className="space-y-2">
                                    {tourData.policies.map((policy, index) => (
                                        <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
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

                    {/* Custom URL Slug */}
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="tourSlug" value="Custom URL Slug (Optional)" className="text-sm font-medium text-gray-700 dark:text-gray-200" />
                        </div>
                        <TextInput
                            id="tourSlug"
                            name="slug"
                            value={tourData.slug}
                            onChange={handleSlugChange}
                            placeholder="e.g., istanbul-historic-tour"
                            className={slugError ? 'border-red-500' : ''}
                        />
                        {slugError && (
                            <p className="text-red-500 text-xs mt-1">{slugError}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                            Preview: <span className="font-mono">/tours/{tourData.slug && tourData.slug.trim() ? formatSlug(tourData.slug) : tourData.name && tourData.name.trim() ? formatSlug(tourData.name) + ' (auto-generated)' : 'tour-name (auto-generated)'}</span>
                        </p>
                    </div>
                    
                    <CustomButton 
                        type="submit"
                        variant="pinkToOrange"
                    >
                        Add Tour
                    </CustomButton>
                    
                </form>
            </Card>

            {/* Tour Duplicate Modal */}
            <CustomModal
                isOpen={tourDuplicateModalOpen}
                onClose={closeTourDuplicateModal}
                title="Duplicate Existing Tour"
                subtitle="Select a tour to duplicate its data. You can modify the duplicated data before creating a new tour."
                maxWidth="md:max-w-2xl"
            >
                <div className="space-y-6">
                    {modalLoading ? (
                        <div className="text-center py-12">
                            <RahalatekLoader size="sm" />
                            <p className="text-base text-gray-600 mt-4">Loading tours...</p>
                        </div>
                    ) : tours.length > 0 ? (
                        <div className="space-y-2 relative">
                            <CustomSelect
                                id="selectTourToDuplicate"
                                label="Select Tour"
                                value={selectedTourToDuplicate}
                                onChange={(value) => setSelectedTourToDuplicate(value)}
                                options={[
                                    { value: "", label: "Choose a tour" },
                                    ...tours.map(tour => ({
                                        value: tour._id,
                                        label: `${tour.name} - ${tour.city} (${tour.tourType})`
                                    }))
                                ]}
                                placeholder="Select a tour to duplicate"
                                required
                            />
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            No tours available to duplicate. Please add a tour first.
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <CustomButton variant="gray" onClick={closeTourDuplicateModal}>
                            Cancel
                        </CustomButton>
                        <CustomButton
                            variant="gray"
                            onClick={handleDuplicateTour}
                            disabled={!selectedTourToDuplicate || modalLoading}
                            icon={HiDuplicate}
                        >
                            Duplicate
                        </CustomButton>
                    </div>
                </div>
            </CustomModal>
        </>
    );
}
