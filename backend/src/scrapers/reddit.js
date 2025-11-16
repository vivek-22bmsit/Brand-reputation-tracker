import axios from 'axios';
import crypto from 'crypto';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = null;

/**
 * Get Reddit OAuth access token
 */
async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'BrandTracker/1.0'
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error('❌ Reddit authentication error:', error.message);
    return null;
  }
}

/**
 * Scrape Reddit posts mentioning brand
 * Free tier: Unlimited with rate limits (60 req/min)
 */
export async function scrapeReddit(brandKeywords) {
  if (!REDDIT_CLIENT_ID || REDDIT_CLIENT_ID === 'your_reddit_client_id') {
    console.log('⚠️  Reddit API credentials not configured');
    return [];
  }

  try {
    const token = await getAccessToken();
    if (!token) return [];

    const query = brandKeywords.join(' OR ');
    const response = await axios.get('https://oauth.reddit.com/search', {
      params: {
        q: query,
        sort: 'new',
        limit: 100,
        t: 'day',
        type: 'link'
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'BrandTracker/1.0'
      }
    });

    const posts = response.data.data.children;
    const mentions = posts.map(post => {
      const data = post.data;
      return {
        source: 'reddit',
        type: 'post',
        text: `${data.title}. ${data.selftext || ''}`.substring(0, 1000),
        url: `https://reddit.com${data.permalink}`,
        author: data.author,
        title: data.title,
        publishedAt: new Date(data.created_utc * 1000),
        reach: data.ups || 0,
        engagement: {
          likes: data.ups || 0,
          comments: data.num_comments || 0
        },
        metadata: {
          subreddit: data.subreddit,
          score: data.score,
          upvoteRatio: data.upvote_ratio
        },
        contentHash: generateHash(data.id)
      };
    });

    return mentions;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('❌ Reddit rate limit exceeded');
    } else {
      console.error('❌ Reddit scraping error:', error.message);
    }
    return [];
  }
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}
