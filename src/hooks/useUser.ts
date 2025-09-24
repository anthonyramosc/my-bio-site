import { useState, useCallback } from "react";
import apiService from "../service/apiService";
import { getALLUsersApi } from "../constants/EndpointsRoutes";

interface User {
  id: string;
  email: string;
  cedula?: string; // Añadido campo cedula como opcional
  name?: string;
  description?: string;
  avatarUrl?: string;
  site?: string;
  phone?: string;
  isActive?: boolean;
  role?: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserDto {
  name?: string;
  cedula?: string;
  description?: string;
  avatarUrl?: string;
  site?: string;
  phone?: string;
  isActive?: boolean;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUsers = useCallback(async (): Promise<User[]> => {
    setLoading(true);
    setError(null);

    try {
      const users = await apiService.getAll<User[]>(getALLUsersApi);
      return Array.isArray(users) ? users : [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error fetching all users";
      setError(errorMessage);
      console.error("Error fetching all users:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(
    async (userId: string): Promise<User | null> => {
      if (!userId) return null;

      setLoading(true);
      setError(null);

      try {
        const userData = await apiService.getById<User>("/users", userId);
        setUser(userData);
        return userData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error fetching user";
        setError(errorMessage);
        console.error("Error fetching user:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUser = useCallback(
    async (userId: string, updateData: UpdateUserDto): Promise<User | null> => {
      if (!userId) return null;

      setLoading(true);
      setError(null);

      try {
        const updatedUser = await apiService.update<UpdateUserDto>(
          "/users",
          userId,
          updateData
        );
        setUser(updatedUser as User);
        return updatedUser as User;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error updating user";
        setError(errorMessage);
        console.error("Error updating user:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetUser = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    fetchUser,
    fetchAllUsers,
    updateUser,
    clearError,
    resetUser,
  };
};
