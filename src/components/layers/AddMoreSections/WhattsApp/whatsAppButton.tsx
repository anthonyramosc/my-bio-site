import { usePreview } from "../../../../context/PreviewContext";
import { useLocation } from "react-router-dom";
import { WhatsAppOutlined } from "@ant-design/icons";
import React from "react";

interface WhatsAppButtonProps {
    onWhatsAppClick?: (e: React.MouseEvent) => void;
    handleWhatsAppLinkClick?: (id: string, url: string) => void;
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
}

const WhatsAppButton = ({ onWhatsAppClick, handleWhatsAppLinkClick, themeConfig }: WhatsAppButtonProps) => {
    const { whatsAppLinks } = usePreview();
    const location = useLocation();

    const isExposedRoute = location.pathname === '/expoced';

    // Obtener enlaces de WhatsApp activos
    const activeWhatsAppLinks = whatsAppLinks.filter(link => link.isActive);

    // Si no hay enlaces de WhatsApp activos, no mostrar nada
    if (!activeWhatsAppLinks || activeWhatsAppLinks.length === 0) {
        return null;
    }

    const generateWhatsAppUrl = (phone: string, message: string): string => {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const encodedMessage = encodeURIComponent(message.trim());
        return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
    };

    const handleClick = (link: any) => (e: React.MouseEvent) => {
        e.preventDefault();

        if (isExposedRoute && handleWhatsAppLinkClick) {

            const url = generateWhatsAppUrl(link.phone, link.message);
            handleWhatsAppLinkClick(link.id, url);
        } else if (isExposedRoute) {

            const url = generateWhatsAppUrl(link.phone, link.message);
            window.open(url, '_blank');
        } else {

            onWhatsAppClick && onWhatsAppClick(e);
        }
    };

    return (
        <div className="px-4 mb-2 space-y-2">
            {activeWhatsAppLinks.map((link) => (
                <button
                    key={link.id}
                    onClick={handleClick(link)}
                    className="w-full p-2 items-center rounded-lg bg-white text-center shadow-lg transition-all flex duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        backgroundColor: themeConfig.colors.accent,
                        background: themeConfig.colors.accent
                    }}
                >
                    {/* Icono de WhatsApp */}
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <WhatsAppOutlined size={18} className="text-white" style={{ color: 'white' }} />
                    </div>

                    {/* Contenido del botón */}
                    <div className="flex flex-col justify-center ml-3 flex-1 text-left">
                        <span
                            className="font-medium text-sm truncate"
                            style={{
                                color: themeConfig.colors.text,
                                fontFamily: themeConfig.fonts.primary
                            }}
                        >
                            {link.description || 'WhatsApp'}
                        </span>
                        {link.message && (
                            <span
                                className="text-xs opacity-75 truncate mt-0.5"
                                style={{
                                    color: themeConfig.colors.text,
                                    fontFamily: themeConfig.fonts.secondary
                                }}
                            >
                                {link.message.length > 40
                                    ? `${link.message.substring(0, 40)}...`
                                    : link.message
                                }
                            </span>
                        )}
                    </div>
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

export default WhatsAppButton;