import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCrown, FaCalendarAlt, FaUser, FaStar } from 'react-icons/fa';
import CustomButton from './CustomButton';

const BlogCard = ({ 
  blog, 
  user,
  onEdit, 
  onDelete, 
  onToggleStatus,
  onToggleFeatured
}) => {
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const imageUrl = blog.mainImage?.url || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Blog+Image';

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group flex flex-col h-full w-full">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Featured Badge */}
        {blog.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <FaCrown className="text-sm" />
            Featured
          </div>
        )}
        {/* Status Badge */}
        <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(blog.status)}`}>
          {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors mb-3 line-clamp-2">
          {blog.title}
        </h3>

        {/* Category */}
        <div className="mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2.5 py-1 rounded-full font-medium">
            {blog.category}
          </span>
        </div>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
            {truncateText(blog.excerpt, 120)}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400 mt-auto">
          <div className="flex items-center gap-1">
            <FaEye className="text-gray-400 w-3 h-3" />
            <span>{blog.views || 0} views</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="text-gray-400 w-3 h-3" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Always at bottom */}
      <div className="px-5 pb-5 mt-auto">
        <div className="space-y-1">
          <div className="flex gap-1">
            <CustomButton 
              as={Link}
              to={`/blog/${blog.slug}`}
              variant="blue"
              size="sm"
              className="flex-1 text-xs"
              icon={FaEye}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </CustomButton>
          </div>
          
          <div className="flex gap-1 pt-1 border-t border-gray-200 dark:border-gray-700">
            <CustomButton 
              onClick={() => onEdit?.(blog)}
              variant="purple"
              size="sm"
              className="flex-1 text-xs"
              icon={FaEdit}
            >
              Edit
            </CustomButton>
            <CustomButton
              onClick={() => onToggleStatus?.(blog)}
              variant={blog.status === 'published' ? "red" : "green"}
              size="sm"
              icon={blog.status === 'published' ? FaToggleOff : FaToggleOn}
              className="flex-1 text-xs"
            >
              {blog.status === 'published' ? 'Unpublish' : 'Publish'}
            </CustomButton>
            <CustomButton
              onClick={() => onDelete?.(blog)}
              variant="red"
              size="sm"
              icon={FaTrash}
              className="flex-1 text-xs"
            >
              Delete
            </CustomButton>
          </div>

          {/* Featured Toggle - Only for Admin and Content Manager */}
          {user && (user.isAdmin || user.isContentManager) && onToggleFeatured && (
            <div className="flex gap-1 pt-1 border-t border-gray-200 dark:border-gray-700">
              <CustomButton
                onClick={() => onToggleFeatured?.(blog)}
                variant={blog.isFeatured ? "orange" : "yellow"}
                size="sm"
                icon={FaStar}
                className="flex-1 text-xs"
              >
                {blog.isFeatured ? 'Remove Featured' : 'Mark Featured'}
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
