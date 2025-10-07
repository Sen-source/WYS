import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AdminStatsService, AdminStats } from '../../services/admin-stats.service';
import { ProductsService } from '../../services/products.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to the Wear Your Stand Admin Panel</p>
      </div>
      
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading dashboard data...</p>
      </div>
      
      <div *ngIf="!loading" class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">inventory</mat-icon>
                <div class="stat-info">
                  <h3>{{ stats.totalProducts }}</h3>
                  <p>Total Products</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">shopping_cart</mat-icon>
                <div class="stat-info">
                  <h3>{{ stats.totalOrders }}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">payments</mat-icon>
                <div class="stat-info">
                  <h3>₱{{ stats.totalRevenue | number:'1.2-2' }}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">people</mat-icon>
                <div class="stat-info">
                  <h3>{{ stats.totalCustomers }}</h3>
                  <p>Total Customers</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <!-- Recent Orders -->
        <mat-card class="recent-orders-card">
          <mat-card-header>
            <mat-card-title>Recent Orders</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentOrders.length === 0" class="no-data">
              <mat-icon>shopping_cart</mat-icon>
              <p>No recent orders</p>
            </div>
            <div *ngIf="recentOrders.length > 0" class="orders-list">
              <div *ngFor="let order of recentOrders" class="order-item">
                <div class="order-info">
                  <span class="order-number">#{{ order.orderNumber }}</span>
                  <span class="order-date">{{ order.orderDate | date:'short' }}</span>
                </div>
                <div class="order-details">
                  <span class="order-total">₱{{ order.total | number:'1.2-2' }}</span>
                  <mat-chip [color]="getStatusColor(order.status)" selected>
                    {{ order.status }}
                  </mat-chip>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-header {
      margin-bottom: 32px;
    }
    
    .dashboard-header h1 {
      font-size: 32px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 8px 0;
    }
    
    .dashboard-header p {
      color: #666;
      margin: 0;
      font-size: 16px;
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
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3498db;
    }
    
    .stat-info h3 {
      font-size: 32px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 4px 0;
    }
    
    .stat-info p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    
    .recent-orders-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: #666;
    }
    
    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #fafafa;
    }
    
    .order-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .order-number {
      font-weight: 600;
      color: #2c3e50;
    }
    
    .order-date {
      font-size: 12px;
      color: #666;
    }
    
    .order-details {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .order-total {
      font-weight: 600;
      color: #27ae60;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: AdminStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: []
  };
  
  recentOrders: any[] = [];
  loading = false;
  
  constructor(
    private adminStatsService: AdminStatsService,
    private productsService: ProductsService,
    private ordersService: OrdersService
  ) {
    console.log('DashboardComponent initialized');
  }
  
  ngOnInit(): void {
    console.log('DashboardComponent ngOnInit called');
    this.loadStats();
  }
  
  loadStats() {
    this.loading = true;
    
    // Load basic stats
    this.adminStatsService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        // Fallback to basic data
        this.loadFallbackData();
        this.loading = false;
      }
    });
    
    // Load recent orders
    this.adminStatsService.getRecentOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders;
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
        this.recentOrders = [];
      }
    });
  }
  
  loadFallbackData() {
    // Load basic product count as fallback
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.stats.totalProducts = products.length;
      },
      error: (error) => {
        console.error('Error loading products for fallback:', error);
      }
    });
    
    // Load basic order count as fallback
    this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        this.stats.totalOrders = orders.length;
        this.stats.totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        this.recentOrders = orders.slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading orders for fallback:', error);
      }
    });
  }
  
  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'shipped':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return 'accent';
    }
  }
}