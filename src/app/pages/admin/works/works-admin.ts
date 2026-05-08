import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Work } from '../../../core/services/api.service';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-works-admin',
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
  errorMsg = signal('');
  successMsg = signal('');
  editingWork = signal<Work | null>(null);
  showForm = signal(false);

  categories = ['performances', 'concerts', 'campagnes', 'prières', 'compositions', 'émissions', 'tutoriels'];

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
    this.form.reset({ title: '', category: 'performances', desc: '', link: '', is_active: true, sort_order: 0 });
    this.showForm.set(true);
  }

  openEdit(work: Work): void {
    this.editingWork.set(work);
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

  save(): void {
    if (this.form.invalid) return;
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
      error: () => {
        this.errorMsg.set('Erreur lors de la sauvegarde');
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
