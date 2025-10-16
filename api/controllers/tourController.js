const Tour = require('../models/Tour');
const { 
    invalidateDashboardCache,
    invalidatePublicCache,
    featuredToursCache,
    tourDetailsCache,
    allToursCache
} = require('../utils/redis');

// Get all tours
exports.getAllTours = async (req, res) => {
  try {
    const { country, city } = req.query;
    
    // Only cache when no filters (full list)
    if (!country && !city) {
      // Check Redis cache first
      const cachedTours = await allToursCache.get();
      if (cachedTours) {
        console.log('✅ Serving all tours from Redis cache');
        return res.status(200).json(cachedTours);
      }
    }
    
    let query = {};
    
    // Filter by country if provided
    if (country) {
      query.country = country;
    }
    
    // Filter by city if provided
    if (city) {
      query.city = city;
    }
    
    console.log('🗺️ Fetching tours from database...');
    // Sort by updatedAt in descending order (newest first)
    const tours = await Tour.find(query).sort({ updatedAt: -1 });
    
    // Cache the result only if no filters (full list)
    if (!country && !city) {
      await allToursCache.set(tours);
    }
    
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
    if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators, accountants, content managers, and publishers can add tours.' 
      });
    }

    const newTour = new Tour(req.body);
    const savedTour = await newTour.save();
    
    // Invalidate dashboard cache since tour count changed
    await invalidateDashboardCache('Tour added');
    await invalidatePublicCache('tours', savedTour.slug, 'Tour added');
    
    res.status(201).json(savedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update tour
exports.updateTour = async (req, res) => {
  try {
    // Check if user is authorized to update tours
    if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators, accountants, content managers, and publishers can update tours.' 
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
    await invalidatePublicCache('tours', updatedTour.slug, 'Tour updated');
    
    res.status(200).json(updatedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete tour
exports.deleteTour = async (req, res) => {
  try {
    // Check if user is authorized to delete tours
    if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators, content managers, and publishers can delete tours.' 
      });
    }

    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Invalidate dashboard cache since tour count changed
    await invalidateDashboardCache('Tour deleted');
    await invalidatePublicCache('tours', tour.slug, 'Tour deleted');
    
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
    
    // Check Redis cache first (only for default limit)
    if (limit === 9) {
        const cachedTours = await featuredToursCache.get();
        if (cachedTours) {
            console.log('✅ Serving featured tours from Redis cache');
            return res.json(cachedTours);
        }
    }

    console.log('🗺️ Fetching fresh featured tours...');
    const tours = await Tour.find({})
      .sort({ views: -1, updatedAt: -1 }) // Sort by views first, then by recent updates
      .limit(limit);
    
    // Cache the result (only for default limit)
    if (limit === 9) {
        await featuredToursCache.set(tours);
    }
    
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};