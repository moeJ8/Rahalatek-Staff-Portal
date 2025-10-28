import React, { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaAngleLeft, FaAngleRight, FaGlobe, FaCity, FaClock, FaUsers, FaBox, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTranslatedText } from '../../utils/translationUtils';
import RahalatekLoader from '../../components/RahalatekLoader';
import Search from '../../components/Search';
import CustomButton from '../../components/CustomButton';
import CustomScrollbar from '../../components/CustomScrollbar';
import SearchableSelect from '../../components/SearchableSelect';
import PackageCard from '../../components/Visitors/PackageCard';
import axios from 'axios';

const PublicPackagesPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [packages, setPackages] = useState([]);
  const [recentPackages, setRecentPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenType, setScreenType] = useState('desktop');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [targetAudienceFilter, setTargetAudienceFilter] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPackages, setTotalPackages] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const navigate = useNavigate();

  // Check screen size for responsive behavior
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
    } else if (width < 1024) {
      setScreenType('tablet');
    } else {
      setScreenType('desktop');
    }
  }, []);

  // Items per page based on screen type
  const getItemsPerPage = useCallback((type) => {
    switch(type) {
      case 'mobile':
        return 3;
      case 'tablet':
        return 6;
      case 'desktop':
      default:
        return 9;
    }
  }, []);

  // Debounce search term (300ms delay for faster response)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when screen type or filters change
  useEffect(() => {
    setPage(1);
  }, [screenType, debouncedSearchTerm, countryFilter, cityFilter, durationFilter, targetAudienceFilter]);

  // Screen size effect
  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  // Set page title and meta tags (dynamically based on filters)
  useEffect(() => {
    // Dynamic title based on city filter
    if (cityFilter) {
      document.title = `${cityFilter} Packages | Rahalatek`;
    } else if (countryFilter) {
      document.title = `${countryFilter} Packages | Rahalatek`;
    } else {
      document.title = 'Rahalatek | Travel Packages';
    }
    
    // Update meta description based on location
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      let description;
      if (cityFilter) {
        description = `Discover amazing travel packages in ${cityFilter} with Rahalatek. Browse multi-day packages, hotel+tour combinations, and complete travel experiences in ${cityFilter}. Book your perfect ${cityFilter} package today.`;
      } else if (countryFilter) {
        description = `Explore ${countryFilter} travel packages with Rahalatek. Find multi-day packages, complete travel experiences, and vacation packages throughout ${countryFilter}. Book your perfect ${countryFilter} package today.`;
      } else {
        description = 'Browse amazing travel packages with Rahalatek. Find multi-day tours, hotel combinations, and complete travel experiences worldwide. Book your perfect vacation package today.';
      }
      metaDescription.setAttribute('content', description);
    }

    // Update keywords based on location
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      let keywords;
      if (cityFilter) {
        keywords = `${cityFilter} packages, ${cityFilter} travel, ${cityFilter} vacation packages, ${cityFilter} travel packages, packages in ${cityFilter}, ${cityFilter} tourism, ${cityFilter} tours and hotels, ${cityFilter} multi-day tours`;
      } else if (countryFilter) {
        keywords = `${countryFilter} packages, ${countryFilter} travel, ${countryFilter} vacation packages, ${countryFilter} travel packages, packages in ${countryFilter}, ${countryFilter} tourism`;
      } else {
        keywords = 'travel packages, vacation packages, tour packages, multi-day tours, hotel and tour packages, complete travel packages, holiday packages, travel deals, package tours, all-inclusive packages';
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Update Open Graph based on location
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      let title;
      if (cityFilter) {
        title = `${cityFilter} Packages | Rahalatek`;
      } else if (countryFilter) {
        title = `${countryFilter} Packages | Rahalatek`;
      } else {
        title = 'Browse Travel Packages - Rahalatek | Complete Travel Experiences';
      }
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      let description;
      if (cityFilter) {
        description = `Discover amazing travel packages in ${cityFilter} with Rahalatek. Browse complete travel experiences in ${cityFilter}.`;
      } else if (countryFilter) {
        description = `Explore ${countryFilter} travel packages with Rahalatek. Find complete travel experiences throughout ${countryFilter}.`;
      } else {
        description = 'Browse amazing travel packages with Rahalatek. Find multi-day tours, hotel combinations, and complete vacation packages worldwide.';
      }
      ogDescription.setAttribute('content', description);
    }
  }, [cityFilter, countryFilter]);

  // Fetch filter options (only once on mount)
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await axios.get('/api/packages/featured?limit=100');
      const allPackages = response.data?.data || response.data || [];
      
      // Extract unique countries and cities for filters
      const countries = [...new Set(allPackages.flatMap(pkg => pkg.countries || []).filter(Boolean))].sort();
      const cities = [...new Set(allPackages.flatMap(pkg => pkg.cities || []))].sort();
      setAvailableCountries(countries);
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  // Fetch recent packages
  const fetchRecentPackages = useCallback(async () => {
    try {
      const response = await axios.get('/api/packages/recent?limit=4');
      if (response.data.success) {
        setRecentPackages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recent packages:', error);
    }
  }, []);

  // Fetch packages with server-side pagination and filtering
  const fetchPackages = useCallback(async () => {
    try {
      // Only show loading on initial page load
      if (page === 1 && !countryFilter && !cityFilter && !debouncedSearchTerm && !targetAudienceFilter && !durationFilter && packages.length === 0) {
        setLoading(true);
      }
      
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: getItemsPerPage(screenType).toString()
      });
      
      if (countryFilter) params.append('country', countryFilter);
      if (cityFilter) params.append('city', cityFilter);
      if (targetAudienceFilter) params.append('targetAudience', targetAudienceFilter);
      if (durationFilter) params.append('duration', durationFilter);
      if (debouncedSearchTerm.trim()) params.append('search', debouncedSearchTerm.trim());
      
      // Get the translation language (ar, fr, or en)
      const lang = i18n.language === 'ar' ? 'ar' : i18n.language === 'fr' ? 'fr' : 'en';
      const langParam = lang !== 'en' ? `?lang=${lang}` : '';

      // For public pages, we need to use the featured packages endpoint
      // Since the public API doesn't support pagination yet, we'll fetch all and paginate client-side
      const response = await axios.get(`/api/packages/featured?limit=100${langParam}`);
      
      if (response.data?.success) {
        const allPackages = response.data.data || [];
        
        // Apply client-side filtering since public API doesn't support server-side filtering yet
        let filteredPackages = allPackages;
        
        // Apply country filter
        if (countryFilter) {
          filteredPackages = filteredPackages.filter(pkg => pkg.countries?.includes(countryFilter));
        }
        
        // Apply city filter
        if (cityFilter) {
          filteredPackages = filteredPackages.filter(pkg => pkg.cities?.includes(cityFilter));
        }
        
        // Apply duration filter
        if (durationFilter) {
          const duration = parseInt(durationFilter);
          if (duration === 1) {
            filteredPackages = filteredPackages.filter(pkg => pkg.duration <= 3);
          } else if (duration === 2) {
            filteredPackages = filteredPackages.filter(pkg => pkg.duration > 3 && pkg.duration <= 7);
          } else if (duration === 3) {
            filteredPackages = filteredPackages.filter(pkg => pkg.duration > 7);
          }
        }
        
        // Apply target audience filter
        if (targetAudienceFilter) {
          filteredPackages = filteredPackages.filter(pkg => pkg.targetAudience?.includes(targetAudienceFilter));
        }
        
        // Apply search term
        if (debouncedSearchTerm.trim()) {
          const searchTermLower = debouncedSearchTerm.toLowerCase();
          filteredPackages = filteredPackages.filter(
            pkg =>
              pkg.name.toLowerCase().includes(searchTermLower) ||
              (pkg.cities && pkg.cities.some(city => city.toLowerCase().includes(searchTermLower))) ||
              (pkg.countries && pkg.countries.some(country => country.toLowerCase().includes(searchTermLower))) ||
              (pkg.description && pkg.description.toLowerCase().includes(searchTermLower))
          );
        }
        
        // Client-side pagination
        const itemsPerPage = getItemsPerPage(screenType);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPackages = filteredPackages.slice(startIndex, endIndex);
        
        setPackages(paginatedPackages);
        setTotalPages(Math.ceil(filteredPackages.length / itemsPerPage));
        setTotalPackages(filteredPackages.length);
      }
      
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, screenType, countryFilter, cityFilter, targetAudienceFilter, durationFilter, debouncedSearchTerm, getItemsPerPage, packages.length, i18n.language]);

  // Fetch filter options and recent packages on mount
  useEffect(() => {
    fetchFilterOptions();
    fetchRecentPackages();
  }, [fetchFilterOptions, fetchRecentPackages]);

  // Fetch packages when dependencies change
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // No more client-side filtering - everything is server-side now
  const displayedPackages = packages;

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCountryFilter = useCallback((value) => {
    setCountryFilter(value);
    setCityFilter(''); // Reset city filter when country changes
  }, []);

  const handleCityFilter = useCallback((value) => {
    setCityFilter(value);
  }, []);

  const handleDurationFilter = useCallback((value) => {
    setDurationFilter(value);
  }, []);

  const handleTargetAudienceFilter = useCallback((value) => {
    setTargetAudienceFilter(value);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCountryFilter('');
    setCityFilter('');
    setDurationFilter('');
    setTargetAudienceFilter('');
  }, []);

  const handlePackageClick = useCallback(async (pkg) => {
    try {
      // Increment view count
      await axios.post(`/api/packages/public/${pkg.slug}/view`);
    } catch (error) {
      console.error('Error incrementing package views:', error);
    }

    // Navigate to package page with language prefix for SEO (only for ar/fr)
    const lang = i18n.language;
    if (lang === 'ar' || lang === 'fr') {
      navigate(`/${lang}/packages/${pkg.slug}`);
    } else {
      navigate(`/packages/${pkg.slug}`);
    }
  }, [navigate, i18n.language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Packages</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-8xl mx-auto px-2 sm:px-3 lg:px-2 xl:px-3 py-2 sm:py-3 md:py-4">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('packagesPage.title')}
          </h1>
        </div>

        {/* Mobile Filter Toggle Buttons */}
        <div className="lg:hidden mb-4 space-y-3">
          {/* Filters Toggle */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <FaFilter className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {t('packagesPage.filters')}
              </span>
              {(searchTerm || countryFilter || cityFilter || durationFilter || targetAudienceFilter) && (
                <span className="px-2 py-0.5 text-xs bg-blue-500 dark:bg-yellow-500 text-white dark:text-gray-900 rounded-full">
                  {t('packagesPage.active')}
                </span>
              )}
            </div>
            {isFiltersOpen ? (
              <FaChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <FaChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Recent Packages Toggle */}
          <button
            onClick={() => setIsRecentOpen(!isRecentOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <FaBox className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {t('packagesPage.recentPackages')}
              </span>
            </div>
            {isRecentOpen ? (
              <FaChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <FaChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 order-1">
            <div className="lg:sticky lg:top-24">
              {/* Desktop: Single Card with All Content */}
              <div className="hidden lg:block">
                {/* Glowing Effect Wrapper */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-yellow-600 dark:to-orange-600 rounded-2xl opacity-20 blur transition duration-300 pointer-events-none"></div>
                {/* Single Card Container */}
                <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow overflow-hidden">
                  <CustomScrollbar maxHeight="calc(100vh - 120px)">
                    <div className="p-3 sm:p-4">
                      
                      {/* Search and Filters Section */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FaFilter className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('packagesPage.searchAndFilter')}</h3>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-3">
                          <Search
                            placeholder={t('packagesPage.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full"
                            showClearButton={true}
                          />
                        </div>
                        
                        {/* Country Filter */}
                        <div className="mb-3">
                          <SearchableSelect 
                            value={countryFilter}
                            onChange={(e) => handleCountryFilter(e.target.value)}
                            placeholder={t('packagesPage.allCountries')}
                            label={t('packagesPage.country')}
                            options={[
                              { value: '', label: t('packagesPage.allCountries') },
                              ...availableCountries.map(country => ({ value: country, label: country }))
                            ]}
                          />
                        </div>

                        {/* City Filter */}
                        <div className="mb-3">
                          <SearchableSelect 
                            value={cityFilter}
                            onChange={(e) => handleCityFilter(e.target.value)}
                            placeholder={t('packagesPage.allCities')}
                            label={t('packagesPage.city')}
                            options={[
                              { value: '', label: t('packagesPage.allCities') },
                              ...availableCities
                                .filter(city => !countryFilter || packages.some(pkg => pkg.cities?.includes(city) && pkg.countries?.includes(countryFilter)))
                                .map(city => ({ value: city, label: city }))
                            ]}
                            disabled={countryFilter && !packages.some(pkg => pkg.countries?.includes(countryFilter))}
                          />
                        </div>
                        
                        {/* Target Audience Filter */}
                        <div className="mb-3">
                          <SearchableSelect 
                            value={targetAudienceFilter}
                            onChange={(e) => handleTargetAudienceFilter(e.target.value)}
                            placeholder={t('packagesPage.allAudiences')}
                            label={t('packagesPage.targetAudience')}
                            options={[
                              { value: '', label: t('packagesPage.allAudiences') },
                              { value: 'Family', label: t('packagesPage.family') },
                              { value: 'Couples', label: t('packagesPage.couples') },
                              { value: 'Solo Travelers', label: t('packagesPage.soloTravelers') },
                              { value: 'Groups', label: t('packagesPage.groups') },
                              { value: 'Business', label: t('packagesPage.business') },
                              { value: 'Luxury', label: t('packagesPage.luxury') },
                              { value: 'Budget', label: t('packagesPage.budget') }
                            ]}
                          />
                        </div>
                        
                        {/* Duration Filter */}
                        <div className="mb-3">
                          <SearchableSelect 
                            value={durationFilter}
                            onChange={(e) => handleDurationFilter(e.target.value)}
                            placeholder={t('packagesPage.anyDuration')}
                            label={t('packagesPage.duration')}
                            options={[
                              { value: '', label: t('packagesPage.anyDuration') },
                              { value: '1', label: t('packagesPage.shortDuration') },
                              { value: '2', label: t('packagesPage.mediumDuration') },
                              { value: '3', label: t('packagesPage.longDuration') }
                            ]}
                          />
                        </div>
                        
                        {/* Reset Button */}
                        <CustomButton 
                          variant="rippleRedToDarkRed" 
                          onClick={resetFilters}
                          disabled={!searchTerm && !countryFilter && !cityFilter && !durationFilter && !targetAudienceFilter}
                          className="w-full"
                          icon={FaFilter}
                        >
                          {t('packagesPage.clearFilters')}
                        </CustomButton>
                  
                        {/* Results count */}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
                          {totalPackages > 0 ? (
                            <>{t('packagesPage.showingPage')} {page} {t('packagesPage.of')} {totalPages} ({totalPackages} {t('packagesPage.packagesTotal')})</>
                          ) : (
                            <>{t('packagesPage.noPackagesFound')}</>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      {recentPackages.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                      )}

                      {/* Recent Packages Section */}
                      {recentPackages.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FaBox className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('packagesPage.recentPackages')}</h3>
                          </div>
                          <div className="space-y-3">
                            {recentPackages.map((pkg) => (
                              <div
                                key={pkg._id}
                                onClick={() => handlePackageClick(pkg)}
                                className="flex gap-3 group cursor-pointer"
                              >
                                {(() => {
                                  // Get primary image or first image (same logic as PackageCard)
                                  const primaryImage = pkg.images?.find(img => img.isPrimary) || pkg.images?.[0];
                                  return primaryImage ? (
                                    <img
                                      src={primaryImage.url}
                                      alt={primaryImage.altText || pkg.name}
                                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 dark:group-hover:ring-yellow-400 transition-all"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 dark:group-hover:ring-yellow-400 transition-all">
                                      <FaBox className="w-8 h-8 text-white" />
                                    </div>
                                  );
                                })()}
                                <div className="flex-1 min-w-0 flex flex-col">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1">
                                    {pkg.name}
                                  </h4>
                                  {pkg.cities && pkg.cities.length > 0 && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                      {pkg.cities.join(', ')}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                    <FaClock className="w-3 h-3" />
                                    <span>{pkg.duration} {pkg.duration === 1 ? t('packagesPage.day') : t('packagesPage.days')}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CustomScrollbar>
                </div>
                </div>
              </div>

              {/* Mobile: Separate Collapsible Filters Section */}
              <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                isFiltersOpen ? 'max-h-[600px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
              }`}>
                {/* Glowing Effect Wrapper */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-yellow-600 dark:to-orange-600 rounded-2xl opacity-20 blur transition duration-300 pointer-events-none"></div>
                  {/* Single Card Container */}
                  <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow overflow-hidden">
                    <CustomScrollbar maxHeight="calc(100vh - 120px)">
                      <div className="p-3 sm:p-4">
                      {/* Search and Filters Section */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FaFilter className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('packagesPage.searchAndFilter')}</h3>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-3">
                          <Search
                            placeholder={t('packagesPage.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full"
                            showClearButton={true}
                          />
                        </div>

                        {/* Country Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={countryFilter}
                            onChange={handleCountryFilter}
                            placeholder={t('packagesPage.allCountries')}
                            label={t('packagesPage.country')}
                            options={[
                              { value: '', label: t('packagesPage.allCountries') },
                              ...availableCountries.map(country => ({ value: country, label: country }))
                            ]}
                          />
                        </div>

                        {/* City Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={cityFilter}
                            onChange={handleCityFilter}
                            placeholder={t('packagesPage.allCities')}
                            label={t('packagesPage.city')}
                            options={[
                              { value: '', label: t('packagesPage.allCities') },
                              ...availableCities
                                .filter(city => !countryFilter || packages.some(pkg => pkg.cities?.includes(city) && pkg.countries?.includes(countryFilter)))
                                .map(city => ({ value: city, label: city }))
                            ]}
                            disabled={countryFilter && !packages.some(pkg => pkg.countries?.includes(countryFilter))}
                          />
                        </div>

                        {/* Target Audience Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={targetAudienceFilter}
                            onChange={handleTargetAudienceFilter}
                            placeholder={t('packagesPage.allAudiences')}
                            label={t('packagesPage.targetAudience')}
                            options={[
                              { value: '', label: t('packagesPage.allAudiences') },
                              { value: 'Families', label: t('packagesPage.family') },
                              { value: 'Couples', label: t('packagesPage.couples') },
                              { value: 'Solo', label: t('packagesPage.soloTravelers') },
                              { value: 'Groups', label: t('packagesPage.groups') }
                            ]}
                          />
                        </div>

                        {/* Duration Filter */}
                        <div className="mb-3">
                          <SearchableSelect
                            value={durationFilter}
                            onChange={handleDurationFilter}
                            placeholder={t('packagesPage.anyDuration')}
                            label={t('packagesPage.duration')}
                            options={[
                              { value: '', label: t('packagesPage.anyDuration') },
                              { value: '1', label: t('packagesPage.shortDuration') },
                              { value: '2', label: t('packagesPage.mediumDuration') },
                              { value: '3', label: t('packagesPage.longDuration') }
                            ]}
                          />
                        </div>

                        {/* Clear Filters Button */}
                        <CustomButton 
                          variant="rippleRedToDarkRed" 
                          onClick={resetFilters}
                          disabled={!searchTerm && !countryFilter && !cityFilter && !durationFilter && !targetAudienceFilter}
                          className="w-full"
                          icon={FaFilter}
                        >
                          {t('packagesPage.clearFilters')}
                        </CustomButton>

                        {/* Results count */}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
                          {totalPackages > 0 ? (
                            <>{t('packagesPage.showingPage')} {page} {t('packagesPage.of')} {totalPages} ({totalPackages} {t('packagesPage.packagesTotal')})</>
                          ) : (
                            <>{t('packagesPage.noPackagesFound')}</>
                          )}
                        </div>
                      </div>
                      </div>
                    </CustomScrollbar>
                  </div>
                </div>
              </div>

              {/* Mobile: Separate Collapsible Recent Packages Section */}
              <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                isRecentOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                {/* Glowing Effect Wrapper */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-yellow-600 dark:to-orange-600 rounded-2xl opacity-20 blur transition duration-300 pointer-events-none"></div>
                  {/* Single Card Container */}
                  <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow overflow-hidden">
                    <CustomScrollbar maxHeight="calc(100vh - 120px)">
                      <div className="p-3 sm:p-4">
                        {/* Recent Packages Section */}
                        {recentPackages.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FaBox className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                              <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('packagesPage.recentPackages')}</h3>
                            </div>
                            <div className="space-y-3">
                              {recentPackages.map((pkg) => (
                                <div
                                  key={pkg._id}
                                  onClick={() => handlePackageClick(pkg)}
                                  className="flex gap-3 group cursor-pointer"
                                >
                                  {(() => {
                                    // Get primary image or first image (same logic as PackageCard)
                                    const primaryImage = pkg.images?.find(img => img.isPrimary) || pkg.images?.[0];
                                    return primaryImage ? (
                                      <img
                                        src={primaryImage.url}
                                        alt={primaryImage.altText || pkg.name}
                                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 dark:group-hover:ring-yellow-400 transition-all"
                                      />
                                    ) : (
                                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 dark:group-hover:ring-yellow-400 transition-all">
                                        <FaBox className="w-8 h-8 text-white" />
                                      </div>
                                    );
                                  })()}
                                  <div className="flex-1 min-w-0 flex flex-col">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1">
                                      {getTranslatedText(pkg, 'name', i18n.language)}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                      {pkg.cities?.join(', ')}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                      <FaClock className="w-3 h-3" />
                                      <span>{pkg.duration} {pkg.duration === 1 ? t('packagesPage.day') : t('packagesPage.days')}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CustomScrollbar>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-2">
            {/* Packages Grid */}
            {displayedPackages.length > 0 ? (
          <>
            <div className={`grid gap-4 sm:gap-6 ${
              screenType === 'mobile' 
                ? 'grid-cols-1' 
                : screenType === 'tablet'
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}>
              {displayedPackages.map((pkg) => (
                <PackageCard 
                  key={pkg._id} 
                  pkg={pkg}
                  onClick={() => handlePackageClick(pkg)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                    page === 1
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:scale-110 shadow-sm hover:shadow-md'
                  }`}
                  aria-label="Previous page"
                >
                  {isRTL ? <FaAngleRight className="w-4 h-4" /> : <FaAngleLeft className="w-4 h-4" />}
                </button>

                {/* Page Numbers - Sliding Window */}
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let startPage = Math.max(1, page - Math.floor(showPages / 2));
                  let endPage = Math.min(totalPages, startPage + showPages - 1);
                  
                  if (endPage - startPage < showPages - 1) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  // Generate page number buttons (sliding window - no ellipsis)
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                          i === page
                            ? 'bg-blue-500 dark:bg-yellow-600 text-white dark:text-gray-900 border-blue-500 dark:border-yellow-600 scale-110 shadow-lg'
                            : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-yellow-600 dark:hover:text-gray-900 hover:border-blue-500 dark:hover:border-yellow-600 hover:scale-110 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Next Button */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                    page === totalPages
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:scale-110 shadow-sm hover:shadow-md'
                  }`}
                  aria-label="Next page"
                >
                  {isRTL ? <FaAngleLeft className="w-4 h-4" /> : <FaAngleRight className="w-4 h-4" />}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <FaFilter className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('packagesPage.noPackagesFoundTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t('packagesPage.noPackagesFoundMessage')}
            </p>
            {(searchTerm || countryFilter || cityFilter || durationFilter || targetAudienceFilter) && (
              <CustomButton
                onClick={resetFilters}
                variant="blue"
                size="md"
                className="mt-4"
              >
                {t('packagesPage.clearFilters')}
              </CustomButton>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPackagesPage;

