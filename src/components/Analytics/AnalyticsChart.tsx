import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { DailyActivity, TimeRange } from '../../service/analyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsChartProps {
  dailyActivity?: DailyActivity[];
  loading?: boolean;
  timeRange?: TimeRange;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  dailyActivity = [], 
  loading = false,
  timeRange = 'last7'
}) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: '#333333'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#383838',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: '#4b5563',
        borderWidth: 1
      }
    }
  };

  const labels = dailyActivity.map(day => day.day);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Vistas',
        data: dailyActivity.map(day => day.views),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Clicks',
        data: dailyActivity.map(day => day.clicks),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-[#232323] rounded-xl p-6 mt-2 shadow-md h-64 flex flex-col items-center justify-center">
        <div className="animate-pulse text-gray-400">
          Cargando datos de actividad...
        </div>
      </div>
    );
  }

  // Get title based on timeRange
  const getChartTitle = () => {
    switch (timeRange) {
      case 'last7':
        return 'Actividad en los últimos 7 días';
      case 'last30':
        return 'Actividad en los últimos 30 días';
      case 'lastYear':
        return 'Actividad anual por mes';
      default:
        return 'Actividad';
    }
  };

  return (
    <div className="bg-[#232323] rounded-xl p-6 mt-2 shadow-md h-64">
      <div className="text-gray-400 mb-2 text-sm">{getChartTitle()}</div>
      {dailyActivity.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          No hay datos de actividad disponibles
        </div>
      ) : (
        <div className="w-full h-full">
          <Bar options={chartOptions} data={data} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
