const Hotel = require('../models/Hotel');
const { 
    invalidateDashboardCache,
    invalidatePublicCache,
    featuredHotelsCache,
    hotelDetailsCache,
    allHotelsCache
} = require('../utils/redis');

exports.getAllHotels = async (req, res) => {
    try {
        const { country, city } = req.query;
        
        // Only cache when no filters (full list)
        if (!country && !city) {
            // Check Redis cache first
            const cachedHotels = await allHotelsCache.get();
            if (cachedHotels) {
                console.log('✅ Serving all hotels from Redis cache');
                return res.json(cachedHotels);
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
        
        console.log('🏨 Fetching hotels from database...');
        // Sort by updatedAt in descending order (newest first)
        const hotels = await Hotel.find(query).sort({ updatedAt: -1 });
        
        // Cache the result only if no filters (full list)
        if (!country && !city) {
            await allHotelsCache.set(hotels);
        }
        
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addHotel = async (req, res) => {
    try {
        // Check if user is authorized to add hotels
        if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager) {
            return res.status(403).json({ 
                message: 'Access denied. Only administrators, accountants, and content managers can add hotels.' 
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
        const hotel = await Hotel.findOne({ slug: slug });
        
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        
        res.json(hotel);
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
        
        // Check Redis cache first (only for default limit)
        if (limit === 9) {
            const cachedHotels = await featuredHotelsCache.get();
            if (cachedHotels) {
                console.log('✅ Serving featured hotels from Redis cache');
                return res.json(cachedHotels);
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
        
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get hotels by country
exports.getHotelsByCountry = async (req, res) => {
    try {
        const { country } = req.params;
        const hotels = await Hotel.find({ country }).sort({ updatedAt: -1 });
        res.json(hotels);
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
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        res.json(hotel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update hotel
exports.updateHotel = async (req, res) => {
    try {
        // Check if user is authorized to update hotels
        if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager) {
            return res.status(403).json({ 
                message: 'Access denied. Only administrators, accountants, and content managers can update hotels.' 
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
        if (!req.user.isAdmin && !req.user.isContentManager) {
            return res.status(403).json({ 
                message: 'Access denied. Only administrators and content managers can delete hotels.' 
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