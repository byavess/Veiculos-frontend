import {Component, OnInit, HostListener, OnDestroy} from '@angular/core';
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

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {}

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
