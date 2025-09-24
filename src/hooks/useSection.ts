import { useState, useEffect } from 'react';
import apiService from '../service/apiService';
import {
    sectionsApi,
    getSectionsByBiositeApi,
    reorderSectionsApi
} from '../constants/EndpointsRoutes';
import type {CreateSectionData,ReorderSectionData,Section} from '../interfaces/sections.ts'

export const useSections = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Crear sección inicial
    const createSection = async (sectionData: CreateSectionData): Promise<Section> => {
        try {
            setLoading(true);
            setError(null);
            const newSection = await apiService.create<CreateSectionData, Section>(
                sectionsApi,
                sectionData
            );
            setSections(prev => [...prev, newSection]);
            return newSection;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creating section';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Obtener secciones por biosite ID - with deduplication
    const getSectionsByBiosite = async (biositeId: string): Promise<Section[]> => {
        try {
            setLoading(true);
            setError(null);
            const fetchedSections = await apiService.getAll<Section[]>(
                `${getSectionsByBiositeApi}/${biositeId}`
            );

            // Remove duplicates based on titulo, keeping the one with the lowest orderIndex
            const uniqueSections = fetchedSections.reduce((acc: Section[], current: Section) => {
                const existingIndex = acc.findIndex(section => section.titulo === current.titulo);

                if (existingIndex === -1) {
                    acc.push(current);
                } else {
                    // Keep the one with lower orderIndex or more recent updatedAt
                    if (current.orderIndex < acc[existingIndex].orderIndex ||
                        new Date(current.updatedAt) > new Date(acc[existingIndex].updatedAt)) {
                        acc[existingIndex] = current;
                    }
                }

                return acc;
            }, []);

            // Sort by orderIndex
            uniqueSections.sort((a, b) => a.orderIndex - b.orderIndex);

            setSections(uniqueSections);
            return uniqueSections;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error fetching sections';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reorderSections = async (
        biositeId: string,
        reorderData: { id: string; orderIndex: number }[]
    ): Promise<Section[]> => {
        try {
            setLoading(true);
            setError(null);

            const requestBody = {
                sections: reorderData
            };

            const reorderedSections = await apiService.patch<typeof requestBody>(
                `${reorderSectionsApi}/${biositeId}`,
                requestBody
            );
            setSections(reorderedSections as unknown as Section[]);
            return reorderedSections as unknown as Section[];
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error reordering sections';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Nuevo método principal para verificar y crear todas las secciones
    const verifyAndCreateAllSections = async (biositeId: string): Promise<Section[]> => {
        try {
            setLoading(true);
            setError(null);

            // Obtener secciones existentes primero
            const existingSections = await getSectionsByBiosite(biositeId);

            // Definir todas las secciones requeridas (SIN orderIndex fijo)
            const requiredSections: Omit<CreateSectionData, 'orderIndex'>[] = [
                {
                    biositeId,
                    titulo: 'Profile',
                    icon: 'profile',
                    descripcion: 'User profile section',
                },
                {
                    biositeId,
                    titulo: 'Social',
                    icon: 'social',
                    descripcion: 'Social media links',
                },
                {
                    biositeId,
                    titulo: 'Links',
                    icon: 'link',
                    descripcion: 'Enlaces diversos',
                },
                {
                    biositeId,
                    titulo: 'Contactame',
                    icon: 'whatsapp',
                    descripcion: 'WhatsApp contact',
                },
                {
                    biositeId,
                    titulo: 'Link de mi App',
                    icon: 'app',
                    descripcion: 'App download links',
                },
                {
                    biositeId,
                    titulo: 'VCard',
                    icon: 'vcard',
                    descripcion: 'Digital business card',
                },
                {
                    biositeId,
                    titulo: 'Video',
                    icon: 'video',
                    descripcion: 'YouTube videos',
                },
                {
                    biositeId,
                    titulo: 'Music / Podcast',
                    icon: 'music',
                    descripcion: 'Audio content',
                },
                {
                    biositeId,
                    titulo: 'Social Post',
                    icon: 'instagram',
                    descripcion: 'Instagram posts',
                },
            ];

            // Crear un Map para acceso rápido a secciones existentes
            const existingSectionsMap = new Map(
                existingSections.map(section => [section.titulo, section])
            );

            // Solo buscar secciones que faltan (NO verificar orderIndex)
            const sectionsToCreate: CreateSectionData[] = [];

            for (const requiredSection of requiredSections) {
                const existingSection = existingSectionsMap.get(requiredSection.titulo);

                if (!existingSection) {
                    // La sección no existe, necesita ser creada
                    // Para nuevas secciones, usar el siguiente orderIndex disponible
                    const maxOrderIndex = existingSections.length > 0
                        ? Math.max(...existingSections.map(s => s.orderIndex))
                        : -1;

                    sectionsToCreate.push({
                        ...requiredSection,
                        orderIndex: maxOrderIndex + 1
                    });
                    console.log(`Sección faltante detectada: ${requiredSection.titulo}`);
                }
                // NO hacer nada si la sección existe, mantener su orderIndex actual
            }

            // Crear solo las secciones faltantes
            const createdSections: Section[] = [];
            for (const sectionData of sectionsToCreate) {
                try {
                    const newSection = await apiService.create<CreateSectionData, Section>(
                        sectionsApi,
                        sectionData
                    );
                    createdSections.push(newSection);
                    console.log(`Sección creada exitosamente: ${sectionData.titulo}`);
                } catch (createError) {
                    console.error(`Error creando sección ${sectionData.titulo}:`, createError);
                    // Continuar con las demás secciones incluso si una falla
                }
            }

            // Obtener todas las secciones actualizadas (solo si se crearon nuevas)
            let finalSections = existingSections;
            if (createdSections.length > 0) {
                finalSections = await getSectionsByBiosite(biositeId);
            }

            // Verificar que todas las secciones requeridas están presentes
            const finalSectionTitles = new Set(finalSections.map(s => s.titulo));
            const missingSections = requiredSections.filter(
                req => !finalSectionTitles.has(req.titulo)
            );

            if (missingSections.length > 0) {
                console.warn('Algunas secciones aún faltan después de la verificación:',
                    missingSections.map(s => s.titulo));
            } else {
                console.log('Todas las secciones requeridas están presentes y verificadas');
            }

            return finalSections;

        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error verificando y creando secciones';
            setError(errorMessage);
            console.error('Error en verifyAndCreateAllSections:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    // Método para verificar la integridad de las secciones
    const checkSectionsIntegrity = async (biositeId: string): Promise<{
        isComplete: boolean;
        missingSections: string[];
        duplicatedSections: string[];
        totalSections: number;
        orderIndexIssues: boolean; // Nuevo campo para indicar si hay problemas de orden, pero no los arregla automáticamente
    }> => {
        try {
            const existingSections = await getSectionsByBiosite(biositeId);

            const requiredSectionTitles = [
                'Profile', 'Social', 'Links', 'Contactame', 'Link de mi App',
                'VCard', 'Video', 'Music / Podcast', 'Social Post'
            ];

            const existingTitles = existingSections.map(s => s.titulo);
            const existingTitlesSet = new Set(existingTitles);

            // Verificar secciones faltantes
            const missingSections = requiredSectionTitles.filter(
                title => !existingTitlesSet.has(title)
            );

            // Verificar secciones duplicadas
            const duplicatedSections = existingTitles.filter(
                (title, index) => existingTitles.indexOf(title) !== index
            );

            // Verificar si hay gaps o problemas en orderIndex (solo para reporte, no para corrección automática)
            const orderIndices = existingSections.map(s => s.orderIndex).sort((a, b) => a - b);
            const orderIndexIssues = orderIndices.some((index, i) => i > 0 && index !== orderIndices[i - 1] + 1);

            const isComplete = missingSections.length === 0 && duplicatedSections.length === 0;

            return {
                isComplete,
                missingSections,
                duplicatedSections: [...new Set(duplicatedSections)],
                totalSections: existingSections.length,
                orderIndexIssues
            };

        } catch (error) {
            console.error('Error checking sections integrity:', error);
            throw error;
        }
    };

    const createDefaultSections = async (biositeId: string): Promise<Section[]> => {
        const defaultSections: CreateSectionData[] = [
            {
                biositeId,
                titulo: 'Profile',
                icon: 'profile',
                descripcion: 'User profile section',
                orderIndex: 0, // Profile
            },
            {
                biositeId,
                titulo: 'Social',
                icon: 'social',
                descripcion: 'Social media links',
                orderIndex: 1,
            },
            {
                biositeId,
                titulo: 'Links',
                icon: 'link',
                descripcion: 'Enlaces diversos',
                orderIndex: 2,
            },
            {
                biositeId,
                titulo: 'Contactame',
                icon: 'whatsapp',
                descripcion: 'WhatsApp contact',
                orderIndex: 3,
            },
            {
                biositeId,
                titulo: 'Link de mi App',
                icon: 'app',
                descripcion: 'App download links',
                orderIndex: 4,
            },
            {
                biositeId,
                titulo: 'VCard',
                icon: 'vcard',
                descripcion: 'Digital business card',
                orderIndex: 5,
            },
            {
                biositeId,
                titulo: 'Video',
                icon: 'video',
                descripcion: 'YouTube videos',
                orderIndex: 6,
            },
            {
                biositeId,
                titulo: 'Music / Podcast',
                icon: 'music',
                descripcion: 'Audio content',
                orderIndex: 7,
            },
            {
                biositeId,
                titulo: 'Social Post',
                icon: 'instagram',
                descripcion: 'Instagram posts',
                orderIndex: 8,
            },
        ];

        try {
            const createdSections: Section[] = [];
            for (const sectionData of defaultSections) {
                // Check if section already exists before creating
                const existingSections = await getSectionsByBiosite(biositeId);
                const existingSection = existingSections.find(s => s.titulo === sectionData.titulo);

                if (!existingSection) {
                    const created = await createSection(sectionData);
                    createdSections.push(created);
                }
            }
            return createdSections;
        } catch (err) {
            console.error('Error creating default sections:', err);
            throw err;
        }
    };

    const checkExistingSections = async (biositeId: string): Promise<boolean> => {
        try {
            const existingSections = await getSectionsByBiosite(biositeId);
            return existingSections.length > 0;
        } catch (err) {
            console.error('Error checking existing sections:', err);
            return false;
        }
    };

    const initializeSections = async (biositeId: string): Promise<Section[]> => {
        try {
            const existingSections = await getSectionsByBiosite(biositeId);

            if (existingSections.length === 0) {
                return await createDefaultSections(biositeId);
            } else {
                // Check if Profile section is missing and add it
                const hasProfile = existingSections.some(section => section.titulo === 'Profile');
                if (!hasProfile) {
                    const profileSection: CreateSectionData = {
                        biositeId,
                        titulo: 'Profile',
                        icon: 'profile',
                        descripcion: 'User profile section',
                        orderIndex: 0,
                    };
                    await createSection(profileSection);
                }

                // Check if VCard section is missing and add it
                const hasVCard = existingSections.some(section => section.titulo === 'VCard');
                if (!hasVCard) {
                    const vCardSection: CreateSectionData = {
                        biositeId,
                        titulo: 'VCard',
                        icon: 'vcard',
                        descripcion: 'Digital business card',
                        orderIndex: existingSections.length + 1,
                    };
                    await createSection(vCardSection);
                }

                return await getSectionsByBiosite(biositeId);
            }
        } catch (err) {
            console.error('Error initializing sections:', err);
            throw err;
        }
    };

    return {
        sections,
        loading,
        error,
        createSection,
        getSectionsByBiosite,
        reorderSections,
        createDefaultSections,
        initializeSections,
        verifyAndCreateAllSections,        // Nuevo método principal
        checkSectionsIntegrity,            // Nuevo método de verificación
        clearError: () => setError(null),
    };
};