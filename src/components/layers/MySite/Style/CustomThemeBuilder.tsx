import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { X } from 'lucide-react';

interface ThemeColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text?: string;
  profileBackground?: string;
}

interface ThemeFont {
  id: string;
  name: string;
  family: string;
}

interface ThemeConfig {
  colors: ThemeColorConfig;
  fonts: {
    primary: string;
    secondary?: string;
  };
  isDark?: boolean;
  isAnimated?: boolean;
  cityName?: string;
}

interface CustomThemeBuilderProps {
  fonts: ThemeFont[];
  onSave: (config: ThemeConfig) => void;
  onCancel: () => void;
}

const CustomThemeBuilder: React.FC<CustomThemeBuilderProps> = ({ fonts, onSave, onCancel }) => {
  const [activeColorField, setActiveColorField] = useState<string | null>(null);
  
  // Default dark theme as starting point
  const [colors, setColors] = useState<ThemeColorConfig>({
    primary: '#121212',
    secondary: '#FFFFFF',
    accent: '#E0E0E0',
    background: '#1A1A1A',
    text: '#FFFFFF',
    profileBackground: '#FFFFFF'
  });
  
  const [selectedFont, setSelectedFont] = useState<string>(fonts.length > 0 ? fonts[0].id : 'roboto');
  const [isDark, setIsDark] = useState<boolean>(true);
  
  const handleColorChange = (color: any, field: keyof ThemeColorConfig) => {
    setColors(prev => ({
      ...prev,
      [field]: color.hex
    }));
  };
  
  const handleColorPickerToggle = (field: string | null) => {
    setActiveColorField(field);
  };
  
  const handleSave = () => {
    const selectedFontObj = fonts.find(f => f.id === selectedFont);
    
    const themeConfig: ThemeConfig = {
      colors,
      fonts: {
        primary: selectedFontObj?.family || 'Roboto, sans-serif',
      },
      isDark,
      isAnimated: false,
    };
    
    onSave(themeConfig);
  };
  
  return (
    <div className="bg-[#202020] rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-white font-semibold">Create Custom Theme</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      
      {/* Preview */}
      <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
        <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase">
          PREVIEW
        </h3>
        <div className="flex flex-col items-center p-4 rounded-lg" 
            style={{ backgroundColor: colors.primary, color: colors.text || '#FFFFFF' }}>
          <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center"
              style={{ backgroundColor: colors.profileBackground || colors.secondary, color: colors.primary }}>
            <span className="text-xl font-bold">AB</span>
          </div>
          <h3 className="text-lg mb-2">Your Name</h3>
          <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-2">
            {[1, 2, 3].map(item => (
              <div 
                key={item} 
                className="p-2 rounded text-center text-sm"
                style={{ backgroundColor: colors.accent, color: colors.primary }}
              >
                Link {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Color Selection */}
      <div className="mb-6">
        <h3 className="text-gray-300 text-sm font-medium mb-3 uppercase">
          COLORS
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="relative">
              <button 
                className="w-full p-3 rounded flex items-center justify-between bg-[#1a1a1a] hover:bg-[#252525]"
                onClick={() => handleColorPickerToggle(activeColorField === key ? null : key)}
              >
                <span className="text-gray-300 capitalize">{key}</span>
                <div 
                  className="w-6 h-6 rounded border border-gray-600"
                  style={{ backgroundColor: value }}
                />
              </button>
              
              {activeColorField === key && (
                <div className="absolute right-0 mt-2 z-10">
                  <div className="fixed inset-0" onClick={() => handleColorPickerToggle(null)} />
                  <div className="relative">
                    <SketchPicker
                      color={value}
                      onChange={(color) => handleColorChange(color, key as keyof ThemeColorConfig)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Font Selection */}
      <div className="mb-6">
        <h3 className="text-gray-300 text-sm font-medium mb-3 uppercase">
          FONT
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {fonts.map((font) => (
            <button
              key={font.id}
              className={`p-3 rounded bg-[#1a1a1a] transition-colors ${
                selectedFont === font.id
                  ? 'border border-blue-500'
                  : 'hover:bg-[#252525]'
              }`}
              onClick={() => setSelectedFont(font.id)}
            >
              <div className="text-gray-300 text-xl" style={{ fontFamily: font.family }}>
                {font.name.charAt(0).toUpperCase()}{font.name.charAt(1).toUpperCase()}
              </div>
              <div className="text-gray-500 text-xs mt-1">{font.name}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Theme Type */}
      <div className="mb-8">
        <h3 className="text-gray-300 text-sm font-medium mb-3 uppercase">
          THEME TYPE
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`py-2 px-4 rounded-lg transition-colors ${
              isDark
                ? 'bg-[#2a2a2a] text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
            }`}
            onClick={() => setIsDark(true)}
          >
            Dark
          </button>
          <button
            className={`py-2 px-4 rounded-lg transition-colors ${
              !isDark
                ? 'bg-[#2a2a2a] text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
            }`}
            onClick={() => setIsDark(false)}
          >
            Light
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Save Theme
        </button>
      </div>
    </div>
  );
};

export default CustomThemeBuilder;
