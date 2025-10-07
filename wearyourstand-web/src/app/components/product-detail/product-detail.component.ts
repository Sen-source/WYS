import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ProductService, Product, ProductSizeVariant } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  quantity = 1;
  isAuthenticated = false;
  selectedSize: string | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.authService.isAuthenticated$.subscribe((isAuth: boolean) => {
      this.isAuthenticated = isAuth;
      if (!isAuth) {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        // Add default size variants if not provided by backend
        if (!this.product.sizeVariants || this.product.sizeVariants.length === 0) {
          this.product.sizeVariants = this.getDefaultSizeVariants();
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load product. Please try again.', 'Close', { duration: 5000 });
        console.error('Error loading product:', error);
      }
    });
  }

  increaseQuantity(): void {
    const maxQuantity = this.getSelectedSizeQuantity();
    if (this.product && this.quantity < maxQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    // Check if size is selected when size variants are available
    if (this.product.sizeVariants && this.product.sizeVariants.length > 0 && !this.selectedSize) {
      this.snackBar.open('Please select a size before adding to cart.', 'Close', { duration: 3000 });
      return;
    }

    // Check if selected size has stock
    if (this.selectedSize && this.getSelectedSizeQuantity() === 0) {
      this.snackBar.open('Selected size is out of stock.', 'Close', { duration: 3000 });
      return;
    }

    this.cartService.addToCart(this.product.id, this.quantity, this.selectedSize || undefined).subscribe({
      next: () => {
        const sizeText = this.selectedSize ? ` (Size: ${this.selectedSize})` : '';
        this.snackBar.open(`${this.product!.name}${sizeText} added to cart!`, 'Close', { duration: 3000 });
        this.quantity = 1; // Reset quantity
      },
      error: (error) => {
        this.snackBar.open('Failed to add item to cart. Please try again.', 'Close', { duration: 5000 });
        console.error('Error adding to cart:', error);
      }
    });
  }

  onImageError(event: any): void {
    // Hide the broken image
    event.target.style.display = 'none';
  }

  getProductImage(product: Product): string {
    // First try to get from imageUrls array (backend format)
    if (product.imageUrls && product.imageUrls.length > 0) {
      const imageUrl = product.imageUrls[0];
      // Use relative URL since we have proxy configured
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        return imageUrl;
      }
      return imageUrl;
    }
    // Fallback to single imageUrl (legacy format)
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('/uploads/')) {
        return product.imageUrl;
      }
      return product.imageUrl;
    }
    // No image available
    return '';
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.quantity = 1; // Reset quantity when size changes
  }

  getSelectedSizeQuantity(): number {
    if (!this.product || !this.selectedSize || !this.product.sizeVariants) {
      return this.product?.stockQuantity || 0;
    }
    const variant = this.product.sizeVariants.find(v => v.size === this.selectedSize);
    return variant ? variant.quantity : 0;
  }

  getDefaultSizeVariants(): ProductSizeVariant[] {
    // Generate default size variants with available stock
    const sizes = ['S', 'M', 'L', 'XL'];
    const totalStock = this.product?.stockQuantity || 0;
    const stockPerSize = Math.floor(totalStock / sizes.length);
    
    return sizes.map(size => ({
      size,
      quantity: stockPerSize > 0 ? stockPerSize : (totalStock > 0 ? 1 : 0)
    }));
  }
}