import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  
  // Signal to track login state
  currentUser = signal<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken(); // <--- Now this works
    if (token) {
      this.currentUser.set({ token }); 
    }
  }

  login(credentials: { username: string; password: string }) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.currentUser.set({ token: response.access_token });
        this.router.navigate(['/']);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getUserRole(): string {
    const token = this.getToken();
    if (!token) return 'VIEWER'; // Default to lowest permission
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role; // This assumes your NestJS JWT strategy saved 'role' in the payload
    } catch (e) {
      return 'VIEWER';
    }
  }

  // --- MISSING METHODS ADDED BELOW ---

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUsername(): string {
    const token = this.getToken();
    if (!token) return 'Guest';
    
    try {
      // Decodes the JWT payload (the part between the dots)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username; 
    } catch (e) {
      console.error('Error decoding token', e);
      return 'User';
    }
  }
}