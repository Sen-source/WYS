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
import { OrdersService, Order, OrderStatusUpdate } from '../../services/orders.service';

@Component({
  selector: 'app-orders',
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
    <div class="orders-container">
      <div class="page-header">
        <h1 class="page-title">Orders</h1>
        <p class="page-subtitle">Manage customer orders</p>
      </div>
      
      <mat-card class="orders-card">
        <mat-card-content>
          <div class="table-container" *ngIf="!loading; else loadingSpinner">
            <table mat-table [dataSource]="dataSource" matSort class="orders-table">
              <!-- Order Number Column -->
              <ng-container matColumnDef="orderNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Order #</th>
                <td mat-cell *matCellDef="let order">{{ order.orderNumber }}</td>
              </ng-container>
              
              <!-- Customer Column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
                <td mat-cell *matCellDef="let order">{{ order.userId }}</td>
              </ng-container>
              
              <!-- Order Date Column -->
              <ng-container matColumnDef="orderDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let order">{{ order.orderDate | date:'short' }}</td>
              </ng-container>
              
              <!-- Total Column -->
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Total</th>
                <td mat-cell *matCellDef="let order">₱{{ order.total | number:'1.2-2' }}</td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let order">
                  <mat-chip [color]="getStatusColor(order.status)" selected>
                    {{ order.status }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let order">
                  <button mat-icon-button (click)="openOrderDetails(order)" matTooltip="View Order Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="updateOrderStatus(order.id, 'SHIPPED')" matTooltip="Mark as Shipped" *ngIf="order.status === 'PENDING'">
                    <mat-icon>local_shipping</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteOrder(order)" matTooltip="Delete Order" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons></mat-paginator>
          </div>
          
          <ng-template #loadingSpinner>
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Loading orders...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
    
    <!-- Order Details Dialog -->
    <div class="order-details-dialog" *ngIf="showDetailsDialog">
      <div class="dialog-overlay" (click)="closeDetailsDialog()"></div>
      <div class="dialog-content">
        <mat-card class="dialog-card">
          <mat-card-header>
            <mat-card-title>Order #{{ selectedOrder?.orderNumber }}</mat-card-title>
            <button mat-icon-button (click)="closeDetailsDialog()" class="close-button">
              <mat-icon>close</mat-icon>
            </button>
          </mat-card-header>
          
          <mat-card-content *ngIf="selectedOrder">
            <div class="detail-section">
              <h3>Customer Information</h3>
              <p><strong>User ID:</strong> {{ selectedOrder.userId }}</p>
            </div>
            
            <div class="detail-section" *ngIf="selectedOrder.shippingAddress">
              <h3>Shipping Address</h3>
              <p>{{ selectedOrder.shippingAddress?.street }}</p>
              <p>{{ selectedOrder.shippingAddress?.city }}, {{ selectedOrder.shippingAddress?.state }} {{ selectedOrder.shippingAddress?.zipCode }}</p>
              <p>{{ selectedOrder.shippingAddress?.country }}</p>
            </div>
            
            <div class="detail-section" *ngIf="selectedOrder.billingAddress">
              <h3>Billing Address</h3>
              <p>{{ selectedOrder.billingAddress?.street }}</p>
              <p>{{ selectedOrder.billingAddress?.city }}, {{ selectedOrder.billingAddress?.state }} {{ selectedOrder.billingAddress?.zipCode }}</p>
              <p>{{ selectedOrder.billingAddress?.country }}</p>
            </div>
            
            <div class="detail-section">
              <h3>Order Items</h3>
              <div class="order-items-list">
                <div *ngFor="let item of selectedOrder.orderItems" class="order-item-detail">
                  <img [src]="item.imageUrl || 'assets/placeholder.png'" alt="Product Image" class="item-image" 
                       (error)="$event.target.src='assets/placeholder.png'">
                  <div class="item-info">
                    <span class="item-name">{{ item.productName }}</span>
                    <span class="item-quantity">Quantity: {{ item.quantity }}</span>
                    <span class="item-price">₱{{ item.total | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Order Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <label>Subtotal:</label>
                  <span>₱{{ selectedOrder.subtotal | number:'1.2-2' }}</span>
                </div>
                <div class="summary-item">
                  <label>Tax:</label>
                  <span>₱{{ selectedOrder.tax | number:'1.2-2' }}</span>
                </div>
                <div class="summary-item">
                  <label>Shipping:</label>
                  <span>₱{{ selectedOrder.shippingCost | number:'1.2-2' }}</span>
                </div>
                <div class="summary-item total">
                  <label>Total:</label>
                  <span>₱{{ selectedOrder.total | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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
    
    .orders-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .orders-table {
      width: 100%;
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
    
    .order-details-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .dialog-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }
    
    .dialog-content {
      position: relative;
      z-index: 1001;
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .dialog-card {
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    
    .dialog-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
    }
    
    .close-button {
      margin-left: auto;
    }
    
    .detail-section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
    }
    
    .detail-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .detail-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin-top: 0;
      margin-bottom: 12px;
    }
    
    .order-items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .order-item-detail {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      background: #fff;
    }
    
    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .item-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    
    .item-name {
      font-weight: 500;
      color: #333;
    }
    
    .item-quantity {
      font-size: 12px;
      color: #666;
    }
    
    .item-price {
      font-weight: 600;
      color: #27ae60;
      margin-left: auto;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      max-width: 300px;
      margin-left: auto;
      padding-top: 16px;
      border-top: 1px dashed #eee;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    
    .summary-item label {
      font-weight: 500;
      color: #555;
    }
    
    .summary-item span {
      color: #333;
    }
    
    .summary-item.total {
      font-size: 16px;
      font-weight: 600;
      border-top: 1px solid #ddd;
      padding-top: 8px;
      margin-top: 8px;
    }
    
    .summary-item.total span {
      color: #27ae60;
    }
  `]
})
export class OrdersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = ['orderNumber', 'customer', 'orderDate', 'total', 'status', 'actions'];
  dataSource = new MatTableDataSource<Order>([]);
  
  loading = false;
  showDetailsDialog = false;
  selectedOrder: Order | null = null;
  
  constructor(
    private ordersService: OrdersService,
    private snackBar: MatSnackBar
  ) { }
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders() {
    this.loading = true;
    console.log('🔄 Loading orders...');
    this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        console.log('📦 Orders loaded:', orders.length, 'orders');
        console.log('📦 Orders data:', orders);
        this.dataSource.data = orders;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
  
  openOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.showDetailsDialog = true;
  }
  
  closeDetailsDialog() {
    this.showDetailsDialog = false;
    this.selectedOrder = null;
  }
  
  updateOrderStatus(orderId: number, status: string) {
    this.ordersService.updateOrderStatus(orderId, { status }).subscribe({
      next: (updatedOrder) => {
        this.snackBar.open(`Order #${updatedOrder.orderNumber} status updated to ${updatedOrder.status}`, 'Close', { duration: 3000 });
        this.loadOrders();
        if (this.selectedOrder && this.selectedOrder.id === orderId) {
          this.selectedOrder.status = updatedOrder.status;
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.snackBar.open('Error updating order status', 'Close', { duration: 3000 });
      }
    });
  }
  
  deleteOrder(order: Order) {
    if (confirm(`Are you sure you want to delete order #${order.orderNumber}? This action cannot be undone.`)) {
      this.ordersService.deleteOrder(order.id).subscribe({
        next: (response) => {
          console.log('Delete order response:', response);
          this.snackBar.open(`Order #${order.orderNumber} has been deleted successfully.`, 'Close', { duration: 5000 });
          // Reload the orders list to reflect the deletion
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          console.error('Error details:', error.error);
          
          let errorMessage = 'Failed to delete order. Please try again.';
          
          if (error.status === 404) {
            errorMessage = 'Order not found.';
          } else if (error.status === 400) {
            errorMessage = error.error || 'Cannot delete this order.';
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'shipped':
        return 'primary';
      case 'pending':
      case 'processing':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return 'accent';
    }
  }
}