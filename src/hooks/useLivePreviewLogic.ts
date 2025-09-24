import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useLivePreview } from "./useLivePreview.ts";
import { usePreview } from "../context/PreviewContext.tsx";
import { useUser } from "./useUser.ts";
import type { SocialLink } from "../interfaces/PreviewContext.ts";

export const useLivePreviewLogic = () => {
    const {
        biosite,
        loading,
        error,
        imageLoadStates,
        handleImageLoad,
        handleImageError,
        handleImageLoadStart,
        parseColors,
        regularLinksData,
        socialLinksData,
        validBackgroundImage,
        validAvatarImage,
        findPlatformForLink
    } = useLivePreview();

    const { getMusicEmbed, getSocialPost, getVideoEmbed, themeColor, fontFamily } = usePreview();
    const { user, fetchUser, loading: userLoading, error: userError } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    const isExposedRoute = location.pathname === '/expoced';

    useEffect(() => {
        const userId = Cookies.get('userId');
        if (userId && !user) {
            fetchUser(userId);
        }
    }, [fetchUser, user]);

    const getThemeConfig = () => {
        if (biosite?.theme?.config) {
            return {
                colors: {
                    primary: biosite.theme.config.colors.primary,
                    secondary: biosite.theme.config.colors.secondary,
                    accent: biosite.theme.config.colors.accent,
                    background: biosite.theme.config.colors.background || themeColor || '#ffffff',
                    text: biosite.theme.config.colors.text || '#000000',
                    profileBackground: biosite.theme.config.colors.profileBackground || themeColor || '#ffffff'
                },
                fonts: {
                    primary: biosite.theme.config.fonts.primary || biosite?.fonts || fontFamily || 'Inter',
                    secondary: biosite.theme.config.fonts.secondary || biosite?.fonts || fontFamily || 'Lato'
                },
                isDark: biosite.theme.config.isDark || false,
                isAnimated: biosite.theme.config.isAnimated || false
            };
        }

        const colors = parseColors(biosite?.colors);

        return {
            colors: {
                primary: colors.primary || '#f3f4f6',
                secondary: colors.secondary,
                accent: colors.accent ,
                background: colors.background || themeColor || '#ffffff',
                text: colors.text || themeColor || '#000000',
                profileBackground: colors.profileBackground || colors.background || themeColor || '#ffffff'
            },
            fonts: {
                primary: biosite?.fonts || fontFamily || 'Inter',
                secondary: biosite?.fonts || fontFamily ||'Lato'
            },
            isDark: false,
            isAnimated: false
        };
    };

    // Enhanced filterRealSocialLinks using link_type
    const filterRealSocialLinks = (links: SocialLink[]) => {
        return links.filter(link => {
            if (!link.isActive) return false;

            // Check if this link has a specific link_type that should be excluded from social
            const linkData = socialLinksData.find(sl => sl.id === link.id);
            if (linkData && linkData.link_type) {
                // If it has a specific type and it's not social, exclude it
                if (!['social', 'whatsapp'].includes(linkData.link_type)) {
                    return false;
                }
            }

            // Original exclusion logic as fallback
            const excludedKeywords = [
                'open.spotify.com/embed', 'music', 'soundcloud', 'audio',
                'youtube.com/watch', 'video', 'vimeo', 'tiktok video',
                'post', 'publicacion', 'contenido', 'api.whatsapp.com',
                'music embed', 'video embed', 'social post',
                'embed', 'player'
            ];

            const labelLower = link.label.toLowerCase();
            const urlLower = link.url.toLowerCase();

            const isExcluded = excludedKeywords.some(keyword =>
                labelLower.includes(keyword) || urlLower.includes(keyword)
            );

            if (isExcluded) return false;

            // Exclude WhatsApp API links but allow wa.me links
            if (urlLower.includes("api.whatsapp.com")) {
                return false;
            }

            // Allow YouTube channel links in social
            if (urlLower.includes('youtube.com/@')) {
                return true;
            }

            // Allow wa.me WhatsApp links in social
            if (urlLower.includes("wa.me/") || urlLower.includes("whatsapp.com")) {
                return true;
            }

            const platform = findPlatformForLink(link);
            return platform !== undefined && platform !== null;
        });
    };

    const getSpotifyEmbedUrl = (url: string) => {
        const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
        if (trackMatch) {
            return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
        }
        return null;
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (videoIdMatch) {
            return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
        return null;
    };

    const getInstagramEmbedUrl = (url: string) => {
        const postMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
        if (postMatch) {
            return `https://www.instagram.com/p/${postMatch[1]}/embed/`;
        }
        return null;
    };

    const isInstagramUrl = (url: string) => {
        return url.includes('instagram.com') && (url.includes('/p/') || url.includes('/reel/'));
    };

    // Click handlers
    const handleMusicClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/music');
        }
    };

    const handleVideoClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/videos');
        }
    };

    const handleSocialPostClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/post');
        }
    };

    const handleLinksClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/links');
        }
    };

    const handleSocialClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/social');
        }
    };

    const handleImageClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/profile');
        }
    };

    const handleAppClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/app');
        }
    };

    const handleUserInfoClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/profile');
        }
    };

    const handleVCardClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/VCard');
        }
    };

    const handleWhatsAppClick = (e: React.MouseEvent) => {
        if (!isExposedRoute) {
            e.preventDefault();
            navigate('/whatsApp');
        }
    };

    // Add analytics handlers for exposed route
    const handleLinkClick = (linkId: string, url: string) => {
        if (isExposedRoute) {
            // Track link click analytics here
            console.log('Link clicked:', linkId, url);
            // You can add analytics tracking here
            window.open(url, '_blank');
        }
    };

    const handleSocialLinkClick = (linkId: string, url: string) => {
        if (isExposedRoute) {
            // Track social link click analytics here
            console.log('Social link clicked:', linkId, url);
            // You can add analytics tracking here
            window.open(url, '_blank');
        }
    };

    const themeConfig = getThemeConfig();
    const musicEmbed = getMusicEmbed();
    const socialPost = getSocialPost();
    const videoEmbed = getVideoEmbed();
    const realSocialLinks = filterRealSocialLinks(socialLinksData);
    const description = user?.description || user?.name || 'Tu descripción aquí';

    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    return {
        biosite,
        loading,
        error,
        userLoading,
        userError,
        user,
        imageLoadStates,
        handleImageLoad,
        handleImageError,
        handleImageLoadStart,
        regularLinksData,
        realSocialLinks,
        validBackgroundImage,
        validAvatarImage,
        findPlatformForLink,
        filterRealSocialLinks,
        getSpotifyEmbedUrl,
        isExposedRoute,
        themeConfig,
        musicEmbed,
        socialPost,
        videoEmbed,
        description,
        defaultAvatar,
        isInstagramUrl,
        getYouTubeEmbedUrl,
        getInstagramEmbedUrl,
        handleMusicClick,
        handleVideoClick,
        handleSocialPostClick,
        handleLinksClick,
        handleSocialClick,
        handleImageClick,
        handleUserInfoClick,
        handleAppClick,
        handleVCardClick,
        handleWhatsAppClick,
        handleLinkClick,
        handleSocialLinkClick,
    };
};