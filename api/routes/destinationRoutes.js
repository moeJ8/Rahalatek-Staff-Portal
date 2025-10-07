const express = require('express');
const destinationController = require('../controllers/destinationController');

const router = express.Router();

// Public route - get all destinations
router.get('/', destinationController.getDestinations);

// Public route - get cities for a specific country
router.get('/:country/cities', destinationController.getCitiesByCountry);

// Public route - get detailed city information
router.get('/:country/cities/:city', destinationController.getCityDetails);

module.exports = router;
