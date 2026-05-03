import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { PasswordInputComponent } from '../../ui/password-input/password-input.component';
import { TextInputComponent } from '../../ui/text-input/text-input.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { TouchedChangeEvent } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, PasswordInputComponent, TextInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = this.authService.loading;
  error = signal<string | null>(null);

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

  private passwordControl = this.form.get('password')!;
  private passwordStatus = toSignal(this.passwordControl.statusChanges, { initialValue: this.passwordControl.status });
  private passwordTouched = toSignal(
    this.passwordControl.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map(event => event.touched)
    ),
    { initialValue: this.passwordControl.touched }
  );

  passwordError = computed(() => {
    const _s = this.passwordStatus();
    const touched = this.passwordTouched();
    if (!touched) return null;
    if (this.passwordControl.hasError('required')) return 'La password è obbligatoria';
    return null;
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    this.error.set(null);

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Credenziali non valide';
        this.error.set(message);
      }
    });
  }
}
