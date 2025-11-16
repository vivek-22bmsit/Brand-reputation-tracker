import axios from 'axios';
import crypto from 'crypto';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

/**
 * Scrape Wikipedia for brand mentions
 * Free tier: Unlimited
 */
export async function scrapeWikimedia(brandName, brandKeywords) {
  const mentions = [];

  try {
    // Search Wikipedia for mentions
    const query = brandKeywords.join(' OR ');

    const response = await axios.get(WIKI_API, {
      params: {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
        srlimit: 10,
        srprop: 'snippet|timestamp'
      },
      headers: {
        'User-Agent': 'BrandTracker/1.0 (Educational Project)'
      }
    });

    for (const result of response.data.query.search) {
      const cleanSnippet = result.snippet
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');

      mentions.push({
        source: 'wikimedia',
        type: 'page',
        text: cleanSnippet,
        url: `https://en.wikipedia.org/wiki/${result.title.replace(/ /g, '_')}`,
        title: result.title,
        author: 'Wikipedia Contributors',
        publishedAt: result.timestamp ? new Date(result.timestamp) : new Date(),
        reach: 5000,
        metadata: {
          pageId: result.pageid
        },
        contentHash: generateHash(`wiki-${result.pageid}`)
      });
    }

    return mentions;
  } catch (error) {
    console.error('❌ Wikimedia error:', error.message);
    return [];
  }
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}
