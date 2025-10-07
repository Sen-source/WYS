import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: number;
  userId: number;
  userEmail: string;
  details: string;
  ipAddress?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private apiUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAuditLogs(): Observable<AuditLogEntry[]> {
    console.log('📋 AuditLogService - Fetching audit logs from:', this.apiUrl);
    return this.http.get<AuditLogEntry[]>(this.apiUrl);
  }

  getAuditLogsByEntity(entityType: string, entityId: number): Observable<AuditLogEntry[]> {
    console.log('📋 AuditLogService - Fetching audit logs by entity:', `${this.apiUrl}/entity/${entityType}/${entityId}`);
    return this.http.get<AuditLogEntry[]>(`${this.apiUrl}/entity/${entityType}/${entityId}`);
  }

  getAuditLogsByUser(userId: number): Observable<AuditLogEntry[]> {
    console.log('📋 AuditLogService - Fetching audit logs by user:', `${this.apiUrl}/user/${userId}`);
    return this.http.get<AuditLogEntry[]>(`${this.apiUrl}/user/${userId}`);
  }
}