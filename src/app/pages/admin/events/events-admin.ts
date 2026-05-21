import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { ApiService, PortfolioEvent } from '../../../core/services/api.service';

@Component({
  selector: 'app-events-admin',
  templateUrl: './events-admin.html',
  styleUrl: './events-admin.scss',
  imports: [ReactiveFormsModule, DatePipe, SlicePipe],
})
export class EventsAdmin implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  events = signal<PortfolioEvent[]>([]);
  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  editingEvent = signal<PortfolioEvent | null>(null);
  showForm = signal(false);
  imagePreview = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    location: [''],
    date: ['', Validators.required],
    image_url: [''],
    is_active: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.adminGetEvents().subscribe({
      next: (data: PortfolioEvent[]) => { this.events.set(data); this.loading.set(false); },
      error: (_err: unknown) => { this.errorMsg.set('Impossible de charger les événements'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.editingEvent.set(null);
    this.form.reset({ title: '', description: '', location: '', date: '', image_url: '', is_active: true });
    this.imagePreview.set(null);
    this.showForm.set(true);
  }

  openEdit(event: PortfolioEvent): void {
    this.editingEvent.set(event);
    const d = new Date(event.date);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    this.form.patchValue({
      title: event.title,
      description: event.description,
      location: event.location,
      date: local,
      image_url: event.image_url,
      is_active: event.is_active,
    });
    this.imagePreview.set(event.image_url || null);
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingEvent.set(null);
    this.imagePreview.set(null);
  }

  /** Called when the user picks an image file — uploads to B2, fills hidden form control */
  onFileSelected(e: globalThis.Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to B2
    this.uploading.set(true);
    this.errorMsg.set('');
    this.api.uploadImage(file).subscribe({
      next: (res) => {
        this.form.patchValue({ image_url: res.url });
        this.uploading.set(false);
      },
      error: (_err: unknown) => {
        this.errorMsg.set('Erreur lors de l\'upload de l\'image');
        this.uploading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.uploading()) return;
    this.saving.set(true);
    this.errorMsg.set('');
    const raw = this.form.getRawValue();
    const data = {
      ...raw,
      date: raw.date ? new Date(raw.date).toISOString() : '',
    };
    const editing = this.editingEvent();
    const req = editing
      ? this.api.adminUpdateEvent(editing.ID, data)
      : this.api.adminCreateEvent(data);

    req.subscribe({
      next: (_res: unknown) => {
        this.successMsg.set(editing ? 'Événement mis à jour !' : 'Événement ajouté !');
        this.showForm.set(false);
        this.imagePreview.set(null);
        this.load();
        this.saving.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (_err: unknown) => { this.errorMsg.set('Erreur lors de la sauvegarde'); this.saving.set(false); },
    });
  }

  delete(event: PortfolioEvent): void {
    if (!confirm(`Supprimer « ${event.title} » ?`)) return;
    this.api.adminDeleteEvent(event.ID).subscribe({
      next: (_res: unknown) => this.load(),
      error: (_err: unknown) => this.errorMsg.set('Erreur lors de la suppression'),
    });
  }
}

