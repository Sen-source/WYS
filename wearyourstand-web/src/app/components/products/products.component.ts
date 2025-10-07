import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { OverlayModule } from '@angular/cdk/overlay';
import { ProductService, Product } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { NavigationComponent } from '../shared/navigation/navigation.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule, OverlayModule, NavigationComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  searchTerm = '';
  sortBy = 'name';
  isAuthenticated = false;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.authService.isAuthenticated$.subscribe((isAuth: boolean) => {
      this.isAuthenticated = isAuth;
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load products. Please try again.', 'Close', { duration: 5000 });
        console.error('Error loading products:', error);
      }
    });
  }

  filterProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.sortProducts();
  }

  sortProducts(): void {
    this.filteredProducts.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'stock':
          return b.stockQuantity - a.stockQuantity;
        default:
          return 0;
      }
    });
  }


  viewDetails(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  onImageError(event: any): void {
    console.log('=== IMAGE ERROR DEBUG ===');
    console.log('Image src that failed:', event.target.src);
    console.log('Image alt:', event.target.alt);
    console.log('Hiding broken image');
    // Hide the broken image
    event.target.style.display = 'none';
  }

  onImageLoad(event: any): void {
    console.log('=== IMAGE LOAD SUCCESS ===');
    console.log('Image loaded successfully:', event.target.src);
    console.log('Image alt:', event.target.alt);
  }

  getProductImage(product: Product): string {
    console.log('=== GET PRODUCT IMAGE DEBUG ===');
    console.log('Product:', product.name);
    console.log('imageUrls:', product.imageUrls);
    console.log('imageUrl:', product.imageUrl);
    
    // First try to get from imageUrls array (backend format)
    if (product.imageUrls && product.imageUrls.length > 0) {
      const imageUrl = product.imageUrls[0];
      console.log('✅ Found imageUrls, using first:', imageUrl);
      
      // Use relative URL since we have proxy configured
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        console.log('✅ Using relative URL:', imageUrl);
        return imageUrl;
      }
      console.log('⚠️ Image URL does not start with /uploads/, using as-is:', imageUrl);
      return imageUrl;
    }
    
    // Fallback to single imageUrl (legacy format)
    if (product.imageUrl) {
      console.log('✅ Found single imageUrl:', product.imageUrl);
      if (product.imageUrl.startsWith('/uploads/')) {
        console.log('✅ Using relative URL:', product.imageUrl);
        return product.imageUrl;
      }
      console.log('⚠️ Image URL does not start with /uploads/, using as-is:', product.imageUrl);
      return product.imageUrl;
    }
    
    // No image available
    console.log('❌ No image available for product:', product.name);
    return '';
  }

  getTotalStockFromVariants(product: Product): number {
    if (product.sizeVariants && product.sizeVariants.length > 0) {
      return product.sizeVariants.reduce((total, variant) => total + variant.quantity, 0);
    }
    // Fallback to the stockQuantity field if no size variants
    return product.stockQuantity || 0;
  }
}