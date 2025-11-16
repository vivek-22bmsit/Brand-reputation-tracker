import Mention from '../models/Mention.js';
import Alert from '../models/Alert.js';

/**
 * Detect unusual spikes in mention volume
 */
export async function detectSpikes(brandId, io) {
  try {
    // Get mentions from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const mentions = await Mention.find({
      brandId,
      createdAt: { $gte: oneDayAgo }
    });

    if (mentions.length < 10) return null; // Not enough data

    // Group by hour
    const hourlyData = groupByHour(mentions);
    const counts = hourlyData.map(h => h.count);

    if (counts.length < 2) return null;

    // Calculate statistics
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const stdDev = Math.sqrt(
      counts.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / counts.length
    );

    const latestCount = counts[counts.length - 1];
    const threshold = avg + (2 * stdDev);

    // Detect spike (> 2 standard deviations from mean)
    if (latestCount > threshold && latestCount > avg * 1.4) {
      const alert = await Alert.create({
        brandId,
        type: 'spike',
        severity: 'high',
        title: 'Conversation Spike Detected',
        message: `Unusual activity: ${latestCount} mentions in the last hour (average: ${Math.round(avg)})`,
        metadata: {
          currentCount: latestCount,
          averageCount: Math.round(avg),
          threshold: Math.round(threshold),
          percentIncrease: Math.round(((latestCount - avg) / avg) * 100)
        }
      });

      // Emit via WebSocket
      io.to(`brand-${brandId}`).emit('new-alert', alert);

      console.log(`🚨 Spike alert created for brand ${brandId}`);
      return alert;
    }

    // Check for negative sentiment surge
    const recentMentions = mentions.slice(-Math.min(50, mentions.length));
    const negativeCount = recentMentions.filter(m => m.sentiment === 'negative').length;
    const negativeRatio = negativeCount / recentMentions.length;

    if (negativeRatio > 0.6 && recentMentions.length > 10) {
      const alert = await Alert.create({
        brandId,
        type: 'negative_surge',
        severity: 'high',
        title: 'Negative Sentiment Surge',
        message: `${Math.round(negativeRatio * 100)}% of recent mentions are negative`,
        metadata: {
          negativeRatio: negativeRatio.toFixed(2),
          negativeCount,
          totalMentions: recentMentions.length
        }
      });

      io.to(`brand-${brandId}`).emit('new-alert', alert);

      console.log(`🚨 Negative surge alert created for brand ${brandId}`);
      return alert;
    }

    return null;
  } catch (error) {
    console.error('Spike detection error:', error.message);
    return null;
  }
}

/**
 * Group mentions by hour
 */
function groupByHour(mentions) {
  const groups = {};

  mentions.forEach(mention => {
    const hour = new Date(mention.createdAt);
    hour.setMinutes(0, 0, 0);
    const key = hour.toISOString();

    if (!groups[key]) {
      groups[key] = { time: key, count: 0, mentions: [] };
    }
    groups[key].count++;
    groups[key].mentions.push(mention);
  });

  return Object.values(groups).sort((a, b) =>
    new Date(a.time) - new Date(b.time)
  );
}
