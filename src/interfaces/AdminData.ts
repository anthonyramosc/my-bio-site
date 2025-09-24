import type {BusinessCard} from "../types/V-Card.ts";
import React from "react";

export interface LinkData {
    id: string;
    label: string;
    url: string;
    icon?: string;
    isActive: boolean;
    orderIndex: number;
    description?: string;
    image?: string;
    color?: string;
    biositeId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LinkImageDisplayProps {
    link: LinkData;
    size?: 'sm' | 'md' | 'lg';
}

interface User {
    id: string;
    email: string;
    cedula?: string;
    name?: string;
    description?: string;
    avatarUrl?: string;
    site?: string;
    phone?: string;
    isActive?: boolean;
    role?: string;
    parentId?: string;
    createdAt?: string;
    updatedAt?: string;
    biosites?: BiositeFull[];
}

export interface BiositeFull {
    id: string;
    ownerId: string;
    title: string | null;
    slug: string | null;
    themeId: string | null;
    colors: string | any;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    videoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    links?: LinkData[];
    owner?: User;
    businessCard?: BusinessCard;
}

export interface AnalyticsData {
    views: number;
    clicks: number;
    dailyActivity: Array<{
        day: string;
        views: number;
        clicks: number;
    }>;
    clickDetails: Array<{
        label: string;
        count: number;
    }>;
}
export type TimeRange = 'last7' | 'last30' | 'lastYear';


export interface BiositesTableProps {
    pagination: any & { totalUnfilteredItems?: number };
    biositeLinks: {[key: string]: LinkData[]};
    loadingBiositeLinks: {[key: string]: boolean};
    analyticsData: {[key: string]: AnalyticsData};
    loadingAnalytics: {[key: string]: boolean};
    showAnalytics: {[key: string]: boolean};
    analyticsTimeRange: TimeRange;
    expandedBiosite: string | null;
    businessCards: {[key: string]: BusinessCard};
    loadingCards: {[key: string]: boolean};
    categorizeLinks: (links: LinkData[]) => {
        total: number;
        social: number;
        regular: number;
        whatsApp: number;
        apps: number;
        embed: number;
    };
    toggleBiositeExpansion: (biositeId: string) => void;
    toggleAnalytics: (biositeId: string, ownerId: string) => void;
    fetchBiositeAnalytics: (biositeId: string, ownerId: string) => void;
    setAnalyticsTimeRange: (range: TimeRange) => void;
    setShowAnalytics: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
    setAnalyticsData: React.Dispatch<React.SetStateAction<{[key: string]: AnalyticsData}>>;
    formatDate: (dateString?: string) => string;
    parseVCardData: (businessCard: BusinessCard | null) => any;
    fetchBusinessCard: (ownerId: string) => void;
}

export interface AdminChildBiositesTableProps {
    biosites: BiositeFull[];
    totalBiosites: number;
    loading: boolean;
    biositeLinks: {[key: string]: LinkData[]};
    loadingBiositeLinks: {[key: string]: boolean};
    analyticsData: {[key: string]: any};
    loadingAnalytics: {[key: string]: boolean};
    showAnalytics: {[key: string]: boolean};
    analyticsTimeRange: TimeRange;
    expandedBiosite: string | null;
    businessCards: {[key: string]: any};
    loadingCards: {[key: string]: boolean};
    toggleBiositeExpansion: (biositeId: string) => void;
    toggleAnalytics: (biositeId: string, ownerId: string) => void;
    fetchBiositeAnalytics: (biositeId: string, ownerId: string) => void;
    setAnalyticsTimeRange: (range: TimeRange) => void;
    setShowAnalytics: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
    setAnalyticsData: React.Dispatch<React.SetStateAction<{[key: string]: any}>>;
    formatDate: (dateString?: string) => string;
    parseVCardData: (businessCard: any) => any;
    categorizeLinks: (links: LinkData[]) => any;
    fetchBusinessCard: (ownerId: string) => void;
}
