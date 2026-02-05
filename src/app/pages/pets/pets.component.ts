import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { PetFacade } from '../../features/pets/facades/pet.facade';
import { Pet } from '../../core/models/pet.model';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [RouterLink, AsyncPipe, FormsModule, LucideAngularModule],
  templateUrl: './pets.component.html',
  styleUrl: './pets.component.css',
})
export class PetsComponent implements OnInit, OnDestroy {
  private readonly petFacade = inject(PetFacade);
  private readonly destroy$ = new Subject<void>();

  readonly searchInput = signal('');
  readonly list = signal<Pet[]>([]);
  readonly list$ = this.petFacade.list$;
  readonly loading$ = this.petFacade.loading$;
  readonly error$ = this.petFacade.error$;

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
    this.petFacade.list$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.list.set(items);
      this.currentPage.set(1);
    });
    this.petFacade.loadPets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    this.petFacade.search(this.searchInput());
  }

  trackByPetId(_index: number, pet: Pet): number {
    return pet.id;
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }
}
