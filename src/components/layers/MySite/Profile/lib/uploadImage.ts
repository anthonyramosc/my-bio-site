// lib/uploadImage.ts
import api from "../../../../../service/api"; // Import api directly instead of apiService
import {
    uploadBiositeAvatarApi,
    uploadBiositeBackgroundApi,
    LinksImageApi,
    BlockImageApi
} from "../../../../../constants/EndpointsRoutes";

export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
        url: string;
    };
}

/**
 * Upload biosite avatar image
 */
export const uploadBiositeAvatar = async (file: File, biositeId: string): Promise<string> => {
    try {
        console.log("=== UPLOADING BIOSITE AVATAR ===");
        console.log("File details:", {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        });
        console.log("Biosite ID:", biositeId);

        // Validate inputs
        if (!file || !(file instanceof File)) {
            throw new Error('Archivo no válido');
        }

        if (!biositeId || typeof biositeId !== 'string') {
            throw new Error('ID de biosite no válido');
        }

        // Create FormData and append the file
        const formData = new FormData();
        formData.append('image', file, file.name);

        // Log FormData contents (for debugging)
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
            if (value instanceof File) {
                console.log(`  File details: ${value.name}, ${value.type}, ${value.size} bytes`);
            }
        }

        const endpoint = `${uploadBiositeAvatarApi}/${biositeId}`;
        console.log("API endpoint:", endpoint);

        // Use api directly instead of apiService to ensure proper headers
        const response = await api.post<UploadResponse>(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Avatar upload response:", response.data);

        if (!response.data) {
            throw new Error('No se recibió respuesta del servidor');
        }

        if (!response.data.success) {
            throw new Error(response.data.message || 'Error al subir el avatar');
        }

        if (!response.data.data?.url) {
            throw new Error('URL de imagen no recibida del servidor');
        }

        console.log("Avatar upload successful. URL:", response.data.data.url);
        return response.data.data.url;

    } catch (error: any) {
        console.error("=== AVATAR UPLOAD ERROR ===");
        console.error("Error object:", error);
        console.error("Error message:", error?.message);
        console.error("Error response:", error?.response);
        console.error("Error response data:", error?.response?.data);

        // Extract the most appropriate error message
        let errorMessage = 'Error al subir el avatar';

        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Upload biosite background image
 */
export const uploadBiositeBackground = async (file: File, biositeId: string): Promise<string> => {
    try {
        console.log("=== UPLOADING BIOSITE BACKGROUND ===");
        console.log("File details:", {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        });
        console.log("Biosite ID:", biositeId);

        // Validate inputs
        if (!file || !(file instanceof File)) {
            throw new Error('Archivo no válido');
        }

        if (!biositeId || typeof biositeId !== 'string') {
            throw new Error('ID de biosite no válido');
        }

        // Create FormData and append the file
        const formData = new FormData();
        formData.append('image', file, file.name);

        // Log FormData contents (for debugging)
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
            if (value instanceof File) {
                console.log(`  File details: ${value.name}, ${value.type}, ${value.size} bytes`);
            }
        }

        const endpoint = `${uploadBiositeBackgroundApi}/${biositeId}`;
        console.log("API endpoint:", endpoint);

        // Use api directly instead of apiService to ensure proper headers
        const response = await api.post<UploadResponse>(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Background upload response:", response.data);

        if (!response.data) {
            throw new Error('No se recibió respuesta del servidor');
        }

        if (!response.data.success) {
            throw new Error(response.data.message || 'Error al subir la imagen de fondo');
        }

        if (!response.data.data?.url) {
            throw new Error('URL de imagen no recibida del servidor');
        }

        console.log("Background upload successful. URL:", response.data.data.url);
        return response.data.data.url;

    } catch (error: any) {
        console.error("=== BACKGROUND UPLOAD ERROR ===");
        console.error("Error object:", error);
        console.error("Error message:", error?.message);
        console.error("Error response:", error?.response);
        console.error("Error response data:", error?.response?.data);

        // Extract the most appropriate error message
        let errorMessage = 'Error al subir la imagen de fondo';

        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Generic image upload (fallback)
 */
export const uploadImage = async (file: File): Promise<string> => {
    try {
        console.log("=== UPLOADING GENERIC IMAGE ===");
        console.log("File details:", {
            name: file.name,
            type: file.type,
            size: file.size
        });

        if (!file || !(file instanceof File)) {
            throw new Error('Archivo no válido');
        }

        const formData = new FormData();
        formData.append('image', file, file.name);

        // Use api directly instead of apiService
        const response = await api.post<UploadResponse>('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Generic upload response:", response.data);

        if (!response.data?.success || !response.data.data?.url) {
            throw new Error(response.data?.message || 'Error al subir la imagen');
        }

        return response.data.data.url;
    } catch (error: any) {
        console.error("Error uploading generic image:", error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Error al subir la imagen';
        throw new Error(errorMessage);
    }
};
export const uploadLinkImage = async (file: File, linkId: string): Promise<string> => {
    try {
        console.log("=== UPLOADING LINK IMAGE ===");
        console.log("File details:", {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        });
        console.log("Link ID:", linkId);

        if (!file || !(file instanceof File)) {
            throw new Error('Archivo no válido');
        }

        if (!linkId || typeof linkId !== 'string') {
            throw new Error('ID de enlace no válido');
        }

        const formData = new FormData();
        formData.append('image', file, file.name);

        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
            if (value instanceof File) {
                console.log(`  File details: ${value.name}, ${value.type}, ${value.size} bytes`);
            }
        }

        const endpoint = `${LinksImageApi}/${linkId}`;
        console.log("API endpoint:", endpoint);

        const response = await api.post<UploadResponse>(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Link image upload response:", response.data);

        if (!response.data) {
            throw new Error('No se recibió respuesta del servidor');
        }

        if (!response.data.success) {
            throw new Error(response.data.message || 'Error al subir la imagen del enlace');
        }

        if (!response.data.data?.url) {
            throw new Error('URL de imagen no recibida del servidor');
        }

        console.log("Link image upload successful. URL:", response.data.data.url);
        return response.data.data.url;

    } catch (error: any) {
        console.error("=== LINK IMAGE UPLOAD ERROR ===");
        console.error("Error object:", error);
        console.error("Error message:", error?.message);
        console.error("Error response:", error?.response);
        console.error("Error response data:", error?.response?.data);

        // Extract the most appropriate error message
        let errorMessage = 'Error al subir la imagen del enlace';

        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};


export const uploadBlockImage = async (file: File, TexsBlockId: string): Promise<string> => {
    try {
        console.log("=== UPLOADING LINK IMAGE ===");
        console.log("File details:", {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        });
        console.log("Link ID:", TexsBlockId);

        if (!file || !(file instanceof File)) {
            throw new Error('Archivo no válido');
        }

        if (!TexsBlockId || typeof TexsBlockId !== 'string') {
            throw new Error('ID de enlace no válido');
        }

        const formData = new FormData();
        formData.append('image', file, file.name);

        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
            if (value instanceof File) {
                console.log(`  File details: ${value.name}, ${value.type}, ${value.size} bytes`);
            }
        }

        const endpoint = `${BlockImageApi}/${TexsBlockId}`;
        console.log("API endpoint:", endpoint);

        const response = await api.post<UploadResponse>(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Link image upload response:", response.data);

        if (!response.data) {
            throw new Error('No se recibió respuesta del servidor');
        }

        if (!response.data.success) {
            throw new Error(response.data.message || 'Error al subir la imagen del enlace');
        }

        if (!response.data.data?.url) {
            throw new Error('URL de imagen no recibida del servidor');
        }

        console.log("Link image upload successful. URL:", response.data.data.url);
        return response.data.data.url;

    } catch (error: any) {
        console.error("=== LINK IMAGE UPLOAD ERROR ===");
        console.error("Error object:", error);
        console.error("Error message:", error?.message);
        console.error("Error response:", error?.response);
        console.error("Error response data:", error?.response?.data);

        // Extract the most appropriate error message
        let errorMessage = 'Error al subir la imagen del enlace';

        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};
