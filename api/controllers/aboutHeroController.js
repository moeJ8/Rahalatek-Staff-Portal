const AboutHero = require('../models/AboutHero');
const cloudinary = require('../config/cloudinary');

// Helper function to translate a single about hero
const translateHero = (hero, lang) => {
  if (lang === 'en' || !hero.translations) {
    return hero.toObject ? hero.toObject() : hero;
  }

  const translations = hero.translations;
  const translatedHero = hero.toObject ? hero.toObject() : { ...hero };

  // Helper function to get translated text or fallback to base
  const getTranslated = (baseValue, translationValue) => {
    return translationValue && translationValue.trim() ? translationValue : baseValue;
  };

  // Translate simple fields
  if (translations.title && translations.title[lang]) {
    translatedHero.title = getTranslated(hero.title, translations.title[lang]);
  }
  if (translations.subtitle && translations.subtitle[lang]) {
    translatedHero.subtitle = getTranslated(hero.subtitle, translations.subtitle[lang]);
  }
  if (translations.description && translations.description[lang]) {
    translatedHero.description = getTranslated(hero.description, translations.description[lang]);
  }
  
  // Translate text position
  if (translations.textPosition && translations.textPosition[lang] && translations.textPosition[lang].trim() !== '') {
    translatedHero.textPosition = translations.textPosition[lang];
  }

  return translatedHero;
};

// Get active hero for public display
exports.getActiveHero = async (req, res) => {
  try {
    const { lang = 'en' } = req.query; // Get language from query parameter
    const hero = await AboutHero.getActiveHero();
    
    if (!hero) {
      // Return default hero if none exists
      return res.json({
        _id: 'default',
        title: 'About Us',
        subtitle: 'Discover Our Story',
        description: 'Learn more about our company and what we do.',
        image: {
          url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          altText: 'About Us'
        },
        textPosition: 'center',
        textColor: 'light',
        isActive: true
      });
    }
    
    const translatedHero = translateHero(hero, lang);
    res.json(translatedHero);
  } catch (error) {
    console.error('Error fetching active about hero:', error);
    res.status(500).json({ message: 'Failed to fetch about hero' });
  }
};

// Get all heroes for admin management
exports.getAllHeroes = async (req, res) => {
  try {
    // Check if user is admin, content manager, or publisher
    if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ message: 'Access denied. Admin, Content Manager, or Publisher privileges required.' });
    }

    const heroes = await AboutHero.getAllHeroesForAdmin();
    res.json(heroes);
  } catch (error) {
    console.error('Error fetching all about heroes:', error);
    res.status(500).json({ message: 'Failed to fetch about heroes' });
  }
};

// Get single hero by ID
exports.getHeroById = async (req, res) => {
  try {
    // Check if user is admin, content manager, or publisher
    if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ message: 'Access denied. Admin, Content Manager, or Publisher privileges required.' });
    }

    const hero = await AboutHero.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    if (!hero) {
      return res.status(404).json({ message: 'About hero not found' });
    }

    res.json(hero);
  } catch (error) {
    console.error('Error fetching about hero:', error);
    res.status(500).json({ message: 'Failed to fetch about hero' });
  }
};

// Create new hero
exports.createHero = async (req, res) => {
  try {
    // Check if user is admin, content manager, or publisher
    if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ message: 'Access denied. Admin, Content Manager, or Publisher privileges required.' });
    }

    // If this hero is being set as active, deactivate all others
    if (req.body.isActive) {
      await AboutHero.updateMany({}, { isActive: false });
    }

    const heroData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const hero = new AboutHero(heroData);
    await hero.save();

    const populatedHero = await AboutHero.findById(hero._id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    res.status(201).json({
      message: 'About hero created successfully',
      hero: populatedHero
    });
  } catch (error) {
    console.error('Error creating about hero:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Failed to create about hero' });
  }
};

// Update hero
exports.updateHero = async (req, res) => {
  try {
    // Check if user is admin, content manager, or publisher
    if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ message: 'Access denied. Admin, Content Manager, or Publisher privileges required.' });
    }

    // If this hero is being set as active, deactivate all others
    if (req.body.isActive) {
      await AboutHero.updateMany(
        { _id: { $ne: req.params.id } },
        { isActive: false }
      );
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const hero = await AboutHero.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username')
     .populate('updatedBy', 'username');

    if (!hero) {
      return res.status(404).json({ message: 'About hero not found' });
    }

    res.json({
      message: 'About hero updated successfully',
      hero
    });
  } catch (error) {
    console.error('Error updating about hero:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Failed to update about hero' });
  }
};

// Delete hero
exports.deleteHero = async (req, res) => {
  try {
    // Check if user is admin, content manager, or publisher
    if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ message: 'Access denied. Admin, Content Manager, or Publisher privileges required.' });
    }

    const hero = await AboutHero.findById(req.params.id);

    if (!hero) {
      return res.status(404).json({ message: 'About hero not found' });
    }

    // Delete image from Cloudinary
    if (hero.image.publicId) {
      try {
        await cloudinary.uploader.destroy(hero.image.publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with hero deletion even if Cloudinary deletion fails
      }
    }

    await AboutHero.findByIdAndDelete(req.params.id);

    res.json({ message: 'About hero deleted successfully' });
  } catch (error) {
    console.error('Error deleting about hero:', error);
    res.status(500).json({ message: 'Failed to delete about hero' });
  }
};

// Toggle hero active status
exports.toggleHeroStatus = async (req, res) => {
  try {
    // Check if user is admin, content manager, or publisher
    if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ message: 'Access denied. Admin, Content Manager, or Publisher privileges required.' });
    }

    const { isActive } = req.body;

    // If activating this hero, deactivate all others
    if (isActive) {
      await AboutHero.updateMany(
        { _id: { $ne: req.params.id } },
        { isActive: false }
      );
    }

    const hero = await AboutHero.findByIdAndUpdate(
      req.params.id,
      { 
        isActive,
        updatedBy: req.user.userId
      },
      { new: true }
    ).populate('createdBy', 'username')
     .populate('updatedBy', 'username');

    if (!hero) {
      return res.status(404).json({ message: 'About hero not found' });
    }

    res.json({
      message: `About hero ${isActive ? 'activated' : 'deactivated'} successfully`,
      hero
    });
  } catch (error) {
    console.error('Error toggling about hero status:', error);
    res.status(500).json({ message: 'Failed to update about hero status' });
  }
};

