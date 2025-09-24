import { Upload, Image, message } from "antd";
import { uploadBiositeAvatar, uploadBiositeBackground } from "./lib/uploadImage.ts";
import type { BiositeFull, BiositeUpdateDto } from "../../../../interfaces/Biosite";

interface ImageUploadSectionProps {
    biosite: BiositeFull;
    loading: boolean;
    userId: string | undefined;
    updateBiosite: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    updatePreview: (data: Partial<BiositeFull>) => void;
    role: string | undefined;
}

const ImageUploadSection = ({
                                biosite,
                                loading,
                                userId,
                                updateBiosite,
                                updatePreview,
                                role
                            }: ImageUploadSectionProps) => {

    const placeholderAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23e5e7eb'/%3E%3Cpath d='M40 20c-6 0-10 4-10 10s4 10 10 10 10-4 10-10-4-10-10-10zM20 60c0-10 9-15 20-15s20 5 20 15v5H20v-5z' fill='%239ca3af'/%3E%3C/svg%3E";

    const placeholderBackground = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%23f3f4f6'/%3E%3Cpath d='M40 40h120v40H40z' fill='%23d1d5db'/%3E%3Ccircle cx='60' cy='50' r='8' fill='%239ca3af'/%3E%3Cpath d='M80 65l20-15 40 25H80z' fill='%239ca3af'/%3E%3C/svg%3E";

    const isValidImageUrl = (url: string | null | undefined): boolean => {
        if (!url || typeof url !== 'string') return false;

        if (url.startsWith('data:')) {
            const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
            const isValid = dataUrlRegex.test(url);
            if (isValid) {
                const base64Part = url.split(',')[1];
                return base64Part && base64Part.length > 10;
            }
            return false;
        }

        try {
            const urlObj = new URL(url);
            const isHttps = ['http:', 'https:'].includes(urlObj.protocol);
            const hasValidExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
                url.includes('/img/') ||
                url.includes('image-');


            return isHttps && (hasValidExtension || !urlObj.pathname.includes('.'));
        } catch (error) {
            console.warn('Invalid URL:', url, error);
            return false;
        }
    };

    const validateFile = (file: File): boolean => {

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            message.error('Formato de archivo no válido. Solo se permiten: JPG, PNG, WebP, GIF');
            return false;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            message.error('El archivo es demasiado grande. Tamaño máximo: 5MB');
            return false;
        }

        return true;
    };

    const handleUpload = async (info: any, key: "avatarImage" | "backgroundImage") => {
        console.log(`=== HANDLE UPLOAD DEBUG (${key}) ===`);
        console.log('Upload info:', info);
        console.log('File object:', info.file);
        console.log('File status:', info.file?.status);

        if (!info.file) {
            console.log("No file in info object, upload was likely cancelled");
            return;
        }

        if (info.file.status === 'removed' || info.file.status === 'error') {
            console.log(`Upload ${info.file.status} for ${key}`);
            return;
        }

        const fileToUpload = info.file.originFileObj || info.file;

        console.log("File to upload:", fileToUpload);
        console.log("File instanceof File:", fileToUpload instanceof File);
        console.log("File type:", typeof fileToUpload);

        if (!fileToUpload || !(fileToUpload instanceof File)) {
            console.error("Invalid file object:", fileToUpload);
            message.error("Error: Archivo no válido");
            return;
        }

        if (!validateFile(fileToUpload)) {
            return;
        }

        console.log("Valid file details:", {
            name: fileToUpload.name,
            type: fileToUpload.type,
            size: fileToUpload.size,
            lastModified: fileToUpload.lastModified
        });

        if (!biosite?.id) {
            console.error("Biosite ID is missing");
            message.error("Error: ID del biosite no disponible");
            return;
        }

        if (!userId) {
            console.error("User ID is missing");
            message.error("Error: ID de usuario no disponible");
            return;
        }

        try {
            console.log(`Starting upload for ${key}...`);
            const loadingMessage = message.loading(
                `Subiendo ${key === 'avatarImage' ? 'avatar' : 'imagen de portada'}...`,
                0
            );

            let imageUrl: string;

            if (key === 'avatarImage') {
                imageUrl = await uploadBiositeAvatar(fileToUpload, biosite.id);
            } else {
                imageUrl = await uploadBiositeBackground(fileToUpload, biosite.id);
            }

            console.log("Upload completed successfully. URL:", imageUrl);
            loadingMessage();

            if (!imageUrl) {
                throw new Error("No se pudo obtener la URL de la imagen");
            }

            if (!isValidImageUrl(imageUrl)) {
                console.error("Uploaded image URL is invalid:", imageUrl);
                throw new Error("La URL de la imagen subida no es válida");
            }

            const previewUpdate = {
                [key]: imageUrl
            };

            updatePreview(previewUpdate);

            message.success(`${key === 'avatarImage' ? 'Avatar' : 'Imagen de portada'} actualizada correctamente`);
            console.log(`${key} updated successfully with URL: ${imageUrl}`);

        } catch (error: any) {
            console.error(`=== ${key.toUpperCase()} UPLOAD ERROR ===`);
            console.error("Upload error:", error);
            console.error("Error message:", error?.message);
            console.error("Error response:", error?.response?.data);

            let errorMessage = "Error al subir la imagen";

            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            message.error(errorMessage);
        }
    };

    const customUpload = (options: any, key: "avatarImage" | "backgroundImage") => {
        const { file, onSuccess, onError } = options;

        console.log(`=== CUSTOM UPLOAD (${key}) ===`);
        console.log('File in customUpload:', file);
        console.log('File type:', file.type);
        console.log('File size:', file.size);

        if (!validateFile(file)) {
            onError(new Error('Invalid file'));
            return;
        }

        const uploadInfo = {
            file: file,
            fileList: [file]
        };

        handleUpload(uploadInfo, key)
            .then(() => {
                onSuccess({}, file);
            })
            .catch((error) => {
                console.error('Custom upload error:', error);
                onError(error);
            });
    };

    const canEditCover =  role === "SUPER_ADMIN" || role === "ADMIN";

    const safeAvatarImage = isValidImageUrl(biosite.avatarImage) ? biosite.avatarImage : placeholderAvatar;
    const safeBackgroundImage = isValidImageUrl(biosite.backgroundImage) ? biosite.backgroundImage : placeholderBackground;

    return (
        <div className="flex gap-1">
            {/* Avatar Section */}
            <div className="flex-1">
                <Upload
                    showUploadList={false}
                    customRequest={(options) => customUpload(options, "avatarImage")}
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    disabled={loading}
                    multiple={false}
                    maxCount={1}
                >
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 border-gray-400 rounded-xl border flex items-center justify-center overflow-hidden">
                            <Image
                                width={100}
                                height={100}
                                src={safeAvatarImage}
                                className="object-cover "
                                fallback={placeholderAvatar}
                                preview={false}
                                onError={(e) => {
                                    console.warn('Avatar image failed to load:', biosite.avatarImage);
                                    const img = e.target as HTMLImageElement;
                                    if (img.src !== placeholderAvatar) {
                                        img.src = placeholderAvatar;
                                    }
                                }}
                            />
                        </div>
                        {/* Upload overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        {loading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                </Upload>
            </div>

            {/* Background Image Section */}
            {canEditCover && (
                <div className="flex-1">
                    <Upload
                        showUploadList={false}
                        customRequest={(options) => customUpload(options, "backgroundImage")}
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        disabled={loading}
                        multiple={false}
                        maxCount={1}
                    >
                        <div className="relative group cursor-pointer">
                            <div className="w-59 h-24 bg-gray-100 rounded-lg border-gray-400  border  flex items-center justify-center overflow-hidden">
                                <Image
                                    width={340}
                                    height={100}
                                    src={safeBackgroundImage}
                                    className="rounded-lg object-cover"
                                    fallback={placeholderBackground}
                                    preview={false}
                                    onError={(e) => {
                                        console.warn('Background image failed to load:', biosite.backgroundImage);
                                        const img = e.target as HTMLImageElement;
                                        if (img.src !== placeholderBackground) {
                                            img.src = placeholderBackground;
                                        }
                                    }}
                                />
                            </div>
                            {/* Upload overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            {loading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                    </Upload>
                </div>
            )}
        </div>
    );
};

export default ImageUploadSection;
