import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {DashboardService} from './dashboard.service';
import {IDashboardData} from '../../interfaces/IDashboardData';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  dashboardData: IDashboardData | null = null;
  loading = true;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;

        // Força detecção de mudanças
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erro ao carregar dados do dashboard';
        this.loading = false;

        // Força detecção de mudanças
        this.cdr.detectChanges();
      }
    });
  }
}
