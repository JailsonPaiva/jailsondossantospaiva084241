export interface Pet {
  id: number;
  nome: string;
  especie?: string;
  raca?: string;
  foto?: string;
  dataNascimento?: string;
  tutorId?: number;
  [key: string]: unknown;
}

export interface PetsPageResponse {
  content?: Pet[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
