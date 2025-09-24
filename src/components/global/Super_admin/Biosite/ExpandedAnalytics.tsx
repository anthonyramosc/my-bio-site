import { BarChart3, Eye, MousePointer, TrendingUp } from "lucide-react";
import type { TimeRange } from "../../../../interfaces/AdminData";

export default function ExpandedAnalytics({
  analyticsTimeRange,
  setAnalyticsTimeRange,
  setAnalyticsData,
  fetchBiositeAnalytics,
  biositeAnalytics,
  biosite,
}: {
  analyticsTimeRange: TimeRange;
  setAnalyticsTimeRange: (range: TimeRange) => void;
  setAnalyticsData: React.Dispatch<
    React.SetStateAction<{ [key: string]: any }>
  >;
  fetchBiositeAnalytics: (biositeId: string, ownerId: string) => void;
  biositeAnalytics: any;
  biosite: any;
}) {
  return (
    <tr>
      <td
        colSpan={8}
        className="px-6 py-4 bg-blue-50 border-l-4 border-blue-500"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-blue-800 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics del Biosite Hijo (
              {analyticsTimeRange === "last7"
                ? "Últimos 7 días"
                : analyticsTimeRange === "last30"
                ? "Últimos 30 días"
                : "Último año"}
              )
            </h4>
            <div className="mb-4 flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Rango de tiempo para analytics:
              </label>
              <select
                value={analyticsTimeRange}
                onChange={(e) => {
                  setAnalyticsTimeRange(e.target.value as TimeRange);
                  setAnalyticsData({});
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="last7">Últimos 7 días</option>
                <option value="last30">Últimos 30 días</option>
                <option value="lastYear">Último año</option>
              </select>
            </div>
            <button
              onClick={() => fetchBiositeAnalytics(biosite.id, biosite.ownerId)}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Actualizar
            </button>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Total Vistas</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {biositeAnalytics.views}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded border">
              <div className="flex items-center">
                <MousePointer className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Total Clicks</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {biositeAnalytics.clicks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded border">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">CTR</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {biositeAnalytics.views > 0
                      ? Math.round(
                          (biositeAnalytics.clicks / biositeAnalytics.views) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily activity */}
          {biositeAnalytics.dailyActivity &&
            biositeAnalytics.dailyActivity.length > 0 && (
              <div className="bg-white p-4 rounded border">
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Actividad{" "}
                  {analyticsTimeRange === "lastYear" ? "Mensual" : "Diaria"}
                </h5>
                <div className="max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {biositeAnalytics.dailyActivity
                      .slice(0, 7)
                      .map((activity, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-600">
                            {activity.day}
                          </span>
                          <div className="flex space-x-4 text-sm">
                            <span className="flex items-center text-blue-600">
                              <Eye className="w-3 h-3 mr-1" />
                              {activity.views}
                            </span>
                            <span className="flex items-center text-green-600">
                              <MousePointer className="w-3 h-3 mr-1" />
                              {activity.clicks}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

          {/* Click details */}
          {biositeAnalytics.clickDetails &&
            biositeAnalytics.clickDetails.length > 0 && (
              <div className="bg-white p-4 rounded border">
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Clicks por Link
                </h5>
                <div className="max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {biositeAnalytics.clickDetails
                      .slice(0, 10)
                      .map((click, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-600 truncate">
                            {click.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {click.count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </td>
    </tr>
  );
}
