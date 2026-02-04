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
  User,
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
    })
    ),
  ],
};
