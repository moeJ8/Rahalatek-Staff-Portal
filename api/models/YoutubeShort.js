const mongoose = require('mongoose');

const youtubeShortSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  youtubeUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Validate YouTube Shorts URL
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/shorts\/|youtu\.be\/)[a-zA-Z0-9_-]+/.test(v);
      },
      message: 'Please provide a valid YouTube Shorts URL'
    }
  },
  // Extract video ID from URL for embedding
  videoId: {
    type: String
    // Will be set by pre-save middleware
  },
  thumbnail: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
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
youtubeShortSchema.index({ isActive: 1, order: 1 });
youtubeShortSchema.index({ createdBy: 1 });

// Pre-save middleware to extract video ID from URL
youtubeShortSchema.pre('save', function(next) {
  if (this.isModified('youtubeUrl')) {
    // Extract video ID from various YouTube URL formats
    const url = this.youtubeUrl;
    let videoId = '';
    
    // Match patterns: youtube.com/shorts/VIDEO_ID or youtu.be/VIDEO_ID
    // Extract video ID before any query parameters or fragments
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    const standardMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    
    if (shortsMatch) {
      videoId = shortsMatch[1];
    } else if (shortMatch) {
      videoId = shortMatch[1];
    } else if (standardMatch) {
      videoId = standardMatch[1];
    }
    
    if (videoId) {
      this.videoId = videoId;
      // Set thumbnail from YouTube
      this.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else {
      // If no video ID could be extracted, throw validation error
      return next(new Error('Could not extract video ID from YouTube URL. Please use a valid YouTube Shorts URL.'));
    }
  }
  next();
});

// Virtual for embed URL
youtubeShortSchema.virtual('embedUrl').get(function() {
  return `https://www.youtube.com/embed/${this.videoId}`;
});

// Static method to get active shorts for public display
youtubeShortSchema.statics.getActiveShorts = function() {
  return this.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .select('-createdBy -updatedBy -__v');
};

// Static method to get all shorts for admin
youtubeShortSchema.statics.getAllShortsForAdmin = function() {
  return this.find()
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username')
    .sort({ order: 1, createdAt: -1 });
};

// Method to increment views
youtubeShortSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('YoutubeShort', youtubeShortSchema);

