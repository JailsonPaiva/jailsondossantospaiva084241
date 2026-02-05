import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../../../core/api/api.constants';
import { Pet, PetsPageResponse } from '../../../core/models/pet.model';

export interface GetPetsParams {
  page?: number;
  size?: number;
  nome?: string;
}

export type PetCreateUpdate = Omit<Pet, 'id'> & { id?: number };

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly baseUrl = `${API_BASE_URL}${API_ENDPOINTS.pets}`;

  constructor(private readonly http: HttpClient) {}

  getPets(params?: GetPetsParams): Observable<PetsPageResponse | Pet[]> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);
    if (params?.nome?.trim()) httpParams = httpParams.set('nome', params.nome.trim());

    return this.http.get<PetsPageResponse | Pet[]>(this.baseUrl, { params: httpParams });
  }

  getById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.baseUrl}/${id}`);
  }

  create(body: PetCreateUpdate): Observable<Pet> {
    return this.http.post<Pet>(this.baseUrl, body);
  }

  update(id: number, body: PetCreateUpdate): Observable<Pet> {
    return this.http.put<Pet>(`${this.baseUrl}/${id}`, body);
  }

  /** Exclui o pet: DELETE /v1/pets/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Envia a foto do pet para POST /v1/pets/{id}/fotos.
   * Corpo (multipart/form-data): id do pet + arquivo da foto em binário.
   */
  uploadPhoto(petId: number, file: File): Observable<{ url?: string; foto?: { url: string } }> {
    const url = `${this.baseUrl}/${petId}/fotos`;
    const formData = new FormData();
    formData.append('id', String(petId));
    formData.append('foto', file, file.name);
    return this.http.post<{ url?: string; foto?: { url: string } }>(url, formData);
  }
}
