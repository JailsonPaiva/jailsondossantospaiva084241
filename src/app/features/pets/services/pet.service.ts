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

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly url = `${API_BASE_URL}${API_ENDPOINTS.pets}`;

  constructor(private readonly http: HttpClient) {}

  getPets(params?: GetPetsParams): Observable<PetsPageResponse | Pet[]> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);
    if (params?.nome?.trim()) httpParams = httpParams.set('nome', params.nome.trim());

    return this.http.get<PetsPageResponse | Pet[]>(this.url, { params: httpParams });
  }
}
