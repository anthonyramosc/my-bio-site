import { ChevronLeft, Image, Upload, X, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../../../hooks/useAuthContext";
import { useBiositeContext } from "../../../../context/BiositeContext";
import apiService from "../../../../service/apiService";
import { useNavigate } from "react-router-dom";
import type { ProfileUpdateData } from "../../../../interfaces/ProfileUpdateData";

const ProfilePage = () => {
    const { userId } = useAuthContext();
    const { profileData, setProfileData, biositeId } = useBiositeContext();
    const [name, setName] = useState(profileData.name);
    const [description, setDescription] = useState(profileData.description);
    const [url, setUrl] = useState(profileData.site);
    const [selectedDesign, setSelectedDesign] = useState("Minimal");
    const [minimalClicked, setMinimalClicked] = useState(false);
    const [creativeClicked, setCreativeClicked] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(profileData.avatarUrl || null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{type: string, message: string}>({type: '', message: ''});
    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const designs = [
        { name: "Minimalista", preview: "minimal-preview.png" },
    ];

    useEffect(() => {
        // Initialize local state from global context
        setName(profileData.name);
        setDescription(profileData.description);
        setUrl(profileData.site);
        setProfileImage(profileData.avatarUrl || null);
        
        // Still fetch additional data from API if needed
        if (!userId) return;
        apiService.getById("/biosites/user", userId)
            .then((biosites) => {
                let biosite: { backgroundImage?: string } | undefined = undefined;
                if (Array.isArray(biosites) && biosites.length > 0 && typeof biosites[0] === 'object') {
                    biosite = biosites[0];
                }
                
                if (biosite) {
                    setCoverImage(biosite.backgroundImage || null);
                } else {
                    setCoverImage(null);
                }
            })
            .catch(() => {
                setCoverImage(null);
            });
    }, [userId, profileData]);

    // Crear biosite si no existe
    const handleCreateBiosite = async () => {
        if (!userId) {
            setStatusMessage({type: 'error', message: 'Usuario no identificado'});
            return;
        }
        
        try {
            setStatusMessage({type: 'loading', message: 'Creando biosite...'});
            
            const response = await apiService.create("/biosites", {
                ownerId: userId,
                title: name || 'Mi Biosite',
                slug: url || `user-${userId}`,
                avatarImage: profileImage,
                backgroundImage: coverImage,
            });
            
            // Asegurémonos de que la respuesta tenga un id
            const biosite = response as unknown as { id: string };
            if (biosite && biosite.id) {
                setBiositeId(biosite.id);
                setStatusMessage({type: 'success', message: 'Biosite creado correctamente'});
            } else {
                throw new Error('La respuesta no contiene un ID');
            }
            
            setTimeout(() => {
                setStatusMessage({type: '', message: ''});
            }, 3000);
            
        } catch (error) {
            console.error('Error al crear biosite:', error);
            setStatusMessage({type: 'error', message: 'Error al crear el biosite'});
            
            setTimeout(() => {
                setStatusMessage({type: '', message: ''});
            }, 3000);
        }
    };

    // Eliminar biosite
    const handleDeleteBiosite = async () => {
        if (!biositeId) {
            setStatusMessage({type: 'error', message: 'No hay biosite para eliminar'});
            return;
        }
        
        // Confirmar antes de eliminar
        if (!window.confirm("¿Estás seguro de que deseas eliminar este biosite? Esta acción no se puede deshacer.")) {
            return;
        }
        
        try {
            setStatusMessage({type: 'loading', message: 'Eliminando biosite...'});
            
            await apiService.delete("/biosites", biositeId);
            setBiositeId(null);
            setName("");
            setDescription("");
            setUrl("");
            setProfileImage(null);
            setCoverImage(null);
            
            setStatusMessage({type: 'success', message: 'Biosite eliminado correctamente'});
            
            setTimeout(() => {
                setStatusMessage({type: '', message: ''});
            }, 3000);
            
        } catch (error) {
            console.error('Error al eliminar biosite:', error);
            setStatusMessage({type: 'error', message: 'Error al eliminar el biosite'});
            
            setTimeout(() => {
                setStatusMessage({type: '', message: ''});
            }, 3000);
        }
    };

    // Guardar cambios de nombre y descripción
    const handleSaveProfile = async () => {
        if (!userId) {
            setStatusMessage({type: 'error', message: 'Usuario no identificado'});
            return;
        }
        
        try {
            setStatusMessage({type: 'loading', message: 'Guardando cambios...'});
            
            // Update the context first for immediate UI feedback
            setProfileData({
                name,
                description, 
                site: url,
                avatarUrl: profileImage || ''
            });
            
            // Actualizar usuario
            await apiService.update<ProfileUpdateData>(`/users/${userId}`, {
                name,
                description,
            });
            
            // Si no hay biosite, crear uno
            if (!biositeId) {
                await handleCreateBiosite();
            } else {
                // Actualizar biosite
                await apiService.update("/biosites", biositeId, {
                    title: name,
                    slug: url,
                    avatarImage: profileImage,
                    backgroundImage: coverImage,
                });
            }
            
            setStatusMessage({type: 'success', message: 'Cambios guardados correctamente'});
            
            // Limpiar el mensaje después de 3 segundos
            setTimeout(() => {
                setStatusMessage({type: '', message: ''});
            }, 3000);
            
        } catch (error) {
            console.error('Error al guardar el perfil:', error);
            setStatusMessage({type: 'error', message: 'Error al guardar los cambios'});
            
            // Limpiar el mensaje de error después de 3 segundos
            setTimeout(() => {
                setStatusMessage({type: '', message: ''});
            }, 3000);
        }
    };

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    const imageUrl = e.target.result as string;
                    setProfileImage(imageUrl);
                    // Update context in real-time for preview
                    setProfileData(prev => ({ ...prev, avatarUrl: imageUrl }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) setCoverImage(e.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProfileImage = () => {
        setProfileImage(null);
        // Update context in real-time for preview
        setProfileData(prev => ({ ...prev, avatarUrl: '' }));
        if (profileInputRef.current) {
            profileInputRef.current.value = '';
        }
    };

    const removeCoverImage = () => {
        setCoverImage(null);
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
    };
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1);
    };

    // Componente de estado/mensaje
    const StatusMessage = () => {
        if (!statusMessage.message) return null;
        
        return (
            <div className={`fixed top-4 right-4 p-3 rounded shadow-lg transition-all duration-300 ${
                statusMessage.type === 'error' ? 'bg-red-600' :
                statusMessage.type === 'success' ? 'bg-green-600' :
                'bg-gray-700'
            }`}>
                <div className="flex items-center text-white">
                    {statusMessage.type === 'error' && <AlertCircle className="mr-2" size={16} />}
                    {statusMessage.type === 'success' && <CheckCircle className="mr-2" size={16} />}
                    {statusMessage.type === 'loading' && <Loader className="mr-2 animate-spin" size={16} />}
                    <span>{statusMessage.message}</span>
                </div>
            </div>
        );
    };

    // --- UI: Fondo global y sin franjas blancas ---
    return (
        <div className="flex flex-col items-center w-full min-h-screen py-8">
            <StatusMessage />
            <div className="w-full max-w-2xl p-4 rounded-xl shadow-lg relative bg-[#181818]">
                {/* Header y Botones de acción */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={16} className="mr-2" />
                        Profile
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveProfile}
                            className="bg-[#2a2a2a] hover:bg-[#323232] text-white px-4 py-2 rounded transition-colors text-sm"
                        >
                            Guardar Cambios
                        </button>
                        {!biositeId ? (
                            <button
                                onClick={handleCreateBiosite}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                            >
                                Crear Biosite
                            </button>
                        ) : (
                            <button
                                onClick={handleDeleteBiosite}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                            >
                                Eliminar Biosite
                            </button>
                        )}
                    </div>
                </div>

                {/* Images Section */}
                <div className="mb-8">
                    <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">
                        IMAGES
                    </h3>
                    <div className="flex space-x-4">
                        {/* Profile Image */}
                        <div className="relative w-24 h-24">
                            <div
                                className="w-full h-full bg-[#2a2a2a] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#323232] transition-colors overflow-hidden"
                                onClick={() => profileInputRef.current?.click()}
                            >
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Upload className="text-gray-400" size={20} />
                                )}
                            </div>
                            <input
                                type="file"
                                ref={profileInputRef}
                                onChange={handleProfileImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {profileImage && (
                                <button
                                    onClick={removeProfileImage}
                                    className="absolute top-1 right-1 rounded-full bg-gray-800 p-1 hover:bg-gray-700 transition-colors"
                                >
                                    <X size={12} className="text-white" />
                                </button>
                            )}
                            <div className="text-center text-xs text-gray-400 mt-2">
                                Foto perfil
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div className="relative w-24 h-24">
                            <div
                                className="w-full h-full bg-[#2a2a2a] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#323232] transition-colors overflow-hidden"
                                onClick={() => coverInputRef.current?.click()}
                            >
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Image className="text-gray-400" size={20} />
                                )}
                            </div>
                            <input
                                type="file"
                                ref={coverInputRef}
                                onChange={handleCoverImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {coverImage && (
                                <button
                                    onClick={removeCoverImage}
                                    className="absolute top-1 right-1 rounded-full bg-gray-800 p-1 hover:bg-gray-700 transition-colors"
                                >
                                    <X size={12} className="text-white" />
                                </button>
                            )}
                            <div className="text-center text-xs text-gray-400 mt-2">
                                Portada
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="mb-8">
                    <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">
                        ABOUT
                    </h3>
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                                NAME
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    // Update context in real-time for preview
                                    setProfileData(prev => ({ ...prev, name: e.target.value }));
                                }}
                                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="Enter your name"
                            />
                        </div>
                        {/* Description Field */}
                        <div>
                            <textarea
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    // Update context in real-time for preview
                                    setProfileData(prev => ({ ...prev, description: e.target.value }));
                                }}
                                className="w-full bg-[#2a2a2a] text-gray-400 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-600 h-24 resize-none"
                                placeholder="Add Description"
                            />
                        </div>
                    </div>
                </div>

                {/* Site Section */}
                <div className="mb-8">
                    <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">
                        SITE
                    </h3>
                    <div className="bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                                URL
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    // Update context in real-time for preview
                                    setProfileData(prev => ({ ...prev, site: e.target.value }));
                                }}
                                className="w-full bg-transparent text-white focus:outline-none"
                                placeholder="Enter URL"
                            />
                        </div>
                        <span className="text-gray-400 text-sm ml-4">Public</span>
                    </div>
                </div>

                {/* Design Section */}
                <div className="mb-8">
                    <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">
                        DESIGN
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {designs.map((design, index) => (
                            <div
                                key={index}
                                className={`cursor-pointer border p-2 rounded-lg ${
                                    selectedDesign === design.name
                                        ? "border-blue-500"
                                        : "border-gray-600"
                                }`}
                                onClick={() => setSelectedDesign(design.name)}
                            >
                                <div className="bg-[#2a2a2a] h-28 rounded-md flex items-center justify-center mb-2">
                                    {/* Preview image would go here */}
                                    <span className="text-gray-400 text-sm">
                                        {design.name}
                                    </span>
                                </div>
                                <div
                                    className={`h-4 w-4 rounded-full ${
                                        selectedDesign === design.name
                                            ? "bg-blue-500"
                                            : "bg-gray-600"
                                    } mx-auto`}
                                ></div>
                            </div>
                        ))}
                    </div>

                    {/* Design Previews */}
                    <div className="flex space-x-4">
                        {/* Minimal Preview */}
                        <div
                            className="w-24 h-48 bg-[#1a1a1a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition-colors"
                            onClick={() => setMinimalClicked(!minimalClicked)}
                        >
                            {!minimalClicked ? (
                                <img src='/src/assets/img/img_2.png' alt="Minimal design 1" className="w-full h-full object-contain "/>
                            ) : (
                                <img src='/src/assets/img/img_1.png' alt="Minimal design 2" className="w-full h-full object-contain  "/>
                            )}
                        </div>

                        {/* Creative Preview */}
                        <div
                            className="w-24 h-48 bg-[#1a1a1a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition-colors"
                            onClick={() => setCreativeClicked(!creativeClicked)}
                        >
                            {!creativeClicked ? (
                                <img src='/src/assets/img/img_4.png' alt="Creative design 1" className="w-full h-full object-contain"/>
                            ) : (
                                <img src='/src/assets/img/img_3.png' alt="Creative design 2" className="w-full h-full object-contain"/>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
