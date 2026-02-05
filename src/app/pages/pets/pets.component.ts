import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
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
export class PetsComponent implements OnInit {
  private readonly petFacade = inject(PetFacade);

  readonly searchInput = signal('');
  readonly list$ = this.petFacade.list$;
  readonly loading$ = this.petFacade.loading$;
  readonly error$ = this.petFacade.error$;
  readonly total$ = this.petFacade.total$;
  readonly currentPage$ = this.petFacade.currentPage$;

  readonly pageSize = PAGE_SIZE;
  readonly total = signal(0);
  readonly currentPage0 = signal(0);
  /** Número de páginas vindo da API (total/pageCount) ou calculado. */
  readonly totalPages = signal(1);
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
    this.petFacade.total$.subscribe((v) => this.total.set(v));
    this.petFacade.totalPages$.subscribe((v) => this.totalPages.set(v));
    this.petFacade.currentPage$.subscribe((v) => this.currentPage0.set(v));
    this.petFacade.loadPets();
  }

  onSearch(): void {
    this.petFacade.search(this.searchInput());
  }

  trackByPetId(_index: number, pet: Pet): number {
    return pet.id;
  }

  /** pageDisplay: número 1-based exibido ao usuário */
  goToPage(pageDisplay: number): void {
    const page0 = Math.max(0, Math.min(pageDisplay - 1, this.totalPages() - 1));
    this.petFacade.setPage(page0);
  }
}
