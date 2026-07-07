import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { extractApiError } from '../../../../core/utils/api.util';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  imports: [ReactiveFormsModule],
})
export class ContactSection {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phone: ['', Validators.maxLength(20)],
    subject: ['', Validators.maxLength(200)],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMsg = signal('');

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMsg.set('');

    this.api.submitContact(this.form.value).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.form.reset();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMsg.set(extractApiError(err, 'Une erreur est survenue. Veuillez réessayer ou me contacter directement.'));
        this.isSubmitting.set(false);
      },
    });
  }

  resetSuccess(): void {
    this.isSuccess.set(false);
  }

  socials = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/rogerbass.mukendikadiayi?mibextid=rS40aB7S9Ucbxw6v',
      icon: 'facebook',
      label: '@rogerbass.mukendikadiayi',
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@rogerbassmukendi4992?si=AxXDYdOrsPN8eYfY',
      icon: 'youtube',
      label: '@rogerbassmukendi4992',
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/mukendika/',
      icon: 'instagram',
      label: '@mukendika',
    },
    {
      name: 'TikTok',
      href: 'https://vm.tiktok.com/ZS9NpTE9DswfB-y1Wqr/',
      icon: 'tiktok',
      label: '@rogerbass',
    },
  ];
}
