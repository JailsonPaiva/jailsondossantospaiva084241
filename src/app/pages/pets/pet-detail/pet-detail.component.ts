import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PetFacade } from '../../../features/pets/facades/pet.facade';
import { TelefoneMaskPipe } from '../../../core/pipes/telefone-mask.pipe';
import type { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, LucideAngularModule, TelefoneMaskPipe],
  templateUrl: './pet-detail.component.html',
  styleUrl: './pet-detail.component.css',
})
export class PetDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly petFacade = inject(PetFacade);

  readonly selectedPet$ = this.petFacade.selectedPet$;
  readonly loading$ = this.petFacade.loading$;
  readonly error$ = this.petFacade.error$;
  readonly deleteLoading$ = this.petFacade.deleteLoading$;

  /** Pet selecionado para exclusão (null = modal fechado) */
  readonly petToDelete = signal<Pet | null>(null);

  private _petId: number | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const num = id ? parseInt(id, 10) : NaN;
    if (!isNaN(num)) {
      this._petId = num;
      this.petFacade.loadPetById(num);
    }
  }

  ngOnDestroy(): void {
    this.petFacade.clearSelected();
  }

  get petId(): number | null {
    return this._petId;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && this._petId != null) {
      this.petFacade.uploadPhoto(this._petId, file);
    }
    input.value = '';
  }

  openDeleteModal(pet: Pet): void {
    this.petToDelete.set(pet);
  }

  closeDeleteModal(): void {
    this.petToDelete.set(null);
  }

  confirmDelete(): void {
    const pet = this.petToDelete();
    if (pet?.id != null) {
      this.petFacade.deletePet(pet.id);
      this.closeDeleteModal();
    }
  }
}
