import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { filter, take } from 'rxjs';
import { tutoresFacade } from '../../../features/tutores/facades/tutor.facade';
import { tutoresCreateUpdate } from '../../../features/tutores/services/tutor.service';

@Component({
  selector: 'app-tutor-form',
  standalone: true,
  imports: [RouterLink, AsyncPipe, FormsModule, LucideAngularModule],
  templateUrl: './tutor-form.component.html',
  styleUrl: './tutor-form.component.css',
})
export class tutoresFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tutoresFacade = inject(tutoresFacade);

  readonly error$ = this.tutoresFacade.error$;
  readonly saveLoading$ = this.tutoresFacade.saveLoading$;
  readonly selectedtutores$ = this.tutoresFacade.selectedtutores$;

  readonly isEdit = signal(false);
  readonly tutoresId = signal<number | null>(null);

  nome = '';
  email = '';
  telefone = '';
  endereco = '';
  cpf: number | undefined = undefined;

  readonly title = computed(() => (this.isEdit() ? 'Editar tutores' : 'Novo tutores'));

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.isEdit.set(true);
        this.tutoresId.set(id);
        this.tutoresFacade.loadtutoresById(id);
        this.tutoresFacade.selectedtutores$.pipe(filter((t) => t != null), take(1)).subscribe((tutores) => {
          if (tutores) {
            this.nome = tutores.nome ?? '';
            this.email = tutores.email ?? '';
            this.telefone = tutores.telefone ?? '';
            this.endereco = tutores.endereco ?? '';
            this.cpf = tutores.cpf ?? undefined;
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (!this.isEdit()) return;
    this.tutoresFacade.clearSelected();
  }

  onSubmit(): void {
    const id = this.tutoresId();
    const body: tutoresCreateUpdate = {
      nome: this.nome || undefined,
      email: this.email || undefined,
      telefone: this.telefone || undefined,
      endereco: this.endereco || undefined,
      cpf: this.cpf,
    };
    if (id != null) {
      this.tutoresFacade.update(id, body);
    } else {
      this.tutoresFacade.create(body);
    }
  }
}
