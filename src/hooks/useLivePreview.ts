import { useState, useEffect } from "react";
import { usePreview } from "../context/PreviewContext.tsx";
import type { BiositeColors } from "../interfaces/Biosite";
import { socialMediaPlatforms } from "../media/socialPlataforms.ts";
import type {SocialLink} from "../interfaces/PreviewContext.ts";

export const useLivePreview = () => {
    const { biosite, socialLinks, regularLinks, loading, error } = usePreview();
    const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
    const [imageLoadStates, setImageLoadStates] = useState<{[key: string]: 'loading' | 'loaded' | 'error'}>({});

    const parseColors = (colors: string | BiositeColors | null | undefined): BiositeColors => {
        const defaultColors: BiositeColors = {
            primary: '#f3f4f6',
            secondary: '#f3f4f6',
            background: '#ffffff',
            text: '#000000'
        };

        if (!colors) return defaultColors;

        if (typeof colors === 'string') {
            try {
                const parsed = JSON.parse(colors);
                return {
                    ...defaultColors,
                    ...parsed,
                    // Asegurar que background y text existen
                    background: parsed.background || defaultColors.background,
                    text: parsed.text || defaultColors.text
                };
            } catch (e) {
                console.warn('Error parsing colors:', e);
                // Si es un string simple, asumir que es el color de fondo
                return {
                    ...defaultColors,
                    background: colors,
                    text: defaultColors.text,
                };
            }
        } else if (colors && typeof colors === 'object') {
            return {
                ...defaultColors,
                ...colors,
                background: colors.background || defaultColors.background,
                text: colors.text || defaultColors.text
            };
        }

        return defaultColors;
    };

    const parseFont = (fonts: string | null | undefined): string => {
        const defaultFont = 'Inter';

        if (!fonts) return defaultFont;

        if (typeof fonts === 'string') {
            // Si es un string válido, usarlo directamente
            if (fonts.trim().length > 0) {
                return fonts.trim();
            }
        }

        return defaultFont;
    };

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

            return isHttps ;
        } catch {
            return false;
        }
    };

    // Handlers de imágenes
    const handleImageLoad = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'loaded' }));
        setImageErrors(prev => ({ ...prev, [imageType]: false }));
    };

    const handleImageError = (imageType: string, imageUrl?: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'error' }));
        setImageErrors(prev => ({ ...prev, [imageType]: true }));
    };

    const handleImageLoadStart = (imageType: string) => {
        setImageLoadStates(prev => ({ ...prev, [imageType]: 'loading' }));
    };

    // Obtener enlaces filtrados
    const getRegularLinks = () => {
        if (!regularLinks || regularLinks.length === 0) return [];
        return regularLinks.filter(link => link.isActive).sort((a, b) => a.orderIndex - b.orderIndex);
    };

    const getSocialLinks = () => {
        if (!socialLinks || socialLinks.length === 0) return [];

        return socialLinks.filter(link => {
            if (!link.isActive) return false;

            const urlLower = link.url.toLowerCase();
            if (urlLower.includes("api.whatsapp.com")) return false;

            return true;
        });
    };

    const findPlatformForLink = (link: SocialLink) => {
        return socialMediaPlatforms.find(platform => {
            const linkLabelLower = link.label.toLowerCase();
            const platformNameLower = platform.name.toLowerCase();
            const platformIdLower = platform.id.toLowerCase();

            return (
                linkLabelLower === platformNameLower ||
                linkLabelLower.includes(platformIdLower) ||
                link.icon === platform.icon ||
                linkLabelLower.replace(/[^a-z0-9]/g, '') === platformNameLower.replace(/[^a-z0-9]/g, '')
            );
        });
    };

    // Reset de estados cuando cambia el biosite
    useEffect(() => {
        setImageErrors({});
        setImageLoadStates({});
    }, [biosite?.id]);

    // Datos procesados
    const parsedColors = parseColors(biosite?.colors);
    const regularLinksData = getRegularLinks();
    const socialLinksData = getSocialLinks();
    const validBackgroundImage = isValidImageUrl(biosite?.backgroundImage) && !imageErrors.background ? biosite?.backgroundImage : null;
    const validAvatarImage = isValidImageUrl(biosite?.avatarImage) && !imageErrors.avatar ? biosite?.avatarImage : null;

    return {
        // Estados originales
        biosite,
        loading,
        error,

        // Estados de imágenes
        imageErrors,
        imageLoadStates,

        // Handlers
        handleImageLoad,
        handleImageError,
        handleImageLoadStart,

        // Datos procesados
        parsedColors,
        regularLinksData,
        socialLinksData,
        validBackgroundImage,
        validAvatarImage,
        parseColors,
        parseFont,

        // Utilidades
        findPlatformForLink
    };
};