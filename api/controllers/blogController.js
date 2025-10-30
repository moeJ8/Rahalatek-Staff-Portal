const Blog = require('../models/Blog');
const { invalidateDashboardCache, allBlogsCache } = require('../utils/redis');
const NotificationService = require('../services/notificationService');
const WhatsappClicksReportService = require('../services/whatsappClicksReportService');

// Helper to determine if a string is meaningful (not just HTML/nbsp)
const isMeaningfulString = (value) => {
    if (typeof value !== 'string') return false;
    const stripped = value
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;|\u00A0/gi, ' ')
        .trim();
    return stripped.length > 0;
};

// Helper function to translate blog content based on language
const translateBlog = (blog, lang) => {
    const originalLang = blog.originalLanguage || 'ar';
    
    // If requested language matches original, return as-is
    if (lang === originalLang || !blog.translations) {
        return blog.toObject ? blog.toObject() : blog;
    }
    
    const translations = blog.translations;
    const translatedBlog = blog.toObject ? blog.toObject() : { ...blog };
    
    const getTranslated = (baseValue, translationValue) => {
        return translationValue && translationValue.trim() ? translationValue : baseValue;
    };
    
    // Helper to get translation value (handles both Map and plain object)
    const getTranslationValue = (translationObj, lang) => {
        if (!translationObj) return null;
        if (translationObj instanceof Map) {
            return translationObj.has(lang) ? translationObj.get(lang) : null;
        }
        if (typeof translationObj === 'object') {
            return translationObj[lang] || null;
        }
        return null;
    };
    
    // Translate title
    const titleTranslation = getTranslationValue(translations.title, lang);
    if (isMeaningfulString(titleTranslation)) {
        translatedBlog.title = getTranslated(blog.title, titleTranslation);
    }
    
    // Translate excerpt
    const excerptTranslation = getTranslationValue(translations.excerpt, lang);
    if (isMeaningfulString(excerptTranslation)) {
        translatedBlog.excerpt = getTranslated(blog.excerpt, excerptTranslation);
    }
    
    // Translate content
    const contentTranslation = getTranslationValue(translations.content, lang);
    if (isMeaningfulString(contentTranslation)) {
        translatedBlog.content = getTranslated(blog.content, contentTranslation);
    }
    
    // Translate metaDescription
    const metaDescriptionTranslation = getTranslationValue(translations.metaDescription, lang);
    if (isMeaningfulString(metaDescriptionTranslation)) {
        translatedBlog.metaDescription = getTranslated(blog.metaDescription, metaDescriptionTranslation);
    }
    
    return translatedBlog;
};

// Get all blogs with pagination and filters (Admin/Content Manager)
exports.getAllBlogs = async (req, res) => {
  try {
    const { status, category, author, featured, search, page, limit } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (author) query.author = author;
    if (featured) query.isFeatured = featured === 'true';
    
    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex }
      ];
    }
    
    // If NO pagination, return all blogs (backward compatible)
    if (!page && !limit) {
      if (!status && !category && !author && !featured && !search) {
        const cachedBlogs = await allBlogsCache.get();
        if (cachedBlogs) {
          console.log('✅ Serving all blogs from Redis cache');
          return res.status(200).json(cachedBlogs);
        }
      }
      
      console.log('📝 Fetching all blogs from database...');
      const blogs = await Blog.find(query).sort({ createdAt: -1 })
        .populate('author', 'username email');
      
      if (!status && !category && !author && !featured && !search) {
        await allBlogsCache.set(blogs);
      }
      
      return res.status(200).json(blogs);
    }
    
    // PAGINATION MODE
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const skip = (pageNum - 1) * limitNum;
    
    // Handle sorting
    let sortOptions = { createdAt: -1 }; // Default sort
    const sortBy = req.query.sortBy;
    if (sortBy === 'popular') {
      sortOptions = { views: -1, createdAt: -1 };
    }
    
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(query).sort(sortOptions).skip(skip).limit(limitNum)
        .populate('author', 'username email'),
      Blog.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalBlogs / limitNum),
          totalBlogs,
          blogsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(totalBlogs / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get published blogs (Public)
exports.getPublishedBlogs = async (req, res) => {
  try {
    const { category, tag, search, page, limit } = req.query;
    
    let query = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    
    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex }
      ];
    }
    
    // If NO pagination, return all published blogs (backward compatible)
    if (!page && !limit) {
      console.log('📝 Fetching all published blogs from database...');
      const blogs = await Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        data: {
          docs: blogs,
          totalDocs: blogs.length,
          totalPages: 1,
          page: 1,
          limit: blogs.length
        }
      });
    }
    
    // PAGINATION MODE
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const skip = (pageNum - 1) * limitNum;
    
    // Handle sorting
    let sortOptions = { publishedAt: -1, createdAt: -1 }; // Default sort
    const sortBy = req.query.sortBy;
    if (sortBy === 'popular') {
      sortOptions = { views: -1, publishedAt: -1 };
    } else if (sortBy === 'recent') {
      sortOptions = { publishedAt: -1, createdAt: -1 };
    }
    
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Blog.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        docs: blogs,
        totalDocs: totalBlogs,
        totalPages: Math.ceil(totalBlogs / limitNum),
        page: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalBlogs / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get blog by slug (Public - does NOT increment views)
exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { lang } = req.query; // Get language from query parameter
        
        const blog = await Blog.findOne({ slug })
            .populate('author', 'username email');
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Only allow viewing published blogs for non-admin users
        if (blog.status !== 'published' && (!req.user || (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher))) {
            return res.status(403).json({
                success: false,
                message: 'Blog is not published'
            });
        }
        
        // Translate blog if lang parameter is provided
        const translatedBlog = lang ? translateBlog(blog, lang) : blog;
        
        res.status(200).json({
            success: true,
            data: translatedBlog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blog',
            error: error.message
        });
    }
};

// Increment blog views (separate endpoint like hotels/tours)
exports.incrementBlogViews = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await Blog.findOneAndUpdate(
            { slug: slug, status: 'published' },
            { $inc: { views: 1 } },
            { new: true }
        );
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        res.json({ success: true, views: blog.views });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to increment views',
            error: error.message
        });
    }
};

// Increment WhatsApp clicks and notify author
exports.incrementWhatsAppClicks = async (req, res) => {
    try {
        const { slug } = req.params;
        // Find blog
        const blog = await Blog.findOne({ slug: slug, status: 'published' }).populate('author', 'username _id');

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Increment all-time clicks
        blog.whatsappClicks = (blog.whatsappClicks || 0) + 1;

        // Increment today's daily counter
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;

        if (!blog.clicksByDate) blog.clicksByDate = new Map();
        const current = (blog.clicksByDate.get ? blog.clicksByDate.get(key) : blog.clicksByDate[key]) || 0;
        if (blog.clicksByDate.set) {
            blog.clicksByDate.set(key, current + 1);
        } else {
            blog.clicksByDate[key] = current + 1;
        }

        // Trim retention to last 180 days to keep document small
        const retentionDays = 180;
        const cutoff = new Date(today.getTime() - retentionDays * 24 * 60 * 60 * 1000);
        const entries = blog.clicksByDate instanceof Map
            ? Array.from(blog.clicksByDate.entries())
            : Object.entries(blog.clicksByDate || {});
        const filtered = entries.filter(([dateStr]) => new Date(dateStr) >= cutoff);
        if (blog.clicksByDate instanceof Map) {
            blog.clicksByDate.clear();
            filtered.forEach(([k, v]) => blog.clicksByDate.set(k, v));
        } else {
            blog.clicksByDate = filtered.reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
        }

        await blog.save();

        // No per-click notifications; weekly report covers engagement

        return res.json({ success: true, whatsappClicks: blog.whatsappClicks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to increment WhatsApp clicks', error: error.message });
    }
};

// Removed per-blog WhatsApp clicks report controller

// Generate weekly WhatsApp clicks PDF report and notify author(s)
exports.triggerWeeklyWhatsappReport = async (req, res) => {
    try {
        const { scope, authorId } = req.query;
        const user = req.user;

        // Publisher: only own
        if (user && user.isPublisher && !user.isAdmin && !user.isContentManager) {
            const result = await WhatsappClicksReportService.generateAndNotifyForAuthor(user.userId, user.userId);
            return res.json({ success: true, scope: 'self', count: result ? 1 : 0 });
        }

        // Admin/Content Manager
        if (user && (user.isAdmin || user.isContentManager)) {
            if (scope === 'all') {
                // Create ONE combined report for requester covering all authors
                const result = await WhatsappClicksReportService.generateAndNotifyAllAuthorsCombined(user.userId);
                return res.json({ success: true, scope: 'all', count: 1 });
            }
            const targetAuthor = authorId || user.userId;
            const result = await WhatsappClicksReportService.generateAndNotifyForAuthor(targetAuthor, user.userId);
            return res.json({ success: true, scope: 'author', count: result ? 1 : 0 });
        }

        return res.status(403).json({ success: false, message: 'Not authorized' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to trigger WhatsApp report', error: error.message });
    }
};

// Get blog by ID (Admin/Content Manager)
exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blog = await Blog.findById(id)
            .populate('author', 'username email');
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blog',
            error: error.message
        });
    }
};

// Get featured blogs (Public)
exports.getFeaturedBlogs = async (req, res) => {
    try {
        const { limit = 3 } = req.query;
        
        const blogs = await Blog.getFeaturedBlogs(parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured blogs',
            error: error.message
        });
    }
};

// Get recent blogs (Public)
exports.getRecentBlogs = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const blogs = await Blog.getRecentBlogs(parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent blogs',
            error: error.message
        });
    }
};

// Get blogs by category (Public)
exports.getBlogsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };
        
        const blogs = await Blog.getBlogsByCategory(category, options);
        
        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blogs by category',
            error: error.message
        });
    }
};

// Create new blog (Admin/Content Manager)
exports.createBlog = async (req, res) => {
    try {
        const {
            title,
            slug,
            category,
            excerpt,
            content,
            mainImage,
            metaDescription,
            metaKeywords,
            status,
            isFeatured,
            tags,
            originalLanguage,
            translations
        } = req.body;
        
        const blogData = {
            title,
            category,
            content,
            mainImage,
            author: req.user.userId,
            excerpt,
            metaDescription,
            metaKeywords: metaKeywords || [],
            status: status || 'draft',
            isFeatured: isFeatured || false,
            tags: tags || [],
            originalLanguage: originalLanguage || 'ar'
        };
        
        // Add translations if provided - only include translations for non-original languages
        if (translations && typeof translations === 'object') {
            const originalLang = blogData.originalLanguage || 'ar';
            const translationLanguages = ['en', 'ar', 'fr'].filter(lang => lang !== originalLang);
            
            blogData.translations = {
                title: new Map(),
                excerpt: new Map(),
                content: new Map(),
                metaDescription: new Map()
            };
            
            // Only include translations for non-original languages
            translationLanguages.forEach(lang => {
                const tTitle = translations.title?.[lang];
                const tExcerpt = translations.excerpt?.[lang];
                const tContent = translations.content?.[lang];
                const tMeta = translations.metaDescription?.[lang];

                if (isMeaningfulString(tTitle)) {
                    blogData.translations.title.set(lang, String(tTitle));
                }
                if (isMeaningfulString(tExcerpt)) {
                    blogData.translations.excerpt.set(lang, String(tExcerpt));
                }
                if (isMeaningfulString(tContent)) {
                    blogData.translations.content.set(lang, String(tContent));
                }
                if (isMeaningfulString(tMeta)) {
                    blogData.translations.metaDescription.set(lang, String(tMeta));
                }
            });
        }
        
        // Add custom slug if provided
        if (slug && slug.trim() !== '') {
            blogData.slug = slug.trim();
        }
        
        const blog = new Blog(blogData);
        await blog.save();
        
        await invalidateDashboardCache('New blog created');
        
        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create blog',
            error: error.message
        });
    }
};

// Update blog (Admin/Content Manager)
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            slug,
            category,
            excerpt,
            content,
            mainImage,
            metaDescription,
            metaKeywords,
            status,
            isFeatured,
            tags,
            originalLanguage,
            translations
        } = req.body;
        
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Check if user is authorized to update (admin, content manager, or publisher can update any blog)
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this blog'
            });
        }

        // Update fields
        if (title !== undefined) blog.title = title;
        if (slug !== undefined) blog.slug = slug.trim();
        if (category !== undefined) blog.category = category;
        if (excerpt !== undefined) blog.excerpt = excerpt;
        if (content !== undefined) blog.content = content;
        if (mainImage !== undefined) blog.mainImage = mainImage;
        if (metaDescription !== undefined) blog.metaDescription = metaDescription;
        if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;
        if (status !== undefined) blog.status = status;
        if (isFeatured !== undefined) blog.isFeatured = isFeatured;
        if (tags !== undefined) blog.tags = tags;
        if (originalLanguage !== undefined) blog.originalLanguage = originalLanguage;
        
        // Update translations if provided - only include translations for non-original languages
        if (translations !== undefined && typeof translations === 'object') {
            const originalLang = blog.originalLanguage || 'ar';
            const translationLanguages = ['en', 'ar', 'fr'].filter(lang => lang !== originalLang);
            
            // Initialize translations if not exists
            if (!blog.translations) {
                blog.translations = {
                    title: new Map(),
                    excerpt: new Map(),
                    content: new Map(),
                    metaDescription: new Map()
                };
            }
            
            // Only update translations for non-original languages
            translationLanguages.forEach(lang => {
                if (isMeaningfulString(translations.title?.[lang])) {
                    if (!blog.translations.title) blog.translations.title = new Map();
                    blog.translations.title.set(lang, String(translations.title[lang]));
                }
                if (isMeaningfulString(translations.excerpt?.[lang])) {
                    if (!blog.translations.excerpt) blog.translations.excerpt = new Map();
                    blog.translations.excerpt.set(lang, String(translations.excerpt[lang]));
                }
                if (isMeaningfulString(translations.content?.[lang])) {
                    if (!blog.translations.content) blog.translations.content = new Map();
                    blog.translations.content.set(lang, String(translations.content[lang]));
                }
                if (isMeaningfulString(translations.metaDescription?.[lang])) {
                    if (!blog.translations.metaDescription) blog.translations.metaDescription = new Map();
                    blog.translations.metaDescription.set(lang, String(translations.metaDescription[lang]));
                }
            });
        }
        
        await blog.save();
        
        await invalidateDashboardCache('Blog updated');
        
        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update blog',
            error: error.message
        });
    }
};

// Delete blog (Admin and Content Manager)
exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators, content managers, and publishers can delete blogs'
            });
        }
        
        const blog = await Blog.findByIdAndDelete(id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        await invalidateDashboardCache('Blog deleted');
        
        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete blog',
            error: error.message
        });
    }
};

// Publish blog (Admin/Content Manager)
exports.publishBlog = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        // Check if user is authorized (admin, content manager, or publisher can publish any blog)
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to publish this blog'
            });
        }
        
        blog.status = 'published';
        if (!blog.publishedAt) {
            blog.publishedAt = new Date();
        }
        
        await blog.save();
        
        await invalidateDashboardCache('Blog published');
        
        res.status(200).json({
            success: true,
            message: 'Blog published successfully',
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to publish blog',
            error: error.message
        });
    }
};

// Unpublish blog (Admin/Content Manager)
exports.unpublishBlog = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        // Check if user is authorized (admin, content manager, or publisher can unpublish any blog)
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to unpublish this blog'
            });
        }
        
        blog.status = 'draft';
        
        await blog.save();
        
        await invalidateDashboardCache('Blog unpublished');
        
        res.status(200).json({
            success: true,
            message: 'Blog unpublished successfully',
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to unpublish blog',
            error: error.message
        });
    }
};

// Get blog categories (Public)
exports.getCategories = async (req, res) => {
    try {
        const categories = await Blog.distinct('category');
        
        res.status(200).json({
            success: true,
            data: categories.sort()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// Get blog tags (Public)
exports.getTags = async (req, res) => {
    try {
        // Aggregate to count tag usage frequency
        const tagCounts = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            { 
                $group: { 
                    _id: '$tags', 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { count: -1 } }, // Sort by count descending (most popular first)
            { 
                $project: { 
                    _id: 0, 
                    tag: '$_id', 
                    count: 1 
                } 
            }
        ]);
        
        // Extract just the tag names for backward compatibility
        const tags = tagCounts.map(item => item.tag);
        
        res.status(200).json({
            success: true,
            data: tags,
            counts: tagCounts // Optional: include counts for potential future use
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tags',
            error: error.message
        });
    }
};

