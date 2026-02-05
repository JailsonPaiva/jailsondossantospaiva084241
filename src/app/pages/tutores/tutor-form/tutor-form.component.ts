import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { filter, take } from 'rxjs';
import { TutorFacade } from '../../../features/tutores/facades/tutor.facade';
import { TutorCreateUpdate } from '../../../features/tutores/services/tutor.service';

@Component({
  selector: 'app-tutor-form',
  standalone: true,
  imports: [RouterLink, AsyncPipe, FormsModule, LucideAngularModule],
  templateUrl: './tutor-form.component.html',
  styleUrl: './tutor-form.component.css',
})
export class TutorFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tutorFacade = inject(TutorFacade);

  readonly error$ = this.tutorFacade.error$;
  readonly saveLoading$ = this.tutorFacade.saveLoading$;
  readonly selectedTutor$ = this.tutorFacade.selectedTutor$;

  readonly isEdit = signal(false);
  readonly tutorId = signal<number | null>(null);

  nome = '';
  email = '';
  telefone = '';
  endereco = '';
  cpf: number | undefined = undefined;

  readonly title = computed(() => (this.isEdit() ? 'Editar tutor' : 'Novo tutor'));

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.isEdit.set(true);
        this.tutorId.set(id);
        this.tutorFacade.loadTutorById(id);
        this.tutorFacade.selectedTutor$.pipe(filter((t) => t != null), take(1)).subscribe((tutor) => {
          if (tutor) {
            this.nome = tutor.nome ?? '';
            this.email = tutor.email ?? '';
            this.telefone = tutor.telefone ?? '';
            this.endereco = tutor.endereco ?? '';
            this.cpf = tutor.cpf;
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (!this.isEdit()) return;
    this.tutorFacade.clearSelected();
  }

  onSubmit(): void {
    const id = this.tutorId();
    const body: TutorCreateUpdate = {
      nome: this.nome || undefined,
      email: this.email || undefined,
      telefone: this.telefone || undefined,
      endereco: this.endereco || undefined,
      cpf: this.cpf,
    };
    if (id != null) {
      this.tutorFacade.update(id, body);
    } else {
      this.tutorFacade.create(body);
    }
  }
}
