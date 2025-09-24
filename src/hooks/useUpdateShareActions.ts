import { useState } from 'react';
import { usePreview } from '../context/PreviewContext.tsx';

export const useUpdateShareActions = () => {
    const { biosite } = usePreview();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    // Función para actualizar el live preview
    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.reload();
        } catch (error) {
            console.error('Error updating preview:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Función para compartir el slug
    const handleShare = async () => {
        if (!biosite?.slug) {
            console.warn('No slug available for sharing');
            alert('No hay un slug disponible para compartir. Verifica que tu biosite esté configurado correctamente.');
            return;
        }

        setIsSharing(true);

        // Construir la URL correcta usando el origen actual
        const baseUrl = window.location.origin;
        const isDev = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
        const shareUrl = isDev
        ? `${baseUrl}/vesite/${biosite.slug}`
        : `${baseUrl}/${biosite.slug}`;

        console.log('Sharing URL:', shareUrl); // Para debug

        try {
            // Verificar si el navegador soporta la Web Share API
            if (navigator.share && navigator.canShare) {
                const shareData = {
                    title: biosite.title || 'Mi Bio Site',
                    text: `Visita mi perfil en Bio Site: ${biosite.title || 'Mi perfil'}`,
                    url: shareUrl
                };

                // Verificar si los datos se pueden compartir
                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    console.log('Content shared successfully via Web Share API');
                    return;
                }
            }

            // Fallback: copiar al clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                console.log('URL copied to clipboard:', shareUrl);

                // Mostrar notificación de éxito más amigable
                showSuccessNotification('¡Enlace copiado! Ya puedes compartir tu biosite.');
            } else {
                // Fallback para navegadores que no soportan clipboard API
                fallbackCopyToClipboard(shareUrl);
            }
        } catch (error) {
            console.error('Error sharing:', error);

            // Si falló todo lo anterior, mostrar la URL para copiar manualmente
            fallbackShowUrl(shareUrl);
        } finally {
            setIsSharing(false);
        }
    };

    // Función fallback para copiar texto (navegadores antiguos)
    const fallbackCopyToClipboard = (text: string) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showSuccessNotification('¡Enlace copiado! Ya puedes compartir tu biosite.');
            } else {
                fallbackShowUrl(text);
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            fallbackShowUrl(text);
        } finally {
            document.body.removeChild(textArea);
        }
    };

    // Función para mostrar la URL cuando todo falla
    const fallbackShowUrl = (url: string) => {
        const message = `Copia este enlace para compartir tu biosite:\n\n${url}`;

        // Intentar usar prompt primero
        if (window.prompt) {
            window.prompt('Copia este enlace:', url);
        } else {
            // Si no hay prompt, usar alert
            alert(message);
        }
    };

    // Función para mostrar notificación de éxito
    const showSuccessNotification = (message: string) => {
        // Si existe un sistema de notificaciones, usarlo
        // Por ahora usamos alert, pero puedes reemplazarlo con tu sistema de notificaciones
        alert(message);

        // Alternativa: crear una notificación toast personalizada
        // createToastNotification(message, 'success');
    };

    // Función para validar que el biosite tenga los datos necesarios
    const canShare = () => {
        return biosite && biosite.slug && biosite.slug.trim() !== '';
    };

    // Función para obtener la URL de compartir
    const getShareUrl = () => {
        if (!canShare()) return null;
        return `${window.location.origin}/${biosite!.slug}`;
    };

    return {
        isUpdating,
        isSharing,
        handleUpdate,
        handleShare,
        canShare: canShare(),
        shareUrl: getShareUrl(),
        // Función de utilidad para usar en otros componentes
        copyToClipboard: (text: string) => {
            if (navigator.clipboard) {
                return navigator.clipboard.writeText(text);
            } else {
                fallbackCopyToClipboard(text);
                return Promise.resolve();
            }
        }
    };
};
