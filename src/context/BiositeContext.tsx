import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../service/api';
import { useAuthContext } from '../hooks/useAuthContext';
import type { NotificationType } from '../components/common/Notification.types';

// Types
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

interface ThemeCategory {
  id: string;
  name: string;
  isDark: boolean;
  isAnimated: boolean;
}

interface ProfileData {
  name: string;
  description: string;
  site: string;
  avatarUrl: string;
}

interface Link {
  id: string;
  label: string;
  url: string;
  icon: string;
}

interface BiositeData {
  id?: string;
  themeId?: string;
  title?: string;
  description?: string;
  slug?: string;
  avatarImage?: string;
  fonts?: string;
  links?: Link[];
}

interface BiositeContextType {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  selectedTheme: CityTheme | null;
  setSelectedTheme: React.Dispatch<React.SetStateAction<CityTheme | null>>;
  selectedFont: ThemeFont | null;
  setSelectedFont: React.Dispatch<React.SetStateAction<ThemeFont | null>>;
  categories: ThemeCategory[];
  cityThemes: CityTheme[];
  fonts: ThemeFont[];
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  biositeId: string | null;
  loading: boolean;
  error: string | null;
  notification: { type: NotificationType, message: string };
  showNotification: (type: NotificationType, message: string) => void;
  clearNotification: () => void;
  saveBiosite: () => Promise<void>;
  applyTheme: (cityName: string) => Promise<void>;
  applyCustomTheme: (config: ThemeConfig) => Promise<void>;
  showStyleEditor: boolean;
  setShowStyleEditor: React.Dispatch<React.SetStateAction<boolean>>;
}

const BiositeContext = createContext<BiositeContextType | undefined>(undefined);

export const BiositeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log("BiositeProvider initialized");
    const { userId } = useAuthContext();
    console.log("UserId from AuthContext:", userId);
    
    // State
    const [profileData, setProfileData] = useState<ProfileData>({
      name: 'User',
      description: 'Bio Description',
      site: 'website.com',
      avatarUrl: '',
    });
  
  const [selectedTheme, setSelectedTheme] = useState<CityTheme | null>(null);
  const [selectedFont, setSelectedFont] = useState<ThemeFont | null>(null);
  const [categories, setCategories] = useState<ThemeCategory[]>([]);
  const [cityThemes, setCityThemes] = useState<CityTheme[]>([]);
  const [fonts, setFonts] = useState<ThemeFont[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [biositeId, setBiositeId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showStyleEditor, setShowStyleEditor] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | ''; message: string }>({
    type: '',
    message: ''
  });
  
  // Load biosite data
  useEffect(() => {
    const loadBiositeData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Load user's biosite
        const biosites = await api.get<BiositeData[]>(`/biosites/user/${userId}`).then(res => res.data);
        if (biosites && biosites.length > 0) {
          const biosite = biosites[0];
          setBiositeId(biosite.id ?? null);
          
          // Set profile data
          setProfileData({
            name: biosite.title || 'User',
            description: biosite.description || 'Bio Description',
            site: biosite.slug || 'website.com',
            avatarUrl: biosite.avatarImage || '',
          });
          
          // Load links if any
          if (biosite.links) {
            setLinks(biosite.links);
          }
          
          // Load theme if available
          if (biosite.themeId) {
            const theme = await api.get(`/themes/${biosite.themeId}`).then(res => res.data);
            if (theme) {
              setSelectedTheme({
                name: theme.name,
                config: theme.config,
                previewUrl: theme.previewUrl
              });
            }
          }
        }
        
        // Load theme categories, city themes, and fonts
        const [categoriesData, cityThemesData, fontsData] = await Promise.all([
          api.get<ThemeCategory[]>('/themes/categories').then(res => res.data),
          api.get<CityTheme[]>('/themes/cities').then(res => res.data),
          api.get<ThemeFont[]>('/themes/fonts').then(res => res.data)
        ]);
        
        setCategories(categoriesData);
        setCityThemes(cityThemesData);
        setFonts(fontsData);
        
        // Pre-select first font if available
        if (fontsData && fontsData.length > 0) {
          setSelectedFont(fontsData[0]);
        }
      } catch (err) {
        console.error('Error loading biosite data:', err);
        setError('Error loading your biosite. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBiositeData();
  }, [userId]);
  
  // Save biosite to backend
  const saveBiosite = async () => {
    if (!biositeId) {
      showNotification('error', 'No biosite to save. Please create one first.');
      return;
    }
    
    setLoading(true);
    try {
      const updateData: BiositeData = {
        title: profileData.name,
        description: profileData.description,
        slug: profileData.site,
        avatarImage: profileData.avatarUrl,
        links: links, // Include all current links in the update
      };
      
      if (selectedTheme) {
        // Try to find an existing theme with the same name
        const existingTheme = await api.get<{id: string}[]>(`/themes?name=${selectedTheme.name}`).then(res => {
          return res.data && res.data.length > 0 ? res.data[0] : null;
        });
        
        updateData.themeId = existingTheme ? existingTheme.id : undefined;
        
        // If no existing theme found, create a new one based on the selected theme
        if (!existingTheme && selectedTheme.config) {
          const newTheme = await api.post<{id: string}>('/themes/custom', selectedTheme.config)
            .then(res => res.data);
          
          if (newTheme && newTheme.id) {
            updateData.themeId = newTheme.id;
          }
        }
      }
      
      if (selectedFont) {
        updateData.fonts = selectedFont.family;
      }
      
      await api.patch(`/biosites/${biositeId}`, updateData);
      setError(null);
      showNotification('success', 'Your biosite has been saved successfully!');
    } catch (err) {
      console.error('Error saving biosite:', err);
      setError('Failed to save your changes. Please try again.');
      showNotification('error', 'Failed to save your changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply theme from city preset
  const applyTheme = async (cityName: string) => {
    setLoading(true);
    try {
      // Find the theme in city themes
      const theme = cityThemes.find(theme => theme.name === cityName);
      if (!theme) {
        setError('Theme not found');
        showNotification('error', 'Theme not found');
        return;
      }
      
      // Update the selected theme in state immediately for preview
      setSelectedTheme(theme);
      
      // Create a theme based on the city preset on the backend
      const response = await api.post<{id: string}>(`/themes/cities/${cityName}`).then(res => res.data);
      
      if (biositeId && response.id) {
        // Update the biosite with the new theme
        await api.patch(`/biosites/${biositeId}`, {
          themeId: response.id,
          fonts: selectedFont?.family
        });
        
        showNotification('success', `Applied ${cityName} theme successfully`);
      }
    } catch (err) {
      console.error('Error applying theme:', err);
      setError('Failed to apply theme. Please try again.');
      showNotification('error', 'Failed to apply theme. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply custom theme
  const applyCustomTheme = async (config: ThemeConfig) => {
    setLoading(true);
    try {
      // Create a custom theme
      const response = await api.post<{id: string}>('/themes/custom', config).then(res => res.data);
      
      if (biositeId && response.id) {
        // Update the biosite with the custom theme
        await api.patch(`/biosites/${biositeId}`, {
          themeId: response.id
        });
        
        // Update selected theme in state
        setSelectedTheme({
          name: 'Custom',
          config: config,
          previewUrl: ''
        });
      }
    } catch (err) {
      console.error('Error applying custom theme:', err);
      setError('Failed to apply custom theme. Please try again.');
      showNotification('error', 'Failed to apply custom theme');
    } finally {
      setLoading(false);
    }
  };
  
  // Show notification
  const showNotification = (type: 'success' | 'error' | '', message: string) => {
    setNotification({ type, message });
    
    // Auto-clear notification after 3 seconds
    setTimeout(() => {
      clearNotification();
    }, 3000);
  };
  
  // Clear notification
  const clearNotification = () => {
    setNotification({ type: '', message: '' });
  };
  
  const value = {
    profileData,
    setProfileData,
    selectedTheme,
    setSelectedTheme,
    selectedFont,
    setSelectedFont,
    categories,
    cityThemes,
    fonts,
    links,
    setLinks,
    biositeId,
    loading,
    error,
    notification,
    showNotification,
    clearNotification,
    saveBiosite,
    applyTheme,
    applyCustomTheme,
    showStyleEditor,
    setShowStyleEditor
  };
  
  return <BiositeContext.Provider value={value}>{children}</BiositeContext.Provider>;
};

export const useBiositeContext = () => {
  const context = useContext(BiositeContext);
  if (context === undefined) {
    throw new Error('useBiositeContext must be used within a BiositeProvider');
  }
  return context;
};
