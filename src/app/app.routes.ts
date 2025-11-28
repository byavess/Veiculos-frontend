import { Routes } from '@angular/router';
import { Home } from './public/home/home';
import { DetalhesVeiculos } from './public/detalhes-veiculos/detalhes-veiculos';

export const routes: Routes = [
  {
    path: 'public/home',
    component: Home
  },
  {
    path: 'public/details/:id',
    component: DetalhesVeiculos
  },
  {
    path: 'public',
    redirectTo: 'public/home',
    pathMatch: 'full'
  },
  { 
    path: '', 
    redirectTo: 'public/home', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'public/home' 
  }
];