import {
  getBiositeApi,
  updateBiositeApi,
  registerStudentApi,
  getBiositesApi,
  getBiositeAdminApi,
  getALLBiositesApi,
  getALLUsersApi,
} from "../constants/EndpointsRoutes";
import type { BiositeFull, BiositeUpdateDto } from "../interfaces/Biosite";
import { useState, useCallback, useRef } from "react";
import apiService from "../service/apiService.ts";
import type { CreatedUser, CreateBiositeDto } from "../interfaces/User.ts";

export interface ChildUser extends CreatedUser {
  biosites?: BiositeFull[];
}

export interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  hasSlug?: string;
  status?: string;
  dateRange?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export const useFetchBiosite = (userId?: string) => {
  const [biositeData, setBiositeData] = useState<BiositeFull | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const currentUserIdRef = useRef<string | undefined>(undefined);

  const fetchAllUsers = useCallback(
    async (
      params?: PaginationParams
    ): Promise<ChildUser[] | PaginatedResponse<ChildUser>> => {
      try {
        setLoading(true);
        setError(null);

        let url = getALLUsersApi;

        if (params?.page && params?.size) {
          const searchParams = new URLSearchParams({
            page: params.page.toString(),
            size: params.size.toString(),
          });
          url += `?${searchParams.toString()}`;
        }

        const response = await apiService.getAll<
          ChildUser[] | PaginatedResponse<ChildUser>
        >(url);

        if (Array.isArray(response)) {
          return response;
        }

        return response as PaginatedResponse<ChildUser>;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar todos los usuarios";
        setError(errorMessage);

        if (params?.page && params?.size) {
          return {
            data: [],
            total: 0,
            page: params.page,
            size: params.size,
            totalPages: 0,
          };
        }
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAllBiosites = useCallback(
    async (
      params?: PaginationParams
    ): Promise<BiositeFull[] | PaginatedResponse<BiositeFull>> => {
      try {
        setLoading(true);
        setError(null);

        let url = getALLBiositesApi;

        if (params?.page && params?.size) {
          url = getBiositesApi;
          const searchParams = new URLSearchParams({
            page: params.page.toString(),
            size: params.size.toString(),
          });

          // Mapeo de parámetros para agregar solo los que tienen valor
          const paramMap = {
            search: params.search,
            orderBy: params.sortBy,
            orderMode: params.sortOrder,
            slug: params.hasSlug,
            status: params.status,
            dateRange: params.dateRange,
          };

          Object.entries(paramMap).forEach(([key, value]) => {
            if (value) {
              searchParams.append(key, value);
            }
          });

          url += `?${searchParams.toString()}`;
        }

        const response = await apiService.getAll<
          BiositeFull[] | PaginatedResponse<BiositeFull>
        >(url);

        if (Array.isArray(response)) {
          return response;
        }

        return response as PaginatedResponse<BiositeFull>;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar todos los biosites";
        setError(errorMessage);

        if (params?.page && params?.size) {
          return {
            data: [],
            total: 0,
            page: params.page,
            size: params.size,
            totalPages: 0,
          };
        }
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchUserBiosites = useCallback(async (): Promise<BiositeFull[]> => {
    if (!userId) {
      setError("User ID is required");
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const res = await apiService.getById<BiositeFull[]>(
        `${getBiositeApi}`,
        userId
      );
      return Array.isArray(res) ? res : [res];
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al cargar los biosites";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchChildUsers = useCallback(
    async (parentId: string): Promise<ChildUser[]> => {
      if (!parentId) {
        setError("Parent ID is required");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const childUsers = await apiService.getById<ChildUser[]>(
          `/users`,
          `${parentId}/childrens`
        );
        return Array.isArray(childUsers) ? childUsers : [childUsers];
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar usuarios hijos";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAdminBiosites = useCallback(
    async (adminId: string): Promise<BiositeFull[]> => {
      if (!adminId) {
        setError("Admin ID is required");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const adminBiosites = await apiService.getById<BiositeFull[]>(
          `${getBiositesApi}/admin`,
          adminId
        );
        return Array.isArray(adminBiosites) ? adminBiosites : [adminBiosites];
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar biosites del admin";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchChildBiosites = useCallback(
    async (parentId: string): Promise<BiositeFull[]> => {
      if (!parentId) {
        setError("Parent ID is required");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const adminBiosites = await fetchAdminBiosites(parentId);

        if (adminBiosites.length === 0) {
          const childUsers = await fetchChildUsers(parentId);
          const childBiosites: BiositeFull[] = [];

          // Para cada usuario hijo, obtener sus biosites
          for (const childUser of childUsers) {
            try {
              const userBiosites = await apiService.getById<BiositeFull[]>(
                `${getBiositesApi}/user`,
                childUser.id
              );
              const biositeArray = Array.isArray(userBiosites)
                ? userBiosites
                : [userBiosites];
              childBiosites.push(...biositeArray);
            } catch (error) {
              console.warn(
                `Error fetching biosites for user ${childUser.id}:`,
                error
              );
            }
          }

          return childBiosites;
        }

        return adminBiosites;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar biosites hijos";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [fetchAdminBiosites, fetchChildUsers]
  );

  const fetchCompleteBiositeStructure = useCallback(
    async (
      parentId: string
    ): Promise<{
      ownBiosites: BiositeFull[];
      childBiosites: BiositeFull[];
      allBiosites: BiositeFull[];
    }> => {
      if (!parentId) {
        setError("Parent ID is required");
        return { ownBiosites: [], childBiosites: [], allBiosites: [] };
      }

      try {
        setLoading(true);
        setError(null);

        const ownBiosites = await apiService.getById<BiositeFull[]>(
          `${getBiositeAdminApi}`,
          parentId
        );
        const ownBiositesArray = Array.isArray(ownBiosites)
          ? ownBiosites
          : [ownBiosites];

        const childBiosites = await fetchChildBiosites(parentId);

        const allBiosites = [...ownBiositesArray, ...childBiosites];

        return {
          ownBiosites: ownBiositesArray,
          childBiosites,
          allBiosites,
        };
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar estructura completa de biosites";
        setError(errorMessage);
        return { ownBiosites: [], childBiosites: [], allBiosites: [] };
      } finally {
        setLoading(false);
      }
    },
    [fetchChildBiosites]
  );

  const fetchBiosite = useCallback(async (): Promise<BiositeFull | null> => {
    if (!userId) {
      setError("User ID is required");
      return null;
    }

    if (
      loading ||
      (isInitializedRef.current && currentUserIdRef.current === userId)
    ) {
      return biositeData;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await apiService.getById<BiositeFull | BiositeFull[]>(
        getBiositeApi,
        userId
      );

      let biositeResult: BiositeFull;
      if (Array.isArray(res)) {
        if (res.length === 0) {
          throw new Error("No biosite found for this user");
        }
        biositeResult = res[0];
      } else {
        biositeResult = res;
      }

      setBiositeData(biositeResult);
      isInitializedRef.current = true;
      currentUserIdRef.current = userId;
      return biositeResult;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al cargar el biosite";
      setError(errorMessage);
      setBiositeData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, loading, biositeData]);

  const fetchBiositeBySlug = useCallback(
    async (slug: string): Promise<BiositeFull | null> => {
      if (!slug) {
        setError("Slug is required");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const biosite = await apiService.getById<BiositeFull>(
          "/biosites/slug",
          slug
        );
        return biosite;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar el biosite por slug";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createBiosite = useCallback(
    async (createData: CreateBiositeDto): Promise<BiositeFull | null> => {
      if (!createData.title?.trim() || !createData.slug?.trim()) {
        setError("Title and slug are required");
        return null;
      }

      if (!userId) {
        setError("Parent user ID is required");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // Crear usuario con biosite personalizado en una sola llamada
        const createUserWithBiositeData = {
          email: `${createData.slug}@biosite.com`,
          password:
            createData.password || `biosite_${createData.slug}_${Date.now()}`,
          name: createData.title,
          parentId: userId,
        };

        // Llamar a un endpoint que cree usuario + biosite personalizado
        const result = await apiService.create<
          typeof createUserWithBiositeData,
          { user: CreatedUser; biosite: BiositeFull }
        >(
          registerStudentApi, // Nuevo endpoint
          createUserWithBiositeData
        );

        const newBiosite = result.biosite;

        if (!biositeData) {
          setBiositeData(newBiosite);
          isInitializedRef.current = true;
          currentUserIdRef.current = userId;
        }

        return newBiosite;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al crear el biosite y usuario";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [biositeData, userId]
  );

  const updateBiosite = async (
    updateData: BiositeUpdateDto
  ): Promise<BiositeFull | null> => {
    if (!biositeData?.id) {
      const errorMsg = "No biosite ID available for update";
      setError(errorMsg);
      return null;
    }

    const criticalFields = ["title", "slug"];
    const missingCriticalFields = criticalFields.filter((field) => {
      const value = updateData[field as keyof BiositeUpdateDto];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingCriticalFields.length > 0) {
      const errorMsg = `Missing critical fields: ${missingCriticalFields.join(
        ", "
      )}`;
      setError(errorMsg);
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const updatedBiosite = await apiService.update<BiositeUpdateDto>(
        updateBiositeApi,
        biositeData.id,
        updateData
      );

      if (updatedBiosite == null) {
        const errorMsg = "API returned null/undefined response";
        setError(errorMsg);
        return null;
      }

      let biositeResult: BiositeFull;

      if (Array.isArray(updatedBiosite)) {
        if (updatedBiosite.length === 0) {
          const errorMsg = "API returned empty array";
          setError(errorMsg);
          return null;
        }
        biositeResult = updatedBiosite[0] as BiositeFull;
      } else {
        biositeResult = updatedBiosite as unknown as BiositeFull;
      }

      const newBiositeData: BiositeFull = {
        ...biositeData,
        ...biositeResult,
        id: biositeResult.id || biositeData.id,
        title: biositeResult.title || updateData.title || biositeData.title,
        slug: biositeResult.slug || updateData.slug || biositeData.slug,
        links: biositeData.links || [],
        ownerId: biositeData.ownerId,
        colors: biositeResult.colors || updateData.colors || biositeData.colors,
      };

      setBiositeData(newBiositeData);
      return newBiositeData;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al actualizar el biosite";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const switchBiosite = useCallback(
    async (biositeId: string): Promise<BiositeFull | null> => {
      try {
        setLoading(true);
        setError(null);

        const biosite = await apiService.getById<BiositeFull>(
          getBiositesApi,
          biositeId
        );
        setBiositeData(biosite);

        return biosite;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cambiar de biosite";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteBiosite = useCallback(
    async (biositeId: string): Promise<boolean> => {
      if (!biositeId) {
        setError("Biosite ID is required");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        await apiService.delete(getBiositesApi, biositeId);

        // Si el biosite eliminado es el actual, limpiar el estado
        if (biositeData?.id === biositeId) {
          setBiositeData(null);
          isInitializedRef.current = false;
          currentUserIdRef.current = undefined;
        }

        return true;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al eliminar el biosite";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [biositeData]
  );

  const refreshBiosite = useCallback(async (): Promise<BiositeFull | null> => {
    if (!biositeData?.id) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const refreshedBiosite = await apiService.getById<BiositeFull>(
        getBiositesApi,
        biositeData.id
      );
      setBiositeData(refreshedBiosite);

      return refreshedBiosite;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al refrescar el biosite";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [biositeData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setBiositeData(null);
    setError(null);
    setLoading(false);
    isInitializedRef.current = false;
    currentUserIdRef.current = undefined;
  }, []);

  return {
    // Estado
    biositeData,
    loading,
    error,

    // Métodos principales
    fetchBiosite,
    fetchBiositeBySlug,
    createBiosite,
    updateBiosite,
    deleteBiosite,
    switchBiosite,
    refreshBiosite,

    // Métodos de usuario
    fetchUserBiosites,
    fetchChildUsers,
    fetchAdminBiosites,
    fetchChildBiosites,
    fetchCompleteBiositeStructure,

    // Nuevos métodos para obtener todos los datos
    fetchAllUsers,
    fetchAllBiosites,

    // Utilidades
    clearError,
    resetState,
  };
};
