import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductsService, Product, ProductCreateRequest } from '../../services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="products-container">
      <div class="page-header">
        <h1 class="page-title">Products</h1>
        <p class="page-subtitle">Manage your Wear Your Stand product inventory</p>
        <button mat-raised-button color="primary" (click)="openAddDialog()" class="add-button">
          <mat-icon>add</mat-icon>
          Add New Product
        </button>
      </div>
      
      <mat-card class="products-card">
        <mat-card-content>
          <div class="table-container" *ngIf="!loading; else loadingSpinner">
            <table mat-table [dataSource]="dataSource" matSort class="products-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let product">{{ product.id }}</td>
              </ng-container>
              
              <!-- Image Column -->
              <ng-container matColumnDef="image">
                <th mat-header-cell *matHeaderCellDef>Image</th>
                <td mat-cell *matCellDef="let product">
                  <div class="product-image-container">
                    <img *ngIf="product.imageUrls && product.imageUrls.length > 0" 
                         [src]="product.imageUrls[0]" 
                         [alt]="product.name"
                         class="product-image"
                         (error)="onImageError($event)">
                    <div *ngIf="!product.imageUrls || product.imageUrls.length === 0" 
                         class="no-image-placeholder">
                      <mat-icon>image_not_supported</mat-icon>
                    </div>
                  </div>
                </td>
              </ng-container>
              
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let product">
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-category">{{ product.category || 'Uncategorized' }}</div>
                  </div>
                </td>
              </ng-container>
              
              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
                <td mat-cell *matCellDef="let product">₱{{ product.price | number:'1.2-2' }}</td>
              </ng-container>
              
              <!-- Stock Column -->
              <ng-container matColumnDef="stockQuantity">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Stock</th>
                <td mat-cell *matCellDef="let product">
                  <mat-chip [color]="getStockColor(product.stockQuantity)" selected>
                    {{ product.stockQuantity }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let product">
                  <mat-chip [color]="product.stockQuantity > 0 ? 'primary' : 'warn'" selected>
                    {{ product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock' }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let product">
                  <button mat-icon-button (click)="openEditDialog(product)" matTooltip="Edit Product">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteProduct(product)" matTooltip="Delete Product" color="warn">
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
              <p>Loading products...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
    
    <!-- Product Dialog -->
    <div class="product-dialog" *ngIf="showDialog">
      <div class="dialog-overlay" (click)="closeDialog()"></div>
      <div class="dialog-content">
        <mat-card class="dialog-card">
          <mat-card-header>
            <mat-card-title>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</mat-card-title>
            <button mat-icon-button (click)="closeDialog()" class="close-button">
              <mat-icon>close</mat-icon>
            </button>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Product Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter product name">
                  <mat-error *ngIf="productForm.get('name')?.hasError('required')">
                    Product name is required
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Enter product description" rows="3"></textarea>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Price</mat-label>
                  <input matInput type="number" formControlName="price" placeholder="0.00" step="0.01">
                  <span matPrefix>₱&nbsp;</span>
                  <mat-error *ngIf="productForm.get('price')?.hasError('required')">
                    Price is required
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category">
                    <mat-option value="T-Shirts">T-Shirts</mat-option>
                    <mat-option value="Hoodies">Hoodies</mat-option>
                    <mat-option value="Accessories">Accessories</mat-option>
                    <mat-option value="Other">Other</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Brand</mat-label>
                  <input matInput formControlName="brand" placeholder="Enter brand name">
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <h3 class="section-title">Size Variants</h3>
                <p class="section-description">Set quantities for each size (S, M, L, XL)</p>
              </div>
              
              <div class="form-row size-variants">
                <mat-form-field appearance="outline" class="quarter-width">
                  <mat-label>Size S</mat-label>
                  <input matInput type="number" formControlName="sizeS" placeholder="0" min="0" (input)="calculateTotalStock()">
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="quarter-width">
                  <mat-label>Size M</mat-label>
                  <input matInput type="number" formControlName="sizeM" placeholder="0" min="0" (input)="calculateTotalStock()">
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="quarter-width">
                  <mat-label>Size L</mat-label>
                  <input matInput type="number" formControlName="sizeL" placeholder="0" min="0" (input)="calculateTotalStock()">
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="quarter-width">
                  <mat-label>Size XL</mat-label>
                  <input matInput type="number" formControlName="sizeXL" placeholder="0" min="0" (input)="calculateTotalStock()">
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <div class="total-stock-display">
                  <h4>Total Stock: <span class="total-stock-number">{{ getTotalStock() }}</span></h4>
                </div>
              </div>
              
              <div class="form-row">
                <div class="image-upload-section">
                  <label class="image-upload-label">Product Images</label>
                  <div class="image-upload-container">
                    <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" multiple style="display: none;">
                    <button mat-button type="button" (click)="fileInput.click()" class="upload-button">
                      <mat-icon>cloud_upload</mat-icon>
                      Choose Images
                    </button>
                    <div *ngIf="selectedFiles.length > 0" class="selected-files">
                      <div *ngFor="let file of selectedFiles; let i = index" class="file-item">
                        <span>{{ file.name }}</span>
                        <button mat-icon-button (click)="removeFile(i)" type="button">
                          <mat-icon>close</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="uploadedImages.length > 0" class="uploaded-images">
                    <div *ngFor="let imageUrl of uploadedImages; let i = index" class="image-preview">
                      <img [src]="imageUrl" alt="Product image">
                      <button mat-icon-button (click)="removeUploadedImage(i)" type="button" class="remove-image">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="dialog-actions">
                <button mat-button type="button" (click)="closeDialog()">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || saving">
                  <mat-spinner diameter="20" *ngIf="saving"></mat-spinner>
                  <mat-icon *ngIf="!saving">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                  {{ saving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product') }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
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
    
    .add-button {
      margin-top: 8px;
    }
    
    .products-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .products-table {
      width: 100%;
    }
    
    .product-info {
      display: flex;
      flex-direction: column;
    }
    
    .product-name {
      font-weight: 500;
      color: #333;
    }
    
    .product-category {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
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
    
    .product-dialog {
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
      max-width: 600px;
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
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .half-width {
      flex: 1;
    }
    
    .quarter-width {
      flex: 1;
      margin: 0 4px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin: 16px 0 8px 0;
    }
    
    .section-description {
      color: #666;
      margin: 0 0 16px 0;
      font-size: 14px;
    }
    
    .size-variants {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .total-stock-display {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin: 16px 0;
    }
    
    .total-stock-display h4 {
      margin: 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
    }
    
    .total-stock-number {
      color: #e74c3c;
      font-size: 24px;
      font-weight: 700;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
    
    .image-upload-section {
      width: 100%;
    }
    
    .image-upload-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    
    .image-upload-container {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      background: #fafafa;
    }
    
    .upload-button {
      margin-bottom: 16px;
    }
    
    .selected-files {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .uploaded-images {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 16px;
    }
    
    .image-preview {
      position: relative;
      width: 80px;
      height: 80px;
    }
    
    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .remove-image {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #f44336;
      color: white;
      width: 24px;
      height: 24px;
      min-width: 24px;
      line-height: 24px;
    }
    
    .remove-image mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .product-image-container {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .no-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 4px;
      border: 1px solid #ddd;
      color: #999;
    }
    
    .no-image-placeholder mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    /* Fix dropdown text color - more specific selectors */
    ::ng-deep .mat-mdc-select-value-text {
      color: #333 !important;
    }
    
    ::ng-deep .mat-mdc-select-value {
      color: #333 !important;
    }
    
    ::ng-deep .mat-mdc-select-placeholder {
      color: #666 !important;
    }
    
    ::ng-deep .mat-mdc-select-trigger {
      color: #333 !important;
    }
    
    ::ng-deep .mat-mdc-select-panel .mat-mdc-option {
      color: #333 !important;
    }
    
    ::ng-deep .mat-mdc-select-panel .mat-mdc-option .mdc-list-item__primary-text {
      color: #333 !important;
    }
    
    ::ng-deep .mat-mdc-select-panel .mat-mdc-option.mdc-list-item--selected {
      color: #1976d2 !important;
    }
    
    ::ng-deep .mat-mdc-select-panel .mat-mdc-option.mdc-list-item--selected .mdc-list-item__primary-text {
      color: #1976d2 !important;
    }
    
    ::ng-deep .mat-mdc-select-panel .mat-mdc-option:hover {
      background-color: #f5f5f5 !important;
    }
    
    /* Additional fallback selectors */
    ::ng-deep .mat-select-value {
      color: #333 !important;
    }
    
    ::ng-deep .mat-select-value-text {
      color: #333 !important;
    }
    
    ::ng-deep .mat-option {
      color: #333 !important;
    }
    
    ::ng-deep .mat-option-text {
      color: #333 !important;
    }
  `]
})
export class ProductsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = ['id', 'image', 'name', 'price', 'stockQuantity', 'status', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  
  showDialog = false;
  isEditMode = false;
  saving = false;
  loading = false;
  
  productForm: FormGroup;
  currentProduct: Product | null = null;
  selectedFiles: File[] = [];
  uploadedImages: string[] = [];
  uploading = false;
  
  constructor(
    private productsService: ProductsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      brand: [''],
      size: [''],
      color: [''],
      // Size variants
      sizeS: [0, [Validators.min(0)]],
      sizeM: [0, [Validators.min(0)]],
      sizeL: [0, [Validators.min(0)]],
      sizeXL: [0, [Validators.min(0)]]
    });
  }
  
  ngOnInit() {
    this.loadProducts();
  }
  
  loadProducts() {
    this.loading = true;
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.dataSource.data = products;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
  
  openAddDialog() {
    this.isEditMode = false;
    this.currentProduct = null;
    this.productForm.reset();
    this.showDialog = true;
  }
  
  openEditDialog(product: Product) {
    this.isEditMode = true;
    this.currentProduct = product;
    
    // Set basic product data
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      size: product.size,
      color: product.color
    });
    
    // Initialize size variant fields to 0
    this.productForm.patchValue({
      sizeS: 0,
      sizeM: 0,
      sizeL: 0,
      sizeXL: 0
    });
    
    // Populate size variant fields from existing data
    if (product.sizeVariants && product.sizeVariants.length > 0) {
      product.sizeVariants.forEach(variant => {
        switch (variant.size) {
          case 'S':
            this.productForm.patchValue({ sizeS: variant.quantity });
            break;
          case 'M':
            this.productForm.patchValue({ sizeM: variant.quantity });
            break;
          case 'L':
            this.productForm.patchValue({ sizeL: variant.quantity });
            break;
          case 'XL':
            this.productForm.patchValue({ sizeXL: variant.quantity });
            break;
        }
      });
    }
    
    this.uploadedImages = product.imageUrls || [];
    this.selectedFiles = [];
    console.log('🖼️ Edit Dialog - Existing images loaded:', this.uploadedImages);
    console.log('📏 Edit Dialog - Size variants loaded:', product.sizeVariants);
    this.showDialog = true;
  }
  
  closeDialog() {
    this.showDialog = false;
    this.productForm.reset();
    this.currentProduct = null;
    this.selectedFiles = [];
    this.uploadedImages = [];
  }
  
  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...files];
  }
  
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }
  
  removeUploadedImage(index: number) {
    this.uploadedImages.splice(index, 1);
  }
  
  calculateTotalStock(): void {
    // This method is called on input change to update the display
    // The actual calculation is done in getTotalStock()
  }
  
  getTotalStock(): number {
    const sizeS = this.productForm.get('sizeS')?.value || 0;
    const sizeM = this.productForm.get('sizeM')?.value || 0;
    const sizeL = this.productForm.get('sizeL')?.value || 0;
    const sizeXL = this.productForm.get('sizeXL')?.value || 0;
    return sizeS + sizeM + sizeL + sizeXL;
  }
  
  
  async saveProduct() {
    if (this.productForm.valid) {
      this.saving = true;
      const productData = this.productForm.value;
      
      // Process size variants - include all sizes even if 0
      const sizeVariants = [
        { size: 'S', quantity: productData.sizeS || 0 },
        { size: 'M', quantity: productData.sizeM || 0 },
        { size: 'L', quantity: productData.sizeL || 0 },
        { size: 'XL', quantity: productData.sizeXL || 0 }
      ];
      
      productData.sizeVariants = sizeVariants;
      
      // Calculate total stock quantity from size variants
      const totalStock = sizeVariants.reduce((sum, variant) => sum + variant.quantity, 0);
      productData.stockQuantity = totalStock;
      
      console.log('Size variants being saved:', sizeVariants);
      console.log('Total stock calculated:', totalStock);
      
      try {
        if (this.isEditMode) {
          // For editing, use the new updateProductWithImages method
          if (this.selectedFiles.length > 0) {
            // If there are new images, combine with existing ones
            productData.imageUrls = this.uploadedImages;
            console.log('🖼️ Update with new images - Existing images:', this.uploadedImages);
            console.log('🖼️ Update with new images - New files:', this.selectedFiles.length);
            this.productsService.updateProductWithImages(this.currentProduct!.id, productData, this.selectedFiles).subscribe({
              next: (product) => {
                this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
                this.loadProducts();
                this.closeDialog();
                this.saving = false;
              },
              error: (error) => {
                console.error('Error updating product:', error);
                let errorMessage = 'Error updating product';
                if (error.status === 404) {
                  errorMessage = 'Product not found';
                } else if (error.status === 500) {
                  errorMessage = 'Server error occurred while updating product';
                } else if (error.error && typeof error.error === 'string') {
                  errorMessage = error.error;
                } else if (error.message) {
                  errorMessage = error.message;
                }
                this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                this.saving = false;
              }
            });
          } else {
            // No new images, but include existing images to preserve them
            productData.imageUrls = this.uploadedImages;
            console.log('🖼️ Update without new images - Preserving existing images:', this.uploadedImages);
            this.productsService.updateProductWithImages(this.currentProduct!.id, productData, []).subscribe({
              next: (product) => {
                this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
                this.loadProducts();
                this.closeDialog();
                this.saving = false;
              },
              error: (error) => {
                console.error('Error updating product:', error);
                let errorMessage = 'Error updating product';
                if (error.error && typeof error.error === 'string') {
                  errorMessage = error.error;
                } else if (error.message) {
                  errorMessage = error.message;
                }
                this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                this.saving = false;
              }
            });
          }
        } else {
          // For creating new products, use the new multipart endpoint
          this.productsService.createProductWithImages(productData, this.selectedFiles).subscribe({
            next: (product) => {
              this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
              this.loadProducts();
              this.closeDialog();
              this.saving = false;
            },
            error: (error) => {
              console.error('Error creating product:', error);
              let errorMessage = 'Error creating product';
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.message) {
                errorMessage = error.message;
              }
              this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
              this.saving = false;
            }
          });
        }
      } catch (error) {
        console.error('Error saving product:', error);
        this.snackBar.open('Error saving product', 'Close', { duration: 3000 });
        this.saving = false;
        this.uploading = false;
      }
    }
  }
  
  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productsService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          let errorMessage = 'Error deleting product';
          
          // Handle specific HTTP status codes
          if (error.status === 409) {
            errorMessage = 'Cannot delete product: it has existing order items. Please mark as discontinued instead.';
          } else if (error.status === 404) {
            errorMessage = 'Product not found';
          } else if (error.status === 500) {
            errorMessage = 'Server error occurred while deleting product';
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }
  
  getStockColor(stock: number): 'primary' | 'accent' | 'warn' {
    if (stock === 0) return 'warn';
    if (stock < 10) return 'accent';
    return 'primary';
  }
  
  onImageError(event: any) {
    console.log('Image load error:', event);
    // Hide the broken image and show placeholder
    event.target.style.display = 'none';
  }
}














