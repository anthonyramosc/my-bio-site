import React from 'react';
import { WhatsAppOutlined } from "@ant-design/icons";
import type { WhatsAppLink } from "../../../../interfaces/PreviewContext";

interface PublicWhatsAppButtonProps {
    whatsAppLinks: WhatsAppLink[];
    themeConfig: {
        colors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            text: string;
            profileBackground: string;
        };
        fonts: {
            primary: string;
            secondary: string;
        };
    };
    onLinkClick?: (linkId: string, url: string) => void; // Para analytics
}

const PublicWhatsAppButton: React.FC<PublicWhatsAppButtonProps> = ({
                                                                       whatsAppLinks,
                                                                       themeConfig,
                                                                       onLinkClick
                                                                   }) => {
    // Filtrar solo enlaces activos
    const activeWhatsAppLinks = whatsAppLinks.filter(link => link.isActive);

    // Si no hay enlaces activos, no mostrar nada
    if (!activeWhatsAppLinks || activeWhatsAppLinks.length === 0) {
        return null;
    }

    // Generar URL de WhatsApp
    const generateWhatsAppUrl = (phone: string, message: string): string => {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const encodedMessage = encodeURIComponent(message.trim());
        return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
    };

    // Manejar click en el botón
    const handleClick = (link: WhatsAppLink) => async (e: React.MouseEvent) => {
        e.preventDefault();

        const url = generateWhatsAppUrl(link.phone, link.message);

        // Si hay función de analytics, usarla
        if (onLinkClick) {
            await onLinkClick(link.id, url);
        }

        // Abrir WhatsApp
        window.open(url, '_blank');
    };

    // Truncar texto largo
    const truncateText = (text: string, maxLength: number = 40): string => {
        if (text.length <= maxLength) return text;
        return `${text.substring(0, maxLength)}...`;
    };

    return (
        <div className="px-4 mb-4 space-y-3">
            {activeWhatsAppLinks.map((link) => (
                <button
                    key={link.id}
                    onClick={handleClick(link)}
                    className="w-full p-3 rounded-lg text-center shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center"
                    style={{
                        backgroundColor: themeConfig.colors.accent || '#25D366',
                        border: 'none'
                    }}
                >
                    {/* Icono de WhatsApp */}
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <WhatsAppOutlined
                            size={20}
                            className="text-white"
                            style={{ color: 'white', fontSize: '20px' }}
                        />
                    </div>

                    {/* Contenido del botón */}
                    <div className="flex flex-col justify-center ml-4 flex-1 text-left ite">
                        {/* Título/Descripción */}
                        <span
                            className="font-semibold text-base leading-tight"
                            style={{
                                color: themeConfig.colors.text || '#ffffff',
                                fontFamily: themeConfig.fonts.primary || 'Inter'
                            }}
                        >
                            {link.description || 'WhatsApp'}
                        </span>
                        <div className='flex flex-wrap gap-3 items-center'>
                        {/* Mensaje preview */}
                        {link.message && (
                            <span
                                className="text-sm opacity-80 leading-tight mt-1"
                                style={{
                                    color: themeConfig.colors.text || '#ffffff',
                                    fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary || 'Inter'
                                }}
                            >
                                {truncateText(link.message, 45)}
                            </span>
                        )}

                        {/* Número de teléfono (opcional) */}
                        {link.phone && (
                            <span
                                className="text-xs opacity-60 leading-tight mt-1"
                                style={{
                                    color: themeConfig.colors.text || '#ffffff',
                                    fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary || 'Inter'
                                }}
                            >
                                {link.phone}
                            </span>
                        )}
                        </div>
                    </div>

                    {/* Indicador de acción */}
                    <div className="flex-shrink-0 ml-2">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="opacity-60"
                        >
                            <path
                                d="M6 12L10 8L6 4"
                                stroke={themeConfig.colors.text || '#ffffff'}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default PublicWhatsAppButton;