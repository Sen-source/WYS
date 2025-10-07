import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>admin_panel_settings</mat-icon>
            Admin Login
          </mat-card-title>
          <mat-card-subtitle>Wear Your Stand Admin Panel</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="admin@wearyourstand.com">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" class="full-width login-button" 
                    [disabled]="loginForm.invalid || loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Login</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      padding: 20px;
    }
    
    .login-card {
      width: 100%;
      max-width: 450px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    
    .login-card mat-card-header {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      margin: -24px -24px 32px -24px;
      padding: 32px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .login-card mat-card-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      text-align: center !important;
      width: 100%;
    }
    
    .login-card mat-card-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
      text-align: center !important;
      display: block !important;
      width: 100%;
    }
    
    .login-card mat-card-content {
      padding: 0 24px 24px 24px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .login-button {
      margin-top: 24px;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 8px;
      background: #2c3e50 !important;
      color: white !important;
      transition: all 0.3s ease;
      text-transform: none !important;
    }
    
    .login-button:hover {
      background: #34495e !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(44, 62, 80, 0.3);
    }
    
    .login-button:disabled {
      background: #bdc3c7 !important;
      color: #7f8c8d !important;
      transform: none;
      box-shadow: none;
    }
    
    mat-form-field {
      margin-bottom: 20px;
    }
    
    mat-form-field .mat-mdc-form-field-outline {
      color: #e0e0e0;
    }
    
    mat-form-field.mat-focused .mat-mdc-form-field-outline-thick {
      color: #2c3e50;
    }
    
    mat-form-field .mat-mdc-form-field-label {
      color: #666;
    }
    
    mat-form-field.mat-focused .mat-mdc-form-field-label {
      color: #2c3e50;
    }
    
    mat-spinner {
      margin-right: 8px;
    }
    
    @media (max-width: 480px) {
      .login-container {
        padding: 20px 16px;
      }
      
      .login-card {
        margin: 0;
      }
      
      .login-card mat-card-header {
        margin: -16px -16px 24px -16px;
        padding: 24px 16px;
      }
      
      .login-card mat-card-title {
        font-size: 24px;
      }
      
      .login-card mat-card-content {
        padding: 0 16px 20px 16px;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Login error:', error);
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', { duration: 5000 });
        }
      });
    }
  }
}
