import React from 'react';
import {
    Users,
    Globe,
    Link2 as LinkIcon,
    BarChart3,
    TrendingUp,
    ExternalLink
} from 'lucide-react';
import type { LinkData, LinkImageDisplayProps } from '../../../interfaces/AdminData.ts';
import { socialMediaPlatforms } from "../../../media/socialPlataforms.ts";

const placeholderLinkImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f8fafc' rx='8' stroke='%23e2e8f0' stroke-width='1'/%3E%3Cpath d='M13 13h14v14H13z' fill='%23e2e8f0'/%3E%3Ccircle cx='18' cy='18' r='2.5' fill='%239ca3af'/%3E%3Cpath d='M15 29l6-4 6 4H15z' fill='%239ca3af'/%3E%3C/svg%3E";

// Icon path mapping utility
const getIconPath = (iconIdentifier: string, link: LinkData): string | null => {
    if (!iconIdentifier) return null;

    if (iconIdentifier.startsWith('http') || iconIdentifier.startsWith('/assets/icons/')) {
        return iconIdentifier;
    }

    const cleanIdentifier = iconIdentifier.toLowerCase().trim();

    const iconPathMap: { [key: string]: string } = {
        'instagram': '/assets/icons/instagram.svg',
        'tiktok': '/assets/icons/tiktok.svg',
        'twitter': '/assets/icons/X.svg',
        'x': '/assets/icons/X.svg',
        'youtube': '/assets/icons/youtube.svg',
        'facebook': '/assets/icons/facebook.svg',
        'twitch': '/assets/icons/twitch.svg',
        'linkedin': '/assets/icons/linkdl.svg',
        'snapchat': '/assets/icons/snapchat.svg',
        'threads': '/assets/icons/threads.svg',
        'gmail': '/assets/icons/gmail.svg',
        'email': '/assets/icons/gmail.svg',
        'pinterest': '/assets/icons/pinterest.svg',
        'spotify': '/assets/icons/spottufy.svg',
        'discord': '/assets/icons/discord.svg',
        'tumblr': '/assets/icons/tumblr.svg',
        'whatsapp': '/assets/icons/whatsapp.svg',
        'telegram': '/assets/icons/telegram.svg',
        'amazon': '/assets/icons/amazon.svg',
        'onlyfans': '/assets/icons/onlyfans.svg',
        'appstore': '/assets/icons/appstore.svg',
        'googleplay': '/assets/icons/googleplay.svg'
    };

    if (iconPathMap[cleanIdentifier]) {
        return iconPathMap[cleanIdentifier];
    }

    const urlLower = link.url?.toLowerCase() || '';
    const labelLower = link.label?.toLowerCase() || '';

    if (urlLower.includes('instagram.com') || labelLower.includes('instagram')) {
        return '/assets/icons/instagram.svg';
    }
    if (urlLower.includes('tiktok.com') || labelLower.includes('tiktok')) {
        return '/assets/icons/tiktok.svg';
    }
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com') || labelLower.includes('twitter') || labelLower.includes(' x ')) {
        return '/assets/icons/X.svg';
    }
    if (urlLower.includes('youtube.com') || labelLower.includes('youtube')) {
        return '/assets/icons/youtube.svg';
    }
    if (urlLower.includes('facebook.com') || labelLower.includes('facebook')) {
        return '/assets/icons/facebook.svg';
    }
    if (urlLower.includes('twitch.tv') || labelLower.includes('twitch')) {
        return '/assets/icons/twitch.svg';
    }
    if (urlLower.includes('linkedin.com') || labelLower.includes('linkedin')) {
        return '/assets/icons/linkdl.svg';
    }
    if (urlLower.includes('snapchat.com') || labelLower.includes('snapchat')) {
        return '/assets/icons/snapchat.svg';
    }
    if (urlLower.includes('spotify.com') || labelLower.includes('spotify')) {
        return '/assets/icons/spottufy.svg';
    }
    if (urlLower.includes('discord') || labelLower.includes('discord')) {
        return '/assets/icons/discord.svg';
    }
    if (urlLower.includes('whatsapp.com') || urlLower.includes('api.whatsapp.com') || labelLower.includes('whatsapp')) {
        return '/assets/icons/whatsapp.svg';
    }
    if (urlLower.includes('telegram') || labelLower.includes('telegram')) {
        return '/assets/icons/telegram.svg';
    }
    if (urlLower.includes('pinterest.com') || labelLower.includes('pinterest')) {
        return '/assets/icons/pinterest.svg';
    }
    if (urlLower.includes('apps.apple.com') || labelLower.includes('app store')) {
        return '/assets/icons/appstore.svg';
    }
    if (urlLower.includes('play.google.com') || labelLower.includes('google play')) {
        return '/assets/icons/googleplay.svg';
    }
    if (urlLower.includes('amazon.com') || labelLower.includes('amazon')) {
        return '/assets/icons/amazon.svg';
    }
    if (urlLower.includes('gmail.com') || labelLower.includes('gmail') || labelLower.includes('email')) {
        return '/assets/icons/gmail.svg';
    }

    return null;
};

// Platform name mapping utility
const getPlatformName = (iconPath: string): string => {
    const platformMap: {[key: string]: string} = {
        '/assets/icons/instagram.svg': 'Instagram',
        '/assets/icons/tiktok.svg': 'TikTok',
        '/assets/icons/X.svg': 'X (Twitter)',
        '/assets/icons/youtube.svg': 'YouTube',
        '/assets/icons/facebook.svg': 'Facebook',
        '/assets/icons/twitch.svg': 'Twitch',
        '/assets/icons/linkdl.svg': 'LinkedIn',
        '/assets/icons/snapchat.svg': 'Snapchat',
        '/assets/icons/threads.svg': 'Threads',
        '/assets/icons/gmail.svg': 'Gmail',
        '/assets/icons/pinterest.svg': 'Pinterest',
        '/assets/icons/spottufy.svg': 'Spotify',
        '/assets/icons/discord.svg': 'Discord',
        '/assets/icons/tumblr.svg': 'Tumblr',
        '/assets/icons/whatsapp.svg': 'WhatsApp',
        '/assets/icons/telegram.svg': 'Telegram',
        '/assets/icons/amazon.svg': 'Amazon',
        '/assets/icons/onlyfans.svg': 'OnlyFans',
        '/assets/icons/appstore.svg': 'App Store',
        '/assets/icons/googleplay.svg': 'Google Play'
    };
    return platformMap[iconPath] || 'Platform';
};

// Link type categorization utility
export const getLinkType = (link: LinkData): { type: string; color: string; icon: any } => {
    const urlLower = link.url?.toLowerCase() || '';
    const labelLower = link.label?.toLowerCase() || '';

    const socialPlatforms = [
        'instagram', 'tiktok', 'twitter', 'x.com', 'youtube', 'facebook',
        'twitch', 'linkedin', 'snapchat', 'threads', 'pinterest', 'discord', 'tumblr'
    ];

    if (socialPlatforms.some(platform => urlLower.includes(platform) || labelLower.includes(platform))) {
        return { type: 'Social', color: 'bg-blue-100 text-blue-800', icon: <Users className="w-3 h-3" /> };
    }

    if (urlLower.includes('whatsapp') || urlLower.includes('telegram') || urlLower.includes('gmail') || labelLower.includes('email')) {
        return { type: 'Comunicación', color: 'bg-green-100 text-green-800', icon: <LinkIcon className="w-3 h-3" /> };
    }

    if (urlLower.includes('apps.apple.com') || urlLower.includes('play.google.com') || labelLower.includes('app store') || labelLower.includes('google play')) {
        return { type: 'App Store', color: 'bg-purple-100 text-purple-800', icon: <Globe className="w-3 h-3" /> };
    }

    if (urlLower.includes('spotify') || urlLower.includes('music') || labelLower.includes('music') || labelLower.includes('audio')) {
        return { type: 'Música', color: 'bg-pink-100 text-pink-800', icon: <BarChart3 className="w-3 h-3" /> };
    }

    if (urlLower.includes('amazon') || urlLower.includes('shop') || labelLower.includes('tienda')) {
        return { type: 'Comercio', color: 'bg-orange-100 text-orange-800', icon: <TrendingUp className="w-3 h-3" /> };
    }

    return { type: 'Enlace', color: 'bg-gray-100 text-gray-800', icon: <ExternalLink className="w-3 h-3" /> };
};

// Shared LinkImageDisplay component
export const LinkImageDisplay: React.FC<LinkImageDisplayProps> = ({ link, size = 'md' }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(false);
    const [iconError, setIconError] = React.useState(false);

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-14 h-14',
        lg: 'w-18 h-18'
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageLoadStart = () => {
        setImageLoading(true);
        setImageError(false);
    };

    const handleIconError = () => {
        setIconError(true);
    };

    const getInitial = (label: string): string => {
        if (!label) return 'L';
        return label.charAt(0).toUpperCase();
    };

    if (link.image && !imageError) {
        return (
            <div className={`${sizeClasses[size]} rounded-lg bg-white overflow-hidden flex-shrink-0 border shadow-sm`}>
                {imageLoading && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                )}
                <img
                    src={link.image}
                    alt={`${link.label || 'Link'} custom image`}
                    className="w-full h-full object-cover"
                    onLoadStart={handleImageLoadStart}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{
                        display: imageError ? 'none' : 'block'
                    }}
                />
                {imageError && (
                    <div className="w-full h-full">
                        {(() => {
                            const iconPath = getIconPath(link.icon || '', link);
                            if (iconPath && !iconError) {
                                return (
                                    <img
                                        src={iconPath}
                                        alt={`${getPlatformName(iconPath)} icon`}
                                        className="w-full h-full object-contain p-2"
                                        onError={handleIconError}
                                    />
                                );
                            }
                            return (
                                <img
                                    src={placeholderLinkImage}
                                    alt="Link placeholder"
                                    className="w-full h-full object-cover"
                                />
                            );
                        })()}
                    </div>
                )}
            </div>
        );
    }

    const iconPath = getIconPath(link.icon || '', link);
    const platform = socialMediaPlatforms.find(p =>
        p.name.toLowerCase() === link.label.toLowerCase() ||
        link.label.toLowerCase().includes(p.id.toLowerCase()) ||
        p.id.toLowerCase() === link.label.toLowerCase()
    );

    if (iconPath && !iconError) {
        return (
            <div className={`${sizeClasses[size]} rounded-lg bg-white overflow-hidden flex-shrink-0 border shadow-sm`}>
                <img
                    src={platform?.icon || iconPath}
                    alt={`${getPlatformName(iconPath)} icon`}
                    className="w-full h-full object-contain p-2"
                    onError={handleIconError}
                />
            </div>
        );
    }

    if (link.icon && !link.icon.includes('/') && !link.icon.includes('.')) {
        return (
            <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center text-lg font-semibold text-blue-700`}>
                {link.icon}
            </div>
        );
    }

    const initial = getInitial(link.label || 'Link');
    const bgColors = [
        'bg-gradient-to-br from-red-100 to-red-200 text-red-700 border-red-200',
        'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-blue-200',
        'bg-gradient-to-br from-green-100 to-green-200 text-green-700 border-green-200',
        'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 border-purple-200',
        'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-200',
        'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700 border-pink-200'
    ];

    const colorIndex = link.label ? link.label.charCodeAt(0) % bgColors.length : 0;

    return (
        <div className={`${sizeClasses[size]} rounded-lg border flex items-center justify-center text-lg font-semibold ${bgColors[colorIndex]}`}>
            {initial}
        </div>
    );
};