import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
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

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const loginRequest: LoginRequest = { email, password };
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, loginRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).pipe(
      tap(response => {
        console.log('Login successful, saving token:', response.token.substring(0, 20) + '...');
        this.setToken(response.token);
        this.setUser(response);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  register(email: string, password: string, firstName: string, lastName: string, phone?: string): Observable<AuthResponse> {
    const registerRequest: RegisterRequest = {
      email,
      password,
      firstName,
      lastName,
      phone
    };
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, registerRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).pipe(
      tap(response => {
        console.log('Registration successful, saving token:', response.token.substring(0, 20) + '...');
        this.setToken(response.token);
        this.setUser(response);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedInSubject.next(false);
    console.log('User logged out successfully');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
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

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: AuthResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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