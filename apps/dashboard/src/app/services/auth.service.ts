import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// 1. Fix "Observable is not there" error:
import { Observable } from 'rxjs'; 
import { tap } from 'rxjs/operators';

// 2. Import the shared interfaces
import { IAuthResponse, ILoginPayload, IRegisterPayload } from '@ababu/data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Update this to your actual API URL
  private apiUrl = 'http://localhost:3000/api'; 

  // Signal to track user state
  currentUser = signal<{ token: string | null }>({ token: localStorage.getItem('access_token') });

  // --- LOGIN ---
  login(payload: ILoginPayload): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap(response => {
        // NOTE: Ensure your Backend returns 'accessToken' (camelCase) to match the Interface!
        // If your backend returns 'access_token', change the Interface in libs/data to match.
        localStorage.setItem('access_token', response.access_token); 
        
        this.currentUser.set({ token: response.access_token });
        this.router.navigate(['/']);
      })
    );
  }

  // --- REGISTER ---
  register(payload: IRegisterPayload): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.apiUrl}/auth/register`, payload).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.currentUser.set({ token: response.access_token });
        this.router.navigate(['/']);
      })
    );
  }

  // --- LOGOUT ---
  logout() {
    localStorage.removeItem('access_token');
    this.currentUser.set({ token: null });
    this.router.navigate(['/login']);
  }

  // Helper to get token
  getToken() {
    return this.currentUser().token;
  }

  // Helper to get username from token (Simple decode)
  getUsername(): string {
    const token = this.getToken();
    if (!token) return 'Guest';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username;
    } catch (e) {
      return 'Guest';
    }
  }

  // Helper to get Role
  getUserRole(): string {
    const token = this.getToken();
    if (!token) return 'VIEWER';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'VIEWER';
    } catch (e) {
      return 'VIEWER';
    }
  }
}