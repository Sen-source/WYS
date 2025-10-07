import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <div class="sidenav-header">
      <div class="logo">
        <mat-icon class="logo-icon">admin_panel_settings</mat-icon>
        <div class="logo-text">
          <h2>Wear Your Stand</h2>
          <p>Admin Panel</p>
        </div>
      </div>
    </div>
    
    <mat-nav-list class="nav-list">
      <a mat-list-item routerLink="/dashboard" routerLinkActive="active" class="nav-item">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </a>
      
      <a mat-list-item routerLink="/products" routerLinkActive="active" class="nav-item">
        <mat-icon matListItemIcon>inventory_2</mat-icon>
        <span matListItemTitle>Products</span>
      </a>
      
      <a mat-list-item routerLink="/orders" routerLinkActive="active" class="nav-item">
        <mat-icon matListItemIcon>shopping_cart</mat-icon>
        <span matListItemTitle>Orders</span>
      </a>
      
      <a mat-list-item routerLink="/audit-log" routerLinkActive="active" class="nav-item">
        <mat-icon matListItemIcon>history</mat-icon>
        <span matListItemTitle>Audit Log</span>
      </a>
    </mat-nav-list>
    
    <div class="sidenav-footer">
      <div class="user-info">
        <mat-icon>person</mat-icon>
        <div class="user-details">
          <span class="user-name">Admin User</span>
          <span class="user-role">Administrator</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidenav-header {
      padding: 24px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      font-size: 32px;
      color: #ff4444;
    }
    
    .logo-text h2 {
      margin: 0;
      color: white;
      font-size: 18px;
      font-weight: 600;
    }
    
    .logo-text p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
    }
    
    .nav-list {
      padding: 16px 0;
    }
    
    .nav-item {
      color: rgba(255, 255, 255, 0.8);
      margin: 4px 8px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .nav-item.active {
      background-color: #ff4444;
      color: white;
    }
    
    .nav-item mat-icon {
      color: inherit;
    }
    
    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 500;
      font-size: 14px;
    }
    
    .user-role {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
  `]
})
export class SidenavComponent {}



























