const express = require('express');
const tourController = require('../controllers/tourController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', tourController.getAllTours);
router.get('/country/:country', tourController.getToursByCountry);
router.get('/country/:country/cities', tourController.getTourCitiesByCountry);
router.get('/countries', tourController.getTourCountries);
router.get('/city/:city', tourController.getToursByCity);
// Public route - get tour by slug (must be before /:id route)
router.get('/public/:slug', tourController.getTourBySlug);

// Public route - increment tour views
router.post('/public/:slug/view', tourController.incrementTourViews);

// Public route - get featured tours
router.get('/featured', tourController.getFeaturedTours);
router.get('/:id', tourController.getTourById);
router.post('/', verifyToken, tourController.addTour);
router.put('/:id', verifyToken, tourController.updateTour);
router.delete('/:id', verifyToken, tourController.deleteTour);

module.exports = router;

