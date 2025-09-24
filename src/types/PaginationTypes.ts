export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
}

export interface PaginationActions {
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    goToFirstPage: () => void;
    goToLastPage: () => void;
    refresh: () => void;
}

export interface PaginationHelpers {
    canGoNext: boolean;
    canGoPrev: boolean;
    pageInfo: string;
    visiblePages: number[];
}

export interface UsePaginationReturn<T> extends PaginationState, PaginationActions, PaginationHelpers {
    data: T[];
    setPaginatedData: (response: PaginatedResponse<T> | T[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    getPaginationParams: () => PaginationParams;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    loading?: boolean;
    canGoNext: boolean;
    canGoPrev: boolean;
    visiblePages: number[];
    pageInfo: string;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onFirst: () => void;
    onLast: () => void;
    onNext: () => void;
    onPrev: () => void;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
    showPageInfo?: boolean;
    showFirstLast?: boolean;
    className?: string;
}

// Tipos específicos para tu aplicación
export interface UserPaginationData {
    id: string;
    email: string;
    name?: string;
    cedula?: string;
    role?: string;
    isActive?: boolean;
    parentId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BiositePaginationData {
    id: string;
    ownerId: string;
    title: string;
    slug: string;
    themeId: string;
    colors: string | any;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    videoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    links?: any[];
    owner?: UserPaginationData;
}

export interface UserDataWithStats {
    id: string;
    email: string;
    name?: string;
    cedula?: string;
    role?: string;
    isActive?: boolean;
    parentId?: string;
    createdAt?: string;
    updatedAt?: string;
    biosites: any[];
    totalLinks: number;
    socialLinks: number;
    regularLinks: number;
    whatsAppLinks: number;
    appLinks: number;
    embedLinks: number;
    vCards: any[];
}

// Configuración por defecto para paginación
export const DEFAULT_PAGINATION_CONFIG = {
    initialPage: 1,
    initialSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    showPageSizeSelector: true,
    showPageInfo: true,
    showFirstLast: true,
} as const;

// Utilidades para paginación
export const calculateTotalPages = (total: number, size: number): number => {
    return Math.ceil(total / size);
};

export const calculateStartItem = (page: number, size: number): number => {
    return (page - 1) * size + 1;
};

export const calculateEndItem = (page: number, size: number, total: number): number => {
    return Math.min(page * size, total);
};

export const generatePageInfo = (page: number, size: number, total: number): string => {
    if (total === 0) return 'Sin resultados';

    const startItem = calculateStartItem(page, size);
    const endItem = calculateEndItem(page, size, total);

    return `Mostrando ${startItem}-${endItem} de ${total} elementos`;
};

export const generateVisiblePages = (currentPage: number, totalPages: number, delta: number = 2): number[] => {
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
};

// Validadores
export const isValidPage = (page: number, totalPages: number): boolean => {
    return page >= 1 && page <= totalPages;
};

export const isValidPageSize = (size: number): boolean => {
    return size > 0 && size <= 1000; // Límite máximo razonable
};

// Transformadores de datos
export const transformToPaginatedResponse = <T>(
    data: T[],
    page: number,
    size: number
): PaginatedResponse<T> => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        total: data.length,
        page,
        size,
        totalPages: calculateTotalPages(data.length, size)
    };
};

export const isPaginatedResponse = <T>(
    response: T[] | PaginatedResponse<T>
): response is PaginatedResponse<T> => {
    return !Array.isArray(response) && 'data' in response && 'total' in response;
};