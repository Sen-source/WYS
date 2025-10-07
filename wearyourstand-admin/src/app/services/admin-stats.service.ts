import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: any[];
  topProducts: any[];
  monthlyRevenue: any[];
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    console.log('📊 AdminStatsService - Fetching admin stats from:', `${this.apiUrl}/stats`);
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getRecentOrders(): Observable<any[]> {
    console.log('📊 AdminStatsService - Fetching recent orders from:', `${this.apiUrl}/recent-orders`);
    return this.http.get<any[]>(`${this.apiUrl}/recent-orders`);
  }

  getTopProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-products`);
  }

  getMonthlyRevenue(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/monthly-revenue`);
  }
}