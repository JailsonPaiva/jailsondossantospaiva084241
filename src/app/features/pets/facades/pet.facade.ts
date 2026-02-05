import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, tap, catchError, of } from 'rxjs';
import { Pet, PetsPageResponse } from '../../../core/models/pet.model';
import { PetService, PetCreateUpdate } from '../services/pet.service';

const PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class PetFacade {
  private readonly listSubject = new BehaviorSubject<Pet[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly pageCountSubject = new BehaviorSubject<number>(1);
  private readonly currentPageSubject = new BehaviorSubject<number>(0);
  private readonly selectedPetSubject = new BehaviorSubject<Pet | null>(null);
  private readonly saveLoadingSubject = new BehaviorSubject<boolean>(false);

  readonly list$ = this.listSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();
  readonly pageCount$ = this.pageCountSubject.asObservable();
  /** Número de páginas (vindo da API quando disponível). */
  readonly totalPages$ = combineLatest([this.total$, this.pageCount$]).pipe(
    map(() => this.totalPages)
  );
  readonly currentPage$ = this.currentPageSubject.asObservable();
  readonly selectedPet$ = this.selectedPetSubject.asObservable();
  readonly saveLoading$ = this.saveLoadingSubject.asObservable();

  private _searchTerm = '';
  private _currentPage = 0;

  constructor(
    private readonly petService: PetService,
    private readonly router: Router
  ) {}

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
          const content = Array.isArray(res) ? res : (res as PetsPageResponse).content ?? [];
          const payload = Array.isArray(res) ? null : (res as PetsPageResponse);
          const total = Array.isArray(res)
            ? res.length
            : (payload!.total ?? payload!.totalElements ?? content.length);
          const pageCount = payload
            ? (payload.pageCount ?? payload.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE)))
            : Math.max(1, Math.ceil(total / PAGE_SIZE));
          this.listSubject.next(content);
          this.totalSubject.next(total);
          this.pageCountSubject.next(pageCount);
          this.currentPageSubject.next(this._currentPage);
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

  /** page: índice 0-based (página do servidor) */
  setPage(page: number): void {
    this._currentPage = page;
    this.loadPets();
  }

  /** Número de páginas: usa pageCount da API quando disponível, senão calcula a partir do total. */
  get totalPages(): number {
    const pageCount = this.pageCountSubject.value;
    if (pageCount > 0) return pageCount;
    const total = this.totalSubject.value;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }

  loadPetById(id: number): void {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);
    this.selectedPetSubject.next(null);
    this.petService
      .getById(id)
      .pipe(
        tap((pet) => {
          this.selectedPetSubject.next(pet);
          this.loadingSubject.next(false);
        }),
        catchError((err) => {
          this.loadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao carregar pet.');
          return of(null);
        })
      )
      .subscribe();
  }

  clearSelected(): void {
    this.selectedPetSubject.next(null);
  }

  create(body: PetCreateUpdate): void {
    this.errorSubject.next(null);
    this.saveLoadingSubject.next(true);
    this.petService
      .create(body)
      .pipe(
        tap((pet) => {
          this.saveLoadingSubject.next(false);
          this.loadPets();
          this.router.navigate(['/pets', pet.id]);
        }),
        catchError((err) => {
          this.saveLoadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao cadastrar pet.');
          return of(null);
        })
      )
      .subscribe();
  }

  update(id: number, body: PetCreateUpdate): void {
    this.errorSubject.next(null);
    this.saveLoadingSubject.next(true);
    this.petService
      .update(id, body)
      .pipe(
        tap((pet) => {
          this.saveLoadingSubject.next(false);
          this.selectedPetSubject.next(pet);
          this.loadPets();
          this.router.navigate(['/pets', id]);
        }),
        catchError((err) => {
          this.saveLoadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao atualizar pet.');
          return of(null);
        })
      )
      .subscribe();
  }

  uploadPhoto(petId: number, file: File): void {
    this.errorSubject.next(null);
    this.petService
      .uploadPhoto(petId, file)
      .pipe(
        tap((res) => {
          const url = res?.url ?? res?.foto?.url;
          const current = this.selectedPetSubject.value;
          if (url && current && current.id === petId) {
            this.selectedPetSubject.next({ ...current, foto: { url } });
          }
          this.loadPets();
        }),
        catchError((err) => {
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao enviar foto.');
          return of(null);
        })
      )
      .subscribe();
  }
}
