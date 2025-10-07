import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule
  ],
  template: `
    <div *ngIf="authService.isLoggedIn(); else loginTemplate">
      <mat-sidenav-container class="admin-container">
        <mat-sidenav #sidenav mode="side" opened class="admin-sidenav">
          <div class="sidenav-header">
            <h2>Wear Your Stand</h2>
            <p>Admin Panel</p>
          </div>
          
          <mat-nav-list class="nav-list">
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active" (click)="sidenav.close()">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            
            <a mat-list-item routerLink="/products" routerLinkActive="active" (click)="sidenav.close()">
              <mat-icon matListItemIcon>inventory</mat-icon>
              <span matListItemTitle>Products</span>
            </a>
            
            <a mat-list-item routerLink="/orders" routerLinkActive="active" (click)="sidenav.close()">
              <mat-icon matListItemIcon>shopping_cart</mat-icon>
              <span matListItemTitle>Orders</span>
            </a>
            
            <a mat-list-item routerLink="/audit-log" routerLinkActive="active" (click)="sidenav.close()">
              <mat-icon matListItemIcon>history</mat-icon>
              <span matListItemTitle>Audit Log</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>
        
        <mat-sidenav-content class="admin-content">
          <mat-toolbar class="admin-toolbar">
            <button mat-icon-button (click)="sidenav.toggle()" class="menu-button">
              <mat-icon>menu</mat-icon>
            </button>
            <span class="toolbar-title">Wear Your Stand Admin</span>
            <span class="spacer"></span>
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-info">
                <p class="user-name">{{ authService.getCurrentUser()?.firstName }} {{ authService.getCurrentUser()?.lastName }}</p>
                <p class="user-email">{{ authService.getCurrentUser()?.email }}</p>
              </div>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </mat-toolbar>
          
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
    
    <ng-template #loginTemplate>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .admin-container {
      height: 100vh;
    }
    
    .admin-sidenav {
      width: 280px;
      background-color: #2c3e50;
      color: white;
    }
    
    .sidenav-header {
      padding: 24px 16px;
      border-bottom: 1px solid #34495e;
      text-align: center;
    }
    
    .sidenav-header h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #ecf0f1;
    }
    
    .sidenav-header p {
      margin: 0;
      color: #bdc3c7;
      font-size: 14px;
    }
    
    .nav-list {
      padding: 0;
    }
    
    .nav-list a {
      color: white !important;
      text-decoration: none;
      transition: background-color 0.3s;
    }
    
    .nav-list a:hover {
      background-color: #34495e;
      color: white !important;
    }
    
    .nav-list a.active {
      background-color: #3498db;
      color: white !important;
    }
    
    .nav-list a mat-icon {
      color: white !important;
    }
    
    .nav-list a.active mat-icon {
      color: white !important;
    }
    
    .nav-list a span {
      color: white !important;
    }
    
    .admin-content {
      background-color: #f5f5f5;
    }
    
    .admin-toolbar {
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 2;
    }
    
    .menu-button {
      margin-right: 16px;
    }
    
    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
      color: #2c3e50;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .content-wrapper {
      padding: 24px;
      min-height: calc(100vh - 64px);
    }
    
        .user-info {
          padding: 16px;
          border-bottom: 1px solid #eee;
        }
        
        .user-name {
          font-weight: 500;
          margin: 0 0 4px 0;
          color: #333;
        }
        
        .user-email {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .admin-sidenav {
            width: 100%;
          }
        }
      `]
    })
    export class AppComponent {
      constructor(
        public authService: AuthService,
        private router: Router
      ) {
        console.log('Admin Panel AppComponent initialized');
      }
      
      logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }














