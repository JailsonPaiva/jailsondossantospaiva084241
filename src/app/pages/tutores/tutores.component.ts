import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
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
export class tutoresComponent implements OnInit {
  private readonly tutoresFacade = inject(tutoresFacade);

  readonly searchInput = signal('');
  readonly list$ = this.tutoresFacade.list$;
  readonly loading$ = this.tutoresFacade.loading$;
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

  ngOnInit(): void {
    this.tutoresFacade.total$.subscribe((v) => this.total.set(v));
    this.tutoresFacade.currentPage$.subscribe((v) => this.currentPage0.set(v));
    this.tutoresFacade.loadtutores();
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
}
