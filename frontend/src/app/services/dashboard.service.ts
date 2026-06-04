import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CategoryTotal,
  DashboardOverview,
  MonthlyTotal
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getOverview(startDate?: string, endDate?: string): Observable<DashboardOverview> {
    const params = this.buildParams(startDate, endDate);
    return this.http.get<DashboardOverview>(`${this.baseUrl}/overview`, { params });
  }

  getMonthlyExpenses(year?: number): Observable<MonthlyTotal[]> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year);
    }
    return this.http.get<MonthlyTotal[]>(`${this.baseUrl}/monthly-expenses`, { params });
  }

  getExpensesByCategory(startDate?: string, endDate?: string): Observable<CategoryTotal[]> {
    const params = this.buildParams(startDate, endDate);
    return this.http.get<CategoryTotal[]>(`${this.baseUrl}/expenses-by-category`, { params });
  }

  private buildParams(startDate?: string, endDate?: string): HttpParams {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return params;
  }
}
