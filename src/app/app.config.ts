import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  LucideAngularModule,
  PawPrint,
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Search,
  Dog,
  Cat,
  Bird,
  Heart,
  ArrowRight,
  ArrowLeft,
  User,
  Filter,
  Plus,
  Camera,
  Save,
  Trash2,
  Menu,
  X,
  Loader,
} from 'lucide-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      LucideAngularModule.pick({
      PawPrint,
      Activity,
      Mail,
      Lock,
      Eye,
      EyeOff,
      Users,
      Search,
      Dog,
      Cat,
      Bird,
      Heart,
      ArrowRight,
      User,
      Filter,
      Plus,
      ArrowLeft,
      Camera,
      Save,
      Trash2,
      Menu,
      X,
      Loader,
    })
    ),
  ],
};
