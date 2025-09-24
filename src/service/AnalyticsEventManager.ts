class AnalyticsEventManager {
    private static instance: AnalyticsEventManager;
    private listeners: Map<string, Set<Function>> = new Map();

    private constructor() {
        // Singleton
    }

    public static getInstance(): AnalyticsEventManager {
        if (!AnalyticsEventManager.instance) {
            AnalyticsEventManager.instance = new AnalyticsEventManager();
        }
        return AnalyticsEventManager.instance;
    }

    // Escuchar eventos de tracking
    public onVisitTracked(callback: (biositeId: string) => void): () => void {
        const handler = (event: CustomEvent) => {
            callback(event.detail.biositeId);
        };

        window.addEventListener('visitTracked', handler as EventListener);

        return () => {
            window.removeEventListener('visitTracked', handler as EventListener);
        };
    }

    public onLinkClickTracked(callback: (linkId: string) => void): () => void {
        const handler = (event: CustomEvent) => {
            callback(event.detail.linkId);
        };

        window.addEventListener('linkClickTracked', handler as EventListener);

        return () => {
            window.removeEventListener('linkClickTracked', handler as EventListener);
        };
    }

    // Método para notificar manualmente (si necesitas)
    public notifyVisitTracked(biositeId: string) {
        window.dispatchEvent(new CustomEvent('visitTracked', {
            detail: { biositeId }
        }));
    }

    public notifyLinkClickTracked(linkId: string) {
        window.dispatchEvent(new CustomEvent('linkClickTracked', {
            detail: { linkId }
        }));
    }
}

export const analyticsEventManager = AnalyticsEventManager.getInstance();
export default analyticsEventManager;