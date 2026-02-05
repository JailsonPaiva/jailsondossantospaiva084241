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
}

export interface tutoresPageResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: tutores[];
}
