import React from 'react';
import { FaCalendarAlt, FaClock, FaEye, FaCrown, FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const PublicBlogCard = ({ blog }) => {
  const { i18n } = useTranslation();
  // Detect if text contains Arabic characters
  const hasArabicText = (text) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicRegex.test(text);
  };

  const isRTL = blog && blog.title && hasArabicText(blog.title);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBlogClick = async (e) => {
    // Only increment view count on regular clicks (not Ctrl/Cmd+Click or middle-click)
    if (!e.ctrlKey && !e.metaKey && e.button !== 1) {
      try {
        await axios.post(`/api/blogs/slug/${blog.slug}/view`);
      } catch (error) {
        console.error('Error incrementing blog views:', error);
      }
    }
  };

  // Navigate to blog page with language prefix for SEO (only for ar/fr)
  const getBlogUrl = () => {
    const lang = i18n.language;
    if (lang === 'ar' || lang === 'fr') {
      return `/${lang}/blog/${blog.slug}`;
    }
    return `/blog/${blog.slug}`;
  };

  const imageUrl = blog.mainImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Blog+Image';

  return (
    <Link 
      to={getBlogUrl()}
      onClick={handleBlogClick}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group flex flex-col"
      dir="ltr"
    >
      {/* Blog Image */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={blog.mainImage?.altText || blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        {/* Featured Badge */}
        {blog.isFeatured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500/90 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
            <FaCrown className="w-3 h-3" />
            <span className="text-xs font-semibold">Featured</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-md">
          <span className="text-xs font-semibold">{blog.category}</span>
        </div>

        {/* Blog Title - Inside image at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 dir={isRTL ? 'rtl' : 'ltr'} className="text-lg font-bold text-white mb-0 line-clamp-2 group-hover:text-yellow-400 dark:group-hover:text-blue-400 transition-colors duration-300">
            {blog.title}
          </h3>
        </div>
      </div>

      {/* Blog Details */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1">
        {/* Metadata Row */}
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="w-3 h-3 text-blue-500 dark:text-yellow-400" />
            <span>{formatDate(blog.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <FaClock className="w-3 h-3 text-blue-500 dark:text-yellow-400" />
              <span>{blog.readingTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <FaEye className="w-3 h-3 text-blue-500 dark:text-yellow-400" />
              <span>{blog.views || 0}</span>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {blog.excerpt && (
          <p dir={isRTL ? 'rtl' : 'ltr'} className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2 flex-1">
            {blog.excerpt}
          </p>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-auto">
            <div className="flex items-center gap-1.5 flex-wrap">
              <FaTag className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              {blog.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {blog.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{blog.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PublicBlogCard;

