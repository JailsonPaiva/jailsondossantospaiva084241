import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { filter, take } from 'rxjs';
import { PetFacade } from '../../../features/pets/facades/pet.facade';
import { PetCreateUpdate } from '../../../features/pets/services/pet.service';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [RouterLink, AsyncPipe, FormsModule, LucideAngularModule],
  templateUrl: './pet-form.component.html',
  styleUrl: './pet-form.component.css',
})
export class PetFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly petFacade = inject(PetFacade);

  readonly error$ = this.petFacade.error$;
  readonly saveLoading$ = this.petFacade.saveLoading$;
  readonly selectedPet$ = this.petFacade.selectedPet$;

  readonly isEdit = signal(false);
  readonly petId = signal<number | null>(null);

  nome = '';
  especie = '';
  raca = '';
  idade = '';
  tutorId: number | undefined = undefined;

  readonly title = computed(() => (this.isEdit() ? 'Editar pet' : 'Novo pet'));

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.isEdit.set(true);
        this.petId.set(id);
        this.petFacade.loadPetById(id);
        this.petFacade.selectedPet$.pipe(filter((p) => p != null), take(1)).subscribe((pet) => {
          if (pet) {
            this.nome = pet.nome ?? '';
            this.especie = pet.especie ?? '';
            this.raca = pet.raca ?? '';
            this.idade = pet.idade ?? '';
            this.tutorId = pet.tutorId;
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (!this.isEdit()) return;
    this.petFacade.clearSelected();
  }

  onSubmit(): void {
    const id = this.petId();
    const body: PetCreateUpdate = {
      nome: this.nome || undefined,
      especie: this.especie || undefined,
      raca: this.raca || undefined,
      idade: this.idade || undefined,
      tutorId: this.tutorId,
    };
    if (id != null) {
      this.petFacade.update(id, body);
    } else {
      this.petFacade.create(body);
    }
  }
}
