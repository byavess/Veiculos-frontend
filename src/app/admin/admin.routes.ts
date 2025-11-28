// src/app/admin/admin.routes.ts - CORRIGIDO
import { Routes } from '@angular/router';
// CORREÇÃO: Removendo o .component do caminho
import { authGuard } from '../guards/auth-guard'
import { VeiculoFormComponent } from './veiculo-form/veiculo-form';
import { AdminDashboardComponent } from './dashboard/dashboard';


export const adminRoutes: Routes = [
  { path: 'dashboard', component: AdminDashboardComponent,canActivate: [authGuard] },
  { path: 'veiculo-form', component: VeiculoFormComponent,canActivate: [authGuard] },
  { path: 'veiculo-form/:id', component: VeiculoFormComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];