import React, { useEffect } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { Card, Label, Textarea, Select } from 'flowbite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiX, HiTrash, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import CustomButton from '../components/CustomButton';
import CustomSelect from '../components/Select';
import TextInput from '../components/TextInput';
import RahalatekLoader from '../components/RahalatekLoader';
import ImageUploader from '../components/ImageUploader';
import toast from 'react-hot-toast';
import { getCountries, getCitiesByCountry } from '../utils/countryCities';
import { validateSlug, formatSlug, formatSlugWhileTyping, getSlugPreview } from '../utils/slugValidation';


export default function EditTourPage() {
    const { id } = useParams();
    const navigate = useNavigate();

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
        images: [],
        translations: {
            name: { ar: '', fr: '' },
            description: { ar: '', fr: '' },
            detailedDescription: { ar: '', fr: '' },
            highlights: [],
            policies: [],
            faqs: []
        }
    });
    const [translationCollapse, setTranslationCollapse] = useState({
        name: false,
        description: false,
        detailedDescription: false,
        highlights: false,
        policies: false,
        faqs: false
    });
    const [loading, setLoading] = useState(true);
    const [highlightInput, setHighlightInput] = useState('');
    const [policyInput, setPolicyInput] = useState('');
    const [slugError, setSlugError] = useState('');

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
            const finalTourData = {
                ...tourData,
                slug: tourData.slug ? formatSlug(tourData.slug) : '', // Final formatting
            };
            
            await axios.put(`/api/tours/${id}`, finalTourData);
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
                highlights: [...tourData.highlights, highlightInput.trim()],
                translations: {
                    ...tourData.translations,
                    highlights: [...tourData.translations.highlights, { ar: '', fr: '' }]
                }
            });
            setHighlightInput('');
        }
    };

    const handleRemoveHighlight = (index) => {
        const updatedHighlights = [...tourData.highlights];
        const updatedTranslationHighlights = [...tourData.translations.highlights];
        updatedHighlights.splice(index, 1);
        updatedTranslationHighlights.splice(index, 1);
        setTourData({
            ...tourData,
            highlights: updatedHighlights,
            translations: {
                ...tourData.translations,
                highlights: updatedTranslationHighlights
            }
        });
    };

    const handleAddPolicy = () => {
        if (policyInput.trim()) {
            setTourData({
                ...tourData,
                policies: [...tourData.policies, policyInput.trim()],
                translations: {
                    ...tourData.translations,
                    policies: [...tourData.translations.policies, { ar: '', fr: '' }]
                }
            });
            setPolicyInput('');
        }
    };

    const handleRemovePolicy = (index) => {
        const updatedPolicies = [...tourData.policies];
        const updatedTranslationPolicies = [...tourData.translations.policies];
        updatedPolicies.splice(index, 1);
        updatedTranslationPolicies.splice(index, 1);
        setTourData({
            ...tourData,
            policies: updatedPolicies,
            translations: {
                ...tourData.translations,
                policies: updatedTranslationPolicies
            }
        });
    };

    const toggleTranslationCollapse = (section) => {
        setTranslationCollapse(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleTranslationChange = (field, language, value) => {
        setTourData({
            ...tourData,
            translations: {
                ...tourData.translations,
                [field]: {
                    ...tourData.translations[field],
                    [language]: value
                }
            }
        });
    };

    const handleArrayTranslationChange = (field, index, language, value) => {
        const updatedTranslations = [...tourData.translations[field]];
        if (!updatedTranslations[index]) {
            updatedTranslations[index] = { ar: '', fr: '' };
        }
        updatedTranslations[index][language] = value;
        setTourData({
            ...tourData,
            translations: {
                ...tourData.translations,
                [field]: updatedTranslations
            }
        });
    };

    // FAQ handlers
    const handleAddFaq = () => {
        setTourData({
            ...tourData,
            faqs: [...tourData.faqs, { question: '', answer: '' }],
            translations: {
                ...tourData.translations,
                faqs: [...tourData.translations.faqs, { question: { ar: '', fr: '' }, answer: { ar: '', fr: '' } }]
            }
        });
    };

    const handleRemoveFaq = (index) => {
        const updatedFaqs = [...tourData.faqs];
        const updatedTranslationFaqs = [...tourData.translations.faqs];
        updatedFaqs.splice(index, 1);
        updatedTranslationFaqs.splice(index, 1);
        setTourData({
            ...tourData,
            faqs: updatedFaqs,
            translations: {
                ...tourData.translations,
                faqs: updatedTranslationFaqs
            }
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
                                <div className="mb-2 flex items-center justify-between">
                                    <Label htmlFor="tourName" value="Tour Name" />
                                    <button
                                        type="button"
                                        onClick={() => toggleTranslationCollapse('name')}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        Translations
                                        {translationCollapse.name ? <HiChevronUp /> : <HiChevronDown />}
                                    </button>
                                </div>
                                <TextInput
                                    id="tourName"
                                    name="name"
                                    value={tourData.name}
                                    onChange={handleTourChange}
                                    required
                                />
                                {translationCollapse.name && (
                                    <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Note: The field above is in English. Add translations below. Leave empty to use English as fallback.
                                        </p>
                                        <TextInput
                                            label="Arabic Translation (Optional)"
                                            placeholder="Leave empty to use English"
                                            value={tourData.translations?.name?.ar || ''}
                                            onChange={(e) => handleTranslationChange('name', 'ar', e.target.value)}
                                        />
                                        <TextInput
                                            label="French Translation (Optional)"
                                            placeholder="Leave empty to use English"
                                            value={tourData.translations?.name?.fr || ''}
                                            onChange={(e) => handleTranslationChange('name', 'fr', e.target.value)}
                                        />
                                    </div>
                                )}
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
                        
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <Label htmlFor="tourDesc" value="Brief Description" />
                                <button
                                    type="button"
                                    onClick={() => toggleTranslationCollapse('description')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    Translations
                                    {translationCollapse.description ? <HiChevronUp /> : <HiChevronDown />}
                                </button>
                            </div>
                            <TextInput
                                id="tourDesc"
                                name="description"
                                value={tourData.description}
                                onChange={handleTourChange}
                            />
                            {translationCollapse.description && (
                                <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Note: The field above is in English. Add translations below. Leave empty to use English as fallback.
                                    </p>
                                    <TextInput
                                        as="textarea"
                                        rows={2}
                                        label="Arabic Translation (Optional)"
                                        placeholder="Leave empty to use English"
                                        value={tourData.translations?.description?.ar || ''}
                                        onChange={(e) => handleTranslationChange('description', 'ar', e.target.value)}
                                    />
                                    <TextInput
                                        as="textarea"
                                        rows={2}
                                        label="French Translation (Optional)"
                                        placeholder="Leave empty to use English"
                                        value={tourData.translations?.description?.fr || ''}
                                        onChange={(e) => handleTranslationChange('description', 'fr', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <Label htmlFor="tourDetailDesc" value="Detailed Description" />
                                <button
                                    type="button"
                                    onClick={() => toggleTranslationCollapse('detailedDescription')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    Translations
                                    {translationCollapse.detailedDescription ? <HiChevronUp /> : <HiChevronDown />}
                                </button>
                            </div>
                            <TextInput
                                id="tourDetailDesc"
                                name="detailedDescription"
                                as="textarea"
                                rows={4}
                                value={tourData.detailedDescription || ''}
                                onChange={handleTourChange}
                            />
                            {translationCollapse.detailedDescription && (
                                <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Note: The field above is in English. Add translations below. Leave empty to use English as fallback.
                                    </p>
                                    <TextInput
                                        as="textarea"
                                        rows={4}
                                        label="Arabic Translation (Optional)"
                                        placeholder="Leave empty to use English"
                                        value={tourData.translations?.detailedDescription?.ar || ''}
                                        onChange={(e) => handleTranslationChange('detailedDescription', 'ar', e.target.value)}
                                    />
                                    <TextInput
                                        as="textarea"
                                        rows={4}
                                        label="French Translation (Optional)"
                                        placeholder="Leave empty to use English"
                                        value={tourData.translations?.detailedDescription?.fr || ''}
                                        onChange={(e) => handleTranslationChange('detailedDescription', 'fr', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <Label value="Tour Highlights" />
                                <button
                                    type="button"
                                    onClick={() => toggleTranslationCollapse('highlights')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    Translations
                                    {translationCollapse.highlights ? <HiChevronUp /> : <HiChevronDown />}
                                </button>
                            </div>
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
                                    <ul className="space-y-3">
                                        {tourData.highlights.map((highlight, index) => (
                                            <li key={index} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-800 dark:text-gray-200">• {highlight}</span>
                                                    <CustomButton 
                                                        variant="red" 
                                                        size="xs"
                                                        onClick={() => handleRemoveHighlight(index)}
                                                        icon={HiX}
                                                        title="Remove highlight"
                                                    />
                                                </div>
                                                {translationCollapse.highlights && tourData.translations?.highlights?.[index] && (
                                                    <div className="pl-6 mt-1 space-y-2 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-slate-800">
                                                        <TextInput
                                                            size="sm"
                                                            placeholder="Arabic translation (optional)"
                                                            value={tourData.translations.highlights[index]?.ar || ''}
                                                            onChange={(e) => handleArrayTranslationChange('highlights', index, 'ar', e.target.value)}
                                                        />
                                                        <TextInput
                                                            size="sm"
                                                            placeholder="French translation (optional)"
                                                            value={tourData.translations.highlights[index]?.fr || ''}
                                                            onChange={(e) => handleArrayTranslationChange('highlights', index, 'fr', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        {/* Tour Policies */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <Label value="Tour Policies" />
                                <button
                                    type="button"
                                    onClick={() => toggleTranslationCollapse('policies')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    Translations
                                    {translationCollapse.policies ? <HiChevronUp /> : <HiChevronDown />}
                                </button>
                            </div>
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
                                    <ul className="space-y-3">
                                        {tourData.policies.map((policy, index) => (
                                            <li key={index} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-800 dark:text-gray-200">• {policy}</span>
                                                    <CustomButton 
                                                        variant="red" 
                                                        size="xs"
                                                        onClick={() => handleRemovePolicy(index)}
                                                        icon={HiX}
                                                        title="Remove policy"
                                                    />
                                                </div>
                                                {translationCollapse.policies && tourData.translations?.policies?.[index] && (
                                                    <div className="pl-6 mt-1 space-y-2 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-slate-800">
                                                        <TextInput
                                                            size="sm"
                                                            placeholder="Arabic translation (optional)"
                                                            value={tourData.translations.policies[index]?.ar || ''}
                                                            onChange={(e) => handleArrayTranslationChange('policies', index, 'ar', e.target.value)}
                                                        />
                                                        <TextInput
                                                            size="sm"
                                                            placeholder="French translation (optional)"
                                                            value={tourData.translations.policies[index]?.fr || ''}
                                                            onChange={(e) => handleArrayTranslationChange('policies', index, 'fr', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        {/* Tour FAQs */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <Label htmlFor="faqs" value="Tour FAQs" />
                                <button
                                    type="button"
                                    onClick={() => toggleTranslationCollapse('faqs')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    Translations
                                    {translationCollapse.faqs ? <HiChevronUp /> : <HiChevronDown />}
                                </button>
                            </div>
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
                                                {translationCollapse.faqs && tourData.translations?.faqs?.[index] && (
                                                    <div className="mt-2 space-y-2 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-slate-800">
                                                        <TextInput
                                                            size="sm"
                                                            placeholder="Arabic question translation (optional)"
                                                            value={tourData.translations.faqs[index]?.question?.ar || ''}
                                                            onChange={(e) => {
                                                                const updatedTranslations = [...(tourData.translations?.faqs || [])];
                                                                if (!updatedTranslations[index]) updatedTranslations[index] = { question: { ar: '', fr: '' }, answer: { ar: '', fr: '' } };
                                                                if (!updatedTranslations[index].question) updatedTranslations[index].question = { ar: '', fr: '' };
                                                                updatedTranslations[index].question.ar = e.target.value;
                                                                setTourData({
                                                                    ...tourData,
                                                                    translations: { ...tourData.translations, faqs: updatedTranslations }
                                                                });
                                                            }}
                                                        />
                                                        <TextInput
                                                            size="sm"
                                                            placeholder="French question translation (optional)"
                                                            value={tourData.translations.faqs[index]?.question?.fr || ''}
                                                            onChange={(e) => {
                                                                const updatedTranslations = [...(tourData.translations?.faqs || [])];
                                                                if (!updatedTranslations[index]) updatedTranslations[index] = { question: { ar: '', fr: '' }, answer: { ar: '', fr: '' } };
                                                                if (!updatedTranslations[index].question) updatedTranslations[index].question = { ar: '', fr: '' };
                                                                updatedTranslations[index].question.fr = e.target.value;
                                                                setTourData({
                                                                    ...tourData,
                                                                    translations: { ...tourData.translations, faqs: updatedTranslations }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                )}
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
                                                {translationCollapse.faqs && tourData.translations?.faqs?.[index] && (
                                                    <div className="mt-2 space-y-2 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-slate-800">
                                                        <TextInput
                                                            size="sm"
                                                            as="textarea"
                                                            rows={2}
                                                            placeholder="Arabic answer translation (optional)"
                                                            value={tourData.translations.faqs[index]?.answer?.ar || ''}
                                                            onChange={(e) => {
                                                                const updatedTranslations = [...(tourData.translations?.faqs || [])];
                                                                if (!updatedTranslations[index]) updatedTranslations[index] = { question: { ar: '', fr: '' }, answer: { ar: '', fr: '' } };
                                                                if (!updatedTranslations[index].answer) updatedTranslations[index].answer = { ar: '', fr: '' };
                                                                updatedTranslations[index].answer.ar = e.target.value;
                                                                setTourData({
                                                                    ...tourData,
                                                                    translations: { ...tourData.translations, faqs: updatedTranslations }
                                                                });
                                                            }}
                                                        />
                                                        <TextInput
                                                            size="sm"
                                                            as="textarea"
                                                            rows={2}
                                                            placeholder="French answer translation (optional)"
                                                            value={tourData.translations.faqs[index]?.answer?.fr || ''}
                                                            onChange={(e) => {
                                                                const updatedTranslations = [...(tourData.translations?.faqs || [])];
                                                                if (!updatedTranslations[index]) updatedTranslations[index] = { question: { ar: '', fr: '' }, answer: { ar: '', fr: '' } };
                                                                if (!updatedTranslations[index].answer) updatedTranslations[index].answer = { ar: '', fr: '' };
                                                                updatedTranslations[index].answer.fr = e.target.value;
                                                                setTourData({
                                                                    ...tourData,
                                                                    translations: { ...tourData.translations, faqs: updatedTranslations }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                )}
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
                                Preview: <span className="font-mono">/tours/{getSlugPreview(tourData.slug, tourData.name)}</span>
                            </p>
                        </div>
                        
                        <CustomButton type="submit" variant="pinkToOrange">
                            Update Tour
                        </CustomButton>
                    </form>
                </Card>
    </div>
  )
}
