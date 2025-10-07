import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderItems: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentStatus: string;
  shippingAddress: Address;
  billingAddress: Address;
  orderDate: string;
}

export interface CheckoutRequest {
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  checkout(checkoutData: CheckoutRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, checkoutData, 
      { headers: this.getHeaders() });
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`, 
      { headers: this.getHeaders() });
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, {}, 
      { headers: this.getHeaders() });
  }
}


