import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiService, GalleryPhoto } from '../../../core/services/api.service';
import { extractApiError } from '../../../core/utils/api.util';

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
  private sanitizer = inject(DomSanitizer);

  photos = signal<GalleryPhoto[]>([]);
  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  editingPhoto = signal<GalleryPhoto | null>(null);
  showForm = signal(false);
  imagePreview = signal<SafeUrl | null>(null);
  previewIsVideo = signal(false);

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
    this.previewIsVideo.set(false);
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
    this.imagePreview.set(photo.src ? this.sanitizer.bypassSecurityTrustUrl(photo.src) : null);
    this.previewIsVideo.set(/\.(mp4|webm|mov)(\?|$)/i.test(photo.src));
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingPhoto.set(null);
    this.imagePreview.set(null);
    this.previewIsVideo.set(false);
  }

  /** Upload selected image or video to B2, then store the returned URL in the form */
  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMsg.set(isVideo ? 'La vidéo ne doit pas dépasser 100 Mo' : 'L\'image ne doit pas dépasser 10 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(this.sanitizer.bypassSecurityTrustUrl(reader.result as string));
      this.previewIsVideo.set(isVideo);
    };
    reader.readAsDataURL(file);

    this.uploading.set(true);
    this.errorMsg.set('');
    const upload$ = isVideo ? this.api.uploadVideo(file) : this.api.uploadImage(file);
    upload$.subscribe({
      next: (res) => {
        this.form.patchValue({ src: res.url });
        this.uploading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(extractApiError(err, 'Erreur lors de l\'upload'));
        this.uploading.set(false);
      },
    });
  }

  onUrlInput(): void {
    const url = this.form.get('src')?.value;
    if (url) {
      this.imagePreview.set(this.sanitizer.bypassSecurityTrustUrl(url));
      this.previewIsVideo.set(/\.(mp4|webm|mov)(\?|$)/i.test(url));
    }
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
      error: (err) => { this.errorMsg.set(extractApiError(err, 'Erreur lors de la sauvegarde')); this.saving.set(false); },
    });
  }

  delete(photo: GalleryPhoto): void {
    if (!confirm(`Supprimer cette photo ?`)) return;
    this.api.adminDeleteGalleryPhoto(photo.ID).subscribe({
      next: (_res: unknown) => this.load(),
      error: (_err: unknown) => this.errorMsg.set('Erreur lors de la suppression'),
    });
  }

  onImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.style.visibility = 'hidden';
  }
}

