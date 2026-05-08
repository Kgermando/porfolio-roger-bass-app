import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { ApiService, Event } from '../../../core/services/api.service';

@Component({
  selector: 'app-events-admin',
  templateUrl: './events-admin.html',
  styleUrl: './events-admin.scss',
  imports: [ReactiveFormsModule, DatePipe, SlicePipe],
})
export class EventsAdmin implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  events = signal<Event[]>([]);
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  editingEvent = signal<Event | null>(null);
  showForm = signal(false);

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
      next: (data: Event[]) => { this.events.set(data); this.loading.set(false); },
      error: (_err: unknown) => { this.errorMsg.set('Impossible de charger les événements'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.editingEvent.set(null);
    this.form.reset({ title: '', description: '', location: '', date: '', image_url: '', is_active: true });
    this.showForm.set(true);
  }

  openEdit(event: Event): void {
    this.editingEvent.set(event);
    // Format date for input[type=datetime-local]
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
    this.showForm.set(true);
  }

  cancel(): void { this.showForm.set(false); this.editingEvent.set(null); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set('');
    const data = this.form.getRawValue();
    const editing = this.editingEvent();
    const req = editing
      ? this.api.adminUpdateEvent(editing.ID, data)
      : this.api.adminCreateEvent(data);

    req.subscribe({
      next: (_res: unknown) => {
        this.successMsg.set(editing ? 'Événement mis à jour !' : 'Événement ajouté !');
        this.showForm.set(false);
        this.load();
        this.saving.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (_err: unknown) => { this.errorMsg.set('Erreur lors de la sauvegarde'); this.saving.set(false); },
    });
  }

  delete(event: Event): void {
    if (!confirm(`Supprimer « ${event.title} » ?`)) return;
    this.api.adminDeleteEvent(event.ID).subscribe({
      next: (_res: unknown) => this.load(),
      error: (_err: unknown) => this.errorMsg.set('Erreur lors de la suppression'),
    });
  }
}
