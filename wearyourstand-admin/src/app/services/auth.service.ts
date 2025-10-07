import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public isAuthenticated$ = this.isLoggedIn$; // Alias for compatibility

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    const loginRequest: LoginRequest = { email, password };
    
    console.log('🔐 AuthService - Attempting login for:', email);
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap(response => {
          console.log('✅ AuthService - Login successful!');
          console.log('✅ AuthService - Token received:', response.token.substring(0, 20) + '...');
          console.log('✅ AuthService - User role:', response.role);
          console.log('✅ AuthService - User email:', response.email);
          
          // Store token and user data
          this.setToken(response.token);
          this.setUser(response);
          this.isLoggedInSubject.next(true);
          
          console.log('✅ AuthService - Token and user data saved to localStorage');
          console.log('✅ AuthService - Login state updated to:', true);
        })
      );
  }

  register(email: string, password: string, firstName: string, lastName: string, phone?: string): Observable<AuthResponse> {
    const registerRequest = {
      email,
      password,
      firstName,
      lastName,
      phone
    };
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, registerRequest)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setUser(response);
          this.isLoggedInSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('🔍 AuthService - Retrieved token from localStorage:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (token) {
      // Validate token format (basic check)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ AuthService - Invalid token format, clearing token');
        this.logout();
        return null;
      }
    }
    
    return token;
  }

  getUser(): AuthResponse | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getCurrentUser(): AuthResponse | null {
    // First try to get from localStorage
    const user = this.getUser();
    if (user) {
      return user;
    }

    // If not found, try to decode from JWT token
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          token: token,
          userId: payload.userId || payload.sub,
          email: payload.email,
          firstName: payload.firstName || payload.given_name,
          lastName: payload.lastName || payload.family_name,
          role: payload.role || payload.authorities?.[0] || 'USER'
        };
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
      }
    }

    return null;
  }

  isLoggedIn(): boolean {
    return this.hasToken() && this.isTokenValid();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    console.log('💾 AuthService - Storing token in localStorage');
    localStorage.setItem(this.TOKEN_KEY, token);
    console.log('✅ AuthService - Token stored successfully');
  }

  private setUser(user: AuthResponse): void {
    console.log('💾 AuthService - Storing user data in localStorage');
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    console.log('✅ AuthService - User data stored successfully');
  }

  private isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT validation - check if token is not expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }
}
