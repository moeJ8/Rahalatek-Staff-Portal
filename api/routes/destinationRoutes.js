const express = require('express');
const destinationController = require('../controllers/destinationController');

const router = express.Router();

// Public route - get all destinations
router.get('/', destinationController.getDestinations);

module.exports = router;
