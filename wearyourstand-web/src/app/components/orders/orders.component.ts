import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';
import { OrderService, Order } from '../../services/order.service';

// Using Order interface from order.service.ts

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.loading = false;
      this.snackBar.open('Please log in to view your orders', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading orders:', error);
        this.snackBar.open('Failed to load orders. Please try again.', 'Close', { duration: 5000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'primary';
      case 'shipped':
        return 'accent';
      case 'processing':
        return 'warn';
      default:
        return 'basic';
    }
  }

  viewOrderDetails(order: Order): void {
    // Navigate to order details page
    this.router.navigate(['/orders', order.id]);
  }

  reorder(order: Order): void {
    this.snackBar.open(`Reordering items from order ${order.orderNumber}`, 'Close', { duration: 3000 });
    // TODO: Add items to cart functionality when implemented
  }

  canCancelOrder(order: Order): boolean {
    // Can cancel if order is not delivered, cancelled, or returned
    const nonCancellableStatuses = ['DELIVERED', 'CANCELLED', 'RETURNED'];
    return !nonCancellableStatuses.includes(order.status.toUpperCase());
  }

  cancelOrder(order: Order): void {
    // Show confirmation dialog
    if (confirm(`Are you sure you want to cancel order #${order.orderNumber}? This action cannot be undone.`)) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: (response) => {
          console.log('Cancel order response:', response);
          this.snackBar.open(`Order #${order.orderNumber} has been cancelled successfully.`, 'Close', { duration: 5000 });
          // Reload orders to reflect the change
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          console.error('Error details:', error.error);
          
          let errorMessage = 'Failed to cancel order. Please try again.';
          
          if (error.status === 404) {
            errorMessage = 'Order not found.';
          } else if (error.status === 403) {
            errorMessage = 'You can only cancel your own orders.';
          } else if (error.status === 400) {
            errorMessage = error.error || 'Cannot cancel this order.';
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }
}