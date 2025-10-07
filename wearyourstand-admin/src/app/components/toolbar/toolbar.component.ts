import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar class="admin-toolbar">
      <button mat-icon-button (click)="toggleSidenav.emit()" class="menu-button">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="toolbar-title">Admin Dashboard</span>
      
      <span class="spacer"></span>
      
      <div class="toolbar-actions">
        <button mat-icon-button [matMenuTriggerFor]="notificationsMenu" class="notification-button">
          <mat-icon>notifications</mat-icon>
          <span class="notification-badge">3</span>
        </button>
        
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-button">
          <mat-icon>account_circle</mat-icon>
        </button>
      </div>
    </mat-toolbar>
    
    <mat-menu #notificationsMenu="matMenu">
      <div class="notification-header">
        <h3>Notifications</h3>
      </div>
      <mat-divider></mat-divider>
      <button mat-menu-item>
        <mat-icon>shopping_cart</mat-icon>
        <span>New order received</span>
      </button>
      <button mat-menu-item>
        <mat-icon>inventory_2</mat-icon>
        <span>Low stock alert</span>
      </button>
      <button mat-menu-item>
        <mat-icon>person_add</mat-icon>
        <span>New user registered</span>
      </button>
    </mat-menu>
    
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item>
        <mat-icon>person</mat-icon>
        <span>Profile</span>
      </button>
      <button mat-menu-item>
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item>
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .admin-toolbar {
      background-color: white;
      color: #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: relative;
      z-index: 1000;
    }
    
    .menu-button {
      margin-right: 16px;
    }
    
    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .notification-button {
      position: relative;
    }
    
    .notification-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: #ff4444;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .user-button {
      margin-left: 8px;
    }
    
    .notification-header {
      padding: 16px;
    }
    
    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
  `]
})
export class ToolbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
}
