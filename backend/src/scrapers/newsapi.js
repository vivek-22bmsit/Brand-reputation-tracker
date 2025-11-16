import axios from 'axios';
import crypto from 'crypto';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

/**
 * Scrape news articles from NewsAPI
 * Free tier: 100 requests/day
 */
export async function scrapeNews(brandKeywords) {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
    console.log('⚠️  NewsAPI key not configured');
    return [];
  }

  try {
    const query = brandKeywords.join(' OR ');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log(`   🔍 NewsAPI query: "${query.substring(0, 50)}..."`);

    const response = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 100,
        from: sevenDaysAgo.toISOString()
      }
    });

    if (response.data.status === 'error') {
      console.error(`   ❌ NewsAPI error: ${response.data.message}`);
      throw new Error(response.data.message);
    }

    console.log(`   ✅ NewsAPI responded with ${response.data.totalResults} total results, ${response.data.articles?.length || 0} articles returned`);

    const mentions = response.data.articles.map(article => ({
      source: 'newsapi',
      type: 'article',
      text: `${article.title}. ${article.description || ''}`,
      url: article.url,
      author: article.author || article.source.name,
      title: article.title,
      publishedAt: new Date(article.publishedAt),
      reach: 1000, // Estimate based on source
      metadata: {
        sourceName: article.source.name,
        urlToImage: article.urlToImage
      },
      contentHash: generateHash(article.url)
    }));

    return mentions;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('❌ NewsAPI rate limit exceeded');
    } else if (error.response?.status === 401) {
      console.error('❌ NewsAPI: Invalid API key');
    } else {
      console.error('❌ NewsAPI error:', error.message);
    }
    return [];
  }
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}
