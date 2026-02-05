import type { tutores } from './tutor.model';

export interface PetFoto {
  id?: number;
  nome?: string;
  contentType?: string;
  url: string;
}

export interface Pet {
  id: number;
  nome?: string;
  especie?: string;
  idade?: string | number;
  raca?: string;
  foto?: PetFoto;
  tutoresId?: number;
  /** Tutores vinculados (resposta da API GET /v1/pets/{id}) */
  tutores?: tutores[];
}

export interface PetsPageResponse {
  content?: Pet[];
  /** Total de registros (API pode enviar como `total` ou `totalElements`) */
  total?: number;
  totalElements?: number;
  /** Número de páginas (API pode enviar como `pageCount` ou `totalPages`) */
  pageCount?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
