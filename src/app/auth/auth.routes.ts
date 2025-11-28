// src/app/auth/auth.routes.ts - CORRIGIDO
import { Routes } from '@angular/router';
// CORREÇÃO: Removendo o .component do caminho
import { Login } from './login/login'; 


export const authRoutes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
];