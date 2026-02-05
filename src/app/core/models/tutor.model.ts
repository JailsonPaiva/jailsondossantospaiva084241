import type { Pet } from './pet.model';

export interface tutoresFoto {
  id: number;
  nome: string;
  contentType: string;
  url: string;
}

export interface tutores {
  id: number;
  nome: string;
  email: string | null;
  telefone: string;
  endereco: string;
  cpf: number | null;
  foto?: tutoresFoto;
  /** Pets vinculados ao tutor (retornado por GET /v1/tutores/:id) */
  pets?: Pet[];
}

export interface tutoresPageResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: tutores[];
}
