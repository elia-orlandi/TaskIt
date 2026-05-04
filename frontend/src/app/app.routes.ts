import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Auth routes (no sidebar)
  {
    path: '',
    loadComponent: () => import('./core/layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'password-reset/:token',
        loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Main app routes (with sidebar)
  {
    path: '',
    loadComponent: () => import('./core/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
      },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/tasks' }
];
