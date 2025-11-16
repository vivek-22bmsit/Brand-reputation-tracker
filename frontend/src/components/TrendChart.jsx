import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchTrendData } from '../services/api';
import { format } from 'date-fns';

function TrendChart({ brandId }) {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['trends', brandId],
    queryFn: () => fetchTrendData(brandId, '24h'),
    enabled: !!brandId
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-80 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Sentiment Trends</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 24 hours</span>
        </div>
        <div className="flex justify-center items-center h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <div className="text-center">
            <div className="text-5xl mb-3">📈</div>
            <p className="text-gray-500 font-medium">Collecting trend data...</p>
            <p className="text-sm text-gray-400 mt-2">Data will appear as mentions are gathered</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for chart
  const chartData = {};
  trends.forEach(item => {
    const hour = item._id.hour;
    if (!chartData[hour]) {
      chartData[hour] = { time: hour, positive: 0, negative: 0, neutral: 0 };
    }
    chartData[hour][item._id.sentiment] = item.count;
  });

  const data = Object.values(chartData).map(d => ({
    ...d,
    time: format(new Date(d.time), 'HH:mm')
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sentiment Trends</h3>
          <p className="text-sm text-gray-500 mt-1">Mention sentiment over time</p>
        </div>
        <span className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full font-medium border border-blue-100">
          Last 24 hours
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            style={{ fontSize: '13px', fontWeight: '500' }}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '13px', fontWeight: '500' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '14px', fontWeight: '500', paddingTop: '10px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="positive"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 7 }}
            name="Positive"
          />
          <Line
            type="monotone"
            dataKey="negative"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 5, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 7 }}
            name="Negative"
          />
          <Line
            type="monotone"
            dataKey="neutral"
            stroke="#6b7280"
            strokeWidth={3}
            dot={{ fill: '#6b7280', r: 5, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 7 }}
            name="Neutral"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
