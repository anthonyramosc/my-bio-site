import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSections} from '../hooks/useSection.ts';
import type {Section} from '../interfaces/sections.ts'
import Cookie from "js-cookie";

interface SectionsContextType {
    sections: Section[];
    loading: boolean;
    error: string | null;
    initializeSections: () => Promise<void>;
    reorderSections: (reorderData: { id: string; orderIndex: number }[]) => Promise<void>;
    refreshSections: () => Promise<void>;
    getVisibleSections: (
        socialLinks: any[],
        regularLinks: any[],
        appLinks: any[],
        whatsAppLinks: any[],
        videoLinks?: any[],
        musicLinks?: any[],
        socialPostLinks?: any[]
    ) => Section[];
    // Nuevos métodos
    verifyAndCreateAllSections: () => Promise<Section[]>;
    checkSectionsIntegrity: () => Promise<{
        isComplete: boolean;
        missingSections: string[];
        duplicatedSections: string[];
        totalSections: number;
    }>;
    forceVerificationAndRepair: () => Promise<void>;
}

const SectionsContext = createContext<SectionsContextType | undefined>(undefined);

export const SectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const biositeId = Cookie.get('biositeId');
    const [sectionsInitialized, setSectionsInitialized] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    const {
        sections,
        loading,
        error,
        getSectionsByBiosite,
        reorderSections: reorderSectionsHook,
        initializeSections: initializeSectionsHook,
        verifyAndCreateAllSections: verifyAndCreateAllSectionsHook,
        checkSectionsIntegrity: checkSectionsIntegrityHook,
    } = useSections();

    // Método mejorado de inicialización que usa la verificación completa
    const initializeSections = async () => {
        if (!biositeId || sectionsInitialized || isInitializing) return;

        try {
            setIsInitializing(true);

            // Usar el nuevo método de verificación en lugar del anterior
            await verifyAndCreateAllSectionsHook(biositeId);
            setSectionsInitialized(true);

        } catch (err) {
            console.error('Error initializing sections:', err);
        } finally {
            setIsInitializing(false);
        }
    };

    // Método wrapper para verificación completa
    const verifyAndCreateAllSections = async (): Promise<Section[]> => {
        if (!biositeId) {
            throw new Error('Biosite ID not found');
        }

        return await verifyAndCreateAllSectionsHook(biositeId);
    };

    // Método wrapper para verificar integridad
    const checkSectionsIntegrity = async () => {
        if (!biositeId) {
            throw new Error('Biosite ID not found');
        }

        return await checkSectionsIntegrityHook(biositeId);
    };

    // Método para forzar verificación y recreación (útil para debugging o reparación)
    const forceVerificationAndRepair = async (): Promise<void> => {
        if (!biositeId) return;

        try {
            console.log('Iniciando verificación forzada de secciones...');

            // Verificar integridad actual
            const integrity = await checkSectionsIntegrityHook(biositeId);
            console.log('Estado de integridad:', integrity);

            if (!integrity.isComplete) {
                console.log('Secciones incompletas detectadas, procediendo con reparación...');
                await verifyAndCreateAllSectionsHook(biositeId);
                console.log('Reparación completada');
            } else {
                console.log('Todas las secciones están presentes y en orden');
            }

        } catch (error) {
            console.error('Error en verificación forzada:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (biositeId && !sectionsInitialized && !isInitializing) {
            initializeSections();
        }
    }, [biositeId, sectionsInitialized, isInitializing]);

    const reorderSections = async (reorderData: { id: string; orderIndex: number }[]) => {
        if (!biositeId) return;

        try {
            await reorderSectionsHook(biositeId, reorderData);
        } catch (err) {
            console.error('Error reordering sections:', err);
            throw err;
        }
    };

    const refreshSections = async () => {
        if (!biositeId) return;

        try {
            await getSectionsByBiosite(biositeId);
        } catch (err) {
            console.error('Error refreshing sections:', err);
        }
    };

    const getVisibleSections = (
        socialLinks: any[],
        regularLinks: any[],
        appLinks: any[],
        whatsAppLinks: any[],
        videoLinks: any[] = [],
        musicLinks: any[] = [],
        socialPostLinks: any[] = []
    ): Section[] => {
        if (!sections.length) return [];

        const visibleSections: Section[] = [];

        const activeSocialLinks = socialLinks.filter(link => {
            if (!link.isActive) return false;
            const labelLower = link.label.toLowerCase();
            const urlLower = link.url.toLowerCase();
            if (urlLower.includes("api.whatsapp.com")) return false;
            const excludedKeywords = [
                'open.spotify.com/embed', 'music', 'apple music', 'soundcloud', 'audio',
                'youtube.com/watch', 'video', 'vimeo', 'tiktok video',
                'post', 'publicacion', 'contenido','api.whatsapp.com',
                'music embed', 'video embed', 'social post'
            ];
            const isExcluded = excludedKeywords.some(keyword =>
                labelLower.includes(keyword) || urlLower.includes(keyword)
            );
            return !isExcluded;
        });

        const activeRegularLinks = regularLinks.filter(link => link.isActive);
        const activeAppLinks = appLinks.filter(link => link.isActive);
        const activeWhatsAppLinks = whatsAppLinks.filter(link =>
            link.isActive &&
            link.phone &&
            link.message &&
            link.phone.trim() !== '' &&
            link.message.trim() !== ''
        );

        // For single-link sections, check if there's at least one active link
        const activeVideoLinks = videoLinks.filter(link => link.isActive);
        const activeMusicLinks = musicLinks.filter(link => link.isActive);
        const activeSocialPostLinks = socialPostLinks.filter(link => link.isActive);

        // Create a Set to prevent duplicates by section title
        const addedSectionTitles = new Set<string>();

        sections.forEach(section => {
            // Skip if we already added a section with this title
            if (addedSectionTitles.has(section.titulo)) {
                return;
            }

            let shouldShow = false;

            switch (section.titulo) {
                case 'Profile':
                    shouldShow = true; // Profile always shows
                    break;
                case 'Social':
                    shouldShow = activeSocialLinks.length > 0;
                    break;
                case 'Links':
                    shouldShow = activeRegularLinks.length > 0;
                    break;
                case 'Link de mi App':
                    shouldShow = activeAppLinks.length > 0;
                    break;
                case 'Contactame':
                    shouldShow = activeWhatsAppLinks.length > 0;
                    break;
                case 'VCard':
                    shouldShow = true;
                    break;
                case 'Video':
                    shouldShow = activeVideoLinks.length > 0;
                    break;
                case 'Music / Podcast':
                    shouldShow = activeMusicLinks.length > 0;
                    break;
                case 'Social Post':
                    shouldShow = activeSocialPostLinks.length > 0;
                    break;
                default:
                    shouldShow = false;
                    break;
            }

            if (shouldShow) {
                visibleSections.push(section);
                addedSectionTitles.add(section.titulo);
            }
        });

        return visibleSections.sort((a, b) => a.orderIndex - b.orderIndex);
    };

    const value: SectionsContextType = {
        sections,
        loading: loading || isInitializing,
        error,
        initializeSections,
        reorderSections,
        refreshSections,
        getVisibleSections,
        verifyAndCreateAllSections,
        checkSectionsIntegrity,
        forceVerificationAndRepair,
    };

    return (
        <SectionsContext.Provider value={value}>
            {children}
        </SectionsContext.Provider>
    );
};

export const useSectionsContext = (): SectionsContextType => {
    const context = useContext(SectionsContext);
    if (!context) {
        throw new Error('useSectionsContext must be used within a SectionsProvider');
    }
    return context;
};