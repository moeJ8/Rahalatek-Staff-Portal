const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    pricePerNight: { type: Number, required: true }
});

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    stars: { type: Number, required: true },
    roomTypes: [roomTypeSchema],
    breakfastIncluded: { type: Boolean, required: true },
    transportationPrice: { type: Number, required: true, default: 0 },
    airport: { type: String },
    description: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);
