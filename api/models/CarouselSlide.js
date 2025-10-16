const mongoose = require('mongoose');

const carouselSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  subtitle: {
    type: String,
    maxlength: 200,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true,
    default: ''
  },
  image: {
    url: {
      type: String,
      required: true
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
  button: {
    text: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true
    },
    link: {
      type: String,
      required: true,
      trim: true
    },
    variant: {
      type: String,
      enum: [
        'blueToTeal', 'greenToBlue', 'purpleToPink', 'pinkToOrange',
        'rippleWhiteToTeal', 'rippleBlackToBlue', 'rippleGrayToGreen', 
        'rippleGrayToBlue', 'rippleTealToBlue', 'ripplePurpleToRed', 'rippleBlueToTeal',
        'rippleBlueToYellowTeal'
      ],
      default: 'blueToTeal'
    },
    openInNewTab: {
      type: Boolean,
      default: false
    }
  },
  textPosition: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'center'
  },
  textColor: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
carouselSlideSchema.index({ isActive: 1, order: 1 });
carouselSlideSchema.index({ createdBy: 1 });

// Virtual for formatted creation date
carouselSlideSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Static method to get active slides for public display
carouselSlideSchema.statics.getActiveSlides = function() {
  return this.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .select('-createdBy -updatedBy -__v');
};

// Static method to get all slides for admin
carouselSlideSchema.statics.getAllSlidesForAdmin = function() {
  return this.find()
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username')
    .sort({ order: 1, createdAt: -1 });
};

module.exports = mongoose.model('CarouselSlide', carouselSlideSchema);
