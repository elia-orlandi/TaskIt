import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = this.authService.loading;
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required]
  });

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.paramMap.get('token');

    if (email) this.form.patchValue({ email });
    if (token) this.form.patchValue({ token });
  }

  submit(): void {
    if (this.form.invalid) return;

    const { email, token, password, password_confirmation } = this.form.value;
    this.error.set(null);
    this.success.set(null);

    this.authService.resetPassword({
      email: email!,
      token: token!,
      password: password!,
      password_confirmation: password_confirmation!
    }).subscribe({
      next: (response) => {
        this.success.set(response.message);
        this.form.reset();
        let seconds = 3;
        const interval = setInterval(() => {
          seconds--;
          const el = document.getElementById('countdown');
          if (el) el.textContent = String(seconds);
          if (seconds <= 0) {
            clearInterval(interval);
            this.router.navigate(['/login']);
          }
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Reset password fallito. Riprova.';
        this.error.set(message);
      }
    });
  }
}
