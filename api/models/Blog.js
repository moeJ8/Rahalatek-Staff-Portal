const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Blog title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    originalLanguage: {
        type: String,
        enum: ['en', 'ar', 'fr'],
        default: 'ar'
    },
    category: {
        type: String,
        required: [true, 'Blog category is required'],
        enum: [
            // Turkey
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
            'Berat', 'Gjirokaster', 'Sarande', 'Kruje',
            // General categories
            'Travel Tips', 'Culture', 'Food & Dining', 'Adventure', 'Luxury Travel',
            'Budget Travel', 'Family Travel', 'Solo Travel', 'Business Travel', 'General'
        ]
    },
    country: {
        type: String,
        enum: ['Turkey', 'Malaysia', 'Thailand', 'Indonesia', 'Saudi Arabia', 'Morocco', 'Egypt', 'Azerbaijan', 'Georgia', 'Albania', 'General']
    },
    excerpt: {
        type: String,
        trim: true,
        maxlength: [300, 'Excerpt cannot exceed 300 characters']
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
    },
    mainImage: {
        url: {
            type: String,
            required: [true, 'Main image is required']
        },
        publicId: {
            type: String,
            required: true
        },
        altText: {
            type: String,
            default: ''
        }
    },
    // SEO fields
    metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description should not exceed 160 characters']
    },
    metaKeywords: [{
        type: String,
        trim: true
    }],
    // Author information
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Publishing information
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },
    // Engagement metrics
    views: {
        type: Number,
        default: 0
    },
    whatsappClicks: {
        type: Number,
        default: 0
    },
    // Daily WhatsApp click counters: { 'YYYY-MM-DD': Number }
    clicksByDate: {
        type: Map,
        of: Number,
        default: new Map()
    },
    // Featured flag
    isFeatured: {
        type: Boolean,
        default: false
    },
    // Tags for additional categorization
    tags: [{
        type: String,
        trim: true
    }],
    // Reading time estimate (in minutes)
    readingTime: {
        type: Number,
        default: 0
    },
    // Translations for multilingual content
    translations: {
        title: {
            type: Map,
            of: String,
            default: new Map()
        },
        excerpt: {
            type: Map,
            of: String,
            default: new Map()
        },
        content: {
            type: Map,
            of: String,
            default: new Map()
        },
        metaDescription: {
            type: Map,
            of: String,
            default: new Map()
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate slug from title before saving
blogSchema.pre('save', async function(next) {
    // Only auto-generate slug if no custom slug is provided and title is modified/new
    if ((this.isModified('title') || this.isNew) && (!this.slug || this.slug.trim() === '')) {
        let baseSlug = this.title
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
            baseSlug = `blog-${Date.now()}`;
        }
        
        let slug = baseSlug;
        let counter = 1;
        
        // Check for existing slugs and append number if needed
        while (true) {
            const existingBlog = await this.constructor.findOne({ 
                slug: slug,
                _id: { $ne: this._id } // Exclude current blog when updating
            });
            
            if (!existingBlog) {
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
            const existingBlog = await this.constructor.findOne({
                slug: slug,
                _id: { $ne: this._id } // Exclude current blog when updating
            });
            
            if (!existingBlog) {
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

// Calculate reading time before saving (based on average reading speed of 200 words per minute)
blogSchema.pre('save', function(next) {
    if (this.isModified('content')) {
        // Remove HTML tags and count words
        const plainText = this.content.replace(/<[^>]*>/g, '');
        const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
        this.readingTime = Math.ceil(wordCount / 200);
    }
    next();
});

// Auto-set publishedAt when status changes to published
blogSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

// Determine country from category
blogSchema.pre('save', function(next) {
    const cityToCountry = {
        // Turkey
        'Istanbul': 'Turkey', 'Antalya': 'Turkey', 'Cappadocia': 'Turkey', 'Trabzon': 'Turkey', 
        'Bodrum': 'Turkey', 'Fethiye': 'Turkey', 'Bursa': 'Turkey',
        // Malaysia
        'Kuala Lumpur': 'Malaysia', 'Penang': 'Malaysia', 'Langkawi': 'Malaysia', 'Malacca': 'Malaysia',
        'Johor Bahru': 'Malaysia', 'Kota Kinabalu': 'Malaysia', 'Kuching': 'Malaysia',
        'Cameron Highlands': 'Malaysia', 'Genting Highlands': 'Malaysia',
        // Thailand
        'Bangkok': 'Thailand', 'Phuket': 'Thailand', 'Pattaya': 'Thailand', 'Chiang Mai': 'Thailand',
        'Krabi': 'Thailand', 'Koh Samui': 'Thailand', 'Hua Hin': 'Thailand', 'Ayutthaya': 'Thailand',
        'Chiang Rai': 'Thailand', 'Kanchanaburi': 'Thailand',
        // Indonesia
        'Jakarta': 'Indonesia', 'Bali': 'Indonesia', 'Yogyakarta': 'Indonesia', 'Bandung': 'Indonesia',
        'Surabaya': 'Indonesia', 'Medan': 'Indonesia', 'Lombok': 'Indonesia', 'Bogor': 'Indonesia',
        'Malang': 'Indonesia', 'Solo': 'Indonesia', 'Ubud': 'Indonesia', 'Sanur': 'Indonesia', 'Seminyak': 'Indonesia',
        // Saudi Arabia
        'Riyadh': 'Saudi Arabia', 'Jeddah': 'Saudi Arabia', 'Mecca': 'Saudi Arabia', 'Medina': 'Saudi Arabia',
        'Dammam': 'Saudi Arabia', 'Khobar': 'Saudi Arabia', 'Taif': 'Saudi Arabia', 'Abha': 'Saudi Arabia',
        'Tabuk': 'Saudi Arabia', 'Al Khobar': 'Saudi Arabia',
        // Morocco
        'Casablanca': 'Morocco', 'Marrakech': 'Morocco', 'Rabat': 'Morocco', 'Fez': 'Morocco',
        'Tangier': 'Morocco', 'Agadir': 'Morocco', 'Meknes': 'Morocco', 'Essaouira': 'Morocco',
        'Chefchaouen': 'Morocco', 'Ouarzazate': 'Morocco',
        // Egypt
        'Cairo': 'Egypt', 'Alexandria': 'Egypt', 'Luxor': 'Egypt', 'Aswan': 'Egypt',
        'Hurghada': 'Egypt', 'Sharm El Sheikh': 'Egypt', 'Dahab': 'Egypt', 'Marsa Alam': 'Egypt',
        'Taba': 'Egypt', 'Giza': 'Egypt',
        // Azerbaijan
        'Baku': 'Azerbaijan', 'Ganja': 'Azerbaijan', 'Sumgayit': 'Azerbaijan', 'Mingachevir': 'Azerbaijan',
        'Qabalah': 'Azerbaijan', 'Shaki': 'Azerbaijan', 'Lankaran': 'Azerbaijan', 'Shamakhi': 'Azerbaijan',
        'Quba': 'Azerbaijan', 'Gabala': 'Azerbaijan',
        // Georgia
        'Tbilisi': 'Georgia', 'Batumi': 'Georgia', 'Kutaisi': 'Georgia', 'Rustavi': 'Georgia',
        'Zugdidi': 'Georgia', 'Gori': 'Georgia', 'Telavi': 'Georgia', 'Mestia': 'Georgia',
        'Kazbegi': 'Georgia', 'Sighnaghi': 'Georgia', 'Mtskheta': 'Georgia', 'Borjomi': 'Georgia',
        // Albania
        'Tirana': 'Albania', 'Durres': 'Albania', 'Vlore': 'Albania', 'Shkoder': 'Albania',
        'Fier': 'Albania', 'Korce': 'Albania', 'Berat': 'Albania', 'Gjirokaster': 'Albania',
        'Sarande': 'Albania', 'Kruje': 'Albania'
    };
    
    if (this.category && cityToCountry[this.category]) {
        this.country = cityToCountry[this.category];
    } else {
        this.country = 'General';
    }
    
    next();
});

// Indexes for better query performance
// Note: slug already has index via unique: true, no need for explicit index
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ views: -1 });
blogSchema.index({ isFeatured: 1, status: 1 });

// Add pagination plugin
blogSchema.plugin(mongoosePaginate);

// Static method to get published blogs
blogSchema.statics.getPublishedBlogs = function(filters = {}, options = {}) {
    const query = { status: 'published', ...filters };
    const defaultOptions = {
        sort: { publishedAt: -1 },
        limit: 10,
        page: 1,
        populate: { path: 'author', select: 'username' },
        ...options
    };
    
    return this.paginate(query, defaultOptions);
};

// Static method to get featured blogs
blogSchema.statics.getFeaturedBlogs = function(limit = 3) {
    return this.find({ 
        status: 'published', 
        isFeatured: true 
    })
    .populate('author', 'username')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to get blogs by category
blogSchema.statics.getBlogsByCategory = function(category, options = {}) {
    return this.getPublishedBlogs({ category }, options);
};

// Static method to get recent blogs
blogSchema.statics.getRecentBlogs = function(limit = 5) {
    return this.find({ status: 'published' })
        .populate('author', 'username')
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select('title slug category mainImage excerpt publishedAt readingTime views');
};

// Method to increment views
blogSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);

