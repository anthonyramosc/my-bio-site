import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Upload, Copy, Check, User } from "lucide-react";
import { Upload as AntdUpload, message } from "antd";
import { uploadImage } from "../../../layers/MySite/Profile/lib/uploadImage";
import imgP6 from "../../../../../public/img/fondo.svg";

interface CreateBiositeData {
    title: string;
    slug: string;
    password: string;
    userName: string;
    profileImage?: string;
}

interface CreateBiositeWizardProps {
    createForm: CreateBiositeData;
    isLoadingState: boolean;
    isCreating: boolean;
    onTitleChange: (title: string) => void;
    onPasswordChange: (password: string) => void;
    onSlugChange: (slug: string) => void;
    onUserNameChange: (userName: string) => void;
    onProfileImageChange: (image: string) => void;
    onCreateBiosite: () => void;
    onCancel: () => void;
    createdBiositeUrl?: string;
}

type WizardStep = 'username' | 'profile' | 'success';

const CreateBiositeWizard: React.FC<CreateBiositeWizardProps> = ({
                                                                     createForm,
                                                                     isLoadingState,
                                                                     isCreating,
                                                                     onTitleChange,
                                                                     onSlugChange,
                                                                     onPasswordChange,
                                                                     onUserNameChange,
                                                                     onProfileImageChange,
                                                                     onCreateBiosite,
                                                                     onCancel,
                                                                     createdBiositeUrl
                                                                 }) => {
    const [currentStep, setCurrentStep] = useState<WizardStep>('username');
    const [copied, setCopied] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Validación de archivo de imagen
    const validateImageFile = (file: File): boolean => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            message.error('Formato de archivo no válido. Solo se permiten: JPG, PNG, WebP, GIF');
            return false;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            message.error('El archivo es demasiado grande. Tamaño máximo: 5MB');
            return false;
        }

        return true;
    };

    // Manejar upload de imagen
    const handleImageUpload = async (info: any) => {
        console.log('=== PROFILE IMAGE UPLOAD ===');
        console.log('Upload info:', info);

        if (!info.file) {
            console.log("No file in info object");
            return;
        }

        if (info.file.status === 'removed' || info.file.status === 'error') {
            console.log(`Upload ${info.file.status} for profile image`);
            return;
        }

        const fileToUpload = info.file.originFileObj || info.file;

        if (!fileToUpload || !(fileToUpload instanceof File)) {
            console.error("Invalid file object:", fileToUpload);
            message.error("Error: Archivo no válido");
            return;
        }

        if (!validateImageFile(fileToUpload)) {
            return;
        }

        try {
            setUploadingImage(true);
            const loadingMessage = message.loading('Subiendo imagen de perfil...', 0);

            // Usar la función de upload genérica
            const imageUrl = await uploadImage(fileToUpload);

            console.log("Profile image upload successful. URL:", imageUrl);
            loadingMessage();

            if (!imageUrl) {
                throw new Error("No se pudo obtener la URL de la imagen");
            }

            // Actualizar la imagen en el formulario
            onProfileImageChange(imageUrl);
            message.success('Imagen de perfil actualizada correctamente');

        } catch (error: any) {
            console.error("=== PROFILE IMAGE UPLOAD ERROR ===");
            console.error("Upload error:", error);

            let errorMessage = "Error al subir la imagen de perfil";
            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            message.error(errorMessage);
        } finally {
            setUploadingImage(false);
        }
    };

    // Custom upload function para Antd
    const customImageUpload = (options: any) => {
        const { file, onSuccess, onError } = options;

        console.log('=== CUSTOM IMAGE UPLOAD ===');
        console.log('File in customUpload:', file);

        if (!validateImageFile(file)) {
            onError(new Error('Invalid file'));
            return;
        }

        const uploadInfo = {
            file: file,
            fileList: [file]
        };

        handleImageUpload(uploadInfo)
            .then(() => {
                onSuccess({}, file);
            })
            .catch((error) => {
                console.error('Custom image upload error:', error);
                onError(error);
            });
    };

    const handleNext = () => {
        if (currentStep === 'username') {
            setCurrentStep('profile');
        } else if (currentStep === 'profile') {
            onCreateBiosite();
        }
    };

    const handleBack = () => {
        if (currentStep === 'profile') {
            setCurrentStep('username');
        } else if (currentStep === 'username') {
            onCancel();
        }
    };

    const handleCopyUrl = async () => {
        if (createdBiositeUrl) {
            try {
                await navigator.clipboard.writeText(createdBiositeUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Error copying to clipboard:', err);
            }
        }
    };

    const canProceedFromUsername = createForm.slug.trim().length > 0;
    const canProceedFromProfile = createForm.title.trim().length > 0;

    // Pantalla de éxito después de crear el biosite
    if (createdBiositeUrl && currentStep !== 'success') {
        setCurrentStep('success');
    }

    return (
        <div className="fixed inset-0  z-50 flex items-center justify-center p-4"
             style={{
                 background: `url(${imgP6}) no-repeat center center`,
                 backgroundSize: 'cover',
                 backgroundColor: 'white',
             }}>
            <div className=" rounded-lg w-full max-w-md h-full max-h-[600px] flex flex-col">
                {/* Header */}
                <div className=" flex items-center justify-between p-4 border-b">
                    <button
                        onClick={handleBack}
                        className="flex items-center cursor-pointer text-gray-600 hover:text-gray-800"
                        disabled={isLoadingState}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        BACK
                    </button>
                    <h2 className="font-medium text-gray-900">
                        {currentStep === 'username' && 'CREATE A FREE BIO SITE'}
                        {currentStep === 'profile' && 'PROFILE'}
                        {currentStep === 'success' && 'SUCCESS'}
                    </h2>
                    <div className="w-16"></div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Username Step */}
                    {currentStep === 'username' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="mb-8">
                                <h3 className="text-2xl font-light text-gray-800 mb-2">
                                    Reclama tu nombre de usuario publico
                                </h3>
                            </div>

                            <div className="w-full max-w-sm">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={createForm.slug}
                                        onChange={(e) => onSlugChange(e.target.value)}
                                        className="w-full px-4 py-3 text-lg bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-24"
                                        placeholder="nombre"
                                        disabled={isLoadingState}
                                    />
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        vesite/
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={!canProceedFromUsername || isLoadingState}
                                        className="absolute right-2 top-1/2 cursor-pointer transform -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                                    >
                                        <ArrowRight className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Step */}
                    {currentStep === 'profile' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="mb-8">
                                <h3 className="text-xl font-light text-gray-800 mb-2">
                                    Añade tu nombre y imagen
                                </h3>
                                <p className="text-gray-600">tu sitio mas tuyo</p>
                            </div>

                            <div className="w-full max-w-sm space-y-6">
                                {/* Profile Image Upload */}
                                <div className="flex flex-col items-center">
                                    <AntdUpload
                                        showUploadList={false}
                                        customRequest={customImageUpload}
                                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                        disabled={uploadingImage || isLoadingState}
                                        multiple={false}
                                        maxCount={1}
                                    >
                                        <div className="relative group cursor-pointer">
                                            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 hover:bg-gray-400">
                                                {createForm.profileImage ? (
                                                    <img
                                                        src={createForm.profileImage}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-8 w-8 text-gray-600" />
                                                )}
                                            </div>

                                            {/* Upload overlay */}
                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {uploadingImage ? (
                                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                                ) : (
                                                    <Upload className="h-6 w-6 text-white" />
                                                )}
                                            </div>
                                        </div>
                                    </AntdUpload>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Clickea para actualizar tu imagen
                                    </p>
                                </div>

                                {/* Name Input */}
                                <input
                                    type="text"
                                    value={createForm.title}
                                    onChange={(e) => onTitleChange(e.target.value)}
                                    className="w-full px-4 py-3 text-center bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add your name here"
                                    disabled={isLoadingState}
                                />

                                {/* Password Input */}
                                <input
                                    type="password"
                                    value={createForm.password}
                                    onChange={(e) => onPasswordChange(e.target.value)}
                                    className="w-full px-4 py-3 text-center bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Password for your account"
                                    disabled={isLoadingState}
                                />
                            </div>

                            {/* Continue Button */}
                            <div className="mt-8">
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceedFromProfile || isLoadingState || uploadingImage}
                                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                                >
                                    {isCreating ? (
                                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                                    ) : (
                                        <ArrowRight className="h-5 w-5 text-white cursor-pointer" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Success Step */}
                    {currentStep === 'success' && (
                        <div className="flex-1 flex">
                            {/* Left side - Phone mockup */}
                            <div className="flex-1 flex items-center justify-center p-8 relative">
                                {/* Decorative shapes */}
                                <div className="absolute top-20 left-8 w-16 h-16 bg-purple-500 rounded-full opacity-80"></div>
                                <div className="absolute top-32 left-12 w-12 h-12 bg-purple-600 rounded-full opacity-60"></div>
                                <div className="absolute top-16 right-16 w-8 h-8 bg-pink-400 rounded-full opacity-80"></div>
                                <div className="absolute bottom-32 right-12 w-20 h-16 bg-blue-500 rounded-lg opacity-80"></div>
                                <div className="absolute bottom-20 left-16 w-12 h-12 bg-blue-600 rounded-full opacity-60"></div>

                                {/* Phone mockup */}
                                <div className="bg-white rounded-3xl p-6 w-64 h-96 shadow-2xl relative z-10">
                                    <div className="flex flex-col items-center h-full">
                                        <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 overflow-hidden">
                                            {createForm.profileImage ? (
                                                <img
                                                    src={createForm.profileImage}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-800 mb-6">
                                            {createForm.title || 'Your Name'}
                                        </h3>
                                        <div className="w-full space-y-3">
                                            <div className="h-3 bg-gray-200 rounded-full"></div>
                                            <div className="h-3 bg-gray-200 rounded-full"></div>
                                            <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                                        </div>
                                        <div className="mt-auto">
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                <span>CREATE A FREE BIO SITE</span>
                                                <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Success message */}
                            <div className="flex-1 flex flex-col justify-center p-8">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Your site is now live!
                                    </h3>
                                    <p className="text-gray-300">
                                        Get more visitors by sharing your Bio Site everywhere.
                                    </p>
                                </div>

                                {/* URL Copy */}
                                <div className="bg-gray-700 rounded-lg p-3 mb-6 flex items-center justify-between">
                                    <span className="text-white text-sm">
                                        {createdBiositeUrl || `bio.site/${createForm.slug}`}
                                    </span>
                                    <button
                                        onClick={handleCopyUrl}
                                        className="text-gray-300 hover:text-white"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={onCancel}
                                        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        CONTINUE EDITING
                                    </button>
                                    <button
                                        onClick={() => window.open(createdBiositeUrl || `bio.site/${createForm.slug}`, '_blank')}
                                        className="flex-1 px-4 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        SHARE YOUR SITE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateBiositeWizard;