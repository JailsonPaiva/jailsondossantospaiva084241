import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  readonly error$ = this.tutoresFacade.error$;
  readonly saveLoading$ = this.tutoresFacade.saveLoading$;
  readonly removeFotoLoading$ = this.tutoresFacade.removeFotoLoading$;
  readonly uploadFotoLoading$ = this.tutoresFacade.uploadFotoLoading$;
  readonly selectedtutores$ = this.tutoresFacade.selectedtutores$;

  readonly isEdit = signal(false);
  readonly tutoresId = signal<number | null>(null);

  nome = '';
  email = '';
  endereco = '';
  /** Telefone exibido com máscara (XX) XXXXX-XXXX (máx. 11 dígitos) */
  telefoneDisplay = '';
  /** CPF exibido com máscara 000.000.000-00 (apenas 11 dígitos) */
  cpfDisplay = '';

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
            this.telefoneDisplay = this.formatTelefoneFromString(tutores.telefone ?? '');
            this.endereco = tutores.endereco ?? '';
            this.cpfDisplay = this.formatCpfFromNumber(tutores.cpf);
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (!this.isEdit()) return;
    this.tutoresFacade.clearSelected();
  }

  /** Aplica máscara (XX) XXXXX-XXXX e limita a 11 dígitos. */
  onTelefoneInput(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    this.telefoneDisplay = this.formatTelefoneMask(digits);
  }

  /** Formata dígitos no padrão (XX) XXXX-XXXX ou (XX) XXXXX-XXXX */
  private formatTelefoneMask(digits: string): string {
    if (digits.length <= 2) return digits ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  /** Converte string do backend (com ou sem formatação) para máscara de telefone. */
  private formatTelefoneFromString(telefone: string): string {
    const digits = telefone.replace(/\D/g, '').slice(0, 11);
    return this.formatTelefoneMask(digits);
  }

  /** Retorna apenas os dígitos do telefone para envio à API (máx. 11). */
  private getTelefoneValue(): string | undefined {
    const digits = this.telefoneDisplay.replace(/\D/g, '');
    return digits.length > 0 ? digits : undefined;
  }

  /** Aplica máscara 000.000.000-00 e limita a 11 dígitos. */
  onCpfInput(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    this.cpfDisplay = this.formatCpfMask(digits);
  }

  /** Formata dígitos no padrão 000.000.000-00 */
  private formatCpfMask(digits: string): string {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  }

  /** Converte número do backend para string mascarada (com zeros à esquerda). */
  private formatCpfFromNumber(cpf: number | null | undefined): string {
    if (cpf == null) return '';
    const digits = String(cpf).replace(/\D/g, '').padStart(11, '0').slice(-11);
    return this.formatCpfMask(digits);
  }

  /** Retorna apenas os dígitos do CPF (máx. 11) para envio à API. */
  private getCpfNumber(): number | undefined {
    const digits = this.cpfDisplay.replace(/\D/g, '');
    if (digits.length !== 11) return undefined;
    const n = parseInt(digits, 10);
    return isNaN(n) ? undefined : n;
  }

  removeFoto(tutorId: number, fotoId: number): void {
    this.tutoresFacade.removeFoto(tutorId, fotoId);
  }

  onPhotoSelected(event: Event, tutorId: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.tutoresFacade.uploadFoto(tutorId, file);
    }
    input.value = '';
  }

  onSubmit(): void {
    const id = this.tutoresId();
    const body: tutoresCreateUpdate = {
      nome: this.nome || undefined,
      email: this.email || undefined,
      telefone: this.getTelefoneValue(),
      endereco: this.endereco || undefined,
      cpf: this.getCpfNumber(),
    };
    if (id != null) {
      this.tutoresFacade.update(id, body);
    } else {
      this.tutoresFacade.create(body);
    }
  }
}
