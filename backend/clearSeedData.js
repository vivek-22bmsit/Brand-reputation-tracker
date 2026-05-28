import './loadEnv.js';
import mongoose from 'mongoose';
import Mention from './src/models/Mention.js';
import connectDB from './src/config/database.js';

async function clearSeedData() {
  try {
    await connectDB();
    console.log('🧹 Clearing historical seed data...');

    // Delete all mentions with example.com URLs (seed data)
    const result = await Mention.deleteMany({
      url: { $regex: /example\.com/ }
    });

    console.log(`✅ Removed ${result.deletedCount} seed mentions`);
    console.log('📊 Real mentions from RSS, YouTube, and NewsAPI are preserved');

    // Show remaining count
    const remaining = await Mention.countDocuments();
    console.log(`✅ ${remaining} real mentions remaining in database`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing seed data:', error);
    process.exit(1);
  }
}

clearSeedData();
