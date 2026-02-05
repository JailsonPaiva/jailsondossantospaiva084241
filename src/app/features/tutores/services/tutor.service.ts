import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../../../core/api/api.constants';
import { Tutor, TutoresPageResponse } from '../../../core/models/tutor.model';

export interface GetTutoresParams {
  page?: number;
  size?: number;
  nome?: string;
}

@Injectable({ providedIn: 'root' })
export class TutorService {
  private readonly url = `${API_BASE_URL}${API_ENDPOINTS.tutores}`;

  constructor(private readonly http: HttpClient) {}

  getTutores(params?: GetTutoresParams): Observable<TutoresPageResponse> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);
    if (params?.nome?.trim()) httpParams = httpParams.set('nome', params.nome.trim());

    return this.http.get<TutoresPageResponse>(this.url, { params: httpParams });
  }
}
