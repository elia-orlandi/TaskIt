import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = this.authService.loading;
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) return;

    const { email } = this.form.value;
    this.error.set(null);
    this.success.set(null);

    this.authService.forgotPassword({ email: email! }).subscribe({
      next: (response) => {
        this.success.set(response.message);
        this.form.reset();
      },
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Errore durante linvio della email. Riprova.';
        this.error.set(message);
      }
    });
  }
}
