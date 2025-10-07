import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductSizeVariant {
  size: string;
  quantity: number;
}

export interface Product { 
  id: number; 
  name: string; 
  description: string;
  price: number; 
  stockQuantity: number;
  category?: string;
  brand?: string;
  imageUrls?: string[];
  size?: string;
  color?: string;
  status?: string;
  sizeVariants?: ProductSizeVariant[];
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category?: string;
  brand?: string;
  imageUrls?: string[];
  size?: string;
  color?: string;
  sizeVariants?: ProductSizeVariant[];
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/admin/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getAvailableProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/available`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
  }

  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  createProductWithImages(product: ProductCreateRequest, images?: File[]): Observable<Product> {
    console.log('📦 ProductsService - Creating product with images:', { product, imageCount: images?.length || 0 });
    
    if (images && images.length > 0) {
      // Use multipart endpoint when images are provided
      const formData = new FormData();
      formData.append('product', JSON.stringify(product));
      
      images.forEach(image => {
        formData.append('images', image);
      });
      
      console.log('📦 ProductsService - Using multipart endpoint for product creation');
      return this.http.post<Product>(`${this.apiUrl}/multipart`, formData);
    } else {
      // Use regular JSON endpoint when no images
      console.log('📦 ProductsService - Using JSON endpoint for product creation');
      return this.http.post<Product>(this.apiUrl, product);
    }
  }

  updateProduct(id: number, product: ProductCreateRequest): Observable<Product> {
    // Remove imageUrls from the request to avoid backend issues
    const { imageUrls, ...productWithoutImages } = product;
    console.log('📦 ProductsService - Updating product (simple):', { id, product: productWithoutImages });
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productWithoutImages);
  }

  updateProductWithImages(id: number, product: ProductCreateRequest, images?: File[]): Observable<Product> {
    console.log('📦 ProductsService - Updating product with images:', { id, product, imageCount: images?.length || 0 });
    console.log('📦 ProductsService - Existing imageUrls in product:', product.imageUrls);
    
    // Always use multipart endpoint to preserve existing images
    const formData = new FormData();
    formData.append('product', JSON.stringify(product));
    
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
      console.log('📦 ProductsService - Using multipart endpoint with new images');
    } else {
      console.log('📦 ProductsService - Using multipart endpoint to preserve existing images');
    }
    
    return this.http.put<Product>(`${this.apiUrl}/${id}/multipart`, formData);
  }

  deleteProduct(id: number): Observable<void> {
    console.log('📦 ProductsService - Deleting product:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${environment.apiUrl}/admin/upload`, formData);
  }
}














