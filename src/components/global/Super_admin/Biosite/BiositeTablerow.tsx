import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";
import type {
  BiositeFull,
  LinkData,
  TimeRange,
} from "../../../../interfaces/AdminData";
import Loading from "../../../shared/Loading";
import BiositeAnalyticsSummary from "./BiositeAnalyticsSummary";
import ExpandedAnalytics from "./ExpandedAnalytics";
import ExpandedBiositeDetails from "./ExpandedBiositeDetails";

export default function BiositeTableRow({
  biosite,
  isExpanded,
  businessCards,
  loadingCards,
  analyticsData,
  loadingAnalytics,
  showAnalytics,
  toggleAnalytics,
  formatDate,
  toggleBiositeExpansion,
  setShowAnalytics,
  analyticsTimeRange,
  setAnalyticsTimeRange,
  setAnalyticsData,
  fetchBiositeAnalytics,
  parseVCardData,
  biositeLinks,
  loadingBiositeLinks,
}: {
  biosite: BiositeFull;
  isExpanded: boolean;
  businessCards: { [key: string]: any };
  loadingCards: { [key: string]: boolean };
  analyticsData: { [key: string]: any };
  loadingAnalytics: { [key: string]: boolean };
  showAnalytics: { [key: string]: boolean };
  toggleAnalytics: (biositeId: string, ownerId: string) => void;
  formatDate: (dateString?: string) => string;
  toggleBiositeExpansion: (biositeId: string) => void;
  setShowAnalytics: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  analyticsTimeRange: TimeRange;
  setAnalyticsTimeRange: (range: TimeRange) => void;
  setAnalyticsData: React.Dispatch<
    React.SetStateAction<{ [key: string]: any }>
  >;
  fetchBiositeAnalytics: (biositeId: string, ownerId: string) => void;
  parseVCardData: (businessCard: any) => any;
  biositeLinks: { [key: string]: LinkData[] };
  loadingBiositeLinks: { [key: string]: boolean };
}) {
  const userBusinessCard = businessCards[biosite.ownerId];
  const isLoadingCard = loadingCards[biosite.ownerId];
  const biositeAnalytics = analyticsData[biosite.id];
  const isLoadingAnalytics = loadingAnalytics[biosite.id];
  const isShowingAnalytics = showAnalytics[biosite.id];

  return (
    <>
      <tr className="hover:bg-gray-50 sr-only sm:not-sr-only">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {biosite.title || "Sin título"}
              </div>
              <div className="text-xs text-green-600 font-medium">
                VESITE HIJO
              </div>
              <div className="text-xs text-gray-500">
                ID: {biosite.id.substring(0, 8)}...
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="bg-blue-100 p-1 rounded-full mr-2">
              <Users className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {biosite.owner?.name ||
                  biosite.owner?.email ||
                  "Usuario desconocido"}
              </div>
              {biosite.owner?.email && biosite.owner?.name && (
                <div className="text-xs text-gray-500">
                  {biosite.owner.email}
                </div>
              )}
              {biosite.owner?.cedula && (
                <div className="text-xs text-gray-400">
                  CI: {biosite.owner.cedula}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm font-mono text-gray-600">
            {biosite.slug ? `/${biosite.slug}` : "Sin slug"}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {isLoadingAnalytics ? (
            <Loading />
          ) : biositeAnalytics ? (
            <BiositeAnalyticsSummary biositeAnalytics={biositeAnalytics} />
          ) : (
            <button
              onClick={() => toggleAnalytics(biosite.id, biosite.ownerId)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Ver analytics
            </button>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              biosite.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {biosite.isActive ? (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Activo
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Inactivo
              </>
            )}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(biosite.createdAt)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => toggleBiositeExpansion(biosite.id)}
              className="text-indigo-600 hover:text-indigo-900 flex items-center cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Ocultar
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Ver detalles
                </>
              )}
            </button>

            {biositeAnalytics && (
              <button
                onClick={() =>
                  setShowAnalytics((prev) => ({
                    ...prev,
                    [biosite.id]: !prev[biosite.id],
                  }))
                }
                className="text-blue-600 hover:text-blue-900 flex items-center text-xs cursor-pointer"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                {isShowingAnalytics ? "Ocultar analytics" : "Ver analytics"}
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Analytics expanded view */}
      {isShowingAnalytics && biositeAnalytics && (
        <ExpandedAnalytics
          analyticsTimeRange={analyticsTimeRange}
          setAnalyticsTimeRange={setAnalyticsTimeRange}
          setAnalyticsData={setAnalyticsData}
          fetchBiositeAnalytics={fetchBiositeAnalytics}
          biositeAnalytics={biositeAnalytics}
          biosite={biosite}
        />
      )}

      {/* Expanded biosite details */}
      {isExpanded && (
        <ExpandedBiositeDetails
          ischild
          biosite={biosite}
          userBusinessCard={userBusinessCard}
          isLoadingCard={isLoadingCard}
          biositeLinks={biositeLinks}
          loadingBiositeLinks={loadingBiositeLinks}
          formatDate={formatDate}
          parseVCardData={parseVCardData}
        />
      )}
    </>
  );
}
