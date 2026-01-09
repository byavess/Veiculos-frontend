import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes
import { Home } from './home/home';
import { DetalhesVeiculos } from './detalhes-veiculos/detalhes-veiculos';
import { Login } from './auth/login/login';
import { AdminDashboardComponent } from './admin/dashboard/dashboard';
import { VeiculoEditarCadastrarComponent } from './admin/veiculo-editar-cadastrar/veiculo-editar-cadastrar';
import { AdminHomeComponent } from './admin/home/admin-home';
import { AdminVeiculoComponent } from './admin/veiculo/admin-veiculo';
import { IndexAdminComponent } from './admin/index-admin/index-admin';


// Guards
import { AuthGuard } from './guards/auth-guard';



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

  // Rotas administrativas (protegidas por guard)
  {
    path: 'admin',
    component: IndexAdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        component: AdminHomeComponent,
        canActivate: [AuthGuard] // ✅ Guard em cada rota filha
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard] // ✅ Guard em cada rota filha
      },
      {
        path: 'veiculo/novo',
        component: VeiculoEditarCadastrarComponent,
        canActivate: [AuthGuard] // ✅ Guard em cada rota filha
      },
      {
        path: 'veiculo/editar/:id',
        component: VeiculoEditarCadastrarComponent,
        canActivate: [AuthGuard] // ✅ Guard em cada rota filha
      },
      {
        path: 'veiculo',
        component: AdminVeiculoComponent,
        canActivate: [AuthGuard] // ✅ Guard em cada rota filha
      },
      {
        path: '',
        redirectTo: 'home',
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
