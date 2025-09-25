const express = require('express');
const hotelController = require('../controllers/hotelController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Get all hotels
router.get('/', hotelController.getAllHotels);

// Get hotels by country
router.get('/country/:country', hotelController.getHotelsByCountry);

// Get cities by country
router.get('/country/:country/cities', hotelController.getCitiesByCountry);

// Get all countries
router.get('/countries', hotelController.getCountries);

// Get hotels by city
router.get('/city/:city', hotelController.getHotelsByCity);

// Public route - get all hotels
router.get('/public', hotelController.getAllHotels);

// Public route - get hotel by slug (must be before /:id route)
router.get('/public/:slug', hotelController.getHotelBySlug);

// Get hotel by ID
router.get('/:id', hotelController.getHotelById);

// Add new hotel
router.post('/', verifyToken, hotelController.addHotel);

// Update hotel
router.put('/:id', verifyToken, hotelController.updateHotel);

// Delete hotel
router.delete('/:id', verifyToken, hotelController.deleteHotel);

module.exports = router;
