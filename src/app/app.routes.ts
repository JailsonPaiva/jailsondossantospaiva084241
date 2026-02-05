import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
  { path: 'inicio', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
  { path: 'pets', loadComponent: () => import('./pages/pets/pets.component').then((m) => m.PetsComponent) },
  { path: 'tutores', loadComponent: () => import('./pages/tutores/tutores.component').then((m) => m.TutoresComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
];
