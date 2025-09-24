import {createContext, useContext, useEffect, useState, useCallback, useRef} from "react";
import type { BiositeFull } from "../interfaces/Biosite";
import type {PreviewContextType, SocialLink, RegularLink, AppLink, WhatsAppLink} from "../interfaces/PreviewContext";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { useFetchLinks } from "../hooks/useFetchLinks";
import { useBiositeOperations } from "../hooks/useBiositeManagement";
import { useLinkOperations } from "../hooks/useLinksManagement";
import Cookie from "js-cookie";

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider = ({ children }: { children: React.ReactNode }) => {
    const userId = Cookie.get('userId');
    const biositeId = Cookie.get('biositeId')
    const {
        biositeData,
        loading: biositeLoading,
        error: biositeError,
        fetchBiosite,
        fetchUserBiosites,
        createBiosite,
        updateBiosite: updateBiositeHook,
        fetchChildBiosites,
        switchBiosite,
        clearError: clearBiositeError,
        resetState
    } = useFetchBiosite(userId);

    const {
        links,
        loading: linksLoading,
        error: linksError,
        fetchLinks,
        createLink,
        updateLink,
        deleteLink,
        reorderLinks,
        getSocialLinks,
        getRegularLinks,
        getAppLinks,
        getWhatsAppLinks,
        getMusicLinks,
        getVideoLinks,
        getSocialPostLinks,
        LINK_TYPES,
        clearError: clearLinksError
    } = useFetchLinks(biositeData?.id);

    const [biosite, setBiosite] = useState<BiositeFull | null>(null);
    const [socialLinks, setSocialLinksState] = useState<SocialLink[]>([]);
    const [regularLinks, setRegularLinksState] = useState<RegularLink[]>([]);
    const [appLinks, setAppLinksState] = useState<AppLink[]>([]);
    const [whatsAppLinks, setWhatsAppLinksState] = useState<WhatsAppLink[]>([]);
    const [themeColor, setThemeColorState] = useState<string>('#ffffff');
    const [themeBackColor, setThemeColorBackState] = useState<string>('#ffffff');
    const [themetextColor, setThemeColortextState] = useState<string>('#ffffff');
    const [fontFamily, setFontFamilyState] = useState<string>('Inter');
    const [initialized, setInitialized] = useState(false);
    const initializationRef = useRef<{ [key: string]: boolean }>({});

    const loading = biositeLoading || linksLoading;
    const error = biositeError || linksError;

    const getIconIdentifier = useCallback((iconPath: string): string => {
        const iconMap: { [key: string]: string } = {
            '/assets/icons/instagram.svg': 'instagram',
            '/assets/icons/tiktok.svg': 'tiktok',
            '/assets/icons/X.svg': 'twitter',
            '/assets/icons/youtube.svg': 'youtube',
            '/assets/icons/facebook.svg': 'facebook',
            '/assets/icons/twitch.svg': 'twitch',
            '/assets/icons/linkdl.svg': 'linkedin',
            '/assets/icons/snapchat.svg': 'snapchat',
            '/assets/icons/threads.svg': 'threads',
            '/assets/icons/gmail.svg': 'email',
            '/assets/icons/pinterest.svg': 'pinterest',
            '/assets/icons/spottufy.svg': 'spotify',
            '/assets/icons/discord.svg': 'discord',
            '/assets/icons/tumblr.svg': 'tumblr',
            '/assets/icons/whatsapp.svg': 'whatsapp',
            '/assets/icons/telegram.svg': 'telegram',
            '/assets/icons/amazon.svg': 'amazon',
            '/assets/icons/onlyfans.svg': 'onlyfans',
            '/assets/icons/appstore.svg': 'appstore',
            '/assets/icons/googleplay.svg': 'googleplay'
        };
        if (iconPath === 'link') return 'link';
        if (iconPath === 'social-post') return 'social-post';
        if (iconPath === 'music-embed') return 'music-embed';
        if (iconPath === 'video-embed') return 'video-embed';

        const fullPath = Object.keys(iconMap).find(path => path.includes(iconPath));
        if (fullPath) return iconMap[fullPath];

        const fileName = iconPath.split('/').pop()?.replace('.svg', '') || 'link';
        return fileName.toLowerCase();
    }, []);

    const getStoreType = useCallback((link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (labelLower.includes('google play') || urlLower.includes('play.google.com')) {
            return 'googleplay'
        }
        return 'appstore';
    }, []);

    const parseWhatsAppFromUrl = useCallback((url: string, label?: string): { phone: string; message: string; description: string } => {
        try {
            let phone = '';
            let message = '';
            let description = label || 'WhatsApp';

            if (url.includes('api.whatsapp.com/send')) {
                const urlParams = new URLSearchParams(url.split('?')[1] || '');
                phone = urlParams.get('phone') || '';
                message = decodeURIComponent(urlParams.get('text') || '');
                description = label || 'WhatsApp';
            }


            phone = phone.replace(/[^\d+]/g, '');

            if (message) {
                try {
                    let decodedMessage = message;
                    let previousMessage = '';

                    while (decodedMessage !== previousMessage) {
                        previousMessage = decodedMessage;
                        decodedMessage = decodeURIComponent(decodedMessage);
                    }

                    message = decodedMessage;
                } catch (decodeError) {
                    console.warn('Error decoding message:', decodeError);
                }
            }

            return { phone, message, description };
        } catch (error) {
            console.error('Error parsing WhatsApp URL:', error);
            return {
                phone: '',
                message: '',
                description: label || 'WhatsApp'
            };
        }
    }, []);

    const getMusicEmbed = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const musicByType = links.find(link => link.link_type === LINK_TYPES.MUSIC && link.isActive);
        if (musicByType) return musicByType;

        const musicLinks = getMusicLinks();
        return musicLinks.find(link => link.isActive) || null;
    }, [links, getMusicLinks, LINK_TYPES]);

    const getSocialPost = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const socialPostByType = links.find(link => link.link_type === LINK_TYPES.SOCIAL_POST && link.isActive);
        if (socialPostByType) return socialPostByType;

        const socialPostLinks = getSocialPostLinks();
        return socialPostLinks.find(link => link.isActive) || null;
    }, [links, getSocialPostLinks, LINK_TYPES]);

    const getVideoEmbed = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const videoByType = links.find(link => link.link_type === LINK_TYPES.VIDEO && link.isActive);
        if (videoByType) return videoByType;

        const videoLinks = getVideoLinks();
        return videoLinks.find(link => link.isActive) || null;
    }, [links, getVideoLinks, LINK_TYPES]);

    useEffect(() => {
        if (!biositeId) {
            setBiosite(null);
            setSocialLinksState([]);
            setRegularLinksState([]);
            setWhatsAppLinksState([]);
            setThemeColorBackState('#ffffff');
            setThemeColortextState('#000000');
            setFontFamilyState('Inter');
            resetState();
            initializationRef.current = {};
            return;
        }

        if (biositeId && !initializationRef.current[biositeId]) {
            initializationRef.current[biositeId] = true;
            fetchBiosite();
        }
    }, [biositeId, fetchBiosite, resetState]);

    useEffect(() => {
        const initializeBiosite = async () => {
            if (!userId || initialized) return;

            try {
                const biositeId = Cookie.get('biositeId');

                if (biositeId) {
                    await loadBiositeById(biositeId);
                } else {
                    const userBiosites = await fetchUserBiosites();
                    if (userBiosites && userBiosites.length > 0) {
                        const firstBiosite = userBiosites[0];
                        await switchBiosite(firstBiosite.id);
                        Cookie.set('biositeId', firstBiosite.id);
                    }
                }

                setInitialized(true);
            } catch (error) {
                console.error('Error initializing biosite:', error);
                setInitialized(true);
            }
        };

        initializeBiosite();
    }, [userId, initialized, fetchUserBiosites]);

    useEffect(() => {
        if (biositeData) {
            setBiosite(biositeData);

            if (biositeData.colors) {
                if (typeof biositeData.colors === 'string') {
                    setThemeColorState(biositeData.colors);
                } else if (biositeData.colors.background) {
                    setThemeColorBackState(biositeData.colors.background);
                    setThemeColortextState(biositeData.colors.text);
                }
            }

            if (biositeData.fonts && biositeData.fonts !== fontFamily) {
                setFontFamilyState(biositeData.fonts);
            }
        }
    }, [biositeData]);

    useEffect(() => {
        if (biositeData?.id) {
            fetchLinks();
        }
    }, [biositeData?.id, fetchLinks]);

    useEffect(() => {
        if (links && Array.isArray(links)) {
            // Use the enhanced filtering methods
            const socialLinksFromAPI = getSocialLinks();
            const regularLinksFromAPI = getRegularLinks();
            const appLinksFromAPI = getAppLinks();
            const whatsAppLinksFromAPI = getWhatsAppLinks();

            // Format social links
            const socialLinksFormatted = socialLinksFromAPI.map(link => ({
                id: link.id,
                label: link.label,
                name: link.label,
                url: link.url,
                icon: link.icon,
                color: link.color,
                isActive: link.isActive
            }));

            // Format regular links
            const regularLinksFormatted = regularLinksFromAPI.map(link => ({
                id: link.id,
                title: link.label,
                url: link.url,
                image: link.image,
                orderIndex: link.orderIndex,
                isActive: link.isActive
            }));

            // Format app links
            const appLinksFormatted = appLinksFromAPI.map(link => ({
                id: link.id,
                store: getStoreType(link),
                url: link.url,
                isActive: link.isActive
            }));

            // Format WhatsApp links
            const whatsAppLinksFormatted = whatsAppLinksFromAPI.map(link => {
                const { phone, message, description } = parseWhatsAppFromUrl(link.url, link.label);
                return {
                    id: link.id,
                    phone,
                    message,
                    description,
                    isActive: link.isActive
                };
            });

            setSocialLinksState(socialLinksFormatted);
            setRegularLinksState(regularLinksFormatted.sort((a, b) => a.orderIndex - b.orderIndex));
            setAppLinksState(appLinksFormatted);
            setWhatsAppLinksState(whatsAppLinksFormatted);
        }
    }, [links, getSocialLinks, getRegularLinks, getAppLinks, getWhatsAppLinks, getStoreType, parseWhatsAppFromUrl]);

    const updatePreview = useCallback((data: Partial<BiositeFull>) => {
        setBiosite(prev => prev ? { ...prev, ...data } : null);
    }, []);

    const clearError = useCallback(() => {
        clearBiositeError();
        clearLinksError();
    }, [clearBiositeError, clearLinksError]);

    const biositeOperations = useBiositeOperations({
        biositeData,
        fontFamily,
        themeColor,
        setThemeColorState,
        setFontFamilyState,
        updateBiositeHook,
        setBiosite,
        createBiosite,
        fetchUserBiosites,
        switchBiosite,
        fetchChildBiosites,
        resetState
    });

    const { loadBiositeById } = biositeOperations;

    const linkOperations = useLinkOperations({
        biositeData,
        links,
        socialLinks,
        setSocialLinksState,
        setRegularLinksState,
        createLink,
        updateLink,
        deleteLink,
        reorderLinks,
        fetchLinks,
        getIconIdentifier
    });

    // Enhanced addAppLink with link_type
    const addAppLink = async (link: Omit<AppLink, 'id'>) => {
        if (!biositeData?.id) {
            throw new Error('Biosite ID is required');
        }

        try {
            const icon = link.store === 'appstore' ? 'appstore' : 'googleplay';
            const label = link.store === 'appstore' ? 'App Store' : 'Google Play';

            const linkData = {
                biositeId: biositeData.id,
                label,
                url: link.url,
                icon,
                orderIndex: links.length,
                isActive: link.isActive,
                link_type: LINK_TYPES.APP // Set the link_type
            };

            const newLink = await createLink(linkData);
            if (newLink) {
                console.log('App link created successfully:', newLink);
            }
        } catch (error) {
            console.error('Error creating app link:', error);
            throw error;
        }
    };

    const removeAppLink = async (id: string) => {
        try {
            const success = await deleteLink(id);
            if (success) {
                console.log('App link deleted successfully:', id);
            }
        } catch (error) {
            console.error('Error deleting app link:', error);
            throw error;
        }
    };

    const updateAppLink = async (id: string, data: Partial<AppLink>) => {
        try {
            const updateData: any = {};

            if (data.url !== undefined) {
                updateData.url = data.url;
            }

            if (data.isActive !== undefined) {
                updateData.isActive = data.isActive;
            }

            if (data.store !== undefined) {
                updateData.icon = data.store === 'appstore' ? 'appstore' : 'googleplay';
                updateData.label = data.store === 'appstore' ? 'App Store' : 'Google Play';
            }

            // Ensure link_type is set
            updateData.link_type = LINK_TYPES.APP;

            const updatedLink = await updateLink(id, updateData);
            if (updatedLink) {
                console.log('App link updated successfully:', updatedLink);
            }
        } catch (error) {
            console.error('Error updating app link:', error);
            throw error;
        }
    };

    // Enhanced addWhatsAppLink with link_type
    const addWhatsAppLink = async (link: Omit<WhatsAppLink, 'id'>) => {
        if (!biositeData?.id) {
            throw new Error('Biosite ID is required');
        }

        try {
            const cleanPhone = link.phone.replace(/[^\d+]/g, '');
            const encodedMessage = encodeURIComponent(link.message);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

            const linkData = {
                biositeId: biositeData.id,
                label: link.description || 'WhatsApp',
                url: whatsappUrl,
                icon: 'whatsapp',
                orderIndex: links.length,
                isActive: link.isActive,
                link_type: LINK_TYPES.WHATSAPP // Set the link_type
            };

            const newLink = await createLink(linkData);
            if (newLink) {
                console.log('WhatsApp link created successfully:', newLink);
            }
        } catch (error) {
            console.error('Error creating WhatsApp link:', error);
            throw error;
        }
    };

    const removeWhatsAppLink = async (id: string) => {
        try {
            const success = await deleteLink(id);
            if (success) {
                console.log('WhatsApp link deleted successfully:', id);
            }
        } catch (error) {
            console.error('Error deleting WhatsApp link:', error);
            throw error;
        }
    };

    const updateWhatsAppLink = async (id: string, data: Partial<WhatsAppLink>) => {
        try {
            const updateData: any = {};

            if (data.phone !== undefined || data.message !== undefined) {
                const currentLink = links.find(link => link.id === id);
                if (currentLink) {
                    const currentData = parseWhatsAppFromUrl(currentLink.url, currentLink.label);

                    const phone = data.phone !== undefined ? data.phone : currentData.phone;
                    const message = data.message !== undefined ? data.message : currentData.message;

                    const cleanPhone = phone.replace(/[^\d+]/g, '');
                    const encodedMessage = encodeURIComponent(message);
                    updateData.url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
                }
            }

            if (data.isActive !== undefined) {
                updateData.isActive = data.isActive;
            }

            if (data.description !== undefined) {
                updateData.label = data.description;
            }

            if (!updateData.label) {
                updateData.label = 'WhatsApp';
            }

            updateData.icon = 'whatsapp';
            updateData.link_type = LINK_TYPES.WHATSAPP; // Ensure link_type is set

            const updatedLink = await updateLink(id, updateData);
            if (updatedLink) {
                console.log('WhatsApp link updated successfully:', updatedLink);
            }
        } catch (error) {
            console.error('Error updating WhatsApp link:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (biositeData && biositeData.colors) {
            let parsedColors;

            if (typeof biositeData.colors === 'string') {
                try {
                    parsedColors = JSON.parse(biositeData.colors);
                } catch (e) {
                    parsedColors = { background: biositeData.colors };
                }
            } else {
                parsedColors = biositeData.colors;
            }

            if (parsedColors.background && parsedColors.background !== themeColor) {
                setThemeColorBackState(parsedColors.background);
            }
            if (parsedColors.text && parsedColors.text !== themeColor) {
                setThemeColortextState(parsedColors.text);
            }
        }
    }, [biositeData, themeColor, themetextColor,themeBackColor]);

    const setThemeColor = useCallback(async (color: string,textColor:string, accentColor: string) => {
        try {
            setThemeColorState(color);
            setThemeColortextState(textColor)
            setThemeColorBackState(color)

            if (biositeData?.id) {
                let currentColors;
                try {
                    currentColors = typeof biositeData.colors === 'string'
                        ? JSON.parse(biositeData.colors)
                        : biositeData.colors || {};
                } catch (e) {
                    currentColors = {};
                }

                const updatedColors = {
                    ...currentColors,
                    background: color,
                    text: textColor,
                    accent: accentColor
                };

                const updateData = {
                    ownerId: biositeData.ownerId,
                    title: biositeData.title,
                    slug: biositeData.slug,
                    themeId: biositeData.themeId,
                    colors: JSON.stringify(updatedColors),
                    fonts: biositeData.fonts || fontFamily,
                    backgroundImage: biositeData.backgroundImage || '',
                    isActive: biositeData.isActive
                };

                const updatedBiosite = await updateBiositeHook(updateData);

                if (updatedBiosite) {
                    setBiosite(prev => prev ? {
                        ...prev,
                        colors: updatedColors
                    } : null);
                }
            }
        } catch (error) {
            setThemeColorState(prevColor => prevColor);
            setThemeColorBackState(prevColor => prevColor);
            setThemeColortextState(prevColor => prevColor);
            throw error;
        }
    }, [biositeData, fontFamily, updateBiositeHook, setBiosite]);

    const setFontFamily = useCallback(async (font: string) => {
        try {
            setFontFamilyState(font);

            if (biositeData?.id) {
                let currentColors;
                try {
                    currentColors = typeof biositeData.colors === 'string'
                        ? JSON.parse(biositeData.colors)
                        : biositeData.colors || {};
                } catch (e) {
                    currentColors = {};
                }

                const updateData = {
                    ownerId: biositeData.ownerId,
                    title: biositeData.title,
                    slug: biositeData.slug,
                    themeId: biositeData.themeId,
                    colors: JSON.stringify(currentColors),
                    fonts: font,
                    backgroundImage: biositeData.backgroundImage || '',
                    isActive: biositeData.isActive
                };

                const updatedBiosite = await updateBiositeHook(updateData);

                if (updatedBiosite) {
                    setBiosite(prev => prev ? {
                        ...prev,
                        fonts: font
                    } : null);
                }
            }
        } catch (error) {
            setFontFamilyState(prevFont => prevFont);
            throw error;
        }
    }, [biositeData, updateBiositeHook, setBiosite]);

    const contextValue: PreviewContextType = {
        biosite,
        socialLinks,
        regularLinks,
        appLinks,
        whatsAppLinks,
        loading,
        error,
        themeColor,
        fontFamily,
        setFontFamily,
        setThemeColor,
        updatePreview,
        clearError,
        getMusicEmbed,
        getSocialPost,
        getVideoEmbed,
        getMusicLinks,
        getSocialPostLinks,
        getVideoLinks,
        ...biositeOperations,
        ...linkOperations,
        setAppLinks: setAppLinksState,
        addAppLink,
        removeAppLink,
        updateAppLink,
        setWhatsAppLinks: setWhatsAppLinksState,
        addWhatsAppLink,
        removeWhatsAppLink,
        updateWhatsAppLink
    };

    return (
        <PreviewContext.Provider value={contextValue}>
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreview = (): PreviewContextType => {
    const context = useContext(PreviewContext);
    if (context === undefined) {
        throw new Error('usePreview must be used within a PreviewProvider');
    }
    return context;
};