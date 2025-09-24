// Actualización del componente SocialEmbed.tsx para usar blockquote method

import React, { useState, useEffect } from 'react';
import type { BiositeLink } from "../../interfaces/Biosite";

interface SocialEmbedProps {
    link: BiositeLink;
    themeConfig: any;
    onLinkClick?: () => void;
    onTrack?: (id) => void;
    isExposedRoute?: boolean;
}

// Función para verificar si es una URL de Instagram
const isInstagramUrl = (url: string): boolean => {
    return (
        url.includes("instagram.com/p/") ||
        url.includes("instagram.com/reel/") ||
        url.includes("instagr.am/p/") ||
        url.includes("instagr.am/reel/")
    );
};

// Función para obtener la URL del embed de Instagram
const getInstagramEmbedUrl = (url: string): string | null => {
    try {
        const patterns = [
            /https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
            /https?:\/\/instagr\.am\/p\/([a-zA-Z0-9_-]+)/,
            /https?:\/\/instagr\.am\/reel\/([a-zA-Z0-9_-]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                const postId = match[1];
                const isReel = url.includes("/reel/");
                const type = isReel ? "reel" : "p";
                return `https://www.instagram.com/${type}/${postId}/embed/`;
            }
        }

        return null;
    } catch (error) {
        console.error("Error parsing Instagram URL:", error);
        return null;
    }
};

// Función para verificar si es una URL de TikTok
const isTikTokUrl = (url: string): boolean => {
    return (
        url.includes("vm.tiktok.com") ||
        url.includes("tiktok.com/t/") ||
        (url.includes("tiktok.com") && url.includes("/video/")) ||
        (url.includes("tiktok.com/@") && url.includes("/video/")) ||
        (url.includes("tiktok.com") &&
            !url.match(/tiktok\.com\/?$/) &&
            !url.includes("/@") &&
            !url.includes("/following") &&
            !url.includes("/foryou"))
    );
};

// Función para extraer el video ID de TikTok
const extractTikTokVideoId = (url: string): string | null => {
    try {
        const patterns = [
            /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
            /tiktok\.com\/t\/([\w-]+)/,
            /vm\.tiktok\.com\/([\w-]+)/,
            /m\.tiktok\.com\/v\/(\d+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    } catch (error) {
        console.error("Error extracting TikTok video ID:", error);
        return null;
    }
};

// Función para extraer el username de TikTok
const extractTikTokUsername = (url: string): string | null => {
    try {
        const match = url.match(/tiktok\.com\/@([\w.-]+)/);
        return match ? `@${match[1]}` : null;
    } catch (error) {
        console.error("Error extracting TikTok username:", error);
        return null;
    }
};

export default function SocialEmbed({
                                        link,
                                        themeConfig,
                                        onLinkClick,
                                        onTrack,
                                        isExposedRoute = true,
                                    }: SocialEmbedProps) {
    const [isLoadingTikTok, setIsLoadingTikTok] = useState(false);
    const [tikTokError, setTikTokError] = useState(false);
    const [tikTokScriptLoaded, setTikTokScriptLoaded] = useState(false);

    const isInstagram = isInstagramUrl(link.url);
    const isTikTok = isTikTokUrl(link.url);
    const tikTokVideoId = isTikTok ? extractTikTokVideoId(link.url) : null;
    const tikTokUsername = isTikTok ? extractTikTokUsername(link.url) : null;

    // Cargar script de TikTok cuando sea necesario
    useEffect(() => {
        if (isTikTok && !tikTokError && !tikTokScriptLoaded) {
            setIsLoadingTikTok(true);

            // Verificar si el script ya existe
            const existingScript = document.getElementById('tiktok-embed-script');
            if (existingScript) {
                setTikTokScriptLoaded(true);
                setIsLoadingTikTok(false);
                return;
            }

            // Crear y cargar el script
            const script = document.createElement('script');
            script.id = 'tiktok-embed-script';
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;

            script.onload = () => {
                setTikTokScriptLoaded(true);
                setIsLoadingTikTok(false);
            };

            script.onerror = () => {
                setTikTokError(true);
                setIsLoadingTikTok(false);
            };

            document.body.appendChild(script);

            // Cleanup
            return () => {
                // No remover el script aquí para evitar recargas innecesarias
            };
        }
    }, [isTikTok, tikTokError, tikTokScriptLoaded]);

    const handleClick = () => {
        if (onLinkClick) {
            onLinkClick();
        } else {
            window.open(link.url, "_blank", "noopener,noreferrer");
        }
        if (onTrack) {
            onTrack(link.id);
        }
    };

    // Si es TikTok y tenemos el video ID
    if (isTikTok && tikTokVideoId && tikTokScriptLoaded && !tikTokError) {
        return (
            <div
                className="relative cursor-pointer rounded-lg shadow-md overflow-hidden"
                style={{
                    backgroundColor: themeConfig.colors.profileBackground || "#ffffff",
                }}
            >
                {/* Header del video */}
                <div
                    className="py-2 px-4 flex justify-between items-center"
                    style={{ backgroundColor: themeConfig.colors.accent || "#8b5cf6" }}
                >
                    <div className="text-white font-medium text-sm">
                        {tikTokUsername || link.label}
                    </div>
                </div>

                {/* Container del embed */}
                <div className="tiktok-embed-container w-full relative bg-white p-4">
                    <blockquote
                        className="tiktok-embed"
                        cite={link.url}
                        data-video-id={tikTokVideoId}
                        style={{ width: "100%", minHeight: isExposedRoute ? "600px" : "300px" }}
                    >
                        <section>
                            {/* Contenido de fallback mientras carga */}
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-pulse">
                                        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                                        <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
                                        <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </blockquote>
                </div>

                {/* Overlay para capturar clicks */}
                <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={handleClick}
                    style={{ backgroundColor: 'transparent' }}
                />
            </div>
        );
    }

    // Si es TikTok pero está cargando
    if (isTikTok && isLoadingTikTok) {
        return (
            <div
                className="relative cursor-pointer rounded-lg shadow-md overflow-hidden p-8 text-center"
                style={{
                    backgroundColor: themeConfig.colors.profileBackground || "#ffffff",
                    minHeight: '300px'
                }}
                onClick={handleClick}
            >
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-4"></div>
                    <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                        Cargando TikTok...
                    </p>
                </div>
            </div>
        );
    }

    // Si es Instagram, usar embed directo
    if (isInstagram) {
        const embedUrl = getInstagramEmbedUrl(link.url);
        if (embedUrl) {
            return (
                <div
                    className="relative cursor-pointer rounded-lg shadow-md overflow-hidden"
                    style={{
                        backgroundColor: themeConfig.colors.profileBackground || "#ffffff",
                    }}
                >
                    <div className="instagram-embed">
                        <iframe
                            src={embedUrl}
                            width="100%"
                            height={isExposedRoute ? "700" : "400"}
                            loading="lazy"
                            title={link.label}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            style={{ pointerEvents: "none" }}
                        />
                    </div>
                    <div
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={handleClick}
                        style={{ backgroundColor: 'transparent' }}
                    />
                </div>
            );
        }
    }

    // Fallback para TikTok con error o otros tipos de posts
    return (
        <div
            onClick={handleClick}
            className="relative cursor-pointer rounded-lg shadow-md overflow-hidden transition-all duration-200 transform hover:scale-[1.02]"
        >
            {isTikTok ? (
                // Fallback especial para TikTok cuando no se puede cargar el embed
                <div className="bg-gradient-to-br from-black to-gray-900 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm truncate">
                                {link.label}
                            </h3>
                            <p className="text-gray-300 text-xs truncate mt-1">
                                {tikTokError ? "Ver en TikTok (embed no disponible)" : "Ver en TikTok"}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="bg-white bg-opacity-20 rounded-full p-2">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                        <div className="bg-white bg-opacity-10 rounded-full px-3 py-1 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 5v10l6-5-6-5z"/>
                            </svg>
                            <span className="text-white text-xs font-medium">Reproducir Video</span>
                        </div>
                    </div>
                </div>
            ) : (
                // Fallback para otros tipos de posts
                <div
                    className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-opacity-90 transition-colors duration-200"
                    style={{
                        backgroundColor: themeConfig.colors.profileBackground || "#ffffff",
                    }}
                >
                    <div className="flex-shrink-0">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: themeConfig.colors.accent || "#8b5cf6",
                            }}
                        >
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3
                            className="font-medium text-sm truncate"
                            style={{
                                color: themeConfig.colors.text,
                                fontFamily: themeConfig.fonts.primary,
                            }}
                        >
                            {link.label}
                        </h3>
                        <p
                            className="text-xs opacity-60 truncate mt-1"
                            style={{
                                color: themeConfig.colors.text,
                                fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary,
                            }}
                        >
                            Post • {link.url}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 opacity-70" style={{ color: themeConfig.colors.text }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}