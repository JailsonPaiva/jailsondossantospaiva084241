import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../../../core/api/api.constants';
import { tutores, tutoresPageResponse } from '../../../core/models/tutor.model';

export interface GettutoresParams {
  page?: number;
  size?: number;
  nome?: string;
}

export type tutoresCreateUpdate = Partial<Omit<tutores, 'id'>> & { id?: number };

@Injectable({ providedIn: 'root' })
export class tutoresService {
  private readonly baseUrl = `${API_BASE_URL}${API_ENDPOINTS.tutores}`;

  constructor(private readonly http: HttpClient) {}

  gettutores(params?: GettutoresParams): Observable<tutoresPageResponse> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);
    if (params?.nome?.trim()) httpParams = httpParams.set('nome', params.nome.trim());

    return this.http.get<tutoresPageResponse>(this.baseUrl, { params: httpParams });
  }

  /** GET /v1/tutores/:id — retorna o tutor com o array pets vinculados. */
  getById(id: number): Observable<tutores> {
    return this.http.get<tutores>(`${this.baseUrl}/${id}`);
  }

  create(body: tutoresCreateUpdate): Observable<tutores> {
    return this.http.post<tutores>(this.baseUrl, body);
  }

  update(id: number, body: tutoresCreateUpdate): Observable<tutores> {
    return this.http.put<tutores>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Vincula pet ao tutor: POST /v1/tutores/{id}/pets/{petId} */
  linkPet(tutoresId: number, petId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${tutoresId}/pets/${petId}`, {});
  }

  unlinkPet(tutoresId: number, petId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tutoresId}/pets/${petId}`);
  }

  /** Remove a foto do tutor: DELETE /v1/tutores/{id}/fotos/{fotoId} */
  deleteFoto(tutorId: number, fotoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tutorId}/fotos/${fotoId}`);
  }

  /**
   * Envia a foto do tutor para POST /v1/tutores/{id}/fotos.
   * Corpo (multipart/form-data): id do tutor + arquivo da foto em binário.
   */
  uploadFoto(tutorId: number, file: File): Observable<{ url?: string; foto?: { url: string } }> {
    const url = `${this.baseUrl}/${tutorId}/fotos`;
    const formData = new FormData();
    formData.append('id', String(tutorId));
    formData.append('foto', file, file.name);
    return this.http.post<{ url?: string; foto?: { url: string } }>(url, formData);
  }
}
