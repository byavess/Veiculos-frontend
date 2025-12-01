import { Routes } from '@angular/router';
import { Home } from './public/home/home';
import { DetalhesVeiculos } from './public/detalhes-veiculos/detalhes-veiculos';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'details/:id',
    component: DetalhesVeiculos
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];