import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

function MentionsList({ mentions }) {
  const [sortBy, setSortBy] = useState('newest');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  const getSentimentBadge = (sentiment) => {
    const classes = {
      positive: 'bg-green-100 text-green-800 border-green-200',
      negative: 'bg-red-100 text-red-800 border-red-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return classes[sentiment] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSourceIcon = (source) => {
    const icons = {
      newsapi: '📰',
      reddit: '💬',
      rss: '📡',
      youtube: '🎥',
      'google-alerts': '🔔',
      wikimedia: '📖'
    };
    return icons[source] || '📄';
  };

  const getSourceColor = (source) => {
    const colors = {
      newsapi: 'bg-blue-50 text-blue-700 border-blue-200',
      reddit: 'bg-orange-50 text-orange-700 border-orange-200',
      rss: 'bg-purple-50 text-purple-700 border-purple-200',
      youtube: 'bg-red-50 text-red-700 border-red-200',
      'google-alerts': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      wikimedia: 'bg-green-50 text-green-700 border-green-200'
    };
    return colors[source] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (!mentions || mentions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-300 text-7xl mb-4">📭</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Mentions Yet</h3>
        <p className="text-gray-600 mb-2">Data collection runs every 15 minutes</p>
        <p className="text-sm text-gray-500">Next collection cycle will start soon...</p>
      </div>
    );
  }

  // Filter and sort
  let filteredMentions = [...mentions];

  if (filterSentiment !== 'all') {
    filteredMentions = filteredMentions.filter(m => m.sentiment === filterSentiment);
  }

  if (filterSource !== 'all') {
    filteredMentions = filteredMentions.filter(m => m.source === filterSource);
  }

  filteredMentions.sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt);
    const dateB = new Date(b.publishedAt || b.createdAt);
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Mentions</h3>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredMentions.length} of {mentions.length} mentions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-200">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-gray-400 transition-all cursor-pointer"
        >
          <option value="newest">⏰ Newest first</option>
          <option value="oldest">📅 Oldest first</option>
        </select>

        <select
          value={filterSentiment}
          onChange={(e) => setFilterSentiment(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-gray-400 transition-all cursor-pointer"
        >
          <option value="all">All sentiments</option>
          <option value="positive">👍 Positive</option>
          <option value="negative">👎 Negative</option>
          <option value="neutral">😐 Neutral</option>
        </select>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-gray-400 transition-all cursor-pointer"
        >
          <option value="all">All sources</option>
          <option value="newsapi">📰 News</option>
          <option value="reddit">💬 Reddit</option>
          <option value="rss">📡 RSS</option>
          <option value="youtube">🎥 YouTube</option>
        </select>
      </div>

      {/* Mentions */}
      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
        {filteredMentions.map((mention) => (
          <div
            key={mention._id}
            className="p-5 border border-gray-200 rounded-2xl hover:shadow-md hover:border-blue-300 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getSourceColor(mention.source)}`}>
                  <span className="mr-1.5">{getSourceIcon(mention.source)}</span>
                  {mention.source.toUpperCase()}
                </span>
              </div>
              <span className={`px-3 py-1.5 text-xs rounded-full font-semibold border ${getSentimentBadge(mention.sentiment)}`}>
                {mention.sentiment === 'positive' ? '👍' : mention.sentiment === 'negative' ? '👎' : '😐'} {mention.sentiment.charAt(0).toUpperCase() + mention.sentiment.slice(1)}
              </span>
            </div>

            {mention.title && (
              <h4 className="font-semibold text-gray-900 mb-2 text-base leading-snug">{mention.title}</h4>
            )}

            <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
              {mention.text.slice(0, 200)}{mention.text.length > 200 ? '...' : ''}
            </p>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                {formatDistanceToNow(new Date(mention.publishedAt || mention.createdAt), { addSuffix: true })}
              </span>
              {mention.url && (
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>View source</span>
                  <span>→</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MentionsList;
