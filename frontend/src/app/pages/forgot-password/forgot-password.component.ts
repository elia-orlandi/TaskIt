import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { TextInputComponent } from '../../ui/text-input/text-input.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { TouchedChangeEvent } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, TextInputComponent],
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

  private emailControl = this.form.get('email')!;
  private emailStatus = toSignal(this.emailControl.statusChanges, { initialValue: this.emailControl.status });
  private emailTouched = toSignal(
    this.emailControl.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map(event => event.touched)
    ),
    { initialValue: this.emailControl.touched }
  );

  emailError = computed(() => {
    const _s = this.emailStatus();
    const touched = this.emailTouched();
    if (!touched) return null;
    if (this.emailControl.hasError('required')) return 'L\'email è obbligatoria';
    if (this.emailControl.hasError('email')) return 'Inserisci un\'email valida';
    return null;
  });

  submit(): void {
    this.form.markAllAsTouched();
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
