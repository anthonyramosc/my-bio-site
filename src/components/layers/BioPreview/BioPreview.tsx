import { Instagram, Twitter, Mail, ExternalLink, Save } from 'lucide-react';
import { useBiositeContext } from '../../../context/BiositeContext';
import { useEffect, useState } from 'react';

const BioPreview = () => {
    const { 
        profileData, 
        selectedTheme, 
        selectedFont, 
        links,
        saveBiosite,
        loading
    } = useBiositeContext();
    
    // Local state to force re-render on theme or font changes
    const [themeKey, setThemeKey] = useState<number>(0);
    
    // Update the key when theme or font changes to force re-render
    useEffect(() => {
        setThemeKey(prev => prev + 1);
    }, [selectedTheme, selectedFont, profileData, links]);
    
    // Get style settings from the selected theme
    const colors = selectedTheme?.config?.colors || {
        primary: '#4c1d95',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: '#ffffff',
        text: '#374151',
        profileBackground: '#ffffff'
    };
    
    // Get font family
    const fontFamily = selectedFont?.family || 'sans-serif';
    
    // Handle save biosite
    const handleSave = () => {
        saveBiosite();
    };
    
    return (
        <div className="w-full h-full flex flex-col pt-8">
            {/* Save Button */}
            <div className="flex justify-end mb-4 px-4">
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    } text-white transition-colors`}
                >
                    <Save size={16} />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>
            
            {/* Preview Card */}
            <div className="flex justify-center">
                <div 
                    className="relative max-w-xs w-full rounded-2xl overflow-hidden"
                    style={{ backgroundColor: colors.background, color: colors.text }}
                >
                    <div 
                        className="h-28 w-full" 
                        style={{ 
                            background: `linear-gradient(to bottom, ${colors.primary}, ${colors.secondary})` 
                        }}
                    ></div>
                    <div className="absolute top-16 left-0 right-0 flex justify-center">
                        <div 
                            className="rounded-full h-24 w-24 border-4 flex items-center justify-center overflow-hidden"
                            style={{ borderColor: colors.background }}
                        >
                            {profileData.avatarUrl ? (
                                <img 
                                    src={profileData.avatarUrl} 
                                    alt="Profile" 
                                    className="h-full w-full object-cover" 
                                />
                            ) : (
                                <div 
                                    className="h-full w-full flex items-center justify-center"
                                    style={{ backgroundColor: colors.accent }}
                                >
                                    <span style={{ 
                                        color: colors.primary,
                                        fontFamily
                                    }}>
                                        {profileData.name.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pt-16 px-4 pb-4 text-center">
                        <h2 
                            className="font-bold text-lg"
                            style={{ fontFamily, color: colors.text }}
                        >
                            {profileData.name.toUpperCase()}
                        </h2>
                        <p 
                            className="text-sm"
                            style={{ fontFamily, color: colors.text }}
                        >
                            {profileData.description}
                        </p>
                        
                        <div className="flex justify-center space-x-4 my-4">
                            <a href="#" style={{ color: colors.primary }}>
                                <Instagram size={18} />
                            </a>
                            <a href="#" style={{ color: colors.primary }}>
                                <Twitter size={18} />
                            </a>
                            <a href="#" style={{ color: colors.primary }}>
                                <Mail size={18} />
                            </a>
                        </div>
                        
                        {/* Links */}
                        <div className="space-y-2 mb-4">
                            {links.map((link) => (
                                <a 
                                    key={link.id} 
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg p-3 flex items-center justify-between block hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: colors.accent, color: colors.primary }}
                                >
                                    <span style={{ fontFamily }}>{link.label}</span>
                                    <ExternalLink size={14} />
                                </a>
                            ))}
                            
                            {links.length === 0 && (
                                <div 
                                    className="rounded-lg p-3"
                                    style={{ 
                                        backgroundColor: colors.accent,
                                        color: colors.primary,
                                        fontFamily
                                    }}
                                >
                                    <p className="text-sm text-center">Add links in the Links section</p>
                                </div>
                            )}
                        </div>
                        
                        <div 
                            className="mt-4 rounded-lg p-3 mb-2"
                            style={{ 
                                backgroundColor: colors.accent,
                                color: colors.primary,
                                opacity: 0.8,
                                fontFamily
                            }}
                        >
                            <p className="text-sm">{profileData.site}</p>
                        </div>
                        
                        <div className="mt-6 text-xs absolute bottom-2 right-2 opacity-50">
                            <span>biosite</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BioPreview;
