const Tour = require('../models/Tour');
const { 
    invalidateDashboardCache,
    invalidatePublicCache,
    featuredToursCache,
    tourDetailsCache,
    allToursCache
} = require('../utils/redis');

// Helper function to translate a single tour
const translateTour = (tour, lang) => {
  const tourObj = tour.toObject ? tour.toObject() : { ...tour };
  
  if (lang === 'en' || !tourObj.translations) {
    return tourObj;
  }

  const translations = tourObj.translations;

  // Helper function to get translated text or fallback to base
  const getTranslated = (baseValue, translationValue) => {
    return translationValue && translationValue.trim() ? translationValue : baseValue;
  };

  // Helper function for arrays
  const getTranslatedArray = (baseArray, translationArray) => {
    if (!translationArray || translationArray.length === 0) return baseArray;

    return baseArray.map((item, index) => {
      if (index < translationArray.length) {
        const translated = translationArray[index][lang];
        return getTranslated(item, translated);
      }
      return item;
    });
  };

  // Translate simple fields
  if (translations.name && translations.name[lang]) {
    tourObj.name = getTranslated(tourObj.name, translations.name[lang]);
  }
  if (translations.description && translations.description[lang]) {
    tourObj.description = getTranslated(tourObj.description, translations.description[lang]);
  }
  if (translations.detailedDescription && translations.detailedDescription[lang]) {
    tourObj.detailedDescription = getTranslated(tourObj.detailedDescription, translations.detailedDescription[lang]);
  }

  // Translate arrays
  if (translations.highlights && translations.highlights.length > 0 && tourObj.highlights) {
    tourObj.highlights = getTranslatedArray(tourObj.highlights, translations.highlights);
  }
  if (translations.policies && translations.policies.length > 0 && tourObj.policies) {
    tourObj.policies = getTranslatedArray(tourObj.policies, translations.policies);
  }

  // Translate FAQs
  if (translations.faqs && translations.faqs.length > 0 && tourObj.faqs) {
    tourObj.faqs = tourObj.faqs.map((faq, index) => {
      if (index < translations.faqs.length) {
        const translatedFaq = translations.faqs[index];
        return {
          question: getTranslated(faq.question, translatedFaq.question?.[lang]),
          answer: getTranslated(faq.answer, translatedFaq.answer?.[lang])
        };
      }
      return faq;
    });
  }

  // Keep translations object in response for frontend use
  tourObj.translations = translations;

  return tourObj;
};

// Helper function to translate multiple tours
const translateTours = (tours, lang) => {
  return tours.map(tour => translateTour(tour, lang));
};

// Get all tours (with optional pagination and search)
exports.getAllTours = async (req, res) => {
  try {
    const { country, city, search, tourType, page, limit, lang = 'en' } = req.query;
    
    let query = {};
    if (country) query.country = country;
    if (city) query.city = city;
    if (tourType) query.tourType = tourType;
    
    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { country: searchRegex },
        { description: searchRegex },
        { highlights: searchRegex }
      ];
    }
    
    // If NO pagination, return all tours (backward compatible)
    if (!page && !limit) {
      if (!country && !city && !search && !tourType) {
        const cachedTours = await allToursCache.get();
        if (cachedTours) {
          console.log('✅ Serving all tours from Redis cache');
          const translatedTours = translateTours(cachedTours, lang);
          return res.status(200).json(translatedTours);
        }
      }
      
      console.log('🗺️ Fetching all tours from database...');
      const tours = await Tour.find(query).sort({ updatedAt: -1 });
      
      if (!country && !city && !search && !tourType) {
        // Only cache English tours
        const englishTours = tours.map(tour => tour.toObject());
        await allToursCache.set(englishTours);
      }
      
      const translatedTours = translateTours(tours, lang);
      return res.status(200).json(translatedTours);
    }
    
    // PAGINATION MODE
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const skip = (pageNum - 1) * limitNum;
    
    const [tours, totalTours] = await Promise.all([
      Tour.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limitNum),
      Tour.countDocuments(query)
    ]);
    
    const translatedTours = translateTours(tours, lang);
    
    res.status(200).json({
      success: true,
      data: {
        tours: translatedTours,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalTours / limitNum),
          totalTours,
          toursPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(totalTours / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
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
    const { lang = 'en' } = req.query; // Get language from query parameter, default to 'en'
    
    const tour = await Tour.findOne({ slug: slug });
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Translate the tour using the helper function
    const translatedTour = translateTour(tour, lang);
    
    res.json(translatedTour);
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
    const { lang = 'en' } = req.query; // Get language from query parameter, default to 'en'
    
    // Check Redis cache first (only for default limit)
    if (limit === 9) {
        const cachedTours = await featuredToursCache.get();
        if (cachedTours) {
            console.log('✅ Serving featured tours from Redis cache');
            const translatedTours = translateTours(cachedTours, lang);
            return res.json(translatedTours);
        }
    }

    console.log('🗺️ Fetching fresh featured tours...');
    const tours = await Tour.find({})
      .sort({ views: -1, updatedAt: -1 }) // Sort by views first, then by recent updates
      .limit(limit);
    
    // Cache the result (only for default limit) - only cache English tours
    if (limit === 9) {
        const englishTours = tours.map(tour => tour.toObject());
        await featuredToursCache.set(englishTours);
    }
    
    const translatedTours = translateTours(tours, lang);
    res.json(translatedTours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};