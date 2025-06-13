import React from 'react';
import type { TimeRange } from '../../service/analyticsService';

interface AnalyticsHeaderProps {
  timeRange?: TimeRange;
  onRangeChange?: (range: TimeRange) => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ 
  timeRange = 'last7', 
  onRangeChange 
}) => {
  const handleRangeChange = (range: TimeRange) => {
    if (onRangeChange) {
      onRangeChange(range);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>
      
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm hidden sm:inline">Overview of your site performance</span>
        
        <div className="bg-[#232323] rounded-lg p-1 flex text-sm">
          <button
            className={`px-3 py-1 rounded-md transition-colors ${
              timeRange === 'last7' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-[#333333] hover:text-gray-300'
            }`}
            onClick={() => handleRangeChange('last7')}
          >
            7 días
          </button>
          <button
            className={`px-3 py-1 rounded-md transition-colors ${
              timeRange === 'last30' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-[#333333] hover:text-gray-300'
            }`}
            onClick={() => handleRangeChange('last30')}
          >
            30 días
          </button>
          <button
            className={`px-3 py-1 rounded-md transition-colors ${
              timeRange === 'lastYear' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-[#333333] hover:text-gray-300'
            }`}
            onClick={() => handleRangeChange('lastYear')}
          >
            Anual
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
