import React, { useState, useEffect } from "react";
import {
    Check,
    Plus,
    Users,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    Trash2,
    Loader2
} from "lucide-react";
import imgP from "../../../../../public/img/img.png";
import type { BiositeFull } from "../../../../interfaces/Biosite";
import type { UUID } from "../../../../types/authTypes.ts";
import apiService from "../../../../service/apiService.ts";
import { updateBiositeApi } from "../../../../constants/EndpointsRoutes.ts";

interface BiositeStructure {
    ownBiosites: BiositeFull[];
    childBiosites: BiositeFull[];
    allBiosites: BiositeFull[];
}

interface BiositeListProps {
    biositeStructure: BiositeStructure;
    currentBiosite: BiositeFull | null;
    canSeeChildBiosites: boolean;
    canCreateBiosites: boolean;
    isLoadingState: boolean;
    onProfileSwitch: (biositeData: BiositeFull) => void;
    onCreateNewSite: () => void;
    onRefreshStructure: () => void;
    onError: (error: string) => void;
    clearError: () => void;
}

const BiositesList: React.FC<BiositeListProps> = ({
                                                      biositeStructure,
                                                      currentBiosite,
                                                      canSeeChildBiosites,
                                                      canCreateBiosites,
                                                      isLoadingState,
                                                      onProfileSwitch,
                                                      onCreateNewSite,
                                                      onRefreshStructure,
                                                      onError,
                                                      clearError
                                                  }) => {
    const [avatarError, setAvatarError] = useState(false);
    const [showChildBiosites, setShowChildBiosites] = useState(true);
    const [hoveredBiosite, setHoveredBiosite] = useState<string | null>(null);
    const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const getCurrentUserId = (): UUID | null => {
        const userId = document.cookie
            .split('; ')
            .find(row => row.startsWith('userId='))
            ?.split('=')[1];
        return userId as UUID || null;
    };

    const getMainUserId = (): UUID | null => {

        const mainUserId = document.cookie
            .split('; ')
            .find(row => row.startsWith('mainUserId='))
            ?.split('=')[1];
        return mainUserId as UUID || getCurrentUserId();
    };

    const getAvatarImage = (biositeData?: BiositeFull) => {
        const targetBiosite = biositeData || currentBiosite;

        if (avatarError || !targetBiosite?.avatarImage) {
            return imgP;
        }

        if (typeof targetBiosite.avatarImage === 'string' && targetBiosite.avatarImage.trim()) {
            if (targetBiosite.avatarImage.startsWith('data:')) {
                const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
                return dataUrlRegex.test(targetBiosite.avatarImage) ? targetBiosite.avatarImage : imgP;
            }

            try {
                new URL(targetBiosite.avatarImage);
                return targetBiosite.avatarImage;
            } catch {
                return imgP;
            }
        }

        return imgP;
    };

    const isMainBiosite = (biositeData: BiositeFull): boolean => {
        const mainUserId = getCurrentUserId();
        return biositeData.ownerId === mainUserId;
    };

    const isChildBiosite = (biositeData: BiositeFull): boolean => {
        const mainUserId = getMainUserId();
        return biositeData.ownerId !== mainUserId;
    };

    const handleDeleteBiosite = async (biositeData: BiositeFull) => {
        if (!biositeData.id) return;

        if (biositeData.id === currentBiosite?.id) {
            onError('No puedes eliminar el biosite que estás usando actualmente');
            return;
        }

        const confirmDelete = window.confirm(
            `¿Estás seguro de que quieres eliminar el biosite "${biositeData.title}"? Esta acción no se puede deshacer.`
        );

        if (!confirmDelete) return;

        try {
            setIsDeleting(biositeData.id);
            onError('');
            clearError();

            await apiService.delete(updateBiositeApi, biositeData.id);

            if (isChildBiosite(biositeData)) {
                try {
                    await apiService.delete('/users', biositeData.ownerId);
                } catch (userError) {
                    console.warn('Error deleting associated user:', userError);
                }
            }

            onRefreshStructure();
            setShowDeleteMenu(null);

            console.log('Biosite deleted successfully');
        } catch (error: any) {
            console.error('Error deleting biosite:', error);
            onError(error?.response?.data?.message || error?.message || 'Error al eliminar el biosite');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleMenuClick = (e: React.MouseEvent, biositeId: string) => {
        e.stopPropagation();
        setShowDeleteMenu(showDeleteMenu === biositeId ? null : biositeId);
    };

    const handleDeleteClick = (e: React.MouseEvent, biositeData: BiositeFull) => {
        e.stopPropagation();
        setShowDeleteMenu(null);
        handleDeleteBiosite(biositeData);
    };

    useEffect(() => {
        const handleClickOutside = () => {
            setShowDeleteMenu(null);
        };

        if (showDeleteMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showDeleteMenu]);

    const renderBiositeItem = (biositeData: BiositeFull, isChild: boolean = false) => (
        <div
            key={biositeData.id}
            className={`relative flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer group ${
                isLoadingState ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onMouseEnter={() => setHoveredBiosite(biositeData.id)}
            onMouseLeave={() => setHoveredBiosite(null)}
            onClick={() => !isLoadingState && !showDeleteMenu && onProfileSwitch(biositeData)}
        >
            <div className="relative">
                <img
                    src={getAvatarImage(biositeData)}
                    alt={biositeData.title}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                />
            </div>
            <div className="flex-1">
                <div className="font-medium text-gray-600 text-sm flex items-center">
                    {biositeData.title}
                    {isMainBiosite(biositeData) && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Principal
                        </span>
                    )}
                    {isChild && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Hijo
                        </span>
                    )}
                </div>
                <div className="text-xs text-gray-400">
                    visitaecuador.com/vesite/{biositeData.slug}
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {biositeData.id === currentBiosite?.id ? (
                    <Check size={16} className="text-green-500" />
                ) : (
                    hoveredBiosite === biositeData.id && (
                        <div className="relative">
                            <button
                                onClick={(e) => handleMenuClick(e, biositeData.id)}
                                className="p-1 hover:bg-gray-300 rounded-full transition-colors"
                                disabled={isDeleting === biositeData.id}
                            >
                                {isDeleting === biositeData.id ? (
                                    <Loader2 size={16} className="animate-spin text-gray-500" />
                                ) : (
                                    <MoreHorizontal size={16} className="text-gray-500" />
                                )}
                            </button>

                            {showDeleteMenu === biositeData.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                    <button
                                        onClick={(e) => handleDeleteClick(e, biositeData)}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                                    >
                                        <Trash2 size={14} />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );

    // CORRECCIÓN: Los biosites propios son los que pertenecen directamente al usuario principal
    const ownBiosites = biositeStructure.ownBiosites.filter(biosite => isMainBiosite(biosite));

    // CORRECCIÓN: Los biosites hijos son los que pertenecen a usuarios hijos (diferentes al mainUserId)
    const childBiosites = biositeStructure.childBiosites.filter(biosite => isChildBiosite(biosite));

    return (
        <>
            {ownBiosites.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600">Mi vesite</h3>
                    {ownBiosites.map((biositeData) => renderBiositeItem(biositeData))}
                </div>
            )}

            {canSeeChildBiosites && childBiosites.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-600 flex items-center">
                            <Users className="h-4 w-4 mr-2"/>
                            vesites Hijos ({childBiosites.length})
                        </h3>
                        <button
                            onClick={() => setShowChildBiosites(!showChildBiosites)}
                            className="p-1 hover:bg-gray-200 rounded"
                        >
                            {showChildBiosites ?
                                <ChevronDown className="h-4 w-4"/> :
                                <ChevronRight className="h-4 w-4"/>
                            }
                        </button>
                    </div>
                    {showChildBiosites && childBiosites.map((biositeData) =>
                        renderBiositeItem(biositeData, true)
                    )}
                </div>
            )}

            {biositeStructure.allBiosites.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay vesites disponibles</p>
                    {canCreateBiosites && (
                        <p className="text-xs mt-2">Crea tu primer vesite para comenzar</p>
                    )}
                </div>
            )}

            {canCreateBiosites && (
                <div
                    onClick={() => !isLoadingState && onCreateNewSite()}
                    className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 hover:text-white cursor-pointer group ${
                        isLoadingState ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    <div className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center group-hover:border-white">
                        <Plus size={16} className="text-black group-hover:text-white"/>
                    </div>
                    <div className="flex-1">
                        <div className="font-medium text-black group-hover:text-white text-sm">
                            Crear Nuevo vesite
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BiositesList;
