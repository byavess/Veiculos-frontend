// src/app/app.routes.ts - CÓDIGO COMPLETO E CORRIGIDO
import { Routes } from '@angular/router';
// CORREÇÃO: Removendo o .ts para o Angular conseguir resolver o guarda
import { authGuard } from './guards/auth-guard' 

export const routes: Routes = [
  {
    path: 'public',
    loadChildren: () => import('./public/public.routes').then((m) => m.publicRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'public', pathMatch: 'full' },
  { path: '**', redirectTo: 'public' },
];