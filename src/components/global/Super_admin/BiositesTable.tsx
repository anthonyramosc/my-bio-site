import React, {useCallback} from "react";
import Pagination from "./Pagination.tsx";
import {
    Users,
    Globe,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    Calendar,
    BarChart3,
    TrendingUp,
    MousePointer,
} from "lucide-react";
import type {
    BiositeFull,
    BiositesTableProps,
} from "../../../interfaces/AdminData.ts";
import Loading from "../../shared/Loading.tsx";
import ExpandedAnalytics from "./Biosite/ExpandedAnalytics.tsx";
import ExpandedBiositeDetails from "./Biosite/ExpandedBiositeDetails.tsx";

export const BiositesTable: React.FC<BiositesTableProps> = ({
                                                                pagination,
                                                                biositeLinks,
                                                                loadingBiositeLinks,
                                                                analyticsData,
                                                                loadingAnalytics,
                                                                showAnalytics,
                                                                analyticsTimeRange,
                                                                expandedBiosite,
                                                                businessCards,
                                                                loadingCards,
                                                                toggleBiositeExpansion,
                                                                toggleAnalytics,
                                                                fetchBiositeAnalytics,
                                                                setAnalyticsTimeRange,
                                                                setShowAnalytics,
                                                                setAnalyticsData,
                                                                formatDate,
                                                                parseVCardData,
                                                                fetchBusinessCard,
                                                            }) => {

    const handleToggleBiositeExpansion = useCallback(
        (biositeId: string) => {
            const wasExpanded = expandedBiosite === biositeId;
            toggleBiositeExpansion(biositeId);

            if (!wasExpanded) {
                const biosite = pagination.data.find((b) => b.id === biositeId);
                if (biosite?.ownerId) {
                    fetchBusinessCard(biosite.ownerId);
                }
            }
        },
        [expandedBiosite, toggleBiositeExpansion, pagination.data, fetchBusinessCard]
    );

    if (!pagination.data || pagination.data.length === 0) {
        return (
            <div className="text-center py-8 px-4">
                <p className="text-gray-500 text-sm sm:text-base">No hay biosites para mostrar</p>
            </div>
        );
    }

    return (
        <div className="px-2 sm:px-0">
            <div className="mb-4">
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.pageSize}
                    totalItems={pagination.totalItems}
                    loading={pagination.loading}
                    canGoNext={pagination.canGoNext}
                    canGoPrev={pagination.canGoPrev}
                    visiblePages={pagination.visiblePages}
                    pageInfo={pagination.pageInfo}
                    onPageChange={pagination.setPage}
                    onPageSizeChange={pagination.setPageSize}
                    onFirst={pagination.goToFirstPage}
                    onLast={pagination.goToLastPage}
                    onNext={pagination.nextPage}
                    onPrev={pagination.prevPage}
                    totalUnfilteredItems={pagination.totalUnfilteredItems}
                />
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4 mb-4">
                {pagination.data.map((biosite: BiositeFull) => {
                    const isExpanded = expandedBiosite === biosite.id;
                    const userBusinessCard = businessCards[biosite.ownerId];
                    const isLoadingCard = loadingCards[biosite.ownerId];
                    const biositeAnalytics = analyticsData[biosite.id];
                    const isLoadingAnalytics = loadingAnalytics[biosite.id];
                    const isShowingAnalytics = showAnalytics[biosite.id];

                    return (
                        <div key={biosite.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center flex-1 min-w-0">
                                    <Globe className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {biosite.title || "Sin título"}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">
                                            ID: {biosite.id}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleBiositeExpansion(biosite.id)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 flex-shrink-0"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-500 flex-shrink-0">Usuario:</span>
                                    <div className="text-right min-w-0 flex-1 ml-2">
                                        <div className="text-gray-900 font-medium truncate">
                                            {biosite.owner?.name || biosite.owner?.email || "Usuario desconocido"}
                                        </div>
                                        {biosite.owner?.email && biosite.owner?.name && (
                                            <div className="text-gray-500 truncate">{biosite.owner.email}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">Slug:</span>
                                    <span className="text-gray-900 font-mono truncate ml-2">
                      {biosite.slug ? `/${biosite.slug}` : "Sin slug"}
                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Estado:</span>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500">Creado:</span>
                                    <span className="text-gray-900">{formatDate(biosite.createdAt)}</span>
                                </div>
                            </div>

                            {/* Analytics section for mobile */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                {isLoadingAnalytics ? (
                                    <div className="flex justify-center">
                                        <Loading />
                                    </div>
                                ) : biositeAnalytics ? (
                                    <div>
                                        <div className="grid grid-cols-3 gap-2 text-center mb-2">
                                            <div className="bg-blue-50 p-2 rounded">
                                                <div className="text-xs text-blue-600">Vistas</div>
                                                <div className="text-sm font-semibold text-blue-800">
                                                    {biositeAnalytics.views}
                                                </div>
                                            </div>
                                            <div className="bg-green-50 p-2 rounded">
                                                <div className="text-xs text-green-600">Clicks</div>
                                                <div className="text-sm font-semibold text-green-800">
                                                    {biositeAnalytics.clicks}
                                                </div>
                                            </div>
                                            <div className="bg-purple-50 p-2 rounded">
                                                <div className="text-xs text-purple-600">CTR</div>
                                                <div className="text-sm font-semibold text-purple-800">
                                                    {biositeAnalytics.views > 0
                                                        ? Math.round((biositeAnalytics.clicks / biositeAnalytics.views) * 100)
                                                        : 0}%
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setShowAnalytics((prev) => ({
                                                    ...prev,
                                                    [biosite.id]: !prev[biosite.id],
                                                }))
                                            }
                                            className="w-full text-blue-600 hover:text-blue-900 text-xs text-center py-1"
                                        >
                                            <BarChart3 className="w-3 h-3 inline mr-1" />
                                            {isShowingAnalytics ? "Ocultar analytics" : "Ver analytics detallados"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => toggleAnalytics(biosite.id, biosite.ownerId)}
                                        className="w-full text-blue-600 hover:text-blue-800 text-xs text-center py-2 border border-blue-200 rounded"
                                    >
                                        <BarChart3 className="w-4 h-4 inline mr-1" />
                                        Ver analytics
                                    </button>
                                )}
                            </div>

                            {/* Mobile expanded content */}
                            {(isExpanded || isShowingAnalytics) && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                    {isShowingAnalytics && biositeAnalytics && (
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Analytics Detallados</h4>
                                            <ExpandedAnalytics
                                                analyticsTimeRange={analyticsTimeRange}
                                                setAnalyticsTimeRange={setAnalyticsTimeRange}
                                                setAnalyticsData={setAnalyticsData}
                                                fetchBiositeAnalytics={fetchBiositeAnalytics}
                                                biositeAnalytics={biositeAnalytics}
                                                biosite={biosite}
                                            />
                                        </div>
                                    )}

                                    {isExpanded && (
                                        <div>
                                            <ExpandedBiositeDetails
                                                biosite={biosite}
                                                userBusinessCard={userBusinessCard}
                                                isLoadingCard={isLoadingCard}
                                                biositeLinks={biositeLinks}
                                                loadingBiositeLinks={loadingBiositeLinks}
                                                formatDate={formatDate}
                                                parseVCardData={parseVCardData}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Biosite
                        </th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuario
                        </th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Slug
                        </th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Analytics
                        </th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Creado
                        </th>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {pagination.data.map((biosite: BiositeFull) => {
                        const isExpanded = expandedBiosite === biosite.id;
                        const userBusinessCard = businessCards[biosite.ownerId];
                        const isLoadingCard = loadingCards[biosite.ownerId];
                        const biositeAnalytics = analyticsData[biosite.id];
                        const isLoadingAnalytics = loadingAnalytics[biosite.id];
                        const isShowingAnalytics = showAnalytics[biosite.id];

                        return (
                            <React.Fragment key={biosite.id}>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Globe className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {biosite.title || "Sin título"}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    ID: {biosite.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {biosite.owner?.name ||
                                                        biosite.owner?.email ||
                                                        "Usuario desconocido"}
                                                </div>
                                                {biosite.owner?.email && biosite.owner?.name && (
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {biosite.owner.email}
                                                    </div>
                                                )}
                                                {biosite.owner?.cedula && (
                                                    <div className="text-xs text-gray-400 truncate">
                                                        CI: {biosite.owner.cedula}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600 truncate block">
                          {biosite.slug ? `/${biosite.slug}` : "Sin slug"}
                        </span>
                                    </td>

                                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                                        {isLoadingAnalytics ? (
                                            <Loading />
                                        ) : biositeAnalytics ? (
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center">
                                                    <Eye className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
                                                    <span className="text-sm font-semibold text-gray-900">
                              {biositeAnalytics.views}
                            </span>
                                                    <span className="text-xs text-gray-500 ml-1">
                              vistas
                            </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <MousePointer className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                                                    <span className="text-sm font-semibold text-gray-900">
                              {biositeAnalytics.clicks}
                            </span>
                                                    <span className="text-xs text-gray-500 ml-1">
                              clicks
                            </span>
                                                </div>
                                                {biositeAnalytics.views > 0 && (
                                                    <div className="flex items-center">
                                                        <TrendingUp className="w-3 h-3 text-purple-500 mr-1 flex-shrink-0" />
                                                        <span className="text-xs text-gray-600">
                                {Math.round(
                                    (biositeAnalytics.clicks /
                                        biositeAnalytics.views) *
                                    100
                                )}
                                                            % CTR
                              </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    toggleAnalytics(biosite.id, biosite.ownerId)
                                                }
                                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                                            >
                                                <BarChart3 className="w-4 h-4 mr-1 flex-shrink-0" />
                                                <span className="hidden lg:inline">Ver analytics</span>
                                                <span className="lg:hidden">Analytics</span>
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
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
                                  <span className="hidden sm:inline">Activo</span>
                                  <span className="sm:hidden">A</span>
                              </>
                          ) : (
                              <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  <span className="hidden sm:inline">Inactivo</span>
                                  <span className="sm:hidden">I</span>
                              </>
                          )}
                        </span>
                                    </td>
                                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                                            <span className="hidden lg:inline">{formatDate(biosite.createdAt)}</span>
                                            <span className="lg:hidden">{formatDate(biosite.createdAt).split(' ')[0]}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col space-y-2">
                                            <button
                                                onClick={() => handleToggleBiositeExpansion(biosite.id)}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center cursor-pointer"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4 mr-1" />
                                                        <span className="hidden sm:inline">Ocultar</span>
                                                        <span className="sm:hidden">-</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4 mr-1" />
                                                        <span className="hidden sm:inline">Ver detalles</span>
                                                        <span className="sm:hidden">+</span>
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
                                                    <span className="hidden lg:inline">
                                  {isShowingAnalytics ? "Ocultar analytics" : "Ver analytics"}
                                </span>
                                                    <span className="lg:hidden">
                                  {isShowingAnalytics ? "Ocultar" : "Analytics"}
                                </span>
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

                                {/* Original expanded biosite details */}
                                {isExpanded && (
                                    <ExpandedBiositeDetails
                                        biosite={biosite}
                                        userBusinessCard={userBusinessCard}
                                        isLoadingCard={isLoadingCard}
                                        biositeLinks={biositeLinks}
                                        loadingBiositeLinks={loadingBiositeLinks}
                                        formatDate={formatDate}
                                        parseVCardData={parseVCardData}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.pageSize}
                    totalItems={pagination.totalItems}
                    loading={pagination.loading}
                    canGoNext={pagination.canGoNext}
                    canGoPrev={pagination.canGoPrev}
                    visiblePages={pagination.visiblePages}
                    pageInfo={pagination.pageInfo}
                    onPageChange={pagination.setPage}
                    onPageSizeChange={pagination.setPageSize}
                    onFirst={pagination.goToFirstPage}
                    onLast={pagination.goToLastPage}
                    onNext={pagination.nextPage}
                    onPrev={pagination.prevPage}
                    totalUnfilteredItems={pagination.totalUnfilteredItems}
                />
            </div>
        </div>
    );
};