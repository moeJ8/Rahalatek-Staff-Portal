const mongoose = require('mongoose');

const aboutHeroSchema = new mongoose.Schema({
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
  // Translation fields (Arabic and French only - English is the base field)
  translations: {
    title: {
      ar: { type: String, default: '', maxlength: 100 },
      fr: { type: String, default: '', maxlength: 100 }
    },
    subtitle: {
      ar: { type: String, default: '', maxlength: 200 },
      fr: { type: String, default: '', maxlength: 200 }
    },
    description: {
      ar: { type: String, default: '', maxlength: 500 },
      fr: { type: String, default: '', maxlength: 500 }
    },
    textPosition: {
      ar: { type: String, enum: ['left', 'center', 'right'], default: '' },
      fr: { type: String, enum: ['left', 'center', 'right'], default: '' }
    }
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
aboutHeroSchema.index({ isActive: 1, createdAt: -1 });
aboutHeroSchema.index({ createdBy: 1 });

// Virtual for formatted creation date
aboutHeroSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Static method to get active hero
aboutHeroSchema.statics.getActiveHero = function() {
  return this.findOne({ isActive: true })
    .select('-createdBy -updatedBy -__v')
    .sort({ updatedAt: -1 });
};

// Static method to get all heroes for admin
aboutHeroSchema.statics.getAllHeroesForAdmin = function() {
  return this.find()
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username')
    .sort({ updatedAt: -1 });
};

module.exports = mongoose.model('AboutHero', aboutHeroSchema);

