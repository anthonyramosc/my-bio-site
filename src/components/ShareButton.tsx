import { useUpdateShareActions } from '../hooks/useUpdateShareActions';
import {Share2} from "lucide-react";

const ShareButton = () => {
    const { handleShare, isSharing, canShare, shareUrl } = useUpdateShareActions();

    // Configuración del botón según el estado
    const getButtonContent = () => {
        if (!canShare) {
            return {
                text: 'No disponible',
                disabled: true,
                icon: <span>❌</span>
            };
        }

        if (isSharing) {
            return {
                text: 'Compartiendo...',
                disabled: true,
                icon: <span>⏳</span>
            };
        }

        return {
            text: 'Compartir',
            disabled: false,
            icon: <span><Share2  className="h-4 w-4 lg:text-black text-gray-400" /></span>
        };
    };

    const buttonContent = getButtonContent();

    const handleClick = async () => {
        if (!canShare || isSharing) return;

        try {
            await handleShare();
        } catch (error) {
            console.error('Error al compartir:', error);
            alert('Hubo un error al compartir. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="share-button-container">
            <button
                onClick={handleClick}
                disabled={buttonContent.disabled}
                className={`px-4 cursor-pointer py-2 text-xs h-8 rounded-lg flex items-center space-x-1.5 transition-colors ${
                    buttonContent.disabled
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-transparent lg:bg-gray-100 text-black hover:bg-gray-100'
                }`}
                title={ 'Compartir vesite'}
            >
                {buttonContent.icon}
            </button>

        </div>
    );
};

export default ShareButton;
