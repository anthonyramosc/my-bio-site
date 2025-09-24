import { useState, useEffect, useRef } from 'react';
import { usePreview } from '../context/PreviewContext.tsx';
import { useSectionsContext } from '../context/SectionsContext.tsx';
import { useUser } from "./useUser.ts";

export const useChangeDetection = () => {
    const { biosite, socialLinks, regularLinks, appLinks } = usePreview();
    const { sections } = useSectionsContext();
    const { user } = useUser();
    const [hasChanges, setHasChanges] = useState(false);
    const [lastSavedState, setLastSavedState] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    const generateStateHash = () => {
        if (!biosite) return null;

        const currentState = {
            biosite: {
                id: biosite.id,
                title: biosite.title,
                slug: biosite.slug,
                avatarImage: biosite.avatarImage,
                backgroundImage: biosite.backgroundImage,
                colors: biosite.colors,
                fonts: biosite.fonts,
                theme: biosite.theme,
                isActive: biosite.isActive,
                updatedAt: biosite.updatedAt
            },
            socialLinks: socialLinks.map(link => ({
                id: link.id,
                label: link.label,
                url: link.url,
                icon: link.icon,
                color: link.color,
                isActive: link.isActive
            })),
            regularLinks: regularLinks.map(link => ({
                id: link.id,
                title: link.title,
                url: link.url,
                orderIndex: link.orderIndex,
                isActive: link.isActive
            })),
            appLinks: appLinks.map(link => ({
                id: link.id,
                store: link.store,
                url: link.url,
                isActive: link.isActive
            })),
            sections: sections.map(section => ({
                id: section.id,
                titulo: section.titulo,
                orderIndex: section.orderIndex,
                biositeId: section.biositeId
            }))
        };

        return JSON.stringify(currentState);
    };

    useEffect(() => {
        if (biosite && sections.length > 0 && isInitialMount.current) {
            const currentHash = generateStateHash();
            setLastSavedState(currentHash);
            setHasChanges(false);
            isInitialMount.current = false;
        }
    }, [biosite, sections]);

    useEffect(() => {
        if (biosite && sections.length > 0 && !isInitialMount.current) {
            const currentHash = generateStateHash();
            const changesDetected = currentHash !== lastSavedState;
            setHasChanges(changesDetected);
        }
    }, [biosite, socialLinks, regularLinks, appLinks, sections, lastSavedState]);

    const markAsSaved = () => {
        const currentHash = generateStateHash();
        setLastSavedState(currentHash);
        setHasChanges(false);
    };

    const forceUpdate = () => {
        setHasChanges(true);
    };

    const resetChangeDetection = () => {
        const currentHash = generateStateHash();
        setLastSavedState(currentHash);
        setHasChanges(false);
    };

    return {
        hasChanges,
        markAsSaved,
        forceUpdate,
        resetChangeDetection
    };
};