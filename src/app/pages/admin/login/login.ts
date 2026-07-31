import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { buildAdminNoIndexSeo } from '../../../core/utils/seo.util';
import { extractApiError } from '../../../core/utils/api.util';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [ReactiveFormsModule],
})
export class AdminLogin implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private seo = inject(SeoService);

  loading = signal(false);
  errorMsg = signal('');

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit(): void {
    this.seo.update(buildAdminNoIndexSeo('Connexion'));
  }

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
