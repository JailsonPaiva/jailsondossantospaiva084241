import type { Tutor } from './tutor.model';

export interface Pet {
  id: number;
  nome?: string;
  especie?: string;
  idade?: string;
  raca?: string;
  foto?: { url: string };
  tutorId?: number;
  tutor?: Tutor;
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
