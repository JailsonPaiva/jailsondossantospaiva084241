import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../../../core/api/api.constants';
import { Tutor, TutoresPageResponse } from '../../../core/models/tutor.model';
import { Pet } from '../../../core/models/pet.model';

export interface GetTutoresParams {
  page?: number;
  size?: number;
  nome?: string;
}

export type TutorCreateUpdate = Partial<Omit<Tutor, 'id'>> & { id?: number };

@Injectable({ providedIn: 'root' })
export class TutorService {
  private readonly baseUrl = `${API_BASE_URL}${API_ENDPOINTS.tutores}`;

  constructor(private readonly http: HttpClient) {}

  getTutores(params?: GetTutoresParams): Observable<TutoresPageResponse> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);
    if (params?.nome?.trim()) httpParams = httpParams.set('nome', params.nome.trim());

    return this.http.get<TutoresPageResponse>(this.baseUrl, { params: httpParams });
  }

  getById(id: number): Observable<Tutor> {
    return this.http.get<Tutor>(`${this.baseUrl}/${id}`);
  }

  create(body: TutorCreateUpdate): Observable<Tutor> {
    return this.http.post<Tutor>(this.baseUrl, body);
  }

  update(id: number, body: TutorCreateUpdate): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPetsByTutor(tutorId: number): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.baseUrl}/${tutorId}/pets`);
  }

  linkPet(tutorId: number, petId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${tutorId}/pets`, { petId });
  }

  unlinkPet(tutorId: number, petId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tutorId}/pets/${petId}`);
  }
}
