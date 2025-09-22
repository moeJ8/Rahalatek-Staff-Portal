const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        trim: true,
        maxlength: [100, 'A tour name cannot exceed 100 characters']
    },
    city: {
        type: String,
        required: [true, 'A tour must have a city'],
        trim: true,
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
        required: [true, 'A tour must have a country'],
        enum: ['Turkey', 'Malaysia', 'Thailand', 'Indonesia', 'Saudi Arabia', 'Morocco', 'Egypt', 'Azerbaijan', 'Georgia', 'Albania']
    },
    description: {
        type: String,
        trim: true
    },
    detailedDescription: { type: String },
    tourType: {
        type: String,
        required: [true, 'A tour must have a type'],
        enum: {
            values: ['Group', 'VIP'],
            message: 'Tour type must be either Group or VIP'
        }
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    vipCarType: {
        type: String,
        enum: {
            values: ['Vito', 'Sprinter'],
            message: 'VIP car type must be either Vito or Sprinter'
        },
        required: function() {
            return this.tourType === 'VIP';
        }
    },
    carCapacity: {
        type: {
            min: Number,
            max: Number
        },
        validate: {
            validator: function() {
                if (this.tourType !== 'VIP') return true;
                
                if (this.vipCarType === 'Vito') {
                    return this.carCapacity.min === 2 && this.carCapacity.max === 8;
                } else if (this.vipCarType === 'Sprinter') {
                    return this.carCapacity.min === 9 && this.carCapacity.max === 16;
                }
                return false;
            },
            message: 'Vito can accommodate 2-8 persons and Sprinter can accommodate 9-16 persons'
        },
        required: function() {
            return this.tourType === 'VIP';
        }
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
        default: 1 // Duration in hours
    },
    
    highlights: [{ 
        type: String 
    }],
    
    childrenPolicies: {
        under3: { type: String, default: 'Free' },
        above3: { type: String, default: 'Adult price' }
    },
    
    startDates: [Date],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
