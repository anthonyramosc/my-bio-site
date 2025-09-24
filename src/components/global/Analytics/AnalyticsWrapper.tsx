// components/Analytics/AnalyticsWrapper.tsx
import React, { createContext, useContext, useCallback } from 'react';
import { useAnalytics } from '../../../hooks/useAnalytics';

interface AnalyticsContextType {
    trackVisit: () => Promise<void>;
    trackLinkClick: (linkId: string) => Promise<void>;
    handleLinkClick: (linkId: string, url: string) => Promise<void>;
    handleSocialLinkClick: (linkId: string, url: string) => Promise<void>;
    resetTracking: () => void;
    hasTrackedVisit: boolean;
    biositeId?: string;
    // Nuevo: callback para notificar cambios en analytics
    onAnalyticsUpdate?: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsWrapperProps {
    children: React.ReactNode;
    biositeId?: string;
    isPublicView?: boolean;
    onAnalyticsUpdate?: () => void; // Callback para cuando se actualicen los analytics
}

export const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({
                                                                      children,
                                                                      biositeId,
                                                                      isPublicView = false,
                                                                      onAnalyticsUpdate
                                                                  }) => {
    const analytics = useAnalytics({ biositeId, isPublicView });

    // Envolver los métodos de tracking para notificar actualizaciones
    const enhancedTrackVisit = useCallback(async () => {
        await analytics.trackVisit();
        if (onAnalyticsUpdate) {
            // Delay para permitir que el backend procese el evento
            setTimeout(onAnalyticsUpdate, 1000);
        }
    }, [analytics.trackVisit, onAnalyticsUpdate]);

    const enhancedTrackLinkClick = useCallback(async (linkId: string) => {
        await analytics.trackLinkClick(linkId);
        if (onAnalyticsUpdate) {
            // Delay para permitir que el backend procese el evento
            setTimeout(onAnalyticsUpdate, 1000);
        }
    }, [analytics.trackLinkClick, onAnalyticsUpdate]);

    const enhancedHandleLinkClick = useCallback(async (linkId: string, url: string) => {
        await analytics.handleLinkClick(linkId, url);
        if (onAnalyticsUpdate) {
            // Delay para permitir que el backend procese el evento
            setTimeout(onAnalyticsUpdate, 1000);
        }
    }, [analytics.handleLinkClick, onAnalyticsUpdate]);

    const enhancedHandleSocialLinkClick = useCallback(async (linkId: string, url: string) => {
        await analytics.handleSocialLinkClick(linkId, url);
        if (onAnalyticsUpdate) {
            // Delay para permitir que el backend procese el evento
            setTimeout(onAnalyticsUpdate, 1000);
        }
    }, [analytics.handleSocialLinkClick, onAnalyticsUpdate]);

    const contextValue: AnalyticsContextType = {
        trackVisit: enhancedTrackVisit,
        trackLinkClick: enhancedTrackLinkClick,
        handleLinkClick: enhancedHandleLinkClick,
        handleSocialLinkClick: enhancedHandleSocialLinkClick,
        resetTracking: analytics.resetTracking,
        hasTrackedVisit: analytics.hasTrackedVisit,
        biositeId,
        onAnalyticsUpdate
    };

    return (
        <AnalyticsContext.Provider value={contextValue}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalyticsContext = (): AnalyticsContextType => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalyticsContext must be used within an AnalyticsWrapper');
    }
    return context;
};

// Hook para componentes que pueden o no estar dentro del AnalyticsWrapper
export const useOptionalAnalytics = () => {
    return useContext(AnalyticsContext);
};