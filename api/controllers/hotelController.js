const Hotel = require('../models/Hotel');
const {
    invalidateDashboardCache,
    invalidatePublicCache,
    featuredHotelsCache,
    hotelDetailsCache,
    allHotelsCache
} = require('../utils/redis');

// Helper function to translate a single hotel
const translateHotel = (hotel, lang) => {
  if (lang === 'en' || !hotel.translations) {
    return hotel.toObject ? hotel.toObject() : hotel;
  }

  const translations = hotel.translations;
  const translatedHotel = hotel.toObject ? hotel.toObject() : { ...hotel };

  // Helper function to get translated text or fallback to base
  const getTranslated = (baseValue, translationValue) => {
    return translationValue && translationValue.trim() ? translationValue : baseValue;
  };

  // Translate simple fields
  if (translations.description && translations.description[lang]) {
    translatedHotel.description = getTranslated(hotel.description, translations.description[lang]);
  }
  if (translations.locationDescription && translations.locationDescription[lang]) {
    translatedHotel.locationDescription = getTranslated(hotel.locationDescription, translations.locationDescription[lang]);
  }

  return translatedHotel;
};

// Helper function to translate multiple hotels
const translateHotels = (hotels, lang) => {
  return hotels.map(hotel => translateHotel(hotel, lang));
};

// Get all hotels (with optional pagination and search)
exports.getAllHotels = async (req, res) => {
  try {
    const { country, city, search, stars, page, limit, lang = 'en' } = req.query;
    
    let query = {};
    if (country) query.country = country;
    if (city) query.city = city;
    if (stars) query.stars = parseInt(stars);
    
    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { country: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // If NO pagination, return all hotels (backward compatible)
    if (!page && !limit) {
      if (!country && !city && !search && !stars) {
        const cachedHotels = await allHotelsCache.get();
        if (cachedHotels) {
          console.log('✅ Serving all hotels from Redis cache');
          const translatedHotels = translateHotels(cachedHotels, lang);
          return res.status(200).json(translatedHotels);
        }
      }
      
      console.log('🏨 Fetching all hotels from database...');
      const hotels = await Hotel.find(query).sort({ updatedAt: -1 });

      if (!country && !city && !search && !stars) {
        await allHotelsCache.set(hotels);
      }

      const translatedHotels = translateHotels(hotels, lang);
      return res.status(200).json(translatedHotels);
    }
    
    // PAGINATION MODE
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const skip = (pageNum - 1) * limitNum;
    
    const [hotels, totalHotels] = await Promise.all([
      Hotel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limitNum),
      Hotel.countDocuments(query)
    ]);

    const translatedHotels = translateHotels(hotels, lang);

    res.status(200).json({
      success: true,
      data: {
        hotels: translatedHotels,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalHotels / limitNum),
          totalHotels,
          hotelsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(totalHotels / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addHotel = async (req, res) => {
    try {
        // Check if user is authorized to add hotels
        if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({ 
                message: 'Access denied. Only administrators, accountants, content managers, and publishers can add hotels.' 
            });
        }

        const hotelData = {
            ...req.body,
            stars: Number(req.body.stars),
            roomTypes: req.body.roomTypes || [],
            transportationPrice: Number(req.body.transportationPrice),
            breakfastIncluded: Boolean(req.body.breakfastIncluded),
            breakfastPrice: req.body.breakfastPrice ? Number(req.body.breakfastPrice) : 0,
            airport: req.body.airport || null,
            country: req.body.country, // Add country field
            amenities: req.body.amenities || {} // Add amenities field
        };
        
        const hotel = new Hotel(hotelData);
        const newHotel = await hotel.save();
        
        // Invalidate dashboard cache since hotel count changed
        await invalidateDashboardCache('Hotel added');
        await invalidatePublicCache('hotels', newHotel.slug, 'Hotel added');
        
        res.status(201).json(newHotel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getHotelsByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const hotels = await Hotel.find({ city });
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Public route - get hotel by slug
exports.getHotelBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { lang = 'en' } = req.query;
        const hotel = await Hotel.findOne({ slug: slug });

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const translatedHotel = translateHotel(hotel, lang);
        res.json(translatedHotel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Increment hotel views
exports.incrementHotelViews = async (req, res) => {
    try {
        const { slug } = req.params;
        const hotel = await Hotel.findOneAndUpdate(
            { slug: slug },
            { $inc: { views: 1 } },
            { new: true }
        );
        
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        
        res.json({ success: true, views: hotel.views });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get featured hotels (sorted by views)
exports.getFeaturedHotels = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 9; // Default to 9 for carousel (3 slides x 3 cards)
        const { lang = 'en' } = req.query;

        // Check Redis cache first (only for default limit)
        if (limit === 9) {
            const cachedHotels = await featuredHotelsCache.get();
            if (cachedHotels) {
                console.log('✅ Serving featured hotels from Redis cache');
                const translatedHotels = translateHotels(cachedHotels, lang);
                return res.json(translatedHotels);
            }
        }

        console.log('🏨 Fetching fresh featured hotels...');
        const hotels = await Hotel.find({})
            .sort({ views: -1, updatedAt: -1 }) // Sort by views first, then by recent updates
            .limit(limit);

        // Cache the result (only for default limit)
        if (limit === 9) {
            await featuredHotelsCache.set(hotels);
        }

        const translatedHotels = translateHotels(hotels, lang);
        res.json(translatedHotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get hotels by country
exports.getHotelsByCountry = async (req, res) => {
    try {
        const { country } = req.params;
        const { lang = 'en' } = req.query;
        const hotels = await Hotel.find({ country }).sort({ updatedAt: -1 });
        const translatedHotels = translateHotels(hotels, lang);
        res.json(translatedHotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get cities by country
exports.getCitiesByCountry = async (req, res) => {
    try {
        const { country } = req.params;
        const cities = await Hotel.distinct('city', { country });
        res.json(cities.sort());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all countries
exports.getCountries = async (req, res) => {
    try {
        const countries = await Hotel.distinct('country');
        res.json(countries.sort());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getHotelById = async (req, res) => {
    try {
        const { lang = 'en' } = req.query;
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        const translatedHotel = translateHotel(hotel, lang);
        res.json(translatedHotel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update hotel
exports.updateHotel = async (req, res) => {
    try {
        // Check if user is authorized to update hotels
        if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({ 
                message: 'Access denied. Only administrators, accountants, content managers, and publishers can update hotels.' 
            });
        }

        const { id } = req.params;
        
        // Find the hotel first
        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        
        // Convert string fields to appropriate types and update the hotel
        Object.assign(hotel, {
            ...req.body,
            stars: Number(req.body.stars),
            roomTypes: req.body.roomTypes || [],
            transportationPrice: Number(req.body.transportationPrice),
            breakfastIncluded: Boolean(req.body.breakfastIncluded),
            breakfastPrice: req.body.breakfastPrice ? Number(req.body.breakfastPrice) : 0,
            airport: req.body.airport || null,
            country: req.body.country, // Add country field
            amenities: req.body.amenities || {} // Add amenities field
        });
        
        // Save the hotel - this will trigger the pre-save middleware to update slug
        const updatedHotel = await hotel.save();
        
        // Invalidate dashboard cache since hotel data changed
        await invalidateDashboardCache('Hotel updated');
        await invalidatePublicCache('hotels', updatedHotel.slug, 'Hotel updated');
        
        res.json(updatedHotel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete hotel
exports.deleteHotel = async (req, res) => {
    try {
        // Check if user is authorized to delete hotels
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({ 
                message: 'Access denied. Only administrators, content managers, and publishers can delete hotels.' 
            });
        }

        const hotel = await Hotel.findByIdAndDelete(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        
        // Invalidate dashboard cache since hotel count changed
        await invalidateDashboardCache('Hotel deleted');
        await invalidatePublicCache('hotels', hotel.slug, 'Hotel deleted');
        
        res.json({ message: 'Hotel deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; 