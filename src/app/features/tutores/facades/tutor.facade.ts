import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, catchError, of } from 'rxjs';
import { tutores } from '../../../core/models/tutor.model';
import { Pet } from '../../../core/models/pet.model';
import { tutoresService, tutoresCreateUpdate } from '../services/tutor.service';

const PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class tutoresFacade {
  private readonly listSubject = new BehaviorSubject<tutores[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly currentPageSubject = new BehaviorSubject<number>(0);
  private readonly selectedtutoresSubject = new BehaviorSubject<tutores | null>(null);
  private readonly tutoresPetsSubject = new BehaviorSubject<Pet[]>([]);
  private readonly saveLoadingSubject = new BehaviorSubject<boolean>(false);

  readonly list$ = this.listSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();
  readonly currentPage$ = this.currentPageSubject.asObservable();
  readonly selectedtutores$ = this.selectedtutoresSubject.asObservable();
  readonly tutoresPets$ = this.tutoresPetsSubject.asObservable();
  readonly saveLoading$ = this.saveLoadingSubject.asObservable();

  private _searchTerm = '';
  private _currentPage = 0;

  constructor(
    private readonly tutoresService: tutoresService,
    private readonly router: Router
  ) {}

  get list(): tutores[] {
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

  loadtutores(): void {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);

    this.tutoresService
      .gettutores({
        page: this._currentPage,
        size: PAGE_SIZE,
        nome: this._searchTerm || undefined,
      })
      .pipe(
        tap((res) => {
          const content = res?.content ?? [];
          this.listSubject.next(content);
          this.totalSubject.next(res?.total ?? content.length);
          this.currentPageSubject.next(this._currentPage);
          this.loadingSubject.next(false);
        }),
        catchError((err) => {
          this.loadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao carregar tutor.');
          this.listSubject.next([]);
          return of(null);
        })
      )
      .subscribe();
  }

  search(nome: string): void {
    this._searchTerm = nome;
    this._currentPage = 0;
    this.loadtutores();
  }

  /** page: índice 0-based (página do servidor) */
  setPage(page: number): void {
    this._currentPage = page;
    this.loadtutores();
  }

  get totalPages(): number {
    const total = this.totalSubject.value;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }

  loadtutoresById(id: number): void {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);
    this.selectedtutoresSubject.next(null);
    this.tutoresPetsSubject.next([]);
    this.tutoresService
      .getById(id)
      .pipe(
        tap((tutores) => {
          this.selectedtutoresSubject.next(tutores);
          this.loadingSubject.next(false);
          this.loadPetsBytutores(id);
        }),
        catchError((err) => {
          this.loadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao carregar tutor.');
          return of(null);
        })
      )
      .subscribe();
  }

  private loadPetsBytutores(tutoresId: number): void {
    this.tutoresService.getPetsBytutores(tutoresId).pipe(
      tap((pets) => this.tutoresPetsSubject.next(pets ?? [])),
      catchError(() => {
        this.tutoresPetsSubject.next([]);
        return of([]);
      })
    ).subscribe();
  }

  clearSelected(): void {
    this.selectedtutoresSubject.next(null);
    this.tutoresPetsSubject.next([]);
  }

  create(body: tutoresCreateUpdate): void {
    this.errorSubject.next(null);
    this.saveLoadingSubject.next(true);
    this.tutoresService
      .create(body)
      .pipe(
        tap((tutores) => {
          this.saveLoadingSubject.next(false);
          this.loadtutores();
          this.router.navigate(['/tutores', tutores.id]);
        }),
        catchError((err) => {
          this.saveLoadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao cadastrar tutor.');
          return of(null);
        })
      )
      .subscribe();
  }

  update(id: number, body: tutoresCreateUpdate): void {
    this.errorSubject.next(null);
    this.saveLoadingSubject.next(true);
    this.tutoresService
      .update(id, body)
      .pipe(
        tap((tutores) => {
          this.saveLoadingSubject.next(false);
          this.selectedtutoresSubject.next(tutores);
          this.loadtutores();
          this.router.navigate(['/tutores', id]);
        }),
        catchError((err) => {
          this.saveLoadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao atualizar tutor.');
          return of(null);
        })
      )
      .subscribe();
  }

  deletetutores(id: number): void {
    this.errorSubject.next(null);
    this.tutoresService
      .delete(id)
      .pipe(
        tap(() => {
          this.clearSelected();
          this.loadtutores();
          this.router.navigate(['/tutores']);
        }),
        catchError((err) => {
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao excluir tutor.');
          return of(null);
        })
      )
      .subscribe();
  }

  linkPet(tutoresId: number, petId: number): void {
    this.errorSubject.next(null);
    this.tutoresService
      .linkPet(tutoresId, petId)
      .pipe(
        tap(() => this.loadPetsBytutores(tutoresId)),
        catchError((err) => {
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao vincular pet.');
          return of(null);
        })
      )
      .subscribe();
  }

  unlinkPet(tutoresId: number, petId: number): void {
    this.errorSubject.next(null);
    this.tutoresService
      .unlinkPet(tutoresId, petId)
      .pipe(
        tap(() => this.loadPetsBytutores(tutoresId)),
        catchError((err) => {
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao desvincular pet.');
          return of(null);
        })
      )
      .subscribe();
  }
}
