import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaHotel, FaRoute, FaBox, FaBlog, FaGlobe, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import CustomScrollbar from './CustomScrollbar';

const PublicSearchbar = () => {
  const { t, i18n } = useTranslation();
  const [hotels, setHotels] = useState([]);
  const [tours, setTours] = useState([]);
  const [packages, setPackages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !showMobileModal) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileModal]);

  // Handle escape key for mobile modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showMobileModal) {
        setShowMobileModal(false);
        setSearchQuery('');
      }
    };

    if (showMobileModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showMobileModal]);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exact substring search (more specific, less fuzzy)
  const matchesSearch = (str, query) => {
    if (!str) return false;
    return str.toLowerCase().includes(query.toLowerCase());
  };

  // Filter all content based on search query (debounced for performance)
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const query = debouncedQuery.toLowerCase().trim();
    const results = [];

    // Search Hotels - in name, city, country, and translations
    hotels.forEach(hotel => {
      const matches = 
        matchesSearch(hotel.name, query) ||
        matchesSearch(hotel.city, query) ||
        matchesSearch(hotel.country, query) ||
        (hotel.translations?.name?.ar && matchesSearch(hotel.translations.name.ar, query)) ||
        (hotel.translations?.name?.fr && matchesSearch(hotel.translations.name.fr, query)) ||
        (hotel.translations?.description?.ar && matchesSearch(hotel.translations.description.ar, query)) ||
        (hotel.translations?.description?.fr && matchesSearch(hotel.translations.description.fr, query));
      
      if (matches) {
        results.push({
          ...hotel,
          type: 'hotel',
          matchedField: hotel.name.toLowerCase().includes(query) ? 'name' :
                       hotel.city.toLowerCase().includes(query) ? 'city' :
                       hotel.country.toLowerCase().includes(query) ? 'country' : 'description'
        });
      }
    });

    // Search Tours - in name, city, country, and translations
    tours.forEach(tour => {
      const matches = 
        matchesSearch(tour.name, query) ||
        matchesSearch(tour.city, query) ||
        matchesSearch(tour.country, query) ||
        (tour.translations?.name?.ar && matchesSearch(tour.translations.name.ar, query)) ||
        (tour.translations?.name?.fr && matchesSearch(tour.translations.name.fr, query)) ||
        (tour.translations?.description?.ar && matchesSearch(tour.translations.description.ar, query)) ||
        (tour.translations?.description?.fr && matchesSearch(tour.translations.description.fr, query));
      
      if (matches) {
        results.push({
          ...tour,
          type: 'tour',
          matchedField: tour.name.toLowerCase().includes(query) ? 'name' :
                       tour.city.toLowerCase().includes(query) ? 'city' :
                       tour.country.toLowerCase().includes(query) ? 'country' : 'description'
        });
      }
    });

    // Search Packages - in name, countries, cities, and translations
    packages.forEach(pkg => {
      const matches = 
        matchesSearch(pkg.name, query) ||
        pkg.countries?.some(country => matchesSearch(country, query)) ||
        pkg.cities?.some(city => matchesSearch(city, query)) ||
        (pkg.translations?.name?.ar && matchesSearch(pkg.translations.name.ar, query)) ||
        (pkg.translations?.name?.fr && matchesSearch(pkg.translations.name.fr, query)) ||
        (pkg.translations?.description?.ar && matchesSearch(pkg.translations.description.ar, query)) ||
        (pkg.translations?.description?.fr && matchesSearch(pkg.translations.description.fr, query));
      
      if (matches) {
        results.push({
          ...pkg,
          type: 'package',
          matchedField: pkg.name.toLowerCase().includes(query) ? 'name' :
                       pkg.countries?.some(c => c.toLowerCase().includes(query)) ? 'country' :
                       pkg.cities?.some(c => c.toLowerCase().includes(query)) ? 'city' : 'description'
        });
      }
    });

    // Search Blogs - in title, category, tags, and country (not excerpt for specificity)
    blogs.forEach(blog => {
      const matches = 
        matchesSearch(blog.title, query) ||
        matchesSearch(blog.category, query) ||
        blog.tags?.some(tag => matchesSearch(tag, query)) ||
        matchesSearch(blog.country, query);
      
      if (matches) {
        results.push({
          ...blog,
          type: 'blog',
          matchedField: blog.title.toLowerCase().includes(query) ? 'title' :
                       blog.category?.toLowerCase().includes(query) ? 'category' :
                       blog.tags?.some(t => t.toLowerCase().includes(query)) ? 'tag' : 'content'
        });
      }
    });

    // Search Cities
    cities.forEach(city => {
      if (matchesSearch(city.name, query) || matchesSearch(city.country, query)) {
        results.push({
          ...city,
          type: 'city',
          matchedField: city.name.toLowerCase().includes(query) ? 'name' : 'country'
        });
      }
    });

    // Search Countries
    countries.forEach(country => {
      if (matchesSearch(country.name, query)) {
        results.push({
          ...country,
          type: 'country',
          matchedField: 'name'
        });
      }
    });

    // Sort results by relevance
    results.sort((a, b) => {
      const queryLower = query.toLowerCase();
      
      // Get the name/title for comparison
      const aName = (a.type === 'blog' ? a.title : a.name)?.toLowerCase() || '';
      const bName = (b.type === 'blog' ? b.title : b.name)?.toLowerCase() || '';
      
      // Check for exact full matches (highest priority)
      const aExactMatch = aName === queryLower;
      const bExactMatch = bName === queryLower;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Priority for cities and countries (destinations come before content)
      const destinationTypes = ['city', 'country'];
      const aIsDestination = destinationTypes.includes(a.type);
      const bIsDestination = destinationTypes.includes(b.type);
      
      if (aIsDestination && !bIsDestination) return -1;
      if (!aIsDestination && bIsDestination) return 1;
      
      // Then by matched field priority (name/title > city/country > others)
      const fieldPriority = { name: 0, title: 0, city: 1, country: 2 };
      const aPriority = fieldPriority[a.matchedField] ?? 3;
      const bPriority = fieldPriority[b.matchedField] ?? 3;
      
      return aPriority - bPriority;
    });

    // Limit to top 20 results for performance
    setFilteredResults(results.slice(0, 20));
  }, [debouncedQuery, hotels, tours, packages, blogs, cities, countries]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [hotelsRes, toursRes, packagesRes, blogsRes] = await Promise.all([
        axios.get('/api/hotels?limit=50').catch(() => ({ data: [] })),
        axios.get('/api/tours?limit=50').catch(() => ({ data: [] })),
        axios.get('/api/packages/featured?limit=30').catch(() => ({ data: { data: [] } })),
        axios.get('/api/blogs/published?limit=30').catch(() => ({ data: { data: { docs: [] } } }))
      ]);

      // Hotels and tours might be paginated, check for data.hotels/data.tours arrays
      const hotelsData = Array.isArray(hotelsRes.data) 
        ? hotelsRes.data 
        : (hotelsRes.data?.data?.hotels || hotelsRes.data?.hotels || []);
      // Tours might be paginated, check for data.tours array
      const toursData = Array.isArray(toursRes.data) 
        ? toursRes.data 
        : (toursRes.data?.data?.tours || toursRes.data?.tours || []);
      const packagesData = packagesRes.data.data || [];
      const blogsData = blogsRes.data.data?.docs || [];

      setHotels(hotelsData);
      setTours(toursData);
      setPackages(packagesData);
      setBlogs(blogsData);

      // Static destinations list (same as Destinations component)
      const staticDestinations = [
        { name: 'Turkey', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759680467/turkey_uabvzb.jpg' },
        { name: 'Malaysia', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681612/malaysia_y1j9qm.jpg' },
        { name: 'Thailand', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681613/thailand_mevzsd.jpg' },
        { name: 'Indonesia', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681593/indonesia_z0it15.jpg' },
        { name: 'Saudi Arabia', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681608/saudi-arabia_n7v7gs.jpg' },
        { name: 'Morocco', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681610/morocco_hll4kh.jpg' },
        { name: 'Egypt', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681770/egypt_ehyxvu.jpg' },
        { name: 'Azerbaijan', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681625/azerbaijan_d4mecb.jpg' },
        { name: 'Georgia', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681595/georgia_id0au5.jpg' },
        { name: 'Albania', image: 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681631/albania_ftb9qt.jpg' }
      ];

      // Country images mapping for cities fallback
      const countryImages = {
        'Turkey': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759680467/turkey_uabvzb.jpg',
        'Malaysia': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681612/malaysia_y1j9qm.jpg',
        'Thailand': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681613/thailand_mevzsd.jpg',
        'Indonesia': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681593/indonesia_z0it15.jpg',
        'Saudi Arabia': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681608/saudi-arabia_n7v7gs.jpg',
        'Morocco': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681610/morocco_hll4kh.jpg',
        'Egypt': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681770/egypt_ehyxvu.jpg',
        'Azerbaijan': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681625/azerbaijan_d4mecb.jpg',
        'Georgia': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681595/georgia_id0au5.jpg',
        'Albania': 'https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681631/albania_ftb9qt.jpg'
      };

      // City images mapping (for major cities)
      const cityImages = {
        // Turkey
        'Istanbul': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671115/istanbul_qjf5sz.jpg',
        'Antalya': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671118/antalya_oj1lza.jpg',
        'Cappadocia': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671112/cappadocia_znntj1.jpg',
        'Trabzon': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/trabzon_l7xlva.jpg',
        'Bodrum': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671110/bodrum_tmgojf.jpg',
        'Fethiye': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/fethiye_loarta.jpg',
        'Bursa': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/bursa_ujwxsb.jpg',
        // Other major cities
        'Kuala Lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop&q=80',
        'Bangkok': 'https://images.unsplash.com/photo-1563492065-4c9a4ed7c42d?w=400&h=300&fit=crop&q=80',
        'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop&q=80'
      };

      // Set all static destinations as countries (always available for search)
      const countriesData = staticDestinations.map(dest => ({
        _id: `country-${dest.name}`,
        name: dest.name,
        image: dest.image
      }));

      // Extract unique cities with images and country info
      const cityMap = new Map();
      
      [...hotelsData, ...toursData].forEach(item => {
        if (item.city && item.country) {
          const cityKey = `${item.city}-${item.country}`;
          if (!cityMap.has(cityKey)) {
            cityMap.set(cityKey, {
              _id: `city-${cityKey}`,
              name: item.city,
              country: item.country,
              image: cityImages[item.city] || countryImages[item.country]
            });
          }
        }
      });
      
      packagesData.forEach(pkg => {
        if (pkg.cities && pkg.countries && pkg.countries.length > 0) {
          pkg.cities.forEach(city => {
            const country = pkg.countries[0];
            const cityKey = `${city}-${country}`;
            if (!cityMap.has(cityKey)) {
              cityMap.set(cityKey, {
                _id: `city-${cityKey}`,
                name: city,
                country: country,
                image: cityImages[city] || countryImages[country]
              });
            }
          });
        }
      });

      setCountries(countriesData);

      // Fetch cities from all countries (from API)
      const allCitiesPromises = staticDestinations.map(dest =>
        axios.get(`/api/destinations/${encodeURIComponent(dest.name)}/cities`)
          .then(res => {
            const citiesData = res.data.cities || [];
            return citiesData.map(city => ({
              _id: `city-${city.name}-${dest.name}`,
              name: city.name,
              country: dest.name,
              image: city.image,
              tourCount: city.tourCount,
              hotelCount: city.hotelCount
            }));
          })
          .catch(() => [])
      );

      const allCitiesArrays = await Promise.all(allCitiesPromises);
      const allCities = allCitiesArrays.flat();
      
      setCities(allCities);
    } catch (error) {
      console.error('Error fetching search data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleResultClick = (result) => {
    const lang = i18n.language;
    const langPrefix = (lang === 'ar' || lang === 'fr') ? `/${lang}` : '';
    
    if (result.type === 'hotel') {
      navigate(`${langPrefix}/hotels/${result.slug}`);
    } else if (result.type === 'tour') {
      navigate(`${langPrefix}/tours/${result.slug}`);
    } else if (result.type === 'package') {
      navigate(`${langPrefix}/packages/${result.slug}`);
    } else if (result.type === 'blog') {
      navigate(`${langPrefix}/blog/${result.slug}`);
    } else if (result.type === 'city') {
      navigate(`${langPrefix}/country/${encodeURIComponent(result.country)}/city/${encodeURIComponent(result.name)}`);
    } else if (result.type === 'country') {
      navigate(`${langPrefix}/country/${encodeURIComponent(result.name)}`);
    }
    setShowDropdown(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setSearchQuery('');
      inputRef.current?.blur();
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'hotel': return <FaHotel className="w-4 h-4 text-blue-500" />;
      case 'tour': return <FaRoute className="w-4 h-4 text-emerald-500" />;
      case 'package': return <FaBox className="w-4 h-4 text-purple-500" />;
      case 'blog': return <FaBlog className="w-4 h-4 text-orange-500" />;
      case 'country': return <FaGlobe className="w-4 h-4 text-teal-500" />;
      default: return <FaSearch className="w-4 h-4 text-gray-400" />;
    }
  };

  const getResultImage = (result) => {
    let imageUrl = null;
    let fallbackIcon = null;

    switch (result.type) {
      case 'hotel':
        imageUrl = result.images?.[0]?.url || result.images?.[0];
        fallbackIcon = <FaHotel className="w-6 h-6 text-blue-500" />;
        break;
      case 'tour':
        imageUrl = result.images?.[0]?.url || result.images?.[0];
        fallbackIcon = <FaRoute className="w-6 h-6 text-emerald-500" />;
        break;
      case 'package':
        imageUrl = result.images?.[0]?.url || result.images?.[0];
        fallbackIcon = <FaBox className="w-6 h-6 text-purple-500" />;
        break;
      case 'blog':
        imageUrl = result.mainImage?.url || result.mainImage;
        fallbackIcon = <FaBlog className="w-6 h-6 text-orange-500" />;
        break;
      case 'city':
        imageUrl = result.image;
        fallbackIcon = <FaMapMarkerAlt className="w-6 h-6 text-pink-500" />;
        break;
      case 'country':
        imageUrl = result.image;
        fallbackIcon = <FaGlobe className="w-6 h-6 text-teal-500" />;
        break;
      default:
        fallbackIcon = <FaSearch className="w-6 h-6 text-gray-400" />;
    }

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={result.name || result.title || 'Result'}
          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
        {fallbackIcon}
      </div>
    );
  };

  const getTypeBadge = (type) => {
    const badges = {
      hotel: { label: t('search.hotel'), class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      tour: { label: t('search.tour'), class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
      package: { label: t('search.package'), class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      blog: { label: t('search.blogPost'), class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      city: { label: t('search.city'), class: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
      country: { label: t('search.country'), class: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' }
    };
    
    const badge = badges[type] || { label: type, class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    
    return (
      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  const getResultName = (result) => {
    const lang = i18n.language;
    
    if (result.type === 'blog') {
      return result.title;
    }
    
    // For tours, hotels, and packages, check for translations
    if (result.translations?.name?.[lang]) {
      return result.translations.name[lang];
    }
    
    return result.name;
  };

  const getResultSubtitle = (result) => {
    if (result.type === 'hotel') {
      return `${result.city}, ${result.country} • ${result.stars} ${t('search.stars')}`;
    } else if (result.type === 'tour') {
      return `${result.city}, ${result.country} • ${result.tourType}`;
    } else if (result.type === 'package') {
      return `${result.duration} ${t('search.days')} • ${result.countries?.join(', ')}`;
    } else if (result.type === 'blog') {
      return result.category || t('search.blogPost');
    } else if (result.type === 'city') {
      return `${result.country} • ${result.tourCount || 0} ${t('search.toursCount')} • ${result.hotelCount || 0} ${t('search.hotelsCount')}`;
    } else if (result.type === 'country') {
      return `${t('search.exploreDestinations')} ${result.name}`;
    }
    return '';
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Desktop: Full Search Input */}
        <div className="relative hidden lg:block group">
          <input
            ref={inputRef}
            type="text"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="w-96 px-5 py-2.5 pl-11 pr-10 text-sm text-gray-900 dark:text-white 
              bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
              border border-gray-200/60 dark:border-slate-600/60 
              rounded-full shadow-sm
              hover:border-blue-400/60 dark:hover:border-yellow-400/60
              focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-yellow-500/40 
              focus:border-blue-500 dark:focus:border-yellow-500
              focus:bg-white dark:focus:bg-slate-800
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              transition-all duration-300 ease-in-out
              hover:shadow-md focus:shadow-lg"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 
            text-gray-400 dark:text-gray-500
            group-hover:text-blue-500 dark:group-hover:text-yellow-400
            transition-colors duration-300" />
          
          {/* Clear button when typing */}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
                p-1 rounded-full
                text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-slate-700
                transition-all duration-200"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile/Tablet: Search Icon Only */}
        <button
          onClick={() => {
            setShowMobileModal(true);
            setTimeout(() => {
              if (mobileInputRef.current) {
                mobileInputRef.current.focus();
              }
            }, 100);
          }}
          className="lg:hidden flex items-center justify-center p-2.5 
            text-gray-600 dark:text-gray-300 
            hover:text-blue-600 dark:hover:text-yellow-400 
            transition-all duration-200 
            rounded-full 
            hover:bg-blue-50 dark:hover:bg-yellow-900/20
            hover:shadow-md active:scale-95"
          title={t('search.title')}
        >
          <FaSearch className="w-5 h-5" />
        </button>

        {/* Desktop Dropdown Menu */}
        <div className={`hidden lg:flex absolute left-0 top-full mt-3 w-96 max-h-[520px] 
            bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
            border border-gray-200/50 dark:border-slate-700/50 
            rounded-2xl shadow-2xl 
            z-50 overflow-hidden flex-col
            transition-all duration-200 ease-in-out origin-top ${
              showDropdown 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 
              bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-yellow-900/10 dark:to-orange-900/10
              border-b border-gray-200/50 dark:border-slate-700/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-yellow-500/10">
                  <FaSearch className="w-3.5 h-3.5 text-blue-600 dark:text-yellow-400" />
                </div>
                {t('search.searchResults')}
              </h3>
              
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold 
                  text-blue-600 dark:text-yellow-400 
                  bg-blue-50 dark:bg-yellow-900/20 
                  border border-blue-200/60 dark:border-yellow-800/60 
                  rounded-full">
                  {filteredResults.length} {t('search.found')}
                </span>
              )}
            </div>

            {/* Search Results */}
            <div className="flex-1 min-h-0">
              <CustomScrollbar maxHeight="440px" className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center px-4 py-12">
                    <div className="w-6 h-6 border-2 border-blue-600 dark:border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">{t('search.loading')}</span>
                  </div>
                ) : searchQuery !== debouncedQuery ? (
                  <div className="flex items-center justify-center px-4 py-12">
                    <div className="w-5 h-5 border-2 border-blue-500 dark:border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{t('search.searching')}</span>
                  </div>
                ) : !searchQuery ? (
                  <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center">
                      <FaSearch className="w-8 h-8 text-blue-500 dark:text-yellow-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{t('search.startTyping')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t('search.discoverFull')}
                    </p>
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <FaSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{t('search.noResults')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {t('search.tryDifferent')}
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result._id || result.slug || index}`}
                        onClick={() => handleResultClick(result)}
                        className="px-3 py-3 mb-1.5 rounded-xl
                          hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 
                          dark:hover:from-yellow-900/10 dark:hover:to-orange-900/10
                          transition-all duration-200 cursor-pointer group
                          border border-transparent hover:border-blue-200/30 dark:hover:border-yellow-700/30"
                      >
                        <div className="flex items-center gap-3">
                          {/* Image with enhanced styling */}
                          <div className="flex-shrink-0 group-hover:scale-105 group-hover:rotate-1 transition-all duration-200">
                            {getResultImage(result)}
                            <div className="w-12 h-12 hidden items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
                              {getResultIcon(result.type)}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {getTypeBadge(result.type)}
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white 
                                  group-hover:text-blue-600 dark:group-hover:text-yellow-400 
                                  transition-colors truncate">
                                  {getResultName(result)}
                                </p>
                                
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                  {getResultSubtitle(result)}
                                </p>
                              </div>
                              
                              {/* Arrow indicator */}
                              <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-yellow-400 
                                group-hover:translate-x-1 transition-all duration-200">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CustomScrollbar>
            </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {showMobileModal && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 w-screen h-screen overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200/60 dark:border-slate-700/60 
            bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 dark:bg-yellow-500/10">
                <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{t('search.search')}</h2>
            </div>
            <button
              onClick={() => {
                setShowMobileModal(false);
                setSearchQuery('');
              }}
              className="flex items-center justify-center p-1.5 sm:p-2 rounded-full
                text-gray-600 dark:text-gray-300 
                hover:text-gray-900 dark:hover:text-white 
                hover:bg-gray-200/50 dark:hover:bg-slate-700/50
                transition-all duration-200 active:scale-95"
            >
              <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-slate-900/50 w-full">
            <div className="relative w-full">
              <input
                ref={mobileInputRef}
                type="text"
                placeholder={t('search.placeholderMobile')}
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 pl-11 pr-11 text-sm sm:text-base text-gray-900 dark:text-white 
                  bg-white dark:bg-slate-800 
                  border-2 border-gray-200 dark:border-slate-600 
                  rounded-2xl shadow-sm
                  focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-yellow-500/40 
                  focus:border-blue-500 dark:focus:border-yellow-500
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  transition-all duration-200"
              />
              <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 
                text-gray-400 dark:text-gray-500" />
              
              {/* Clear button */}
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    mobileInputRef.current?.focus();
                  }}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 
                    p-1 sm:p-1.5 rounded-full
                    text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-slate-700
                    transition-all duration-200"
                >
                  <FaTimes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            
            {searchQuery && (
              <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">
                <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold 
                  text-blue-600 dark:text-yellow-400 
                  bg-blue-50 dark:bg-yellow-900/20 
                  border border-blue-200/60 dark:border-yellow-800/60 
                  rounded-full">
                  {filteredResults.length} {filteredResults.length !== 1 ? t('search.results') : t('search.result')}
                </span>
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-hidden bg-white dark:bg-slate-950 w-full">
            <CustomScrollbar className="h-full w-full">
              {loading ? (
                <div className="flex items-center justify-center px-4 py-16">
                  <div className="w-6 h-6 border-2 border-blue-600 dark:border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">{t('search.loading')}</span>
                </div>
              ) : searchQuery !== debouncedQuery ? (
                <div className="flex items-center justify-center px-4 py-16">
                  <div className="w-5 h-5 border-2 border-blue-500 dark:border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{t('search.searching')}</span>
                </div>
              ) : !searchQuery ? (
                <div className="px-6 py-20 text-center">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center">
                    <FaSearch className="w-10 h-10 text-blue-500 dark:text-yellow-400" />
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">{t('search.startTyping')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t('search.discoverMobile')}
                  </p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <FaSearch className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">{t('search.noResults')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t('search.tryDifferentMobile')}
                  </p>
                </div>
              ) : (
                <div className="p-2 sm:p-3 space-y-2 w-full">
                  {filteredResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result._id || result.slug || index}`}
                      onClick={() => {
                        handleResultClick(result);
                        setShowMobileModal(false);
                        setSearchQuery('');
                      }}
                      className="px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl
                        bg-white dark:bg-slate-900
                        border border-gray-200/60 dark:border-slate-700/60
                        active:bg-gradient-to-r active:from-blue-50 active:to-cyan-50 
                        dark:active:from-yellow-900/10 dark:active:to-orange-900/10
                        active:border-blue-300 dark:active:border-yellow-700
                        transition-all duration-150 cursor-pointer
                        shadow-sm active:shadow-md w-full"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
                        <div className="flex-shrink-0">
                          {getResultImage(result)}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 hidden items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
                            {getResultIcon(result.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-start justify-between gap-1 sm:gap-2 w-full overflow-hidden">
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex items-center gap-2 mb-1">
                                {getTypeBadge(result.type)}
                              </div>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-1 truncate">
                                {getResultName(result)}
                              </p>
                              
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-1 truncate">
                                {getResultSubtitle(result)}
                              </p>
                            </div>
                            
                            {/* Arrow indicator */}
                            <div className="flex-shrink-0 text-gray-400 mt-1">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CustomScrollbar>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicSearchbar;

