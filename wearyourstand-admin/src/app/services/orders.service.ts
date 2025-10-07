import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number; // Add user ID field
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  orderItems?: OrderItem[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string; // Add product image URL
  quantity: number;
  price: number;
  total: number;
}

export interface OrderStatusUpdate {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    console.log('📦 OrdersService - Fetching all orders from:', `${this.apiUrl}/admin`);
    return this.http.get<Order[]>(`${this.apiUrl}/admin`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: number, status: OrderStatusUpdate): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, status);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/admin/orders/${id}`);
  }
}