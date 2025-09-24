import apiService from '../service/apiService';
import type {BiositeTheme, BiositeThemeConfig} from "../interfaces/Biosite.ts";
import {themesApi} from "../constants/EndpointsRoutes.ts";
import type {
    CreateCustomThemeRequest,
    CityTheme,
    ThemeCategory,
    FontOption,
    BiositeTheme as Theme,
    UpdateThemeRequest
} from '../interfaces/Themes.ts'

export const themeService = {
    // Obtener todos los temas



    getAllThemes: async (): Promise<Theme[]> => {
        try {
            const response = await apiService.getAll<Theme[]>(themesApi);
            return response || [];
        } catch (error) {
            console.error('Error fetching themes:', error);
            throw new Error('Failed to fetch themes');
        }
    },

    // Obtener tema por ID
    getThemeById: async (id: string): Promise<Theme | null> => {
        try {
            const response = await apiService.getById<Theme>(themesApi, id);
            return response;
        } catch (error) {
            console.error('Error fetching theme by ID:', error);
            return null;
        }
    },

    // Crear nuevo tema
    createTheme: async (themeData: CreateCustomThemeRequest): Promise<Theme | null> => {
        try {
            const response = await apiService.create<CreateCustomThemeRequest, Theme>(themesApi, themeData);
            return response;
        } catch (error) {
            console.error('Error creating theme:', error);
            throw new Error('Failed to create theme');
        }
    },

    // Actualizar tema
    updateTheme: async (id: string, themeData: UpdateThemeRequest): Promise<Theme | null> => {
        try {
            const response = await apiService.update<UpdateThemeRequest>(themesApi, id, themeData);
            return response;
        } catch (error) {
            console.error('Error updating theme:', error);
            throw new Error('Failed to update theme');
        }
    },

    // Eliminar tema
    deleteTheme: async (id: string): Promise<boolean> => {
        try {
            await apiService.delete(themesApi, id);
            return true;
        } catch (error) {
            console.error('Error deleting theme:', error);
            throw new Error('Failed to delete theme');
        }
    },

    // Obtener categorías de temas
    getThemeCategories: async (): Promise<ThemeCategory[]> => {
        try {
            const response = await apiService.getAll<ThemeCategory[]>(`${themesApi}/categories`);
            return response || [
                { id: 'light', name: 'Light', isDark: false, isAnimated: false },
                { id: 'dark', name: 'Dark', isDark: true, isAnimated: false },
                { id: 'animated', name: 'Animated', isDark: false, isAnimated: true },
                { id: 'custom', name: 'Custom', isDark: false, isAnimated: false }
            ];
        } catch (error) {
            console.error('Error fetching theme categories:', error);
            // Return default categories if API fails
            return [
                { id: 'light', name: 'Light', isDark: false, isAnimated: false },
                { id: 'dark', name: 'Dark', isDark: true, isAnimated: false },
                { id: 'animated', name: 'Animated', isDark: false, isAnimated: true },
                { id: 'custom', name: 'Custom', isDark: false, isAnimated: false }
            ];
        }
    },

    // Obtener temas de ciudades
    getCityThemes: async (): Promise<CityTheme[]> => {
        try {
            const response = await apiService.getAll<CityTheme[]>(`${themesApi}/cities`);
            return response || [];
        } catch (error) {
            console.error('Error fetching city themes:', error);
            // Return default city themes if API fails
            return [
                {
                    name: 'New York',
                    config: {
                        colors: {
                            primary: '#121212',
                            secondary: '#FFFFFF',
                            accent: '#E0E0E0',
                            background: '#1A1A1A',
                            text: '#FFFFFF',
                            profileBackground: '#FFFFFF'
                        },
                        fonts: { primary: 'Roboto' },
                        isDark: true,
                        cityName: 'New York'
                    }
                },
                {
                    name: 'Buenos Aires',
                    config: {
                        colors: {
                            primary: '#FF9800',
                            secondary: '#FFC107',
                            accent: '#FFEB3B',
                            background: '#FFF8E1',
                            text: '#212121',
                            profileBackground: '#FFECB3'
                        },
                        fonts: { primary: 'Playfair Display' },
                        isDark: false,
                        cityName: 'Buenos Aires'
                    }
                },
                {
                    name: 'Kyoto',
                    config: {
                        colors: {
                            primary: '#4A148C',
                            secondary: '#6A1B9A',
                            accent: '#9C27B0',
                            background: '#E1BEE7',
                            text: '#FFFFFF',
                            profileBackground: '#9575CD'
                        },
                        fonts: { primary: 'Lato' },
                        isDark: true,
                        cityName: 'Kyoto'
                    }
                },
                {
                    name: 'Vancouver',
                    config: {
                        colors: {
                            primary: '#607D8B',
                            secondary: '#78909C',
                            accent: '#B0BEC5',
                            background: '#ECEFF1',
                            text: '#263238',
                            profileBackground: '#CFD8DC'
                        },
                        fonts: { primary: 'Roboto' },
                        isDark: false,
                        cityName: 'Vancouver'
                    }
                },
                {
                    name: 'São Paulo',
                    config: {
                        colors: {
                            primary: '#8BC34A',
                            secondary: '#9CCC65',
                            accent: '#CDDC39',
                            background: '#F9FBE7',
                            text: '#33691E',
                            profileBackground: '#C5E1A5'
                        },
                        fonts: { primary: 'Open Sans' },
                        isDark: false,
                        cityName: 'São Paulo'
                    }
                },
                {
                    name: 'Copenhagen',
                    config: {
                        colors: {
                            primary: '#00BCD4',
                            secondary: '#26C6DA',
                            accent: '#4DD0E1',
                            background: '#E0F7FA',
                            text: '#006064',
                            profileBackground: '#80DEEA'
                        },
                        fonts: { primary: 'Bebas Neue' },
                        isDark: false,
                        cityName: 'Copenhagen'
                    }
                },
                {
                    name: 'Lisbon',
                    config: {
                        colors: {
                            primary: '#FDD835',
                            secondary: '#FFEB3B',
                            accent: '#FFF59D',
                            background: '#FFFDE7',
                            text: '#F57F17',
                            profileBackground: '#FFF176'
                        },
                        fonts: { primary: 'Roboto' },
                        isDark: false,
                        cityName: 'Lisbon'
                    }
                },
                {
                    name: 'Melbourne',
                    config: {
                        colors: {
                            primary: '#FF80AB',
                            secondary: '#FF4081',
                            accent: '#F50057',
                            background: '#FCE4EC',
                            text: '#880E4F',
                            profileBackground: '#F8BBD0'
                        },
                        fonts: { primary: 'Playfair Display' },
                        isDark: false,
                        cityName: 'Melbourne'
                    }
                },
                {
                    name: 'Cape Town',
                    config: {
                        colors: {
                            primary: '#FFA726',
                            secondary: '#FF9800',
                            accent: '#FF8F00',
                            background: '#FFF3E0',
                            text: '#E65100',
                            profileBackground: '#FFCC80'
                        },
                        fonts: { primary: 'Lato' },
                        isDark: false,
                        cityName: 'Cape Town'
                    }
                }
            ];
        }
    },

    // Obtener opciones de fuentes
    getFontOptions: async (): Promise<FontOption[]> => {
        try {
            const response = await apiService.getAll<FontOption[]>(`${themesApi}/fonts`);
            return response || [];
        } catch (error) {
            console.error('Error fetching font options:', error);
            // Return default fonts if API fails
            return [
                { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
                { id: 'playfair', name: 'Playfair', family: 'Playfair Display, serif' },
                { id: 'lato', name: 'Lato', family: 'Lato, sans-serif' },
                { id: 'opensans', name: 'Open Sans', family: 'Open Sans, sans-serif' },
                { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif' },
                { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif' },
                { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
                { id: 'bebas', name: 'Bebas', family: 'Bebas Neue, cursive' },
                { id: 'cinzel', name: 'Cinzel', family: 'Cinzel, serif' },
                { id: 'spacemono', name: 'Space Mono', family: 'Space Mono, monospace' },
                { id: 'comfortaa', name: 'Comfortaa', family: 'Comfortaa, cursive' },
                { id: 'playfairblack', name: 'Playfair Black', family: 'Playfair Display, serif' },
                { id: 'cinzelpack', name: 'Cinzel Pack', family: 'Cinzel, serif' },
                { id: 'bebaspack', name: 'Bebas Pack', family: 'Bebas Neue, cursive' },
                { id: 'alegreys', name: 'Alegreys', family: 'Alegreya Sans, sans-serif' },
                { id: 'oswald', name: 'Oswald', family: 'Oswald, sans-serif' },
                { id: 'barlow', name: 'Barlow', family: 'Barlow, sans-serif' },
                { id: 'echo', name: 'Echo', family: 'Echo, sans-serif' },
                { id: 'sofia', name: 'Sofia', family: 'Sofia, cursive' }
            ];
        }
    },

    // Crear tema desde preset de ciudad
    createFromCityPreset: async (cityName: string): Promise<Theme | null> => {
        try {
            const response = await apiService.create<{}, Theme>(`${themesApi}/cities/${cityName}`, {});
            return response;
        } catch (error) {
            console.error('Error creating theme from city preset:', error);
            throw new Error('Failed to create theme from city preset');
        }
    },

    // Crear tema personalizado
    createCustomTheme: async (config: BiositeThemeConfig): Promise<Theme | null> => {
        try {
            const response = await apiService.create<{ config: BiositeThemeConfig }, Theme>(
                `${themesApi}/custom`,
                { config }
            );
            return response;
        } catch (error) {
            console.error('Error creating custom theme:', error);
            throw new Error('Failed to create custom theme');
        }
    }
};