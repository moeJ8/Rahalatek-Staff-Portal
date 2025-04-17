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

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    stars: { type: Number, required: true },
    roomTypes: [roomTypeSchema],
    breakfastIncluded: { type: Boolean, required: true },
    breakfastPrice: { type: Number, default: 0 },
    transportation: {
        vitoReceptionPrice: { type: Number, default: 0 },
        vitoFarewellPrice: { type: Number, default: 0 },
        sprinterReceptionPrice: { type: Number, default: 0 },
        sprinterFarewellPrice: { type: Number, default: 0 }
    },
    airport: { type: String },
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
