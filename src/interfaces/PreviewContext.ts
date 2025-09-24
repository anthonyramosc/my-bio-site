import type {BiositeFull, BiositeUpdateDto} from "./Biosite.ts";
import type {UUID} from "../types/authTypes.ts";

export interface SocialLink {
    id: string;
    name: string;
    label: string;
    url: string;
    icon: string;
    color: string;
    isActive: boolean;
    link_type?: string;
    isSelected?: boolean;
}

export interface RegularLink {
    id: string;
    title: string;
    url: string;
    image?: string;
    orderIndex: number;
    isActive: boolean;
    link_type?: string;
    isSelected?: boolean;
}

export interface AppLink {
    id: string;
    store: 'appstore' | 'googleplay';
    url: string;
    isActive: boolean;
    link_type?: string;
    isSelected?: boolean;
}

{/**/}
    export interface WhatsAppLink {
        id: string;
        phone: string;
        description?: string;
        message: string;
        isActive: boolean;
        link_type?: string;
        isSelected?: boolean;
    }


export interface CreateBiositeDto {
    ownerId: UUID;
    title: string;
    slug: string;
    password?: string;
}

export interface AdminLinkCreationData {
    icon: string;
    url: string;
    label: string;
    link_type: string;
    isSelected: boolean; // This determines if it propagates to children
}

export interface PreviewContextType {
    biosite: BiositeFull | null;
    socialLinks: SocialLink[];
    regularLinks: RegularLink[];
    appLinks: AppLink[];
    whatsAppLinks: WhatsAppLink[];
    loading: boolean;
    error: string | null;
    updatePreview: (data: Partial<BiositeFull>) => void;
    updateBiosite: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    refreshBiosite: () => Promise<void>;

    themeColor: string;
    setThemeColor: (color: string, textColor: string, accentColor: string) => Promise<void>;
    fontFamily: string;
    setFontFamily: (font: string) => Promise<void>;

    // Biosite management methods
    createBiosite: (data: CreateBiositeDto) => Promise<BiositeFull | null>;
    getUserBiosites: () => Promise<BiositeFull[]>;
    switchToAnotherBiosite: (biositeId: string) => Promise<BiositeFull | null>;
    getChildBiosites?: () => Promise<BiositeFull[]>;

    setSocialLinks: (links: SocialLink[]) => void;
    addSocialLink: (link: SocialLink) => Promise<void>;
    removeSocialLink: (linkId: string) => Promise<void>;
    updateSocialLink: (linkId: string, updateData: Partial<SocialLink>) => Promise<void>;

    // Regular links methods
    setRegularLinks: (links: RegularLink[]) => void;
    addRegularLink: (link: Omit<RegularLink, 'id'>) => Promise<void>;
    removeRegularLink: (linkId: string) => Promise<void>;
    updateRegularLink: (linkId: string, updateData: Partial<RegularLink>) => Promise<void>;
    reorderRegularLinks: (links: RegularLink[]) => Promise<void>;

    setAppLinks: (links: AppLink[]) => void;
    addAppLink: (link: Omit<AppLink, 'id'>) => Promise<void>;
    removeAppLink: (linkId: string) => Promise<void>;
    updateAppLink: (linkId: string, data: Partial<AppLink>) => Promise<void>;

    setWhatsAppLinks: (links: WhatsAppLink[]) => void;
    addWhatsAppLink: (link: Omit<WhatsAppLink, 'id'>) => Promise<void>;
    removeWhatsAppLink: (linkId: string) => Promise<void>;
    updateWhatsAppLink: (linkId: string, data: Partial<WhatsAppLink>) => Promise<void>;

    getMusicEmbed: () => any;
    setMusicEmbed: (url: string, note?: string) => Promise<void>;
    getSocialPost: () => any;
    setSocialPost: (url: string, note?: string) => Promise<void>;
    getVideoEmbed: () => any;
    setVideoEmbed: (url: string, title?: string) => Promise<void>;
    getVideoLinks: () => any[];
    getMusicLinks: () => any[];
    getSocialPostLinks: () => any[];
    clearError: () => void;
}

