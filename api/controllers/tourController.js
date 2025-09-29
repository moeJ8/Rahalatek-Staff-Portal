const Tour = require('../models/Tour');
const { invalidateDashboardCache } = require('../utils/redis');

// Get all tours
exports.getAllTours = async (req, res) => {
  try {
    const { country, city } = req.query;
    let query = {};
    
    // Filter by country if provided
    if (country) {
      query.country = country;
    }
    
    // Filter by city if provided
    if (city) {
      query.city = city;
    }
    
    // Sort by updatedAt in descending order (newest first)
    const tours = await Tour.find(query).sort({ updatedAt: -1 });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tours by city
exports.getToursByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const tours = await Tour.find({ city: { $regex: city, $options: 'i' } });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tours by country
exports.getToursByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const tours = await Tour.find({ country }).sort({ updatedAt: -1 });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cities by country for tours
exports.getTourCitiesByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const cities = await Tour.distinct('city', { country });
    res.status(200).json(cities.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all countries for tours
exports.getTourCountries = async (req, res) => {
  try {
    const countries = await Tour.distinct('country');
    res.status(200).json(countries.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tour by ID
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new tour
exports.addTour = async (req, res) => {
  try {
    // Check if user is authorized to add tours
    if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager) {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators, accountants, and content managers can add tours.' 
      });
    }

    const newTour = new Tour(req.body);
    const savedTour = await newTour.save();
    
    // Invalidate dashboard cache since tour count changed
    await invalidateDashboardCache('Tour added');
    
    res.status(201).json(savedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update tour
exports.updateTour = async (req, res) => {
  try {
    // Check if user is authorized to update tours
    if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager) {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators, accountants, and content managers can update tours.' 
      });
    }

    // Find the tour first
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Update the tour properties
    Object.assign(tour, req.body);
    
    // Save the tour - this will trigger the pre-save middleware to update slug
    const updatedTour = await tour.save();
    
    // Invalidate dashboard cache since tour data changed
    await invalidateDashboardCache('Tour updated');
    
    res.status(200).json(updatedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete tour
exports.deleteTour = async (req, res) => {
  try {
    // Check if user is authorized to delete tours
    if (!req.user.isAdmin && !req.user.isContentManager) {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators and content managers can delete tours.' 
      });
    }

    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Invalidate dashboard cache since tour count changed
    await invalidateDashboardCache('Tour deleted');
    
    res.status(200).json({ message: 'Tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public route - get tour by slug
exports.getTourBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const tour = await Tour.findOne({ slug: slug });
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Increment tour views
exports.incrementTourViews = async (req, res) => {
  try {
    const { slug } = req.params;
    const tour = await Tour.findOneAndUpdate(
      { slug: slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    res.json({ success: true, views: tour.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured tours (sorted by views)
exports.getFeaturedTours = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9; // Default to 9 for carousel (3 slides x 3 cards)
    const tours = await Tour.find({})
      .sort({ views: -1, updatedAt: -1 }) // Sort by views first, then by recent updates
      .limit(limit);
    
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};