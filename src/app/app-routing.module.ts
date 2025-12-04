import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes
import { Home } from './home/home';
import { DetalhesVeiculos } from './detalhes-veiculos/detalhes-veiculos';
import { Login } from './auth/login/login';
import { AdminDashboardComponent } from './admin/dashboard/dashboard';
import { VeiculoFormComponent } from './admin/veiculo-form/veiculo-form';


// Guards
import { authGuard } from './guards/auth-guard';
import { EstoqueComponent } from './estoque/estoque';


const routes: Routes = [
  // Rota padrão - Home
  {
    path: '',
    component: Home
  },

  // Rota de detalhes do veículo
  {
    path: 'details/:id',
    component: DetalhesVeiculos
  },

  // Rota de login
  {
    path: 'login',
    component: Login
  },

   {
    path: 'estoque',
    component: EstoqueComponent
  },

  // Rotas administrativas (protegidas por guard)
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'veiculo/novo',
        component: VeiculoFormComponent
      },
      {
        path: 'veiculo/editar/:id',
        component: VeiculoFormComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Rota curinga - redireciona para home
  {
    path: '**',
    redirectTo: ''
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

