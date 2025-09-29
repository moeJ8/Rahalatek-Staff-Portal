const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');

// Get all destinations with counts
exports.getDestinations = async (req, res) => {
    try {
        // Define all available countries
        const countries = [
            'Turkey', 'Malaysia', 'Thailand', 'Indonesia', 
            'Saudi Arabia', 'Morocco', 'Egypt', 'Azerbaijan', 
            'Georgia', 'Albania'
        ];

        // Get tour and hotel counts for each country
        const destinations = await Promise.all(
            countries.map(async (country) => {
                const [tourCount, hotelCount] = await Promise.all([
                    Tour.countDocuments({ country }),
                    Hotel.countDocuments({ country })
                ]);

                // Country code mapping for flags
                const countryCodeMap = {
                    'Turkey': 'TR',
                    'Malaysia': 'MY',
                    'Thailand': 'TH',
                    'Indonesia': 'ID',
                    'Saudi Arabia': 'SA',
                    'Morocco': 'MA',
                    'Egypt': 'EG',
                    'Azerbaijan': 'AZ',
                    'Georgia': 'GE',
                    'Albania': 'AL'
                };

                // Sample images for each country (you can replace with actual images)
                const countryImages = {
                    'Turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
                    'Malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop',
                    'Thailand': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                    'Indonesia': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
                    'Saudi Arabia': 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=400&h=300&fit=crop',
                    'Morocco': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop',
                    'Egypt': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop',
                    'Azerbaijan': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                    'Georgia': 'https://images.unsplash.com/photo-1576154421306-9ff4b57e4112?w=400&h=300&fit=crop',
                    'Albania': 'https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop'
                };

                return {
                    name: country,
                    code: countryCodeMap[country],
                    image: countryImages[country],
                    tourCount,
                    hotelCount,
                    totalCount: tourCount + hotelCount
                };
            })
        );

        // Filter out countries with no tours or hotels and sort by total count
        const activeDestinations = destinations
            .filter(dest => dest.totalCount > 0)
            .sort((a, b) => b.totalCount - a.totalCount);

        res.json(activeDestinations);
    } catch (err) {
        console.error('Error fetching destinations:', err);
        res.status(500).json({ message: err.message });
    }
};
