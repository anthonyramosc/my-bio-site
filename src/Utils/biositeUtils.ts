export const isValidImageUrl = (url: string | null | undefined): boolean => {
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
        return isHttps;
    } catch {
        return false;
    }
};

export const getThemeConfig = (biosite: any) => {
    if (biosite?.theme?.config) {
        return {
            colors: {
                primary: biosite.theme.config.colors.primary,
                secondary: biosite.theme.config.colors.secondary,
                accent: biosite.theme.config.colors.accent,
                background: biosite.theme.config.colors.background || '#ffffff',
                text: biosite.theme.config.colors.text || '#000000',
                profileBackground: biosite.theme.config.colors.profileBackground || '#ffffff'
            },
            fonts: {
                primary: biosite.theme.config.fonts.primary || biosite?.fonts || 'Inter',
                secondary: biosite.theme.config.fonts.secondary || biosite?.fonts || 'Lato'
            },
            isDark: biosite.theme.config.isDark || false,
            isAnimated: biosite.theme.config.isAnimated || false
        };
    }

    const defaultColors = { primary: '#f3f4f6', secondary: '#f3f4f6' };
    const parsedColors = biosite.colors
        ? (typeof biosite.colors === 'string'
            ? JSON.parse(biosite.colors)
            : biosite.colors)
        : defaultColors;

    return {
        colors: {
            primary: parsedColors.primary || defaultColors.primary,
            secondary: parsedColors.secondary || defaultColors.secondary,
            accent: parsedColors.accent,
            background: parsedColors.background || '#ffffff',
            text: parsedColors.text || '#000000',
            profileBackground: parsedColors.profileBackground || '#ffffff'
        },
        fonts: {
            primary: biosite?.fonts || 'Inter',
            secondary: biosite?.fonts || 'Lato'
        },
        isDark: false,
        isAnimated: false
    };
};

export const getSpotifyEmbedUrl = (url: string) => {
    const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    if (trackMatch) {
        return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
    }
    return null;
};

export const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return null;
};

export const getInstagramEmbedUrl = (url: string) => {
    const postMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    if (postMatch) {
        return `https://www.instagram.com/p/${postMatch[1]}/embed/`;
    }
    return null;
};

export const isInstagramUrl = (url: string) => {
    return url.includes('instagram.com') && (url.includes('/p/') || url.includes('/reel/'));
};

export const DEFAULT_APP_STORE_URL = "https://apps.apple.com/ec/app/visitaecuador-com/id1385161516";
export const DEFAULT_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.visitaEcuador&hl=es";
export const APPBYD = "https://apps.apple.com/mx/app/byd-auto/id1492400299";
export const APPGBYD ="https://play.google.com/store/search?q=BYD&c=apps&hl=es";

export const isDefaultUrl = (url: string, store: 'appstore' | 'googleplay'): boolean => {
    if (store === 'appstore') {
        return url === DEFAULT_APP_STORE_URL;
    } else {
        return url === DEFAULT_GOOGLE_PLAY_URL;
    }
};

export const isBYDUrls = (url: string, store: 'appstore' | 'googleplay'): boolean => {
    if (store === 'appstore') {
        return url === APPBYD;
    } else {
        return url === APPGBYD;
    }
};

export const hasCustombydUrls = (appLinks: any[]): boolean => {
    const activeAppLinks = appLinks.filter(link => link.isActive);

    return activeAppLinks.some(appLink => {
        return !isBYDUrls(appLink.url, appLink.store);
    });
};
export const hasCustomUrls = (appLinks: any[]): boolean => {
    const activeAppLinks = appLinks.filter(link => link.isActive);

    return activeAppLinks.some(appLink => {
        return !isDefaultUrl(appLink.url, appLink.store);
    });
};