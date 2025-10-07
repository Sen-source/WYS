import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NavigationComponent } from '../shared/navigation/navigation.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatStepperModule, MatTooltipModule, NavigationComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  
  // Safe getter for cart items
  get cartItems(): CartItem[] {
    return this.cart?.items || this.cart?.cartItems || [];
  }
  
  // Safe getter for cart item count
  get cartItemCount(): number {
    return this.cartItems.length;
  }
  
  // Safe getter for cart total
  get cartTotal(): number {
    return this.cart?.totalAmount || 0;
  }

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    // Initialize cart with empty state
    this.initializeCart();
    
    // Check if user is authenticated before loading cart
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.loadCart();
      } else {
        this.loading = false;
        this.initializeCart();
      }
    });

    // Subscribe to cart changes from the service
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.loading = false;
    });
  }
  
  private initializeCart(): void {
    this.cart = this.initializeEmptyCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart || this.initializeEmptyCart();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.cart = this.initializeEmptyCart();
        // Only show error if user is authenticated
        if (this.authService.isAuthenticated()) {
          this.snackBar.open('Failed to load cart. Please try again.', 'Close', { duration: 5000 });
          console.error('Error loading cart:', error);
        }
      }
    });
  }
  
  private initializeEmptyCart(): Cart {
    return {
      id: 0,
      userId: 0,
      items: [],
      totalAmount: 0
    };
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > this.getMaxQuantity(item)) return;

    console.log('Updating quantity for item:', item.id, 'to:', newQuantity);

    this.cartService.updateCartItem(item.id, newQuantity).subscribe({
      next: (response) => {
        console.log('Quantity update success:', response);
        // Cart will be reloaded automatically by the service
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        let errorMessage = 'Failed to update quantity. Please try again.';
        
        if (error.status === 400) {
          errorMessage = error.error?.message || 'Invalid quantity or cart item not found.';
        } else if (error.status === 404) {
          errorMessage = 'Cart item not found. Please refresh the page.';
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  getMaxQuantity(item: CartItem): number {
    // For now, return a reasonable max quantity since we don't have stock info in CartItemDto
    // In a real app, you might want to fetch product details or include stock in CartItemDto
    return item.product?.stockQuantity || 999;
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.snackBar.open('Item removed from cart', 'Close', { duration: 3000 });
        // Cart will be reloaded automatically by the service
      },
      error: (error) => {
        this.snackBar.open('Failed to remove item. Please try again.', 'Close', { duration: 5000 });
        console.error('Error removing item:', error);
      }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }




  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }

  getProductImage(item: CartItem): string {
    // First try to get from productImage (new CartItemDto format)
    if (item.productImage) {
      if (item.productImage.startsWith('/uploads/')) {
        return item.productImage;
      }
      return item.productImage;
    }
    
    // Fallback to product.imageUrls (legacy format)
    if (item.product?.imageUrls && item.product.imageUrls.length > 0) {
      const imageUrl = item.product.imageUrls[0];
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        return imageUrl;
      }
      return imageUrl;
    }
    
    // Fallback to product.imageUrl (legacy format)
    if (item.product?.imageUrl) {
      if (item.product.imageUrl.startsWith('/uploads/')) {
        return item.product.imageUrl;
      }
      return item.product.imageUrl;
    }
    
    // No image available
    return '';
  }

  onImageError(event: any): void {
    // Hide the broken image
    event.target.style.display = 'none';
  }
}
