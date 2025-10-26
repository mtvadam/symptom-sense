import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component').then((m) => m.ChatComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
