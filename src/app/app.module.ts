import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppComponent } from './app';
import { AppRoutingModule } from './app-routing.module';

// Componentes
import { Header } from './header/header';
import { Home } from './home/home';
import { DetalhesVeiculos } from './detalhes-veiculos/detalhes-veiculos';
import { Login } from './auth/login/login';
import { AdminDashboardComponent } from './admin/dashboard/dashboard';
import { VeiculoEditarCadastrarComponent } from './admin/veiculo-editar-cadastrar/veiculo-editar-cadastrar';
import { AdminHomeComponent } from './admin/home/admin-home';
import { AdminVeiculoComponent } from './admin/veiculo/admin-veiculo';
import { IndexAdminComponent } from './admin/index-admin/index-admin';


// Services
import { VeiculoService } from './veiculo.service';
import { PlatformModule } from '@angular/cdk/platform';
import {ConfirmDialogComponent} from './shared/confirm-dialog.component';
import {MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {MatCheckbox} from '@angular/material/checkbox';
import {AuthErrorInterceptor} from './interceptors/auth-error.interceptor';

// Registrar locale pt-BR
registerLocaleData(localePt, 'pt');

@NgModule({
  declarations: [
    AppComponent,
    Header,
    Home,
    DetalhesVeiculos,
    Login,
    AdminDashboardComponent,
    VeiculoEditarCadastrarComponent,
    AdminHomeComponent,
    AdminVeiculoComponent,
    ConfirmDialogComponent,
    IndexAdminComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule, // Adicionado aqui
    // Angular Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    PlatformModule,
    MatCheckbox

  ],
  providers: [
    VeiculoService,
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
