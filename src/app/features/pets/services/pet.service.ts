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

  uploadPhoto(petId: number, file: File): Observable<{ url?: string; foto?: { url: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url?: string; foto?: { url: string } }>(
      `${this.baseUrl}/${petId}/fotos`,
      formData
    );
  }
}
