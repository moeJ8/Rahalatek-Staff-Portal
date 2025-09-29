const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/active', carouselController.getActiveSlides);

// Protected routes - Admin and Content Manager only
router.use(verifyToken); // Apply authentication to all routes below

router.get('/', carouselController.getAllSlides);
router.get('/:id', carouselController.getSlideById);
router.post('/', carouselController.createSlide);
router.put('/:id', carouselController.updateSlide);
router.delete('/:id', carouselController.deleteSlide);
router.patch('/:id/status', carouselController.toggleSlideStatus);
router.patch('/reorder', carouselController.reorderSlides);

module.exports = router;
