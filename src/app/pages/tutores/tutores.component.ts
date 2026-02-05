import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TutorFacade } from '../../features/tutores/facades/tutor.facade';
import { Tutor } from '../../core/models/tutor.model';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-tutores',
  standalone: true,
  imports: [RouterLink, AsyncPipe, UpperCasePipe, FormsModule, LucideAngularModule],
  templateUrl: './tutores.component.html',
  styleUrl: './tutores.component.css',
})
export class TutoresComponent implements OnInit {
  private readonly tutorFacade = inject(TutorFacade);

  readonly searchInput = signal('');
  readonly list$ = this.tutorFacade.list$;
  readonly loading$ = this.tutorFacade.loading$;
  readonly error$ = this.tutorFacade.error$;
  readonly total$ = this.tutorFacade.total$;
  readonly currentPage$ = this.tutorFacade.currentPage$;

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

  ngOnInit(): void {
    this.tutorFacade.total$.subscribe((v) => this.total.set(v));
    this.tutorFacade.currentPage$.subscribe((v) => this.currentPage0.set(v));
    this.tutorFacade.loadTutores();
  }

  onSearch(): void {
    this.tutorFacade.search(this.searchInput());
  }

  trackByTutorId(_index: number, tutor: Tutor): number {
    return tutor.id;
  }

  goToPage(pageDisplay: number): void {
    const page0 = Math.max(0, Math.min(pageDisplay - 1, this.totalPages() - 1));
    this.tutorFacade.setPage(page0);
  }
}
