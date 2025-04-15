const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    childrenPricePerNight: { type: Number, default: 0 }
});

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    stars: { type: Number, required: true },
    roomTypes: [roomTypeSchema],
    breakfastIncluded: { type: Boolean, required: true },
    transportationPrice: { type: Number, required: true, default: 0 },
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
