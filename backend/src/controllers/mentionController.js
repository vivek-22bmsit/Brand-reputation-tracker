import Mention from '../models/Mention.js';
import mongoose from 'mongoose';

/**
 * Get mentions with filters
 */
export const getMentions = async (req, res) => {
  try {
    const { brandId, source, sentiment, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (brandId) filter.brandId = brandId;
    if (source) filter.source = source;
    if (sentiment) filter.sentiment = sentiment;

    const mentions = await Mention.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('brandId', 'name logo');

    const total = await Mention.countDocuments(filter);

    res.json({
      success: true,
      data: mentions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get mention statistics for a brand
 */
export const getMentionStats = async (req, res) => {
  try {
    const { brandId } = req.params;

    const [total, sentimentStats, sourceStats] = await Promise.all([
      Mention.countDocuments({ brandId }),

      Mention.aggregate([
        { $match: { brandId: new mongoose.Types.ObjectId(brandId) } },
        {
          $group: {
            _id: '$sentiment',
            count: { $sum: 1 },
            avgScore: { $avg: '$sentimentScore' }
          }
        }
      ]),

      Mention.aggregate([
        { $match: { brandId: new mongoose.Types.ObjectId(brandId) } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total,
        sentiment: sentimentStats,
        sources: sourceStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get trend data (mentions over time)
 */
export const getTrendData = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { period = '24h' } = req.query;

    const hoursAgo = period === '7d' ? 168 : 24;
    const timeAgo = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const trends = await Mention.aggregate([
      {
        $match: {
          brandId: new mongoose.Types.ObjectId(brandId),
          createdAt: { $gte: timeAgo }
        }
      },
      {
        $group: {
          _id: {
            hour: {
              $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' }
            },
            sentiment: '$sentiment'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.hour': 1 } }
    ]);

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
