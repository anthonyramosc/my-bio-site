import type {UUID} from "../types/authTypes.ts";

export interface CreateBiositeDto {
    ownerId: UUID;
    title: string;
    slug: string;
    password: string;
}

export interface CreateUserDto {
    email: string;
    cedula: string; // Añadido campo cedula como requerido
    password: string;
    name?: string;
    parentId?: string;
    role?: string;
}

export interface CreatedUser {
    id: string;
    email: string;
    cedula?: string; // Añadido campo cedula como opcional en la respuesta
    name?: string;
    parentId?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}