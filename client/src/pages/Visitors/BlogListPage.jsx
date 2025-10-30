import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaFilter, FaSearch, FaTags, FaCalendarAlt, FaUser, FaBook, FaEye, FaClock, FaCrown, FaChevronLeft, FaChevronRight, FaAngleLeft, FaAngleRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import RahalatekLoader from '../../components/RahalatekLoader';
import CustomButton from '../../components/CustomButton';
import CustomCheckbox from '../../components/CustomCheckbox';
import CustomScrollbar from '../../components/CustomScrollbar';
import Search from '../../components/Search';
import SearchableSelect from '../../components/SearchableSelect';
import PublicBlogCard from '../../components/Visitors/PublicBlogCard';

export default function BlogListPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  
  // Persist sortByPopular in localStorage to survive remounts from URL changes
  const [sortByPopular, setSortByPopular] = useState(() => {
    const saved = localStorage.getItem('blogSortByPopular');
    return saved !== null ? saved === 'true' : true; // Default to true if not set
  });
  
  // Update localStorage when sortByPopular changes
  useEffect(() => {
    localStorage.setItem('blogSortByPopular', sortByPopular.toString());
  }, [sortByPopular]);
  const [screenType, setScreenType] = useState('desktop');
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [currentFeaturedSlide, setCurrentFeaturedSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const carouselRef = useRef(null);

  // Screen size detection and items per page
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

  // Debounce search term (300ms delay for faster response)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when screen type, filters, or sorting changes
  useEffect(() => {
    setPage(1);
  }, [screenType, debouncedSearchTerm, selectedCategory, selectedTag, sortByPopular]);

  // Screen size detection
  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  const fetchBlogs = useCallback(async () => {
    try {
      // Only show loading on initial page load
      if (page === 1 && !selectedCategory && !selectedTag && !debouncedSearchTerm && blogs.length === 0) {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: getItemsPerPage(screenType).toString()
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);
      if (debouncedSearchTerm.trim()) params.append('search', debouncedSearchTerm.trim());
      if (sortByPopular) params.append('sortBy', 'popular');

      const response = await axios.get(`/api/blogs/published?${params.toString()}`);

      if (response.data.success) {
        const blogsData = response.data.data.docs || [];
        setBlogs(blogsData);
        setTotalPages(response.data.data.totalPages);
        setTotalBlogs(response.data.data.totalDocs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, screenType, selectedCategory, selectedTag, debouncedSearchTerm, sortByPopular, getItemsPerPage, blogs.length]);

  // Fetch blogs when dependencies change
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const fetchFeaturedBlogs = useCallback(async () => {
    try {
      const response = await axios.get('/api/blogs/featured?limit=9');
      if (response.data.success) {
        setFeaturedBlogs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    }
  }, []);

  const fetchRecentBlogs = useCallback(async () => {
    try {
      const response = await axios.get('/api/blogs/recent?limit=4');
      if (response.data.success) {
        setRecentBlogs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recent blogs:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/blogs/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await axios.get('/api/blogs/tags');
      if (response.data.success) {
        setTags(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  // Fetch filter options and other data on mount
  useEffect(() => {
    fetchFeaturedBlogs();
    fetchRecentBlogs();
    fetchCategories();
    fetchTags();
  }, [fetchFeaturedBlogs, fetchRecentBlogs, fetchCategories, fetchTags]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  const handleCategoryFilter = useCallback((e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setSelectedTag('');
    setPage(1);
    setSearchParams(value ? { category: value } : {});
  }, [setSearchParams]);

  const handleTagFilter = useCallback((e) => {
    const value = e.target.value;
    setSelectedTag(value);
    setSelectedCategory('');
    setPage(1);
    setSearchParams(value ? { tag: value } : {});
  }, [setSearchParams]);

  const resetFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedTag('');
    setSearchTerm('');
    setSortByPopular(true);
    setPage(1);
    setSearchParams({});
  }, [setSearchParams]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Featured carousel navigation
  const nextFeaturedSlide = useCallback(() => {
    if (isTransitioning || featuredBlogs.length === 0) return;
    setIsTransitioning(true);
    setCurrentFeaturedSlide((prev) => (prev === featuredBlogs.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, featuredBlogs.length]);

  const prevFeaturedSlide = useCallback(() => {
    if (isTransitioning || featuredBlogs.length === 0) return;
    setIsTransitioning(true);
    setCurrentFeaturedSlide((prev) => (prev === 0 ? featuredBlogs.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, featuredBlogs.length]);

  const goToFeaturedSlide = (index) => {
    if (isTransitioning || index === currentFeaturedSlide) return;
    setIsTransitioning(true);
    setCurrentFeaturedSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Drag functionality for featured carousel
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const diff = e.clientX - dragStart;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    if (dragOffset > 100) {
      prevFeaturedSlide();
    } else if (dragOffset < -100) {
      nextFeaturedSlide();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    document.body.style.userSelect = '';
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    document.body.style.userSelect = 'none';
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    if (dragOffset > 75) {
      prevFeaturedSlide();
    } else if (dragOffset < -75) {
      nextFeaturedSlide();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    document.body.style.userSelect = '';
  };

  // Auto-play for featured carousel
  useEffect(() => {
    if (featuredBlogs.length > 1 && !isDragging) {
      const interval = setInterval(() => {
        nextFeaturedSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredBlogs.length, isDragging, nextFeaturedSlide]);

  // Add touch event listeners with passive: false
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const touchMoveHandler = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const diff = e.touches[0].clientX - dragStart;
      setDragOffset(diff);
    };

    carousel.addEventListener('touchmove', touchMoveHandler, { passive: false });

    return () => {
      carousel.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [isDragging, dragStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.userSelect = '';
    };
  }, []);

  // No more client-side pagination - everything is server-side now
  const displayedBlogs = blogs;

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="xl" />
      </div>
    );
  }

  // Generate dynamic meta content based on filters
  const getMetaTitle = () => {
    if (selectedCategory) {
      return `${selectedCategory} Travel Blog Posts | Rahalatek`;
    }
    if (selectedTag) {
      return `${selectedTag} Travel Articles | Rahalatek Blog`;
    }
    if (searchTerm) {
      return `Search Results for "${searchTerm}" | Rahalatek Blog`;
    }
    return 'Rahalatek | Blog Posts';
  };

  const getMetaDescription = () => {
    if (selectedCategory) {
      return `Discover the best ${selectedCategory} travel experiences, tips, and guides. Expert insights from Rahalatek's travel specialists to help you plan your perfect ${selectedCategory} adventure.`;
    }
    if (selectedTag) {
      return `Explore ${selectedTag} travel content, guides, and tips. Find everything you need to know about ${selectedTag} from Rahalatek's travel experts.`;
    }
    if (searchTerm) {
      return `Search results for "${searchTerm}" in our travel blog. Find the latest travel tips, destination guides, and expert advice from Rahalatek.`;
    }
    return 'Explore our comprehensive travel blog featuring expert tips, destination guides, and travel insights. Discover amazing places, culture, food, and adventure travel advice from Rahalatek\'s travel specialists.';
  };

  const getMetaKeywords = () => {
    const baseKeywords = ['travel blog', 'travel tips', 'destination guides', 'travel advice', 'Rahalatek', 'tourism blog'];
    
    if (selectedCategory) {
      return [...baseKeywords, selectedCategory.toLowerCase(), `${selectedCategory} travel`, `${selectedCategory} guide`];
    }
    if (selectedTag) {
      return [...baseKeywords, selectedTag.toLowerCase(), `${selectedTag} travel`];
    }
    if (searchTerm) {
      return [...baseKeywords, searchTerm.toLowerCase(), 'travel search'];
    }
    
    return [...baseKeywords, 'travel destinations', 'travel experiences', 'cultural travel', 'adventure travel', 'luxury travel', 'budget travel'];
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{getMetaTitle()}</title>
        <meta name="description" content={getMetaDescription()} />
        <meta name="keywords" content={getMetaKeywords().join(', ')} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={getMetaTitle()} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />
        <meta property="og:image" content={`${window.location.origin}/last-logo-3.png`} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getMetaTitle()} />
        <meta name="twitter:description" content={getMetaDescription()} />
        <meta name="twitter:image" content={`${window.location.origin}/last-logo-3.png`} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-8xl mx-auto px-2 sm:px-3 lg:px-2 xl:px-3 py-2 sm:py-3 md:py-4">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('blogPage.title')}
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
                {t('blogPage.filters')}
              </span>
              {(searchTerm || selectedCategory || selectedTag) && (
                <span className="px-2 py-0.5 text-xs bg-blue-500 dark:bg-yellow-500 text-white dark:text-gray-900 rounded-full">
                  {t('blogPage.active')}
                </span>
              )}
            </div>
            {isFiltersOpen ? (
              <FaChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <FaChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Recent Posts & Tags Toggle */}
          <button
            onClick={() => setIsRecentOpen(!isRecentOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <FaBook className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {t('blogPage.recentPostsAndTags')}
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
          {/* Sidebar - Filters, Recent Posts, Tags */}
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
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('blogPage.searchAndFilter')}</h3>
            </div>

          {/* Search Bar */}
          <div className="mb-3">
            <Search
                      placeholder={t('blogPage.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
              showClearButton={true}
            />
          </div>
          
                  {/* Category Filter */}
                  <div className="mb-3">
              <SearchableSelect 
                value={selectedCategory}
                onChange={handleCategoryFilter}
                      placeholder={t('blogPage.allCategories')}
                      label={t('blogPage.category')}
                options={[
                  { value: '', label: t('blogPage.allCategories') },
                  ...categories.map(category => ({ value: category, label: category }))
                ]}
              />
            </div>

                  {/* Tag Filter */}
                  <div className="mb-3">
              <SearchableSelect 
                value={selectedTag}
                onChange={handleTagFilter}
                      placeholder={t('blogPage.allTags')}
                      label={t('blogPage.tag')}
                options={[
                  { value: '', label: t('blogPage.allTags') },
                  ...tags.map(tag => ({ value: tag, label: `#${tag}` }))
                ]}
                disabled={tags.length === 0}
              />
            </div>
            
                  {/* Sort by Popular Checkbox */}
                  <div className="mb-3">
                    <CustomCheckbox
                      id="sort-by-popular"
                      label={t('blogPage.mostPopularPosts')}
                      checked={sortByPopular}
                      onChange={setSortByPopular}
                    />
                  </div>
            
                  {/* Reset Button */}
              <CustomButton 
                variant="rippleRedToDarkRed" 
                onClick={resetFilters}
                disabled={!searchTerm && !selectedCategory && !selectedTag}
                    className="w-full"
                icon={FaFilter}
              >
                    {t('blogPage.clearFilters')}
              </CustomButton>
          
          {/* Results count */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
            {t('blogPage.showingPage')} {page} {t('blogPage.of')} {totalPages} ({totalBlogs} {t('blogPage.blogsTotal')})
          </div>
        </div>

                {/* Divider */}
                {recentBlogs.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                )}

                {/* Recent Posts Section */}
                {recentBlogs.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FaBook className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('blogPage.recentPosts')}</h3>
                    </div>
                    <div className="space-y-3">
                      {recentBlogs.map((blog) => {
                        // Navigate to blog page with language prefix for SEO (only for ar/fr)
                        const lang = i18n.language;
                        const blogUrl = (lang === 'ar' || lang === 'fr') 
                          ? `/${lang}/blog/${blog.slug}` 
                          : `/blog/${blog.slug}`;
                        return (
                        <div
                          key={blog._id}
                          onClick={() => navigate(blogUrl)}
                          className="flex gap-3 group cursor-pointer"
                        >
                          {blog.mainImage && (
                            <img
                              src={blog.mainImage.url}
                              alt={blog.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 dark:group-hover:ring-yellow-400 transition-all"
                            />
                          )}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1">
                              {blog.title}
                            </h4>
                            {blog.category && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {blog.category}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                              <FaCalendarAlt className="w-3 h-3" />
                              <span>{formatDate(blog.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Divider */}
                {tags.length > 0 && recentBlogs.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                )}

                {/* Tags Cloud Section */}
                {tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FaTags className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('blogPage.popularTags')}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 6).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagFilter({ target: { value: tag } })}
                          className={`group relative px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-300 hover:scale-105 ${
                            selectedTag === tag
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-yellow-600 dark:to-orange-500 text-white shadow-md shadow-blue-500/30 dark:shadow-yellow-500/30 ring-1 ring-blue-400 dark:ring-yellow-400'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 text-gray-700 dark:text-gray-200 hover:from-blue-50 hover:to-blue-100 dark:hover:from-slate-600 dark:hover:to-slate-500 shadow-sm hover:shadow-md border border-gray-300 dark:border-slate-600'
                          }`}
                        >
                          <span className="relative z-10 flex items-center gap-0.5">
                            <FaTags className={`w-2 h-2 ${selectedTag === tag ? 'opacity-80' : 'opacity-60 group-hover:opacity-100'} transition-opacity`} />
                            {tag}
                          </span>
                        </button>
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
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('blogPage.searchAndFilter')}</h3>
            </div>

          {/* Search Bar */}
          <div className="mb-3">
            <Search
                      placeholder={t('blogPage.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
              showClearButton={true}
            />
          </div>
          
                  {/* Category Filter */}
                  <div className="mb-3">
              <SearchableSelect 
                value={selectedCategory}
                onChange={handleCategoryFilter}
                      placeholder={t('blogPage.allCategories')}
                      label={t('blogPage.category')}
                options={[
                  { value: '', label: t('blogPage.allCategories') },
                  ...categories.map(category => ({ value: category, label: category }))
                ]}
              />
            </div>

                  {/* Tag Filter */}
                  <div className="mb-3">
              <SearchableSelect 
                value={selectedTag}
                onChange={handleTagFilter}
                      placeholder={t('blogPage.allTags')}
                      label={t('blogPage.tag')}
                options={[
                  { value: '', label: t('blogPage.allTags') },
                  ...tags.map(tag => ({ value: tag, label: `#${tag}` }))
                ]}
                disabled={tags.length === 0}
              />
            </div>
            
                  {/* Sort by Popular Checkbox */}
                  <div className="mb-3">
                    <CustomCheckbox
                      id="sort-by-popular-mobile"
                      label={t('blogPage.mostPopularPosts')}
                      checked={sortByPopular}
                      onChange={setSortByPopular}
                    />
                  </div>
            
                  {/* Reset Button */}
              <CustomButton 
                variant="rippleRedToDarkRed" 
                onClick={resetFilters}
                disabled={!searchTerm && !selectedCategory && !selectedTag}
                    className="w-full"
                icon={FaFilter}
              >
                    {t('blogPage.clearFilters')}
              </CustomButton>
          
          {/* Results count */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
            {t('blogPage.showingPage')} {page} {t('blogPage.of')} {totalPages} ({totalBlogs} {t('blogPage.blogsTotal')})
          </div>
        </div>
                      </div>
                    </CustomScrollbar>
                  </div>
                </div>
              </div>

              {/* Mobile: Separate Collapsible Recent Posts & Tags Section */}
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

                        {/* Recent Posts Section */}
                        {recentBlogs.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FaBook className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                              <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('blogPage.recentPosts')}</h3>
                            </div>
                            <div className="space-y-3">
                              {recentBlogs.map((blog) => {
                                // Navigate to blog page with language prefix for SEO (only for ar/fr)
                                const lang = i18n.language;
                                const blogUrl = (lang === 'ar' || lang === 'fr') 
                                  ? `/${lang}/blog/${blog.slug}` 
                                  : `/blog/${blog.slug}`;
                                return (
                                <div
                                  key={blog._id}
                                  onClick={() => navigate(blogUrl)}
                                  className="flex gap-3 group cursor-pointer"
                                >
                                  {blog.mainImage && (
                                    <img
                                      src={blog.mainImage.url}
                                      alt={blog.title}
                                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 dark:group-hover:ring-yellow-400 transition-all"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0 flex flex-col">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1">
                                      {blog.title}
                                    </h4>
                                    {blog.category && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        {blog.category}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                      <FaCalendarAlt className="w-3 h-3" />
                                      <span>{formatDate(blog.publishedAt)}</span>
                                    </div>
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Divider */}
                        {tags.length > 0 && recentBlogs.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                        )}

                        {/* Tags Cloud Section */}
                        {tags.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <FaTags className="text-blue-600 dark:text-yellow-400 w-4 h-4" />
                              <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('blogPage.popularTags')}</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {tags.slice(0, 6).map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => handleTagFilter({ target: { value: tag } })}
                                  className={`group relative px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-300 hover:scale-105 ${
                                    selectedTag === tag
                                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-yellow-600 dark:to-orange-500 text-white shadow-md shadow-blue-500/30 dark:shadow-yellow-500/30 ring-1 ring-blue-400 dark:ring-yellow-400'
                                      : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 text-gray-700 dark:text-gray-200 hover:from-blue-50 hover:to-blue-100 dark:hover:from-slate-600 dark:hover:to-slate-500 shadow-sm hover:shadow-md border border-gray-300 dark:border-slate-600'
                                  }`}
                                >
                                  <span className="relative z-10 flex items-center gap-0.5">
                                    <FaTags className={`w-2 h-2 ${selectedTag === tag ? 'opacity-80' : 'opacity-60 group-hover:opacity-100'} transition-opacity`} />
                                    {tag}
                                  </span>
                                </button>
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
            {/* Featured Posts Carousel */}
            {featuredBlogs.length > 0 && (
              <section className="mb-8">
                <div className="relative h-[200px] sm:h-[220px] md:h-[250px] lg:h-[280px] rounded-xl overflow-hidden shadow-lg group" dir="ltr">
                  {/* Heading Inside Carousel */}
                  <div className={`absolute top-3 sm:top-4 md:top-6 z-30 ${isRTL ? 'right-3 sm:right-4 md:right-6' : 'left-3 sm:left-4 md:left-6'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center gap-1.5 sm:gap-2 drop-shadow-lg">
                      <FaCrown className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
                      {t('blogPage.featuredPosts')}
                    </h2>
                  </div>
                  
                  {/* Slides Container */}
                  <div 
                    ref={carouselRef}
                    className={`flex w-full h-full ${isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab transition-transform duration-500 ease-in-out'}`}
                    style={{ transform: `translateX(${-currentFeaturedSlide * 100 + (dragOffset * 0.02)}%)` }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {featuredBlogs.map((blog) => {
                      const imageUrl = blog.mainImage?.url || 'https://via.placeholder.com/1200x600/f3f4f6/9ca3af?text=Featured+Blog';
                      const formatDate = (dateString) => {
                        return new Date(dateString).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                      };
                      
                      // Strip HTML tags from content
                      const stripHtml = (html) => {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html;
                        return tmp.textContent || tmp.innerText || '';
                      };
                      
                      const excerpt = blog.content ? stripHtml(blog.content).substring(0, 150) : '';
                      
                      return (
                        <div key={blog._id} className="w-full h-full flex-shrink-0 relative">
                          <img
                            src={imageUrl}
                            alt={blog.title}
                            className="h-full w-full object-cover brightness-75 pointer-events-none select-none"
                            draggable={false}
                          />
                          <div className="absolute inset-0 flex flex-col justify-end px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-3 sm:py-4 md:py-6 lg:py-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent" dir={isRTL ? 'rtl' : 'ltr'}>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 text-gray-200 text-[10px] sm:text-xs mb-1.5 sm:mb-2">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <FaCalendarAlt className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {formatDate(blog.publishedAt || blog.createdAt)}
                              </div>
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <FaEye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {blog.views || 0}
                              </div>
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <FaClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {blog.readingTime || 5} {t('blogPage.min')}
                              </div>
                            </div>
                            
                            {blog.category && (
                              <div className="bg-blue-600 dark:bg-yellow-600 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:py-1 rounded w-fit mb-1.5 sm:mb-2">
                                {blog.category}
                              </div>
                            )}
                            
                            <h3 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2 line-clamp-2">
                              {blog.title}
                            </h3>
                            
                            {excerpt && (
                              <p className="text-gray-200 mb-2 sm:mb-3 line-clamp-1 text-[10px] sm:text-xs md:text-sm">
                                {excerpt}...
                              </p>
                            )}
                            
                            <Link 
                              to={(() => {
                                // Navigate to blog page with language prefix for SEO (only for ar/fr)
                                const lang = i18n.language;
                                return (lang === 'ar' || lang === 'fr') 
                                  ? `/${lang}/blog/${blog.slug}` 
                                  : `/blog/${blog.slug}`;
                              })()}
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await axios.post(`/api/blogs/slug/${blog.slug}/view`);
                                } catch (error) {
                                  console.error('Error incrementing blog views:', error);
                                }
                              }}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-600 dark:to-yellow-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-yellow-700 dark:hover:to-yellow-800 transition duration-300 w-fit text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              {t('blogPage.readArticle')}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Arrows - Hidden on mobile, visible on tablet+ */}
                  {featuredBlogs.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevFeaturedSlide();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        disabled={isTransitioning || isDragging}
                        className="hidden sm:flex absolute left-2 sm:left-3 md:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 z-20"
                        aria-label="Previous slide"
                      >
                        <FaChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextFeaturedSlide();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        disabled={isTransitioning || isDragging}
                        className="hidden sm:flex absolute right-2 sm:right-3 md:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 z-20"
                        aria-label="Next slide"
                      >
                        <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                      </button>
                    </>
                  )}

                  {/* Dot Navigation */}
                  {featuredBlogs.length > 1 && (
                    <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-10">
                      {featuredBlogs.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            goToFeaturedSlide(index);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          disabled={isTransitioning || isDragging}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-300 disabled:opacity-50 ${
                            index === currentFeaturedSlide 
                              ? 'bg-white scale-110' 
                              : 'bg-white/50 hover:bg-white/80 hover:scale-105'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Blog Grid */}
            {displayedBlogs.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-12 shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <FaSearch className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('blogPage.noBlogsFound')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('blogPage.noBlogsMessage')}
                </p>
                {(searchTerm || selectedCategory || selectedTag) && (
                  <CustomButton
                    onClick={resetFilters}
                    variant="blue"
                    size="md"
                    className="mt-4"
                  >
                    {t('blogPage.clearFilters')}
                  </CustomButton>
                )}
              </div>
            ) : (
              <>
                <div className={`grid gap-4 sm:gap-6 ${
                  screenType === 'mobile' 
                    ? 'grid-cols-1' 
                    : screenType === 'tablet'
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
                }`}>
                  {displayedBlogs.map((blog) => (
                    <PublicBlogCard key={blog._id} blog={blog} />
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
                      const showPages = 5; // Number of page buttons to show
                      let startPage = Math.max(1, page - Math.floor(showPages / 2));
                      let endPage = Math.min(totalPages, startPage + showPages - 1);
                      
                      // Adjust start page if we're near the end
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
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

