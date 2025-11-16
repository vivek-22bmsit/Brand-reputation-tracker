import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['spike', 'negative_surge', 'trending_topic', 'high_engagement'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes
alertSchema.index({ brandId: 1, createdAt: -1 });
alertSchema.index({ brandId: 1, isRead: 1 });

export default mongoose.model('Alert', alertSchema);
