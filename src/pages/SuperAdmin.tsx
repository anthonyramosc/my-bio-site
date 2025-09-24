import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { usePagination } from "../hooks/usePagination";
import SearchAndFilters from "../components/global/Super_admin/SearchAndFilters";
import type { FilterState } from "../components/global/Super_admin/SearchAndFilters";
import { Users, Globe, RefreshCw, LinkIcon, Eye, Users2 } from "lucide-react";
import Cookie from "js-cookie";
import type { BusinessCard } from "../types/V-Card.ts";
import { businessCardService } from "../service/VCardService.ts";
import { getBiositeAnalytics } from "../service/apiService";
import apiService from "../service/apiService";
import { BiositesTable } from "../components/global/Super_admin/BiositesTable.tsx";
import { AdminChildBiositesTable } from "../components/global/Super_admin/AdminChildBiositesTable.tsx";
import type {
  BiositeFull,
  LinkData,
  TimeRange,
  AnalyticsData,
} from "../interfaces/AdminData.ts";

type ViewMode = "all" | "children";

const AdminPanel: React.FC = () => {
  const role = Cookie.get("roleName");
  const userId = Cookie.get("userId");

  const [ viewMode, setViewMode] = useState<ViewMode>("all");

  const permissions = useMemo(() => {
    const isSpecialUser = userId === "92784deb-3a8e-42a0-91ee-cd64fb3726f5";
    const isSuperAdmin = role === "SUPER_ADMIN";
    const isAdmin = role === "ADMIN";

    return {
      hasFullAccess: isSpecialUser || isSuperAdmin,
      hasChildBiositeAccess: isAdmin || isSpecialUser || isSuperAdmin,
      isAdmin,
      isSuperAdmin,
      isSpecialUser,
      canToggleView: isSuperAdmin || isSpecialUser,
    };
  }, [role, userId]);

  const { fetchAllBiosites, fetchChildBiosites } = useFetchBiosite();

  const [businessCards, setBusinessCards] = useState<{
    [key: string]: BusinessCard;
  }>({});
  const [loadingCards, setLoadingCards] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [biositeLinks, setBiositeLinks] = useState<{
    [key: string]: LinkData[];
  }>({});
  const [loadingBiositeLinks, setLoadingBiositeLinks] = useState<{
    [key: string]: boolean;
  }>({});

  const [analyticsData, setAnalyticsData] = useState<{
    [key: string]: AnalyticsData;
  }>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState<{
    [key: string]: boolean;
  }>({});
  const [analyticsTimeRange, setAnalyticsTimeRange] =
    useState<TimeRange>("last7");
  const [showAnalytics, setShowAnalytics] = useState<{
    [key: string]: boolean;
  }>({});

  const [error, setError] = useState<string | null>(null);
  const [expandedBiosite, setExpandedBiosite] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: "",
    status: "all",
    hasSlug: "all",
    dateRange: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [filteredData, setFilteredData] = useState<BiositeFull[]>([]);
  const [BioData, setBioData] = useState<BiositeFull[]>([]);

  // Diferentes paginaciones para diferentes vistas
  const allBiositesPagination = usePagination<BiositeFull>({
    initialPage: 1,
    initialSize: 10,
  });

  const childBiositesPagination = usePagination<BiositeFull>({
    initialPage: 1,
    initialSize: 10,
  });

  const getCurrentPagination = useCallback(() => {
    if (permissions.hasFullAccess && viewMode === "all") {
      return allBiositesPagination;
    } else if (permissions.hasChildBiositeAccess) {
      return childBiositesPagination;
    }
    return allBiositesPagination; // fallback
  }, [
    permissions.hasFullAccess,
    permissions.hasChildBiositeAccess,
    viewMode,
    allBiositesPagination,
    childBiositesPagination,
  ]);

  const handleViewModeChange = useCallback(
    (newViewMode: ViewMode) => {
      if (!permissions.canToggleView) return;

      setViewMode(newViewMode);
      setCurrentFilters({
        search: "",
        status: "all",
        hasSlug: "all",
        dateRange: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setFilteredData([]);
      setInitialized(false);
    },
    [permissions.canToggleView]
  );

  // Determinar si debe mostrar todos los biosites o solo hijos
  const shouldShowAllBiosites = useMemo(() => {
    return permissions.hasFullAccess && viewMode === "all";
  }, [permissions.hasFullAccess, viewMode]);

  // Memoizar la función applyFilters para evitar recreaciones innecesarias
  const applyFilters = useCallback(
    async (
      currentPage: number,
      size: number,
      filters: FilterState
    ): Promise<BiositeFull[]> => {
      // Crear objeto de parámetros que incluya tanto paginación como filtros
      const params = {
        ...currentPagination.getPaginationParams(),
        search: filters.search,
        status: filters.status !== "all" ? filters.status : undefined,
        hasSlug: filters.hasSlug !== "all" ? filters.hasSlug : undefined,
        dateRange: filters.dateRange !== "all" ? filters.dateRange : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: currentPage,
        size: size,
      };

      // Filtrar parámetros undefined para enviar solo los necesarios
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await fetchAllBiosites(cleanParams);

      // Extract data array from response if it's a paginated response
      return Array.isArray(response) ? response : response?.data || [];
    },
    []
  );

  // Memoizar handleSearch para evitar recreaciones innecesarias
  const handleSearch = useCallback(
    async (filters: FilterState) => {
      setCurrentFilters(filters);
      const currentPagination = getCurrentPagination();

      if (currentPagination.data.length > 0) {
        const filtered = await applyFilters(
          currentPagination.currentPage,
          currentPagination.pageSize,
          filters
        );
        setFilteredData(filtered);
      }

      currentPagination.setPage(1);
    },
    [getCurrentPagination, applyFilters]
  );

  const handleResetFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      search: "",
      status: "all",
      hasSlug: "all",
      dateRange: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setCurrentFilters(defaultFilters);
    const currentPagination = getCurrentPagination();
    setFilteredData(currentPagination.data);
    currentPagination.setPage(1);
  }, [getCurrentPagination]);

  const fetchBiositeLinks = useCallback(
    async (biositeId: string) => {
      if (biositeLinks[biositeId] || loadingBiositeLinks[biositeId]) return;

      setLoadingBiositeLinks((prev) => ({ ...prev, [biositeId]: true }));
      try {
        const links = await apiService.getAll<LinkData[]>(
          `/links/biosite/${biositeId}`
        );
        setBiositeLinks((prev) => ({ ...prev, [biositeId]: links || [] }));
      } catch (error) {
        console.error(`Error fetching links for biosite ${biositeId}:`, error);
        setBiositeLinks((prev) => ({ ...prev, [biositeId]: [] }));
      } finally {
        setLoadingBiositeLinks((prev) => ({ ...prev, [biositeId]: false }));
      }
    },
    [biositeLinks, loadingBiositeLinks]
  );

  const fetchBiositeAnalytics = useCallback(
    async (biositeId: string, ownerId: string) => {
      if (analyticsData[biositeId] || loadingAnalytics[biositeId]) return;

      setLoadingAnalytics((prev) => ({ ...prev, [biositeId]: true }));

      try {
        const response = await getBiositeAnalytics(ownerId, analyticsTimeRange);

        let processedData: AnalyticsData;

        if (
          typeof response === "string" &&
          response.includes("<!doctype html>")
        ) {
          processedData = {
            views: 0,
            clicks: 0,
            dailyActivity: [
              {
                day: new Date().toISOString().split("T")[0],
                views: 0,
                clicks: 0,
              },
            ],
            clickDetails: [],
          };
        } else if (response && typeof response === "object") {
          processedData = {
            views: response.views || 0,
            clicks: response.clicks || 0,
            dailyActivity:
              response.dailyActivity && response.dailyActivity.length > 0
                ? response.dailyActivity
                : [
                    {
                      day: new Date().toISOString().split("T")[0],
                      views: response.views || 0,
                      clicks: response.clicks || 0,
                    },
                  ],
            clickDetails: response.clickDetails || [],
          };
        } else {
          processedData = {
            views: 0,
            clicks: 0,
            dailyActivity: [
              {
                day: new Date().toISOString().split("T")[0],
                views: 0,
                clicks: 0,
              },
            ],
            clickDetails: [],
          };
        }

        setAnalyticsData((prev) => ({ ...prev, [biositeId]: processedData }));
      } catch (error) {
        console.error(
          `Error fetching analytics for biosite ${biositeId}:`,
          error
        );
        setAnalyticsData((prev) => ({
          ...prev,
          [biositeId]: {
            views: 0,
            clicks: 0,
            dailyActivity: [],
            clickDetails: [],
          },
        }));
      } finally {
        setLoadingAnalytics((prev) => ({ ...prev, [biositeId]: false }));
      }
    },
    [analyticsData, loadingAnalytics, analyticsTimeRange]
  );

  const toggleAnalytics = useCallback(
    (biositeId: string, ownerId: string) => {
      const isCurrentlyShowing = showAnalytics[biositeId];
      setShowAnalytics((prev) => ({
        ...prev,
        [biositeId]: !isCurrentlyShowing,
      }));

      if (!isCurrentlyShowing && !analyticsData[biositeId]) {
        fetchBiositeAnalytics(biositeId, ownerId);
      }
    },
    [showAnalytics, analyticsData, fetchBiositeAnalytics]
  );

  const categorizeLinks = useCallback((links: LinkData[]) => {
    const categories = {
      total: links?.length || 0,
      social: 0,
      regular: 0,
      whatsApp: 0,
      apps: 0,
      embed: 0,
    };

    if (!links || links.length === 0) {
      return categories;
    }

    const socialPlatforms = [
      "instagram",
      "tiktok",
      "twitter",
      "x",
      "youtube",
      "facebook",
      "twitch",
      "linkedin",
      "snapchat",
      "threads",
      "gmail",
      "pinterest",
      "spotify",
      "discord",
      "tumblr",
      "telegram",
      "amazon",
      "onlyfans",
    ];
    const appStores = [
      "appstore",
      "googleplay",
      "apps.apple.com",
      "play.google.com",
    ];
    const embedKeywords = [
      "music",
      "video",
      "embed",
      "player",
      "post",
      "publicacion",
    ];

    links.forEach((link) => {
      const labelLower = link.label?.toLowerCase() || "";
      const urlLower = link.url?.toLowerCase() || "";
      const iconLower = link.icon?.toLowerCase() || "";

      if (urlLower.includes("api.whatsapp.com") || iconLower === "whatsapp") {
        categories.whatsApp++;
      } else if (
        appStores.some(
          (store) => labelLower.includes(store) || urlLower.includes(store)
        )
      ) {
        categories.apps++;
      } else if (
        embedKeywords.some(
          (keyword) =>
            labelLower.includes(keyword) || urlLower.includes(keyword)
        )
      ) {
        categories.embed++;
      } else if (
        socialPlatforms.some(
          (platform) =>
            labelLower.includes(platform) ||
            urlLower.includes(platform) ||
            iconLower.includes(platform)
        )
      ) {
        categories.social++;
      } else {
        categories.regular++;
      }
    });

    return categories;
  }, []);

  // Cargar datos según el rol del usuario - FUNCIÓN MEMOIZADA
  const loadData = useCallback(async () => {
    if (!permissions.hasChildBiositeAccess || !userId) return;

    try {
      const currentPagination = getCurrentPagination();
      currentPagination.setLoading(true);
      currentPagination.setError(null);

      let responseData: BiositeFull[] = [];
      let responseBioData: BiositeFull[] = [];

      if (shouldShowAllBiosites) {
        // SUPER_ADMIN viendo todos los biosites
        const params = currentPagination.getPaginationParams();
        const response = await fetchAllBiosites(params);
        currentPagination.setPaginatedData(response);
        responseData = Array.isArray(response)
          ? response
          : response?.data || [];
      } else {
        // ADMIN o SUPER_ADMIN viendo biosites hijos
        const childBiosites = await fetchChildBiosites(userId);
        responseBioData = childBiosites;
        setBioData(responseBioData);

        // Para vista de hijos, simular paginación local
        const startIndex =
          (currentPagination.currentPage - 1) * currentPagination.pageSize;
        const endIndex = startIndex + currentPagination.pageSize;
      }

      if (responseData.length > 0) {
        const filtered = await applyFilters(
          currentPagination.currentPage,
          currentPagination.pageSize,
          currentFilters
        );
        setFilteredData(filtered);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al cargar biosites";
      getCurrentPagination().setError(errorMessage);
      setError(errorMessage);
    } finally {
      getCurrentPagination().setLoading(false);
    }
  }, [
    permissions.hasChildBiositeAccess,
    shouldShowAllBiosites,
    userId,
    fetchAllBiosites,
    fetchChildBiosites,
    getCurrentPagination,
    applyFilters,
    currentFilters,
  ]);

  const handleRefreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Efecto principal de inicialización - CORREGIDO
  useEffect(() => {
    const initializeData = async () => {
      if (!permissions.hasChildBiositeAccess || !userId || initialized) return;

      try {
        setInitialized(true); // Marcar como inicializado ANTES de cargar datos
        await loadData();
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Error al inicializar datos");
      }
    };

    initializeData();
  }, [permissions.hasChildBiositeAccess, userId, viewMode]); // Agregar viewMode a las dependencias

  // Efecto para aplicar filtros cuando cambian los datos - CORREGIDO
  useEffect(() => {
    const applyFiltersAsync = async () => {
      const currentPagination = getCurrentPagination();
      if (currentPagination.data.length > 0) {
        const filtered = await applyFilters(
          currentPagination.currentPage,
          currentPagination.pageSize,
          currentFilters
        );
        setFilteredData(filtered);
      }
    };

    applyFiltersAsync();
  }, [
    currentFilters,
    getCurrentPagination().currentPage,
    getCurrentPagination().pageSize,
  ]);
  const toggleBiositeExpansion = useCallback(
    (biositeId: string) => {
      const wasExpanded = expandedBiosite === biositeId;
      setExpandedBiosite(wasExpanded ? null : biositeId);

      if (!wasExpanded) {
        const currentPagination = getCurrentPagination();
        const biosite = currentPagination.data.find((b) => b.id === biositeId);
        if (biosite?.ownerId) {
          fetchBusinessCard(biosite.ownerId);
        }
        fetchBiositeLinks(biositeId);
      }
    },
    [expandedBiosite, getCurrentPagination, fetchBiositeLinks]
  );

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const fetchBusinessCard = useCallback(
    async (ownerId: string) => {
      if (businessCards[ownerId] || loadingCards[ownerId]) return;

      setLoadingCards((prev) => ({ ...prev, [ownerId]: true }));
      try {
        const card = await businessCardService.regenerateQRCode(ownerId);
        setBusinessCards((prev) => ({ ...prev, [ownerId]: card }));
      } catch (error) {
        console.error(
          `Error fetching business card for user ${ownerId}:`,
          error
        );
        setBusinessCards((prev) => ({ ...prev, [ownerId]: null }));
      } finally {
        setLoadingCards((prev) => ({ ...prev, [ownerId]: false }));
      }
    },
    [businessCards, loadingCards]
  );

  const parseVCardData = useCallback((businessCard: BusinessCard | null) => {
    if (!businessCard?.data) return null;

    try {
      return typeof businessCard.data === "string"
        ? JSON.parse(businessCard.data)
        : businessCard.data;
    } catch (error) {
      console.error("Error parsing VCard data:", error);
      return null;
    }
  }, []);

  // Verificar permisos de acceso
  if (!permissions.hasChildBiositeAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">
            Acceso Denegado
          </h2>
          <p className="text-gray-500">
            Solo los usuarios ADMIN y SUPER_ADMIN pueden acceder a este panel.
          </p>
        </div>
      </div>
    );
  }

  const currentPagination = getCurrentPagination();

  if (currentPagination.loading && !initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">
            Cargando{" "}
            {shouldShowAllBiosites ? "todos los veSites" : "veSites hijos"}...
          </p>
        </div>
      </div>
    );
  }

  if (error && !initialized) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={handleRefreshData}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalLinks = Object.values(biositeLinks).reduce(
    (sum, links) => sum + (links?.length || 0),
    0
  );
  const currentData =
    filteredData.length > 0 ? filteredData : currentPagination.data;

  // Función para obtener el texto del título según la vista actual
  const getViewTitle = () => {
    if (!permissions.canToggleView) {
      return permissions.hasFullAccess
        ? "Super Administración"
        : "Administración";
    }

    return viewMode === "all"
      ? "Super Administración - Vista Completa"
      : "Super Administración - Vista Hijos";
  };

  const getViewDescription = () => {
    if (!permissions.canToggleView) {
      return permissions.hasFullAccess
        ? "Gestión completa de veSites, usuarios y analytics"
        : "Gestión de veSites hijos y analytics";
    }

    return viewMode === "all"
      ? "Vista completa de todos los biosites del sistema"
      : "Vista limitada a veSites bajo tu administración";
  };

  return (
    <div className="h-full text-white px-4 py-2 lg:px-6 lg:py-16">
      {/* Header */}
      <div className="shadow rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de {getViewTitle()}
            </h1>
            <p className="text-gray-600">{getViewDescription()}</p>
            {permissions.isAdmin && !permissions.canToggleView && (
              <p className="text-sm text-yellow-600 mt-1">
                Vista limitada: Solo veSites bajo tu administración
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {/* Toggle de vista para SUPER_ADMIN */}
            {permissions.canToggleView && (
              <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                <button
                  onClick={() => handleViewModeChange("all")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    viewMode === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Todos</span>
                </button>
                <button
                  onClick={() => handleViewModeChange("children")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    viewMode === "children"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Users2 className="w-4 h-4" />
                  <span>Hijos</span>
                </button>
              </div>
            )}
            <button
              onClick={handleRefreshData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
              disabled={currentPagination.loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  currentPagination.loading ? "animate-spin" : ""
                }`}
              />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Globe className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {shouldShowAllBiosites ? "Total veSites" : "veSites Hijos"}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {currentPagination.totalItems || 0}
              </p>
              <p className="text-xs text-gray-400">
                {currentData.filter((biosite) => biosite.isActive).length}{" "}
                activos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <LinkIcon className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Enlaces</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalLinks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {shouldShowAllBiosites ? "Usuarios Únicos" : "Usuarios Hijos"}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(currentData.map((biosite) => biosite.ownerId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters - Solo mostrar si hay datos o es SUPER_ADMIN */}
      {(permissions.hasFullAccess || currentData.length > 0) && (
        <div className="mb-6">
          <SearchAndFilters
            onSearch={handleSearch}
            onReset={handleResetFilters}
            loading={currentPagination.loading}
            totalResults={filteredData.length}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {shouldShowAllBiosites
                ? `veSites (${filteredData.length} de ${
                    currentPagination.totalItems || 0
                  })`
                : `veSites Hijos ${BioData.length}`}
            </h2>
            {permissions.canToggleView && (
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                <span>Vista: {viewMode === "all" ? "Completa" : "Hijos"}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {currentPagination.loading && initialized && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && initialized && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          {/* Renderizar tabla correspondiente según el rol y vista seleccionada */}
          {shouldShowAllBiosites ? (
            <BiositesTable
              pagination={{
                ...allBiositesPagination,
                data: filteredData,
                totalItems: filteredData.length,
                totalUnfilteredItems: allBiositesPagination.totalItems || 0,
              }}
              biositeLinks={biositeLinks}
              loadingBiositeLinks={loadingBiositeLinks}
              analyticsData={analyticsData}
              loadingAnalytics={loadingAnalytics}
              showAnalytics={showAnalytics}
              analyticsTimeRange={analyticsTimeRange}
              expandedBiosite={expandedBiosite}
              businessCards={businessCards}
              loadingCards={loadingCards}
              categorizeLinks={categorizeLinks}
              toggleBiositeExpansion={toggleBiositeExpansion}
              toggleAnalytics={toggleAnalytics}
              fetchBiositeAnalytics={fetchBiositeAnalytics}
              setAnalyticsTimeRange={setAnalyticsTimeRange}
              setShowAnalytics={setShowAnalytics}
              setAnalyticsData={setAnalyticsData}
              formatDate={formatDate}
              parseVCardData={parseVCardData}
              fetchBusinessCard={fetchBusinessCard}
            />
          ) : (
            <AdminChildBiositesTable
              biosites={BioData}
              totalBiosites={BioData.length}
              loading={childBiositesPagination.loading}
              biositeLinks={biositeLinks}
              loadingBiositeLinks={loadingBiositeLinks}
              analyticsData={analyticsData}
              loadingAnalytics={loadingAnalytics}
              showAnalytics={showAnalytics}
              analyticsTimeRange={analyticsTimeRange}
              expandedBiosite={expandedBiosite}
              businessCards={businessCards}
              loadingCards={loadingCards}
              categorizeLinks={categorizeLinks}
              toggleBiositeExpansion={toggleBiositeExpansion}
              toggleAnalytics={toggleAnalytics}
              fetchBiositeAnalytics={fetchBiositeAnalytics}
              setAnalyticsTimeRange={setAnalyticsTimeRange}
              setShowAnalytics={setShowAnalytics}
              setAnalyticsData={setAnalyticsData}
              formatDate={formatDate}
              parseVCardData={parseVCardData}
              fetchBusinessCard={fetchBusinessCard}
            />
          )}
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default AdminPanel;
