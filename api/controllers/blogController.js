const Blog = require('../models/Blog');
const { invalidateDashboardCache } = require('../utils/redis');

// Get all blogs with pagination and filters (Admin/Content Manager)
exports.getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category, author, search } = req.query;
        
        const query = {};
        
        if (status) query.status = status;
        if (category) query.category = category;
        if (author) query.author = author;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: { path: 'author', select: 'username email' }
        };
        
        const blogs = await Blog.paginate(query, options);
        
        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blogs',
            error: error.message
        });
    }
};

// Get published blogs (Public)
exports.getPublishedBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, tag, search } = req.query;
        
        const filters = {};
        
        if (category) filters.category = category;
        if (tag) filters.tags = tag;
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };
        
        const blogs = await Blog.getPublishedBlogs(filters, options);
        
        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch published blogs',
            error: error.message
        });
    }
};

// Get blog by slug (Public - does NOT increment views)
exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
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
            tags
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
            tags: tags || []
        };
        
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
            tags
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

