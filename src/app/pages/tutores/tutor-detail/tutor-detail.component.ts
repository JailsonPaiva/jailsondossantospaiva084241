import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { tutoresFacade } from '../../../features/tutores/facades/tutor.facade';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, FormsModule, LucideAngularModule],
  templateUrl: './tutor-detail.component.html',
  styleUrl: './tutor-detail.component.css',
})
export class tutoresDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tutoresFacade = inject(tutoresFacade);

  readonly selectedtutores$ = this.tutoresFacade.selectedtutores$;
  readonly tutoresPets$ = this.tutoresFacade.tutoresPets$;
  readonly loading$ = this.tutoresFacade.loading$;
  readonly error$ = this.tutoresFacade.error$;

  readonly petIdToLink = signal('');

  private _tutoresId: number | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const num = id ? parseInt(id, 10) : NaN;
    if (!isNaN(num)) {
      this._tutoresId = num;
      this.tutoresFacade.loadtutoresById(num);
    }
  }

  ngOnDestroy(): void {
    this.tutoresFacade.clearSelected();
  }

  get tutoresId(): number | null {
    return this._tutoresId;
  }

  onLinkPet(): void {
    const idStr = this.petIdToLink().trim();
    const petId = idStr ? parseInt(idStr, 10) : NaN;
    if (!isNaN(petId) && this._tutoresId != null) {
      this.tutoresFacade.linkPet(this._tutoresId, petId);
      this.petIdToLink.set('');
    }
  }

  onUnlinkPet(petId: number): void {
    if (this._tutoresId != null) {
      this.tutoresFacade.unlinkPet(this._tutoresId, petId);
    }
  }

  trackByPetId(_index: number, pet: Pet): number {
    return pet.id;
  }
}
