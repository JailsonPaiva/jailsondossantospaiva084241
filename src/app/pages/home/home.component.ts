import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly stats = [
    { value: '1.234', label: 'Cachorros', icon: 'dog' as const },
    { value: '856', label: 'Gatos', icon: 'cat' as const },
    { value: '342', label: 'Pássaros', icon: 'bird' as const },
    { value: '2.105', label: 'Adoções', icon: 'heart' as const },
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
}
