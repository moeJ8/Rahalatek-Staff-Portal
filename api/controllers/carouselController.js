const CarouselSlide = require('../models/CarouselSlide');
const cloudinary = require('../config/cloudinary');

// Get all active slides for public display
exports.getActiveSlides = async (req, res) => {
  try {
    const slides = await CarouselSlide.getActiveSlides();
    res.json(slides);
  } catch (error) {
    console.error('Error fetching active carousel slides:', error);
    res.status(500).json({ message: 'Failed to fetch carousel slides' });
  }
};

// Get all slides for admin management
exports.getAllSlides = async (req, res) => {
  try {
    // Check if user is admin or content manager
    if (!req.user.isAdmin && !req.user.isContentManager) {
      return res.status(403).json({ message: 'Access denied. Admin or Content Manager privileges required.' });
    }

    const slides = await CarouselSlide.getAllSlidesForAdmin();
    res.json(slides);
  } catch (error) {
    console.error('Error fetching all carousel slides:', error);
    res.status(500).json({ message: 'Failed to fetch carousel slides' });
  }
};

// Get single slide by ID
exports.getSlideById = async (req, res) => {
  try {
    // Check if user is admin or content manager
    if (!req.user.isAdmin && !req.user.isContentManager) {
      return res.status(403).json({ message: 'Access denied. Admin or Content Manager privileges required.' });
    }

    const slide = await CarouselSlide.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    if (!slide) {
      return res.status(404).json({ message: 'Carousel slide not found' });
    }

    res.json(slide);
  } catch (error) {
    console.error('Error fetching carousel slide:', error);
    res.status(500).json({ message: 'Failed to fetch carousel slide' });
  }
};

// Create new slide
exports.createSlide = async (req, res) => {
  try {
    // Check if user is admin or content manager
    if (!req.user.isAdmin && !req.user.isContentManager) {
      return res.status(403).json({ message: 'Access denied. Admin or Content Manager privileges required.' });
    }

    const slideData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const slide = new CarouselSlide(slideData);
    await slide.save();

    const populatedSlide = await CarouselSlide.findById(slide._id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    res.status(201).json({
      message: 'Carousel slide created successfully',
      slide: populatedSlide
    });
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Failed to create carousel slide' });
  }
};

// Update slide
exports.updateSlide = async (req, res) => {
  try {
    // Check if user is admin or content manager
    if (!req.user.isAdmin && !req.user.isContentManager) {
      return res.status(403).json({ message: 'Access denied. Admin or Content Manager privileges required.' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const slide = await CarouselSlide.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username')
     .populate('updatedBy', 'username');

    if (!slide) {
      return res.status(404).json({ message: 'Carousel slide not found' });
    }

    res.json({
      message: 'Carousel slide updated successfully',
      slide
    });
  } catch (error) {
    console.error('Error updating carousel slide:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Failed to update carousel slide' });
  }
};

// Delete slide
exports.deleteSlide = async (req, res) => {
  try {
    // Check if user is admin or content manager
    if (!req.user.isAdmin && !req.user.isContentManager) {
      return res.status(403).json({ message: 'Access denied. Admin or Content Manager privileges required.' });
    }

    const slide = await CarouselSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: 'Carousel slide not found' });
    }

    // Delete image from Cloudinary
    if (slide.image.publicId) {
      try {
        await cloudinary.uploader.destroy(slide.image.publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with slide deletion even if Cloudinary deletion fails
      }
    }

    await CarouselSlide.findByIdAndDelete(req.params.id);

    res.json({ message: 'Carousel slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting carousel slide:', error);
    res.status(500).json({ message: 'Failed to delete carousel slide' });
  }
};

// Toggle slide active status
exports.toggleSlideStatus = async (req, res) => {
  try {
    // Check if user is admin or content manager
    if (!req.user.isAdmin && !req.user.isContentManager) {
      return res.status(403).json({ message: 'Access denied. Admin or Content Manager privileges required.' });
    }

    const { isActive } = req.body;

    const slide = await CarouselSlide.findByIdAndUpdate(
      req.params.id,
      { 
        isActive,
        updatedBy: req.user.userId
      },
      { new: true }
    ).populate('createdBy', 'username')
     .populate('updatedBy', 'username');

    if (!slide) {
      return res.status(404).json({ message: 'Carousel slide not found' });
    }

    res.json({
      message: `Carousel slide ${isActive ? 'activated' : 'deactivated'} successfully`,
      slide
    });
  } catch (error) {
    console.error('Error toggling carousel slide status:', error);
    res.status(500).json({ message: 'Failed to update carousel slide status' });
  }
};

// Reorder slides
exports.reorderSlides = async (req, res) => {
  try {
    // Check if user is admin or content manager
    if (!req.user.isAdmin && !req.user.isContentManager) {
      return res.status(403).json({ message: 'Access denied. Admin or Content Manager privileges required.' });
    }

    const { slideOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(slideOrders)) {
      return res.status(400).json({ message: 'slideOrders must be an array' });
    }

    const updatePromises = slideOrders.map(({ id, order }) => 
      CarouselSlide.findByIdAndUpdate(id, { 
        order, 
        updatedBy: req.user.userId 
      }, { new: true })
    );

    await Promise.all(updatePromises);

    const updatedSlides = await CarouselSlide.getAllSlidesForAdmin();

    res.json({
      message: 'Carousel slides reordered successfully',
      slides: updatedSlides
    });
  } catch (error) {
    console.error('Error reordering carousel slides:', error);
    res.status(500).json({ message: 'Failed to reorder carousel slides' });
  }
};
