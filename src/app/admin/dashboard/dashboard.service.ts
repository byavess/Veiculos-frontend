import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {IDashboardData} from '../../interfaces/IDashboardData';


@Injectable({providedIn: 'root'})
export class DashboardService {
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {
  }

  getDashboardData(): Observable<IDashboardData> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<IDashboardData>(this.apiUrl, {headers});
  }
}
