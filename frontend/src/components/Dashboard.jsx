import { useQuery } from '@tanstack/react-query';
import { fetchMentions, fetchMentionStats, fetchAlerts } from '../services/api';
import StatsCards from './StatsCards';
import TrendChart from './TrendChart';
import MentionsList from './MentionsList';

function Dashboard({ brand }) {
  const { data: mentions, isLoading: mentionsLoading } = useQuery({
    queryKey: ['mentions', brand._id],
    queryFn: () => fetchMentions(brand._id),
    enabled: !!brand,
    refetchInterval: 30000
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', brand._id],
    queryFn: () => fetchMentionStats(brand._id),
    enabled: !!brand,
    refetchInterval: 30000
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts', brand._id],
    queryFn: () => fetchAlerts(brand._id),
    enabled: !!brand,
    refetchInterval: 15000
  });

  if (mentionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Live Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Monitoring: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{brand.name}</span>
          </h2>
          <p className="text-gray-500 mt-1">Real-time brand reputation tracking and analysis</p>
        </div>
        <div className="flex items-center space-x-2.5 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
          <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
          <span className="text-green-700 font-semibold text-sm">Live Monitoring</span>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-l-4 border-yellow-500 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start space-x-4">
            <span className="text-yellow-600 text-3xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-1 text-lg">{alerts[0].title}</h3>
              <p className="text-sm text-yellow-800">{alerts[0].message}</p>
            </div>
            <button className="text-yellow-700 hover:text-yellow-900 text-sm font-semibold px-4 py-2 hover:bg-yellow-100 rounded-lg transition-all">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <TrendChart brandId={brand._id} />

      {/* Mentions List */}
      <MentionsList mentions={mentions || []} />
    </div>
  );
}

export default Dashboard;
