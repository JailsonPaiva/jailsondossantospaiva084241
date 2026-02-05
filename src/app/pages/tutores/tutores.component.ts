import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { tutoresFacade } from '../../features/tutores/facades/tutor.facade';
import { tutores } from '../../core/models/tutor.model';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-tutores',
  standalone: true,
  imports: [RouterLink, AsyncPipe, UpperCasePipe, FormsModule, LucideAngularModule],
  templateUrl: './tutores.component.html',
  styleUrl: './tutores.component.css',
})
export class tutoresComponent implements OnInit, OnDestroy {
  private readonly tutoresFacade = inject(tutoresFacade);
  private subs = new Subscription();

  readonly searchInput = signal('');
  /** Lista de tutores em signal para atualização imediata da view */
  readonly list = signal<tutores[]>([]);
  /** Loading em signal para atualização imediata da view */
  readonly loading = signal(false);
  readonly error$ = this.tutoresFacade.error$;
  readonly total$ = this.tutoresFacade.total$;
  readonly currentPage$ = this.tutoresFacade.currentPage$;

  readonly pageSize = PAGE_SIZE;
  readonly total = signal(0);
  readonly currentPage0 = signal(0);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));
  readonly currentPageDisplay = computed(() => this.currentPage0() + 1);
  readonly paginationStart = computed(() => {
    const total = this.total();
    if (total === 0) return 0;
    return this.currentPage0() * this.pageSize + 1;
  });
  readonly paginationEnd = computed(() =>
    Math.min((this.currentPage0() + 1) * this.pageSize, this.total())
  );
  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  /** Tutor selecionado para exclusão (null = modal fechado) */
  readonly tutorToDelete = signal<tutores | null>(null);

  ngOnInit(): void {
    this.list.set([]);
    this.loading.set(true);
    this.subs.add(this.tutoresFacade.total$.subscribe((v) => this.total.set(v)));
    this.subs.add(this.tutoresFacade.currentPage$.subscribe((v) => this.currentPage0.set(v)));
    this.subs.add(this.tutoresFacade.list$.subscribe((items) => this.list.set(items ?? [])));
    this.subs.add(this.tutoresFacade.loading$.subscribe((v) => this.loading.set(v)));
    this.tutoresFacade.loadtutores();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSearch(): void {
    this.tutoresFacade.search(this.searchInput());
  }

  trackBytutoresId(_index: number, tutores: tutores): number {
    return tutores.id;
  }

  goToPage(pageDisplay: number): void {
    const page0 = Math.max(0, Math.min(pageDisplay - 1, this.totalPages() - 1));
    this.tutoresFacade.setPage(page0);
  }

  openDeleteModal(event: Event, tutor: tutores): void {
    event.preventDefault();
    event.stopPropagation();
    this.tutorToDelete.set(tutor);
  }

  closeDeleteModal(): void {
    this.tutorToDelete.set(null);
  }

  confirmDelete(): void {
    const tutor = this.tutorToDelete();
    if (tutor) {
      this.tutoresFacade.deletetutores(tutor.id);
      this.closeDeleteModal();
    }
  }
}
