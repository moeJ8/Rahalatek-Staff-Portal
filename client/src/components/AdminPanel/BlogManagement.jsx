import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../styles/quill.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, Alert } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave, FaTimes, FaFilter, FaSyncAlt, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import Search from '../Search';
import CustomButton from '../CustomButton';
import CustomCheckbox from '../CustomCheckbox';
import SearchableSelect from '../SearchableSelect';
import Select from '../Select';
import CustomModal from '../CustomModal';
import ImageUploader from '../ImageUploader';
import RahalatekLoader from '../RahalatekLoader';
import BlogCard from '../BlogCard';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import TextInput from '../TextInput';
import { validateSlug, formatSlug, formatSlugWhileTyping } from '../../utils/slugValidation';

export default function BlogManagement({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Video modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
  // Slug validation state
  const [slugError, setSlugError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    excerpt: '',
    content: '',
    mainImage: null,
    metaDescription: '',
    metaKeywords: [],
    status: 'draft',
    isFeatured: false,
    tags: []
  });
  
  // Input states
  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  // Quill editor ref
  const quillRef = useRef(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    featured: '',
    createdBy: ''
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Sorting state
  const [sortByViews, setSortByViews] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [screenType, setScreenType] = useState('desktop');
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

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

  // Available categories (matching the backend enum)
  const categories = [
    // Turkey
    'Istanbul', 'Antalya', 'Cappadocia', 'Trabzon', 'Bodrum', 'Fethiye', 'Bursa',
    // Malaysia
    'Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Johor Bahru',
    'Kota Kinabalu', 'Kuching', 'Cameron Highlands', 'Genting Highlands',
    // Thailand
    'Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi', 'Koh Samui',
    'Hua Hin', 'Ayutthaya', 'Chiang Rai', 'Kanchanaburi',
    // Indonesia
    'Jakarta', 'Bali', 'Yogyakarta', 'Bandung', 'Surabaya', 'Medan',
    'Lombok', 'Makassar', 'Semarang',
    // Saudi Arabia
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar',
    'Taif', 'Abha', 'Tabuk', 'Jubail',
    // Morocco
    'Casablanca', 'Marrakech', 'Rabat', 'Fes', 'Tangier', 'Agadir',
    'Meknes', 'Essaouira', 'Chefchaouen', 'Ouarzazate',
    // Egypt
    'Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Sharm El Sheikh',
    'Hurghada', 'Port Said', 'Suez', 'Dahab',
    // Azerbaijan
    'Baku', 'Ganja', 'Sumqayit', 'Lankaran', 'Gabala', 'Sheki',
    'Quba', 'Mingachevir', 'Nakhchivan',
    // Georgia
    'Tbilisi', 'Batumi', 'Kutaisi', 'Mestia', 'Gudauri', 'Mtskheta',
    'Sighnaghi', 'Borjomi', 'Gori',
    // Albania
    'Tirana', 'Durres', 'Saranda', 'Vlore', 'Shkoder', 'Berat',
    'Gjirokaster', 'Ksamil', 'Theth'
  ];

  // Convert video URL to embed format
  const convertToEmbedUrl = (url) => {
    if (!url) return null;

    // Remove whitespace
    url = url.trim();

    // Check for YouTube Shorts (not supported)
    if (url.includes('/shorts/')) {
      toast.error('YouTube Shorts are not supported. Please use regular YouTube videos.', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
      });
      return null;
    }

    // YouTube conversions
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Format: https://youtu.be/VIDEO_ID
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Format: https://www.youtube.com/embed/VIDEO_ID (already correct)
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // Vimeo conversion
    // Format: https://vimeo.com/VIDEO_ID
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
      if (videoId && !url.includes('/player.vimeo.com/')) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // If already an embed URL or other format, return as is
    return url;
  };

  // Custom video handler for Quill
  const videoHandler = useCallback(() => {
    setVideoUrl('');
    setShowVideoModal(true);
  }, []);

  // Handle video insertion
  const handleVideoInsert = () => {
    if (!videoUrl.trim()) {
      toast.error('Please enter a video URL', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
      });
      return;
    }

    const embedUrl = convertToEmbedUrl(videoUrl);
    
    if (embedUrl && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'video', embedUrl);
      quill.setSelection(range.index + 1);
      
      setShowVideoModal(false);
      setVideoUrl('');
      
      toast.success('Video embedded successfully!', {
        duration: 2000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
      });
    }
  };

  // Rich text editor configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'direction': 'rtl' }], // RTL support
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        video: videoHandler
      }
    }
  }), [videoHandler]);

  const formats = [
    'header',
    'direction', // RTL support
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent',
    'color', 'background',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  // Debounce search term (300ms delay for faster response)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Reset to page 1 when screen type, filters, or sorting changes
  useEffect(() => {
    setPage(1);
  }, [screenType, debouncedSearchTerm, filters.status, filters.category, filters.featured, filters.createdBy, sortByViews]);

  // Screen size detection
  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  useEffect(() => {
    if (!modalOpen) return;
    
    const addTooltips = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (!toolbar) return false;
      
      toolbar.querySelectorAll('.ql-direction[value="rtl"]').forEach(el => el.setAttribute('title', 'Right to Left'));
      toolbar.querySelectorAll('button.ql-bold').forEach(el => el.setAttribute('title', 'Bold'));
      toolbar.querySelectorAll('button.ql-italic').forEach(el => el.setAttribute('title', 'Italic'));
      toolbar.querySelectorAll('button.ql-underline').forEach(el => el.setAttribute('title', 'Underline'));
      toolbar.querySelectorAll('button.ql-strike').forEach(el => el.setAttribute('title', 'Strikethrough'));
      toolbar.querySelectorAll('button.ql-list[value="ordered"]').forEach(el => el.setAttribute('title', 'Numbered List'));
      toolbar.querySelectorAll('button.ql-list[value="bullet"]').forEach(el => el.setAttribute('title', 'Bullet List'));
      toolbar.querySelectorAll('button.ql-script[value="sub"]').forEach(el => el.setAttribute('title', 'Subscript'));
      toolbar.querySelectorAll('button.ql-script[value="super"]').forEach(el => el.setAttribute('title', 'Superscript'));
      toolbar.querySelectorAll('button.ql-indent[value="-1"]').forEach(el => el.setAttribute('title', 'Decrease Indent'));
      toolbar.querySelectorAll('button.ql-indent[value="+1"]').forEach(el => el.setAttribute('title', 'Increase Indent'));
      toolbar.querySelectorAll('.ql-header .ql-picker-label').forEach(el => el.setAttribute('title', 'Heading'));
      toolbar.querySelectorAll('.ql-color .ql-picker-label').forEach(el => el.setAttribute('title', 'Text Color'));
      toolbar.querySelectorAll('.ql-background .ql-picker-label').forEach(el => el.setAttribute('title', 'Background'));
      toolbar.querySelectorAll('.ql-align .ql-picker-label').forEach(el => el.setAttribute('title', 'Alignment'));
      toolbar.querySelectorAll('button.ql-blockquote').forEach(el => el.setAttribute('title', 'Quote'));
      toolbar.querySelectorAll('button.ql-code-block').forEach(el => el.setAttribute('title', 'Code'));
      toolbar.querySelectorAll('button.ql-link').forEach(el => el.setAttribute('title', 'Link'));
      toolbar.querySelectorAll('button.ql-image').forEach(el => el.setAttribute('title', 'Image'));
      toolbar.querySelectorAll('button.ql-video').forEach(el => el.setAttribute('title', 'Video'));
      toolbar.querySelectorAll('button.ql-clean').forEach(el => el.setAttribute('title', 'Clear Format'));
      
      return true;
    };
    
    let attempts = 0;
    const interval = setInterval(() => {
      if (addTooltips() || attempts++ > 20) {
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [modalOpen]);

  const fetchBlogs = useCallback(async () => {
    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: getItemsPerPage(screenType).toString()
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.createdBy) params.append('author', filters.createdBy);
      if (filters.featured) params.append('featured', filters.featured);
      if (sortByViews) params.append('sortBy', 'popular');
      if (debouncedSearchTerm.trim()) params.append('search', debouncedSearchTerm.trim());
      
      const response = await axios.get(`/api/blogs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        // Server-side paginated response
        setBlogs(response.data.data.blogs);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalBlogs(response.data.data.pagination.totalBlogs);
      }
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page, screenType, filters.status, filters.category, filters.createdBy, filters.featured, sortByViews, debouncedSearchTerm, getItemsPerPage]);

  // Fetch blogs when dependencies change
  useEffect(() => {
    if (page > 0) { // Only fetch if page is set
      fetchBlogs();
    }
  }, [fetchBlogs, page]);

  // No more client-side filtering - everything is server-side now
  const displayedBlogs = blogs;

  // Category options for filter
  const getCategoryOptions = () => {
    const uniqueCategories = [...new Set(blogs.map(blog => blog.category).filter(Boolean))];
    return uniqueCategories.sort().map(cat => ({ value: cat, label: cat }));
  };

  // Creator options for filter
  const getCreatorOptions = () => {
    const uniqueCreators = blogs
      .filter(blog => blog.author && blog.author.username)
      .map(blog => ({
        id: blog.author._id || blog.author.id,
        username: blog.author.username
      }))
      .filter((creator, index, self) => 
        index === self.findIndex(c => c.id === creator.id)
      );
    
    return uniqueCreators
      .sort((a, b) => {
        const usernameA = a.username || '';
        const usernameB = b.username || '';
        return usernameA.localeCompare(usernameB);
      })
      .map(creator => ({ 
        value: creator.id, 
        label: creator.username || 'Unknown' 
      }));
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditMode(true);
      setSelectedBlog(blog);
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        category: blog.category || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        mainImage: blog.mainImage || null,
        metaDescription: blog.metaDescription || '',
        metaKeywords: blog.metaKeywords || [],
        status: blog.status || 'draft',
        isFeatured: blog.isFeatured || false,
        tags: blog.tags || []
      });
    } else {
      setEditMode(false);
      setSelectedBlog(null);
      setFormData({
        title: '',
        slug: '',
        category: '',
        excerpt: '',
        content: '',
        mainImage: null,
        metaDescription: '',
        metaKeywords: [],
        status: 'draft',
        isFeatured: false,
        tags: []
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setSelectedBlog(null);
    setFormData({
      title: '',
      slug: '',
      category: '',
      excerpt: '',
      content: '',
      mainImage: null,
      metaDescription: '',
      metaKeywords: [],
      status: 'draft',
      isFeatured: false,
      tags: []
    });
    setKeywordInput('');
    setTagInput('');
    setSlugError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle slug input with validation
  const handleSlugChange = (e) => {
    const value = e.target.value;
    const formattedSlug = formatSlugWhileTyping(value);
    
    setFormData(prev => ({
      ...prev,
      slug: formattedSlug,
    }));

    // Validate slug and show error if invalid
    const validation = validateSlug(formattedSlug);
    if (!validation.isValid) {
      setSlugError(validation.message);
    } else {
      setSlugError('');
    }
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleImageUpload = (images) => {
    setFormData(prev => ({ 
      ...prev, 
      mainImage: images && images.length > 0 ? images[0] : null 
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.metaKeywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter(k => k !== keyword)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate slug before submission
    if (formData.slug && formData.slug.trim()) {
      const validation = validateSlug(formData.slug);
      if (!validation.isValid) {
        toast.error(validation.message, {
          duration: 4000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
            zIndex: 10000,
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#f44336',
          },
        });
        return;
      }
    }
    
    // Validate all required fields individually
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Please enter a post title', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
      return;
    }

    if (!formData.category || formData.category === '') {
      toast.error('Please select a category', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
      return;
    }

    if (!formData.mainImage) {
      toast.error('Please upload a main image', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
      return;
    }

    if (!formData.content || formData.content.trim() === '' || formData.content === '<p><br></p>') {
      toast.error('Please write post content', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
      return;
    }

    try {
      const url = editMode ? `/api/blogs/${selectedBlog._id}` : '/api/blogs';
      const method = editMode ? 'put' : 'post';
      
      // Format slug before submission
      const submissionData = {
        ...formData,
        slug: formData.slug ? formatSlug(formData.slug) : ''
      };
      
      const response = await axios[method](url, submissionData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const savedBlog = response.data?.data || response.data;
      
      if (editMode) {
        setBlogs(prev => prev.map(b => b._id === savedBlog._id ? savedBlog : b));
        toast.success('Post updated successfully', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
            zIndex: 10000,
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4CAF50',
          },
        });
      } else {
        setBlogs(prev => [savedBlog, ...prev]);
        toast.success('Post created successfully', {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
            zIndex: 10000,
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4CAF50',
          },
        });
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.response?.data?.message || 'Failed to save post', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
    }
  };

  // Show delete confirmation modal
  const handleDelete = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  // Actually delete the blog after confirmation
  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`/api/blogs/${blogToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setBlogs(prev => prev.filter(b => b._id !== blogToDelete._id));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setBlogToDelete(null);
      
      toast.success('Post deleted successfully', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  const handleToggleStatus = async (blog) => {
    try {
      const newStatus = blog.status === 'published' ? 'draft' : 'published';
      const endpoint = newStatus === 'published' 
        ? `/api/blogs/${blog._id}/publish` 
        : `/api/blogs/${blog._id}/unpublish`;
      
      const response = await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const updatedBlog = response.data?.data || response.data;
      setBlogs(prev => prev.map(b => b._id === updatedBlog._id ? updatedBlog : b));
      
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`, {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
    } catch (error) {
      console.error('Error toggling post status:', error);
      toast.error('Failed to update post status', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
    }
  };

  const handleToggleFeatured = async (blog) => {
    try {
      const response = await axios.put(
        `/api/blogs/${blog._id}`,
        { isFeatured: !blog.isFeatured },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      const updatedBlog = response.data?.data || response.data;
      setBlogs(prev => prev.map(b => b._id === updatedBlog._id ? updatedBlog : b));
      
      toast.success(`Post ${!blog.isFeatured ? 'marked as featured' : 'removed from featured'} successfully`, {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
          zIndex: 10000,
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <RahalatekLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Blog Management</h2>
        </div>
        <div className="flex justify-center sm:justify-end">
          <CustomButton
            onClick={() => handleOpenModal()}
            variant="blueToTeal"
            size="sm"
            icon={FaPlus}
            className="w-full sm:w-auto"
          >
            Create Post
          </CustomButton>
        </div>
      </div>

      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <Search
              placeholder="Search blogs by title, category, or author..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3">
            <div className="flex-1">
              <SearchableSelect
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                placeholder="All Status"
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'archived', label: 'Archived' }
                ]}
              />
            </div>
            <div className="flex-1">
              <SearchableSelect
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                placeholder="All Categories"
                options={[
                  { value: '', label: 'All Categories' },
                  ...getCategoryOptions()
                ]}
              />
            </div>
            <div className="flex-1">
              <SearchableSelect
                value={filters.featured}
                onChange={(e) => setFilters({...filters, featured: e.target.value})}
                placeholder="All Posts"
                options={[
                  { value: '', label: 'All Posts' },
                  { value: 'true', label: 'Featured' },
                  { value: 'false', label: 'Not Featured' }
                ]}
              />
            </div>
            <div className="flex-1">
              <SearchableSelect
                value={filters.createdBy}
                onChange={(e) => setFilters({...filters, createdBy: e.target.value})}
                placeholder="All Authors"
                options={[
                  { value: '', label: 'All Authors' },
                  ...getCreatorOptions()
                ]}
              />
            </div>
            <div className="flex items-center px-4">
              <CustomCheckbox
                id="sort-by-views"
                label="Most Viewed Posts"
                checked={sortByViews}
                onChange={setSortByViews}
              />
            </div>
            <div className="flex-shrink-0">
              <CustomButton 
                variant="red" 
                onClick={() => {
                  setFilters({ search: '', status: '', category: '', featured: '', createdBy: '' });
                  setSortByViews(false);
                }}
                disabled={!filters.search && !filters.status && !filters.category && !filters.featured && !filters.createdBy && !sortByViews}
                className="w-full h-[44px] my-0.5"
                icon={FaFilter}
              >
                Clear Filters
              </CustomButton>
            </div>
            <div className="flex-shrink-0">
              <CustomButton 
                variant="orange" 
                onClick={fetchBlogs}
                className="w-full h-[44px] my-0.5"
                icon={FaSyncAlt}
              >
                Refresh Data
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      {/* Post Cards Grid */}
      {displayedBlogs.length === 0 ? (
        <Card className="dark:bg-slate-900 text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <FaPlus className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {blogs.length === 0 ? 'No Posts Created Yet' : 'No Posts Found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {blogs.length === 0 
                ? 'Create your first blog post to share insights and stories about travel destinations.'
                : 'Try adjusting your search or filter criteria to find blogs.'
              }
            </p>
            {blogs.length === 0 && (
              <CustomButton
                onClick={() => handleOpenModal()}
                variant="blueToTeal"
                size="lg"
                icon={FaPlus}
              >
                Create First Post
              </CustomButton>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {page} of {totalPages} ({totalBlogs} Posts total)
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayedBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                user={user}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onToggleFeatured={handleToggleFeatured}
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
                <FaAngleLeft className="w-4 h-4" />
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
                          ? 'bg-blue-500 dark:bg-teal-500 text-white border-blue-500 dark:border-teal-500 scale-110 shadow-lg'
                          : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-blue-500 hover:text-white dark:hover:bg-teal-500 dark:hover:text-white hover:border-blue-500 dark:hover:border-teal-500 hover:scale-110 shadow-sm hover:shadow-md'
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
                <FaAngleRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <CustomModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editMode ? 'Edit Post' : 'Create New Post'}
        maxWidth="md:max-w-screen-2xl"
      >
        <form id="blog-form" onSubmit={handleSubmit} className="space-y-6 pb-12">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <TextInput
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter post title"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Select a category"
              options={[
                { value: '', label: 'Select a category' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
            />
          </div>

          {/* Slug */}
          <div>
            <TextInput
              id="slug"
              name="slug"
              label="Custom URL Slug (Optional)"
              type="text"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="e.g., istanbul-travel-guide"
            />
            {slugError && (
              <p className="text-red-500 text-xs mt-1">{slugError}</p>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Preview: <span className="font-mono text-blue-600 dark:text-teal-400">/blog/{formData.slug && formData.slug.trim() ? formatSlug(formData.slug) : formData.title && formData.title.trim() ? formatSlug(formData.title) + ' (auto-generated)' : 'post-name (auto-generated)'}</span>
            </p>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Content <span className="text-red-500">*</span>
            </label>
            <div className="bg-white dark:bg-slate-800 rounded-lg">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                className="h-[500px] mb-12"
                placeholder="Write your post content here..."
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <TextInput
              id="excerpt"
              name="excerpt"
              label="Excerpt (Brief Summary)"
              as="textarea"
              rows={3}
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Short summary for blog preview (max 300 characters)"
              maxLength="300"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.excerpt.length}/300 characters
            </p>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Main Image <span className="text-red-500">*</span>
            </label>
            <ImageUploader
              onImagesUploaded={handleImageUpload}
              existingImages={formData.mainImage ? [formData.mainImage] : []}
              folder="blogs"
              maxImages={1}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <TextInput
                id="tagInput"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Type tag and press Enter"
                className="flex-1"
              />
              <CustomButton type="button" onClick={addTag} variant="blue" size="sm">
                Add
              </CustomButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <TextInput
              id="metaDescription"
              name="metaDescription"
              label="Meta Description (SEO)"
              as="textarea"
              rows={2}
              value={formData.metaDescription}
              onChange={handleInputChange}
              placeholder="SEO meta description (max 160 characters)"
              maxLength="160"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.metaDescription.length}/160 characters
            </p>
          </div>

          {/* Meta Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Keywords (SEO)
            </label>
            <div className="flex gap-2 mb-2">
              <TextInput
                id="keywordInput"
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder="Type keyword and press Enter"
                className="flex-1"
              />
              <CustomButton type="button" onClick={addKeyword} variant="blue" size="sm">
                Add
              </CustomButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.metaKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-red-600"
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Status and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                id="status"
                label="Status"
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                placeholder="Select status"
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'archived', label: 'Archived' }
                ]}
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mark as Featured
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Action Buttons - Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-600 p-4 -mx-4 -mb-4 flex justify-end gap-3">
          <CustomButton type="button" onClick={handleCloseModal} variant="gray">
            <div className="flex items-center gap-2">
              <FaTimes />
              <span>Cancel</span>
            </div>
          </CustomButton>
          <CustomButton type="submit" variant="blue" form="blog-form">
            <div className="flex items-center gap-2">
              <FaSave />
              <span>{editMode ? 'Update Post' : 'Create Post'}</span>
            </div>
          </CustomButton>
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteBlog}
        isLoading={deleteLoading}
        itemType="blog"
        itemName={blogToDelete?.title}
        itemExtra={blogToDelete ? `by ${blogToDelete.author?.username || 'Unknown'}` : ''}
      />

      {/* Video URL Modal */}
      <CustomModal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setVideoUrl('');
        }}
        title="Embed Video"
        subtitle="Enter a YouTube or Vimeo video URL"
        maxWidth="md:max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video URL
            </label>
            <TextInput
              id="videoUrl"
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleVideoInsert();
                }
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Supported formats:
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 list-disc list-inside">
              <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>https://youtu.be/VIDEO_ID</li>
              <li>https://vimeo.com/VIDEO_ID</li>
            </ul>
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
              ⚠️ YouTube Shorts are not supported
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <CustomButton
              type="button"
              onClick={() => {
                setShowVideoModal(false);
                setVideoUrl('');
              }}
              variant="gray"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="button"
              onClick={handleVideoInsert}
              variant="blue"
            >
              Insert Video
            </CustomButton>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
