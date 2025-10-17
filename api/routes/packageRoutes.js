const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { verifyToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/public/:slug', packageController.getPackageBySlug);
router.post('/public/:slug/view', packageController.incrementPackageViews);
router.get('/featured', packageController.getFeaturedPackages);
router.get('/recent', packageController.getRecentPackages);

// Apply authentication middleware to admin routes
router.use(verifyToken);

// Package CRUD routes (admin only)
router.post('/', packageController.createPackage);
router.get('/', packageController.getAllPackages);
router.get('/stats', packageController.getPackageStats);
router.get('/:id', packageController.getPackageById);
router.put('/:id', packageController.updatePackage);
router.delete('/:id', packageController.deletePackage);
router.patch('/:id/toggle-status', packageController.togglePackageStatus);

module.exports = router;
