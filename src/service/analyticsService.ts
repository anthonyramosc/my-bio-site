import api from "./api";
import type { ClickDetail } from "../components/Analytics/AnalyticsCard";

export type TimeRange = 'last7' | 'last30' | 'lastYear';

export interface DailyActivity {
  day: string;
  views: number;
  clicks: number;
}

export interface UserAnalytics {
  userId: string;
  username: string;
  views: number;
  clicks: number;
  clickDetails: ClickDetail[];
  dailyActivity?: DailyActivity[];
  timeRange: TimeRange;
}

const analyticsService = {
  /**
   * Get visit and click analytics for the logged in user's biosites
   * Uses the new analytics API endpoint for efficient data retrieval
   * @param userId The user ID to get analytics for
   * @param timeRange Optional time range to filter data (last7, last30, lastYear)
   */
  getUserAnalytics: async (userId: string, timeRange: TimeRange = 'last7'): Promise<UserAnalytics> => {
    if (!userId) {
      return {
        userId: '',
        username: 'No usuario',
        views: 0,
        clicks: 0,
        clickDetails: [],
        dailyActivity: [],
        timeRange
      };
    }
    
    try {
      // Use the new analytics endpoint that aggregates data on the server
      const response = await api.get(`/biosites/analytics/${userId}`, {
        params: { timeRange }
      });
      const data = response.data;
      
      if (!data) {
        return {
          userId,
          username: 'No Biosite',
          views: 0,
          clicks: 0,
          clickDetails: [],
          dailyActivity: [],
          timeRange
        };
      }
      
      // If the backend doesn't provide daily activity (older version), simulate it
      if (!data.dailyActivity) {
        // Create simulated daily activity data
        const today = new Date();
        const dailyActivity: DailyActivity[] = [];
        
        // Number of days to show based on time range
        const daysToShow = timeRange === 'last7' ? 7 : 
                          timeRange === 'last30' ? 30 : 365;
        
        // Only show up to 30 days in chart even for yearly data
        const dataPoints = timeRange === 'lastYear' ? 12 : 
                          timeRange === 'last30' ? 30 : 7;
        
        // Generate data for the selected period
        for (let i = dataPoints - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i * (daysToShow / dataPoints));
          
          // Format label based on time range
          let day = '';
          if (timeRange === 'lastYear') {
            day = date.toLocaleDateString('es-ES', { month: 'short' });
          } else {
            day = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
          }
          
          // Generate realistic random data based on total counts
          const viewPercent = Math.random() * 0.3 + 0.05; // 5% to 35% of total views
          const clickPercent = Math.random() * 0.3 + 0.05; // 5% to 35% of total clicks
          
          dailyActivity.push({
            day,
            views: Math.round((data.views || 0) * viewPercent / dataPoints),
            clicks: Math.round((data.clicks || 0) * clickPercent / dataPoints)
          });
        }
        
        data.dailyActivity = dailyActivity;
      }
      
      return {
        userId,
        username: data.biositeSlug || 'user-biosite',
        views: data.views || 0,
        clicks: data.clicks || 0,
        clickDetails: data.clickDetails || [],
        dailyActivity: data.dailyActivity || [],
        timeRange
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return {
        userId,
        username: 'Error',
        views: 0,
        clicks: 0,
        clickDetails: [],
        dailyActivity: [],
        timeRange
      };
    }
  },
};

export default analyticsService;
