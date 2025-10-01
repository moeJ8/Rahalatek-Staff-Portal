const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Package name is required'],
        trim: true,
        maxlength: [200, 'Package name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    countries: [{
        type: String,
        required: true,
        enum: ['Turkey', 'Malaysia', 'Thailand', 'Indonesia', 'Saudi Arabia', 'Morocco', 'Egypt', 'Azerbaijan', 'Georgia', 'Albania']
    }],
    cities: [{
        type: String,
        required: true
    }],
    duration: {
        type: Number,
        required: [true, 'Duration in days is required'],
        min: 1
    },
    hotels: [{
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true
        },
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date,
            required: true
        },
        roomTypes: [{
            roomTypeIndex: Number,
            quantity: { type: Number, default: 1 }
        }],
        includeBreakfast: {
            type: Boolean,
            default: true
        },
        selectedAirport: String,
        includeReception: {
            type: Boolean,
            default: true
        },
        includeFarewell: {
            type: Boolean,
            default: true
        },
        transportVehicleType: {
            type: String,
            enum: ['Vito', 'Sprinter', 'Bus'],
            default: 'Vito'
        }
    }],
    tours: [{
        tourId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
            required: true
        },
        day: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    transfers: [{
        type: {
            type: String,
            enum: ['Airport Reception', 'Airport Farewell', 'Inter-city', 'Hotel Transfer'],
            required: true
        },
        from: String,
        to: String,
        day: Number,
        vehicleType: {
            type: String,
            enum: ['Vito', 'Sprinter', 'Bus'],
            default: 'Vito'
        },
        price: {
            type: Number,
            default: 0
        }
    }],
    dailyItinerary: [{
        day: {
            type: Number,
            required: true,
            min: 1
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        activities: [String],
        meals: {
            breakfast: { type: Boolean, default: false },
            lunch: { type: Boolean, default: false },
            dinner: { type: Boolean, default: false }
        }
    }],
    includes: [{
        type: String,
        required: true
    }],
    excludes: [{
        type: String,
        required: true
    }],
    pricing: {
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            enum: ['USD', 'EUR', 'TRY'],
            default: 'USD'
        },
        priceBreakdown: {
            hotels: { type: Number, default: 0 },
            tours: { type: Number, default: 0 },
            transfers: { type: Number, default: 0 },
            breakfast: { type: Number, default: 0 },
            other: { type: Number, default: 0 }
        }
    },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    targetAudience: [{
        type: String,
        enum: ['Family', 'Couples', 'Solo Travelers', 'Groups', 'Business', 'Luxury', 'Budget'],
        required: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
packageSchema.pre('save', async function(next) {
    if ((this.isModified('name') || this.isNew) && (!this.slug || this.slug.trim() === '')) {
        let baseSlug = this.name
            .toLowerCase()
            .trim()
            .replace(/[\u0621-\u064A\u0660-\u0669\u06F0-\u06F9]/g, (match) => {
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
            .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        if (!baseSlug) {
            baseSlug = `package-${Date.now()}`;
        }
        
        let slug = baseSlug;
        let counter = 1;
        
        while (true) {
            const existingPackage = await this.constructor.findOne({ 
                slug: slug,
                _id: { $ne: this._id }
            });
            
            if (!existingPackage) {
                break;
            }
            
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    
    next();
});

// Virtual for total nights
packageSchema.virtual('totalNights').get(function() {
    return Math.max(0, this.duration - 1);
});

// Add the pagination plugin
packageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Package', packageSchema);
