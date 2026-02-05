export interface TutorFoto {
  id: number;
  nome: string;
  contentType: string;
  url: string;
}

export interface Tutor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: number;
  foto?: TutorFoto;
}

export interface TutoresPageResponse {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: Tutor[];
}
