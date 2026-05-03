import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, MessageResponse } from './auth.models';

const API_URL = 'http://localhost:8000/api';
const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _loading = signal(false);

  user = this._user.asReadonly();
  loading = this._loading.asReadonly();
  isAuthenticated = computed(() => this._user() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._loading.set(true);
    return this.http.post<AuthResponse>(`${API_URL}/login`, credentials).pipe(
      tap(response => this.storeSession(response)),
      tap(() => this._loading.set(false)),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this._loading.set(true);
    return this.http.post<AuthResponse>(`${API_URL}/register`, data).pipe(
      tap(response => this.storeSession(response)),
      tap(() => this._loading.set(false)),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      })
    );
  }

  logout(): void {
    this.http.post(`${API_URL}/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<MessageResponse> {
    this._loading.set(true);
    return this.http.post<MessageResponse>(`${API_URL}/forgot-password`, data).pipe(
      tap(() => this._loading.set(false)),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      })
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<MessageResponse> {
    this._loading.set(true);
    return this.http.post<MessageResponse>(`${API_URL}/reset-password`, data).pipe(
      tap(() => this._loading.set(false)),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      })
    );
  }

  restoreSession(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    this._loading.set(true);
    this.http.get<User>(`${API_URL}/user`).pipe(
      tap(user => this._user.set(user)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    this._user.set(response.user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }
}
