import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUser, FaEye, FaClock, FaArrowLeft, FaTags, FaHome, FaLink, FaExpand } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import RahalatekLoader from '../../components/RahalatekLoader';
import PublicBlogCard from '../../components/Visitors/PublicBlogCard';
import toast from 'react-hot-toast';
import '../../styles/quill.css';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenType, setScreenType] = useState('desktop');
  const [blogsPerSlide, setBlogsPerSlide] = useState(3);
  const carouselRef = useRef(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blogs/slug/${slug}`);

      if (response.data.success) {
        setBlog(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      if (error.response?.status === 404) {
        toast.error('Blog not found', {
          duration: 3000,
          style: {
            background: '#ef4444',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        });
        navigate('/blog');
      }
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  const fetchRelatedBlogs = useCallback(async () => {
    if (!blog) return;
    
    try {
      const response = await axios.get(`/api/blogs/category/${blog.category}?limit=12`);

      if (response.data.success) {
        // Filter out current blog and limit to 12
        const filtered = response.data.data.docs
          .filter(b => b._id !== blog._id)
          .slice(0, 12);
        setRelatedBlogs(filtered);
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  }, [blog]);

  useEffect(() => {
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug, fetchBlog]);

  useEffect(() => {
    if (blog) {
      fetchRelatedBlogs();
    }
  }, [blog, fetchRelatedBlogs]);

  const formatDate = (dateString) => {
    const locale = blog && hasArabicText(blog.title) ? 'ar' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory' // Force Gregorian calendar (AD)
    });
  };

  // Copy link function
  const copyLink = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(shareUrl);
    const message = blog && hasArabicText(blog.title) 
      ? 'تم نسخ الرابط!' 
      : 'Link copied to clipboard!';
    toast.success(message, {
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

  // Lightbox functions
  const openLightbox = () => {
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Keyboard support for lightbox modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLightboxOpen && e.key === 'Escape') {
        closeLightbox();
      }
    };

    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Detect if title contains Arabic text (determines page language)
  const hasArabicText = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  const isRTL = blog && hasArabicText(blog.title);

  // Translations based on language
  const translations = {
    en: {
      home: 'Home',
      blog: 'Blog',
      featured: 'Featured',
      minRead: 'min read',
      views: 'views',
      copyLink: 'Copy Link',
      linkCopied: 'Link copied to clipboard!',
      relatedPosts: 'Related Posts',
      noRelatedPosts: 'No related posts found',
      topicsAndTags: 'Topics & Tags',
      // Call to Action
      ctaTitle: 'Ready to Start Your Journey?',
      ctaDescription: 'Explore our tours and packages to make your travel dreams come true',
      browseTours: 'Browse Tours',
      viewPackages: 'View Packages',
      // Category translations
      categories: {
        'Activities': 'Activities',
        'Beaches': 'Beaches',
        'Hotels': 'Hotels',
        'Restaurants': 'Restaurants',
        'Travel Tips': 'Travel Tips',
        'Destinations': 'Destinations',
        'Culture': 'Culture'
      }
    },
    ar: {
      home: 'الرئيسية',
      blog: 'المدونة',
      featured: 'مميز',
      minRead: 'دقيقة قراءة',
      views: 'مشاهدة',
      copyLink: 'نسخ الرابط',
      linkCopied: 'تم نسخ الرابط!',
      relatedPosts: 'مقالات ذات صلة',
      noRelatedPosts: 'لا توجد مقالات ذات صلة',
      topicsAndTags: 'المواضيع والوسوم',
      // Call to Action
      ctaTitle: 'هل أنت مستعد لبدء رحلتك؟',
      ctaDescription: 'استكشف جولاتنا وباقاتنا لتحقيق أحلامك في السفر',
      browseTours: 'تصفح الجولات',
      viewPackages: 'عرض الباقات',
      // Category translations
      categories: {
        'Activities': 'الأنشطة',
        'Beaches': 'الشواطئ',
        'Hotels': 'الفنادق',
        'Restaurants': 'المطاعم',
        'Travel Tips': 'نصائح السفر',
        'Destinations': 'الوجهات',
        'Culture': 'الثقافة'
      }
    }
  };

  const t = isRTL ? translations.ar : translations.en;
  
  // Helper function to translate category names
  const translateCategory = (category) => {
    return t.categories[category] || category;
  };

  // Screen size detection for carousel
  const updateScreenSize = () => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setScreenType('mobile');
      setBlogsPerSlide(1);
    } else if (width < 1024) {
      setScreenType('tablet');
      setBlogsPerSlide(2);
    } else {
      setScreenType('desktop');
      setBlogsPerSlide(3);
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const totalSlides = Math.ceil(relatedBlogs.length / blogsPerSlide);

  // Reset slide when screen size changes
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog not found
          </h2>
          <Link to="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.title} | Rahalatek Travel Blog</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt || blog.title} />
        {blog.metaKeywords && blog.metaKeywords.length > 0 && (
          <meta name="keywords" content={blog.metaKeywords.join(', ')} />
        )}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.excerpt || blog.title} />
        {blog.mainImage && <meta property="og:image" content={blog.mainImage.url} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.metaDescription || blog.excerpt || blog.title} />
        {blog.mainImage && <meta name="twitter:image" content={blog.mainImage.url} />}
      </Helmet>

      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-2 sm:pt-4 md:pt-6">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1">
              <FaHome className="w-3 h-3" />
              <span>{t.home}</span>
            </Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-blue-600 dark:hover:text-yellow-400 transition-colors">
              {t.blog}
            </Link>
            <span>/</span>
            <Link to={`/blog?category=${blog.category}`} className="hover:text-blue-600 dark:hover:text-yellow-400 transition-colors">
              {translateCategory(blog.category)}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[150px] sm:max-w-xs">
              {blog.title}
            </span>
          </nav>

          {/* Blog Title and Badges */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="bg-blue-600 dark:bg-yellow-500 text-white dark:text-gray-900 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                {translateCategory(blog.category)}
              </span>
              {blog.isFeatured && (
                <span className="bg-yellow-400 text-yellow-900 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  {t.featured}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
              {blog.title}
            </h1>
            
            {/* Blog Meta Information */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{blog.readingTime} {t.minRead}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{blog.views} {t.views}</span>
              </div>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md text-sm"
              title={t.copyLink}
            >
              <FaLink className="w-3.5 h-3.5" />
              <span>{t.copyLink}</span>
            </button>
          </div>

          {/* Hero Image with Gradient Overlay */}
          <button
            onClick={openLightbox}
            className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-xl shadow-2xl group w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent z-10 transition-opacity duration-300 group-hover:from-black/30"></div>
            <img
              src={blog.mainImage.url.includes('cloudinary.com') 
                ? blog.mainImage.url.replace('/upload/', '/upload/q_auto:best,f_auto/')
                : blog.mainImage.url
              }
              alt={blog.mainImage.altText || blog.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              draggable={false}
              loading="eager"
              fetchPriority="high"
            />
            {/* Expand icon */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <FaExpand className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Blog Content */}
        <div id="content" className="scroll-mt-24"></div>
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Excerpt */}
          {blog.excerpt && (
            <div className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 font-medium border-l-4 border-blue-600 dark:border-yellow-500 pl-4 sm:pl-6 py-2 italic bg-blue-50/50 dark:bg-yellow-900/10 rounded-r-lg">
              {blog.excerpt}
            </div>
          )}

          {/* Main Content */}
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="prose prose-base sm:prose-lg dark:prose-invert max-w-none
              prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-800 dark:prose-p:text-gray-200
              prose-p:leading-relaxed
              prose-a:text-blue-600 dark:prose-a:text-yellow-400
              prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-strong:font-bold
              prose-em:text-gray-800 dark:prose-em:text-gray-200
              prose-code:text-blue-600 dark:prose-code:text-yellow-400
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800
              prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
              prose-pre:text-gray-900 dark:prose-pre:text-gray-100
              prose-img:rounded-lg prose-img:shadow-lg
              prose-img:mx-auto prose-img:my-6
              prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-8
              prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-6
              prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
              prose-li:text-gray-800 dark:prose-li:text-gray-200
              prose-blockquote:border-l-4 prose-blockquote:border-blue-600 dark:prose-blockquote:border-yellow-500
              prose-blockquote:pl-4 prose-blockquote:italic
              prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
              prose-hr:border-gray-300 dark:prose-hr:border-gray-700"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Tags Section */}
        {blog.tags && blog.tags.length > 0 && (
          <>
            <div id="tags" className="scroll-mt-24"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaTags className="text-blue-600 dark:text-yellow-400" />
                {t.topicsAndTags}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {blog.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/blog?tag=${tag}`}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-yellow-900/30 text-blue-700 dark:text-yellow-300 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-200 dark:hover:bg-yellow-900/50 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Related Blogs Carousel */}
        {relatedBlogs.length > 0 && (
          <>
            <div id="related" className="scroll-mt-24"></div>
            <div dir="ltr" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-6 sm:mt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 dir={isRTL ? 'rtl' : 'ltr'} className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t.relatedPosts}
              </h2>

              {/* Carousel Container with Side Arrows */}
              <div className="relative flex items-center mb-6">
                {/* Left Arrow */}
                {totalSlides > 1 && (
                  <button
                    onClick={prevSlide}
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 mr-2 sm:mr-3 md:mr-4"
                    aria-label="Previous related articles"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Blog Cards Container */}
                <div className="flex-1 overflow-hidden" ref={carouselRef}>
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {/* Generate slides */}
                    {Array.from({ length: totalSlides }, (_, slideIndex) => (
                      <div 
                        key={slideIndex} 
                        className={`w-full flex-shrink-0 ${
                          screenType === 'mobile' 
                            ? 'grid grid-cols-1 gap-4' 
                            : screenType === 'tablet'
                            ? 'grid grid-cols-2 gap-4'
                            : 'grid grid-cols-3 gap-6'
                        }`}
                      >
                        {/* Blog cards for this slide */}
                        {relatedBlogs
                          .slice(slideIndex * blogsPerSlide, (slideIndex + 1) * blogsPerSlide)
                          .map((relatedBlog, blogIndex) => (
                            <PublicBlogCard
                              key={`${slideIndex}-${blogIndex}`}
                              blog={relatedBlog}
                            />
                          ))
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Arrow */}
                {totalSlides > 1 && (
                  <button
                    onClick={nextSlide}
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ease-in-out bg-blue-600 hover:bg-blue-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-10 ml-2 sm:ml-3 md:ml-4"
                    aria-label="Next related articles"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dots Indicator */}
              {totalSlides > 1 && (
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: totalSlides }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-yellow-400 dark:bg-blue-500 scale-125'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-500 dark:hover:bg-blue-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-6 sm:mt-8">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 dark:from-yellow-500 dark:to-orange-500 rounded-xl p-6 sm:p-8 text-center text-white">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              {t.ctaTitle}
            </h3>
            <p className="text-base sm:text-lg mb-4 sm:mb-6">
              {t.ctaDescription}
            </p>
            <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
              <Link
                to="/guest/tours"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 dark:text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                {t.browseTours}
              </Link>
              <Link
                to="/packages"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-teal-600 dark:text-yellow-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                {t.viewPackages}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal - Rendered as Portal to document.body */}
      {isLightboxOpen && blog && blog.mainImage && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            width: '100vw',
            height: '100vh'
          }}
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-110 z-10"
            aria-label="Close image"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main Image - Full Resolution */}
          <img
            src={blog.mainImage.url.includes('cloudinary.com') 
              ? blog.mainImage.url.replace('/upload/', '/upload/q_100,f_auto/')
              : blog.mainImage.url
            }
            alt={blog.mainImage.altText || blog.title}
            className="max-w-full max-h-full object-contain p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              imageRendering: 'high-quality'
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
}

