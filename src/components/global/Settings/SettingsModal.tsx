import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {AlertCircle, ChevronLeft, Loader2} from "lucide-react";
import { usePreview } from "../../../context/PreviewContext.tsx";
import { useUser } from "../../../hooks/useUser.ts";
import { useFetchBiosite } from "../../../hooks/useFetchBiosite.ts";
import type { BiositeFull } from "../../../interfaces/Biosite";
import type { UUID } from "../../../types/authTypes.ts";
import Cookies from "js-cookie";
import CreateBiositeWizard from "./Settings/createBiositeForm.tsx";
import BiositesList from "./Settings/biositeList.tsx";
import SettingsFooter from "./Settings/settingsFooter";

interface Profile {
    id: string;
    userId: string;
    name: string;
    slug: string;
    avatar?: string;
    isActive?: boolean;
    isOwn?: boolean;
    isChild?: boolean;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    profiles?: Profile[];
    currentProfile?: Profile;
    onProfileSelect?: (profile: Profile) => void;
    onCreateNewSite?: () => void;
}

interface CreateBiositeData {
    title: string;
    slug: string;
    password: string;
    userName: string;
    profileImage?: string;
}

interface BiositeStructure {
    ownBiosites: BiositeFull[];
    childBiosites: BiositeFull[];
    allBiosites: BiositeFull[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         onLogout,
                                                         onProfileSelect,
                                                         onCreateNewSite
                                                     }) => {
    const {
        biosite,
        loading: contextLoading,
        error: contextError,
        createBiosite,
        switchToAnotherBiosite,
        clearError
    } = usePreview();

    const { user, fetchUser } = useUser();
    const role = Cookies.get("roleName");

    const {
        fetchCompleteBiositeStructure,
        fetchAdminBiosites,
        loading: biositeLoading,
        error: biositeError
    } = useFetchBiosite();

    const [biositeStructure, setBiositeStructure] = useState<BiositeStructure>({
        ownBiosites: [],
        childBiosites: [],
        allBiosites: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateWizard, setShowCreateWizard] = useState(false);
    const [createdBiositeUrl, setCreatedBiositeUrl] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState<CreateBiositeData>({
        title: '',
        slug: '',
        password: '',
        userName: '',
        profileImage: ''
    });

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

    const canCreateBiosites = () => {
        if (!user) return false;
        return role === 'SUPER_ADMIN';
    };

    const canSeeChildBiosites = () => {
        if (!user) return false;
        return role === 'SUPER_ADMIN' || role === 'ADMIN';
    };

    useEffect(() => {
        if (isOpen) {
            const userId = getCurrentUserId();
            if (userId) {
                fetchUser(userId);
                fetchBiositeStructure(userId);
            }
        }
    }, [isOpen]);

    const fetchBiositeStructure = async (userId: UUID) => {
        try {
            setLoading(true);
            setError(null);
            clearError();

            if (canSeeChildBiosites()) {
                const structure = await fetchCompleteBiositeStructure(userId);
                setBiositeStructure(structure);
            } else {
                const ownBiosites = await fetchAdminBiosites(userId);
                setBiositeStructure({
                    ownBiosites,
                    childBiosites: [],
                    allBiosites: ownBiosites
                });
            }
        } catch (err: any) {
            console.error('Error fetching biosite structure:', err);
            setError(err?.message || 'Error al cargar la estructura de biosites');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewBiosite = async () => {
        if (!canCreateBiosites()) {
            setError('No tienes permisos para crear nuevos biosites. Solo usuarios ADMIN y SUPER_ADMIN pueden crear biosites.');
            return;
        }

        const currentUserId = getCurrentUserId();
        const mainUserId = getMainUserId();

        if (!currentUserId || !mainUserId) {
            setError('Usuario no autenticado. Por favor, inicie sesión nuevamente.');
            return;
        }

        try {
            setIsCreating(true);
            setError(null);
            clearError();

            const createData = {
                ownerId: mainUserId,
                title: createForm.title.trim(),
                slug: createForm.slug.trim(),
                password: createForm.password.trim(),
            };

            const newBiosite = await createBiosite(createData);

            if (newBiosite) {
                console.log('Biosite and user created successfully:', newBiosite);
                await fetchBiositeStructure(mainUserId);

                // Set the created biosite URL
                setCreatedBiositeUrl(`bio.site/${newBiosite.slug}`);

                // Reset form
                setCreateForm({
                    title: '',
                    slug: '',
                    password: '',
                    userName: '',
                    profileImage: ''
                });

                if (onCreateNewSite) {
                    onCreateNewSite();
                }

                // Don't switch immediately, let user see success screen
                // await handleProfileSwitch(newBiosite);
            }
        } catch (err: any) {
            console.error('Error creating biosite and user:', err);
            setError(err?.message || 'Error al crear el biosite y usuario');
        } finally {
            setIsCreating(false);
        }
    };

    const handleProfileSwitch = async (biositeData: BiositeFull) => {
        try {
            setLoading(true);
            setError(null);
            clearError();

            const mainUserId = getMainUserId();
            if (!Cookies.get('mainUserId') && mainUserId) {
                Cookies.set('mainUserId', mainUserId);
            }

            const switchedBiosite = await switchToAnotherBiosite(biositeData.id);

            if (switchedBiosite && onProfileSelect) {
                const profile: Profile = {
                    id: switchedBiosite.id,
                    userId: switchedBiosite.ownerId,
                    name: switchedBiosite.title,
                    slug: `bio.site/${switchedBiosite.slug}`,
                    isActive: true
                };
                onProfileSelect(profile);
            }

            onClose();
        } catch (err: any) {
            console.error('Error switching biosite:', err);
            setError(err?.message || 'Error al cambiar de biosite');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contextError) {
            setError(contextError);
        }
        if (biositeError) {
            setError(biositeError);
        }
    }, [contextError, biositeError]);

    const handleCreateNewSite = () => {
        if (!canCreateBiosites()) {
            setError('No tienes permisos para crear nuevos biosites. Solo usuarios ADMIN y SUPER_ADMIN pueden crear biosites.');
            return;
        }
        setShowCreateWizard(true);
        setError(null);
        clearError();
    };

    const handleCloseWizard = () => {
        setShowCreateWizard(false);
        setCreatedBiositeUrl(null);
        setCreateForm({
            title: '',
            slug: '',
            password: '',
            userName: '',
            profileImage: ''
        });
        setError(null);
        clearError();
    };

    const handleTitleChange = (title: string) => {
        const generatedSlug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .trim();

        setCreateForm(prev => ({
            ...prev,
            title,
            slug: generatedSlug
        }));
    };

    const handleSlugChange = (slug: string) => {
        const cleanSlug = slug.toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        setCreateForm(prev => ({
            ...prev,
            slug: cleanSlug
        }));
    };

    const handlePasswordChange = (password: string) => {
        setCreateForm(prev => ({
            ...prev,
            password
        }));
    };

    const handleUserNameChange = (userName: string) => {
        setCreateForm(prev => ({
            ...prev,
            userName
        }));
    };

    const handleProfileImageChange = (image: string) => {
        setCreateForm(prev => ({
            ...prev,
            profileImage: image
        }));
    };

    const isLoadingState = loading || contextLoading || biositeLoading || isCreating;

    return (
        <>
            {/* Settings Modal */}
            <Dialog
                open={isOpen && !showCreateWizard}
                onClose={onClose}
                className="fixed inset-0 h-full z-[70] flex items-center justify-start bg-black/50"
            >
                <Dialog.Panel className="bg-[#FAFFF6] rounded-lg w-full max-w-[320px] h-full text-gray-600 shadow-xl flex flex-col">
                    {/* Header - Fixed */}
                    <div className="flex items-center justify-between p-4 border-b border-[#E0EED5] flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-sm  cursor-pointer font-medium"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1 text-black hover:text-gray-400"/>
                        </button>
                        <Dialog.Title className="text-black font-medium">
                            CONFIGURACIONES
                        </Dialog.Title>
                        <div className="w-16"></div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-400 flex-shrink-0">
                                <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-red-400 mr-2"/>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Biosites Section */}
                        <div className="p-4 space-y-3">
                            {isLoadingState ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400"/>
                                    <span className="ml-2 text-sm text-gray-500">Cargando vesites...</span>
                                </div>
                            ) : (
                                <BiositesList
                                    biositeStructure={biositeStructure}
                                    currentBiosite={biosite}
                                    canSeeChildBiosites={canSeeChildBiosites()}
                                    canCreateBiosites={canCreateBiosites()}
                                    isLoadingState={isLoadingState}
                                    onProfileSwitch={handleProfileSwitch}
                                    onCreateNewSite={handleCreateNewSite}
                                    onRefreshStructure={() => {
                                        const mainUserId = getMainUserId();
                                        if (mainUserId) {
                                            fetchBiositeStructure(mainUserId);
                                        }
                                    }}
                                    onError={setError}
                                    clearError={clearError}
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer - Fixed */}
                    <div className="flex-shrink-0">
                        <SettingsFooter onLogout={onLogout} />
                    </div>
                </Dialog.Panel>
            </Dialog>

            {/* Create Biosite Wizard */}
            {showCreateWizard && (
                <CreateBiositeWizard
                    createForm={createForm}
                    isLoadingState={isLoadingState}
                    isCreating={isCreating}
                    onTitleChange={handleTitleChange}
                    onSlugChange={handleSlugChange}
                    onPasswordChange={handlePasswordChange}
                    onUserNameChange={handleUserNameChange}
                    onProfileImageChange={handleProfileImageChange}
                    onCreateBiosite={handleCreateNewBiosite}
                    onCancel={handleCloseWizard}
                    createdBiositeUrl={createdBiositeUrl}
                />
            )}
        </>
    );
};

export default SettingsModal;
