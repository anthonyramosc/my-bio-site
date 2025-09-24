import React from "react";
import { Users } from "lucide-react";
import type {
    BiositeFull,
    AdminChildBiositesTableProps,
} from "../../../interfaces/AdminData.ts";
import BiositeTableRow from "./Biosite/BiositeTablerow.tsx";

export const AdminChildBiositesTable: React.FC<
    AdminChildBiositesTableProps
> = ({
         biosites,
         totalBiosites,
         loading,
         biositeLinks,
         loadingBiositeLinks,
         analyticsData,
         loadingAnalytics,
         showAnalytics,
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
    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-gray-600 text-sm sm:text-base">Cargando veSites hijos...</span>
                </div>
            </div>
        );
    }

    if (!biosites || biosites.length === 0) {
        return (
            <div className="text-center py-8 px-4">
                <div className="text-gray-400 mb-4">
                    <Users className="w-12 h-12 mx-auto mb-2" />
                </div>
                <p className="text-gray-500 text-sm sm:text-base">No hay veSites hijos para mostrar</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Los veSites hijos aparecerán aquí cuando se creen
                </p>
            </div>
        );
    }

    const handleToggleBiositeExpansion = (biositeId: string) => {
        const wasExpanded = expandedBiosite === biositeId;
        toggleBiositeExpansion(biositeId);

        if (!wasExpanded) {
            const biosite = biosites.find((b) => b.id === biositeId);
            if (biosite?.ownerId) {
                fetchBusinessCard(biosite.ownerId);
            }
        }
    };

    return (
        <div className="px-2 sm:px-0">
            <div className="mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start sm:items-center">
                        <Users className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                                Vista de Administrador
                            </h3>
                            <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                                Mostrando únicamente los veSites hijos bajo tu administración ({totalBiosites} veSites)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {biosites.map((biosite: BiositeFull) => (
                    <div key={biosite.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-2">
                                    <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                                        <Users className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {biosite.title || "Sin título"}
                                        </h3>
                                        <p className="text-xs text-green-600 font-medium">VESITE HIJO</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggleBiositeExpansion(biosite.id)}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                            >
                                {expandedBiosite === biosite.id ? "Ocultar" : "Ver"}
                            </button>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Usuario:</span>
                                <span className="text-gray-900 font-medium truncate ml-2">
                    {biosite.owner?.name || biosite.owner?.email || "Usuario desconocido"}
                  </span>
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
                    {biosite.isActive ? "Activo" : "Inactivo"}
                  </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Creado:</span>
                                <span className="text-gray-900">{formatDate(biosite.createdAt)}</span>
                            </div>
                        </div>

                        {/* Analytics section for mobile */}
                        {analyticsData[biosite.id] && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-blue-50 p-2 rounded">
                                        <div className="text-xs text-blue-600">Vistas</div>
                                        <div className="text-sm font-semibold text-blue-800">
                                            {analyticsData[biosite.id].views}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded">
                                        <div className="text-xs text-green-600">Clicks</div>
                                        <div className="text-sm font-semibold text-green-800">
                                            {analyticsData[biosite.id].clicks}
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 p-2 rounded">
                                        <div className="text-xs text-purple-600">CTR</div>
                                        <div className="text-sm font-semibold text-purple-800">
                                            {analyticsData[biosite.id].views > 0
                                                ? Math.round(
                                                    (analyticsData[biosite.id].clicks / analyticsData[biosite.id].views) * 100
                                                )
                                                : 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Render expanded content for mobile */}
                        {expandedBiosite === biosite.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <BiositeTableRow
                                    key={`${biosite.id}-mobile`}
                                    biosite={biosite}
                                    isExpanded={true}
                                    businessCards={businessCards}
                                    loadingCards={loadingCards}
                                    analyticsData={analyticsData}
                                    loadingAnalytics={loadingAnalytics}
                                    showAnalytics={showAnalytics}
                                    toggleAnalytics={toggleAnalytics}
                                    formatDate={formatDate}
                                    toggleBiositeExpansion={handleToggleBiositeExpansion}
                                    setShowAnalytics={setShowAnalytics}
                                    analyticsTimeRange={"last7"}
                                    setAnalyticsTimeRange={setAnalyticsTimeRange}
                                    setAnalyticsData={setAnalyticsData}
                                    fetchBiositeAnalytics={fetchBiositeAnalytics}
                                    parseVCardData={parseVCardData}
                                    biositeLinks={biositeLinks}
                                    loadingBiositeLinks={loadingBiositeLinks}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            veSite Hijo
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
                    {biosites.map((biosite: BiositeFull) => {
                        return (
                            <BiositeTableRow
                                key={biosite.id}
                                biosite={biosite}
                                isExpanded={expandedBiosite === biosite.id}
                                businessCards={businessCards}
                                loadingCards={loadingCards}
                                analyticsData={analyticsData}
                                loadingAnalytics={loadingAnalytics}
                                showAnalytics={showAnalytics}
                                toggleAnalytics={toggleAnalytics}
                                formatDate={formatDate}
                                toggleBiositeExpansion={handleToggleBiositeExpansion}
                                setShowAnalytics={setShowAnalytics}
                                analyticsTimeRange={"last7"}
                                setAnalyticsTimeRange={setAnalyticsTimeRange}
                                setAnalyticsData={setAnalyticsData}
                                fetchBiositeAnalytics={fetchBiositeAnalytics}
                                parseVCardData={parseVCardData}
                                biositeLinks={biositeLinks}
                                loadingBiositeLinks={loadingBiositeLinks}
                            />
                        );
                    })}

                    </tbody>
                </table>

            </div>

        </div>
    );
};