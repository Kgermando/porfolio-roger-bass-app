import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Work } from '../../../core/services/api.service';
import { extractApiError } from '../../../core/utils/api.util';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-works-admin',
  standalone: true,
  templateUrl: './works-admin.html',
  styleUrl: './works-admin.scss',
  imports: [ReactiveFormsModule, SlicePipe],
})
export class WorksAdmin implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  works = signal<Work[]>([]);
  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  editingWork = signal<Work | null>(null);
  showForm = signal(false);
  videoSource = signal<'youtube' | 'upload'>('youtube');

  categories = [
    { value: 'performances', label: 'Performances' },
    { value: 'tutoriels', label: 'Tutoriels' },
    { value: 'compositions', label: 'Compositions' },
    { value: 'concerts', label: 'Concerts' },
    { value: 'campagnes', label: 'Campagnes' },
    { value: 'prières', label: 'Prières' },
    { value: 'émissions', label: 'Émissions' },
    { value: 'enseignements', label: 'Enseignements' },
  ];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    category: ['performances', Validators.required],
    desc: [''],
    link: [''],
    is_active: [true],
    sort_order: [0],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.adminGetWorks().subscribe({
      next: (data) => { this.works.set(data); this.loading.set(false); },
      error: () => { this.errorMsg.set('Impossible de charger les vidéos'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.editingWork.set(null);
    this.videoSource.set('youtube');
    this.form.reset({ title: '', category: 'performances', desc: '', link: '', is_active: true, sort_order: 0 });
    this.showForm.set(true);
  }

  openEdit(work: Work): void {
    this.editingWork.set(work);
    this.videoSource.set(this.isDirectVideo(work.link) ? 'upload' : 'youtube');
    this.form.patchValue({
      title: work.title,
      category: work.category,
      desc: work.desc,
      link: work.link,
      is_active: work.is_active,
      sort_order: work.sort_order,
    });
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingWork.set(null);
  }

  setVideoSource(source: 'youtube' | 'upload'): void {
    this.videoSource.set(source);
    if (source === 'youtube') {
      this.form.patchValue({ link: '' });
    }
  }

  onVideoFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      this.errorMsg.set('La vidéo ne doit pas dépasser 100 Mo');
      return;
    }

    this.uploading.set(true);
    this.errorMsg.set('');
    this.api.uploadVideo(file).subscribe({
      next: (res) => {
        this.form.patchValue({ link: res.url });
        this.uploading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(extractApiError(err, 'Erreur lors de l\'upload de la vidéo'));
        this.uploading.set(false);
      },
    });
  }

  isDirectVideo(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return !lower.includes('youtube.com') && !lower.includes('youtu.be') &&
      (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov') || lower.includes('backblazeb2.com'));
  }

  save(): void {
    if (this.form.invalid || this.uploading()) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const data = this.form.getRawValue();
    const editing = this.editingWork();

    const req = editing
      ? this.api.adminUpdateWork(editing.ID, data)
      : this.api.adminCreateWork(data);

    req.subscribe({
      next: () => {
        this.successMsg.set(editing ? 'Vidéo mise à jour !' : 'Vidéo ajoutée !');
        this.showForm.set(false);
        this.load();
        this.saving.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(extractApiError(err, 'Erreur lors de la sauvegarde'));
        this.saving.set(false);
      },
    });
  }

  delete(work: Work): void {
    if (!confirm(`Supprimer « ${work.title} » ?`)) return;
    this.api.adminDeleteWork(work.ID).subscribe({
      next: () => this.load(),
      error: () => this.errorMsg.set('Erreur lors de la suppression'),
    });
  }
}
