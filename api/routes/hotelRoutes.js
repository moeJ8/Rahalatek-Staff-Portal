const express = require('express');
const hotelController = require('../controllers/hotelController');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Get all hotels
router.get('/', hotelController.getAllHotels);

// Get hotels by city
router.get('/city/:city', hotelController.getHotelsByCity);

// Get hotel by ID
router.get('/:id', hotelController.getHotelById);

// Add new hotel
router.post('/', hotelController.addHotel);

// Update hotel
router.put('/:id', hotelController.updateHotel);

// Delete hotel
router.delete('/:id', verifyToken, hotelController.deleteHotel);

module.exports = router;
