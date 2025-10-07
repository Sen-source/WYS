import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthTestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  testAdminEndpoint(): Observable<any> {
    console.log('🧪 AuthTestService - Testing admin endpoint:', `${this.apiUrl}/admin/stats`);
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }

  testOrdersEndpoint(): Observable<any> {
    console.log('🧪 AuthTestService - Testing orders endpoint:', `${this.apiUrl}/orders/admin`);
    return this.http.get(`${this.apiUrl}/orders/admin`);
  }

  testAuditLogsEndpoint(): Observable<any> {
    console.log('🧪 AuthTestService - Testing audit logs endpoint:', `${this.apiUrl}/audit-logs`);
    return this.http.get(`${this.apiUrl}/audit-logs`);
  }

  testUploadEndpoint(): Observable<any> {
    console.log('🧪 AuthTestService - Testing upload endpoint:', `${this.apiUrl}/admin/upload`);
    return this.http.get(`${this.apiUrl}/admin/upload`);
  }
}























