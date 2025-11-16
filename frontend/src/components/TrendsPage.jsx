import { useQuery } from '@tanstack/react-query';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';
import { fetchTrendData, fetchMentionStats } from '../services/api';
import { format } from 'date-fns';

function TrendsPage({ brand }) {
  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends', brand._id, '7d'],
    queryFn: () => fetchTrendData(brand._id, '7d'),
    enabled: !!brand._id,
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', brand._id],
    queryFn: () => fetchMentionStats(brand._id),
    enabled: !!brand._id,
    refetchInterval: 60000
  });

  if (trendsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Transform trend data for charts
  const transformTrendData = () => {
    if (!trends || trends.length === 0) return [];

    const chartData = {};
    trends.forEach(item => {
      const dateKey = new Date(item._id.hour).toISOString().split('T')[0];
      if (!chartData[dateKey]) {
        chartData[dateKey] = {
          date: dateKey,
          positive: 0,
          negative: 0,
          neutral: 0,
          total: 0
        };
      }
      chartData[dateKey][item._id.sentiment] += item.count;
      chartData[dateKey].total += item.count;
    });

    return Object.values(chartData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({
        ...d,
        date: format(new Date(d.date), 'MMM dd')
      }));
  };

  const chartData = transformTrendData();

  // Calculate trend direction (comparing last 2 days)
  const calculateTrend = (data, key) => {
    if (data.length < 2) return { change: 0, direction: 'neutral' };
    const latest = data[data.length - 1]?.[key] || 0;
    const previous = data[data.length - 2]?.[key] || 0;
    if (previous === 0) return { change: 0, direction: 'neutral' };
    const change = ((latest - previous) / previous * 100).toFixed(1);
    return {
      change: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const positiveTrend = calculateTrend(chartData, 'positive');
  const negativeTrend = calculateTrend(chartData, 'negative');
  const neutralTrend = calculateTrend(chartData, 'neutral');
  const volumeTrend = calculateTrend(chartData, 'total');

  // Calculate sentiment distribution
  const sentimentDistribution = stats?.sentiment || [];
  const pieData = sentimentDistribution.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    percentage: ((item.count / stats?.total) * 100).toFixed(1)
  }));

  // Source breakdown
  const sourceData = stats?.sources?.map(item => ({
    name: item._id.toUpperCase(),
    mentions: item.count,
    percentage: ((item.count / stats?.total) * 100).toFixed(1)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Trends & Analytics</h1>
          <p className="text-gray-600">Track sentiment trends and mention patterns for <span className="font-semibold text-blue-600">{brand.name}</span></p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700">
            Last 7 Days
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards with Trend Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Volume Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">📊</span>
            <span className="text-blue-600 font-semibold text-sm bg-white px-3 py-1 rounded-full">Volume</span>
          </div>
          <div className="text-3xl font-bold text-blue-700 mb-2">
            {stats?.total || 0}
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
              volumeTrend.direction === 'up' ? 'bg-green-100 text-green-700' :
              volumeTrend.direction === 'down' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {volumeTrend.direction === 'up' && '↗️'}
              {volumeTrend.direction === 'down' && '↘️'}
              {volumeTrend.direction === 'neutral' && '→'}
              {volumeTrend.change}%
            </span>
            <span className="text-xs text-gray-600">vs yesterday</span>
          </div>
        </div>

        {/* Positive Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">😊</span>
            <span className="text-green-600 font-semibold text-sm bg-white px-3 py-1 rounded-full">Positive</span>
          </div>
          <div className="text-3xl font-bold text-green-700 mb-2">
            {pieData.find(d => d.name === 'Positive')?.value || 0}
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
              positiveTrend.direction === 'up' ? 'bg-green-100 text-green-700' :
              positiveTrend.direction === 'down' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {positiveTrend.direction === 'up' && '↗️'}
              {positiveTrend.direction === 'down' && '↘️'}
              {positiveTrend.direction === 'neutral' && '→'}
              {positiveTrend.change}%
            </span>
            <span className="text-xs text-green-600">{pieData.find(d => d.name === 'Positive')?.percentage || 0}% total</span>
          </div>
        </div>

        {/* Neutral Card */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">😐</span>
            <span className="text-gray-600 font-semibold text-sm bg-white px-3 py-1 rounded-full">Neutral</span>
          </div>
          <div className="text-3xl font-bold text-gray-700 mb-2">
            {pieData.find(d => d.name === 'Neutral')?.value || 0}
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
              neutralTrend.direction === 'up' ? 'bg-green-100 text-green-700' :
              neutralTrend.direction === 'down' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {neutralTrend.direction === 'up' && '↗️'}
              {neutralTrend.direction === 'down' && '↘️'}
              {neutralTrend.direction === 'neutral' && '→'}
              {neutralTrend.change}%
            </span>
            <span className="text-xs text-gray-600">{pieData.find(d => d.name === 'Neutral')?.percentage || 0}% total</span>
          </div>
        </div>

        {/* Negative Card */}
        <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">😞</span>
            <span className="text-red-600 font-semibold text-sm bg-white px-3 py-1 rounded-full">Negative</span>
          </div>
          <div className="text-3xl font-bold text-red-700 mb-2">
            {pieData.find(d => d.name === 'Negative')?.value || 0}
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
              negativeTrend.direction === 'up' ? 'bg-red-100 text-red-700' :
              negativeTrend.direction === 'down' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {negativeTrend.direction === 'up' && '↗️'}
              {negativeTrend.direction === 'down' && '↘️'}
              {negativeTrend.direction === 'neutral' && '→'}
              {negativeTrend.change}%
            </span>
            <span className="text-xs text-red-600">{pieData.find(d => d.name === 'Negative')?.percentage || 0}% total</span>
          </div>
        </div>
      </div>

      {/* Main Sentiment Trend Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Sentiment Trend Lines</h3>
          <p className="text-sm text-gray-500">Track sentiment changes over time</p>
        </div>

        {chartData.length === 0 ? (
          <div className="flex justify-center items-center h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center">
              <div className="text-5xl mb-3">📈</div>
              <p className="text-gray-500 font-medium">Collecting trend data...</p>
              <p className="text-sm text-gray-400 mt-2">Data will appear as mentions are gathered</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '13px', fontWeight: '500' }}
                tickLine={false}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '13px', fontWeight: '500' }}
                tickLine={false}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}
                itemStyle={{ padding: '4px 0' }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                iconType="line"
                iconSize={20}
              />
              <Line
                type="monotone"
                dataKey="positive"
                stroke="#10b981"
                strokeWidth={3}
                dot={{
                  fill: '#10b981',
                  r: 5,
                  strokeWidth: 3,
                  stroke: 'white',
                  filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
                }}
                activeDot={{
                  r: 7,
                  fill: '#10b981',
                  stroke: 'white',
                  strokeWidth: 3,
                  filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.4))'
                }}
                name="Positive Sentiment"
                strokeLinecap="round"
              />
              <Line
                type="monotone"
                dataKey="negative"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{
                  fill: '#ef4444',
                  r: 5,
                  strokeWidth: 3,
                  stroke: 'white',
                  filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
                }}
                activeDot={{
                  r: 7,
                  fill: '#ef4444',
                  stroke: 'white',
                  strokeWidth: 3,
                  filter: 'drop-shadow(0 4px 6px rgba(239, 68, 68, 0.4))'
                }}
                name="Negative Sentiment"
                strokeLinecap="round"
              />
              <Line
                type="monotone"
                dataKey="neutral"
                stroke="#6b7280"
                strokeWidth={3}
                dot={{
                  fill: '#6b7280',
                  r: 5,
                  strokeWidth: 3,
                  stroke: 'white',
                  filter: 'drop-shadow(0 2px 4px rgba(107, 114, 128, 0.3))'
                }}
                activeDot={{
                  r: 7,
                  fill: '#6b7280',
                  stroke: 'white',
                  strokeWidth: 3,
                  filter: 'drop-shadow(0 4px 6px rgba(107, 114, 128, 0.4))'
                }}
                name="Neutral Sentiment"
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Volume and Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mention Volume */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Mention Volume</h3>
            <p className="text-sm text-gray-500">Daily mention count</p>
          </div>
          {chartData.length === 0 ? (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
              <p className="text-gray-400">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '10px'
                  }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sources Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sources Breakdown</h3>
            <p className="text-sm text-gray-500">Mentions by platform</p>
          </div>
          {sourceData.length === 0 ? (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
              <p className="text-gray-400">No source data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sourceData.map((source, index) => {
                const colors = {
                  YOUTUBE: 'bg-red-500',
                  NEWSAPI: 'bg-blue-500',
                  REDDIT: 'bg-orange-500',
                  RSS: 'bg-green-500'
                };
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{source.name}</span>
                        <span className="text-sm text-gray-600">{source.mentions} ({source.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${colors[source.name] || 'bg-purple-500'} rounded-full transition-all duration-500`}
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrendsPage;
