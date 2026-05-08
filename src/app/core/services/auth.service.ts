import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
}

interface LoginResponse {
  token: string;
  admin: AdminUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private readonly TOKEN_KEY = 'rb_admin_token';

  currentAdmin = signal<AdminUser | null>(null);
  isAuthenticated = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
    }
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        this.isAuthenticated.set(true);
        // Refresh admin details from API
        this.http
          .get<AdminUser>(`${environment.apiUrl}/auth/me`)
          .subscribe({ next: (u) => this.currentAdmin.set(u), error: () => this.clearSession() });
      } else {
        this.clearSession();
      }
    } catch {
      this.clearSession();
    }
  }

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.TOKEN_KEY, res.token);
          }
          this.currentAdmin.set(res.admin);
          this.isAuthenticated.set(true);
        }),
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentAdmin.set(null);
    this.isAuthenticated.set(false);
  }
}
