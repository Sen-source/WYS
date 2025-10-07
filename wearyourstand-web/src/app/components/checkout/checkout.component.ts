import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService, CheckoutRequest } from '../../services/order.service';
import { NavigationComponent } from '../shared/navigation/navigation.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatRadioModule, ReactiveFormsModule, NavigationComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  isAuthenticated: boolean = false;
  loading: boolean = true;
  processing: boolean = false;
  
  checkoutForm: FormGroup;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['Philippines', [Validators.required]],
      paymentMethod: ['COD', [Validators.required]],
      // Card fields (only required when card is selected)
      cardNumber: [''],
      expiryDate: [''],
      cvv: [''],
      cardholderName: ['']
    });
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('Checkout component - isAuthenticated:', this.isAuthenticated);
    console.log('Checkout component - token exists:', !!localStorage.getItem('token'));
    
    if (!this.isAuthenticated) {
      console.log('Checkout component - Not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.loadCart();
    
    // Subscribe to payment method changes
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(() => {
      this.updateCardValidation();
    });
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.cartItems = cart?.items || cart?.cartItems || [];
        this.cartTotal = cart?.totalAmount || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
        this.snackBar.open('Error loading cart', 'Close', { duration: 3000 });
      }
    });
  }

  selectPaymentMethod(method: string): void {
    this.checkoutForm.patchValue({ paymentMethod: method });
    this.updateCardValidation();
  }

  private updateCardValidation(): void {
    const isCard = this.checkoutForm.get('paymentMethod')?.value === 'CARD';
    
    if (isCard) {
      this.checkoutForm.get('cardNumber')?.setValidators([Validators.required]);
      this.checkoutForm.get('expiryDate')?.setValidators([Validators.required]);
      this.checkoutForm.get('cvv')?.setValidators([Validators.required]);
      this.checkoutForm.get('cardholderName')?.setValidators([Validators.required]);
    } else {
      this.checkoutForm.get('cardNumber')?.clearValidators();
      this.checkoutForm.get('expiryDate')?.clearValidators();
      this.checkoutForm.get('cvv')?.clearValidators();
      this.checkoutForm.get('cardholderName')?.clearValidators();
    }
    
    // Update validation status
    this.checkoutForm.get('cardNumber')?.updateValueAndValidity();
    this.checkoutForm.get('expiryDate')?.updateValueAndValidity();
    this.checkoutForm.get('cvv')?.updateValueAndValidity();
    this.checkoutForm.get('cardholderName')?.updateValueAndValidity();
  }

  processCheckout(): void {
    console.log('Checkout component - processCheckout called');
    console.log('Checkout component - form valid:', this.checkoutForm.valid);
    console.log('Checkout component - cart exists:', !!this.cart);
    console.log('Checkout component - cart items:', this.cart?.cartItems?.length);
    console.log('Checkout component - token exists:', !!localStorage.getItem('token'));
    
    if (this.checkoutForm.invalid) {
      console.log('Checkout component - Form is invalid');
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    if (!this.cart || !this.cart.cartItems || this.cart.cartItems.length === 0) {
      console.log('Checkout component - Cart is empty');
      this.snackBar.open('Your cart is empty', 'Close', { duration: 3000 });
      return;
    }

    this.processing = true;
    
    // Prepare checkout data
    const checkoutData: CheckoutRequest = {
      shippingAddress: {
        street: this.checkoutForm.get('street')?.value,
        city: this.checkoutForm.get('city')?.value,
        state: this.checkoutForm.get('state')?.value,
        zipCode: this.checkoutForm.get('zipCode')?.value,
        country: this.checkoutForm.get('country')?.value
      },
      billingAddress: {
        street: this.checkoutForm.get('street')?.value,
        city: this.checkoutForm.get('city')?.value,
        state: this.checkoutForm.get('state')?.value,
        zipCode: this.checkoutForm.get('zipCode')?.value,
        country: this.checkoutForm.get('country')?.value
      },
      notes: ''
    };

    // Debug: Log the checkout data
    console.log('Checkout data being sent:', checkoutData);
    console.log('Form values:', this.checkoutForm.value);

    // Call the checkout API
    this.orderService.checkout(checkoutData).subscribe({
      next: (response) => {
        this.processing = false;
        console.log('Checkout successful:', response);
        this.snackBar.open(`Order placed successfully! Order Number: ${response.orderNumber}`, 'Close', { duration: 5000 });
        
        // Cart is already cleared by the backend, just refresh cart data
        this.cartService.getCart().subscribe();
        
        // Navigate to orders page
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        this.processing = false;
        console.error('Checkout error:', error);
        
        let errorMessage = 'Failed to place order. Please try again.';
        
        if (error.status === 400) {
          errorMessage = 'Invalid form data. Please check all fields are filled correctly.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again or contact support.';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}