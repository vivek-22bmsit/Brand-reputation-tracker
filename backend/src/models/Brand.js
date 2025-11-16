import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true
  },
  keywords: [{
    type: String,
    required: true,
    trim: true
  }],
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sources: {
    newsapi: { type: Boolean, default: true },
    reddit: { type: Boolean, default: true },
    rss: { type: Boolean, default: true },
    youtube: { type: Boolean, default: true },
    googleAlerts: { type: Boolean, default: false },
    wikimedia: { type: Boolean, default: false }
  },
  googleAlertFeeds: [{
    type: String  // RSS feed URLs from Google Alerts
  }],
  settings: {
    spikeThreshold: {
      type: Number,
      default: 40,
      min: 10,
      max: 100
    },
    collectInterval: {
      type: Number,
      default: 15,
      min: 5,
      max: 60
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
brandSchema.index({ name: 1 });
brandSchema.index({ isActive: 1 });

export default mongoose.model('Brand', brandSchema);
