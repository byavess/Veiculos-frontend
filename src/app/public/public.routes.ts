// src/app/public/public.routes.ts - CÓDIGO CORRIGIDO

import { Routes } from '@angular/router';
// Importa o Home, assumindo que está em ./home/home.ts
import { Home} from './home/home'; 

import { authGuard } from '../guards/auth-guard';
// O arquivo real é 'src/app/public/detalhes-veiculos/detalhes-veiculos.ts'
import { DetalhesVeiculos } from './detalhes-veiculos/detalhes-veiculos'; 

export const publicRoutes: Routes = [
  { path: 'home', component: Home },
  { path: 'details/:id', component: DetalhesVeiculos }, 
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];