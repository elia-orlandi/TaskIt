import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { TouchedChangeEvent } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { PasswordInputComponent } from '../../ui/password-input/password-input.component';
import { TextInputComponent } from '../../ui/text-input/text-input.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, PasswordInputComponent, TextInputComponent],
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

  private passwordControl = this.form.get('password')!;
  private confirmControl = this.form.get('password_confirmation')!;
  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private passwordStatus = toSignal(this.passwordControl.statusChanges, { initialValue: this.passwordControl.status });
  private confirmStatus = toSignal(this.confirmControl.statusChanges, { initialValue: this.confirmControl.status });
  private passwordTouched = toSignal(
    this.passwordControl.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map(event => event.touched)
    ),
    { initialValue: this.passwordControl.touched }
  );
  private confirmTouched = toSignal(
    this.confirmControl.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map(event => event.touched)
    ),
    { initialValue: this.confirmControl.touched }
  );
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

  passwordError = computed(() => {
    const _v = this.formValue();
    const _s = this.passwordStatus();
    const touched = this.passwordTouched();
    if (!touched) return null;
    if (this.passwordControl.hasError('required')) return 'La password è obbligatoria';
    if (this.passwordControl.hasError('minlength')) return 'La password deve essere almeno 8 caratteri';
    return null;
  });

  confirmPasswordError = computed(() => {
    const _v = this.formValue();
    const _s = this.confirmStatus();
    const touched = this.confirmTouched();
    if (!touched) return null;
    if (this.confirmControl.hasError('required')) return 'La conferma è obbligatoria';
    if (this.form.hasError('passwordMismatch')) return 'Le password non coincidono';
    return null;
  });

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.paramMap.get('token');

    if (email) this.form.patchValue({ email });
    if (token) this.form.patchValue({ token });
  }

  submit(): void {
    this.form.markAllAsTouched();
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
