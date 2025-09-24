import { useState, useCallback } from "react";
import apiService from "../service/apiService";
import { LinksApi} from "../constants/EndpointsRoutes.ts";
import type {Link, CreateLinkDto, UpdateLinkDto} from "../interfaces/Links.ts";

const LINK_TYPES = {
    SOCIAL: 'social',
    REGULAR: 'regular',
    APP: 'app',
    WHATSAPP: 'whatsapp',
    MUSIC: 'music',
    VIDEO: 'video',
    SOCIAL_POST: 'social_post'
} as const;

const SOCIAL_PLATFORMS = [
    'instagram', 'tiktok', 'twitter', 'x', 'youtube', 'facebook', 'twitch',
    'linkedin', 'snapchat', 'threads', 'email', 'gmail', 'pinterest', 'spotify',
    'apple music', 'discord', 'tumblr', 'whatsapp', 'telegram', 'amazon', 'onlyfans'
];

export const useFetchLinks = (biositeId?: string) => {
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async (): Promise<Link[]> => {
        if (!biositeId) {
            setError("Biosite ID is required");
            return [];
        }

        try {
            setLoading(true);
            setError(null);

            const res = await apiService.getAll<Link[]>(`/links/biosite/${biositeId}`);

            const linksArray = Array.isArray(res) ? res : [];
            setLinks(linksArray);
            return linksArray;
        } catch (error: any) {
            console.error("fetchLinks error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar los enlaces";
            setError(errorMessage);
            setLinks([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [biositeId]);

    const createLink = useCallback(async (linkData: CreateLinkDto): Promise<Link | null> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Creating link with data:", linkData);

            const newLink = await apiService.create<CreateLinkDto, Link>(LinksApi, linkData);
            console.log("Link created:", newLink);

            setLinks(prev => [...prev, newLink]);
            return newLink;
        } catch (error: any) {
            console.error("createLink error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al crear el enlace";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateLink = useCallback(async (linkId: string, updateData: UpdateLinkDto): Promise<Link | null> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Updating link:", linkId, updateData);

            const updatedLink = await apiService.update<UpdateLinkDto>(LinksApi, linkId, updateData);
            console.log("Link updated:", updatedLink);

            setLinks(prev =>
                prev.map(link =>
                    link.id === linkId
                        ? { ...link, ...updatedLink }
                        : link
                )
            );

            return updatedLink as Link;
        } catch (error: any) {
            console.error("updateLink error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al actualizar el enlace";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteLink = useCallback(async (linkId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Deleting link with ID:", linkId);

            const linkExists = links.find(link => link.id === linkId);
            if (!linkExists) {
                console.warn("Link not found in local state:", linkId);
            }

            const response = await apiService.delete(LinksApi, linkId);
            return true;

        } catch (error: any) {
            return false;
        } finally {
            setLoading(false);
        }
    }, [links]);

    const reorderLinks = useCallback(async (biositeId: string, reorderedLinks: { id: string; orderIndex: number }[]): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Reordering links:", reorderedLinks);

            await apiService.patch(`/links/reorder/${biositeId}`, { links: reorderedLinks });
            console.log("Links reordered successfully");

            setLinks(prev => {
                const updated = [...prev];
                reorderedLinks.forEach(({ id, orderIndex }) => {
                    const linkIndex = updated.findIndex(link => link.id === id);
                    if (linkIndex !== -1) {
                        updated[linkIndex].orderIndex = orderIndex;
                    }
                });
                return updated.sort((a, b) => a.orderIndex - b.orderIndex);
            });

            return true;
        } catch (error: any) {
            console.error("reorderLinks error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al reordenar los enlaces";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleLinkStatus = useCallback(async (linkId: string, isActive: boolean): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Toggling link status:", linkId, isActive);

            const updatedLink = await apiService.update<UpdateLinkDto>("/links", linkId, { isActive });
            console.log("Link status updated:", updatedLink);

            setLinks(prev =>
                prev.map(link =>
                    link.id === linkId
                        ? { ...link, isActive }
                        : link
                )
            );

            return true;
        } catch (error: any) {
            console.error("toggleLinkStatus error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al cambiar el estado del enlace";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const isSocialLink = useCallback((link: Link): boolean => {

        if (link.link_type === LINK_TYPES.SOCIAL) {
            return true;
        }

        if (link.link_type && link.link_type !== LINK_TYPES.SOCIAL) {
            return false;
        }

        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        return SOCIAL_PLATFORMS.some(platform =>
            labelLower.includes(platform) ||
            urlLower.includes(platform) ||
            urlLower.includes(platform.replace(' ', ''))
        );
    }, []);

    const isRegularLink = useCallback((link: Link): boolean => {

        if (link.link_type === LINK_TYPES.REGULAR) {
            return true;
        }

        if (link.link_type && link.link_type !== LINK_TYPES.REGULAR) {
            return false;
        }

        return !isSocialLink(link) &&
            !isAppLink(link) &&
            !isWhatsAppLink(link) &&
            !isMusicLink(link) &&
            !isVideoLink(link) &&
            !isSocialPostLink(link);
    }, []);

    const isAppLink = useCallback((link: Link): boolean => {

        if (link.link_type === LINK_TYPES.APP) {
            return true;
        }

        if (link.link_type && link.link_type !== LINK_TYPES.APP) {
            return false;
        }

        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        return (
            labelLower.includes('app store') ||
            labelLower.includes('appstore') ||
            urlLower.includes('apps.apple.com') ||
            labelLower.includes('google play') ||
            labelLower.includes('googleplay') ||
            urlLower.includes('play.google.com')
        );
    }, []);

    const isWhatsAppLink = useCallback((link: Link): boolean => {

        if (link.link_type === LINK_TYPES.WHATSAPP) {
            return true;
        }

        if (link.link_type && link.link_type !== LINK_TYPES.WHATSAPP) {
            return false;
        }

        const urlLower = link.url?.toLowerCase() || '';

        return (
            urlLower.includes('api.whatsapp.com')
        );
    }, []);

    const isMusicLink = useCallback((link: Link): boolean => {

        if (link.link_type === LINK_TYPES.MUSIC) {
            return true;
        }

        if (link.link_type && link.link_type !== LINK_TYPES.MUSIC) {
            return false;
        }

        const labelLower = link.label?.toLowerCase() || '';
        const urlLower = link.url?.toLowerCase() || '';

        return (
            labelLower.includes('music') ||
            labelLower.includes('soundcloud') ||
            urlLower.includes('open.spotify.com') ||
            urlLower.includes('music.apple.com') ||
            urlLower.includes('soundcloud.com') ||
            labelLower.includes('apple music') ||
            labelLower.includes('audio') ||
            labelLower.includes('music embed')
        );
    }, []);

    const isVideoLink = useCallback((link: Link): boolean => {

        if (link.link_type === LINK_TYPES.VIDEO) {
            return true;
        }

        if (link.link_type && link.link_type !== LINK_TYPES.VIDEO) {
            return false;
        }

        const labelLower = link.label?.toLowerCase() || '';
        const urlLower = link.url?.toLowerCase() || '';

        return (
            labelLower.includes('video') ||
            labelLower.includes('vimeo') ||
            urlLower.includes('youtube.com/watch') ||
            urlLower.includes('youtu.be') ||
            urlLower.includes('vimeo.com') ||
            labelLower.includes('tiktok video')
        );
    }, []);

    const isSocialPostLink = useCallback((link: Link): boolean => {

        if (link.link_type === LINK_TYPES.SOCIAL_POST) {
            return true;
        }

        if (link.link_type && link.link_type !== LINK_TYPES.SOCIAL_POST) {
            return false;
        }

        const labelLower = link.label?.toLowerCase() || '';
        const urlLower = link.url?.toLowerCase() || '';

        return (
            labelLower.includes('post') ||
            labelLower.includes('publicacion') ||
            labelLower.includes('contenido') ||
            labelLower.includes('social post') ||
            // Instagram posts and reels
            urlLower.includes('instagram.com/p/') ||
            (urlLower.includes('instagram.com') && (urlLower.includes('/p/') || urlLower.includes('/reel/'))) ||
            // TikTok videos - ADDED
            urlLower.includes('vm.tiktok.com') ||
            urlLower.includes('tiktok.com/t/') ||
            (urlLower.includes('tiktok.com') && urlLower.includes('/video/')) ||
            // General TikTok video patterns (excluding profile pages)
            (urlLower.includes('tiktok.com') &&
                !urlLower.match(/tiktok\.com\/?$/) &&
                !urlLower.includes('/@') // Exclude profile pages
            )
        );
    }, []);

    const getSocialLinks = useCallback(() => {
        return links.filter(isSocialLink);
    }, [links, isSocialLink]);

    const getRegularLinks = useCallback(() => {
        return links.filter(isRegularLink);
    }, [links, isRegularLink]);

    const getAppLinks = useCallback(() => {
        return links.filter(isAppLink);
    }, [links, isAppLink]);

    const getWhatsAppLinks = useCallback(() => {
        return links.filter(isWhatsAppLink);
    }, [links, isWhatsAppLink]);

    const getMusicLinks = useCallback(() => {
        return links.filter(isMusicLink);
    }, [links, isMusicLink]);

    const getVideoLinks = useCallback(() => {
        return links.filter(isVideoLink);
    }, [links, isVideoLink]);

    const getSocialPostLinks = useCallback(() => {
        return links.filter(isSocialPostLink);
    }, [links, isSocialPostLink]);

    const clearError = useCallback(() => setError(null), []);

    const resetState = useCallback(() => {
        setLinks([]);
        setError(null);
        setLoading(false);
    }, []);

    return {
        links,
        loading,
        error,
        fetchLinks,
        createLink,
        updateLink,
        deleteLink,
        reorderLinks,
        toggleLinkStatus,
        getSocialLinks,
        getRegularLinks,
        getAppLinks,
        getWhatsAppLinks,
        getMusicLinks,
        getVideoLinks,
        getSocialPostLinks,
        isSocialLink,
        isRegularLink,
        isAppLink,
        isWhatsAppLink,
        isMusicLink,
        isVideoLink,
        isSocialPostLink,
        clearError,
        resetState,
        LINK_TYPES
    };
};