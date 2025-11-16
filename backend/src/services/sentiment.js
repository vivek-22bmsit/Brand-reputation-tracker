import Sentiment from 'sentiment';
import natural from 'natural';

const sentimentAnalyzer = new Sentiment();
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

/**
 * Analyze sentiment of text using local libraries (FREE)
 * No API keys required
 */
export async function analyzeSentiment(text) {
  try {
    if (!text || text.trim().length === 0) {
      return { sentiment: 'neutral', sentimentScore: 0, confidence: 0 };
    }

    // Method 1: Sentiment library (lexicon-based)
    const result1 = sentimentAnalyzer.analyze(text);

    // Method 2: Natural library (classifier-based)
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const score2 = analyzer.getSentiment(tokens);

    // Combine both scores for better accuracy
    const combinedScore = (normalizeScore(result1.score) + score2) / 2;

    // Classify sentiment
    let sentiment = 'neutral';
    if (combinedScore > 0.1) sentiment = 'positive';
    else if (combinedScore < -0.1) sentiment = 'negative';

    return {
      sentiment,
      sentimentScore: parseFloat(combinedScore.toFixed(3)),
      confidence: parseFloat(Math.abs(combinedScore).toFixed(3))
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error.message);
    return { sentiment: 'neutral', sentimentScore: 0, confidence: 0 };
  }
}

/**
 * Normalize sentiment library score (-10 to +10) to -1 to +1
 */
function normalizeScore(score) {
  return Math.max(-1, Math.min(1, score / 10));
}

/**
 * Batch analyze for efficiency
 */
export async function analyzeSentimentBatch(texts) {
  return Promise.all(texts.map(text => analyzeSentiment(text)));
}
