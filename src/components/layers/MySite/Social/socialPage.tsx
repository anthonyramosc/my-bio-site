import { useState } from 'react';
import { ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Mock SVG icons (replace with your actual imports)
import instagramIcon from '../../../../assets/icons/instagram.svg';
import discordIcon from '../../../../assets/icons/discord.svg';
import amazonIcon from '../../../../assets/icons/amazon.svg';
import gmailIcon from '../../../../assets/icons/gmail.svg';
import facebookIcon from '../../../../assets/icons/facebook.svg';
import linkdlIcon from '../../../../assets/icons/linkdl.svg';
import musicIcon from '../../../../assets/icons/music.svg';
import onlyfansIcon from '../../../../assets/icons/onlyfans.svg';
import pinterestIcon from '../../../../assets/icons/pinterest.svg';
import spotifyIcon from '../../../../assets/icons/spottufy.svg';
import snapchatIcon from '../../../../assets/icons/snapchat.svg';
import telegramIcon from '../../../../assets/icons/telegram.svg';
import threadsIcon from '../../../../assets/icons/threads.svg';
import tiktokIcon from '../../../../assets/icons/tiktok.svg';
import tumblrIcon from '../../../../assets/icons/tumblr.svg';
import twitchIcon from '../../../../assets/icons/twitch.svg';
import whatsappIcon from '../../../../assets/icons/whatsapp.svg';
import xIcon from '../../../../assets/icons/X.svg';
import youtubeIcon from '../../../../assets/icons/youtube.svg';

// Social media icons data with SVG imports
const socialMediaPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: instagramIcon, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'tiktok', name: 'TikTok', icon: tiktokIcon, color: 'bg-black' },
    { id: 'twitter', name: 'Twitter/X', icon: xIcon, color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', icon: youtubeIcon, color: 'bg-red-600' },
    { id: 'facebook', name: 'Facebook', icon: facebookIcon, color: 'bg-blue-600' },
    { id: 'twitch', name: 'Twitch', icon: twitchIcon, color: 'bg-purple-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: linkdlIcon, color: 'bg-blue-700' },
    { id: 'snapchat', name: 'Snapchat', icon: snapchatIcon, color: 'bg-yellow-400' },
    { id: 'threads', name: 'Threads', icon: threadsIcon, color: 'bg-black' },
    { id: 'email', name: 'Email', icon: gmailIcon, color: 'bg-gray-600' },
    { id: 'pinterest', name: 'Pinterest', icon: pinterestIcon, color: 'bg-red-500' },
    { id: 'spotify', name: 'Spotify', icon: spotifyIcon, color: 'bg-green-500' },
    { id: 'apple-music', name: 'Apple Music', icon: musicIcon, color: 'bg-gray-800' },
    { id: 'discord', name: 'Discord', icon: discordIcon, color: 'bg-indigo-600' },
    { id: 'tumblr', name: 'Tumblr', icon: tumblrIcon, color: 'bg-blue-800' },
    { id: 'whatsapp', name: 'WhatsApp', icon: whatsappIcon, color: 'bg-green-600' },
    { id: 'telegram', name: 'Telegram', icon: telegramIcon, color: 'bg-blue-500' },
    { id: 'amazon', name: 'Amazon', icon: amazonIcon, color: 'bg-orange-400' },
    { id: 'onlyfans', name: 'OnlyFans', icon: onlyfansIcon, color: 'bg-blue-500' }
];

interface SocialLink {
    id: string;
    name: string;
    icon: string;
    color: string;
    url?: string;
}

const SocialPage = () => {
    const [selectedSocials, setSelectedSocials] = useState<SocialLink[]>([]);
    const [editingPlatform, setEditingPlatform] = useState<SocialLink | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1);
    };

    const handlePlatformSelect = (platform: SocialLink) => {
        // Check if already selected
        const existingLink = selectedSocials.find(link => link.name === platform.name);
        if (existingLink) {
            // Remove if already selected
            setSelectedSocials(prev => prev.filter(link => link.name !== platform.name));
        } else {
            // Show input form
            setEditingPlatform(platform);
            setUrlInput('');
        }
    };

    const handleSaveLink = () => {
        if (editingPlatform && urlInput.trim()) {
            const newLink: SocialLink = {
                id: editingPlatform.id + '_' + Date.now(),
                name: editingPlatform.name,
                url: urlInput.trim(),
                icon: editingPlatform.icon,
                color: editingPlatform.color
            };

            setSelectedSocials(prev => [...prev, newLink]);
            setEditingPlatform(null);
            setUrlInput('');
        }
    };

    const handleCancelEdit = () => {
        setEditingPlatform(null);
        setUrlInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveLink();
        }
        if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen py-8">
            <div className="w-full max-w-2xl p-4 rounded-xl shadow-lg relative bg-[#181818]">
                {/* Header y Botones de acción */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={16} className="mr-2" />
                        Social
                    </button>
                </div>

                {/* URL Input Form - Shows when editing */}
                {editingPlatform && (
                    <div className="mb-6  rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 ${editingPlatform.color} rounded-full flex items-center justify-center p-1.5`}>
                                    <img
                                        src={editingPlatform.icon}
                                        alt={editingPlatform.name}
                                        className="w-full h-full object-contain filter brightness-0 invert"
                                    />
                                </div>
                                <span className="text-white text-sm">{editingPlatform.name}</span>
                            </div>
                            <button
                                onClick={handleCancelEdit}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Add handle or URL"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none placeholder-gray-500"
                            autoFocus
                        />

                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleSaveLink}
                                disabled={!urlInput.trim()}
                                className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Text */}
                <div className="mb-6 flex justify-between items-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                        ADD OR REMOVE SOCIAL LINKS
                    </p>
                    <p className="text-gray-400 text-xs">
                        {selectedSocials.length} / 8
                    </p>
                </div>

                {/* Platform Grid */}
                <div className="grid grid-cols-4 gap-4">
                    {socialMediaPlatforms.map((platform) => {
                        const isSelected = selectedSocials.some(link => link.name === platform.name);

                        return (

                                <button
                                    key={platform.id}
                                    onClick={() => handlePlatformSelect(platform)}
                                    className="w-9 h-9 bg-[#2a2a2a] rounded-full flex items-center justify-center p-2.5 hover:bg-[#3a3a3a] transition-colors relative"
                                >
                                    <img
                                        src={platform.icon}
                                        alt={platform.name}
                                        className="w-full h-full object-contain filter brightness-0 invert opacity-70"
                                    />
                                    {isSelected && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                            <X size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>

                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SocialPage;