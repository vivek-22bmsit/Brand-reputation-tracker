import './loadEnv.js';
import mongoose from 'mongoose';
import Mention from './src/models/Mention.js';
import Brand from './src/models/Brand.js';
import connectDB from './src/config/database.js';

async function seedHistoricalData() {
  try {
    await connectDB();
    console.log('🌱 Starting historical data seeding...');

    // Get all brands
    const brands = await Brand.find();
    console.log(`📊 Found ${brands.length} brands`);

    // Generate data for past 7 days
    const daysAgo = 7;
    const sentiments = ['positive', 'negative', 'neutral'];
    const sources = ['rss', 'newsapi', 'youtube'];

    for (const brand of brands) {
      console.log(`\n📈 Creating historical data for: ${brand.name}`);

      for (let day = daysAgo; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        date.setHours(Math.floor(Math.random() * 24));
        date.setMinutes(Math.floor(Math.random() * 60));

        // Create 3-8 mentions per day with varying sentiment
        const mentionsPerDay = Math.floor(Math.random() * 6) + 3;

        for (let i = 0; i < mentionsPerDay; i++) {
          const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
          const source = sources[Math.floor(Math.random() * sources.length)];

          const sentimentScores = {
            positive: Math.random() * 0.5 + 0.2,  // 0.2 to 0.7
            negative: -(Math.random() * 0.5 + 0.2), // -0.2 to -0.7
            neutral: Math.random() * 0.1 - 0.05    // -0.05 to 0.05
          };

          const mention = new Mention({
            brandId: brand._id,
            source,
            type: 'article',
            title: `${brand.name} ${sentiment} news story ${i + 1}`,
            text: `This is a ${sentiment} mention about ${brand.name}. It discusses various aspects of the brand's recent activities and market performance.`,
            url: `https://example.com/${brand.name.toLowerCase()}-${day}-${i}`,
            author: source === 'rss' ? 'RSS Feed' : source === 'newsapi' ? 'News Source' : 'YouTube Channel',
            sentiment,
            sentimentScore: sentimentScores[sentiment],
            publishedAt: new Date(date.getTime() + i * 60000), // Spread throughout the hour
            createdAt: new Date(date.getTime() + i * 60000),
            reach: Math.floor(Math.random() * 10000) + 500,
            contentHash: `historical_${brand._id}_${day}_${i}_${Date.now()}`,
            keywords: brand.keywords.slice(0, 2),
            metadata: {
              sentimentConfidence: Math.random() * 0.3 + 0.7
            }
          });

          await mention.save();
        }
        console.log(`  ✅ Day -${day}: Created ${mentionsPerDay} mentions`);
      }
    }

    console.log('\n✅ Historical data seeding complete!');
    console.log('📊 You can now see trend data in the dashboard');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedHistoricalData();
