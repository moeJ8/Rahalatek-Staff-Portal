import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import { getTranslatedText, getTranslatedArray } from '../../utils/translationUtils';
import PublicPackageHero from '../../components/PublicPackageHero';
import PackageDayCard from '../../components/Visitors/PackageDayCard';
import ContactForm from '../../components/ContactForm';
import OtherPackagesCarousel from '../../components/Visitors/OtherPackagesCarousel';
import RahalatekLoader from '../../components/RahalatekLoader';

export default function PublicPackagePage() {
    const params = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // Extract slug and language from URL
    // URL can be: /packages/:slug OR /ar/packages/:slug OR /fr/packages/:slug
    const slug = params.slug;
    const urlPath = window.location.pathname;
    const langMatch = urlPath.match(/^\/(ar|fr)\/packages\//);
    const urlLang = langMatch ? langMatch[1] : null; // 'ar', 'fr', or null for English

    const isRTL = i18n.language === 'ar';
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [zoomedHotelImage, setZoomedHotelImage] = useState(null);
    const [activeFaqIndex, setActiveFaqIndex] = useState(null);
    const [otherPackages, setOtherPackages] = useState([]);

    const toggleFaq = (index) => {
        setActiveFaqIndex(activeFaqIndex === index ? null : index);
    };

    // Fetch other packages
    const fetchOtherPackages = async () => {
        try {
            const response = await axios.get('/api/packages/featured?limit=12');
            if (response.data?.success) {
                setOtherPackages(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch other packages:', error);
        }
    };

    // Fetch package data by slug
    useEffect(() => {
        const fetchPackage = async () => {
            setLoading(true);

            try {
                // Send language parameter to backend for SEO (only for ar/fr)
                const langParam = urlLang ? `?lang=${urlLang}` : '';
                const response = await axios.get(`/api/packages/public/${slug}${langParam}`);

                if (response.data?.success) {
                    setPackageData(response.data.data);
                    // Fetch other packages after getting the main package
                    await fetchOtherPackages();
                } else {
                    throw new Error(response.data?.message || 'Package not found');
                }
            } catch (error) {
                console.error('Error fetching package:', error);

                // Redirect to 404 (wildcard route will handle showing correct page based on auth)
                navigate('/package-not-found', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPackage();
        }
    }, [slug, navigate, urlLang]);

    // SEO Meta Tags
    useEffect(() => {
        if (!packageData) return;

        // Get translated name and description
        const translatedName = getTranslatedText(packageData, 'name', i18n.language);
        const translatedDescription = getTranslatedText(packageData, 'description', i18n.language);

        // Set page title
        document.title = `${translatedName} | Rahalatek`;

        // Create description from package data
        const description = translatedDescription
            ? translatedDescription.substring(0, 155) + '...'
            : `Discover ${translatedName} - ${packageData.duration} days tour package in Turkey. Book your unforgettable journey with Rahalatek.`;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        }

        // Update keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            const keywords = [
                translatedName,
                'Turkey tour package',
                'tour package Turkey',
                packageData.destination?.name,
                `${packageData.duration} days tour`,
                'guided tour',
                'travel package',
                'Turkey travel',
                'tourism package',
                'Rahalatek tours'
            ].filter(Boolean).join(', ');
            metaKeywords.setAttribute('content', keywords);
        }

        // Update Open Graph
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', `${translatedName} - Tour Package | Rahalatek`);
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', description);
        }

        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && packageData.images?.[0]) {
            ogImage.setAttribute('content', packageData.images[0]);
        }

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) {
            ogUrl.setAttribute('content', window.location.href);
        }

        // Update Twitter Card
        const twitterCard = document.querySelector('meta[name="twitter:card"]');
        if (twitterCard) {
            twitterCard.setAttribute('content', 'summary_large_image');
        }

        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) {
            twitterTitle.setAttribute('content', `${translatedName} - Tour Package | Rahalatek`);
        }

        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription) {
            twitterDescription.setAttribute('content', description);
        }

        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage && packageData.images?.[0]) {
            twitterImage.setAttribute('content', packageData.images[0]);
        }

        // Add canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = window.location.href;

        // Add structured data for SEO
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            "name": translatedName,
            "description": translatedDescription || description,
            "image": packageData.images || [],
            "touristType": "International",
            "itinerary": {
                "@type": "ItemList",
                "numberOfItems": packageData.duration,
                "itemListElement": packageData.dailyItinerary?.map((day, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": `Day ${day.dayNumber}: ${day.title}`,
                    "description": day.description
                })) || []
            },
            "provider": {
                "@type": "TravelAgency",
                "name": "Rahalatek",
                "telephone": "+905010684657",
                "url": window.location.origin
            },
            "offers": {
                "@type": "Offer",
                "price": packageData.adultPrice,
                "priceCurrency": "USD",
                "availability": packageData.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "validFrom": new Date().toISOString()
            },
            "duration": `P${packageData.duration}D`,
            "touristDestination": packageData.destination?.name || "Turkey"
        };

        let script = document.querySelector('script[type="application/ld+json"]');
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(structuredData);

        // Cleanup function
        return () => {
            // Reset to default on unmount
            document.title = 'Rahalatek';
        };
    }, [packageData, i18n.language]);

    // Add hreflang tags for SEO
    useEffect(() => {
        if (!slug) return;

        const baseUrl = window.location.origin;

        // Remove existing hreflang tags
        const existingTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
        existingTags.forEach(tag => tag.remove());

        // Add hreflang tags for all language versions
        const languages = [
            { code: 'en', path: `/packages/${slug}` },
            { code: 'ar', path: `/ar/packages/${slug}` },
            { code: 'fr', path: `/fr/packages/${slug}` }
        ];

        languages.forEach(({ code, path }) => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = code;
            link.href = `${baseUrl}${path}`;
            document.head.appendChild(link);
        });

        // Add x-default (fallback for unspecified languages)
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = `${baseUrl}/packages/${slug}`;
        document.head.appendChild(defaultLink);

        // Cleanup function
        return () => {
            const allTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
            allTags.forEach(tag => tag.remove());
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <RahalatekLoader size="lg" />
            </div>
        );
    }

    if (!packageData && !loading) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <div className="-mt-6">
                <PublicPackageHero package={packageData} />
            </div>
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation Bar */}
                <div className="py-4">
                    <div className={`flex justify-start sm:justify-center overflow-x-auto scrollbar-hide gap-1 sm:gap-2 md:gap-4 px-4 pb-2 sm:pb-0 ${isRTL ? 'space-x-reverse' : ''}`}>
                        <button 
                            onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            {t('publicPackagePage.nav.overview')}
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
                        </button>
                        <button 
                            onClick={() => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            {t('publicPackagePage.nav.itinerary')}
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
                        </button>
                        <button 
                            onClick={() => document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            {t('publicPackagePage.nav.hotels')}
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
                        </button>
                        <button 
                            onClick={() => document.getElementById('included')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            {t('publicPackagePage.nav.included')}
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
                        </button>
                        <button 
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
                        >
                            {t('publicPackagePage.nav.contact')}
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
                        </button>
                        {packageData.faqs && packageData.faqs.length > 0 && (
                            <button 
                                onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex-shrink-0 font-medium py-1 sm:py-1.5 md:py-2 px-1.5 sm:px-2 md:px-3 rounded-md sm:rounded-lg transition-all duration-300 relative group text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-blue-50/50 dark:hover:bg-yellow-900/10 text-xs sm:text-sm md:text-base whitespace-nowrap"
                            >
                                {t('publicPackagePage.nav.faqs')}
                                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 dark:bg-yellow-400 transition-all duration-300 w-0 group-hover:w-full"></span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Overview Section */}
                <div id="overview" className="scroll-mt-24"></div>
                {getTranslatedText(packageData, 'description', i18n.language) && (
                    <div className="py-4 sm:py-6">
                        <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('publicPackagePage.sections.overview')}
                        </h2>
                        <p className={`text-gray-900 dark:text-gray-100 leading-relaxed text-sm sm:text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                            {getTranslatedText(packageData, 'description', i18n.language)}
                        </p>
                    </div>
                )}

                {/* Daily Itinerary Section */}
                <div id="itinerary" className="scroll-mt-24"></div>
                {packageData.dailyItinerary && packageData.dailyItinerary.length > 0 && (
                    <div className="py-4 sm:py-6" dir="ltr">
                        <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('publicPackagePage.sections.itinerary')}
                        </h2>
                        <div className="space-y-6">
                            {packageData.dailyItinerary.map((day, index) => {
                                // Find the tour assigned to this day
                                const assignedTour = packageData.tours?.find(tour => tour.day === day.day);
                                const tourData = assignedTour?.tourId;
                                
                                return (
                                    <PackageDayCard
                                        key={index}
                                        day={day}
                                        tourData={tourData}
                                        onCardClick={(slug) => {
                                            const lang = i18n.language;
                                            const url = (lang === 'ar' || lang === 'fr') ? `/${lang}/tours/${slug}` : `/tours/${slug}`;
                                            window.open(url, '_blank');
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Hotels Section */}
                <div id="hotels" className="scroll-mt-24"></div>
                {packageData.hotels && packageData.hotels.length > 0 && (
                    <div className="py-4 sm:py-6">
                        <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('publicPackagePage.sections.hotels')}
                        </h2>
                        <div className="space-y-6">
                            {packageData.hotels.map((hotel, index) => {
                                const hotelData = hotel.hotelId;
                                const primaryImage = hotelData?.images?.find(img => img.isPrimary) || hotelData?.images?.[0];
                                const nights = hotel.checkIn && hotel.checkOut ? 
                                    Math.ceil((new Date(hotel.checkOut) - new Date(hotel.checkIn)) / (1000 * 60 * 60 * 24)) : 0;
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex flex-col md:flex-row gap-6 items-start cursor-pointer group ${isRTL ? 'md:flex-row-reverse' : ''}`}
                                        onClick={() => {
                                            if (!hotelData?.slug) return;
                                            const lang = i18n.language;
                                            const url = (lang === 'ar' || lang === 'fr') ? `/${lang}/hotels/${hotelData.slug}` : `/hotels/${hotelData.slug}`;
                                            window.open(url, '_blank');
                                        }}
                                    >
                                        {/* Hotel Image */}
                                        {primaryImage && (
                                            <div 
                                                className="w-full md:w-72 flex-shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setZoomedHotelImage({
                                                        url: primaryImage.url,
                                                        alt: primaryImage.altText || hotelData?.name || 'Hotel',
                                                        title: hotelData?.name,
                                                        subtitle: `${hotelData?.city} • ${hotelData?.stars}⭐`
                                                    });
                                                }}
                                            >
                                                <div className="relative overflow-hidden rounded-lg shadow-md">
                                                    <img
                                                        src={primaryImage.url}
                                                        alt={primaryImage.altText || hotelData?.name || 'Hotel'}
                                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    {/* Zoom indicator */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm rounded-full p-2">
                                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Hotel Info */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-yellow-400">
                                                {hotelData?.name || `Hotel ${index + 1}`}
                                            </h3>
                                            <div className={`flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                                                <span>📍 {hotelData?.city}</span>
                                                {hotelData?.stars && (
                                                    <span>⭐ {hotelData.stars} {t('publicPackagePage.hotel.starHotel')}</span>
                                                )}
                                                {hotel.checkIn && hotel.checkOut && (
                                                    <span>🛏️ {nights} {t('publicPackagePage.hotel.nights', { count: nights })}</span>
                                                )}
                                            </div>
                                            
                                            {/* Hotel description */}
                                            {hotelData?.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">
                                                    {hotelData.description}
                                                </p>
                                            )}
                                            
                                            {hotel.checkIn && hotel.checkOut && (
                                                <div className={`text-sm text-gray-600 dark:text-gray-400 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                    <span className="font-medium">{t('publicPackagePage.hotel.checkIn')}:</span> {new Date(hotel.checkIn).toLocaleDateString()} 
                                                    <span className="mx-2">•</span>
                                                    <span className="font-medium">{t('publicPackagePage.hotel.checkOut')}:</span> {new Date(hotel.checkOut).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className={`flex flex-wrap gap-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                                                {hotel.includeBreakfast && (
                                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-400 dark:to-yellow-500 text-white font-semibold rounded-full shadow-sm">
                                                        ✓ {t('publicPackagePage.hotel.breakfast')}
                                                    </span>
                                                )}
                                                {hotel.includeReception && (
                                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-400 dark:to-yellow-500 text-white font-semibold rounded-full shadow-sm">
                                                        ✓ {t('publicPackagePage.hotel.airportReception')}
                                                    </span>
                                                )}
                                                {hotel.includeFarewell && (
                                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-400 dark:to-yellow-500 text-white font-semibold rounded-full shadow-sm">
                                                        ✓ {t('publicPackagePage.hotel.airportFarewell')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Includes & Excludes Section */}
                <div id="included" className="scroll-mt-24">
                    <div className="py-4 sm:py-6">
                    <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('publicPackagePage.sections.included')}
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Included */}
                        {packageData.includes && packageData.includes.length > 0 && (
                            <div>
                                <h3 className={`text-xl font-bold text-green-700 dark:text-green-400 mb-5 flex items-center ${isRTL ? 'space-x-reverse' : ''}`}>
                                    <span className={`w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md ${isRTL ? 'ml-3' : 'mr-3'}`}>
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    {t('publicPackagePage.included.title')}
                                </h3>
                                <ul className={`space-y-3 ${isRTL ? 'mr-12' : 'ml-12'}`}>
                                    {getTranslatedArray(packageData, 'includes', i18n.language).map((item, index) => (
                                        <li key={index} className={`flex items-start group transition-transform duration-200 ${isRTL ? 'hover:translate-x-[-4px] space-x-reverse' : 'hover:translate-x-1'}`}>
                                            <span className={`w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm ${isRTL ? 'ml-3' : 'mr-3'}`}>
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className={`text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Excluded */}
                        {packageData.excludes && packageData.excludes.length > 0 && (
                            <div>
                                <h3 className={`text-xl font-bold text-red-700 dark:text-red-400 mb-5 flex items-center ${isRTL ? 'space-x-reverse' : ''}`}>
                                    <span className={`w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md ${isRTL ? 'ml-3' : 'mr-3'}`}>
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    {t('publicPackagePage.excluded.title')}
                                </h3>
                                <ul className={`space-y-3 ${isRTL ? 'mr-12' : 'ml-12'}`}>
                                    {getTranslatedArray(packageData, 'excludes', i18n.language).map((item, index) => (
                                        <li key={index} className={`flex items-start group transition-transform duration-200 ${isRTL ? 'hover:translate-x-[-4px] space-x-reverse' : 'hover:translate-x-1'}`}>
                                            <span className={`w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm ${isRTL ? 'ml-3' : 'mr-3'}`}>
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className={`text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Section */}
                <div id="contact" className="scroll-mt-24"></div>
                <div className="py-4 sm:py-6">
                    <ContactForm 
                        packageName={packageData.name}
                        packageSlug={packageData.slug}
                    />
                </div>
               
                </div>
            </div>

            {/* Other Packages Carousel */}
            {otherPackages.length > 0 && packageData?._id && (
                <OtherPackagesCarousel 
                    packages={otherPackages}
                    currentPackageId={packageData._id}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* FAQs Section */}
                <div id="faqs" className="scroll-mt-24"></div>
                {packageData.faqs && packageData.faqs.length > 0 && (
                    <div className="py-4 sm:py-6">
                        <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('publicPackagePage.sections.faqs')}
                        </h2>
                        
                        <div className="space-y-3 sm:space-y-4">
                            {packageData.faqs.map((faq, index) => (
                                <div 
                                    key={index}
                                    className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 ${
                                        activeFaqIndex === index 
                                            ? `shadow-md ${isRTL ? 'border-r-4 border-r-blue-500 dark:border-r-yellow-400' : 'border-l-4 border-l-blue-500 dark:border-l-yellow-400'}` 
                                            : `hover:shadow-md hover:${isRTL ? 'border-r-4 hover:border-r-blue-500 dark:hover:border-r-yellow-400' : 'border-l-4 hover:border-l-blue-500 dark:hover:border-l-yellow-400'}`
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className={`flex justify-between items-center w-full px-4 sm:px-6 py-5 transition-colors duration-200 ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}
                                        aria-expanded={activeFaqIndex === index}
                                    >
                                        <h3 className={`font-semibold text-base sm:text-lg flex-grow ${isRTL ? 'pl-3 text-right' : 'pr-3 text-left'} ${
                                            activeFaqIndex === index 
                                                ? 'text-blue-700 dark:text-yellow-300' 
                                                : 'text-gray-800 dark:text-gray-100'
                                        }`}>
                                            {faq.question}
                                        </h3>
                                        <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
                                            activeFaqIndex === index 
                                                ? 'bg-blue-100 dark:bg-yellow-900/30 text-blue-600 dark:text-yellow-400' 
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {activeFaqIndex === index ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
                                        </span>
                                    </button>
                                    
                                    <div 
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            activeFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className={`px-4 sm:px-6 py-5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Hotel Image Zoom Modal */}
            {zoomedHotelImage && (
                <div 
                    className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setZoomedHotelImage(null)}
                >
                    <div className="relative max-w-5xl max-h-full w-full">
                        {/* Close button */}
                        <button
                            onClick={() => setZoomedHotelImage(null)}
                            className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        {/* Image */}
                        <div className="relative">
                            <img
                                src={zoomedHotelImage.url}
                                alt={zoomedHotelImage.alt}
                                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                            
                            {/* Image info overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 rounded-b-lg">
                                <h3 className="text-white text-xl font-bold mb-1">
                                    {zoomedHotelImage.title}
                                </h3>
                                <p className="text-white/90 text-sm">
                                    {zoomedHotelImage.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}