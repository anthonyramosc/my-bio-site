import React, { useEffect, useState } from 'react';
import AnalyticsHeader from '../components/Analytics/AnalyticsHeader';
import AnalyticsCard from '../components/Analytics/AnalyticsCard';
import AnalyticsChart from '../components/Analytics/AnalyticsChart';
import { Eye, Link } from 'lucide-react';
import { useAuthContext } from '../hooks/useAuthContext';
import analyticsService from '../service/analyticsService';
import type { UserAnalytics, TimeRange } from '../service/analyticsService';

const AnalyticsPage: React.FC = () => {
  const { userId } = useAuthContext();
  const [userStats, setUserStats] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('last7');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getUserAnalytics(userId, timeRange);
        setUserStats(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('No se pudieron cargar los datos analíticos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [userId, timeRange]);

  const handleRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  return (
    <div className="p-8 min-h-screen bg-[#1a1a1a]">
      <AnalyticsHeader 
        timeRange={timeRange} 
        onRangeChange={handleRangeChange} 
      />
      
      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-6 text-white">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsCard
          title="Vistas"
          value={loading ? '...' : userStats?.views ?? 0}
          icon={<Eye />}
        />
        <AnalyticsCard
          title="Clicks"
          value={loading ? '...' : userStats?.clicks ?? 0}
          icon={<Link />}
          clickDetails={userStats?.clickDetails}
        />
      </div>
      <div className="mt-8">
        <div className="text-white text-lg font-semibold mb-2">
          Biosite: {loading ? '...' : userStats?.username ?? 'No Biosite'}
        </div>
        <AnalyticsChart 
          dailyActivity={userStats?.dailyActivity} 
          loading={loading}
          timeRange={timeRange}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
