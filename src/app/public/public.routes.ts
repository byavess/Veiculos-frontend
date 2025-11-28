// src/app/public/public.routes.ts - CÓDIGO CORRIGIDO

import { Routes } from '@angular/router';
// Importa o Home, assumindo que está em ./home/home.ts




import { DetalhesVeiculos } from './detalhes-veiculos/detalhes-veiculos'; 
import { Home } from './home/home';

export const publicRoutes: Routes = [
  {
    path: 'home', // O segmento '/public/home' irá carregar este
    component: Home,
    title: 'Vitrine de Veículos'
  },
  {
    path: 'details/:id', // Rota para detalhes (usa o ID como parâmetro)
    component: DetalhesVeiculos,
    title: 'Detalhes do Veículo'
  },
  {
    path: '', // Redireciona a rota base '/public' para '/public/home'
    redirectTo: 'home',
    pathMatch: 'full'
  }
];