const YoutubeShort = require('../models/YoutubeShort');

// Get all YouTube Shorts for admin
exports.getAllShorts = async (req, res) => {
  try {
    const shorts = await YoutubeShort.getAllShortsForAdmin();
    res.status(200).json(shorts);
  } catch (error) {
    console.error('Error fetching YouTube Shorts:', error);
    res.status(500).json({ message: 'Failed to fetch YouTube Shorts', error: error.message });
  }
};

// Get active YouTube Shorts for public display
exports.getActiveShorts = async (req, res) => {
  try {
    const shorts = await YoutubeShort.getActiveShorts();
    res.status(200).json(shorts);
  } catch (error) {
    console.error('Error fetching active YouTube Shorts:', error);
    res.status(500).json({ message: 'Failed to fetch YouTube Shorts', error: error.message });
  }
};

// Get single YouTube Short by ID
exports.getShortById = async (req, res) => {
  try {
    const { id } = req.params;
    const short = await YoutubeShort.findById(id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');
    
    if (!short) {
      return res.status(404).json({ message: 'YouTube Short not found' });
    }
    
    res.status(200).json(short);
  } catch (error) {
    console.error('Error fetching YouTube Short:', error);
    res.status(500).json({ message: 'Failed to fetch YouTube Short', error: error.message });
  }
};

// Create new YouTube Short
exports.createShort = async (req, res) => {
  try {
    const { title, description, youtubeUrl, order, isActive } = req.body;
    
    // Validate required fields
    if (!title || !youtubeUrl) {
      return res.status(400).json({ message: 'Title and YouTube URL are required' });
    }
    
    const newShort = new YoutubeShort({
      title,
      description,
      youtubeUrl,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.userId
    });
    
    await newShort.save();
    
    const populatedShort = await YoutubeShort.findById(newShort._id)
      .populate('createdBy', 'username');
    
    res.status(201).json({
      message: 'YouTube Short created successfully',
      short: populatedShort
    });
  } catch (error) {
    console.error('Error creating YouTube Short:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message || 'Validation failed',
        error: error.message 
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      message: error.message || 'Failed to create YouTube Short',
      error: error.message 
    });
  }
};

// Update YouTube Short
exports.updateShort = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, youtubeUrl, order, isActive } = req.body;
    
    const short = await YoutubeShort.findById(id);
    
    if (!short) {
      return res.status(404).json({ message: 'YouTube Short not found' });
    }
    
    // Update fields
    if (title !== undefined) short.title = title;
    if (description !== undefined) short.description = description;
    if (youtubeUrl !== undefined) short.youtubeUrl = youtubeUrl;
    if (order !== undefined) short.order = order;
    if (isActive !== undefined) short.isActive = isActive;
    short.updatedBy = req.user.userId;
    
    await short.save();
    
    const updatedShort = await YoutubeShort.findById(id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');
    
    res.status(200).json({
      message: 'YouTube Short updated successfully',
      short: updatedShort
    });
  } catch (error) {
    console.error('Error updating YouTube Short:', error);
    res.status(500).json({ message: 'Failed to update YouTube Short', error: error.message });
  }
};

// Delete YouTube Short
exports.deleteShort = async (req, res) => {
  try {
    const { id } = req.params;
    
    const short = await YoutubeShort.findByIdAndDelete(id);
    
    if (!short) {
      return res.status(404).json({ message: 'YouTube Short not found' });
    }
    
    res.status(200).json({ message: 'YouTube Short deleted successfully' });
  } catch (error) {
    console.error('Error deleting YouTube Short:', error);
    res.status(500).json({ message: 'Failed to delete YouTube Short', error: error.message });
  }
};

// Reorder YouTube Shorts
exports.reorderShorts = async (req, res) => {
  try {
    const { shorts } = req.body; // Array of { id, order }
    
    if (!Array.isArray(shorts)) {
      return res.status(400).json({ message: 'Invalid request format' });
    }
    
    // Update order for each short
    const updatePromises = shorts.map(item => 
      YoutubeShort.findByIdAndUpdate(
        item.id,
        { order: item.order, updatedBy: req.user.userId },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    const updatedShorts = await YoutubeShort.getAllShortsForAdmin();
    
    res.status(200).json({
      message: 'YouTube Shorts reordered successfully',
      shorts: updatedShorts
    });
  } catch (error) {
    console.error('Error reordering YouTube Shorts:', error);
    res.status(500).json({ message: 'Failed to reorder YouTube Shorts', error: error.message });
  }
};

// Increment views (for public access)
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    
    const short = await YoutubeShort.findById(id);
    
    if (!short) {
      return res.status(404).json({ message: 'YouTube Short not found' });
    }
    
    await short.incrementViews();
    
    res.status(200).json({ message: 'View count updated', views: short.views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ message: 'Failed to update view count', error: error.message });
  }
};

