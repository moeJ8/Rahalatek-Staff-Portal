const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        trim: true,
        maxlength: [100, 'A tour name cannot exceed 100 characters']
    },
    city: {
        type: String,
        required: [true, 'A tour must have a city'],
        trim: true
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
    
    childrenPolicies: {
        under3: { type: String, default: 'Free' },
        above3: { type: String, default: 'Adult price' }
    },
    
    startDates: [Date],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
