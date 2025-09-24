import { useCallback } from "react";
import type { BiositeFull, BiositeUpdateDto, BiositeColors } from "../interfaces/Biosite";
import type { CreateBiositeDto } from "../interfaces/User.ts";
import Cookies from "js-cookie";

interface UseBiositeOperationsProps {
    biositeData: BiositeFull | null;
    fontFamily: string;
    themeColor: string;
    setThemeColorState: (color: string) => void;
    setFontFamilyState: (font: string) => void;
    updateBiositeHook: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    setBiosite: (biosite: BiositeFull | null) => void;
    createBiosite: (data: CreateBiositeDto) => Promise<BiositeFull | null>;
    fetchUserBiosites: () => Promise<BiositeFull[]>;
    switchBiosite: (biositeId: string) => Promise<BiositeFull | null>;
    fetchChildBiosites: (userId: string) => Promise<BiositeFull[]>;
    resetState: () => void;
}

export const useBiositeOperations = ({
                                         biositeData,
                                         fontFamily,
                                         themeColor,
                                         setThemeColorState,
                                         setFontFamilyState,
                                         updateBiositeHook,
                                         setBiosite,
                                         createBiosite,
                                         fetchUserBiosites,
                                         switchBiosite,
                                         fetchChildBiosites,
                                         resetState
                                     }: UseBiositeOperationsProps) => {

    const updateBiosite = useCallback(async (data: BiositeUpdateDto): Promise<BiositeFull | null> => {
        try {
            const result = await updateBiositeHook(data);
            if (result) {
                setBiosite(result);
            }
            return result;
        } catch (error) {
            console.error("PreviewContext: updateBiosite error:", error);
            throw error;
        }
    }, [updateBiositeHook, setBiosite]);

    const refreshBiosite = useCallback(async () => {
        try {
            if (!biositeData?.id) return;
            setBiosite(biositeData);
        } catch (error) {
            console.error("Error refreshing biosite:", error);
        }
    }, [biositeData, setBiosite]);

    const setThemeColor = useCallback(async (color: string, textColor:string, accentColor: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }
        try {
            setThemeColorState(color);

            const colorsObject: BiositeColors = {
                primary: color,
                secondary: color,
                background: color,
                text: textColor,
                accent: accentColor,
                profileBackground: color
            };
            const updateData: BiositeUpdateDto = {
                ownerId: biositeData.ownerId,
                title: biositeData.title,
                slug: biositeData.slug,
                themeId: biositeData.themeId,
                colors: JSON.stringify(colorsObject),
                fonts: biositeData.fonts || fontFamily,
                backgroundImage: biositeData.backgroundImage || '',
                isActive: biositeData.isActive
            };

            await updateBiosite(updateData);
        } catch (error) {
            console.error("Error updating theme color:", error);
            if (biositeData.colors) {
                const previousColor = typeof biositeData.colors === 'string'
                    ? biositeData.colors
                    : biositeData.colors.background || '#ffffff';
                setThemeColorState(previousColor);
            }
            throw error;
        }
    }, [biositeData, fontFamily, updateBiosite, setThemeColorState]);

    const setFontFamily = useCallback(async (font: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }

        try {

            setFontFamilyState(font);

            let colorsString: string;
            if (typeof biositeData.colors === 'string') {
                colorsString = biositeData.colors;
            } else {
                colorsString = JSON.stringify(biositeData.colors);
            }

            const updateData: BiositeUpdateDto = {
                ownerId: biositeData.ownerId,
                title: biositeData.title,
                slug: biositeData.slug,
                themeId: biositeData.themeId,
                colors: colorsString,
                fonts: font,
                backgroundImage: biositeData.backgroundImage || '',
                isActive: biositeData.isActive
            };

            const updatedBiosite = await updateBiosite(updateData);

            if (updatedBiosite) {
                setBiosite(updatedBiosite);
                console.log('Font updated successfully, biosite refreshed:', font);
            }

        } catch (error) {
            console.error("Error updating font family:", error);
            // Revertir el estado en caso de error
            setFontFamilyState(biositeData.fonts || 'Inter');
            throw error;
        }
    }, [biositeData, updateBiosite, setFontFamilyState, setBiosite]);

    const createNewBiosite = useCallback(async (data: CreateBiositeDto): Promise<BiositeFull | null> => {
        try {
            const result = await createBiosite(data);
            return result;
        } catch (error) {
            console.error("Error creating biosite:", error);
            throw error;
        }
    }, [createBiosite]);

    const getUserBiosites = useCallback(async (): Promise<BiositeFull[]> => {
        try {
            const result = await fetchUserBiosites();
            return result;
        } catch (error) {
            console.error("Error fetching user biosites:", error);
            throw error;
        }
    }, [fetchUserBiosites]);

    const switchToAnotherBiosite = useCallback(async (biositeId: string): Promise<BiositeFull | null> => {
        try {
            const result = await switchBiosite(biositeId);
            if (result) {
                setBiosite(result);

                Cookies.set('biositeId', biositeId);
                Cookies.set('userId', result.ownerId);

                resetState();
                await refreshBiosite();
            }
            return result;
        } catch (error) {
            console.error("Error switching biosite:", error);
            throw error;
        }
    }, [switchBiosite, resetState, setBiosite, refreshBiosite]);

    const handleLogout = useCallback(() => {
        Cookies.remove('userId');
        Cookies.remove('biositeId');
        Cookies.remove('roleName');
    }, []);

    const getChildBiosites = useCallback(async (): Promise<BiositeFull[]> => {
        const currentUserId = Cookies.get('userId');
        if (!currentUserId) throw new Error('No hay userId');
        return await fetchChildBiosites(currentUserId);
    }, [fetchChildBiosites]);

    const loadBiositeById = useCallback(async (biositeId: string): Promise<BiositeFull | null> => {
        try {
            const result = await switchBiosite(biositeId);
            if (result) {
                setBiosite(result);

                Cookies.set('biositeId', biositeId);
                Cookies.set('userId', result.ownerId);

            }
            return result;
        } catch (error) {
            console.error("Error loading biosite by ID:", error);
            throw error;
        }
    }, [switchBiosite, setBiosite]);

    return {
        updateBiosite,
        refreshBiosite,
        setThemeColor,
        setFontFamily,
        createBiosite: createNewBiosite,
        getUserBiosites,
        switchToAnotherBiosite,
        handleLogout,
        getChildBiosites,
        loadBiositeById
    };
};
