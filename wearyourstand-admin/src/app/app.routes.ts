import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { AuditLogComponent } from './pages/audit-log/audit-log.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'products', 
    component: ProductsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'orders', 
    component: OrdersComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'audit-log', 
    component: AuditLogComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];














