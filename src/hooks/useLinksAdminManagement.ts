import { useState, useCallback } from 'react';
import apiService from '../service/apiService';
import Cookie from 'js-cookie';

export const useAdminLinkManagement = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const role = Cookie.get("roleName");
    const userId = Cookie.get("userId");

    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    const updateParentAndChildrenLink = useCallback(async (linkData: {
        icon: string;
        url: string;
        label: string;
        link_type: string;
    }) => {
        if (!isAdmin || !userId) {
            throw new Error('Only admins can update parent and children links');
        }

        try {
            setLoading(true);
            setError(null);

            const response = await apiService.patch(
                `/biosites/admin/update-link/${userId}`,
                linkData
            );

            return response;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error updating parent and children links';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isAdmin, userId]);

    const clearError = useCallback(() => setError(null), []);

    return {
        updateParentAndChildrenLink,
        loading,
        error,
        clearError,
        isAdmin,
        userId,
        role
    };
};