import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NavigationComponent } from '../shared/navigation/navigation.component';

interface Category {
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavigationComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  loading = true;
  cartItemCount = 0;
  categories: Category[] = [
    { name: 'T-Shirts', icon: 'checkroom', description: 'Comfortable and stylish' },
    { name: 'Accessories', icon: 'watch', description: 'Complete your look' },
    { name: 'Hoodies', icon: 'favorite', description: 'Cozy and warm' }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCartCount();
  }

  loadFeaturedProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 8); // Show first 8 products
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  loadCartCount(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItemCount = cart.items ? cart.items.length : 0;
      },
      error: (error) => {
        console.error('Error loading cart count:', error);
        this.cartItemCount = 0;
      }
    });
  }

  getProductImage(product: Product): string {
    console.log('=== HOME GET PRODUCT IMAGE DEBUG ===');
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

  onImageError(event: any): void {
    console.log('=== HOME IMAGE ERROR DEBUG ===');
    console.log('Image src that failed:', event.target.src);
    console.log('Image alt:', event.target.alt);
    console.log('Hiding broken image');
    // Hide the broken image
    event.target.style.display = 'none';
  }

  onImageLoad(event: any): void {
    console.log('=== HOME IMAGE LOAD SUCCESS ===');
    console.log('Image loaded successfully:', event.target.src);
    console.log('Image alt:', event.target.alt);
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

}


