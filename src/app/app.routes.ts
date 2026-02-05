import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
  { path: 'inicio', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
  { path: 'pets', loadComponent: () => import('./pages/pets/pets.component').then((m) => m.PetsComponent) },
  { path: 'pets/novo', loadComponent: () => import('./pages/pets/pet-form/pet-form.component').then((m) => m.PetFormComponent) },
  { path: 'pets/:id', loadComponent: () => import('./pages/pets/pet-detail/pet-detail.component').then((m) => m.PetDetailComponent) },
  { path: 'pets/:id/editar', loadComponent: () => import('./pages/pets/pet-form/pet-form.component').then((m) => m.PetFormComponent) },
  { path: 'tutores', loadComponent: () => import('./pages/tutores/tutores.component').then((m) => m.TutoresComponent) },
  { path: 'tutores/novo', loadComponent: () => import('./pages/tutores/tutor-form/tutor-form.component').then((m) => m.TutorFormComponent) },
  { path: 'tutores/:id', loadComponent: () => import('./pages/tutores/tutor-detail/tutor-detail.component').then((m) => m.TutorDetailComponent) },
  { path: 'tutores/:id/editar', loadComponent: () => import('./pages/tutores/tutor-form/tutor-form.component').then((m) => m.TutorFormComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
];
