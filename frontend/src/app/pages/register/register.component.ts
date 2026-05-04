import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, TouchedChangeEvent } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { PasswordInputComponent } from '../../ui/password-input/password-input.component';
import { TextInputComponent } from '../../ui/text-input/text-input.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const password_confirmation = control.get('password_confirmation');
  if (!password || !password_confirmation) return null;
  return password.value === password_confirmation.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, PasswordInputComponent, TextInputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  loading = this.authService.loading;
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private confirmControl = this.form.get('password_confirmation')!;
  private passwordControl = this.form.get('password')!;
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
  private confirmStatus = toSignal(this.confirmControl.statusChanges, { initialValue: this.confirmControl.status });
  private passwordStatus = toSignal(this.passwordControl.statusChanges, { initialValue: this.passwordControl.status });
  private isTouched = toSignal(
    this.confirmControl.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map(event => event.touched)
    ),
    { initialValue: this.confirmControl.touched }
  );
  private passwordTouched = toSignal(
    this.passwordControl.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map(event => event.touched)
    ),
    { initialValue: this.passwordControl.touched }
  );

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
    const touched = this.isTouched();
    if (!touched) return null;
    if (this.confirmControl.hasError('required')) return 'La conferma della password è obbligatoria';
    if (this.form.hasError('passwordMismatch')) return 'Le password non coincidono';
    return null;
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.error.set(null);

    const { name, email, password, password_confirmation } = this.form.value;

    this.authService.register({
      name: name!,
      email: email!,
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
        const message = err.error?.message || 'Registrazione fallita';
        this.error.set(message);
      }
    });
  }
}
