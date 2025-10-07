import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔍 Auth Interceptor - Processing request:', req.url);
  console.log('🔍 Auth Interceptor - Method:', req.method);
  
  // Define endpoints that don't require authentication
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register', 
    '/api/auth/test',
    '/api/auth/test-db',
    '/api/auth/users',
    '/api/auth/create-admin',
    '/api/auth/check-admin',
    '/api/products' // Public product browsing (GET only)
  ];
  
  // Check if this is a public endpoint (works with both relative and absolute URLs)
  const isPublicEndpoint = publicEndpoints.some(endpoint => {
    if (endpoint === '/api/products') {
      // Only allow GET requests to /api/products without auth
      return req.url.includes(endpoint) && req.method === 'GET';
    }
    return req.url.includes(endpoint);
  });
  
  if (isPublicEndpoint) {
    console.log('✅ Auth Interceptor - Public endpoint, skipping auth');
    return next(req);
  }

  // Check if this is an API request that requires authentication
  const isApiRequest = req.url.includes('/api/');
  
  if (isApiRequest) {
    const token = localStorage.getItem('token');
    console.log('🔍 Auth Interceptor - Token found:', token ? 'YES' : 'NO');
    
    if (token) {
      // Validate token format (basic check)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('❌ Auth Interceptor - Invalid token format, clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const router = inject(Router);
        router.navigate(['/login']);
        return throwError(() => new Error('Invalid token format'));
      }
      
      // Clone the request and add the Authorization header
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Auth Interceptor - Adding Authorization header to:', req.url);
      console.log('✅ Auth Interceptor - Authorization header value:', `Bearer ${token.substring(0, 20)}...`);
      
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Auth Interceptor - HTTP Error:', error.status, error.message);
          console.error('❌ Auth Interceptor - Error details:', error);
          
          // Handle 401 Unauthorized responses
          if (error.status === 401) {
            console.error('🚫 Auth Interceptor - 401 Unauthorized - Token may be expired or invalid');
            console.error('🚫 Auth Interceptor - Clearing stored token and redirecting to login');
            
            // Clear stored authentication data
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
      // No token available for protected endpoint
      console.warn('⚠️ Auth Interceptor - No token found for protected endpoint:', req.url);
      console.warn('⚠️ Auth Interceptor - Redirecting to login');
      
      const router = inject(Router);
      router.navigate(['/login']);
      return throwError(() => new Error('No authentication token available'));
    }
  }
  
  // For non-API requests, proceed without modification
  console.log('✅ Auth Interceptor - Non-API request, proceeding without auth');
  return next(req);
};
