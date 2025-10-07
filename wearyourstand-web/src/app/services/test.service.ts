import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  testBackend(): Observable<string> {
    console.log('Testing backend connection...');
    return this.http.get<string>(`${this.apiUrl}/test`);
  }
}




