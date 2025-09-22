const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    childrenPricePerNight: { type: Number, default: 0 },
    monthlyPrices: {
        january: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        february: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        march: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        april: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        may: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        june: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        july: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        august: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        september: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        october: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        november: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        },
        december: { 
            adult: { type: Number, default: 0 },
            child: { type: Number, default: 0 }
        }
    }
});

const airportTransportationSchema = new mongoose.Schema({
    airport: { type: String, required: true },
    transportation: {
        vitoReceptionPrice: { type: Number, default: 0 },
        vitoFarewellPrice: { type: Number, default: 0 },
        sprinterReceptionPrice: { type: Number, default: 0 },
        sprinterFarewellPrice: { type: Number, default: 0 },
        busReceptionPrice: { type: Number, default: 0 },
        busFarewellPrice: { type: Number, default: 0 }
    }
});

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { 
        type: String, 
        required: true,
        enum: [
            // Turkey - existing cities + Fethiye and Bursa
            'Istanbul', 'Antalya', 'Cappadocia', 'Trabzon', 'Bodrum', 'Fethiye', 'Bursa',
            // Malaysia
            'Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Johor Bahru',
            'Kota Kinabalu', 'Kuching', 'Cameron Highlands', 'Genting Highlands',
            // Thailand
            'Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi', 'Koh Samui',
            'Hua Hin', 'Ayutthaya', 'Chiang Rai', 'Kanchanaburi',
            // Indonesia
            'Jakarta', 'Bali', 'Yogyakarta', 'Bandung', 'Surabaya', 'Medan',
            'Lombok', 'Bogor', 'Malang', 'Solo', 'Ubud', 'Sanur', 'Seminyak',
            // Saudi Arabia
            'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 
            'Taif', 'Abha', 'Tabuk', 'Al Khobar',
            // Morocco
            'Casablanca', 'Marrakech', 'Rabat', 'Fez', 'Tangier', 'Agadir',
            'Meknes', 'Essaouira', 'Chefchaouen', 'Ouarzazate',
            // Egypt
            'Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh',
            'Dahab', 'Marsa Alam', 'Taba', 'Giza',
            // Azerbaijan
            'Baku', 'Ganja', 'Sumgayit', 'Mingachevir', 'Qabalah', 'Shaki',
            'Lankaran', 'Shamakhi', 'Quba', 'Gabala',
            // Georgia
            'Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Zugdidi', 'Gori',
            'Telavi', 'Mestia', 'Kazbegi', 'Sighnaghi', 'Mtskheta', 'Borjomi',
            // Albania
            'Tirana', 'Durres', 'Vlore', 'Shkoder', 'Fier', 'Korce',
            'Berat', 'Gjirokaster', 'Sarande', 'Kruje'
        ]
    },
    country: { 
        type: String, 
        required: true,
        enum: ['Turkey', 'Malaysia', 'Thailand', 'Indonesia', 'Saudi Arabia', 'Morocco', 'Egypt', 'Azerbaijan', 'Georgia', 'Albania']
    },
    stars: { type: Number, required: true },
    roomTypes: [roomTypeSchema],
    breakfastIncluded: { type: Boolean, required: true },
    breakfastPrice: { type: Number, default: 0 },
    airportTransportation: [airportTransportationSchema],
    airport: { type: String },
    transportation: {
        vitoReceptionPrice: { type: Number, default: 0 },
        vitoFarewellPrice: { type: Number, default: 0 },
        sprinterReceptionPrice: { type: Number, default: 0 },
        sprinterFarewellPrice: { type: Number, default: 0 },
        busReceptionPrice: { type: Number, default: 0 },
        busFarewellPrice: { type: Number, default: 0 }
    },
    description: { type: String },
    childrenPolicies: {
        under6: { type: String, default: 'Free' },
        age6to12: { type: String, default: 'Additional charge per room type' },
        above12: { type: String, default: 'Adult price' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);
