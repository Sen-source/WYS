import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuditLogService, AuditLogEntry } from '../../services/audit-log.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="audit-log-container">
      <div class="page-header">
        <h1 class="page-title">Audit Log</h1>
        <p class="page-subtitle">Track all system activities and changes</p>
      </div>
      
      <mat-card class="audit-log-card">
        <mat-card-content>
          <!-- Filters -->
          <div class="filters-section">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter by Action</mat-label>
              <mat-select [(value)]="selectedAction" (selectionChange)="applyFilters()">
                <mat-option value="">All Actions</mat-option>
                <mat-option value="CREATE">Create</mat-option>
                <mat-option value="UPDATE">Update</mat-option>
                <mat-option value="DELETE">Delete</mat-option>
                <mat-option value="LOGIN">Login</mat-option>
                <mat-option value="LOGOUT">Logout</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter by Entity</mat-label>
              <mat-select [(value)]="selectedEntity" (selectionChange)="applyFilters()">
                <mat-option value="">All Entities</mat-option>
                <mat-option value="PRODUCT">Product</mat-option>
                <mat-option value="ORDER">Order</mat-option>
                <mat-option value="USER">User</mat-option>
                <mat-option value="CART">Cart</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search by user or details">
            </mat-form-field>
            
            <button mat-button (click)="clearFilters()" class="clear-filters-btn">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
          
          <div class="table-container" *ngIf="!loading; else loadingSpinner">
            <table mat-table [dataSource]="dataSource" matSort class="audit-log-table">
              <!-- Timestamp Column -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Timestamp</th>
                <td mat-cell *matCellDef="let entry">{{ entry.timestamp | date:'short' }}</td>
              </ng-container>
              
              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Action</th>
                <td mat-cell *matCellDef="let entry">
                  <mat-chip [color]="getActionColor(entry.action)" selected>
                    {{ entry.action }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <!-- Entity Type Column -->
              <ng-container matColumnDef="entityType">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Entity</th>
                <td mat-cell *matCellDef="let entry">
                  <mat-chip color="primary" selected>
                    {{ entry.entityType }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <!-- Entity ID Column -->
              <ng-container matColumnDef="entityId">
                <th mat-header-cell *matHeaderCellDef>Entity ID</th>
                <td mat-cell *matCellDef="let entry">{{ entry.entityId }}</td>
              </ng-container>
              
              <!-- User Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let entry">
                  <div class="user-info">
                    <div class="user-email">{{ entry.userEmail }}</div>
                    <div class="user-id">ID: {{ entry.userId }}</div>
                  </div>
                </td>
              </ng-container>
              
              <!-- Details Column -->
              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef>Details</th>
                <td mat-cell *matCellDef="let entry">
                  <div class="details-content" [matTooltip]="entry.details">
                    {{ entry.details | slice:0:50 }}{{ entry.details.length > 50 ? '...' : '' }}
                  </div>
                </td>
              </ng-container>
              
              <!-- IP Address Column -->
              <ng-container matColumnDef="ipAddress">
                <th mat-header-cell *matHeaderCellDef>IP Address</th>
                <td mat-cell *matCellDef="let entry">{{ entry.ipAddress || 'N/A' }}</td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
          </div>
          
          <ng-template #loadingSpinner>
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Loading audit log...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .audit-log-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 24px;
    }
    
    .page-title {
      font-size: 32px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 8px 0;
    }
    
    .page-subtitle {
      color: #666;
      margin: 0;
      font-size: 16px;
    }
    
    .audit-log-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .filters-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .filter-field {
      min-width: 150px;
    }
    
    .clear-filters-btn {
      margin-left: auto;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .audit-log-table {
      width: 100%;
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
    }
    
    .user-email {
      font-weight: 500;
      color: #333;
    }
    
    .user-id {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }
    
    .details-content {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
    }
    
    .loading-container p {
      margin: 0;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .clear-filters-btn {
        margin-left: 0;
        margin-top: 8px;
      }
    }
  `]
})
export class AuditLogComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = ['timestamp', 'action', 'entityType', 'entityId', 'user', 'details', 'ipAddress'];
  dataSource = new MatTableDataSource<AuditLogEntry>([]);
  
  allEntries: AuditLogEntry[] = [];
  filteredEntries: AuditLogEntry[] = [];
  
  selectedAction = '';
  selectedEntity = '';
  searchTerm = '';
  
  loading = false;
  
  constructor(
    private auditLogService: AuditLogService,
    private snackBar: MatSnackBar
  ) {
    console.log('AuditLogComponent initialized');
  }
  
  ngOnInit() {
    this.loadAuditLogs();
  }
  
  loadAuditLogs() {
    this.loading = true;
    this.auditLogService.getAuditLogs().subscribe({
      next: (entries) => {
        this.allEntries = entries;
        this.filteredEntries = [...entries];
        this.dataSource.data = this.filteredEntries;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.snackBar.open('Error loading audit logs', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
  
  applyFilters() {
    this.filteredEntries = this.allEntries.filter(entry => {
      const matchesAction = !this.selectedAction || entry.action === this.selectedAction;
      const matchesEntity = !this.selectedEntity || entry.entityType === this.selectedEntity;
      const matchesSearch = !this.searchTerm || 
        entry.userEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesAction && matchesEntity && matchesSearch;
    });
    
    this.dataSource.data = this.filteredEntries;
  }
  
  clearFilters() {
    this.selectedAction = '';
    this.selectedEntity = '';
    this.searchTerm = '';
    this.applyFilters();
  }
  
  getActionColor(action: string): 'primary' | 'accent' | 'warn' {
    switch (action.toLowerCase()) {
      case 'create':
        return 'primary';
      case 'update':
        return 'accent';
      case 'delete':
        return 'warn';
      case 'login':
        return 'primary';
      case 'logout':
        return 'accent';
      default:
        return 'accent';
    }
  }
}