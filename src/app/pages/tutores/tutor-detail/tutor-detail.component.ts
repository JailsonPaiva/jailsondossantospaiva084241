import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TutorFacade } from '../../../features/tutores/facades/tutor.facade';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, FormsModule, LucideAngularModule],
  templateUrl: './tutor-detail.component.html',
  styleUrl: './tutor-detail.component.css',
})
export class TutorDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tutorFacade = inject(TutorFacade);

  readonly selectedTutor$ = this.tutorFacade.selectedTutor$;
  readonly tutorPets$ = this.tutorFacade.tutorPets$;
  readonly loading$ = this.tutorFacade.loading$;
  readonly error$ = this.tutorFacade.error$;

  readonly petIdToLink = signal('');

  private _tutorId: number | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const num = id ? parseInt(id, 10) : NaN;
    if (!isNaN(num)) {
      this._tutorId = num;
      this.tutorFacade.loadTutorById(num);
    }
  }

  ngOnDestroy(): void {
    this.tutorFacade.clearSelected();
  }

  get tutorId(): number | null {
    return this._tutorId;
  }

  onLinkPet(): void {
    const idStr = this.petIdToLink().trim();
    const petId = idStr ? parseInt(idStr, 10) : NaN;
    if (!isNaN(petId) && this._tutorId != null) {
      this.tutorFacade.linkPet(this._tutorId, petId);
      this.petIdToLink.set('');
    }
  }

  onUnlinkPet(petId: number): void {
    if (this._tutorId != null) {
      this.tutorFacade.unlinkPet(this._tutorId, petId);
    }
  }

  trackByPetId(_index: number, pet: Pet): number {
    return pet.id;
  }
}
