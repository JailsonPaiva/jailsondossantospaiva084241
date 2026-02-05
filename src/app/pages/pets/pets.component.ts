import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { PetFacade } from '../../features/pets/facades/pet.facade';
import { Pet } from '../../core/models/pet.model';

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

  ngOnInit(): void {
    this.petFacade.list$.pipe(takeUntil(this.destroy$)).subscribe((items) => this.list.set(items));
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
}
