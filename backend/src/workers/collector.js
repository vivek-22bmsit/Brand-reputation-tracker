import cron from 'node-cron';
import Brand from '../models/Brand.js';
import Mention from '../models/Mention.js';
import { scrapeNews } from '../scrapers/newsapi.js';
import { scrapeReddit } from '../scrapers/reddit.js';
import { scrapeRSS } from '../scrapers/rss.js';
import { scrapeYouTube } from '../scrapers/youtube.js';
import { scrapeGoogleAlerts } from '../scrapers/google-alerts.js';
import { scrapeWikimedia } from '../scrapers/wikimedia.js';
import { analyzeSentiment } from '../services/sentiment.js';
import { clusterTopics } from '../services/clustering.js';
import { detectSpikes } from '../services/spikeDetector.js';

/**
 * Start the data collection worker
 */
export function startCollector(io) {
  console.log('🔄 Starting data collector worker...');

  // Run every 15 minutes (configurable)
  const interval = process.env.SCRAPE_INTERVAL_MINUTES || 15;
  cron.schedule(`*/${interval} * * * *`, async () => {
    console.log(`\n🕐 Running scheduled collection (${new Date().toLocaleString()})...`);
    await collectAllBrands(io);
  });

  // Run immediately on start (after 5 seconds)
  console.log('⏳ Initial collection will start in 5 seconds...');
  setTimeout(() => {
    console.log('🚀 Starting initial data collection...');
    collectAllBrands(io);
  }, 5000);
}

/**
 * Collect mentions for all active brands
 */
async function collectAllBrands(io) {
  try {
    const brands = await Brand.find({ isActive: true });

    if (brands.length === 0) {
      console.log('⚠️  No active brands found. Please create a brand first.');
      return;
    }

    console.log(`📊 Collecting for ${brands.length} brand(s)...`);

    for (const brand of brands) {
      await collectBrandMentions(brand, io);
    }

    console.log('✅ Collection cycle complete\n');
  } catch (error) {
    console.error('❌ Collection error:', error.message);
  }
}

/**
 * Collect mentions for a single brand
 */
async function collectBrandMentions(brand, io) {
  console.log(`\n📡 Collecting mentions for: ${brand.name}`);
  console.log(`   Keywords: ${brand.keywords.join(', ')}`);

  const startTime = Date.now();
  const allMentions = [];
  const promises = [];

  try {
    // Collect from all enabled sources in parallel
    if (brand.sources.newsapi) {
      promises.push(
        scrapeNews(brand.keywords)
          .then(mentions => {
            console.log(`   📰 NewsAPI: ${mentions.length} mentions`);
            return mentions;
          })
          .catch(err => {
            console.error(`   ❌ NewsAPI error: ${err.message}`);
            return [];
          })
      );
    }

    if (brand.sources.reddit) {
      promises.push(
        scrapeReddit(brand.keywords)
          .then(mentions => {
            console.log(`   💬 Reddit: ${mentions.length} mentions`);
            return mentions;
          })
          .catch(err => {
            console.error(`   ❌ Reddit error: ${err.message}`);
            return [];
          })
      );
    }

    if (brand.sources.rss) {
      promises.push(
        scrapeRSS(brand.keywords)
          .then(mentions => {
            console.log(`   📡 RSS: ${mentions.length} mentions`);
            return mentions;
          })
          .catch(err => {
            console.error(`   ❌ RSS error: ${err.message}`);
            return [];
          })
      );
    }

    if (brand.sources.youtube) {
      promises.push(
        scrapeYouTube(brand.keywords)
          .then(mentions => {
            console.log(`   🎥 YouTube: ${mentions.length} mentions`);
            return mentions;
          })
          .catch(err => {
            console.error(`   ❌ YouTube error: ${err.message}`);
            return [];
          })
      );
    }

    if (brand.sources.googleAlerts && brand.googleAlertFeeds?.length > 0) {
      promises.push(
        scrapeGoogleAlerts(brand.googleAlertFeeds)
          .then(mentions => {
            console.log(`   🔔 Google Alerts: ${mentions.length} mentions`);
            return mentions;
          })
          .catch(err => {
            console.error(`   ❌ Google Alerts error: ${err.message}`);
            return [];
          })
      );
    }

    if (brand.sources.wikimedia) {
      promises.push(
        scrapeWikimedia(brand.name, brand.keywords)
          .then(mentions => {
            console.log(`   📖 Wikimedia: ${mentions.length} mentions`);
            return mentions;
          })
          .catch(err => {
            console.error(`   ❌ Wikimedia error: ${err.message}`);
            return [];
          })
      );
    }

    // Wait for all scrapers to complete
    const results = await Promise.all(promises);
    results.forEach(mentions => allMentions.push(...mentions));

    console.log(`   📊 Total found: ${allMentions.length} mentions`);

    // Process and save mentions
    let newCount = 0;
    let duplicateCount = 0;

    for (const mentionData of allMentions) {
      try {
        // Check if already exists (deduplication)
        const exists = await Mention.findOne({ contentHash: mentionData.contentHash });
        if (exists) {
          duplicateCount++;
          continue;
        }

        // Analyze sentiment
        const { sentiment, sentimentScore, confidence } = await analyzeSentiment(mentionData.text);

        // Create mention
        const mention = await Mention.create({
          ...mentionData,
          brandId: brand._id,
          sentiment,
          sentimentScore,
          metadata: {
            ...mentionData.metadata,
            sentimentConfidence: confidence
          }
        });

        newCount++;

        // Emit to WebSocket for real-time update
        io.to(`brand-${brand._id}`).emit('new-mention', mention);

      } catch (error) {
        if (error.code !== 11000) { // Ignore duplicate key errors
          console.error(`   ⚠️  Error saving mention: ${error.message}`);
        } else {
          duplicateCount++;
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`   ✅ Saved ${newCount} new, ${duplicateCount} duplicates (${duration}s)`);

    // Update topics if we have new mentions
    if (newCount > 0) {
      await updateTopics(brand._id, io);
      await detectSpikes(brand._id, io);
    }

  } catch (error) {
    console.error(`   ❌ Error collecting for ${brand.name}:`, error.message);
  }
}

/**
 * Update topic clusters for a brand
 */
async function updateTopics(brandId, io) {
  try {
    const recentMentions = await Mention.find({
      brandId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).limit(500);

    if (recentMentions.length < 10) return;

    const clusters = clusterTopics(recentMentions, 5);

    // Update mentions with topics
    for (const cluster of clusters) {
      for (const mention of cluster.mentions) {
        await Mention.findByIdAndUpdate(mention._id, {
          topic: cluster.topic,
          keywords: cluster.keywords
        });
      }
    }

    // Emit topics update
    io.to(`brand-${brandId}`).emit('topics-updated', clusters);

    console.log(`   🏷️  Updated ${clusters.length} topic clusters`);
  } catch (error) {
    console.error('   ⚠️  Topic update error:', error.message);
  }
}
