import Parser from 'rss-parser';
import crypto from 'crypto';

const parser = new Parser();

// Popular tech/business RSS feeds (Global + Indian business news)
const RSS_FEEDS = [
  // Global tech news
  'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',

  // Global business news
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'https://www.cnbc.com/id/100003114/device/rss/rss.html',

  // Indian business news (Working sources)
  'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
  'https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms',
  'https://www.moneycontrol.com/rss/latestnews.xml',

  // Auto/Manufacturing (for Tata Motors, Mahindra)
  'https://economictimes.indiatimes.com/industry/auto/rssfeeds/13352101.cms'
];

/**
 * Scrape RSS feeds for brand mentions
 * Free tier: Unlimited
 */
export async function scrapeRSS(brandKeywords) {
  const mentions = [];
  console.log(`   🔍 Searching ${RSS_FEEDS.length} RSS feeds for: ${brandKeywords.join(', ')}`);

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      let feedMatches = 0;

      for (const item of feed.items) {
        const text = `${item.title} ${item.contentSnippet || item.content || ''}`;

        // Check if any keyword is mentioned
        const matchesKeyword = brandKeywords.some(keyword =>
          text.toLowerCase().includes(keyword.toLowerCase())
        );

        if (matchesKeyword) {
          feedMatches++;
          mentions.push({
            source: 'rss',
            type: 'article',
            text: item.contentSnippet || item.content || item.title,
            url: item.link,
            author: item.creator || feed.title,
            title: item.title,
            publishedAt: new Date(item.pubDate || item.isoDate),
            reach: 500,
            metadata: {
              feedTitle: feed.title,
              categories: item.categories || []
            },
            contentHash: generateHash(item.link)
          });
        }
      }

      if (feedMatches > 0) {
        console.log(`   ✅ ${feed.title}: ${feedMatches} matches`);
      }
    } catch (error) {
      console.error(`   ❌ RSS feed error (${feedUrl.substring(0, 30)}...): ${error.message}`);
    }
  }

  console.log(`   📊 RSS total: ${mentions.length} mentions from ${RSS_FEEDS.length} feeds`);
  return mentions;
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}
