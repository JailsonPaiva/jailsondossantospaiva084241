export interface Pet {
  id: number;
  nome?: string;
  idade?: string;
  raca?: string;
  foto?: { url: string };
  tutorId?: number;
}

export interface PetsPageResponse {
  content?: Pet[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
