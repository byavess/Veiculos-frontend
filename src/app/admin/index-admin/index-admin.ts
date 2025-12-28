import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LoginService} from '../../auth/login/loginService';

@Component({
  selector: 'app-index-admin',
  standalone: false,
  templateUrl: './index-admin.html',
  styleUrls: ['./index-admin.css']
})
export class IndexAdminComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private loginService: LoginService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // Se a URL não começa mais com /admin, faz logout
    if (!this.router.url.startsWith('/admin')) {
      this.loginService.logout();
    }
  }
}
