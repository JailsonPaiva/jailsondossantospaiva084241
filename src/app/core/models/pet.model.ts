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
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
