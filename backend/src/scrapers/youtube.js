import axios from 'axios';
import crypto from 'crypto';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Scrape YouTube videos mentioning brand
 * Free tier: 10,000 units/day
 */
export async function scrapeYouTube(brandKeywords) {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key') {
    console.log('⚠️  YouTube API key not configured');
    return [];
  }

  try {
    const query = brandKeywords.join(' OR ');
    const mentions = [];

    // Search for videos (100 units)
    const searchResponse = await axios.get(`${API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 25,
        order: 'date',
        relevanceLanguage: 'en',
        key: YOUTUBE_API_KEY
      }
    });

    const videoIds = searchResponse.data.items.map(item => item.id.videoId);

    if (videoIds.length === 0) return [];

    // Get video statistics (1 unit)
    const videosResponse = await axios.get(`${API_BASE}/videos`, {
      params: {
        part: 'statistics,snippet,contentDetails',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY
      }
    });

    for (const video of videosResponse.data.items) {
      const stats = video.statistics;
      const snippet = video.snippet;

      mentions.push({
        source: 'youtube',
        type: 'video',
        text: `${snippet.title}. ${snippet.description.substring(0, 500)}`,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        author: snippet.channelTitle,
        title: snippet.title,
        publishedAt: new Date(snippet.publishedAt),
        reach: parseInt(stats.viewCount || 0),
        engagement: {
          likes: parseInt(stats.likeCount || 0),
          comments: parseInt(stats.commentCount || 0)
        },
        metadata: {
          channelId: snippet.channelId,
          thumbnails: snippet.thumbnails
        },
        contentHash: generateHash(video.id)
      });
    }

    return mentions;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('❌ YouTube API quota exceeded or invalid key');
    } else {
      console.error('❌ YouTube error:', error.message);
    }
    return [];
  }
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}
