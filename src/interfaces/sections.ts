export interface Section {
  id: string;
  biositeId: string;
  titulo: string;
  icon: string;
  descripcion: string;
  orderIndex: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionData {
  biositeId: string;
  titulo: string;
  icon: string;
  descripcion: string;
  orderIndex: number;
  image?: string;
}

export interface ReorderSectionData {
  id: string;
  orderIndex: number;
}
