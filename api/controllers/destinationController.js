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

// Get cities for a specific country
exports.getCitiesByCountry = async (req, res) => {
    try {
        const { country } = req.params;
        
        // Curated city images from Cloudinary and Unsplash
        const cityImages = {
            // Turkey - Cloudinary hosted
            'Istanbul': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671115/istanbul_qjf5sz.jpg',
            'Antalya': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671118/antalya_oj1lza.jpg', 
            'Cappadocia': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671112/cappadocia_znntj1.jpg', 
            'Trabzon': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/trabzon_l7xlva.jpg', 
            'Bodrum': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671110/bodrum_tmgojf.jpg', 
            'Fethiye': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/fethiye_loarta.jpg', 
            'Bursa': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/bursa_ujwxsb.jpg',
            
            // Malaysia
            'Kuala Lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop&q=80',
            'Penang': 'https://images.unsplash.com/photo-1571200669781-0b701df0de68?w=400&h=300&fit=crop&q=80',
            'Langkawi': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80',
            'Malacca': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80',
            'Johor Bahru': 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop&q=80',
            'Kota Kinabalu': 'https://images.unsplash.com/photo-1596738012750-3707c22e4bb5?w=400&h=300&fit=crop&q=80',
            'Kuching': 'https://images.unsplash.com/photo-1586183778882-44e7b5c1e9a4?w=400&h=300&fit=crop&q=80',
            'Cameron Highlands': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/Tea_fields__Will_Ellis_gpprje.jpg',
            'Genting Highlands': 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=300&fit=crop&q=80',
            'Selangor': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/istockphoto-587901290-612x612_iqytp8.jpg',
            
            // Thailand
            'Bangkok': 'https://images.unsplash.com/photo-1563492065-4c9a4ed7c42d?w=400&h=300&fit=crop&q=80',
            'Phuket': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=300&fit=crop&q=80',
            'Pattaya': 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop&q=80',
            'Chiang Mai': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop&q=80',
            'Krabi': 'https://images.unsplash.com/photo-1552550049-db097c9480d1?w=400&h=300&fit=crop&q=80',
            'Koh Samui': 'https://images.unsplash.com/photo-1561461696-6e4b8bb1b3c1?w=400&h=300&fit=crop&q=80',
            'Hua Hin': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80',
            'Ayutthaya': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&q=80',
            'Chiang Rai': 'https://images.unsplash.com/photo-1598970605070-a9854a312e8f?w=400&h=300&fit=crop&q=80',
            'Kanchanaburi': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop&q=80',
            
            // Indonesia
            'Jakarta': 'https://images.unsplash.com/photo-1555980221-2b0f44fce7cf?w=400&h=300&fit=crop&q=80',
            'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop&q=80',
            'Yogyakarta': 'https://images.unsplash.com/photo-1595435742656-5272d0d4080f?w=400&h=300&fit=crop&q=80',
            'Bandung': 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=300&fit=crop&q=80',
            'Surabaya': 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&h=300&fit=crop&q=80',
            'Medan': 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=300&fit=crop&q=80',
            'Lombok': 'https://images.unsplash.com/photo-1517632287068-b1a5ba0fe8e6?w=400&h=300&fit=crop&q=80',
            'Bogor': 'https://images.unsplash.com/photo-1598968917050-0e6c7a39b5ab?w=400&h=300&fit=crop&q=80',
            'Malang': 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=300&fit=crop&q=80',
            'Solo': 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=300&fit=crop&q=80',
            'Ubud': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop&q=80',
            'Sanur': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80',
            'Seminyak': 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=300&fit=crop&q=80',
            
            // Saudi Arabia
            'Riyadh': 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=400&h=300&fit=crop&q=80',
            'Jeddah': 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=400&h=300&fit=crop&q=80',
            'Mecca': 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&h=300&fit=crop&q=80',
            'Medina': 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=400&h=300&fit=crop&q=80',
            'Dammam': 'https://images.unsplash.com/photo-1574482620223-1b1d50e8bcc7?w=400&h=300&fit=crop&q=80',
            'Khobar': 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80',
            'Taif': 'https://images.unsplash.com/photo-1562004340-d513bc476c0d?w=400&h=300&fit=crop&q=80',
            'Abha': 'https://images.unsplash.com/photo-1595435742656-5272d0d4080f?w=400&h=300&fit=crop&q=80',
            'Tabuk': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop&q=80',
            'Al Khobar': 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80',
            
            // Morocco
            'Casablanca': 'https://images.unsplash.com/photo-1560725252-9eb432d3db01?w=400&h=300&fit=crop&q=80',
            'Marrakech': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop&q=80',
            'Rabat': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=300&fit=crop&q=80',
            'Fez': 'https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80',
            'Tangier': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=300&fit=crop&q=80',
            'Agadir': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80',
            'Meknes': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80',
            'Essaouira': 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80',
            'Chefchaouen': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop&q=80',
            'Ouarzazate': 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=300&fit=crop&q=80',
            
            // Egypt
            'Cairo': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=300&fit=crop&q=80',
            'Alexandria': 'https://images.unsplash.com/photo-1574482620223-1b1d50e8bcc7?w=400&h=300&fit=crop&q=80',
            'Luxor': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop&q=80',
            'Aswan': 'https://images.unsplash.com/photo-1550053267-13a2e6b3eac4?w=400&h=300&fit=crop&q=80',
            'Hurghada': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80',
            'Sharm El Sheikh': 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80',
            'Dahab': 'https://images.unsplash.com/photo-1561461696-6e4b8bb1b3c1?w=400&h=300&fit=crop&q=80',
            'Marsa Alam': 'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400&h=300&fit=crop&q=80',
            'Taba': 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=300&fit=crop&q=80',
            'Giza': 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=400&h=300&fit=crop&q=80',
            
            // Azerbaijan
            'Baku': 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop&q=80',
            'Ganja': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80',
            'Sumgayit': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80',
            'Mingachevir': 'https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80',
            'Qabalah': 'https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80',
            'Shaki': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop&q=80',
            'Lankaran': 'https://images.unsplash.com/photo-1567202417690-a21b4b2cf7b3?w=400&h=300&fit=crop&q=80',
            'Shamakhi': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80',
            'Quba': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80',
            'Gabala': 'https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80',
            
            // Georgia
            'Tbilisi': 'https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&h=300&fit=crop&q=80',
            'Batumi': 'https://images.unsplash.com/photo-1576154421306-9ff4b57e4112?w=400&h=300&fit=crop&q=80',
            'Kutaisi': 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop&q=80',
            'Rustavi': 'https://images.unsplash.com/photo-1574482620223-1b1d50e8bcc7?w=400&h=300&fit=crop&q=80',
            'Zugdidi': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80',
            'Gori': 'https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80',
            'Telavi': 'https://images.unsplash.com/photo-1567202417690-a21b4b2cf7b3?w=400&h=300&fit=crop&q=80',
            'Mestia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80',
            'Kazbegi': 'https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80',
            'Sighnaghi': 'https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80',
            'Mtskheta': 'https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80',
            'Borjomi': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80',
            
            // Albania
            'Tirana': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840858/Sunset-at-Grand-Park-of-Tiranas-Artificial-Lake-scaled_m83m3k.jpg',
            'Durres': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80',
            'Vlore': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/albania_16x9_b92fhb.avif',
            'Shkoder': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/Shkodra-Scutari-Shkoder-Albania_gaxulo.jpg',
            'Shkodra': 'https://images.unsplash.com/photo-1571200669781-0b701df0de68?w=400&h=300&fit=crop&q=80',
            'Fier': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80',
            'Korce': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80',
            'Berat': 'https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80',
            'Gjirokaster': 'https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80',
            'Sarande': 'https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80',
            'Kruje': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80'
        };
        
        // Get unique cities from both tours and hotels for this country
        const [tourCities, hotelCities] = await Promise.all([
            Tour.distinct('city', { country }),
            Hotel.distinct('city', { country })
        ]);
        
        // Combine and deduplicate cities
        const allCities = [...new Set([...tourCities, ...hotelCities])];
        
        // Sort alphabetically
        const sortedCities = allCities.sort();
        
        // Get counts for each city
        const citiesWithCounts = await Promise.all(
            sortedCities.map(async (city) => {
                const [tourCount, hotelCount] = await Promise.all([
                    Tour.countDocuments({ country, city }),
                    Hotel.countDocuments({ country, city })
                ]);
                
                // Get curated Unsplash image for the city, or use a default
                const cityImage = cityImages[city] || 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=300&fit=crop&q=80';
                
                return {
                    name: city,
                    image: cityImage,
                    tourCount,
                    hotelCount,
                    totalCount: tourCount + hotelCount
                };
            })
        );
        
        // Sort by total count (most popular first)
        citiesWithCounts.sort((a, b) => b.totalCount - a.totalCount);
        
        res.json({
            country,
            cities: citiesWithCounts,
            totalCities: citiesWithCounts.length
        });
    } catch (err) {
        console.error('Error fetching cities for country:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get city details with description, history, and features
exports.getCityDetails = async (req, res) => {
    try {
        const { country, city } = req.params;
        
        // City data with tourism-focused descriptions and top attractions
        const cityData = {
            // ===== MALAYSIA ADDITIONS =====
            'Selangor': {
                country: 'Malaysia',
                description: 'Selangor surrounds Kuala Lumpur and blends modern attractions with nature getaways. Visit Batu Caves, Sunway Lagoon theme park, i-City Shah Alam, and royal town Klang; explore mangrove fireflies in Kuala Selangor and coffee shops in Petaling Jaya. Easy access, great shopping, and family fun make Selangor a perfect base near KL.',
                touristicFeatures: [
                    'Batu Caves - Iconic limestone cave temple with giant statue',
                    'Sunway Lagoon - Waterpark, amusement rides, and wildlife experiences',
                    'i-City Shah Alam - LED light city, Snowalk, and theme attractions',
                    'Sultan Salahuddin Mosque - Blue Mosque with massive dome',
                    'Kuala Selangor Fireflies - Night boat tours among glowing mangroves',
                    'Sky Mirror - Photogenic reflective sandbar experiences',
                    'Royal Klang Heritage Walk - Colonial architecture and food trail',
                    'Forest Research Institute (FRIM) - Rainforest trails and canopy walk',
                    'Petaling Jaya Cafes - Third-wave coffee and dining',
                    'Mitsui Outlet Park & Paradigm Mall - Shopping near KLIA and PJ'
                ]
            },

            // ===== ALBANIA ADDITIONS =====
            'Shkodra': {
                country: 'Albania',
                description: 'Shkodra (Shkodër) is Albania’s northern cultural hub between Lake Shkodra and the Albanian Alps. Explore Rozafa Castle, Venetian architecture, lakefront cycling, and nearby Theth and Valbona valleys. Bridges, museums, and authentic cuisine make Shkodra a perfect base for nature and history lovers.',
                touristicFeatures: [
                    'Rozafa Castle - Hilltop fortress with panoramic views',
                    'Lake Shkodra - Cycling paths, boat rides, and birdwatching',
                    'Mesi Bridge - Historic Ottoman stone bridge',
                    'Marubi National Museum of Photography - Heritage photo archive',
                    'Theth & Valbona Valleys - Albanian Alps hiking gateways',
                    'Venetian-style Architecture - Historic houses and streets',
                    'Shkodra Cathedral & Lead Mosque - Religious heritage sites',
                    'Lakefront Restaurants - Fresh fish and traditional cuisine',
                    'Shiroka & Zogaj - Lakeside villages near Shkodra',
                    'Cultural Events - Festivals and arts scene'
                ]
            },
            'Vlora': {
                country: 'Albania',
                description: 'Vlora (Vlorë) is where the Adriatic meets the Ionian—gateway to the Albanian Riviera. Enjoy beaches, Lungomare promenade, Sazan Island boat trips, Karaburun Peninsula, and Independence Square. Great seafood, coastal hotels, and nearby beaches make Vlora a prime summer destination.',
                touristicFeatures: [
                    'Lungomare Promenade - Waterfront walkway with cafes and beaches',
                    'Zvernec Monastery - Island monastery connected by wooden bridge',
                    'Karaburun-Sazan Marine Park - Boat tours and snorkeling',
                    'Independence Monument - Historic square and museum',
                    'Cold Water (Uji i Ftohte) - Scenic coastal lookout',
                    'Radhime & Orikum - Nearby beaches and resorts',
                    'Llogara Pass - Mountain road to Riviera with views',
                    'Castle of Kanine - Hilltop ruins overlooking Vlora',
                    'Boating & Sea Activities - Cruises and water sports',
                    'Seafood Restaurants - Fresh catch and Mediterranean cuisine'
                ]
            },
            // ===== TURKEY =====
            'Istanbul': {
                country: 'Turkey',
                description: 'Experience the magic where East meets West in Istanbul, the only city in the world spanning two continents. This magnificent metropolis offers an intoxicating blend of ancient history and modern sophistication. Start your days exploring Byzantine masterpieces like Hagia Sophia and the Blue Mosque, wander through the labyrinthine Grand Bazaar with its 4,000 shops, and marvel at the opulent Topkapi Palace where Ottoman sultans once ruled. Take a scenic Bosphorus cruise between Europe and Asia, watching waterfront palaces and fortresses glide by. As evening falls, head to Taksim Square and stroll down bustling Istiklal Avenue, lined with shops, restaurants, and historic tram. Enjoy rooftop bars with stunning skyline views, taste authentic Turkish cuisine from street vendors to Michelin-starred restaurants, and experience the legendary Turkish tea culture in charming cafés. Don\'t miss the mysterious Basilica Cistern, vibrant Spice Bazaar, contemporary art galleries in trendy Karaköy, and traditional hammam experiences. Whether you\'re shopping for handmade carpets, photographing breathtaking sunsets over the Golden Horn, or dancing in nightclubs until dawn, Istanbul delivers unforgettable memories at every turn. The city\'s warm hospitality, rich cultural tapestry, and perfect blend of tradition and modernity make it an essential destination for any traveler.',
                touristicFeatures: [
                    'Hagia Sophia - Stunning Byzantine masterpiece with impressive dome and mosaics',
                    'Blue Mosque - Magnificent Ottoman architecture with six soaring minarets',
                    'Topkapi Palace - Imperial palace with Treasury, Harem, and Bosphorus views',
                    'Grand Bazaar - 4,000 shops in world\'s oldest covered market',
                    'Bosphorus Cruise - Scenic boat tour between Europe and Asia',
                    'Galata Tower - 360° panoramic views of the city skyline',
                    'Basilica Cistern - Atmospheric underground water palace',
                    'Taksim Square & Istiklal Avenue - Shopping, dining, and nightlife hub',
                    'Dolmabahce Palace - Opulent waterfront palace with crystal staircases',
                    'Spice Bazaar - Aromatic market for Turkish delights and spices'
                ]
            },
            'Antalya': {
                country: 'Turkey',
                description: 'Welcome to Antalya, the crown jewel of Turkey\'s Mediterranean coast and gateway to the Turkish Riviera. Blessed with over 300 days of sunshine annually, this stunning coastal paradise combines crystal-clear turquoise waters, pristine beaches, and dramatic Taurus Mountains backdrop. Begin your adventure in Kaleiçi, the charming Old Town, where Ottoman-era houses, boutique hotels, and authentic restaurants line narrow cobblestone streets leading to the ancient Roman harbor. Spend sun-soaked days lounging on world-famous beaches like Konyaaltı and Lara, where modern beach clubs meet family-friendly shores. Adventure seekers can explore spectacular ancient ruins including the remarkably preserved Aspendos Theatre and the magnificent city of Perge. Cool off at the stunning Düden Waterfalls, which cascade dramatically into the Mediterranean Sea. Families love the Antalya Aquarium with its record-breaking tunnel, while thrill-seekers head to Land of Legends Theme Park for water slides and shows. Enjoy fresh Mediterranean seafood at harbor restaurants, shop in modern malls and traditional markets, and experience vibrant nightlife from beach bars to nightclubs. Take day trips to nearby attractions like mountain-top Termessos, the charming coastal town of Kaş, or the beautiful Kemer marina. With luxury all-inclusive resorts, budget-friendly hotels, excellent infrastructure, and warm Turkish hospitality, Antalya delivers the perfect Mediterranean vacation for every traveler and budget.',
                touristicFeatures: [
                    'Kaleiçi Old Town - Charming Ottoman quarter with boutique hotels and restaurants',
                    'Düden Waterfalls - Breathtaking cascades plunging into the Mediterranean Sea',
                    'Konyaaltı Beach - 7km pebble beach with Taurus Mountains backdrop',
                    'Lara Beach - Famous golden sand beach with luxury resorts',
                    'Antalya Aquarium - World\'s longest tunnel aquarium',
                    'Ancient Perge - Spectacular Greco-Roman city ruins',
                    'Aspendos Theatre - Best-preserved Roman amphitheater, hosts opera festivals',
                    'Land of Legends Theme Park - Family entertainment with water slides and shows',
                    'Termessos - Mountain-top ancient city with stunning views',
                    'Kemer Marina - Sailing, yacht tours, and waterfront dining'
                ]
            },
            'Cappadocia': {
                country: 'Turkey',
                description: 'Step into a fairy tale landscape in Cappadocia, one of Earth\'s most extraordinary destinations and a UNESCO World Heritage site. This otherworldly region features spectacular fairy chimneys, ancient cave dwellings, and surreal rock formations created by millions of years of volcanic activity and erosion. Wake before dawn for the experience of a lifetime—floating over the magical landscape in a hot air balloon as hundreds of colorful balloons drift across the sunrise sky, creating one of the world\'s most photographed scenes. Explore the incredible Göreme Open-Air Museum with its Byzantine rock-carved churches adorned with stunning frescoes dating back to the 10th century. Descend into fascinating underground cities like Derinkuyu, where ancient civilizations created elaborate 8-level subterranean complexes complete with churches, wine cellars, and ventilation systems. Stay in authentic cave hotels carved into the soft volcanic rock, offering modern luxury within ancient walls. Hike through spectacular valleys—Rose Valley with its pink-hued cliffs, Love Valley with unique formations, and Ihlara Valley\'s 14km gorge lined with rock churches. Experience traditional Turkish culture in the pottery town of Avanos, ride ATVs or horses through lunar landscapes, and enjoy spectacular Turkish Night shows with traditional dancing and music. Watch sunset from Uçhisar Castle, the region\'s highest point, offering panoramic views across this dreamlike terrain. With its unique cave accommodations, adventure activities, ancient heritage, and photogenic landscapes unlike anywhere on Earth, Cappadocia promises a truly magical Turkish experience.',
                touristicFeatures: [
                    'Hot Air Balloon Flights - Unforgettable sunrise balloon rides over fairy chimneys',
                    'Göreme Open-Air Museum - Ancient rock-carved churches with Byzantine frescoes',
                    'Derinkuyu Underground City - 8-level underground city reaching 85m depth',
                    'Love Valley - Unique rock formations and scenic hiking trails',
                    'Uçhisar Castle - Highest point with panoramic valley views',
                    'Cave Hotels - Sleep in luxurious converted cave dwellings',
                    'Ihlara Valley - 14km canyon with hiking trail and rock churches',
                    'Avanos - Pottery workshops and traditional Turkish crafts',
                    'ATV & Jeep Safaris - Adventure tours through valleys and rock formations',
                    'Turkish Night Shows - Traditional dance, music, and dinner entertainment'
                ]
            },
            'Trabzon': {
                country: 'Turkey',
                description: 'Discover Trabzon, where the emerald mountains of the Pontic Alps cascade dramatically to Turkey\'s spectacular Black Sea coast. This enchanting region offers a refreshing alternative to Turkey\'s beach resorts, with its cooler climate, lush green landscapes, and authentic Turkish mountain culture. The star attraction is the breathtaking Sumela Monastery, a 4th-century Greek Orthodox monastery seemingly suspended on a cliff face 1,200 meters above sea level—one of Turkey\'s most iconic and photographed sites. Journey to the picture-perfect Uzungöl, an alpine lake surrounded by dense pine forests and traditional wooden houses, where morning mist creates a mystical atmosphere. Experience the Ayder Plateau\'s natural hot springs and highland hospitality, where locals serve traditional Black Sea cuisine featuring fresh anchovies, cornbread, and local cheeses. Explore working tea plantations that blanket the hillsides in vibrant green, learning about Turkey\'s tea culture that rivals its coffee tradition. Visit the beautifully preserved Atatürk Pavilion mansion set in peaceful gardens, and discover Trabzon\'s Byzantine heritage at the 13th-century Hagia Sophia with its remarkable frescoes. Hike through highland plateaus like Zigana with spectacular mountain vistas, explore the ancient Trabzon Castle overlooking the city and sea, and enjoy fresh fish at seaside restaurants. The region\'s cooler summer temperatures, unspoiled nature, friendly locals, and off-the-beaten-path charm make Trabzon perfect for travelers seeking authentic Turkey away from mass tourism, offering genuine cultural experiences and stunning natural beauty.',
                touristicFeatures: [
                    'Sumela Monastery - Dramatic cliff-side monastery with stunning frescoes',
                    'Uzungöl Lake - Picture-perfect alpine lake surrounded by pine forests',
                    'Ayder Plateau - Mountain retreat with hot springs and hiking trails',
                    'Zigana Mountain - Scenic highland plateau with traditional villages',
                    'Atatürk Pavilion - Historic mansion set in beautiful gardens',
                    'Hagia Sophia of Trabzon - Byzantine church with remarkable frescoes',
                    'Trabzon Castle - Ancient fortress with city and sea views',
                    'Local Tea Plantations - Visit working tea gardens and taste fresh Turkish tea',
                    'Sera Lake - Tranquil lakeside parks and walking paths',
                    'Traditional Black Sea Cuisine - Sample unique local dishes and fresh fish'
                ]
            },
            'Bodrum': {
                country: 'Turkey',
                description: 'Welcome to Bodrum, Turkey\'s most glamorous and sophisticated resort destination on the stunning Aegean coast. This cosmopolitan peninsula perfectly balances ancient history with jet-set luxury, attracting celebrities, yachters, and discerning travelers seeking the ultimate Turkish coastal experience. The city\'s crown jewel is the magnificent Bodrum Castle, a 15th-century Knights Hospitaller fortress that now houses the world-renowned Museum of Underwater Archaeology. Explore the fascinating remains of the Mausoleum of Halicarnassus, one of the Seven Wonders of the Ancient World, and walk through the remarkably preserved ancient amphitheater with breathtaking sea views. Bodrum\'s coastline is dotted with pristine beaches and exclusive beach clubs—from the lively shores of Gümbet to the tranquil coves of Bitez, from the windsurf paradise of Türkbükü to the bohemian fishing village of Gümüşlük where you dine with your feet in the sand. The glittering marina is the heart of Bodrum\'s social scene, where superyachts dock alongside traditional gulets, and waterfront restaurants serve fresh Aegean seafood accompanied by rakı. Shop for designer fashion in chic boutiques, browse local markets for handmade leather sandals, and discover the iconic whitewashed windmills overlooking the peninsula. As night falls, Bodrum transforms into Turkey\'s party capital with world-class nightclubs, beach bars, and rooftop lounges. Take boat tours to hidden coves, nearby Greek islands, or swim in impossibly clear turquoise waters. With its perfect blend of 5-star luxury hotels, charming boutique properties, ancient culture, pristine beaches, and electric nightlife, Bodrum offers an unforgettable Aegean escape that satisfies history buffs, beach lovers, and party-goers alike.',
                touristicFeatures: [
                    'Bodrum Castle - Impressive medieval fortress with underwater archaeology museum',
                    'Ancient Mausoleum Site - Ruins of one of Seven Wonders of Ancient World',
                    'Bodrum Marina - Luxury yacht harbor with waterfront restaurants and bars',
                    'Bodrum Beaches - Pristine coves, beach clubs, and water sports',
                    'Gümbet - Popular beach resort with vibrant nightlife',
                    'Turgutreis - Long sandy beach with spectacular sunsets',
                    'Gümüşlük - Charming fishing village with seaside restaurants',
                    'Windmills of Bodrum - Iconic whitewashed windmills overlooking the sea',
                    'Boat Tours - Daily cruises to hidden bays and Greek islands',
                    'Shopping & Nightlife - Designer boutiques, bars, and beach clubs'
                ]
            },
            'Fethiye': {
                country: 'Turkey',
                description: 'Discover Fethiye, the gateway to Turkey\'s spectacular Turquoise Coast, where pine-clad mountains plunge into the crystal-clear Mediterranean Sea. This stunning region is home to Ölüdeniz, consistently rated among the world\'s most beautiful beaches, with its famous Blue Lagoon creating an Instagram-perfect paradise of turquoise and azure waters. Experience the adrenaline rush of paragliding from Babadağ Mountain—one of the world\'s premier tandem paragliding sites—soaring 1,960 meters above the coastline with breathtaking bird\'s-eye views of the lagoon and mountains. The ancient Lycians left their mark with impressive rock-cut tombs carved into the cliffs overlooking Fethiye harbor, creating a dramatic backdrop to the bustling marina filled with traditional wooden gulet boats. Take the iconic 12 Islands boat tour, spending a full day island-hopping to hidden swimming spots, snorkeling in pristine bays, and enjoying freshly grilled fish on board. Venture to the spectacular Butterfly Valley, a secluded canyon beach accessible only by boat, or cool off in Saklıkent Gorge, an 18-kilometer-long canyon where you can wade through icy mountain waters. Explore the haunting Kayaköy Ghost Village with its 500 abandoned stone houses, hike portions of the legendary Lycian Way coastal trail, and discover underwater wonders through world-class scuba diving. The charming town center buzzes with authentic Turkish life—traditional markets, family-run restaurants serving the day\'s catch, and lively fish market at the harbor. Experience laid-back beach life at Çalış Beach with spectacular sunsets, enjoy water sports from jet skiing to kitesurfing, and relax in boutique hotels and budget pensions. With its unbeatable combination of natural beauty, adventure activities, ancient culture, and genuine Turkish hospitality, Fethiye promises an authentic Mediterranean paradise.',
                touristicFeatures: [
                    'Ölüdeniz Blue Lagoon - World-famous turquoise beach and lagoon',
                    'Paragliding from Babadağ - Tandem flights with breathtaking coastal views',
                    'Butterfly Valley - Secluded beach canyon accessible by boat',
                    'Saklıkent Gorge - Dramatic 18km canyon for hiking and rafting',
                    'Lycian Rock Tombs - Ancient carved tombs overlooking the marina',
                    '12 Islands Boat Tour - Full-day cruise exploring hidden bays',
                    'Kayaköy Ghost Village - Abandoned Greek village with stone houses',
                    'Fethiye Marina - Waterfront promenade with restaurants and shopping',
                    'Çalış Beach - Long sandy beach with sunset views',
                    'Scuba Diving & Snorkeling - Explore rich Mediterranean marine life'
                ]
            },
            'Bursa': {
                country: 'Turkey',
                description: 'Experience Bursa, the birthplace of the Ottoman Empire and Turkey\'s most culturally rich city, magnificently situated at the foot of the majestic Uludağ Mountain. This historic treasure trove offers a perfect year-round destination—world-class skiing in winter and refreshing mountain retreats in summer. Bursa\'s Ottoman heritage shines through its stunning imperial mosques, particularly the Grand Mosque (Ulu Cami) with 20 domes and the exquisite Green Mosque and Green Tomb, showcasing the finest examples of early Ottoman architecture and intricate İznik tile work. The city is legendary for its therapeutic natural hot springs and traditional Turkish baths—relax in centuries-old hammams or modern thermal spa facilities, experiencing authentic wellness traditions passed down through generations. Take the spectacular Uludağ cable car journey, ascending from city level to alpine heights with breathtaking panoramic views. In winter, Uludağ National Park transforms into Turkey\'s premier ski resort with excellent slopes, modern lifts, and cozy mountain hotels. Summer brings hikers, mountain bikers, and nature lovers to the cool mountain air and scenic trails. Food enthusiasts flock to Bursa as the birthplace of İskender kebab—thin slices of döner meat served over pide bread with tomato sauce, yogurt, and melted butter—a must-try at historic restaurants that perfected the recipe. Explore the historic Silk Road heritage at the Silk Bazaar (Koza Han), where merchants have traded fine silk products for 600 years. Visit the UNESCO World Heritage village of Cumalıkızık, a perfectly preserved Ottoman village with traditional wooden houses and authentic village life. Stroll through beautiful parks and gardens, relax under the massive 600-year-old Inkaya Plane Tree, and enjoy the coastal charm of nearby Mudanya with its waterfront fish restaurants. With excellent shopping in modern malls and traditional markets, affordable prices, minimal crowds, and easy access from Istanbul, Bursa offers authentic Turkish culture, natural beauty, and historical significance without the tourist masses.',
                touristicFeatures: [
                    'Uludağ Mountain - Premier ski resort in winter, hiking paradise in summer',
                    'Historic Ottoman Mosques - Grand Mosque and Green Mosque with stunning tiles',
                    'Thermal Baths - Natural hot springs and traditional Turkish hammams',
                    'Bursa Cable Car - Scenic ride offering panoramic city and mountain views',
                    'Green Tomb - Iconic turquoise-tiled mausoleum in beautiful gardens',
                    'Silk Bazaar - Historic covered market for silk scarves and textiles',
                    'Cumalıkızık Village - UNESCO Ottoman village with traditional houses',
                    'İskender Kebab - Birthplace of famous Turkish dish',
                    'Inkaya Plane Tree - 600-year-old giant tree in peaceful park',
                    'Mudanya - Coastal town with fish restaurants and seaside promenade'
                ]
            },

            // ===== MALAYSIA =====
            'Kuala Lumpur': {
                country: 'Malaysia',
                description: 'Kuala Lumpur, Malaysia\'s dynamic capital, dazzles with futuristic skyscrapers, vibrant street markets, and diverse cultural heritage. Home to the iconic Petronas Twin Towers, world-class shopping malls, and incredible street food. Experience Malay, Chinese, and Indian cultures, explore colonial architecture, and enjoy tropical gardens in this cosmopolitan Southeast Asian hub.',
                touristicFeatures: [
                    'Petronas Twin Towers - Iconic 88-floor towers with skybridge and observation deck',
                    'Batu Caves - Hindu temple in limestone caves with giant golden statue',
                    'KL Tower - 421m tower offering 360° city views and revolving restaurant',
                    'Bukit Bintang - Premier shopping and entertainment district',
                    'Chinatown & Petaling Street - Bustling markets and authentic street food',
                    'KLCC Park - Urban oasis with fountains, walking paths, and tower views',
                    'Merdeka Square - Historic colonial buildings and Independence monument',
                    'Jalan Alor Food Street - Famous night market with hundreds of food stalls',
                    'Islamic Arts Museum - World-class collection of Islamic art and artifacts',
                    'Bird Park & Butterfly Park - Tropical wildlife experiences in city center'
                ]
            },
            'Penang': {
                country: 'Malaysia',
                description: 'Penang is Malaysia\'s culinary capital and UNESCO World Heritage site, famous for street art, colonial architecture, and incredible food. George Town\'s historic streets blend Chinese temples, Indian mosques, and British buildings. Beach resorts, spice gardens, tropical hills, and some of Asia\'s best street food make Penang unmissable.',
                touristicFeatures: [
                    'George Town - UNESCO heritage city with street art and colonial architecture',
                    'Street Food Paradise - Hawker centers serving char kway teow, laksa, and more',
                    'Penang Hill - Cable car to hilltop with panoramic island views',
                    'Kek Lok Si Temple - Largest Buddhist temple in Southeast Asia',
                    'Street Art Trail - Famous murals by Ernest Zacharevic and local artists',
                    'Batu Ferringhi Beach - Popular beach resort area with night market',
                    'Tropical Spice Garden - Beautiful gardens with exotic plants and cooking classes',
                    'Clan Jetties - Traditional Chinese water villages on stilts',
                    'Penang National Park - Beaches, jungle trails, and canopy walkways',
                    'Gurney Drive - Waterfront promenade with restaurants and shopping'
                ]
            },
            'Langkawi': {
                country: 'Malaysia',
                description: 'Langkawi is a tropical paradise of 99 islands in the Andaman Sea, offering pristine beaches, duty-free shopping, and natural wonders. Ride the world-famous SkyBridge, island-hop to hidden beaches, spot eagles, and relax at luxury resorts. Crystal-clear waters, jungle-covered mountains, and legendary folklore make Langkawi perfect for romantic getaways and family vacations.',
                touristicFeatures: [
                    'Langkawi Sky Bridge - Curved suspended bridge with panoramic jungle views',
                    'Cable Car to Mount Mat Cincang - Scenic ride to second-highest peak',
                    'Pantai Cenang - Main beach with resorts, restaurants, and water sports',
                    'Island Hopping Tours - Visit uninhabited islands, beaches, and snorkeling spots',
                    'Mangrove Kayaking - Paddle through ancient mangrove forests and caves',
                    'Eagle Square - Iconic landmark with 12m eagle statue at waterfront',
                    'Underwater World Langkawi - Large aquarium with marine life exhibits',
                    'Duty-Free Shopping - Tax-free chocolates, alcohol, and luxury goods',
                    'Kilim Geoforest Park - UNESCO geopark with limestone formations',
                    'Sunset Cruises - Romantic yacht tours with dinner and entertainment'
                ]
            },
            'Malacca': {
                country: 'Malaysia',
                description: 'Malacca is a living museum of Malaysia\'s colonial past, where Portuguese, Dutch, and British heritage meets vibrant Peranakan culture. Stroll along the historic river, visit colorful temples, explore museums in colonial buildings, and taste unique Nyonya cuisine. This UNESCO World Heritage city offers charming night markets, river cruises, and authentic cultural experiences.',
                touristicFeatures: [
                    'Jonker Street Night Market - Friday-Sunday market with antiques and street food',
                    'A Famosa Fort - 16th-century Portuguese fortress ruins',
                    'Christ Church & Dutch Square - Iconic red buildings from colonial era',
                    'Malacca River Cruise - Evening boat rides past street art and restaurants',
                    'Baba & Nyonya Heritage Museum - Peranakan culture and lifestyle exhibits',
                    'St. Paul\'s Hill - Ruins with panoramic city and sea views',
                    'Straits Chinese Jewelry Museum - Unique collection of Peranakan jewelry',
                    'Malacca Zoo - Night safari experiences with nocturnal animals',
                    'Nyonya Cuisine - Traditional Peranakan dishes blending Chinese and Malay flavors',
                    'Trishaw Tours - Decorated bicycle rickshaws with music and lights'
                ]
            },

            // ===== THAILAND =====
            'Bangkok': {
                country: 'Thailand',
                description: 'Bangkok captivates with golden temples, floating markets, rooftop bars, and legendary street food. Experience the Grand Palace\'s splendor, shop at massive malls and night markets, cruise the Chao Phraya River, and explore vibrant Chinatown. From ancient temples to modern skyscrapers, Bangkok offers non-stop energy, incredible food, and warm Thai hospitality.',
                touristicFeatures: [
                    'Grand Palace & Emerald Buddha - Thailand\'s most sacred temple complex',
                    'Wat Arun - Temple of Dawn with stunning riverside location',
                    'Wat Pho - Giant Reclining Buddha and traditional Thai massage school',
                    'Chatuchak Weekend Market - World\'s largest weekend market, 15,000+ stalls',
                    'Khao San Road - Backpacker hub with bars, restaurants, and street life',
                    'Chao Phraya River Cruise - Scenic boat tours past temples and palaces',
                    'Rooftop Bars - Sky-high cocktails with spectacular city views',
                    'Street Food Paradise - Pad Thai, mango sticky rice, and endless delicacies',
                    'Jim Thompson House - Traditional Thai architecture and silk museum',
                    'Floating Markets - Boat vendors selling food and crafts on canals'
                ]
            },
            'Phuket': {
                country: 'Thailand',
                description: 'Phuket, Thailand\'s largest island, is the ultimate tropical beach destination with stunning coastline, vibrant nightlife, and island adventures. From family-friendly Patong to serene Kata Beach, luxury resorts to budget hostels, Phuket offers something for everyone. Enjoy water sports, island hopping, elephant sanctuaries, and spectacular sunsets over the Andaman Sea.',
                touristicFeatures: [
                    'Patong Beach - Main beach with nightlife, shopping, and entertainment',
                    'Big Buddha - 45m white marble Buddha statue with panoramic views',
                    'Phi Phi Islands Day Trip - Snorkeling, beaches, and Maya Bay',
                    'Old Phuket Town - Sino-Portuguese architecture and colorful streets',
                    'Bangla Road - Famous nightlife street with bars and clubs',
                    'Phang Nga Bay - James Bond Island and sea kayaking',
                    'Kata & Karon Beaches - Family-friendly beaches with calm waters',
                    'Promthep Cape - Spectacular sunset viewpoint',
                    'Ethical Elephant Sanctuaries - No riding, ethical elephant interactions',
                    'Water Sports - Diving, snorkeling, jet skiing, and parasailing'
                ]
            },
            'Pattaya': {
                country: 'Thailand',
                description: 'Pattaya delivers action-packed beach resort fun just 2 hours from Bangkok. Enjoy water sports, cabaret shows, theme parks, and vibrant nightlife. Family attractions include aquarium, waterpark, and Floating Market. Golf courses, shopping malls, and island day trips complement beautiful beaches and energetic atmosphere.',
                touristicFeatures: [
                    'Walking Street - Famous nightlife strip with bars, clubs, and entertainment',
                    'Sanctuary of Truth - Intricate all-wood temple by the sea',
                    'Coral Islands - Boat trips for snorkeling and beach relaxation',
                    'Nong Nooch Tropical Garden - Beautifully landscaped gardens with cultural shows',
                    'Cartoon Network Amazone Waterpark - Family waterpark with slides and attractions',
                    'Art in Paradise - 3D interactive art museum',
                    'Pattaya Floating Market - Traditional Thai market on water',
                    'Underwater World - Aquarium with glass tunnel walkthrough',
                    'Cabaret Shows - World-famous transgender entertainment performances',
                    'Terminal 21 Pattaya - Themed shopping mall with airport design'
                ]
            },
            'Chiang Mai': {
                country: 'Thailand',
                description: 'Chiang Mai, the "Rose of the North," enchants with ancient temples, mountain scenery, and rich cultural traditions. Gateway to hill tribe villages, elephant sanctuaries, and jungle adventures. Famous for handicraft markets, cooking classes, meditation retreats, and the magical Yi Peng Lantern Festival. Cooler climate and laid-back atmosphere offer authentic Thai experiences.',
                touristicFeatures: [
                    'Old City Temples - 300+ Buddhist temples including Wat Phra Singh',
                    'Doi Suthep Temple - Mountain-top golden temple with city views',
                    'Night Bazaar - Extensive market for handicrafts, clothes, and souvenirs',
                    'Sunday Walking Street - Weekly market on historic Rachadamnoen Road',
                    'Ethical Elephant Sanctuaries - Feed and bathe rescued elephants',
                    'Thai Cooking Classes - Learn authentic Northern Thai cuisine',
                    'Doi Inthanon - Thailand\'s highest peak with waterfalls and nature trails',
                    'Hill Tribe Villages - Visit traditional Hmong and Karen communities',
                    'Monk Chat Programs - Learn about Buddhism and Thai culture',
                    'Massage & Spa - Traditional Thai massage and wellness retreats'
                ]
            },

            // ===== INDONESIA =====
            'Bali': {
                country: 'Indonesia',
                description: 'Bali is Indonesia\'s paradise island offering world-class surfing, stunning rice terraces, ancient temples, and spiritual retreats. From beach clubs in Seminyak to yoga studios in Ubud, volcano treks to temple ceremonies, Bali delivers magic at every turn. Enjoy warm hospitality, affordable luxury, incredible cuisine, and unforgettable sunsets over the Indian Ocean.',
                touristicFeatures: [
                    'Tanah Lot Temple - Iconic sea temple on rock formation at sunset',
                    'Ubud Rice Terraces - UNESCO heritage Tegallalang terraced paddies',
                    'Sacred Monkey Forest - Temple complex with playful monkeys',
                    'Water Temples - Tirta Empul holy spring and Uluwatu clifftop temple',
                    'Seminyak Beach Clubs - Luxury beachfront bars and restaurants',
                    'Mount Batur Sunrise Trek - Active volcano hike with breakfast at summit',
                    'Traditional Dance Performances - Kecak fire dance at Uluwatu Temple',
                    'Surfing Spots - World-class waves at Uluwatu, Canggu, and Kuta',
                    'Yoga & Wellness Retreats - Meditation, healing, and spiritual experiences',
                    'Balinese Cuisine - Cooking classes and authentic warungs'
                ]
            },
            'Jakarta': {
                country: 'Indonesia',
                description: 'Jakarta, Indonesia\'s bustling capital, is Southeast Asia\'s largest city offering modern skyline, historic Old Town, and vibrant culture. Shop at mega malls, explore museums, taste diverse Indonesian cuisine, and experience energetic nightlife. From traditional markets to luxury hotels, Jakarta provides urban excitement, business conveniences, and gateway to Indonesia\'s islands.',
                touristicFeatures: [
                    'National Monument (Monas) - 132m tower symbolizing Indonesian independence',
                    'Old Town (Kota Tua) - Dutch colonial buildings and museums',
                    'Grand Indonesia Mall - Massive shopping complex with international brands',
                    'Taman Mini Indonesia - Cultural park showcasing all Indonesian provinces',
                    'Thousand Islands - Day trips to tropical islands for snorkeling',
                    'Jakarta Cathedral & Istiqlal Mosque - Side-by-side symbols of religious harmony',
                    'Ancol Dreamland - Beach resort area with theme park and aquarium',
                    'SCBD Nightlife - Modern district with rooftop bars and clubs',
                    'Museum Nasional - Indonesian history, art, and cultural artifacts',
                    'Street Food Tours - Explore authentic Indonesian culinary diversity'
                ]
            },
            'Yogyakarta': {
                country: 'Indonesia',
                description: 'Yogyakarta is Java\'s cultural heart, home to magnificent Borobudur and Prambanan temple complexes. Center of Javanese arts, batik, traditional dance, and shadow puppets. Visit the Sultan\'s palace, shop for handicrafts, witness volcano sunrises, and explore cave temples. Affordable, authentic, and culturally rich, Yogya offers Indonesia\'s soul.',
                touristicFeatures: [
                    'Borobudur Temple - World\'s largest Buddhist monument, UNESCO World Heritage',
                    'Prambanan Temple - Spectacular Hindu temple complex with evening performances',
                    'Mount Merapi Jeep Tour - Active volcano adventure with lava museum',
                    'Kraton Sultan Palace - Living palace with traditional ceremonies',
                    'Malioboro Street - Shopping street for batik, souvenirs, and street food',
                    'Jomblang Cave - Rappel into vertical cave with heavenly light beam',
                    'Ramayana Ballet - Traditional dance performance at open-air theater',
                    'Batik Making Classes - Learn traditional wax-resist fabric dyeing',
                    'Timang Beach - Thrilling gondola ride over ocean waves',
                    'Kotagede Silver Village - Traditional silver crafts and workshops'
                ]
            },

            // ===== SAUDI ARABIA =====
            'Riyadh': {
                country: 'Saudi Arabia',
                description: 'Riyadh, Saudi Arabia\'s modern capital, blends futuristic architecture with deep cultural traditions. Experience luxury shopping malls, world-class restaurants, cutting-edge museums, and traditional souks. Visit historical Diriyah, explore the Edge of the World, and discover Saudi hospitality. The city offers authentic Arabian culture with modern conveniences and entertainment.',
                touristicFeatures: [
                    'Kingdom Centre Tower - Iconic skyscraper with Sky Bridge viewing platform',
                    'Edge of the World - Dramatic cliff formations with panoramic desert views',
                    'Diriyah - UNESCO site, birthplace of Saudi state with mud-brick architecture',
                    'National Museum - Comprehensive Saudi history and culture exhibitions',
                    'Riyadh Boulevard - Entertainment zone with restaurants, shows, and events',
                    'Al Masmak Fort - Historic fortress and museum in old city center',
                    'Souq Al Zal - Traditional market for carpets, antiques, and crafts',
                    'King Fahd Stadium - Sports events and concerts venue',
                    'Wadi Hanifah - Urban valley with parks, lakes, and walking trails',
                    'Saudi Cuisine - Traditional kabsa, mandi, and Arabic coffee experiences'
                ]
            },
            'Jeddah': {
                country: 'Saudi Arabia',
                description: 'Jeddah, the gateway to Mecca, is Saudi Arabia\'s cosmopolitan Red Sea port city. Explore historic Al-Balad with coral-stone buildings, dive the Red Sea\'s pristine coral reefs, stroll the world\'s longest corniche, and admire modern sculptures. International dining, luxury hotels, and beautiful seafront promenades make Jeddah Saudi Arabia\'s most liberal and welcoming city.',
                touristicFeatures: [
                    'Al-Balad Historic District - UNESCO site with traditional coral-stone houses',
                    'King Fahd Fountain - World\'s tallest fountain reaching 300m height',
                    'Jeddah Corniche - 30km waterfront promenade with beaches and cafes',
                    'Red Sea Diving - World-class coral reefs and marine life',
                    'Floating Mosque - Stunning mosque appearing to float on Red Sea',
                    'Jeddah Sculpture Museum - Open-air display of international artworks',
                    'Red Sea Mall - Premier shopping destination with international brands',
                    'Al-Shallal Theme Park - Amusement park with rides and ice skating',
                    'Tayebat Museum - Saudi history, culture, and Islamic art collection',
                    'Traditional Souks - Gold, spice, and textile markets'
                ]
            },

            // ===== MOROCCO =====
            'Marrakech': {
                country: 'Morocco',
                description: 'Marrakech enchants with labyrinthine souks, vibrant Jemaa el-Fnaa square, ornate palaces, and the iconic Koutoubia Mosque. Explore the medina\'s winding alleys, bargain for treasures, sip mint tea in riads, and experience snake charmers and street performers. Day trips to Atlas Mountains, camel rides, and hammam spas complete the Arabian Nights adventure.',
                touristicFeatures: [
                    'Jemaa el-Fnaa Square - UNESCO square with snake charmers, food stalls, entertainers',
                    'Majorelle Garden - Stunning blue garden created by Yves Saint Laurent',
                    'Bahia Palace - 19th-century palace with beautiful courtyards and tilework',
                    'Koutoubia Mosque - Iconic 77m minaret visible across the city',
                    'Medina Souks - Maze of markets selling spices, carpets, leather, and crafts',
                    'Ben Youssef Madrasa - Former Islamic college with intricate architecture',
                    'Traditional Hammam - Authentic Moroccan spa and massage experience',
                    'Saadian Tombs - Beautifully decorated 16th-century royal burial grounds',
                    'Atlas Mountains Day Trip - Berber villages and scenic mountain valleys',
                    'Agafay Desert - Camel rides, quad biking, and desert camps near city'
                ]
            },
            'Casablanca': {
                country: 'Morocco',
                description: 'Casablanca is Morocco\'s modern economic hub and largest city, blending Art Deco architecture, French colonial heritage, and Moroccan traditions. Visit the magnificent Hassan II Mosque rising from the Atlantic, stroll the oceanfront Corniche, explore the old medina, and experience cosmopolitan dining and nightlife. The city offers authentic Moroccan culture with metropolitan energy.',
                touristicFeatures: [
                    'Hassan II Mosque - World\'s 7th largest mosque with ocean-side minaret',
                    'Corniche Ain Diab - Beachfront promenade with restaurants and beach clubs',
                    'Rick\'s Café - Recreated bar from classic movie Casablanca',
                    'Old Medina - Traditional market area with authentic Moroccan atmosphere',
                    'Morocco Mall - Modern shopping with musical fountain and aquarium',
                    'Art Deco Architecture - French colonial buildings downtown',
                    'Villa des Arts - Contemporary art museum in beautiful mansion',
                    'Central Market - Fresh produce, spices, and local food hall',
                    'Mohammed V Square - Historic plaza with fountains and colonial buildings',
                    'Beach Clubs - Atlantic Ocean beach resorts and water sports'
                ]
            },

            // ===== EGYPT =====
            'Cairo': {
                country: 'Egypt',
                description: 'Cairo brings ancient history to life with the iconic Pyramids of Giza, Sphinx, and Egyptian Museum\'s treasures. Explore Islamic Cairo\'s medieval mosques, haggle in Khan el-Khalili bazaar, cruise the Nile at sunset, and taste authentic Egyptian cuisine. Africa\'s largest city offers 5,000 years of civilization, vibrant culture, and unforgettable monuments.',
                touristicFeatures: [
                    'Pyramids of Giza - Last standing Wonder of Ancient World with Great Pyramid',
                    'The Sphinx - Mysterious 4,500-year-old limestone guardian statue',
                    'Egyptian Museum - King Tut\'s treasures and mummies collection',
                    'Khan el-Khalili Bazaar - Historic market for souvenirs, spices, and jewelry',
                    'Islamic Cairo - Medieval mosques, madrasas, and city gates',
                    'Nile River Cruise - Dinner cruises with belly dancing and entertainment',
                    'Citadel of Saladin - Medieval fortress with Muhammad Ali Mosque',
                    'Coptic Cairo - Ancient Christian churches and Roman fortress',
                    'Saqqara Step Pyramid - Oldest stone pyramid, 4,700 years old',
                    'Sound & Light Show - Evening spectacle at the Pyramids'
                ]
            },
            'Luxor': {
                country: 'Egypt',
                description: 'Luxor is the world\'s greatest open-air museum, built on ancient Thebes. Marvel at Karnak Temple\'s massive columns, explore Valley of the Kings\' royal tombs, and witness colossal statues at Luxor Temple. Hot air balloon rides over temples at sunrise, felucca sails on the Nile, and horse-drawn carriage rides create magical experiences in this archaeologist\'s paradise.',
                touristicFeatures: [
                    'Valley of the Kings - Royal tombs including Tutankhamun\'s burial chamber',
                    'Karnak Temple - Massive temple complex with Great Hypostyle Hall',
                    'Luxor Temple - Illuminated ancient temple in city center',
                    'Hot Air Balloon Rides - Dawn flights over temples and the Nile',
                    'Temple of Hatshepsut - Dramatic terraced temple built into cliffs',
                    'Colossi of Memnon - Massive twin statues guarding temple ruins',
                    'Valley of the Queens - Royal wives and princes burial site',
                    'Nile Felucca Rides - Traditional sailboat cruises at sunset',
                    'Luxor Museum - Superb collection of ancient artifacts',
                    'Sound & Light Shows - Evening performances at Karnak Temple'
                ]
            },

            // ===== AZERBAIJAN =====
            'Baku': {
                country: 'Azerbaijan',
                description: 'Baku amazes with futuristic Flame Towers, UNESCO Old City, and Caspian Sea boulevards. Walk medieval cobblestone streets, admire modern architecture, visit ancient fire temples, and explore carpet museums. Experience Azerbaijan\'s oil-wealth transformation, traditional culture, and warm hospitality. The city offers European sophistication with Eastern mystique.',
                touristicFeatures: [
                    'Old City (Icherisheher) - UNESCO medieval walled city with Maiden Tower',
                    'Flame Towers - Iconic trio of skyscrapers with LED displays',
                    'Baku Boulevard - Long Caspian Sea promenade with parks and attractions',
                    'Heydar Aliyev Center - Futuristic Zaha Hadid-designed cultural center',
                    'Palace of the Shirvanshahs - 15th-century royal palace complex',
                    'Azerbaijan Carpet Museum - Traditional carpet weaving and displays',
                    'Gobustan Rock Art - Ancient petroglyphs and mud volcanoes nearby',
                    'Maiden Tower - Mysterious 12th-century tower with panoramic views',
                    'Fountains Square - Pedestrian area with cafes and shopping',
                    'Caspian Sea Beaches - Coastal resorts and waterfront dining'
                ]
            },

            // ===== GEORGIA =====
            'Tbilisi': {
                country: 'Georgia',
                description: 'Tbilisi charms with cobblestone Old Town, sulfur baths, wine culture, and legendary hospitality. Ride cable car to Narikala Fortress, explore eclectic architecture from medieval to Art Nouveau, taste khinkali dumplings and Georgian wine. The city offers affordable luxury, thriving art scene, natural hot springs, and warm, welcoming locals.',
                touristicFeatures: [
                    'Old Town (Dzveli Tbilisi) - Historic district with balconied houses',
                    'Narikala Fortress - Ancient fortress with cable car access and city views',
                    'Sulfur Baths District - Traditional Georgian bathhouses with natural hot springs',
                    'Rustaveli Avenue - Main boulevard with theaters, museums, and cafes',
                    'Georgian Wine Tasting - Sample ancient winemaking traditions and qvevri wines',
                    'Bridge of Peace - Modern glass pedestrian bridge over Mtkvari River',
                    'Mtatsminda Park - Hilltop amusement park with panoramic city views',
                    'Dry Bridge Market - Antiques, Soviet memorabilia, and art market',
                    'Traditional Georgian Feast (Supra) - Multi-course dining with toasts',
                    'Street Art & Cafes - Hipster neighborhoods with galleries and coffee culture'
                ]
            },
            'Batumi': {
                country: 'Georgia',
                description: 'Batumi is Georgia\'s Black Sea resort jewel with palm-lined boulevards, modern architecture, and beach vibes. Enjoy seaside promenade, botanical gardens, moving Ali & Nino statue, and vibrant nightlife. Perfect blend of beach relaxation, subtropical climate, fresh seafood, and Vegas-style entertainment. Summer playground for families, couples, and party-goers.',
                touristicFeatures: [
                    'Batumi Boulevard - 7km palm-lined promenade with beaches and attractions',
                    'Ali and Nino Statue - Moving 8m sculpture telling love story',
                    'Alphabetic Tower - Unique tower showcasing Georgian alphabet',
                    'Batumi Botanical Garden - Subtropical garden with exotic plants and sea views',
                    'Batumi Beaches - Pebble beaches with sun loungers and water sports',
                    'Batumi Dolphinarium - Shows with trained dolphins and seals',
                    'Cable Car to Anuria - Hilltop views of city and coastline',
                    'Piazza Square - Italian-style square with restaurants and live music',
                    'Casinos & Nightlife - Entertainment venues and beach clubs',
                    'Day Trips - Nearby waterfalls, mountain villages, and wine regions'
                ]
            },

            // ===== ALBANIA =====
            'Tirana': {
                country: 'Albania',
                description: 'Tirana surprises with colorful buildings, vibrant cafe culture, and fascinating communist history. Explore Skanderbeg Square, ride Dajti Mountain cable car, visit quirky museums, and enjoy affordable dining. Albania\'s capital offers authentic Balkans experience, friendly locals, and gateway to stunning Albanian Riviera. Perfect for budget travelers seeking undiscovered European destination.',
                touristicFeatures: [
                    'Skanderbeg Square - Central plaza with National History Museum',
                    'Bunk\'Art Museums - Communist-era bunkers converted to art spaces',
                    'Dajti Mountain Cable Car - Longest cable car in Balkans with mountain views',
                    'Grand Park & Artificial Lake - Green space for walking and paddle boats',
                    'Blloku District - Trendy neighborhood with bars, restaurants, and nightlife',
                    'Et\'hem Bey Mosque - Beautiful 18th-century mosque with frescoes',
                    'Pyramid of Tirana - Brutalist landmark hosting cultural events',
                    'Mount Dajti National Park - Hiking, panoramic views, and mountain resort',
                    'Traditional Albanian Cuisine - Tavë kosi, byrek, and raki tastings',
                    'Affordable Shopping - Boutiques, markets, and local crafts'
                ]
            },
            'Sarande': {
                country: 'Albania',
                description: 'Sarande is Albania\'s southern beach gem facing the Greek island of Corfu. Enjoy pristine beaches, ancient ruins, crystal-clear Ionian Sea, and vibrant waterfront promenade. Visit nearby Blue Eye spring, Butrint UNESCO site, and hillside villages. Perfect for beach lovers seeking Mediterranean beauty without crowds at fraction of Greece\'s prices.',
                touristicFeatures: [
                    'Ksamil Beaches - Postcard-perfect white sand beaches with turquoise water',
                    'Blue Eye Spring - Natural phenomenon with incredibly blue freshwater spring',
                    'Butrint National Park - UNESCO archaeological site with Greek and Roman ruins',
                    'Sarande Waterfront - Lively promenade with restaurants and bars',
                    'Lëkurësi Castle - Hilltop castle restaurant with sunset views',
                    'Boat Trips to Corfu - Day excursions to Greek island',
                    'Mirror Beach - Hidden beach with crystal-clear shallow waters',
                    'Syri i Kaltër - Diving and swimming in the Blue Eye',
                    'Seafood Restaurants - Fresh catch, Mediterranean cuisine, affordable prices',
                    'Albanian Riviera Beaches - Easy access to stunning southern coastline'
                ]
            }
        };
        
        const decodedCity = decodeURIComponent(city);
        const decodedCountry = decodeURIComponent(country);
        
        // Get city info or return default
        const cityInfo = cityData[decodedCity] || {
            country: decodedCountry,
            description: `${decodedCity} is a beautiful destination in ${decodedCountry}, offering unique experiences for travelers seeking authentic cultural encounters and stunning natural landscapes.`,
            touristicFeatures: [
                'Historic sites and cultural landmarks',
                'Local markets and authentic cuisine',
                'Natural beauty and scenic views',
                'Traditional arts and crafts',
                'Welcoming local hospitality'
            ]
        };
        
        // Get tour and hotel counts
        const [tourCount, hotelCount, tours, hotels] = await Promise.all([
            Tour.countDocuments({ country: decodedCountry, city: decodedCity }),
            Hotel.countDocuments({ country: decodedCountry, city: decodedCity }),
            Tour.find({ country: decodedCountry, city: decodedCity }).sort({ views: -1 }).limit(9),
            Hotel.find({ country: decodedCountry, city: decodedCity }).sort({ views: -1 }).limit(9)
        ]);
        
        // City images mapping (reuse from getCitiesByCountry)
        const cityImages = {
            'Istanbul': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671115/istanbul_qjf5sz.jpg',
            'Antalya': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671118/antalya_oj1lza.jpg',
            'Cappadocia': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671112/cappadocia_znntj1.jpg',
            'Trabzon': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/trabzon_l7xlva.jpg',
            'Bodrum': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671110/bodrum_tmgojf.jpg',
            'Fethiye': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/fethiye_loarta.jpg',
            'Bursa': 'https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/bursa_ujwxsb.jpg',
        };
        
        const cityImage = cityImages[decodedCity] || 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&h=600&fit=crop&q=80';
        
        res.json({
            name: decodedCity,
            country: decodedCountry,
            image: cityImage,
            ...cityInfo,
            tourCount,
            hotelCount,
            tours,
            hotels
        });
    } catch (err) {
        console.error('Error fetching city details:', err);
        res.status(500).json({ message: err.message });
    }
};