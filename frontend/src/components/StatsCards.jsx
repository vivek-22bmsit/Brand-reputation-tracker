function StatsCards({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  stats.sentiment?.forEach(s => {
    sentimentCounts[s._id] = s.count;
  });

  const total = stats.total || 0;
  const positivePercent = total > 0 ? ((sentimentCounts.positive / total) * 100).toFixed(1) : 0;
  const negativePercent = total > 0 ? ((sentimentCounts.negative / total) * 100).toFixed(1) : 0;

  const cards = [
    {
      title: 'Total Mentions',
      value: total.toLocaleString(),
      icon: '💬',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Positive',
      value: sentimentCounts.positive.toLocaleString(),
      percentage: `${positivePercent}%`,
      icon: '👍',
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Negative',
      value: sentimentCounts.negative.toLocaleString(),
      percentage: `${negativePercent}%`,
      icon: '👎',
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200'
    },
    {
      title: 'Neutral',
      value: sentimentCounts.neutral.toLocaleString(),
      icon: '😐',
      color: 'text-gray-600',
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      borderColor: 'border-gray-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-6 rounded-2xl bg-white shadow-sm border ${card.borderColor} hover:shadow-lg transition-all hover:scale-105 cursor-pointer`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{card.title}</p>
              <p className={`text-4xl font-bold ${card.color} mb-2`}>{card.value}</p>
              {card.percentage && (
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-bold ${card.color}`}>{card.percentage}</span>
                  <span className="text-xs text-gray-500 font-medium">of total</span>
                </div>
              )}
            </div>
            <div className={`${card.bgColor} p-4 rounded-2xl shadow-sm border ${card.borderColor}`}>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
