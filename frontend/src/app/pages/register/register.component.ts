import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, TouchedChangeEvent } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../ui/button/button.component';
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
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
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

  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private confirmControl = this.form.get('password_confirmation')!;
  private confirmStatus = toSignal(this.confirmControl.statusChanges, { initialValue: this.confirmControl.status });
  private isTouched = toSignal(
    this.confirmControl.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map(event => event.touched)
    ),
    { initialValue: this.confirmControl.touched }
  );

  confirmPasswordError = computed(() => {
    const _v = this.formValue();
    const _s = this.confirmStatus();
    const touched = this.isTouched();
    const required = this.confirmControl.hasError('required');
    const mismatch = this.form.hasError('passwordMismatch');
    if (!touched) return null;
    if (required) return 'La conferma della password è obbligatoria';
    if (mismatch) return 'Le password non coincidono';
    return null;
  });

  submit(): void {
    if (this.form.invalid) return;

    this.error.set(null);

    const { name, email, password, password_confirmation } = this.form.value;

    this.authService.register({
      name: name!,
      email: email!,
      password: password!,
      password_confirmation: password_confirmation!
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        const message = err.error?.message || 'Registrazione fallita';
        this.error.set(message);
      }
    });
  }
}
