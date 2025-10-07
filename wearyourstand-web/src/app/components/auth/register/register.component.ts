import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, RegisterRequest } from '../../../services/auth.service';
import { NavigationComponent } from '../../shared/navigation/navigation.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, NavigationComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    console.log('Password validator - password:', password?.value);
    console.log('Password validator - confirmPassword:', confirmPassword?.value);
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      console.log('Passwords do not match');
      return { passwordMismatch: true };
    }
    
    console.log('Passwords match');
    return null;
  }

  onSubmit(): void {
    console.log('Registration form submitted');
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form errors:', this.registerForm.errors);
    console.log('Form value:', this.registerForm.value);
    
    if (this.loading || this.registerForm.invalid) {
      console.log('Form is invalid or loading, returning');
      return;
    }

    this.loading = true;
    const registerData: RegisterRequest = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      phone: this.registerForm.value.phone,
      password: this.registerForm.value.password
    };

    console.log('Registration data prepared:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading = false;
        this.snackBar.open('Registration successful! Welcome!', 'Close', { duration: 3000 });
        
        // Wait for authentication state to be set before navigating
        setTimeout(() => {
          console.log('About to navigate to home, auth state:', this.authService.isAuthenticated());
          console.log('Current user:', this.authService.getCurrentUser());
          this.router.navigate(['/home']).then(success => {
            console.log('Navigation result:', success);
            if (!success) {
              console.error('Navigation failed, trying again...');
              setTimeout(() => {
                this.router.navigate(['/home']);
              }, 200);
            }
          }).catch(error => {
            console.error('Navigation error:', error);
          });
        }, 100);
      },
      error: (error) => {
        console.log('=== FRONTEND REGISTRATION ERROR ===');
        console.error('Registration error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        this.loading = false;
        
        let errorMessage = 'Registration failed. Please try again.';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        console.log('Displaying error message:', errorMessage);
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }
}