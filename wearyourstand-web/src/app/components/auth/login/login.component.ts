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
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

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
    MatTabsModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Welcome to Wear Your Stand</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Login">
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="your@email.com">
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
                
                <button mat-raised-button color="primary" type="submit" class="full-width auth-button" 
                        [disabled]="loginForm.invalid || loading">
                  <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                  <span *ngIf="!loading">Login</span>
                </button>
              </form>
            </mat-tab>
            
            <mat-tab label="Register">
              <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" placeholder="John">
                    <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" placeholder="Doe">
                    <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="your@email.com">
                  <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Phone (Optional)</mat-label>
                  <input matInput formControlName="phone" placeholder="+1 (555) 123-4567">
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hideRegisterPassword ? 'password' : 'text'" formControlName="password">
                  <button mat-icon-button matSuffix (click)="hideRegisterPassword = !hideRegisterPassword" type="button">
                    <mat-icon>{{hideRegisterPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                    Password is required
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                    Password must be at least 6 characters
                  </mat-error>
                </mat-form-field>
                
                <button mat-raised-button color="accent" type="submit" class="full-width auth-button" 
                        [disabled]="registerForm.invalid || loading">
                  <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                  <span *ngIf="!loading">Register</span>
                </button>
              </form>
            </mat-tab>
          </mat-tab-group>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      width: 100%;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    
    .login-card mat-card-header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .login-card mat-card-title {
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
    }
    
    .login-card mat-card-subtitle {
      color: #666;
      font-size: 16px;
    }
    
    .auth-form {
      padding: 24px 0;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .half-width {
      flex: 1;
    }
    
    .auth-button {
      margin-top: 24px;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
    }
    
    mat-form-field {
      margin-bottom: 16px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideRegisterPassword = true;

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
    
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Login error:', error);
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', { duration: 5000 });
        }
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.loading = true;
      const { firstName, lastName, email, phone, password } = this.registerForm.value;
      
      this.authService.register(email, password, firstName, lastName, phone).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Registration error:', error);
          this.snackBar.open('Registration failed. Please try again.', 'Close', { duration: 5000 });
        }
      });
    }
  }
}