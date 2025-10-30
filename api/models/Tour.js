const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        trim: true,
        maxlength: [100, 'A tour name cannot exceed 100 characters']
    },
    // Translation fields (Arabic and French only - English is the base field)
    translations: {
        name: {
            ar: { type: String, default: '' },
            fr: { type: String, default: '' }
        },
        description: {
            ar: { type: String, default: '' },
            fr: { type: String, default: '' }
        },
        detailedDescription: {
            ar: { type: String, default: '' },
            fr: { type: String, default: '' }
        },
        highlights: [{
            ar: { type: String, default: '' },
            fr: { type: String, default: '' }
        }],
        policies: [{
            ar: { type: String, default: '' },
            fr: { type: String, default: '' }
        }],
        faqs: [{
            question: {
                ar: { type: String, default: '' },
                fr: { type: String, default: '' }
            },
            answer: {
                ar: { type: String, default: '' },
                fr: { type: String, default: '' }
            }
        }]
    },
    slug: { 
        type: String, 
        unique: true,
        lowercase: true,
        trim: true
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
            'Kota Kinabalu', 'Kuching', 'Cameron Highlands', 'Genting Highlands', 'Selangor',
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
            'Tirana', 'Durres', 'Vlore', 'Shkoder', 'Shkodra', 'Fier', 'Korce',
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
    totalPrice: {
        type: Number,
        default: 0
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
    
    policies: [{ 
        type: String 
    }],
    
    faqs: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    
    childrenPolicies: {
        under3: { type: String, default: 'Free' },
        above3: { type: String, default: 'Adult price' }
    },
    
    startDates: [Date],
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate slug from name before saving
tourSchema.pre('save', async function(next) {
    // Only auto-generate slug if no custom slug is provided and name is modified/new
    if ((this.isModified('name') || this.isNew) && (!this.slug || this.slug.trim() === '')) {
        let baseSlug = this.name
            .toLowerCase()
            .trim()
            // Replace Arabic and other non-Latin characters with transliteration or removal
            .replace(/[\u0621-\u064A\u0660-\u0669\u06F0-\u06F9]/g, (match) => {
                // Basic Arabic to Latin transliteration map
                const arabicMap = {
                    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
                    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
                    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
                    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
                    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
                    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
                    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
                    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
                    'ة': 'h', 'ء': '', 'ئ': 'i', 'ؤ': 'u'
                };
                return arabicMap[match] || '';
            })
            // Remove any remaining special characters except letters, numbers, spaces, and hyphens
            .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF-]/g, '')
            // Replace multiple spaces/underscores with single hyphens
            .replace(/[\s_-]+/g, '-')
            // Remove leading/trailing hyphens
            .replace(/^-+|-+$/g, '');
        
        // If slug is empty after processing, generate a fallback
        if (!baseSlug) {
            baseSlug = `tour-${Date.now()}`;
        }
        
        let slug = baseSlug;
        let counter = 1;
        
        // Check for existing slugs and append number if needed
        while (true) {
            const existingTour = await this.constructor.findOne({ 
                slug: slug,
                _id: { $ne: this._id } // Exclude current tour when updating
            });
            
            if (!existingTour) {
                break;
            }
            
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    
    // If a custom slug is provided, validate and ensure uniqueness
    if (this.isModified('slug') && this.slug && this.slug.trim() !== '') {
        let slug = this.slug.toLowerCase().trim();
        let counter = 1;
        
        // Check for existing slugs and append number if needed
        while (true) {
            const existingTour = await this.constructor.findOne({
                slug: slug,
                _id: { $ne: this._id } // Exclude current tour when updating
            });
            
            if (!existingTour) {
                break;
            }
            
            // Remove previous counter if exists, then add new one
            const baseSlug = this.slug.replace(/-\d+$/, '');
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
