export interface VCardData {
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    website: string;
}


export interface BusinessCard {
    id?: string;
    ownerId: string;
    slug?: string;
    qrCodeUrl?: string;
    data?: any;
    isActive?: boolean;
}

export interface CreateBusinessCardDto {
    ownerId: string;
    qrCodeUrl?: string;
    data?: any;
    isActive?: boolean;
}

export interface UpdateBusinessCardDto {
    id?: string;
    ownerId: string;
    data?: any;
    isActive?: boolean;
}