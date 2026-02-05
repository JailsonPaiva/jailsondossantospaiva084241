import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Pet } from '../../../core/models/pet.model';
import { PetService } from '../services/pet.service';

const PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class PetFacade {
  private readonly listSubject = new BehaviorSubject<Pet[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly totalSubject = new BehaviorSubject<number>(0);

  readonly list$ = this.listSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();

  private _searchTerm = '';
  private _currentPage = 0;

  constructor(private readonly petService: PetService) {}

  get list(): Pet[] {
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

  loadPets(): void {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    this.petService
      .getPets({
        page: this._currentPage,
        size: PAGE_SIZE,
        nome: this._searchTerm || undefined,
      })
      .pipe(
        tap((res) => {
          const content = Array.isArray(res) ? res : (res as { content?: Pet[] }).content ?? [];
          const total = Array.isArray(res)
            ? res.length
            : (res as { totalElements?: number }).totalElements ?? content.length;
          this.listSubject.next(content);
          this.totalSubject.next(total);
          this.loadingSubject.next(false);
        }),
        catchError((err) => {
          this.loadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao carregar pets.');
          this.listSubject.next([]);
          return of(null);
        })
      )
      .subscribe();
  }

  search(nome: string): void {
    this._searchTerm = nome;
    this._currentPage = 0;
    this.loadPets();
  }

  setPage(page: number): void {
    this._currentPage = page;
    this.loadPets();
  }
}
