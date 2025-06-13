import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useBiositeContext } from '../../../../context/BiositeContext';

const StyleEditorContent: React.FC = () => {
  const { 
    categories,
    cityThemes,
    fonts,
    selectedTheme,
    setSelectedTheme,
    selectedFont, 
    setSelectedFont,
    applyTheme,
    applyCustomTheme,
    loading,
    error
  } = useBiositeContext();

  const [selectedCategory, setSelectedCategory] = useState<string>('dark');
  const [selectedCity, setSelectedCity] = useState<string | null>(selectedTheme?.name || null);
  const [showCustomBuilder, setShowCustomBuilder] = useState<boolean>(false);

  // Handle apply theme with immediate UI update
  const handleApplyTheme = async () => {
    if (!selectedCity) return;
    
    // Find the selected city theme for immediate UI update
    const selectedThemeConfig = cityThemes.find(theme => theme.name === selectedCity);
    if (selectedThemeConfig) {
      // Apply the theme immediately to the context for real-time preview
      applyTheme(selectedCity);
    }
  };

  // Handle font selection with immediate preview update
  const handleFontSelect = (font: any) => {
    setSelectedFont(font);
  };

  // Filter city themes by category
  const filteredCityThemes = cityThemes.filter(city => {
    if (selectedCategory === 'dark') return city.config.isDark === true;
    if (selectedCategory === 'light') return city.config.isDark === false;
    if (selectedCategory === 'animated') return city.config.isAnimated === true;
    return false; // Don't show any city themes for custom category
  });
  
  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}
      
      {/* Theme Categories */}
      <div className="mb-6">
        <h4 className="text-gray-300 text-xs font-medium mb-3 uppercase">
          Theme Type
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`py-2 px-3 text-sm rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#2a2a2a] text-white font-medium'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
              }`}
              onClick={() => {
                setSelectedCategory(category.id);
                if (category.id === 'custom') {
                  setShowCustomBuilder(true);
                } else {
                  setShowCustomBuilder(false);
                }
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* City-based themes */}
      {selectedCategory !== 'custom' && (
        <div className="mb-6">
          <h4 className="text-gray-300 text-xs font-medium mb-3 uppercase">
            Select Theme
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {filteredCityThemes.map((city) => (
              <button
                key={city.name}
                className={`p-3 rounded-lg transition-all transform hover:-translate-y-1 overflow-hidden ${
                  selectedCity === city.name
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
                onClick={() => {
                setSelectedCity(city.name);
                // Apply theme immediately for real-time preview
                if (selectedCategory !== 'custom') {
                  setSelectedTheme(city);
                }
              }}
                style={{
                  backgroundColor: city.config.colors.background,
                  color: city.config.colors.text || '#FFFFFF'
                }}
              >
                <div 
                  className="w-10 h-10 mx-auto rounded-full mb-2"
                  style={{ 
                    backgroundColor: city.config.colors.primary,
                  }}
                ></div>
                <div className="text-center text-sm">{city.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Font Selection */}
      {selectedCategory !== 'custom' && (
        <div className="mb-6">
          <h4 className="text-gray-300 text-xs font-medium mb-3 uppercase">
            Select Font
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {fonts.map((font) => (
              <button
                key={font.id}
                className={`p-2 rounded-lg bg-[#1a1a1a] transition-colors ${
                  selectedFont?.id === font.id
                    ? 'border border-blue-500'
                    : 'hover:bg-[#252525]'
                }`}
                onClick={() => {
                  handleFontSelect(font);
                  // If we have a theme, update it with the new font for real-time preview
                  if (selectedTheme) {
                    const updatedTheme = { 
                      ...selectedTheme,
                      config: {
                        ...selectedTheme.config,
                        fonts: {
                          ...selectedTheme.config.fonts,
                          primary: font.family
                        }
                      }
                    };
                    setSelectedTheme(updatedTheme);
                  }
                }}
              >
                <div className="text-gray-300 text-xl" style={{ fontFamily: font.family }}>
                  {font.name.charAt(0).toUpperCase()}{font.name.charAt(1).toUpperCase()}
                </div>
                <div className="text-gray-500 text-xs mt-1">{font.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end">
        <button
          onClick={handleApplyTheme}
          disabled={loading || !selectedCity}
          className={`px-4 py-2 rounded-lg flex items-center space-x-1 ${
            loading || !selectedCity
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
        >
          <Check size={16} />
          <span>{loading ? 'Applying...' : 'Apply Theme'}</span>
        </button>
      </div>
    </div>
  );
};

export default StyleEditorContent;
