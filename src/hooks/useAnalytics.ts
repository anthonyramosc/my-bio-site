import { useCallback, useRef, useEffect } from 'react';
import analyticsService from '../service/analyticsService';

interface UseAnalyticsOptions {
    biositeId?: string;
    isPublicView?: boolean;
    debug?: boolean;
}

export const useAnalytics = ({
                                 biositeId,
                                 isPublicView = false,
                                 debug = false
                             }: UseAnalyticsOptions = {}) => {
    const hasTrackedVisit = useRef(false);
    const trackedLinks = useRef(new Set<string>());
    const linkClickTimestamps = useRef(new Map<string, number>());

    const log = useCallback((message: string, data?: any) => {
        if (debug) {
            console.log(`[useAnalytics] ${message}`, data);
        }
    }, [debug]);



    // Trackear visita automáticamente cuando se monta el componente en vista pública
    useEffect(() => {
        if (isPublicView && biositeId && !hasTrackedVisit.current) {
            log('Auto-tracking visit on mount', { biositeId, isPublicView });
            trackVisit();
        }
    }, [biositeId, isPublicView]);

    const trackVisit = useCallback(async () => {
        if (!biositeId || hasTrackedVisit.current) {
            log('Skipping visit tracking', {
                hasBiositeId: !!biositeId,
                hasTrackedVisit: hasTrackedVisit.current
            });
            return;
        }

        try {
            log('Tracking visit', { biositeId });
            await analyticsService.trackVisit(biositeId);
            hasTrackedVisit.current = true;
            log('Visit tracked successfully', { biositeId });

            // Emitir evento personalizado para notificar que se registró una visita
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('visitTracked', {
                    detail: { biositeId }
                }));
            }
        } catch (error) {
            console.error('Failed to track visit:', error);
            log('Failed to track visit', { error, biositeId });
        }
    }, [biositeId, log]);

    const trackLinkClick = useCallback(async (linkId: string) => {
        if (!linkId) {
            log('Skipping link click tracking - no linkId');
            return;
        }

        // Implementar throttling para evitar múltiples clics accidentales
        const now = Date.now();
        const lastClick = linkClickTimestamps.current.get(linkId);

        if (lastClick && now - lastClick < 1000) {
            log('Throttling link click', { linkId, timeSinceLastClick: now - lastClick });
            return;
        }

        try {
            log('Tracking link click', { linkId });
            await analyticsService.trackLinkClick(linkId);
            linkClickTimestamps.current.set(linkId, now);
            log('Link click tracked successfully', { linkId });

            // Emitir evento personalizado para notificar que se registró un clic
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('linkClickTracked', {
                    detail: { linkId }
                }));
            }
        } catch (error) {
            console.error('Failed to track link click:', error);
            log('Failed to track link click', { error, linkId });
        }
    }, [log]);

    const handleLinkClick = useCallback(async (linkId: string, url: string) => {
        log('Handling link click', { linkId, url, isPublicView });

        if (isPublicView) {
            // Trackear el clic
            await trackLinkClick(linkId);
            await trackVisit();
        }

        // Abrir el enlace
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [trackLinkClick, isPublicView, log,trackVisit]);

    const handleSocialLinkClick = useCallback(async (linkId: string, url: string) => {
        log('Handling social link click', { linkId, url, isPublicView });

        if (isPublicView) {
            // Trackear el clic
            await trackLinkClick(linkId);
            await trackVisit();
        }

        // Abrir el enlace
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [trackLinkClick, isPublicView, log,trackVisit]);

    const resetTracking = useCallback(() => {
        log('Resetting tracking');
        hasTrackedVisit.current = false;
        trackedLinks.current.clear();
        linkClickTimestamps.current.clear();
        analyticsService.resetTracking();
    }, [log]);

    return {
        trackVisit,
            trackLinkClick,
        handleLinkClick,
        handleSocialLinkClick,
        resetTracking,
        hasTrackedVisit: hasTrackedVisit.current
    };
};