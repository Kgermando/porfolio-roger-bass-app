import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { extractApiError } from '../../../core/utils/api.util';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [ReactiveFormsModule],
})
export class AdminLogin {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/admin/analytics']),
      error: (err) => {
        this.errorMsg.set(extractApiError(err, 'Identifiants incorrects'));
        this.loading.set(false);
      },
    });
  }
}
