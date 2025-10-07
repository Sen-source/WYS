import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Auth Interceptor - Processing request:', req.url);
  
  // Skip adding token to login and register endpoints
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
    console.log('Auth Interceptor - Skipping auth for login/register');
    return next(req);
  }

  // Add token to all other API requests (including auth/change-password and cart)
  if (req.url.startsWith('/api/')) {
    const token = localStorage.getItem('token');
    console.log('Auth Interceptor - Token present:', !!token);
    
    if (token) {
      // Clone the request and add the Authorization header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': req.headers.get('Content-Type') || 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Auth Interceptor - Added Authorization header');
      
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          console.log('Auth Interceptor - Error response:', error.status, error.message);
          
          // Handle 401 Unauthorized responses
          if (error.status === 401) {
            console.log('Auth Interceptor - 401 Unauthorized, clearing token and redirecting');
            // Token might be expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login page
            const router = inject(Router);
            router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    } else {
      console.log('Auth Interceptor - No token available for protected endpoint');
    }
  }
  
  // For non-API requests or when no token is available, proceed without modification
  return next(req);
};