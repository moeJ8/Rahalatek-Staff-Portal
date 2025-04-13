const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    stars: { type: Number, required: true },
    pricePerNightPerPerson: { type: Number, required: true },
    breakfastIncluded: { type: Boolean, required: true },
    roomType: { type: String, required: true },
    transportationPrice: { type: Number, required: true, default: 0 },
    airport: { type: String },
    description: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);
