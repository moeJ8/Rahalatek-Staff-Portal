const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Public route - no authentication required
router.post('/', contactController.sendContactForm);

module.exports = router;

