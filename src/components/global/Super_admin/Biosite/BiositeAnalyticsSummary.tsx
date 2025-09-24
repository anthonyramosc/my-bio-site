import { Eye, MousePointer, TrendingUp } from "lucide-react";

export default function BiositeAnalyticsSummary({
  biositeAnalytics,
}: {
  biositeAnalytics: any;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center">
        <Eye className="w-3 h-3 text-blue-500 mr-1" />
        <span className="text-sm font-semibold text-gray-900">
          {biositeAnalytics.views}
        </span>
        <span className="text-xs text-gray-500 ml-1">vistas</span>
      </div>
      <div className="flex items-center">
        <MousePointer className="w-3 h-3 text-green-500 mr-1" />
        <span className="text-sm font-semibold text-gray-900">
          {biositeAnalytics.clicks}
        </span>
        <span className="text-xs text-gray-500 ml-1">clicks</span>
      </div>
      {biositeAnalytics.views > 0 && (
        <div className="flex items-center">
          <TrendingUp className="w-3 h-3 text-purple-500 mr-1" />
          <span className="text-xs text-gray-600">
            {Math.round(
              (biositeAnalytics.clicks / biositeAnalytics.views) * 100
            )}
            % CTR
          </span>
        </div>
      )}
    </div>
  );
}
