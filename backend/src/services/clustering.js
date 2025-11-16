import natural from 'natural';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

/**
 * Cluster mentions by topics using TF-IDF
 */
export function clusterTopics(mentions, numClusters = 5) {
  if (mentions.length < numClusters) {
    return mentions.map((m, i) => ({
      topic: `Topic ${i + 1}`,
      keywords: extractKeywords(m.text, 3),
      mentions: [m],
      sentiment: { [m.sentiment]: 1 }
    }));
  }

  // Extract TF-IDF features
  const tfidf = new TfIdf();
  mentions.forEach(m => tfidf.addDocument(m.text));

  // Get top keywords for each mention
  const mentionKeywords = mentions.map((m, i) => {
    const keywords = [];
    tfidf.listTerms(i).slice(0, 10).forEach(item => {
      if (item.term.length > 3) {
        keywords.push(item.term);
      }
    });
    return keywords;
  });

  // Simple clustering by keyword overlap
  const clusters = [];
  const used = new Set();

  mentions.forEach((mention, i) => {
    if (used.has(i)) return;

    const cluster = {
      mentions: [mention],
      keywords: mentionKeywords[i].slice(0, 5),
      sentiment: { positive: 0, negative: 0, neutral: 0 }
    };

    cluster.sentiment[mention.sentiment]++;

    // Find similar mentions
    mentions.forEach((otherMention, j) => {
      if (i !== j && !used.has(j)) {
        const overlap = calculateOverlap(mentionKeywords[i], mentionKeywords[j]);
        if (overlap > 0.3) {
          cluster.mentions.push(otherMention);
          cluster.sentiment[otherMention.sentiment]++;
          used.add(j);
        }
      }
    });

    used.add(i);

    // Generate topic name from top keywords
    cluster.topic = cluster.keywords.slice(0, 3).join(' • ');

    clusters.push(cluster);
  });

  return clusters
    .sort((a, b) => b.mentions.length - a.mentions.length)
    .slice(0, numClusters);
}

function calculateOverlap(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

function extractKeywords(text, limit = 5) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'this', 'that']);

  const filtered = tokens.filter(token =>
    token.length > 3 && !stopwords.has(token) && isNaN(token)
  );

  // Count frequency
  const freq = {};
  filtered.forEach(token => {
    freq[token] = (freq[token] || 0) + 1;
  });

  // Sort by frequency
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}
