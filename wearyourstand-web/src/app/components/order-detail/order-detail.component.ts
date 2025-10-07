import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule, 
    MatSnackBarModule, 
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(+orderId);
    } else {
      this.loading = false;
      this.snackBar.open('Invalid order ID', 'Close', { duration: 3000 });
      this.router.navigate(['/orders']);
    }
  }

  loadOrderDetails(orderId: number): void {
    this.loading = true;
    
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading order details:', error);
        this.snackBar.open('Failed to load order details. Please try again.', 'Close', { duration: 5000 });
        this.router.navigate(['/orders']);
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
      case 'pending':
        return 'warn';
      default:
        return 'basic';
    }
  }

  getPaymentStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'primary';
      case 'pending':
        return 'warn';
      default:
        return 'basic';
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}










