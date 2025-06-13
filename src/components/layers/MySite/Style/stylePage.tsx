import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import api from '../../../../service/api';
import CustomThemeBuilder from './CustomThemeBuilder';

// Type definitions
interface ThemeCategory {
  id: string;
  name: string;
  isDark: boolean;
  isAnimated: boolean;
}

interface ThemeFont {
  id: string;
  name: string;
  family: string;
}

interface ThemeColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text?: string;
  profileBackground?: string;
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

interface CityTheme {
  name: string;
  config: ThemeConfig;
  previewUrl: string;
}

// Preview component for the selected theme
const ThemePreview = ({ theme, font }: { theme: CityTheme | null, font: ThemeFont | null }) => {
  if (!theme) return null;
  
  const { colors } = theme.config;
  const fontFamily = font?.family || 'Roboto, sans-serif';
  
  return (
    <div className="mb-10 p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
      <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase">
        PREVIEW
      </h3>
      <div className="flex flex-col items-center p-6 rounded-lg shadow-lg" 
           style={{ backgroundColor: colors.primary, color: colors.text || '#FFFFFF' }}>
        <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center"
             style={{ backgroundColor: colors.profileBackground || colors.secondary, color: colors.primary }}>
          <span className="text-2xl font-bold" style={{ fontFamily }}>AB</span>
        </div>
        <h2 className="text-xl mb-2" style={{ fontFamily }}>Your Name</h2>
        <p className="text-sm mb-4 text-center" style={{ fontFamily }}>
          This is how your biosite will look with the {theme.name} theme
        </p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          {[1, 2, 3].map((item) => (
            <div 
              key={item} 
              className="p-3 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: colors.accent, 
                color: colors.primary,
                fontFamily 
              }}
            >
              Link {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StylePage = () => {
  const navigate = useNavigate();
  const { userId } = useAuthContext();
  
  // State for theme components
  const [categories, setCategories] = useState<ThemeCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('dark'); // Default to dark
  const [cityThemes, setCityThemes] = useState<CityTheme[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [fonts, setFonts] = useState<ThemeFont[]>([]);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<CityTheme | null>(null);
  const [selectedFontObj, setSelectedFontObj] = useState<ThemeFont | null>(null);
  const [biositeId, setBiositeId] = useState<string | null>(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState<boolean>(false);

  // Load theme data on component mount
  useEffect(() => {
    const fetchThemeData = async () => {
      setLoading(true);
      try {
        const [categoriesData, cityThemesData, fontsData] = await Promise.all([
          api.get<ThemeCategory[]>('/themes/categories').then(res => res.data),
          api.get<CityTheme[]>('/themes/cities').then(res => res.data),
          api.get<ThemeFont[]>('/themes/fonts').then(res => res.data)
        ]);
        
        setCategories(categoriesData);
        setCityThemes(cityThemesData);
        setFonts(fontsData);
        
        // Pre-select the dark category and first font
        if (fontsData && fontsData.length > 0) {
          setSelectedFont(fontsData[0].id);
          setSelectedFontObj(fontsData[0]);
        }
      } catch (err) {
        console.error('Error loading theme data:', err);
        setError('Error loading themes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchThemeData();
  }, []);

  // Apply theme
  const handleApplyTheme = async () => {
    if (!selectedCity && selectedCategory !== 'custom') {
      setError('Please select a theme');
      return;
    }

    setLoading(true);
    try {
      let themeId;
      
      // Load user's biosite if needed
      if (!biositeId) {
        const userBiosites = await api.get<{id: string}[]>(`/biosites/user`).then(res => res.data);
        if (userBiosites && userBiosites.length > 0) {
          setBiositeId(userBiosites[0].id);
        }
      }

      // Create a theme based on the city if needed
      if (selectedCity) {
        const response = await api.post<{id: string}>(`/themes/cities/${selectedCity}`).then(res => res.data);
        themeId = response.id;
      }

      // Update the biosite with the new theme if we have a biosite ID
      if (biositeId && themeId) {
        await api.patch(`/biosites/${biositeId}`, {
          themeId: themeId,
          // If we have a selected font, update that as well
          fonts: selectedFontObj?.family
        });
      }

      // Navigate back
      navigate(-1);
    } catch (err) {
      console.error('Error applying theme:', err);
      setError('Failed to apply theme. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  // Filter city themes based on the selected category
  const filteredCityThemes = cityThemes.filter(city => {
    if (selectedCategory === 'dark') return city.config.isDark === true;
    if (selectedCategory === 'light') return city.config.isDark === false;
    if (selectedCategory === 'animated') return city.config.isAnimated === true;
    return false; // Don't show any city themes for custom category
  });
  
  // Handle clicking on the Custom button
  const handleCustomClick = () => {
    setSelectedCategory('custom');
    setShowCustomBuilder(true);
    setSelectedCity(null);
    setSelectedTheme(null);
  };

  // Handle city selection - update the selected theme as well
  const handleCitySelect = (city: CityTheme) => {
    setSelectedCity(city.name);
    setSelectedTheme(city);
  };

  // Handle font selection
  const handleFontSelect = (font: ThemeFont) => {
    setSelectedFont(font.id);
    setSelectedFontObj(font);
  };
  
  // Handle custom theme save
  const handleSaveCustomTheme = async (config: ThemeConfig) => {
    setLoading(true);
    try {
      const response = await api.post<{id: string}>('/themes/custom', config).then(res => res.data);
      const themeId = response.id;
      
      // Load user's biosite if needed
      if (!biositeId) {
        const userBiosites = await api.get<{id: string}[]>(`/biosites/user`).then(res => res.data);
        if (userBiosites && userBiosites.length > 0) {
          setBiositeId(userBiosites[0].id);
        }
      }
      
      // Apply the theme to biosite
      if (biositeId && themeId) {
        await api.patch(`/biosites/${biositeId}`, {
          themeId: themeId
        });
        
        // Navigate back after successful application
        navigate(-1);
      }
    } catch (err) {
      console.error('Error saving custom theme:', err);
      setError('Failed to save custom theme. Please try again.');
    } finally {
      setLoading(false);
      setShowCustomBuilder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} className="mr-1" />
            <span className="text-xl font-semibold">Style</span>
          </button>
          
          {!showCustomBuilder && (
            <button
              onClick={handleApplyTheme}
              disabled={loading || (!selectedCity && selectedCategory !== 'custom')}
              className={`px-4 py-2 rounded-lg ${
                loading || (!selectedCity && selectedCategory !== 'custom')
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {loading ? 'Applying...' : 'Apply Theme'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        {showCustomBuilder ? (
          <CustomThemeBuilder 
            fonts={fonts}
            onSave={handleSaveCustomTheme}
            onCancel={() => setShowCustomBuilder(false)}
          />
        ) : (
          <>
            {/* Theme Categories */}
            <div className="mb-8">
              <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase">
                THEMES
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`py-2 px-4 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#2a2a2a] text-white'
                        : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      if (category.id === 'custom') {
                        handleCustomClick();
                      }
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Add the preview component */}
            {selectedTheme && (
              <ThemePreview theme={selectedTheme} font={selectedFontObj} />
            )}

            {/* City Themes - don't show for Custom category */}
            {selectedCategory !== 'custom' && (
              <div className="mb-10">
                <div className="grid grid-cols-3 gap-3">
                  {filteredCityThemes.map((city) => (
                    <button
                      key={city.name}
                      className={`p-4 rounded-lg transition-all transform hover:-translate-y-1 overflow-hidden ${
                        selectedCity === city.name
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() => handleCitySelect(city)}
                      style={{
                        backgroundColor: city.config.colors.background,
                        color: city.config.colors.text || '#FFFFFF'
                      }}
                    >
                      <div 
                        className="w-12 h-12 mx-auto rounded-full mb-2"
                        style={{ 
                          backgroundColor: city.config.colors.primary,
                        }}
                      ></div>
                      <div className="text-center">{city.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Font Selection */}
            {selectedCategory !== 'custom' && (
              <div>
                <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase">
                  FONTS
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      className={`p-4 rounded-lg bg-[#1a1a1a] transition-colors ${
                        selectedFont === font.id
                          ? 'border border-blue-500'
                          : 'hover:bg-[#252525]'
                      }`}
                      onClick={() => handleFontSelect(font)}
                    >
                      <div className="text-gray-300 text-2xl" style={{ fontFamily: font.family }}>
                        {font.name.charAt(0).toUpperCase()}{font.name.charAt(1).toUpperCase()}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">{font.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StylePage;
