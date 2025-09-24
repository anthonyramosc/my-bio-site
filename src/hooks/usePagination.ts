import { useState, useCallback, useMemo } from "react";

export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface UsePaginationProps {
  initialPage?: number;
  initialSize?: number;
  defaultSize?: number;
}

export interface UsePaginationReturn<T> {
  // Estado
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: T[];
  loading: boolean;
  error: string | null;

  // Acciones
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  refresh: () => void;

  // Utilidades
  canGoNext: boolean;
  canGoPrev: boolean;
  pageInfo: string;
  visiblePages: number[];

  // Para conectar con la API
  setPaginatedData: (response: PaginatedResponse<T> | T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getPaginationParams: () => PaginationParams;
}

export const usePagination = <T>({
  initialPage = 1,
  initialSize = 10,
  defaultSize = 10,
}: UsePaginationProps = {}): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized computations
  const canGoNext = useMemo(
    () => currentPage < totalPages,
    [currentPage, totalPages]
  );
  const canGoPrev = useMemo(() => currentPage > 1, [currentPage]);

  const pageInfo = useMemo(() => {
    if (totalItems === 0) return "Sin resultados";

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return `Mostrando ${startItem}-${endItem} de ${totalItems} elementos`;
  }, [currentPage, pageSize, totalItems]);

  // Calcular páginas visibles para navegación
  const visiblePages = useMemo(() => {
    const delta = 2; // Número de páginas a mostrar antes y después de la actual
    const pages: number[] = [];

    // Calcular rango
    const rangeStart = Math.max(1, currentPage - delta);
    const rangeEnd = Math.min(totalPages, currentPage + delta);

    // Agregar primera página si no está en el rango
    if (rangeStart > 1) {
      pages.push(1);
      if (rangeStart > 2) {
        pages.push(-1); // Indicador de ellipsis
      }
    }

    // Agregar páginas en el rango
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Agregar última página si no está en el rango
    if (rangeEnd < totalPages) {
      if (rangeEnd < totalPages - 1) {
        pages.push(-1); // Indicador de ellipsis
      }
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  // Acciones
  const setPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        setError(null);
      }
    },
    [totalPages]
  );

  const setPageSizeHandler = useCallback((size: number) => {
    if (size > 0) {
      setPageSize(size);
      setCurrentPage(1); // Reset a la primera página
      setError(null);
    }
  }, []);

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
      setError(null);
    }
  }, [canGoNext]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setCurrentPage((prev) => prev - 1);
      setError(null);
    }
  }, [canGoPrev]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
    setError(null);
  }, []);

  const goToLastPage = useCallback(() => {
    if (totalPages > 0) {
      setCurrentPage(totalPages);
      setError(null);
    }
  }, [totalPages]);

  const refresh = useCallback(() => {
    setError(null);
    // Esta función será complementada por quien use el hook
  }, []);

  // Función para establecer datos paginados
  const setPaginatedData = useCallback(
    (response: PaginatedResponse<T> | T[]) => {
      if (Array.isArray(response)) {
        // Respuesta sin paginación - mostrar todos los datos
        setData(response);
        setTotalItems(response.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        // Respuesta con paginación
        setData(response.data);
        setTotalItems(response.total);
        setTotalPages(response.totalPages);
        setCurrentPage(response.page);
      }
    },
    []
  );

  // Función para obtener parámetros de paginación
  const getPaginationParams = useCallback(
    (): PaginationParams => ({
      page: currentPage,
      size: pageSize,
    }),
    [currentPage, pageSize]
  );

  return {
    // Estado
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    data,
    loading,
    error,

    // Acciones
    setPage,
    setPageSize: setPageSizeHandler,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    refresh,

    // Utilidades
    canGoNext,
    canGoPrev,
    pageInfo,
    visiblePages,

    // Para conectar con la API
    setPaginatedData,
    setLoading,
    setError,
    getPaginationParams,
  };
};
