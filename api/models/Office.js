const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Office name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Office location is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Office email is required'],
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Office phone number is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Office', officeSchema); 