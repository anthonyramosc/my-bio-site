import type {BiositeThemeConfig} from "./Biosite.ts";

export interface ThemeCategory {
    id: string;
    name: string;
    isDark: boolean;
    isAnimated: boolean;
}

export interface FontOption {
    id: string;
    name: string;
    family: string;
}

export interface CityTheme {
    name: string;
    config: {
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
        };
        isDark: boolean;
        cityName: string;
    };
    previewUrl?: string;
}

export interface CreateCustomThemeRequest {
    name?: string;
    description?: string;
    config: BiositeThemeConfig;
    isActive: boolean;
}

export interface BiositeTheme {
    name: string;
    description?: string;
    previewUrl?: string;
    config: BiositeThemeConfig;
    isActive: boolean;
}

export interface UpdateThemeRequest {
    name: string;
    description?: string;
    previewUrl?: string;
    config: BiositeThemeConfig;
    isActive: boolean;
}

// Para el selector de themes en la UI
export interface ThemeOption {
    id: string;
    name: string;
    preview: string;
    config: BiositeThemeConfig;
    category: 'light' | 'dark' | 'animated' | 'custom' | 'city';
}

// Para la respuesta del API
export interface ThemesResponse {
    themes: BiositeTheme[];
    categories: ThemeCategory[];
    cityThemes: CityTheme[];
    fontOptions: FontOption[];
}