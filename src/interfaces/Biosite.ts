import type { UUID } from "../types/authTypes.ts";

export interface BiositeColors {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
  text?: string;
  profileBackground?: string;
}

export interface BiositeThemeConfig {
  colors: BiositeColors;
  fonts: {
    primary: string;
    secondary?: string;
    third?: string;
    fourth?: string;
    fifth?: string;
    sixth?: string;
  };
  isDark: boolean;
  isAnimated: boolean;
}

export interface BiositeTheme {
  name: string;
  config: BiositeThemeConfig;
}

export interface BiositeOwner {
  id: string;
  email: string;
  cedula?: string; // Añadido campo cedula como opcional
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
}

export interface BiositeLink {
  id: string;
  biositeId: string;
  label: string;
  url: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  isSelected: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  link_type?: string;
  image: string;
  onClick?: () => void;
  tag?: string;
}

export interface BiositeFull {
  id: string;
  ownerId: UUID;
  title: string;
  slug: string;
  themeId: string;
  theme?: BiositeTheme;
  colors: string | BiositeColors;
  fonts?: string;
  avatarImage?: string;
  backgroundImage?: string;
  videoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  links?: BiositeLink[];
  owner?: BiositeOwner;
}

export interface BiositeUpdateDto {
  ownerId: string;
  title: string;
  slug: string;
  themeId: string;
  colors: string | BiositeColors;
  fonts: string;
  avatarImage?: string;
  backgroundImage: string;
  isActive: boolean;
}
