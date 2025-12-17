import {Component, OnInit} from '@angular/core';
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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar dados do dashboard';
        this.loading = false;
      }
    });
  }
}
