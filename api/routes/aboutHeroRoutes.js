const express = require('express');
const router = express.Router();
const aboutHeroController = require('../controllers/aboutHeroController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/active', aboutHeroController.getActiveHero);

// Protected routes - Admin and Content Manager only
router.use(verifyToken); // Apply authentication to all routes below

router.get('/', aboutHeroController.getAllHeroes);
router.get('/:id', aboutHeroController.getHeroById);
router.post('/', aboutHeroController.createHero);
router.put('/:id', aboutHeroController.updateHero);
router.delete('/:id', aboutHeroController.deleteHero);
router.patch('/:id/status', aboutHeroController.toggleHeroStatus);

module.exports = router;

