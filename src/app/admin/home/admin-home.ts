import {Component, OnInit, HostListener, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { LoginService } from '../../auth/login/loginService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: false,
  templateUrl: './admin-home.html',
  styleUrls: ['./admin-home.css']
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  filtroLivre: string = '';

  constructor(
    private loginService: LoginService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Força detecção de mudanças após um pequeno delay para garantir que filhos sejam carregados
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
  }


  limparFiltroLivre(): void {
    this.filtroLivre = '';
  }

  @HostListener('document:keydown.escape')
  onEscKey() {
    if (this.filtroLivre.length > 0) {
      this.limparFiltroLivre();
    }
  }
}
