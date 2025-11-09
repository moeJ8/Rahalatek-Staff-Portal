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
    },
    // Room highlights and amenities
    highlights: [{
        type: String,
        trim: true
    }],
    // Room details
    details: {
        size: { 
            value: { type: Number }, // in square meters
            unit: { type: String, default: 'sq m' }
        },
        view: { type: String, default: '' }, // Sea view, City view, Garden view, etc.
        sleeps: { type: Number, default: 1 }, // Maximum occupancy
        bedType: { type: String, default: '' }, // Double Bed, Twin Beds, etc.
        bathroom: { type: String, default: '' }, // Private, Shared, etc.
        balcony: { type: Boolean, default: false },
        airConditioning: { type: Boolean, default: false },
        soundproofed: { type: Boolean, default: false },
        freeWifi: { type: Boolean, default: false },
        minibar: { type: Boolean, default: false },
        safe: { type: Boolean, default: false },
        tv: { type: Boolean, default: false },
        hairdryer: { type: Boolean, default: false },
        bathrobes: { type: Boolean, default: false },
        freeCots: { type: Boolean, default: false },
        smokingAllowed: { type: Boolean, default: false },
        petFriendly: { type: Boolean, default: false },
        accessibleRoom: { type: Boolean, default: false }
    },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now }
    }]
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
    slug: { 
        type: String, 
        unique: true,
        lowercase: true,
        trim: true
    },
    city: { 
        type: String, 
        required: true,
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
            'Puncak', 'Sukabumi',
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
            'Bakuriani',
            // Albania
            'Tirana', 'Durres', 'Vlore', 'Shkoder', 'Shkodra', 'Fier', 'Korce',
            'Berat', 'Gjirokaster', 'Sarande', 'Kruje',
            // United Arab Emirates
            'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah',
            'Fujairah', 'Umm Al Quwain', 'Al Ain'
        ]
    },
    country: { 
        type: String, 
        required: true,
        enum: ['Turkey', 'Malaysia', 'Thailand', 'Indonesia', 'Saudi Arabia', 'Morocco', 'Egypt', 'Azerbaijan', 'Georgia', 'Albania', 'United Arab Emirates']
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
    locationDescription: { type: String },
    // Translation fields (Arabic and French only - English is the base field)
    translations: {
        description: {
            ar: { type: String, default: '' },
            fr: { type: String, default: '' }
        },
        locationDescription: {
            ar: { type: String, default: '' },
            fr: { type: String, default: '' }
        }
    },
    childrenPolicies: {
        under6: { type: String, default: 'Free' },
        age6to12: { type: String, default: 'Additional charge per room type' },
        above12: { type: String, default: 'Adult price' }
    },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now }
    }],
    amenities: {
        topFamilyFriendlyAmenities: {
            gameRoom: { type: Boolean, default: false },
            toysGames: { type: Boolean, default: false },
            waterslide: { type: Boolean, default: false },
            kidsClub: { type: Boolean, default: false },
            kidsPool: { type: Boolean, default: false },
            babysitting: { type: Boolean, default: false },
            tennisCourt: { type: Boolean, default: false },
            soundproofRooms: { type: Boolean, default: false },
            groceryConvenienceStore: { type: Boolean, default: false }
        },
        popularAmenities: {
            bar: { type: Boolean, default: false },
            pool: { type: Boolean, default: false },
            allInclusive: { type: Boolean, default: false },
            breakfastIncluded: { type: Boolean, default: false },
            gym: { type: Boolean, default: false },
            roomService: { type: Boolean, default: false },
            laundry: { type: Boolean, default: false },
            housekeeping: { type: Boolean, default: false },
            frontDesk24h: { type: Boolean, default: false },
            spa: { type: Boolean, default: false },
            airConditioning: { type: Boolean, default: false },
            parkingIncluded: { type: Boolean, default: false },
            freeWiFi: { type: Boolean, default: false },
            restaurant: { type: Boolean, default: false }
        },
        businessServices: {
            businessCenter24h: { type: Boolean, default: false },
            conferenceSpace: { type: Boolean, default: false },
            computerStation: { type: Boolean, default: false },
            coworkingSpace: { type: Boolean, default: false },
            meetingRoom: { type: Boolean, default: false }
        },
        parkingAndTransportation: {
            airportShuttle24h: { type: Boolean, default: false },
            freeSelfParking: { type: Boolean, default: false }
        },
        foodAndDrink: {
            buffetBreakfast: { type: Boolean, default: false },
            poolsideBars: { type: Boolean, default: false },
            restaurants: { type: Boolean, default: false },
            barsLounges: { type: Boolean, default: false },
            beachBar: { type: Boolean, default: false },
            coffeeTeaCommonAreas: { type: Boolean, default: false },
            snackBarDeli: { type: Boolean, default: false }
        },
        internet: {
            freeWiFiPublicAreas: { type: Boolean, default: false }
        },
        thingsToDo: {
            outdoorTennisCourts: { type: Boolean, default: false },
            outdoorPools: { type: Boolean, default: false },
            arcadeGameRoom: { type: Boolean, default: false },
            beachVolleyball: { type: Boolean, default: false },
            billiardsPoolTable: { type: Boolean, default: false },
            bowlingAlley: { type: Boolean, default: false },
            childrensPool: { type: Boolean, default: false },
            concertsLiveShows: { type: Boolean, default: false },
            eveningEntertainment: { type: Boolean, default: false },
            fitnessClasses: { type: Boolean, default: false },
            freeBicycleRentals: { type: Boolean, default: false },
            freeChildrensClub: { type: Boolean, default: false },
            fullServiceSpa: { type: Boolean, default: false },
            games: { type: Boolean, default: false },
            gymFacility: { type: Boolean, default: false },
            indoorPool: { type: Boolean, default: false },
            karaoke: { type: Boolean, default: false },
            nightclub: { type: Boolean, default: false },
            parasailing: { type: Boolean, default: false },
            playground: { type: Boolean, default: false },
            racquetballSquash: { type: Boolean, default: false },
            sailing: { type: Boolean, default: false },
            saunaFacility: { type: Boolean, default: false },
            scubaDiving: { type: Boolean, default: false },
            shopping: { type: Boolean, default: false },
            steamRoom: { type: Boolean, default: false },
            tableTennis: { type: Boolean, default: false },
            tennisLessons: { type: Boolean, default: false },
            tvCommonAreas: { type: Boolean, default: false },
            waterSkiing: { type: Boolean, default: false },
            waterslideFacility: { type: Boolean, default: false },
            windsurfing: { type: Boolean, default: false },
            yogaClasses: { type: Boolean, default: false }
        },
        familyFriendly: {
            outdoorPoolsFamily: { type: Boolean, default: false },
            arcadeGameRoomFamily: { type: Boolean, default: false },
            bowlingAlleyFamily: { type: Boolean, default: false },
            childrensGames: { type: Boolean, default: false },
            childrensPoolFamily: { type: Boolean, default: false },
            childrensToys: { type: Boolean, default: false },
            freeChildrensClubFamily: { type: Boolean, default: false },
            freeSupervisedActivities: { type: Boolean, default: false },
            groceryConvenienceStoreFamily: { type: Boolean, default: false },
            inRoomBabysitting: { type: Boolean, default: false },
            indoorPoolFamily: { type: Boolean, default: false },
            laundryFacilities: { type: Boolean, default: false },
            playgroundFamily: { type: Boolean, default: false },
            snackBarDeliFamily: { type: Boolean, default: false },
            soundproofedRooms: { type: Boolean, default: false },
            stroller: { type: Boolean, default: false },
            waterslideFamily: { type: Boolean, default: false }
        },
        conveniences: {
            frontDesk24hConvenience: { type: Boolean, default: false },
            giftShopNewsstand: { type: Boolean, default: false },
            groceryConvenienceStoreConvenience: { type: Boolean, default: false },
            hairSalon: { type: Boolean, default: false },
            laundryFacilitiesConvenience: { type: Boolean, default: false },
            lockers: { type: Boolean, default: false },
            safeFrontDesk: { type: Boolean, default: false }
        },
        guestServices: {
            changeOfBedsheets: { type: Boolean, default: false },
            changeOfTowels: { type: Boolean, default: false },
            conciergeServices: { type: Boolean, default: false },
            dryCleaningLaundry: { type: Boolean, default: false },
            housekeepingDaily: { type: Boolean, default: false },
            multilingualStaff: { type: Boolean, default: false },
            porterBellhop: { type: Boolean, default: false },
            proposalRomancePackages: { type: Boolean, default: false },
            tourTicketAssistance: { type: Boolean, default: false },
            weddingServices: { type: Boolean, default: false }
        },
        outdoors: {
            beachLoungers: { type: Boolean, default: false },
            beachTowels: { type: Boolean, default: false },
            beachUmbrellas: { type: Boolean, default: false },
            garden: { type: Boolean, default: false },
            onTheBay: { type: Boolean, default: false },
            onTheBeach: { type: Boolean, default: false },
            outdoorEntertainmentArea: { type: Boolean, default: false },
            outdoorFurniture: { type: Boolean, default: false },
            poolLoungers: { type: Boolean, default: false },
            poolUmbrellas: { type: Boolean, default: false },
            terrace: { type: Boolean, default: false }
        },
        accessibility: {
            accessibleAirportShuttle: { type: Boolean, default: false },
            elevator: { type: Boolean, default: false },
            poolHoist: { type: Boolean, default: false },
            wellLitPath: { type: Boolean, default: false },
            wheelchairAccessible: { type: Boolean, default: false },
            wheelchairAccessiblePath: { type: Boolean, default: false },
            wheelchairAccessibleWashroom: { type: Boolean, default: false },
            wheelchairAccessibleDesk: { type: Boolean, default: false }
        },
        fullServiceSpaDetails: {
            bodyScrubs: { type: Boolean, default: false },
            bodyWraps: { type: Boolean, default: false },
            facials: { type: Boolean, default: false },
            manicuresPedicures: { type: Boolean, default: false },
            massage: { type: Boolean, default: false },
            saunaService: { type: Boolean, default: false },
            spaOpenDaily: { type: Boolean, default: false },
            turkishBath: { type: Boolean, default: false }
        },
        languagesSpoken: {
            dutch: { type: Boolean, default: false },
            english: { type: Boolean, default: false },
            french: { type: Boolean, default: false },
            german: { type: Boolean, default: false },
            russian: { type: Boolean, default: false },
            turkish: { type: Boolean, default: false }
        },
        more: {
            twoFloors: { type: Boolean, default: false },
            ledLighting80Percent: { type: Boolean, default: false },
            locallySourcedFood80Percent: { type: Boolean, default: false },
            banquetHall: { type: Boolean, default: false },
            builtIn1999: { type: Boolean, default: false },
            designatedSmokingAreas: { type: Boolean, default: false },
            mediterraneanArchitecture: { type: Boolean, default: false },
            vegetarianBreakfast: { type: Boolean, default: false },
            vegetarianDining: { type: Boolean, default: false }
        },
        restaurantsOnSite: {
            italian: { type: Boolean, default: false },
            buffetMeals: { type: Boolean, default: false },
            seafood: { type: Boolean, default: false },
            sevenTwentyFour: { type: Boolean, default: false },
            turkish: { type: Boolean, default: false }
        }
    },
    faqs: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate slug from name before saving
hotelSchema.pre('save', async function(next) {
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
            baseSlug = `hotel-${Date.now()}`;
        }
        
        let slug = baseSlug;
        let counter = 1;
        
        // Check for existing slugs and append number if needed
        while (true) {
            const existingHotel = await this.constructor.findOne({ 
                slug: slug,
                _id: { $ne: this._id } // Exclude current hotel when updating
            });
            
            if (!existingHotel) {
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
            const existingHotel = await this.constructor.findOne({
                slug: slug,
                _id: { $ne: this._id } // Exclude current hotel when updating
            });
            
            if (!existingHotel) {
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

module.exports = mongoose.model('Hotel', hotelSchema);
