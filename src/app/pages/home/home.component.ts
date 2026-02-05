import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PetService } from '../../features/pets/services/pet.service';
import { Pet, PetsPageResponse } from '../../core/models/pet.model';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly petService = inject(PetService);
  private readonly auth = inject(AuthService);

  readonly recentPets = signal<Pet[]>([]);
  readonly recentPetsLoading = signal(true);
  readonly recentPetsError = signal<string | null>(null);

  readonly stats = [
    { value: '1.234', label: 'Cachorros', icon: 'dog' as const },
    { value: '856', label: 'Gatos', icon: 'cat' as const },
    { value: '342', label: 'Pássaros', icon: 'bird' as const },
    { value: 'Em breve', label: 'Adoções', icon: 'heart' as const },
  ];

  readonly features = [
    {
      title: 'Cadastro de Pets',
      description: 'Registre informações completas dos animais de estimação',
      icon: 'paw-print' as const,
    },
    {
      title: 'Gestão de tutores',
      description: 'Vincule tutores responsáveis aos seus pets',
      icon: 'users' as const,
    },
    {
      title: 'Busca Avançada',
      description: 'Encontre pets e tutores rapidamente no sistema',
      icon: 'search' as const,
    },
  ];

  ngOnInit(): void {
    this.recentPetsLoading.set(true);
    this.recentPetsError.set(null);
    if (!this.auth.isAuthenticated()) {
      this.recentPetsLoading.set(false);
      return;
    }
    this.petService.getPets({ page: 0, size: 4 }).subscribe({
      next: (res) => {
        const content = Array.isArray(res) ? res : (res as PetsPageResponse).content ?? [];
        this.recentPets.set(content);
        this.recentPetsLoading.set(false);
      },
      error: (err) => {
        this.recentPetsError.set(err?.error?.message ?? err?.message ?? 'Erro ao carregar pets recentes.');
        this.recentPetsLoading.set(false);
      },
    });
  }

  trackByPetId(_index: number, pet: Pet): number {
    return pet.id;
  }
}
