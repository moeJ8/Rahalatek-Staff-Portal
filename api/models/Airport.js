const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    arabicName: { type: String, required: true }
});

module.exports = mongoose.model('Airport', airportSchema); 