import Parser from 'rss-parser';
import crypto from 'crypto';

const parser = new Parser();

/**
 * Scrape Google Alerts via RSS feeds
 * Free tier: Unlimited
 */
export async function scrapeGoogleAlerts(alertFeedUrls) {
  if (!alertFeedUrls || alertFeedUrls.length === 0) {
    return [];
  }

  const mentions = [];

  for (const feedUrl of alertFeedUrls) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        const actualUrl = extractActualUrl(item.link);
        const text = stripHtml(item.content || item.contentSnippet || '');

        mentions.push({
          source: 'google-alerts',
          type: 'article',
          text: text || item.title,
          url: actualUrl,
          title: item.title,
          author: extractDomain(actualUrl),
          publishedAt: new Date(item.pubDate || item.isoDate),
          reach: 1000,
          contentHash: generateHash(actualUrl)
        });
      }
    } catch (error) {
      console.error(`Google Alerts feed error: ${error.message}`);
    }
  }

  return mentions;
}

function extractActualUrl(googleUrl) {
  try {
    const urlObj = new URL(googleUrl);
    const actualUrl = urlObj.searchParams.get('url');
    return actualUrl || googleUrl;
  } catch (error) {
    return googleUrl;
  }
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 1000);
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return 'Unknown';
  }
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}
