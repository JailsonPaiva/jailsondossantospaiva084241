import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Tutor } from '../../../core/models/tutor.model';
import { Pet } from '../../../core/models/pet.model';
import { TutorService, TutorCreateUpdate } from '../services/tutor.service';

const PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class TutorFacade {
  private readonly listSubject = new BehaviorSubject<Tutor[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly totalSubject = new BehaviorSubject<number>(0);
  private readonly currentPageSubject = new BehaviorSubject<number>(0);
  private readonly selectedTutorSubject = new BehaviorSubject<Tutor | null>(null);
  private readonly tutorPetsSubject = new BehaviorSubject<Pet[]>([]);
  private readonly saveLoadingSubject = new BehaviorSubject<boolean>(false);

  readonly list$ = this.listSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly total$ = this.totalSubject.asObservable();
  readonly currentPage$ = this.currentPageSubject.asObservable();
  readonly selectedTutor$ = this.selectedTutorSubject.asObservable();
  readonly tutorPets$ = this.tutorPetsSubject.asObservable();
  readonly saveLoading$ = this.saveLoadingSubject.asObservable();

  private _searchTerm = '';
  private _currentPage = 0;

  constructor(
    private readonly tutorService: TutorService,
    private readonly router: Router
  ) {}

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
          this.currentPageSubject.next(this._currentPage);
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

  /** page: índice 0-based (página do servidor) */
  setPage(page: number): void {
    this._currentPage = page;
    this.loadTutores();
  }

  get totalPages(): number {
    const total = this.totalSubject.value;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }

  loadTutorById(id: number): void {
    this.errorSubject.next(null);
    this.loadingSubject.next(true);
    this.selectedTutorSubject.next(null);
    this.tutorPetsSubject.next([]);
    this.tutorService
      .getById(id)
      .pipe(
        tap((tutor) => {
          this.selectedTutorSubject.next(tutor);
          this.loadingSubject.next(false);
          this.loadPetsByTutor(id);
        }),
        catchError((err) => {
          this.loadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao carregar tutor.');
          return of(null);
        })
      )
      .subscribe();
  }

  private loadPetsByTutor(tutorId: number): void {
    this.tutorService.getPetsByTutor(tutorId).pipe(
      tap((pets) => this.tutorPetsSubject.next(pets ?? [])),
      catchError(() => {
        this.tutorPetsSubject.next([]);
        return of([]);
      })
    ).subscribe();
  }

  clearSelected(): void {
    this.selectedTutorSubject.next(null);
    this.tutorPetsSubject.next([]);
  }

  create(body: TutorCreateUpdate): void {
    this.errorSubject.next(null);
    this.saveLoadingSubject.next(true);
    this.tutorService
      .create(body)
      .pipe(
        tap((tutor) => {
          this.saveLoadingSubject.next(false);
          this.loadTutores();
          this.router.navigate(['/tutores', tutor.id]);
        }),
        catchError((err) => {
          this.saveLoadingSubject.next(false);
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao cadastrar tutor.');
          return of(null);
        })
      )
      .subscribe();
  }

  update(id: number, body: TutorCreateUpdate): void {
    this.errorSubject.next(null);
    this.saveLoadingSubject.next(true);
    this.tutorService
      .update(id, body)
      .pipe(
        tap((tutor) => {
          this.saveLoadingSubject.next(false);
          this.selectedTutorSubject.next(tutor);
          this.loadTutores();
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

  deleteTutor(id: number): void {
    this.errorSubject.next(null);
    this.tutorService
      .delete(id)
      .pipe(
        tap(() => {
          this.clearSelected();
          this.loadTutores();
          this.router.navigate(['/tutores']);
        }),
        catchError((err) => {
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao excluir tutor.');
          return of(null);
        })
      )
      .subscribe();
  }

  linkPet(tutorId: number, petId: number): void {
    this.errorSubject.next(null);
    this.tutorService
      .linkPet(tutorId, petId)
      .pipe(
        tap(() => this.loadPetsByTutor(tutorId)),
        catchError((err) => {
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao vincular pet.');
          return of(null);
        })
      )
      .subscribe();
  }

  unlinkPet(tutorId: number, petId: number): void {
    this.errorSubject.next(null);
    this.tutorService
      .unlinkPet(tutorId, petId)
      .pipe(
        tap(() => this.loadPetsByTutor(tutorId)),
        catchError((err) => {
          this.errorSubject.next(err?.error?.message ?? err?.message ?? 'Erro ao desvincular pet.');
          return of(null);
        })
      )
      .subscribe();
  }
}
