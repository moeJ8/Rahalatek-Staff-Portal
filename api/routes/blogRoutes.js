const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/published', blogController.getPublishedBlogs);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/recent', blogController.getRecentBlogs);
router.get('/categories', blogController.getCategories);
router.get('/tags', blogController.getTags);
router.get('/category/:category', blogController.getBlogsByCategory);
router.get('/slug/:slug', blogController.getBlogBySlug);
// Increment blog views - must be after slug route
router.post('/slug/:slug/view', blogController.incrementBlogViews);

// Protected routes - Admin and Content Manager only
router.use(verifyToken);

// Middleware to check if user is admin, content manager, or publisher
const checkAdminOrContentManager = (req, res, next) => {
    if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin, Content Manager, or Publisher privileges required.'
        });
    }
    next();
};

router.use(checkAdminOrContentManager);

// CRUD operations
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', blogController.createBlog);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

// Publishing actions
router.put('/:id/publish', blogController.publishBlog);
router.put('/:id/unpublish', blogController.unpublishBlog);

module.exports = router;

