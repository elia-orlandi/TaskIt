import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div class="dashboard-container">
      <header>
        <h1>Dashboard</h1>
        <button class="btn btn-secondary" (click)="logout()">Logout</button>
      </header>

      @if (user(); as user) {
        <div class="user-info">
          <h2>Ciao, {{ user.name }}!</h2>
          <p>{{ user.email }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .user-info {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;

  logout(): void {
    this.authService.logout();
  }
}
