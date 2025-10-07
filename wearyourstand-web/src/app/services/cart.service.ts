import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Product } from './product.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  productImage?: string;
  size?: string; // Add size field
  // Keep product for backward compatibility
  product?: Product;
}

export interface Cart {
  id: number;
  userId?: number;
  items?: CartItem[];
  cartItems?: CartItem[]; // Backend uses cartItems
  totalAmount: number;
  totalItems?: number;
}

export interface CheckoutRequest {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private cartItemCountSubject = new BehaviorSubject<number>(0);

  public cart$ = this.cartSubject.asObservable();
  public cartItemCount$ = this.cartItemCountSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Only load cart if user is authenticated
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.loadCart();
      } else {
        // Clear cart when user logs out
        this.cartSubject.next(null);
        this.cartItemCountSubject.next(0);
      }
    });
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  addToCart(productId: number, quantity: number, size?: string): Observable<any> {
    console.log('Adding to cart:', { productId, quantity, size });
    const params: any = {
      productId: productId.toString(),
      quantity: quantity.toString()
    };
    
    // Add size parameter if provided
    if (size) {
      params.size = size;
    }
    
    return this.http.post(`${this.apiUrl}/add`, null, { params }).pipe(
      tap((response: any) => {
        console.log('Add to cart success:', response);
        if (response.success && response.cart) {
          // Update cart with the response data
          this.cartSubject.next(response.cart);
          this.updateCartItemCount(response.cart);
        } else {
          // Fallback to reloading cart
          this.loadCart();
        }
      }),
      catchError((error) => {
        console.error('Add to cart error:', error);
        throw error;
      })
    );
  }

  updateCartItem(cartItemId: number, quantity: number): Observable<any> {
    console.log('CartService: Updating cart item', cartItemId, 'to quantity', quantity);
    return this.http.put(`${this.apiUrl}/items/${cartItemId}`, null, {
      params: {
        quantity: quantity.toString()
      }
    }).pipe(
      tap((response: any) => {
        console.log('CartService: Update response:', response);
        if (response.success && response.cart) {
          // Update cart with the response data
          this.cartSubject.next(response.cart);
          this.updateCartItemCount(response.cart);
        } else {
          // Fallback to reloading cart
          this.loadCart();
        }
      }),
      catchError((error) => {
        console.error('CartService: Update cart item error:', error);
        throw error;
      })
    );
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${cartItemId}`)
      .pipe(
        tap((response: any) => {
          if (response.success && response.cart) {
            // Update cart with the response data
            this.cartSubject.next(response.cart);
            this.updateCartItemCount(response.cart);
          } else {
            // Fallback to reloading cart
            this.loadCart();
          }
        })
      );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`)
      .pipe(
        tap(() => {
          this.cartSubject.next(null);
          this.cartItemCountSubject.next(0);
        })
      );
  }


  private loadCart(): void {
    this.getCart().pipe(
      catchError(error => {
        console.log('Cart not found or error loading cart:', error);
        return of(null);
      })
    ).subscribe(cart => {
      this.cartSubject.next(cart);
      this.updateCartItemCount(cart);
    });
  }

  private updateCartItemCount(cart: Cart | null): void {
    // Handle both items and cartItems (backend uses cartItems)
    const items = cart?.items || cart?.cartItems || [];
    const count = items.reduce((total, item) => total + item.quantity, 0);
    this.cartItemCountSubject.next(count);
  }
}