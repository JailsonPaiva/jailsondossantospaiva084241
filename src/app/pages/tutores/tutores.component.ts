import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { TutorFacade } from '../../features/tutores/facades/tutor.facade';
import { Tutor } from '../../core/models/tutor.model';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-tutores',
  standalone: true,
  imports: [AsyncPipe, UpperCasePipe, FormsModule, LucideAngularModule],
  templateUrl: './tutores.component.html',
  styleUrl: './tutores.component.css',
})
export class TutoresComponent implements OnInit, OnDestroy {
  private readonly tutorFacade = inject(TutorFacade);
  private readonly destroy$ = new Subject<void>();

  readonly searchInput = signal('');
  readonly list = signal<Tutor[]>([]);
  readonly list$ = this.tutorFacade.list$;
  readonly loading$ = this.tutorFacade.loading$;
  readonly error$ = this.tutorFacade.error$;

  readonly pageSize = PAGE_SIZE;
  readonly currentPage = signal(1);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.list().length / this.pageSize)));
  readonly paginatedList = computed(() => {
    const items = this.list();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  });
  readonly paginationStart = computed(() => (this.currentPage() - 1) * this.pageSize + 1);
  readonly paginationEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.list().length)
  );
  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  ngOnInit(): void {
    this.tutorFacade.list$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.list.set(items);
      this.currentPage.set(1);
    });
    this.tutorFacade.loadTutores();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    this.tutorFacade.search(this.searchInput());
  }

  trackByTutorId(_index: number, tutor: Tutor): number {
    return tutor.id;
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }
}
