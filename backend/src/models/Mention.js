import mongoose from 'mongoose';

const mentionSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true
  },
  source: {
    type: String,
    enum: ['newsapi', 'reddit', 'rss', 'twitter', 'youtube', 'google-alerts', 'wikimedia'],
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['article', 'post', 'comment', 'video', 'page', 'edit'],
    default: 'article'
  },
  text: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: String,
  author: String,

  // Sentiment Analysis
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
    index: true
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },

  // Topic Clustering
  topic: {
    type: String,
    index: true
  },
  keywords: [String],

  // Metrics
  reach: {
    type: Number,
    default: 0
  },
  engagement: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    replies: { type: Number, default: 0 }
  },

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Timestamps
  publishedAt: {
    type: Date,
    index: true
  },
  collectedAt: {
    type: Date,
    default: Date.now
  },

  // Deduplication
  contentHash: {
    type: String,
    unique: true,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
mentionSchema.index({ brandId: 1, createdAt: -1 });
mentionSchema.index({ brandId: 1, sentiment: 1 });
mentionSchema.index({ brandId: 1, source: 1 });
mentionSchema.index({ brandId: 1, publishedAt: -1 });
mentionSchema.index({ topic: 1 });

export default mongoose.model('Mention', mentionSchema);
