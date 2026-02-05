import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, Subscription, debounceTime, switchMap } from 'rxjs';
import { filter, take } from 'rxjs';
import { PetFacade } from '../../../features/pets/facades/pet.facade';
import { PetCreateUpdate } from '../../../features/pets/services/pet.service';
import { tutoresService } from '../../../features/tutores/services/tutor.service';
import type { tutores } from '../../../core/models/tutor.model';

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
  private readonly tutoresService = inject(tutoresService);

  private readonly tutorSearchSubject = new Subject<string>();
  private tutorSearchSub?: Subscription;

  readonly error$ = this.petFacade.error$;
  readonly saveLoading$ = this.petFacade.saveLoading$;
  readonly selectedPet$ = this.petFacade.selectedPet$;

  readonly isEdit = signal(false);
  readonly petId = signal<number | null>(null);

  nome = '';
  raca = '';
  idade = '';
  tutoresId: number | undefined = undefined;

  tutorSearchInput = '';
  tutoresOptions: tutores[] = [];
  tutoresLoading = false;
  tutorDropdownOpen = false;
  selectedTutor: tutores | null = null;

  readonly title = computed(() => (this.isEdit() ? 'Editar pet' : 'Novo pet'));

  private loadTutorById(id: number): void {
    this.tutoresService.getById(id).pipe(take(1)).subscribe({
      next: (t) => {
        this.selectedTutor = t;
        this.tutorSearchInput = t.nome ?? '';
      },
      error: () => {
        this.selectedTutor = null;
        this.tutorSearchInput = '';
      },
    });
  }

  ngOnInit(): void {
    this.tutorSearchSub = this.tutorSearchSubject
      .pipe(
        debounceTime(300),
        switchMap((nome) => {
          this.tutoresLoading = true;
          return this.tutoresService.gettutores({ nome: nome || undefined, size: 20 });
        })
      )
      .subscribe({
        next: (res) => {
          this.tutoresOptions = res?.content ?? [];
          this.tutorDropdownOpen = true;
          this.tutoresLoading = false;
        },
        error: () => {
          this.tutoresOptions = [];
          this.tutoresLoading = false;
        },
      });

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
            this.raca = pet.raca ?? '';
            this.idade = pet.idade != null ? String(pet.idade) : '';
            this.tutoresId = pet.tutoresId;
            if (pet.tutoresId != null) this.loadTutorById(pet.tutoresId);
            else if (pet.tutores?.length) {
              const t = pet.tutores[0];
              this.selectedTutor = t;
              this.tutoresId = t.id;
              this.tutorSearchInput = t.nome ?? '';
            }
          }
        });
      }
    }
  }

  onTutorSearchChange(value: string): void {
    this.tutorSearchInput = value;
    if (!value.trim()) {
      this.tutoresOptions = [];
      this.tutorDropdownOpen = false;
      this.selectedTutor = null;
      this.tutoresId = undefined;
      return;
    }
    this.tutorSearchSubject.next(value.trim());
  }

  selectTutor(t: tutores): void {
    this.selectedTutor = t;
    this.tutoresId = t.id;
    this.tutorSearchInput = t.nome ?? '';
    this.tutorDropdownOpen = false;
    this.tutoresOptions = [];
  }

  clearTutor(): void {
    this.selectedTutor = null;
    this.tutoresId = undefined;
    this.tutorSearchInput = '';
    this.tutorDropdownOpen = false;
    this.tutoresOptions = [];
  }

  onTutorSearchBlur(): void {
    setTimeout(() => (this.tutorDropdownOpen = false), 200);
  }

  ngOnDestroy(): void {
    this.tutorSearchSub?.unsubscribe();
    if (this.isEdit()) this.petFacade.clearSelected();
  }

  onSubmit(): void {
    const id = this.petId();
    const body: PetCreateUpdate = {
      nome: this.nome || undefined,
      raca: this.raca || undefined,
      idade: this.idade || undefined,
      tutoresId: this.tutoresId,
    };
    if (id != null) {
      this.petFacade.update(id, body);
    } else {
      this.petFacade.create(body);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const id = this.petId();
    if (file && id != null) {
      this.petFacade.uploadPhoto(id, file);
    }
    input.value = '';
  }
}
