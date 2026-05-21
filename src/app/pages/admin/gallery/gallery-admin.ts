import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, GalleryPhoto } from '../../../core/services/api.service';

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  templateUrl: './gallery-admin.html',
  styleUrl: './gallery-admin.scss',
  imports: [ReactiveFormsModule],
})
export class GalleryAdmin implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  photos = signal<GalleryPhoto[]>([]);
  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  editingPhoto = signal<GalleryPhoto | null>(null);
  showForm = signal(false);
  imagePreview = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    src: ['', [Validators.required, Validators.maxLength(500)]],
    alt: ['', Validators.maxLength(300)],
    caption: ['', Validators.maxLength(300)],
    sort_order: [0],
    is_active: [true],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.adminGetGallery().subscribe({
      next: (data: GalleryPhoto[]) => { this.photos.set(data); this.loading.set(false); },
      error: (_err: unknown) => { this.errorMsg.set('Impossible de charger la galerie'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.editingPhoto.set(null);
    this.form.reset({ src: '', alt: '', caption: '', sort_order: 0, is_active: true });
    this.imagePreview.set(null);
    this.showForm.set(true);
  }

  openEdit(photo: GalleryPhoto): void {
    this.editingPhoto.set(photo);
    this.form.patchValue({
      src: photo.src,
      alt: photo.alt,
      caption: photo.caption,
      sort_order: photo.sort_order,
      is_active: photo.is_active,
    });
    this.imagePreview.set(photo.src || null);
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingPhoto.set(null);
    this.imagePreview.set(null);
  }

  /** Upload selected image to B2, then store the returned URL in the form */
  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);

    this.uploading.set(true);
    this.errorMsg.set('');
    this.api.uploadImage(file).subscribe({
      next: (res) => {
        this.form.patchValue({ src: res.url });
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
    const data = this.form.getRawValue();
    const editing = this.editingPhoto();
    const req = editing
      ? this.api.adminUpdateGalleryPhoto(editing.ID, data)
      : this.api.adminCreateGalleryPhoto(data);

    req.subscribe({
      next: (_res: unknown) => {
        this.successMsg.set(editing ? 'Photo mise à jour !' : 'Photo ajoutée !');
        this.showForm.set(false);
        this.imagePreview.set(null);
        this.load();
        this.saving.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (_err: unknown) => { this.errorMsg.set('Erreur lors de la sauvegarde'); this.saving.set(false); },
    });
  }

  delete(photo: GalleryPhoto): void {
    if (!confirm(`Supprimer cette photo ?`)) return;
    this.api.adminDeleteGalleryPhoto(photo.ID).subscribe({
      next: (_res: unknown) => this.load(),
      error: (_err: unknown) => this.errorMsg.set('Erreur lors de la suppression'),
    });
  }
}

