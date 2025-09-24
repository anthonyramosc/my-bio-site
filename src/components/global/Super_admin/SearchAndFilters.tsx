import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  RefreshCw,
  Eye,
  Calendar,
  Link,
} from "lucide-react";

interface SearchAndFiltersProps {
  onSearch: (filters: FilterState) => void;
  onReset: () => void;
  loading?: boolean;
  totalResults?: number;
}

export interface FilterState {
  search: string;
  status: "all" | "active" | "inactive";
  hasSlug: "all" | "with-slug" | "without-slug";
  dateRange: "all" | "last7" | "last30" | "last90";
  sortBy: "createdAt" | "title" | "updatedAt";
  sortOrder: "asc" | "desc";
}

const defaultFilters: FilterState = {
  search: "",
  status: "all",
  hasSlug: "all",
  dateRange: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  onSearch,
  onReset,
  loading = false,
  totalResults = 0,
}) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      onSearch(filters);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.status !== "all") count++;
    if (filters.hasSlug !== "all") count++;
    if (filters.dateRange !== "all") count++;
    if (filters.sortBy !== "createdAt" || filters.sortOrder !== "asc") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por título, slug, email de usuario..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              style={{ color: "black" }}
            />
            {filters.search && (
              <button
                onClick={() => updateFilter("search", "")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors  cursor-pointer ${
                isExpanded
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4 cursor-pointer" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs min-w-[20px] text-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform  ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 cursor-pointer" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Results info */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div>
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                Buscando...
              </span>
            ) : (
              <span>
                {totalResults > 0
                  ? `${totalResults} resultado${
                      totalResults !== 1 ? "s" : ""
                    } encontrado${totalResults !== 1 ? "s" : ""}`
                  : "No se encontraron resultados"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Eye className="w-4 h-4 inline mr-1" />
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  updateFilter(
                    "status",
                    e.target.value as FilterState["status"]
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                style={{ color: "black" }}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Solo activos</option>
                <option value="inactive">Solo inactivos</option>
              </select>
            </div>

            {/* Slug Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-1" />
                Estado del Slug
              </label>
              <select
                value={filters.hasSlug}
                onChange={(e) =>
                  updateFilter(
                    "hasSlug",
                    e.target.value as FilterState["hasSlug"]
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                style={{ color: "black" }}
              >
                <option value="all">Todos</option>
                <option value="with-slug">Con slug configurado</option>
                <option value="without-slug">Sin slug</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha de creación
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  updateFilter(
                    "dateRange",
                    e.target.value as FilterState["dateRange"]
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                style={{ color: "black" }}
              >
                <option value="all">Cualquier fecha</option>
                <option value="last7">Últimos 7 días</option>
                <option value="last30">Últimos 30 días</option>
                <option value="last90">Últimos 90 días</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <div className="space-y-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    updateFilter(
                      "sortBy",
                      e.target.value as FilterState["sortBy"]
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  style={{ color: "black" }}
                >
                  <option value="createdAt">Fecha</option>
                  <option value="title">Título</option>
                  <option value="updatedAt">Última actualización</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    updateFilter(
                      "sortOrder",
                      e.target.value as FilterState["sortOrder"]
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  style={{ color: "black" }}
                >
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 mr-2">
                  Filtros activos:
                </span>

                {filters.search && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Búsqueda: "{filters.search}"
                    <button
                      onClick={() => updateFilter("search", "")}
                      className="ml-1 hover:text-blue-600 "
                    >
                      <X className="w-3 h-3 " />
                    </button>
                  </span>
                )}

                {filters.status !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Estado:{" "}
                    {filters.status === "active" ? "Activo" : "Inactivo"}
                    <button
                      onClick={() => updateFilter("status", "all")}
                      className="ml-1 hover:text-green-600 "
                    >
                      <X className="w-3 h-3 cursor-pointer" />
                    </button>
                  </span>
                )}

                {filters.hasSlug !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Slug:{" "}
                    {filters.hasSlug === "with-slug" ? "Con slug" : "Sin slug"}
                    <button
                      onClick={() => updateFilter("hasSlug", "all")}
                      className="ml-1 hover:text-purple-600"
                    >
                      <X className="w-3 h-3 cursor-pointer" />
                    </button>
                  </span>
                )}

                {filters.dateRange !== "all" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Fecha:{" "}
                    {filters.dateRange === "last7"
                      ? "Últimos 7 días"
                      : filters.dateRange === "last30"
                      ? "Últimos 30 días"
                      : "Últimos 90 días"}
                    <button
                      onClick={() => updateFilter("dateRange", "all")}
                      className="ml-1 hover:text-yellow-600"
                    >
                      <X className="w-3 h-3 cursor-pointer" />
                    </button>
                  </span>
                )}

                {(filters.sortBy !== "createdAt" ||
                  filters.sortOrder !== "desc") && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Orden:{" "}
                    {filters.sortBy === "createdAt"
                      ? "Fecha"
                      : filters.sortBy === "title"
                      ? "Título"
                      : "Actualización"}{" "}
                    ({filters.sortOrder === "desc" ? "desc" : "asc"})
                    <button
                      onClick={() => {
                        updateFilter("sortBy", "createdAt");
                        updateFilter("sortOrder", "desc");
                      }}
                      className="ml-1 hover:text-gray-600"
                    >
                      <X className="w-3 h-3  cursor-pointer" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
