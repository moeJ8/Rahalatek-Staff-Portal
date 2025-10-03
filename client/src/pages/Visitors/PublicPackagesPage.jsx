import React, { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import RahalatekLoader from '../../components/RahalatekLoader';
import Search from '../../components/Search';
import Select from '../../components/Select';
import CustomButton from '../../components/CustomButton';
import PackageCard from '../../components/Visitors/PackageCard';
import axios from 'axios';

const PublicPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenType, setScreenType] = useState('desktop');
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [targetAudienceFilter, setTargetAudienceFilter] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const navigate = useNavigate();

  // Check screen size for responsive behavior
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
    } else if (width < 1024) {
      setScreenType('tablet');
    } else {
      setScreenType('desktop');
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

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

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/packages/featured?limit=100');
        if (response.data?.success) {
          const packagesData = response.data.data || [];
          
          // Sort packages by updatedAt timestamp (newest first)
          const sortedPackages = packagesData.sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });
          
          setPackages(sortedPackages);
          setFilteredPackages(sortedPackages);
          
          // Extract unique countries and cities for filters
          const countries = [...new Set(sortedPackages.flatMap(pkg => pkg.countries || []).filter(Boolean))].sort();
          const cities = [...new Set(sortedPackages.flatMap(pkg => pkg.cities || []))].sort();
          setAvailableCountries(countries);
          setAvailableCities(cities);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setError('Failed to load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Filter packages based on search term and filters
  useEffect(() => {
    let filtered = packages;
    
    // Apply country filter
    if (countryFilter) {
      filtered = filtered.filter(pkg => pkg.countries?.includes(countryFilter));
    }
    
    // Apply city filter
    if (cityFilter) {
      filtered = filtered.filter(pkg => pkg.cities?.includes(cityFilter));
    }
    
    // Apply duration filter
    if (durationFilter) {
      const duration = parseInt(durationFilter);
      if (duration === 1) {
        filtered = filtered.filter(pkg => pkg.duration <= 3);
      } else if (duration === 2) {
        filtered = filtered.filter(pkg => pkg.duration > 3 && pkg.duration <= 7);
      } else if (duration === 3) {
        filtered = filtered.filter(pkg => pkg.duration > 7);
      }
    }
    
    // Apply target audience filter
    if (targetAudienceFilter) {
      filtered = filtered.filter(pkg => pkg.targetAudience?.includes(targetAudienceFilter));
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        pkg =>
          pkg.name.toLowerCase().includes(searchTermLower) ||
          (pkg.cities && pkg.cities.some(city => city.toLowerCase().includes(searchTermLower))) ||
          (pkg.countries && pkg.countries.some(country => country.toLowerCase().includes(searchTermLower))) ||
          (pkg.description && pkg.description.toLowerCase().includes(searchTermLower))
      );
    }
    
    setFilteredPackages(filtered);
  }, [searchTerm, countryFilter, cityFilter, durationFilter, targetAudienceFilter, packages]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCountryFilter = (value) => {
    setCountryFilter(value);
    setCityFilter(''); // Reset city filter when country changes
  };

  const handleCityFilter = (value) => {
    setCityFilter(value);
  };

  const handleDurationFilter = (value) => {
    setDurationFilter(value);
  };

  const handleTargetAudienceFilter = (value) => {
    setTargetAudienceFilter(value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCountryFilter('');
    setCityFilter('');
    setDurationFilter('');
    setTargetAudienceFilter('');
  };

  const handlePackageClick = async (pkg) => {
    try {
      // Increment view count
      await axios.post(`/api/packages/public/${pkg.slug}/view`);
    } catch (error) {
      console.error('Error incrementing package views:', error);
    }
    
    // Navigate to package page
    navigate(`/packages/${pkg.slug}`);
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Our Travel Programs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Explore our exciting collection of travel packages and complete experiences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 mx-auto px-2 sm:px-0 sm:max-w-4xl">
          {/* Search Bar */}
          <div className="mb-4">
            <Search
              placeholder="Search by name, city, country, or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
              showClearButton={true}
            />
          </div>
          
          {/* Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            <div className="w-full">
              <Select 
                value={countryFilter}
                onChange={handleCountryFilter}
                placeholder="Filter by Country"
                options={[
                  { value: '', label: 'Filter by Country' },
                  ...availableCountries.map(country => ({ value: country, label: country }))
                ]}
                className="w-full"
              />
            </div>

            <div className="w-full">
              <Select 
                value={cityFilter}
                onChange={handleCityFilter}
                placeholder="Filter by City"
                options={[
                  { value: '', label: 'Filter by City' },
                  ...availableCities
                    .filter(city => !countryFilter || packages.some(pkg => pkg.cities?.includes(city) && pkg.countries?.includes(countryFilter)))
                    .map(city => ({ value: city, label: city }))
                ]}
                className="w-full"
                disabled={countryFilter && !packages.some(pkg => pkg.countries?.includes(countryFilter))}
              />
            </div>
            
            <div className="w-full">
              <Select 
                value={targetAudienceFilter}
                onChange={handleTargetAudienceFilter}
                placeholder="Filter by Audience"
                options={[
                  { value: '', label: 'Filter by Audience' },
                  { value: 'Family', label: 'Family' },
                  { value: 'Couples', label: 'Couples' },
                  { value: 'Solo Travelers', label: 'Solo Travelers' },
                  { value: 'Groups', label: 'Groups' },
                  { value: 'Business', label: 'Business' },
                  { value: 'Luxury', label: 'Luxury' },
                  { value: 'Budget', label: 'Budget' }
                ]}
                className="w-full"
              />
            </div>
            
            <div className="w-full">
              <Select 
                value={durationFilter}
                onChange={handleDurationFilter}
                placeholder="Filter by Duration"
                options={[
                  { value: '', label: 'Filter by Duration' },
                  { value: '1', label: 'Short (up to 3 days)' },
                  { value: '2', label: 'Medium (4-7 days)' },
                  { value: '3', label: 'Long (8+ days)' }
                ]}
                className="w-full"
              />
            </div>
            
            <div className="w-full">
              <CustomButton 
                variant="red" 
                onClick={resetFilters}
                disabled={!searchTerm && !countryFilter && !cityFilter && !durationFilter && !targetAudienceFilter}
                className="w-full h-[44px] my-0.5"
                icon={FaFilter}
              >
                Clean Filters
              </CustomButton>
            </div>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {(searchTerm || countryFilter || cityFilter || durationFilter || targetAudienceFilter) ? (
              <>Showing {filteredPackages.length} of {packages.length} packages</>
            ) : (
              <>Showing all {packages.length} packages</>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        {filteredPackages.length > 0 ? (
          <div className={`grid gap-4 sm:gap-6 ${
            screenType === 'mobile' 
              ? 'grid-cols-1' 
              : screenType === 'tablet'
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}>
            {filteredPackages.map((pkg) => (
              <PackageCard 
                key={pkg._id} 
                pkg={pkg}
                onClick={() => handlePackageClick(pkg)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Packages Available</h3>
            <p className="text-gray-600 dark:text-gray-400">Please check back later for our latest package offerings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPackagesPage;

