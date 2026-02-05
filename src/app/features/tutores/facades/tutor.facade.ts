import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Tutor } from '../../../core/models/tutor.model';
import { TutorService } from '../services/tutor.service';

const PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class TutorFacade {
  private readonly listSubject = new BehaviorSubject<Tutor[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly totalSubject = new BehaviorSubject<number>(0);

  readonly list$ = this.listSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();

  private _searchTerm = '';
  private _currentPage = 0;

  constructor(private readonly tutorService: TutorService) {}

  get list(): Tutor[] {
    return this.listSubject.value;
  }

  get loading(): boolean {
    return this.loadingSubject.value;
  }

  get searchTerm(): string {
    return this._searchTerm;
  }

  setSearchTerm(value: string): void {
    this._searchTerm = value;
  }

  loadTutores(): void {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    this.tutorService
      .getTutores({
        page: this._currentPage,
        size: PAGE_SIZE,
        nome: this._searchTerm || undefined,
      })
      .pipe(
        tap((res) => {
          const content = res?.content ?? [];
          this.listSubject.next(content);
          this.totalSubject.next(res?.total ?? content.length);
          this.loadingSubject.next(false);
        }),
        catchError((err) => {
          this.loadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao carregar tutores.');
          this.listSubject.next([]);
          return of(null);
        })
      )
      .subscribe();
  }

  search(nome: string): void {
    this._searchTerm = nome;
    this._currentPage = 0;
    this.loadTutores();
  }

  setPage(page: number): void {
    this._currentPage = page;
    this.loadTutores();
  }
}
